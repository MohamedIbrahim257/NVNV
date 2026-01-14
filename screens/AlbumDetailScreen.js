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

const AlbumDetailScreen = ({ route, navigation }) => {
  const { albumId } = route.params;
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadAlbumData();
  }, [albumId]);

  const loadAlbumData = async () => {
    try {
      setLoading(true);
      
      // Get album details using normal Deezer API
      const albumData = await DeezerNormalService.getAlbum(albumId);
      console.log('Album details loaded:', albumData);
      
      if (albumData) {
        // Set album info from Deezer API
        const albumInfo = {
          idAlbum: albumData.id.toString(),
          strAlbum: albumData.title,
          strArtist: albumData.artist?.name || 'Unknown Artist',
          strAlbumThumb: albumData.cover_medium || albumData.cover_small,
          intYearReleased: albumData.release_date?.split('-')[0] || '2023',
          strGenre: 'Various',
          nb_tracks: albumData.nb_tracks || 0,
        };
        setAlbum(albumInfo);
        
        // Get album tracks from RapidAPI for full playback
        // Search for tracks from this album using RapidAPI
        const artistName = albumData?.artist?.name || '';
        const searchQuery = `${artistName} ${albumInfo.strAlbum}`;
        const tracksData = await DeezerService.searchTracks(searchQuery, 20);
        const formattedTracks = tracksData.map(DeezerService.convertDeezerTrack);
        setTracks(formattedTracks);
        
        const favorite = await StorageService.isFavorite(albumId);
        setIsFavorite(favorite);
      }
    } catch (error) {
      console.error('Error loading album data:', error);
      Alert.alert('Error', 'Failed to load album information');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlbumData();
    setRefreshing(false);
  };

  const toggleFavorite = async () => {
    if (!album) return;

    try {
      const albumData = {
        id: album.idAlbum,
        strAlbum: album.strAlbum,
        strArtist: album.strArtist,
        strAlbumThumb: album.strAlbumThumb,
        type: 'album',
      };

      if (isFavorite) {
        await StorageService.removeFromFavorites(album.idAlbum);
        setIsFavorite(false);
        Alert.alert('Removed', 'Album removed from favorites');
      } else {
        await StorageService.addToFavorites(albumData);
        setIsFavorite(true);
        Alert.alert('Added', 'Album added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const playTrack = (track) => {
    navigation.navigate('Player', { track });
  };

  const playAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0]);
    }
  };

  const shuffleAll = () => {
    if (tracks.length > 0) {
      const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
      playTrack(randomTrack);
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderTrackItem = (track, index) => (
    <TouchableOpacity
      key={track.idTrack}
      style={styles.trackItem}
      onPress={() => playTrack(track)}
    >
      <View style={styles.trackNumber}>
        <Text style={styles.trackNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{track.strTrack}</Text>
        <View style={styles.trackMeta}>
          <Text style={styles.trackDuration}>
            {formatDuration(track.intDuration)}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play-circle-outline" size={24} color="#B3B3B3" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Loading album...</Text>
      </View>
    );
  }

  if (!album) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="album-outline" size={64} color="#B3B3B3" />
        <Text style={styles.errorText}>Album not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.albumHeader}>
        <Image
          source={
            album.strAlbumThumb
              ? { uri: album.strAlbumThumb }
              : null
          }
          style={styles.albumImage}
        />
        {!album.strAlbumThumb && (
          <View style={[styles.albumImage, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="album" size={40} color="#B3B3B3" />
          </View>
        )}
        <View style={styles.albumInfo}>
          <Text style={styles.albumTitle}>{album.strAlbum}</Text>
          <Text style={styles.artistName}>{album.strArtist}</Text>
          {album.intYearReleased && (
            <Text style={styles.albumYear}>{album.intYearReleased}</Text>
          )}
          <Text style={styles.trackCount}>{tracks.length} tracks</Text>
          <View style={styles.albumActions}>
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

      <View style={styles.playbackControls}>
        <TouchableOpacity style={styles.playControlButton} onPress={playAll}>
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.playControlText}>Play All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playControlButton} onPress={shuffleAll}>
          <Ionicons name="shuffle" size={20} color="#fff" />
          <Text style={styles.playControlText}>Shuffle</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tracksSection}>
        <Text style={styles.sectionTitle}>Tracks</Text>
        {tracks.length > 0 ? (
          tracks.map((track, index) => renderTrackItem(track, index))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="musical-note-outline" size={48} color="#B3B3B3" />
            <Text style={styles.emptyStateText}>No tracks found</Text>
          </View>
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
  albumHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 20,
    backgroundColor: '#282828',
  },
  albumInfo: {
    flex: 1,
  },
  albumTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  artistName: {
    fontSize: 16,
    color: '#B3B3B3',
    marginBottom: 2,
  },
  albumYear: {
    fontSize: 14,
    color: '#B3B3B3',
    marginBottom: 2,
  },
  trackCount: {
    fontSize: 14,
    color: '#B3B3B3',
    marginBottom: 10,
  },
  albumActions: {
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
  playbackControls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  playControlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  playControlText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tracksSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
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
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackDuration: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  playButton: {
    padding: 8,
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

export default AlbumDetailScreen;
