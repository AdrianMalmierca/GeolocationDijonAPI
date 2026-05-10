import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useRoutePlanner } from '../hooks/useRoutePlanner';
import { usePlaces } from '../hooks/usePlaces';
import { Colors } from '../constants';
import { Cave } from '../types';
import { RootStackParamList } from '../../App';

type NavProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

const CATEGORY_CONFIG = {
  cave:       { icon: 'wine'       as const, color: Colors.burgundy },
  commerce:   { icon: 'storefront' as const, color: Colors.brown    },
  restaurant: { icon: 'restaurant' as const, color: Colors.gold     },
  equipement: { icon: 'business'   as const, color: Colors.warmGray },
};

export default function PlannerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { stops, addStop, removeStop, moveStop, clearRoute, hasStop } = useRoutePlanner();
  const { filteredPlaces } = usePlaces();

  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  //Filter places for the picker, exclude already added stops
  const availablePlaces = useMemo(() => { //useMemo is used to optimize performance by memoizing the filtered list of places, so it only recalculates when the filteredPlaces, searchQuery, or hasStop function changes.
    const q = searchQuery.toLowerCase().trim();
    return filteredPlaces.filter(p => {
      if (hasStop(p.id)) return false; //if its already in the route, we dont want to show it in the picker
      if (!q) return true; // if no search query, show all non-added places
      return (
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
      );
    });
  }, [filteredPlaces, searchQuery, hasStop]);

  const totalDistance = useMemo(() => {
    if (stops.length < 2) return null;
    let total = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i]; //current stop
      const b = stops[i + 1]; //next stop
      const R = 6371;
      const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
      const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
      const x = //Haversine formule
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((a.latitude * Math.PI) / 180) *
        Math.cos((b.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      total += R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)); //distance between stop a and b in km
    }
    return total < 1 ? `${(total * 1000).toFixed(0)} m` : `${total.toFixed(1)} km`;
  }, [stops]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Mon Itinéraire</Text>
          {stops.length > 0 && (
            <TouchableOpacity onPress={clearRoute} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={18} color={Colors.warmGray} />
              <Text style={styles.clearText}>Effacer</Text>
            </TouchableOpacity>
          )}
        </View>
        {stops.length > 0 && (
          <Text style={styles.headerSubtitle}>
            {stops.length} étape{stops.length > 1 ? 's' : ''}
            {totalDistance ? ` · ${totalDistance} (vol d'oiseau)` : ''}
          </Text>
        )}
      </View>

      {/* Empty state */}
      {stops.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="map-outline" size={72} color={Colors.lightGray} />
          <Text style={styles.emptyTitle}>Aucune étape</Text>
          <Text style={styles.emptySubtitle}>
            Ajoutez des caves et restaurants pour créer votre itinéraire personnalisé en Bourgogne.
          </Text>
          <TouchableOpacity
            style={styles.addFirstBtn}
            onPress={() => setShowPicker(true)}
          >
            <Ionicons name="add-circle" size={20} color={Colors.white} />
            <Text style={styles.addFirstBtnText}>Ajouter une étape</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Stops list */}
          <FlatList
            data={stops}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const config = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.commerce;
              return (
                <View style={styles.stopCard}>
                  {/* Step number + connector */}
                  <View style={styles.stepIndicator}>
                    <View style={[styles.stepDot, {
                      backgroundColor: index === 0
                        ? Colors.success
                        : index === stops.length - 1
                        ? Colors.error
                        : config.color
                    }]}>
                      <Text style={styles.stepNum}>{index + 1}</Text>
                    </View>
                    {index < stops.length - 1 && (
                      <View style={styles.stepLine} />
                    )}
                  </View>

                  {/* Stop info */}
                  <View style={styles.stopInfo}>
                    <View style={styles.stopHeader}>
                      <Ionicons name={config.icon} size={16} color={config.color} />
                      <Text style={styles.stopName} numberOfLines={1}>{item.name}</Text>
                    </View>
                    {item.address ? (
                      <Text style={styles.stopAddress} numberOfLines={1}>{item.address}</Text>
                    ) : null}
                  </View>

                  {/* Move + remove */}
                  <View style={styles.stopActions}>
                    {index > 0 && (
                      <TouchableOpacity
                        style={styles.moveBtn}
                        onPress={() => moveStop(index, index - 1)}
                      >
                        <Ionicons name="chevron-up" size={18} color={Colors.warmGray} />
                      </TouchableOpacity>
                    )}
                    {index < stops.length - 1 && (
                      <TouchableOpacity
                        style={styles.moveBtn}
                        onPress={() => moveStop(index, index + 1)}
                      >
                        <Ionicons name="chevron-down" size={18} color={Colors.warmGray} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeStop(item.id)}
                    >
                      <Ionicons name="close" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />

          {/* Bottom actions */}
          <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              style={styles.addMoreBtn}
              onPress={() => setShowPicker(true)}
            >
              <Ionicons name="add" size={18} color={Colors.burgundy} />
              <Text style={styles.addMoreText}>Ajouter une étape</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewRouteBtn, stops.length < 2 && styles.viewRouteBtnDisabled]}
              onPress={() => stops.length >= 2 && navigation.navigate('RouteMap', { stops })}
              disabled={stops.length < 2}
            >
              <Ionicons name="map" size={18} color={Colors.white} />
              <Text style={styles.viewRouteBtnText}>Voir l'itinéraire</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Picker Modal */}
      <Modal
        visible={showPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={[styles.modal, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter une étape</Text>
            <TouchableOpacity onPress={() => { setShowPicker(false); setSearchQuery(''); }}>
              <Ionicons name="close" size={24} color={Colors.dark} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.modalSearch}>
            <Ionicons name="search" size={18} color={Colors.warmGray} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Rechercher..."
              placeholderTextColor={Colors.warmGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          <FlatList
            data={availablePlaces}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const config = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.commerce;
              return (
                <TouchableOpacity
                  style={styles.pickerRow}
                  onPress={() => {
                    addStop(item);
                    setShowPicker(false);
                    setSearchQuery('');
                  }}
                >
                  <View style={[styles.pickerIcon, { backgroundColor: config.color + '22' }]}>
                    <Ionicons name={config.icon} size={20} color={config.color} />
                  </View>
                  <View style={styles.pickerInfo}>
                    <Text style={styles.pickerName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.pickerAddress} numberOfLines={1}>{item.address}</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color={Colors.burgundy} />
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.pickerEmpty}>
                <Text style={styles.pickerEmptyText}>
                  {searchQuery ? 'Aucun résultat' : 'Toutes les caves sont déjà ajoutées'}
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },

  // Header
  header: {
    backgroundColor: Colors.dark,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  headerTitle: {
    color: Colors.gold, fontSize: 24, fontWeight: '800', letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: Colors.warmGray, fontSize: 13, marginTop: 4,
  },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.darkBrown, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  clearText: { color: Colors.warmGray, fontSize: 13, fontWeight: '600' },

  // Empty state
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 12,
  },
  emptyTitle: { color: Colors.darkBrown, fontSize: 20, fontWeight: '700' },
  emptySubtitle: {
    color: Colors.warmGray, fontSize: 14, textAlign: 'center', lineHeight: 21,
  },
  addFirstBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.burgundy, borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 14, marginTop: 8,
  },
  addFirstBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },

  // Stops list
  listContent: { paddingVertical: 12, paddingHorizontal: 16 },
  stopCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginBottom: 0, gap: 12,
  },
  stepIndicator: { alignItems: 'center', width: 32 },
  stepDot: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  stepNum: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  stepLine: {
    width: 2, flex: 1, minHeight: 20,
    backgroundColor: Colors.lightGray, marginVertical: 2,
  },
  stopInfo: {
    flex: 1, backgroundColor: Colors.white,
    borderRadius: 12, padding: 12, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  stopHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 },
  stopName: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.dark },
  stopAddress: { fontSize: 12, color: Colors.warmGray, marginLeft: 23 },
  stopActions: { gap: 2, paddingTop: 4 },
  moveBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center', alignItems: 'center',
  },
  removeBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Colors.error + '18',
    justifyContent: 'center', alignItems: 'center',
    marginTop: 4,
  },

  // Bottom actions
  bottomActions: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.lightGray,
    backgroundColor: Colors.white,
  },
  addMoreBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    borderWidth: 2, borderColor: Colors.burgundy,
    borderRadius: 14, paddingVertical: 13,
  },
  addMoreText: { color: Colors.burgundy, fontSize: 14, fontWeight: '700' },
  viewRouteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    backgroundColor: Colors.burgundy, borderRadius: 14, paddingVertical: 13,
  },
  viewRouteBtnDisabled: { backgroundColor: Colors.warmGray },
  viewRouteBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },

  // Modal
  modal: { flex: 1, backgroundColor: Colors.white },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.lightGray,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  modalSearch: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 16, backgroundColor: Colors.cream,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
  },
  modalSearchInput: { flex: 1, fontSize: 14, color: Colors.dark },
  pickerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.lightGray,
  },
  pickerIcon: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  pickerInfo: { flex: 1 },
  pickerName: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 2 },
  pickerAddress: { fontSize: 12, color: Colors.warmGray },
  pickerEmpty: { padding: 32, alignItems: 'center' },
  pickerEmptyText: { color: Colors.warmGray, fontSize: 14 },
});