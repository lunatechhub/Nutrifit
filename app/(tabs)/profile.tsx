import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppStore } from '@/stores/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { theme, spacing, fontSize, radius } from '@/constants/theme'

export default function ProfileScreen() {
  const { user } = useAppStore()
  const { signOut } = useAuth()
  const insets = useSafeAreaInsets()

  const initials = user?.name
    ?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'

  const weightKg = user?.weight ?? 0
  const rawHeight = user?.height ?? 0
  const heightCm = user?.heightUnit === 'ft' ? rawHeight * 30.48 : rawHeight
  const bmi = heightCm > 0 ? (weightKg / ((heightCm / 100) ** 2)).toFixed(1) : '--'

  const heightDisplay = user?.heightUnit === 'ft'
    ? `${Math.floor(rawHeight)}'${Math.round((rawHeight % 1) * 12)}"`
    : `${rawHeight}`

  const stats = [
    { label: `Weight (${user?.weightUnit ?? 'kg'})`, value: weightKg.toString() },
    { label: `Height (${user?.heightUnit ?? 'cm'})`, value: heightDisplay },
    { label: 'Age', value: (user?.age ?? '--').toString() },
    { label: 'BMI', value: bmi.toString() },
  ]

  const targets = [
    { label: 'Calories', value: `${user?.targetCalories ?? '--'} kcal` },
    { label: 'Protein', value: `${user?.targetProtein ?? '--'} g` },
    { label: 'Carbs', value: `${user?.targetCarbs ?? '--'} g` },
    { label: 'Fat', value: `${user?.targetFat ?? '--'} g` },
  ]

  const details = [
    { label: 'Goal', value: user?.goal?.replace(/_/g, ' ') ?? '--' },
    { label: 'Activity', value: user?.activityLevel?.replace(/_/g, ' ') ?? '--' },
  ]

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ padding: spacing.md, paddingTop: insets.top + spacing.md, paddingBottom: 32 }}
    >
      {/* Avatar + name */}
      <View style={{ alignItems: 'center', gap: 10, paddingTop: 8, marginBottom: spacing.lg }}>
        <View style={{
          width: 76, height: 76, borderRadius: 999,
          backgroundColor: theme.accent,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: 26 }}>{initials}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: theme.textPrimary, fontSize: fontSize.xl, fontWeight: '800' }}>{user?.name ?? 'Athlete'}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>NutriArc member</Text>
        </View>
      </View>

      {/* 4-col stats grid */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.md }}>
        {stats.map((s) => (
          <View key={s.label} style={{
            flex: 1, backgroundColor: theme.surface,
            borderRadius: radius.md, borderWidth: 1, borderColor: theme.border,
            padding: 12, alignItems: 'center', gap: 2,
          }}>
            <Text style={{ color: theme.textPrimary, fontSize: 17, fontWeight: '800' }}>{s.value}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 10, textAlign: 'center' }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Daily targets */}
      <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: fontSize.md, marginBottom: spacing.sm }}>
        Daily targets
      </Text>
      <View style={{
        backgroundColor: theme.surface, borderRadius: radius.md,
        borderWidth: 1, borderColor: theme.border,
        paddingHorizontal: spacing.md, marginBottom: spacing.md,
      }}>
        {targets.map((t, i) => (
          <View key={t.label} style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingVertical: 13,
            borderBottomWidth: i < targets.length - 1 ? 1 : 0,
            borderBottomColor: theme.border,
          }}>
            <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>{t.label}</Text>
            <Text style={{ color: theme.textPrimary, fontSize: fontSize.sm, fontWeight: '700' }}>{t.value}</Text>
          </View>
        ))}
      </View>

      {/* Goal + activity */}
      <View style={{
        backgroundColor: theme.surface, borderRadius: radius.md,
        borderWidth: 1, borderColor: theme.border,
        paddingHorizontal: spacing.md, marginBottom: spacing.md,
      }}>
        {details.map((t, i) => (
          <View key={t.label} style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingVertical: 13,
            borderBottomWidth: i < details.length - 1 ? 1 : 0,
            borderBottomColor: theme.border,
          }}>
            <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>{t.label}</Text>
            <Text style={{ color: theme.textPrimary, fontSize: fontSize.sm, fontWeight: '700', textTransform: 'capitalize' }}>
              {t.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Sign out */}
      <TouchableOpacity
        onPress={signOut}
        style={{
          backgroundColor: theme.surface, borderRadius: radius.md,
          borderWidth: 1, borderColor: theme.border,
          padding: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
        }}
      >
        <Text style={{ color: theme.accent, fontWeight: '700', fontSize: fontSize.sm }}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}