import { useAuthStore } from '@/lib/stores/authStore';
import { Redirect, Tabs } from 'expo-router';
import { Text, View } from 'react-native';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View className="items-center justify-center pt-1">
      <Text className={`text-2xl ${focused ? 'opacity-100' : 'opacity-50'}`}>{emoji}</Text>
      <Text
        className={`text-[10px] mt-0.5 font-[Inter_500Medium] ${
          focused ? 'text-[#4338CA]' : 'text-[#94A3B8]'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Inicio" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="agendar"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" label="Agendar" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="citas"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗓️" label="Citas" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Historial" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="documentos"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📁" label="Docs" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Perfil" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
