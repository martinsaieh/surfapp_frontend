/**
 * Grid para mostrar fotos y videos de una sesión
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Image as ImageIcon, Film } from 'lucide-react-native';
import { Media } from '@/lib/types';

interface MediaGridProps {
  media: Media[];
  onMediaPress?: (item: Media, index: number) => void;
  columns?: number;
}

export function MediaGrid({
  media,
  onMediaPress,
  columns = 2,
}: MediaGridProps) {
  const screenWidth = Dimensions.get('window').width;
  const spacing = 12;
  const padding = 16;
  const itemSize = (screenWidth - padding * 2 - spacing * (columns - 1)) / columns;

  const renderItem = ({ item, index }: { item: Media; index: number }) => {
    return (
      <TouchableOpacity
        style={[styles.mediaItem, { width: itemSize, height: itemSize * 1.2 }]}
        onPress={() => onMediaPress?.(item, index)}
        activeOpacity={0.9}>
        <Image
          source={{
            uri: item.thumbnail_url || item.url,
          }}
          style={styles.mediaImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.mediaGradient}
        />
        {item.type === 'video' && (
          <View style={styles.videoOverlay}>
            <View style={styles.playButton}>
              <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <View style={styles.videoBadge}>
              <Film size={12} color="#FFFFFF" />
              {item.duration_seconds && (
                <Text style={styles.videoDuration}>
                  {Math.floor(item.duration_seconds / 60)}:
                  {(item.duration_seconds % 60).toString().padStart(2, '0')}
                </Text>
              )}
            </View>
          </View>
        )}
        {item.type === 'photo' && (
          <View style={styles.photoBadge}>
            <ImageIcon size={12} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (media.length === 0) {
    return (
      <View style={styles.emptyState}>
        <ImageIcon size={48} color="#D1D1D6" strokeWidth={1.5} />
        <Text style={styles.emptyText}>
          No hay fotos o videos aún en esta sesión
        </Text>
        <Text style={styles.emptySubtext}>
          Las fotos aparecerán aquí cuando el fotógrafo las suba
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={media}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={columns}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  mediaItem: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(10, 122, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  videoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  videoDuration: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  photoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 6,
    borderRadius: 8,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
});
