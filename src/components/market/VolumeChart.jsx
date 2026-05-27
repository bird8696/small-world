import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useWorldStore } from '../../store/worldStore'
import { won } from '../../utils/format'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface)', border: '0.5px solid var(--border)',
      borderRadius: 8, padding: '5px 9px', fontSize: 11,
    }}>
      거래량 {won(payload[0].value)}
    </div>
  )
}

export default function VolumeChart() {
  const selected = useWorldStore(s => s.selected)
  const history  = useWorldStore(s => s.history[selected] ?? [])
  const stocks   = useWorldStore(s => s.stocks[selected] ?? {})

  const chartData = history.slice(-60)
  const isUp      = (stocks.changePct ?? 0) >= 0
  const barColor  = isUp ? '#22c55e' : '#ef4444'

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 4, right: 6, bottom: 0, left: 0 }}>
        <YAxis
          tick={{ fontSize: 8, fill: 'var(--muted)' }}
          tickLine={false} axisLine={false}
          width={52}
          tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}K` : v}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="v"
          fill={barColor}
          opacity={0.45}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
