import { useNavigate } from "react-router-dom";
import logoMmd from "../../assets/images/Logo_Mmd.svg";
import { Folder } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";

// Dummy data - nanti dari API
// status: "dikumpulkan" | "terlambat" | "belum"
const tugasList = [
  {
    id: 1,
    title: "Tugas 1",
    subTitle: "Tugas Design",
    deadline: "03 Juni 2026 | 07:00",
    status: "dikumpulkan",
  },
  {
    id: 2,
    title: "Tugas 2",
    subTitle: "Tugas Prototype",
    deadline: "03 Juni 2026 | 07:00",
    status: "dikumpulkan",
  },
  {
    id: 3,
    title: "Tugas 3",
    subTitle: "Tugas Presentasi",
    deadline: "03 Juni 2026 | 07:00",
    status: "terlambat",
  },
];

const userDivisi = {
  logo: logoMmd,
  divisi: "Divisi Multimedia & Desain",
  subDivisi: "Sub Divisi UI/UX",
};

function StatusBadge({ status }) {
  const config = {
    dikumpulkan: {
      label: "Telah Dikumpulkan",
      style: {
        background: "#1D5E36",
        
        color: "white",
      },
    },
    terlambat: {
      label: "Terlambat",
      style: {
        background: "#CC2222",
        border: "none",
        color: "white",
      },
    },
    belum: {
      label: "Lihat Tugas",
      style: {
        background: "rgba(0,0,0,0.30)",
        border: "1.5px solid rgba(255,255,255,0.30)",
        color: "white",
      },
    },
  };

  const { label, style } = config[status] ?? config.belum;

  return (
    <span
      className="shrink-0 px-4 py-[6px] rounded-full text-xs font-semibold"
      style={style}
    >
      {label}
    </span>
  );
}

export default function TugasCek() {
  const navigate = useNavigate();

  const handleRow = (tugas) => {
    if (tugas.status === "belum" || tugas.status === "terlambat") {
      navigate(`/tugas/${tugas.id}`);
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen px-8 py-8 flex flex-col gap-6">
        {/* TITLE */}
        <h1 className="text-white text-xl font-bold">
          Tugas OR 15 Neo Telemetri XV
        </h1>

        {/* INFO DIVISI */}
        <div className="flex items-center gap-3">
          <img
            src={userDivisi.logo}
            alt="logo"
            className="w-10 h-10 object-contain"
          />
          <div>
            <p className="text-white text-sm font-semibold">
              {userDivisi.divisi}
            </p>
            <p className="text-white/50 text-xs">{userDivisi.subDivisi}</p>
          </div>
        </div>

        {/* LIST TUGAS */}
        <div className="flex flex-col gap-3 max-w-[600px]">
          {tugasList.map((tugas) => (
            <div
              key={tugas.id}
              onClick={() => handleRow(tugas)}
              className="flex items-center gap-4 px-5 py-4 rounded-full transition-all duration-200 hover:brightness-110"
              style={{
                background:
                  "linear-gradient(90deg, #FF00FF 0%, #CC00CC 50%, #990099 100%)",
                boxShadow: "0 4px 24px rgba(255,0,255,0.40)",
                cursor: tugas.status === "dikumpulkan" ? "default" : "pointer",
              }}
            >
              {/* ICON */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(0,0,0,0.25)" }}
              >
                <Folder size={16} className="text-white" />
              </div>

              {/* TITLE + SUBTITLE */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">
                  {tugas.title}
                </p>
                <p className="text-white/70 text-xs truncate">
                  {tugas.subTitle}
                </p>
              </div>

              {/* DEADLINE */}
              <span className="text-white/80 text-xs shrink-0 hidden sm:block">
                Deadline {tugas.deadline}
              </span>

              {/* STATUS BADGE */}
              <StatusBadge status={tugas.status} />
            </div>
          ))}
        </div>
      </div>
    </UserLayout>
  );
}
