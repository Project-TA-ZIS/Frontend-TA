import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import useAuthStore from "./store/useAuthStore";
import { getMe } from "./services/auth.service";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardUtama from "./pages/koordinator/DashboardUtama";
import LaporanZIS from "./pages/koordinator/LaporanZIS";
import AnggotaDasawisma from "./pages/koordinator/AnggotaDasawisma";
import AnggotaAmil from "./pages/koordinator/AnggotaAmil";
import AnggotaLayout from "./components/layout/AnggotaLayout";
import DashboardAnggota from "./pages/anggota/DashboardAnggota";
import LaporanKasAnggota from "./pages/anggota/LaporanKasAnggota";
import AmilLayout from "./components/layout/AmilLayout";
import DashboardAmil from "./pages/Amil/DashboardAmil";
import KelolaZis from "./pages/Amil/KelolaZis";
import KelolaMuzzaki from "./pages/Amil/KelolaMuzzaki";
import KelolaMustahik from "./pages/Amil/KelolaMustahik";
import PengaturanAmil from "./pages/Amil/PengaturanAmil";
import PengaturanKoordinator from "./pages/koordinator/PengaturanKoordinator";
import PengaturanAnggota from "./pages/anggota/PengaturanAnggota";
import KelolaKas from "./pages/koordinator/KelolaKas";
import Home from './pages/publik/Home';
import Dashboard from "./pages/publik/Dashboard";
import ManajemenZis from "./pages/publik/ManajemenZis";
import Footer from "./components/layout/Footer";

const ROLE = {
  KOORDINATOR: "koordinator dasawisma",
  ANGGOTA: "anggota dasawisma",
  AMIL: "amil zakat",
};

function AuthBootstrapper({ children }) {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const setBootstrapping = useAuthStore((s) => s.setBootstrapping);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!token) return;

      setBootstrapping(true);

      try {
        const me = await getMe();
        if (!cancelled) {
          setUser(me?.user || null);
        }
      } catch {
        // handled by interceptor
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [token, setUser, setBootstrapping]);

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
        // Biarkan interceptor yang handle
      }
    };

    const intervalId = window.setInterval(validate, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") validate();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [token, setUser]);

  return children;
}

function App() {
  return (
    <Router>
      <AuthBootstrapper>
        <Routes>
          {/* RUTE AUTENTIKASI */}
          <Route path="/login" element={<Login />} />

          {/* === RUTE INTERNAL KOORDINATOR === */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLE.KOORDINATOR]}>
                <DashboardLayout>
                  <DashboardUtama />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/kelola-kas"
            element={
              <ProtectedRoute allowedRoles={[ROLE.KOORDINATOR]}>
                <DashboardLayout>
                  <KelolaKas />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/laporan-zis"
            element={
              <ProtectedRoute allowedRoles={[ROLE.KOORDINATOR]}>
                <DashboardLayout>
                  <LaporanZIS />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/anggota-dasawisma"
            element={
              <ProtectedRoute allowedRoles={[ROLE.KOORDINATOR]}>
                <DashboardLayout>
                  <AnggotaDasawisma />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/anggota-amil"
            element={
              <ProtectedRoute allowedRoles={[ROLE.KOORDINATOR]}>
                <DashboardLayout>
                  <AnggotaAmil />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pengaturan"
            element={
              <ProtectedRoute allowedRoles={[ROLE.KOORDINATOR]}>
                <DashboardLayout>
                  <PengaturanKoordinator />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* === RUTE INTERNAL ANGGOTA === */}
          <Route
            path="/anggota/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLE.ANGGOTA]}>
                <AnggotaLayout>
                  <DashboardAnggota />
                </AnggotaLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/anggota/laporan-kas"
            element={
              <ProtectedRoute allowedRoles={[ROLE.ANGGOTA]}>
                <AnggotaLayout>
                  <LaporanKasAnggota />
                </AnggotaLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/anggota/pengaturan"
            element={
              <ProtectedRoute allowedRoles={[ROLE.ANGGOTA]}>
                <AnggotaLayout>
                  <PengaturanAnggota />
                </AnggotaLayout>
              </ProtectedRoute>
            }
          />

          {/* === RUTE INTERNAL AMIL === */}
          <Route
            path="/amil/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLE.AMIL]}>
                <AmilLayout>
                  <DashboardAmil />
                </AmilLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/amil/kelola-zis"
            element={
              <ProtectedRoute allowedRoles={[ROLE.AMIL]}>
                <AmilLayout>
                  <KelolaZis />
                </AmilLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/amil/kelola-muzzaki"
            element={
              <ProtectedRoute allowedRoles={[ROLE.AMIL]}>
                <AmilLayout>
                  <KelolaMuzzaki />
                </AmilLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/amil/kelola-mustahik"
            element={
              <ProtectedRoute allowedRoles={[ROLE.AMIL]}>
                <AmilLayout>
                  <KelolaMustahik />
                </AmilLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/amil/pengaturan"
            element={
              <ProtectedRoute allowedRoles={[ROLE.AMIL]}>
                <AmilLayout>
                  <PengaturanAmil />
                </AmilLayout>
              </ProtectedRoute>
            }
          />

          {/* === RUTE PUBLIK DEVELOPMENT === */}
          <Route path="/" element={<Home />} />
          <Route path="/dashboard-publik" element={<Dashboard />} />
          <Route path="/zis-publik" element={<ManajemenZis />} />

        </Routes>
      </AuthBootstrapper>
      <Footer />
    </Router> 
  );
}

export default App;