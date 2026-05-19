import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function ProtectedRoute({ children, allowedRoles }) {
	const location = useLocation();
	const token = useAuthStore((s) => s.token);
	const role = useAuthStore((s) => s.role);
	const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

	if (!token) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	// Token expired/invalid akan ditangani BE + axios interceptor (401/403 -> redirect login).

	if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
		if (isBootstrapping) {
			return null;
		}
		if (!role || !allowedRoles.includes(role)) {
			return <Navigate to="/login" replace state={{ from: location }} />;
		}
	}

	return children;
}

