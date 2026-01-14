// Deezer Normal API Service
// Uses official Deezer API for albums and artists
const DEEZER_API_BASE = 'https://api.deezer.com';

class DeezerNormalService {
  // Helper to make requests to Deezer normal API
  static async makeRequest(endpoint) {
    try {
      const response = await fetch(`${DEEZER_API_BASE}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Deezer Normal API error:', error);
      return null;
    }
  }

  // Get popular artists from Deezer charts
  static async getPopularArtists(limit = 20) {
    try {
      const data = await this.makeRequest(`/chart/0/artists?limit=${limit}`);
      return data.data || [];
    } catch (error) {
      console.error('Error getting popular Deezer artists:', error);
      return [];
    }
  }

  // Get popular albums from Deezer charts
  static async getPopularAlbums(limit = 20) {
    try {
      const data = await this.makeRequest(`/chart/0/albums?limit=${limit}`);
      return data.data || [];
    } catch (error) {
      console.error('Error getting popular Deezer albums:', error);
      return [];
    }
  }

  // Search for artists
  static async searchArtists(query, limit = 20) {
    try {
      const data = await this.makeRequest(`/search/artist?q=${encodeURIComponent(query)}&limit=${limit}`);
      return data.data || [];
    } catch (error) {
      console.error('Error searching Deezer artists:', error);
      return [];
    }
  }

  // Search for albums
  static async searchAlbums(query, limit = 20) {
    try {
      const data = await this.makeRequest(`/search/album?q=${encodeURIComponent(query)}&limit=${limit}`);
      return data.data || [];
    } catch (error) {
      console.error('Error searching Deezer albums:', error);
      return [];
    }
  }

  // Get artist by ID
  static async getArtist(artistId) {
    try {
      const data = await this.makeRequest(`/artist/${artistId}`);
      return data;
    } catch (error) {
      console.error('Error getting Deezer artist:', error);
      return null;
    }
  }

  // Get album by ID
  static async getAlbum(albumId) {
    try {
      const data = await this.makeRequest(`/album/${albumId}`);
      return data;
    } catch (error) {
      console.error('Error getting Deezer album:', error);
      return null;
    }
  }

  // Get tracks by artist
  static async getArtistTracks(artistId, limit = 20) {
    try {
      const data = await this.makeRequest(`/artist/${artistId}/top?limit=${limit}`);
      return data.data || [];
    } catch (error) {
      console.error('Error getting artist tracks:', error);
      return [];
    }
  }

  // Get albums by artist
  static async getArtistAlbums(artistId, limit = 20) {
    try {
      const data = await this.makeRequest(`/artist/${artistId}/albums?limit=${limit}`);
      return data.data || [];
    } catch (error) {
      console.error('Error getting artist albums:', error);
      return [];
    }
  }

  // Get tracks by album
  static async getAlbumTracks(albumId, limit = 50) {
    try {
      const data = await this.makeRequest(`/album/${albumId}/tracks?limit=${limit}`);
      return data.data || [];
    } catch (error) {
      console.error('Error getting album tracks:', error);
      return [];
    }
  }

  // Convert Deezer artist to our app format (same as RapidAPI)
  static convertDeezerArtist(deezerArtist) {
    return {
      id: deezerArtist.id.toString(),
      idArtist: deezerArtist.id.toString(),
      strArtist: deezerArtist.name,
      strArtistThumb: deezerArtist.picture_medium || '',
      strGenre: deezerArtist.genre || '',
      deezerId: deezerArtist.id.toString(),
    };
  }

  // Convert Deezer album to our app format (same as RapidAPI)
  static convertDeezerAlbum(deezerAlbum) {
    return {
      id: deezerAlbum.id.toString(),
      idAlbum: deezerAlbum.id.toString(),
      strAlbum: deezerAlbum.title,
      strArtist: deezerAlbum.artist?.name || '',
      strAlbumThumb: deezerAlbum.cover_medium || '',
      intYearReleased: deezerAlbum.release_date?.substring(0, 4) || '',
      deezerId: deezerAlbum.id.toString(),
    };
  }
}

export default DeezerNormalService;
