export type Goal = 
    | 'fat_loss'
    | 'muscle_gain'
    | 'recomposition'
    | 'endurance'
    | 'maintenance';

export type ActivityLevel = 
    | 'sedentary'
    | 'lightly_active'
    | 'moderately_active'
    | 'very_active'
    | 'extremely_active';   

export type Sex = 'male' | 'female' | 'other';

export type WeightUnit = 'kg' | 'lbs'
export type HeightUnit = 'cm' | 'ft'

export interface UserProfile {
    id: string
  email: string
  name: string
  age: number
  sex: Sex
  height: number
  weight: number
  weightUnit: WeightUnit
  heightUnit: HeightUnit
  goal: Goal
  activityLevel: ActivityLevel
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  bmr: number
  tdee: number
  createdAt: string
  // Reminder settings
  remindersEnabled?: boolean
  breakfastTime?: string   // "HH:MM" 24h
  lunchTime?: string
  dinnerTime?: string
  eveningNudge?: boolean
  // Profile photo + goal weight
  avatarUrl?: string
  targetWeight?: number
}

export interface metrics {
    calories: number
    protein: number
    carbs: number
    fat: number
}


export interface FoodItem {
    id: string
  logId: string
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
}

export interface FoodLog {
  id: string
  userId: string
  date: string
  rawInput?: string
  items: FoodItem[]
}

// Nutrition summary
export interface NutritionSummary {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
}

// Workout
export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  equipment: Equipment
  sets: number
  reps: string
  restSeconds: number
  notes?: string
}

export interface WorkoutDay {
  id: string
  planId: string
  dayOfWeek: number
  name: string
  exercises: Exercise[]
}

export interface WorkoutPlan {
  id: string
  userId: string
  name: string
  weeks: number
  currentWeek: number
  days: WorkoutDay[]
  createdAt: string
}

export interface SetLog {
  id: string
  exercise: string
  weight: number
  reps: number
  rpe?: number
  isPersonalRecord?: boolean
}

export interface WorkoutLog {
  id: string
  userId: string
  planId?: string
  name: string
  date: string
  duration: number // minutes
  totalVolume: number // kg
  sets: SetLog[]
  notes?: string
}

// Muscle groups
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'full_body'

// Equipment
export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'resistance_band'
  | 'pull_up_bar'

// AI Coach
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

// Health metrics from wearables
export interface HealthData {
  steps?: number
  heartRate?: number
  activeCalories?: number
  sleepHours?: number
  hrv?: number
  restingHeartRate?: number
  recordedAt: string
}

// Dashboard
export interface DashboardStats {
  todayCalories: number
  todayProtein: number
  todayCarbs: number
  todayFat: number
  weeklyWorkouts: number
  currentStreak: number
  weightTrend: number // kg per week, negative = losing
  latestWeight: number
}

