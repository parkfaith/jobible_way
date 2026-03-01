import { sqliteTable, text, integer, primaryKey, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  cohort: integer('cohort').default(2),
  startDate: text('start_date').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
})

export const curriculum = sqliteTable('curriculum', {
  id: integer('id').primaryKey(),
  weekNumber: integer('week_number').notNull().unique(),
  volume: integer('volume').notNull(),
  lessonNumber: integer('lesson_number').notNull(),
  title: text('title').notNull(),
  theme: text('theme'),
  scripture: text('scripture').notNull(),
  verseText: text('verse_text'),
  scripture2: text('scripture2'),
  verseText2: text('verse_text2'),
  youtubeVideoId: text('youtube_video_id'),
  requiredBook: text('required_book'),
})

export const sermonNotes = sqliteTable('sermon_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  weekNumber: integer('week_number').notNull(),
  service: text('service').notNull(),
  date: text('date').notNull(),
  preacher: text('preacher'),
  scripture: text('scripture'),
  content: text('content'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
}, (t) => [
  uniqueIndex('idx_sermon_user_week_service').on(t.userId, t.weekNumber, t.service),
])

export const oiaNotes = sqliteTable('oia_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  weekNumber: integer('week_number').notNull(),
  date: text('date').notNull(),
  scripture: text('scripture'),
  observation: text('observation'),
  interpretation: text('interpretation'),
  application: text('application'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
}, (t) => [
  index('idx_oia_user_week').on(t.userId, t.weekNumber),
])

export const diaryEntries = sqliteTable('diary_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  weekNumber: integer('week_number').notNull(),
  content: text('content'),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
}, (t) => [
  uniqueIndex('idx_diary_user_week').on(t.userId, t.weekNumber),
])

export const weeklyTasks = sqliteTable('weekly_tasks', {
  userId: text('user_id').notNull().references(() => users.id),
  weekNumber: integer('week_number').notNull(),
  verseMemorized: integer('verse_memorized').default(0),
  bookReportDone: integer('book_report_done').default(0),
  previewDone: integer('preview_done').default(0),
  sermonWatched: integer('sermon_watched').default(0),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
}, (t) => [
  primaryKey({ columns: [t.userId, t.weekNumber] }),
])

export const dailyChecks = sqliteTable('daily_checks', {
  userId: text('user_id').notNull().references(() => users.id),
  date: text('date').notNull(),
  prayer30min: integer('prayer_30min').default(0),
  qtDone: integer('qt_done').default(0),
  bibleReading: integer('bible_reading').default(0),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
}, (t) => [
  primaryKey({ columns: [t.userId, t.date] }),
])
