import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

// Komponen pembungkus rute. Tugasnya: memastikan hanya user yang sudah login
// dan punya peran (role) yang sesuai yang boleh mengakses halaman di dalamnya.
// - children     : komponen halaman yang dilindungi.
// - allowedRoles : daftar role yang diizinkan mengakses halaman ini.
export default function ProtectedRoute({ children, allowedRoles }) {
	const location = useLocation();
	const token = useAuthStore((s) => s.token);
	const role = useAuthStore((s) => s.role);
	const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

	// 1) Belum login (tidak ada token) → tendang ke halaman login.
	if (!token) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	// Token expired/invalid akan ditangani BE + axios interceptor (401/403 -> redirect login).

	// 2) Jika halaman membatasi role tertentu, lakukan pengecekan role.
	if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
		// Saat data user masih dimuat, jangan render apa pun dulu agar tidak
		// salah menendang user yang sebenarnya berhak.
		if (isBootstrapping) {
			return null;
		}
		// Role tidak ada / tidak termasuk yang diizinkan → tendang ke login.
		if (!role || !allowedRoles.includes(role)) {
			return <Navigate to="/login" replace state={{ from: location }} />;
		}
	}

	// 3) Lolos semua pengecekan → tampilkan halaman.
	return children;
}
