import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, Alert, Image } from 'react-native'
import { useState, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAppStore } from '@/stores/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { theme, spacing, fontSize, radius } from '@/constants/theme'
import {
  ReminderSettings, DEFAULT_REMINDERS,
  fmt12h, TIME_OPTIONS, saveAndApplyReminders,
} from '@/lib/notifications'
import EditProfileModal from '@/components/profile/EditProfileModal'

// ── Time picker modal ─────────────────────────────────────────────────────────
function TimePickerModal({
  value, onSelect, onClose,
}: { value: string; onSelect: (t: string) => void; onClose: () => void }) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <View style={{
          backgroundColor: theme.bg,
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          borderTopWidth: 1, borderColor: theme.border,
          padding: spacing.md, paddingBottom: 40,
        }}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: theme.border }} />
          </View>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: fontSize.lg, marginBottom: 14 }}>
            Choose time
          </Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 340 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 8 }}>
              {TIME_OPTIONS.map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => { onSelect(t); onClose() }}
                  style={{
                    paddingVertical: 10, paddingHorizontal: 14,
                    borderRadius: 999,
                    backgroundColor: value === t ? theme.accent : theme.surface,
                    borderWidth: 1, borderColor: value === t ? 'transparent' : theme.border,
                  }}
                >
                  <Text style={{
                    color: value === t ? '#0a0a0a' : '#fff',
                    fontWeight: '600', fontSize: fontSize.sm,
                  }}>
                    {fmt12h(t)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, updateUser } = useAppStore()
  const { signOut } = useAuth()
  const insets = useSafeAreaInsets()

  const [reminders, setReminders] = useState<ReminderSettings>({
    enabled:       user?.remindersEnabled ?? DEFAULT_REMINDERS.enabled,
    breakfastTime: user?.breakfastTime    ?? DEFAULT_REMINDERS.breakfastTime,
    lunchTime:     user?.lunchTime        ?? DEFAULT_REMINDERS.lunchTime,
    dinnerTime:    user?.dinnerTime       ?? DEFAULT_REMINDERS.dinnerTime,
    eveningNudge:  user?.eveningNudge     ?? DEFAULT_REMINDERS.eveningNudge,
  })
  const [saving, setSaving] = useState(false)
  const [pickerTarget, setPickerTarget] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null)
  const [editVisible, setEditVisible] = useState(false)

  // Sync from store when screen focused (in case profile reloaded)
  useFocusEffect(useCallback(() => {
    if (user) {
      setReminders({
        enabled:       user.remindersEnabled ?? DEFAULT_REMINDERS.enabled,
        breakfastTime: user.breakfastTime    ?? DEFAULT_REMINDERS.breakfastTime,
        lunchTime:     user.lunchTime        ?? DEFAULT_REMINDERS.lunchTime,
        dinnerTime:    user.dinnerTime       ?? DEFAULT_REMINDERS.dinnerTime,
        eveningNudge:  user.eveningNudge     ?? DEFAULT_REMINDERS.eveningNudge,
      })
    }
  }, [user]))

  async function applyChange(next: ReminderSettings) {
    setReminders(next)
    setSaving(true)
    try {
      await saveAndApplyReminders(next)
      updateUser({
        remindersEnabled: next.enabled,
        breakfastTime:    next.breakfastTime,
        lunchTime:        next.lunchTime,
        dinnerTime:       next.dinnerTime,
        eveningNudge:     next.eveningNudge,
      })
    } catch {
      Alert.alert('Error', 'Could not save reminder settings.')
    } finally {
      setSaving(false)
    }
  }

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

  const details = [
    { label: 'Goal',     value: user?.goal?.replace(/_/g, ' ') ?? '--' },
    { label: 'Activity', value: user?.activityLevel?.replace(/_/g, ' ') ?? '--' },
    ...(user?.targetWeight
      ? [{ label: 'Target weight', value: `${user.targetWeight} ${user?.weightUnit ?? 'kg'}` }]
      : []),
  ]

  const targets = [
    { label: 'Calories', value: `${user?.targetCalories ?? '--'} kcal` },
    { label: 'Protein',  value: `${user?.targetProtein ?? '--'} g` },
    { label: 'Carbs',    value: `${user?.targetCarbs ?? '--'} g` },
    { label: 'Fat',      value: `${user?.targetFat ?? '--'} g` },
  ]

  const mealRows: { key: 'breakfast' | 'lunch' | 'dinner'; label: string; time: string }[] = [
    { key: 'breakfast', label: 'Breakfast', time: reminders.breakfastTime },
    { key: 'lunch',     label: 'Lunch',     time: reminders.lunchTime },
    { key: 'dinner',    label: 'Dinner',    time: reminders.dinnerTime },
  ]

  const pickerValue =
    pickerTarget === 'breakfast' ? reminders.breakfastTime :
    pickerTarget === 'lunch'     ? reminders.lunchTime :
    pickerTarget === 'dinner'    ? reminders.dinnerTime : '12:00'

  function onPickerSelect(t: string) {
    if (!pickerTarget) return
    const next = {
      ...reminders,
      breakfastTime: pickerTarget === 'breakfast' ? t : reminders.breakfastTime,
      lunchTime:     pickerTarget === 'lunch'     ? t : reminders.lunchTime,
      dinnerTime:    pickerTarget === 'dinner'    ? t : reminders.dinnerTime,
    }
    applyChange(next)
  }

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
          overflow: 'hidden',
        }}>
          {user?.avatarUrl
            ? <Image source={{ uri: user.avatarUrl }} style={{ width: 76, height: 76 }} />
            : <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: 26 }}>{initials}</Text>
          }
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: theme.textPrimary, fontSize: fontSize.xl, fontWeight: '800' }}>{user?.name ?? 'Athlete'}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>NutriArc member</Text>
        </View>
        <TouchableOpacity
          onPress={() => setEditVisible(true)}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            paddingVertical: 7, paddingHorizontal: 14,
            borderRadius: 999, borderWidth: 1, borderColor: theme.border,
            backgroundColor: theme.surface,
          }}
        >
          <Ionicons name="pencil" size={13} color={theme.textSecondary} />
          <Text style={{ color: theme.textSecondary, fontSize: fontSize.xs, fontWeight: '700' }}>Edit profile</Text>
        </TouchableOpacity>
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

      {/* Reminders */}
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: fontSize.md, marginBottom: spacing.sm }}>
        Reminders
      </Text>
      <View style={{
        backgroundColor: theme.surface, borderRadius: radius.md,
        borderWidth: 1, borderColor: theme.border,
        paddingHorizontal: spacing.md, marginBottom: spacing.md,
        opacity: saving ? 0.6 : 1,
      }}>
        {/* Enable toggle */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          paddingVertical: 14,
          borderBottomWidth: 1, borderBottomColor: theme.border,
        }}>
          <View>
            <Text style={{ color: '#fff', fontSize: fontSize.sm, fontWeight: '700' }}>Meal reminders</Text>
            <Text style={{ color: theme.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
              Daily nudges to log each meal
            </Text>
          </View>
          <Switch
            value={reminders.enabled}
            onValueChange={v => applyChange({ ...reminders, enabled: v })}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor="#fff"
          />
        </View>

        {/* Meal time rows — only visible when enabled */}
        {reminders.enabled && mealRows.map((m, i) => (
          <TouchableOpacity
            key={m.key}
            onPress={() => setPickerTarget(m.key)}
            style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingVertical: 14,
              borderBottomWidth: 1, borderBottomColor: theme.border,
            }}
          >
            <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>{m.label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: '#fff', fontSize: fontSize.sm, fontWeight: '700' }}>
                {fmt12h(m.time)}
              </Text>
              <Text style={{ color: theme.textMuted, fontSize: 18 }}>›</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Evening nudge toggle */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          paddingVertical: 14,
        }}>
          <View>
            <Text style={{ color: '#fff', fontSize: fontSize.sm, fontWeight: '700' }}>Evening check-in</Text>
            <Text style={{ color: theme.textSecondary, fontSize: fontSize.xs, marginTop: 2 }}>
              9:00 PM reminder if you haven't finished logging
            </Text>
          </View>
          <Switch
            value={reminders.eveningNudge}
            onValueChange={v => applyChange({ ...reminders, eveningNudge: v })}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor="#fff"
          />
        </View>
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

      {/* Time picker modal */}
      {pickerTarget && (
        <TimePickerModal
          value={pickerValue}
          onSelect={onPickerSelect}
          onClose={() => setPickerTarget(null)}
        />
      )}

      {/* Edit profile modal */}
      <EditProfileModal visible={editVisible} onClose={() => setEditVisible(false)} />
    </ScrollView>
  )
}