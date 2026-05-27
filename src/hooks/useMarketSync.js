import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useWorldStore } from "../store/worldStore";

/**
 * 다른 유저의 거래 충격을 실시간으로 구독해서 가격에 반영
 * market_shocks INSERT 이벤트 → applyShock()
 */
export function useMarketSync() {
  useEffect(() => {
    const channel = supabase
      .channel("market_shocks_stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "market_shocks" },
        (payload) => {
          const { ticker, impact } = payload.new;
          // impact는 소수 (0.02), applyShock은 % 단위 (2.0) 기대
          useWorldStore
            .getState()
            .applyShock([{ ticker, impact: impact * 100 }]);
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);
}
