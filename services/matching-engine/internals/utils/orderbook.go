package utils

import (
	"matching-engine/internals/types"
	"sort"
)

func aggregateOrders(orders types.OrderHeap, isAscending bool) []types.PriceQuantity {
	priceMap := make(map[float64]int)
	for _, order := range orders {
		remaining := order.Quantity - order.Filled
		if remaining > 0 {
			priceMap[order.Price] += remaining
		}
	}

	result := make([]types.PriceQuantity, 0)
	for price, qty := range priceMap {
		result = append(result, types.PriceQuantity{
			Price:    price,
			Quantity: qty,
		})
	}

	sort.Slice(result, func(i, j int) bool {
		if isAscending {
			return result[i].Price < result[j].Price
		}
		return result[i].Price > result[j].Price
	})

	return result
}

func AggregateOrderBook(ob *types.OrderBook) types.AggregatedOrderBook {
	if ob == nil {
		return types.AggregatedOrderBook{
			Yes: []types.PriceQuantity{},
			No:  []types.PriceQuantity{},
		}
	}

	var yesOrders types.OrderHeap
	if ob.YesBids != nil {
		yesOrders = append(yesOrders, ob.YesBids.OrderHeap...)
	}
	if ob.YesAsks != nil {
		yesOrders = append(yesOrders, ob.YesAsks.OrderHeap...)
	}

	var noOrders types.OrderHeap
	if ob.NoBids != nil {
		noOrders = append(noOrders, ob.NoBids.OrderHeap...)
	}
	if ob.NoAsks != nil {
		noOrders = append(noOrders, ob.NoAsks.OrderHeap...)
	}

	return types.AggregatedOrderBook{
		Yes: aggregateOrders(yesOrders, false), // Descending for orderbook
		No:  aggregateOrders(noOrders, false),
	}
}

func calculateSideDiff(oldSide, newSide []types.PriceQuantity) []types.PriceQuantity {
	var diff []types.PriceQuantity
	
	oldMap := make(map[float64]int)
	for _, pq := range oldSide {
		oldMap[pq.Price] = pq.Quantity
	}
	
	for _, pq := range newSide {
		if oldQty, exists := oldMap[pq.Price]; !exists || oldQty != pq.Quantity {
			diff = append(diff, pq)
		}
		delete(oldMap, pq.Price)
	}
	
	for price := range oldMap {
		diff = append(diff, types.PriceQuantity{
			Price:    price,
			Quantity: 0,
		})
	}
	
	return diff
}

func CalculateOrderBookDiff(oldBook, newBook types.AggregatedOrderBook) types.AggregatedOrderBook {
	return types.AggregatedOrderBook{
		Yes: calculateSideDiff(oldBook.Yes, newBook.Yes),
		No:  calculateSideDiff(oldBook.No, newBook.No),
	}
}
