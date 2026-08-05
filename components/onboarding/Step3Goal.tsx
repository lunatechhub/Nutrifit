import { View, Text, TouchableOpacity } from 'react-native'
import { theme, fontSize, spacing, radius } from '@/constants/theme'
import { Goal } from '@/types'
import { goalLabels } from '@/constants/config'

interface Step3Props {
  goal: Goal | null
  setGoal: (goal: Goal) => void
  onNext: () => void
  onBack: () => void
}

export default function Step3Goal({ goal, setGoal, onNext, onBack }: Step3Props) {
  return (
    <View style={{ padding: spacing.lg, paddingTop: spacing.xxl, backgroundColor: theme.bg }}>

      {/* Title */}
      <Text style={{
        fontSize: fontSize.xxl,
        fontWeight: '800',
        color: theme.textPrimary,
        marginBottom: spacing.xl,
        marginTop: spacing.xxl,
      }}>
        What's your goal?
      </Text>

      {/* Goal options */}
      <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, marginBottom: spacing.xs, fontWeight: '600' }}>
        Select your goal
      </Text>
      <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
        {(Object.keys(goalLabels) as Goal[]).map((g) => (
          <TouchableOpacity
            key={g}
            onPress={() => setGoal(g)}
            style={{
              padding: spacing.md,
              borderRadius: radius.md,
              borderWidth: 1,
              backgroundColor: goal === g ? theme.accent : theme.surface,
              borderColor: goal === g ? theme.accent : theme.border,
            }}
          >
            <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: fontSize.md }}>
              {goalLabels[g]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Navigation buttons */}
      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
        <TouchableOpacity
          onPress={onBack}
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
          onPress={onNext}
          disabled={!goal}
          style={{
            flex: 1,
            padding: spacing.md,
            backgroundColor: theme.accent,
            opacity: !goal ? 0.5 : 1,
            borderRadius: radius.md,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>Next →</Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}