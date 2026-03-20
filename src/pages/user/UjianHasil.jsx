import { useNavigate, useLocation } from "react-router-dom";
import { Check, X } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";

export default function UjianHasil() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    benar = 20,
    salah = 0,
    nilai = 100,
    divisi = "Ujian Divisi",
  } = location.state ?? {};

  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col gap-8 pt-10 md:pt-8">

        {/* TITLE */}
        <h1 className="text-white text-lg md:text-xl font-bold">
          Hasil Akhir Ujian
        </h1>

        {/* RESULT CARD */}
        <div
          className="rounded-2xl px-6 md:px-8 py-6 md:py-7 w-full flex flex-col gap-5"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1.5px solid rgba(255,0,255,0.30)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {/* LABEL DIVISI */}
          <p className="text-white/60 text-sm">{divisi}</p>

          {/* BENAR */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Lingkaran hijau dengan ceklis */}
              <div
                className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle, #22c55e 30%, #16a34a 100%)",
                  boxShadow: "0 0 16px #22c55e88",
                }}
              >
                <Check size={18} strokeWidth={3} className="text-white" />
              </div>
              <span className="text-white/80 text-sm">Benar :</span>
            </div>
            <span className="text-white font-semibold text-sm">{benar}</span>
          </div>

          {/* DIVIDER */}
          <div className="w-full h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

          {/* SALAH */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Lingkaran merah dengan X */}
              <div
                className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle, #ef4444 30%, #b91c1c 100%)",
                  boxShadow: "0 0 12px #ef444466",
                }}
              >
                <X size={18} strokeWidth={3} className="text-white" />
              </div>
              <span className="text-white/80 text-sm">Salah :</span>
            </div>
            <span className="text-white font-semibold text-sm">{salah}</span>
          </div>

          {/* DIVIDER */}
          <div className="w-full h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

          {/* NILAI */}
          <div className="flex items-center justify-between pl-[52px]">
            <span className="text-white/80 text-sm">Nilai :</span>
            <span className="text-white font-bold text-sm">{nilai}</span>
          </div>
        </div>

        {/* TOMBOL KEMBALI */}
        <div className="w-full flex justify-end">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full md:w-auto px-8 py-3 rounded-full text-white text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-[0_0_24px_#FF00FF55]"
            style={{
              background: "rgba(255,0,255,0.15)",
              border: "1.5px solid rgba(255,0,255,0.45)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            Kembali Ke Dashboard
          </button>
        </div>
      </div>
    </UserLayout>
  );
}