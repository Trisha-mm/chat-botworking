import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#F5908E',
          tabBarInactiveTintColor: '#8E8E93',
        }}
      >
        {/* Tab 1: State picker + how a bill becomes law */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={24} />
            ),
          }}
        />

        {/* Tab 2: All bills */}
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Bills',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'document-text' : 'document-text-outline'} color={color} size={24} />
            ),
          }}
        />

        {/* Tab 3: Contact legislators */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Contact',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'call' : 'call-outline'} color={color} size={24} />
            ),
          }}
        />

        {/* Tab 4: The process / how it works */}
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Process',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'git-branch' : 'git-branch-outline'} color={color} size={24} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}