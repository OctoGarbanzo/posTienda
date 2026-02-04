const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'tiento-secret-key-2026';

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const { data: user, error } = await db
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;
