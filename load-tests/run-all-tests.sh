#!/bin/bash

export BASE_URL="http://localhost:3000"
export AUTH_TOKEN='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImE3NjY3Nzc5LTEyNDAtNGQzYy04Yjk5LThmNTUxOTBmMmRmYiIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJ0ZXN0QGFjY291bnQuY29tIiwiZXhwIjoxNzkwNTE2MjAyfQ.7srUPs_ddrpQAYNTB4D3IT2JCxf1NfQtrFrMetO27fU'

export TEST_MARKET_ID="c4f8bf5a-d375-4c4e-882e-3e977c8df0df"
export TEST_MARKET_SYMBOL="will-solana-hit-555-usd-under-6-pm-c0g79x"
export TEST_TYPE="load"

mkdir -p results

echo "| Endpoint | VUs | RPS | Avg | p50 | p95 | p99 | Error Rate |" > results/README_TABLE.md
echo "|---|---|---|---|---|---|---|---|" >> results/README_TABLE.md

SCRIPTS=(
  "scripts/balance-read.js"
  "scripts/markets-list.js"
  "scripts/markets-detail.js"
  "scripts/markets-live.js"
  "scripts/leaderboard-read.js"
  "scripts/profile-read.js"
  "scripts/trades-read.js"
  "scripts/orders-create.js"
)

for script in "${SCRIPTS[@]}"; do
  name=$(basename "$script" .js)
  echo "Running $name..."
  k6 run --summary-export=results/${name}_summary.json "$script" > /dev/null 2>&1
  
  VUS=300
  RPS=$(jq -r '.metrics.http_reqs.rate // 0' results/${name}_summary.json | awk '{printf "%.1f", $1}')
  AVG=$(jq -r '.metrics.http_req_duration.avg // 0' results/${name}_summary.json | awk '{printf "%.1fms", $1}')
  MED=$(jq -r '.metrics.http_req_duration.med // 0' results/${name}_summary.json | awk '{printf "%.1fms", $1}')
  P95=$(jq -r '.metrics.http_req_duration["p(95)"] // 0' results/${name}_summary.json | awk '{printf "%.1fms", $1}')
  P99=$(jq -r '.metrics.http_req_duration["p(99)"] // 0' results/${name}_summary.json | awk '{printf "%.1fms", $1}')
  ERR=$(jq -r '.metrics.http_req_failed.rate // 0' results/${name}_summary.json | awk '{printf "%.2f%%", $1 * 100}')
  
  echo "| $name | $VUS | $RPS | $AVG | $MED | $P95 | $P99 | $ERR |" >> results/README_TABLE.md
done

echo "All tests finished!"
cat results/README_TABLE.md
