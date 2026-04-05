import { useState, useEffect } from "react";
import { Search, User, Download, ChevronDown, BarChart2, X } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";
import { getAllUsers } from "../../services/adminServices";
import {
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
  getAllProgramStudi,
} from "../../services/userServices";
import api from "../../components/api/axios";
import * as XLSX from "xlsx";

const getAllVerifications = () => api.get("/verification/admin/list");
const getAllPayments      = () => api.get("/payments");
const getAllAssignments   = () => api.get("/assignments");

const ROWS_PER_PAGE = 10;

const columns = ["Foto", "Nama", "NIM", "Email", "No. WA", "Fakultas", "Program Studi", "Sub Divisi"];

const FAKULTAS_LABEL = {
  PERTANIAN:            "Pertanian",
  KEDOKTERAN:           "Kedokteran",
  MIPA:                 "MIPA",
  PETERNAKAN:           "Peternakan",
  TEKNIK:               "Teknik",
  TEKNOLOGI_PERTANIAN:  "Teknologi Pertanian",
  FARMASI:              "Farmasi",
  TEKNOLOGI_INFORMASI:  "Teknologi Informasi",
  KEPERAWATAN:          "Keperawatan",
  KESEHATAN_MASYARAKAT: "Kesehatan Masyarakat",
  KEDOKTERAN_GIGI:      "Kedokteran Gigi",
};

// Warna untuk chart
const CHART_COLORS = [
  "#7B2FBE", "#FF00FF", "#22C55E", "#F59E0B", "#3B82F6",
  "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
  "#6366F1", "#84CC16",
];

// ── Modal Preview Foto ────────────────────────────────────────────
function PhotoPreviewModal({ avatarUrl, fullName, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center gap-3 p-4 rounded-2xl"
        style={{ background: "white", boxShadow: "0 8px 40px rgba(0,0,0,0.25)", maxWidth: "90vw" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-lg leading-none"
        >×</button>
        <img
          src={avatarUrl}
          alt={fullName || "foto profil"}
          className="rounded-xl object-cover"
          style={{ width: "260px", height: "260px", border: "2px solid rgba(123,47,190,0.2)" }}
        />
        {fullName && (
          <p className="text-sm font-semibold text-gray-700 text-center pb-1">{fullName}</p>
        )}
      </div>
    </div>
  );
}

// ── Avatar kecil ─────────────────────────────────────────────────
function UserAvatar({ avatarUrl, fullName }) {
  const [imgError,   setImgError]   = useState(false);
  const [showModal,  setShowModal]  = useState(false);

  const initials = fullName
    ? fullName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  return (
    <>
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={fullName || "avatar"}
          onError={() => setImgError(true)}
          onClick={() => setShowModal(true)}
          className="w-8 h-8 rounded-full object-cover shrink-0 cursor-pointer transition-transform hover:scale-110"
          style={{ border: "1.5px solid rgba(123,47,190,0.25)" }}
          title="Klik untuk lihat foto"
        />
      ) : (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
          style={{
            background: "rgba(123,47,190,0.12)",
            border: "1.5px solid rgba(123,47,190,0.25)",
            color: "#7B2FBE",
          }}
        >
          {initials}
        </div>
      )}
      {showModal && avatarUrl && !imgError && (
        <PhotoPreviewModal avatarUrl={avatarUrl} fullName={fullName} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

// ── Bar Chart horizontal ──────────────────────────────────────────
function HorizontalBar({ label, value, total, color, rank }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-500 text-[10px] w-4 text-right shrink-0">{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-700 text-xs font-medium truncate pr-2">{label}</span>
          <span className="text-gray-500 text-[10px] shrink-0">{value} ({pct.toFixed(1)}%)</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Modal Statistik ───────────────────────────────────────────────
function StatistikModal({ users, programStudiMap, onClose }) {
  const [activeTab, setActiveTab] = useState("fakultas");

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const userOnly = users.filter((u) => u.role === "USER" && u.profile);

  // ── Data Fakultas ─────────────────────────────────────────────
  const fakultasCount = {};
  userOnly.forEach((u) => {
    const f = u.profile?.fakultas || "Tidak Diisi";
    const label = FAKULTAS_LABEL[f] || f;
    fakultasCount[label] = (fakultasCount[label] || 0) + 1;
  });
  const fakultasData = Object.entries(fakultasCount)
    .sort((a, b) => b[1] - a[1]);

  // ── Data Program Studi ────────────────────────────────────────
  const prodiCount = {};
  userOnly.forEach((u) => {
    const name = programStudiMap[u.profile?.studyProgramId] || "Tidak Diisi";
    prodiCount[name] = (prodiCount[name] || 0) + 1;
  });
  const prodiData = Object.entries(prodiCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15); // top 15

  // ── Data Angkatan ─────────────────────────────────────────────
  const angkatanCount = {};
  userOnly.forEach((u) => {
    const nim = u.profile?.nim || "";
    const angkatan = nim.length >= 2 ? `20${nim.slice(0, 2)}` : "Tidak Diisi";
    angkatanCount[angkatan] = (angkatanCount[angkatan] || 0) + 1;
  });
  const angkatanData = Object.entries(angkatanCount)
    .sort((a, b) => a[0].localeCompare(b[0]));

  const total = userOnly.length;

  const tabs = [
    { key: "fakultas", label: "Fakultas" },
    { key: "prodi",    label: "Program Studi" },
    { key: "angkatan", label: "Angkatan" },
  ];

  const currentData =
    activeTab === "fakultas" ? fakultasData :
    activeTab === "prodi"    ? prodiData    :
    angkatanData;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full flex flex-col rounded-2xl overflow-hidden"
        style={{
          maxWidth: "560px",
          maxHeight: "85vh",
          background: "white",
          boxShadow: "0 16px 60px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
        >
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-purple-600" />
            <span className="font-bold text-gray-800 text-sm">Statistik Pendaftar</span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: "rgba(123,47,190,0.1)", color: "#7B2FBE" }}
            >
              {total} user
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 px-5 pt-3 pb-0 shrink-0"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="px-3 pb-2 text-xs font-semibold transition-colors relative"
              style={{
                color: activeTab === t.key ? "#7B2FBE" : "#9CA3AF",
                borderBottom: activeTab === t.key ? "2px solid #7B2FBE" : "2px solid transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {currentData.length === 0 ? (
            <p className="text-gray-400 text-xs text-center py-8">Belum ada data.</p>
          ) : (
            currentData.map(([label, value], i) => (
              <HorizontalBar
                key={label}
                rank={i + 1}
                label={label}
                value={value}
                total={total}
                color={CHART_COLORS[i % CHART_COLORS.length]}
              />
            ))
          )}
        </div>

        {/* Footer info */}
        <div
          className="px-5 py-3 shrink-0 text-center"
          style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
        >
          <span className="text-[10px] text-gray-400">
            {activeTab === "prodi" && prodiData.length < Object.keys(prodiCount).length
              ? `Menampilkan top ${prodiData.length} dari ${Object.keys(prodiCount).length} program studi`
              : `Total ${total} pendaftar`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────
export default function DashboardAdmin() {
  const [search,          setSearch]          = useState("");
  const [users,           setUsers]           = useState([]);
  const [divisions,       setDivisions]       = useState([]);
  const [subDivisionMap,  setSubDivisionMap]  = useState({});
  const [programStudiMap, setProgramStudiMap] = useState({});
  const [activeTabIndex,  setActiveTabIndex]  = useState(0);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [loading,         setLoading]         = useState(true);
  const [exportMenuOpen,  setExportMenuOpen]  = useState(false);
  const [showStatistik,   setShowStatistik]   = useState(false);
  const [stats, setStats] = useState([
    { label: "Total Pendaftar",  value: "-" },
    { label: "Lulus Verifikasi", value: "-" },
    { label: "Sudah Bayar",      value: "-" },
    { label: "Tugas Masuk",      value: "-" },
  ]);

  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  // ── FETCH ──────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [usersRes, deptRes, verifRes, paymentsRes, assignmentsRes, prodiRes] =
          await Promise.all([
            getAllUsers(),
            getDepartments(),
            getAllVerifications().catch(() => ({ data: [] })),
            getAllPayments().catch(() => ({ data: [] })),
            getAllAssignments().catch(() => ({ data: [] })),
            getAllProgramStudi().catch(() => ({ data: [] })),
          ]);

        const allUsers = usersRes.data;
        setUsers(allUsers);

        const prodiMap = {};
        (prodiRes.data ?? []).forEach((ps) => { prodiMap[ps.id] = ps.name; });
        setProgramStudiMap(prodiMap);

        const totalPendaftar = allUsers.filter((u) => u.role === "USER").length;
        const latestVerifPerUser = Object.values(
          verifRes.data.reduce((acc, v) => {
            if (!acc[v.userId] || new Date(v.createdAt) > new Date(acc[v.userId].createdAt)) {
              acc[v.userId] = v;
            }
            return acc;
          }, {})
        );
        const lulusVerifikasi = latestVerifPerUser.filter((v) => v.status === "APPROVED").length;
        const sudahBayar      = paymentsRes.data.filter((p) => p.status === "APPROVED" || p.status === "PAID").length;
        const tugasMasuk      = assignmentsRes.data.reduce((acc, a) => acc + (a._count?.submissions || 0), 0);

        setStats([
          { label: "Total Pendaftar",  value: totalPendaftar },
          { label: "Lulus Verifikasi", value: lulusVerifikasi },
          { label: "Sudah Bayar",      value: sudahBayar },
          { label: "Tugas Masuk",      value: tugasMasuk },
        ]);

        const opDept = deptRes.data.find((d) => d.name.toLowerCase().includes("operasional"));
        if (opDept) {
          const divRes = await getDivisionsByDepartment(opDept.id);
          const divList = divRes.data;
          setDivisions(divList);

          const subMap = {};
          await Promise.all(
            divList.map(async (div) => {
              const subRes = await getSubDivisionsByDivision(div.id);
              subMap[div.id] = subRes.data;
            })
          );
          setSubDivisionMap(subMap);
        }
      } catch (err) {
        console.error("Gagal fetch data dashboard admin:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────
  const getSubDivisionName = (subDivisionId) => {
    for (const subs of Object.values(subDivisionMap)) {
      const found = subs.find((s) => s.id === subDivisionId);
      if (found) return found.name;
    }
    return "-";
  };

  const getFakultasLabel    = (f)  => FAKULTAS_LABEL[f] || f || "-";
  const getProgramStudiName = (id) => programStudiMap[id] || "-";

  // ── Filter ─────────────────────────────────────────────────────
  const activeDivision = divisions[activeTabIndex];

  const filteredUsers = users.filter((u) => {
    if (!u.profile || u.role !== "USER") return false;
    if (activeDivision && u.profile.subDivisionId) {
      const subIds = (subDivisionMap[activeDivision.id] || []).map((s) => s.id);
      if (!subIds.includes(u.profile.subDivisionId)) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        u.profile?.fullName?.toLowerCase().includes(q) ||
        u.profile?.nim?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.profile?.whatsappNumber?.toLowerCase().includes(q) ||
        getProgramStudiName(u.profile?.studyProgramId)?.toLowerCase().includes(q) ||
        FAKULTAS_LABEL[u.profile?.fakultas]?.toLowerCase().includes(q) ||
        u.profile?.fakultas?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aH = !!a.profile?.subDivisionId;
    const bH = !!b.profile?.subDivisionId;
    return aH === bH ? 0 : aH ? -1 : 1;
  });

  // ── Pagination ─────────────────────────────────────────────────
  const totalPages    = Math.ceil(sortedUsers.length / ROWS_PER_PAGE);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleTabChange = (_, i) => { setActiveTabIndex(i); setCurrentPage(1); setSearch(""); };
  const handleSearch    = (e)    => { setSearch(e.target.value); setCurrentPage(1); };

  // ── Export helpers ─────────────────────────────────────────────
  const buildRows = (userList) =>
    userList.map((u) => ({
      Nama:            u.profile?.fullName || "-",
      NIM:             u.profile?.nim || "-",
      Email:           u.email || "-",
      "No. WA":        u.profile?.whatsappNumber || "-",
      Fakultas:        getFakultasLabel(u.profile?.fakultas),
      "Program Studi": getProgramStudiName(u.profile?.studyProgramId),
      "Sub Divisi":    getSubDivisionName(u.profile?.subDivisionId),
    }));

  const applyHeaderStyle = (ws, headers) => {
    headers.forEach((_, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      if (!ws[cellRef]) return;
      ws[cellRef].s = {
        font:      { bold: true, color: { rgb: "FFFFFF" }, name: "Arial", sz: 11 },
        fill:      { fgColor: { rgb: "7B2FBE" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border:    { bottom: { style: "thin", color: { rgb: "5A1F9A" } } },
      };
    });
  };

  const setColWidths = (ws, headers) => {
    ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 4, 18) }));
  };

  const handleExportCurrentDivision = () => {
    const divName = activeDivision?.name || "Semua";
    const rows = buildRows(sortedUsers);
    if (rows.length === 0) { alert("Tidak ada data untuk diekspor."); return; }

    const ws = XLSX.utils.json_to_sheet(rows);
    const headers = Object.keys(rows[0]);
    applyHeaderStyle(ws, headers);
    setColWidths(ws, headers);
    ws["!rows"] = [{ hpt: 22 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, divName.slice(0, 31));
    XLSX.writeFile(wb, `Data_Pendaftar_${divName}_${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}.xlsx`);
    setExportMenuOpen(false);
  };

  const handleExportAllDivisions = () => {
    const wb = XLSX.utils.book_new();
    const headers = ["Nama", "NIM", "Email", "No. WA", "Fakultas", "Program Studi", "Sub Divisi"];

    divisions.forEach((div) => {
      const divUsers = users
        .filter((u) => {
          if (!u.profile || u.role !== "USER") return false;
          if (!u.profile.subDivisionId) return true;
          return (subDivisionMap[div.id] || []).some((s) => s.id === u.profile.subDivisionId);
        })
        .sort((a, b) => (!!a.profile?.subDivisionId === !!b.profile?.subDivisionId ? 0 : !!a.profile?.subDivisionId ? -1 : 1));

      const rows = buildRows(divUsers);
      const ws = rows.length > 0
        ? XLSX.utils.json_to_sheet(rows)
        : XLSX.utils.json_to_sheet([Object.fromEntries(headers.map((h) => [h, ""]))]);

      applyHeaderStyle(ws, headers);
      setColWidths(ws, headers);
      ws["!rows"] = [{ hpt: 22 }];
      XLSX.utils.book_append_sheet(wb, ws, div.name.slice(0, 31));
    });

    XLSX.writeFile(wb, `Data_Semua_Divisi_${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}.xlsx`);
    setExportMenuOpen(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white/60 text-sm animate-pulse">Memuat data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col gap-6 pt-10 md:pt-4">

        {/* TOP RIGHT */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-white font-semibold text-sm">{adminUser.email || "Admin"}</span>
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <User size={18} className="text-white/70" />
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center gap-1 py-5 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1.5px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
              }}
            >
              <span className="text-white font-bold text-2xl lg:text-3xl">{s.value}</span>
              <span className="text-white/60 text-xs text-center px-2">{s.label}</span>
            </div>
          ))}
        </div>

        {/* TABLE SECTION */}
        <div className="mt-5">
          <div className="relative rounded-2xl overflow-visible">
            <DivisionTabs
              divisions={divisions.map((d) => d.name)}
              bgColor="#1a0023"
              onChange={handleTabChange}
            >
              <div className="rounded-b-2xl overflow-hidden flex flex-col bg-white">

                {/* ── TOOLBAR: Search + Statistik + Export ─────────────────
                    Mobile: wrap ke 2 baris
                    Desktop: 1 baris penuh
                ─────────────────────────────────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-2 p-3 md:p-4">

                  {/* Search — ambil sisa ruang */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-full flex-1 min-w-0"
                    style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.10)", minWidth: "120px" }}
                  >
                    <input
                      type="text"
                      placeholder="Search nama, NIM, email..."
                      value={search}
                      onChange={handleSearch}
                      className="bg-transparent text-xs text-gray-600 outline-none flex-1 min-w-0 placeholder-gray-400"
                    />
                    <Search size={13} className="text-gray-400 shrink-0" />
                  </div>

                  {/* Tombol Statistik */}
                  <button
                    onClick={() => setShowStatistik(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all shrink-0 whitespace-nowrap"
                    style={{
                      background: "rgba(123,47,190,0.10)",
                      color: "#7B2FBE",
                      border: "1px solid rgba(123,47,190,0.25)",
                    }}
                  >
                    <BarChart2 size={13} />
                    <span>Statistik</span>
                  </button>

                  {/* ✅ FIX EXPORT MOBILE: tombol selalu tampil label + icon */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setExportMenuOpen((prev) => !prev)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
                      style={{ background: "#7B2FBE", color: "white", border: "1px solid #6a27a3" }}
                    >
                      <Download size={13} />
                      <span>Ekspor</span>
                      <ChevronDown
                        size={12}
                        style={{
                          transform: exportMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      />
                    </button>

                    {exportMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setExportMenuOpen(false)} />
                        <div
                          className="absolute right-0 mt-2 w-52 rounded-xl shadow-xl z-20 overflow-hidden"
                          style={{ background: "white", border: "1px solid rgba(0,0,0,0.09)" }}
                        >
                          <button
                            onClick={handleExportCurrentDivision}
                            className="w-full text-left px-4 py-3 text-xs text-gray-700 hover:bg-purple-50 transition-colors flex flex-col gap-0.5"
                          >
                            <span className="font-semibold text-purple-700">Ekspor Divisi Ini</span>
                            <span className="text-gray-400">{activeDivision?.name || "Semua"} · 1 sheet</span>
                          </button>
                          <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }} />
                          <button
                            onClick={handleExportAllDivisions}
                            className="w-full text-left px-4 py-3 text-xs text-gray-700 hover:bg-purple-50 transition-colors flex flex-col gap-0.5"
                          >
                            <span className="font-semibold text-purple-700">Ekspor Semua Divisi</span>
                            <span className="text-gray-400">{divisions.length} sheet</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}>
                        {columns.map((col) => (
                          <th key={col} className="text-left p-4 text-xs font-bold text-gray-700 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((user, i) => (
                        <tr
                          key={user.id}
                          className="transition-colors duration-150 hover:bg-purple-50 cursor-pointer"
                          style={{ borderBottom: i < paginatedUsers.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                        >
                          <td className="p-4">
                            <UserAvatar avatarUrl={user.profile?.avatarUrl} fullName={user.profile?.fullName} />
                          </td>
                          <td className="p-4 text-gray-800 text-xs whitespace-nowrap">{user.profile?.fullName || "-"}</td>
                          <td className="p-4 text-gray-600 text-xs whitespace-nowrap">{user.profile?.nim || "-"}</td>
                          <td className="p-4 text-gray-600 text-xs">{user.email || "-"}</td>
                          <td className="p-4 text-gray-600 text-xs whitespace-nowrap">{user.profile?.whatsappNumber || "-"}</td>
                          <td className="p-4 text-xs whitespace-nowrap">
                            {user.profile?.fakultas ? (
                              <span
                                className="px-2 py-1 rounded-md text-xs font-medium"
                                style={{ background: "rgba(123,47,190,0.08)", color: "#7B2FBE" }}
                              >
                                {getFakultasLabel(user.profile.fakultas)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-4 text-gray-600 text-xs whitespace-nowrap">
                            {getProgramStudiName(user.profile?.studyProgramId)}
                          </td>
                          <td className="p-4 text-gray-600 text-xs whitespace-nowrap">
                            {getSubDivisionName(user.profile?.subDivisionId)}
                          </td>
                        </tr>
                      ))}

                      {paginatedUsers.length === 0 && (
                        <tr>
                          <td colSpan={columns.length} className="text-center py-10 text-gray-400 text-sm">
                            {search ? "Tidak ada data yang cocok." : "Belum ada pendaftar di divisi ini."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ✅ FIX PAGINATION STYLING */}
                {totalPages > 1 && (
                  <div
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
                  >
                    {/* Info */}
                    <span className="text-xs text-gray-500">
                      {(currentPage - 1) * ROWS_PER_PAGE + 1}–
                      {Math.min(currentPage * ROWS_PER_PAGE, sortedUsers.length)} dari {sortedUsers.length}
                    </span>

                    {/* Tombol pagination */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {/* Prev */}
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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

                      {/* Nomor halaman */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, idx) =>
                          p === "..." ? (
                            <span key={`dot-${idx}`} className="px-2 text-xs text-gray-400 select-none">•••</span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setCurrentPage(p)}
                              className="w-8 h-8 text-xs rounded-lg font-semibold transition-all"
                              style={{
                                background: currentPage === p ? "#7B2FBE" : "rgba(0,0,0,0.04)",
                                color:      currentPage === p ? "white"   : "#374151",
                                border:     currentPage === p ? "1px solid #7B2FBE" : "1px solid rgba(0,0,0,0.10)",
                                boxShadow:  currentPage === p ? "0 2px 8px rgba(123,47,190,0.3)" : "none",
                              }}
                            >
                              {p}
                            </button>
                          )
                        )}

                      {/* Next */}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
        </div>
      </div>

      {/* Modal Statistik */}
      {showStatistik && (
        <StatistikModal
          users={users}
          programStudiMap={programStudiMap}
          onClose={() => setShowStatistik(false)}
        />
      )}
    </AdminLayout>
  );
}