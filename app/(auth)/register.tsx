import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { theme, spacing, fontSize, radius } from '@/constants/theme'

export default function RegisterScreen() {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      await signUp(email.trim().toLowerCase(), password, name.trim())
      Alert.alert(
        'Account Created!',
        'Please check your email to verify your account, then sign in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      )
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ marginBottom: spacing.xxl }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: spacing.lg }}
          >
            <Text style={{ color: theme.accent, fontSize: fontSize.md }}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={{
            fontSize: fontSize.xxxl,
            fontWeight: '800',
            color: theme.textPrimary,
            letterSpacing: -1,
          }}>
            Create Account
          </Text>
          <Text style={{
            fontSize: fontSize.md,
            color: theme.textSecondary,
            marginTop: spacing.xs,
          }}>
            Start your fitness journey today
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: spacing.md }}>
          {[
            { label: 'Full Name', value: name, setter: setName,
              placeholder: 'John Doe', type: 'default' },
            { label: 'Email', value: email, setter: setEmail,
              placeholder: 'you@example.com', type: 'email-address' },
            { label: 'Password', value: password, setter: setPassword,
              placeholder: '••••••••', type: 'default', secure: true },
            { label: 'Confirm Password', value: confirmPassword,
              setter: setConfirmPassword, placeholder: '••••••••',
              type: 'default', secure: true },
          ].map((field) => (
            <View key={field.label}>
              <Text style={{
                fontSize: fontSize.sm,
                color: theme.textSecondary,
                marginBottom: spacing.xs,
                fontWeight: '600',
              }}>
                {field.label}
              </Text>
              <TextInput
                value={field.value}
                onChangeText={field.setter}
                placeholder={field.placeholder}
                placeholderTextColor={theme.textMuted}
                keyboardType={field.type as any}
                autoCapitalize={field.type === 'email-address' ? 'none' : 'words'}
                secureTextEntry={field.secure}
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  color: theme.textPrimary,
                  fontSize: fontSize.md,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              />
            </View>
          ))}

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={{
              backgroundColor: theme.accent,
              opacity: loading ? 0.6 : 1,
              borderRadius: radius.md,
              padding: spacing.md,
              alignItems: 'center',
              marginTop: spacing.sm,
            }}
          >
            <Text style={{
              color: theme.textPrimary,
              fontSize: fontSize.md,
              fontWeight: '700',
            }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}