import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCircle, Clock } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api-supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function MessagesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setError(null);
      const data = await api.getConversations(user.id);
      setConversations(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar conversaciones');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadConversations();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const renderConversation = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => router.push(`/messages/${item.id}` as any)}
        activeOpacity={0.7}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.other_user_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          {item.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unread_count > 9 ? '9+' : item.unread_count}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName}>{item.other_user_name}</Text>
            <Text style={styles.timestamp}>
              {formatTime(item.last_message_at)}
            </Text>
          </View>
          {item.session && (
            <Text style={styles.sessionInfo}>
              Sesión en {item.session.spot}
            </Text>
          )}
          {item.last_message && (
            <Text
              style={[
                styles.lastMessage,
                item.unread_count > 0 && styles.unreadMessage,
              ]}
              numberOfLines={1}>
              {item.last_message}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando conversaciones..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message={error} onRetry={loadConversations} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensajes</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <MessageCircle size={64} color="#D1D1D6" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No hay conversaciones</Text>
          <Text style={styles.emptyText}>
            Tus conversaciones con fotógrafos aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#007AFF"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  list: {
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  timestamp: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sessionInfo: {
    fontSize: 13,
    color: '#007AFF',
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 15,
    color: '#8E8E93',
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#1C1C1E',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});
