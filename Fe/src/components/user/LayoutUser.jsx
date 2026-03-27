import circlePurple from "../../assets/images/Bulat_Ungu.png";
import logoORWhite from "../../assets/images/Logo_OR_White.png";
import SidebarUser from "./SidebarItem";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Users,
  ShieldCheck,
  CreditCard,
  FileText,
  ClipboardCheck,
  BookOpen,
  ListTodo,
  LogOut,
} from "lucide-react";

const menuItems = [
  { to: "/dashboard", icon: <Home size={18} />, label: "Dashboard" },
  { to: "/editprofil", icon: <Users size={18} />, label: "Profil" },
  { to: "/verifikasi", icon: <ShieldCheck size={18} />, label: "Verifikasi" },
  { to: "/pembayaran", icon: <CreditCard size={18} />, label: "Pembayaran" },
  { to: "/ujian", icon: <FileText size={18} />, label: "Ujian" },
  { to: "/absensi", icon: <ClipboardCheck size={18} />, label: "Absensi" },
  { to: "/materi", icon: <BookOpen size={18} />, label: "Materi" },
  { to: "/tugas", icon: <ListTodo size={18} />, label: "Tugas" },
];

export default function UserLayout({ children }) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#1a0023] text-white relative overflow-hidden">
      {/* BACKGROUND */}
      <img src={circlePurple} alt="" className="absolute -top-30 left-1/4 w-[250px] pointer-events-none" />
      <img src={circlePurple} alt="" className="absolute -bottom-20 left-1/4 pointer-events-none" />
      <img src={circlePurple} alt="" className="absolute top-1/3 -right-10 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[300px] h-[300px] bg-[#01FFFF] blur-[80px] rounded-full pointer-events-none" />

      {/* OVERLAY — mobile only */}
      {isMobile && isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-[25]" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside
        onMouseEnter={() => !isMobile && setIsHovering(true)}
        onMouseLeave={() => !isMobile && setIsHovering(false)}
        className={`
          fixed top-0 left-0 h-screen bg-[#501A5E]
          flex flex-col justify-between py-6 px-3
          transition-all duration-300 z-[30]
          ${!isMobile
            ? isHovering ? "w-[240px]" : "w-[72px]"
            : isMobileOpen ? "w-[240px] translate-x-0" : "-translate-x-full w-[240px]"
          }
        `}
      >
        {/* LOGO */}
        <div>
          <div className="mb-8 flex justify-center items-center min-h-[40px]">
            {!isMobile && !isHovering ? (
              <img src={logoORWhite} alt="logo" className="w-[32px] h-[32px] object-contain" />
            ) : (
              <img src={logoORWhite} alt="logo" className="w-[140px]" />
            )}
          </div>

          {/* MENU */}
          <nav className="flex flex-col gap-3 text-sm">
            {menuItems.map((item) => (
              <SidebarUser
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isOpen={isMobile ? true : isHovering}
              />
            ))}
          </nav>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 text-sm opacity-80 hover:opacity-100 transition px-2
            ${!isMobile && !isHovering ? "justify-center" : "justify-start"}`}
        >
          <LogOut size={20} className="shrink-0" />
          {(isMobile || isHovering) && (
            <span className="cursor-pointer">Keluar</span>
          )}
        </button>
      </aside>

      {/* HAMBURGER — floating */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen((p) => !p)}
          className="fixed z-[35] top-4 left-4 bg-white/10 backdrop-blur p-2 rounded-lg hover:bg-white/20 transition"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      <main
        className={`
          flex-1 relative z-10 transition-all duration-300 min-w-0
          ${!isMobile ? (isHovering ? "ml-[240px]" : "ml-[72px]") : "ml-0"}
        `}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}