require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'supabase' });
});

// Import routes
const authRoutes = require('./routes/auth');
const salesRoutes = require('./routes/sales');
const expensesRoutes = require('./routes/expenses');
const employeeRoutes = require('./routes/employees');

app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/employees', employeeRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
