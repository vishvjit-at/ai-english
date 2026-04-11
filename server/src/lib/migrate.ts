import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, '../../prisma/migrations')

export async function runMigrations() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()

    // Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) PRIMARY KEY,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      )
    `)

    // Get already applied migrations
    const { rows: applied } = await client.query(
      `SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`
    )
    const appliedNames = new Set(applied.map((r: { migration_name: string }) => r.migration_name))

    // Read and sort migration folders
    const folders = readdirSync(MIGRATIONS_DIR)
      .filter(f => !f.endsWith('.toml'))
      .sort()

    for (const folder of folders) {
      if (appliedNames.has(folder)) {
        console.log(`Migration already applied: ${folder}`)
        continue
      }

      const sqlPath = join(MIGRATIONS_DIR, folder, 'migration.sql')
      const sql = readFileSync(sqlPath, 'utf8')

      console.log(`Applying migration: ${folder}`)
      await client.query(sql)
      await client.query(
        `INSERT INTO "_prisma_migrations" (id, checksum, migration_name, finished_at, applied_steps_count)
         VALUES (gen_random_uuid()::text, 'manual', '${folder}', now(), 1)`
      )
      console.log(`Migration applied: ${folder}`)
    }

    console.log('All migrations up to date.')
  } finally {
    await client.end()
  }
}
