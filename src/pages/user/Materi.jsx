import { useNavigate } from "react-router-dom";
import logoMmd from "../../assets/images/Logo_Mmd.svg";
import { BookOpen } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";

const materiList = [
  { id: 1, title: "Materi 1", file: null },
  { id: 2, title: "Materi 2", file: null },
  { id: 3, title: "Materi 3", file: null },
];

const userDivisi = {
  logo: logoMmd,
  divisi: "Divisi Multimedia & Desain",
  subDivisi: "Sub Divisi UI/UX",
};

export default function Materi() {
  const handleMateri = (materi) => {
    if (materi.file) window.open(materi.file, "_blank");
  };

  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col gap-6 pt-10">

        {/* TITLE */}
        <h1 className="text-white text-lg md:text-xl font-bold">
          Materi OR 15 Neotelemetri XV
        </h1>

        {/* INFO DIVISI */}
        <div className="flex items-center gap-3">
          <img src={userDivisi.logo} alt="logo divisi" className="w-10 h-10 object-contain shrink-0" />
          <div>
            <p className="text-white text-sm font-semibold">{userDivisi.divisi}</p>
            <p className="text-white/50 text-xs">{userDivisi.subDivisi}</p>
          </div>
        </div>

        {/* LIST MATERI */}
        <div className="flex flex-col gap-3 w-full">
          {materiList.map((materi) => (
            <button
              key={materi.id}
              onClick={() => handleMateri(materi)}
              className="flex items-center gap-4 px-5 py-4 rounded-full text-left text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02] hover:brightness-110"
              style={{
                background: "linear-gradient(90deg, #FF00FF 0%, #CC00CC 50%, #990099 100%)",
                boxShadow: "0 4px 24px rgba(255,0,255,0.40)",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(0,0,0,0.25)" }}
              >
                <BookOpen size={15} className="text-white" />
              </div>
              {materi.title}
            </button>
          ))}
        </div>
      </div>
    </UserLayout>
  );
}