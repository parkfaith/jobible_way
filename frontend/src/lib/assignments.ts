// 제자훈련 주차별 과제물
// 사진으로 제공된 주차의 데이터를 입력, 나머지는 사진 제공 시 추가
export interface AssignmentItem {
  category: string
  content: string
}

// 과제물에서 성경읽기 범위 추출
export function getBibleReading(weekNumber: number): string | null {
  const items = ASSIGNMENTS[weekNumber]
  if (!items) return null
  const entry = items.find(i => i.category === '성경읽기')
  return entry?.content ?? null
}

// 과제물에서 독서 책 제목 추출
export function getBookTitle(weekNumber: number): string | null {
  const items = ASSIGNMENTS[weekNumber]
  if (!items) return null
  const entry = items.find(i => i.category === '독서')
  if (!entry) return null
  const match = entry.content.match(/["\u201C](.+?)["\u201D]/)
  return match?.[1] ?? null
}

export const ASSIGNMENTS: Record<number, AssignmentItem[]> = {
  2: [
    { category: '교재예습', content: '1권 2과 하나님과 매일 만나는 생활' },
    { category: '기도', content: '매일 30분 이상, 동일한 시간과 장소에서 해야 합니다.' },
    { category: 'Q.T', content: '(1) 매일 "날마다 솟는 샘물" 큐티\n(2) 창세기 28:10~22 "야곱이 하나님으로부터 받은 은혜"' },
    { category: '성구암송', content: '히브리서 4:16, 예레미야애가 3:22-23' },
    { category: '성경읽기', content: '창세기' },
    { category: '설교요약', content: '3/1 주일예배, 3/6 금요성령집회' },
    { category: '신앙일기', content: '매주 1회 기록' },
    { category: '생활숙제', content: '자신이 함께 고백하고 나누었던 간증문을 다시 한 번 정리해서 제출하도록 합니다. 그리고 그 간증문을 가족이나 이웃들에게 전하고 자신의 느낌을 기록해 오도록 합니다.' },
    { category: '전화연락', content: '두 사람 이상에게 전화 연락을 해서 기도제목을 나누고 어려움은 없는지 살피고 성도의 교제를 나눔으로 하나 됨을 확인합니다.' },
    { category: '기도후원자', content: '기도후원자에게 전화나 만남을 통해 기도제목을 알려주고 시험에 들지 않도록 기도를 부탁합니다.' },
  ],
  3: [
    { category: '교재예습', content: '1권 3과 경건의 시간' },
    { category: '기도', content: '매일 30분 이상, 동일한 시간과 장소에서 해야 합니다.' },
    { category: 'Q.T', content: '(1) 매일 "날마다 솟는 샘물" 큐티\n(2) 이사야 6:1-13 \'이사야의 경건 시간\'' },
    { category: '성구암송', content: '시편 1:1-2, 시편 119:105' },
    { category: '성경읽기', content: '마태복음' },
    { category: '독서', content: '앞으로 읽어야 할 책들을 미리 읽어두세요. (오리엔테이션 가이드 참고)' },
    { category: '설교요약', content: '3/8 주일예배, 3/13 금요성령집회' },
    { category: '신앙일기', content: '매주 1회 기록' },
    { category: '생활숙제', content: '일주일 동안의 자신의 삶을 점검하면서 매일의 스케줄(Time Table)을 기록하고 그동안 얼마나 많은 시간이 낭비되었는지를 점검하고 새로운 QT계획을 세워 오도록 한다.' },
    { category: '전화연락', content: '두 사람 이상에게 전화 연락을 해서 기도제목을 나누고 어려움은 없는지 살피고 성도의 교제를 나눔으로 하나 됨을 확인한다.' },
    { category: '기도후원자', content: '기도후원자에게 전화나 만남을 통해 기도제목을 알려주시고 시험에 들지 않도록 기도 부탁 할 것' },
  ],
  4: [
    { category: '교재예습', content: '1권 4과 살아 있고 활력 있는 말씀' },
    { category: '기도', content: '매일 30분 이상, 동일한 시간과 장소에서 해야 합니다.' },
    { category: 'Q.T', content: '(1) 매일 "날마다 솟는 샘물" 큐티\n(2) 마태복음 13:1-23 "씨 뿌리는 자의 비유" D형 큐티\n질문 갯수: 내용관찰 질문 2개 / 연구와 묵상 질문 2개' },
    { category: '성구암송', content: '로마서 1:16, 디모데후서 3:16' },
    { category: '성경읽기', content: '출애굽기' },
    { category: '독서', content: '"영성이 깊어지는 큐티" 읽고 독후감 제출 (A4 1장 분량)' },
    { category: '설교요약', content: '3/15 주일예배, 3/20 금요성령집회' },
    { category: '신앙일기', content: '매주 1회 기록' },
    { category: '생활숙제', content: '경건의 시간을 하면서 실제로 삶과 인격에 변화가 일어난 부분을 기록해 오도록 한다.' },
    { category: '전화연락', content: '두 사람 이상에게 전화 연락을 해서 기도제목을 나누고 어려움은 없는지 살피고 성도의 교제를 나눔으로 하나 됨을 확인한다.' },
    { category: '기도후원자', content: '기도후원자에게 전화나 만남을 통해 기도제목을 알려주시고 시험에 들지 않도록 기도 부탁 할 것' },
  ],
  5: [
    { category: '교재예습', content: '1권 5과 무엇이 바른 기도인가?' },
    { category: '기도', content: '매일 30분 이상, 동일한 시간과 장소에서 해야 합니다.' },
    { category: 'Q.T', content: '(1) 매일 "날마다 솟는 샘물" 큐티\n(2) 마태복음 20:17-28 "바른 기도란 무엇인가"' },
    { category: '성구암송', content: '빌립보서 4:6-7, 마태복음 6:6' },
    { category: '성경읽기', content: '마가복음' },
    { category: '독서', content: '앞으로 읽어야 할 책들을 미리 읽어두세요. (오리엔테이션 가이드 참고)' },
    { category: '설교요약', content: '3/22 주일예배, 3/27 금요성령집회' },
    { category: '신앙일기', content: '매주 1회 기록' },
    { category: '생활숙제', content: '한 주간 동안 하나님의 말씀으로 교훈과 책망과 바르게 함과 의로 교육함을 받은 것이 무엇이고 그러한 말씀에 순종하여 어떻게 생활했는지 구체적으로 기록해 오도록 한다.' },
    { category: '전화연락', content: '두 사람 이상에게 전화 연락을 해서 기도제목을 나누고 어려움은 없는지 살피고 성도의 교제를 나눔으로 하나 됨을 확인한다.' },
    { category: '기도후원자', content: '기도후원자에게 전화나 만남을 통해 기도제목을 알려주시고 시험에 들지 않도록 기도 부탁 할 것' },
  ],
  7: [
    { category: '교재예습', content: '2권 1과 \'성경의 권위\'' },
    { category: '기도', content: '매일 30분 이상, 동일한 시간과 장소에서 해야 합니다.' },
    { category: 'Q.T', content: '(1) 매일 "날마다 솟는 샘물" 큐티\n(2) 사무엘상 15:10-23 "사울 왕의 불순종"' },
    { category: '성구암송', content: '베드로후서 1장 21절, 여호수아 1장 8절' },
    { category: '성경읽기', content: '누가복음' },
    { category: '독서', content: '미비된 독서과제를 마무리하시거나 앞으로 읽어야 할 책을 미리 읽어두세요. (오리엔테이션 가이드 참고)' },
    { category: '설교요약', content: '4/5 주일예배, 4/10 금요성령집회' },
    { category: '신앙일기', content: '매주 1회 기록' },
    { category: '생활숙제', content: '지난 1권의 암송구절 시험을 봅니다. 다시 손으로 써가면서 외워봅시다.' },
    { category: '전화연락', content: '두 사람 이상에게 전화 연락을 해서 기도제목을 나누고 어려움은 없는지 살피고 성도의 교제를 나눔으로 하나 됨을 확인한다.' },
    { category: '기도후원자', content: '기도후원자에게 전화나 만남을 통해 감사함을 전하고 새로운 기도제목을 알려주시고 시험에 들지 않도록 기도 부탁하세요.' },
  ],
  8: [
    { category: '교재예습', content: '2권 2과 성경이 하나님의 말씀임을 어떻게 알 수 있는가?' },
    { category: '기도', content: '매일 30분 이상, 동일한 시간과 장소에서 해야 합니다.' },
    { category: 'Q.T', content: '(1) 매일 "날마다 솟는 샘물" 큐티\n(2) 창세기 50:15~21 "요셉이 체험한 하나님"' },
    { category: '성구암송', content: '로마서 11:36상, 예레미야 31:3하' },
    { category: '성경읽기', content: '민수기' },
    { category: '독서', content: '"성경의 권위" 읽고 독후감 제출' },
    { category: '설교요약', content: '4/12 주일예배, 4/17 금요성령집회' },
    { category: '신앙일기', content: '매주 1회 기록' },
    { category: '생활숙제', content: '한주간 동안 예수님처럼 말씀에 순종하는 삶을 살기 위해 특별히 실천해야 할 일이 무엇인가를 정하고 실천한 후 자신의 느낌을 적어 오도록 한다.' },
    { category: '전화연락', content: '두 사람 이상에게 전화 연락을 해서 기도제목을 나누고 어려움은 없는지 살피고 성도의 교제를 나눔으로 하나 됨을 확인한다.' },
    { category: '기도후원자', content: '기도후원자에게 전화나 만남을 통해 기도제목을 알려주시고 시험에 들지 않도록 기도 부탁 할 것' },
  ],
  6: [
    { category: '교재예습', content: '1권 6과 기도의 응답' },
    { category: '기도', content: '매일 30분 이상, 동일한 시간과 장소에서 해야 합니다.' },
    { category: 'Q.T', content: '(1) 매일 "날마다 솟는 샘물" 큐티\n(2) 열왕기상 18:41-46 "엘리야의 기도 응답"' },
    { category: '성구암송', content: '요한복음 15:7, 마태복음 7:11' },
    { category: '성경읽기', content: '레위기' },
    { category: '독서', content: '"무엇을 기도할까" 읽고 독후감 제출 (A4 1장 분량)' },
    { category: '설교요약', content: '3/29 주일예배, 4/3 고난주간 특별 밤 부흥성회' },
    { category: '신앙일기', content: '매주 1회 기록' },
    { category: '생활숙제', content: '지금까지 자신의 기도 생활의 문제점을 기록하고 한 주간을 지내면서 어떤 변화가 있었는지 기록해 오도록 한다. (좋은 이전에 자신의 기도가 달라진 정립이 있다면 그 경험을 기록해 오도록 한다.)' },
    { category: '전화연락', content: '두 사람 이상에게 전화 연락을 해서 기도제목을 나누고 어려움은 없는지 살피고 성도의 교제를 나눔으로 하나 됨을 확인한다.' },
    { category: '기도후원자', content: '기도후원자에게 전화나 만남을 통해 기도제목을 알려주시고 시험에 들지 않도록 기도 부탁 할 것' },
  ],
}
