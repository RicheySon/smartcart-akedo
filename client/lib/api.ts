import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { InventoryItem, Cart, CartItem, ProductComparison, OrderPreview } from './types'

const API_BASE = '/api'

// HTTP client
async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${url}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    })

    if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`)
    }

    return res.json()
}

// Inventory Hooks
export function useInventory() {
    return useQuery({
        queryKey: ['inventory'],
        queryFn: () => fetcher<InventoryItem[]>('/inventory'),
    })
}

export function useAddInventoryItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (item: Omit<InventoryItem, 'id'>) =>
            fetcher('/inventory', {
                method: 'POST',
                body: JSON.stringify(item),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] })
        },
    })
}

export function useDeleteInventoryItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) =>
            fetcher(`/inventory/${id}`, {
                method: 'DELETE',
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] })
        },
    })
}

// Forecast Hooks
export function useShoppingList() {
    return useQuery({
        queryKey: ['shopping-list'],
        queryFn: () => fetcher('/forecast/shopping-list'),
    })
}

// Cart Hooks
export function useCart() {
    return useQuery({
        queryKey: ['cart'],
        queryFn: () => fetcher<Cart>('/cart'),
    })
}

export function useAddToCart() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ item, quantity, vendor }: { item: any, quantity: number, vendor: string }) =>
            fetcher('/cart/add', {
                method: 'POST',
                body: JSON.stringify({ item, quantity, vendor }),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
        },
    })
}

export function useRemoveFromCart() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (itemId: string) =>
            fetcher(`/cart/${itemId}`, {
                method: 'DELETE',
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
        },
    })
}

export function useClearCart() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () =>
            fetcher('/cart', {
                method: 'DELETE',
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
        },
    })
}

// Shopping Hooks
export function useCompareProduct(itemName: string | null) {
    return useQuery({
        queryKey: ['compare', itemName],
        queryFn: () => fetcher<ProductComparison>(`/shopping/compare/${encodeURIComponent(itemName!)}`),
        enabled: !!itemName,
    })
}

// Order Hooks
export function useOrderPreview() {
    return useMutation({
        mutationFn: () => fetcher<OrderPreview>('/orders/preview', { method: 'POST' }),
    })
}

export function useCheckout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => fetcher('/orders/checkout', { method: 'POST' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            queryClient.invalidateQueries({ queryKey: ['inventory'] })
        },
    })
}
