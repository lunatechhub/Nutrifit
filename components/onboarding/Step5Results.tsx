import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { theme, fontSize, spacing, radius } from '@/constants/theme'
import { Sex, Goal, ActivityLevel } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/stores/useAppStore'
import { useState } from 'react'

interface Step5Props {
  name: string
  age: string
  sex: Sex
  height: string
  weight: string
  heightUnit: 'cm' | 'ft'
  weightUnit: 'kg' | 'lbs'
  goal: Goal | null
  activityLevel: ActivityLevel | null
  onBack: () => void
}

const multipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
}

const adjustments: Record<Goal, number> = {
  fat_loss: -500,
  muscle_gain: 300,
  recomposition: 0,
  endurance: 200,
  maintenance: 0,
}

export default function Step5Results({
  name, age, sex,
  height, weight, heightUnit, weightUnit,
  goal, activityLevel,
  onBack,
}: Step5Props) {
  const { setOnboarded } = useAppStore()
  const [loading, setLoading] = useState(false)

  // Unit conversions
  const weightKg = weightUnit === 'lbs' ? parseFloat(weight) * 0.453592 : parseFloat(weight)
  const heightCm = heightUnit === 'ft' ? parseFloat(height) * 30.48 : parseFloat(height)

  // Mifflin-St Jeor BMR
  const bmr = sex === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * parseInt(age) + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * parseInt(age) - 161

  const tdee = activityLevel ? bmr * multipliers[activityLevel] : bmr
  const targetCalories = goal ? Math.round(tdee + adjustments[goal]) : Math.round(tdee)
  const targetProtein = Math.round((targetCalories * 0.30) / 4)
  const targetCarbs = Math.round((targetCalories * 0.45) / 4)
  const targetFat = Math.round((targetCalories * 0.25) / 9)

  const handleFinish = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const { error } = await supabase.from('profiles').update({
        name,
        age: parseInt(age),
        sex,
        height: parseFloat(height),
        weight: parseFloat(weight),
        height_unit: heightUnit,
        weight_unit: weightUnit,
        goal,
        activity_level: activityLevel,
        target_calories: targetCalories,
        target_protein: targetProtein,
        target_carbs: targetCarbs,
        target_fat: targetFat,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        onboarding_completed: true,
      }).eq('id', session.user.id)

      if (error) throw error
      setOnboarded(true)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ padding: spacing.lg, paddingTop: spacing.xxl, backgroundColor: theme.bg }}>

      {/* Title */}
      <Text style={{
        fontSize: fontSize.xxl,
        fontWeight: '800',
        color: theme.textPrimary,
        marginBottom: spacing.xs,
        marginTop: spacing.xxl,
      }}>
        Your Plan
      </Text>
      <Text style={{ fontSize: fontSize.md, color: theme.textSecondary, marginBottom: spacing.xl }}>
        Based on your stats, here's what we recommend.
      </Text>

      {/* Calories card */}
      <View style={{
        backgroundColor: theme.accent,
        borderRadius: radius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.md,
      }}>
        <Text style={{ color: theme.textPrimary, fontSize: fontSize.sm, fontWeight: '600', opacity: 0.8 }}>
          Daily Target
        </Text>
        <Text style={{ color: theme.textPrimary, fontSize: 48, fontWeight: '800' }}>
          {targetCalories}
        </Text>
        <Text style={{ color: theme.textPrimary, fontSize: fontSize.sm, opacity: 0.8 }}>calories / day</Text>
      </View>

      {/* Macros row */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {[
          { label: 'Protein', value: targetProtein, unit: 'g' },
          { label: 'Carbs', value: targetCarbs, unit: 'g' },
          { label: 'Fat', value: targetFat, unit: 'g' },
        ].map((macro) => (
          <View key={macro.label} style={{
            flex: 1,
            backgroundColor: theme.surface,
            borderRadius: radius.md,
            padding: spacing.md,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border,
          }}>
            <Text style={{ color: theme.textPrimary, fontSize: fontSize.xl, fontWeight: '700' }}>
              {macro.value}
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: fontSize.xs }}>{macro.unit}</Text>
            <Text style={{ color: theme.textMuted, fontSize: fontSize.xs }}>{macro.label}</Text>
          </View>
        ))}
      </View>

      {/* BMR / TDEE */}
      <View style={{
        backgroundColor: theme.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: theme.border,
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.xl,
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: theme.textPrimary, fontSize: fontSize.lg, fontWeight: '700' }}>
            {Math.round(bmr)}
          </Text>
          <Text style={{ color: theme.textMuted, fontSize: fontSize.xs }}>BMR</Text>
        </View>
        <View style={{ width: 1, backgroundColor: theme.border }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: theme.textPrimary, fontSize: fontSize.lg, fontWeight: '700' }}>
            {Math.round(tdee)}
          </Text>
          <Text style={{ color: theme.textMuted, fontSize: fontSize.xs }}>TDEE</Text>
        </View>
      </View>

      {/* Navigation */}
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <TouchableOpacity
          onPress={onBack}
          disabled={loading}
          style={{
            flex: 1,
            padding: spacing.md,
            backgroundColor: theme.surface,
            borderRadius: radius.md,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFinish}
          disabled={loading}
          style={{
            flex: 2,
            padding: spacing.md,
            backgroundColor: theme.accent,
            opacity: loading ? 0.6 : 1,
            borderRadius: radius.md,
            alignItems: 'center',
          }}
        >
          {loading
            ? <ActivityIndicator color={theme.textPrimary} />
            : <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: fontSize.md }}>Complete Setup</Text>
          }
        </TouchableOpacity>
      </View>

    </View>
  )
}