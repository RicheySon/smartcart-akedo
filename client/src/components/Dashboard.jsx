import { useState, useEffect } from 'react'
import { api } from '../services/api'
import './Dashboard.css'

function Dashboard({ onNavigate }) {
    const [stats, setStats] = useState(null)
    const [shoppingList, setShoppingList] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboard()
    }, [])

    async function loadDashboard() {
        try {
            const [inventoryData, forecastData] = await Promise.all([
                api.getInventory(),
                api.getShoppingList()
            ])

            const totalItems = inventoryData.length
            const lowStock = inventoryData.filter(item => item.quantity < item.threshold).length
            const outOfStock = inventoryData.filter(item => item.quantity === 0).length

            setStats({ totalItems, lowStock, outOfStock })
            setShoppingList(forecastData)
        } catch (error) {
            console.error('Failed to load dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="loading">Loading dashboard...</div>
    }

    return (
        <div className="dashboard fade-in">
            <header className="page-header">
                <h2>Dashboard</h2>
                <p className="page-subtitle">AI-powered grocery shopping insights</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-value">{stats?.totalItems || 0}</div>
                    <div className="stat-label">Total Items</div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-value">{stats?.lowStock || 0}</div>
                    <div className="stat-label">Low Stock</div>
                </div>

                <div className="stat-card card">
                    <div className="stat-icon">❌</div>
                    <div className="stat-value">{stats?.outOfStock || 0}</div>
                    <div className="stat-label">Out of Stock</div>
                </div>

                <div className="stat-card card gradient-primary">
                    <div className="stat-icon">🤖</div>
                    <div className="stat-value">{shoppingList?.length || 0}</div>
                    <div className="stat-label">AI Suggestions</div>
                </div>
            </div>

            <div className="dashboard-sections">
                <section className="card">
                    <h3>🎯 Predicted Run-Outs</h3>
                    <p className="section-subtitle">Items you'll need soon based on usage patterns</p>

                    {shoppingList && shoppingList.length > 0 ? (
                        <div className="prediction-list">
                            {shoppingList.slice(0, 5).map(item => (
                                <div key={item.id} className="prediction-item">
                                    <div className="prediction-info">
                                        <div className="prediction-name">{item.name}</div>
                                        <div className="prediction-meta">
                                            {item.prediction?.days_until_runout !== undefined && (
                                                <span className="badge badge-warning">
                                                    {Math.round(item.prediction.days_until_runout)} days left
                                                </span>
                                            )}
                                            {item.prediction?.status === 'out_of_stock' && (
                                                <span className="badge badge-danger">Out of Stock</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="prediction-quantity">
                                        Current: {item.quantity} {item.unit}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No predictions yet. Add items to your inventory to get started!</p>
                            <button className="btn btn-primary" onClick={() => onNavigate('inventory')}>
                                Manage Inventory
                            </button>
                        </div>
                    )}
                </section>

                <section className="card">
                    <h3>💡 Quick Actions</h3>
                    <div className="quick-actions">
                        <button className="action-btn btn-secondary" onClick={() => onNavigate('inventory')}>
                            <span>📦</span>
                            View Full Inventory
                        </button>
                        <button className="action-btn btn-secondary" onClick={() => onNavigate('cart')}>
                            <span>🛒</span>
                            Go to Cart
                        </button>
                        <button className="action-btn btn-primary">
                            <span>🤖</span>
                            Auto-Generate Cart
                        </button>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Dashboard
