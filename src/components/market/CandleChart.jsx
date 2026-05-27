import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Customized,
} from "recharts";
import { useWorldStore } from "../../store/worldStore";
import { won } from "../../utils/format";

// MA 계산
function withMA(data, periods) {
  return data.map((d, i) => {
    const r = { ...d };
    periods.forEach((p) => {
      r[`ma${p}`] =
        i >= p - 1
          ? Math.round(
              data.slice(i - p + 1, i + 1).reduce((s, x) => s + x.close, 0) / p,
            )
          : null;
    });
    return r;
  });
}

// 커스텀 캔들스틱 레이어 (recharts Customized로 마운트)
function CandleLayer({ xAxisMap, yAxisMap, data }) {
  const xId = Object.keys(xAxisMap || {})[0];
  const yId = Object.keys(yAxisMap || {})[0];
  const xAxis = xAxisMap?.[xId];
  const yAxis = yAxisMap?.[yId];
  if (!xAxis?.scale || !yAxis?.scale) return null;

  const xScale = xAxis.scale;
  const yScale = yAxis.scale;
  const bw = xScale.bandwidth?.() ?? 8;
  const cw = Math.max(bw * 0.65, 2);

  return (
    <g>
      {(data || []).map((d, i) => {
        if (!d?.t) return null;
        const x = xScale(d.t);
        if (x === undefined || x === null) return null;
        const cx = x + bw / 2;
        const yO = yScale(d.open);
        const yC = yScale(d.close);
        const yH = yScale(d.high);
        const yL = yScale(d.low);
        const isUp = d.close >= d.open;
        const clr = isUp ? "#22c55e" : "#ef4444";
        const bodyTop = Math.min(yO, yC);
        const bodyH = Math.max(Math.abs(yO - yC), 1);
        return (
          <g key={i}>
            <line
              x1={cx}
              x2={cx}
              y1={yH}
              y2={yL}
              stroke={clr}
              strokeWidth={1}
              opacity={0.8}
            />
            <rect
              x={cx - cw / 2}
              y={bodyTop}
              width={cw}
              height={bodyH}
              fill={clr}
              fillOpacity={0.9}
            />
          </g>
        );
      })}
    </g>
  );
}

const TF_OPTIONS = [
  { label: "1분", value: 10 },
  { label: "5분", value: 30 },
  { label: "15분", value: 60 },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border)",
        borderRadius: 8,
        padding: "7px 10px",
        fontSize: 10,
      }}
    >
      <div style={{ color: "var(--muted)", marginBottom: 4 }}>{d.t}</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2px 12px",
        }}
      >
        <span style={{ color: "var(--muted)" }}>시가</span>
        <span>{won(d.open)}</span>
        <span style={{ color: "#22c55e" }}>고가</span>
        <span>{won(d.high)}</span>
        <span style={{ color: "#ef4444" }}>저가</span>
        <span>{won(d.low)}</span>
        <span style={{ fontWeight: 600 }}>종가</span>
        <span
          style={{
            fontWeight: 600,
            color: d.close >= d.open ? "#22c55e" : "#ef4444",
          }}
        >
          {won(d.close)}
        </span>
        {d.ma5 && (
          <>
            <span style={{ color: "#f59e0b" }}>MA5</span>
            <span>{won(d.ma5)}</span>
          </>
        )}
        {d.ma20 && (
          <>
            <span style={{ color: "#818cf8" }}>MA20</span>
            <span>{won(d.ma20)}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default function CandleChart() {
  const selected = useWorldStore((s) => s.selected);
  const rawCandles = useWorldStore((s) => s.candles[selected] ?? []);
  const timeframe = useWorldStore((s) => s.timeframe);
  const setTimeframe = useWorldStore((s) => s.setTimeframe);

  const chartData = withMA(rawCandles.slice(-60), [5, 20]);
  const prices = chartData.flatMap((d) => [d.high, d.low]).filter(Boolean);
  const minY = prices.length ? Math.min(...prices) * 0.998 : 0;
  const maxY = prices.length ? Math.max(...prices) * 1.002 : 100;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* 타임프레임 + MA 범례 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 8px",
          flexShrink: 0,
        }}
      >
        {TF_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTimeframe(opt.value)}
            style={{
              padding: "2px 8px",
              fontSize: 10,
              borderRadius: 4,
              background:
                timeframe === opt.value ? "var(--blue)" : "var(--surface2)",
              color: timeframe === opt.value ? "#fff" : "var(--muted)",
              border: "none",
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        ))}
        <div style={{ marginLeft: 8, fontSize: 9, display: "flex", gap: 10 }}>
          <span style={{ color: "#f59e0b" }}>— MA5</span>
          <span style={{ color: "#818cf8" }}>— MA20</span>
        </div>
      </div>

      {/* 차트 */}
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 4, right: 6, bottom: 0, left: 0 }}
          >
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
              interval={Math.max(Math.floor(chartData.length / 5), 1)}
            />
            <YAxis
              domain={[minY, maxY]}
              tick={{ fontSize: 8, fill: "var(--muted)" }}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(v) =>
                v >= 10000 ? `${(v / 10000).toFixed(1)}만` : v.toLocaleString()
              }
            />
            <Tooltip content={<CustomTooltip />} />

            {/* 도메인 확보용 투명 라인 */}
            <Line
              dataKey="close"
              stroke="none"
              dot={false}
              isAnimationActive={false}
              legendType="none"
            />

            {/* 캔들스틱 레이어 */}
            <Customized component={CandleLayer} />

            {/* 이동평균선 */}
            <Line
              dataKey="ma5"
              stroke="#f59e0b"
              strokeWidth={1}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
            <Line
              dataKey="ma20"
              stroke="#818cf8"
              strokeWidth={1}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
