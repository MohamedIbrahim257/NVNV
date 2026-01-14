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
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DeezerService from '../services/DeezerService';
import StorageService from '../services/StorageService';

const PlaylistDetailScreen = ({ route, navigation }) => {
  const { playlistId } = route.params;
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    loadPlaylist();
  }, [playlistId]);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const playlists = await StorageService.getPlaylists();
      const currentPlaylist = playlists.find(p => p.id === playlistId);
      setPlaylist(currentPlaylist);
      if (currentPlaylist) {
        setNewPlaylistName(currentPlaylist.name);
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
      Alert.alert('Error', 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlaylist();
    setRefreshing(false);
  };

  const removeFromPlaylist = async (trackId) => {
    try {
      await StorageService.removeFromPlaylist(playlistId, trackId);
      const updatedPlaylist = {
        ...playlist,
        tracks: playlist.tracks.filter(track => track.id !== trackId),
      };
      setPlaylist(updatedPlaylist);
      Alert.alert('Success', 'Track removed from playlist');
    } catch (error) {
      console.error('Error removing from playlist:', error);
      Alert.alert('Error', 'Failed to remove track from playlist');
    }
  };

  const updatePlaylistName = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    try {
      await StorageService.updatePlaylistName(playlistId, newPlaylistName.trim());
      setPlaylist({ ...playlist, name: newPlaylistName.trim() });
      setShowEditModal(false);
      Alert.alert('Success', 'Playlist name updated');
    } catch (error) {
      console.error('Error updating playlist name:', error);
      Alert.alert('Error', 'Failed to update playlist name');
    }
  };

  const deletePlaylist = () => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlist.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deletePlaylist(playlistId);
              navigation.goBack();
              Alert.alert('Success', 'Playlist deleted successfully');
            } catch (error) {
              console.error('Error deleting playlist:', error);
              Alert.alert('Error', 'Failed to delete playlist');
            }
          },
        },
      ]
    );
  };

  const playTrack = (track) => {
    navigation.navigate('Player', { track });
  };

  const playAll = () => {
    if (playlist && playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0]);
    }
  };

  const shuffleAll = () => {
    if (playlist && playlist.tracks.length > 0) {
      const randomTrack = playlist.tracks[Math.floor(Math.random() * playlist.tracks.length)];
      playTrack(randomTrack);
    }
  };

  const renderTrackItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => playTrack(item)}
    >
      <View style={styles.trackNumber}>
        <Text style={styles.trackNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{item.strTrack || item.strAlbum || item.strArtist}</Text>
        <Text style={styles.trackArtist}>
          {item.strArtist || (item.type === 'artist' ? 'Artist' : 'Unknown')}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => removeFromPlaylist(item.id)}
      >
        <Ionicons name="remove-circle-outline" size={20} color="#B3B3B3" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="musical-note-outline" size={64} color="#B3B3B3" />
      <Text style={styles.emptyStateTitle}>Empty Playlist</Text>
      <Text style={styles.emptyStateSubtitle}>
        Add tracks to this playlist to get started
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
        <Text style={styles.loadingText}>Loading playlist...</Text>
      </View>
    );
  }

  if (!playlist) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="list-outline" size={64} color="#B3B3B3" />
        <Text style={styles.errorText}>Playlist not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.playlistHeader}>
        <View style={styles.playlistIcon}>
          <Ionicons name="musical-notes" size={48} color="#1DB954" />
        </View>
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName}>{playlist.name}</Text>
          <Text style={styles.playlistDetails}>
            {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
          </Text>
          <Text style={styles.playlistDate}>
            Created {new Date(playlist.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowEditModal(true)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={deletePlaylist}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {playlist.tracks.length > 0 && (
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
      )}

      <FlatList
        data={playlist.tracks}
        renderItem={renderTrackItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={playlist.tracks.length === 0 ? styles.emptyList : null}
        style={styles.tracksList}
      />

      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Playlist</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.playlistNameInput}
              placeholder="Playlist name"
              placeholderTextColor="#B3B3B3"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
              maxLength={50}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setNewPlaylistName(playlist.name);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={updatePlaylistName}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  playlistHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playlistIcon: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  playlistDetails: {
    fontSize: 16,
    color: '#B3B3B3',
    marginBottom: 2,
  },
  playlistDate: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: '#282828',
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
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
  tracksList: {
    flex: 1,
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
  trackArtist: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  moreButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#282828',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  playlistNameInput: {
    backgroundColor: '#121212',
    color: '#fff',
    fontSize: 16,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#404040',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#1DB954',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlaylistDetailScreen;
