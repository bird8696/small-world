// 작은 세상 — 가상 기업 목록
// vol: 종목별 변동성 계수 (높을수록 가격 변동 큼)
// color: 차트/UI에서 종목 대표 색상

export const COMPANIES = [
  {
    ticker:    'NOVA',
    name:      '노바시스템즈',
    sector:    '반도체',
    basePrice: 87400,
    vol:       0.018,
    color:     '#4E9EE8',
  },
  {
    ticker:    'ARCO',
    name:      '아르코에너지',
    sector:    '에너지',
    basePrice: 31600,
    vol:       0.022,
    color:     '#E87A4E',
  },
  {
    ticker:    'BIOM',
    name:      '바이오메드',
    sector:    '바이오',
    basePrice: 126500,
    vol:       0.025,
    color:     '#4EE8A0',
  },
  {
    ticker:    'TREK',
    name:      '트렉물류',
    sector:    '물류',
    basePrice: 44800,
    vol:       0.015,
    color:     '#E8C94E',
  },
  {
    ticker:    'MIRA',
    name:      '미라금융',
    sector:    '금융',
    basePrice: 68200,
    vol:       0.012,
    color:     '#4EE8D5',
  },
  {
    ticker:    'VOLT',
    name:      '볼트모터스',
    sector:    '전기차',
    basePrice: 193000,
    vol:       0.030,
    color:     '#B04EE8',
  },
  {
    ticker:    'GAIA',
    name:      '가이아푸드',
    sector:    '식품',
    basePrice: 28500,
    vol:       0.010,
    color:     '#E8A14E',
  },
  {
    ticker:    'AXIS',
    name:      '액시스디펜스',
    sector:    '방산',
    basePrice: 53700,
    vol:       0.016,
    color:     '#4E7EE8',
  },
]

// 빠른 조회용 맵
export const COMPANY_MAP = Object.fromEntries(
  COMPANIES.map(c => [c.ticker, c])
)
