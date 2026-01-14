import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DeezerService from '../services/DeezerService';
import DeezerNormalService from '../services/DeezerNormalService';
import DefaultAlbumArt from '../components/DefaultAlbumArt';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [trendingArtists, setTrendingArtists] = useState([]);
  const [trendingAlbums, setTrendingAlbums] = useState([]);
  const [popularTracks, setPopularTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDeezerContent();
  }, []);

  const loadDeezerContent = async () => {
    try {
      setLoading(true);
      
      // Load content from different APIs
      // Artists and Albums from Normal Deezer API
      // Tracks from RapidAPI (for playback)
      const [artists, albums, tracks] = await Promise.all([
        DeezerNormalService.getPopularArtists(8).catch(() => []),
        DeezerNormalService.getPopularAlbums(8).catch(() => []),
        DeezerService.getPopularTracks(10).catch(() => [])
      ]);

      // Convert data to our app format
      const formattedArtists = artists.map(DeezerNormalService.convertDeezerArtist);
      const formattedAlbums = albums.map(DeezerNormalService.convertDeezerAlbum);
      const formattedTracks = tracks.map(DeezerService.convertDeezerTrack);
      
      setTrendingArtists(formattedArtists);
      setTrendingAlbums(formattedAlbums);
      setPopularTracks(formattedTracks);
      
    } catch (error) {
      console.error('Error loading Deezer content:', error);
      // Set empty arrays on error to prevent crashes
      setTrendingArtists([]);
      setTrendingAlbums([]);
      setPopularTracks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDeezerContent();
  };

  const renderTrackItem = (track, index) => (
    <TouchableOpacity
      key={track.idTrack}
      style={styles.trackItem}
      onPress={() => navigation.navigate('Player', { track })}
    >
      <View style={styles.trackNumber}>
        <Text style={styles.trackNumberText}>{index + 1}</Text>
      </View>
      <Image
        source={
          track.strAlbumThumb
            ? { uri: track.strAlbumThumb }
            : null
        }
        style={styles.trackImage}
      />
      {!track.strAlbumThumb && (
        <View style={[styles.trackImage, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="musical-note" size={20} color="#B3B3B3" />
        </View>
      )}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {track.strTrack}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {track.strArtist}
        </Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play-circle" size={32} color="#1DB954" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderArtistItem = (artist) => (
    <TouchableOpacity
      key={artist.idArtist}
      style={styles.artistCard}
      onPress={() => navigation.navigate('ArtistDetail', { artistId: artist.idArtist })}
    >
      <View style={styles.artistImageContainer}>
        <Image
          source={
            artist.strArtistThumb
              ? { uri: artist.strArtistThumb }
              : null
          }
          style={styles.artistImage}
        />
        {!artist.strArtistThumb && (
          <View style={[styles.artistImage, { justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="person" size={30} color="#B3B3B3" />
          </View>
        )}
      </View>
      <Text style={styles.artistName} numberOfLines={2}>
        {artist.strArtist}
      </Text>
    </TouchableOpacity>
  );

  const renderAlbumItem = (album) => (
    <TouchableOpacity
      key={album.idAlbum}
      style={styles.albumCard}
      onPress={() => navigation.navigate('AlbumDetail', { albumId: album.idAlbum })}
    >
      <View style={styles.albumImageContainer}>
        <Image
          source={
            album.strAlbumThumb
              ? { uri: album.strAlbumThumb }
              : null
          }
          style={styles.albumImage}
        />
        {!album.strAlbumThumb && (
          <View style={[styles.albumImage, { justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="album" size={30} color="#B3B3B3" />
          </View>
        )}
      </View>
      <Text style={styles.albumTitle} numberOfLines={2}>
        {album.strAlbum}
      </Text>
      <Text style={styles.albumArtist} numberOfLines={1}>
        {album.strArtist}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Loading music...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1DB954']} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>NVNV Music</Text>
          <Text style={styles.headerSubtitle}>Powered by Deezer</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Tracks</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tracksContainer}>
          {popularTracks.slice(0, 5).map((track, index) => renderTrackItem(track, index))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Artists</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.horizontalList}>
            {trendingArtists.map(renderArtistItem)}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Albums</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.horizontalList}>
            {trendingAlbums.map(renderAlbumItem)}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={24} color="#1DB954" />
          <View style={styles.quickActionContent}>
            <Text style={styles.quickActionText}>Search for Music</Text>
            <Text style={styles.quickActionSubtext}>Explore millions of songs</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#B3B3B3" />
        </TouchableOpacity>
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTop: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#1DB954',
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAllText: {
    fontSize: 14,
    color: '#1DB954',
    fontWeight: '500',
  },
  tracksContainer: {
    paddingHorizontal: 20,
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
  },
  trackNumberText: {
    fontSize: 16,
    color: '#B3B3B3',
    fontWeight: '500',
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#282828',
    marginHorizontal: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  playButton: {
    paddingHorizontal: 10,
  },
  horizontalList: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  artistCard: {
    width: 120,
    alignItems: 'center',
    marginRight: 15,
  },
  artistImageContainer: {
    marginBottom: 8,
  },
  artistImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#282828',
  },
  artistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  albumCard: {
    width: 140,
    marginRight: 15,
  },
  albumImageContainer: {
    marginBottom: 8,
  },
  albumImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#282828',
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 12,
    color: '#B3B3B3',
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  quickActionContent: {
    flex: 1,
    marginLeft: 15,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  quickActionSubtext: {
    fontSize: 14,
    color: '#B3B3B3',
  },
});

export default HomeScreen;
