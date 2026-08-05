import { View, Text, TouchableOpacity } from 'react-native'
import { theme, fontSize, spacing, radius } from '@/constants/theme'
import { activityLabels } from '@/constants/config'
import { ActivityLevel } from '@/types'

interface Step4Props {
    activityLevel: ActivityLevel | null
    setActivityLevel: (level: ActivityLevel) => void
    onNext: () => void
    onBack: () => void
}

export default function Step4Activity({ activityLevel, setActivityLevel, onNext, onBack }: Step4Props) {
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
                What's your activity level?
            </Text>

            {/* Activity level options */}
            <Text style={{ fontSize: fontSize.sm, color: theme.textSecondary, marginBottom: spacing.xs, fontWeight: '600' }}>
                Select your activity level
            </Text>
            <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
                {(Object.keys(activityLabels) as ActivityLevel[]).map((level) => (
                    <TouchableOpacity
                        key={level}
                        onPress={() => setActivityLevel(level)}
                        style={{
                            padding: spacing.md,
                            borderRadius: radius.md,
                            borderWidth: 1,
                            backgroundColor: activityLevel === level ? theme.accent : theme.surface,
                            borderColor: activityLevel === level ? theme.accent : theme.border,
                        }}
                    >
                        <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: fontSize.md }}>
                            {activityLabels[level]}
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
                    }}
                >
                    <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: fontSize.md }}>
                        Back
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onNext}
                    disabled={!activityLevel}
                    style={{
                        flex: 1,
                        padding: spacing.md,
                        backgroundColor: theme.accent,
                        opacity: !activityLevel ? 0.5 : 1,
                        borderRadius: radius.md,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: fontSize.md }}>
                        Next
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}