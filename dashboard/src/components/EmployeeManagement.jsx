import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Calendar, DollarSign, Loader2 } from 'lucide-react';

function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [name, setName] = useState('');
    const [salary, setSalary] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/employees', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(response.data);
        } catch (err) {
            console.error('Error fetching employees');
        }
    };

    const addEmployee = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/employees', {
                name,
                daily_salary: parseFloat(salary),
                hire_date: new Date().toISOString().split('T')[0]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setName('');
            setSalary('');
            fetchEmployees();
        } catch (err) {
            alert('Error al agregar empleado');
        } finally {
            setLoading(false);
        }
    };

    const registerWorkLog = async (employeeId, daysWorked, dailySalary) => {
        try {
            const token = localStorage.getItem('token');
            const totalPayment = daysWorked * dailySalary;
            const today = new Date().toISOString().split('T')[0];
            // Simple period calculation: last 7 days
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            const periodStart = lastWeek.toISOString().split('T')[0];

            await axios.post('/api/employees/work-log', {
                employee_id: employeeId,
                days_worked: parseInt(daysWorked),
                period_start: periodStart,
                period_end: today,
                total_payment: totalPayment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Pago/Dias registrados con éxito. Total: ₡' + totalPayment.toLocaleString());
        } catch (err) {
            alert('Error registrando días trabajados');
        }
    };

    const registerCesantia = async (employeeId, amount) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/employees/cesantias', {
                employee_id: employeeId,
                amount: parseFloat(amount),
                date: new Date().toISOString().split('T')[0]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Cesantía registrada con éxito');
        } catch (err) {
            alert('Error registrando cesantía');
        }
    };

    return (
        <div className="animate-fade">
            <h1 className="title-amber">Gestión de Empleados</h1>

            <div className="grid-layout">
                <div className="glass card">
                    <h3 style={{ marginBottom: '20px' }}><UserPlus size={18} /> Nuevo Empleado</h3>
                    <form onSubmit={addEmployee}>
                        <input className="input-field" placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} required />
                        <input className="input-field" type="number" placeholder="Salario diario (₡)" value={salary} onChange={(e) => setSalary(e.target.value)} required />
                        <button className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Registrar'}
                        </button>
                    </form>
                </div>

                <div className="glass card" style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ marginBottom: '20px' }}>Lista de Personal</h3>
                    {employees.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No hay empleados registrados.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                        <th style={{ padding: '12px' }}>Nombre</th>
                                        <th style={{ padding: '12px' }}>Salario Diario</th>
                                        <th style={{ padding: '12px' }}>Fecha Ingreso</th>
                                        <th style={{ padding: '12px' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(emp => (
                                        <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '12px' }}>{emp.name}</td>
                                            <td style={{ padding: '12px' }}>₡{emp.daily_salary.toLocaleString()}</td>
                                            <td style={{ padding: '12px' }}>{emp.hire_date}</td>
                                            <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="btn-primary"
                                                    style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                                                    onClick={() => {
                                                        const days = prompt('¿Cuántos días trabajó ' + emp.name + ' esta semana?');
                                                        if (days && !isNaN(days)) registerWorkLog(emp.id, days, emp.daily_salary);
                                                    }}
                                                >
                                                    Registrar Pago Semanal
                                                </button>
                                                <button
                                                    className="glass"
                                                    style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--accent)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                    onClick={() => {
                                                        const amount = prompt('Monto de cesantía para ' + emp.name);
                                                        if (amount) registerCesantia(emp.id, amount);
                                                    }}
                                                >
                                                    Cesantía
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EmployeeManagement;
