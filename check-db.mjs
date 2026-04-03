import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';

// Load env
const envFile = '/home/ubuntu/.user_env';
let dbUrl = '';
try {
  const content = readFileSync(envFile, 'utf8');
  const match = content.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
  if (match) dbUrl = match[1];
} catch (e) {}

if (!dbUrl) {
  // Try from process env
  dbUrl = process.env.DATABASE_URL || '';
}

if (!dbUrl) {
  console.error('No DATABASE_URL found');
  process.exit(1);
}

console.log('Connecting to DB...');
const conn = await createConnection(dbUrl);
const [rows] = await conn.query('DESCRIBE game_profiles');
console.log('game_profiles columns:');
rows.forEach(r => console.log(' -', r.Field, ':', r.Type, r.Null === 'NO' ? 'NOT NULL' : 'NULL'));
await conn.end();
