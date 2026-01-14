import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import StorageService from '../services/StorageService';
import DeezerService from '../services/DeezerService';

const { width } = Dimensions.get('window');

const PlayerScreen = ({ route, navigation }) => {
  const { track } = route.params;
  
  // Validate track exists
  if (!track || !track.strTrack) {
    Alert.alert('Error', 'No track data available');
    navigation.goBack();
    return null;
  }
  
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState('loading');
  const [appleMusicTrackId, setAppleMusicTrackId] = useState(null);
  const intervalRef = useRef();

  useEffect(() => {
    loadAudio();
    checkFavoriteStatus();
    return () => {
      // Clean up previous sound when switching tracks
      if (sound) {
        console.log('Unloading previous sound');
        sound.unloadAsync();
        setSound(null);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
    };
  }, [track]);

  const loadAudio = async () => {
    try {
      setPlaybackStatus('loading');
      console.log('Loading track:', track.strTrack);
      
      // Stop and unload previous sound if exists
      if (sound) {
        console.log('Stopping previous sound');
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      
      // Get streaming URL from Deezer
      let trackId = track.deezerId || track.idTrack || track.id;
      
      if (!trackId) {
        // Search for the track in Deezer
        const searchQuery = `${track.strTrack} ${track.strArtist}`;
        const results = await DeezerService.searchTracks(searchQuery, 1);
        
        if (results.length > 0) {
          const deezerTrack = results[0];
          trackId = deezerTrack.id;
          console.log('Found track in Deezer:', deezerTrack);
        } else {
          setPlaybackStatus('not_found');
          Alert.alert(
            'Track Not Available',
            'This track is not available for playback.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      // Get streaming URL (30-second preview)
      const streamUrl = track.previewUrl || await DeezerService.getTrackStreamingUrl(trackId);
      
      if (streamUrl) {
        console.log('Playing Deezer audio:', streamUrl);
        
        try {
          // Load audio with expo-av
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: streamUrl },
            { 
              shouldPlay: false,
              volume: 1.0,
              isLooping: false
            }
          );
          
          setSound(newSound);
          setPlaybackStatus('ready');
          
          // Get duration and status
          const status = await newSound.getStatusAsync();
          setDuration(status.durationMillis || 0);
          
          console.log('Audio loaded successfully, duration:', status.durationMillis);
          
          // Try to set audio session for mobile
          try {
            await Audio.setAudioModeAsync({
              allowsRecordingIOS: false,
              staysActiveInBackground: true,
              playsInSilentModeIOS: true,
              shouldDuckAndroid: true,
              playThroughEarpieceAndroid: false
            });
            console.log('Audio mode set successfully');
          } catch (audioError) {
            console.log('Audio mode setting failed:', audioError);
          }
          
        } catch (soundError) {
          console.error('Error creating sound:', soundError);
          setPlaybackStatus('error');
          Alert.alert('Audio Error', 'Failed to load audio. Please try again.');
        }
      } else {
        setPlaybackStatus('no_preview');
        Alert.alert(
          'No Audio Available',
          'This track doesn\'t have audio available for playback.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      setPlaybackStatus('error');
      Alert.alert(
        'Playback Error',
        'Failed to load audio. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const checkFavoriteStatus = async () => {
    const trackId = track.idTrack || track.id || `track_${Date.now()}`;
    const favorite = await StorageService.isFavorite(trackId);
    setIsFavorite(favorite);
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying || false);
    }
  };

  const togglePlayPause = async () => {
    if (playbackStatus === 'not_found') {
      Alert.alert('Track Not Found', 'This track is not available in Jamendo.');
      return;
    }
    
    if (playbackStatus === 'error') {
      Alert.alert('Error', 'Failed to load track from Jamendo.');
      return;
    }
    
    if (playbackStatus === 'ready' && sound) {
      try {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
          startProgressUpdate();
        }
      } catch (error) {
        console.error('Error toggling playback:', error);
        Alert.alert('Error', 'Failed to control playback.');
      }
    }
  };

  const startProgressUpdate = () => {
    intervalRef.current = setInterval(async () => {
      try {
        if (sound) {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            setPosition(status.positionMillis || 0);
            setIsPlaying(status.isPlaying || false);
          }
        }
      } catch (error) {
        console.error('Error getting playback status:', error);
      }
    }, 1000);
  };

  const toggleFavorite = async () => {
    try {
      const trackId = track.idTrack || track.id || `track_${Date.now()}`;
      const trackData = {
        id: trackId,
        strTrack: track.strTrack,
        strArtist: track.strArtist,
        strAlbum: track.strAlbum,
        type: 'track',
      };

      if (isFavorite) {
        await StorageService.removeFromFavorites(trackId);
        setIsFavorite(false);
        Alert.alert('Removed', 'Track removed from favorites');
      } else {
        await StorageService.addToFavorites(trackData);
        setIsFavorite(true);
        Alert.alert('Added', 'Track added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const shareTrack = async () => {
    try {
      await Share.share({
        message: `Check out "${track.strTrack}" by ${track.strArtist}`,
        title: track.strTrack,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderPlayButton = () => {
    if (playbackStatus === 'loading') {
      return (
        <View style={styles.playButton}>
          <Ionicons name="ellipsis-horizontal" size={32} color="#fff" />
        </View>
      );
    }

    if (playbackStatus === 'error' || playbackStatus === 'no_preview') {
      return (
        <TouchableOpacity style={styles.playButton} onPress={loadAudio}>
          <Ionicons name="refresh" size={32} color="#fff" />
        </TouchableOpacity>
      );
    }

    if (playbackStatus === 'not_found') {
      return (
        <View style={styles.playButton}>
          <Ionicons name="musical-notes" size={32} color="#B3B3B3" />
        </View>
      );
    }

    return (
      <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
        <Ionicons 
          name={isPlaying ? "pause" : "play"} 
          size={32} 
          color="#fff" 
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity onPress={shareTrack}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.albumArtContainer}>
        <Image
          source={
            track.strAlbumThumb
              ? { uri: track.strAlbumThumb }
              : null
          }
          style={styles.albumArt}
        />
        {!track.strAlbumThumb && (
          <View style={[styles.albumArt, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="musical-note" size={80} color="#B3B3B3" />
          </View>
        )}
      </View>

      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{track.strTrack}</Text>
        <Text style={styles.artistName}>{track.strArtist}</Text>
        {track.strAlbum && (
          <Text style={styles.albumName}>{track.strAlbum}</Text>
        )}
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${duration > 0 ? (position / duration) * 100 : 0}%` }
            ]} 
          />
        </View>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="shuffle-outline" size={24} color="#B3B3B3" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="play-skip-back-outline" size={32} color="#fff" />
        </TouchableOpacity>

        {renderPlayButton()}

        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="play-skip-forward-outline" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleFavorite}>
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#1DB954" : "#B3B3B3"} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="list-outline" size={24} color="#B3B3B3" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="repeat-outline" size={24} color="#B3B3B3" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton}>
          <Ionicons name="volume-high-outline" size={24} color="#B3B3B3" />
        </TouchableOpacity>
      </View>

      {playbackStatus === 'error' && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            Demo Mode: Audio playback requires integration with a streaming service
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  albumArtContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  albumArt: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 18,
    color: '#B3B3B3',
    textAlign: 'center',
    marginBottom: 4,
  },
  albumName: {
    fontSize: 16,
    color: '#B3B3B3',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  timeText: {
    fontSize: 12,
    color: '#B3B3B3',
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#404040',
    borderRadius: 2,
    marginHorizontal: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  controlButton: {
    padding: 10,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  bottomButton: {
    padding: 10,
  },
  errorBanner: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PlayerScreen;
