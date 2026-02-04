const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Add an expense (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { category, amount, description, date } = req.body;

    try {
        const { data: expense, error } = await db
            .from('expenses')
            .insert([{ category, amount, description, date }])
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, expenseId: expense.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el gasto' });
    }
});

// List expenses (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { data: expenses, error } = await db
            .from('expenses')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        res.json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar gastos' });
    }
});

module.exports = router;
