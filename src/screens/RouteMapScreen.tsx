import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Platform, Linking, ScrollView,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors } from '../constants';
import { Cave } from '../types';
import { RootStackParamList } from '../../App';

type RouteMapRouteProp = RouteProp<RootStackParamList, 'RouteMap'>;

const ROUTE_COLOR = '#6B1A2A';

export default function RouteMapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteMapRouteProp>();
  const { stops } = route.params;
  const mapRef = useRef<MapView>(null);

  //Fit map to show all stops
  useEffect(() => {
    if (stops.length > 0 && mapRef.current) {
      const coords = stops.map(s => ({ latitude: s.latitude, longitude: s.longitude }));
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 80, right: 40, bottom: 200, left: 40 },
          animated: true,
        });
      }, 500);
    }
  }, [stops]);

  const openInGoogleMaps = () => {
    if (stops.length < 2) return;
    const origin = `${stops[0].latitude},${stops[0].longitude}`;
    const destination = `${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`;
    const waypoints = stops
      .slice(1, -1)
      .map(s => `${s.latitude},${s.longitude}`)
      .join('|');

    const url = Platform.select({
      ios: waypoints
        ? `comgooglemaps://?saddr=${origin}&daddr=${destination}&waypoints=${waypoints}&directionsmode=driving`
        : `comgooglemaps://?saddr=${origin}&daddr=${destination}&directionsmode=driving`,
      android: waypoints
        ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`
        : `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
    });

    // Fallback to web if Google Maps app not installed
    const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=driving`;

    if (url) {
      Linking.canOpenURL(url).then(supported => {
        Linking.openURL(supported ? url : webUrl);
      });
    }
  };

  const polylineCoords = stops.map(s => ({
    latitude: s.latitude,
    longitude: s.longitude,
  }));

  const totalDistance = () => {
    let total = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i];
      const b = stops[i + 1];
      const R = 6371;
      const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
      const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
      const x =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((a.latitude * Math.PI) / 180) *
        Math.cos((b.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      total += R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    }
    return total < 1 ? `${(total * 1000).toFixed(0)} m` : `${total.toFixed(1)} km`;
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* Route polyline */}
        <Polyline
          coordinates={polylineCoords}
          strokeColor={ROUTE_COLOR}
          strokeWidth={4}
          lineDashPattern={[0]}
        />

        {/* Stop markers */}
        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            tracksViewChanges={false}
          >
            <View style={styles.markerContainer}>
              <View style={[
                styles.markerBubble,
                {
                  backgroundColor: index === 0
                    ? Colors.success
                    : index === stops.length - 1
                    ? Colors.error
                    : ROUTE_COLOR
                }
              ]}>
                <Text style={styles.markerNum}>{index + 1}</Text>
              </View>
              <View style={[
                styles.markerTail,
                {
                  borderTopColor: index === 0
                    ? Colors.success
                    : index === stops.length - 1
                    ? Colors.error
                    : ROUTE_COLOR
                }
              ]} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Back button */}
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={Colors.dark} />
        </TouchableOpacity>
        <View style={styles.titlePill}>
          <Text style={styles.titleText}>
            {stops.length} étapes · {totalDistance()}
          </Text>
        </View>
      </View>

      {/* Bottom panel */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 16 }]}>
        {/* Stop list */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stopsScroll}
        >
          {stops.map((stop, index) => (
            <View key={stop.id} style={styles.stopChip}>
              <View style={[
                styles.stopChipDot,
                {
                  backgroundColor: index === 0
                    ? Colors.success
                    : index === stops.length - 1
                    ? Colors.error
                    : ROUTE_COLOR
                }
              ]}>
                <Text style={styles.stopChipNum}>{index + 1}</Text>
              </View>
              <Text style={styles.stopChipName} numberOfLines={1}>{stop.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Google Maps button */}
        <TouchableOpacity style={styles.googleMapsBtn} onPress={openInGoogleMaps}>
          <Ionicons name="navigate" size={20} color={Colors.white} />
          <Text style={styles.googleMapsBtnText}>Ouvrir dans Google Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  // Markers
  markerContainer: { alignItems: 'center' },
  markerBubble: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 3, elevation: 4,
  },
  markerNum: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  markerTail: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    marginTop: -1,
  },

  // Top bar
  topBar: {
    position: 'absolute', left: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  titlePill: {
    flex: 1, backgroundColor: Colors.dark + 'EE',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  titleText: { color: Colors.cream, fontSize: 14, fontWeight: '600' },

  // Bottom panel
  bottomPanel: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 8,
  },
  stopsScroll: {
    paddingHorizontal: 16, gap: 8, paddingBottom: 14,
  },
  stopChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Colors.cream,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    // Quita maxWidth: 160
  },
  stopChipName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.darkBrown,
    maxWidth: 120,
  },
  stopChipDot: {
    width: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  stopChipNum: { color: Colors.white, fontSize: 10, fontWeight: '800' },

  // Google Maps button
  googleMapsBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    backgroundColor: Colors.burgundy,
    marginHorizontal: 16, borderRadius: 16, paddingVertical: 15,
  },
  googleMapsBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});