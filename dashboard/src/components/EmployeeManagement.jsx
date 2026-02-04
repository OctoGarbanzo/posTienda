import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserPlus, Calendar, DollarSign, Loader2, Printer } from 'lucide-react';
import SettlementDocument from './SettlementDocument';

function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [name, setName] = useState('');
    const [salary, setSalary] = useState('');
    const [cedula, setCedula] = useState('');
    const [position, setPosition] = useState('');
    const [contractType, setContractType] = useState('Tiempo Definido');
    const [paymentType, setPaymentType] = useState('Semanal');
    const [loading, setLoading] = useState(false);

    // Work log helper state
    const [logDays, setLogDays] = useState('');
    const [logModal, setLogModal] = useState(false);
    const [logEmployee, setLogEmployee] = useState(null);

    const [settlementModal, setSettlementModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [settlementData, setSettlementData] = useState(null);
    const [exitDate, setExitDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data);
        } catch (err) {
            console.error('Error fetching employees');
        }
    };

    const addEmployee = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/employees', {
                name,
                daily_salary: parseFloat(salary),
                hire_date: new Date().toISOString().split('T')[0],
                cedula,
                position,
                contract_type: contractType,
                payment_type: paymentType
            });
            setName('');
            setSalary('');
            setCedula('');
            setPosition('');
            fetchEmployees();
        } catch (err) {
            alert('Error al agregar empleado');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculateSettlement = async (employee) => {
        setLoading(true);
        try {
            const response = await api.get(`/employees/${employee.id}/calculate-settlement?exit_date=${exitDate}`);
            setSettlementData(response.data);
            setSelectedEmployee(employee);
            setSettlementModal(true);
        } catch (err) {
            alert('Error al calcular liquidación');
        } finally {
            setLoading(false);
        }
    };

    const finalizeSettlement = async () => {
        if (!window.confirm('¿Confirmar liquidación? Esto marcará la salida del empleado.')) return;
        setLoading(true);
        try {
            await api.post(`/employees/${selectedEmployee.id}/settle`, {
                exit_date: exitDate,
                aguinaldo: settlementData.aguinaldo,
                cesantia: settlementData.cesantia,
                total: settlementData.total,
                notes
            });
            alert('Liquidación procesada con éxito');
            setSettlementModal(false);
            fetchEmployees();
        } catch (err) {
            alert('Error al procesar liquidación');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const registerWorkLog = async () => {
        if (!logDays || !logEmployee) return;
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const start = new Date();
            start.setDate(start.getDate() - 7);
            const periodStart = start.toISOString().split('T')[0];
            const totalPayment = logEmployee.daily_salary * parseInt(logDays);

            await api.post('/employees/work-log', {
                employee_id: logEmployee.id,
                days_worked: parseInt(logDays),
                period_start: periodStart,
                period_end: today,
                total_payment: totalPayment
            });
            alert(`Pago de ₡${totalPayment.toLocaleString()} registrado.`);
            setLogModal(false);
            setLogDays('');
        } catch (err) {
            alert('Error registrando días');
        } finally {
            setLoading(false);
        }
    };

    const registerCesantia = async (employeeId, amount) => {
        try {
            await api.post('/employees/cesantias', {
                employee_id: employeeId,
                amount: parseFloat(amount),
                date: new Date().toISOString().split('T')[0]
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
                        <input className="input-field" placeholder="Cédula" value={cedula} onChange={(e) => setCedula(e.target.value)} required />
                        <input className="input-field" placeholder="Cargo (ej: Cocinera, Salonero)" value={position} onChange={(e) => setPosition(e.target.value)} required />
                        <input className="input-field" type="number" placeholder="Salario diario (₡)" value={salary} onChange={(e) => setSalary(e.target.value)} required />

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '11px', opacity: 0.6, display: 'block', marginBottom: '4px' }}>Contrato</label>
                                <select className="input-field" style={{ margin: 0 }} value={contractType} onChange={(e) => setContractType(e.target.value)}>
                                    <option>Tiempo Definido</option>
                                    <option>Tiempo Indefinido</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '11px', opacity: 0.6, display: 'block', marginBottom: '4px' }}>Pago</label>
                                <select className="input-field" style={{ margin: 0 }} value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                                    <option>Semanal</option>
                                    <option>Quincenal</option>
                                    <option>Mensual</option>
                                </select>
                            </div>
                        </div>

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
                                        <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)', opacity: emp.exit_date ? 0.5 : 1 }}>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ fontWeight: '700' }}>{emp.name}</div>
                                                <div style={{ fontSize: '11px', opacity: 0.6 }}>{emp.position} • {emp.cedula}</div>
                                            </td>
                                            <td style={{ padding: '12px' }}>₡{Number(emp.daily_salary).toLocaleString()}</td>
                                            <td style={{ padding: '12px' }}>
                                                {new Date(emp.hire_date).toLocaleDateString()}
                                                {emp.exit_date && <div style={{ color: 'var(--error)', fontSize: '10px' }}>Salida: {new Date(emp.exit_date).toLocaleDateString()}</div>}
                                            </td>
                                            <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                                                {!emp.exit_date && (
                                                    <>
                                                        <button
                                                            className="btn-primary"
                                                            style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                                                            onClick={() => {
                                                                setLogEmployee(emp);
                                                                setLogModal(true);
                                                            }}
                                                        >
                                                            Pago Semanal
                                                        </button>
                                                        <button
                                                            className="glass"
                                                            style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--accent)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                            onClick={() => handleCalculateSettlement(emp)}
                                                        >
                                                            Liquidación
                                                        </button>
                                                    </>
                                                )}
                                                {emp.exit_date && <span style={{ fontSize: '10px', opacity: 0.5 }}>Liquidado</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Settlement Modal */}
            {settlementModal && settlementData && (
                <div className="glass" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)'
                }}>
                    <div className="glass card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 className="title-amber" style={{ marginBottom: '20px' }}>Liquidación Laboral</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', fontSize: '14px' }}>
                            <div>
                                <label style={{ opacity: 0.6 }}>Empleado</label>
                                <div style={{ fontWeight: '700' }}>{selectedEmployee.name}</div>
                            </div>
                            <div>
                                <label style={{ opacity: 0.6 }}>Fecha de Salida</label>
                                <input type="date" className="input-field" value={exitDate} onChange={(e) => setExitDate(e.target.value)} />
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span>Derecho de Aguinaldo</span>
                                <span style={{ fontWeight: '700' }}>₡{settlementData.aguinaldo.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span>Total Cesantía</span>
                                <span style={{ fontWeight: '700' }}>₡{settlementData.cesantia.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '1.2rem' }}>
                                <span style={{ fontWeight: '700' }}>TOTAL LIQUIDACIÓN</span>
                                <span style={{ fontWeight: '900', color: 'var(--accent)' }}>₡{settlementData.total.toLocaleString()}</span>
                            </div>
                        </div>

                        <textarea
                            className="input-field"
                            placeholder="Notas adicionales o motivo de salida..."
                            style={{ height: '80px', resize: 'none' }}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="glass" style={{ flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer' }} onClick={() => setSettlementModal(false)}>Cerrar</button>
                            <button className="btn-primary" style={{ flex: 1.5 }} onClick={finalizeSettlement}>Finalizar Salida</button>
                            <button className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--success)' }} onClick={handlePrint}><Printer size={16} /> Imprimir</button>
                        </div>
                    </div>
                    {/* Hidden from screen, visible during print */}
                    <div style={{ display: 'none' }}>
                        <SettlementDocument data={settlementData} />
                    </div>
                </div>
            )}

            {/* Work Log Modal */}
            {logModal && (
                <div className="glass" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)'
                }}>
                    <div className="glass card" style={{ width: '400px' }}>
                        <h3>Registrar Días Trabajados</h3>
                        <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '20px' }}>{logEmployee?.name}</p>
                        <input
                            type="number"
                            className="input-field"
                            placeholder="Cantidad de días"
                            value={logDays}
                            onChange={(e) => setLogDays(e.target.value)}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="glass" style={{ flex: 1, padding: '12px', borderRadius: '12px' }} onClick={() => setLogModal(false)}>Cancelar</button>
                            <button className="btn-primary" style={{ flex: 2 }} onClick={registerWorkLog} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : 'Guardar y Pagar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmployeeManagement;
