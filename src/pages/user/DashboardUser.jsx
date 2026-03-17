import { useNavigate } from "react-router-dom";
import { ShieldAlert, User } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import UserLayout from "../../components/user/LayoutUser";

const timeline = [
  {
    step: 1,
    label: "Pendaftaran, verifikasi, dan pembayaran",
    date: "tgl-bulan-tahun",
    active: true,
  },
  { step: 2, label: "Ujian Online", date: "tgl-bulan-tahun", active: false },
  { step: 3, label: "Wawancara", date: "tgl-bulan-tahun", active: false },
  { step: 4, label: "Pembukaan OR 15", date: "tgl-bulan-tahun", active: false },
];

// Data user sementara
const user = {
  name: "NamaUser",
  division: "Programming",
  subDivision: "Machine Learning",
  verified: false,
};

export default function DashboardUser() {
  const navigate = useNavigate();

  return (
    <UserLayout>
      <div className="min-h-screen  flex flex-col gap-6">
        {/* ===== TOP RIGHT: NAMA + AVATAR BOX ===== */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-white font-semibold text-sm">{user.name}</span>
          <div
            className="w-10 h-10 rounded-md"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          />
        </div>

        {/* ===== HELLO ===== */}
        <h1 className="text-white text-2xl font-semibold -mt-2">
          Hello {user.name}!
        </h1>

        {/* BANNER BELUM VERIFIKASI */}
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-[#FF00FF]">
          <ShieldAlert size={18} className="text-white shrink-0" />
          <span className="text-white text-sm">
            Waduhh, Kamu Belum Verifikasi
          </span>
        </div>
        {/* ===== MAIN GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ===== LEFT COLUMN ===== */}
          <div className="flex flex-col gap-4">
            {/* TOMBOL VERIFIKASI */}
            <button
              onClick={() => navigate("/verifikasi")}
              className="py-3 rounded-full bg-[#FF00FF] text-black text-sm font-semibold transition-all duration-200  hover:shadow-[0_0_24px_#FF00FF55]"
            >
              Verifikasi Sekarang
            </button>

            {/* PROFILE CARD */}
            <div
              className="flex flex-col items-center justify-center gap-3 py-10 px-6 rounded-2xl mt-2"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1.5px solid rgba(255,0,255,0.35)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              {/* AVATAR */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <User size={40} className="text-white/70" />
              </div>

              <div className="text-center">
                <p className="text-white font-semibold text-base">
                  {user.name}
                </p>
                <p className="text-white/60 text-sm">{user.division}</p>
                <p className="text-white/60 text-sm">{user.subDivision}</p>
              </div>
            </div>
          </div>

          {/* ===== RIGHT COLUMN: TIMELINE ===== */}
          <div className="flex flex-col gap-3 pt-1">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                {/* STEP CIRCLE */}
                <div
                  className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: item.active
                      ? "linear-gradient(135deg, #FF00FF, #990099)"
                      : "rgba(255,255,255,0.12)",
                    color: "white",
                    boxShadow: item.active ? "0 0 16px #FF00FF66" : "none",
                    border: item.active
                      ? "none"
                      : "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {item.step}
                </div>

                {/* CONNECTOR LINE (except last) */}
                <div className="relative flex-1">
                  <div
                    className="flex items-center justify-between px-5 py-3 rounded-full"
                    style={{
                      background: item.active
                        ? "rgba(255,0,255,0.12)"
                        : "rgba(255,255,255,0.07)",
                      border: item.active
                        ? "1px solid rgba(255,0,255,0.35)"
                        : "1px solid rgba(255,255,255,0.12)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                  >
                    <span
                      className="text-sm"
                      style={{
                        color: item.active ? "white" : "rgba(255,255,255,0.55)",
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="text-xs ml-4 shrink-0"
                      style={{
                        color: item.active
                          ? "rgba(255,255,255,0.8)"
                          : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {item.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* VERTICAL CONNECTOR LINES */}
            <style>{`
            .timeline-wrap { position: relative; }
          `}</style>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
