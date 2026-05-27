import { useWorldStore } from "../../store/worldStore";
import { won } from "../../utils/format";

export default function TradeStream() {
  const selected = useWorldStore((s) => s.selected);
  const trades = useWorldStore((s) => s.trades[selected] ?? []);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "5px 10px",
          fontSize: 9,
          fontWeight: 600,
          color: "var(--muted)",
          borderBottom: "0.5px solid var(--border)",
          textTransform: "uppercase",
          letterSpacing: ".06em",
          flexShrink: 0,
        }}
      >
        실시간 체결
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "3px 10px",
          fontSize: 9,
          color: "var(--muted)",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <span>시각</span>
        <span>가격</span>
        <span>수량</span>
      </div>
      {trades.map((t, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "2px 10px",
            fontSize: 10,
            borderBottom: "0.5px solid var(--border)",
          }}
        >
          <span style={{ color: "var(--muted)" }}>{t.time}</span>
          <span
            style={{
              color: t.side === "buy" ? "#22c55e" : "#ef4444",
              fontWeight: 500,
            }}
          >
            {won(t.price)}
          </span>
          <span style={{ color: "var(--muted)" }}>
            {t.qty.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
