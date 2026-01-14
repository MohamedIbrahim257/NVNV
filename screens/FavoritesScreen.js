import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DeezerService from '../services/DeezerService';
import StorageService from '../services/StorageService';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favoritesData = await StorageService.getFavorites();
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const removeFromFavorites = async (item) => {
    Alert.alert(
      'Remove from Favorites',
      `Are you sure you want to remove "${item.strArtist || item.strAlbum || item.strTrack}" from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.removeFromFavorites(item.id);
              setFavorites(favorites.filter(fav => fav.id !== item.id));
            } catch (error) {
              console.error('Error removing from favorites:', error);
              Alert.alert('Error', 'Failed to remove from favorites');
            }
          },
        },
      ]
    );
  };

  const navigateToDetail = (item) => {
    if (item.type === 'artist') {
      navigation.navigate('ArtistDetail', { artistId: item.id });
    } else if (item.type === 'album') {
      navigation.navigate('AlbumDetail', { albumId: item.id });
    } else if (item.type === 'track') {
      navigation.navigate('Player', { track: item });
    }
  };

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriteItem}
      onPress={() => navigateToDetail(item)}
    >
      <Image
        source={
          item.strArtistThumb || item.strAlbumThumb
            ? { uri: item.strArtistThumb || item.strAlbumThumb }
            : null
        }
        style={styles.itemImage}
      />
      {!(item.strArtistThumb || item.strAlbumThumb) && (
        <View style={[styles.itemImage, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons 
            name={item.type === 'artist' ? "person" : "album"} 
            size={24} 
            color="#B3B3B3" 
          />
        </View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>
          {item.strArtist || item.strAlbum || item.strTrack}
        </Text>
        <Text style={styles.itemSubtitle}>
          {item.type === 'artist' ? 'Artist' : 
           item.type === 'album' ? `Album • ${item.strArtist}` : 
           `Track • ${item.strArtist}`}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => removeFromFavorites(item)}
      >
        <Ionicons name="heart" size={20} color="#1DB954" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={64} color="#B3B3B3" />
      <Text style={styles.emptyStateTitle}>No Favorites Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start adding your favorite artists, albums, and tracks
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('Search')}
      >
        <Text style={styles.browseButtonText}>Browse Music</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={favorites.length === 0 ? styles.emptyList : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#282828',
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  favoriteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#B3B3B3',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  browseButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyList: {
    flex: 1,
  },
});

export default FavoritesScreen;
