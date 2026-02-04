const db = require('./db');
const fs = require('fs');
const path = require('path');

async function migrateProducts() {
    try {
        const productsPath = path.join(__dirname, '../products.json');
        if (!fs.existsSync(productsPath)) {
            console.error('products.json not found');
            return;
        }

        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

        const formattedProducts = productsData.products.map(p => ({
            id: p.id,
            title: p.title,
            price: parseFloat(p.price),
            description: p.description || '',
            category: p.category || 'Otros',
            media_url: (p.media && p.media.length > 0) ? p.media[0].url : null
        }));

        console.log(`Starting migration of ${formattedProducts.length} products to Supabase...`);

        const { data, error } = await db
            .from('products')
            .upsert(formattedProducts, { onConflict: 'id' });

        if (error) throw error;

        console.log(`Successfully migrated products.`);
    } catch (error) {
        console.error('Error migrating products:', error);
    }
}

migrateProducts();
