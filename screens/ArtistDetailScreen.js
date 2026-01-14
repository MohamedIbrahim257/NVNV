import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Share,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DeezerService from '../services/DeezerService';
import DeezerNormalService from '../services/DeezerNormalService';
import StorageService from '../services/StorageService';

const ArtistDetailScreen = ({ route, navigation }) => {
  const { artistId } = route.params;
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('albums');

  useEffect(() => {
    loadArtistData();
  }, [artistId]);

  const loadArtistData = async () => {
    try {
      setLoading(true);
      
      const [artistData, albumsData] = await Promise.all([
        DeezerNormalService.getArtist(artistId),
        DeezerNormalService.getArtistAlbums(artistId),
      ]);

      setArtist(artistData);
      setAlbums(albumsData ? albumsData.map(DeezerNormalService.convertDeezerAlbum) : []);
      
      // Get artist tracks from RapidAPI for full playback
      if (artistData?.name) {
        const tracksData = await DeezerService.searchTracks(artistData.name, 20);
        setTracks(tracksData ? tracksData.map(DeezerService.convertDeezerTrack) : []);
      } else {
        setTracks([]);
      }
      
      if (artistData) {
        const favorite = await StorageService.isFavorite(artistData.id.toString());
        setIsFavorite(favorite);
      }
    } catch (error) {
      console.error('Error loading artist data:', error);
      Alert.alert('Error', 'Failed to load artist information');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadArtistData();
    setRefreshing(false);
  };

  const toggleFavorite = async () => {
    if (!artist) return;

    try {
      const artistData = {
        id: artist.idArtist,
        strArtist: artist.strArtist,
        strArtistThumb: artist.strArtistThumb,
        type: 'artist',
      };

      if (isFavorite) {
        await StorageService.removeFromFavorites(artist.idArtist);
        setIsFavorite(false);
        Alert.alert('Removed', 'Artist removed from favorites');
      } else {
        await StorageService.addToFavorites(artistData);
        setIsFavorite(true);
        Alert.alert('Added', 'Artist added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const navigateToAlbum = (album) => {
    navigation.navigate('AlbumDetail', { albumId: album.idAlbum });
  };

  const navigateToTrack = (track) => {
    navigation.navigate('Player', { track });
  };

  const renderAlbumItem = (album) => (
    <TouchableOpacity
      key={album.idAlbum}
      style={styles.albumItem}
      onPress={() => navigateToAlbum(album)}
    >
      <Image
        source={
          album.strAlbumThumb
            ? { uri: album.strAlbumThumb }
            : require('../assets/default-album.png')
        }
        style={styles.albumImage}
      />
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle}>{album.strAlbum}</Text>
        <Text style={styles.albumYear}>
          {album.intYearReleased || 'Unknown Year'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#B3B3B3" />
    </TouchableOpacity>
  );

  const renderTrackItem = (track) => (
    <TouchableOpacity
      key={track.idTrack}
      style={styles.trackItem}
      onPress={() => navigateToTrack(track)}
    >
      <View style={styles.trackNumber}>
        <Text style={styles.trackNumberText}>{track.intTrackNumber || '?'}</Text>
      </View>
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{track.strTrack}</Text>
        <Text style={styles.trackAlbum}>{track.strAlbum}</Text>
      </View>
      <Ionicons name="play-circle-outline" size={24} color="#B3B3B3" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Loading artist...</Text>
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={64} color="#B3B3B3" />
        <Text style={styles.errorText}>Artist not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.artistHeader}>
        <Image
          source={
            artist.strArtistThumb
              ? { uri: artist.strArtistThumb }
              : null
          }
          style={styles.artistImage}
        />
        {!artist.strArtistThumb && (
          <View style={[styles.artistImage, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="person" size={40} color="#B3B3B3" />
          </View>
        )}
        <View style={styles.artistInfo}>
          <Text style={styles.artistName}>{artist.strArtist}</Text>
          {artist.strGenre && (
            <Text style={styles.artistGenre}>{artist.strGenre}</Text>
          )}
          {artist.strCountry && (
            <Text style={styles.artistCountry}>{artist.strCountry}</Text>
          )}
          <View style={styles.artistActions}>
            <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={20} 
                color={isFavorite ? "#1DB954" : "#fff"} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {artist.strBiographyEN && (
        <View style={styles.biographySection}>
          <Text style={styles.sectionTitle}>Biography</Text>
          <Text style={styles.biographyText} numberOfLines={4}>
            {artist.strBiographyEN}
          </Text>
        </View>
      )}

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'albums' && styles.activeTab]}
          onPress={() => setActiveTab('albums')}
        >
          <Text style={[styles.tabText, activeTab === 'albums' && styles.activeTabText]}>
            Albums ({albums.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tracks' && styles.activeTab]}
          onPress={() => setActiveTab('tracks')}
        >
          <Text style={[styles.tabText, activeTab === 'tracks' && styles.activeTabText]}>
            Tracks ({tracks.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {activeTab === 'albums' ? (
          albums.length > 0 ? (
            albums.map(renderAlbumItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="album-outline" size={48} color="#B3B3B3" />
              <Text style={styles.emptyStateText}>No albums found</Text>
            </View>
          )
        ) : (
          tracks.length > 0 ? (
            tracks.map(renderTrackItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="musical-note-outline" size={48} color="#B3B3B3" />
              <Text style={styles.emptyStateText}>No tracks found</Text>
            </View>
          )
        )}
      </View>
    </ScrollView>
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
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
  artistHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
    backgroundColor: '#282828',
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  artistGenre: {
    fontSize: 16,
    color: '#B3B3B3',
    marginBottom: 2,
  },
  artistCountry: {
    fontSize: 14,
    color: '#B3B3B3',
    marginBottom: 10,
  },
  artistActions: {
    flexDirection: 'row',
  },
  favoriteButton: {
    backgroundColor: '#282828',
    padding: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  shareButton: {
    backgroundColor: '#282828',
    padding: 8,
    borderRadius: 20,
  },
  biographySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  biographyText: {
    fontSize: 14,
    color: '#B3B3B3',
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
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
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  albumImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 15,
    backgroundColor: '#282828',
  },
  albumInfo: {
    flex: 1,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  albumYear: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  trackNumber: {
    width: 30,
    alignItems: 'center',
    marginRight: 15,
  },
  trackNumberText: {
    fontSize: 16,
    color: '#B3B3B3',
    fontWeight: '600',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  trackAlbum: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#B3B3B3',
    fontSize: 16,
    marginTop: 10,
  },
});

export default ArtistDetailScreen;
