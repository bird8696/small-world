import { useEffect } from "react";
import {
  generateSessionNews,
  getCurrentSessionIdx,
} from "../engine/newsEngine";

export function useNews() {
  useEffect(() => {
    // ── 수동 모드 (현재 활성) ─────────────────────────────
    // 앱 시작 시 1회 자동 생성, 이후는 헤더 버튼으로 수동 생성
    generateSessionNews();

    // ── 자동 모드 (6시간 간격 운영용) ────────────────────
    // 주석 해제하면 자동 전환
    //
    // let lastFiredSession = getCurrentSessionIdx()
    // const IS_DEV = import.meta.env.DEV
    // const interval = IS_DEV ? 15 * 60 * 1000 : 60 * 1000
    //
    // const checkAndFire = () => {
    //   const current = getCurrentSessionIdx()
    //   if (current !== lastFiredSession) {
    //     lastFiredSession = current
    //     generateSessionNews()
    //   }
    // }
    //
    // const id = setInterval(checkAndFire, interval)
    // return () => clearInterval(id)
  }, []);
}
