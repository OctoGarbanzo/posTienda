import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import EmployeeManagement from '../components/EmployeeManagement';
import ExpenseManagement from '../components/ExpenseManagement';
import { ChevronLeft } from 'lucide-react';

function AdminPanel({ user, onLogout }) {
    const location = useLocation();

    return (
        <div className="dashboard-container">
            <aside className="sidebar glass">
                <Link to="/" className="btn-primary" style={{ backgroundColor: 'transparent', color: 'var(--accent)', marginBottom: '32px', padding: '0' }}>
                    <ChevronLeft size={20} /> Volver
                </Link>
                <h2 className="title-amber">Admin</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link to="/admin/employees" className="btn-primary" style={{ backgroundColor: location.pathname.includes('employees') ? 'var(--accent)' : 'transparent', color: location.pathname.includes('employees') ? '#000' : 'var(--text-secondary)', justifyContent: 'flex-start' }}>
                        Empleados
                    </Link>
                    <Link to="/admin/expenses" className="btn-primary" style={{ backgroundColor: location.pathname.includes('expenses') ? 'var(--accent)' : 'transparent', color: location.pathname.includes('expenses') ? '#000' : 'var(--text-secondary)', justifyContent: 'flex-start' }}>
                        Gastos
                    </Link>
                </nav>
            </aside>

            <main className="main-content">
                <Routes>
                    <Route path="employees" element={<EmployeeManagement />} />
                    <Route path="expenses" element={<ExpenseManagement />} />
                    <Route path="*" element={
                        <div className="animate-fade">
                            <h1 className="title-amber">Panel de Administración</h1>
                            <p>Selecciona una opción del menú lateral para gestionar los recursos del negocio.</p>
                        </div>
                    } />
                </Routes>
            </main>
        </div>
    );
}

export default AdminPanel;
