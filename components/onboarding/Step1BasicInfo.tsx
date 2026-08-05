import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import { Sex } from '@/types';
import { theme, fontSize, spacing, radius } from '@/constants/theme'

interface Step1Props {
    name: string;
    setName: (name: string) => void;
    age: string;
    setAge: (age: string) => void;
    sex: Sex | null;
    setSex: (v: Sex) => void;
    onNext: () => void;
}

export default function Step1BasicInfo({ name, setName, age, setAge, sex, setSex, onNext }: Step1Props) {
  return (
    <View style={{ padding: spacing.lg, paddingTop: spacing.xxl, backgroundColor: theme.bg }}>
      {/* Title */}
      <Text style={{
        fontSize: fontSize.xxl,
        fontWeight: '800',
        color: theme.textPrimary,
        marginBottom: spacing.xl,
        marginTop: spacing.xxl,  // ← add this
      }}>
        Tell us about yourself
      </Text>

      {/* Name input */}
      <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, marginBottom: spacing.xs, fontWeight: '600' }}>
        Name
      </Text>
      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        placeholderTextColor={theme.textMuted}
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.lg,
          color: theme.textPrimary,
          backgroundColor: theme.surface,
        }}
      />

      {/* Age input */}
      <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, marginBottom: spacing.xs, fontWeight: '600' }}>
        Age
      </Text>
      <TextInput
        placeholder="Enter your age"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
        placeholderTextColor={theme.textMuted}
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.lg,
          color: theme.textPrimary,
          backgroundColor: theme.surface,
        }}
      />

      {/* Sex selector */}
      <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, marginBottom: spacing.xs, fontWeight: '600', marginTop: spacing.sm }}>
        Sex
        </Text>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        {(['male', 'female', 'other'] as Sex[]).map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setSex(option)}
            style={{
              flex: 1,
              padding: spacing.md,
              borderWidth: 1,
              borderRadius: radius.md,
              alignItems: 'center',
              backgroundColor: sex === option ? theme.accent : theme.surface,
              borderColor: sex === option ? theme.accent : theme.border,
            }}
          >
            <Text style={{ color: sex === option ? theme.textPrimary : theme.textSecondary, fontSize: fontSize.md }}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Next button */}
      <TouchableOpacity
        onPress={onNext}
        disabled={!name || !age || !sex}
        style={{
          marginTop: spacing.xl,
          backgroundColor: theme.accent,
          opacity: (!name || !age || !sex) ? 0.5 : 1,
          padding: spacing.md,
          borderRadius: radius.md,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: theme.textPrimary, fontSize: fontSize.md, fontWeight: '600' }}>
          Next
        </Text>
      </TouchableOpacity>
    </View>
  );
}