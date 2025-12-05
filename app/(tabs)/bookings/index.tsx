import { pemesananService } from '@/services';
import { Pemesanan, User } from '@/types';
import { formatCurrency, formatDate, storageService } from '@/utils/storage';
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

const BookingsScreen = () => {
  const [bookings, setBookings] = useState<Pemesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const userData = await storageService.getUser();
      setUser(userData);

      if (userData?.user_id) {
        const data = await pemesananService.getPemesananByUser(userData.user_id);
        setBookings(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data pemesanan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const renderBookingCard = ({ item }: { item: Pemesanan }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingTitle}>Pemesanan #{item.pemesanan_id}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.pemesanan_status) },
          ]}
        >
          <Text style={styles.statusText}>{item.pemesanan_status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <Text style={styles.detailLabel}>Tanggal Pemesanan</Text>
        <Text style={styles.detailValue}>{formatDate(item.pemesanan_tanggal)}</Text>

        <Text style={[styles.detailLabel, { marginTop: 8 }]}>Jam</Text>
        <Text style={styles.detailValue}>{item.pemesanan_jam}</Text>

        <Text style={[styles.detailLabel, { marginTop: 8 }]}>Jumlah Kursi</Text>
        <Text style={styles.detailValue}>{item.pemesanan_jumlah_kursi} Kursi</Text>

        <Text style={[styles.detailLabel, { marginTop: 8 }]}>Total Harga</Text>
        <Text style={styles.detailValuePrice}>{formatCurrency(item.pemesanan_harga_total)}</Text>
      </View>

      <TouchableOpacity style={styles.detailButton}>
        <Text style={styles.detailButtonText}>Lihat Detail</Text>
      </TouchableOpacity>
    </View>
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
        <Text style={styles.headerTitle}>Riwayat Pemesanan</Text>
        <Text style={styles.headerSubtitle}>
          {bookings.length} pemesanan ditemukan
        </Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Belum ada pemesanan</Text>
          <Text style={styles.emptySubText}>Pesan tiket sekarang untuk menonton film favorit Anda</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.pemesanan_id}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
  bookingCard: {
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
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  bookingDetails: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    marginTop: 2,
  },
  detailValuePrice: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: 'bold',
    marginTop: 2,
  },
  detailButton: {
    marginHorizontal: 16,
    marginBottom: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default BookingsScreen;
