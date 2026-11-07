import { pgTable, text, jsonb, timestamp, integer } from 'drizzle-orm/pg-core'
export const appConfig = pgTable('app_config', {
  id: text().primaryKey(),
  value: jsonb().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
export const sessions = pgTable('admin_sessions', {
  id: text().primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
})
export const attempts = pgTable('login_attempts', {
  id: text().primaryKey(),
  count: integer().notNull().default(0),
  resetAt: timestamp('reset_at').notNull(),
})
