import { Route, Routes } from "react-router";
import React from "react";
import "./App.css";

import PurpleBlobBackground from "./pages/tes/tes";
import Tes from "./pages/tes/tes2";

//landing pages
import LandingPage from "./pages/landing/LandingPage";
//auth
import Register from "./pages/auth/register";
import Login from "./pages/auth/login";
//user
import UserLayout from "./components/user/LayoutUser";
import DashboardUser from "./pages/user/DashboardUser";
import EditProfile from "./pages/user/EditProfile";
import Verifikasi from "./pages/user/Verifikasi";
import Pembayaran from "./pages/user/Pembayaran";
import Ujian from "./pages/user/Ujian";
import UjianPengerjaan from "./pages/user/UjianPengerjaan";
import UjianHasil from "./pages/user/UjianHasil";
import Absensi from "./pages/user/Absensi";
import Materi from "./pages/user/Materi";
import Tugas from "./pages/user/Tugas";
import TugasKumpul from "./pages/user/TugasKumpul";
import TugasCek from "./pages/user/TugasCek";

//admin
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import VerifikasiAdmin from "./pages/admin/VerifikasiAdmin";
import PembayaranAdmin from "./pages/admin/Pembayaran";
import UjianAdmin from "./pages/admin/UjianAdmin";
import HasilUjianAdmin from "./pages/admin/PengumpulanUjianAdmin";
import AbsensiAdmin from "./pages/admin/Absensi";
import ListAbsensiAdmin from "./pages/admin/ListAbsensiAdmin";
import MateriAdmin from "./pages/admin/MateriAdmin";
import TugasAdmin from "./pages/admin/TugasAdmin";
import AddTugasAdmin from "./pages/admin/TambahTugasAdmin";
import PengumpulanTugasAdmin from "./pages/admin/PengumpulanTugasAdmin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/tes" element={<tes />} />
      <Route path="/tes2" element={<PurpleBlobBackground />} />

      {/* user */}
      <Route>
        <Route path="/dashboard" element={<DashboardUser />} />
        <Route path="/editprofil" element={<EditProfile />} />
        <Route path="/verifikasi" element={<Verifikasi />} />
        <Route path="/pembayaran" element={<Pembayaran />} />
        <Route path="/ujian" element={<Ujian />} />
        <Route path="/ujianpengerjaan" element={<UjianPengerjaan />} />
        <Route path="/ujianhasil" element={<UjianHasil />} />
        <Route path="/absensi" element={<Absensi />} />
        <Route path="/materi" element={<Materi />} />
        <Route path="/tugas" element={<Tugas />} /> 
        
        <Route path="/pengumpulan" element={<TugasKumpul />} />
        <Route path="/listtugas" element={<TugasCek />} />
      </Route>

      {/* admin */}
      <Route path="/admin">
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="verifikasi" element={<VerifikasiAdmin />} />
        <Route path="pembayaran" element={<PembayaranAdmin />} />
        <Route path="ujian" element={<UjianAdmin />} />
        <Route path="pengumpulanujian" element={<HasilUjianAdmin />} />
        <Route path="listabsensi" element={<AbsensiAdmin />} />
        <Route path="absensi" element={<ListAbsensiAdmin />} />
        <Route path="materi" element={<MateriAdmin />} />
        <Route path="tugas" element={<TugasAdmin />} />
        <Route path="tugas/add" element={<AddTugasAdmin />} />
        <Route path="kumpultugas" element={<PengumpulanTugasAdmin />} />
        
        
      </Route>
      
    </Routes>
  );
}

export default App;
