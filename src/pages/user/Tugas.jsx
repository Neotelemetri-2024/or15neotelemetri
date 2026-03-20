import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoMmd from "../../assets/images/Logo_Mmd.svg";
import { Folder, ChevronDown, ChevronUp } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";

const tugasList = [
  { id: 1, title: "Tugas 1", subTitle: "Tugas Design", deadline: "03 Juni 2026 | 07:00", deskripsi: "Tugas 1 adalah tugas ..." },
  { id: 2, title: "Tugas 2", subTitle: "Tugas Prototype", deadline: "03 Juni 2026 | 07:00", deskripsi: "Tugas 2 adalah tugas ..." },
  { id: 3, title: "Tugas 3", subTitle: "Tugas Presentasi", deadline: "03 Juni 2026 | 07:00", deskripsi: "Tugas 3 adalah tugas ..." },
];

const userDivisi = {
  logo: logoMmd,
  divisi: "Divisi Multimedia & Desain",
  subDivisi: "Sub Divisi UI/UX",
};

export default function Tugas() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col gap-6 pt-10 md:pt-4">

        {/* TITLE */}
        <h1 className="text-white text-lg md:text-xl font-bold">
          Tugas OR 15 Neotelemetri XIV
        </h1>

        {/* INFO DIVISI */}
        <div className="flex items-center gap-3">
          <img src={userDivisi.logo} alt="logo divisi" className="w-10 h-10 object-contain shrink-0" />
          <div>
            <p className="text-white text-sm font-semibold">{userDivisi.divisi}</p>
            <p className="text-white/50 text-xs">{userDivisi.subDivisi}</p>
          </div>
        </div>

        {/* LIST TUGAS */}
        <div className="flex flex-col gap-3 w-full ">
          {tugasList.map((tugas) => {
            const isOpen = openId === tugas.id;
            return (
              <div key={tugas.id} className="flex flex-col rounded-[24px] overflow-hidden">

                {/* HEADER CARD — gradient */}
                <div
                  className="flex flex-col px-5 py-4 gap-3"
                  style={{
                    background: "linear-gradient(90deg, #FF00FF 0%, #CC00CC 50%, #990099 100%)",
                    boxShadow: "0 4px 24px rgba(255,0,255,0.40)",
                  }}
                >
                  {/* BARIS ATAS */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(0,0,0,0.25)" }}
                    >
                      <Folder size={16} className="text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm leading-tight">{tugas.title}</p>
                      <p className="text-white/70 text-xs truncate">{tugas.subTitle}</p>
                    </div>

                    {/* TOMBOL LIHAT — sekarang toggle */}
                    <button
                      onClick={() => toggle(tugas.id)}
                      className="shrink-0 flex items-center gap-1 px-4 py-2 rounded-full text-white text-xs font-semibold transition-all duration-200 hover:scale-105 hover:brightness-110"
                      style={{
                        background: "rgba(0,0,0,0.35)",
                        border: "1.5px solid rgba(255,255,255,0.30)",
                        backdropFilter: "blur(6px)",
                        WebkitBackdropFilter: "blur(6px)",
                      }}
                    >
                      {isOpen ? (
                        <><ChevronUp size={12} /> Tutup</>
                      ) : (
                        <><ChevronDown size={12} /> Lihat</>
                      )}
                    </button>
                  </div>

                  {/* BARIS BAWAH: deadline */}
                  <div className="pl-12">
                    <span className="text-white/80 text-xs">
                      Deadline {tugas.deadline}
                    </span>
                  </div>
                </div>

                {/* DETAIL PANEL — muncul saat isOpen */}
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? "400px" : "0px" }}
                >
                  <div
                    className="px-6 py-5 flex flex-col gap-4"
                    style={{
                      background: "rgba(255,255,255,0.97)",
                      borderRadius: "0 0 24px 24px",
                    }}
                  >
                    {/* DESKRIPSI */}
                    <div>
                      <p className="text-gray-700 font-semibold text-sm mb-1">
                        Deskripsi Tugas :
                      </p>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {tugas.deskripsi}
                      </p>
                    </div>

                    {/* TOMBOL KUMPULKAN */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => navigate(`/tugas/${tugas.id}/kumpul`)}
                        className="px-7 py-[10px] rounded-full text-white text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(120,0,200,0.4)]"
                        style={{
                          background: "linear-gradient(135deg, #7B2FBE 0%, #501A5E 100%)",
                          boxShadow: "0 3px 16px rgba(120,0,200,0.30)",
                        }}
                      >
                        Kumpul Tugas
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </UserLayout>
  );
}