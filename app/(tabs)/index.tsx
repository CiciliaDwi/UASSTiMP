import { filmService } from '@/services';
import { Film } from '@/types';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const HomeScreen = () => {
  const router = useRouter();
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilms();
  }, []);

  const fetchFilms = async () => {
    try {
      setLoading(true);
      const data = await filmService.getFilms();
      setFilms(data);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data film');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderFilmCard = ({ item }: { item: Film }) => (
    <TouchableOpacity
      style={styles.filmCard}
      onPress={() => {
        router.navigate({
          pathname: '/films/[id]',
          params: { id: item.film_id },
        } as any);
      }}
    >
      <View style={styles.filmContent}>
        <Text style={styles.filmTitle}>{item.film_judul}</Text>
        <Text style={styles.filmGenre}>{item.film_genre}</Text>
        <Text style={styles.filmYear}>{item.film_tahun}</Text>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => {
            router.navigate({
              pathname: '/films/[id]',
              params: { id: item.film_id },
            } as any);
          }}
        >
          <Text style={styles.detailButtonText}>Lihat Detail</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daftar Film</Text>
        <Text style={styles.headerSubtitle}>Pilih film favorit Anda</Text>
      </View>

      <FlatList
        data={films}
        renderItem={renderFilmCard}
        keyExtractor={(item) => item.film_id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filmCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filmContent: {
    padding: 16,
  },
  filmTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  filmGenre: {
    fontSize: 13,
    color: '#6366f1',
    marginBottom: 4,
  },
  filmYear: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  detailButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default HomeScreen;
