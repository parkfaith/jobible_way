// 제자훈련 주차별 과제물
// 사진으로 제공된 주차의 데이터를 입력, 나머지는 사진 제공 시 추가
export interface AssignmentItem {
  category: string
  content: string
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
}
