import { useWorldStore } from "../../store/worldStore";
import { pctColor, won, shortWon } from "../../utils/format";

const INITIAL_CASH = 10_000_000;

export default function PortfolioSummary() {
  const portfolio = useWorldStore((s) => s.portfolio);
  const stocks = useWorldStore((s) => s.stocks);

  const holdingsValue = Object.entries(portfolio.holdings).reduce(
    (sum, [ticker, { qty }]) => sum + (stocks[ticker]?.price ?? 0) * qty,
    0,
  );
  const costBasis = Object.entries(portfolio.holdings).reduce(
    (sum, [, { qty, avgCost }]) => sum + avgCost * qty,
    0,
  );

  const totalAsset = portfolio.cash + holdingsValue;
  const totalProfit = holdingsValue - costBasis;
  const profitPct = ((totalAsset - INITIAL_CASH) / INITIAL_CASH) * 100;

  return (
    <div
      style={{
        padding: "10px 12px",
        flexShrink: 0,
        background: "var(--surface2)",
        borderBottom: "0.5px solid var(--border)",
      }}
    >
      <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 3 }}>
        총 자산
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
        {won(totalAsset)}원
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
          }}
        >
          <span style={{ color: "var(--muted)" }}>현금</span>
          <span style={{ fontWeight: 600 }}>{shortWon(portfolio.cash)}원</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
          }}
        >
          <span style={{ color: "var(--muted)" }}>미실현 손익</span>
          <span style={{ fontWeight: 600, color: pctColor(totalProfit) }}>
            {totalProfit >= 0 ? "+" : ""}
            {won(totalProfit)}원
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
          }}
        >
          <span style={{ color: "var(--muted)" }}>수익률</span>
          <span style={{ fontWeight: 600, color: pctColor(profitPct) }}>
            {profitPct >= 0 ? "+" : ""}
            {profitPct.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
