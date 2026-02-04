import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'

function App() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!user ? <Login onLogin={login} /> : <Navigate to="/" />} />
                <Route path="/" element={user ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/login" />} />
                <Route path="/admin/*" element={user && user.role === 'admin' ? <AdminPanel user={user} onLogout={logout} /> : <Navigate to="/" />} />
            </Routes>
        </Router>
    )
}

export default App
