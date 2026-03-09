import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { sermonSummaries } from '../db/schema'
import { requireAuth } from '../middleware/auth'
import { generateSermonSummary, hasYouTubeCaptions, getYouTubeDuration } from '../lib/gemini'
import { kstDatetime } from '../lib/date'
import type { AppEnv } from '../types'

export const summaryRoute = new Hono<AppEnv>()

// YouTube videoId: 11자 (alphanumeric, hyphen, underscore)
const VALID_VIDEO_ID = /^[a-zA-Z0-9_-]{11}$/
// 주일예배 영상 최대 허용 길이 (1시간 10분 = 4200초)
const MAX_DURATION_SECONDS = 70 * 60

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
    // 요약이 없을 때 자막 존재 여부 + 영상 길이 확인
    const [hasCaptions, durationSeconds] = await Promise.all([
      hasYouTubeCaptions(videoId, c.env.YOUTUBE_API_KEY),
      getYouTubeDuration(videoId, c.env.YOUTUBE_API_KEY),
    ])
    const tooLong = durationSeconds > MAX_DURATION_SECONDS
    return c.json({ summary: null, hasCaptions, tooLong }, 200)
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

  // 영상 길이 체크 — 1시간 10분 초과 시 요약 거부
  const durationSeconds = await getYouTubeDuration(videoId, c.env.YOUTUBE_API_KEY)
  if (durationSeconds > MAX_DURATION_SECONDS) {
    return c.json({ error: '설교 영상 길이가 너무 길어 AI 요약을 생성할 수 없습니다.' }, 400)
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
