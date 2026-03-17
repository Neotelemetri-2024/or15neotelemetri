import { Link } from "react-router-dom";

const SidebarUser = ({ icon, label, to }) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default SidebarUser;