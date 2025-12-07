'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Check, AlertTriangle, DollarSign } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { useOrderPreview, useCheckout } from '@/lib/api'
import type { OrderPreview } from '@/lib/types'

export default function OrderModal() {
    const orderModalOpen = useUIStore((state) => state.orderModalOpen)
    const setOrderModalOpen = useUIStore((state) => state.setOrderModalOpen)
    const orderPreview = useOrderPreview()
    const checkout = useCheckout()
    
    const [previewData, setPreviewData] = useState<OrderPreview | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Fetch order preview when modal opens
    useEffect(() => {
        if (orderModalOpen && !previewData && !isLoading) {
            handleFetchPreview()
        }
    }, [orderModalOpen])

    const handleFetchPreview = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await orderPreview.mutateAsync()
            // Handle both direct response and nested response formats
            const preview = (data as any).data || data
            setPreviewData(preview as OrderPreview)
        } catch (err: any) {
            setError(err.message || 'Failed to load order preview')
            console.error('Order preview error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async () => {
        if (!previewData || !previewData.can_afford) {
            return
        }

        setIsLoading(true)
        setError(null)
        try {
            const result = await checkout.mutateAsync()
            setSuccess(true)
            
            // Close modal after 2 seconds
            setTimeout(() => {
                setOrderModalOpen(false)
                setPreviewData(null)
                setSuccess(false)
                // Refresh page to show updated cart and inventory
                window.location.reload()
            }, 2000)
        } catch (err: any) {
            setError(err.message || 'Failed to place order')
            console.error('Checkout error:', err)
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        if (!isLoading && !success) {
            setOrderModalOpen(false)
            setPreviewData(null)
            setError(null)
        }
    }

    if (!orderModalOpen) return null

    const canAfford = previewData?.can_afford ?? false
    const budgetStatus = previewData?.budget_status as any

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={handleClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Order Approval</h2>
                    {!isLoading && !success && (
                        <button
                            onClick={handleClose}
                            className="text-gray-400 transition-colors hover:text-white"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    )}
                </div>

                {/* Loading State */}
                {isLoading && !previewData && (
                    <div className="py-12 text-center">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                        <p className="text-gray-400">Loading order preview...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                        <div className="flex items-center gap-2 text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            <p className="font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {success && (
                    <div className="mb-6 rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                        <div className="flex items-center gap-2 text-green-400">
                            <Check className="h-5 w-5" />
                            <p className="font-medium">Order placed successfully! Redirecting...</p>
                        </div>
                    </div>
                )}

                {/* Order Preview */}
                {previewData && !success && (
                    <>
                        {/* Budget Status */}
                        <div className={`mb-6 rounded-lg border p-4 ${
                            canAfford 
                                ? 'border-green-500/50 bg-green-500/10' 
                                : 'border-red-500/50 bg-red-500/10'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`rounded-lg p-2 ${
                                    canAfford ? 'bg-green-500/20' : 'bg-red-500/20'
                                }`}>
                                    <DollarSign className={`h-5 w-5 ${
                                        canAfford ? 'text-green-400' : 'text-red-400'
                                    }`} />
                                </div>
                                <div className="flex-1">
                                    <p className={`font-semibold ${
                                        canAfford ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {canAfford ? '✅ Within Budget' : '❌ Exceeds Budget Cap'}
                                    </p>
                                    {budgetStatus && !budgetStatus.allowed && (
                                        <p className="mt-1 text-sm text-gray-400">
                                            Budget: ${budgetStatus.budget?.toFixed(2) || '0.00'} | 
                                            Spent: ${budgetStatus.current_spent?.toFixed(2) || '0.00'} | 
                                            Order: ${previewData.total_cost?.toFixed(2) || '0.00'}
                                        </p>
                                    )}
                                    {budgetStatus?.reason && (
                                        <p className="mt-1 text-sm text-gray-400">{budgetStatus.reason}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="mb-6">
                            <h3 className="mb-4 text-lg font-semibold text-white">Order Summary</h3>
                            <div className="space-y-3">
                                {previewData.items && previewData.items.length > 0 ? (
                                    previewData.items.map((item: any, index: number) => (
                                        <div
                                            key={item.id || index}
                                            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/50 p-4"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-white">{item.name}</p>
                                                <div className="mt-1 flex gap-4 text-sm text-gray-400">
                                                    <span className="capitalize">{item.vendor || 'unknown'}</span>
                                                    <span>Qty: {item.quantity || 1}</span>
                                                </div>
                                            </div>
                                            <div className="text-lg font-semibold text-indigo-400">
                                                ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-400">No items in cart</p>
                                )}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="mb-6 flex items-center justify-between border-t border-slate-800 pt-4">
                            <span className="text-xl font-semibold text-white">Total Cost</span>
                            <span className="text-3xl font-bold text-indigo-400">
                                ${(previewData.total_cost || 0).toFixed(2)}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                disabled={isLoading || success}
                                className="flex-1 rounded-lg border border-slate-700 px-6 py-3 font-semibold text-gray-300 transition-colors hover:bg-slate-800 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={!canAfford || isLoading || success || (previewData.items && previewData.items.length === 0)}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                    canAfford
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105'
                                        : 'bg-gray-600 cursor-not-allowed'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-5 w-5" />
                                        Approve & Place Order
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    )
}
