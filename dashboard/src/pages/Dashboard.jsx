import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart3,
    ShoppingCart,
    Users,
    DollarSign,
    LogOut,
    LayoutDashboard,
    PlusCircle,
    Receipt
} from 'lucide-react';
import SalesWidget from '../components/SalesWidget';

function Dashboard({ user, onLogout }) {
    const [stats, setStats] = useState({ daily: 0, monthly: 0 });
    const [activeTab, setActiveTab] = useState('sales');
    const [recentSales, setRecentSales] = useState([]);

    useEffect(() => {
        if (user.role === 'admin') {
            fetchStats();
            fetchRecentSales();
        }
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/sales/totals', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats', err);
        }
    };

    const fetchRecentSales = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/sales', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecentSales(response.data);
        } catch (err) {
            console.error('Error fetching recent sales', err);
        }
    };

    return (
        <div className={`dashboard-container ${activeTab === 'sales' ? 'pos-mode' : ''}`}>
            {/* Sidebar */}
            <aside className="sidebar glass">
                <div style={{ marginBottom: '40px' }}>
                    <h2 className="title-amber" style={{ fontSize: '2rem' }}>TIENTO</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>Soda & Café System</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`btn-primary ${activeTab === 'dashboard' ? '' : 'glass-btn'}`}
                        style={{
                            backgroundColor: activeTab === 'dashboard' ? 'var(--accent)' : 'transparent',
                            color: activeTab === 'dashboard' ? '#000' : 'var(--text-secondary)',
                            justifyContent: 'flex-start',
                            border: activeTab === 'dashboard' ? 'none' : '1px solid transparent'
                        }}
                    >
                        <LayoutDashboard size={20} /> Dashboard
                    </button>

                    {user.role === 'admin' && (
                        <button
                            onClick={() => window.location.href = '/admin/employees'}
                            className="btn-primary glass-btn"
                            style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', justifyContent: 'flex-start' }}
                        >
                            <Users size={20} /> Empleados
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab('sales')}
                        className={`btn-primary ${activeTab === 'sales' ? '' : 'glass-btn'}`}
                        style={{
                            backgroundColor: activeTab === 'sales' ? 'var(--accent)' : 'transparent',
                            color: activeTab === 'sales' ? '#000' : 'var(--text-secondary)',
                            justifyContent: 'flex-start',
                            border: activeTab === 'sales' ? 'none' : '1px solid transparent'
                        }}
                    >
                        <Receipt size={20} /> Ventas
                    </button>
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                    <div className="glass" style={{ padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Usuario</div>
                        <div style={{ fontWeight: '700', color: 'var(--accent)' }}>{user.username.toUpperCase()}</div>
                    </div>
                    <button onClick={onLogout} className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--error)', width: '100%', justifyContent: 'flex-start', border: '1px solid rgba(244, 67, 54, 0.2)' }}>
                        <LogOut size={20} /> Salir
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {activeTab === 'sales' && (
                    <header className="top-nav">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <h2 className="title-amber" style={{ margin: 0 }}>TIENTO POS</h2>
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className="glass-btn"
                                style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <LayoutDashboard size={18} /> Salir a Dashboard
                            </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '14px', opacity: 0.7 }}>Usuario: <b>{user.username}</b></span>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {user.username[0].toUpperCase()}
                            </div>
                        </div>
                    </header>
                )}

                <div className="content-scroll" style={{ padding: activeTab === 'sales' ? '0' : '24px 32px' }}>
                    {activeTab === 'dashboard' ? (
                        <div className="animate-fade">
                            <header style={{ marginBottom: '32px' }}>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Dashboard</h1>
                                <p style={{ color: 'var(--text-secondary)' }}>Resumen general del negocio</p>
                            </header>

                            {user.role === 'admin' && (
                                <div className="grid-layout" style={{ marginBottom: '32px' }}>
                                    <div className="glass card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{ background: 'var(--accent-glow)', padding: '10px', borderRadius: '12px' }}>
                                                <DollarSign size={24} color="var(--accent)" />
                                            </div>
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Ventas Hoy</span>
                                        </div>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>₡{stats.daily.toLocaleString()}</h2>
                                    </div>

                                    <div className="glass card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{ background: 'var(--accent-glow)', padding: '10px', borderRadius: '12px' }}>
                                                <BarChart3 size={24} color="var(--accent)" />
                                            </div>
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Ventas Mes</span>
                                        </div>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>₡{stats.monthly.toLocaleString()}</h2>
                                    </div>
                                </div>
                            )}

                            <div className="glass card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ margin: 0 }}>Actividad Reciente</h3>
                                    <button onClick={fetchRecentSales} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>ACTUALIZAR</button>
                                </div>
                                {recentSales.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                                        <p style={{ color: 'var(--text-secondary)' }}>No hay operaciones registradas todavía.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {recentSales.map(sale => (
                                            <div key={sale.id} className="glass" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ background: 'var(--accent-glow)', padding: '8px', borderRadius: '8px' }}>
                                                        <ShoppingCart size={16} color="var(--accent)" />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '14px', fontWeight: '700' }}>Venta #{sale.id}</div>
                                                        <div style={{ fontSize: '11px', opacity: 0.6 }}>{new Date(sale.created_at).toLocaleString()} • {sale.payment_method}</div>
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: '900', color: 'var(--accent)', fontSize: '1.2rem' }}>
                                                    ₡{Number(sale.total_amount).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade" style={{ height: '100%' }}>
                            <SalesWidget user={user} onSaleSuccess={() => {
                                if (user.role === 'admin') {
                                    fetchStats();
                                    fetchRecentSales();
                                }
                            }} />
                        </div>
                    )}
                </div>
            </main>

            <style jsx>{`
                .glass-btn:hover {
                    background: rgba(255, 255, 255, 0.05) !important;
                    color: #fff !important;
                }
            `}</style>
        </div>
    );
}

export default Dashboard;
