import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
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
// 1. Tambahkan import komponen baru di sini
import KelolaKas from './pages/koordinator/KelolaKas'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={
          <DashboardLayout>
            <DashboardUtama />
          </DashboardLayout>
        } />

        {/* 2. Tambahkan rute untuk Kelola Kas di dalam Layout yang sama */}
        <Route path="/kelola-kas" element={
          <DashboardLayout>
            <KelolaKas />
          </DashboardLayout>
        } />

        <Route path="/laporan-zis" element={
          <DashboardLayout>
            <LaporanZIS />
          </DashboardLayout>
        } />

        <Route path="/anggota-dasawisma" element={
          <DashboardLayout>
            <AnggotaDasawisma />
          </DashboardLayout>
        } />

        <Route path="/anggota-amil" element={
          <DashboardLayout>
            <AnggotaAmil />
          </DashboardLayout>
        } />

        {/* === RUTE KHUSUS ANGGOTA === */}
        <Route path="/anggota/dashboard" element={
          <AnggotaLayout>
            <DashboardAnggota />
          </AnggotaLayout>
        } />

        <Route path="/anggota/laporan-kas" element={
          <AnggotaLayout>
            <LaporanKasAnggota />
          </AnggotaLayout>
        } />

        {/* === RUTE KHUSUS AMIL === */}
        <Route path="/amil/dashboard" element={
          <AmilLayout>
            <DashboardAmil />
          </AmilLayout>
        } />

        <Route path="/amil/kelola-zis" element={
          <AmilLayout>
            <KelolaZis />
          </AmilLayout>
        } />

        <Route path="/amil/kelola-muzzaki" element={
          <AmilLayout>
            <KelolaMuzzaki />
          </AmilLayout>
        } />

        <Route path="/amil/kelola-mustahik" element={
          <AmilLayout>
            <KelolaMustahik />
          </AmilLayout>
        } />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;