import { Route, Routes } from "react-router";
import React from "react";
import "./App.css";

import {
  ProtectedRoute,
  GuestRoute,
} from "./components/ProtectedRoute/ProtectedRoute";

//landing pages
import LandingPage from "./pages/landing/LandingPage";
//auth
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
//user
import UserLayout from "./components/user/LayoutUser";
import DashboardUser from "./pages/user/DashboardUser";
import EditProfile from "./pages/user/EditProfile";
import Verifikasi from "./pages/user/Verifikasi";
import Pembayaran from "./pages/user/Pembayaran";
import PembayaranQr from "./pages/user/PembayaranQr";
import PembayaranBukti from "./pages/user/PembayaranBukti";
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
import TimelineAdmin from "./pages/admin/TimelineAdmin";
import VerifikasiAdmin from "./pages/admin/VerifikasiAdmin";
import PembayaranAdmin from "./pages/admin/PembayaranAdmin";
import UjianAdmin from "./pages/admin/UjianAdmin";
import HasilUjianAdmin from "./pages/admin/PengumpulanUjianAdmin";
import AbsensiAdmin from "./pages/admin/AbsensiAdmin";
import ListAbsensiAdmin from "./pages/admin/ListAbsensiAdmin";
import AddAbsensiAdmin from "./pages/admin/AddAbsensiAdmin";
import AbsensiEditAdmin from "./pages/admin/AbsensiEditAdmin";
import AbsensiScanAdmin from "./pages/admin/AbsensiScanAdmin";
import MateriAdmin from "./pages/admin/Materi";
import AddMateriAdmin from "./pages/admin/AddMateriAdmin";
import TugasAdmin from "./pages/admin/TugasAdmin";
import AddTugasAdmin from "./pages/admin/TambahTugasAdmin";
import PengumpulanTugasAdmin from "./pages/admin/PengumpulanTugasAdmin";

function App() {
  return (
    <Routes>
      {/* ===== PUBLIC ===== */}
      <Route path="/" element={<LandingPage />} />

      {/* ===== GUEST ONLY (redirect jika sudah login) ===== */}
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      {/* ===== USER ROUTES (hanya role USER) ===== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <DashboardUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editprofil"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verifikasi"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <Verifikasi />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pembayaran"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <Pembayaran />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pembayaran/qr"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <PembayaranQr />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pembayaran/bukti"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <PembayaranBukti />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ujian"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <Ujian />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ujianpengerjaan"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <UjianPengerjaan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ujianhasil"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <UjianHasil />
          </ProtectedRoute>
        }
      />
      <Route
        path="/absensi"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <Absensi />
          </ProtectedRoute>
        }
      />
      <Route
        path="/materi"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <Materi />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tugas"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <Tugas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pengumpulan"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <TugasKumpul />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listtugas"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <TugasCek />
          </ProtectedRoute>
        }
      />

      {/* ===== ADMIN ROUTES (hanya role ADMIN) ===== */}
      <Route path="/admin">
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="timeline"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <TimelineAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="verifikasi"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <VerifikasiAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="pembayaran"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PembayaranAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="ujian"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UjianAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="pengumpulanujian"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <HasilUjianAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="listabsensi"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ListAbsensiAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="absensi"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AbsensiAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="addabsensi"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AddAbsensiAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="absensi/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AbsensiEditAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/absensi/:id/scan"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AbsensiScanAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="materi"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <MateriAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="materi/add"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AddMateriAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="tugas"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <TugasAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="tugas/add"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AddTugasAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="kumpultugas"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PengumpulanTugasAdmin />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
