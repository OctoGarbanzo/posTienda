const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Register a sale
router.post('/', verifyToken, async (req, res) => {
    const { items, total_amount, payment_method } = req.body;
    const userId = req.user.id;

    try {
        // First insert the sale
        const { data: sale, error: saleError } = await db
            .from('sales')
            .insert([{ total_amount, payment_method, user_id: userId }])
            .select()
            .single();

        if (saleError) throw saleError;

        const saleId = sale.id;

        // Prepare items for batch insert
        const saleItems = items.map(item => ({
            sale_id: saleId,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price
        }));

        const { error: itemsError } = await db
            .from('sale_items')
            .insert(saleItems);

        if (itemsError) throw itemsError;

        res.json({ success: true, saleId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar la venta' });
    }
});

// Get sales totals (Admin only)
router.get('/totals', verifyToken, isAdmin, async (req, res) => {
    try {
        // Totals via Postgres queries
        // Daily
        const today = new Date().toISOString().split('T')[0];
        const { data: dailySales, error: dailyError } = await db
            .from('sales')
            .select('total_amount')
            .gte('created_at', `${today}T00:00:00Z`)
            .lte('created_at', `${today}T23:59:59Z`);

        if (dailyError) throw dailyError;

        // Monthly
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { data: monthlySales, error: monthlyError } = await db
            .from('sales')
            .select('total_amount')
            .gte('created_at', firstDayOfMonth);

        if (monthlyError) throw monthlyError;

        const dailyTotal = dailySales.reduce((acc, s) => acc + Number(s.total_amount), 0);
        const monthlyTotal = monthlySales.reduce((acc, s) => acc + Number(s.total_amount), 0);

        res.json({
            daily: dailyTotal,
            monthly: monthlyTotal
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener totales' });
    }
});

// List sales
router.get('/', verifyToken, async (req, res) => {
    try {
        const { data: sales, error } = await db
            .from('sales')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        res.json(sales);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar ventas' });
    }
});

// List products
router.get('/products', verifyToken, async (req, res) => {
    try {
        const { data: products, error } = await db
            .from('products')
            .select('*')
            .order('category')
            .order('title');

        if (error) throw error;
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar productos' });
    }
});

module.exports = router;
