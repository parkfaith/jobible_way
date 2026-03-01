import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import type { AppEnv } from '../types'

// 플레이리스트 ID
const PLAYLISTS = {
  sunday: 'PLQttQhLeyIgkpKgwDwG4s37fbYth12Djv',   // 주일예배
  friday: 'PLQttQhLeyIgkoH-l-0qjRUNQ3GI2k9qhC',   // 금요성령집회
} as const

// 제자훈련 1주차 시작일 (일요일) — UTC 기반 문자열 연산으로 시간대 무관하게 처리
const WEEK1_YEAR = 2026
const WEEK1_MONTH = 3
const WEEK1_DAY = 1

export const sermonRoute = new Hono<AppEnv>()

// GET /api/weeks/:weekNumber/sermon/:service — 플레이리스트에서 해당 주차 설교 영상 조회
sermonRoute.get('/:service', requireAuth, async (c) => {
  const weekNumber = parseInt(c.req.param('weekNumber'))
  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 32) {
    return c.json({ error: 'Invalid week number' }, 400)
  }
  const service = c.req.param('service') as 'sunday' | 'friday'
  if (!['sunday', 'friday'].includes(service)) {
    return c.json({ error: 'Invalid service type' }, 400)
  }

  const apiKey = c.env.YOUTUBE_API_KEY
  const playlistId = PLAYLISTS[service]

  // 해당 주차의 날짜 범위 계산 (일~토)
  const { sundayDate, fridayDate } = getWeekDates(weekNumber)
  const targetDate = service === 'sunday' ? sundayDate : fridayDate

  try {
    // 플레이리스트에서 최근 영상 가져오기 (최대 50개)
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId,
      maxResults: '50',
      key: apiKey,
    })

    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`)
    if (!res.ok) {
      const text = await res.text()
      console.error('YouTube API 오류:', res.status, text)
      return c.json({ error: 'YouTube API 오류' }, 502)
    }

    const data = await res.json() as {
      items: Array<{
        snippet: {
          title: string
          publishedAt: string
          resourceId: { videoId: string }
          thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } }
        }
      }>
    }

    // 제목에서 날짜를 파싱하여 해당 주차 날짜와 매칭
    const sermons = data.items
      .map((item) => {
        const meta = parseSermonTitle(item.snippet.title)
        if (!meta) return null
        const thumb = item.snippet.thumbnails.high?.url
          ?? item.snippet.thumbnails.medium?.url
          ?? item.snippet.thumbnails.default?.url
          ?? ''
        return {
          videoId: item.snippet.resourceId.videoId,
          title: meta.title,
          date: meta.date,
          preacher: meta.preacher,
          scripture: meta.scripture,
          service,
          thumbnail: thumb,
        }
      })
      .filter((s): s is NonNullable<typeof s> => s !== null && s.date === targetDate)

    return c.json(sermons)
  } catch (err) {
    console.error('설교 검색 오류:', err)
    return c.json({ error: '설교 검색 실패' }, 500)
  }
})

/**
 * 주차 번호로 해당 주의 주일(일요일)과 금요일 날짜를 계산한다.
 * 1주차 시작: 2026-03-01 (일요일)
 * 각 주차: 일요일 ~ 토요일
 * UTC Date 사용 — 시간대에 무관하게 정확한 날짜 계산
 */
function getWeekDates(weekNumber: number) {
  // UTC 기준으로 날짜를 생성하여 시간대 영향 제거
  const start = new Date(Date.UTC(WEEK1_YEAR, WEEK1_MONTH - 1, WEEK1_DAY))
  start.setUTCDate(start.getUTCDate() + (weekNumber - 1) * 7)

  const sunday = new Date(start)
  const friday = new Date(start)
  friday.setUTCDate(friday.getUTCDate() + 5) // 일요일 기준 같은 주 금요일

  const format = (d: Date) => {
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  return {
    sundayDate: format(sunday),
    fridayDate: format(friday),
  }
}

/**
 * 영상 제목에서 설교 메타데이터를 파싱한다.
 * 제목 패턴: "26.3.1. 주일예배ㅣ하나님의 뜻 vs 사람의 뜻ㅣ마태복음 26:47-56ㅣ장세호 담임목사"
 */
function parseSermonTitle(title: string) {
  const dateMatch = title.match(/^(\d{2,4})\.(\d{1,2})\.(\d{1,2})\.?\s*/)
  if (!dateMatch) return null

  const yearRaw = parseInt(dateMatch[1])
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw
  const month = dateMatch[2].padStart(2, '0')
  const day = dateMatch[3].padStart(2, '0')
  const date = `${year}-${month}-${day}`

  const rest = title.replace(dateMatch[0], '')
  const parts = rest.split(/[ㅣ|]/).map((s) => s.trim()).filter(Boolean)

  return {
    date,
    title: parts[1] ?? '',
    preacher: parts[3] ?? '',
    scripture: parts[2] ?? '',
  }
}
