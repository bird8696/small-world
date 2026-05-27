import { useWorldStore } from "../../store/worldStore";
import { won } from "../../utils/format";

export default function TransactionHistory() {
  const txs = useWorldStore((s) => s.transactions);

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
        내 거래 내역
      </div>
      {txs.length === 0 && (
        <div
          style={{
            padding: 16,
            textAlign: "center",
            color: "var(--muted)",
            fontSize: 11,
          }}
        >
          거래 내역 없음
        </div>
      )}
      {txs.map((tx, i) => (
        <div
          key={i}
          style={{
            padding: "6px 10px",
            borderBottom: "0.5px solid var(--border)",
            fontSize: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 2,
            }}
          >
            <span style={{ fontWeight: 600 }}>{tx.ticker}</span>
            <span
              style={{
                color: tx.side === "buy" ? "#22c55e" : "#ef4444",
                fontWeight: 600,
              }}
            >
              {tx.side === "buy" ? "매수" : "매도"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "var(--muted)",
            }}
          >
            <span>
              {tx.qty}주 × {won(tx.price)}원
            </span>
            <span>{tx.time}</span>
          </div>
          <div
            style={{
              textAlign: "right",
              fontWeight: 600,
              color: tx.side === "buy" ? "#ef4444" : "#22c55e",
              marginTop: 1,
            }}
          >
            {tx.side === "buy" ? "-" : "+"}
            {won(tx.qty * tx.price)}원
          </div>
        </div>
      ))}
    </div>
  );
}
