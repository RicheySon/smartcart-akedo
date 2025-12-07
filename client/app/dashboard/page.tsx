'use client'

import { useInventory, useShoppingList } from '@/lib/api'
import { Package, AlertTriangle, XCircle, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
    const { data: inventory, isLoading: inventoryLoading } = useInventory()
    const { data: shoppingList, isLoading: listLoading } = useShoppingList()

    // Ensure data is array
    const inventoryArray = Array.isArray(inventory) ? inventory : []
    const shoppingArray = Array.isArray(shoppingList) ? shoppingList : []

    const stats = {
        total: inventoryArray.length,
        lowStock: inventoryArray.filter((item: any) => item.quantity <= (item.threshold || 5)).length,
        outOfStock: inventoryArray.filter((item: any) => item.quantity === 0).length,
        aiSuggestions: shoppingArray.length,
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400">AI-powered grocery shopping insights</p>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={<Package className="h-6 w-6" />}
                    label="Total Items"
                    value={stats.total}
                    gradient="from-blue-500 to-cyan-500"
                />
                <StatCard
                    icon={<AlertTriangle className="h-6 w-6" />}
                    label="Low Stock"
                    value={stats.lowStock}
                    gradient="from-yellow-500 to-orange-500"
                />
                <StatCard
                    icon={<XCircle className="h-6 w-6" />}
                    label="Out of Stock"
                    value={stats.outOfStock}
                    gradient="from-red-500 to-pink-500"
                />
                <StatCard
                    icon={<Sparkles className="h-6 w-6" />}
                    label="AI Suggestions"
                    value={stats.aiSuggestions}
                    gradient="from-indigo-500 to-purple-500"
                />
            </div>

            {/* AI Predictions */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">🎯 Predicted Run-Outs</h2>
                <p className="mb-6 text-sm text-gray-400">
                    Items you'll need soon based on usage patterns
                </p>

                {listLoading && (
                    <div className="text-center text-gray-400">Loading predictions...</div>
                )}

                {!listLoading && shoppingArray && shoppingArray.length > 0 ? (
                    <div className="space-y-3">
                        {shoppingArray.slice(0, 5).map((item: any, index: number) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between rounded-lg bg-slate-800/50 p-4"
                            >
                                <div className="flex-1">
                                    <p className="font-medium text-white">{item.name}</p>
                                    <p className="text-sm text-gray-400">
                                        Current: {item.quantity} {item.unit}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {item.prediction?.status === 'out_of_stock' && (
                                        <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                                            Out of Stock
                                        </span>
                                    )}
                                    {item.prediction?.days_until_runout !== undefined && (
                                        <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                                            {Math.round(item.prediction.days_until_runout)} days left
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    !listLoading && (
                        <div className="rounded-lg bg-slate-800/30 p-8 text-center">
                            <p className="text-gray-400">No predictions yet. Add items to your inventory to get started!</p>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}

function StatCard({
    icon,
    label,
    value,
    gradient,
}: {
    icon: React.ReactNode
    label: string
    value: number
    gradient: string
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
        >
            <div className={`mb-4 inline-flex rounded-lg bg-gradient-to-br ${gradient} p-3 text-white`}>
                {icon}
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
        </motion.div>
    )
}
