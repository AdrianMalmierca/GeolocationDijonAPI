import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import MapScreen from './src/screens/MapScreen';
import ListScreen from './src/screens/ListScreen';
import RoutesScreen from './src/screens/RoutesScreen';
import AboutScreen from './src/screens/AboutScreen';
import { Colors } from './src/constants';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: Colors.dark,
              borderTopColor: Colors.darkBrown,
              borderTopWidth: 1,
              height: Platform.OS === 'ios' ? 85 : 60,
              paddingBottom: Platform.OS === 'ios' ? 20 : 6,
              paddingTop: 6,
            },
            tabBarActiveTintColor: Colors.gold,
            tabBarInactiveTintColor: Colors.warmGray,
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 0.3,
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;
              if (route.name === 'Carte') {
                iconName = focused ? 'map' : 'map-outline';
              } else if (route.name === 'Caves') {
                iconName = focused ? 'wine' : 'wine-outline';
              } else if (route.name === 'Routes') {
                iconName = focused ? 'navigate' : 'navigate-outline';
              } else {
                iconName = focused ? 'information-circle' : 'information-circle-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Carte" component={MapScreen} />
          <Tab.Screen name="Caves" component={ListScreen} />
          <Tab.Screen name="Routes" component={RoutesScreen} />
          <Tab.Screen name="Infos" component={AboutScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
