import Constants, { ExecutionEnvironment } from 'expo-constants'
import { supabase } from './supabase'

// expo-notifications' push-token auto-registration throws as soon as it's
// imported in Expo Go (SDK 53+). Only load it in dev/standalone builds.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient

const Notifications: typeof import('expo-notifications') | null = isExpoGo
  ? null
  : require('expo-notifications')

Notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export interface ReminderSettings {
  enabled: boolean
  breakfastTime: string   // "HH:MM" 24h
  lunchTime: string
  dinnerTime: string
  eveningNudge: boolean
}

export const DEFAULT_REMINDERS: ReminderSettings = {
  enabled: false,
  breakfastTime: '08:00',
  lunchTime: '12:30',
  dinnerTime: '19:00',
  eveningNudge: true,
}

export function fmt12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

// All half-hour slots 5:00 AM – 10:30 PM
export const TIME_OPTIONS: string[] = (() => {
  const opts: string[] = []
  for (let h = 5; h <= 22; h++) {
    for (const m of [0, 30]) {
      opts.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return opts
})()

export async function requestPermission(): Promise<boolean> {
  if (!Notifications) return false
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function applyReminders(settings: ReminderSettings): Promise<void> {
  if (!Notifications) return
  await Notifications.cancelAllScheduledNotificationsAsync()
  if (!settings.enabled) return

  const granted = await requestPermission()
  if (!granted) return

  const meals = [
    { id: 'nutriarc-breakfast', title: '🌅 Log breakfast', body: 'What did you have this morning?', time: settings.breakfastTime },
    { id: 'nutriarc-lunch',     title: '🍽️ Log lunch',     body: "Don't forget to track your lunch!", time: settings.lunchTime },
    { id: 'nutriarc-dinner',    title: '🌙 Log dinner',    body: 'Almost done — log your dinner!', time: settings.dinnerTime },
  ]

  for (const m of meals) {
    const [hour, minute] = m.time.split(':').map(Number)
    await Notifications.scheduleNotificationAsync({
      identifier: m.id,
      content: { title: m.title, body: m.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    })
  }

  if (settings.eveningNudge) {
    await Notifications.scheduleNotificationAsync({
      identifier: 'nutriarc-evening',
      content: {
        title: '📊 Evening check-in',
        body: "How was your day? Log any remaining meals — even an estimate counts.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 21,
        minute: 0,
      },
    })
  }
}

export async function saveAndApplyReminders(settings: ReminderSettings): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('profiles').update({
    reminders_enabled: settings.enabled,
    breakfast_time:    settings.breakfastTime,
    lunch_time:        settings.lunchTime,
    dinner_time:       settings.dinnerTime,
    evening_nudge:     settings.eveningNudge,
  }).eq('id', user.id)

  await applyReminders(settings)
}
