const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Add employee
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { name, daily_salary, hire_date, cedula, position, contract_type, payment_type } = req.body;
    try {
        const { data: employee, error } = await db
            .from('employees')
            .insert([{ name, daily_salary, hire_date, cedula, position, contract_type, payment_type }])
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, employeeId: employee.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar empleado' });
    }
});

// Register work log (legacy - keeps existing functionality)
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

// Delete a work log entry
router.delete('/work-log/:logId', verifyToken, isAdmin, async (req, res) => {
    try {
        const { logId } = req.params;

        // 1. Fetch the log to get employee_id and date range
        const { data: log, error: fetchError } = await db
            .from('employee_work_logs')
            .select('*')
            .eq('id', logId)
            .single();

        if (fetchError) throw fetchError;

        if (log) {
            // 2. Delete individual worked days in that range for that employee
            const { error: daysError } = await db
                .from('employee_worked_days')
                .delete()
                .eq('employee_id', log.employee_id)
                .gte('work_date', log.period_start)
                .lte('work_date', log.period_end);

            if (daysError) throw daysError;
        }

        // 3. Delete the log entry
        const { error } = await db
            .from('employee_work_logs')
            .delete()
            .eq('id', logId);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Delete work log error:', error);
        res.status(500).json({ error: 'Error al eliminar registro y sincronizar días' });
    }
});


// Get worked days for an employee (for calendar display)
router.get('/:id/worked-days', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { data: days, error } = await db
            .from('employee_worked_days')
            .select('*')
            .eq('employee_id', id)
            .order('work_date', { ascending: false });

        if (error) throw error;
        res.json(days);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener días trabajados' });
    }
});

// Save worked days (toggle on/off)
router.post('/:id/worked-days', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { dates, daily_rate } = req.body; // dates is an array of date strings

        // Get employee info
        const { data: employee, error: empError } = await db
            .from('employees')
            .select('daily_salary')
            .eq('id', id)
            .single();

        if (empError) throw empError;
        const rate = daily_rate || employee.daily_salary;

        // Insert each date (ignore duplicates)
        const inserts = dates.map(date => ({
            employee_id: parseInt(id),
            work_date: date,
            daily_rate: rate,
            status: 'pending'
        }));

        const { data, error } = await db
            .from('employee_worked_days')
            .upsert(inserts, { onConflict: 'employee_id,work_date', ignoreDuplicates: false })
            .select();

        if (error) throw error;
        res.json({ success: true, count: data.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar días trabajados' });
    }
});

// Delete a worked day
router.delete('/:id/worked-days/:date', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id, date } = req.params;
        const { error } = await db
            .from('employee_worked_days')
            .delete()
            .eq('employee_id', id)
            .eq('work_date', date);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar día' });
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

// Get work logs for a specific employee
router.get('/:id/work-logs', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { data: logs, error } = await db
            .from('employee_work_logs')
            .select('*')
            .eq('employee_id', id)
            .order('period_end', { ascending: false });

        if (error) throw error;
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener historial de pagos' });
    }
});


// Calculate settlement (Preview)
router.get('/:id/calculate-settlement', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { exit_date } = req.query;

        const { data: employee, error } = await db
            .from('employees')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        const entry = new Date(employee.hire_date);
        const exit = exit_date ? new Date(exit_date) : new Date();

        // Aguinaldo Calculation (December to November period)
        // For simplicity: calculate from hire or previous Dec 1st
        const currentYear = exit.getFullYear();
        let aguinaldoStart = new Date(currentYear - 1, 11, 1); // Dec 1st previous year
        if (entry > aguinaldoStart) aguinaldoStart = entry;

        const daysForAguinaldo = Math.ceil((exit - aguinaldoStart) / (1000 * 60 * 60 * 24));

        // Fetch work logs for the breakdown
        const { data: logs, error: lError } = await db
            .from('employee_work_logs')
            .select('period_end, total_payment')
            .eq('employee_id', id)
            .gte('period_end', aguinaldoStart.toISOString().split('T')[0])
            .lte('period_end', exit.toISOString().split('T')[0]);

        if (lError) throw lError;

        const breakdown = logs.reduce((acc, log) => {
            const date = new Date(log.period_end);
            const monthName = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
            acc[monthName] = (acc[monthName] || 0) + Number(log.total_payment);
            return acc;
        }, {});

        const aguinaldoTotal = Object.values(breakdown).reduce((a, b) => a + b, 0);
        const aguinaldo = aguinaldoTotal / 12;

        // Cesantía Calculation (simplified rules)
        // 3-6 months: 7 days
        // 6-12 months: 14 days
        // 1 year+: 19.5 days per year (approximate)
        const diffMs = exit - entry;
        const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);
        let cesantiaDays = 0;

        if (diffMonths >= 3 && diffMonths < 6) cesantiaDays = 7;
        else if (diffMonths >= 6 && diffMonths < 12) cesantiaDays = 14;
        else if (diffMonths >= 12) {
            cesantiaDays = (diffMs / (1000 * 60 * 60 * 24 * 365)) * 19.5;
        }

        const cesantia = employee.daily_salary * cesantiaDays;

        res.json({
            employee,
            aguinaldo: Math.round(aguinaldo * 100) / 100,
            aguinaldoTotal: Math.round(aguinaldoTotal * 100) / 100,
            breakdown,
            cesantia: Math.round(cesantia * 100) / 100,
            total: Math.round((aguinaldo + cesantia) * 100) / 100,
            dates: { entry, exit }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al calcular liquidación' });
    }
});

// Finalize settlement
router.post('/:id/settle', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { exit_date, aguinaldo, cesantia, total, notes } = req.body;
    try {
        // Update employee exit date
        await db.from('employees').update({ exit_date }).eq('id', id);

        // Record settlement
        const { data, error } = await db
            .from('settlements')
            .insert([{
                employee_id: id,
                aguinaldo_amount: aguinaldo,
                cesantia_amount: cesantia,
                total_amount: total,
                notes
            }])
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, settlementId: data.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al procesar liquidación' });
    }
});

// Update employee
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const { data, error } = await db
            .from('employees')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, employee: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar empleado' });
    }
});

module.exports = router;
