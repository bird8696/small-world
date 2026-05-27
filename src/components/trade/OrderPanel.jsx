import { useState } from "react";
import { useWorldStore } from "../../store/worldStore";
import { won, pctColor, pctStr } from "../../utils/format";

// 수량 퍼센트 버튼
const PCT_BTNS = [10, 25, 50, 100];

function BuyPanel({ stock, holding, portfolio }) {
  const buyStock = useWorldStore((s) => s.buyStock);
  const [qty, setQty] = useState("");
  const [type, setType] = useState("market"); // 'market' | 'limit'
  const [limitPrice, setLimitPrice] = useState("");

  const price =
    type === "market" ? stock.price : parseInt(limitPrice) || stock.price;
  const parsedQty = Math.max(0, parseInt(qty) || 0);
  const maxQty = Math.floor(portfolio.cash / price);
  const estimate = price * parsedQty;

  const setPct = (pct) => setQty(String(Math.floor((maxQty * pct) / 100)));

  const handleBuy = async () => {
    if (parsedQty <= 0) return;
    const ok = await buyStock(stock.ticker, parsedQty);
    if (ok) setQty("");
    else alert("현금이 부족합니다");
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "10px 12px",
        gap: 8,
      }}
    >
      {/* 주문 유형 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
        {["market", "limit"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              padding: "5px 0",
              fontSize: 10,
              fontWeight: 600,
              borderRadius: 5,
              background: type === t ? "#22c55e22" : "var(--surface2)",
              color: type === t ? "#22c55e" : "var(--muted)",
              border:
                type === t
                  ? "0.5px solid #22c55e66"
                  : "0.5px solid var(--border)",
            }}
          >
            {t === "market" ? "시장가" : "지정가"}
          </button>
        ))}
      </div>

      {/* 지정가 입력 */}
      {type === "limit" && (
        <div>
          <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 3 }}>
            주문가격 (원)
          </div>
          <input
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder={stock.price?.toLocaleString()}
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>
      )}

      {/* 수량 */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 3,
          }}
        >
          <span style={{ fontSize: 9, color: "var(--muted)" }}>수량</span>
          <span style={{ fontSize: 9, color: "var(--muted)" }}>
            최대{" "}
            <span style={{ color: "#22c55e", fontWeight: 600 }}>
              {maxQty.toLocaleString()}
            </span>
            주
          </span>
        </div>
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="0"
          style={{ width: "100%", boxSizing: "border-box" }}
        />
      </div>

      {/* % 버튼 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 4,
        }}
      >
        {PCT_BTNS.map((p) => (
          <button
            key={p}
            onClick={() => setPct(p)}
            style={{
              padding: "4px 0",
              fontSize: 9,
              fontWeight: 600,
              background: "var(--surface2)",
              color: "var(--muted)",
              border: "0.5px solid var(--border)",
              borderRadius: 4,
            }}
          >
            {p}%
          </button>
        ))}
      </div>

      {/* 정보 */}
      <div
        style={{
          background: "var(--surface2)",
          borderRadius: 6,
          padding: "8px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
          }}
        >
          <span style={{ color: "var(--muted)" }}>현재가</span>
          <span style={{ fontWeight: 600 }}>{won(stock.price)}원</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
          }}
        >
          <span style={{ color: "var(--muted)" }}>주문금액</span>
          <span
            style={{
              fontWeight: 600,
              color: parsedQty > 0 ? "#22c55e" : "var(--text)",
            }}
          >
            {parsedQty > 0 ? won(estimate) + "원" : "-"}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
          }}
        >
          <span style={{ color: "var(--muted)" }}>주문 후 잔고</span>
          <span style={{ fontWeight: 600 }}>
            {parsedQty > 0
              ? won(portfolio.cash - estimate) + "원"
              : won(portfolio.cash) + "원"}
          </span>
        </div>
      </div>

      {/* 매수 버튼 */}
      <button
        onClick={handleBuy}
        disabled={parsedQty <= 0 || estimate > portfolio.cash}
        style={{
          padding: "11px 0",
          fontSize: 13,
          fontWeight: 700,
          background:
            parsedQty > 0 && estimate <= portfolio.cash
              ? "#22c55e"
              : "#22c55e44",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          transition: "background .15s",
        }}
      >
        {parsedQty > 0 ? `${parsedQty.toLocaleString()}주 매수` : "매수"}
      </button>
    </div>
  );
}

function SellPanel({ stock, holding, portfolio }) {
  const sellStock = useWorldStore((s) => s.sellStock);
  const [qty, setQty] = useState("");
  const [type, setType] = useState("market");
  const [limitPrice, setLimitPrice] = useState("");

  const price =
    type === "market" ? stock.price : parseInt(limitPrice) || stock.price;
  const parsedQty = Math.max(0, parseInt(qty) || 0);
  const heldQty = holding?.qty ?? 0;
  const estimate = price * parsedQty;

  const profitAmt = holding ? (stock.price - holding.avgCost) * heldQty : 0;
  const profitPct = holding?.avgCost
    ? ((stock.price - holding.avgCost) / holding.avgCost) * 100
    : 0;

  const setPct = (pct) => setQty(String(Math.floor((heldQty * pct) / 100)));

  const handleSell = async () => {
    if (parsedQty <= 0) return;
    const ok = await sellStock(stock.ticker, parsedQty);
    if (ok) setQty("");
    else alert("보유 수량이 부족합니다");
  };

  if (heldQty === 0)
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          style={{ textAlign: "center", color: "var(--muted)", fontSize: 12 }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
          보유 중인 {stock.ticker} 없음
        </div>
      </div>
    );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "10px 12px",
        gap: 8,
      }}
    >
      {/* 주문 유형 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
        {["market", "limit"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              padding: "5px 0",
              fontSize: 10,
              fontWeight: 600,
              borderRadius: 5,
              background: type === t ? "#ef444422" : "var(--surface2)",
              color: type === t ? "#ef4444" : "var(--muted)",
              border:
                type === t
                  ? "0.5px solid #ef444466"
                  : "0.5px solid var(--border)",
            }}
          >
            {t === "market" ? "시장가" : "지정가"}
          </button>
        ))}
      </div>

      {/* 지정가 입력 */}
      {type === "limit" && (
        <div>
          <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 3 }}>
            주문가격 (원)
          </div>
          <input
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder={stock.price?.toLocaleString()}
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>
      )}

      {/* 보유 정보 */}
      <div
        style={{
          background: "var(--surface2)",
          borderRadius: 6,
          padding: "8px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
          }}
        >
          <span style={{ color: "var(--muted)" }}>보유수량</span>
          <span style={{ fontWeight: 600 }}>{heldQty.toLocaleString()}주</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
          }}
        >
          <span style={{ color: "var(--muted)" }}>평균단가</span>
          <span style={{ fontWeight: 600 }}>{won(holding?.avgCost)}원</span>
        </div>
        <div
          style={{
            borderTop: "0.5px solid var(--border)",
            paddingTop: 4,
            marginTop: 2,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
          }}
        >
          <span style={{ color: "var(--muted)" }}>평가손익</span>
          <span style={{ fontWeight: 700, color: pctColor(profitPct) }}>
            {profitAmt >= 0 ? "+" : ""}
            {won(profitAmt)}원 &nbsp;({profitPct >= 0 ? "+" : ""}
            {profitPct.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* 수량 */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 3,
          }}
        >
          <span style={{ fontSize: 9, color: "var(--muted)" }}>수량</span>
          <span style={{ fontSize: 9, color: "var(--muted)" }}>
            최대{" "}
            <span style={{ color: "#ef4444", fontWeight: 600 }}>
              {heldQty.toLocaleString()}
            </span>
            주
          </span>
        </div>
        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="0"
          style={{ width: "100%", boxSizing: "border-box" }}
        />
      </div>

      {/* % 버튼 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 4,
        }}
      >
        {PCT_BTNS.map((p) => (
          <button
            key={p}
            onClick={() => setPct(p)}
            style={{
              padding: "4px 0",
              fontSize: 9,
              fontWeight: 600,
              background: "var(--surface2)",
              color: "var(--muted)",
              border: "0.5px solid var(--border)",
              borderRadius: 4,
            }}
          >
            {p}%
          </button>
        ))}
      </div>

      {/* 예상 수익 */}
      {parsedQty > 0 && (
        <div
          style={{
            background: "var(--surface2)",
            borderRadius: 6,
            padding: "8px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
            }}
          >
            <span style={{ color: "var(--muted)" }}>매도금액</span>
            <span style={{ fontWeight: 600, color: "#ef4444" }}>
              {won(estimate)}원
            </span>
          </div>
          {holding && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
              }}
            >
              <span style={{ color: "var(--muted)" }}>실현손익</span>
              <span
                style={{
                  fontWeight: 600,
                  color: pctColor(stock.price - holding.avgCost),
                }}
              >
                {stock.price - holding.avgCost >= 0 ? "+" : ""}
                {won((stock.price - holding.avgCost) * parsedQty)}원
              </span>
            </div>
          )}
        </div>
      )}

      {/* 매도 버튼 */}
      <button
        onClick={handleSell}
        disabled={parsedQty <= 0 || parsedQty > heldQty}
        style={{
          padding: "11px 0",
          fontSize: 13,
          fontWeight: 700,
          background:
            parsedQty > 0 && parsedQty <= heldQty ? "#ef4444" : "#ef444444",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          transition: "background .15s",
        }}
      >
        {parsedQty > 0 ? `${parsedQty.toLocaleString()}주 매도` : "매도"}
      </button>
    </div>
  );
}

export default function OrderPanel() {
  const [tab, setTab] = useState("buy");
  const selected = useWorldStore((s) => s.selected);
  const stock = useWorldStore((s) => s.stocks[selected] ?? {});
  const holding = useWorldStore((s) => s.portfolio.holdings[selected]);
  const portfolio = useWorldStore((s) => s.portfolio);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderBottom: "0.5px solid var(--border)",
        flexShrink: 0,
      }}
    >
      {/* 탭 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <button
          onClick={() => setTab("buy")}
          style={{
            padding: "9px 0",
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 0,
            background: tab === "buy" ? "#22c55e18" : "var(--surface2)",
            color: tab === "buy" ? "#22c55e" : "var(--muted)",
            border: "none",
            borderBottom:
              tab === "buy" ? "2px solid #22c55e" : "2px solid transparent",
          }}
        >
          ▲ 매수
        </button>
        <button
          onClick={() => setTab("sell")}
          style={{
            padding: "9px 0",
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 0,
            background: tab === "sell" ? "#ef444418" : "var(--surface2)",
            color: tab === "sell" ? "#ef4444" : "var(--muted)",
            border: "none",
            borderBottom:
              tab === "sell" ? "2px solid #ef4444" : "2px solid transparent",
          }}
        >
          ▼ 매도
        </button>
      </div>

      {/* 종목 정보 바 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 12px",
          background: "var(--surface2)",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700 }}>{selected}</span>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>
            {won(stock.price)}원
          </span>
          <span
            style={{
              fontSize: 10,
              color: pctColor(stock.changePct),
              marginLeft: 6,
            }}
          >
            {pctStr(stock.changePct)}
          </span>
        </div>
      </div>

      {/* 패널 */}
      {tab === "buy" ? (
        <BuyPanel stock={stock} holding={holding} portfolio={portfolio} />
      ) : (
        <SellPanel stock={stock} holding={holding} portfolio={portfolio} />
      )}
    </div>
  );
}
