import { useState, useEffect } from 'react'
import { api } from '../services/api'
import './InventoryView.css'

function InventoryView() {
    const [inventory, setInventory] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newItem, setNewItem] = useState({
        name: '',
        quantity: '',
        category: 'grocery',
        unit: 'unit',
        price: '',
        threshold: 5
    })

    useEffect(() => {
        loadInventory()
    }, [])

    async function loadInventory() {
        try {
            const data = await api.getInventory()
            setInventory(data)
        } catch (error) {
            console.error('Failed to load inventory:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleAddItem(e) {
        e.preventDefault()
        try {
            await api.addInventoryItem({
                ...newItem,
                quantity: parseFloat(newItem.quantity),
                price: parseFloat(newItem.price),
                threshold: parseFloat(newItem.threshold)
            })
            setShowAddModal(false)
            setNewItem({ name: '', quantity: '', category: 'grocery', unit: 'unit', price: '', threshold: 5 })
            loadInventory()
        } catch (error) {
            console.error('Failed to add item:', error)
        }
    }

    async function handleDeleteItem(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await api.deleteInventoryItem(id)
                loadInventory()
            } catch (error) {
                console.error('Failed to delete item:', error)
            }
        }
    }

    function getStockStatus(item) {
        if (item.quantity === 0) return 'out'
        if (item.quantity <= item.threshold) return 'low'
        return 'good'
    }

    if (loading) {
        return <div className="loading">Loading inventory...</div>
    }

    return (
        <div className="inventory-view fade-in">
            <header className="page-header">
                <div>
                    <h2>Inventory Management</h2>
                    <p className="page-subtitle">Track and manage your grocery items</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    ➕ Add Item
                </button>
            </header>

            <div className="inventory-grid">
                {inventory.map(item => {
                    const status = getStockStatus(item)
                    return (
                        <div key={item.id} className={`inventory-card card ${status === 'out' ? 'out-of-stock' : ''}`}>
                            <div className="inventory-header">
                                <h4>{item.name}</h4>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteItem(item.id)}
                                    title="Delete item"
                                >
                                    🗑️
                                </button>
                            </div>

                            <div className="inventory-details">
                                <div className="inventory-quantity">
                                    <span className="quantity-value">{item.quantity}</span>
                                    <span className="quantity-unit">{item.unit}</span>
                                </div>

                                <div className="inventory-meta">
                                    <span className="category-tag">{item.category}</span>
                                    {status === 'out' && <span className="badge badge-danger">Out</span>}
                                    {status === 'low' && <span className="badge badge-warning">Low</span>}
                                    {status === 'good' && <span className="badge badge-success">Good</span>}
                                </div>

                                {item.price && (
                                    <div className="inventory-price">${item.price.toFixed(2)}</div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {inventory.length === 0 && (
                <div className="empty-state">
                    <p>No items in inventory. Add your first item to get started!</p>
                </div>
            )}

            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal card" onClick={e => e.stopPropagation()}>
                        <h3>Add New Item</h3>
                        <form onSubmit={handleAddItem}>
                            <div className="form-group">
                                <label>Item Name</label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    required
                                    placeholder="e.g., Milk"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newItem.quantity}
                                        onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Unit</label>
                                    <select
                                        value={newItem.unit}
                                        onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                                    >
                                        <option value="unit">unit</option>
                                        <option value="oz">oz</option>
                                        <option value="lb">lb</option>
                                        <option value="gallon">gallon</option>
                                        <option value="liter">liter</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    >
                                        <option value="grocery">Grocery</option>
                                        <option value="dairy">Dairy</option>
                                        <option value="produce">Produce</option>
                                        <option value="meat">Meat</option>
                                        <option value="bakery">Bakery</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newItem.price}
                                        onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default InventoryView
