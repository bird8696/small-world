import { useWorldStore } from '../../store/worldStore'

export default function NewsFeed() {
  const news        = useWorldStore(s => s.news)
  const newsLoading = useWorldStore(s => s.newsLoading)

  return (
    <div style={{
      height: 238, flexShrink: 0,
      background: 'var(--surface2)',
      borderTop: '0.5px solid var(--border)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '5px 12px', flexShrink: 0,
        fontSize: 9, fontWeight: 600, color: 'var(--muted)',
        borderBottom: '0.5px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 6,
        textTransform: 'uppercase', letterSpacing: '.06em',
      }}>
        마켓 뉴스
        {newsLoading && (
          <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
            · AI 분석중...
          </span>
        )}
      </div>

      {/* 뉴스 리스트 */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {news.length === 0 && (
          <div style={{
            padding: 16, textAlign: 'center',
            color: 'var(--muted)', fontSize: 11,
          }}>
            뉴스 생성 대기 중...
          </div>
        )}

        {news.map(n => (
          <div key={n.id} style={{
            padding: '7px 12px',
            borderBottom: '0.5px solid var(--border)',
          }}>
            {/* 배지 행 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
              <span style={{
                fontSize: 9, padding: '1px 5px', borderRadius: 10,
                background: n.catColor + '22', color: n.catColor, fontWeight: 600,
              }}>
                {n.category}
              </span>
              {n.severity === 'extreme' && (
                <span style={{
                  fontSize: 9, padding: '1px 5px', borderRadius: 10,
                  background: '#ef444422', color: '#ef4444',
                }}>
                  🔥 extreme
                </span>
              )}
              {n.severity === 'high' && (
                <span style={{
                  fontSize: 9, padding: '1px 5px', borderRadius: 10,
                  background: '#f9731622', color: '#f97316',
                }}>
                  ⚡ high
                </span>
              )}
              <span style={{ fontSize: 9, color: 'var(--muted)', marginLeft: 'auto' }}>
                {n.time}
              </span>
            </div>

            {/* 제목 */}
            <div style={{ fontWeight: 600, fontSize: 11, lineHeight: 1.4, marginBottom: 2 }}>
              {n.headline}
            </div>

            {/* 본문 */}
            <div style={{
              fontSize: 10, color: 'var(--muted)',
              lineHeight: 1.5, marginBottom: 4,
            }}>
              {n.body}
            </div>

            {/* 영향 종목 태그 */}
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {(n.affected ?? []).map(a => (
                <span key={a.ticker} style={{
                  fontSize: 9, padding: '1px 6px', borderRadius: 10, fontWeight: 600,
                  background: a.impact >= 0 ? '#22c55e22' : '#ef444422',
                  color:      a.impact >= 0 ? '#22c55e'   : '#ef4444',
                }}>
                  {a.ticker} {a.impact >= 0 ? '+' : ''}{Number(a.impact).toFixed(1)}%
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
