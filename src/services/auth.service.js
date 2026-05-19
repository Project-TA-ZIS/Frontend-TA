import api from './api';

export async function login({ email, password }) {
	const res = await api.post('/auth/post/login', { email, password });
	return res.data;
}

export async function getMe() {
	const res = await api.get('/auth/get/me');
	return res.data;
}

