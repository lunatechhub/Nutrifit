import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useState, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { format } from 'date-fns'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Circle, Text as SvgText } from 'react-native-svg'
import { useAppStore } from '@/stores/useAppStore'
import { theme, spacing, fontSize, radius } from '@/constants/theme'
import { fetchDayLogs, sumNutrition, fetchStreak, type MealLog } from '@/lib/foodAgent'
import { fetchWaterGlasses, addWaterGlass, removeLastWaterGlass, fetchLatestWeight } from '@/lib/health'
import LogFoodSheet from '@/components/nutrition/LogFoodSheet'
import LogWeightSheet from '@/components/LogWeightSheet'


const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function CalorieRing({ eaten, target }: { eaten: number; target: number }) {
  const progress = Math.min((eaten / target) * CIRCUMFERENCE, CIRCUMFERENCE)
  const remaining = target - eaten
  const isOver = eaten > target
  return (
    <Svg width={140} height={140} viewBox="0 0 140 140">
      <Circle cx="70" cy="70" r={RADIUS} fill="none" stroke={theme.border} strokeWidth="11" />
      <Circle
        cx="70" cy="70" r={RADIUS}
        fill="none"
        stroke={theme.accent}
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray={`${progress} ${CIRCUMFERENCE}`}
        transform="rotate(-90 70 70)"
      />
      {/* Calories eaten */}
      <SvgText x="70" y="58" textAnchor="middle" fill={theme.textPrimary} fontSize="26" fontWeight="800">
        {eaten.toLocaleString()}
      </SvgText>
      {/* kcal label */}
      <SvgText x="70" y="74" textAnchor="middle" fill={theme.textSecondary} fontSize="11" fontWeight="500">
        kcal
      </SvgText>
      {/* remaining / over */}
      <SvgText x="70" y="90" textAnchor="middle" fill={theme.accent} fontSize="10" fontWeight="700">
        {isOver ? `${(eaten - target).toLocaleString()} over` : `${remaining.toLocaleString()} left`}
      </SvgText>
    </Svg>
  )
}

function MacroBar({ label, eaten, target, opacity }: { label: string; eaten: number; target: number; opacity: number }) {
  const pct = Math.min((eaten / target) * 100, 100)
  return (
    <View style={{ gap: 5 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>{label}</Text>
        <Text style={{ color: theme.textPrimary, fontSize: fontSize.sm, fontWeight: '700' }}>
          {eaten}<Text style={{ color: theme.textSecondary, fontWeight: '400' }}>/{target}g</Text>
        </Text>
      </View>
      <View style={{ height: 6, backgroundColor: theme.surface, borderRadius: 99 }}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: theme.accent, opacity, borderRadius: 99 }} />
      </View>
    </View>
  )
}

export default function DashboardScreen() {
  const { user } = useAppStore()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [logSheetVisible, setLogSheetVisible] = useState(false)
  const [mealLogs, setMealLogs] = useState<MealLog[]>([])
  const [waterGlasses, setWaterGlasses] = useState(0)
  const [latestWeight, setLatestWeight] = useState<number | null>(null)
  const [weightSheetVisible, setWeightSheetVisible] = useState(false)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  const dateStr = format(new Date(), 'yyyy-MM-dd')

  const loadData = useCallback(async () => {
    setLoading(true)
    const [logs, glasses, weight, s] = await Promise.all([
      fetchDayLogs(dateStr),
      fetchWaterGlasses(dateStr),
      fetchLatestWeight(),
      fetchStreak(),
    ])
    setMealLogs(logs)
    setWaterGlasses(glasses)
    setLatestWeight(weight)
    setStreak(s)
    setLoading(false)
  }, [dateStr])

  useFocusEffect(useCallback(() => { loadData() }, [loadData]))

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  const initials = user?.name
    ?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'

  const target = user?.targetCalories ?? 2200
  const nutrition = sumNutrition(mealLogs)
  const eaten = nutrition.calories

  const quickActions: {
    label: string
    subtitle?: string
    icon: React.ComponentProps<typeof Ionicons>['name']
    primary: boolean
    onPress: () => void
  }[] = [
    { label: 'Log Food',  icon: 'nutrition-outline', primary: true,  onPress: () => setLogSheetVisible(true) },
    { label: 'Workout',   icon: 'barbell-outline',   primary: false, onPress: () => router.push('/(tabs)/workout') },
    { label: 'Log Weight', icon: 'scale-outline',    primary: false, subtitle: latestWeight != null ? `${latestWeight} kg` : undefined, onPress: () => setWeightSheetVisible(true) },
    { label: 'AI Coach',  icon: 'sparkles-outline',  primary: false, subtitle: 'Coming soon', onPress: () => {} },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingTop: insets.top + spacing.md,
          paddingBottom: 32,
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
          <View>
            <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>{today}</Text>
            <Text style={{ color: theme.textPrimary, fontSize: fontSize.xxl, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 }}>
              {greeting()},{'\n'}{user?.name?.split(' ')[0] ?? 'Athlete'}
            </Text>
          </View>
          <View style={{
            width: 48, height: 48, borderRadius: 999,
            backgroundColor: theme.accent,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: fontSize.md }}>{initials}</Text>
          </View>
        </View>

        {/* Calorie ring + macro bars */}
        <View style={{
          backgroundColor: theme.surface, borderRadius: radius.lg,
          borderWidth: 1, borderColor: theme.border,
          padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 20,
          marginBottom: spacing.sm,
        }}>
          {loading ? (
            <View style={{ width: 140, height: 140, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={theme.accent} size="large" />
            </View>
          ) : (
            <CalorieRing eaten={eaten} target={target} />
          )}
          <View style={{ flex: 1, gap: 14, opacity: loading ? 0.4 : 1 }}>
            <MacroBar label="Protein" eaten={nutrition.protein} target={user?.targetProtein ?? 140} opacity={1} />
            <MacroBar label="Carbs"   eaten={nutrition.carbs}   target={user?.targetCarbs ?? 220}  opacity={0.7} />
            <MacroBar label="Fat"     eaten={nutrition.fat}     target={user?.targetFat ?? 70}     opacity={0.45} />
          </View>
        </View>

        {/* Quick actions 2×2 */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.sm }}>
          {quickActions.map((a) => (
            <TouchableOpacity
              key={a.label}
              onPress={a.onPress}
              style={{
                width: '47.5%',
                backgroundColor: a.primary ? theme.accent : theme.surface,
                borderRadius: radius.md,
                borderWidth: a.primary ? 0 : 1,
                borderColor: theme.border,
                padding: 16,
                gap: 8,
              }}
            >
              <View style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: a.primary ? 'rgba(0,0,0,0.15)' : 'transparent',
                borderWidth: a.primary ? 0 : 1,
                borderColor: theme.border,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons
                  name={a.icon}
                  size={22}
                  color={a.primary ? theme.textPrimary : theme.accent}
                />
              </View>
              <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: fontSize.sm }}>
                {a.label}
              </Text>
              {a.subtitle && (
                <Text style={{ color: a.primary ? theme.textPrimary : theme.textSecondary, opacity: a.primary ? 0.8 : 1, fontSize: fontSize.xs, marginTop: -4 }}>
                  {a.subtitle}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Streak + Water */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{
            flex: 1, backgroundColor: theme.surface, borderRadius: radius.md,
            borderWidth: 1, borderColor: theme.border, padding: spacing.md, gap: 6,
          }}>
            <View style={{
              width: 38, height: 38, borderRadius: 11,
              borderWidth: 1, borderColor: theme.border,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="flame" size={20} color={theme.accent} />
            </View>
            <Text style={{ color: theme.textPrimary, fontSize: 28, fontWeight: '800', marginTop: 2 }}>
              {streak} <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, fontWeight: '500' }}>days</Text>
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>Logging streak</Text>
          </View>
          <View style={{
            flex: 1, backgroundColor: theme.surface, borderRadius: radius.md,
            borderWidth: 1, borderColor: theme.border, padding: spacing.md, gap: 6,
          }}>
            <View style={{
              width: 38, height: 38, borderRadius: 11,
              borderWidth: 1, borderColor: theme.border,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="water" size={20} color={theme.accent} />
            </View>
            <Text style={{ color: theme.textPrimary, fontSize: 28, fontWeight: '800', marginTop: 2 }}>
              {waterGlasses}<Text style={{ color: theme.textSecondary, fontWeight: '500', fontSize: fontSize.lg }}>/8</Text>
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>
              Glasses · <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{(waterGlasses * 0.25).toFixed(2)}</Text>
              <Text> / 2.0 L</Text>
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <TouchableOpacity
                onPress={async () => {
                  if (waterGlasses > 0) {
                    await removeLastWaterGlass(dateStr)
                    setWaterGlasses(w => w - 1)
                  }
                }}
                style={{
                  flex: 1, height: 32, borderRadius: 8,
                  backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="remove" size={18} color={waterGlasses > 0 ? theme.textPrimary : theme.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await addWaterGlass(dateStr)
                  setWaterGlasses(w => w + 1)
                }}
                style={{
                  flex: 1, height: 32, borderRadius: 8,
                  backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="add" size={18} color={theme.accent} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <LogFoodSheet
        visible={logSheetVisible}
        date={dateStr}
        onClose={() => setLogSheetVisible(false)}
        onLogged={() => { setLogSheetVisible(false); loadData() }}
      />

      <LogWeightSheet
        visible={weightSheetVisible}
        currentWeight={latestWeight}
        onClose={() => setWeightSheetVisible(false)}
        onLogged={(kg) => { setWeightSheetVisible(false); setLatestWeight(kg) }}
      />
    </View>
  )
}