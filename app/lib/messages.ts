import { neon } from '@neondatabase/serverless'

export interface Message {
  id: string
  author: string
  text: string
  createdAt: string
}

export async function getMessages(): Promise<Message[]> {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    // Order by created_at descending (newest first)
    const rows = await sql`SELECT * FROM messages ORDER BY created_at DESC`
    
    return rows.map((row) => ({
      id: row.id,
      author: row.author,
      text: row.text,
      createdAt: new Date(row.created_at).toISOString(),
    }))
  } catch (error) {
    console.error("Failed to fetch messages from Neon DB:", error)
    return []
  }
}

export async function saveMessage(author: string, text: string): Promise<void> {
  const sql = neon(process.env.DATABASE_URL!)
  const id = crypto.randomUUID()
  
  await sql`
    INSERT INTO messages (id, author, text)
    VALUES (${id}, ${author}, ${text})
  `
}
