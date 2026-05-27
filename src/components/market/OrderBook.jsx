import { useMemo } from "react";
import { useWorldStore } from "../../store/worldStore";
import { won } from "../../utils/format";
import { COMPANY_MAP } from "../../data/companies";

function makeBook(price) {
  const sp = Math.max(Math.round(price * 0.0008), 5);
  const asks = [],
    bids = [];
  for (let i = 7; i >= 0; i--) {
    asks.push({
      price: price + Math.round(sp * (i + 1) * (1 + Math.random() * 0.3)),
      qty: Math.floor(Math.random() * 3000 + 100),
    });
  }
  for (let i = 0; i < 8; i++) {
    bids.push({
      price: price - Math.round(sp * (i + 1) * (1 + Math.random() * 0.3)),
      qty: Math.floor(Math.random() * 3000 + 100),
    });
  }
  return { asks, bids };
}

export default function OrderBook() {
  const selected = useWorldStore((s) => s.selected);
  const stock = useWorldStore((s) => s.stocks[selected] ?? {});
  const { asks, bids } = useMemo(
    () => makeBook(stock.price ?? 0),
    [stock.price],
  );
  const maxQty = Math.max(
    ...asks.map((a) => a.qty),
    ...bids.map((b) => b.qty),
    1,
  );

  const Row = ({ price, qty, side }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "2px 10px",
        position: "relative",
        fontSize: 10,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          [side === "ask" ? "right" : "left"]: 0,
          width: `${(qty / maxQty) * 70}%`,
          background: side === "ask" ? "#ef4444" : "#22c55e",
          opacity: 0.08,
        }}
      />
      <span
        style={{
          color: side === "ask" ? "#ef4444" : "#22c55e",
          fontWeight: 500,
          position: "relative",
        }}
      >
        {won(price)}
      </span>
      <span style={{ color: "var(--muted)", position: "relative" }}>
        {qty.toLocaleString()}
      </span>
    </div>
  );

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
        호가창
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
        <span>가격 (원)</span>
        <span>잔량</span>
      </div>
      {asks.map((a, i) => (
        <Row key={`a${i}`} {...a} side="ask" />
      ))}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "4px 10px",
          background: "var(--surface2)",
          borderTop: "0.5px solid var(--border)",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: 12,
            color: (stock.changePct ?? 0) >= 0 ? "#22c55e" : "#ef4444",
          }}
        >
          {won(stock.price)}
        </span>
        <span
          style={{
            fontSize: 10,
            color: (stock.changePct ?? 0) >= 0 ? "#22c55e" : "#ef4444",
          }}
        >
          {(stock.changePct ?? 0) >= 0 ? "+" : ""}
          {(stock.changePct ?? 0).toFixed(2)}%
        </span>
      </div>
      {bids.map((b, i) => (
        <Row key={`b${i}`} {...b} side="bid" />
      ))}
    </div>
  );
}
