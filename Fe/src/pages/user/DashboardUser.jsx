import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { User, CheckCircle2, ChevronRight, Sparkles, X } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";
import {
  getMyProfile,
  getTimelines,
  getMyVerification,
} from "../../services/userServices";
import api from "../../components/api/axios";

const getMyPayment = () => api.get("/payments/my-payment").catch(() => null);

const isProfileComplete = (profile) =>
  !!(
    profile?.fullName?.trim() &&
    profile?.whatsappNumber?.trim() &&
    profile?.studyProgramId?.trim() &&
    profile?.subDivisionId?.trim()
  );

// ── STATUS STEP ─────────────────────────────────────────────────
function getStepStatuses(profile, verif, payment) {
  const profileDone = isProfileComplete(profile);

  // STEP 1: Profil
  const s1 = profileDone ? "done" : "active";

  // STEP 2: Verifikasi
  let s2;
  if (!profileDone) {
    s2 = "pending";
  } else if (verif?.status === "APPROVED") {
    s2 = "done";
  } else if (verif?.status === "PENDING") {
    s2 = "waiting";
  } else if (verif?.status === "REJECTED") {
    s2 = "rejected";
  } else {
    s2 = "active";
  }

  // STEP 3: Pembayaran
  let s3;
  if (verif?.status !== "APPROVED") {
    s3 = "pending";
  } else if (payment?.status === "APPROVED" || payment?.status === "PAID") {
    s3 = "done";
  } else if (payment?.status === "PENDING") {
    s3 = "waiting";
  } else if (payment?.status === "REJECTED") {
    s3 = "rejected";
  } else {
    s3 = "active";
  }

  return [s1, s2, s3];
}

function getBannerState(profile, verif, payment) {
  const profileDone = isProfileComplete(profile);

  // STEP 1: Profil belum lengkap
  if (!profileDone) {
    return {
      message: "Lengkapi profil dan pilih divisimu dulu!",
      cta: "Edit Profil",
      action: "/editprofil",
    };
  }

  // STEP 2: Verifikasi
  if (verif?.status !== "APPROVED") {
    if (!verif) {
      return {
        message: "Kirim berkas verifikasi sekarang",
        cta: "Verifikasi Sekarang",
        action: "/verifikasi",
      };
    }
    if (verif.status === "PENDING") {
      return {
        message: "Berkas kamu sedang diverifikasi admin",
        cta: null,
      };
    }
    if (verif.status === "REJECTED") {
      return {
        message: `Verifikasi ditolak. ${verif?.rejectionReason || ""}`,
        cta: "Kirim Ulang",
        action: "/verifikasi",
      };
    }
    return {
      message: "Kirim berkas verifikasi sekarang",
      cta: "Verifikasi Sekarang",
      action: "/verifikasi",
    };
  }

  // STEP 3: Pembayaran
  if (payment?.status !== "APPROVED" && payment?.status !== "PAID") {
    if (payment?.status === "PENDING") {
      return {
        message: "Pembayaran kamu sedang diverifikasi admin",
        cta: null,
      };
    }
    if (payment?.status === "REJECTED") {
      return {
        message: `Pembayaran ditolak. ${payment?.rejectionReason || ""}`,
        cta: "Bayar Ulang",
        action: "/pembayaran",
      };
    }
    return {
      message: "Lanjutkan ke pembayaran",
      cta: "Bayar Sekarang",
      action: "/pembayaran",
    };
  }

  // STEP 4: DONE
  return {
    message: "Selamat bergabung di OR 15 Neo Telemetri! 🎉",
    done: true,
  };
}

// ── STEP STYLE ───────────────────────────────────────────────────
const STATUS_STYLE = {
  done: {
    circle: "linear-gradient(135deg,#22C55E,#16A34A)",
    glow: "0 0 16px rgba(34,197,94,0.45)",
    badge: { bg: "rgba(34,197,94,0.15)", color: "#4ADE80", text: "Selesai" },
  },
  active: {
    circle: "linear-gradient(135deg,#FF00FF,#990099)",
    glow: "0 0 20px rgba(255,0,255,0.5)",
    badge: {
      bg: "rgba(255,0,255,0.15)",
      color: "#F0ABFC",
      text: "Perlu Dilakukan",
    },
  },
  waiting: {
    circle: "linear-gradient(135deg,#F59E0B,#D97706)",
    glow: "0 0 16px rgba(245,158,11,0.4)",
    badge: {
      bg: "rgba(245,158,11,0.15)",
      color: "#FCD34D",
      text: "Menunggu Verifikasi",
    },
  },
  rejected: {
    circle: "linear-gradient(135deg,#EF4444,#B91C1C)",
    glow: "0 0 16px rgba(239,68,68,0.4)",
    badge: { bg: "rgba(239,68,68,0.15)", color: "#FCA5A5", text: "Ditolak" },
  },
  pending: {
    circle: "rgba(255,255,255,0.10)",
    glow: "none",
    badge: {
      bg: "rgba(255,255,255,0.07)",
      color: "rgba(255,255,255,0.30)",
      text: "Belum Bisa",
    },
  },
};

// ── STEP CARD ────────────────────────────────────────────────────
function StepCard({ step, status, verif, payment, onClick }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  const canAct = status === "active" || status === "rejected";

  let ctaLabel = step.cta;
  if (status === "rejected" && step.ctaRetry) ctaLabel = step.ctaRetry;

  let extraInfo = null;
  if (
    status === "rejected" &&
    step.key === "verifikasi" &&
    verif?.rejectionReason
  ) {
    extraInfo = `Alasan: ${verif.rejectionReason}`;
  }
  if (
    status === "rejected" &&
    step.key === "pembayaran" &&
    payment?.rejectionReason
  ) {
    extraInfo = `Alasan: ${payment.rejectionReason}`;
  }

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200"
      style={{
        background:
          status === "active" || status === "rejected"
            ? "rgba(255,0,255,0.08)"
            : status === "done"
              ? "rgba(34,197,94,0.07)"
              : "rgba(255,255,255,0.04)",
        border:
          status === "active" || status === "rejected"
            ? "1px solid rgba(255,0,255,0.30)"
            : status === "done"
              ? "1px solid rgba(34,197,94,0.25)"
              : status === "waiting"
                ? "1px solid rgba(245,158,11,0.25)"
                : "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {/* NUMBER CIRCLE */}
      <div
        className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-sm text-white"
        style={{
          background: s.circle,
          boxShadow: s.glow,
          border:
            status === "pending" ? "1px solid rgba(255,255,255,0.15)" : "none",
        }}
      >
        {status === "done" ? (
          <CheckCircle2 size={20} className="text-white" />
        ) : (
          step.number
        )}
      </div>

      {/* TEXT */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-white font-semibold text-sm">{step.label}</p>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: s.badge.bg, color: s.badge.color }}
          >
            {s.badge.text}
          </span>
        </div>
        <p className="text-white/45 text-xs mt-0.5">{step.desc}</p>
        {extraInfo && (
          <p className="text-red-400 text-[10px] mt-1 font-medium">
            {extraInfo}
          </p>
        )}
      </div>

      {/* CTA */}
      {canAct && (
        <button
          onClick={onClick}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-semibold shrink-0 hover:brightness-110 transition-all"
          style={{
            background: "linear-gradient(135deg,#FF00FF,#990099)",
            boxShadow: "0 2px 12px rgba(255,0,255,0.35)",
          }}
        >
          {ctaLabel} <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

function PhotoPreviewModal({ avatarUrl, name, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center gap-3 p-4 rounded-2xl"
        style={{
          background: "white",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
          maxWidth: "90vw",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X size={15} />
        </button>
        <img
          src={avatarUrl}
          alt={name || "foto"}
          className="rounded-xl object-cover"
          style={{
            width: "260px",
            height: "260px",
            border: "2px solid rgba(123,47,190,0.2)",
          }}
        />
        {name && (
          <p className="text-sm font-semibold text-gray-700 text-center pb-1">
            {name}
          </p>
        )}
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function DashboardUser() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [timelines, setTimelines] = useState([]);
  const [verif, setVerif] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, timelinesRes, verifRes, paymentRes] =
          await Promise.all([
            getMyProfile(),
            getTimelines(),
            getMyVerification().catch(() => ({ data: null })),
            getMyPayment(),
          ]);
        setProfile(profileRes.data);
        setTimelines(timelinesRes.data);
        setVerif(verifRes?.data || null);
        setPayment(paymentRes?.data || null);
      } catch (err) {
        console.error("Gagal fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const banner = getBannerState(profile, verif, payment);
  const [s1, s2, s3] = profile
    ? getStepStatuses(profile, verif, payment)
    : ["active", "pending", "pending"];
  const allDone = s1 === "done" && s2 === "done" && s3 === "done";

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
        {/* TOP RIGHT */}
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

        {/* GREETING */}
        <h1 className="text-white text-xl md:text-2xl font-semibold -mt-2">
          Hello {profile?.fullName?.split(" ")[0] || ""}!
        </h1>

        {/* SELAMAT BERGABUNG (all done) */}
        {allDone ? (
          <div
            className="flex flex-col items-center gap-3 py-8 px-6 rounded-2xl text-center"
            style={{
              background:
                "linear-gradient(135deg,rgba(255,0,255,0.15),rgba(153,0,153,0.12))",
              border: "1.5px solid rgba(255,0,255,0.40)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#FF00FF,#990099)",
                boxShadow: "0 0 28px rgba(255,0,255,0.5)",
              }}
            >
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base">
                Selamat Bergabung!
              </p>
              <p className="text-white/60 text-sm mt-1">
                Kamu resmi terdaftar di OR 15 Neo Telemetri 🎉
              </p>
              <p className="text-white/45 text-xs mt-1">
                Divisi:{" "}
                <span className="text-white/70 font-semibold">
                  {profile?.subDivision?.name || "-"}
                </span>
              </p>
            </div>
          </div>
        ) : (
          /* BANNER */
          <div
            className="flex items-center justify-between gap-4 px-6 py-5 rounded-2xl"
            style={{
              background: banner.done
                ? "linear-gradient(135deg,rgba(34,197,94,0.15),rgba(22,163,74,0.12))"
                : "linear-gradient(135deg,rgba(255,0,255,0.15),rgba(153,0,153,0.12))",
              border: banner.done
                ? "1.5px solid rgba(34,197,94,0.4)"
                : "1.5px solid rgba(255,0,255,0.4)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="text-white font-semibold text-sm">{banner.message}</p>
            {banner.cta && (
              <button
                onClick={() => navigate(banner.action)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-white shrink-0"
                style={{
                  background: "linear-gradient(135deg,#FF00FF,#990099)",
                  boxShadow: "0 2px 12px rgba(255,0,255,0.35)",
                }}
              >
                {banner.cta}
              </button>
            )}
          </div>
        )}

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-2">
          {/* PROFILE CARD — dibagi 2: kiri user, kanan mentor */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1.5px solid rgba(255,0,255,0.35)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div className="grid grid-cols-2 divide-x divide-white/10 min-h-[200px]">
              {/* KIRI — Data User */}
              <div className="flex flex-col items-center justify-center gap-3 py-8 px-4">
                <div
                  className="w-16 h-16 rounded-full shrink-0 overflow-hidden flex items-center justify-center transition-transform hover:scale-105"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    cursor: profile?.avatarUrl ? "pointer" : "default",
                  }}
                  onClick={() =>
                    profile?.avatarUrl &&
                    setPreviewPhoto({
                      url: profile.avatarUrl,
                      name: profile.fullName,
                    })
                  }
                  title={
                    profile?.avatarUrl ? "Klik untuk lihat foto" : undefined
                  }
                >
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-white/70" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-sm leading-snug">
                    {profile?.fullName || "-"}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">
                    {profile?.division?.name || "-"}
                  </p>
                  <p className="text-white/50 text-xs">
                    {profile?.subDivision?.name || "-"}
                  </p>
                </div>
              </div>

              {/* KANAN — Data Mentor */}
              <div className="flex flex-col items-center justify-center gap-3 py-8 px-4">
                {profile?.mentor ? (
                  <>
                    <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest -mb-1">
                      Mentor
                    </p>

                    <div
                      className="w-16 h-16 rounded-full shrink-0 overflow-hidden flex items-center justify-center transition-transform hover:scale-105"
                      style={{
                        background: "rgba(255,0,255,0.12)",
                        border: "2px solid rgba(255,0,255,0.35)",
                        cursor: profile.mentor.photoUrl ? "pointer" : "default",
                      }}
                      onClick={() =>
                        profile.mentor.photoUrl &&
                        setPreviewPhoto({
                          url: profile.mentor.photoUrl,
                          name: profile.mentor.name,
                        })
                      }
                      title={
                        profile.mentor.photoUrl
                          ? "Klik untuk lihat foto"
                          : undefined
                      }
                    >
                      {profile.mentor.photoUrl ? (
                        <img
                          src={profile.mentor.photoUrl}
                          alt={profile.mentor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-purple-300/70" />
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-white font-semibold text-sm leading-snug">
                        {profile.mentor.name}
                      </p>
                      <div className="flex items-center justify-center gap-3 mt-1">
                        {profile.mentor.whatsappNumber && (
                          <a
                            href={`https://wa.me/${profile.mentor.whatsappNumber.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`WhatsApp: ${profile.mentor.whatsappNumber}`}
                            className="transition hover:scale-110 hover:opacity-80"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="#25D366"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L.057 23.428a.75.75 0 0 0 .916.944l5.702-1.494A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.523-5.204-1.433l-.374-.222-3.384.887.899-3.287-.244-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                            </svg>
                          </a>
                        )}
                        {profile.mentor.instagramUsername && (
                          <a
                            href={`https://instagram.com/${profile.mentor.instagramUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Instagram: @${profile.mentor.instagramUsername}`}
                            className="transition hover:scale-110 hover:opacity-80"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="url(#igGrad)"
                            >
                              <defs>
                                <linearGradient
                                  id="igGrad"
                                  x1="0%"
                                  y1="100%"
                                  x2="100%"
                                  y2="0%"
                                >
                                  <stop offset="0%" stopColor="#F58529" />
                                  <stop offset="50%" stopColor="#DD2A7B" />
                                  <stop offset="100%" stopColor="#8134AF" />
                                </linearGradient>
                              </defs>
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "2px dashed rgba(255,255,255,0.15)",
                      }}
                    >
                      <User size={28} className="text-white/20" />
                    </div>
                    <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest">
                      Mentor
                    </p>
                    <p className="text-white/30 text-xs">Belum ditentukan</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="flex flex-col pt-1">
            {timelines.length === 0 && (
              <p className="text-white/40 text-sm">Belum ada timeline.</p>
            )}
            {timelines.map((item, index) => {
              const now = new Date();
              const start = new Date(item.startAt);
              const nextItem = timelines[index + 1];
              const nextStart = nextItem ? new Date(nextItem.startAt) : null;
              const isActive = now >= start && (!nextStart || now < nextStart);
              const isPast = now > start && nextStart && now >= nextStart;
              const isLast = index === timelines.length - 1;

              const formatDate = (d) =>
                d
                  ? new Date(d).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-";

              return (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold z-10"
                      style={{
                        background: isActive
                          ? "linear-gradient(135deg,#FF00FF,#990099)"
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
                    {!isLast && (
                      <div
                        className="w-[2px] flex-1 my-1"
                        style={{
                          minHeight: "28px",
                          background:
                            isPast || isActive
                              ? "linear-gradient(180deg,#FF00FF,rgba(255,0,255,0.3))"
                              : "rgba(255,255,255,0.12)",
                        }}
                      />
                    )}
                  </div>
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
      {/* PHOTO PREVIEW MODAL */}
      {previewPhoto && (
        <PhotoPreviewModal
          avatarUrl={previewPhoto.url}
          name={previewPhoto.name}
          onClose={() => setPreviewPhoto(null)}
        />
      )}
    </UserLayout>
  );
}
