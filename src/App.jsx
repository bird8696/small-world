import { useState } from "react";
import { useMarket } from "./hooks/useMarket";
import { useNews } from "./hooks/useNews";
import { useAuth } from "./hooks/useAuth";
import { useMarketSync } from "./hooks/useMarketSync";
import { useAuthStore } from "./store/authStore";
import { isSupabaseConfigured } from "./lib/supabase";

import LoginScreen from "./components/auth/LoginScreen";
import Header from "./components/layout/Header";
import NewsBanner from "./components/layout/NewsBanner";
import Watchlist from "./components/market/Watchlist";
import StockHeader from "./components/market/StockHeader";
import CandleChart from "./components/market/CandleChart";
import VolumeChart from "./components/market/VolumeChart";
import SectorHeatmap from "./components/market/SectorHeatmap";
import PortfolioChart from "./components/trade/PortfolioChart";
import NewsFeed from "./components/news/NewsFeed";
import RightPanel from "./components/RightPanel";

const CENTER_VIEWS = [
  { id: "chart", label: "📈 차트" },
  { id: "heatmap", label: "🟩 히트맵" },
  { id: "portfolio", label: "💰 내 수익" },
];

export default function App() {
  useAuth();
  useMarket();
  useNews();
  useMarketSync();

  const [centerView, setCenterView] = useState("chart");

  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const forceLogin = useAuthStore((s) => s._forceLogin);

  if (loading)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        로딩중...
      </div>
    );

  const showLogin = isSupabaseConfigured && (!user || forceLogin);
  if (showLogin)
    return (
      <LoginScreen
        onClose={() => useAuthStore.setState({ _forceLogin: false })}
      />
    );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Header />
      <NewsBanner />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "200px 1fr 225px",
          overflow: "hidden",
        }}
      >
        {/* ── 좌: 종목 목록 ── */}
        <Watchlist />

        {/* ── 중앙 ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* 뷰 전환 탭 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "5px 10px",
              flexShrink: 0,
              background: "var(--surface)",
              borderBottom: "0.5px solid var(--border)",
            }}
          >
            {CENTER_VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => setCenterView(v.id)}
                style={{
                  padding: "3px 12px",
                  fontSize: 10,
                  fontWeight: 600,
                  borderRadius: 4,
                  border: "none",
                  cursor: "pointer",
                  background:
                    centerView === v.id ? "var(--blue)" : "var(--surface2)",
                  color: centerView === v.id ? "#fff" : "var(--muted)",
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* 차트 뷰 */}
          {centerView === "chart" && (
            <>
              <StockHeader />
              <div
                style={{
                  flex: 1,
                  background: "var(--surface)",
                  display: "flex",
                  flexDirection: "column",
                  padding: "4px 4px 0",
                  overflow: "hidden",
                }}
              >
                <div style={{ flex: "0 0 70%", minHeight: 0 }}>
                  <CandleChart />
                </div>
                <div style={{ flex: "0 0 30%", minHeight: 0 }}>
                  <VolumeChart />
                </div>
              </div>
              <NewsFeed />
            </>
          )}

          {/* 히트맵 뷰 */}
          {centerView === "heatmap" && <SectorHeatmap />}

          {/* 포트폴리오 수익 차트 뷰 */}
          {centerView === "portfolio" && <PortfolioChart />}
        </div>

        {/* ── 우: 주문 패널 ── */}
        <RightPanel />
      </div>
    </div>
  );
}
