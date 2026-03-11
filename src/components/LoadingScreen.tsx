import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Chargement des caves...' }: LoadingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Ionicons name="wine" size={64} color={Colors.burgundy} />
      </Animated.View>
      <Text style={styles.title}>Dijon Vin & Terroir</Text>
      <Text style={styles.subtitle}>{message}</Text>
      <View style={styles.dots}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.3 }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    color: Colors.gold,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtitle: {
    color: Colors.warmGray,
    fontSize: 14,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.burgundy,
  },
});
