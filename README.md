# Music App - React Native with Expo

A feature-rich music streaming app built with React Native and Expo, using TheAudioDB API for music data.

## Features

- 🎵 **Music Search**: Search for artists, albums, and tracks
- ❤️ **Favorites**: Save your favorite music locally
- 📱 **Playlists**: Create and manage custom playlists
- 🎧 **Music Player**: Beautiful player interface (demo mode)
- 🎨 **Modern UI**: Dark theme with Spotify-inspired design
- 📱 **Cross-platform**: Works on iOS and Android with Expo Go

## Tech Stack

- **React Native** with JavaScript (no TypeScript)
- **Expo Go** for easy development and deployment
- **React Navigation** for navigation
- **TheAudioDB API** for music data
- **AsyncStorage** for local data persistence
- **Expo AV** for audio capabilities
- **Expo Vector Icons** for beautiful icons

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Expo Go app on your device
- Basic knowledge of React Native

### Installation

1. Clone this repository or navigate to the project directory:
   ```bash
   cd music-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Scan the QR code with Expo Go app on your device

## Project Structure

```
music-app/
├── assets/                 # Images and assets
├── components/            # Reusable components
├── navigation/           # Navigation configuration
│   └── AppNavigator.js   # Main navigation setup
├── screens/              # App screens
│   ├── HomeScreen.js     # Home screen with trending content
│   ├── SearchScreen.js   # Search functionality
│   ├── FavoritesScreen.js # Favorite items
│   ├── PlaylistsScreen.js # Playlist management
│   ├── PlayerScreen.js   # Music player (demo)
│   ├── ArtistDetailScreen.js # Artist details
│   ├── AlbumDetailScreen.js  # Album details
│   └── PlaylistDetailScreen.js # Playlist details
├── services/             # API and storage services
│   ├── TheAudioDBService.js # TheAudioDB API integration
│   └── StorageService.js    # Local storage management
├── App.js               # Main app component
└── package.json         # Dependencies
```

## API Integration

The app uses **TheAudioDB API** (free tier) for music data:

- **Artist Search**: Find artists by name
- **Album Search**: Browse albums and track listings
- **Track Search**: Search for individual songs
- **Artist Details**: Get artist biographies and information

**Note**: TheAudioDB provides metadata but not actual audio streaming. The music player is in demo mode and simulates playback. For a production app, you would need to integrate with a streaming service like Spotify Web API, Apple Music API, or similar.

## Key Features Explained

### 1. Search Functionality
- Real-time search with debouncing
- Tab-based filtering (All, Artists, Albums, Tracks)
- Beautiful search results with images

### 2. Favorites System
- Add/remove artists, albums, and tracks from favorites
- Persistent storage using AsyncStorage
- Quick access from dedicated favorites screen

### 3. Playlist Management
- Create custom playlists
- Add tracks to playlists
- Edit playlist names
- Delete playlists
- Play all or shuffle functionality

### 4. Music Player
- Beautiful player interface
- Track information display
- Play/pause controls (demo mode)
- Progress bar and time display
- Favorite toggle
- Share functionality

### 5. Artist & Album Details
- Detailed artist information with biography
- Album listings with track details
- Track listings with duration
- Play all functionality

## Limitations

- **Audio Playback**: TheAudioDB doesn't provide audio URLs. The player is in demo mode.
- **API Limits**: Free tier of TheAudioDB has rate limits.
- **Images**: Some albums/artists might not have cover images.

## Future Enhancements

- Integrate with actual music streaming service
- Add user authentication
- Implement offline mode
- Add social features (sharing, following)
- Radio/recommendation features
- Lyrics integration
- Equalizer settings

## Development Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web

# Build for production
expo build:android
expo build:ios
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Please respect the terms of service of TheAudioDB API and any music streaming services you might integrate with.

## Support

If you encounter any issues or have questions, please check the Expo documentation and React Native documentation first. For issues specific to this app, feel free to open an issue.
