import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DeezerService from '../services/DeezerService';
import DeezerNormalService from '../services/DeezerNormalService';
import StorageService from '../services/StorageService';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    artists: [],
    albums: [],
    tracks: [],
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults({ artists: [], albums: [], tracks: [] });
    }
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const [artists, albums, tracks] = await Promise.all([
        DeezerNormalService.searchArtists(searchQuery),
        DeezerNormalService.searchAlbums(searchQuery),
        DeezerService.searchTracks(searchQuery),
      ]);

      setSearchResults({
        artists: artists.map(DeezerNormalService.convertDeezerArtist) || [],
        albums: albums.map(DeezerNormalService.convertDeezerAlbum) || [],
        tracks: tracks.map(DeezerService.convertDeezerTrack) || [],
      });
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderArtistItem = (artist) => (
    <TouchableOpacity
      key={artist.idArtist}
      style={styles.searchItem}
      onPress={() => navigation.navigate('ArtistDetail', { artistId: artist.idArtist })}
    >
      <Image
        source={
          artist.strArtistThumb
            ? { uri: artist.strArtistThumb }
            : null
        }
        style={styles.searchItemImage}
      />
      {!artist.strArtistThumb && (
        <View style={[styles.searchItemImage, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="person" size={24} color="#B3B3B3" />
        </View>
      )}
      <View style={styles.searchItemInfo}>
        <Text style={styles.searchItemTitle}>{artist.strArtist}</Text>
        <Text style={styles.searchItemSubtitle}>Artist</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#B3B3B3" />
    </TouchableOpacity>
  );

  const renderAlbumItem = (album) => (
    <TouchableOpacity
      key={album.idAlbum}
      style={styles.searchItem}
      onPress={() => navigation.navigate('AlbumDetail', { albumId: album.idAlbum })}
    >
      <Image
        source={
          album.strAlbumThumb
            ? { uri: album.strAlbumThumb }
            : null
        }
        style={styles.searchItemImage}
      />
      {!album.strAlbumThumb && (
        <View style={[styles.searchItemImage, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="album" size={24} color="#B3B3B3" />
        </View>
      )}
      <View style={styles.searchItemInfo}>
        <Text style={styles.searchItemTitle}>{album.strAlbum}</Text>
        <Text style={styles.searchItemSubtitle}>{album.strArtist}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#B3B3B3" />
    </TouchableOpacity>
  );

  const renderTrackItem = (track) => (
    <TouchableOpacity
      key={track.idTrack}
      style={styles.searchItem}
      onPress={() => {
        // Navigate to player with track
        navigation.navigate('Player', { track });
      }}
    >
      <View style={[styles.searchItemImage, styles.trackPlaceholder]}>
        <Ionicons name="musical-note" size={24} color="#B3B3B3" />
      </View>
      <View style={styles.searchItemInfo}>
        <Text style={styles.searchItemTitle}>{track.strTrack}</Text>
        <Text style={styles.searchItemSubtitle}>{track.strArtist}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#B3B3B3" />
    </TouchableOpacity>
  );

  const getFilteredResults = () => {
    if (activeTab === 'all') {
      return [
        ...searchResults.artists.map(item => ({ ...item, type: 'artist' })),
        ...searchResults.albums.map(item => ({ ...item, type: 'album' })),
        ...searchResults.tracks.map(item => ({ ...item, type: 'track' })),
      ];
    }
    if (activeTab === 'artists') return searchResults.artists;
    if (activeTab === 'albums') return searchResults.albums;
    if (activeTab === 'tracks') return searchResults.tracks;
    return [];
  };

  const renderFilteredItem = (item, index) => {
    if (item.type === 'artist') return renderArtistItem(item);
    if (item.type === 'album') return renderAlbumItem(item);
    if (item.type === 'track') return renderTrackItem(item);
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#B3B3B3" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for artists, albums, or tracks..."
            placeholderTextColor="#B3B3B3"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#B3B3B3" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchQuery.length > 2 && (
        <View style={styles.tabContainer}>
          {['all', 'artists', 'albums', 'tracks'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      ) : searchQuery.length > 2 ? (
        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {getFilteredResults().length > 0 ? (
            getFilteredResults().map((item, index) => renderFilteredItem(item, index))
          ) : (
            <View style={styles.noResults}>
              <Ionicons name="search" size={48} color="#B3B3B3" />
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubtext}>Try a different search term</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.placeholderContainer}>
          <Ionicons name="search" size={64} color="#B3B3B3" />
          <Text style={styles.placeholderText}>Search for your favorite music</Text>
          <Text style={styles.placeholderSubtext}>Find artists, albums, and tracks</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  searchHeader: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#282828',
  },
  activeTab: {
    backgroundColor: '#1DB954',
  },
  tabText: {
    color: '#B3B3B3',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  searchItemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#282828',
  },
  trackPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchItemInfo: {
    flex: 1,
  },
  searchItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  searchItemSubtitle: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 15,
    marginBottom: 5,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#B3B3B3',
    textAlign: 'center',
  },
});

export default SearchScreen;
