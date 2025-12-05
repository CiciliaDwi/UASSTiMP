import { cafeService, makananService } from '@/services';
import { Cafe, Makanan } from '@/types';
import { formatCurrency } from '@/utils/storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const CafeDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [makanan, setMakanan] = useState<Makanan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCafeDetail();
    }
  }, [id]);

  const fetchCafeDetail = async () => {
    try {
      setLoading(true);
      const cafeData = await cafeService.getCafeDetail(id as string);
      setCafe(cafeData);

      // Fetch makanan list
      const makananData = await makananService.getMakananByCafe(id as string);
      setMakanan(makananData);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat detail café');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderMakananCard = ({ item }: { item: Makanan }) => (
    <View style={styles.makananCard}>
      <View style={styles.makananContent}>
        <Text style={styles.makananName}>{item.makanan_nama}</Text>
        <Text style={styles.makananCategory}>{item.makanan_kategori}</Text>
      </View>
      <Text style={styles.makananPrice}>{formatCurrency(item.makanan_harga)}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!cafe) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Café tidak ditemukan</Text>
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
        <Text style={styles.headerTitle}>Detail Café</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.cafeHeaderCard}>
          <Text style={styles.cafeName}>{cafe.cafe_nama}</Text>
          <Text style={styles.cafeLokasi}>📍 {cafe.cafe_lokasi}</Text>
          <Text style={styles.cafeJam}>
            🕐 {cafe.cafe_jam_buka} - {cafe.cafe_jam_tutup}
          </Text>
        </View>

        {makanan.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Menu Makanan & Minuman</Text>
            <FlatList
              data={makanan}
              renderItem={renderMakananCard}
              keyExtractor={(item) => item.makanan_id}
              scrollEnabled={false}
            />
          </View>
        )}

        <TouchableOpacity style={styles.bookingButton}>
          <Text style={styles.bookingButtonText}>Pesan di Café Ini</Text>
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
    color: '#f97316',
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
  cafeHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cafeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  cafeLokasi: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  cafeJam: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  makananCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  makananContent: {
    flex: 1,
  },
  makananName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  makananCategory: {
    fontSize: 12,
    color: '#9ca3af',
  },
  makananPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f97316',
  },
  bookingButton: {
    backgroundColor: '#f97316',
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
    backgroundColor: '#f97316',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CafeDetailScreen;
