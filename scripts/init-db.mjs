import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function init() {
  console.log("Creating messages table if not exists...");
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      author TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log("Table created successfully!");
}

init().catch(console.error);
