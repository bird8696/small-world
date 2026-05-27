import { useState, useRef, useEffect } from "react";
import { useWorldStore } from "../../store/worldStore";
import { useAuthStore } from "../../store/authStore";
import { calcMarketIndex } from "../../engine/marketEngine";
import { pctColor, pctStr } from "../../utils/format";
import { COMPANIES } from "../../data/companies";

function FearGreedBadge({ value }) {
  const label =
    value < 20
      ? "극단적 공포"
      : value < 40
        ? "공포"
        : value < 60
          ? "중립"
          : value < 80
            ? "탐욕"
            : "극단적 탐욕";
  const color =
    value < 40 ? "#ef4444" : value < 60 ? "var(--muted)" : "#22c55e";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ fontSize: 10, color }}>{label}</span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color,
          background: color + "18",
          padding: "1px 7px",
          borderRadius: 10,
          border: `0.5px solid ${color}55`,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: "0.5px",
        height: 14,
        background: "var(--border)",
        flexShrink: 0,
      }}
    />
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isLoggedIn = !!user && !!profile;
  const initial = profile?.username?.[0]?.toUpperCase() ?? "?";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* 트리거 버튼 */}
      <div
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          cursor: "pointer",
          padding: "3px 6px",
          borderRadius: 8,
          background: open ? "var(--surface2)" : "transparent",
          transition: "background .1s",
          userSelect: "none",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: isLoggedIn ? "var(--blue)" : "var(--surface2)",
            border: isLoggedIn ? "none" : "0.5px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isLoggedIn ? 11 : 14,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {isLoggedIn ? initial : "👤"}
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: isLoggedIn ? "var(--blue)" : "var(--muted)",
          }}
        >
          {isLoggedIn ? profile.username : "게스트"}
        </span>
        <span style={{ fontSize: 9, color: "var(--muted)" }}>▾</span>
      </div>

      {/* 드롭다운 */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: 36,
            right: 0,
            zIndex: 999,
            background: "var(--surface)",
            border: "0.5px solid var(--border)",
            borderRadius: 10,
            minWidth: 180,
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          {isLoggedIn ? (
            <>
              {/* 유저 정보 */}
              <div
                style={{
                  padding: "12px 14px",
                  borderBottom: "0.5px solid var(--border)",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                  {profile.username}
                </div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>
                  {user.email}
                </div>
              </div>
              {/* 로그아웃 */}
              <div
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                }}
                style={{
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "#ef4444",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "background .1s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#ef444415")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span>→</span> 로그아웃
              </div>
            </>
          ) : (
            <>
              {/* 게스트 상태 */}
              <div
                style={{
                  padding: "12px 14px",
                  borderBottom: "0.5px solid var(--border)",
                }}
              >
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  로그인하면 계좌가 저장되고
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  다른 유저와 실시간 거래 가능
                </div>
              </div>
              <div
                onClick={() => {
                  setOpen(false);
                  /* LoginScreen 진입 트리거 */ useAuthStore.setState({
                    _forceLogin: true,
                  });
                }}
                style={{
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "var(--blue)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--surface2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span>→</span> 로그인 / 계좌 개설
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const stocks = useWorldStore((s) => s.stocks);
  const fearGreed = useWorldStore((s) => s.fearGreed);

  const idx = calcMarketIndex(stocks);
  const avgChg =
    COMPANIES.reduce((a, c) => a + (stocks[c.ticker]?.changePct ?? 0), 0) /
    COMPANIES.length;

  return (
    <div
      style={{
        height: 44,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 14px",
        background: "var(--surface)",
        borderBottom: "0.5px solid var(--border)",
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 600 }}>🌐 작은 세상 거래소</span>
      <span
        style={{
          fontSize: 9,
          padding: "1px 7px",
          borderRadius: 20,
          background: "#22c55e22",
          color: "#22c55e",
        }}
      >
        LIVE
      </span>

      <div style={{ flex: 1 }} />

      <FearGreedBadge value={fearGreed} />
      <Divider />

      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
        <span style={{ fontSize: 10, color: "var(--muted)" }}>세계지수</span>
        <span style={{ fontSize: 15, fontWeight: 600 }}>
          {idx.toLocaleString()}
        </span>
        <span style={{ fontSize: 10, color: pctColor(avgChg) }}>
          {pctStr(avgChg)}
        </span>
      </div>
      <Divider />

      <UserMenu />
    </div>
  );
}
