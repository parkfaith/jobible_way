import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { sermonSummaries } from '../db/schema'
import { requireAuth } from '../middleware/auth'
import { generateSermonSummary, hasYouTubeCaptions } from '../lib/gemini'
import { kstDatetime } from '../lib/date'
import type { AppEnv } from '../types'

export const summaryRoute = new Hono<AppEnv>()

// YouTube videoId: 11자 (alphanumeric, hyphen, underscore)
const VALID_VIDEO_ID = /^[a-zA-Z0-9_-]{11}$/

// GET /api/summaries/:videoId — 기존 요약 조회
summaryRoute.get('/:videoId', requireAuth, async (c) => {
  const db = c.get('db')
  const videoId = c.req.param('videoId')

  if (!videoId || !VALID_VIDEO_ID.test(videoId)) {
    return c.json({ error: 'Invalid videoId' }, 400)
  }

  const [existing] = await db
    .select()
    .from(sermonSummaries)
    .where(eq(sermonSummaries.videoId, videoId))
    .limit(1)

  if (!existing) {
    // 요약이 없을 때 자막 존재 여부 확인 (자막 없으면 요약 생성 불가)
    const hasCaptions = await hasYouTubeCaptions(videoId, c.env.YOUTUBE_API_KEY)
    return c.json({ summary: null, hasCaptions }, 200)
  }

  return c.json(existing)
})

// POST /api/summaries/:videoId — 요약 생성 (없을 때만 Gemini 호출)
summaryRoute.post('/:videoId', requireAuth, async (c) => {
  const db = c.get('db')
  const videoId = c.req.param('videoId')

  if (!videoId || !VALID_VIDEO_ID.test(videoId)) {
    return c.json({ error: 'Invalid videoId' }, 400)
  }

  // 이미 존재하면 기존 것 반환 (경합 조건 방지)
  const [existing] = await db
    .select()
    .from(sermonSummaries)
    .where(eq(sermonSummaries.videoId, videoId))
    .limit(1)

  if (existing) {
    return c.json(existing)
  }

  try {
    const result = await generateSermonSummary(videoId, c.env.GEMINI_API_KEY)

    const [row] = await db
      .insert(sermonSummaries)
      .values({
        videoId,
        summary: result.summary,
        model: result.model,
        createdAt: kstDatetime(),
      })
      .returning()

    return c.json(row, 201)
  } catch (err) {
    console.error('설교 요약 생성 실패:', err)
    const message = err instanceof Error ? err.message : '요약 생성 실패'
    const status = message.includes('Gemini API 오류') ? 502 : 500
    return c.json({ error: message }, status)
  }
})
