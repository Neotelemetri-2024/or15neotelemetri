// src/components/admin/LayoutAdmin.jsx
import circlePurple from "../../assets/images/Bulat_Ungu.png";
import logoORWhite from "../../assets/images/Logo_OR_White.png";
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
  History,
  Layers,
} from "lucide-react";
import { NotifProvider, useNotif } from "./NotifContext";

const menuItems = [
  {
    to: "/admin/dashboard",
    icon: <LayoutDashboard size={18} />,
    label: "Dashboard",
    children: [
      { to: "/admin/division", icon: <Layers size={16} />, label: "Division" },
      { to: "/admin/timeline", icon: <History size={16} />, label: "Timeline" },
    ],
  },
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

// ── SidebarItem dengan dukungan badge ────────────────────────────
function SidebarItem({ item, isOpen: sidebarOpen, isMobile, badge = 0 }) {
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
            `flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200 flex-1
            ${isActive || isChildActive
              ? "bg-white/20 text-white font-semibold"
              : "text-white/70 hover:bg-white/10 hover:text-white"
            }`
          }
        >
          {/* Icon + dot badge saat collapsed */}
          <span className="relative shrink-0 w-[18px] flex items-center justify-center">
            {item.icon}
            {badge > 0 && !showLabel && (
              <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#501A5E] animate-pulse" />
            )}
          </span>

          {/* Label + count badge saat expanded */}
          <span
            className={`
              flex items-center gap-2
              whitespace-nowrap overflow-hidden
              transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${showLabel ? "opacity-100 max-w-[140px] ml-3" : "opacity-0 max-w-0 ml-0"}
            `}
          >
            {item.label}
            {badge > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </span>
        </NavLink>

        {/* Chevron toggle */}
        {hasChildren && showLabel && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="p-2 text-white/50 hover:text-white transition shrink-0"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>

      {/* Sub-menu */}
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

// ── Inner layout (konsumsi context di sini) ───────────────────────
function AdminLayoutInner({ children }) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Ambil count dari context
  const { verifikasiCount, pembayaranCount } = useNotif();

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

  const sidebarOpen = isMobile ? isMobileOpen : isHovering;

  // Map route → badge count
  const getBadge = (to) => {
    if (to === "/admin/verifikasi") return verifikasiCount;
    if (to === "/admin/pembayaran") return pembayaranCount;
    return 0;
  };

  return (
    <div className="flex min-h-screen bg-[#1a0023] text-white overflow-hidden relative">
      {/* BACKGROUND */}
      <img src={circlePurple} alt="" className="absolute -top-30 left-1/4 w-[250px] pointer-events-none" />
      <img src={circlePurple} alt="" className="absolute -bottom-20 left-1/4 pointer-events-none" />
      <img src={circlePurple} alt="" className="absolute top-1/3 -right-10 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[300px] h-[300px] bg-[#01FFFF] blur-[80px] rounded-full pointer-events-none" />

      {/* OVERLAY — mobile only */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[25] transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        onMouseEnter={() => !isMobile && setIsHovering(true)}
        onMouseLeave={() => !isMobile && setIsHovering(false)}
        className={`
          fixed top-0 left-0 h-screen bg-[#501A5E]
          flex flex-col justify-between py-6 px-3
          z-[30]
          transition-[width,transform] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${!isMobile
            ? isHovering ? "w-[240px]" : "w-[72px]"
            : isMobileOpen
              ? "w-[240px] translate-x-0"
              : "w-[240px] -translate-x-full"
          }
        `}
      >
        {/* LOGO + MENU */}
        <div className="overflow-y-auto flex-1 flex flex-col">
          <div className="mb-8 flex items-center min-h-[40px] px-1 overflow-hidden">
            <img
              src={logoORWhite}
              alt="logo"
              className={`
                origin-left transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${sidebarOpen ? "w-[140px]" : "w-[32px]"}
              `}
            />
          </div>

          <nav className="flex flex-col gap-1 text-sm">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.to}
                item={item}
                isOpen={isHovering}
                isMobile={isMobile}
                badge={getBadge(item.to)}
              />
            ))}
          </nav>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center px-3 mt-4 text-sm opacity-80 hover:opacity-100 transition"
        >
          <span className="shrink-0 w-[18px] flex items-center justify-center">
            <LogOut size={18} />
          </span>
          <span
            className={`
              whitespace-nowrap overflow-hidden
              transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${sidebarOpen ? "opacity-100 max-w-[160px] ml-3" : "opacity-0 max-w-0 ml-0"}
            `}
          >
            Keluar
          </span>
        </button>
      </aside>

      {/* HAMBURGER — mobile only */}
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
          flex-1 relative z-10 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] min-w-0
          ${!isMobile ? (isHovering ? "ml-[240px]" : "ml-[72px]") : "ml-0"}
        `}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}

// ── Export utama: wrap dengan NotifProvider ───────────────────────
export default function AdminLayout({ children }) {
  return (
    <NotifProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </NotifProvider>
  );
}