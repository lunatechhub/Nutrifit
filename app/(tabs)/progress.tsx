import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg'
import { useState, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { useAppStore } from '@/stores/useAppStore'
import { theme, spacing, fontSize, radius } from '@/constants/theme'
import { fetchWeightHistory } from '@/lib/health'

const PERIODS = ['30D', '90D', '1Y'] as const
type Period = typeof PERIODS[number]

const DAYS = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr']
const BAR_HEIGHTS = [78, 90, 70, 96, 84, 74, 58]

const RECORDS = [
  { label: 'Bench press', value: '--', unit: 'kg' },
  { label: 'Back squat', value: '--', unit: 'kg' },
  { label: 'Deadlift', value: '--', unit: 'kg' },
]

const PERIOD_DAYS: Record<Period, number> = { '30D': 30, '90D': 90, '1Y': 365 }

function WeightChart({ data }: { data: Array<{ date: string; weight: number }> }) {
  if (data.length < 2) {
    return (
      <View style={{ height: 110, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.textMuted, fontSize: fontSize.sm }}>
          {data.length === 1 ? 'Log one more entry to see a chart' : 'No weight data yet'}
        </Text>
      </View>
    )
  }

  const W = 311
  const H = 110
  const PAD = { top: 10, bottom: 20, left: 0, right: 0 }
  const chartH = H - PAD.top - PAD.bottom

  const weights = data.map(d => d.weight)
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const range = maxW - minW || 1

  const toX = (i: number) => (i / (data.length - 1)) * W
  const toY = (w: number) => PAD.top + chartH - ((w - minW) / range) * chartH

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.weight) }))
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${W} ${H} L0 ${H} Z`

  const last = points[points.length - 1]
  const first = data[0]
  const lastEntry = data[data.length - 1]

  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <Line x1="0" y1={PAD.top + chartH * 0.33} x2={W} y2={PAD.top + chartH * 0.33} stroke={theme.border} strokeWidth="1" />
      <Line x1="0" y1={PAD.top + chartH * 0.66} x2={W} y2={PAD.top + chartH * 0.66} stroke={theme.border} strokeWidth="1" />
      <Path d={areaPath} fill={theme.accent} fillOpacity={0.08} />
      <Path d={linePath} fill="none" stroke={theme.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last.x} cy={last.y} r="4" fill={theme.accent} />
      <SvgText x={0} y={H} fill={theme.textMuted} fontSize="10">{first.date.slice(5)}</SvgText>
      <SvgText x={W} y={H} textAnchor="end" fill={theme.textMuted} fontSize="10">{lastEntry.date.slice(5)}</SvgText>
    </Svg>
  )
}

export default function ProgressScreen() {
  const { user } = useAppStore()
  const insets = useSafeAreaInsets()
  const [period, setPeriod] = useState<Period>('30D')
  const [weightHistory, setWeightHistory] = useState<Array<{ date: string; weight: number }>>([])

  const loadHistory = useCallback(async () => {
    const data = await fetchWeightHistory(PERIOD_DAYS[period])
    setWeightHistory(data)
  }, [period])

  useFocusEffect(useCallback(() => { loadHistory() }, [loadHistory]))

  const latestWeight = weightHistory.length > 0
    ? weightHistory[weightHistory.length - 1].weight
    : (user?.weight ?? null)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ padding: spacing.md, paddingTop: insets.top + spacing.md, paddingBottom: 32 }}
    >
      {/* Header + period toggle */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <Text style={{ color: theme.textPrimary, fontSize: fontSize.xxl, fontWeight: '800', letterSpacing: -0.3 }}>Progress</Text>
        <View style={{
          flexDirection: 'row', gap: 2,
          backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
          borderRadius: 999, padding: 3,
        }}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={{
                paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999,
                backgroundColor: period === p ? theme.accent : 'transparent',
              }}
            >
              <Text style={{
                fontSize: 11.5, fontWeight: '800',
                color: period === p ? theme.textPrimary : theme.textSecondary,
              }}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Weight chart */}
      <View style={{
        backgroundColor: theme.surface, borderRadius: radius.md,
        borderWidth: 1, borderColor: theme.border,
        padding: spacing.md, gap: 8, marginBottom: spacing.sm,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <View>
            <Text style={{ color: theme.textSecondary, fontSize: fontSize.xs, fontWeight: '600', letterSpacing: 0.5 }}>
              WEIGHT
            </Text>
            <Text style={{ color: theme.textPrimary, fontSize: 28, fontWeight: '800' }}>
              {latestWeight ?? '--'}{' '}
              <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, fontWeight: '500' }}>kg</Text>
            </Text>
          </View>
          {weightHistory.length > 1 && (() => {
            const delta = weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight
            return (
              <Text style={{ color: theme.accent, fontWeight: '800', fontSize: fontSize.sm }}>
                {delta > 0 ? '+' : ''}{delta.toFixed(1)} kg
              </Text>
            )
          })()}
        </View>

        <WeightChart data={weightHistory} />
      </View>

      {/* Calorie bar chart */}
      <View style={{
        backgroundColor: theme.surface, borderRadius: radius.md,
        borderWidth: 1, borderColor: theme.border,
        padding: spacing.md, gap: 10, marginBottom: spacing.md,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ color: theme.textSecondary, fontSize: fontSize.xs, fontWeight: '600', letterSpacing: 0.5 }}>
            CALORIES · LAST 7 DAYS
          </Text>
          <Text style={{ color: theme.textPrimary, fontSize: fontSize.sm, fontWeight: '800' }}>avg --</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 74 }}>
          {BAR_HEIGHTS.map((h, i) => (
            <View key={i} style={{
              flex: 1,
              height: `${h}%`,
              backgroundColor: theme.accent,
              borderRadius: 5,
              opacity: i < BAR_HEIGHTS.length - 1 ? 0.4 : 1,
            }} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {DAYS.map((d) => (
            <Text key={d} style={{ flex: 1, textAlign: 'center', color: theme.textSecondary, fontSize: 10.5 }}>{d}</Text>
          ))}
        </View>
      </View>

      {/* Personal records */}
      <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: fontSize.md, marginBottom: spacing.sm }}>
        Personal records
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {RECORDS.map((r) => (
          <View key={r.label} style={{
            flex: 1, backgroundColor: theme.surface,
            borderRadius: radius.md, borderWidth: 1, borderColor: theme.border,
            padding: 14, gap: 3,
          }}>
            <Text style={{ fontSize: 16 }}>🏆</Text>
            <Text style={{ color: theme.textPrimary, fontSize: 19, fontWeight: '800' }}>
              {r.value}
              <Text style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '500' }}> {r.unit}</Text>
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 11 }}>{r.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}