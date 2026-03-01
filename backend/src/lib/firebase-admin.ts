import * as jose from 'jose'

// Firebase 공개 키 캐시 (Workers 인스턴스 내 메모리 캐시)
let cachedKeys: jose.JSONWebKeySet | null = null
let cacheExpiry = 0

// Google의 공개 키를 가져와서 Firebase ID 토큰 서명을 검증
async function getFirebasePublicKeys(): Promise<jose.JSONWebKeySet> {
  const now = Date.now()
  if (cachedKeys && now < cacheExpiry) {
    return cachedKeys
  }

  const res = await fetch(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  )
  if (!res.ok) {
    throw new Error('Firebase 공개 키를 가져올 수 없습니다')
  }

  cachedKeys = await res.json() as jose.JSONWebKeySet
  // Cache-Control 헤더에서 max-age 추출, 기본 1시간
  const cacheControl = res.headers.get('Cache-Control') ?? ''
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/)
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1]) * 1000 : 3600_000
  cacheExpiry = now + maxAge

  return cachedKeys
}

// Firebase ID 토큰 검증 후 uid 반환
export async function verifyFirebaseToken(token: string, projectId: string): Promise<string> {
  const jwks = await getFirebasePublicKeys()
  const keySet = jose.createLocalJWKSet(jwks)

  const { payload } = await jose.jwtVerify(token, keySet, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  })

  const uid = payload.sub
  if (!uid) {
    throw new Error('토큰에 uid(sub)가 없습니다')
  }

  return uid
}
