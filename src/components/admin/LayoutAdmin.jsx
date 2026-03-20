import circlePurple from "../../assets/images/Bulat_Ungu.png";
import logoORWhite from "../../assets/images/Logo_OR_White.png";
import { Link } from "react-router-dom";
import SidebarAdmin from "./SidebarAdmin";
import { LogOut } from "lucide-react";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen  bg-[#1a0023] text-white overflow-hidden relative">
      {/* ================= BACKGROUND ================= */}

      {/* Circle Ungu */}
      <img
        src={circlePurple}
        alt=""
        className="absolute -top-20 left-1/3 w-[300px] "
      />
      <img
        src={circlePurple}
        alt=""
        className="absolute -bottom-20 left-1/4 "
      />
      <img src={circlePurple} alt="" className="absolute top-1/3 -right-10" />

      {/* Glow Biru kanan bawah */}
      <div className="absolute -bottom-40 -right-40 w-[300px] h-[300px] bg-[#01FFFF] blur-[80px] rounded-full" />

      {/* ================= SIDEBAR ================= */}
      <aside className="fixed top-0 left-0 h-screen w-[260px] bg-[#501A5E] flex flex-col justify-between py-4 px-6 z-20 shadow-xl">
        {/* Logo */}
        <div>
          <div className="mb-6">
            <img src={logoORWhite} alt="logo" className="w-[160px]" />
          </div>

          {/* Menu */}
          <nav className="flex flex-col gap-2 text-sm mb-6">
            <SidebarAdmin to="/admin/dashboard" label="Dashboard" />

            <SidebarAdmin to="/admin/verifikasi" label="Verifikasi" />
            <SidebarAdmin to="/admin/pembayaran" label="Pembayaran" />
            <SidebarAdmin to="/admin/ujian" label="Ujian" />
            <SidebarAdmin
              to="/admin/pengumpulanujian"
              label="Pengumpulan Ujian"
            />
            <SidebarAdmin to="/admin/listabsensi" label="List Absensi" />
            <SidebarAdmin to="/admin/absensi" label="Absensi" />
            <SidebarAdmin to="/admin/materi" label="Materi" />
            <SidebarAdmin to="/admin/tugas" label="Tugas" />
            <SidebarAdmin to="/admin/kumpultugas" label="Pengumpulan Tugas" />
          </nav>
        </div>

        {/* Logout */}
        <button className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100 transition">
          <LogOut size={18} />
          Keluar
        </button>
      </aside>

      {/* ================= CONTENT ================= */}
      <main className="ml-[260px] h-screen overflow-y-auto flex-1 relative z-10">
        {children}
      </main>
    </div>
  );
}

/* ================= COMPONENT ITEM ================= */
function SidebarItem({ icon, label, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition
      ${active ? "bg-[#6A1B7A]" : "hover:bg-[#5c206b]"}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
