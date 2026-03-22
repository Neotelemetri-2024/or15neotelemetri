import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, User, ExternalLink, X, Check } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";
import { getAllVerifications, reviewVerification, getAllUsers } from "../../services/adminServices";
import { getDepartments, getDivisionsByDepartment, getSubDivisionsByDivision } from "../../services/userServices";

const ROWS_PER_PAGE = 10;

const columns = [
  "Nama",
  "KRS",
  "Foto Formal",
  "Bukti IG Neo",
  "Bukti IG Marketing",
  "Link Twibbon",
  "Status",
  "Aksi",
];

// Badge status verifikasi
function StatusBadge({ status }) {
  const map = {
    PENDING:  { label: "Menunggu", bg: "bg-yellow-100", text: "text-yellow-700" },
    APPROVED: { label: "Disetujui", bg: "bg-green-100",  text: "text-green-700" },
    REJECTED: { label: "Ditolak",   bg: "bg-red-100",    text: "text-red-600" },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

// Thumbnail dokumen — klik untuk buka di tab baru
function DocThumb({ url }) {
  if (!url) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
      <img
        src={url}
        alt="doc"
        className="w-12 h-12 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition mx-auto"
      />
    </a>
  );
}

// Modal reject — untuk input alasan penolakan
function RejectModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-gray-800 font-bold text-base mb-3">Alasan Penolakan</h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Tuliskan alasan penolakan..."
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-purple-400 resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(reason)}
            disabled={!reason.trim()}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-40"
          >
            Tolak
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifikasiAdmin() {
  const [verifications, setVerifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subDivisionMap, setSubDivisionMap] = useState({});
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  // ── FETCH ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [verifRes, usersRes, deptRes] = await Promise.all([
          getAllVerifications(),
          getAllUsers(),
          getDepartments(),
        ]);

        setVerifications(verifRes.data);
        setUsers(usersRes.data);

        // Cari department Operasional → fetch divisions + sub divisions
        const opDept = deptRes.data.find((d) =>
          d.name.toLowerCase().includes("operasional")
        );
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
        console.error("Gagal fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── APPROVE ────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await reviewVerification(id, { status: "APPROVED" });
      setVerifications((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: "APPROVED", rejectionReason: null } : v))
      );
      // Trigger re-render dengan update lokal
    } catch (err) {
      console.error("Gagal approve:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── REJECT ─────────────────────────────────────────────────────
  const handleReject = async (reason) => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget);
    try {
      await reviewVerification(rejectTarget, {
        status: "REJECTED",
        rejectionReason: reason,
      });
      setVerifications((prev) =>
        prev.map((v) =>
          v.id === rejectTarget
            ? { ...v, status: "REJECTED", rejectionReason: reason }
            : v
        )
      );
    } catch (err) {
      console.error("Gagal reject:", err);
    } finally {
      setActionLoading(null);
      setRejectTarget(null);
    }
  };

  // ── SEMUA USER dengan data verifikasi (merge) ──────────────────
  // Tampilkan semua user, yang belum submit verifikasi tetap muncul
  const activeDivision = divisions[activeTabIndex];

  const allRows = users
    .filter((u) => u.role === "USER")
    .filter((u) => {
      // Filter per tab divisi (sama dengan dashboard)
      if (activeDivision && u.profile?.subDivisionId) {
        const subIds = (subDivisionMap[activeDivision.id] || []).map((s) => s.id);
        return subIds.includes(u.profile.subDivisionId);
      }
      return true;
    })
    .map((u) => {
      // Cari data verifikasi milik user ini
      const verif = verifications.find((v) => v.userId === u.id) || null;
      return { user: u, verif };
    })
    // User dengan verifikasi PENDING di atas, lalu yang belum submit
    .sort((a, b) => {
      const order = { PENDING: 0, REJECTED: 1, APPROVED: 2, null: 3 };
      return (order[a.verif?.status ?? null] ?? 3) - (order[b.verif?.status ?? null] ?? 3);
    });

  // ── FILTER SEARCH ──────────────────────────────────────────────
  const filtered = allRows.filter((row) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      row.user?.profile?.fullName?.toLowerCase().includes(q) ||
      row.user?.email?.toLowerCase().includes(q)
    );
  });

  // ── PAGINATION ─────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
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
          <span className="text-white font-semibold text-sm">
            {adminUser.email || "Admin"}
          </span>
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <User size={18} className="text-white/70" />
          </div>
        </div>

        {/* TABLE */}
        <div className="mt-2">
          <DivisionTabs
            divisions={divisions.map((d) => d.name)}
            bgColor="#1a0023"
            onChange={(_, i) => { setActiveTabIndex(i); setCurrentPage(1); setSearch(""); }}
          >
            <div
              className="flex flex-col bg-white"
              style={{ borderRadius: "0 0 16px 16px" }}
            >
              {/* FILTER + SEARCH */}
              <div className="flex items-center gap-3 p-4">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110 shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                    boxShadow: "0 2px 10px rgba(120,0,200,0.25)",
                  }}
                >
                  <SlidersHorizontal size={13} />
                  Filter
                </button>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-full flex-1"
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.10)",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Search nama atau email..."
                    value={search}
                    onChange={handleSearch}
                    className="bg-transparent text-xs text-gray-600 outline-none flex-1 placeholder-gray-400"
                  />
                  <Search size={13} className="text-gray-400 shrink-0" />
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-xs font-bold text-gray-700 whitespace-nowrap"
                          style={{ textAlign: col === "Nama" ? "left" : "center" }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((row, i) => {
                      const { user: u, verif: v } = row;
                      return (
                      <tr
                        key={u.id}
                        className="transition-colors duration-150 hover:bg-purple-50"
                        style={{
                          borderBottom: i < paginated.length - 1
                            ? "1px solid rgba(0,0,0,0.05)"
                            : "none",
                        }}
                      >
                        {/* Nama */}
                        <td className="px-4 py-4 text-gray-800 text-xs whitespace-nowrap">
                          <div className="font-semibold">
                            {u.profile?.fullName || "-"}
                          </div>
                          <div className="text-gray-400 text-[10px]">{u.email}</div>
                          {v?.status === "REJECTED" && v?.rejectionReason && (
                            <div className="text-red-400 text-[10px] mt-1 max-w-[160px] truncate">
                              Alasan: {v.rejectionReason}
                            </div>
                          )}
                        </td>

                        {/* Dokumen */}
                        <td className="px-4 py-4 text-center">
                          <DocThumb url={v?.krsScanUrl} />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <DocThumb url={v?.formalPhotoUrl} />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <DocThumb url={v?.instagramProofUrl} />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <DocThumb url={v?.instagramMarketingProofUrl} />
                        </td>

                        {/* Link Twibbon */}
                        <td className="px-4 py-4 text-center">
                          {v?.twibbonLink ? (
                            <a
                              href={v.twibbonLink}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center gap-1 text-purple-500 hover:text-purple-700 text-xs transition"
                            >
                              <ExternalLink size={12} />
                              Lihat
                            </a>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 text-center">
                          {v ? <StatusBadge status={v.status} /> : (
                            <span className="text-gray-300 text-xs">Belum Submit</span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="px-4 py-4 text-center">
                          {v?.status === "PENDING" ? (
                            <div className="flex items-center justify-center gap-2">
                              {/* Approve */}
                              <button
                                onClick={() => handleApprove(v.id)}
                                disabled={actionLoading === v.id}
                                title="Setujui"
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 hover:bg-green-200 transition disabled:opacity-40"
                              >
                                <Check size={14} className="text-green-600" />
                              </button>
                              {/* Reject */}
                              <button
                                onClick={() => setRejectTarget(v.id)}
                                disabled={actionLoading === v.id}
                                title="Tolak"
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 hover:bg-red-200 transition disabled:opacity-40"
                              >
                                <X size={14} className="text-red-500" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                      );
                    })}

                    {paginated.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-gray-400 text-sm">
                          {search ? "Tidak ada data yang cocok." : "Belum ada pendaftar di divisi ini."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {(currentPage - 1) * ROWS_PER_PAGE + 1}–
                    {Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} dari {filtered.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-xs rounded-lg border transition disabled:opacity-30"
                      style={{ borderColor: "rgba(0,0,0,0.1)" }}
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className="px-3 py-1 text-xs rounded-lg border transition"
                        style={{
                          borderColor: currentPage === p ? "#7B2FBE" : "rgba(0,0,0,0.1)",
                          background: currentPage === p ? "#7B2FBE" : "transparent",
                          color: currentPage === p ? "white" : "inherit",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-xs rounded-lg border transition disabled:opacity-30"
                      style={{ borderColor: "rgba(0,0,0,0.1)" }}
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

      {/* MODAL REJECT */}
      {rejectTarget && (
        <RejectModal
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </AdminLayout>
  );
}