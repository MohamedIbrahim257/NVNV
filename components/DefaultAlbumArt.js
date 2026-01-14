import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DefaultAlbumArt = ({ size = 140 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Ionicons name="musical-note" size={size * 0.4} color="#B3B3B3" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});

export default DefaultAlbumArt;
