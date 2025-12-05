import { cafeService } from '@/services';
import { Cafe } from '@/types';
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

const ExploreScreen = () => {
  const router = useRouter();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCafes();
  }, []);

  const fetchCafes = async () => {
    try {
      setLoading(true);
      const data = await cafeService.getCafes();
      setCafes(data);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data café');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderCafeCard = ({ item }: { item: Cafe }) => (
    <TouchableOpacity
      style={styles.cafeCard}
      onPress={() => {
        // Navigate dengan object untuk bypass type checking
        router.navigate({
          pathname: '/cafes/[id]',
          params: { id: item.cafe_id },
        } as any);
      }}
    >
      <View style={styles.cafeContent}>
        <Text style={styles.cafeName}>{item.cafe_nama}</Text>
        <Text style={styles.cafeLokasi}>📍 {item.cafe_lokasi}</Text>
        <Text style={styles.cafeJam}>
          🕐 {item.cafe_jam_buka} - {item.cafe_jam_tutup}
        </Text>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => {
            router.navigate({
              pathname: '/cafes/[id]',
              params: { id: item.cafe_id },
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
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daftar Café & Studio</Text>
        <Text style={styles.headerSubtitle}>Tempat menonton film favorit Anda</Text>
      </View>

      <FlatList
        data={cafes}
        renderItem={renderCafeCard}
        keyExtractor={(item) => item.cafe_id}
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
  cafeCard: {
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
  cafeContent: {
    padding: 16,
  },
  cafeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  cafeLokasi: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  cafeJam: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  detailButton: {
    backgroundColor: '#f97316',
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

export default ExploreScreen;
