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
import NewsFeed from "./components/news/NewsFeed";
import RightPanel from "./components/RightPanel";

export default function App() {
  useAuth();
  useMarket();
  useNews();
  useMarketSync();

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

  // Supabase 미설정이면 로그인 없이 바로 진입
  // 설정됐는데 로그인 안 했거나, 강제로 로그인 창 열었을 때만 LoginScreen
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
        <Watchlist />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
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
        </div>

        <RightPanel />
      </div>
    </div>
  );
}
