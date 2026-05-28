import { useWorldStore } from "../../store/worldStore";
import { COMPANIES } from "../../data/companies";
import { won, pctStr } from "../../utils/format";

// 등락률 → 배경색 + 글자색
function heatColor(pct) {
  const v = Math.max(-15, Math.min(15, pct || 0));

  if (Math.abs(v) < 0.5) {
    return {
      bg: "var(--surface2)",
      text: "var(--muted)",
      border: "var(--border)",
    };
  }
  if (v > 0) {
    const t = Math.min(v / 10, 1);
    return {
      bg: `rgba(34, 197, 94, ${0.12 + t * 0.6})`,
      text: t > 0.55 ? "#fff" : "#22c55e",
      border: `rgba(34, 197, 94, ${0.3 + t * 0.4})`,
    };
  } else {
    const t = Math.min(Math.abs(v) / 10, 1);
    return {
      bg: `rgba(239, 68, 68, ${0.12 + t * 0.6})`,
      text: t > 0.55 ? "#fff" : "#ef4444",
      border: `rgba(239, 68, 68, ${0.3 + t * 0.4})`,
    };
  }
}

export default function SectorHeatmap() {
  const stocks = useWorldStore((s) => s.stocks);
  const setSelected = useWorldStore((s) => s.setSelected);

  const maxVol = Math.max(
    ...COMPANIES.map((c) => stocks[c.ticker]?.volume || 1),
    1,
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 범례 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "6px 14px",
          flexShrink: 0,
          borderBottom: "0.5px solid var(--border)",
          fontSize: 10,
          color: "var(--muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[-10, -5, 0, 5, 10].map((v) => (
            <div
              key={v}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 14,
                  borderRadius: 3,
                  background: heatColor(v).bg,
                  border: `0.5px solid ${heatColor(v).border}`,
                }}
              />
              <span style={{ fontSize: 9 }}>{v > 0 ? `+${v}` : v}%</span>
            </div>
          ))}
        </div>
        <span>· 타일 클릭 시 해당 종목 차트로 이동</span>
      </div>

      {/* 히트맵 그리드 */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gap: 6,
          padding: 10,
          overflow: "hidden",
        }}
      >
        {COMPANIES.map((c) => {
          const s = stocks[c.ticker] || {};
          const { bg, text, border } = heatColor(s.changePct);
          const volRatio = (s.volume || 0) / maxVol;

          return (
            <div
              key={c.ticker}
              onClick={() => setSelected(c.ticker)}
              style={{
                background: bg,
                border: `0.5px solid ${border}`,
                borderRadius: 8,
                padding: "10px 12px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform .12s, opacity .12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.opacity = "1";
              }}
            >
              {/* 상단 — 티커 + 등락률 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: text }}>
                    {c.ticker}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: text,
                      opacity: 0.75,
                      marginTop: 1,
                    }}
                  >
                    {c.name}
                  </div>
                  <div style={{ fontSize: 9, color: text, opacity: 0.55 }}>
                    {c.sector}
                  </div>
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: text,
                    textAlign: "right",
                  }}
                >
                  {pctStr(s.changePct)}
                </div>
              </div>

              {/* 하단 — 현재가 + 거래량 바 */}
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: text,
                    marginBottom: 5,
                  }}
                >
                  {won(s.price)}원
                </div>
                <div
                  style={{
                    height: 3,
                    background: "rgba(255,255,255,0.12)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.round(volRatio * 100)}%`,
                      background: text,
                      opacity: 0.5,
                      borderRadius: 2,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: text,
                    opacity: 0.6,
                    marginTop: 3,
                  }}
                >
                  Vol {((s.volume || 0) / 1000).toFixed(0)}K
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
