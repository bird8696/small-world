import { COMPANIES } from "../data/companies";
import { useWorldStore } from "../store/worldStore";
import { pctStr } from "../utils/format";

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const CAT_COLORS = {
  실적: "#4E9EE8",
  인수합병: "#B04EE8",
  규제: "#E87A4E",
  거시경제: "#4EE8D5",
  스캔들: "#E84E6A",
  신제품: "#4EE8A0",
  계약: "#E8C94E",
  사고: "#E84E4E",
};

export const SESSIONS = [
  { hour: 0, label: "새벽 동향", theme: "야간 선물 및 해외 시장 동향 반영" },
  { hour: 6, label: "장 시작", theme: "개장 초반 매수세 및 외국인 동향" },
  { hour: 12, label: "오전장", theme: "오전 거래 결산 및 오후 장 전망" },
  { hour: 18, label: "장 마감", theme: "당일 거래 정리 및 시간외 동향" },
];

export function getCurrentSessionIdx() {
  const h = new Date().getHours();
  if (h < 6) return 0;
  if (h < 12) return 1;
  if (h < 18) return 2;
  return 3;
}

export async function generateSessionNews() {
  const store = useWorldStore.getState();
  if (store.newsLoading) return;

  store.setNewsLoading(true);
  console.log("[newsEngine] 뉴스 생성 시작...");

  const session = SESSIONS[getCurrentSessionIdx()];

  const companyStatus = COMPANIES.map((c) => {
    const s = store.stocks[c.ticker];
    return `${c.ticker}(${c.name}/${c.sector}) ${pctStr(s?.changePct)}`;
  }).join(" | ");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `[${session.label}] 주식 시장 뉴스 생성기.
테마: ${session.theme}

기업 현황: ${companyStatus}

8개 기업 각각에 대한 뉴스 1개씩 만들어줘.
JSON 배열만 반환. 다른 텍스트 없이:
[{"ticker":"NOVA","headline":"20자이내","body":"1문장","category":"실적|인수합병|규제|거시경제|스캔들|신제품|계약|사고","impact":숫자,"severity":"low|medium|high|extreme"},{"ticker":"ARCO",...},{"ticker":"BIOM",...},{"ticker":"TREK",...},{"ticker":"MIRA",...},{"ticker":"VOLT",...},{"ticker":"GAIA",...},{"ticker":"AXIS",...}]

impact 규칙: 반드시 부호 없는 정수 또는 음의 정수. +기호 사용 금지. 예) 8, -5, 12, -3
severity: low±1~3 medium±3~8 high±8~15 extreme±15~25`,
          },
        ],
      }),
    });

    console.log("[newsEngine] API 응답 status:", res.status);

    if (!res.ok) {
      const errText = await res.text();
      console.error("[newsEngine] API 오류:", errText);
      return;
    }

    const data = await res.json();
    const rawText = data.content?.[0]?.text ?? "";
    console.log("[newsEngine] 원본 텍스트:", rawText);

    // 1. 코드블록 마커 제거
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    // 2. JSON 배열 추출
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error("[newsEngine] JSON 배열을 찾을 수 없음:", cleaned);
      return;
    }

    // 3. +8 같은 잘못된 양수 표기 제거 (JSON 표준 아님)
    const fixed = match[0].replace(/:(\s*)\+(\d)/g, ":$1$2");

    const list = JSON.parse(fixed);
    console.log("[newsEngine] 파싱된 뉴스:", list.length, "개");

    const now = new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const shocks = [];

    list.forEach((p, i) => {
      if (!p?.ticker) return;
      useWorldStore.getState().pushNews({
        id: Date.now() + i,
        headline: p.headline ?? "시장 동향",
        body: p.body ?? "",
        category: p.category ?? "거시경제",
        affected: [{ ticker: p.ticker, impact: p.impact ?? 0 }],
        severity: p.severity ?? "low",
        catColor: CAT_COLORS[p.category] ?? "#888",
        session: session.label,
        time: now,
      });
      shocks.push({ ticker: p.ticker, impact: p.impact ?? 0 });
    });

    useWorldStore.getState().applyShock(shocks);
    console.log("[newsEngine] 완료 —", shocks.length, "개 종목 충격 적용");
  } catch (e) {
    console.error("[newsEngine] 오류:", e);
  } finally {
    useWorldStore.getState().setNewsLoading(false);
  }
}
