/**
 * RoutesScreen.tsx
 * Rutas de vino de Borgoña — sin MapView (evita crash nativo)
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, Platform, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ROUTES_VIN, Colors } from '../constants';
import { RouteVin } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RoutesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedRoute, setSelectedRoute] = useState<RouteVin>(ROUTES_VIN[0]);

  const openInMaps = (route: RouteVin) => {
    const start = route.waypoints[0];
    const end = route.waypoints[route.waypoints.length - 1];
    const url = Platform.select({
      ios: `maps:?saddr=${start.lat},${start.lng}&daddr=${end.lat},${end.lng}`,
      android: `google.navigation:q=${end.lat},${end.lng}`,
    });
    if (url) Linking.openURL(url);
  };

  const DIFFICULTY_COLOR = {
    'Facile': Colors.success,
    'Modéré': Colors.gold,
    'Difficile': Colors.error,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Routes des Vins</Text>
        <Text style={styles.headerSubtitle}>Bourgogne & Côte de Nuits</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Selector de rutas */}
        <View style={styles.routeSelector}>
          {ROUTES_VIN.map(route => (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.routeTab,
                selectedRoute.id === route.id && { borderColor: route.color, borderWidth: 2 }
              ]}
              onPress={() => setSelectedRoute(route)}
            >
              <View style={[styles.routeColorBar, { backgroundColor: route.color }]} />
              <Text style={styles.routeTabName} numberOfLines={2}>{route.name}</Text>
              {selectedRoute.id === route.id && (
                <Ionicons name="checkmark-circle" size={16} color={route.color} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Visualización gráfica de la ruta */}
        <View style={styles.routeVisual}>
          <Text style={styles.routeVisualTitle}>{selectedRoute.name}</Text>
          <View style={styles.routeLine}>
            {selectedRoute.waypoints.map((wp, i) => (
              <View key={i} style={styles.waypointItem}>
                {/* Punto + línea conectora */}
                <View style={styles.waypointConnector}>
                  <View style={[
                    styles.waypointDot,
                    {
                      backgroundColor:
                        i === 0 ? Colors.success :
                        i === selectedRoute.waypoints.length - 1 ? Colors.error :
                        selectedRoute.color
                    }
                  ]}>
                    <Text style={styles.waypointNum}>{i + 1}</Text>
                  </View>
                  {i < selectedRoute.waypoints.length - 1 && (
                    <View style={[styles.connector, { backgroundColor: selectedRoute.color + '66' }]} />
                  )}
                </View>
                {/* Nombre */}
                <View style={styles.waypointInfo}>
                  <Text style={styles.waypointName}>{wp.name}</Text>
                  {i === 0 && <Text style={styles.waypointTag}>Départ</Text>}
                  {i === selectedRoute.waypoints.length - 1 && (
                    <Text style={[styles.waypointTag, { color: Colors.error }]}>Arrivée</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Detalle */}
        <View style={styles.routeDetail}>
          <Text style={styles.routeDesc}>{selectedRoute.description}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={22} color={Colors.gold} />
              <Text style={styles.statValue}>{selectedRoute.duration}</Text>
              <Text style={styles.statLabel}>Durée</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Ionicons name="speedometer-outline" size={22} color={Colors.gold} />
              <Text style={styles.statValue}>{selectedRoute.distance}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Ionicons
                name="trending-up-outline"
                size={22}
                color={DIFFICULTY_COLOR[selectedRoute.difficulty]}
              />
              <Text style={[
                styles.statValue,
                { color: DIFFICULTY_COLOR[selectedRoute.difficulty] }
              ]}>
                {selectedRoute.difficulty}
              </Text>
              <Text style={styles.statLabel}>Difficulté</Text>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: selectedRoute.color }]}
            onPress={() => openInMaps(selectedRoute)}
          >
            <Ionicons name="navigate" size={20} color={Colors.white} />
            <Text style={styles.ctaBtnText}>Démarrer dans Maps</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            * Données issues du réseau des Routes des Vins de Bourgogne.
            Consultez l'Office de Tourisme de Dijon pour les dernières mises à jour.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: {
    backgroundColor: Colors.dark,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    color: Colors.gold,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: Colors.warmGray,
    fontSize: 13,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  routeSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  routeTab: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  routeColorBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  routeTabName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.darkBrown,
    textAlign: 'center',
  },
  routeVisual: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  routeVisualTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  routeLine: {
    gap: 0,
  },
  waypointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    minHeight: 52,
  },
  waypointConnector: {
    alignItems: 'center',
    width: 32,
  },
  waypointDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  waypointNum: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  connector: {
    width: 2,
    height: 20,
    marginTop: 0,
  },
  waypointInfo: {
    flex: 1,
    paddingTop: 6,
    paddingBottom: 12,
  },
  waypointName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkBrown,
  },
  waypointTag: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeDetail: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  routeDesc: {
    fontSize: 14,
    color: Colors.brown,
    lineHeight: 21,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.warmGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.lightGray,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.warmGray,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 16,
  },
});
