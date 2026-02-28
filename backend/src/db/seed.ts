import 'dotenv/config'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { curriculum } from './schema'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})
const db = drizzle(client)

const CURRICULUM_DATA = [
  // 1권 터다지기 (1~6주)
  { id: 1, weekNumber: 1, volume: 1, lessonNumber: 1, title: '제자훈련이란 무엇인가', theme: '제자도의 의미', scripture: '마태복음 28:19-20', youtubeVideoId: null, requiredBook: '효과적인 간증' },
  { id: 2, weekNumber: 2, volume: 1, lessonNumber: 2, title: '구원의 확신', theme: '구원의 기초', scripture: '요한일서 5:11-13', youtubeVideoId: null, requiredBook: '말씀의 손' },
  { id: 3, weekNumber: 3, volume: 1, lessonNumber: 3, title: '기도의 확신', theme: '기도의 능력', scripture: '요한복음 16:24', youtubeVideoId: null, requiredBook: null },
  { id: 4, weekNumber: 4, volume: 1, lessonNumber: 4, title: '승리의 확신', theme: '승리의 삶', scripture: '고린도전서 10:13', youtubeVideoId: null, requiredBook: null },
  { id: 5, weekNumber: 5, volume: 1, lessonNumber: 5, title: '용서의 확신', theme: '용서와 회복', scripture: '요한일서 1:9', youtubeVideoId: null, requiredBook: null },
  { id: 6, weekNumber: 6, volume: 1, lessonNumber: 6, title: '인도의 확신', theme: '하나님의 인도', scripture: '잠언 3:5-6', youtubeVideoId: null, requiredBook: null },

  // 2권 구원의 진리 (7~20주)
  { id: 7, weekNumber: 7, volume: 2, lessonNumber: 1, title: '성경의 권위', theme: '성경의 신뢰성', scripture: '디모데후서 3:16-17', youtubeVideoId: null, requiredBook: '성경의 권위' },
  { id: 8, weekNumber: 8, volume: 2, lessonNumber: 2, title: '하나님', theme: '하나님의 속성', scripture: '시편 139:1-6', youtubeVideoId: null, requiredBook: null },
  { id: 9, weekNumber: 9, volume: 2, lessonNumber: 3, title: '예수 그리스도', theme: '그리스도의 사역', scripture: '요한복음 14:6', youtubeVideoId: null, requiredBook: '기독교의 기본진리' },
  { id: 10, weekNumber: 10, volume: 2, lessonNumber: 4, title: '성령', theme: '성령의 사역', scripture: '요한복음 14:16-17', youtubeVideoId: null, requiredBook: null },
  { id: 11, weekNumber: 11, volume: 2, lessonNumber: 5, title: '사탄', theme: '영적 전쟁', scripture: '베드로전서 5:8-9', youtubeVideoId: null, requiredBook: null },
  { id: 12, weekNumber: 12, volume: 2, lessonNumber: 6, title: '인간', theme: '인간의 본성', scripture: '로마서 3:23', youtubeVideoId: null, requiredBook: null },
  { id: 13, weekNumber: 13, volume: 2, lessonNumber: 7, title: '죄', theme: '죄의 본질', scripture: '이사야 59:2', youtubeVideoId: null, requiredBook: null },
  { id: 14, weekNumber: 14, volume: 2, lessonNumber: 8, title: '구원', theme: '구원의 의미', scripture: '에베소서 2:8-9', youtubeVideoId: null, requiredBook: null },
  { id: 15, weekNumber: 15, volume: 2, lessonNumber: 9, title: '믿음', theme: '믿음의 삶', scripture: '히브리서 11:1', youtubeVideoId: null, requiredBook: null },
  { id: 16, weekNumber: 16, volume: 2, lessonNumber: 10, title: '성화', theme: '거룩한 삶', scripture: '데살로니가전서 4:3', youtubeVideoId: null, requiredBook: null },
  { id: 17, weekNumber: 17, volume: 2, lessonNumber: 11, title: '교회', theme: '교회의 의미', scripture: '에베소서 4:11-13', youtubeVideoId: null, requiredBook: null },
  { id: 18, weekNumber: 18, volume: 2, lessonNumber: 12, title: '재림', theme: '주님의 재림', scripture: '데살로니가전서 4:16-17', youtubeVideoId: null, requiredBook: null },
  { id: 19, weekNumber: 19, volume: 2, lessonNumber: 13, title: '부활', theme: '부활의 소망', scripture: '고린도전서 15:20-22', youtubeVideoId: null, requiredBook: null },
  { id: 20, weekNumber: 20, volume: 2, lessonNumber: 14, title: '심판', theme: '최후의 심판', scripture: '히브리서 9:27', youtubeVideoId: null, requiredBook: null },

  // 3권 작은 예수 (21~32주)
  { id: 21, weekNumber: 21, volume: 3, lessonNumber: 1, title: '순종의 삶', theme: '순종의 축복', scripture: '사무엘상 15:22', youtubeVideoId: null, requiredBook: '위험한 순종' },
  { id: 22, weekNumber: 22, volume: 3, lessonNumber: 2, title: '섬김의 삶', theme: '섬김의 리더십', scripture: '마가복음 10:45', youtubeVideoId: null, requiredBook: '섬김의 혁명' },
  { id: 23, weekNumber: 23, volume: 3, lessonNumber: 3, title: '기도의 삶', theme: '기도의 깊이', scripture: '마태복음 6:6', youtubeVideoId: null, requiredBook: null },
  { id: 24, weekNumber: 24, volume: 3, lessonNumber: 4, title: '말씀의 삶', theme: '말씀 묵상', scripture: '시편 1:2-3', youtubeVideoId: null, requiredBook: null },
  { id: 25, weekNumber: 25, volume: 3, lessonNumber: 5, title: '전도의 삶', theme: '복음 전파', scripture: '사도행전 1:8', youtubeVideoId: null, requiredBook: null },
  { id: 26, weekNumber: 26, volume: 3, lessonNumber: 6, title: '교제의 삶', theme: '성도의 교제', scripture: '요한일서 1:7', youtubeVideoId: null, requiredBook: null },
  { id: 27, weekNumber: 27, volume: 3, lessonNumber: 7, title: '청지기의 삶', theme: '충성된 청지기', scripture: '고린도전서 4:2', youtubeVideoId: null, requiredBook: null },
  { id: 28, weekNumber: 28, volume: 3, lessonNumber: 8, title: '가정의 삶', theme: '신앙 가정', scripture: '에베소서 5:25', youtubeVideoId: null, requiredBook: null },
  { id: 29, weekNumber: 29, volume: 3, lessonNumber: 9, title: '직장의 삶', theme: '직장에서의 신앙', scripture: '골로새서 3:23', youtubeVideoId: null, requiredBook: null },
  { id: 30, weekNumber: 30, volume: 3, lessonNumber: 10, title: '사회의 삶', theme: '빛과 소금', scripture: '마태복음 5:13-16', youtubeVideoId: null, requiredBook: null },
  { id: 31, weekNumber: 31, volume: 3, lessonNumber: 11, title: '고난의 삶', theme: '고난과 성장', scripture: '로마서 5:3-5', youtubeVideoId: null, requiredBook: null },
  { id: 32, weekNumber: 32, volume: 3, lessonNumber: 12, title: '비전의 삶', theme: '비전과 사명', scripture: '빌립보서 3:14', youtubeVideoId: null, requiredBook: null },
]

async function seed() {
  console.log('Seeding curriculum data (32 weeks)...')

  for (const row of CURRICULUM_DATA) {
    await db.insert(curriculum).values(row)
      .onConflictDoUpdate({
        target: curriculum.weekNumber,
        set: {
          volume: row.volume,
          lessonNumber: row.lessonNumber,
          title: row.title,
          theme: row.theme,
          scripture: row.scripture,
          youtubeVideoId: row.youtubeVideoId,
          requiredBook: row.requiredBook,
        },
      })
  }

  console.log('Curriculum seeded (32 weeks)')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
