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
  Download,
  ChevronDown,
} from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import {
  getActivityById,
  scanAttendance,
  updateAttendance,
} from "../../services/attendanceService";
import {
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
} from "../../services/userServices";
import { getAllUsers } from "../../services/adminServices";
import DivisionTabs from "../../components/admin/DivisionsTab";
import { Html5Qrcode } from "html5-qrcode";
import * as XLSX from "xlsx";

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

const ROWS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [divisions, setDivisions] = useState([]);
  const [subWithDivMap, setSubWithDivMap] = useState({}); // { subId: divisionId }
  const [activeDivisionId, setActiveDivisionId] = useState("all");

  const [subDivisionNameMap, setSubDivisionNameMap] = useState({}); // { subId: divName }
  const [userSubDivIdMap, setUserSubDivIdMap] = useState({}); // { userId: subDivisionId }
  const [activeTabDivisionIndex, setActiveTabDivisionIndex] = useState(0);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

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
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();

    const fetchDivisions = async () => {
      try {
        const [deptRes, usersRes] = await Promise.all([
          getDepartments(),
          getAllUsers(),
        ]);

        // Build userSubDivIdMap: { userId → subDivisionId }
        const uMap = {};
        usersRes.data.forEach((u) => {
          if (u.profile?.subDivisionId) uMap[u.id] = u.profile.subDivisionId;
        });
        setUserSubDivIdMap(uMap);

        const allDivisions = [];
        const subDivMap = {}; // { subId → divId }  — untuk filter tab
        const subNameMap = {}; // { subId → name }   — untuk tampil di kolom

        await Promise.all(
          deptRes.data.map(async (dept) => {
            try {
              const divRes = await getDivisionsByDepartment(dept.id);
              allDivisions.push(...divRes.data);
              await Promise.all(
                divRes.data.map(async (div) => {
                  const subRes = await getSubDivisionsByDivision(div.id);
                  subRes.data.forEach((sub) => {
                    subDivMap[sub.id] = div.id;
                    subNameMap[sub.id] = sub.name; // ← simpan nama
                  });
                }),
              );
            } catch {}
          }),
        );

        setDivisions(allDivisions);
        setSubWithDivMap(subDivMap);
        setSubDivisionNameMap(subNameMap);
      } catch {}
    };

    fetchDivisions();
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

  const STATUS_ORDER = { PRESENT: 0, EXCUSED: 1, SICK: 2, ABSENT: 3 };

  const activeDivision = divisions[activeTabDivisionIndex];
  const subIdsInActive = activeDivision
    ? Object.entries(subWithDivMap)
        .filter(([, divId]) => divId === activeDivision.id)
        .map(([subId]) => subId)
    : [];

  const filteredAttendances = attendances
    .filter((att) => {
      if (activeDivision) {
        // Gunakan userSubDivIdMap sama persis seperti PembayaranAdmin
        const userSubDivId = userSubDivIdMap[att.user?.id];
        if (userSubDivId && !subIdsInActive.includes(userSubDivId))
          return false;
      }
      const q = search.toLowerCase();
      if (!q) return true;
      const name = (
        att.user?.profile?.fullName ||
        att.user?.email ||
        ""
      ).toLowerCase();
      const nim = (att.user?.profile?.nim || "").toLowerCase();
      return name.includes(q) || nim.includes(q);
    })
    .sort((a, b) => {
      const orderA = STATUS_ORDER[a.status] ?? 99;
      const orderB = STATUS_ORDER[b.status] ?? 99;
      return orderA - orderB;
    });

  const totalPages = Math.ceil(filteredAttendances.length / ROWS_PER_PAGE);
  const paginatedAttendances = filteredAttendances.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ── Export Excel ────────────────────────────────────────────
  const STATUS_LABEL_EXPORT = {
    PRESENT: "Hadir",
    ABSENT: "Alfa",
    SICK: "Sakit",
    EXCUSED: "Izin",
  };

  const handleExportCurrentDivision = () => {
    const divName = activeDivision?.name || "Semua";
    const rows = filteredAttendances.map((att, i) => ({
      No: i + 1,
      Nama: att.user?.profile?.fullName || att.user?.email || "-",
      NIM: att.user?.profile?.nim || "-",
      "Sub Divisi": subDivisionNameMap[userSubDivIdMap[att.user?.id]] || "-",
      "Check-in": att.checkInTime
        ? `${fmt(att.checkInTime, "date")} ${fmt(att.checkInTime, "time")}`
        : "-",
      Status: STATUS_LABEL_EXPORT[att.status] ?? att.status,
      Catatan: att.notes || "-",
    }));

    if (rows.length === 0) {
      alert("Tidak ada data.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 5 },
      { wch: 28 },
      { wch: 16 },
      { wch: 18 },
      { wch: 20 },
      { wch: 10 },
      { wch: 30 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, divName.slice(0, 31));
    XLSX.writeFile(
      wb,
      `Absensi_${divName}_${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}.xlsx`,
    );
    setExportMenuOpen(false);
  };

  const handleExportAllDivisions = () => {
    const wb = XLSX.utils.book_new();

    divisions.forEach((div) => {
      const subIds = Object.entries(subWithDivMap)
        .filter(([, divId]) => divId === div.id)
        .map(([subId]) => subId);

      const divAttendances = attendances.filter((att) => {
        const userSubDivId = userSubDivIdMap[att.user?.id];
        return !userSubDivId || subIds.includes(userSubDivId);
      });

      const rows = divAttendances.map((att, i) => ({
        No: i + 1,
        Nama: att.user?.profile?.fullName || att.user?.email || "-",
        NIM: att.user?.profile?.nim || "-",
        "Sub Divisi": subDivisionNameMap[userSubDivIdMap[att.user?.id]] || "-",
        "Check-in": att.checkInTime
          ? `${fmt(att.checkInTime, "date")} ${fmt(att.checkInTime, "time")}`
          : "-",
        Status: STATUS_LABEL_EXPORT[att.status] ?? att.status,
        Catatan: att.notes || "-",
      }));

      const ws =
        rows.length > 0
          ? XLSX.utils.json_to_sheet(rows)
          : XLSX.utils.json_to_sheet([
              {
                No: "",
                Nama: "",
                NIM: "",
                "Sub Divisi": "",
                "Check-in": "",
                Status: "",
                Catatan: "",
              },
            ]);

      ws["!cols"] = [
        { wch: 5 },
        { wch: 28 },
        { wch: 16 },
        { wch: 18 },
        { wch: 20 },
        { wch: 10 },
        { wch: 30 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, div.name.slice(0, 31));
    });

    XLSX.writeFile(
      wb,
      `Absensi_Semua_Divisi_${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}.xlsx`,
    );
    setExportMenuOpen(false);
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
          <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
            <div
              className="flex flex-col items-center gap-3 px-8 py-6 rounded-3xl shadow-2xl pointer-events-auto"
              style={{
                background: toast.success ? "#fff" : "#fff",
                border: `2px solid ${toast.success ? "#86efac" : "#fca5a5"}`,
                minWidth: "260px",
                maxWidth: "340px",
                animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                boxShadow: toast.success
                  ? "0 8px 48px rgba(22,163,74,0.18)"
                  : "0 8px 48px rgba(220,38,38,0.18)",
              }}
            >
              {toast.success ? (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "#dcfce7" }}
                >
                  <CheckCircle size={36} className="text-green-500" />
                </div>
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "#fee2e2" }}
                >
                  <XCircle size={36} className="text-red-400" />
                </div>
              )}

              <p
                className="text-base font-bold text-center"
                style={{ color: toast.success ? "#16a34a" : "#dc2626" }}
              >
                {toast.message}
              </p>

              {toast.success && (toast.name !== "—" || toast.nim !== "—") && (
                <div className="flex flex-col items-center gap-0.5">
                  <p className="text-sm font-semibold text-gray-700">
                    {toast.name}
                  </p>
                  <p className="text-xs text-gray-400">{toast.nim}</p>
                </div>
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
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.8); }
      to   { opacity: 1; transform: scale(1);   }
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
              color: "#22c55e",
              glow: "rgba(34,197,94,0.25)",
            },
            {
              label: "Alfa",
              value: stats.absent,
              color: "#f87171",
              glow: "rgba(248,113,113,0.25)",
            },
            {
              label: "Sakit",
              value: stats.sick,
              color: "#fbbf24",
              glow: "rgba(251,191,36,0.25)",
            },
            {
              label: "Izin",
              value: stats.excused,
              color: "#60a5fa",
              glow: "rgba(96,165,250,0.25)",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl flex flex-col items-center justify-center gap-1 py-4"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: `1.5px solid ${s.glow}`,
                backdropFilter: "blur(12px)",
              }}
            >
              <span className="text-2xl font-bold" style={{ color: s.color }}>
                {s.value}
              </span>
              <span
                className="text-[11px] font-semibold"
                style={{ color: s.color, opacity: 0.85 }}
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
          <div className="mt-7">
            <DivisionTabs
              divisions={divisions.map((d) => d.name)}
              bgColor="#1a0023"
              onChange={(_, i) => {
                setActiveTabDivisionIndex(i);
                setCurrentPage(1);
                setSearch("");
              }}
            >
              <div
                className="flex flex-col bg-white"
                style={{
                  borderRadius: "0 0 16px 16px",
                  boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
                }}
              >
                {/* Header: judul + search + export */}
                <div
                  className="flex flex-wrap items-center gap-2 px-4 py-3 border-b"
                  style={{ borderColor: "rgba(0,0,0,0.06)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-bold text-sm">
                      Daftar Kehadiran
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {search
                        ? `${filteredAttendances.length} hasil`
                        : `${attendances.length} peserta terdaftar`}
                    </p>
                  </div>

                  {/* Search */}
                  <div
                    className="flex items-center gap-2 px-3 py-[7px] rounded-full"
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      border: "1px solid rgba(0,0,0,0.10)",
                      minWidth: "180px",
                      maxWidth: "260px",
                      flex: "1 1 180px",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Cari nama atau NIM..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-transparent text-xs text-gray-600 outline-none flex-1 min-w-0 placeholder-gray-400"
                    />
                  </div>

                  {/* Export Button */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setExportMenuOpen((p) => !p)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
                      style={{
                        background: "#7B2FBE",
                        color: "white",
                        border: "1px solid #6a27a3",
                      }}
                    >
                      <Download size={13} />
                      <span>Ekspor</span>
                      <ChevronDown
                        size={12}
                        style={{
                          transform: exportMenuOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      />
                    </button>

                    {exportMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setExportMenuOpen(false)}
                        />
                        <div
                          className="absolute z-[999] rounded-xl shadow-xl overflow-hidden"
                          style={{
                            background: "white",
                            border: "1px solid rgba(0,0,0,0.09)",
                            width: "220px",
                            top: "calc(100% + 8px)",
                            right: 0,
                          }}
                        >
                          <button
                            onClick={handleExportCurrentDivision}
                            className="w-full text-left px-4 py-3 text-xs text-gray-700 hover:bg-purple-50 transition-colors flex flex-col gap-0.5"
                          >
                            <span className="font-semibold text-purple-700">
                              Ekspor Divisi Ini
                            </span>
                            <span className="text-gray-400">
                              {activeDivision?.name || "Semua"}
                            </span>
                          </button>
                          <div
                            style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                          />
                          <button
                            onClick={handleExportAllDivisions}
                            className="w-full text-left px-4 py-3 text-xs text-gray-700 hover:bg-purple-50 transition-colors flex flex-col gap-0.5"
                          >
                            <span className="font-semibold text-purple-700">
                              Ekspor Semua Divisi
                            </span>
                            <span className="text-gray-400">
                              {divisions.length} sheet
                            </span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* TABLE — Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm min-w-[580px]">
                    <thead>
                      <tr
                        style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}
                      >
                        {[
                          "No",
                          "Nama",
                          "Sub Divisi",
                          "Check-in",
                          "Status",
                          "Action",
                        ].map((col) => (
                          <th
                            key={col}
                            className="p-4 text-xs font-bold text-gray-700 whitespace-nowrap"
                            style={{
                              textAlign: col === "Nama" ? "left" : "center",
                            }}
                          >
                            {col}
                          </th>
                        ))}
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
                      ) : filteredAttendances.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-10 text-gray-400 text-sm"
                          >
                            {search
                              ? "Tidak ada data yang cocok."
                              : "Belum ada data."}
                          </td>
                        </tr>
                      ) : (
                        paginatedAttendances.map((att, i) => {
                          // Ambil nama subdiv: prioritas dari relasi, fallback ke map
                          const userSubDivId =
                            userSubDivIdMap[att.user?.id] || // dari getAllUsers (paling reliable)
                            att.user?.profile?.subDivisionId; // fallback dari response attendance
                          const subDivName =
                            subDivisionNameMap[userSubDivId] || "-";
                          return (
                            <tr
                              key={att.id}
                              className="hover:bg-purple-50 transition-colors"
                              style={{
                                borderBottom:
                                  i < paginatedAttendances.length - 1
                                    ? "1px solid rgba(0,0,0,0.05)"
                                    : "none",
                              }}
                            >
                              <td className="p-4 text-gray-500 text-xs text-center">
                                {(currentPage - 1) * ROWS_PER_PAGE + i + 1}
                              </td>
                              <td className="p-4 text-xs whitespace-nowrap">
                                <div className="font-semibold text-gray-800">
                                  {att.user?.profile?.fullName ||
                                    att.user?.email ||
                                    "-"}
                                </div>
                                <div className="text-gray-400 text-[10px]">
                                  {att.user?.profile?.nim || ""}
                                </div>
                              </td>
                              <td className="p-4 text-gray-500 text-xs text-center whitespace-nowrap">
                                {subDivName}
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
                          );
                        })
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
                  ) : filteredAttendances.length === 0 ? (
                    <p className="text-center py-10 text-gray-400 text-sm">
                      {search
                        ? "Tidak ada data yang cocok."
                        : "Belum ada data."}
                    </p>
                  ) : (
                    paginatedAttendances.map((att) => {
                      const userSubDivId =
                        userSubDivIdMap[att.user?.id] || // dari getAllUsers (paling reliable)
                        att.user?.profile?.subDivisionId; // fallback dari response attendance
                      const subDivName =
                        subDivisionNameMap[userSubDivId] || "-";
                      return (
                        <div
                          key={att.id}
                          className="px-5 py-4 flex items-center justify-between gap-3"
                        >
                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <p className="text-gray-800 text-sm font-semibold truncate">
                              {att.user?.profile?.fullName ||
                                att.user?.email ||
                                "-"}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {att.user?.profile?.nim || ""} · {subDivName}
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
                      );
                    })
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
                  >
                    <span className="text-xs text-gray-500">
                      {(currentPage - 1) * ROWS_PER_PAGE + 1}–
                      {Math.min(
                        currentPage * ROWS_PER_PAGE,
                        filteredAttendances.length,
                      )}{" "}
                      dari {filteredAttendances.length}
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all disabled:opacity-40"
                        style={{
                          background: "rgba(123,47,190,0.08)",
                          color: "#7B2FBE",
                          border: "1px solid rgba(123,47,190,0.2)",
                        }}
                      >
                        ← Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - currentPage) <= 1,
                        )
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, idx) =>
                          p === "..." ? (
                            <span
                              key={`dot-${idx}`}
                              className="px-2 text-xs text-gray-400 select-none"
                            >
                              •••
                            </span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setCurrentPage(p)}
                              className="w-8 h-8 text-xs rounded-lg font-semibold transition-all"
                              style={{
                                background:
                                  currentPage === p
                                    ? "#7B2FBE"
                                    : "rgba(0,0,0,0.04)",
                                color: currentPage === p ? "white" : "#374151",
                                border:
                                  currentPage === p
                                    ? "1px solid #7B2FBE"
                                    : "1px solid rgba(0,0,0,0.10)",
                                boxShadow:
                                  currentPage === p
                                    ? "0 2px 8px rgba(123,47,190,0.3)"
                                    : "none",
                              }}
                            >
                              {p}
                            </button>
                          ),
                        )}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all disabled:opacity-40"
                        style={{
                          background: "rgba(123,47,190,0.08)",
                          color: "#7B2FBE",
                          border: "1px solid rgba(123,47,190,0.2)",
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </DivisionTabs>
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
