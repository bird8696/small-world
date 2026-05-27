// 숫자 포맷 유틸 — 앱 전체에서 공유

/** 등락률 색상 — 양수 초록, 음수 빨강 */
export const pctColor = v => (v ?? 0) >= 0 ? '#22c55e' : '#ef4444'

/** 등락률 문자열 — "+1.23%" / "-0.45%" */
export const pctStr = v => {
  const n = v ?? 0
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

/** 원화 풀포맷 — "87,400" */
export const won = n => Math.round(n ?? 0).toLocaleString('ko-KR')

/** 원화 축약 — "8.7만" / "1.2억" */
export const shortWon = v => {
  const n = Math.abs(v ?? 0)
  if (n >= 100_000_000) return `${(v / 100_000_000).toFixed(1)}억`
  if (n >= 10_000)      return `${(v / 10_000).toFixed(1)}만`
  return won(v)
}

/** 타임스탬프 → HH:MM:SS */
export const timeStr = () =>
  new Date().toLocaleTimeString('ko-KR', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
