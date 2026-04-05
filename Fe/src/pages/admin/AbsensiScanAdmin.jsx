import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  CheckCircle,
  XCircle,
  FileText,
  Camera,
  CameraOff,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import {
  getActivityById,
  scanAttendance,
  updateAttendance,
} from "../../services/attendanceService";
import { Html5Qrcode } from "html5-qrcode";

function QrScanner({ onScan }) {
  const scannerRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle|loading|ready|error
  const [errorMsg, setErrorMsg] = useState("");

  const startScanner = async () => {
    setStatus("loading");
    setErrorMsg("");

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (w, h) => {
            const size = Math.max(250, Math.min(w, h) * 1);
            return { width: size, height: size };
          },
          aspectRatio: 1.333,
        },
        (decodedText) => {
          const beep = new Audio("/beep.mp3");
          beep.play().catch(() => {});
          onScan(decodedText);
        },
      );

      setStatus("ready");
    } catch (err) {
      console.error(err);
      setStatus("error");

      if (err.name === "NotAllowedError") {
        setErrorMsg("Izin kamera ditolak. Izinkan akses kamera.");
      } else {
        setErrorMsg("Gagal mengakses kamera.");
      }
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (e) {}
  };

  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        console.log("Camera devices:", devices);
      } catch (err) {
        console.error("Gagal ambil kamera:", err);
      }
    };

    init();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative w-full rounded-xl overflow-hidden bg-black"
        style={{ aspectRatio: "4/3", maxHeight: "340px" }}
      >
        {/* Scanner container */}
        <div id="qr-reader" className="w-full h-full" />

        {/* Loading */}
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="w-6 h-6 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90 px-6">
            <XCircle size={32} className="text-red-400" />
            <p className="text-red-300 text-xs text-center">{errorMsg}</p>
            <button
              onClick={startScanner}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs"
              style={{ background: "#FF00FF" }}
            >
              <RefreshCw size={12} /> Coba Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────
const STATUS_CONFIG = {
  PRESENT: { label: "Hadir", color: "#16a34a", bg: "#dcfce7" },
  ABSENT: { label: "Alfa", color: "#dc2626", bg: "#fee2e2" },
  SICK: { label: "Sakit", color: "#d97706", bg: "#fef3c7" },
  EXCUSED: { label: "Izin", color: "#2563eb", bg: "#dbeafe" },
};
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ABSENT;
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
};

// ── QR Scanner ───────────────────────────────────────────────

// ── Main Page ────────────────────────────────────────────────
export default function ScanAbsensiAdmin() {
  const navigate = useNavigate();
  const { id: activityId } = useParams();

  const [activity, setActivity] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("scan");
  const [cameraOn, setCameraOn] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const lastScannedRef = useRef("");
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ status: "", notes: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (result) => {
    setToast(result);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const res = await getActivityById(activityId);
      setActivity(res.data);
      setAttendances(res.data.attendances || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [activityId]);

  const cooldownRef = useRef(false);

  const handleScan = useCallback(
    async (userId) => {
      if (scanLoading || cooldownRef.current) return;

      cooldownRef.current = true; // ⛔ lock dulu

      try {
        setScanLoading(true);
        setScanResult(null);

        await scanAttendance({ userId: userId.trim(), activityId });

        const refreshed = await getActivityById(activityId);
        const updatedAttendances = refreshed.data.attendances || [];
        setAttendances(updatedAttendances);
        setActivity(refreshed.data);

        const found = updatedAttendances.find(
          (a) => a.user?.id === userId.trim(),
        );

        const name =
          found?.user?.profile?.fullName || found?.user?.email || "—";
        const nim = found?.user?.profile?.nim || "—";

        const result = {
          success: true,
          message: "Absensi berhasil dicatat!",
          name,
          nim,
        };

        setScanResult(result);
        showToast(result);
      } catch (err) {
        const result = {
          success: false,
          message:
            err?.response?.data?.message ||
            "QR tidak valid atau user tidak ditemukan.",
        };
        setScanResult(result);
        showToast(result);
      } finally {
        setScanLoading(false);

        // ⏳ kasih jeda biar tidak scan terus
        setTimeout(() => {
          cooldownRef.current = false;
        }, 3000);
      }
    },
    [activityId, scanLoading],
  );

  const handleOpenEdit = (att) => {
    setEditModal(att);
    setEditForm({ status: att.status, notes: att.notes || "" });
  };

  const handleSaveEdit = async () => {
    try {
      setEditLoading(true);
      await updateAttendance(editModal.id, editForm);
      setEditModal(null);
      fetchActivity();
    } catch (err) {
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  const fmt = (d, type) =>
    !d
      ? "-"
      : type === "date"
        ? new Date(d).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : new Date(d).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          });

  const stats = {
    present: attendances.filter((a) => a.status === "PRESENT").length,
    absent: attendances.filter((a) => a.status === "ABSENT").length,
    sick: attendances.filter((a) => a.status === "SICK").length,
    excused: attendances.filter((a) => a.status === "EXCUSED").length,
  };

  return (
    <AdminLayout>
      <div
        className="fixed top-4 left-1/2 z-[100] flex flex-col gap-2 pointer-events-none"
        style={{
          transform: "translateX(-50%)",
          minWidth: "280px",
          maxWidth: "380px",
        }}
      >
        {toast && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl pointer-events-auto transition-all duration-300"
            style={{
              background: toast.success ? "#dcfce7" : "#fee2e2",
              border: `1.5px solid ${toast.success ? "#86efac" : "#fca5a5"}`,
              animation: "slideDown 0.3s ease",
            }}
          >
            {toast.success ? (
              <CheckCircle
                size={20}
                className="text-green-600 shrink-0 mt-0.5"
              />
            ) : (
              <XCircle size={20} className="text-red-500   shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-bold"
                style={{ color: toast.success ? "#16a34a" : "#dc2626" }}
              >
                {toast.message}
              </p>
              {toast.success && (toast.name !== "—" || toast.nim !== "—") && (
                <p className="text-xs text-gray-600 mt-0.5 truncate">
                  {toast.name} · {toast.nim}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-12px); }
      to   { opacity: 1; transform: translateY(0);     }
    }
    @keyframes scanline {
      0%, 100% { top: 10%; }
      50%       { top: 88%; }
    }
  `}</style>

      <div className="min-h-screen flex flex-col gap-4 pt-10 md:pt-4 pb-10">
        {/* TOP */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* ACTIVITY */}
        {activity && (
          <div>
            <h2 className="text-white font-bold text-lg">{activity.name}</h2>
            <p className="text-white/50 text-xs mt-0.5">
              Deadline: {fmt(activity.deadline, "date")}
            </p>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: "Hadir",
              value: stats.present,
              color: "#16a34a",
              bg: "#dcfce7",
            },
            {
              label: "Alfa",
              value: stats.absent,
              color: "#dc2626",
              bg: "#fee2e2",
            },
            {
              label: "Sakit",
              value: stats.sick,
              color: "#d97706",
              bg: "#fef3c7",
            },
            {
              label: "Izin",
              value: stats.excused,
              color: "#2563eb",
              bg: "#dbeafe",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-3 py-3 flex flex-col items-center gap-1"
              style={{ background: s.bg }}
            >
              <span className="text-xl font-bold" style={{ color: s.color }}>
                {s.value}
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: s.color }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-2">
          {["scan", "list"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab !== "scan") setCameraOn(false);
              }}
              className="px-5 py-2 rounded-full text-xs font-semibold transition-all"
              style={
                activeTab === tab
                  ? { background: "#6E3FBF", color: "white" }
                  : {
                      background: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.6)",
                    }
              }
            >
              {tab === "scan" ? "Scan QR" : "Daftar Hadir"}
            </button>
          ))}
        </div>

        {/* TAB SCAN */}
        {activeTab === "scan" && (
          <div
            className="flex flex-col gap-5 px-5 md:px-8 py-6"
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
            }}
          >
            <div>
              <p className="text-gray-800 font-bold text-sm">
                Scan QR Code User
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Aktifkan kamera lalu arahkan ke QR Code user.
              </p>
            </div>

            {/* Toggle */}
            <button
              onClick={() => setCameraOn((v) => !v)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-80 active:scale-95"
              style={{ background: cameraOn ? "#6b7280" : "#6E3FBF" }}
            >
              {cameraOn ? (
                <>
                  <CameraOff size={16} /> Matikan Kamera
                </>
              ) : (
                <>
                  <Camera size={16} /> Aktifkan Kamera
                </>
              )}
            </button>

            {/* Scanner component — hanya mount saat cameraOn */}
            {cameraOn && <QrScanner onScan={handleScan} />}

            {/* Placeholder */}
            {!cameraOn && (
              <div
                className="w-full rounded-xl flex flex-col items-center justify-center gap-3 py-10"
                style={{
                  background: "rgba(0,0,0,0.04)",
                  border: "2px dashed rgba(0,0,0,0.12)",
                }}
              >
                <Camera size={36} className="text-gray-300" />
                <p className="text-gray-400 text-xs text-center">
                  Kamera belum aktif.
                  <br />
                  Tekan tombol di atas untuk mulai scan.
                </p>
              </div>
            )}

            {/* Loading API */}
            {scanLoading && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-50 border border-purple-200">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-purple-600 font-medium">
                  Memproses absensi...
                </p>
              </div>
            )}

            {/* Hasil */}
            {scanResult && (
              <div
                className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: scanResult.success ? "#dcfce7" : "#fee2e2",
                  border: `1px solid ${scanResult.success ? "#86efac" : "#fca5a5"}`,
                }}
              >
                {scanResult.success ? (
                  <CheckCircle
                    size={20}
                    className="text-green-600 shrink-0 mt-0.5"
                  />
                ) : (
                  <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p
                    className="text-xs font-bold"
                    style={{
                      color: scanResult.success ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {scanResult.message}
                  </p>
                  {scanResult.success && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      {scanResult.name} · {scanResult.nim}
                    </p>
                  )}
                </div>
              </div>
            )}

            <p className="text-gray-400 text-[11px] leading-relaxed">
              💡 <strong>Laptop:</strong> Pastikan tidak ada aplikasi lain yang
              memakai kamera (Zoom, Meet, dll).
            </p>
          </div>
        )}

        {/* TAB LIST */}
        {activeTab === "list" && (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
            }}
          >
            <div
              className="px-5 py-4 border-b"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            >
              <p className="text-gray-800 font-bold text-sm">
                Daftar Kehadiran
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                {attendances.length} peserta terdaftar
              </p>
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}>
                    {["No", "Nama", "NIM", "Check-in", "Status", "Action"].map(
                      (col) => (
                        <th
                          key={col}
                          className="p-4 text-xs font-bold text-gray-700 whitespace-nowrap"
                          style={{
                            textAlign: col === "Nama" ? "left" : "center",
                          }}
                        >
                          {col}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-gray-400 text-sm"
                      >
                        Memuat...
                      </td>
                    </tr>
                  ) : attendances.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-gray-400 text-sm"
                      >
                        Belum ada data.
                      </td>
                    </tr>
                  ) : (
                    attendances.map((att, i) => (
                      <tr
                        key={att.id}
                        className="hover:bg-purple-50 transition-colors"
                        style={{
                          borderBottom:
                            i < attendances.length - 1
                              ? "1px solid rgba(0,0,0,0.05)"
                              : "none",
                        }}
                      >
                        <td className="p-4 text-gray-500 text-xs text-center">
                          {i + 1}
                        </td>
                        <td className="p-4 text-gray-800 text-xs whitespace-nowrap">
                          {att.user?.profile?.fullName ||
                            att.user?.email ||
                            "-"}
                        </td>
                        <td className="p-4 text-gray-500 text-xs text-center">
                          {att.user?.profile?.nim || "-"}
                        </td>
                        <td className="p-4 text-gray-500 text-xs text-center whitespace-nowrap">
                          {att.checkInTime
                            ? `${fmt(att.checkInTime, "date")} ${fmt(att.checkInTime, "time")}`
                            : "-"}
                        </td>
                        <td className="p-4 text-center">
                          <StatusBadge status={att.status} />
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleOpenEdit(att)}
                            className="flex items-center gap-1 mx-auto px-3 py-1 rounded-full text-xs font-semibold text-white hover:brightness-110"
                            style={{ background: "#7B2FBE" }}
                          >
                            <FileText size={11} /> Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden flex flex-col divide-y divide-black/5">
              {loading ? (
                <p className="text-center py-10 text-gray-400 text-sm">
                  Memuat...
                </p>
              ) : attendances.length === 0 ? (
                <p className="text-center py-10 text-gray-400 text-sm">
                  Belum ada data.
                </p>
              ) : (
                attendances.map((att) => (
                  <div
                    key={att.id}
                    className="px-5 py-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <p className="text-gray-800 text-sm font-semibold truncate">
                        {att.user?.profile?.fullName || att.user?.email || "-"}
                      </p>
                      <p className="text-gray-400 text-xs">
                        NIM: {att.user?.profile?.nim || "-"}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {att.checkInTime
                          ? `${fmt(att.checkInTime, "date")} ${fmt(att.checkInTime, "time")}`
                          : "Belum check-in"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <StatusBadge status={att.status} />
                      <button
                        onClick={() => handleOpenEdit(att)}
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ background: "#7B2FBE" }}
                      >
                        <FileText size={11} /> Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL EDIT */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl px-8 py-7 flex flex-col gap-5 max-w-sm w-full shadow-2xl">
            <div>
              <p className="text-gray-800 font-bold text-sm">
                Edit Kehadiran Manual
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {editModal.user?.profile?.fullName ||
                  editModal.user?.email ||
                  "-"}
                {editModal.user?.profile?.nim
                  ? ` · ${editModal.user.profile.nim}`
                  : ""}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 font-semibold text-xs">
                Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, status: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 outline-none"
                style={{ border: "1px solid rgba(0,0,0,0.12)" }}
              >
                <option value="PRESENT">Hadir</option>
                <option value="ABSENT">Alfa</option>
                <option value="SICK">Sakit</option>
                <option value="EXCUSED">Izin</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 font-semibold text-xs">
                Catatan (opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Sakit dengan surat dokter"
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 outline-none resize-none"
                style={{ border: "1px solid rgba(0,0,0,0.12)" }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 py-2.5 rounded-full text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editLoading}
                className="flex-1 py-2.5 rounded-full text-xs font-semibold text-white hover:opacity-80 disabled:opacity-40"
                style={{ background: "#FF00FF" }}
              >
                {editLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// import { useState, useEffect, useRef, useCallback } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   ArrowLeft,
//   User,
//   CheckCircle,
//   XCircle,
//   FileText,
//   Camera,
//   CameraOff,
//   RefreshCw,
// } from "lucide-react";
// import AdminLayout from "../../components/admin/LayoutAdmin";
// import {
//   getActivityById,
//   scanAttendance,
//   updateAttendance,
// } from "../../services/attendanceService";
// import jsQR from "jsqr";

// // ── Status Badge ─────────────────────────────────────────────
// const STATUS_CONFIG = {
//   PRESENT: { label: "Hadir", color: "#16a34a", bg: "#dcfce7" },
//   ABSENT: { label: "Alfa", color: "#dc2626", bg: "#fee2e2" },
//   SICK: { label: "Sakit", color: "#d97706", bg: "#fef3c7" },
//   EXCUSED: { label: "Izin", color: "#2563eb", bg: "#dbeafe" },
// };
// const StatusBadge = ({ status }) => {
//   const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ABSENT;
//   return (
//     <span
//       className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
//       style={{ color: cfg.color, background: cfg.bg }}
//     >
//       {cfg.label}
//     </span>
//   );
// };

// // ── QR Scanner ───────────────────────────────────────────────
// function QrScanner({ onScan }) {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);
//   const rafRef = useRef(null);

//   const [status, setStatus] = useState("idle"); // idle|loading|ready|error
//   const [errorMsg, setErrorMsg] = useState("");
//   const [cameraList, setCameraList] = useState([]);
//   const [selectedCamera, setSelectedCamera] = useState("environment"); // deviceId atau "environment"/"user"

//   // Load jsQR dari CDN

//   // Tick — decode frame terus menerus
//   const tick = useCallback(
//     (jsQR) => {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
//         rafRef.current = requestAnimationFrame(() => tick(jsQR));
//         return;
//       }
//       const ctx = canvas.getContext("2d");
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       ctx.drawImage(video, 0, 0);
//       const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
//       const code = jsQR(img.data, img.width, img.height, {
//         inversionAttempts: "dontInvert",
//       });
//       if (code?.data) onScan(code.data);
//       rafRef.current = requestAnimationFrame(() => tick(jsQR));
//     },
//     [onScan],
//   );

//   // Stop stream helper
//   const stopStream = () => {
//     if (rafRef.current) cancelAnimationFrame(rafRef.current);
//     if (streamRef.current)
//       streamRef.current.getTracks().forEach((t) => t.stop());
//     streamRef.current = null;
//     if (videoRef.current) videoRef.current.srcObject = null;
//   };

//   // Start kamera
//   const startCamera = useCallback(
//     async (cameraId) => {
//       stopStream();
//       setStatus("loading");
//       setErrorMsg("");

//       try {
//         // Enum dulu kamera yang tersedia
//         const devices = await navigator.mediaDevices.enumerateDevices();
//         const videoDevices = devices.filter((d) => d.kind === "videoinput");
//         setCameraList(videoDevices);

//         // Pilih constraint berdasarkan kameraId
//         let videoConstraint;
//         if (cameraId && cameraId !== "environment" && cameraId !== "user") {
//           videoConstraint = { deviceId: { exact: cameraId } };
//         } else {
//           videoConstraint = {
//             facingMode: { ideal: cameraId || "environment" },
//           };
//         }

//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             ...videoConstraint,
//             width: { ideal: 1280 },
//             height: { ideal: 720 },
//           },
//           audio: false,
//         });

//         streamRef.current = stream;
//         const video = videoRef.current;
//         if (!video) return;

//         video.srcObject = stream;
//         video.muted = true;
//         video.playsInline = true;
//         video.setAttribute("playsinline", "");
//         video.setAttribute("muted", "");

//         // Tunggu metadata loaded baru play
//         await new Promise((res, rej) => {
//           video.onloadedmetadata = res;
//           video.onerror = rej;
//           setTimeout(rej, 8000); // timeout 8 detik
//         });

//         await video.play();
//         setStatus("ready");
//         rafRef.current = requestAnimationFrame(() => tick(jsQR));
//       } catch (err) {
//         console.error("Camera error:", err);
//         setStatus("error");
//         if (
//           err.name === "NotAllowedError" ||
//           err.name === "PermissionDeniedError"
//         ) {
//           setErrorMsg(
//             "Izin kamera ditolak. Klik ikon kunci/kamera di address bar browser lalu izinkan akses kamera, kemudian refresh halaman.",
//           );
//         } else if (
//           err.name === "NotFoundError" ||
//           err.name === "DevicesNotFoundError"
//         ) {
//           setErrorMsg(
//             "Kamera tidak ditemukan. Pastikan kamera terhubung dan tidak dipakai aplikasi lain.",
//           );
//         } else if (
//           err.name === "NotReadableError" ||
//           err.name === "TrackStartError"
//         ) {
//           setErrorMsg(
//             "Kamera sedang dipakai aplikasi lain (Zoom, Meet, dll). Tutup aplikasi tersebut lalu coba lagi.",
//           );
//         } else if (err.message === "Timeout") {
//           setErrorMsg(
//             "Kamera tidak merespons. Coba ganti kamera atau refresh halaman.",
//           );
//         } else {
//           setErrorMsg(`Error: ${err.name} — ${err.message}`);
//         }
//       }
//     },
//     [tick],
//   );

//   useEffect(() => {
//     startCamera(selectedCamera);
//     return () => stopStream();
//   }, []); // eslint-disable-line

//   const handleSwitchCamera = (deviceId) => {
//     setSelectedCamera(deviceId);
//     startCamera(deviceId);
//   };

//   // ── Render ────────────────────────────────────────────────
//   return (
//     <div className="flex flex-col gap-3">
//       {/* Pilih kamera (muncul jika ada lebih dari 1) */}
//       {cameraList.length > 1 && (
//         <div className="flex flex-col gap-1.5">
//           <label className="text-gray-500 text-xs font-semibold">
//             Pilih Kamera
//           </label>
//           <select
//             value={selectedCamera}
//             onChange={(e) => handleSwitchCamera(e.target.value)}
//             className="w-full px-3 py-2 rounded-lg text-xs text-gray-700 outline-none"
//             style={{ border: "1px solid rgba(0,0,0,0.12)" }}
//           >
//             <option value="environment">Kamera Belakang (default)</option>
//             <option value="user">Kamera Depan</option>
//             {cameraList.map((d) => (
//               <option key={d.deviceId} value={d.deviceId}>
//                 {d.label || `Kamera ${d.deviceId.slice(0, 8)}...`}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* Viewfinder */}
//       <div
//         className="relative w-full rounded-xl overflow-hidden bg-black"
//         style={{ aspectRatio: "4/3", maxHeight: "340px" }}
//       >
//         <video
//           ref={videoRef}
//           className="absolute inset-0 w-full h-full object-cover"
//           playsInline
//           muted
//           autoPlay
//         />
//         <canvas ref={canvasRef} className="hidden" />

//         {/* Loading overlay */}
//         {status === "loading" && (
//           <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80">
//             <div className="w-6 h-6 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin" />
//             <p className="text-white/70 text-xs">Menghubungkan kamera...</p>
//           </div>
//         )}

//         {/* Error overlay */}
//         {status === "error" && (
//           <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90 px-6">
//             <XCircle size={32} className="text-red-400" />
//             <p className="text-red-300 text-xs text-center leading-relaxed">
//               {errorMsg}
//             </p>
//             <button
//               onClick={() => startCamera(selectedCamera)}
//               className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-semibold mt-1"
//               style={{ background: "#FF00FF" }}
//             >
//               <RefreshCw size={12} /> Coba Lagi
//             </button>
//           </div>
//         )}

//         {/* Viewfinder corners */}
//         {status === "ready" && (
//           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//             <div className="relative w-52 h-52">
//               <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
//               <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
//               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
//               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
//               {/* Scan line */}
//               <div
//                 className="absolute left-2 right-2 h-0.5 animate-[scanline_2s_ease-in-out_infinite]"
//                 style={{
//                   background: "#FF00FF",
//                   boxShadow: "0 0 8px #FF00FF",
//                   top: "50%",
//                 }}
//               />
//             </div>
//             <p className="absolute bottom-3 text-white/60 text-[11px]">
//               Arahkan QR Code ke bingkai
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Retry manual */}
//       {status === "ready" && (
//         <button
//           onClick={() => startCamera(selectedCamera)}
//           className="flex items-center justify-center gap-1.5 text-gray-400 text-xs hover:text-gray-600 transition-colors"
//         >
//           <RefreshCw size={11} /> Restart kamera
//         </button>
//       )}
//     </div>
//   );
// }

// // ── Main Page ────────────────────────────────────────────────
// export default function ScanAbsensiAdmin() {
//   const navigate = useNavigate();
//   const { id: activityId } = useParams();

//   const [activity, setActivity] = useState(null);
//   const [attendances, setAttendances] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("scan");
//   const [cameraOn, setCameraOn] = useState(false);
//   const [scanLoading, setScanLoading] = useState(false);
//   const [scanResult, setScanResult] = useState(null);
//   const lastScannedRef = useRef("");
//   const [editModal, setEditModal] = useState(null);
//   const [editForm, setEditForm] = useState({ status: "", notes: "" });
//   const [editLoading, setEditLoading] = useState(false);
//   const [toast, setToast] = useState(null); // { success, message, name, nim }

//   const showToast = (result) => {
//     setToast(result);
//     setTimeout(() => setToast(null), 4000);
//   };

//   const fetchActivity = async () => {
//     try {
//       setLoading(true);
//       const res = await getActivityById(activityId);
//       setActivity(res.data);
//       setAttendances(res.data.attendances || []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchActivity();
//   }, [activityId]);

//   const handleScan = useCallback(
//     async (userId) => {
//       if (scanLoading) return;
//       if (userId === lastScannedRef.current) return;
//       lastScannedRef.current = userId;
//       setTimeout(() => {
//         lastScannedRef.current = "";
//       }, 3000);

//       try {
//         setScanLoading(true);
//         setScanResult(null);

//         await scanAttendance({ userId: userId.trim(), activityId });

//         // Fetch ulang activity untuk dapat data user terbaru
//         const refreshed = await getActivityById(activityId);
//         const updatedAttendances = refreshed.data.attendances || [];
//         setAttendances(updatedAttendances);
//         setActivity(refreshed.data);

//         // Cari user dari attendances yang sudah direfresh
//         const found = updatedAttendances.find(
//           (a) => a.user?.id === userId.trim(),
//         );

//         const name =
//           found?.user?.profile?.fullName || found?.user?.email || "—";
//         const nim = found?.user?.profile?.nim || "—";

//         const result = {
//           success: true,
//           message: "Absensi berhasil dicatat!",
//           name,
//           nim,
//         };
//         setScanResult(result);
//         showToast(result);
//       } catch (err) {
//         const result = {
//           success: false,
//           message:
//             err?.response?.data?.message ||
//             "QR tidak valid atau user tidak ditemukan.",
//         };
//         setScanResult(result);
//         showToast(result);
//       } finally {
//         setScanLoading(false);
//         setTimeout(() => setScanResult(null), 5000);
//       }
//     },
//     [activityId, scanLoading],
//   );

//   const handleOpenEdit = (att) => {
//     setEditModal(att);
//     setEditForm({ status: att.status, notes: att.notes || "" });
//   };

//   const handleSaveEdit = async () => {
//     try {
//       setEditLoading(true);
//       await updateAttendance(editModal.id, editForm);
//       setEditModal(null);
//       fetchActivity();
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setEditLoading(false);
//     }
//   };

//   const fmt = (d, type) =>
//     !d
//       ? "-"
//       : type === "date"
//         ? new Date(d).toLocaleDateString("id-ID", {
//             day: "2-digit",
//             month: "2-digit",
//             year: "numeric",
//           })
//         : new Date(d).toLocaleTimeString("id-ID", {
//             hour: "2-digit",
//             minute: "2-digit",
//           });

//   const stats = {
//     present: attendances.filter((a) => a.status === "PRESENT").length,
//     absent: attendances.filter((a) => a.status === "ABSENT").length,
//     sick: attendances.filter((a) => a.status === "SICK").length,
//     excused: attendances.filter((a) => a.status === "EXCUSED").length,
//   };

//   return (
//     <AdminLayout>
//       <div
//         className="fixed top-4 left-1/2 z-[100] flex flex-col gap-2 pointer-events-none"
//         style={{
//           transform: "translateX(-50%)",
//           minWidth: "280px",
//           maxWidth: "380px",
//         }}
//       >
//         {toast && (
//           <div
//             className="flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl pointer-events-auto transition-all duration-300"
//             style={{
//               background: toast.success ? "#dcfce7" : "#fee2e2",
//               border: `1.5px solid ${toast.success ? "#86efac" : "#fca5a5"}`,
//               animation: "slideDown 0.3s ease",
//             }}
//           >
//             {toast.success ? (
//               <CheckCircle
//                 size={20}
//                 className="text-green-600 shrink-0 mt-0.5"
//               />
//             ) : (
//               <XCircle size={20} className="text-red-500   shrink-0 mt-0.5" />
//             )}
//             <div className="flex-1 min-w-0">
//               <p
//                 className="text-xs font-bold"
//                 style={{ color: toast.success ? "#16a34a" : "#dc2626" }}
//               >
//                 {toast.message}
//               </p>
//               {toast.success && (toast.name !== "—" || toast.nim !== "—") && (
//                 <p className="text-xs text-gray-600 mt-0.5 truncate">
//                   {toast.name} · {toast.nim}
//                 </p>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       <style>{`
//     @keyframes slideDown {
//       from { opacity: 0; transform: translateY(-12px); }
//       to   { opacity: 1; transform: translateY(0);     }
//     }
//     @keyframes scanline {
//       0%, 100% { top: 10%; }
//       50%       { top: 88%; }
//     }
//   `}</style>

//       <div className="min-h-screen flex flex-col gap-4 pt-10 md:pt-4 pb-10">
//         {/* TOP */}
//         <div className="flex items-center justify-between gap-3">
//           <button
//             onClick={() => navigate(-1)}
//             className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
//           >
//             <ArrowLeft size={16} /> Back
//           </button>
//         </div>

//         {/* ACTIVITY */}
//         {activity && (
//           <div>
//             <h2 className="text-white font-bold text-lg">{activity.name}</h2>
//             <p className="text-white/50 text-xs mt-0.5">
//               Deadline: {fmt(activity.deadline, "date")}
//             </p>
//           </div>
//         )}

//         {/* STATS */}
//         <div className="grid grid-cols-4 gap-3">
//           {[
//             {
//               label: "Hadir",
//               value: stats.present,
//               color: "#16a34a",
//               bg: "#dcfce7",
//             },
//             {
//               label: "Alfa",
//               value: stats.absent,
//               color: "#dc2626",
//               bg: "#fee2e2",
//             },
//             {
//               label: "Sakit",
//               value: stats.sick,
//               color: "#d97706",
//               bg: "#fef3c7",
//             },
//             {
//               label: "Izin",
//               value: stats.excused,
//               color: "#2563eb",
//               bg: "#dbeafe",
//             },
//           ].map((s) => (
//             <div
//               key={s.label}
//               className="rounded-xl px-3 py-3 flex flex-col items-center gap-1"
//               style={{ background: s.bg }}
//             >
//               <span className="text-xl font-bold" style={{ color: s.color }}>
//                 {s.value}
//               </span>
//               <span
//                 className="text-xs font-semibold"
//                 style={{ color: s.color }}
//               >
//                 {s.label}
//               </span>
//             </div>
//           ))}
//         </div>

//         {/* TABS */}
//         <div className="flex gap-2">
//           {["scan", "list"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => {
//                 setActiveTab(tab);
//                 if (tab !== "scan") setCameraOn(false);
//               }}
//               className="px-5 py-2 rounded-full text-xs font-semibold transition-all"
//               style={
//                 activeTab === tab
//                   ? { background: "#6E3FBF", color: "white" }
//                   : {
//                       background: "rgba(255,255,255,0.1)",
//                       color: "rgba(255,255,255,0.6)",
//                     }
//               }
//             >
//               {tab === "scan" ? "Scan QR" : "Daftar Hadir"}
//             </button>
//           ))}
//         </div>

//         {/* TAB SCAN */}
//         {activeTab === "scan" && (
//           <div
//             className="flex flex-col gap-5 px-5 md:px-8 py-6"
//             style={{
//               background: "white",
//               borderRadius: "16px",
//               boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
//             }}
//           >
//             <div>
//               <p className="text-gray-800 font-bold text-sm">
//                 Scan QR Code User
//               </p>
//               <p className="text-gray-500 text-xs mt-1">
//                 Aktifkan kamera lalu arahkan ke QR Code user.
//               </p>
//             </div>

//             {/* Toggle */}
//             <button
//               onClick={() => setCameraOn((v) => !v)}
//               className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-80 active:scale-95"
//               style={{ background: cameraOn ? "#6b7280" : "#6E3FBF" }}
//             >
//               {cameraOn ? (
//                 <>
//                   <CameraOff size={16} /> Matikan Kamera
//                 </>
//               ) : (
//                 <>
//                   <Camera size={16} /> Aktifkan Kamera
//                 </>
//               )}
//             </button>

//             {/* Scanner component — hanya mount saat cameraOn */}
//             {cameraOn && <QrScanner onScan={handleScan} />}

//             {/* Placeholder */}
//             {!cameraOn && (
//               <div
//                 className="w-full rounded-xl flex flex-col items-center justify-center gap-3 py-10"
//                 style={{
//                   background: "rgba(0,0,0,0.04)",
//                   border: "2px dashed rgba(0,0,0,0.12)",
//                 }}
//               >
//                 <Camera size={36} className="text-gray-300" />
//                 <p className="text-gray-400 text-xs text-center">
//                   Kamera belum aktif.
//                   <br />
//                   Tekan tombol di atas untuk mulai scan.
//                 </p>
//               </div>
//             )}

//             {/* Loading API */}
//             {scanLoading && (
//               <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-50 border border-purple-200">
//                 <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
//                 <p className="text-xs text-purple-600 font-medium">
//                   Memproses absensi...
//                 </p>
//               </div>
//             )}

//             {/* Hasil */}
//             {scanResult && (
//               <div
//                 className="flex items-start gap-3 px-4 py-3 rounded-xl"
//                 style={{
//                   background: scanResult.success ? "#dcfce7" : "#fee2e2",
//                   border: `1px solid ${scanResult.success ? "#86efac" : "#fca5a5"}`,
//                 }}
//               >
//                 {scanResult.success ? (
//                   <CheckCircle
//                     size={20}
//                     className="text-green-600 shrink-0 mt-0.5"
//                   />
//                 ) : (
//                   <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
//                 )}
//                 <div>
//                   <p
//                     className="text-xs font-bold"
//                     style={{
//                       color: scanResult.success ? "#16a34a" : "#dc2626",
//                     }}
//                   >
//                     {scanResult.message}
//                   </p>
//                   {scanResult.success && (
//                     <p className="text-xs text-gray-600 mt-0.5">
//                       {scanResult.name} · {scanResult.nim}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             )}

//             <p className="text-gray-400 text-[11px] leading-relaxed">
//               💡 <strong>Laptop:</strong> Pastikan tidak ada aplikasi lain yang
//               memakai kamera (Zoom, Meet, dll).
//             </p>
//           </div>
//         )}

//         {/* TAB LIST */}
//         {activeTab === "list" && (
//           <div
//             style={{
//               background: "white",
//               borderRadius: "16px",
//               boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
//             }}
//           >
//             <div
//               className="px-5 py-4 border-b"
//               style={{ borderColor: "rgba(0,0,0,0.06)" }}
//             >
//               <p className="text-gray-800 font-bold text-sm">
//                 Daftar Kehadiran
//               </p>
//               <p className="text-gray-400 text-xs mt-0.5">
//                 {attendances.length} peserta terdaftar
//               </p>
//             </div>
//             <div className="hidden md:block overflow-x-auto">
//               <table className="w-full text-sm min-w-[560px]">
//                 <thead>
//                   <tr style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}>
//                     {["No", "Nama", "NIM", "Check-in", "Status", "Action"].map(
//                       (col) => (
//                         <th
//                           key={col}
//                           className="p-4 text-xs font-bold text-gray-700 whitespace-nowrap"
//                           style={{
//                             textAlign: col === "Nama" ? "left" : "center",
//                           }}
//                         >
//                           {col}
//                         </th>
//                       ),
//                     )}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td
//                         colSpan={6}
//                         className="text-center py-10 text-gray-400 text-sm"
//                       >
//                         Memuat...
//                       </td>
//                     </tr>
//                   ) : attendances.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={6}
//                         className="text-center py-10 text-gray-400 text-sm"
//                       >
//                         Belum ada data.
//                       </td>
//                     </tr>
//                   ) : (
//                     attendances.map((att, i) => (
//                       <tr
//                         key={att.id}
//                         className="hover:bg-purple-50 transition-colors"
//                         style={{
//                           borderBottom:
//                             i < attendances.length - 1
//                               ? "1px solid rgba(0,0,0,0.05)"
//                               : "none",
//                         }}
//                       >
//                         <td className="p-4 text-gray-500 text-xs text-center">
//                           {i + 1}
//                         </td>
//                         <td className="p-4 text-gray-800 text-xs whitespace-nowrap">
//                           {att.user?.profile?.fullName ||
//                             att.user?.email ||
//                             "-"}
//                         </td>
//                         <td className="p-4 text-gray-500 text-xs text-center">
//                           {att.user?.profile?.nim || "-"}
//                         </td>
//                         <td className="p-4 text-gray-500 text-xs text-center whitespace-nowrap">
//                           {att.checkInTime
//                             ? `${fmt(att.checkInTime, "date")} ${fmt(att.checkInTime, "time")}`
//                             : "-"}
//                         </td>
//                         <td className="p-4 text-center">
//                           <StatusBadge status={att.status} />
//                         </td>
//                         <td className="p-4 text-center">
//                           <button
//                             onClick={() => handleOpenEdit(att)}
//                             className="flex items-center gap-1 mx-auto px-3 py-1 rounded-full text-xs font-semibold text-white hover:brightness-110"
//                             style={{ background: "#7B2FBE" }}
//                           >
//                             <FileText size={11} /> Edit
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile list */}
//             <div className="md:hidden flex flex-col divide-y divide-black/5">
//               {loading ? (
//                 <p className="text-center py-10 text-gray-400 text-sm">
//                   Memuat...
//                 </p>
//               ) : attendances.length === 0 ? (
//                 <p className="text-center py-10 text-gray-400 text-sm">
//                   Belum ada data.
//                 </p>
//               ) : (
//                 attendances.map((att) => (
//                   <div
//                     key={att.id}
//                     className="px-5 py-4 flex items-center justify-between gap-3"
//                   >
//                     <div className="flex flex-col gap-1 flex-1 min-w-0">
//                       <p className="text-gray-800 text-sm font-semibold truncate">
//                         {att.user?.profile?.fullName || att.user?.email || "-"}
//                       </p>
//                       <p className="text-gray-400 text-xs">
//                         NIM: {att.user?.profile?.nim || "-"}
//                       </p>
//                       <p className="text-gray-400 text-xs">
//                         {att.checkInTime
//                           ? `${fmt(att.checkInTime, "date")} ${fmt(att.checkInTime, "time")}`
//                           : "Belum check-in"}
//                       </p>
//                     </div>
//                     <div className="flex flex-col items-end gap-2 shrink-0">
//                       <StatusBadge status={att.status} />
//                       <button
//                         onClick={() => handleOpenEdit(att)}
//                         className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white"
//                         style={{ background: "#7B2FBE" }}
//                       >
//                         <FileText size={11} /> Edit
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* MODAL EDIT */}
//       {editModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
//           <div className="bg-white rounded-2xl px-8 py-7 flex flex-col gap-5 max-w-sm w-full shadow-2xl">
//             <div>
//               <p className="text-gray-800 font-bold text-sm">
//                 Edit Kehadiran Manual
//               </p>
//               <p className="text-gray-500 text-xs mt-0.5">
//                 {editModal.user?.profile?.fullName ||
//                   editModal.user?.email ||
//                   "-"}
//                 {editModal.user?.profile?.nim
//                   ? ` · ${editModal.user.profile.nim}`
//                   : ""}
//               </p>
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="text-gray-700 font-semibold text-xs">
//                 Status
//               </label>
//               <select
//                 value={editForm.status}
//                 onChange={(e) =>
//                   setEditForm((p) => ({ ...p, status: e.target.value }))
//                 }
//                 className="w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 outline-none"
//                 style={{ border: "1px solid rgba(0,0,0,0.12)" }}
//               >
//                 <option value="PRESENT">Hadir</option>
//                 <option value="ABSENT">Alfa</option>
//                 <option value="SICK">Sakit</option>
//                 <option value="EXCUSED">Izin</option>
//               </select>
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <label className="text-gray-700 font-semibold text-xs">
//                 Catatan (opsional)
//               </label>
//               <textarea
//                 rows={3}
//                 placeholder="Contoh: Sakit dengan surat dokter"
//                 value={editForm.notes}
//                 onChange={(e) =>
//                   setEditForm((p) => ({ ...p, notes: e.target.value }))
//                 }
//                 className="w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 outline-none resize-none"
//                 style={{ border: "1px solid rgba(0,0,0,0.12)" }}
//               />
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setEditModal(null)}
//                 className="flex-1 py-2.5 rounded-full text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
//               >
//                 Batal
//               </button>
//               <button
//                 onClick={handleSaveEdit}
//                 disabled={editLoading}
//                 className="flex-1 py-2.5 rounded-full text-xs font-semibold text-white hover:opacity-80 disabled:opacity-40"
//                 style={{ background: "#FF00FF" }}
//               >
//                 {editLoading ? "Menyimpan..." : "Simpan"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </AdminLayout>
//   );
// }
