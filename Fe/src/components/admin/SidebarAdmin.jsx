import { Link, useLocation } from "react-router-dom";

const SidebarAdmin = ({ icon, label, to, isOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        flex items-center px-3 py-2 rounded-lg transition
        ${isActive ? "bg-[#6A1B7A]" : "hover:bg-white/10"}
      `}
    >
      {/* Icon selalu di posisi kiri, tidak bergerak */}
      <span className="shrink-0 w-[18px] flex items-center justify-center">
        {icon}
      </span>

      {/* Label: hanya label yang animate */}
      <span
        className={`
          whitespace-nowrap overflow-hidden
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen
            ? "opacity-100 max-w-[160px] ml-3"
            : "opacity-0 max-w-0 ml-0"
          }
        `}
      >
        {label}
      </span>
    </Link>
  );
};

export default SidebarAdmin;