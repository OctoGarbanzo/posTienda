import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Minus, ShoppingCart, Loader2, Search, Receipt, Trash2, X } from 'lucide-react';

function SalesWidget({ user, onSaleSuccess }) {
    const [products, setProducts] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [category, setCategory] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [lastSale, setLastSale] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/sales/products');
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products', err);
        }
    };

    const addToCart = (product) => {
        const existing = items.find(i => i.product_id === product.id);
        if (existing) {
            setItems(items.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setItems([...items, { product_id: product.id, product_name: product.title, price: product.price, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId, delta) => {
        setItems(items.map(item => {
            if (item.product_id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean));
    };

    const removeItem = (productId) => {
        setItems(items.filter(i => i.product_id !== productId));
    };

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleSubmit = async () => {
        if (items.length === 0) return;
        setLoading(true);
        try {
            const response = await api.post('/sales', {
                items,
                total_amount: total,
                payment_method: paymentMethod
            });

            const saleData = {
                id: response.data.saleId,
                items,
                total,
                date: new Date().toLocaleString(),
                paymentMethod
            };

            setLastSale(saleData);
            setItems([]);
            if (onSaleSuccess) onSaleSuccess();
            alert('Venta registrada con éxito');
        } catch (err) {
            alert('Error registrando venta');
        } finally {
            setLoading(false);
        }
    };

    const generateTicket = (sale) => {
        const ticketWindow = window.open('', '_blank', 'width=300,height=600');
        const itemsHtml = sale.items.map(item => `
            <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                <span>${item.product_name} x${item.quantity}</span>
                <span>₡${(item.price * item.quantity).toLocaleString()}</span>
            </div>
        `).join('');

        ticketWindow.document.write(`
            <html>
                <head>
                    <title>Tique - Tiento</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; width: 80mm; padding: 10px; font-size: 12px; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .divider { border-top: 1px dashed #000; margin: 10px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2 style="margin:0">TIENTO</h2>
                        <p style="margin:5px 0">Soda & Café</p>
                        <p style="margin:0">${sale.date}</p>
                        <p style="margin:0">Venta #${sale.id}</p>
                    </div>
                    <div class="divider"></div>
                    <div>${itemsHtml}</div>
                    <div class="divider"></div>
                    <div style="display:flex; justify-content:space-between; font-weight:bold; font-size: 14px;">
                        <span>TOTAL</span>
                        <span>₡${sale.total.toLocaleString()}</span>
                    </div>
                    <p>Pago: ${sale.paymentMethod}</p>
                    <div class="footer">
                        <p>¡Gracias por su visita!</p>
                        <p>@tientosodacafe</p>
                    </div>
                    <script>window.print(); window.close();</script>
                </body>
            </html>
        `);
        ticketWindow.document.close();
    };

    const categories = ['Todos', ...new Set(products.map(p => p.category))];
    const filteredProducts = products.filter(p => {
        const matchesCategory = category === 'Todos' || p.category === category;
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)', overflow: 'hidden', position: 'relative' }}>
            {/* Top Ribbon: Categories & Search (Wrapped) */}
            <div className="glass" style={{ padding: '20px 32px', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            className="input-field"
                            style={{ paddingLeft: '48px', marginBottom: 0, background: 'rgba(255,255,255,0.05)' }}
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`category-tag ${category === cat ? 'active' : ''}`}
                                style={{ padding: '8px 16px', fontSize: '13px' }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    {lastSale && (
                        <button
                            onClick={() => generateTicket(lastSale)}
                            className="glass-btn"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '13px' }}
                        >
                            <Receipt size={16} /> Re-tique
                        </button>
                    )}
                </div>
            </div>

            {/* Main Product Catalog */}
            <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', paddingBottom: '240px' }}>
                <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="product-card"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                            <div className="product-image" style={{ height: '150px' }}>
                                {product.media_url ? (
                                    <img src={product.media_url} alt={product.title} />
                                ) : (
                                    <ShoppingCart size={40} style={{ opacity: 0.1 }} />
                                )}
                                <div className="add-overlay">
                                    <Plus size={32} color="#000" />
                                </div>
                            </div>
                            <div className="product-info" style={{ padding: '12px' }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '600', height: '34px', overflow: 'hidden' }}>{product.title}</h4>
                                <div style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '16px' }}>₡{product.price.toLocaleString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Order Bar (Fixed Structure) */}
            <div className="bottom-bar" style={{ height: '180px', padding: '16px 24px' }}>
                {/* Scrollable Bill Section */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.8 }}>
                            <Receipt size={14} /> ORDEN ({items.reduce((a, b) => a + b.quantity, 0)})
                        </h4>
                        {items.length > 0 && (
                            <button onClick={() => setItems([])} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}>LIMPIAR</button>
                        )}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }} className="bill-scroll">
                        {items.length === 0 ? (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                                <ShoppingCart size={32} />
                            </div>
                        ) : (
                            items.map(item => (
                                <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ width: '24px', fontWeight: '900', color: 'var(--accent)', fontSize: '13px' }}>{item.quantity}x</div>
                                    <div style={{ flex: 1, fontSize: '13px', fontWeight: '500' }}>{item.product_name}</div>
                                    <div style={{ fontSize: '13px', opacity: 0.8 }}>₡{(item.price * item.quantity).toLocaleString()}</div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button onClick={() => updateQuantity(item.product_id, -1)} className="qty-btn-small"><Minus size={10} /></button>
                                        <button onClick={() => updateQuantity(item.product_id, 1)} className="qty-btn-small"><Plus size={10} /></button>
                                        <button onClick={() => removeItem(item.product_id)} className="qty-btn-small" style={{ color: 'var(--error)' }}><X size={10} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Fixed Action Section */}
                <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '1px solid var(--glass-border)', paddingLeft: '24px' }}>
                    <div>
                        <label style={{ fontSize: '10px', fontWeight: '800', opacity: 0.5, marginBottom: '6px', display: 'block' }}>PAGO</label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {['Efectivo', 'Sinpe', 'Tarjeta'].map(method => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`method-btn ${paymentMethod === method ? 'active' : ''}`}
                                    style={{ flex: 1, height: '40px', gap: '4px' }}
                                >
                                    <span style={{ fontSize: '14px' }}>{method === 'Efectivo' ? '💵' : method === 'Sinpe' ? '📱' : '💳'}</span>
                                    <span style={{ fontSize: '11px' }}>{method}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', opacity: 0.6 }}>TOTAL</span>
                            <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--accent)', lineHeight: 1 }}>₡{total.toLocaleString()}</span>
                        </div>
                        <button
                            className="btn-primary"
                            style={{ width: '100%', height: '48px', fontSize: '15px', fontWeight: '800', borderRadius: '12px', boxShadow: '0 4px 20px rgba(255, 179, 0, 0.2)' }}
                            onClick={handleSubmit}
                            disabled={loading || items.length === 0}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'FINALIZAR VENTA'}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .qty-btn-small {
                    background: rgba(255,255,255,0.05);
                    border: none;
                    color: #fff;
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .bill-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .bill-scroll::-webkit-scrollbar-thumb {
                    background: rgba(255, 179, 0, 0.3);
                    border-radius: 10px;
                }
                .product-grid {
                    display: grid;
                }
                .product-card {
                    background: rgba(255,255,255,0.03);
                    border-radius: 18px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid var(--glass-border);
                }
                .product-card:hover {
                    background: rgba(255,255,255,0.06);
                    transform: translateY(-4px);
                    border-color: var(--accent);
                }
                .product-image {
                    background: #111;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .product-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .add-overlay {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: opacity 0.2s;
                    backdrop-filter: blur(4px);
                    background: rgba(255, 179, 0, 0.4);
                }
                .product-card:hover .add-overlay {
                    opacity: 1;
                }
                .category-tag {
                    padding: 8px 16px;
                    border-radius: 12px;
                    border: 1px solid var(--glass-border);
                    background: transparent;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .category-tag.active {
                    background: var(--accent);
                    color: #000;
                    border-color: var(--accent);
                }
                .method-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: 1px solid var(--glass-border);
                    color: #fff;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 700;
                    transition: all 0.2s;
                }
                .method-btn.active {
                    background: var(--accent);
                    color: #000;
                    border-color: var(--accent);
                }
            `}</style>
        </div>
    );
}

export default SalesWidget;
