import { create } from "zustand";
import { COMPANIES, COMPANY_MAP } from "../data/companies";
import { supabase } from "../lib/supabase";

// ── 상수 ──────────────────────────────────────────────────────
const SHARES_OUTSTANDING = 1_000_000; // 가상 발행주수
const IMPACT_AMP = 5.0; // 충격 증폭 배율

// ── 초기 데이터 빌더 ──────────────────────────────────────────
function buildInitialStocks() {
  return Object.fromEntries(
    COMPANIES.map((c) => [
      c.ticker,
      {
        ...c,
        price: c.basePrice,
        open: c.basePrice,
        change: 0,
        changePct: 0,
        volume: Math.floor(Math.random() * 80000 + 20000),
        momentum: 0,
      },
    ]),
  );
}

function buildInitialHistory() {
  return Object.fromEntries(
    COMPANIES.map((c) => {
      const pts = [];
      let p = c.basePrice;
      const now = Date.now();
      for (let i = 59; i >= 0; i--) {
        p = Math.max(
          Math.round(p * (1 + (Math.random() - 0.5) * c.vol * 0.4)),
          100,
        );
        pts.push({
          t: new Date(now - i * 2000).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          p,
          v: Math.floor(Math.random() * 3000 + 500),
        });
      }
      pts[pts.length - 1].p = c.basePrice;
      return [c.ticker, pts];
    }),
  );
}

function buildInitialCandles() {
  return Object.fromEntries(
    COMPANIES.map((c) => {
      const arr = [];
      let p = c.basePrice;
      const now = Date.now();
      for (let i = 59; i >= 0; i--) {
        const open = p;
        const close = Math.max(
          Math.round(open * (1 + (Math.random() - 0.5) * c.vol * 2)),
          100,
        );
        const high =
          Math.max(open, close) +
          Math.round(Math.random() * c.vol * open * 1.5);
        const low = Math.max(
          100,
          Math.min(open, close) -
            Math.round(Math.random() * c.vol * open * 1.5),
        );
        arr.push({
          t: new Date(now - i * 20000).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          open,
          high,
          low,
          close,
          volume: Math.floor(Math.random() * 50000 + 5000),
        });
        p = close;
      }
      return [c.ticker, arr];
    }),
  );
}

// ── Supabase 거래 처리 ────────────────────────────────────────
async function writeTrade(userId, username, ticker, side, qty, price) {
  const company = COMPANY_MAP[ticker];

  // 1. 현재 holdings 조회
  const { data: cur } = await supabase
    .from("holdings")
    .select("qty, avg_cost")
    .eq("user_id", userId)
    .eq("ticker", ticker)
    .single();

  // 2. holdings 업데이트
  if (side === "buy") {
    const prevQty = cur?.qty ?? 0;
    const prevAvg = cur?.avg_cost ?? 0;
    const newQty = prevQty + qty;
    const newAvg = Math.round((prevAvg * prevQty + price * qty) / newQty);
    await supabase
      .from("holdings")
      .upsert(
        { user_id: userId, ticker, qty: newQty, avg_cost: newAvg },
        { onConflict: "user_id,ticker" },
      );
  } else {
    const newQty = (cur?.qty ?? 0) - qty;
    if (newQty <= 0) {
      await supabase
        .from("holdings")
        .delete()
        .eq("user_id", userId)
        .eq("ticker", ticker);
    } else {
      await supabase
        .from("holdings")
        .update({ qty: newQty })
        .eq("user_id", userId)
        .eq("ticker", ticker);
    }
  }

  // 3. cash 업데이트
  const { data: prof } = await supabase
    .from("profiles")
    .select("cash")
    .eq("id", userId)
    .single();
  const cashDelta = side === "buy" ? -(price * qty) : price * qty;
  await supabase
    .from("profiles")
    .update({ cash: (prof?.cash ?? 0) + cashDelta })
    .eq("id", userId);

  // 4. 거래 내역 기록
  await supabase
    .from("transactions")
    .insert({ user_id: userId, ticker, side, qty, price });

  // 5. 시장 충격 발행 → 다른 유저들이 Realtime으로 수신
  const tradeValue = qty * price;
  const marketCap = company.basePrice * SHARES_OUTSTANDING;
  const impact =
    (tradeValue / marketCap) * (side === "buy" ? 1 : -1) * IMPACT_AMP;
  await supabase
    .from("market_shocks")
    .insert({ ticker, impact, username: username ?? "anonymous" });
}

// ── Zustand 스토어 ────────────────────────────────────────────
export const useWorldStore = create((set, get) => ({
  // ── 상태 ──────────────────────────────────────────────────
  stocks: buildInitialStocks(),
  history: buildInitialHistory(),
  candles: buildInitialCandles(),
  trades: Object.fromEntries(COMPANIES.map((c) => [c.ticker, []])),
  news: [],
  selected: "NOVA",

  portfolio: {
    cash: 10_000_000,
    holdings: {}, // { ticker: { qty, avgCost } }
  },

  transactions: [],
  newsLoading: false,
  fearGreed: 50,
  rightTab: "order",
  timeframe: 10,

  // ── 단순 세터 ────────────────────────────────────────────
  setSelected: (ticker) => set({ selected: ticker }),
  setNewsLoading: (v) => set({ newsLoading: v }),
  setRightTab: (tab) => set({ rightTab: tab }),
  setTimeframe: (tf) => set({ timeframe: tf }),

  // ── 틱 업데이트 (marketEngine에서 호출) ──────────────────
  tickUpdate: (nextStocks, nextHistory, nextCandles, newTrades, fearGreed) =>
    set((state) => ({
      stocks: nextStocks,
      history: nextHistory,
      candles: nextCandles,
      fearGreed,
      trades: Object.fromEntries(
        COMPANIES.map((c) => [
          c.ticker,
          [
            ...(newTrades[c.ticker] ?? []),
            ...(state.trades[c.ticker] ?? []),
          ].slice(0, 30),
        ]),
      ),
    })),

  // ── 뉴스 충격 (newsEngine + Realtime에서 호출) ───────────
  applyShock: (affected) => {
    set((state) => {
      const next = { ...state.stocks };
      (affected ?? []).forEach(({ ticker, impact }) => {
        const s = next[ticker];
        if (!s) return;
        const pct = (impact ?? 0) / 100;
        const p = Math.max(Math.round(s.price * (1 + pct * 0.6)), 100);
        next[ticker] = {
          ...s,
          price: p,
          change: p - s.open,
          changePct: ((p - s.open) / s.open) * 100,
          momentum: (s.momentum ?? 0) + pct * 0.4,
          volume: s.volume + Math.abs(impact ?? 0) * 3000,
        };
      });
      return { stocks: next };
    });
  },

  // ── 뉴스 피드 ────────────────────────────────────────────
  pushNews: (item) =>
    set((state) => ({ news: [item, ...state.news].slice(0, 30) })),

  // ── 매수 ─────────────────────────────────────────────────
  buyStock: async (ticker, qty) => {
    const s = get().stocks[ticker];
    if (!s || qty <= 0) return false;
    const cost = s.price * qty;
    const { cash, holdings } = get().portfolio;
    if (cash < cost) return false;

    const cur = holdings[ticker] ?? { qty: 0, avgCost: 0 };
    const newQty = cur.qty + qty;
    const newAvg = Math.round((cur.avgCost * cur.qty + s.price * qty) / newQty);
    const ts = new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // 로컬 즉시 반영 (낙관적 업데이트)
    set((state) => ({
      portfolio: {
        cash: cash - cost,
        holdings: { ...holdings, [ticker]: { qty: newQty, avgCost: newAvg } },
      },
      transactions: [
        { ticker, side: "buy", qty, price: s.price, time: ts },
        ...state.transactions,
      ].slice(0, 100),
    }));

    // Supabase 비동기 저장 + 시장 충격 발행
    try {
      const { useAuthStore } = await import("./authStore");
      const { user, profile } = useAuthStore.getState();
      if (user) {
        await writeTrade(
          user.id,
          profile?.username,
          ticker,
          "buy",
          qty,
          s.price,
        );
      }
    } catch (e) {
      console.error("[buyStock] Supabase 오류:", e);
    }

    return true;
  },

  // ── 매도 ─────────────────────────────────────────────────
  sellStock: async (ticker, qty) => {
    const s = get().stocks[ticker];
    if (!s || qty <= 0) return false;
    const { cash, holdings } = get().portfolio;
    const cur = holdings[ticker];
    if (!cur || cur.qty < qty) return false;

    const newQty = cur.qty - qty;
    const newH = { ...holdings };
    if (newQty === 0) delete newH[ticker];
    else newH[ticker] = { ...cur, qty: newQty };

    const ts = new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    set((state) => ({
      portfolio: { cash: cash + s.price * qty, holdings: newH },
      transactions: [
        { ticker, side: "sell", qty, price: s.price, time: ts },
        ...state.transactions,
      ].slice(0, 100),
    }));

    try {
      const { useAuthStore } = await import("./authStore");
      const { user, profile } = useAuthStore.getState();
      if (user) {
        await writeTrade(
          user.id,
          profile?.username,
          ticker,
          "sell",
          qty,
          s.price,
        );
      }
    } catch (e) {
      console.error("[sellStock] Supabase 오류:", e);
    }

    return true;
  },
}));
