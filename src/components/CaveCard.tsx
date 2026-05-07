import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Linking, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Cave } from '../types';
import { Colors } from '../constants';
import { formatDistance } from '../services/dijonApi';
import { useFavourites } from '../hooks/useFavourites';
import { RootStackParamList } from '../../App';

interface CaveCardProps {
  cave: Cave;
  style?: object;
  isFavourite?: boolean;
  onToggleFavourite?: (cave: Cave) => void;
}

const CATEGORY_CONFIG = {
  cave:       { icon: 'wine'       as const, label: 'Cave à vins', color: Colors.burgundy },
  commerce:   { icon: 'storefront' as const, label: 'Commerce',    color: Colors.brown    },
  restaurant: { icon: 'restaurant' as const, label: 'Restaurant',  color: Colors.gold     },
  equipement: { icon: 'business'   as const, label: 'Équipement',  color: Colors.warmGray },
};

type NavProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

export function CaveCard({ cave, style, isFavourite = false, onToggleFavourite }: CaveCardProps) {
  const navigation = useNavigation<NavProp>();
  const config = CATEGORY_CONFIG[cave.category] ?? CATEGORY_CONFIG.commerce;
  const favourite = isFavourite;

  const openMaps = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(cave.name)}@${cave.latitude},${cave.longitude}`,
      android: `geo:${cave.latitude},${cave.longitude}?q=${encodeURIComponent(cave.name)}`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => navigation.navigate('Detail', { cave })}
      activeOpacity={0.85}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: config.color + '22' }]}>
          <Ionicons name={config.icon} size={22} color={config.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={2}>{cave.name}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.categoryBadge, { backgroundColor: config.color }]}>
              <Text style={styles.categoryLabel}>{config.label}</Text>
            </View>
            {cave.distance != null && (
              <View style={styles.distanceBadge}>
                <Ionicons name="navigate" size={11} color={Colors.warmGray} />
                <Text style={styles.distanceText}>{formatDistance(cave.distance)}</Text>
              </View>
            )}
          </View>
        </View>
        {/* Favourite button */}
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={() => onToggleFavourite?.(cave)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={favourite ? 'heart' : 'heart-outline'}
            size={20}
            color={favourite ? Colors.burgundyLight : Colors.warmGray}
          />
        </TouchableOpacity>
      </View>

      {/* Address */}
      {cave.address ? (
        <View style={styles.row}>
          <Ionicons name="location-outline" size={13} color={Colors.warmGray} />
          <Text style={styles.address} numberOfLines={1}>{cave.address}</Text>
        </View>
      ) : null}

      {/* Description */}
      {cave.description ? (
        <Text style={styles.description} numberOfLines={2}>{cave.description}</Text>
      ) : null}

      {/* Footer actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBtn} onPress={openMaps}>
          <Ionicons name="navigate" size={14} color={Colors.burgundy} />
          <Text style={styles.footerBtnText}>Itinéraire</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerBtn}
          onPress={() => navigation.navigate('Detail', { cave })}
        >
          <Ionicons name="information-circle-outline" size={14} color={Colors.brown} />
          <Text style={styles.footerBtnText}>Détails</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16, padding: 14,
    marginHorizontal: 16, marginVertical: 6,
    shadowColor: Colors.darkBrown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
    borderWidth: 1, borderColor: Colors.lightGray,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 10 },
  iconBadge: {
    width: 42, height: 42, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  headerText: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.dark, marginBottom: 4, letterSpacing: -0.2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  categoryLabel: { color: Colors.white, fontSize: 11, fontWeight: '600' },
  distanceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.lightGray, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  distanceText: { color: Colors.warmGray, fontSize: 11, fontWeight: '600' },
  heartBtn: { padding: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  address: { color: Colors.warmGray, fontSize: 12, flex: 1 },
  description: { color: Colors.brown, fontSize: 12, lineHeight: 17, fontStyle: 'italic', marginBottom: 4 },
  footer: {
    flexDirection: 'row', gap: 16, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: Colors.lightGray, marginTop: 6,
  },
  footerBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerBtnText: { fontSize: 12, color: Colors.darkBrown, fontWeight: '600' },
});
