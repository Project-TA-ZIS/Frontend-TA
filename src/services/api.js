import axios from 'axios';
import Swal from 'sweetalert2';

// Ambil URL backend dari environment (.env). Jika kosong, pakai localhost:3000.
const API_BASE_URL =
	import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3000';

// Instance Axios utama untuk endpoint yang BUTUH login (membawa token).
export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Penanda agar popup "Sesi Berakhir" tidak muncul berkali-kali sekaligus.
let isAuthAlertShowing = false;

// Ambil token dari localStorage (mendukung kunci baru & kunci lama).
function getStoredToken() {
	return (
		localStorage.getItem('dasawisma_token') ||
		localStorage.getItem('token') ||
		null
	);
}

// REQUEST INTERCEPTOR: dijalankan sebelum setiap request dikirim.
// Tugasnya menyisipkan header Authorization: Bearer <token> secara otomatis.
api.interceptors.request.use((config) => {
	const token = getStoredToken();
	if (token) {
		config.headers = config.headers ?? {};
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// RESPONSE INTERCEPTOR: dijalankan untuk setiap response yang diterima.
// Jika server membalas 401/403 (token tidak valid/kadaluarsa), user dipaksa
// logout: hapus token, tampilkan peringatan, lalu arahkan ke halaman login.
api.interceptors.response.use(
	(response) => response,
	(error) => {
		const status = error?.response?.status;
		if (status === 401 || status === 403) {
			localStorage.removeItem('dasawisma_token');
			localStorage.removeItem('token');
			localStorage.removeItem('dasawisma_user');
			// Interceptor tidak bisa pakai hook router; pakai hard redirect.
			if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
				if (!isAuthAlertShowing) {
					isAuthAlertShowing = true;
					Swal.fire({
						title: 'Sesi Berakhir',
						text: 'Silakan login ulang.',
						icon: 'warning',
						confirmButtonText: 'Login',
						confirmButtonColor: '#10B981',
						allowOutsideClick: false,
						allowEscapeKey: false,
					}).finally(() => {
						isAuthAlertShowing = false;
						window.location.assign('/login');
					});
				} else {
					window.location.assign('/login');
				}
			}
		}
		// Lempar lagi error agar bisa ditangani oleh pemanggil (try/catch).
		return Promise.reject(error);
	},
);

export default api;
