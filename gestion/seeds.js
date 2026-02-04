require('dotenv').config();
const db = require('./db'); // This is the Supabase client
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seed() {
    console.log('Starting seed process for Supabase...');

    // 1. Initial Users
    const { data: users, error: userError } = await db.from('users').select('*');
    if (userError) {
        console.error('Error fetching users (Table probably missing?):', userError.message);
    } else {
        const adminExists = users.some(u => u.username === 'admin');
        if (!adminExists) {
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            const { error } = await db.from('users').insert([
                { username: 'admin', password: hashedPassword, role: 'admin' }
            ]);
            if (error) console.error('Error creating admin:', error.message);
            else console.log('Initial admin created: admin / admin123');
        }

        const waiterExists = users.some(u => u.username === 'mesero');
        if (!waiterExists) {
            const hashedPassword = bcrypt.hashSync('mesero123', 10);
            await db.from('users').insert([
                { username: 'mesero', password: hashedPassword, role: 'waiter' }
            ]);
            console.log('Initial waiter created: mesero / mesero123');
        }

        const waiter1Exists = users.some(u => u.username === 'mesero1');
        if (!waiter1Exists) {
            const hashedPassword = bcrypt.hashSync('tiento2026', 10);
            const { error } = await db.from('users').insert([
                { username: 'mesero1', password: hashedPassword, role: 'waiter' }
            ]);
            if (error) console.error('Error creating waiter1:', error.message);
            else console.log('New waiter created: mesero1 / tiento2026');
        }
    }

    // 2. Products from products.json
    try {
        const productsPath = path.join(__dirname, '../products.json');
        if (fs.existsSync(productsPath)) {
            const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
            const products = data.products;

            console.log(`Found ${products.length} products. Seeding...`);

            const productsToInsert = products.map(p => ({
                id: p.id,
                title: p.title,
                price: parseFloat(p.price),
                description: p.description || '',
                category: p.category,
                media_url: (p.media && p.media.length > 0) ? p.media[0].url : null
            }));

            // Using upsert to prevent duplicates and update existing
            const { error: pError } = await db.from('products').upsert(productsToInsert, { onConflict: 'id' });

            if (pError) console.error('Error seeding products:', pError.message);
            else console.log(`Successfully seeded/updated ${products.length} products.`);
        } else {
            console.log('products.json not found at', productsPath);
        }
    } catch (err) {
        console.error('Error in product seeding phase:', err.message);
    }

    console.log('Seed process finished.');
    process.exit(0);
}

seed();
