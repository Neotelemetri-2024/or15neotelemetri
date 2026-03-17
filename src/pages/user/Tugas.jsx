import { useNavigate } from "react-router-dom";
import logoMmd from "../../assets/images/Logo_Mmd.svg";
import { Folder } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";

// Dummy data tugas - nanti diganti dari API/database
const tugasList = [
  {
    id: 1,
    title: "Tugas 1",
    subTitle: "Tugas Design",
    deadline: "03 Juni 2026 | 07:00",
  },
  {
    id: 2,
    title: "Tugas 2",
    subTitle: "Tugas Prototype",
    deadline: "03 Juni 2026 | 07:00",
  },
  {
    id: 3,
    title: "Tugas 3",
    subTitle: "Tugas Presentasi",
    deadline: "03 Juni 2026 | 07:00",
  },
];

const userDivisi = {
  logo: logoMmd,
  divisi: "Divisi Multimedia & Desain",
  subDivisi: "Sub Divisi UI/UX",
};

export default function Tugas() {
  const navigate = useNavigate();

  const handleLihat = (tugas) => {
    navigate(`/tugas/${tugas.id}`);
  };

  return (
    <UserLayout>
      <div className="min-h-screen px-8 py-8 flex flex-col gap-6">
        {/* ===== TITLE ===== */}
        <h1 className="text-white text-xl font-bold">
          Tugas OR 15 Neotelemetri XIV
        </h1>

        {/* ===== INFO DIVISI ===== */}
        <div className="flex items-center gap-3">
          <img
            src={userDivisi.logo}
            alt="logo divisi"
            className="w-10 h-10 object-contain"
          />
          <div>
            <p className="text-white text-sm font-semibold">
              {userDivisi.divisi}
            </p>
            <p className="text-white/50 text-xs">{userDivisi.subDivisi}</p>
          </div>
        </div>

        {/* ===== LIST TUGAS ===== */}
        <div className="flex flex-col gap-3 max-w-[600px]">
          {tugasList.map((tugas) => (
            <div
              key={tugas.id}
              className="flex items-center gap-4 px-5 py-4 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #FF00FF 0%, #CC00CC 50%, #990099 100%)",
                boxShadow: "0 4px 24px rgba(255,0,255,0.40)",
              }}
            >
              {/* ICON FOLDER */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(0,0,0,0.25)" }}
              >
                <Folder size={16} className="text-white" />
              </div>

              {/* TITLE + DEADLINE */}
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

              {/* TOMBOL LIHAT TUGAS */}
              <button
                onClick={() => handleLihat(tugas)}
                className="shrink-0 px-5 py-2 rounded-full text-white text-xs font-semibold transition-all duration-200 hover:scale-105 hover:brightness-110"
                style={{
                  background: "rgba(0,0,0,0.35)",
                  border: "1.5px solid rgba(255,255,255,0.30)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                Lihat Tugas
              </button>
            </div>
          ))}
        </div>
      </div>
    </UserLayout>
  );
}
