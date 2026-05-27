# 🌐 작은 세상 거래소 (Small World Exchange)

> 살아있는 가상 경제 시뮬레이터 — 주식 시장부터 시작해 점진적으로 확장하는 웹 기반 경제 세계

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase)](https://supabase.com)
[![Claude API](https://img.shields.io/badge/Claude-AI%20News-D97706)](https://anthropic.com)

---

## 📖 프로젝트 소개

**작은 세상 거래소**는 브라우저에서 동작하는 실시간 경제 시뮬레이터입니다.

단순한 랜덤 가격 변동이 아닌, **AI가 뉴스를 생성하고 그 뉴스가 시장에 충격을 주는** 구조로 설계되었습니다. 유저가 주식을 매수하면 실제로 가격이 오르고, 그 변화가 다른 유저에게 실시간으로 전달됩니다.

궁극적으로는 주식 시장을 시작으로 통화, 기업, 노동, 정부, 무역까지 **6개 경제 레이어**가 유기적으로 연결된 완전한 가상 경제 생태계를 목표로 합니다.

---

## ✨ 현재 구현된 기능 (Phase 1)

### 📈 주식 시장 엔진

- 8개 가상 기업 실시간 주가 시뮬레이션 (2초 틱)
- 랜덤워크 + 뉴스 충격 + 잔류 모멘텀 감쇠 가격 모델
- AI 봇 3종 (트렌드 추종 / 역추세 / 인덱스)

### 🤖 AI 뉴스 시스템

- Claude API가 현재 시장 상황을 인식해 현실적인 금융 뉴스 자동 생성
- 뉴스 카테고리별 가격 충격 (실적 / 인수합병 / 규제 / 스캔들 등)
- 심각도 분류 (low / medium / high / extreme)
- extreme 뉴스 발생 시 상단 속보 배너 표시

### 📊 차트 & 분석

- 캔들스틱 차트 (시가 · 고가 · 저가 · 종가)
- MA5 / MA20 이동평균선 오버레이
- 타임프레임 선택 (1분 / 5분 / 15분)
- 거래량 차트
- 워치리스트 스파크라인

### 🏦 거래 시스템

- 매수 / 매도 패널 완전 분리 (HTS 스타일)
- 시장가 / 지정가 주문 유형
- 10% / 25% / 50% / 100% 수량 퀵 버튼
- 평균단가 · 평가손익 · 실현손익 실시간 계산
- 호가창 (매수 · 매도 잔량)
- 실시간 체결 내역 스트림

### 👥 멀티유저

- Supabase Auth 기반 로그인 / 회원가입
- 유저별 독립 계좌 (현금 + 보유종목 DB 저장)
- 유저 매매 → `market_shocks` 발행 → 전체 클라이언트 실시간 반영
- 대량 매수 시 가격 상승, 대량 매도 시 가격 하락 (실제 수급 반영)

### 🎛️ 시장 지표

- 세계 지수 (전체 종목 평균 등락 기반)
- 공포 · 탐욕 지수 (0 ~ 100)

---

## 🗺️ 전체 로드맵

```
Phase 1  ██████████  주식 시장          ← 현재
Phase 2  ░░░░░░░░░░  통화 & 중앙은행
Phase 3  ░░░░░░░░░░  기업 & 실물경제
Phase 4  ░░░░░░░░░░  노동 & 시민
Phase 5  ░░░░░░░░░░  정부 & 세금
Phase 6  ░░░░░░░░░░  국제 무역
```

### Phase 2 — 통화 & 중앙은행

- 기준금리 결정 시스템 (AI 시나리오 생성)
- 인플레이션 지수 (CPI) 도입
- 금리 인상 → 주식 밸류에이션 압박 → 성장주 하락
- 양적완화 / 긴축 이벤트

### Phase 3 — 기업 & 실물경제

- 기업별 분기 실적 발표 사이클
- 산업별 공급망 시스템
- M&A · 기업 파산 이벤트
- 기술 혁신 사이클

### Phase 4 — 노동 & 시민

- NPC 시민 에이전트 (계층별 소비 패턴)
- 고용률 → 소비 → 기업 매출 연동
- 임금 상승 압박 → 기업 이익 감소

### Phase 5 — 정부 & 세금

- 법인세율 조정 → 기업 순이익 직접 영향
- 방산 / R&D 예산 정책 이벤트
- 선거 이벤트 → 정책 불확실성 → 변동성 확대

### Phase 6 — 국제 무역

- 원/달러 환율 실시간 시뮬레이션
- 수출 기업 / 수입 의존 기업 환율 영향 차별화
- 관세 이벤트 · 글로벌 경기 지수

---

## 🏢 가상 기업 목록

| 티커 | 기업명       | 섹터   | 특성                                      |
| ---- | ------------ | ------ | ----------------------------------------- |
| NOVA | 노바시스템즈 | 반도체 | AI 반도체 수혜주. 빅테크 계약 이벤트 빈번 |
| ARCO | 아르코에너지 | 에너지 | 유가 민감. 신재생 정책에 따라 극단 등락   |
| BIOM | 바이오메드   | 바이오 | FDA 임상 결과로 극단 변동 가능            |
| TREK | 트렉물류     | 물류   | 경기 민감. 소비 둔화 시 실적 직격탄       |
| MIRA | 미라금융     | 금융   | 금리 환경 민감                            |
| VOLT | 볼트모터스   | 전기차 | 보조금 정책으로 ±20% 가능                 |
| GAIA | 가이아푸드   | 식품   | 방어주. 경기침체기 상대적 안전            |
| AXIS | 액시스디펜스 | 방산   | 지정학 리스크 · 국방 예산 증액에 반응     |

---

## ⚙️ 가격 결정 메커니즘

```
newPrice = price × (1 + drift + momentumEffect)

drift          = randomWalk(±vol)      // 종목별 변동성
momentumEffect = momentum × 0.30      // 뉴스 충격 잔여 30% 반영
momentum       = momentum × 0.55      // 매 틱 45% 감쇠

[뉴스 충격 시]
price    += price × impact × 0.60     // 즉시 60% 반영
momentum += impact × 0.40             // 잔류 모멘텀 40%

[유저 매매 시]
impact = (거래금액 / 시가총액) × 방향 × 5.0
```

---

## 🛠️ 기술 스택

| 분류      | 기술                                    |
| --------- | --------------------------------------- |
| Frontend  | React 18, Vite 5                        |
| 차트      | Recharts                                |
| 상태관리  | Zustand                                 |
| AI 뉴스   | Anthropic Claude API                    |
| 인증 / DB | Supabase (Auth + PostgreSQL + Realtime) |
| 스타일    | CSS Variables (다크 테마)               |

---

## 🚀 시작하기

### 1. 설치

```bash
git clone https://github.com/bird8696/small-world.git
cd small-world
pnpm install
```

### 2. 환경변수 설정

`.env` 파일을 프로젝트 루트에 생성:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Supabase 스키마 설정

Supabase SQL Editor에서 아래 실행:

```sql
create table profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  cash bigint default 10000000,
  created_at timestamptz default now()
);

create table holdings (
  user_id uuid references profiles(id) on delete cascade,
  ticker text,
  qty integer not null default 0,
  avg_cost bigint not null default 0,
  primary key (user_id, ticker)
);

create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  ticker text not null,
  side text not null check (side in ('buy','sell')),
  qty integer not null,
  price bigint not null,
  created_at timestamptz default now()
);

create table market_shocks (
  id uuid default gen_random_uuid() primary key,
  ticker text not null,
  impact float8 not null,
  username text,
  created_at timestamptz default now()
);
```

### 4. 실행

```bash
pnpm dev
```

---

## 📝 업데이트 내역

자세한 내용은 [CHANGELOG.md](./CHANGELOG.md)를 참고하세요.

---

## 📄 라이선스

MIT License
