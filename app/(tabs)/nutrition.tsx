import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useState, useCallback } from 'react'
import { format, addDays, isToday, isYesterday } from 'date-fns'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { useAppStore } from '@/stores/useAppStore'
import { Ionicons } from '@expo/vector-icons'
import { theme, spacing, fontSize, radius } from '@/constants/theme'
import { fetchDayLogs, sumNutrition, deleteFoodItem, copyLogsToDate, MealLog, MealType } from '@/lib/foodAgent'
import LogFoodSheet from '@/components/nutrition/LogFoodSheet'

const MEALS: { label: string; key: MealType }[] = [
  { label: 'Breakfast', key: 'breakfast' },
  { label: 'Lunch', key: 'lunch' },
  { label: 'Dinner', key: 'dinner' },
  { label: 'Snacks', key: 'snack' },
]

function formatDateLabel(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEE, MMM d')
}

export default function NutritionScreen() {
  const { user } = useAppStore()
  const insets = useSafeAreaInsets()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [mealLogs, setMealLogs] = useState<MealLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copying, setCopying] = useState(false)

  async function handleCopyYesterday() {
    const yesterday = format(addDays(currentDate, -1), 'yyyy-MM-dd')
    setCopying(true)
    try {
      await copyLogsToDate(yesterday, dateStr)
      await loadLogs()
    } catch (e) {
      Alert.alert('Nothing to copy', e instanceof Error ? e.message : 'No meals logged yesterday.')
    } finally {
      setCopying(false)
    }
  }

  const handleDeleteItem = (itemId: string, itemName: string) => {
    Alert.alert('Remove item', `Remove "${itemName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          setDeletingId(itemId)
          try {
            await deleteFoodItem(itemId)
            await loadLogs()
          } finally {
            setDeletingId(null)
          }
        },
      },
    ])
  }

  const dateStr = format(currentDate, 'yyyy-MM-dd')
  const dateLabel = formatDateLabel(currentDate)
  const dateSubLabel = format(currentDate, 'EEEE, MMM d')

  const target = user?.targetCalories ?? 2200
  const targetProtein = user?.targetProtein ?? 140
  const targetCarbs = user?.targetCarbs ?? 220
  const targetFat = user?.targetFat ?? 70

  const loadLogs = useCallback(async () => {
    setLoadingLogs(true)
    try {
      const logs = await fetchDayLogs(dateStr)
      setMealLogs(logs)
    } finally {
      setLoadingLogs(false)
    }
  }, [dateStr])

  useFocusEffect(useCallback(() => { loadLogs() }, [loadLogs]))

  const nutrition = sumNutrition(mealLogs)
  const eaten = nutrition.calories
  const remaining = target - eaten
  const caloriePercent = Math.min(eaten / target, 1)

  function getMealItems(mealKey: MealType) {
    return mealLogs.filter(l => l.mealType === mealKey).flatMap(l => l.items)
  }

  function getMealCalories(mealKey: MealType) {
    return Math.round(getMealItems(mealKey).reduce((s, i) => s + i.calories, 0))
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{
        padding: spacing.md,
        paddingTop: insets.top + spacing.md,
        paddingBottom: 32,
      }}>
        {/* Date nav */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
          <TouchableOpacity
            onPress={() => setCurrentDate(d => addDays(d, -1))}
            style={{
              width: 38, height: 38, borderRadius: 999,
              backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: theme.textPrimary, fontSize: 20 }}>‹</Text>
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: fontSize.lg }}>{dateLabel}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>{dateSubLabel}</Text>
          </View>

          <TouchableOpacity
            onPress={() => setCurrentDate(d => addDays(d, 1))}
            style={{
              width: 38, height: 38, borderRadius: 999,
              backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: theme.textPrimary, fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Copy yesterday — only shown when today has no logs */}
        {mealLogs.length === 0 && !loadingLogs && (
          <TouchableOpacity
            onPress={handleCopyYesterday}
            disabled={copying}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              backgroundColor: theme.surface, borderRadius: radius.md,
              borderWidth: 1, borderColor: theme.border,
              paddingVertical: 10, marginBottom: spacing.sm,
              opacity: copying ? 0.5 : 1,
            }}
          >
            {copying
              ? <ActivityIndicator size="small" color={theme.accent} />
              : <>
                  <Ionicons name="copy-outline" size={16} color={theme.accent} />
                  <Text style={{ color: theme.accent, fontWeight: '700', fontSize: fontSize.sm }}>
                    Copy yesterday's meals
                  </Text>
                </>
            }
          </TouchableOpacity>
        )}

        {/* Calorie summary card */}
        <View style={{
          backgroundColor: theme.surface, borderRadius: radius.lg,
          borderWidth: 1, borderColor: theme.border,
          padding: spacing.md, gap: 14, marginBottom: spacing.sm,
        }}>
          {loadingLogs ? (
            <ActivityIndicator color={theme.accent} />
          ) : (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={{ color: theme.textPrimary, fontSize: 30, fontWeight: '800' }}>
                  {eaten.toLocaleString()}{' '}
                  <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, fontWeight: '500' }}>
                    / {target.toLocaleString()} kcal
                  </Text>
                </Text>
                <Text style={{
                  color: theme.accent,
                  fontSize: fontSize.sm, fontWeight: '700',
                }}>
                  {remaining >= 0 ? `${remaining.toLocaleString()} left` : `${Math.abs(remaining)} over`}
                </Text>
              </View>

              <View style={{ height: 7, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 99, overflow: 'hidden' }}>
                <View style={{
                  width: `${Math.round(caloriePercent * 100)}%`,
                  height: '100%',
                  backgroundColor: theme.accent,
                  borderRadius: 99,
                }} />
              </View>

              <View style={{ flexDirection: 'row' }}>
                {[
                  { label: 'Protein', key: 'P', value: nutrition.protein, target: targetProtein, opacity: 1 },
                  { label: 'Carbs',   key: 'C', value: nutrition.carbs,   target: targetCarbs,   opacity: 0.7 },
                  { label: 'Fat',     key: 'F', value: nutrition.fat,     target: targetFat,     opacity: 0.45 },
                ].map((m, i) => (
                  <View key={m.key} style={{
                    flex: 1,
                    paddingLeft: i === 0 ? 0 : 12,
                    borderLeftWidth: i === 0 ? 0 : 1,
                    borderLeftColor: theme.border,
                    marginLeft: i === 0 ? 0 : 12,
                    gap: 2,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: theme.accent, opacity: m.opacity }} />
                      <Text style={{ color: theme.textSecondary, fontSize: fontSize.xs, fontWeight: '600' }}>{m.label}</Text>
                    </View>
                    <Text style={{ color: theme.textPrimary, fontSize: fontSize.md, fontWeight: '800' }}>{m.value}g</Text>
                    <Text style={{ color: theme.textMuted, fontSize: fontSize.xs }}>of {m.target}g</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Meal sections */}
        {MEALS.map((meal) => {
          const items = getMealItems(meal.key)
          const mealCals = getMealCalories(meal.key)
          return (
            <View key={meal.key} style={{
              backgroundColor: theme.surface, borderRadius: radius.lg,
              borderWidth: 1, borderColor: theme.border,
              marginBottom: spacing.sm, overflow: 'hidden',
            }}>
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                padding: 16,
                borderBottomWidth: items.length > 0 ? 1 : 0,
                borderBottomColor: theme.border,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: fontSize.md }}>
                    {meal.label}
                  </Text>
                  {mealCals > 0 && (
                    <View style={{
                      backgroundColor: theme.bg,
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 999,
                      paddingHorizontal: 10, paddingVertical: 3,
                    }}>
                      <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, fontWeight: '600' }}>
                        {mealCals} kcal
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => setActiveMeal(meal.key)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={{ color: theme.accent, fontWeight: '800', fontSize: fontSize.md }}>+ Add</Text>
                </TouchableOpacity>
              </View>

              {items.length === 0 ? (
                <View style={{ padding: 16 }}>
                  <Text style={{ color: theme.textMuted, fontSize: fontSize.sm }}>Nothing logged yet</Text>
                </View>
              ) : (
                items.map((item, i) => (
                  <View key={item.id} style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingVertical: 12, paddingHorizontal: 16,
                    borderBottomWidth: i < items.length - 1 ? 1 : 0,
                    borderBottomColor: theme.border,
                    gap: 12,
                    opacity: deletingId === item.id ? 0.4 : 1,
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.textPrimary, fontSize: fontSize.sm, fontWeight: '600' }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
                        {item.quantity} {item.unit}
                      </Text>
                    </View>
                    <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm, fontWeight: '600' }}>
                      {Math.round(item.calories)} kcal
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteItem(item.id, item.name)}
                      disabled={deletingId === item.id}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={16} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )
        })}
      </ScrollView>

      {activeMeal && (
        <LogFoodSheet
          visible
          initialMealType={activeMeal}
          date={dateStr}
          onClose={() => setActiveMeal(null)}
          onLogged={() => {
            setActiveMeal(null)
            loadLogs()
          }}
        />
      )}
    </View>
  )
}