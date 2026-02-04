require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('DEBUG: SUPABASE_URL length:', supabaseUrl ? supabaseUrl.length : 'NULL');
console.log('DEBUG: SUPABASE_KEY length:', supabaseKey ? supabaseKey.length : 'NULL');

const db = createClient(supabaseUrl || 'dummy', supabaseKey || 'dummy');

async function testRegistration() {
    console.log('--- Inspeccionando Columnas de Empleados ---');
    try {
        const { data, error } = await db
            .from('employees')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error al consultar:', error.message);
        } else {
            console.log('Columnas encontradas:', Object.keys(data[0] || {}));
            if (data[0] && 'cedula' in data[0]) {
                console.log('¡Éxito! La columna cedula existe.');
            } else {
                console.log('FALLO: La columna cedula NO existe.');
            }
        }
    } catch (err) {
        console.error('Error inesperado:', err.message);
    }
}

testRegistration();
