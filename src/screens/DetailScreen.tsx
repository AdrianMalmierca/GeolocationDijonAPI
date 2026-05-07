import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, Platform, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useFavourites } from '../hooks/useFavourites';
import { Colors } from '../constants';
import { Cave } from '../types';

// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  Detail: { cave: Cave };
};

type DetailRouteProp = RouteProp<RootStackParamList, 'Detail'>;

const CATEGORY_CONFIG = {
  cave:       { icon: 'wine'       as const, label: 'Cave à vins',  color: Colors.burgundy },
  commerce:   { icon: 'storefront' as const, label: 'Commerce',     color: Colors.brown    },
  restaurant: { icon: 'restaurant' as const, label: 'Restaurant',   color: Colors.gold     },
  equipement: { icon: 'business'   as const, label: 'Équipement',   color: Colors.warmGray },
};

export default function DetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<DetailRouteProp>();
  const { cave } = route.params;
  const { isFavourite, toggleFavourite } = useFavourites();

  const config = CATEGORY_CONFIG[cave.category] ?? CATEGORY_CONFIG.commerce;
  const favourite = isFavourite(cave.id);

  const openMaps = useCallback(() => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(cave.name)}@${cave.latitude},${cave.longitude}`,
      android: `geo:${cave.latitude},${cave.longitude}?q=${encodeURIComponent(cave.name)}`,
    });
    if (url) Linking.openURL(url);
  }, [cave]);

  const openPhone = useCallback(() => {
    if (cave.phone) Linking.openURL(`tel:${cave.phone}`);
  }, [cave.phone]);

  const openWebsite = useCallback(() => {
    if (cave.website) Linking.openURL(cave.website);
  }, [cave.website]);

  const handleShare = useCallback(async () => {
    const mapsUrl = `https://www.google.com/maps?q=${cave.latitude},${cave.longitude}`;
    await Share.share({
      title: cave.name,
      message: `${cave.name}\n${cave.address}\n\n${mapsUrl}`,
    });
  }, [cave]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.cream} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{cave.name}</Text>
        <TouchableOpacity
          style={styles.favouriteBtn}
          onPress={() => toggleFavourite(cave)}
        >
          <Ionicons
            name={favourite ? 'heart' : 'heart-outline'}
            size={24}
            color={favourite ? Colors.burgundyLight : Colors.cream}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon} size={64} color={Colors.white + 'CC'} />
          <View style={styles.heroContent}>
            <Text style={styles.heroName}>{cave.name}</Text>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{config.label}</Text>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={openMaps}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.burgundy }]}>
              <Ionicons name="navigate" size={20} color={Colors.white} />
            </View>
            <Text style={styles.actionLabel}>Itinéraire</Text>
          </TouchableOpacity>

          {cave.phone ? (
            <TouchableOpacity style={styles.actionBtn} onPress={openPhone}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.gold }]}>
                <Ionicons name="call" size={20} color={Colors.white} />
              </View>
              <Text style={styles.actionLabel}>Appeler</Text>
            </TouchableOpacity>
          ) : null}

          {cave.website ? (
            <TouchableOpacity style={styles.actionBtn} onPress={openWebsite}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.brown }]}>
                <Ionicons name="globe" size={20} color={Colors.white} />
              </View>
              <Text style={styles.actionLabel}>Site web</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.warmGray }]}>
              <Ionicons name="share-social" size={20} color={Colors.white} />
            </View>
            <Text style={styles.actionLabel}>Partager</Text>
          </TouchableOpacity>
        </View>

        {/* Info card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations</Text>

          {cave.address ? (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color={Colors.burgundy} />
              <Text style={styles.infoText}>{cave.address}</Text>
            </View>
          ) : null}

          {cave.openingHours ? (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color={Colors.burgundy} />
              <Text style={styles.infoText}>{cave.openingHours}</Text>
            </View>
          ) : null}

          {cave.phone ? (
            <TouchableOpacity style={styles.infoRow} onPress={openPhone}>
              <Ionicons name="call-outline" size={18} color={Colors.burgundy} />
              <Text style={[styles.infoText, styles.infoLink]}>{cave.phone}</Text>
            </TouchableOpacity>
          ) : null}

          {cave.website ? (
            <TouchableOpacity style={styles.infoRow} onPress={openWebsite}>
              <Ionicons name="globe-outline" size={18} color={Colors.burgundy} />
              <Text style={[styles.infoText, styles.infoLink]} numberOfLines={1}>
                {cave.website.replace('https://', '').replace('http://', '')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Description */}
        {cave.description ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.descriptionText}>{cave.description}</Text>
          </View>
        ) : null}

        {/* Coordonnées */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Localisation</Text>
          <View style={styles.infoRow}>
            <Ionicons name="compass-outline" size={18} color={Colors.burgundy} />
            <Text style={styles.infoText}>
              {cave.latitude.toFixed(5)}, {cave.longitude.toFixed(5)}
            </Text>
          </View>
          <TouchableOpacity style={styles.mapsFullBtn} onPress={openMaps}>
            <Ionicons name="map" size={16} color={Colors.white} />
            <Text style={styles.mapsFullBtnText}>Ouvrir dans Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Source */}
        {cave.source === 'mock' && (
          <Text style={styles.sourceNote}>Données de démonstration</Text>
        )}

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.darkBrown,
  },
  headerTitle: {
    flex: 1, color: Colors.cream,
    fontSize: 17, fontWeight: '700', letterSpacing: 0.2,
  },
  favouriteBtn: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.darkBrown,
  },

  // Hero
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 20,
  },
  heroContent: { flex: 1 },
  heroName: {
    color: Colors.white,
    fontSize: 22, fontWeight: '800',
    letterSpacing: -0.5, marginBottom: 8,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white + '33',
    borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  heroBadgeText: { color: Colors.white, fontSize: 13, fontWeight: '600' },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  actionBtn: { flex: 1, alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  actionLabel: { fontSize: 11, color: Colors.darkBrown, fontWeight: '600' },

  // Cards
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.dark,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 10, marginBottom: 10,
  },
  infoText: { flex: 1, fontSize: 14, color: Colors.darkBrown, lineHeight: 20 },
  infoLink: { color: Colors.burgundy, textDecorationLine: 'underline' },
  descriptionText: { fontSize: 14, color: Colors.brown, lineHeight: 21, fontStyle: 'italic' },

  // Maps button
  mapsFullBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.burgundy,
    borderRadius: 12, paddingVertical: 12, marginTop: 8,
  },
  mapsFullBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },

  sourceNote: {
    textAlign: 'center', color: Colors.warmGray,
    fontSize: 11, fontStyle: 'italic', marginTop: 16,
  },
  scroll: { flex: 1 },
});
