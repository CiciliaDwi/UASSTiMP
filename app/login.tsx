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
    View,
} from 'react-native';

const API_URL = 'http://ubaya.cloud/react/160422148/uas/login.php'; 

const LoginScreen = () => {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Perhatian', 'Username dan Password harus diisi.');
            return;
        }

        setIsLoading(true);

        const formData = new URLSearchParams();
        formData.append('user_name', username);
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
                // Simpan user data ke storage
                await storageService.saveUser({
                    user_id: data.user_id,
                    user_name: data.user_name,
                    user_saldo: data.user_saldo || 0,
                });
                await storageService.setLoggedIn(true);

                Alert.alert('Sukses', `Selamat datang, ${data.user_name}!`);
                router.replace('/(tabs)'); 
            } else {
                Alert.alert('Login Gagal', data.message || 'Username atau password salah.');
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
                
                {/* Header/Logo Placeholder */}
                <View style={styles.header}>
                    <Text style={styles.logoText}>BIOSKOPI</Text>
                    <Text style={styles.tagline}>Nonton Film, Minum Kopi</Text>
                </View>

                {/* Card Form */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Masuk ke Akun Anda</Text>
                    
                    {/* Input Username */}
                    <TextInput 
                        style={styles.input} 
                        placeholder="Username" 
                        placeholderTextColor="#aaa"
                        value={username} 
                        onChangeText={setUsername} 
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

                    {/* Tombol Login */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>LOGIN</Text>
                        )}
                    </TouchableOpacity>

                    {/* Navigasi ke Registrasi */}
                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => router.push('/register')} 
                    >
                        <Text style={styles.registerText}>Belum punya akun? Daftar di sini</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#1E1E1E', // Background gelap ala bioskop
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
        backgroundColor: '#404040', 
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
    registerButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    registerText: {
        color: '#A9A9A9', // Warna abu-abu yang lebih lembut
        fontSize: 14,
    }
});

export default LoginScreen;