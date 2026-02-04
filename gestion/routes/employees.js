const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Add employee
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { name, daily_salary, hire_date } = req.body;
    try {
        const { data: employee, error } = await db
            .from('employees')
            .insert([{ name, daily_salary, hire_date }])
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, employeeId: employee.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar empleado' });
    }
});

// Register work log
router.post('/work-log', verifyToken, isAdmin, async (req, res) => {
    const { employee_id, days_worked, period_start, period_end, total_payment } = req.body;
    try {
        const { data: log, error } = await db
            .from('employee_work_logs')
            .insert([{ employee_id, days_worked, period_start, period_end, total_payment }])
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, logId: log.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar días trabajados' });
    }
});

// Register cesantía
router.post('/cesantias', verifyToken, isAdmin, async (req, res) => {
    const { employee_id, amount, date } = req.body;
    try {
        const { data: cesantia, error } = await db
            .from('cesantias')
            .insert([{ employee_id, amount, date }])
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, cesantiaId: cesantia.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar cesantía' });
    }
});

// List employees
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { data: employees, error } = await db
            .from('employees')
            .select('*');

        if (error) throw error;
        res.json(employees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar empleados' });
    }
});

// Get work logs for an employee
router.get('/:id/work-logs', verifyToken, isAdmin, async (req, res) => {
    try {
        const { data: logs, error } = await db
            .from('employee_work_logs')
            .select('*')
            .eq('employee_id', req.params.id)
            .order('period_end', { ascending: false });

        if (error) throw error;
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener registros de trabajo' });
    }
});

module.exports = router;
