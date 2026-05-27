import { COMPANIES } from "../data/companies";
import { useWorldStore } from "../store/worldStore";
import { timeStr } from "../utils/format";

const tickCounters = {}; // 로컬 틱 카운터 (리렌더 없이 유지)

export function tick() {
  const store = useWorldStore.getState();
  const { stocks, history, candles, timeframe } = store;
  const ts = timeStr();

  const nextStocks = {};
  const nextHistory = {};
  const nextCandles = {};
  const newTrades = {};

  COMPANIES.forEach((c) => {
    const s = stocks[c.ticker];
    if (!s) return;

    // 가격 업데이트
    const drift = (Math.random() - 0.499) * s.vol;
    const momEffect = s.momentum * 0.3;
    const newMom =
      Math.abs(s.momentum * 0.55) > 0.00005 ? s.momentum * 0.55 : 0;
    const newPrice = Math.max(
      Math.round(s.price * (1 + drift + momEffect)),
      100,
    );
    const volPulse = Math.floor(
      Math.random() * 600 + 100 + Math.abs(s.momentum) * 8000,
    );

    nextStocks[c.ticker] = {
      ...s,
      price: newPrice,
      change: newPrice - s.open,
      changePct: ((newPrice - s.open) / s.open) * 100,
      volume: s.volume + volPulse,
      momentum: newMom,
    };

    // 히스토리
    const prevH = history[c.ticker] ?? [];
    nextHistory[c.ticker] = [
      ...prevH.slice(-79),
      {
        t: ts,
        p: newPrice,
        v: Math.floor(
          Math.random() * 2500 + 200 + Math.abs(s.momentum) * 12000,
        ),
      },
    ];

    // 캔들 업데이트
    tickCounters[c.ticker] = (tickCounters[c.ticker] || 0) + 1;
    const prevC = candles[c.ticker] ?? [];
    if (tickCounters[c.ticker] >= timeframe || prevC.length === 0) {
      tickCounters[c.ticker] = 0;
      const prevClose = prevC[prevC.length - 1]?.close ?? newPrice;
      nextCandles[c.ticker] = [
        ...prevC.slice(-99),
        {
          t: ts,
          open: prevClose,
          high: newPrice,
          low: newPrice,
          close: newPrice,
          volume: volPulse,
        },
      ];
    } else {
      const last = prevC[prevC.length - 1];
      nextCandles[c.ticker] = [
        ...prevC.slice(0, -1),
        {
          ...last,
          high: Math.max(last.high, newPrice),
          low: Math.min(last.low, newPrice),
          close: newPrice,
          volume: last.volume + volPulse,
        },
      ];
    }

    // 체결 생성
    newTrades[c.ticker] = Array.from(
      { length: Math.floor(Math.random() * 2) + 1 },
      () => ({
        price: newPrice + Math.round((Math.random() - 0.5) * newPrice * 0.0005),
        qty: Math.floor(Math.random() * 500 + 10),
        side: Math.random() > 0.5 ? "buy" : "sell",
        time: ts,
      }),
    );
  });

  store.tickUpdate(
    nextStocks,
    nextHistory,
    nextCandles,
    newTrades,
    calcFearGreed(nextStocks),
  );
}

function calcFearGreed(stocks) {
  const avg =
    COMPANIES.reduce((a, c) => a + (stocks[c.ticker]?.changePct || 0), 0) /
    COMPANIES.length;
  return Math.max(0, Math.min(100, Math.round(((avg + 8) / 16) * 100)));
}

export function calcMarketIndex(stocks) {
  const sum = COMPANIES.reduce((a, c) => {
    const s = stocks[c.ticker];
    return s ? a + s.price / c.basePrice : a;
  }, 0);
  return Math.round((sum / COMPANIES.length) * 1000);
}
