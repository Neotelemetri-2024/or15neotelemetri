import { Link, useLocation } from "react-router-dom";

const SidebarAdmin = ({ icon, label, to, isOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg transition
        ${isActive ? "bg-[#6A1B7A]" : "hover:bg-white/10"}
        ${!isOpen && "justify-center"}
      `}
    >
      {icon}

      {isOpen && <span>{label}</span>}
    </Link>
  );
};

export default SidebarAdmin;
