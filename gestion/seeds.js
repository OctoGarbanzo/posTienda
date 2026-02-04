const db = require('./db');
const bcrypt = require('bcryptjs');

function seed() {
    const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');

    if (!adminExists) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hashedPassword, 'admin');
        console.log('Initial admin created: admin / admin123');
    }

    const waiterExists = db.prepare('SELECT * FROM users WHERE username = ?').get('mesero');
    if (!waiterExists) {
        const hashedPassword = bcrypt.hashSync('mesero123', 10);
        db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('mesero', hashedPassword, 'waiter');
        console.log('Initial waiter created: mesero / mesero123');
    }
}

seed();
process.exit();
