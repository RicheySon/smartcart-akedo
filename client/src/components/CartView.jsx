import { useState, useEffect } from 'react'
import { api } from '../services/api'
import './CartView.css'

function CartView({ onCheckout }) {
    const [cart, setCart] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState(null)

    useEffect(() => {
        loadCart()
    }, [])

    async function loadCart() {
        try {
            const data = await api.getCart()
            setCart(data)
        } catch (error) {
            console.error('Failed to load cart:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSearch(e) {
        e.preventDefault()
        if (!searchQuery.trim()) return

        try {
            const results = await api.compareProduct(searchQuery)
            setSearchResults(results)
        } catch (error) {
            console.error('Search failed:', error)
        }
    }

    async function handleAddToCart(product, vendor) {
        try {
            await api.addToCart(product, 1, vendor)
            loadCart()
            setSearchResults(null)
            setSearchQuery('')
        } catch (error) {
            console.error('Failed to add to cart:', error)
        }
    }

    async function handleRemoveFromCart(itemId) {
        try {
            await api.removeFromCart(itemId)
            loadCart()
        } catch (error) {
            console.error('Failed to remove from cart:', error)
        }
    }

    async function handleClearCart() {
        if (confirm('Clear all items from cart?')) {
            try {
                await api.clearCart()
                loadCart()
            } catch (error) {
                console.error('Failed to clear cart:', error)
            }
        }
    }

    if (loading) {
        return <div className="loading">Loading cart...</div>
    }

    const itemCount = cart?.items?.length || 0
    const total = cart?.total || 0

    return (
        <div className="cart-view fade-in">
            <header className="page-header">
                <div>
                    <h2>Shopping Cart</h2>
                    <p className="page-subtitle">{itemCount} items · ${total.toFixed(2)}</p>
                </div>
                {itemCount > 0 && (
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={handleClearCart}>
                            Clear Cart
                        </button>
                        <button className="btn btn-success" onClick={onCheckout}>
                            ✓ Proceed to Checkout
                        </button>
                    </div>
                )}
            </header>

            {/* Search Bar */}
            <div className="search-section card">
                <h3>🔍 Add Items to Cart</h3>
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search for products (e.g., 'milk', 'bread')..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="btn btn-primary">Search</button>
                </form>

                {searchResults && (
                    <div className="search-results">
                        {searchResults.amazon && (
                            <div className="product-option">
                                <div className="vendor-badge amazon">Amazon</div>
                                <div className="product-info">
                                    <div className="product-name">{searchResults.amazon.name}</div>
                                    <div className="product-price">${searchResults.amazon.price.toFixed(2)}</div>
                                    {searchResults.amazon.rating && (
                                        <div className="product-rating">⭐ {searchResults.amazon.rating}/5</div>
                                    )}
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleAddToCart(searchResults.amazon, 'amazon')}
                                >
                                    Add
                                </button>
                            </div>
                        )}

                        {searchResults.walmart && (
                            <div className="product-option">
                                <div className="vendor-badge walmart">Walmart</div>
                                <div className="product-info">
                                    <div className="product-name">{searchResults.walmart.name}</div>
                                    <div className="product-price">${searchResults.walmart.price.toFixed(2)}</div>
                                    {searchResults.walmart.rating && (
                                        <div className="product-rating">⭐ {searchResults.walmart.rating}/5</div>
                                    )}
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleAddToCart(searchResults.walmart, 'walmart')}
                                >
                                    Add
                                </button>
                            </div>
                        )}

                        {searchResults.comparison?.recommendation && (
                            <div className="recommendation">
                                💡 {searchResults.comparison.recommendation}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Cart Items */}
            {itemCount > 0 ? (
                <div className="cart-items">
                    {cart.items.map(item => (
                        <div key={item.id} className="cart-item card">
                            <div className="item-info">
                                <div className="item-name">{item.name}</div>
                                <div className="item-meta">
                                    <span className="vendor-tag">{item.vendor}</span>
                                    <span className="item-quantity">Qty: {item.quantity}</span>
                                </div>
                            </div>
                            <div className="item-actions">
                                <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveFromCart(item.id)}
                                    title="Remove"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="cart-summary card">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <p>Your cart is empty. Search for products above to add them!</p>
                </div>
            )}
        </div>
    )
}

export default CartView
