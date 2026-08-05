import {
  View, Text, Modal, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { logWeight, recalculateAndSaveTargets } from '@/lib/health'
import { useAppStore } from '@/stores/useAppStore'
import { theme, spacing, fontSize, radius } from '@/constants/theme'

interface Props {
  visible: boolean
  onClose: () => void
  onLogged: (weightKg: number) => void
  currentWeight?: number | null
}

export default function LogWeightSheet({ visible, onClose, onLogged, currentWeight }: Props) {
  const insets = useSafeAreaInsets()
  const { user, updateUser } = useAppStore()

  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stage, setStage] = useState<'input' | 'prompt'>('input')
  const [savedKg, setSavedKg] = useState(0)

  const handleSave = async () => {
    const kg = parseFloat(value)
    if (isNaN(kg) || kg < 20 || kg > 300) {
      setError('Enter a valid weight between 20 and 300 kg')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await logWeight(kg)
      setSavedKg(kg)
      const diff = Math.abs(kg - (currentWeight ?? kg))
      if (diff >= 0.5 && user) {
        setStage('prompt')
      } else {
        reset()
        onLogged(kg)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculate = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const updates = await recalculateAndSaveTargets(savedKg, user)
      updateUser(updates)
      reset()
      onLogged(savedKg)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to recalculate')
      setLoading(false)
    }
  }

  const handleSkip = () => {
    reset()
    onLogged(savedKg)
  }

  const reset = () => {
    setValue('')
    setError(null)
    setStage('input')
    setSavedKg(0)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const diff = savedKg && currentWeight != null ? savedKg - currentWeight : 0

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={stage === 'input' ? handleClose : undefined} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={{
            backgroundColor: theme.surface,
            borderTopLeftRadius: 20, borderTopRightRadius: 20,
            borderTopWidth: 1, borderColor: theme.border,
            padding: spacing.md,
            paddingBottom: insets.bottom + spacing.md,
            gap: 16,
          }}>
            <View style={{ width: 36, height: 4, backgroundColor: theme.border, borderRadius: 2, alignSelf: 'center' }} />

            {stage === 'input' ? (
              <>
                <Text style={{ color: theme.textPrimary, fontSize: fontSize.xl, fontWeight: '800' }}>Log Weight</Text>

                {currentWeight != null && (
                  <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>
                    Last logged: {currentWeight} kg
                  </Text>
                )}

                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  backgroundColor: theme.bg, borderRadius: radius.md,
                  borderWidth: 1, borderColor: theme.border,
                  padding: 14,
                }}>
                  <TextInput
                    style={{ flex: 1, color: theme.textPrimary, fontSize: 28, fontWeight: '800' }}
                    placeholder="0.0"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="decimal-pad"
                    value={value}
                    onChangeText={setValue}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleSave}
                  />
                  <Text style={{ color: theme.textSecondary, fontSize: fontSize.lg, fontWeight: '600' }}>kg</Text>
                </View>

                {error && <Text style={{ color: theme.accent, fontSize: fontSize.sm }}>{error}</Text>}

                <TouchableOpacity
                  onPress={handleSave}
                  disabled={loading || !value}
                  style={{
                    backgroundColor: theme.accent,
                    opacity: !value ? 0.5 : 1,
                    borderRadius: radius.md, padding: 16, alignItems: 'center',
                  }}
                >
                  {loading
                    ? <ActivityIndicator color={theme.textPrimary} />
                    : <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: fontSize.md }}>Save</Text>
                  }
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={{ alignItems: 'center', gap: 10, paddingVertical: 8 }}>
                  <View style={{
                    width: 52, height: 52, borderRadius: 999,
                    backgroundColor: theme.bg,
                    borderWidth: 1, borderColor: theme.border,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ionicons name="checkmark" size={28} color={theme.accent} />
                  </View>
                  <Text style={{ color: theme.textPrimary, fontSize: fontSize.xl, fontWeight: '800' }}>Weight saved</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm, textAlign: 'center' }}>
                    {savedKg} kg logged
                    {diff !== 0 ? ` · ${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg from last` : ''}
                  </Text>
                </View>

                <View style={{
                  backgroundColor: theme.bg, borderRadius: radius.md,
                  borderWidth: 1, borderColor: theme.border,
                  padding: spacing.md, gap: 6,
                }}>
                  <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: fontSize.sm }}>
                    Update calorie targets?
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>
                    Your weight changed by {Math.abs(diff).toFixed(1)} kg. Recalculate BMR, TDEE, and macro targets to match your new weight.
                  </Text>
                </View>

                {error && <Text style={{ color: theme.accent, fontSize: fontSize.sm }}>{error}</Text>}

                <TouchableOpacity
                  onPress={handleRecalculate}
                  disabled={loading}
                  style={{
                    backgroundColor: theme.accent,
                    borderRadius: radius.md, padding: 16, alignItems: 'center',
                  }}
                >
                  {loading
                    ? <ActivityIndicator color={theme.textPrimary} />
                    : <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: fontSize.md }}>Yes, recalculate</Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSkip}
                  style={{
                    borderRadius: radius.md, padding: 14, alignItems: 'center',
                    borderWidth: 1, borderColor: theme.border,
                  }}
                >
                  <Text style={{ color: theme.textSecondary, fontWeight: '600', fontSize: fontSize.md }}>Skip for now</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}