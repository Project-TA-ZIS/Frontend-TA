import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('dasawisma_token') || null, // Cek token di memori browser
  
  // Fungsi untuk menyimpan data saat login sukses
  setLogin: (userData, token) => {
    localStorage.setItem('dasawisma_token', token);
    set({ user: userData, token: token });
  },
  
  // Fungsi untuk menghapus data saat logout
  setLogout: () => {
    localStorage.removeItem('dasawisma_token');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;