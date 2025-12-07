import { useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import InventoryView from './components/InventoryView'
import CartView from './components/CartView'
import OrderApproval from './components/OrderApproval'

function App() {
    const [currentView, setCurrentView] = useState('dashboard')
    const [showOrderModal, setShowOrderModal] = useState(false)

    return (
        <div className="app">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1 className="logo">
                        <span className="gradient-text">SmartCart</span>
                    </h1>
                    <p className="logo-subtitle">AI Shopping Assistant</p>
                </div>

                <nav className="nav">
                    <button
                        className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setCurrentView('dashboard')}
                    >
                        <span className="nav-icon">📊</span>
                        Dashboard
                    </button>
                    <button
                        className={`nav-item ${currentView === 'inventory' ? 'active' : ''}`}
                        onClick={() => setCurrentView('inventory')}
                    >
                        <span className="nav-icon">📦</span>
                        Inventory
                    </button>
                    <button
                        className={`nav-item ${currentView === 'cart' ? 'active' : ''}`}
                        onClick={() => setCurrentView('cart')}
                    >
                        <span className="nav-icon">🛒</span>
                        Shopping Cart
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">U</div>
                        <div>
                            <div className="user-name">User</div>
                            <div className="user-email">demo@smartcart.ai</div>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
                {currentView === 'inventory' && <InventoryView />}
                {currentView === 'cart' && <CartView onCheckout={() => setShowOrderModal(true)} />}
            </main>

            {showOrderModal && (
                <OrderApproval onClose={() => setShowOrderModal(false)} />
            )}
        </div>
    )
}

export default App
