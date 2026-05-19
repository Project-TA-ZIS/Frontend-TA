import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import ProtectedRoute from './routes/ProtectedRoute';
import useAuthStore from './store/useAuthStore';
import { getMe } from './services/auth.service';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardUtama from './pages/koordinator/DashboardUtama';
import LaporanZIS from './pages/koordinator/LaporanZIS';
import AnggotaDasawisma from './pages/koordinator/AnggotaDasawisma';
import AnggotaAmil from './pages/koordinator/AnggotaAmil';
import AnggotaLayout from './components/layout/AnggotaLayout';
import DashboardAnggota from './pages/anggota/DashboardAnggota';
import LaporanKasAnggota from './pages/anggota/LaporanKasAnggota';
import AmilLayout from './components/layout/AmilLayout';
import DashboardAmil from './pages/amil/DashboardAmil';
import KelolaZis from './pages/amil/KelolaZis';
import KelolaMuzzaki from './pages/amil/KelolaMuzzaki';
import KelolaMustahik from './pages/amil/KelolaMustahik';
import PengaturanAmil from './pages/amil/PengaturanAmil';
import PengaturanKoordinator from './pages/koordinator/PengaturanKoordinator'; // Atau sesuaikan dengan struktur folder Anda
import PengaturanAnggota from './pages/anggota/PengaturanAnggota';
// 1. Tambahkan import komponen baru di sini
import KelolaKas from './pages/koordinator/KelolaKas'; 

const ROLE = {
  KOORDINATOR: 'koordinator dasawisma',
  ANGGOTA: 'anggota dasawisma',
  AMIL: 'amil zakat',
};

function AuthBootstrapper({ children }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setBootstrapping = useAuthStore((s) => s.setBootstrapping);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!token || user) return;
      setBootstrapping(true);
      try {
        const me = await getMe();
        if (!cancelled) {
          setUser(me?.user || null);
        }
      } catch {
        // Jika token invalid/expired, interceptor akan menampilkan Swal + redirect login.
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [token, user, setUser, setBootstrapping]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const validate = async () => {
      try {
        const me = await getMe();
        if (!cancelled) {
          setUser(me?.user || null);
        }
      } catch {
        // Biarkan interceptor yang handle (Swal + redirect).
      }
    };

    // Validasi berkala supaya token expired di tengah sesi ter-detect.
    const intervalId = window.setInterval(validate, 60_000);
    // Juga validasi saat tab kembali aktif.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') validate();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [token, setUser]);

  return children;
}

function App() {
  return (
    <Router>
      <AuthBootstrapper>
        <Routes>
          <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={[ROLE.KOORDINATOR]}>
            <DashboardLayout>
              <DashboardUtama />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* 2. Tambahkan rute untuk Kelola Kas di dalam Layout yang sama */}
        <Route path="/kelola-kas" element={
          <ProtectedRoute allowedRoles={[ROLE.KOORDINATOR]}>
            <DashboardLayout>
              <KelolaKas />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/laporan-zis" element={
          <ProtectedRoute allowedRoles={[ROLE.KOORDINATOR]}>
            <DashboardLayout>
              <LaporanZIS />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/anggota-dasawisma" element={
          <ProtectedRoute allowedRoles={[ROLE.KOORDINATOR]}>
            <DashboardLayout>
              <AnggotaDasawisma />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/anggota-amil" element={
          <ProtectedRoute allowedRoles={[ROLE.KOORDINATOR]}>
            <DashboardLayout>
              <AnggotaAmil />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* === RUTE KHUSUS ANGGOTA === */}
        <Route path="/anggota/dashboard" element={
          <ProtectedRoute allowedRoles={[ROLE.ANGGOTA]}>
            <AnggotaLayout>
              <DashboardAnggota />
            </AnggotaLayout>
          </ProtectedRoute>
        } />

        <Route path="/anggota/laporan-kas" element={
          <ProtectedRoute allowedRoles={[ROLE.ANGGOTA]}>
            <AnggotaLayout>
              <LaporanKasAnggota />
            </AnggotaLayout>
          </ProtectedRoute>
        } />

        {/* === RUTE KHUSUS AMIL === */}
        <Route path="/amil/dashboard" element={
          <ProtectedRoute allowedRoles={[ROLE.AMIL]}>
            <AmilLayout>
              <DashboardAmil />
            </AmilLayout>
          </ProtectedRoute>
        } />

        <Route path="/amil/kelola-zis" element={
          <ProtectedRoute allowedRoles={[ROLE.AMIL]}>
            <AmilLayout>
              <KelolaZis />
            </AmilLayout>
          </ProtectedRoute>
        } />

        <Route path="/amil/kelola-muzzaki" element={
          <ProtectedRoute allowedRoles={[ROLE.AMIL]}>
            <AmilLayout>
              <KelolaMuzzaki />
            </AmilLayout>
          </ProtectedRoute>
        } />

        <Route path="/amil/kelola-mustahik" element={
          <ProtectedRoute allowedRoles={[ROLE.AMIL]}>
            <AmilLayout>
              <KelolaMustahik />
            </AmilLayout>
          </ProtectedRoute>
        } />

        <Route path="/amil/pengaturan" element={
          <ProtectedRoute allowedRoles={[ROLE.AMIL]}>
            <AmilLayout>
              <PengaturanAmil />
            </AmilLayout>
          </ProtectedRoute>
        } />

        <Route path="/pengaturan" element={
          <ProtectedRoute allowedRoles={[ROLE.KOORDINATOR]}>
            <DashboardLayout> 
              <PengaturanKoordinator />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/anggota/pengaturan" element={
          <ProtectedRoute allowedRoles={[ROLE.ANGGOTA]}>
            <AnggotaLayout>
              <PengaturanAnggota />
            </AnggotaLayout>
          </ProtectedRoute>
        } />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthBootstrapper>
    </Router>
  );
}

export default App;