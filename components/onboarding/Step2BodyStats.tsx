import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import { theme, fontSize, spacing, radius } from '@/constants/theme'

interface Step2Props {
  height: string
  setHeight: (v: string) => void
  weight: string
  setWeight: (v: string) => void
  heightUnit: 'cm' | 'ft'
  setHeightUnit: (v: 'cm' | 'ft') => void
  weightUnit: 'kg' | 'lbs'
  setWeightUnit: (v: 'kg' | 'lbs') => void
  onNext: () => void
  onBack: () => void
}

export default function Step2BodyStats({
  height, setHeight,
  weight, setWeight,
  heightUnit, setHeightUnit,
  weightUnit, setWeightUnit,
  onNext, onBack,
}: Step2Props) {
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
        Your Body Stats
      </Text>

      {/* Height unit toggle */}
      <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, marginBottom: spacing.xs, fontWeight: '600' }}>
        Height Unit
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
        {(['cm', 'ft'] as const).map((unit) => (
          <TouchableOpacity
            key={unit}
            onPress={() => setHeightUnit(unit)}
            style={{
              flex: 1,
              padding: spacing.md,
              borderRadius: radius.md,
              alignItems: 'center',
              borderWidth: 1,
              backgroundColor: heightUnit === unit ? theme.accent : theme.surface,
              borderColor: heightUnit === unit ? theme.accent : theme.border,
            }}
          >
            <Text style={{ color: heightUnit === unit ? theme.textPrimary : theme.textSecondary, fontWeight: '600' }}>
              {unit}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Height input */}
      <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, marginBottom: spacing.xs, fontWeight: '600' }}>
        Height ({heightUnit})
      </Text>
      <TextInput
        placeholder={heightUnit === 'cm' ? '175' : '5.9'}
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
        placeholderTextColor={theme.textMuted}
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.lg,
          color: theme.textPrimary,
          backgroundColor: theme.surface,
          fontSize: fontSize.md,
        }}
      />

      {/* Weight unit toggle */}
      <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, marginBottom: spacing.xs, fontWeight: '600' }}>
        Weight Unit
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
        {(['kg', 'lbs'] as const).map((unit) => (
          <TouchableOpacity
            key={unit}
            onPress={() => setWeightUnit(unit)}
            style={{
              flex: 1,
              padding: spacing.md,
              borderRadius: radius.md,
              alignItems: 'center',
              borderWidth: 1,
              backgroundColor: weightUnit === unit ? theme.accent : theme.surface,
              borderColor: weightUnit === unit ? theme.accent : theme.border,
            }}
          >
            <Text style={{ color: weightUnit === unit ? theme.textPrimary : theme.textSecondary, fontWeight: '600' }}>
              {unit}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Weight input */}
      <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, marginBottom: spacing.xs, fontWeight: '600' }}>
        Weight ({weightUnit})
      </Text>
      <TextInput
        placeholder={weightUnit === 'kg' ? '70' : '154'}
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        placeholderTextColor={theme.textMuted}
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.lg,
          color: theme.textPrimary,
          backgroundColor: theme.surface,
          fontSize: fontSize.md,
        }}
      />

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
          disabled={!height || !weight}
          style={{
            flex: 1,
            padding: spacing.md,
            backgroundColor: theme.accent,
            opacity: (!height || !weight) ? 0.5 : 1,
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