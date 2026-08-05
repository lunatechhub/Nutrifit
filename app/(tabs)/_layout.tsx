import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/constants/theme'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

interface TabConfig {
  name: string
  title: string
  icon: IoniconName
  iconFocused: IoniconName
}

const TABS: TabConfig[] = [
  { name: 'index',     title: 'Home',      icon: 'home-outline',      iconFocused: 'home' },
  { name: 'nutrition', title: 'Nutrition', icon: 'restaurant-outline', iconFocused: 'restaurant' },
  { name: 'workout',   title: 'Workout',   icon: 'barbell-outline',    iconFocused: 'barbell' },
  { name: 'progress',  title: 'Progress',  icon: 'bar-chart-outline',  iconFocused: 'bar-chart' },
  { name: 'profile',   title: 'Profile',   icon: 'person-outline',     iconFocused: 'person' },
]

export default function TabLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.navBar,
          borderTopColor: theme.navBarBorder,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: insets.bottom + 4,
          height: 56 + insets.bottom,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}
