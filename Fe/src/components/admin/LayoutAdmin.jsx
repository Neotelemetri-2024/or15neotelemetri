import circlePurple from "../../assets/images/Bulat_Ungu.png";
import logoORWhite from "../../assets/images/Logo_OR_White.png";
import SidebarAdmin from "./SidebarAdmin";
import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  FileText,
  ClipboardList,
  CalendarCheck,
  BookOpen,
  ListTodo,
  PackageCheck,
  ChevronDown,
  ChevronRight,
  PlusSquare,
} from "lucide-react";

const menuItems = [
  { to: "/admin/dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { to: "/admin/verifikasi", icon: <ShieldCheck size={18} />, label: "Verifikasi" },
  { to: "/admin/pembayaran", icon: <CreditCard size={18} />, label: "Pembayaran" },
  {
    to: "/admin/ujian",
    icon: <FileText size={18} />,
    label: "Ujian",
    children: [
      { to: "/admin/pengumpulanujian", icon: <ClipboardList size={16} />, label: "Pengumpulan" },
    ],
  },
  {
    to: "/admin/listabsensi",
    icon: <CalendarCheck size={18} />,
    label: "List Absensi",
    children: [
      { to: "/admin/absensi", icon: <CalendarCheck size={16} />, label: "Absen" },
    ],
  },
  {
    to: "/admin/materi",
    icon: <BookOpen size={18} />,
    label: "Materi",
    children: [
      { to: "/admin/materi/add", icon: <PlusSquare size={16} />, label: "Tambah Materi" },
    ],
  },
  {
    to: "/admin/tugas",
    icon: <ListTodo size={18} />,
    label: "Tugas",
    children: [
      { to: "/admin/kumpultugas", icon: <PackageCheck size={16} />, label: "Pengumpulan" },
      { to: "/admin/tugas/add", icon: <PlusSquare size={16} />, label: "Tambah Tugas" },
    ],
  },
];

function SidebarItem({ item, isOpen: sidebarOpen, isMobile }) {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;

  const isChildActive =
    hasChildren && item.children.some((child) => location.pathname.startsWith(child.to));
  const isParentActive =
    location.pathname === item.to || location.pathname.startsWith(item.to + "/");

  const [expanded, setExpanded] = useState(isChildActive || isParentActive);

  useEffect(() => {
    if (isChildActive) setExpanded(true);
  }, [location.pathname]);

  const showLabel = isMobile || sidebarOpen;

  return (
    <div>
      <div className="flex items-center rounded-lg overflow-hidden">
        <NavLink
          to={item.to}
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 flex-1
            ${isActive || isChildActive
              ? "bg-white/20 text-white font-semibold"
              : "text-white/70 hover:bg-white/10 hover:text-white"
            }`
          }
        >
          <span className="shrink-0">{item.icon}</span>
          {showLabel && <span className="flex-1 truncate">{item.label}</span>}
        </NavLink>

        {hasChildren && showLabel && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="p-2 text-white/50 hover:text-white transition shrink-0"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>

      {hasChildren && showLabel && expanded && (
        <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/20 pl-3">
          {item.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-2 text-xs rounded-md transition-all duration-200
                ${isActive
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <span className="shrink-0">{child.icon}</span>
              <span className="truncate">{child.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({ children }) {
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
    <div className="flex min-h-screen bg-[#1a0023] text-white overflow-hidden relative">
      {/* BACKGROUND */}
      <img src={circlePurple} alt="" className="absolute -top-20 left-1/3 w-[300px] pointer-events-none" />
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
        {/* LOGO + MENU */}
        <div className="overflow-hidden overflow-y-auto flex-1 flex flex-col">
          <div className="mb-8 flex justify-center items-center min-h-[40px]">
            {!isMobile && !isHovering ? (
              <img src={logoORWhite} alt="logo" className="w-[32px] h-[32px] object-contain" />
            ) : (
              <img src={logoORWhite} alt="logo" className="w-[140px]" />
            )}
          </div>

          <nav className="flex flex-col gap-1 text-sm">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.to}
                item={item}
                isOpen={isHovering}
                isMobile={isMobile}
              />
            ))}
          </nav>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 text-sm opacity-80 hover:opacity-100 transition px-2 mt-4
            ${!isMobile && !isHovering ? "justify-center" : "justify-start"}`}
        >
          <LogOut size={18} className="shrink-0" />
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

      {/* CONTENT */}
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