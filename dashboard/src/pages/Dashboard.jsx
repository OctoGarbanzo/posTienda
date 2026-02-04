import React, { useState, useEffect } from 'react';
import api from '../api';
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
    const [paymentFilter, setPaymentFilter] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [topProducts, setTopProducts] = useState([]);
    const [categorySales, setCategorySales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [saleItems, setSaleItems] = useState([]);
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, [paymentFilter]);

    const fetchAllData = async () => {
        setLoading(true);
        if (user.role === 'admin') {
            await Promise.all([
                fetchStats(),
                fetchRecentSales(),
                fetchTopProducts(),
                fetchCategorySales()
            ]);
        } else {
            // Waiters only see recent sales (their own or general depending on backend)
            await fetchRecentSales();
        }
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            const url = paymentFilter === 'Todos' ? '/sales/totals' : `/sales/totals?payment_method=${paymentFilter}`;
            const response = await api.get(url);
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats', err);
        }
    };

    const fetchTopProducts = async () => {
        try {
            const response = await api.get('/sales/stats/most-sold');
            setTopProducts(response.data);
        } catch (err) {
            console.error('Error top products', err);
        }
    };

    const fetchCategorySales = async () => {
        try {
            const response = await api.get('/sales/stats/by-category');
            setCategorySales(response.data);
        } catch (err) {
            console.error('Error category stats', err);
        }
    };

    const fetchRecentSales = async () => {
        try {
            const response = await api.get('/sales');
            setRecentSales(response.data);
        } catch (err) {
            console.error('Error fetching recent sales', err);
        }
    };

    const viewSaleDetails = async (sale) => {
        try {
            setSelectedSale(sale);
            setShowSaleModal(true);
            const response = await api.get(`/sales/${sale.id}/items`);
            setSaleItems(response.data);
        } catch (err) {
            console.error('Error fetching sale items', err);
        }
    };

    const deleteSale = async (saleId) => {
        if (!window.confirm('¿Estás seguro de eliminar esta venta? Esta acción no se puede deshacer.')) return;

        setIsDeleting(true);
        try {
            await api.delete(`/sales/${saleId}`);
            setShowSaleModal(false);
            fetchAllData();
            alert('Venta eliminada correctamente');
        } catch (err) {
            alert('Error al eliminar la venta');
        } finally {
            setIsDeleting(false);
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
                            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.2 }}>Dashboard</h1>
                                    <p style={{ color: 'var(--text-secondary)' }}>Resumen general del negocio</p>
                                </div>
                                <div className="glass" style={{ padding: '8px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
                                    {['Todos', 'Efectivo', 'Sinpe', 'Tarjeta'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setPaymentFilter(m)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: paymentFilter === m ? 'var(--accent)' : 'transparent',
                                                color: paymentFilter === m ? '#000' : 'var(--text-secondary)',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </header>

                            {user.role === 'admin' && (
                                <div className="grid-layout" style={{ marginBottom: '32px' }}>
                                    <div className="glass card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{ background: 'var(--accent-glow)', padding: '10px', borderRadius: '12px' }}>
                                                <DollarSign size={24} color="var(--accent)" />
                                            </div>
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Ventas Hoy {paymentFilter !== 'Todos' && `(${paymentFilter})`}</span>
                                        </div>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>₡{stats.daily.toLocaleString()}</h2>
                                        <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '8px' }}>Ingresos registrados hoy</div>
                                    </div>

                                    <div className="glass card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{ background: 'var(--accent-glow)', padding: '10px', borderRadius: '12px' }}>
                                                <BarChart3 size={24} color="var(--accent)" />
                                            </div>
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Ventas Mes {paymentFilter !== 'Todos' && `(${paymentFilter})`}</span>
                                        </div>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>₡{stats.monthly.toLocaleString()}</h2>
                                        <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '8px' }}>Total acumulado del mes actual</div>
                                    </div>
                                </div>
                            )}

                            <div className="grid-layout" style={{ marginBottom: '32px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                                <div className="glass card">
                                    <h3 style={{ marginBottom: '20px' }}>Más Vendidos</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {topProducts.length === 0 ? <p style={{ opacity: 0.5, fontSize: '13px' }}>Cargando datos...</p> :
                                            topProducts.map((p, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '14px', flex: 1 }}>{p.product_name}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div className="glass" style={{ width: '80px', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${(p.total_qty / topProducts[0].total_qty) * 100}%`, height: '100%', background: 'var(--accent)' }}></div>
                                                        </div>
                                                        <span style={{ fontWeight: '800', fontSize: '14px', width: '30px', textAlign: 'right' }}>{p.total_qty}</span>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>

                                <div className="glass card">
                                    <h3 style={{ marginBottom: '20px' }}>Ingresos por Categoría</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {categorySales.length === 0 ? <p style={{ opacity: 0.5, fontSize: '13px' }}>Cargando datos...</p> :
                                            categorySales.sort((a, b) => b.total - a.total).map((cat, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '14px' }}>{cat.category}</span>
                                                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--accent)' }}>₡{cat.total.toLocaleString()}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="glass card" style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ margin: 0 }}>Historial de Ventas</h3>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            placeholder="Buscar venta # o método..."
                                            className="input-field"
                                            style={{ margin: 0, padding: '8px 16px', width: '250px', fontSize: '13px' }}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <button onClick={fetchAllData} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>ACTUALIZAR</button>
                                    </div>
                                </div>
                                {recentSales.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                                        <p style={{ color: 'var(--text-secondary)' }}>No hay operaciones registradas todavía.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {recentSales
                                            .filter(s =>
                                                s.id.toString().includes(searchTerm) ||
                                                s.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
                                            )
                                            .map(sale => (
                                                <div key={sale.id} className="glass" style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ background: 'var(--accent-glow)', padding: '8px', borderRadius: '8px' }}>
                                                            <ShoppingCart size={14} color="var(--accent)" />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '13px', fontWeight: '700' }}>Orden #{sale.id}</div>
                                                            <div style={{ fontSize: '10px', opacity: 0.5 }}>{new Date(sale.created_at).toLocaleString()} • <span style={{ color: 'var(--accent)' }}>{sale.payment_method}</span></div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                        <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                                                            ₡{Number(sale.total_amount).toLocaleString()}
                                                        </div>
                                                        <button
                                                            onClick={() => viewSaleDetails(sale)}
                                                            className="glass-btn"
                                                            style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px', border: '1px solid var(--accent)', color: 'var(--accent)', cursor: 'pointer' }}
                                                        >
                                                            VER
                                                        </button>
                                                        {user.role === 'admin' && (
                                                            <button
                                                                onClick={() => deleteSale(sale.id)}
                                                                style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', opacity: 0.6 }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
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

            {/* Sale Details Modal */}
            {showSaleModal && selectedSale && (
                <div className="modal-overlay animate-fade">
                    <div className="glass" style={{ width: '90%', maxWidth: '500px', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>Venta #{selectedSale.id}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{new Date(selectedSale.created_at).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => setShowSaleModal(false)}
                                className="glass-btn"
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                            >
                                <PlusCircle style={{ transform: 'rotate(45deg)' }} size={24} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                                <span>PRODUCTO</span>
                                <span>SUBTOTAL</span>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '12px 0' }}>
                                {saleItems.length === 0 ? (
                                    <p style={{ textAlign: 'center', opacity: 0.5 }}>Cargando detalles...</p>
                                ) : (
                                    saleItems.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '14px' }}>{item.product_name}</div>
                                                <div style={{ fontSize: '12px', opacity: 0.6 }}>{item.quantity} x ₡{Number(item.price).toLocaleString()}</div>
                                            </div>
                                            <div style={{ fontWeight: '700' }}>
                                                ₡{(item.quantity * item.price).toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                <span>Método de Pago</span>
                                <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{selectedSale.payment_method}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: '800', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                                <span>TOTAL</span>
                                <span style={{ color: 'var(--accent)' }}>₡{Number(selectedSale.total_amount).toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowSaleModal(false)}
                                className="glass-btn"
                                style={{ flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer' }}
                            >
                                Cerrar
                            </button>
                            {user.role === 'admin' && (
                                <button
                                    onClick={() => deleteSale(selectedSale.id)}
                                    disabled={isDeleting}
                                    className="btn-primary"
                                    style={{ flex: 1, backgroundColor: 'var(--error)', border: 'none' }}
                                >
                                    {isDeleting ? 'Borrando...' : 'Eliminar Venta'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .glass-btn:hover {
                    background: rgba(255, 255, 255, 0.05) !important;
                    color: #fff !important;
                }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 20px;
                }
                @media (max-width: 768px) {
                    .modal-overlay {
                        align-items: flex-end;
                        padding: 0;
                    }
                    .modal-overlay > .glass {
                        border-radius: 32px 32px 0 0 !important;
                        width: 100% !important;
                        max-width: none !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default Dashboard;
