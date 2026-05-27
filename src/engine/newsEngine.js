import { COMPANIES } from "../data/companies";
import { useWorldStore } from "../store/worldStore";
import { pctStr, won } from "../utils/format";

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

// 카테고리별 배지 색상
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

/**
 * AI 뉴스 생성 — Claude API 호출
 *
 * 1. 현재 시장 상황(종목별 가격·등락률, 분위기)을 프롬프트에 주입
 * 2. Claude가 JSON 뉴스 반환
 * 3. applyShock()으로 해당 종목 가격에 즉시 충격 반영
 */
export async function generateNews() {
  const store = useWorldStore.getState();
  if (store.newsLoading) return;

  store.setNewsLoading(true);

  // 현재 시장 상황 요약
  const priceInfo = COMPANIES.map((c) => {
    const s = store.stocks[c.ticker];
    return `${c.ticker}(${c.name}) ${won(s?.price ?? c.basePrice)}원 ${pctStr(s?.changePct)}`;
  }).join(" / ");

  const avgChg =
    COMPANIES.reduce(
      (a, c) => a + (store.stocks[c.ticker]?.changePct ?? 0),
      0,
    ) / COMPANIES.length;

  const mood =
    avgChg > 1.5
      ? "강세장"
      : avgChg > 0
        ? "상승"
        : avgChg > -1.5
          ? "하락"
          : "약세장";

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true", // ← 이거 추가
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: `주식 시뮬레이션 뉴스 생성기. 아래 기업 중 1~3개에 영향을 주는 현실적인 금융 뉴스를 하나 만들어.

기업 현황: ${priceInfo}
시장 분위기: ${mood}

JSON만 반환 (마크다운 없이):
{"headline":"제목 25자 이내","body":"본문 2문장. 구체적으로.","category":"실적|인수합병|규제|거시경제|스캔들|신제품|계약|사고","affected":[{"ticker":"코드","impact":숫자}],"severity":"low|medium|high|extreme"}

impact 규칙: -25~+25 (양수=호재 음수=악재). extreme±15~25 / high±8~15 / medium±3~8 / low±1~3`,
          },
        ],
      }),
    });

    const data = await res.json();
    const raw = (data.content?.[0]?.text ?? "")
      .replace(/```[a-z]*|```/g, "")
      .trim();
    const p = JSON.parse(raw);

    store.pushNews({
      id: Date.now(),
      headline: p.headline ?? "시장 동향 업데이트",
      body: p.body ?? "",
      category: p.category ?? "거시경제",
      affected: p.affected ?? [],
      severity: p.severity ?? "medium",
      catColor: CAT_COLORS[p.category] ?? "#888",
      time: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    store.applyShock(p.affected ?? []);
  } catch (e) {
    console.error("[newsEngine] 뉴스 생성 실패:", e);
  } finally {
    store.setNewsLoading(false);
  }
}
