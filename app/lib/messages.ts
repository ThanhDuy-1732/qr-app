import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const CSV_FILE = path.join(DATA_DIR, 'messages.csv')
const CSV_HEADER = '"id","name","message","timestamp"\n'

export interface Message {
  id: string
  name: string
  message: string
  timestamp: string
}

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, CSV_HEADER, 'utf-8')
  }
}

/** Escape a value for CSV: wrap in quotes, double any internal quotes */
function toCsvField(value: string): string {
  return `"${value.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`
}

/** Parse a single CSV line with proper quote handling */
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

export function getMessages(): Message[] {
  ensureDataFile()
  const content = fs.readFileSync(CSV_FILE, 'utf-8')
  const lines = content.trim().split('\n').slice(1) // skip header

  const messages = lines
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const fields = parseCsvLine(line)
      if (fields.length < 4) return null
      return {
        id: fields[0],
        name: fields[1],
        message: fields[2],
        timestamp: fields[3],
      } as Message
    })
    .filter(Boolean) as Message[]

  // Return newest first
  return messages.reverse()
}

export function saveMessage(name: string, message: string): void {
  ensureDataFile()
  const id = Date.now().toString()
  const timestamp = new Date().toISOString()
  const displayName = name.trim() || 'Ẩn danh'
  const line =
    [toCsvField(id), toCsvField(displayName), toCsvField(message.trim()), toCsvField(timestamp)].join(',') + '\n'
  fs.appendFileSync(CSV_FILE, line, 'utf-8')
}
