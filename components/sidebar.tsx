import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NavItem {
    label: string;
    icon: string;
    route: string;
}

const navItems: NavItem[] = [
    { label: 'Film Tayang', icon: '🎬', route: '/(tabs)' }, // Rute utama
    { label: 'Lokasi Café', icon: '☕', route: '/explore' }, // Ganti explore dengan rute lokasi cafe
    { label: 'Pemesanan Saya', icon: '🎫', route: '/bookings' },
    { label: 'Top Up Saldo', icon: '💳', route: '/topup' }, // Menambahkan rute Top Up
    { label: 'Profil Saya', icon: '👤', route: '/profile' },
];

export const Sidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Lebar Sidebar
    const SIDEBAR_WIDTH = 280;

    const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current; // x offset
    const backdropAnim = useRef(new Animated.Value(0)).current; // opacity

    useEffect(() => {
        if (isOpen) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: false,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 0.7, // Backdrop sedikit lebih gelap
                    duration: 300,
                    useNativeDriver: false,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -SIDEBAR_WIDTH,
                    duration: 250,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: false,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }),
            ]).start();
        }
    }, [isOpen, slideAnim, backdropAnim]);

    const isActive = (route: string) => {
        // Logika untuk membersihkan rute agar bisa dibandingkan dengan pathname
        const cleanRoute = route.replace('/(tabs)', '').replace('/', '');
        const cleanPath = (pathname || '').replace('/(tabs)', '').replace('/', '');
        
        // Cek rute home: '/' atau '/(tabs)'
        if (route === '/(tabs)' && (pathname === '/' || pathname === '/(tabs)')) {
             return true;
        }

        // Cek rute lainnya
        // Memastikan rute seperti /bookings cocok dengan path /bookings
        return cleanPath.startsWith(cleanRoute) && cleanRoute !== "";
    };

    const handleNavPress = (route: string) => {
        router.push(route as any);
        setIsOpen(false);
    };

    const handleLogout = () => {
        setIsOpen(false);
        Alert.alert(
            "Logout", 
            "Apakah Anda yakin ingin keluar?", 
            [
                { text: "Batal", style: "cancel" },
                { text: "Ya, Keluar", 
                    onPress: () => {
                        // TODO: Implementasi logika logout di sini
                        // 1. Hapus token dari AsyncStorage/Context
                        // 2. Redirect ke halaman login
                        router.replace('/login');
                    },
                    style: "destructive"
                }
            ]
        );
    };

    return (
        <>
            {/* Hamburger Button (Biarkan di luar Sidebar agar selalu terlihat) */}
            {/* Anda harus meletakkan komponen ini di layout utama di atas tab navigation agar tidak tertutup */}
            <TouchableOpacity
                style={styles.hamburgerBtn}
                onPress={() => setIsOpen(true)}
                accessibilityLabel="Open menu"
            >
                <View style={styles.hamburgerIcon}>
                    <View style={styles.line} />
                    <View style={styles.line} />
                    <View style={styles.line} />
                </View>
            </TouchableOpacity>

            {/* Backdrop - Klik untuk menutup */}
            <Animated.View
                pointerEvents={isOpen ? 'auto' : 'none'}
                style={[styles.backdrop, { opacity: backdropAnim }]}
            >
                <TouchableOpacity 
                    style={StyleSheet.absoluteFill} 
                    onPress={() => setIsOpen(false)} 
                    activeOpacity={1}
                />
            </Animated.View>

            {/* Sidebar Panel */}
            <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
                <View style={styles.header}>
                    <Text style={styles.logo}>🎬 BIOSKOPI</Text>
                    <TouchableOpacity onPress={() => setIsOpen(false)} accessibilityLabel="Close menu">
                        <Text style={styles.closeBtn}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.menu} contentContainerStyle={{ paddingBottom: 32 }}>
                    {navItems.map((item) => (
                        <TouchableOpacity
                            key={item.route}
                            style={[styles.navItem, isActive(item.route) && styles.navItemActive]}
                            onPress={() => handleNavPress(item.route)}
                        >
                            <Text style={styles.navIcon}>{item.icon}</Text>
                            <Text style={[styles.navLabel, isActive(item.route) && styles.navLabelActive]}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Footer/Logout */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Text style={styles.logoutIcon}>🚪</Text>
                        <Text style={styles.logoutLabel}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    // --- TOMBOL HAMBURGER (Tampilan awal) ---
    hamburgerBtn: {
        position: 'absolute',
        top: 40, // Atur posisi agar tidak tertutup notch/status bar
        left: 16,
        zIndex: 1001,
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
    },
    hamburgerIcon: {
        width: 24,
        height: 20,
        justifyContent: 'space-between',
    },
    line: {
        width: 24,
        height: 3,
        backgroundColor: '#FFD700', // Warna emas
        borderRadius: 2,
    },
    
    // --- BACKDROP ---
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 1)', // Lebih gelap untuk bioskop
        zIndex: 999,
    },
    
    // --- SIDEBAR CONTAINER ---
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 280,
        height: '100%',
        backgroundColor: '#2C2C2C', // Warna gelap
        paddingTop: 0,
        flexDirection: 'column',
        zIndex: 1000,
        // Shadow yang lebih menonjol
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 15,
    },
    
    // --- HEADER ---
    header: {
        paddingHorizontal: 20,
        paddingTop: 60, // Padding atas agar di bawah notch
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.15)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E1E1E', // Header sedikit lebih gelap
    },
    logo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFD700', // Aksen emas
        flex: 1,
    },
    closeBtn: {
        fontSize: 28,
        color: '#fff',
        fontWeight: '200',
    },
    
    // --- MENU ITEMS ---
    menu: {
        flex: 1,
        paddingTop: 10,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginHorizontal: 10,
        borderRadius: 8,
        marginBottom: 5,
        transitionDuration: '150ms',
    },
    navItemActive: {
        backgroundColor: 'rgba(231, 76, 60, 0.2)', // Merah transparan
        borderLeftWidth: 3,
        borderLeftColor: '#E74C3C', // Garis merah
    },
    navIcon: {
        fontSize: 22,
        marginRight: 15,
    },
    navLabel: {
        fontSize: 16,
        color: '#ccc',
        fontWeight: '500',
    },
    navLabelActive: {
        color: '#fff',
        fontWeight: '700',
    },
    
    // --- FOOTER/LOGOUT ---
    footer: {
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        backgroundColor: '#1E1E1E', // Footer sedikit lebih gelap
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(231, 76, 60, 0.1)', // Merah muda untuk tombol logout
    },
    logoutIcon: {
        fontSize: 20,
        marginRight: 15,
    },
    logoutLabel: {
        fontSize: 16,
        color: '#E74C3C', // Label logout berwarna merah
        fontWeight: '600',
    },
});