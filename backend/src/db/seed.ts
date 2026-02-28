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
  { id: 1, weekNumber: 1, volume: 1, lessonNumber: 1, title: '제자훈련이란 무엇인가', theme: '제자도의 의미', scripture: '마태복음 28:19-20', verseText: '그러므로 너희는 가서 모든 민족을 제자로 삼아 아버지와 아들과 성령의 이름으로 세례를 베풀고 내가 너희에게 분부한 모든 것을 가르쳐 지키게 하라 볼지어다 내가 세상 끝날까지 너희와 항상 함께 있으리라 하시니라', youtubeVideoId: null, requiredBook: '효과적인 간증' },
  { id: 2, weekNumber: 2, volume: 1, lessonNumber: 2, title: '구원의 확신', theme: '구원의 기초', scripture: '요한일서 5:11-13', verseText: '또 증거는 이것이니 하나님이 우리에게 영생을 주신 것과 이 생명이 그의 아들 안에 있는 그것이니라 아들이 있는 자에게는 생명이 있고 하나님의 아들이 없는 자에게는 생명이 없느니라 내가 하나님의 아들의 이름을 믿는 너희에게 이것을 쓴 것은 너희로 하여금 너희에게 영생이 있음을 알게 하려 함이라', youtubeVideoId: null, requiredBook: '말씀의 손' },
  { id: 3, weekNumber: 3, volume: 1, lessonNumber: 3, title: '기도의 확신', theme: '기도의 능력', scripture: '요한복음 16:24', verseText: '지금까지는 너희가 내 이름으로 아무것도 구하지 아니하였으나 구하라 그리하면 받으리니 너희 기쁨이 충만하리라', youtubeVideoId: null, requiredBook: null },
  { id: 4, weekNumber: 4, volume: 1, lessonNumber: 4, title: '승리의 확신', theme: '승리의 삶', scripture: '고린도전서 10:13', verseText: '사람이 감당할 시험 밖에는 너희가 당한 것이 없나니 오직 하나님은 미쁘사 너희가 감당하지 못할 시험 당함을 허락하지 아니하시고 시험 당할 즈음에 또한 피할 길을 내사 너희로 능히 감당하게 하시느니라', youtubeVideoId: null, requiredBook: null },
  { id: 5, weekNumber: 5, volume: 1, lessonNumber: 5, title: '용서의 확신', theme: '용서와 회복', scripture: '요한일서 1:9', verseText: '만일 우리가 우리 죄를 자백하면 그는 미쁘시고 의로우사 우리 죄를 사하시며 우리를 모든 불의에서 깨끗하게 하실 것이요', youtubeVideoId: null, requiredBook: null },
  { id: 6, weekNumber: 6, volume: 1, lessonNumber: 6, title: '인도의 확신', theme: '하나님의 인도', scripture: '잠언 3:5-6', verseText: '너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라', youtubeVideoId: null, requiredBook: null },

  // 2권 구원의 진리 (7~20주)
  { id: 7, weekNumber: 7, volume: 2, lessonNumber: 1, title: '성경의 권위', theme: '성경의 신뢰성', scripture: '디모데후서 3:16-17', verseText: '모든 성경은 하나님의 감동으로 된 것으로 교훈과 책망과 바르게 함과 의로 교육하기에 유익하니 이는 하나님의 사람으로 온전하게 하며 모든 선한 일을 행할 능력을 갖추게 하려 함이라', youtubeVideoId: null, requiredBook: '성경의 권위' },
  { id: 8, weekNumber: 8, volume: 2, lessonNumber: 2, title: '하나님', theme: '하나님의 속성', scripture: '시편 139:1-6', verseText: '여호와여 주께서 나를 살펴 보셨으므로 나를 아시나이다 주께서 나의 앉고 일어섬을 아시고 멀리서도 나의 생각을 밝히 아시오며 나의 모든 길과 내가 눕는 것을 살펴 보셨으므로 나의 모든 행위를 익히 아시오니 여호와여 내 혀의 말을 알지 못하시는 것이 하나도 없으시니이다 주께서 나의 전후를 둘러싸시고 내 위에 손을 두셨나이다 이 지식이 내게 너무 기이하니 높아서 내가 능히 미치지 못하나이다', youtubeVideoId: null, requiredBook: null },
  { id: 9, weekNumber: 9, volume: 2, lessonNumber: 3, title: '예수 그리스도', theme: '그리스도의 사역', scripture: '요한복음 14:6', verseText: '예수께서 이르시되 내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라', youtubeVideoId: null, requiredBook: '기독교의 기본진리' },
  { id: 10, weekNumber: 10, volume: 2, lessonNumber: 4, title: '성령', theme: '성령의 사역', scripture: '요한복음 14:16-17', verseText: '내가 아버지께 구하겠으니 그가 또 다른 보혜사를 너희에게 주사 영원토록 너희와 함께 있게 하시리니 그는 진리의 영이라 세상은 능히 그를 받지 못하나니 이는 그를 보지도 못하고 알지도 못함이라 그러나 너희는 그를 아나니 그는 너희와 함께 거하심이요 또 너희 속에 계시겠음이라', youtubeVideoId: null, requiredBook: null },
  { id: 11, weekNumber: 11, volume: 2, lessonNumber: 5, title: '사탄', theme: '영적 전쟁', scripture: '베드로전서 5:8-9', verseText: '근신하라 깨어라 너희 대적 마귀가 우는 사자 같이 두루 다니며 삼킬 자를 찾나니 너희는 믿음을 굳건하게 하여 그를 대적하라 이는 세상에 있는 너희 형제들도 동일한 고난을 당하는 줄을 앎이라', youtubeVideoId: null, requiredBook: null },
  { id: 12, weekNumber: 12, volume: 2, lessonNumber: 6, title: '인간', theme: '인간의 본성', scripture: '로마서 3:23', verseText: '모든 사람이 죄를 범하였으매 하나님의 영광에 이르지 못하더니', youtubeVideoId: null, requiredBook: null },
  { id: 13, weekNumber: 13, volume: 2, lessonNumber: 7, title: '죄', theme: '죄의 본질', scripture: '이사야 59:2', verseText: '오직 너희 죄악이 너희와 너희 하나님 사이를 갈라 놓았고 너희 죄가 그의 얼굴을 가리어서 너희에게서 듣지 않으시게 함이니', youtubeVideoId: null, requiredBook: null },
  { id: 14, weekNumber: 14, volume: 2, lessonNumber: 8, title: '구원', theme: '구원의 의미', scripture: '에베소서 2:8-9', verseText: '너희는 그 은혜에 의하여 믿음으로 말미암아 구원을 받았으니 이것은 너희에게서 난 것이 아니요 하나님의 선물이라 행위에서 난 것이 아니니 이는 누구든지 자랑하지 못하게 함이라', youtubeVideoId: null, requiredBook: null },
  { id: 15, weekNumber: 15, volume: 2, lessonNumber: 9, title: '믿음', theme: '믿음의 삶', scripture: '히브리서 11:1', verseText: '믿음은 바라는 것들의 실상이요 보이지 않는 것들의 증거니', youtubeVideoId: null, requiredBook: null },
  { id: 16, weekNumber: 16, volume: 2, lessonNumber: 10, title: '성화', theme: '거룩한 삶', scripture: '데살로니가전서 4:3', verseText: '하나님의 뜻은 이것이니 너희의 거룩함이라 곧 음란을 버리고', youtubeVideoId: null, requiredBook: null },
  { id: 17, weekNumber: 17, volume: 2, lessonNumber: 11, title: '교회', theme: '교회의 의미', scripture: '에베소서 4:11-13', verseText: '그가 어떤 사람은 사도로 어떤 사람은 선지자로 어떤 사람은 복음 전하는 자로 어떤 사람은 목사와 교사로 삼으셨으니 이는 성도를 온전하게 하며 봉사의 일을 하게 하며 그리스도의 몸을 세우려 하심이라 우리가 다 하나님의 아들을 믿는 것과 아는 일에 하나가 되어 온전한 사람을 이루어 그리스도의 장성한 분량이 충만한 데까지 이르리니', youtubeVideoId: null, requiredBook: null },
  { id: 18, weekNumber: 18, volume: 2, lessonNumber: 12, title: '재림', theme: '주님의 재림', scripture: '데살로니가전서 4:16-17', verseText: '주께서 호령과 천사장의 소리와 하나님의 나팔 소리로 친히 하늘로부터 강림하시리니 그리스도 안에서 죽은 자들이 먼저 일어나고 그 후에 우리 살아 남은 자들도 그들과 함께 구름 속으로 끌어 올려 공중에서 주를 영접하게 되리니 그리하여 우리가 항상 주와 함께 있으리라', youtubeVideoId: null, requiredBook: null },
  { id: 19, weekNumber: 19, volume: 2, lessonNumber: 13, title: '부활', theme: '부활의 소망', scripture: '고린도전서 15:20-22', verseText: '그러나 이제 그리스도께서 죽은 자 가운데서 다시 살아나사 잠자는 자들의 첫 열매가 되셨도다 사망이 한 사람으로 말미암았으니 죽은 자의 부활도 한 사람으로 말미암는도다 아담 안에서 모든 사람이 죽은 것 같이 그리스도 안에서 모든 사람이 삶을 얻으리라', youtubeVideoId: null, requiredBook: null },
  { id: 20, weekNumber: 20, volume: 2, lessonNumber: 14, title: '심판', theme: '최후의 심판', scripture: '히브리서 9:27', verseText: '한번 죽는 것은 사람에게 정해진 것이요 그 후에는 심판이 있으리니', youtubeVideoId: null, requiredBook: null },

  // 3권 작은 예수 (21~32주)
  { id: 21, weekNumber: 21, volume: 3, lessonNumber: 1, title: '순종의 삶', theme: '순종의 축복', scripture: '사무엘상 15:22', verseText: '사무엘이 이르되 여호와께서 번제와 다른 제사를 그의 목소리를 청종하는 것을 좋아하심 같이 좋아하시겠나이까 순종이 제사보다 낫고 듣는 것이 숫양의 기름보다 나으니', youtubeVideoId: null, requiredBook: '위험한 순종' },
  { id: 22, weekNumber: 22, volume: 3, lessonNumber: 2, title: '섬김의 삶', theme: '섬김의 리더십', scripture: '마가복음 10:45', verseText: '인자가 온 것은 섬김을 받으려 함이 아니라 도리어 섬기려 하고 자기 목숨을 많은 사람의 대속물로 주려 함이니라', youtubeVideoId: null, requiredBook: '섬김의 혁명' },
  { id: 23, weekNumber: 23, volume: 3, lessonNumber: 3, title: '기도의 삶', theme: '기도의 깊이', scripture: '마태복음 6:6', verseText: '너는 기도할 때에 네 골방에 들어가 문을 닫고 은밀한 중에 계신 네 아버지께 기도하라 은밀한 중에 보시는 네 아버지께서 갚으시리라', youtubeVideoId: null, requiredBook: null },
  { id: 24, weekNumber: 24, volume: 3, lessonNumber: 4, title: '말씀의 삶', theme: '말씀 묵상', scripture: '시편 1:2-3', verseText: '오직 여호와의 율법을 즐거워하여 그의 율법을 주야로 묵상하는도다 그는 시냇가에 심은 나무가 철을 따라 열매를 맺으며 그 잎사귀가 마르지 아니함 같으니 그가 하는 모든 일이 다 형통하리로다', youtubeVideoId: null, requiredBook: null },
  { id: 25, weekNumber: 25, volume: 3, lessonNumber: 5, title: '전도의 삶', theme: '복음 전파', scripture: '사도행전 1:8', verseText: '오직 성령이 너희에게 임하시면 너희가 권능을 받고 예루살렘과 온 유대와 사마리아와 땅 끝까지 이르러 내 증인이 되리라 하시니라', youtubeVideoId: null, requiredBook: null },
  { id: 26, weekNumber: 26, volume: 3, lessonNumber: 6, title: '교제의 삶', theme: '성도의 교제', scripture: '요한일서 1:7', verseText: '그가 빛 가운데 계신 것 같이 우리도 빛 가운데 행하면 우리가 서로 사귐이 있고 그 아들 예수의 피가 우리를 모든 죄에서 깨끗하게 하실 것이요', youtubeVideoId: null, requiredBook: null },
  { id: 27, weekNumber: 27, volume: 3, lessonNumber: 7, title: '청지기의 삶', theme: '충성된 청지기', scripture: '고린도전서 4:2', verseText: '그러므로 맡은 자들에게 구할 것은 충성이니라', youtubeVideoId: null, requiredBook: null },
  { id: 28, weekNumber: 28, volume: 3, lessonNumber: 8, title: '가정의 삶', theme: '신앙 가정', scripture: '에베소서 5:25', verseText: '남편들아 아내 사랑하기를 그리스도께서 교회를 사랑하시고 그 교회를 위하여 자신을 주심 같이 하라', youtubeVideoId: null, requiredBook: null },
  { id: 29, weekNumber: 29, volume: 3, lessonNumber: 9, title: '직장의 삶', theme: '직장에서의 신앙', scripture: '골로새서 3:23', verseText: '무슨 일을 하든지 마음을 다하여 주께 하듯 하고 사람에게 하듯 하지 말라', youtubeVideoId: null, requiredBook: null },
  { id: 30, weekNumber: 30, volume: 3, lessonNumber: 10, title: '사회의 삶', theme: '빛과 소금', scripture: '마태복음 5:13-16', verseText: '너희는 세상의 소금이니 소금이 만일 그 맛을 잃으면 무엇으로 짜게 하리요 후에는 아무 쓸 데 없어 다만 밖에 버려져 사람에게 밟힐 뿐이니라 너희는 세상의 빛이라 산 위에 있는 동네가 숨겨지지 못할 것이요 사람이 등불을 켜서 말 아래에 두지 아니하고 등경 위에 두나니 이러므로 집 안 모든 사람에게 비치느니라 이같이 너희 빛이 사람 앞에 비치게 하여 그들로 너희 착한 행실을 보고 하늘에 계신 너희 아버지께 영광을 돌리게 하라', youtubeVideoId: null, requiredBook: null },
  { id: 31, weekNumber: 31, volume: 3, lessonNumber: 11, title: '고난의 삶', theme: '고난과 성장', scripture: '로마서 5:3-5', verseText: '다만 이뿐 아니라 우리가 환난 중에도 즐거워하나니 이는 환난은 인내를 인내는 연단을 연단은 소망을 이루는 줄 앎이로다 소망이 우리를 부끄럽게 하지 아니함은 우리에게 주신 성령으로 말미암아 하나님의 사랑이 우리 마음에 부은 바 됨이니', youtubeVideoId: null, requiredBook: null },
  { id: 32, weekNumber: 32, volume: 3, lessonNumber: 12, title: '비전의 삶', theme: '비전과 사명', scripture: '빌립보서 3:14', verseText: '푯대를 향하여 그리스도 예수 안에서 하나님이 위에서 부르신 부름의 상을 위하여 달려가노라', youtubeVideoId: null, requiredBook: null },
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
          verseText: row.verseText,
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
