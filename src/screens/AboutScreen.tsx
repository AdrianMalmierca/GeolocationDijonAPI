/**
 * AboutScreen.tsx
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, API } from '../constants';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  const links = [
    {
      label: 'Open Data Dijon Métropole',
      url: 'https://data.metropole-dijon.fr',
      icon: 'server-outline' as const,
    },
    {
      label: 'Office de Tourisme de Dijon',
      url: 'https://www.destinationdijon.com',
      icon: 'globe-outline' as const,
    },
    {
      label: 'Bureau Interprofessionnel des Vins de Bourgogne',
      url: 'https://www.bourgogne-wines.com',
      icon: 'wine-outline' as const,
    },
    {
      label: 'Routes des Vins de Bourgogne',
      url: 'https://www.burgundy-tourism.com',
      icon: 'map-outline' as const,
    },
  ];

  const datasets = [
    { name: 'Commerces de Dijon', id: API.DATASETS.COMMERCES },
    { name: 'Équipements publics', id: API.DATASETS.EQUIPEMENTS_PUBLICS },
    { name: 'Équipements administratifs', id: API.DATASETS.EQUIPEMENTS_ADMIN },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Ionicons name="wine" size={48} color={Colors.gold} style={styles.logo} />
        <Text style={styles.title}>Dijon Vin & Terroir</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.body}>
            Application de découverte des caves à vins, des commerces et des routes viticoles 
            de la Bourgogne. Les données sont issues en temps réel du portail Open Data de 
            Dijon Métropole et complétées par des informations touristiques locales.
          </Text>
        </View>

        {/* Données utilisées */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données utilisées</Text>
          <Text style={styles.body}>
            Cette application utilise l'API publique d'OpenDataSoft de Dijon Métropole. 
            Les données sont librement accessibles sous licence ouverte.
          </Text>
          {datasets.map(ds => (
            <View key={ds.id} style={styles.datasetRow}>
              <Ionicons name="document-text-outline" size={16} color={Colors.gold} />
              <View>
                <Text style={styles.datasetName}>{ds.name}</Text>
                <Text style={styles.datasetId}>{ds.id}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Liens utiles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liens utiles</Text>
          {links.map(link => (
            <TouchableOpacity
              key={link.url}
              style={styles.linkRow}
              onPress={() => Linking.openURL(link.url)}
            >
              <Ionicons name={link.icon} size={20} color={Colors.burgundy} />
              <Text style={styles.linkLabel} numberOfLines={2}>{link.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.warmGray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Appellation legend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Légende</Text>
          {[
            { color: Colors.burgundy, icon: 'wine', label: 'Cave à vins' },
            { color: Colors.gold, icon: 'restaurant', label: 'Restaurant / Gastronomie' },
            { color: Colors.brown, icon: 'storefront', label: 'Commerce local' },
            { color: Colors.warmGray, icon: 'business', label: 'Équipement public' },
          ].map(item => (
            <View key={item.label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={14} color={Colors.white} />
              </View>
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Données © Dijon Métropole — Licence Ouverte v2.0{'\n'}
          Développé avec React Native + Expo
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: {
    backgroundColor: Colors.dark,
    alignItems: 'center',
    paddingVertical: 24,
  },
  logo: { marginBottom: 8 },
  title: {
    color: Colors.cream,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  version: {
    color: Colors.warmGray,
    fontSize: 12,
    marginTop: 4,
  },
  scroll: { flex: 1 },
  section: {
    backgroundColor: Colors.white,
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  body: {
    fontSize: 14,
    color: Colors.brown,
    lineHeight: 20,
    marginBottom: 12,
  },
  datasetRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  datasetName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.darkBrown,
  },
  datasetId: {
    fontSize: 11,
    color: Colors.warmGray,
    fontFamily: 'monospace',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  linkLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.darkBrown,
    fontWeight: '500',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  legendDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendLabel: {
    fontSize: 14,
    color: Colors.darkBrown,
  },
  footer: {
    textAlign: 'center',
    color: Colors.warmGray,
    fontSize: 11,
    lineHeight: 18,
    padding: 24,
  },
});
