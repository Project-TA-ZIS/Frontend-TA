import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import LaporanZisAnggota from "./pages/anggota/LaporanZisAnggota";
import AmilLayout from "./components/layout/AmilLayout";
import DashboardAmil from "./pages/Amil/DashboardAmil";
import KelolaZis from "./pages/Amil/KelolaZis";
import KelolaMuzzaki from "./pages/Amil/KelolaMuzzaki";
import KelolaMustahik from "./pages/Amil/KelolaMustahik";
import PengaturanAmil from "./pages/Amil/PengaturanAmil";
import PengaturanKoordinator from "./pages/koordinator/PengaturanKoordinator";
import PengaturanAnggota from "./pages/anggota/PengaturanAnggota";
import KelolaKas from "./pages/koordinator/KelolaKas";
import Home from "./pages/publik/Home";
import Dashboard from "./pages/publik/Dashboard";
import ManajemenZis from "./pages/publik/ManajemenZis";
import LupaPassword from "./pages/auth/LupaPassword";
import Footer from "./components/layout/Footer";
import NotFound from "./components/shared/NotFound";

// Daftar nama peran (role) sesuai data dari backend. Dipakai untuk membatasi
// akses tiap rute lewat <ProtectedRoute allowedRoles={[...]}>.
const ROLE = {
  KOORDINATOR: "penanggung jawab dasawisma",
  ANGGOTA: "kader dasawisma",
  AMIL: "amil zakat",
};

// Komponen pembungkus yang menjaga sesi login tetap valid selama aplikasi dibuka.
// Saat ada token: memuat data user, lalu memvalidasi sesi secara berkala.
function AuthBootstrapper({ children }) {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const setBootstrapping = useAuthStore((s) => s.setBootstrapping);

  // EFEK 1: saat pertama buka / token berubah → ambil data user dari server.
  useEffect(() => {
    // Penanda agar update state dibatalkan bila komponen sudah unmount.
    let cancelled = false;

    async function bootstrap() {
      if (!token) return; // tidak login → tidak perlu ambil data

      setBootstrapping(true); // tandai sedang memuat (dipakai ProtectedRoute)

      try {
        const me = await getMe();
        if (!cancelled) {
          setUser(me?.user || null);
        }
      } catch {
        // Error (mis. token invalid) sudah ditangani interceptor di api.js
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
        }
      }
    }

    bootstrap();

    // Cleanup: tandai dibatalkan jika komponen unmount sebelum selesai.
    return () => {
      cancelled = true;
    };
  }, [token, setUser, setBootstrapping]);

  // EFEK 2: validasi sesi secara berkala selama user login.
  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    // Ambil ulang data user untuk memastikan token masih berlaku.
    const validate = async () => {
      try {
        const me = await getMe();
        if (!cancelled) {
          setUser(me?.user || null);
        }
      } catch {
        // Biarkan interceptor yang handle (auto-logout bila 401/403).
      }
    };

    // Validasi otomatis tiap 60 detik.
    const intervalId = window.setInterval(validate, 60_000);
    // Validasi juga setiap user kembali membuka tab aplikasi.
    const onVisibility = () => {
      if (document.visibilityState === "visible") validate();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Cleanup: hentikan interval & lepas event listener saat unmount.
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [token, setUser]);

  return children;
}

// Komponen utama aplikasi: mendefinisikan seluruh rute (routing) dan
// mengelompokkannya per peran (koordinator, anggota, amil, publik).
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
            path="/anggota/laporan-zis"
            element={
              <ProtectedRoute allowedRoles={[ROLE.ANGGOTA]}>
                <AnggotaLayout>
                  <LaporanZisAnggota />
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

          {/* RESET PASSWORD */}
          <Route path="/resetPassword/:token" element={<LupaPassword />} />

          {/* 404 Not Found */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthBootstrapper>
    </Router>
  );
}

export default App;
