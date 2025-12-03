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
import { Play } from 'lucide-react-native';
import { Media } from '@/lib/types';

interface MediaGridProps {
  media: Media[];
  onMediaPress?: (item: Media, index: number) => void;
  columns?: number;
}

export function MediaGrid({
  media,
  onMediaPress,
  columns = 3,
}: MediaGridProps) {
  const screenWidth = Dimensions.get('window').width;
  const spacing = 4;
  const itemSize = (screenWidth - spacing * (columns + 1)) / columns;

  const renderItem = ({ item, index }: { item: Media; index: number }) => {
    return (
      <TouchableOpacity
        style={[styles.mediaItem, { width: itemSize, height: itemSize }]}
        onPress={() => onMediaPress?.(item, index)}
        activeOpacity={0.8}>
        <Image
          source={{
            uri: item.thumbnail_url || item.url,
          }}
          style={styles.mediaImage}
          resizeMode="cover"
        />
        {item.type === 'video' && (
          <View style={styles.videoOverlay}>
            <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (media.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>
          No hay fotos o videos aún en esta sesión
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
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 2,
  },
  row: {
    gap: 4,
    marginBottom: 4,
  },
  mediaItem: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F2F2F7',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
