import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Linking, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cave } from '../types';
import { Colors } from '../constants';
import { formatDistance } from '../services/dijonApi';

interface CaveCardProps {
  cave: Cave;
  onPress?: (cave: Cave) => void;
  style?: object;
}

const CATEGORY_CONFIG = {
  cave: { icon: 'wine' as const, label: 'Cave à vins', color: Colors.burgundy },
  commerce: { icon: 'storefront' as const, label: 'Commerce', color: Colors.brown },
  restaurant: { icon: 'restaurant' as const, label: 'Restaurant', color: Colors.gold },
  equipement: { icon: 'business' as const, label: 'Équipement', color: Colors.warmGray },
};

export function CaveCard({ cave, onPress, style }: CaveCardProps) {
  const config = CATEGORY_CONFIG[cave.category] ?? CATEGORY_CONFIG.commerce;

  const openPhone = () => {
    if (cave.phone) Linking.openURL(`tel:${cave.phone}`);
  };

  const openWebsite = () => {
    if (cave.website) Linking.openURL(cave.website);
  };

  const openMaps = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${cave.name}@${cave.latitude},${cave.longitude}`,
      android: `geo:${cave.latitude},${cave.longitude}?q=${cave.name}`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => onPress?.(cave)}
      activeOpacity={0.85}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: config.color + '22' }]}>
          <Ionicons name={config.icon} size={22} color={config.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={2}>{cave.name}</Text>
          <View style={styles.categoryRow}>
            <View style={[styles.categoryBadge, { backgroundColor: config.color }]}>
              <Text style={styles.categoryLabel}>{config.label}</Text>
            </View>
            {cave.distance !== null && cave.distance !== undefined && (
              <View style={styles.distanceBadge}>
                <Ionicons name="navigate" size={11} color={Colors.warmGray} />
                <Text style={styles.distanceText}>{formatDistance(cave.distance)}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Address */}
      {cave.address ? (
        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color={Colors.warmGray} />
          <Text style={styles.address} numberOfLines={2}>{cave.address}</Text>
        </View>
      ) : null}

      {/* Description */}
      {cave.description ? (
        <Text style={styles.description} numberOfLines={2}>{cave.description}</Text>
      ) : null}

      {/* Horaires */}
      {cave.openingHours ? (
        <View style={styles.row}>
          <Ionicons name="time-outline" size={14} color={Colors.warmGray} />
          <Text style={styles.meta}>{cave.openingHours}</Text>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={openMaps}>
          <Ionicons name="navigate" size={16} color={Colors.burgundy} />
          <Text style={styles.actionText}>Itinéraire</Text>
        </TouchableOpacity>
        {cave.phone ? (
          <TouchableOpacity style={styles.actionBtn} onPress={openPhone}>
            <Ionicons name="call-outline" size={16} color={Colors.gold} />
            <Text style={styles.actionText}>Appeler</Text>
          </TouchableOpacity>
        ) : null}
        {cave.website ? (
          <TouchableOpacity style={styles.actionBtn} onPress={openWebsite}>
            <Ionicons name="globe-outline" size={16} color={Colors.brown} />
            <Text style={styles.actionText}>Site web</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Source badge */}
      {cave.source === 'mock' && (
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceText}>Données démo</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: Colors.darkBrown,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryLabel: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.lightGray,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  distanceText: {
    color: Colors.warmGray,
    fontSize: 11,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  address: {
    color: Colors.warmGray,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  description: {
    color: Colors.brown,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  meta: {
    color: Colors.warmGray,
    fontSize: 12,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 13,
    color: Colors.darkBrown,
    fontWeight: '600',
  },
  sourceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.cream,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.goldLight,
  },
  sourceText: {
    fontSize: 9,
    color: Colors.warmGray,
    fontStyle: 'italic',
  },
});
