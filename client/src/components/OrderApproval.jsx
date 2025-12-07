import { useState, useEffect } from 'react'
import { api } from '../services/api'
import './OrderApproval.css'

function OrderApproval({ onClose }) {
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadPreview()
    }, [])

    async function loadPreview() {
        try {
            const data = await api.previewOrder()
            setPreview(data)
        } catch (error) {
            setError('Failed to load order preview')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function handleApprove() {
        setProcessing(true)
        setError(null)

        try {
            const result = await api.checkout()
            setSuccess(true)
            setTimeout(() => {
                onClose()
                window.location.reload() // Refresh to update inventory/cart
            }, 2000)
        } catch (error) {
            setError(error.message || 'Order placement failed')
            console.error(error)
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal order-approval card" onClick={e => e.stopPropagation()}>
                <h2 className="gradient-text">Order Approval</h2>

                {loading && <div className="loading">Loading order details...</div>}

                {error && (
                    <div className="error-message">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        <span>✓</span> Order placed successfully! Updating inventory...
                    </div>
                )}

                {!loading && !success && preview && (
                    <div className="approval-content">
                        <div className="order-summary">
                            <h3>Order Summary</h3>

                            <div className="summary-stats">
                                <div className="stat">
                                    <div className="stat-label">Items</div>
                                    <div className="stat-value">{preview.item_count}</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-label">Total Cost</div>
                                    <div className="stat-value">${preview.total_cost?.toFixed(2)}</div>
                                </div>
                            </div>

                            <div className="budget-status">
                                <h4>Budget Status</h4>
                                {preview.can_afford ? (
                                    <div className="budget-ok">
                                        <span>✓</span>
                                        <div>
                                            <div>Within budget</div>
                                            <div className="budget-detail">
                                                Remaining: ${preview.budget_status?.current_spent !== undefined ?
                                                    (preview.budget_status.budget - preview.budget_status.current_spent - preview.total_cost).toFixed(2) :
                                                    '-.--'}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="budget-exceeded">
                                        <span>⚠️</span>
                                        <div>
                                            <div>Exceeds budget cap</div>
                                            <div className="budget-detail">
                                                {preview.budget_status?.reason}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="order-items">
                                <h4>Items ({preview.items?.length || 0})</h4>
                                <div className="items-list">
                                    {preview.items?.map((item, index) => (
                                        <div key={index} className="order-item">
                                            <div className="item-details">
                                                <div className="item-name">{item.name}</div>
                                                <div className="item-vendor">{item.vendor}</div>
                                            </div>
                                            <div className="item-pricing">
                                                <div className="item-qty">x{item.quantity}</div>
                                                <div className="item-total">${(item.price * item.quantity).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="approval-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={handleApprove}
                                disabled={processing || !preview.can_afford}
                            >
                                {processing ? 'Processing...' : '✓ Approve & Place Order'}
                            </button>
                        </div>

                        {!preview.can_afford && (
                            <div className="warning-note">
                                ⚠️ This order exceeds your budget cap. Please remove items or adjust your budget.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrderApproval
