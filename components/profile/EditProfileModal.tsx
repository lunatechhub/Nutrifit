import {
  View, Text, Modal, TouchableOpacity, TextInput, Image,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native'
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppStore } from '@/stores/useAppStore'
import { uploadAvatar, saveProfileEdits } from '@/lib/profile'
import { theme, spacing, fontSize, radius } from '@/constants/theme'

interface Props {
  visible: boolean
  onClose: () => void
}

export default function EditProfileModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const { user, updateUser } = useAppStore()

  const [name, setName] = useState(user?.name ?? '')
  const [targetWeight, setTargetWeight] = useState(user?.targetWeight?.toString() ?? '')
  const [pickedImage, setPickedImage] = useState<{ base64: string; mimeType: string; previewUri: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initials = (name || user?.name)
    ?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'

  const avatarPreview = pickedImage?.previewUri ?? user?.avatarUrl

  function reset() {
    setName(user?.name ?? '')
    setTargetWeight(user?.targetWeight?.toString() ?? '')
    setPickedImage(null)
    setError(null)
    setSaving(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function pickImage(fromCamera: boolean) {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (perm.status !== 'granted') {
      Alert.alert('Permission required', fromCamera ? 'Camera access is needed to take a photo.' : 'Photo library access is needed.')
      return
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.5, allowsEditing: true, aspect: [1, 1], mediaTypes: ['images'] })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.5, allowsEditing: true, aspect: [1, 1], mediaTypes: ['images'] })

    if (result.canceled || !result.assets?.[0]?.base64) return

    const asset = result.assets[0]
    setPickedImage({
      base64: asset.base64!,
      mimeType: asset.mimeType ?? 'image/jpeg',
      previewUri: asset.uri,
    })
  }

  function promptPhotoSource() {
    Alert.alert('Change Photo', 'Choose a source', [
      { text: 'Camera', onPress: () => pickImage(true) },
      { text: 'Photo Library', onPress: () => pickImage(false) },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Name cannot be empty')
      return
    }
    const parsedTarget = targetWeight.trim() ? parseFloat(targetWeight) : null
    if (targetWeight.trim() && (isNaN(parsedTarget!) || parsedTarget! <= 0)) {
      setError('Enter a valid target weight')
      return
    }

    setSaving(true)
    setError(null)
    try {
      let avatarUrl: string | undefined
      if (pickedImage) {
        avatarUrl = await uploadAvatar(pickedImage.base64, pickedImage.mimeType)
      }

      await saveProfileEdits({ name: name.trim(), targetWeight: parsedTarget }, avatarUrl)
      updateUser({
        name: name.trim(),
        targetWeight: parsedTarget ?? undefined,
        ...(avatarUrl ? { avatarUrl } : {}),
      })
      reset()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save changes')
      setSaving(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: theme.overlay }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{
            backgroundColor: theme.bg,
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            borderTopWidth: 1, borderColor: theme.border,
            maxHeight: '88%',
          }}>
            <View style={{ alignItems: 'center', paddingTop: 14, paddingBottom: 6 }}>
              <View style={{ width: 40, height: 4, borderRadius: 99, backgroundColor: theme.border }} />
            </View>

            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: spacing.md, paddingBottom: 14,
            }}>
              <Text style={{ color: theme.textPrimary, fontSize: fontSize.xl, fontWeight: '800', letterSpacing: -0.3 }}>
                Edit Profile
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

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: insets.bottom + spacing.lg }}
              showsVerticalScrollIndicator={false}
            >
              {/* Avatar picker */}
              <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
                <TouchableOpacity onPress={promptPhotoSource} activeOpacity={0.8}>
                  <View style={{
                    width: 92, height: 92, borderRadius: 999,
                    backgroundColor: theme.accent,
                    alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {avatarPreview
                      ? <Image source={{ uri: avatarPreview }} style={{ width: 92, height: 92 }} />
                      : <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: 30 }}>{initials}</Text>
                    }
                  </View>
                  <View style={{
                    position: 'absolute', right: -2, bottom: -2,
                    width: 32, height: 32, borderRadius: 999,
                    backgroundColor: theme.accent,
                    borderWidth: 3, borderColor: theme.bg,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ionicons name="camera" size={16} color={theme.textPrimary} />
                  </View>
                </TouchableOpacity>
                <Text style={{ color: theme.textSecondary, fontSize: fontSize.xs, marginTop: 10 }}>
                  Tap to change photo
                </Text>
              </View>

              {/* Name */}
              <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.xs }}>
                Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={theme.textMuted}
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: theme.border,
                  padding: spacing.md,
                  color: theme.textPrimary,
                  fontSize: fontSize.md,
                  marginBottom: spacing.lg,
                }}
              />

              {/* Target weight */}
              <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.xs }}>
                Target weight ({user?.weightUnit ?? 'kg'})
              </Text>
              <TextInput
                value={targetWeight}
                onChangeText={v => setTargetWeight(v.replace(/[^0-9.]/g, ''))}
                placeholder="e.g. 65"
                keyboardType="decimal-pad"
                placeholderTextColor={theme.textMuted}
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: theme.border,
                  padding: spacing.md,
                  color: theme.textPrimary,
                  fontSize: fontSize.md,
                  marginBottom: spacing.lg,
                }}
              />

              {error && (
                <Text style={{ color: theme.accent, fontSize: fontSize.sm, marginBottom: spacing.md }}>{error}</Text>
              )}

              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={{
                  backgroundColor: theme.accent,
                  borderRadius: radius.md,
                  padding: 17,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving
                  ? <ActivityIndicator size="small" color={theme.textPrimary} />
                  : <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: fontSize.md }}>Save changes</Text>
                }
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}
