import { useEffect } from 'react'
import { tick } from '../engine/marketEngine'
import { startBots, stopBots } from '../engine/bots'

const TICK_MS = 2000  // 2초 틱

/**
 * 가격 틱 루프 + 봇 시작/종료
 * App 최상단에서 한 번만 호출
 */
export function useMarket() {
  useEffect(() => {
    const id = setInterval(tick, TICK_MS)
    startBots()
    return () => {
      clearInterval(id)
      stopBots()
    }
  }, [])
}
