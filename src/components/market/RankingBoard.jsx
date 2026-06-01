import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { useWorldStore, INITIAL_CASH } from "../../store/worldStore";
import { won, pctColor, pctStr } from "../../utils/format";

const MEDALS = ["🥇", "🥈", "🥉"];

// 내 현재 포트폴리오 가치를 Supabase에 업데이트
async function pushMyPortfolioValue(userId) {
  const { portfolio, stocks } = useWorldStore.getState();
  const holdingsValue = Object.entries(portfolio.holdings).reduce(
    (sum, [ticker, { qty }]) => sum + (stocks[ticker]?.price ?? 0) * qty,
    0,
  );
  const totalAsset = portfolio.cash + holdingsValue;
  await supabase
    .from("profiles")
    .update({ portfolio_value: totalAsset })
    .eq("id", userId);
  return totalAsset;
}

export default function RankingBoard() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const currentUser = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);

  const fetch = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, portfolio_value")
      .order("portfolio_value", { ascending: false });
    if (!error) {
      setRankings(data ?? []);
      setLastUpdate(
        new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    }
    setLoading(false);
  }, []);

  // 탭 열릴 때 내 자산 먼저 업데이트 → 랭킹 조회
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const init = async () => {
      if (user?.id) await pushMyPortfolioValue(user.id);
      await fetch();
    };
    init();
    const id = setInterval(async () => {
      if (user?.id) await pushMyPortfolioValue(user.id);
      await fetch();
    }, 30000);
    return () => clearInterval(id);
  }, [user?.id, fetch]);

  const handleRefresh = async () => {
    setLoading(true);
    if (user?.id) await pushMyPortfolioValue(user.id);
    await fetch();
  };

  if (!isSupabaseConfigured)
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 32 }}>🏆</div>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          Supabase 연동 후 사용 가능
        </div>
      </div>
    );

  const maxVal = Math.max(
    ...rankings.map((r) => r.portfolio_value ?? INITIAL_CASH),
    INITIAL_CASH,
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
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          flexShrink: 0,
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>🏆 수익률 랭킹</div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
            전체 {rankings.length}명 참가 · 30초마다 갱신
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {lastUpdate && (
            <span style={{ fontSize: 10, color: "var(--muted)" }}>
              갱신 {lastUpdate}
            </span>
          )}
          <button
            onClick={handleRefresh}
            style={{ fontSize: 10, padding: "3px 10px" }}
          >
            새로고침
          </button>
        </div>
      </div>

      {/* 컬럼 헤더 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 130px 90px",
          padding: "6px 16px",
          gap: 8,
          fontSize: 9,
          fontWeight: 600,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: ".06em",
          borderBottom: "0.5px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <span>순위</span>
        <span>유저</span>
        <span style={{ textAlign: "right" }}>총 자산</span>
        <span style={{ textAlign: "right" }}>수익률</span>
      </div>

      {/* 랭킹 리스트 */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading && (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              color: "var(--muted)",
              fontSize: 12,
            }}
          >
            불러오는 중...
          </div>
        )}

        {!loading && rankings.length === 0 && (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              color: "var(--muted)",
              fontSize: 12,
            }}
          >
            아직 참가자가 없습니다
          </div>
        )}

        {rankings.map((r, i) => {
          const value = r.portfolio_value ?? INITIAL_CASH;
          const profit = value - INITIAL_CASH;
          const profitPct = (profit / INITIAL_CASH) * 100;
          const barW = Math.round((value / maxVal) * 100);
          const isMe = r.id === user?.id;
          const isTop3 = i < 3;

          return (
            <div
              key={r.id}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 130px 90px",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                background: isMe ? "var(--surface2)" : "transparent",
                borderBottom: "0.5px solid var(--border)",
                borderLeft: isMe
                  ? "2px solid var(--blue)"
                  : "2px solid transparent",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* 배경 바 */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${barW}%`,
                  background: profit >= 0 ? "#22c55e08" : "#ef444408",
                  pointerEvents: "none",
                }}
              />

              {/* 순위 */}
              <div
                style={{
                  fontSize: isTop3 ? 18 : 12,
                  fontWeight: 700,
                  color: "var(--muted)",
                  position: "relative",
                }}
              >
                {isTop3 ? MEDALS[i] : `#${i + 1}`}
              </div>

              {/* 유저명 */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: isMe ? "var(--blue)" : "var(--surface2)",
                    border: "0.5px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: isMe ? "#fff" : "var(--muted)",
                  }}
                >
                  {r.username?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div style={{ fontSize: 12, fontWeight: isMe ? 700 : 500 }}>
                  {r.username}
                  {isMe && (
                    <span
                      style={{
                        fontSize: 9,
                        color: "var(--blue)",
                        marginLeft: 5,
                      }}
                    >
                      나
                    </span>
                  )}
                </div>
              </div>

              {/* 총 자산 */}
              <div style={{ textAlign: "right", position: "relative" }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  {won(value)}원
                </div>
                <div style={{ fontSize: 9, color: pctColor(profit) }}>
                  {profit >= 0 ? "+" : ""}
                  {won(profit)}원
                </div>
              </div>

              {/* 수익률 */}
              <div
                style={{
                  textAlign: "right",
                  position: "relative",
                  fontSize: 13,
                  fontWeight: 700,
                  color: pctColor(profitPct),
                }}
              >
                {pctStr(profitPct)}
              </div>
            </div>
          );
        })}
      </div>

      {/* 내 순위 하단 고정 */}
      {user &&
        (() => {
          const myIdx = rankings.findIndex((r) => r.id === user.id);
          if (myIdx < 0) return null;
          const r = rankings[myIdx];
          const val = r.portfolio_value ?? INITIAL_CASH;
          const pct = ((val - INITIAL_CASH) / INITIAL_CASH) * 100;
          return (
            <div
              style={{
                padding: "8px 16px",
                flexShrink: 0,
                borderTop: "0.5px solid var(--border)",
                background: "var(--surface2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 10, color: "var(--muted)" }}>
                내 순위{" "}
                <span style={{ fontWeight: 700, color: "var(--text)" }}>
                  #{myIdx + 1}
                </span>{" "}
                / {rankings.length}명
              </span>
              <span
                style={{ fontSize: 12, fontWeight: 700, color: pctColor(pct) }}
              >
                {pctStr(pct)}
              </span>
            </div>
          );
        })()}
    </div>
  );
}
