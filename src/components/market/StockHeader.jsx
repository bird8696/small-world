import { useWorldStore } from '../../store/worldStore'
import { COMPANY_MAP } from '../../data/companies'
import { pctColor, pctStr, won } from '../../utils/format'

export default function StockHeader() {
  const selected = useWorldStore(s => s.selected)
  const s        = useWorldStore(s => s.stocks[selected] ?? {})
  const c        = COMPANY_MAP[selected] ?? {}

  return (
    <div style={{
      padding: '7px 14px', flexShrink: 0,
      background: 'var(--surface)',
      borderBottom: '0.5px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
        <span style={{ marginLeft: 6, fontSize: 9, color: 'var(--muted)' }}>
          {selected} · {c.sector}
        </span>
      </div>
      <span style={{ fontSize: 20, fontWeight: 600 }}>{won(s.price)}원</span>
      <div>
        <span style={{ color: pctColor(s.changePct), fontWeight: 600 }}>
          {pctStr(s.changePct)}
        </span>
        <span style={{ color: pctColor(s.change), marginLeft: 4, fontSize: 10 }}>
          ({(s.change ?? 0) >= 0 ? '+' : ''}{won(s.change)})
        </span>
      </div>
      <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--muted)' }}>
        거래량 {won(s.volume)}
      </span>
    </div>
  )
}
