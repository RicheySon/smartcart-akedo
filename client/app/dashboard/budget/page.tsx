'use client'

import { useState } from 'react'
import { DollarSign, Save } from 'lucide-react'
import { motion } from 'framer-motion'

export const dynamic = 'force-dynamic'

export default function BudgetPage() {
    const [monthlyBudget, setMonthlyBudget] = useState('500')
    const [saved, setSaved] = useState(false)

    const handleSave = async () => {
        try {
            const response = await fetch('/api/budget/set-cap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(monthlyBudget), period: 'monthly' })
            })

            if (response.ok) {
                setSaved(true)
                setTimeout(() => setSaved(false), 3000)
            }
        } catch (error) {
            console.error('Failed to save budget:', error)
            alert('Failed to save budget settings')
        }
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Budget Settings</h1>
                <p className="text-gray-400">Set spending limits and control your grocery budget</p>
            </div>

            {/* Budget Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl rounded-xl border border-slate-800 bg-slate-900/50 p-8"
            >
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-3 text-green-400 ring-1 ring-green-500/20">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">Monthly Budget Cap</h2>
                        <p className="text-sm text-gray-400">Maximum spending limit per month</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-400">
                            Monthly Limit ($)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={monthlyBudget}
                            onChange={(e) => setMonthlyBudget(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-2xl font-bold text-white focus:border-green-500 focus:outline-none"
                            placeholder="500.00"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            Transactions exceeding this amount will require manual approval
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
                    >
                        <Save className="h-5 w-5" />
                        {saved ? 'Saved!' : 'Save Budget Settings'}
                    </button>

                    {saved && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-lg bg-green-500/20 p-4 text-center text-sm font-medium text-green-400"
                        >
                            ✓ Budget settings saved successfully
                        </motion.div>
                    )}
                </div>

                {/* Info Box */}
                <div className="mt-8 rounded-lg bg-slate-800/50 p-4">
                    <h3 className="mb-2 font-semibold text-white">How Budget Control Works</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li>• All transactions are checked against your monthly budget</li>
                        <li>• Exceeding the limit triggers manual approval workflow</li>
                        <li>• Budget resets automatically at the start of each month</li>
                        <li>• All budget checks are logged in the audit trail</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    )
}
