import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
try {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS \`session_options\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`sessionCode\` varchar(10) NOT NULL,
      \`hostProfileId\` int NOT NULL,
      \`skinsEnabled\` boolean NOT NULL DEFAULT false,
      \`extensionPackIds\` varchar(500) NOT NULL DEFAULT '[]',
      \`playerSkins\` varchar(2000) NOT NULL DEFAULT '{}',
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT \`session_options_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`session_options_sessionCode_unique\` UNIQUE(\`sessionCode\`)
    )
  `);
  console.log('Table session_options created successfully');
} catch (e) {
  console.error('Error:', e.message);
}
await conn.end();
