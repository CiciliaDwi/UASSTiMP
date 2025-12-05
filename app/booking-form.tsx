import { cafeService, filmService, pemesananService } from '@/services';
import { Cafe, Film, User } from '@/types';
import { formatCurrency, storageService } from '@/utils/storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    SafeAreaView,
    Platform,
} from 'react-native';

// Struktur data Menu yang diasumsikan akan dikembalikan dari API
interface ItemMenu {
    id: string;
    nama: string;
    harga: number;
    tipe: 'food' | 'drink';
}

const BookingFormScreen = () => {
  const router = useRouter();
  const { filmId } = useLocalSearchParams();

  // --- STATES ASLI ---
  const [film, setFilm] = useState<Film | null>(null);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [selectedCafe, setSelectedCafe] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [jumlahKursi, setJumlahKursi] = useState<string>('1'); // Dipertahankan dari state asli
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCafeList, setShowCafeList] = useState(false);
  
  // --- STATES BARU UNTUK VISUALISASI UI ---
  const [hargaPerKursi, setHargaPerKursi] = useState<number>(0);
  const [menuData, setMenuData] = useState<ItemMenu[]>([]);
  
  // State untuk melacak kursi yang dipilih (dari denah visual)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]); 
  // State untuk melacak kuantitas menu yang dipesan
  const [menuItems, setMenuItems] = useState<{ [key: string]: number }>({});

  // --- SIMULASI DATA STRUKTUR API (HANYA UNTUK MEMASTIKAN UI BERFUNGSI) ---
  // Di aplikasi nyata, data ini akan diambil dari endpoint yang spesifik
  const simulatedBookedSeats = ['D5', 'D6', 'E6', 'G1', 'A7', 'A8']; // Kursi yang sudah terisi (simulasi)
  const simulatedMenuAPI: ItemMenu[] = [
      { id: 'm1', nama: 'Popcorn Caramel', harga: 25000, tipe: 'food' },
      { id: 'm2', nama: 'Soda Large', harga: 18000, tipe: 'drink' },
      { id: 'm3', nama: 'Hot Coffee Latte', harga: 30000, tipe: 'drink' },
      { id: 'm4', nama: 'Nachos Special', harga: 35000, tipe: 'food' },
  ];
  
  // --- LOGIKA FETCH DATA ASLI ---
  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            // 1. Ambil Detail Film
            // Asumsi service Anda membutuhkan filmId dan mengembalikan Film
            const filmResult = await filmService.getFilms(filmId as string); 
            // setFilm(filmResult); 

            // 2. Ambil Daftar Kafe
            const cafesResult = await cafeService.getCafes(); 
            setCafes(cafesResult);
            if (cafesResult.length > 0) {
                setSelectedCafe(cafesResult[0].cafe_id);
            }

            // 3. Ambil Data User (Saldo)
            const userData = await storageService.getUser();
            setUser(userData);
            
            // 4. SIMULASI: Ambil Harga Tiket & Daftar Menu (Gantilah dengan panggilan API sebenarnya)
            setHargaPerKursi(50000); // Asumsi harga tetap
            setMenuData(simulatedMenuAPI); // Data menu dari API
            
            // 5. SIMULASI: Inisialisasi menuItems
            const initialMenuQuantities: { [key: string]: number } = {};
            simulatedMenuAPI.forEach(item => {
                initialMenuQuantities[item.id] = 0;
            });
            setMenuItems(initialMenuQuantities);
            

        } catch (error) {
            console.error('Failed to load initial data:', error);
            Alert.alert('Gagal', 'Gagal memuat data awal pemesanan.');
        } finally {
            setLoading(false);
        }
    };

    fetchInitialData();
  }, [filmId]);

  // --- LOGIKA PERHITUNGAN TOTAL ---
  const totalTiket = selectedSeats.length * hargaPerKursi;
    const totalMenu = menuData.reduce((sum, item) => {
        const quantity = menuItems[item.id] || 0;
        return sum + quantity * item.harga;
    }, 0);
  const grandTotal = totalTiket + totalMenu;

  // --- HANDLER ASLI UNTUK BOOKING ---
  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
        Alert.alert('Perhatian', 'Anda harus memilih minimal satu kursi.');
        return;
    }
    
    if (grandTotal > (user?.user_saldo || 0)) {
        Alert.alert('Saldo Tidak Cukup', 'Saldo Anda tidak mencukupi untuk melakukan pemesanan ini. Silakan Top Up Saldo Anda.');
        return;
    }

    setSubmitting(true);
    try {
        // Objek data yang akan dikirim ke service pemesanan
        const pemesananData = {
            userId: user?.user_id,
            filmId: film?.film_id,
            cafeId: selectedCafe,
            tanggal: selectedDate,
            waktu: selectedTime,
            kursi: selectedSeats, // Menggunakan array kursi visual
            menu: menuItems,
            total: grandTotal,
        };
        
        // Simulasikan pemanggilan API Service pemesanan
        // await pemesananService.createPemesanan(pemesananData);

        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulasi delay API
        Alert.alert('Sukses', 'Pemesanan Berhasil! Silakan nikmati filmnya.');
        // router.replace('/(tabs)/history'); 
    } catch (error) {
        console.error('Booking failed:', error);
        Alert.alert('Gagal', 'Pemesanan gagal dilakukan. Silakan coba lagi.');
    } finally {
        setSubmitting(false);
    }
  };

  // --- HANDLER UI (Mempertahankan logika UI yang terpisah) ---
  const handleQuantityChange = (itemId: string, delta: number) => {
        setMenuItems(prev => {
            const newCount = (prev[itemId] || 0) + delta;
            return {
                ...prev,
                [itemId]: Math.max(0, newCount),
            };
        });
  };

  const handleSeatPress = (seatId: string) => {
    if (simulatedBookedSeats.includes(seatId)) return; // Tidak bisa memilih kursi yang terisi
    
    setSelectedSeats(prev => {
        if (prev.includes(seatId)) {
            return prev.filter(id => id !== seatId);
        } else {
             if (prev.length >= 8) {
                Alert.alert('Perhatian', 'Maksimal 8 kursi per pemesanan.');
                return prev;
            }
            return [...prev, seatId].sort();
        }
    });
  };

  // --- Komponen Pembantu untuk UI Kursi (Denah 8x8) ---
  const ROWS = 8;
  const COLS = 8;
  const rowLetters = 'ABCDEFGH'.split('').slice(0, ROWS);

  const renderSeatGrid = () => {
    const seats = [];
    for (let i = 0; i < ROWS; i++) {
        for (let j = 1; j <= COLS; j++) {
            const seatId = rowLetters[i] + j;
            const isBooked = simulatedBookedSeats.includes(seatId); // Menggunakan data simulasi
            const isSelected = selectedSeats.includes(seatId);

            seats.push(
                <TouchableOpacity
                    key={seatId}
                    style={[
                        styles.seat,
                        isBooked && styles.seatBooked,
                        isSelected && styles.seatSelected,
                    ]}
                    onPress={() => handleSeatPress(seatId)}
                    disabled={isBooked}
                >
                    <Text style={styles.seatText}>{seatId}</Text>
                </TouchableOpacity>
            );

            // Lorong Tengah (Spacing setelah kolom ke-4 sesuai permintaan 8x8 dengan lorong)
            if (j === 4) {
                seats.push(<View key={`aisle-${i}`} style={styles.aisleSpacer} />);
            }
        }
    }
    return <View style={styles.seatGridContainer}>{seats}</View>;
  };
  
  // --- Komponen Pembantu untuk UI Menu ---
  const renderMenuItem = ({ item }: { item: ItemMenu }) => {
        const quantity = menuItems[item.id] || 0;
        return (
            <View style={styles.menuItemRow}>
                <View style={styles.menuItemDetails}>
                    <Text style={styles.menuItemName}>{item.nama}</Text>
                    <Text style={styles.menuItemPrice}>{formatCurrency(item.harga)}</Text>
                </View>
                <View style={styles.quantityControl}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.id, -1)}
                        disabled={quantity === 0}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityInput}>{quantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(item.id, 1)}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // --- Loading State ---
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={styles.loadingText}>Memuat data pemesanan...</Text>
            </View>
        );
    }

  return (
    <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            
            {/* 1. Detail Film & Saldo */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Detail Film & Saldo</Text>
                <View style={styles.filmDetail}>
                    <Text style={styles.filmTitle}>{film?.film_judul || 'Memuat Film...'}</Text>
                    <Text style={styles.filmInfo}>{film ? `${film.film_genre} | ${film.film_durasi} menit` : '...'}</Text>
                </View>
                <View style={styles.saldoInfo}>
                    <Text style={styles.saldoLabel}>Saldo Anda:</Text>
                    <Text style={styles.saldoValue}>{formatCurrency(user?.user_saldo || 0)}</Text>
                </View>
            </View>

            {/* 2. Pilihan Lokasi/Jadwal */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Lokasi & Jadwal</Text>
                
                {/* Pemilihan Kafe */}
                <Text style={styles.label}>Pilih Lokasi Café</Text>
                <TouchableOpacity 
                    style={styles.dropdown}
                    onPress={() => setShowCafeList(!showCafeList)}
                >
                    <Text style={styles.dropdownText}>
                        {cafes.find(c => c.cafe_id === selectedCafe)?.cafe_nama || 'Pilih Kafe...'}
                    </Text>
                </TouchableOpacity>
                
                {showCafeList && (
                    <View style={styles.cafeListContainer}>
                        {cafes.map((cafe) => (
                            <TouchableOpacity
                                key={cafe.cafe_id}
                                style={styles.cafeItem}
                                onPress={() => {
                                    setSelectedCafe(cafe.cafe_id);
                                    setShowCafeList(false);
                                }}
                            >
                                <Text style={styles.cafeItemText}>{cafe.cafe_nama}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Pemilihan Tanggal & Waktu (Input Text Biasa) */}
                <View style={styles.scheduleRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.label}>Tanggal</Text>
                        <TextInput 
                            style={styles.input} 
                            value={selectedDate} 
                            onChangeText={setSelectedDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#6b7280"
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.label}>Waktu</Text>
                        <TextInput 
                            style={styles.input} 
                            value={selectedTime} 
                            onChangeText={setSelectedTime}
                            placeholder="HH:MM"
                            placeholderTextColor="#6b7280"
                        />
                    </View>
                </View>

                {/* Jumlah Kursi Lama Anda (Dibiarkan untuk Kompatibilitas Logika) */}
                <Text style={styles.label}>Jumlah Kursi (Input Asli)</Text>
                <TextInput
                    style={styles.input}
                    value={jumlahKursi}
                    onChangeText={setJumlahKursi}
                    keyboardType="numeric"
                    placeholder="Masukkan Jumlah Kursi"
                    placeholderTextColor="#6b7280"
                />
            </View>
            
            {/* 3. Pemilihan Kursi Visual */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Denah & Pilih Kursi ({selectedSeats.length} Kursi)</Text>
                
                {hargaPerKursi > 0 && (
                    <View style={styles.ticketPriceInfo}>
                        <Text style={styles.ticketPriceText}>Harga Tiket: {formatCurrency(hargaPerKursi)}</Text>
                    </View>
                )}

                <View style={styles.screenIndicator}>
                    <Text style={styles.screenText}>LAYAR BIOSKOP</Text>
                </View>

                {renderSeatGrid()}
                
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.seat, styles.seatSelected, { width: 20, height: 20 }]} />
                        <Text style={styles.legendText}>Terpilih</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.seat, { backgroundColor: '#404040', width: 20, height: 20 }]} />
                        <Text style={styles.legendText}>Tersedia</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.seat, styles.seatBooked, { width: 20, height: 20 }]} />
                        <Text style={styles.legendText}>Terisi</Text>
                    </View>
                </View>
                <Text style={styles.selectedSeatsText}>Kursi Terpilih: {selectedSeats.join(', ') || 'Belum ada'}</Text>
            </View>


            {/* 4. Pemesanan Makanan/Minuman */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Tambahan Makanan & Minuman</Text>
                {menuData.length > 0 ? (
                    <FlatList
                        data={menuData}
                        renderItem={renderMenuItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                    />
                ) : (
                    <Text style={styles.emptyText}>Menu belum tersedia di lokasi ini.</Text>
                )}
            </View>

            {/* 5. Ringkasan Pembayaran */}
            <View style={[styles.card, styles.summaryCard]}>
                <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
                
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tiket ({selectedSeats.length} kursi @ {formatCurrency(hargaPerKursi)})</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(totalTiket)}</Text>
                </View>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Menu Tambahan</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(totalMenu)}</Text>
                </View>
                
                <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                    <Text style={styles.summaryLabelTotal}>TOTAL PEMBAYARAN</Text>
                    <Text style={styles.summaryValueTotal}>{formatCurrency(grandTotal)}</Text>
                </View>
            </View>

            {/* 6. Tombol Konfirmasi */}
            <TouchableOpacity
                style={[styles.button, submitting || selectedSeats.length === 0 ? styles.buttonDisabled : {}]}
                onPress={handleBooking}
                disabled={submitting || selectedSeats.length === 0}
            >
                {submitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>BAYAR SEKARANG ({formatCurrency(grandTotal)})</Text>
                )}
            </TouchableOpacity>
            
            <View style={{ height: 50 }} />
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#1E1E1E', // Background Utama Gelap (Hitam Sinematik)
    },
    container: {
        flex: 1,
        backgroundColor: '#1E1E1E',
    },
    contentContainer: {
        padding: 16,
    },
    
    // --- LOADING & TITLE ---
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
    },
    loadingText: {
        marginTop: 10,
        color: '#FFD700',
    },
    
    // --- CARD STYLE (Elevasi dan Warna Gelap) ---
    card: {
        backgroundColor: '#2C2C2C', // Card background yang sedikit lebih terang
        padding: 18,
        borderRadius: 12,
        marginBottom: 16,
        // Shadow sinematik
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700', // Aksen Emas
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 215, 0, 0.2)',
        paddingBottom: 8,
    },
    
    // --- DETAIL FILM & SALDO ---
    filmDetail: {
        marginBottom: 10,
    },
    filmTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    filmInfo: {
        fontSize: 13,
        color: '#ccc',
    },
    saldoInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#404040',
    },
    saldoLabel: {
        fontSize: 14,
        color: '#ccc',
    },
    saldoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#7FFF00', // Warna Hijau untuk Saldo
    },
    
    // --- LOKASI & JADWAL ---
    label: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 5,
        fontWeight: '600',
    },
    dropdown: {
        height: 50,
        backgroundColor: '#404040',
        borderRadius: 8,
        paddingHorizontal: 15,
        justifyContent: 'center',
        marginBottom: 15,
    },
    dropdownText: {
        color: '#fff',
        fontSize: 16,
    },
    cafeListContainer: {
        backgroundColor: '#404040',
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#555',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    cafeItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#555',
    },
    cafeItemText: {
        color: '#fff',
        fontSize: 16,
    },
    scheduleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    input: { 
        height: 50, 
        backgroundColor: '#404040', 
        color: '#fff',
        paddingHorizontal: 15, 
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 15,
    },
    
    // --- PEMILIHAN KURSI (UI Disesuaikan) ---
    ticketPriceInfo: {
        marginBottom: 10,
        padding: 8,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 5,
        alignItems: 'center',
    },
    ticketPriceText: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 14,
    },
    screenIndicator: {
        backgroundColor: '#000',
        paddingVertical: 10,
        borderRadius: 5,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#E74C3C',
        shadowColor: '#E74C3C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5,
    },
    screenText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 2,
    },
    seatGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: 5,
        marginBottom: 15,
    },
    seat: {
        width: 30, 
        height: 30,
        margin: 3,
        borderRadius: 4,
        backgroundColor: '#404040',
        justifyContent: 'center',
        alignItems: 'center',
    },
    seatBooked: {
        backgroundColor: '#555',
        opacity: 0.6,
    },
    seatSelected: {
        backgroundColor: '#E74C3C', // Merah Aksen
        borderWidth: 2,
        borderColor: '#FFD700', // Emas Aksen
    },
    seatText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    aisleSpacer: {
        width: 15, // Lebar lorong
        height: 30,
        marginHorizontal: 4, 
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#404040',
        marginTop: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendText: {
        marginLeft: 8,
        color: '#ccc',
        fontSize: 13,
    },
    selectedSeatsText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        fontWeight: '600',
    },

    // --- MENU MAKANAN/MINUMAN ---
    emptyText: {
        color: '#ccc',
        textAlign: 'center',
        paddingVertical: 10,
    },
    menuItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#404040',
    },
    menuItemDetails: {
        flex: 2,
    },
    menuItemName: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '600',
    },
    menuItemPrice: {
        fontSize: 13,
        color: '#ccc',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    quantityButton: {
        backgroundColor: '#E74C3C',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    quantityInput: {
        width: 30,
        textAlign: 'center',
        fontSize: 16,
        color: '#fff',
        marginHorizontal: 8,
    },

    // --- RINGKASAN PEMBAYARAN ---
    summaryCard: {
        borderWidth: 2,
        borderColor: '#FFD700', // Border Emas untuk menonjolkan ringkasan
        paddingHorizontal: 18,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#404040',
    },
    summaryRowTotal: {
        borderBottomWidth: 0,
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 2,
        borderTopColor: '#FFD700', // Garis pemisah total Emas
    },
    summaryLabel: {
        fontSize: 14,
        color: '#ccc',
    },
    summaryLabelTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700', 
    },
    summaryValue: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    summaryValueTotal: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#E74C3C', // Nilai total Merah
    },

    // --- TOMBOL UTAMA ---
    button: {
        backgroundColor: '#E74C3C', // Merah Aksen
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
        ...Platform.select({
            ios: {
                shadowColor: '#E74C3C',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.6,
                shadowRadius: 5,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    buttonDisabled: {
        backgroundColor: '#888',
        shadowOpacity: 0.3,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});

export default BookingFormScreen;