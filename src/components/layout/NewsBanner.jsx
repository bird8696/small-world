import { useEffect, useState } from "react";
import { useWorldStore } from "../../store/worldStore";
import { won } from "../../utils/format";

export default function NewsBanner() {
  const news = useWorldStore((s) => s.news);
  const [visible, setVisible] = useState(null);

  useEffect(() => {
    const latest = news[0];
    if (
      latest &&
      (latest.severity === "extreme" || latest.severity === "high")
    ) {
      setVisible(latest);
      const t = setTimeout(() => setVisible(null), 15000);
      return () => clearTimeout(t);
    }
  }, [news[0]?.id]);

  if (!visible) return null;
  const isX = visible.severity === "extreme";

  return (
    <div
      style={{
        background: isX ? "#ef444412" : "#f9731612",
        borderBottom: `0.5px solid ${isX ? "#ef4444" : "#f97316"}`,
        padding: "5px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 600,
          padding: "2px 7px",
          borderRadius: 4,
          background: isX ? "#ef4444" : "#f97316",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        {isX ? "🔥 속보" : "⚡ 뉴스"}
      </span>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 600,
            color: isX ? "#ef4444" : "#f97316",
            whiteSpace: "nowrap",
            animation: "marquee 18s linear",
          }}
        >
          {visible.headline} — {visible.body}
        </span>
      </div>
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        {(visible.affected ?? []).map((a) => (
          <span
            key={a.ticker}
            style={{
              fontSize: 9,
              padding: "1px 6px",
              borderRadius: 10,
              fontWeight: 600,
              background: a.impact >= 0 ? "#22c55e22" : "#ef444422",
              color: a.impact >= 0 ? "#22c55e" : "#ef4444",
            }}
          >
            {a.ticker} {a.impact >= 0 ? "+" : ""}
            {Number(a.impact).toFixed(1)}%
          </span>
        ))}
      </div>
      <button
        onClick={() => setVisible(null)}
        style={{ padding: "2px 6px", fontSize: 10, flexShrink: 0 }}
      >
        ✕
      </button>
    </div>
  );
}
