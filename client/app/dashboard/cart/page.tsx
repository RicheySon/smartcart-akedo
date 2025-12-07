'use client'

import { useCart, useAddToCart, useRemoveFromCart, useClearCart } from '@/lib/api'
import { ShoppingCart, Search, Trash2, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useUIStore } from '@/lib/store'

export default function CartPage() {
    const { data: cart, isLoading } = useCart()
    const addToCart = useAddToCart()
    const removeFromCart = useRemoveFromCart()
    const clearCart = useClearCart()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any>(null)
    const [searching, setSearching] = useState(false)
    const setOrderModalOpen = useUIStore((state) => state.setOrderModalOpen)

    const cartData = cart as any
    const items = cartData?.items || []
    const total = cartData?.total || 0

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setSearching(true)
        try {
            const res = await fetch(`/api/shopping/compare/${encodeURIComponent(searchQuery)}`)
            if (!res.ok) {
                throw new Error(`API error: ${res.statusText}`)
            }
            const response = await res.json()
            // Handle wrapped response format { success: true, data: {...} }
            const data = response.data || response
            setSearchResults(data)
        } catch (error) {
            console.error('Search failed:', error)
            alert(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure the backend is running.`)
            setSearchResults(null)
        } finally {
            setSearching(false)
        }
    }

    const handleAddProductToCart = async (product: any, vendor: string) => {
        try {
            await addToCart.mutateAsync({
                item: product,
                quantity: 1,
                vendor
            })
            setSearchResults(null)
            setSearchQuery('')
            alert('Added to cart!')
        } catch (error) {
            console.error('Failed to add to cart:', error)
            alert('Failed to add to cart')
        }
    }

    const handleRemove = async (itemId: string) => {
        await removeFromCart.mutateAsync(itemId)
    }

    const handleClearCart = async () => {
        if (confirm('Clear all items from cart?')) {
            await clearCart.mutateAsync()
        }
    }

    const handleCheckout = () => {
        setOrderModalOpen(true)
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
                    <p className="text-gray-400">{items.length} items · ${total.toFixed(2)}</p>
                </div>
                {items.length > 0 && (
                    <div className="flex gap-3">
                        <button
                            onClick={handleClearCart}
                            className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-gray-300 transition-colors hover:bg-slate-800"
                        >
                            Clear Cart
                        </button>
                        <button
                            onClick={handleCheckout}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
                        >
                            <Check className="h-5 w-5" />
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>

            {/* Search Section */}
            <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">🔍 Add Items to Cart</h2>
                <form onSubmit={handleSearch} className="mb-4 flex gap-3">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for products (e.g., 'milk', 'bread')..."
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={searching}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
                    >
                        <Search className="h-5 w-5" />
                        {searching ? 'Searching...' : 'Search'}
                    </button>
                </form>

                {/* Search Results */}
                {searchResults && (
                    <div className="space-y-3">
                        {(!searchResults.amazon || !searchResults.amazon.name) && (!searchResults.walmart || !searchResults.walmart.name) ? (
                            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 text-center">
                                <p className="text-gray-400">No products found for "{searchQuery}". Try searching for: milk, bread, eggs, bananas, chicken, or cooking oil</p>
                            </div>
                        ) : (
                            <>
                        {searchResults.amazon && searchResults.amazon.name && (
                            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                                <div className="flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="rounded bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-400">
                                            Amazon
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-white">{searchResults.amazon.name}</h3>
                                    <p className="text-lg font-bold text-green-400">${searchResults.amazon.price.toFixed(2)}</p>
                                    {searchResults.amazon.rating && (
                                        <p className="text-sm text-gray-400">⭐ {searchResults.amazon.rating}/5</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleAddProductToCart(searchResults.amazon, 'amazon')}
                                    className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-indigo-600"
                                >
                                    Add
                                </button>
                            </div>
                        )}

                        {searchResults.walmart && (
                            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                                <div className="flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-400">
                                            Walmart
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-white">{searchResults.walmart.name}</h3>
                                    <p className="text-lg font-bold text-green-400">${searchResults.walmart.price.toFixed(2)}</p>
                                    {searchResults.walmart.rating && (
                                        <p className="text-sm text-gray-400">⭐ {searchResults.walmart.rating}/5</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleAddProductToCart(searchResults.walmart, 'walmart')}
                                    className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-indigo-600"
                                >
                                    Add
                                </button>
                            </div>
                        )}

                        {searchResults.comparison?.recommendation && (
                            <div className="rounded-lg border-l-4 border-indigo-500 bg-indigo-500/10 p-4">
                                <p className="text-sm text-indigo-300">
                                    💡 {searchResults.comparison.recommendation}
                                </p>
                            </div>
                        )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Cart Items */}
            {isLoading && <div className="text-center text-gray-400">Loading cart...</div>}

            {!isLoading && items.length === 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
                    <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-600" />
                    <p className="text-gray-400">Your cart is empty. Search for products above to add them!</p>
                </div>
            )}

            {!isLoading && items.length > 0 && (
                <div className="space-y-4">
                    {items.map((item: any, index: number) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-6"
                        >
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                                <div className="mt-1 flex gap-4 text-sm text-gray-400">
                                    <span className="capitalize">{item.vendor}</span>
                                    <span>Qty: {item.quantity}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-2xl font-bold text-indigo-400">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                                <button
                                    onClick={() => handleRemove(item.id)}
                                    className="text-gray-500 transition-colors hover:text-red-400"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {/* Cart Summary */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                            <span className="text-xl font-semibold text-white">Total</span>
                            <span className="text-3xl font-bold text-indigo-400">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
