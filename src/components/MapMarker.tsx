import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { Cave } from '../types';

interface MapMarkerProps {
  cave: Cave;
  selected?: boolean;
}

const MARKER_CONFIG = {
  cave: { icon: 'wine' as const, bg: Colors.burgundy },
  commerce: { icon: 'storefront' as const, bg: Colors.brown },
  restaurant: { icon: 'restaurant' as const, bg: Colors.gold },
  equipement: { icon: 'business' as const, bg: Colors.warmGray },
};

export function MapMarker({ cave, selected = false }: MapMarkerProps) {
  const config = MARKER_CONFIG[cave.category] ?? MARKER_CONFIG.commerce;
  const scale = selected ? 1.3 : 1;

  return (
    <View style={[styles.container, { transform: [{ scale }] }]}>
      <View style={[styles.bubble, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon} size={18} color={Colors.white} />
      </View>
      <View style={[styles.tail, { borderTopColor: config.bg }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  bubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
