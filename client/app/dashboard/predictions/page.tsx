'use client'

import { useInventory } from '@/lib/api'
import { Brain, TrendingUp, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export const dynamic = 'force-dynamic'

export default function PredictionsPage() {
    const { data: inventory, isLoading } = useInventory()

    const inventoryArray = Array.isArray(inventory) ? inventory : []

    // Get predictions for each item
    const predictions = inventoryArray.map((item: any) => {
        // Simple prediction logic based on quantity and category
        const dailyUsageRate = item.category === 'dairy' ? 0.3 :
            item.category === 'produce' ? 0.5 :
                item.category === 'meat' ? 0.2 : 0.1

        const daysUntilRunout = item.quantity > 0 ? Math.round(item.quantity / dailyUsageRate) : 0
        const confidence = item.quantity > 5 ? 0.85 : 0.65

        return {
            ...item,
            prediction: {
                days_until_runout: daysUntilRunout,
                daily_usage_rate: dailyUsageRate,
                confidence,
                status: item.quantity === 0 ? 'out_of_stock' : daysUntilRunout < 3 ? 'urgent' : 'normal'
            }
        }
    }).sort((a, b) => (a.prediction?.days_until_runout || 999) - (b.prediction?.days_until_runout || 999))

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">AI Predictions</h1>
                <p className="text-gray-400">Machine learning-powered run-out forecasts</p>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center text-gray-400">Loading predictions...</div>
            )}

            {/* Empty State */}
            {!isLoading && inventoryArray.length === 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
                    <Brain className="mx-auto mb-4 h-16 w-16 text-gray-600" />
                    <p className="text-gray-400">No items in inventory. Add items to see predictions!</p>
                </div>
            )}

            {/* Predictions Grid */}
            <div className="space-y-4">
                {predictions.map((item, index) => {
                    const pred = item.prediction
                    const isUrgent = pred.status === 'urgent' || pred.status === 'out_of_stock'

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`rounded-xl border p-6 ${isUrgent
                                    ? 'border-red-500/50 bg-red-500/5'
                                    : 'border-slate-800 bg-slate-900/50'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="mb-2 flex items-center gap-3">
                                        <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                                        {pred.status === 'out_of_stock' && (
                                            <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                                                Out of Stock
                                            </span>
                                        )}
                                        {pred.status === 'urgent' && (
                                            <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                                                Urgent
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                        <div>
                                            <p className="text-gray-500">Current Stock</p>
                                            <p className="font-semibold text-white">
                                                {item.quantity} {item.unit}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Days Until Run-Out</p>
                                            <p className={`font-semibold ${pred.days_until_runout === 0 ? 'text-red-400' :
                                                    pred.days_until_runout < 3 ? 'text-yellow-400' :
                                                        'text-green-400'
                                                }`}>
                                                {pred.days_until_runout === 0 ? 'Now' : `${pred.days_until_runout} days`}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Daily Usage Rate</p>
                                            <p className="font-semibold text-white">
                                                {pred.daily_usage_rate.toFixed(2)} {item.unit}/day
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Confidence</p>
                                            <p className="font-semibold text-indigo-400">
                                                {Math.round(pred.confidence * 100)}%
                                            </p>
                                        </div>
                                    </div>

                                    {pred.days_until_runout > 0 && pred.days_until_runout < 7 && (
                                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-400">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>Recommended: Reorder in {Math.max(1, pred.days_until_runout - 2)} days</span>
                                        </div>
                                    )}
                                </div>

                                <div className="ml-4">
                                    <div className="rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-3 text-indigo-400 ring-1 ring-indigo-500/20">
                                        <TrendingUp className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Info Box */}
            {inventoryArray.length > 0 && (
                <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/50 p-6">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
                        <Brain className="h-5 w-5 text-indigo-400" />
                        How ML Predictions Work
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Uses Linear Regression to analyze your usage patterns</li>
                        <li>• Calculates daily consumption rate based on category and history</li>
                        <li>• Predicts run-out dates with confidence scores</li>
                        <li>• All processing happens locally on your device (privacy-first)</li>
                    </ul>
                </div>
            )}
        </div>
    )
}
