import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native'
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { theme, spacing, fontSize, radius } from '@/constants/theme'
import {
  parseFoodInput,
  parseFoodFromImage,
  logFoodItems,
  getMealFromTime,
  ParsedFoodItem,
  MealType,
} from '@/lib/foodAgent'

interface Props {
  visible: boolean
  initialMealType?: MealType
  date: string
  onClose: () => void
  onLogged: () => void
}

type Stage = 'options' | 'scanning' | 'text' | 'preview'
type InputMode = 'type' | 'voice'

const MEALS: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
]

const SCREEN_HEIGHT = Dimensions.get('window').height

export default function LogFoodSheet({ visible, initialMealType, date, onClose, onLogged }: Props) {
  const [mealType, setMealType] = useState<MealType>(initialMealType ?? getMealFromTime())
  const [stage, setStage] = useState<Stage>('options')
  const [inputMode, setInputMode] = useState<InputMode>('type')
  const [text, setText] = useState('')
  const [items, setItems] = useState<ParsedFoodItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function reset() {
    setStage('options')
    setInputMode('type')
    setText('')
    setItems([])
    setError(null)
    setSaving(false)
    setMealType(initialMealType ?? getMealFromTime())
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleScan(fromCamera: boolean) {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (perm.status !== 'granted') {
      Alert.alert('Permission required', fromCamera ? 'Camera access is needed to scan food.' : 'Photo library access is needed.')
      return
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.5, mediaTypes: ['images'] })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.5, mediaTypes: ['images'] })

    if (result.canceled || !result.assets?.[0]?.base64) return

    setStage('scanning')
    setError(null)
    try {
      const parsed = await parseFoodFromImage(
        result.assets[0].base64!,
        result.assets[0].mimeType ?? 'image/jpeg'
      )
      setItems(parsed)
      setText('Photo scan')
      setStage('preview')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to scan image')
      setStage('options')
    }
  }

  function promptScanSource() {
    Alert.alert('Scan Food', 'Choose a source', [
      { text: 'Camera', onPress: () => handleScan(true) },
      { text: 'Photo Library', onPress: () => handleScan(false) },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  async function handleAnalyze() {
    if (!text.trim()) return
    setError(null)
    setStage('scanning')
    try {
      const parsed = await parseFoodInput(text.trim())
      setItems(parsed)
      setStage('preview')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setStage('text')
    }
  }

  async function handleLog() {
    setSaving(true)
    try {
      await logFoodItems(text, mealType, items, date)
      reset()
      onLogged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
      setSaving(false)
    }
  }

  const totalCal = Math.round(items.reduce((s, i) => s + i.calories, 0))
  const totalP = items.reduce((s, i) => s + i.protein, 0).toFixed(1)
  const totalC = items.reduce((s, i) => s + i.carbs, 0).toFixed(1)
  const totalF = items.reduce((s, i) => s + i.fat, 0).toFixed(1)

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
        {/* Backdrop */}
        <TouchableOpacity style={{ flex: 1 }} onPress={handleClose} activeOpacity={1} />

        {/* Sheet */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{
            backgroundColor: theme.bg,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderTopWidth: 1,
            borderColor: theme.border,
            maxHeight: SCREEN_HEIGHT * 0.88,
          }}>
            {/* Handle */}
            <View style={{ alignItems: 'center', paddingTop: 14, paddingBottom: 6 }}>
              <View style={{ width: 40, height: 4, borderRadius: 99, backgroundColor: theme.border }} />
            </View>

            {/* Header */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: spacing.md, paddingBottom: 14,
            }}>
              <Text style={{ color: theme.textPrimary, fontSize: fontSize.xl, fontWeight: '800', letterSpacing: -0.3 }}>
                Log Food
              </Text>
              <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <View style={{
                  width: 30, height: 30, borderRadius: 99,
                  backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 18, lineHeight: 20 }}>×</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Meal type pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 8, paddingBottom: 16 }}
            >
              {MEALS.map(m => (
                <TouchableOpacity
                  key={m.key}
                  onPress={() => setMealType(m.key)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 999,
                    backgroundColor: mealType === m.key ? theme.accent : theme.surface,
                    borderWidth: 1,
                    borderColor: mealType === m.key ? 'transparent' : theme.border,
                  }}
                >
                  <Text style={{
                    color: mealType === m.key ? theme.textPrimary : theme.textSecondary,
                    fontWeight: '700',
                    fontSize: fontSize.sm,
                  }}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 48 }}
              showsVerticalScrollIndicator={false}
            >

              {/* OPTIONS STAGE */}
              {stage === 'options' && (
                <View style={{ gap: 10 }}>
                  {error && (
                    <Text style={{ color: theme.accent, fontSize: fontSize.sm, marginBottom: 4 }}>{error}</Text>
                  )}

                  {/* Scan Food */}
                  <TouchableOpacity
                    onPress={promptScanSource}
                    style={{
                      backgroundColor: theme.accent,
                      borderRadius: radius.lg,
                      padding: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <View style={{
                      width: 52, height: 52, borderRadius: 16,
                      backgroundColor: 'rgba(0,0,0,0.15)',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 26 }}>📸</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: fontSize.md }}>
                        Scan Food
                      </Text>
                      <Text style={{ color: theme.textPrimary, opacity: 0.8, fontSize: fontSize.sm, marginTop: 2 }}>
                        Point camera at your meal
                      </Text>
                    </View>
                    <Text style={{ color: theme.textPrimary, fontSize: 20 }}>›</Text>
                  </TouchableOpacity>

                  {/* Voice Log */}
                  <TouchableOpacity
                    onPress={() => { setInputMode('voice'); setStage('text') }}
                    style={{
                      backgroundColor: theme.surface,
                      borderRadius: radius.lg,
                      borderWidth: 1,
                      borderColor: theme.border,
                      padding: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <View style={{
                      width: 52, height: 52, borderRadius: 16,
                      backgroundColor: theme.bg,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 26 }}>🎤</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: fontSize.md }}>
                        Voice Log
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>
                        Tap mic on keyboard to speak
                      </Text>
                    </View>
                    <Text style={{ color: theme.textMuted, fontSize: 20 }}>›</Text>
                  </TouchableOpacity>

                  {/* Type it */}
                  <TouchableOpacity
                    onPress={() => { setInputMode('type'); setStage('text') }}
                    style={{
                      backgroundColor: theme.surface,
                      borderRadius: radius.lg,
                      borderWidth: 1,
                      borderColor: theme.border,
                      padding: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <View style={{
                      width: 52, height: 52, borderRadius: 16,
                      backgroundColor: theme.bg,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 26 }}>✏️</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: fontSize.md }}>
                        Type it
                      </Text>
                      <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>
                        Describe what you ate in text
                      </Text>
                    </View>
                    <Text style={{ color: theme.textMuted, fontSize: 20 }}>›</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* SCANNING STAGE */}
              {stage === 'scanning' && (
                <View style={{ alignItems: 'center', paddingVertical: 48, gap: 16 }}>
                  <ActivityIndicator size="large" color={theme.accent} />
                  <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: fontSize.md }}>
                    Analyzing your meal...
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm, textAlign: 'center' }}>
                    Claude is identifying food items{'\n'}and calculating nutrition
                  </Text>
                </View>
              )}

              {/* TEXT STAGE */}
              {stage === 'text' && (
                <View style={{ gap: 14 }}>
                  <TouchableOpacity
                    onPress={() => setStage('options')}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}
                  >
                    <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>‹ Back</Text>
                  </TouchableOpacity>

                  <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>
                    {inputMode === 'voice'
                      ? 'Tap the mic on your keyboard to speak, or type normally'
                      : 'Describe everything you ate — be as specific as you like'}
                  </Text>

                  <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder={
                      inputMode === 'voice'
                        ? 'Tap 🎤 on your keyboard and describe your meal...'
                        : 'e.g. fish fillet and chips at McDonald\'s, a small black coffee'
                    }
                    placeholderTextColor={theme.textMuted}
                    multiline
                    autoFocus
                    style={{
                      backgroundColor: theme.surface,
                      borderRadius: radius.md,
                      borderWidth: 1.5,
                      borderColor: text.length > 0 ? theme.accent : theme.border,
                      padding: 16,
                      color: theme.textPrimary,
                      fontSize: fontSize.md,
                      minHeight: 120,
                      textAlignVertical: 'top',
                      lineHeight: 24,
                    }}
                  />

                  {error && (
                    <Text style={{ color: theme.accent, fontSize: fontSize.sm }}>{error}</Text>
                  )}

                  <TouchableOpacity
                    onPress={handleAnalyze}
                    disabled={!text.trim()}
                    style={{
                      backgroundColor: text.trim() ? theme.accent : theme.surface,
                      borderRadius: radius.md,
                      padding: 17,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 8,
                      borderWidth: text.trim() ? 0 : 1,
                      borderColor: theme.border,
                    }}
                  >
                    <Text style={{
                      color: text.trim() ? theme.textPrimary : theme.textMuted,
                      fontWeight: '900',
                      fontSize: fontSize.md,
                    }}>
                      Analyze with AI ✦
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* PREVIEW STAGE */}
              {stage === 'preview' && (
                <View style={{ gap: 12 }}>
                  {/* Items list */}
                  <View style={{
                    backgroundColor: theme.surface,
                    borderRadius: radius.lg,
                    borderWidth: 1,
                    borderColor: theme.border,
                    overflow: 'hidden',
                  }}>
                    {items.map((item, i) => (
                      <View key={i} style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        borderBottomWidth: i < items.length - 1 ? 1 : 0,
                        borderBottomColor: theme.border,
                        gap: 12,
                      }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: fontSize.md }}>
                            {item.name}
                          </Text>
                          <Text style={{ color: theme.textSecondary, fontSize: fontSize.xs, marginTop: 3 }}>
                            {item.quantity} {item.unit}
                            {'   '}{item.protein}g P · {item.carbs}g C · {item.fat}g F
                          </Text>
                        </View>
                        <Text style={{ color: theme.accent, fontWeight: '800', fontSize: fontSize.md }}>
                          {Math.round(item.calories)}
                          <Text style={{ fontSize: fontSize.xs, color: theme.textSecondary, fontWeight: '500' }}> kcal</Text>
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Total */}
                  <View style={{
                    backgroundColor: theme.accent,
                    borderRadius: radius.lg,
                    padding: 16,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <View>
                      <Text style={{ color: theme.textPrimary, opacity: 0.85, fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 0.5 }}>TOTAL</Text>
                      <Text style={{ color: theme.textPrimary, opacity: 0.85, fontSize: fontSize.sm, marginTop: 3 }}>
                        P {totalP}g · C {totalC}g · F {totalF}g
                      </Text>
                    </View>
                    <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: fontSize.xxl }}>
                      {totalCal}
                      <Text style={{ fontSize: fontSize.sm, fontWeight: '600' }}> kcal</Text>
                    </Text>
                  </View>

                  {error && (
                    <Text style={{ color: theme.accent, fontSize: fontSize.sm }}>{error}</Text>
                  )}

                  {/* Log button */}
                  <TouchableOpacity
                    onPress={handleLog}
                    disabled={saving}
                    style={{
                      backgroundColor: theme.accent,
                      borderRadius: radius.md,
                      padding: 17,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 10,
                    }}
                  >
                    {saving
                      ? <ActivityIndicator size="small" color={theme.textPrimary} />
                      : <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: fontSize.md }}>
                          Log {items.length} item{items.length !== 1 ? 's' : ''} to {MEALS.find(m => m.key === mealType)?.label}
                        </Text>
                    }
                  </TouchableOpacity>

                  {/* Back */}
                  <TouchableOpacity
                    onPress={() => { setStage('options'); setError(null) }}
                    disabled={saving}
                    style={{ alignItems: 'center', paddingVertical: 10 }}
                  >
                    <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>
                      ‹ Start over
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}