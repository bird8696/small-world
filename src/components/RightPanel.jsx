import { useWorldStore } from "../store/worldStore";
import OrderPanel from "./trade/OrderPanel";
import PortfolioSummary from "./trade/PortfolioSummary";
import HoldingsList from "./trade/HoldingsList";
import OrderBook from "./market/OrderBook";
import TradeStream from "./market/TradeStream";
import TransactionHistory from "./trade/TransactionHistory";

const TABS = [
  { id: "order", label: "주문" },
  { id: "book", label: "호가창" },
  { id: "trades", label: "체결" },
  { id: "history", label: "내역" },
];

export default function RightPanel() {
  const tab = useWorldStore((s) => s.rightTab);
  const setTab = useWorldStore((s) => s.setRightTab);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--surface)",
        borderLeft: "0.5px solid var(--border)",
        overflow: "hidden",
      }}
    >
      {/* 탭 바 */}
      <div
        style={{
          display: "flex",
          borderBottom: "0.5px solid var(--border)",
          flexShrink: 0,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: "7px 0",
              fontSize: 10,
              fontWeight: 600,
              background: "transparent",
              color: tab === t.id ? "var(--text)" : "var(--muted)",
              border: "none",
              borderBottom:
                tab === t.id
                  ? "2px solid var(--blue)"
                  : "2px solid transparent",
              cursor: "pointer",
              borderRadius: 0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {tab === "order" && (
          <>
            <OrderPanel />
            <PortfolioSummary />
            <HoldingsList />
          </>
        )}
        {tab === "book" && <OrderBook />}
        {tab === "trades" && <TradeStream />}
        {tab === "history" && <TransactionHistory />}
      </div>
    </div>
  );
}
