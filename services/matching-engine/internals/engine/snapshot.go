package engine

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"math"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog/log"

	"matching-engine/internals/services/kafka"
	"matching-engine/internals/types"
	"matching-engine/internals/utils"
)

type SnapshotData struct {
	Timestamp time.Time                `json:"timestamp"`
	Users     map[string]*types.User   `json:"users"`
	Markets   map[string]*types.Market `json:"markets"`
}

var snapshotDB *pgxpool.Pool

func InitSnapshotDB(dbURL string) {
	if dbURL == "" {
		log.Warn().Msg("SNAPSHOT_DB_URL is not set, snapshot storage is disabled")
		return
	}

	conn, err := pgxpool.New(context.Background(), dbURL)

	if err != nil {
		utils.CaptureError(err, map[string]string{"controller": "engine", "action": "SNAPSHOT_DB_CONNECT"}, nil)
		log.Error().Err(err).Msg("Failed to connect to snapshot DB pool")
		return
	}

	snapshotDB = conn
	log.Info().Msg("Successfully connected to snapshot DB pool")
}

func CloseSnapshotDB() {
	if snapshotDB != nil {
		snapshotDB.Close()
		log.Info().Msg("Closed snapshot DB connection pool")
	}
}

func (e *Engine) StartSnapshotRoutine() {
	ticker := time.NewTicker(10 * time.Minute)
	go func() {
		for {
			<-ticker.C
			e.PerformSnapshot()
		}
	}()
}

func (e *Engine) PerformSnapshot() {
	log.Info().Msg("Starting state snapshot and memory eviction routine...")

	e.UM.Lock()

	evictionThreshold := time.Now().Add(-90 * 24 * time.Hour)
	evictedCount := 0

	for userId, user := range e.User {
		if !user.LastActive.IsZero() && user.LastActive.Before(evictionThreshold) {
			if user.Balance != nil {
				if math.Abs(user.Balance.WalletBalance.Amount) > 1e-6 || user.Balance.WalletBalance.Locked > 1e-6 {
					continue
				}

				hasShares := false
				for _, stock := range user.Balance.StockBalance {
					if stock.Yes > 0 || stock.No > 0 || stock.LockedYes > 0 || stock.LockedNo > 0 {
						hasShares = true
						break
					}
				}
				if hasShares {
					continue
				}
			}
			delete(e.User, userId)
			evictedCount++
		}
	}

	log.Info().Int("evicted_users", evictedCount).Msg("Purged inactive users from engine RAM")

	e.MM.Lock()
	evictedMarkets := 0
	marketsRaw := make(map[string]json.RawMessage)
	for k, m := range e.Market {
		marketEvictionThreshold := time.Now().Add(-10 * 24 * time.Hour)
		if m.Status == types.Close && m.Overview.EndDate.Before(marketEvictionThreshold) {
			delete(e.Market, k)
			evictedMarkets++
			continue
		}

		m.Mu.RLock()
		mBytes, _ := json.Marshal(m)
		m.Mu.RUnlock()
		marketsRaw[k] = mBytes
	}

	if evictedMarkets > 0 {
		log.Info().Int("evicted_markets", evictedMarkets).Msg("Purged old closed markets from engine RAM")
	}
	e.MM.Unlock()

	// 2. Serialize State
	data := struct {
		Timestamp time.Time                  `json:"timestamp"`
		Users     map[string]*types.User     `json:"users"`
		Markets   map[string]json.RawMessage `json:"markets"`
	}{
		Timestamp: time.Now(),
		Users:     e.User,
		Markets:   marketsRaw,
	}

	jsonData, err := json.Marshal(data)
	e.UM.Unlock() 

	if err != nil {
		utils.CaptureError(err, map[string]string{"controller": "engine", "action": "SNAPSHOT_MARSHAL"}, nil)
		log.Error().Err(err).Msg("Failed to serialize engine state for snapshot")
		return
	}

	snapshotEnabled := os.Getenv("SNAPSHOT_ENABLED")
	if snapshotEnabled != "true" {
		log.Warn().Msg("SNAPSHOT_ENABLED is not true, skipping snapshot generation.")
		return
	}

	if snapshotDB == nil {
		log.Warn().Msg("Snapshot DB connection is nil, skipping snapshot save.")
		return
	}

	var b bytes.Buffer
	gz := gzip.NewWriter(&b)
	if _, err := gz.Write(jsonData); err != nil {
		utils.CaptureError(err, map[string]string{"controller": "engine", "action": "SNAPSHOT_GZIP_WRITE"}, nil)
		log.Error().Err(err).Msg("Failed to compress engine state")
		return
	}
	if err := gz.Close(); err != nil {
		utils.CaptureError(err, map[string]string{"controller": "engine", "action": "SNAPSHOT_GZIP_CLOSE"}, nil)
		log.Error().Err(err).Msg("Failed to close gzip writer")
		return
	}

	compressedData := b.Bytes()

	ctx := context.Background()
	tx, err := snapshotDB.Begin(ctx)
	if err != nil {
		utils.CaptureError(err, map[string]string{"controller": "engine", "action": "SNAPSHOT_DB_BEGIN"}, nil)
		log.Error().Err(err).Msg("Failed to start snapshot DB transaction")
		return
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, "INSERT INTO snapshots (scope, data) VALUES ('engine', $1)", compressedData)
	if err != nil {
		utils.CaptureError(err, map[string]string{"controller": "engine", "action": "SNAPSHOT_DB_INSERT"}, nil)
		log.Error().Err(err).Msg("Failed to insert snapshot to DB")
		return
	}

	// Retain only the last 3 snapshots
	_, err = tx.Exec(ctx, `
		DELETE FROM snapshots 
		WHERE scope = 'engine' AND id NOT IN (
			SELECT id FROM snapshots WHERE scope = 'engine' ORDER BY created_at DESC LIMIT 3
		)
	`)
	if err != nil {
		utils.CaptureError(err, map[string]string{"controller": "engine", "action": "SNAPSHOT_DB_PRUNE"}, nil)
		log.Error().Err(err).Msg("Failed to prune old snapshots")
		return
	}

	if err := tx.Commit(ctx); err != nil {
		utils.CaptureError(err, map[string]string{"controller": "engine", "action": "SNAPSHOT_DB_COMMIT"}, nil)
		log.Error().Err(err).Msg("Failed to commit snapshot to DB")
		return
	}

	log.Info().Msg("Engine state snapshot successfully saved to PostgreSQL")
}

func (e *Engine) LoadLatestSnapshot() {
	snapshotEnabled := os.Getenv("SNAPSHOT_ENABLED")
	if snapshotEnabled != "true" {
		log.Info().Msg("SNAPSHOT_ENABLED not true, skipping snapshot restore on startup")
		return
	}

	if snapshotDB == nil {
		log.Warn().Msg("Snapshot DB connection is nil, skipping snapshot restore on startup")
		return
	}

	log.Info().Msg("Attempting to load snapshot from PostgreSQL...")
	ctx := context.Background()
	var compressedData []byte
	err := snapshotDB.QueryRow(ctx, "SELECT data FROM snapshots WHERE scope = 'engine' ORDER BY created_at DESC LIMIT 1").Scan(&compressedData)
	if err != nil {
		if err == pgx.ErrNoRows {
			log.Info().Msg("No snapshot found in PostgreSQL, starting fresh")
		} else {
			utils.CaptureError(err, map[string]string{"controller": "engine", "action": "RESTORE_DB_GET"}, nil)
			log.Error().Err(err).Msg("Failed to fetch snapshot from PostgreSQL")
		}
		return
	}

	gz, err := gzip.NewReader(bytes.NewReader(compressedData))
	if err != nil {
		utils.CaptureError(err, map[string]string{"controller": "engine", "action": "RESTORE_GZIP_READ"}, nil)
		log.Error().Err(err).Msg("Failed to decompress snapshot data")
		return
	}
	defer gz.Close()

	var data SnapshotData
	if err := json.NewDecoder(gz).Decode(&data); err != nil {
		utils.CaptureError(err, map[string]string{"controller": "engine", "action": "RESTORE_UNMARSHAL"}, nil)
		log.Error().Err(err).Msg("Failed to deserialize snapshot from DB")
		return
	}

	e.UM.Lock()
	e.User = data.Users
	if e.User == nil {
		e.User = make(map[string]*types.User)
	}
	for _, user := range e.User {
		if user != nil {
			if user.Balance == nil {
				user.Balance = &types.Balance{
					WalletBalance: types.WalletBalance{},
					StockBalance:  make(map[string]types.StockBalance),
				}
			} else if user.Balance.StockBalance == nil {
				user.Balance.StockBalance = make(map[string]types.StockBalance)
			}
		}
	}
	e.UM.Unlock()

	e.MM.Lock()
	e.Market = data.Markets
	if e.Market == nil {
		e.Market = make(map[string]*types.Market)
	}
	for key, market := range e.Market {
		if market == nil {
			log.Warn().Str("market_key", key).Msg("Found nil market in snapshot, skipping")
			delete(e.Market, key)
			continue
		}
		if market.Traders == nil {
			market.Traders = make(map[string]struct{})
		}
		if market.OrderBook == nil {
			market.OrderBook = &types.OrderBook{
				YesBids: &types.BidHeap{OrderHeap: make(types.OrderHeap, 0)},
				YesAsks: &types.AskHeap{OrderHeap: make(types.OrderHeap, 0)},
				NoBids:  &types.BidHeap{OrderHeap: make(types.OrderHeap, 0)},
				NoAsks:  &types.AskHeap{OrderHeap: make(types.OrderHeap, 0)},
			}
		}
		market.Inbox = make(chan types.MarketMessage, 100)
		go e.runMarket(market)
	}
	e.MM.Unlock()

	log.Info().Time("snapshot_timestamp", data.Timestamp).Int("users_loaded", len(data.Users)).Int("markets_loaded", len(e.Market)).Msg("Successfully restored snapshot from PostgreSQL")
}

func (e *Engine) ArchiveClosedMarket(market *types.Market) {
	go func() {
		env := os.Getenv("APP_ENV")
		if env == "" {
			env = os.Getenv("NODE_ENV")
		}
		if env == "development" || env == "dev" {
			log.Info().Str("marketId", market.MarketId).Msg("Development environment detected, skipping archival. Will evict from RAM in 10 days.")
			time.Sleep(10 * 24 * time.Hour)
			e.MM.Lock()
			delete(e.Market, market.Symbol)
			e.MM.Unlock()
			return
		}

		if snapshotDB == nil {
			log.Warn().Str("marketId", market.MarketId).Msg("Snapshot DB connection is nil, keeping market in RAM")
			return
		}

		market.Mu.RLock()
		marketBytes, err := json.Marshal(market)
		market.Mu.RUnlock()
		if err != nil {
			utils.CaptureError(err, map[string]string{"controller": "engine", "action": "MARKET_ARCHIVE_MARSHAL"}, map[string]map[string]interface{}{"market": {"marketId": market.MarketId}})
			log.Error().Err(err).Str("marketId", market.MarketId).Msg("Failed to serialize closed market for archival")
			return
		}

		var b bytes.Buffer
		gz := gzip.NewWriter(&b)
		if _, err := gz.Write(marketBytes); err != nil {
			utils.CaptureError(err, map[string]string{"controller": "engine", "action": "MARKET_ARCHIVE_GZIP_WRITE"}, map[string]map[string]interface{}{"market": {"marketId": market.MarketId}})
			log.Error().Err(err).Msg("Failed to compress market state")
			return
		}
		gz.Close()
		compressedData := b.Bytes()

		success := false
		for attempt := 1; attempt <= 3; attempt++ {
			ctx := context.Background()
			_, err = snapshotDB.Exec(ctx, "INSERT INTO closed_markets (market_id, data) VALUES ($1, $2)", market.Symbol, compressedData)
			if err == nil {
				success = true
				break
			}
			log.Warn().Err(err).Int("attempt", attempt).Str("marketId", market.MarketId).Msg("Failed to upload market archive to DB, retrying...")
			time.Sleep(time.Duration(attempt*2) * time.Second)
		}

		if success {
			log.Info().Str("marketId", market.MarketId).Msg("Market safely archived to DB, evicting from engine RAM")
			e.MM.Lock()
			delete(e.Market, market.Symbol)
			e.MM.Unlock()
		} else {
			err := fmt.Errorf("failed to upload market %s to DB after 3 attempts", market.Symbol)
			utils.CaptureError(err, map[string]string{"controller": "engine", "action": "MARKET_ARCHIVE_DB_PUT"}, map[string]map[string]interface{}{"market": {"marketId": market.MarketId}})
			log.Error().Str("marketId", market.MarketId).Msg("Failed to archive market to DB after 3 attempts, keeping in RAM and sending alert")
			kafka.ProduceEventToDBProcessor("process_db", "ARCHIVE_FAILED", map[string]interface{}{
				"marketId": market.MarketId,
				"symbol":   market.Symbol,
				"error":    "Failed to upload market to DB after 3 attempts",
			})
		}
	}()
}
