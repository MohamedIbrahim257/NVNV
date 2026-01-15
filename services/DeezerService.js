// Deezer Track Service - ONLY for track playback via RapidAPI
const RAPIDAPI_KEY = 'f180479907msh84617ffe4bcd7a3p13bcb0jsn9fc5a86d4620';
const RAPIDAPI_HOST = 'deezerdevs-deezer.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

class DeezerService {
  // Helper to make requests to RapidAPI for TRACKS ONLY
  static async makeRequest(endpoint) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': RAPIDAPI_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('RapidAPI error:', error);
      return null;
    }
  }

  // Search for tracks with working audio - TRACKS ONLY
  static async searchTracks(query, limit = 20) {
    try {
      const data = await this.makeRequest(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      const deezerTracks = data?.data || [];
      
      // Use actual Deezer preview URLs
      const tracksWithAudio = deezerTracks.map((track) => ({
        ...track,
        preview: track.preview || null
      }));
      
      return tracksWithAudio;
    } catch (error) {
      console.error('Error searching Deezer tracks:', error);
      return [];
    }
  }

  // Get popular tracks with working audio - TRACKS ONLY
  static async getPopularTracks(limit = 20) {
    try {
      const data = await this.makeRequest(`/search?q=pop&limit=${limit}`);
      const deezerTracks = data?.data || [];
      
      // Use actual Deezer preview URLs
      const tracksWithAudio = deezerTracks.map((track) => ({
        ...track,
        preview: track.preview || null
      }));
      
      return tracksWithAudio;
    } catch (error) {
      console.error('Error getting popular Deezer tracks:', error);
      return [];
    }
  }

  // Get track by ID for playback - TRACKS ONLY
  static async getTrack(trackId) {
    try {
      const data = await this.makeRequest(`/track/${trackId}`);
      return data;
    } catch (error) {
      console.error('Error getting Deezer track:', error);
      return null;
    }
  }

  // Get streaming URL for track playback - TRACKS ONLY
  static async getTrackStreamingUrl(trackId) {
    try {
      console.log(`Getting streaming URL for Deezer track ${trackId}`);
      const trackData = await this.getTrack(trackId);
      
      if (trackData && trackData.preview) {
        let previewUrl = trackData.preview;
        if (previewUrl.startsWith('https://')) {
          console.log('Deezer preview URL found:', previewUrl);
          return previewUrl;
        } else {
          console.log('Invalid preview URL format');
          return null;
        }
      } else {
        console.log('No preview URL available for this Deezer track');
        return null;
      }
    } catch (error) {
      console.error('Error getting Deezer streaming URL:', error);
      return null;
    }
  }

  // Convert Deezer track to our app format - TRACKS ONLY
  static convertDeezerTrack(deezerTrack) {
    return {
      id: deezerTrack.id.toString(),
      idTrack: deezerTrack.id.toString(),
      strTrack: deezerTrack.title,
      strArtist: deezerTrack.artist?.name || '',
      strAlbum: deezerTrack.album?.title || '',
      intDuration: deezerTrack.duration * 1000 || 180000,
      strAlbumThumb: deezerTrack.album?.cover_medium || '',
      strMusicVid: `https://www.deezer.com/en/track/${deezerTrack.id}`,
      deezerId: deezerTrack.id.toString(),
      previewUrl: deezerTrack.preview,
      streamUrl: null, // Will be set when needed
    };
  }
}

export default DeezerService;
