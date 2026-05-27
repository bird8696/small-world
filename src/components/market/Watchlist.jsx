import { useWorldStore } from "../../store/worldStore";
import { COMPANIES } from "../../data/companies";
import { pctColor, pctStr, won } from "../../utils/format";

function Sparkline({ data, color }) {
  const pts = (data ?? []).slice(-20).map((d) => d.p);
  if (pts.length < 2) return null;
  const min = Math.min(...pts),
    max = Math.max(...pts),
    range = max - min || 1;
  const W = 52,
    H = 18;
  const points = pts
    .map(
      (p, i, a) =>
        `${((i / (a.length - 1)) * W).toFixed(1)},${(H - ((p - min) / range) * (H - 2) - 1).toFixed(1)}`,
    )
    .join(" ");
  return (
    <svg width={W} height={H} style={{ display: "block", flexShrink: 0 }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.8}
      />
    </svg>
  );
}

export default function Watchlist() {
  const stocks = useWorldStore((s) => s.stocks);
  const history = useWorldStore((s) => s.history);
  const selected = useWorldStore((s) => s.selected);
  const setSelected = useWorldStore((s) => s.setSelected);

  return (
    <div
      style={{
        width: 200,
        flexShrink: 0,
        background: "var(--surface)",
        borderRight: "0.5px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          padding: "5px 10px",
          fontSize: 9,
          fontWeight: 600,
          color: "var(--muted)",
          borderBottom: "0.5px solid var(--border)",
          position: "sticky",
          top: 0,
          background: "var(--surface)",
          textTransform: "uppercase",
          letterSpacing: ".06em",
        }}
      >
        종목
      </div>
      {COMPANIES.map((c) => {
        const s = stocks[c.ticker] ?? {};
        const active = selected === c.ticker;
        return (
          <div
            key={c.ticker}
            onClick={() => setSelected(c.ticker)}
            style={{
              padding: "6px 10px",
              cursor: "pointer",
              background: active ? "var(--surface2)" : "transparent",
              borderLeft: `2px solid ${active ? c.color : "transparent"}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 3,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 11 }}>{c.ticker}</div>
                <div style={{ fontSize: 9, color: "var(--muted)" }}>
                  {c.sector}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600, fontSize: 11 }}>
                  {won(s.price)}
                </div>
                <div style={{ fontSize: 9, color: pctColor(s.changePct) }}>
                  {pctStr(s.changePct)}
                </div>
              </div>
            </div>
            {/* 스파크라인 */}
            <Sparkline data={history[c.ticker]} color={c.color} />
          </div>
        );
      })}
    </div>
  );
}
