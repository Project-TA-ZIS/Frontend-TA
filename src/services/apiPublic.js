import axios from 'axios';

const API_BASE_URL =
	import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3000';

// Instance untuk public endpoints (TANPA token)
export const apiPublic = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

export default apiPublic;
