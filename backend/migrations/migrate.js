const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    port: Number(process.env.DB_PORT) || 3306,
    multipleStatements: true,
    ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: true } })
  });

  const migrationsDir = path.join(__dirname);
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Running migration: ${file}`);
    await connection.query(sql);
  }

  await connection.end();
  console.log('All migrations complete.');
}

runMigrations().catch(console.error);
