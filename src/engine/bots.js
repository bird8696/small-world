import { COMPANIES } from '../data/companies'
import { useWorldStore } from '../store/worldStore'

let botTimer = null

// ── 봇 전략 ───────────────────────────────────────────────────

/** 트렌드 추종 — 이미 오른 건 더 사고, 이미 내린 건 더 판다 */
function trendBot(stocks) {
  COMPANIES.forEach(c => {
    const s = stocks[c.ticker]
    if (!s) return
    if      (s.changePct >  2.5) useWorldStore.getState().applyShock([{ ticker: c.ticker, impact:  0.4 }])
    else if (s.changePct < -2.5) useWorldStore.getState().applyShock([{ ticker: c.ticker, impact: -0.4 }])
  })
}

/** 역추세 — 과하게 떨어진 건 줍고, 과하게 오른 건 차익 실현 */
function contrarianBot(stocks) {
  COMPANIES.forEach(c => {
    const s = stocks[c.ticker]
    if (!s) return
    if      (s.changePct < -6) useWorldStore.getState().applyShock([{ ticker: c.ticker, impact:  0.7 }])
    else if (s.changePct >  6) useWorldStore.getState().applyShock([{ ticker: c.ticker, impact: -0.7 }])
  })
}

/** 인덱스 봇 — 시장 평균 대비 크게 벗어난 종목 조정 */
function indexBot(stocks) {
  const avgChg = COMPANIES.reduce((a, c) => a + (stocks[c.ticker]?.changePct ?? 0), 0) / COMPANIES.length
  COMPANIES.forEach(c => {
    const s = stocks[c.ticker]
    if (!s) return
    const diff = s.changePct - avgChg
    if      (diff < -4) useWorldStore.getState().applyShock([{ ticker: c.ticker, impact:  0.3 }])
    else if (diff >  4) useWorldStore.getState().applyShock([{ ticker: c.ticker, impact: -0.3 }])
  })
}

// ── 봇 루프 제어 ──────────────────────────────────────────────

/** 봇 시작 (5초 주기) */
export function startBots() {
  if (botTimer) return
  botTimer = setInterval(() => {
    const { stocks } = useWorldStore.getState()
    const roll = Math.random()
    if (roll < 0.45) trendBot(stocks)
    else if (roll < 0.75) contrarianBot(stocks)
    else indexBot(stocks)
  }, 5000)
}

/** 봇 종료 */
export function stopBots() {
  if (botTimer) {
    clearInterval(botTimer)
    botTimer = null
  }
}
