import { useRef, useState } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView,
  Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Circle } from 'react-native-svg'
import { theme, spacing, fontSize, radius } from '@/constants/theme'
import NutriArcLogo from '@/components/NutriArcLogo'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const SLIDES: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  title: string
  tagline: string
}[] = [
  {
    icon: 'nutrition-outline',
    title: 'Track meals\nin seconds',
    tagline: 'Snap a photo or type what you ate — AI handles the rest.',
  },
  {
    icon: 'barbell-outline',
    title: 'Workouts built\nfor you',
    tagline: 'Personalized training plans that adapt to your goals and equipment.',
  },
  {
    icon: 'trending-up-outline',
    title: 'Watch your\nprogress grow',
    tagline: 'Every meal, every rep, every day — all tracked in one place.',
  },
]

function AmbientGlow() {
  const size = SCREEN_WIDTH * 1.6
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: -size * 0.35,
        left: -(size - SCREEN_WIDTH) / 2,
        width: size,
        height: size,
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size / 2} cy={size / 2} r={size * 0.32} fill={theme.accent} opacity={0.16} />
        <Circle cx={size / 2} cy={size / 2} r={size * 0.24} fill={theme.accent} opacity={0.14} />
        <Circle cx={size / 2} cy={size / 2} r={size * 0.16} fill={theme.accent} opacity={0.12} />
        {/* Orbit trails */}
        <Circle
          cx={size / 2} cy={size / 2} r={size * 0.38}
          fill="none" stroke={theme.accent} strokeOpacity={0.35} strokeWidth={2}
          strokeDasharray={`${size * 0.9} ${size * 1.4}`}
        />
        <Circle
          cx={size / 2} cy={size / 2} r={size * 0.3}
          fill="none" stroke={theme.accent} strokeOpacity={0.25} strokeWidth={1.5}
          strokeDasharray={`${size * 0.6} ${size * 1.6}`}
          transform={`rotate(120 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  )
}

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<ScrollView>(null)
  const [index, setIndex] = useState(0)
  const isLast = index === SLIDES.length - 1

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
    setIndex(i)
  }

  function goNext() {
    const next = Math.min(index + 1, SLIDES.length - 1)
    scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true })
    setIndex(next)
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, overflow: 'hidden' }}>
      <AmbientGlow />

      {/* Header */}
      <View style={{
        alignItems: 'center',
        paddingTop: insets.top + spacing.md,
        gap: spacing.sm,
      }}>
        <NutriArcLogo size={56} />
        <Text style={{
          fontSize: fontSize.xl,
          fontWeight: '800',
          color: theme.textPrimary,
          letterSpacing: -0.5,
        }}>
          NutriArc
        </Text>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => (
          <View
            key={i}
            style={{
              width: SCREEN_WIDTH,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: spacing.xl,
              gap: spacing.lg,
            }}
          >
            <View style={{
              width: 104, height: 104, borderRadius: 999,
              borderWidth: 1.5, borderColor: theme.accent,
              backgroundColor: 'rgba(0,0,0,0.2)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name={slide.icon} size={44} color={theme.accent} />
            </View>

            <View style={{ gap: spacing.sm, alignItems: 'center' }}>
              <Text style={{
                fontSize: 32,
                fontWeight: '800',
                color: theme.textPrimary,
                letterSpacing: -0.5,
                textAlign: 'center',
                lineHeight: 38,
              }}>
                {slide.title}
              </Text>
              <Text style={{
                fontSize: fontSize.sm,
                color: theme.textSecondary,
                textAlign: 'center',
                lineHeight: 21,
                maxWidth: '85%',
              }}>
                {slide.tagline}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={{
        paddingHorizontal: spacing.xl,
        paddingBottom: insets.bottom + spacing.md,
        paddingTop: spacing.sm,
        gap: spacing.lg,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Dots */}
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === index ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === index ? theme.accent : theme.border,
                }}
              />
            ))}
          </View>

          {!isLast && (
            <TouchableOpacity
              onPress={goNext}
              style={{
                width: 52, height: 52, borderRadius: 999,
                backgroundColor: theme.accent,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons name="arrow-forward" size={22} color={theme.textPrimary} />
            </TouchableOpacity>
          )}
        </View>

        {isLast && (
          <View style={{ gap: spacing.md }}>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={{
                backgroundColor: theme.accent,
                borderRadius: radius.lg,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: fontSize.md }}>
                Get started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={{ alignItems: 'center' }}
            >
              <Text style={{ color: theme.textSecondary, fontSize: fontSize.sm }}>
                Already have an account?{' '}
                <Text style={{ color: theme.accent, fontWeight: '700' }}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}