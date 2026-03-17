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
import TugasDetail from "./pages/user/TugasDetail";
import TugasKumpul from "./pages/user/TugasKumpul";
import TugasCek from "./pages/user/TugasCek";
//admin

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/tes" element={<tes />} />
      <Route path="/tes2" element={<PurpleBlobBackground />} />

      <Route>
        <Route path="/dashboard" element={<DashboardUser />} />
        <Route path="/editprofile" element={<EditProfile />} />

        <Route path="/verifikasi" element={<Verifikasi />} />
        <Route path="/pembayaran" element={<Pembayaran />} />
        <Route path="/ujian" element={<Ujian />} />
        <Route path="/ujianpengerjaan" element={<UjianPengerjaan />} />
        <Route path="/ujianhasil" element={<UjianHasil />} />
        <Route path="/absensi" element={<Absensi />} />
        <Route path="/materi" element={<Materi />} />
        <Route path="/tugas" element={<Tugas />} /> 
        <Route path="/tugasdetail" element={<TugasDetail />} /> 
        <Route path="/pengumpulan" element={<TugasKumpul />} />
        <Route path="/listtugas" element={<TugasCek />} />

      </Route>
    </Routes>
  );
}

export default App;
