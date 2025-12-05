import api from '@/constants/api';
import { Cafe, Film, Makanan, Pemesanan } from '@/types';

// ========== FILM SERVICES ==========
export const filmService = {
  async getFilms(p0: string): Promise<Film[]> {
    try {
      const response = await api.get('film.php');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching films:', error);
      throw error;
    }
  },

  async getFilmDetail(filmId: string): Promise<Film> {
    try {
      const response = await api.get('film.php', { params: { film_id: filmId } });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching film detail:', error);
      throw error;
    }
  },
};

// ========== CAFE SERVICES ==========
export const cafeService = {
  async getCafes(): Promise<Cafe[]> {
    try {
      const response = await api.get('cafe.php');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching cafes:', error);
      throw error;
    }
  },

  async getCafeDetail(cafeId: string): Promise<Cafe> {
    try {
      const response = await api.get('cafe.php', { params: { cafe_id: cafeId } });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching cafe detail:', error);
      throw error;
    }
  },
};

// ========== MAKANAN SERVICES ==========
export const makananService = {
  async getMakananByCafe(cafeId: string): Promise<Makanan[]> {
    try {
      const response = await api.get('makanan.php', { params: { cafe_id: cafeId } });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching makanan:', error);
      throw error;
    }
  },
};

// ========== PEMESANAN SERVICES ==========
export const pemesananService = {
  async createPemesanan(data: Partial<Pemesanan>): Promise<any> {
    try {
      const response = await api.post('pemesanan.php', data);
      return response.data;
    } catch (error) {
      console.error('Error creating pemesanan:', error);
      throw error;
    }
  },

  async getPemesananByUser(userId: string): Promise<Pemesanan[]> {
    try {
      const response = await api.get('pemesanan.php', { params: { user_id: userId } });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching pemesanan:', error);
      throw error;
    }
  },

  async getPemesananDetail(pemesananId: string): Promise<Pemesanan> {
    try {
      const response = await api.get('pemesanan.php', { params: { pemesanan_id: pemesananId } });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching pemesanan detail:', error);
      throw error;
    }
  },

  async cancelPemesanan(pemesananId: string): Promise<any> {
    try {
      const response = await api.post('pemesanan.php', {
        action: 'cancel',
        pemesanan_id: pemesananId,
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling pemesanan:', error);
      throw error;
    }
  },
};
