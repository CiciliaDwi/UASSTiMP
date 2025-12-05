import { storageService } from '@/utils/storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const API_URL = 'http://ubaya.cloud/react/160422148/uas/register.php'; 

export default function RegisterScreen() {
    const router = useRouter();
    
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!userName || !password || !confirmPassword) {
            Alert.alert('Perhatian', 'Semua kolom harus diisi.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Perhatian', 'Konfirmasi password tidak cocok.');
            return;
        }

        setIsLoading(true);

        const formData = new URLSearchParams();
        formData.append('user_name', userName);
        formData.append('user_password', password);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            const data = await response.json();
            setIsLoading(false);

            if (data.result === 'success') {
                // Simpan user data jika registrasi sekaligus login
                if (data.user_id) {
                    await storageService.saveUser({
                        user_id: data.user_id,
                        user_name: data.user_name,
                        user_saldo: data.user_saldo || 0,
                    });
                    await storageService.setLoggedIn(true);
                    router.replace('/(tabs)');
                } else {
                    // Jika hanya registrasi, arahkan ke login
                    Alert.alert(
                        'Registrasi Berhasil', 
                        'Akun Anda berhasil dibuat. Silakan login.', 
                        [
                            { text: "OK", onPress: () => router.replace('/login') }
                        ]
                    );
                }
            } else {
                Alert.alert('Registrasi Gagal', data.message || 'Terjadi kesalahan pada server.');
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Network error:', error);
            Alert.alert('Error', 'Gagal terhubung ke server. Cek koneksi atau URL API.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                
                {/* Header/Logo */}
                <View style={styles.header}>
                    <Text style={styles.logoText}>BIOSKOPI</Text>
                    <Text style={styles.tagline}>Daftar dan Mulai Nonton</Text>
                </View>

                {/* Card Form */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Buat Akun Baru</Text>
                    
                    {/* Input Username */}
                    <TextInput
                        style={styles.input}
                        placeholder="Username (Nama Pengguna)"
                        placeholderTextColor="#aaa"
                        value={userName}
                        onChangeText={setUserName}
                        autoCapitalize="none"
                    />
                    
                    {/* Input Password */}
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#aaa"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    
                    {/* Input Konfirmasi Password */}
                    <TextInput
                        style={styles.input}
                        placeholder="Konfirmasi Password"
                        placeholderTextColor="#aaa"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    {/* Tombol Daftar */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>DAFTAR SEKARANG</Text>
                        )}
                    </TouchableOpacity>
                    
                    {/* Navigasi ke Login */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.replace('/login')}
                    >
                        <Text style={styles.loginText}>Sudah punya akun? Login di sini</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#1E1E1E', // Background gelap konsisten
    },
    container: { 
        flex: 1, 
        paddingHorizontal: 30, 
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFD700', // Aksen Emas/Kuning
        letterSpacing: 3,
    },
    tagline: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 5,
    },
    card: {
        backgroundColor: '#2C2C2C', // Card background yang sedikit lebih terang
        padding: 25,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: { 
        height: 50, 
        backgroundColor: '#404040', // Input background gelap
        color: '#fff',
        marginBottom: 15, 
        paddingHorizontal: 15, 
        borderRadius: 8,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#E74C3C', // Merah ala Bioskop/Aksi utama
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#E74C3C80', // Warna merah yang lebih pudar saat loading
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginButton: { // Style untuk tombol navigasi ke Login
        marginTop: 20,
        alignItems: 'center',
    },
    loginText: {
        color: '#A9A9A9', // Warna abu-abu yang lebih lembut
        fontSize: 14,
    }
});