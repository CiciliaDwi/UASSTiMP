export interface User {
  user_id: string;
  user_name: string;
  user_saldo: number;
}

export interface Film {
  film_id: string;
  film_judul: string;
  film_sinopsis: string;
  film_durasi: number;
  film_genre: string;
  film_tahun: number;
}

export interface Cafe {
  cafe_id: string;
  cafe_nama: string;
  cafe_lokasi: string;
  cafe_jam_buka: string;
  cafe_jam_tutup: string;
}

export interface Pemesanan {
  pemesanan_id: string;
  user_id: string;
  film_id: string;
  cafe_id: string;
  pemesanan_tanggal: string;
  pemesanan_jam: string;
  pemesanan_jumlah_kursi: number;
  pemesanan_harga_total: number;
  pemesanan_status: 'pending' | 'confirmed' | 'cancelled';
}

export interface Makanan {
  makanan_id: string;
  makanan_nama: string;
  makanan_harga: number;
  makanan_kategori: string;
}
