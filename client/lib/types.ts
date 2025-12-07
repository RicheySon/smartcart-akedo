export interface InventoryItem {
    id: string
    name: string
    quantity: number
    unit: string
    category: string
    price?: number
    threshold?: number
    expiry_date?: string
    last_updated?: string
}

export interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    vendor: string
    image?: string
}

export interface Cart {
    id: string
    items: CartItem[]
    total: number
    created_at: string
}

export interface Product {
    id: string
    name: string
    price: number
    rating?: number
    image?: string
}

export interface ProductComparison {
    amazon?: Product
    walmart?: Product
    comparison?: {
        best_price: 'amazon' | 'walmart'
        savings: number
        recommendation: string
    }
}

export interface OrderPreview {
    item_count: number
    total_cost: number
    can_afford: boolean
    items: CartItem[]
    budget_status?: {
        budget: number
        current_spent: number
        reason?: string
    }
}

export interface Prediction {
    days_until_runout: number
    status: string
    recommended_quantity?: number
}
