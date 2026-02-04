import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserPlus, Users, FileText, Calendar, Loader2, Printer, ChevronRight, ChevronLeft, Edit3, Clock, Trash2, X } from 'lucide-react';
import SettlementDocument from './SettlementDocument';

function EmployeeManagement() {
    // Tab state
    const [activeTab, setActiveTab] = useState('personal');

    // Employee data
    const [employees, setEmployees] = useState([]);
    const [workLogs, setWorkLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    // Registration form
    const [name, setName] = useState('');
    const [salary, setSalary] = useState('');
    const [cedula, setCedula] = useState('');
    const [position, setPosition] = useState('');
    const [contractType, setContractType] = useState('Tiempo Definido');
    const [paymentType, setPaymentType] = useState('Semanal');
    const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0]);

    // Edit Employee Modal
    const [editModal, setEditModal] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);

    // Calendar Work Log Modal
    const [calendarModal, setCalendarModal] = useState(false);
    const [calendarEmployee, setCalendarEmployee] = useState(null);
    const [selectedDays, setSelectedDays] = useState([]);
    const [existingDays, setExistingDays] = useState([]);
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

    // Settlement
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

    const fetchWorkedDays = async (employeeId) => {
        try {
            const response = await api.get(`/employees/${employeeId}/worked-days`);
            setExistingDays(response.data.map(d => d.work_date));
        } catch (err) {
            console.error('Error fetching worked days');
            setExistingDays([]);
        }
    };

    const fetchWorkLogs = async (employeeId) => {
        try {
            const response = await api.get(`/employees/${employeeId}/work-logs`);
            setWorkLogs(response.data);
        } catch (err) {
            console.error('Error fetching work logs');
        }
    };

    const deleteWorkLog = async (logId) => {
        if (!window.confirm('¿Eliminar este registro de pago? Esta acción no se puede deshacer.')) return;
        try {
            await api.delete(`/employees/work-log/${logId}`);
            setWorkLogs(prev => prev.filter(log => log.id !== logId));
            alert('Registro eliminado');
        } catch (err) {
            alert('Error al eliminar');
        }
    };


    const addEmployee = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/employees', {
                name,
                daily_salary: parseFloat(salary),
                hire_date: hireDate,
                cedula,
                position,
                contract_type: contractType,
                payment_type: paymentType
            });
            setName('');
            setSalary('');
            setCedula('');
            setPosition('');
            setActiveTab('personal');
            fetchEmployees();
            alert('Empleado registrado con éxito');
        } catch (err) {
            alert('Error al agregar empleado');
        } finally {
            setLoading(false);
        }
    };

    const updateEmployee = async () => {
        if (!editEmployee) return;
        setLoading(true);
        try {
            await api.put(`/employees/${editEmployee.id}`, {
                name: editEmployee.name,
                daily_salary: parseFloat(editEmployee.daily_salary),
                hire_date: editEmployee.hire_date,
                cedula: editEmployee.cedula,
                position: editEmployee.position,
                contract_type: editEmployee.contract_type,
                payment_type: editEmployee.payment_type
            });
            setEditModal(false);
            fetchEmployees();
            alert('Empleado actualizado');
        } catch (err) {
            alert('Error al actualizar');
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
        // Get the settlement document HTML
        const printContent = document.getElementById('settlement-print');
        if (!printContent) {
            alert('Error: Documento no encontrado');
            return;
        }

        // Open a new window with just the document
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Liquidación - ${selectedEmployee?.name || 'Empleado'}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: "Times New Roman", Times, serif; 
                        font-size: 11pt; 
                        background: white; 
                        color: black; 
                        padding: 15mm;
                        line-height: 1.3;
                    }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                    td { border: 1px solid black; padding: 4px 8px; vertical-align: middle; }
                    .label { font-weight: bold; width: 130px; background: #f0f0f0; }
                    .header-box { 
                        text-align: center; 
                        font-weight: bold; 
                        font-size: 13pt; 
                        margin-bottom: 20px; 
                        border: 2px solid black; 
                        padding: 10px; 
                    }
                    .dots-line { border-bottom: 2px dotted black; height: 10px; margin: 15px 0; }
                    .signature-line { border-top: 1px solid black; width: 250px; padding-top: 5px; margin-top: 40px; }
                    @media print {
                        body { padding: 0; margin: 10mm; }
                    }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = () => {
            printWindow.print();
        };
    };


    // Calendar Logic
    const openCalendar = async (emp) => {
        setCalendarEmployee(emp);
        setSelectedDays([]);
        setCalendarMonth(new Date().getMonth());
        setCalendarYear(new Date().getFullYear());
        await fetchWorkedDays(emp.id);
        setCalendarModal(true);
    };

    const getMonthDays = (year, month) => {
        const days = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            days.push(date.toISOString().split('T')[0]);
        }

        return days;
    };

    const toggleDay = async (day) => {
        if (!day || !calendarEmployee) return;

        // Check if it's already in the database
        if (existingDays.includes(day)) {
            // Remove from database
            try {
                await api.delete(`/employees/${calendarEmployee.id}/worked-days/${day}`);
                setExistingDays(prev => prev.filter(d => d !== day));
            } catch (err) {
                alert('Error al eliminar día');
            }
        } else if (selectedDays.includes(day)) {
            // Just remove from local selection
            setSelectedDays(prev => prev.filter(d => d !== day));
        } else {
            // Add to local selection
            setSelectedDays(prev => [...prev, day]);
        }
    };

    const saveSelectedDays = async () => {
        if (!calendarEmployee || selectedDays.length === 0) return;
        setLoading(true);
        try {
            await api.post(`/employees/${calendarEmployee.id}/worked-days`, {
                dates: selectedDays,
                daily_rate: calendarEmployee.daily_salary
            });

            // Also create a work log entry for the payment record
            const sortedDays = [...selectedDays].sort();
            const totalPayment = calendarEmployee.daily_salary * selectedDays.length;
            await api.post('/employees/work-log', {
                employee_id: calendarEmployee.id,
                days_worked: selectedDays.length,
                period_start: sortedDays[0],
                period_end: sortedDays[sortedDays.length - 1],
                total_payment: totalPayment
            });

            alert(`Registrados ${selectedDays.length} días = ₡${totalPayment.toLocaleString()}`);
            setExistingDays(prev => [...prev, ...selectedDays]);
            setSelectedDays([]);
        } catch (err) {
            alert('Error al guardar días');
        } finally {
            setLoading(false);
        }
    };

    const prevMonth = () => {
        if (calendarMonth === 0) {
            setCalendarMonth(11);
            setCalendarYear(prev => prev - 1);
        } else {
            setCalendarMonth(prev => prev - 1);
        }
    };

    const nextMonth = () => {
        if (calendarMonth === 11) {
            setCalendarMonth(0);
            setCalendarYear(prev => prev + 1);
        } else {
            setCalendarMonth(prev => prev + 1);
        }
    };

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const activeEmployees = employees.filter(e => !e.exit_date);
    const settledEmployees = employees.filter(e => e.exit_date);

    const tabStyle = (isActive) => ({
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: isActive ? '700' : '400',
        background: isActive ? 'var(--accent)' : 'transparent',
        color: isActive ? '#000' : 'var(--text-secondary)',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease'
    });

    const calendarDays = getMonthDays(calendarYear, calendarMonth);
    const totalSelected = selectedDays.length;
    const totalExisting = existingDays.filter(d => {
        const date = new Date(d);
        return date.getMonth() === calendarMonth && date.getFullYear() === calendarYear;
    }).length;

    return (
        <div style={{ position: 'relative' }}>
            <div className="animate-fade">

                <h1 className="title-amber" style={{ marginBottom: '24px' }}>Gestión de Empleados</h1>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <button style={tabStyle(activeTab === 'personal')} onClick={() => setActiveTab('personal')}>
                        <Users size={18} /> Personal ({activeEmployees.length})
                    </button>
                    <button style={tabStyle(activeTab === 'registro')} onClick={() => setActiveTab('registro')}>
                        <UserPlus size={18} /> Nuevo
                    </button>
                    <button style={tabStyle(activeTab === 'historial')} onClick={() => setActiveTab('historial')}>
                        <Clock size={18} /> Historial
                    </button>
                    <button style={tabStyle(activeTab === 'liquidaciones')} onClick={() => setActiveTab('liquidaciones')}>
                        <FileText size={18} /> Liquidados ({settledEmployees.length})
                    </button>
                </div>

                {/* TAB: Personal Activo */}
                {activeTab === 'personal' && (
                    <div className="glass card">
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Users size={20} /> Personal Activo
                        </h3>
                        {activeEmployees.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                <p>No hay empleados activos.</p>
                                <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setActiveTab('registro')}>
                                    <UserPlus size={16} /> Registrar Empleado
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {activeEmployees.map(emp => (
                                    <div key={emp.id} className="glass" style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        display: 'grid',
                                        gridTemplateColumns: '1fr auto',
                                        alignItems: 'center',
                                        gap: '16px'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {emp.name}
                                                <button
                                                    onClick={() => { setEditEmployee({ ...emp }); setEditModal(true); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: '4px' }}
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                            </div>
                                            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                                                {emp.position} • Cédula: {emp.cedula || 'N/A'} • {emp.contract_type}
                                            </div>
                                            <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '4px' }}>
                                                Ingreso: {emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : 'Sin fecha'} •
                                                <strong style={{ color: 'var(--accent)' }}> ₡{Number(emp.daily_salary).toLocaleString()}/día</strong> •
                                                Pago: {emp.payment_type}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <button
                                                className="btn-primary"
                                                style={{ padding: '8px 16px', fontSize: '12px' }}
                                                onClick={() => openCalendar(emp)}
                                            >
                                                <Calendar size={14} /> Días Trabajados
                                            </button>
                                            <button
                                                className="glass"
                                                style={{ padding: '8px 16px', fontSize: '12px', color: 'var(--error)', cursor: 'pointer' }}
                                                onClick={() => handleCalculateSettlement(emp)}
                                            >
                                                Liquidar <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: Nuevo Registro */}
                {activeTab === 'registro' && (
                    <div className="glass card" style={{ maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <UserPlus size={20} /> Registrar Nuevo Empleado
                        </h3>
                        <form onSubmit={addEmployee}>
                            <input className="input-field" placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} required />
                            <input className="input-field" placeholder="Cédula" value={cedula} onChange={(e) => setCedula(e.target.value)} required />
                            <input className="input-field" placeholder="Cargo (ej: Cocinera, Salonero)" value={position} onChange={(e) => setPosition(e.target.value)} required />
                            <input className="input-field" type="number" placeholder="Salario diario (₡)" value={salary} onChange={(e) => setSalary(e.target.value)} required />

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '11px', opacity: 0.6, display: 'block', marginBottom: '4px' }}>Fecha de Ingreso</label>
                                <input type="date" className="input-field" style={{ margin: 0 }} value={hireDate} onChange={(e) => setHireDate(e.target.value)} required />
                            </div>

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
                                {loading ? <Loader2 className="animate-spin" /> : 'Registrar Empleado'}
                            </button>
                        </form>
                    </div>
                )}

                {/* TAB: Historial de Pagos */}
                {activeTab === 'historial' && (
                    <div className="glass card">
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={20} /> Historial de Pagos
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            Selecciona un empleado para ver su historial:
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                            {activeEmployees.map(emp => (
                                <button
                                    key={emp.id}
                                    className="glass"
                                    style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                                    onClick={() => fetchWorkLogs(emp.id)}
                                >
                                    {emp.name}
                                </button>
                            ))}
                        </div>
                        {workLogs.length > 0 && (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                            <th style={{ padding: '12px' }}>Período</th>
                                            <th style={{ padding: '12px' }}>Días</th>
                                            <th style={{ padding: '12px' }}>Monto</th>
                                            <th style={{ padding: '12px', width: '60px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {workLogs.map(log => (
                                            <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '12px' }}>
                                                    {new Date(log.period_start).toLocaleDateString()} - {new Date(log.period_end).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '12px' }}>{log.days_worked}</td>
                                                <td style={{ padding: '12px', fontWeight: '700', color: 'var(--accent)' }}>₡{Number(log.total_payment).toLocaleString()}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <button
                                                        onClick={() => deleteWorkLog(log.id)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: 'var(--error)',
                                                            padding: '4px',
                                                            borderRadius: '4px'
                                                        }}
                                                        title="Eliminar registro"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                )}

                {/* TAB: Liquidaciones */}
                {activeTab === 'liquidaciones' && (
                    <div className="glass card">
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileText size={20} /> Empleados Liquidados
                        </h3>
                        {settledEmployees.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
                                No hay liquidaciones registradas.
                            </p>
                        ) : (
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {settledEmployees.map(emp => (
                                    <div key={emp.id} className="glass" style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        display: 'grid',
                                        gridTemplateColumns: '1fr auto',
                                        alignItems: 'center',
                                        gap: '16px',
                                        opacity: 0.8
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '16px' }}>{emp.name}</div>
                                            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                                                {emp.position} • Cédula: {emp.cedula || 'N/A'}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>
                                                Liquidado: {new Date(emp.exit_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <button
                                            className="btn-primary"
                                            style={{ padding: '8px 16px', fontSize: '12px', background: 'var(--success)' }}
                                            onClick={() => handleCalculateSettlement(emp)}
                                        >
                                            <Printer size={14} /> Re-imprimir
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* End of animate-fade wrapper */}

            {/* Edit Employee Modal */}
            {editModal && editEmployee && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)'
                }}>
                    <div className="glass card" style={{ width: '90%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Edit3 size={20} /> Editar Empleado
                        </h3>
                        <input className="input-field" placeholder="Nombre" value={editEmployee.name} onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })} />
                        <input className="input-field" placeholder="Cédula" value={editEmployee.cedula || ''} onChange={(e) => setEditEmployee({ ...editEmployee, cedula: e.target.value })} />
                        <input className="input-field" placeholder="Cargo" value={editEmployee.position || ''} onChange={(e) => setEditEmployee({ ...editEmployee, position: e.target.value })} />
                        <input className="input-field" type="number" placeholder="Salario diario" value={editEmployee.daily_salary} onChange={(e) => setEditEmployee({ ...editEmployee, daily_salary: e.target.value })} />

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '11px', opacity: 0.6, display: 'block', marginBottom: '4px' }}>Fecha de Ingreso</label>
                            <input
                                type="date"
                                className="input-field"
                                style={{ margin: 0 }}
                                value={editEmployee.hire_date ? new Date(editEmployee.hire_date).toISOString().split('T')[0] : ''}
                                onChange={(e) => setEditEmployee({ ...editEmployee, hire_date: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '11px', opacity: 0.6, display: 'block', marginBottom: '4px' }}>Contrato</label>
                                <select className="input-field" style={{ margin: 0 }} value={editEmployee.contract_type || ''} onChange={(e) => setEditEmployee({ ...editEmployee, contract_type: e.target.value })}>
                                    <option>Tiempo Definido</option>
                                    <option>Tiempo Indefinido</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '11px', opacity: 0.6, display: 'block', marginBottom: '4px' }}>Pago</label>
                                <select className="input-field" style={{ margin: 0 }} value={editEmployee.payment_type || ''} onChange={(e) => setEditEmployee({ ...editEmployee, payment_type: e.target.value })}>
                                    <option>Semanal</option>
                                    <option>Quincenal</option>
                                    <option>Mensual</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="glass" style={{ flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer' }} onClick={() => setEditModal(false)}>Cancelar</button>
                            <button className="btn-primary" style={{ flex: 2 }} onClick={updateEmployee} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar Work Log Modal */}
            {calendarModal && calendarEmployee && (
                <div
                    onClick={(e) => e.target === e.currentTarget && setCalendarModal(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000,
                        display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
                        background: 'rgba(0,0,0,0.95)',
                        padding: '80px 16px 40px 16px',
                        overflowY: 'auto'
                    }}
                >
                    <div className="glass card" style={{
                        width: '100%',
                        maxWidth: '380px',
                        padding: '24px',
                        position: 'relative',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <button
                            onClick={() => setCalendarModal(false)}
                            style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>

                        <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px' }}>
                            <Calendar size={22} /> Días Trabajados
                        </h3>
                        <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '24px' }}>
                            {calendarEmployee.name} • ₡{Number(calendarEmployee.daily_salary).toLocaleString()}/día
                        </p>

                        {/* Month/Year Navigation */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <button onClick={prevMonth} className="glass" style={{ padding: '14px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
                                <ChevronLeft size={24} />
                            </button>
                            <div style={{ fontWeight: '700', fontSize: '18px', textAlign: 'center' }}>
                                {monthNames[calendarMonth]} {calendarYear}
                            </div>
                            <button onClick={nextMonth} className="glass" style={{ padding: '14px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
                                <ChevronRight size={24} />
                            </button>
                        </div>



                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '11px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--success)' }}></div>
                                <span>Registrado ({totalExisting})</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--accent)' }}></div>
                                <span>Nuevo ({totalSelected})</span>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '4px',
                            marginBottom: '20px'
                        }}>
                            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                                <div key={i} style={{ textAlign: 'center', fontSize: '11px', opacity: 0.5, padding: '8px 0' }}>
                                    {day}
                                </div>
                            ))}
                            {calendarDays.map((day, i) => {
                                if (!day) return <div key={`empty-${i}`} />;

                                const isExisting = existingDays.includes(day);
                                const isSelected = selectedDays.includes(day);
                                const dayNum = new Date(day).getDate();
                                const isFuture = new Date(day) > new Date();

                                return (
                                    <button
                                        key={day}
                                        onClick={() => !isFuture && toggleDay(day)}
                                        disabled={isFuture}
                                        style={{
                                            padding: '10px 0',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: isExisting ? 'var(--success)' : isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                                            color: (isExisting || isSelected) ? '#000' : isFuture ? 'rgba(255,255,255,0.2)' : '#fff',
                                            cursor: isFuture ? 'not-allowed' : 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        {dayNum}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Summary */}
                        <div className="glass" style={{ padding: '16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '12px', opacity: 0.6 }}>Días nuevos</div>
                                <div style={{ fontSize: '24px', fontWeight: '900' }}>{selectedDays.length}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '12px', opacity: 0.6 }}>Total a pagar</div>
                                <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent)' }}>
                                    ₡{(calendarEmployee.daily_salary * selectedDays.length).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="glass" style={{ flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer' }} onClick={() => setCalendarModal(false)}>
                                Cerrar
                            </button>
                            <button className="btn-primary" style={{ flex: 2 }} onClick={saveSelectedDays} disabled={loading || selectedDays.length === 0}>
                                {loading ? <Loader2 className="animate-spin" /> : 'Registrar Pago'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settlement Modal */}
            {settlementModal && settlementData && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)'
                }}>
                    <div className="glass card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 className="title-amber" style={{ marginBottom: '20px' }}>Liquidación Laboral</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', fontSize: '14px' }}>
                            <div>
                                <label style={{ opacity: 0.6, display: 'block', marginBottom: '4px' }}>Empleado</label>
                                <div style={{ fontWeight: '700' }}>{selectedEmployee.name}</div>
                            </div>
                            <div>
                                <label style={{ opacity: 0.6, display: 'block', marginBottom: '4px' }}>Fecha de Salida</label>
                                <input type="date" className="input-field" style={{ margin: 0 }} value={exitDate} onChange={(e) => setExitDate(e.target.value)} />
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
                            {!selectedEmployee.exit_date && (
                                <button className="btn-primary" style={{ flex: 1.5 }} onClick={finalizeSettlement}>Finalizar Salida</button>
                            )}
                            <button className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, var(--success), #00a844)' }} onClick={handlePrint}><Printer size={16} /> Imprimir</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settlement document for printing - positioned off-screen but rendered */}
            {settlementData && (
                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <SettlementDocument data={settlementData} />
                </div>
            )}
        </div>
    );
}




export default EmployeeManagement;
