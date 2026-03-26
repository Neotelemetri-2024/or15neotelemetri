import { useState, useEffect } from "react";
import UserLayout from "../../components/user/LayoutUser";
import { getMyProfile } from "../../services/userServices";
import api from "../../components/api/axios";
import QRCode from "qrcode";

const getMyAttendances = () => api.get("/attendances/me");

// Badge status absensi
function StatusBadge({ status }) {
  const map = {
    PRESENT:  { label: "Hadir",   bg: "bg-green-100",  text: "text-green-700"  },
    ABSENT:   { label: "Absen",   bg: "bg-red-100",    text: "text-red-600"    },
    EXCUSED:  { label: "Izin",    bg: "bg-yellow-100", text: "text-yellow-700" },
    SICK:     { label: "Sakit",   bg: "bg-blue-100",   text: "text-blue-600"   },
    LATE:     { label: "Terlambat",bg:"bg-orange-100", text: "text-orange-600" },
  };
  const s = map[status] || { label: status, bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

export default function Absensi() {
  const [profile, setProfile] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const [profileRes, attendRes] = await Promise.all([
          getMyProfile(),
          getMyAttendances(),
        ]);

        const p = profileRes.data;
        setProfile(p);
        setAttendances(attendRes.data);

        // userId dari localStorage (disimpan saat login)
        const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
        const uid = userLocal.id || p.userId || "";
        setUserId(uid);

        // Generate QR code dari userId
        if (uid) {
          const dataUrl = await QRCode.toDataURL(uid, {
            width: 220,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
          });
          setQrDataUrl(dataUrl);
        }
      } catch (err) {
        console.error("Gagal load absensi:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white/60 text-sm animate-pulse">Memuat...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col gap-6 pt-10 md:pt-4 pb-10">

        {/* Title */}
        <h2 className="text-base font-bold text-white">
          Absensi OR 15 Neo Telemetri
        </h2>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-semibold text-white tracking-wide">
            QR Code Anda
          </p>

          <div
            className="bg-white rounded-2xl p-8"
            
          >
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code Absensi"
                className="w-52 h-52 object-contain block"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center">
                <p className="text-gray-400 text-xs text-center">
                  Gagal generate QR Code
                </p>
              </div>
            )}
          </div>

          {/* Info user di bawah QR */}
          <div className="text-center">
            <p className="text-white font-semibold text-sm">
              {profile?.fullName || "-"}
            </p>
            <p className="text-white/50 text-xs mt-0.5">{profile?.nim || "-"}</p>
            <p className="text-white/50 text-xs">
              {profile?.subDivision?.name || "-"}
            </p>
          </div>

          <p className="text-xs text-white/50 text-center max-w-xs leading-relaxed">
            *Tunjukkan QR Code ini kepada panitia untuk dipindai sebagai bukti kehadiran.
          </p>
        </div>

        {/* Riwayat Absensi */}
        <div className="flex flex-col gap-3">
          <p className="text-white font-semibold text-sm">Riwayat Absensi</p>

          {attendances.length === 0 ? (
            <p className="text-white/40 text-xs text-center py-6">
              Belum ada data absensi.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {attendances.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {a.activity?.name || "-"}
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">
                      {formatDate(a.activity?.deadline)}
                    </p>
                    {a.notes && (
                      <p className="text-white/40 text-xs mt-0.5">
                        Catatan: {a.notes}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}