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

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleResetPassword() {
    if (!email) {
      Alert.alert('Error', 'Please enter your email')
      return
    }

    try {
      setLoading(true)
      await resetPassword(email.trim().toLowerCase())
      Alert.alert(
        'Check Your Email',
        'We sent a password reset link to your email. Follow the link to set a new password.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      )
    } catch (error: any) {
      Alert.alert('Reset Failed', error.message)
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
            Reset Password
          </Text>
          <Text style={{
            fontSize: fontSize.md,
            color: theme.textSecondary,
            marginTop: spacing.xs,
          }}>
            Enter your email and we'll send you a link to reset your password
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: spacing.md }}>
          <View>
            <Text style={{
              fontSize: fontSize.sm,
              color: theme.textSecondary,
              marginBottom: spacing.xs,
              fontWeight: '600',
            }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
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

          <TouchableOpacity
            onPress={handleResetPassword}
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            style={{
              alignItems: 'center',
              marginTop: spacing.sm,
            }}
          >
            <Text style={{
              color: theme.textSecondary,
              fontSize: fontSize.sm,
              fontWeight: '600',
            }}>
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
