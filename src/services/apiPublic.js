import axios from 'axios';

// Ambil URL backend dari environment (.env). Jika kosong, pakai localhost:3000.
const API_BASE_URL =
	import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3000';

// Instance Axios untuk endpoint PUBLIK (TANPA token) — dipakai untuk data yang
// boleh diakses tanpa login, mis. daftar muzakki/mustahik & total ZIS publik.
export const apiPublic = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

export default apiPublic;
