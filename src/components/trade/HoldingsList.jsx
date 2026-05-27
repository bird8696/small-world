import { useWorldStore } from "../../store/worldStore";
import { COMPANY_MAP } from "../../data/companies";
import { pctColor, pctStr, won } from "../../utils/format";

export default function HoldingsList() {
  const portfolio = useWorldStore((s) => s.portfolio);
  const stocks = useWorldStore((s) => s.stocks);
  const setSelected = useWorldStore((s) => s.setSelected);

  const entries = Object.entries(portfolio.holdings).filter(
    ([, h]) => h.qty > 0,
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          color: "var(--muted)",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: ".06em",
        }}
      >
        보유 종목
      </div>

      {entries.length === 0 && (
        <div
          style={{
            fontSize: 11,
            color: "var(--muted)",
            textAlign: "center",
            paddingTop: 20,
          }}
        >
          보유 종목 없음
        </div>
      )}

      {entries.map(([ticker, { qty, avgCost }]) => {
        const s = stocks[ticker] ?? {};
        const c = COMPANY_MAP[ticker] ?? {};
        const currentVal = (s.price ?? 0) * qty;
        const costVal = avgCost * qty;
        const profitAmt = currentVal - costVal;
        const profitPct = costVal > 0 ? (profitAmt / costVal) * 100 : 0;

        return (
          <div
            key={ticker}
            onClick={() => setSelected(ticker)}
            style={{
              padding: "8px 10px",
              marginBottom: 6,
              borderRadius: 8,
              cursor: "pointer",
              background: "var(--surface2)",
              borderLeft: `2px solid ${c.color ?? "#888"}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 12 }}>{ticker}</span>
              <span style={{ fontSize: 10, color: pctColor(s.changePct) }}>
                {pctStr(s.changePct)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "var(--muted)",
                marginBottom: 2,
              }}
            >
              <span>{qty}주</span>
              <span>{won(currentVal)}원</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 9,
                color: "var(--muted)",
                marginBottom: 4,
              }}
            >
              <span>평균단가</span>
              <span>{won(avgCost)}원</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                fontWeight: 600,
                color: pctColor(profitPct),
                borderTop: "0.5px solid var(--border)",
                paddingTop: 4,
              }}
            >
              <span>평가손익</span>
              <span>
                {profitAmt >= 0 ? "+" : ""}
                {won(profitAmt)}원 ({profitPct >= 0 ? "+" : ""}
                {profitPct.toFixed(2)}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
