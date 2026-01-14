import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  // Keys for AsyncStorage
  static KEYS = {
    FAVORITES: '@music_app_favorites',
    PLAYLISTS: '@music_app_playlists',
  };

  // Favorites management
  static async getFavorites() {
    try {
      const favorites = await AsyncStorage.getItem(this.KEYS.FAVORITES);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  static async addToFavorites(item) {
    try {
      const favorites = await this.getFavorites();
      const exists = favorites.some(fav => fav.id === item.id);
      if (!exists) {
        favorites.push(item);
        await AsyncStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  }

  static async removeFromFavorites(itemId) {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter(fav => fav.id !== itemId);
      await AsyncStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  static async isFavorite(itemId) {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.id === itemId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  // Playlist management
  static async getPlaylists() {
    try {
      const playlists = await AsyncStorage.getItem(this.KEYS.PLAYLISTS);
      return playlists ? JSON.parse(playlists) : [];
    } catch (error) {
      console.error('Error getting playlists:', error);
      return [];
    }
  }

  static async createPlaylist(name) {
    try {
      const playlists = await this.getPlaylists();
      const newPlaylist = {
        id: Date.now().toString(),
        name,
        tracks: [],
        createdAt: new Date().toISOString(),
      };
      playlists.push(newPlaylist);
      await AsyncStorage.setItem(this.KEYS.PLAYLISTS, JSON.stringify(playlists));
      return newPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      return null;
    }
  }

  static async addToPlaylist(playlistId, track) {
    try {
      const playlists = await this.getPlaylists();
      const playlistIndex = playlists.findIndex(p => p.id === playlistId);
      if (playlistIndex !== -1) {
        const exists = playlists[playlistIndex].tracks.some(t => t.id === track.id);
        if (!exists) {
          playlists[playlistIndex].tracks.push(track);
          await AsyncStorage.setItem(this.KEYS.PLAYLISTS, JSON.stringify(playlists));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error adding to playlist:', error);
      return false;
    }
  }

  static async removeFromPlaylist(playlistId, trackId) {
    try {
      const playlists = await this.getPlaylists();
      const playlistIndex = playlists.findIndex(p => p.id === playlistId);
      if (playlistIndex !== -1) {
        playlists[playlistIndex].tracks = playlists[playlistIndex].tracks.filter(t => t.id !== trackId);
        await AsyncStorage.setItem(this.KEYS.PLAYLISTS, JSON.stringify(playlists));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from playlist:', error);
      return false;
    }
  }

  static async deletePlaylist(playlistId) {
    try {
      const playlists = await this.getPlaylists();
      const filtered = playlists.filter(p => p.id !== playlistId);
      await AsyncStorage.setItem(this.KEYS.PLAYLISTS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      return false;
    }
  }

  static async updatePlaylistName(playlistId, newName) {
    try {
      const playlists = await this.getPlaylists();
      const playlistIndex = playlists.findIndex(p => p.id === playlistId);
      if (playlistIndex !== -1) {
        playlists[playlistIndex].name = newName;
        await AsyncStorage.setItem(this.KEYS.PLAYLISTS, JSON.stringify(playlists));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating playlist name:', error);
      return false;
    }
  }
}

export default StorageService;
