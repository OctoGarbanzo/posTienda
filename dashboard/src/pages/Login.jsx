import React, { useState } from 'react';
import axios from 'axios';
import { LogIn, Loader2 } from 'lucide-react';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/auth/login', { username, password });
            localStorage.setItem('token', response.data.token);
            onLogin(response.data.user);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div className="glass card animate-fade" style={{ width: '400px' }}>
                <h1 className="title-amber" style={{ textAlign: 'center' }}>Tiento Soda & Café</h1>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px' }}>Gestión de Negocio</p>

                {error && <div style={{ color: 'var(--error)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Usuario</label>
                    <input
                        className="input-field"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Ej: admin"
                    />

                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Contraseña</label>
                    <input
                        className="input-field"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />

                    <button className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
                        {loading ? 'Iniciando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
