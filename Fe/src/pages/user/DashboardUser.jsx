import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, ShieldX, User } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";
import { getMyProfile } from "../../services/userServices";
import { getTimelines } from "../../services/userServices";
import { getMyVerification } from "../../services/userServices";

export default function DashboardUser() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [timelines, setTimelines] = useState([]);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, timelinesRes, verificationRes] = await Promise.all([
          getMyProfile(),
          getTimelines(),
          getMyVerification(),
        ]);
        setProfile(profileRes.data);
        setTimelines(timelinesRes.data);
        setVerification(verificationRes.data);
      } catch (err) {
        console.error("Gagal fetch data dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Badge verifikasi berdasarkan status
  const renderVerificationBanner = () => {
    const status = verification?.status;

    // Sudah APPROVED → tidak tampilkan banner
    if (status === "APPROVED") return null;

    if (status === "REJECTED") {
      return (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-red-600">
          <ShieldX size={18} className="text-white shrink-0" />
          <span className="text-white text-sm">
            Verifikasi kamu ditolak.{" "}
            {verification?.rejection_reason && (
              <span className="font-semibold">
                Alasan: {verification.rejection_reason}
              </span>
            )}
          </span>
        </div>
      );
    }

    if (status === "PENDING") {
      return (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-yellow-500">
          <ShieldAlert size={18} className="text-white shrink-0" />
          <span className="text-white text-sm">
            Verifikasi kamu sedang ditinjau oleh admin.
          </span>
        </div>
      );
    }

    // Belum submit sama sekali (null / tidak ada data)
    return (
      <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-[#FF00FF]">
        <ShieldAlert size={18} className="text-white shrink-0" />
        <span className="text-white text-sm">
          Waduhh, Kamu Belum Verifikasi
        </span>
      </div>
    );
  };

  // Tombol verifikasi hanya muncul jika belum APPROVED
  const showVerifikasiButton = verification?.status !== "APPROVED";

  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white/60 text-sm animate-pulse">Memuat data...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col gap-6 pt-10 md:pt-4">
        {/* TOP RIGHT: NAMA + AVATAR */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-white font-semibold text-sm">
            {profile?.fullName || "-"}
          </span>
          <div
            className="w-10 h-10 rounded-md shrink-0 overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={20} className="text-white/50" />
              </div>
            )}
          </div>
        </div>

        {/* HELLO */}
        <h1 className="text-white text-xl md:text-2xl font-semibold -mt-2">
          Hello {profile?.fullName?.split(" ")[0] || ""}!
        </h1>

        {/* BANNER VERIFIKASI */}
        {renderVerificationBanner()}

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4">
            {/* Tombol verifikasi hanya muncul jika belum approved */}
            {showVerifikasiButton && (
              <button
                onClick={() => navigate("/verifikasi")}
                className="py-3 rounded-full bg-[#FF00FF] text-black text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_24px_#FF00FF55]"
              >
                {verification?.status === "REJECTED"
                  ? "Kirim Ulang Verifikasi"
                  : "Verifikasi Sekarang"}
              </button>
            )}

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
              <div
                className="w-20 h-20 rounded-full shrink-0 overflow-hidden flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-white/70" />
                )}
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-base">
                  {profile?.fullName || "-"}
                </p>
                <p className="text-white/60 text-sm">
                  {profile?.division?.name || "-"}
                </p>
                <p className="text-white/60 text-sm">
                  {profile?.subDivision?.name || "-"}
                </p>
              </div>
            </div>
          </div>
          {/* RIGHT COLUMN: TIMELINE */}

          <div className="flex flex-col pt-1">
            {timelines.length === 0 && (
              <p className="text-white/40 text-sm">Belum ada timeline.</p>
            )}
            {timelines.map((item, index) => {
              const now = new Date();
              const start = new Date(item.startAt);
              const nextItem = timelines[index + 1];
              const nextStart = nextItem ? new Date(nextItem.startAt) : null;

              // Aktif: sudah lewat startAt DAN belum sampai startAt berikutnya
              const isActive = now >= start && (!nextStart || now < nextStart);
              const isPast = now > start && nextStart && now >= nextStart;
              const isLast = index === timelines.length - 1;

              const formatDate = (dateStr) => {
                if (!dateStr) return "-";
                return new Date(dateStr).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
              };

              return (
                <div key={item.id} className="flex gap-4">
                  {/* KIRI: CIRCLE + GARIS */}
                  <div className="flex flex-col items-center">
                    {/* CIRCLE */}
                    <div
                      className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold z-10"
                      style={{
                        background: isActive
                          ? "linear-gradient(135deg, #FF00FF, #990099)"
                          : isPast
                            ? "rgba(255,0,255,0.35)"
                            : "rgba(255,255,255,0.12)",
                        color: "white",
                        boxShadow: isActive ? "0 0 16px #FF00FF66" : "none",
                        border:
                          isActive || isPast
                            ? "none"
                            : "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      {item.orderIndex}
                    </div>

                    {/* GARIS KE BAWAH */}
                    {!isLast && (
                      <div
                        className="w-[2px] flex-1 my-1"
                        style={{
                          minHeight: "28px",
                          background:
                            isPast || isActive
                              ? "linear-gradient(180deg, #FF00FF 0%, rgba(255,0,255,0.3) 100%)"
                              : "rgba(255,255,255,0.12)",
                        }}
                      />
                    )}
                  </div>

                  {/* KANAN: CARD */}
                  <div className="flex-1 min-w-0 mb-3">
                    <div
                      className="flex items-center justify-between px-4 py-3 rounded-full gap-2"
                      style={{
                        background: isActive
                          ? "rgba(255,0,255,0.15)"
                          : isPast
                            ? "rgba(255,0,255,0.06)"
                            : "rgba(255,255,255,0.07)",
                        border: isActive
                          ? "1px solid rgba(255,0,255,0.45)"
                          : isPast
                            ? "1px solid rgba(255,0,255,0.20)"
                            : "1px solid rgba(255,255,255,0.12)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                      }}
                    >
                      <span
                        className="text-xs md:text-sm truncate"
                        style={{
                          color: isActive
                            ? "white"
                            : isPast
                              ? "rgba(255,255,255,0.45)"
                              : "rgba(255,255,255,0.55)",
                        }}
                      >
                        {item.title}
                      </span>
                      <span
                        className="text-xs shrink-0"
                        style={{
                          color: isActive
                            ? "rgba(255,255,255,0.85)"
                            : "rgba(255,255,255,0.35)",
                        }}
                      >
                        {formatDate(item.startAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
