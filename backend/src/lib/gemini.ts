// Gemini API를 사용한 YouTube 설교 영상 요약 (streaming 방식)

const MODEL = 'gemini-3-flash-preview'
const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent`

const SUMMARY_PROMPT = `다음 설교 영상을 분석하여 한국어로 요약해주세요:

## 핵심 메시지
(설교의 핵심 주제를 2-3문장으로 요약)

## 주요 포인트
- (설교에서 강조한 핵심 포인트 3-5개를 불릿으로 정리)

## 성경 해석
(설교에서 다룬 성경 본문의 해석을 간결하게 정리)

## 삶의 적용
(설교 내용을 일상에 어떻게 적용할 수 있는지 2-3가지)

간결하고 명확하게 작성하되, 설교의 핵심을 놓치지 않도록 해주세요.`

export interface GeminiSummaryResult {
  summary: string
  model: string
}

export async function generateSermonSummary(
  videoId: string,
  apiKey: string,
): Promise<GeminiSummaryResult> {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`

  // streaming 방식 (alt=sse)으로 호출하여 타임아웃 방지
  const response = await fetch(`${GEMINI_API_URL}?alt=sse&key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { file_data: { file_uri: youtubeUrl } },
            { text: SUMMARY_PROMPT },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }),
    signal: AbortSignal.timeout(180000), // 3분 (streaming이라 넉넉하게)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini API 오류:', response.status, errorText.substring(0, 200))
    throw new Error(`Gemini API 오류: ${response.status}`)
  }

  // SSE 스트림에서 텍스트 조각들을 수집
  const reader = response.body?.getReader()
  if (!reader) throw new Error('응답 스트림을 읽을 수 없습니다')

  const decoder = new TextDecoder()
  const textParts: string[] = []
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const jsonStr = line.slice(6).trim()
      if (!jsonStr) continue

      try {
        const chunk = JSON.parse(jsonStr) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> }
          }>
        }
        const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) textParts.push(text)
      } catch {
        // JSON 파싱 실패한 라인은 무시
      }
    }
  }

  const summary = textParts.join('')
  if (!summary) {
    throw new Error('Gemini API 응답에서 요약 텍스트를 찾을 수 없습니다')
  }

  return { summary, model: MODEL }
}

// YouTube 영상의 자막(자동생성 포함) 존재 여부 확인
export async function hasYouTubeCaptions(
  videoId: string,
  youtubeApiKey: string,
): Promise<boolean> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&part=snippet&key=${youtubeApiKey}`,
  )
  if (!res.ok) return false
  const data = (await res.json()) as { items?: Array<unknown> }
  return (data.items?.length ?? 0) > 0
}

// YouTube 영상 길이(초) 조회
export async function getYouTubeDuration(
  videoId: string,
  youtubeApiKey: string,
): Promise<number> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${youtubeApiKey}`,
  )
  if (!res.ok) return 0
  const data = (await res.json()) as {
    items?: Array<{ contentDetails?: { duration?: string } }>
  }
  const duration = data.items?.[0]?.contentDetails?.duration
  if (!duration) return 0
  return parseISO8601Duration(duration)
}

// ISO 8601 duration (PT1H10M30S) → 초 변환
function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')
  return hours * 3600 + minutes * 60 + seconds
}
