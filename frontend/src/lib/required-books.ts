// 제자훈련 진도별 필독서 및 참고도서
// 과 번호는 (권-과) 형식, weekNumber 기준으로 매핑
export interface BookInfo {
  title: string
  author: string
  publisher: string
  note?: string // '소책자', '5-6장' 등
}

export const REQUIRED_BOOKS: Record<number, BookInfo[]> = {
  // 1권: 제자 훈련의 터다지기
  1: [
    { title: '효과적인 간증: 간증문 작성법', author: '데이브 도슨', publisher: '네비게이토', note: '소책자' },
  ],
  2: [
    { title: '늘 급한 일로 쫓기는 삶', author: '찰스 험멜', publisher: 'IVP', note: '소책자' },
  ],
  3: [
    { title: '영성이 깊어지는 QT', author: '송원준', publisher: '두란노' },
  ],
  4: [
    { title: '말씀의 손 예화', author: '', publisher: '네비게이토', note: '소책자' },
  ],
  5: [
    { title: '무엇을 기도할까', author: '옥한흠', publisher: '국제제자훈련원' },
  ],
  6: [
    { title: '당신의 기도가 응답 받지 못하는 이유를 아십니까', author: '워렌 위어스비', publisher: '나침반' },
  ],
  // 2권: 아무도 흔들 수 없는 나의 구원
  7: [
    { title: '성경의 권위', author: '존 스토트', publisher: 'IVP' },
  ],
  8: [
    { title: '안아주심', author: '옥한흠', publisher: '국제제자훈련원' },
  ],
  9: [
    { title: '오직 한 길', author: '브리안 메이든', publisher: 'IVP', note: '소책자' },
  ],
  10: [
    { title: '삼위 하나님과의 사귐', author: '대럴 존슨', publisher: 'IVP' },
  ],
  11: [
    { title: '기독교의 기본진리', author: '존 스토트', publisher: '생명의 말씀사', note: '5-6장' },
  ],
  12: [
    { title: '예수가 선택한 십자가', author: '맥스 루카도', publisher: '두란노' },
  ],
  13: [
    { title: '부활의 증거', author: '노르만 앤더슨', publisher: 'IVP', note: '소책자' },
  ],
  14: [
    { title: '성령 세례와 충만', author: '존 스토트', publisher: 'IVP' },
  ],
  15: [
    { title: '거듭남', author: '존 파이퍼', publisher: '두란노' },
  ],
  16: [
    { title: '이보다 좋은 복이 없다', author: '옥한흠', publisher: '국제제자훈련원' },
  ],
  17: [
    { title: '구원이란 무엇인가', author: '김세윤', publisher: '두란노' },
  ],
  18: [
    { title: '성령에 속한 사람', author: '이동원', publisher: '규장' },
  ],
  19: [
    { title: '예수님처럼', author: '맥스 루케이도', publisher: '복 있는 사람' },
  ],
  20: [
    { title: '종말, 종말, 종말', author: '스티븐 트래비스', publisher: 'IVP' },
  ],
  // 3권: 작은 예수가 되라
  21: [
    { title: '위대한 순종', author: '케이 워렌', publisher: '국제제자훈련원' },
  ],
  22: [
    { title: '섬김의 혁명', author: '빌 하이벨스', publisher: '두란노' },
  ],
  23: [
    { title: '두려움 없이 전하라', author: '윌리엄 페이', publisher: '국제제자훈련원' },
  ],
  24: [
    { title: '은혜로운 말', author: '케롤 메이홀', publisher: '네비게이토', note: '소책자' },
  ],
  25: [
    { title: '평범 이상의 삶', author: '존 오트버그', publisher: '사랑플러스' },
  ],
  26: [
    { title: '남/거룩 vs. 유혹', author: '브루스 윌킨슨', publisher: '디모데' },
    { title: '여/여자라서 받는 유혹', author: '메리 애슈크로포트', publisher: '사랑플러스', note: '소책자' },
  ],
  27: [
    { title: '예수 믿는 가정 무엇이 다른가', author: '옥한흠', publisher: '국제제자훈련원' },
  ],
  28: [
    { title: '고통에는 뜻이 있다', author: '옥한흠', publisher: '국제제자훈련원' },
  ],
  29: [
    { title: '내 마음 그리스도의 집', author: '로버트 멍어', publisher: 'IVP', note: '소책자' },
  ],
  30: [
    { title: '파인애플 스토리', author: '나침반', publisher: '나침반' },
  ],
  31: [
    { title: '시험이 없는 신앙생활은 없다', author: '옥한흠', publisher: '국제제자훈련원' },
  ],
  32: [
    { title: '5가지 사랑의 언어', author: '게리 채프먼', publisher: '생명의 말씀사' },
  ],
}
