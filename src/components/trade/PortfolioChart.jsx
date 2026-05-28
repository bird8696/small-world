import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useWorldStore, INITIAL_CASH } from "../../store/worldStore";
import { won, pctColor, shortWon } from "../../utils/format";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border)",
        borderRadius: 8,
        padding: "7px 10px",
        fontSize: 11,
      }}
    >
      <div style={{ color: "var(--muted)", marginBottom: 3 }}>{d.t}</div>
      <div style={{ fontWeight: 600 }}>총 자산 {won(d.v)}원</div>
      <div style={{ color: pctColor(d.p), fontWeight: 600 }}>
        {d.p >= 0 ? "+" : ""}
        {won(d.p)}원
      </div>
    </div>
  );
};

export default function PortfolioChart() {
  const portfolioHistory = useWorldStore((s) => s.portfolioHistory);
  const portfolio = useWorldStore((s) => s.portfolio);
  const stocks = useWorldStore((s) => s.stocks);

  const holdingsValue = Object.entries(portfolio.holdings).reduce(
    (sum, [ticker, { qty }]) => sum + (stocks[ticker]?.price ?? 0) * qty,
    0,
  );
  const totalAsset = portfolio.cash + holdingsValue;
  const profit = totalAsset - INITIAL_CASH;
  const profitPct = (profit / INITIAL_CASH) * 100;

  const data = portfolioHistory.slice(-120);
  const isUp = profit >= 0;
  const lineClr = isUp ? "#22c55e" : "#ef4444";
  const gradId = isUp ? "pg-up" : "pg-down";

  const values = data.map((d) => d.v);
  const peak = values.length ? Math.max(...values) : INITIAL_CASH;
  const trough = values.length ? Math.min(...values) : INITIAL_CASH;
  const maxDD = peak > 0 ? ((peak - trough) / peak) * 100 : 0;

  const yMin = Math.min(...values, INITIAL_CASH) * 0.998;
  const yMax = Math.max(...values, INITIAL_CASH) * 1.002;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--surface)",
      }}
    >
      {/* 요약 카드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
          borderBottom: "0.5px solid var(--border)",
          flexShrink: 0,
        }}
      >
        {[
          {
            label: "총 자산",
            value: won(totalAsset) + "원",
            color: "var(--text)",
          },
          {
            label: "평가 손익",
            value: (profit >= 0 ? "+" : "") + won(profit) + "원",
            color: pctColor(profit),
          },
          {
            label: "수익률",
            value: (profitPct >= 0 ? "+" : "") + profitPct.toFixed(2) + "%",
            color: pctColor(profitPct),
          },
          {
            label: "최대 낙폭",
            value: "-" + maxDD.toFixed(2) + "%",
            color: maxDD > 5 ? "#ef4444" : "var(--muted)",
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              padding: "10px 14px",
              borderRight: i < 3 ? "0.5px solid var(--border)" : "none",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "var(--muted)",
                marginBottom: 3,
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              {item.label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* 시작 자금 안내 */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "4px 12px",
          fontSize: 9,
          color: "var(--muted)",
          flexShrink: 0,
        }}
      >
        점선 = 시작 자금 {won(INITIAL_CASH)}원
      </div>

      {/* 차트 */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {data.length < 2 ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            거래를 시작하면 수익 차트가 표시됩니다
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="pg-up" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pg-down" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="t"
                tick={{ fontSize: 8, fill: "var(--muted)" }}
                tickLine={false}
                axisLine={false}
                interval={Math.max(Math.floor(data.length / 5), 1)}
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fontSize: 8, fill: "var(--muted)" }}
                tickLine={false}
                axisLine={false}
                width={60}
                tickFormatter={(v) => shortWon(v)}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* 시작 자금 기준선 */}
              <ReferenceLine
                y={INITIAL_CASH}
                stroke="var(--muted)"
                strokeDasharray="4 4"
                strokeWidth={1}
              />

              <Area
                type="monotone"
                dataKey="v"
                stroke={lineClr}
                strokeWidth={1.5}
                fill={`url(#${gradId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
