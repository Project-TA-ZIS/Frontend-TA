import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL =
	import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3000';

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

let isAuthAlertShowing = false;

function getStoredToken() {
	return (
		localStorage.getItem('dasawisma_token') ||
		localStorage.getItem('token') ||
		null
	);
}

api.interceptors.request.use((config) => {
	const token = getStoredToken();
	if (token) {
		config.headers = config.headers ?? {};
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

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
						text: 'Token login sudah expired / tidak valid. Silakan login ulang.',
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
		return Promise.reject(error);
	},
);

export default api;
