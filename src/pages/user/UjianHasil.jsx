import { useNavigate, useLocation } from "react-router-dom";
import UserLayout from "../../components/user/LayoutUser";

export default function UjianHasil() {
  const navigate = useNavigate();
  const location = useLocation();

  // Nanti bisa diisi dari state navigasi: navigate("/hasil-ujian", { state: { benar, salah, nilai, divisi } })
  const {
    benar = 20,
    salah = 0,
    nilai = 100,
    divisi = "Ujian Divisi",
  } = location.state ?? {};

  return (
    <UserLayout>
      <div className="min-h-screen px-8 py-8 flex flex-col gap-8">
        {/* ===== TITLE ===== */}
        <h1 className="text-white text-xl font-bold">Hasil Akhir Ujian</h1>

        {/* ===== RESULT CARD ===== */}
        <div
          className="rounded-2xl px-8 py-7 max-w-[680px] flex flex-col gap-5"
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
              <div
                className="w-9 h-9 rounded-full shrink-0"
                style={{
                  background:
                    "radial-gradient(circle, #FF00FF 30%, #CC00CC 100%)",
                  boxShadow: "0 0 16px #FF00FF88",
                }}
              />
              <span className="text-white/80 text-sm">Benar :</span>
            </div>
            <span className="text-white font-semibold text-sm">{benar}</span>
          </div>

          {/* DIVIDER */}
          <div
            className="w-full h-px"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />

          {/* SALAH */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-9 h-9 rounded-full shrink-0"
                style={{
                  background:
                    "radial-gradient(circle, #CC00CC 30%, #800080 100%)",
                  boxShadow: "0 0 12px #CC00CC66",
                }}
              />
              <span className="text-white/80 text-sm">Salah :</span>
            </div>
            <span className="text-white font-semibold text-sm">{salah}</span>
          </div>

          {/* DIVIDER */}
          <div
            className="w-full h-px"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />

          {/* NILAI */}
          <div className="flex items-center justify-between pl-[52px]">
            <span className="text-white/80 text-sm">Nilai :</span>
            <span className="text-white font-bold text-sm">{nilai}</span>
          </div>
        </div>

        {/* ===== TOMBOL KEMBALI ===== */}
        <div className="flex justify-end max-w-[680px]">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3 rounded-full text-white text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-[0_0_24px_#FF00FF55]"
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
