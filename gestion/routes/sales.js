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
        const { payment_method } = req.query;
        let query = db.from('sales').select('total_amount');

        if (payment_method) {
            query = query.eq('payment_method', payment_method);
        }

        const today = new Date().toISOString().split('T')[0];
        const { data: dailySales, error: dailyError } = await query
            .gte('created_at', `${today}T00:00:00Z`)
            .lte('created_at', `${today}T23:59:59Z`);

        if (dailyError) throw dailyError;

        // Monthly
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        let mQuery = db.from('sales').select('total_amount');
        if (payment_method) {
            mQuery = mQuery.eq('payment_method', payment_method);
        }

        const { data: monthlySales, error: monthlyError } = await mQuery
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

// Get most sold products
router.get('/stats/most-sold', verifyToken, isAdmin, async (req, res) => {
    try {
        // Query sale_items and group by product_name
        // Using raw SQL for efficient grouping in Supabase/Postgres
        const { data, error } = await db.rpc('get_most_sold_products');

        if (error) {
            // Fallback if RPC is not defined: aggregate in JS
            const { data: items, error: fetchError } = await db
                .from('sale_items')
                .select('product_name, quantity')
                .limit(1000);

            if (fetchError) throw fetchError;

            const summary = items.reduce((acc, item) => {
                acc[item.product_name] = (acc[item.product_name] || 0) + item.quantity;
                return acc;
            }, {});

            const sorted = Object.entries(summary)
                .map(([name, qty]) => ({ product_name: name, total_qty: qty }))
                .sort((a, b) => b.total_qty - a.total_qty)
                .slice(0, 10);

            return res.json(sorted);
        }

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener top productos' });
    }
});

// Get sales by category
router.get('/stats/by-category', verifyToken, isAdmin, async (req, res) => {
    try {
        // We need to join sale_items with products to get categories
        const { data: items, error } = await db
            .from('sale_items')
            .select(`
                quantity,
                price,
                products (category)
            `)
            .limit(2000);

        if (error) throw error;

        const summary = items.reduce((acc, item) => {
            const cat = item.products?.category || 'Sin Categoría';
            const total = item.quantity * item.price;
            if (!acc[cat]) acc[cat] = 0;
            acc[cat] += total;
            return acc;
        }, {});

        res.json(Object.entries(summary).map(([name, total]) => ({ category: name, total })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ventas por categoría' });
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
