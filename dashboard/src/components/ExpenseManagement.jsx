import React, { useState, useEffect } from 'react';
import api from '../api';
import { CreditCard, Tag, DollarSign, Loader2 } from 'lucide-react';

function ExpenseManagement() {
    const [expenses, setExpenses] = useState([]);
    const [category, setCategory] = useState('Implementos');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await api.get('/expenses');
            setExpenses(response.data);
        } catch (err) {
            console.error('Error fetching expenses');
        }
    };

    const addExpense = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/expenses', {
                category,
                amount: parseFloat(amount),
                description,
                date: new Date().toISOString().split('T')[0]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAmount('');
            setDescription('');
            fetchExpenses();
        } catch (err) {
            alert('Error al registrar gasto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade">
            <h1 className="title-amber">Registro de Gastos</h1>

            <div className="grid-layout">
                <div className="glass card">
                    <h3 style={{ marginBottom: '20px' }}><CreditCard size={18} /> Nuevo Gasto</h3>
                    <form onSubmit={addExpense}>
                        <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="Implementos">Implementos</option>
                            <option value="Agua">Agua</option>
                            <option value="Luz">Luz</option>
                            <option value="Alquiler">Alquiler</option>
                            <option value="Otro">Otro</option>
                        </select>
                        <input className="input-field" type="number" placeholder="Monto (₡)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                        <textarea className="input-field" placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
                        <button className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Registrar'}
                        </button>
                    </form>
                </div>

                <div className="glass card" style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ marginBottom: '20px' }}>Historial de Gastos</h3>
                    {expenses.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No hay gastos registrados.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '12px' }}>Categoría</th>
                                    <th style={{ padding: '12px' }}>Monto</th>
                                    <th style={{ padding: '12px' }}>Fecha</th>
                                    <th style={{ padding: '12px' }}>Nota</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map(exp => (
                                    <tr key={exp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}><span className="glass" style={{ padding: '4px 8px', fontSize: '12px' }}>{exp.category}</span></td>
                                        <td style={{ padding: '12px', color: 'var(--error)' }}>- ₡{exp.amount.toLocaleString()}</td>
                                        <td style={{ padding: '12px' }}>{exp.date}</td>
                                        <td style={{ padding: '12px', fontSize: '14px' }}>{exp.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ExpenseManagement;
