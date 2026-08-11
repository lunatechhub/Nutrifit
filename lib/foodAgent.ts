import { supabase } from './supabase'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface ParsedFoodItem {
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
}

export interface LoggedItem extends ParsedFoodItem {
  id: string
}

export interface MealLog {
  logId: string
  mealType: MealType
  rawInput?: string
  items: LoggedItem[]
}

export function getMealFromTime(): MealType {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return 'breakfast'
  if (h >= 11 && h < 15) return 'lunch'
  if (h >= 15 && h < 21) return 'dinner'
  return 'snack'
}

function extractFnError(data: unknown, error: { message: string } | null): string | null {
  if ((data as any)?.error) return (data as any).error
  if (error) return error.message
  return null
}

export async function parseFoodFromImage(imageBase64: string, mediaType: string): Promise<ParsedFoodItem[]> {
  const { data, error } = await supabase.functions.invoke('scan-food', {
    body: { imageBase64, mediaType },
  })

  const err = extractFnError(data, error)
  if (err) throw new Error(err)
  if (!Array.isArray(data?.items)) throw new Error('Unexpected response from AI')

  return data.items as ParsedFoodItem[]
}

export async function parseFoodInput(rawInput: string): Promise<ParsedFoodItem[]> {
  const { data, error } = await supabase.functions.invoke('parse-food', {
    body: { rawInput },
  })

  const err = extractFnError(data, error)
  if (err) throw new Error(err)
  if (!Array.isArray(data?.items)) throw new Error('Unexpected response from AI')

  return data.items as ParsedFoodItem[]
}

export async function logFoodItems(
  rawInput: string,
  mealType: MealType,
  items: ParsedFoodItem[],
  date: string,
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: log, error: logError } = await supabase
    .from('food_logs')
    .insert({ user_id: user.id, date, meal_type: mealType, raw_input: rawInput })
    .select('id')
    .single()

  if (logError) throw logError

  const { error: itemsError } = await supabase
    .from('food_items')
    .insert(
      items.map(item => ({
        log_id: log.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber ?? 0,
        source: 'ai',
      }))
    )

  if (itemsError) throw itemsError

  return log.id as string
}

export async function fetchDayLogs(date: string): Promise<MealLog[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: logs, error } = await supabase
    .from('food_logs')
    .select(`
      id,
      meal_type,
      raw_input,
      food_items ( id, name, quantity, unit, calories, protein, carbs, fat )
    `)
    .eq('user_id', user.id)
    .eq('date', date)
    .order('created_at')

  if (error || !logs) return []

  return logs.map(log => ({
    logId: log.id as string,
    mealType: log.meal_type as MealType,
    rawInput: log.raw_input ?? undefined,
    items: (log.food_items ?? []) as LoggedItem[],
  }))
}

export async function deleteFoodItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('food_items').delete().eq('id', itemId)
  if (error) throw error
}

export async function fetchStreak(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { data } = await supabase
    .from('food_logs')
    .select('date')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(400)

  if (!data || data.length === 0) return 0

  const uniqueDates = [...new Set(data.map(r => r.date as string))].sort().reverse()

  const todayMs = new Date(new Date().toDateString()).getTime()
  const MS_PER_DAY = 86400000

  const firstDateMs = new Date(uniqueDates[0] + 'T00:00:00').getTime()
  const gapFromToday = Math.round((todayMs - firstDateMs) / MS_PER_DAY)

  // Allow up to 2-day gap from today (1 grace day bridge)
  if (gapFromToday > 2) return 0

  // If the last log was 2 days ago, the grace is already consumed bridging to today
  let graceUsed = gapFromToday === 2

  let streak = 0
  let expectedMs = firstDateMs

  for (const dateStr of uniqueDates) {
    const dateMs = new Date(dateStr + 'T00:00:00').getTime()
    if (dateMs === expectedMs) {
      streak++
      expectedMs -= MS_PER_DAY
    } else if (!graceUsed && Math.round((expectedMs - dateMs) / MS_PER_DAY) === 1) {
      // Missed exactly 1 day — use the grace day
      graceUsed = true
      streak++
      expectedMs = dateMs - MS_PER_DAY
    } else {
      break
    }
  }
  return streak
}

export async function copyLogsToDate(fromDate: string, toDate: string): Promise<void> {
  const logs = await fetchDayLogs(fromDate)
  const logsWithItems = logs.filter(l => l.items.length > 0)
  if (logsWithItems.length === 0) throw new Error('No meals logged on that day')

  for (const log of logsWithItems) {
    await logFoodItems(
      log.rawInput ?? 'Copied from previous day',
      log.mealType,
      log.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
      })),
      toDate,
    )
  }
}

export function sumNutrition(logs: MealLog[]) {
  const all = logs.flatMap(l => l.items)
  return {
    calories: Math.round(all.reduce((s, i) => s + i.calories, 0)),
    protein: parseFloat(all.reduce((s, i) => s + i.protein, 0).toFixed(1)),
    carbs: parseFloat(all.reduce((s, i) => s + i.carbs, 0).toFixed(1)),
    fat: parseFloat(all.reduce((s, i) => s + i.fat, 0).toFixed(1)),
  }
}
