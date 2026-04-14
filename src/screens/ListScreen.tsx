import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLocation } from '../hooks/useLocation';
import { usePlaces } from '../hooks/usePlaces';
import { CaveCard } from '../components/CaveCard';
import { Colors } from '../constants';
import { Cave } from '../types';

export default function ListScreen() {
  const insets = useSafeAreaInsets(); //to get the safe area insets of the device, to avoid the notch and the home indicator on iOS, and the status bar on Android
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');
  const [activeCategory, setActiveCategory] = useState<Cave['category'] | 'all'>('all');

  const { location } = useLocation();
  const { filteredPlaces, loading, refresh } = usePlaces(location?.latitude, location?.longitude);

  //Search + filter by category + sorted by distance or name
  const displayedPlaces = useMemo(() => { //Memo to calculate when the dependencies change,
  // so we don't calculate the filtering and sorting on every render, but only when the filteredPlaces,
  // searchQuery, sortBy or activeCategory change
    let places = [...filteredPlaces];

    //Category filter
    if (activeCategory !== 'all') {
      places = places.filter(p => p.category === activeCategory);
    }

    //Search by name, address, description or appellations
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      places = places.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    //Sort by distance or name
    if (sortBy === 'distance') {
      places.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    } else {
      places.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    }

    return places;
  }, [filteredPlaces, searchQuery, sortBy, activeCategory]); //to calculate the displayedPlaces only when one of
  // these dependencies change

  const categories: { key: Cave['category'] | 'all'; label: string; icon: any }[] = [
    { key: 'all', label: 'Tous', icon: 'grid' },
    { key: 'cave', label: 'Caves', icon: 'wine' },
    { key: 'restaurant', label: 'Restaurants', icon: 'restaurant' },
    { key: 'commerce', label: 'Commerces', icon: 'storefront' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Caves & Terroir</Text>
        <Text style={styles.headerSubtitle}>{displayedPlaces.length} établissements trouvés</Text>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.warmGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une cave, une appellation..."
            placeholderTextColor={Colors.warmGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.warmGray} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <View style={styles.categoryTabs}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryTab, activeCategory === cat.key && styles.categoryTabActive]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={activeCategory === cat.key ? Colors.white : Colors.warmGray}
              />
              <Text style={[styles.categoryTabText, activeCategory === cat.key && styles.categoryTabTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sort */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Trier par :</Text>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'distance' && styles.sortBtnActive]}
            onPress={() => setSortBy('distance')}
          >
            <Ionicons name="navigate" size={13} color={sortBy === 'distance' ? Colors.white : Colors.warmGray} />
            <Text style={[styles.sortBtnText, sortBy === 'distance' && styles.sortBtnTextActive]}>Distance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'name' && styles.sortBtnActive]}
            onPress={() => setSortBy('name')}
          >
            <Ionicons name="text" size={13} color={sortBy === 'name' ? Colors.white : Colors.warmGray} />
            <Text style={[styles.sortBtnText, sortBy === 'name' && styles.sortBtnTextActive]}>Nom</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={displayedPlaces} //nemos list
        keyExtractor={item => item.id} //key extractor for the list, we use the id of the cave
        renderItem={({ item }) => <CaveCard cave={item} />} //we use the CaveCard component to render each cave
        contentContainerStyle={styles.listContent}
        refreshControl={ //pull to refresh the list
          <RefreshControl
            refreshing={loading}
            onRefresh={() => refresh(location?.latitude, location?.longitude)} //recharge the data with the user's location
            tintColor={Colors.burgundy}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="wine-outline" size={64} color={Colors.lightGray} />
            <Text style={styles.emptyTitle}>Aucun résultat</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? `Aucune cave trouvée pour "${searchQuery}"` : 'Aucun établissement dans cette zone'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: {
    backgroundColor: Colors.dark,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    color: Colors.gold,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 12,
  },
  headerSubtitle: {
    color: Colors.warmGray,
    fontSize: 13,
    marginBottom: 12,
  },
  searchBar: {
    backgroundColor: Colors.darkBrown,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: Colors.cream,
    fontSize: 14,
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.darkBrown,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryTabActive: {
    backgroundColor: Colors.burgundy,
  },
  categoryTabText: {
    color: Colors.warmGray,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: Colors.white,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    color: Colors.warmGray,
    fontSize: 13,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.darkBrown,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sortBtnActive: {
    backgroundColor: Colors.burgundy,
  },
  sortBtnText: {
    color: Colors.warmGray,
    fontSize: 12,
    fontWeight: '600',
  },
  sortBtnTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    color: Colors.darkBrown,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: Colors.warmGray,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
