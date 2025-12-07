'use client'

import { useInventory, useAddInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem } from '@/lib/api'
import { Package, Plus, Trash2, Edit2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export const dynamic = 'force-dynamic'

export default function InventoryPage() {
    const { data: inventory, isLoading } = useInventory()
    const addItem = useAddInventoryItem()
    const updateItem = useUpdateInventoryItem()
    const deleteItem = useDeleteInventoryItem()
    const [showModal, setShowModal] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)
    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        unit: 'unit',
        category: 'produce',
        price: '',
        threshold: '5'
    })

    const inventoryArray = Array.isArray(inventory) ? inventory : []

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingItem) {
                // Update existing item
                await updateItem.mutateAsync({
                    id: editingItem.id,
                    updates: {
                        quantity: parseFloat(formData.quantity),
                        unit: formData.unit,
                        category: formData.category,
                        price: formData.price ? parseFloat(formData.price) : undefined,
                        threshold: parseFloat(formData.threshold),
                    }
                })
                alert('Item updated successfully!')
            } else {
                // Add new item
                await addItem.mutateAsync({
                    name: formData.name,
                    quantity: parseFloat(formData.quantity),
                    unit: formData.unit,
                    category: formData.category,
                    price: formData.price ? parseFloat(formData.price) : undefined,
                    threshold: parseFloat(formData.threshold),
                } as any)
                alert('Item added successfully!')
            }
            handleCloseModal()
        } catch (error) {
            console.error('Failed to save item:', error)
            alert(`Failed to ${editingItem ? 'update' : 'add'} item. Check console for details.`)
        }
    }

    const handleEdit = (item: any) => {
        setEditingItem(item)
        setFormData({
            name: item.name,
            quantity: item.quantity.toString(),
            unit: item.unit || 'unit',
            category: item.category || 'produce',
            price: item.price ? item.price.toString() : '',
            threshold: item.threshold ? item.threshold.toString() : '5'
        })
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingItem(null)
        setFormData({ name: '', quantity: '', unit: 'unit', category: 'produce', price: '', threshold: '5' })
    }

    const handleDelete = async (id: string) => {
        if (confirm('Delete this item?')) {
            await deleteItem.mutateAsync(id)
        }
    }

    const getStockStatus = (item: any) => {
        if (item.quantity === 0) return { label: 'Out', color: 'bg-red-500/20 text-red-400' }
        if (item.quantity <= (item.threshold || 5)) return { label: 'Low', color: 'bg-yellow-500/20 text-yellow-400' }
        return { label: 'Good', color: 'bg-green-500/20 text-green-400' }
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
                    <p className="text-gray-400">Track and manage your grocery items</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
                >
                    <Plus className="h-5 w-5" />
                    Add Item
                </button>
            </div>

            {/* Inventory Grid */}
            {isLoading && <div className="text-center text-gray-400">Loading...</div>}

            {!isLoading && inventoryArray.length === 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
                    <Package className="mx-auto mb-4 h-16 w-16 text-gray-600" />
                    <p className="text-gray-400">No items yet. Add your first item to get started!</p>
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {inventoryArray.map((item: any, index: number) => {
                    const status = getStockStatus(item)
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="text-gray-500 transition-colors hover:text-indigo-400"
                                        title="Edit item"
                                    >
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-gray-500 transition-colors hover:text-red-400"
                                        title="Delete item"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-indigo-400">{item.quantity}</span>
                                    <span className="text-gray-500">{item.unit}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-gray-400">
                                    {item.category}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
                                    {status.label}
                                </span>
                            </div>

                            {item.price && (
                                <div className="mt-4 text-sm font-semibold text-green-400">
                                    ${item.price.toFixed(2)}
                                </div>
                            )}
                        </motion.div>
                    )
                })}
            </div>

            {/* Add/Edit Item Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={handleCloseModal}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6"
                    >
                        <h2 className="mb-6 text-2xl font-bold text-white">
                            {editingItem ? 'Edit Item' : 'Add New Item'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-400">Item Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={!!editingItem}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="e.g., Organic Milk"
                                />
                                {editingItem && (
                                    <p className="mt-1 text-xs text-gray-500">Item name cannot be changed</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-400">Quantity</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-400">Unit</label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                    >
                                        <option value="unit">unit</option>
                                        <option value="oz">oz</option>
                                        <option value="lb">lb</option>
                                        <option value="gallon">gallon</option>
                                        <option value="liter">liter</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-400">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                    >
                                        <option value="produce">Produce</option>
                                        <option value="dairy">Dairy</option>
                                        <option value="meat">Meat</option>
                                        <option value="pantry">Pantry</option>
                                        <option value="frozen">Frozen</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-400">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 rounded-lg border border-slate-700 px-4 py-2 font-medium text-gray-300 transition-colors hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 font-semibold text-white transition-all hover:scale-105"
                                >
                                    {editingItem ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
