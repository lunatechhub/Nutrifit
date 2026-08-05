import { useEffect } from 'react'
import { Stack, router, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { useAppStore } from '../stores/useAppStore'
import { View, ActivityIndicator } from 'react-native'
import { theme } from '../constants/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth()
  const { isOnboarded } = useAppStore()
  const segments = useSegments()

  useEffect(() => {
    if (isLoading) return

    const inAuth = segments[0] === '(auth)'
    const inOnboarding = segments[0] === 'onboarding'
    const inTabs = segments[0] === '(tabs)'

    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login')
    } else if (isAuthenticated && !isOnboarded && !inOnboarding) {
      router.replace('/onboarding')
    } else if (isAuthenticated && isOnboarded && !inTabs) {
      router.replace('/(tabs)')
    }
  }, [isAuthenticated, isLoading, isOnboarded, segments])

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.bg
      }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding/index" />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.bg }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <RootLayoutNav />
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}