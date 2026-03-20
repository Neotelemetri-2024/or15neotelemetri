import circlePurple from "../../assets/images/Bulat_Ungu.png";
import logoORWhite from "../../assets/images/Logo_OR_White.png";
import SidebarAdmin from "./SidebarAdmin";
import { useState, useEffect } from "react";
import {
  Menu, X, LogOut,
  LayoutDashboard, ShieldCheck, CreditCard,
  FileText, ClipboardList, CalendarCheck, 
  BookOpen, ListTodo, PackageCheck,
} from "lucide-react";

const menuItems = [
  { to: "/admin/dashboard",        icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { to: "/admin/verifikasi",       icon: <ShieldCheck size={18} />,     label: "Verifikasi" },
  { to: "/admin/pembayaran",       icon: <CreditCard size={18} />,      label: "Pembayaran" },
  { to: "/admin/ujian",            icon: <FileText size={18} />,        label: "Ujian" },
  { to: "/admin/pengumpulanujian", icon: <ClipboardList size={18} />,   label: "Pengumpulan Ujian" },
  { to: "/admin/listabsensi",      icon: <CalendarCheck size={18} />,   label: "List Absensi" },
  { to: "/admin/absensi",          icon: <CalendarCheck size={18} />,   label: "Absensi" },
  { to: "/admin/materi",           icon: <BookOpen size={18} />,        label: "Materi" },
  { to: "/admin/tugas",            icon: <ListTodo size={18} />,        label: "Tugas" },
  { to: "/admin/kumpultugas",      icon: <PackageCheck size={18} />,    label: "Pengumpulan Tugas" },
];

export default function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#1a0023] text-white overflow-hidden relative">

      {/* BACKGROUND */}
      <img src={circlePurple} alt="" className="absolute -top-20 left-1/3 w-[300px] pointer-events-none" />
      <img src={circlePurple} alt="" className="absolute -bottom-20 left-1/4 pointer-events-none" />
      <img src={circlePurple} alt="" className="absolute top-1/3 -right-10 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[300px] h-[300px] bg-[#01FFFF] blur-[80px] rounded-full pointer-events-none" />

      {/* OVERLAY — mobile only */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[25]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-[#501A5E]
          flex flex-col justify-between py-6 px-3
          transition-all duration-300 z-[30]
          ${!isMobile
            ? isOpen ? "w-[240px]" : "w-[72px]"
            : isMobileOpen ? "w-[240px] translate-x-0" : "-translate-x-full w-[240px]"
          }
        `}
      >
        {/* LOGO */}
        <div className="overflow-hidden">
          <div className="mb-8 flex justify-center items-center min-h-[40px]">
            {!isMobile && !isOpen ? (
              <img src={logoORWhite} alt="logo" className="w-[32px] h-[32px] object-contain" />
            ) : (
              <img src={logoORWhite} alt="logo" className="w-[140px]" />
            )}
          </div>

          {/* MENU */}
          <nav className="flex flex-col gap-2 text-sm">
            {menuItems.map((item) => (
              <SidebarAdmin
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isOpen={isMobile ? true : isOpen}
              />
            ))}
          </nav>
        </div>

        {/* LOGOUT */}
        <button className={`flex items-center gap-3 text-sm opacity-80 hover:opacity-100 transition px-2
          ${(!isMobile && !isOpen) ? "justify-center" : "justify-start"}`}
        >
          <LogOut size={18} className="shrink-0" />
          {(isMobile || isOpen) && <span>Keluar</span>}
        </button>
      </aside>

      {/* HAMBURGER — floating */}
      <button
        onClick={() => isMobile ? setIsMobileOpen((p) => !p) : setIsOpen((p) => !p)}
        className="fixed z-[35] top-4 bg-white/10 backdrop-blur p-2 rounded-lg hover:bg-white/20 transition"
        style={{
          left: !isMobile ? (isOpen ? "256px" : "88px") : "16px",
          transition: "left 0.3s ease",
        }}
      >
        {isMobile && isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* CONTENT */}
      <main
        className={`
          flex-1 relative z-10 transition-all duration-300 min-w-0
          ${!isMobile
            ? isOpen ? "ml-[240px]" : "ml-[72px]"
            : "ml-0"
          }
        `}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}