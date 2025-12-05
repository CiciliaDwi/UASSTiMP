import { filmService } from '@/services';
import { Film } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const FilmDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [film, setFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchFilmDetail();
    }
  }, [id]);

  const fetchFilmDetail = async () => {
    try {
      setLoading(true);
      const data = await filmService.getFilmDetail(id as string);
      setFilm(data);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat detail film');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (film?.film_id) {
      router.push({
        pathname: '/booking-form',
        params: { filmId: film.film_id },
      } as any);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!film) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Film tidak ditemukan</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backHeaderButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backHeaderButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Film</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.posterContainer}>
          <View style={styles.poster}>
            <Text style={styles.posterPlaceholder}>🎬</Text>
          </View>
        </View>

        <Text style={styles.filmTitle}>{film.film_judul}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>{film.film_genre}</Text>
          </View>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>{film.film_tahun}</Text>
          </View>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>{film.film_durasi} menit</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sinopsis</Text>
          <Text style={styles.sectionContent}>{film.film_sinopsis}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Genre:</Text>
            <Text style={styles.infoValue}>{film.film_genre}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tahun:</Text>
            <Text style={styles.infoValue}>{film.film_tahun}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Durasi:</Text>
            <Text style={styles.infoValue}>{film.film_durasi} menit</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.bookingButton} onPress={handleBooking}>
          <Text style={styles.bookingButtonText}>Pesan Tiket Sekarang</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backHeaderButton: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  backHeaderButtonText: {
    fontSize: 28,
    color: '#6366f1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  spacer: {
    width: 40,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  posterContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  poster: {
    height: 200,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  posterPlaceholder: {
    fontSize: 80,
  },
  filmTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  infoBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  infoBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  bookingButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
    marginBottom: 40,
  },
  bookingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default FilmDetailScreen;
