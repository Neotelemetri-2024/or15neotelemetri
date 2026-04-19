import { useState, useEffect } from "react";
import { User, Search, X, Check, Download, ChevronDown } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";
import {
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
} from "../../services/userServices";
import { getAllUsers } from "../../services/adminServices";
import api from "../../components/api/axios";
import { useNotif } from "../../components/admin/NotifContext";
import * as XLSX from "xlsx";

const getAllPayments = () => api.get("/payments");
const reviewPayment = (id, payload) =>
  api.patch(`/payments/${id}/review`, payload);

const ROWS_PER_PAGE = 10;
const columns = [
  "No",
  "Nama",
  "NIM",
  "Sub Divisi",
  "Jumlah",
  "Bukti",
  "Status",
  "Aksi",
];

// ── Badge status ─────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    PENDING: {
      label: "Menunggu",
      bg: "bg-yellow-100",
      text: "text-yellow-700",
    },
    APPROVED: {
      label: "Disetujui",
      bg: "bg-green-100",
      text: "text-green-700",
    },
    REJECTED: { label: "Ditolak", bg: "bg-red-100", text: "text-red-600" },
  };
  const s = map[status] || map.PENDING;
  return (
    <span
      className={`px-2 py-1 rounded-full text-[10px] font-semibold ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}

// ── Modal konfirmasi approve ─────────────────────────────────────
function ConfirmApproveModal({ name, amount, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-gray-800 font-bold text-base mb-2">
          Setujui Pembayaran?
        </h3>
        <p className="text-gray-500 text-sm mb-1">
          Pembayaran dari{" "}
          <span className="font-semibold text-gray-700">
            {name || "user ini"}
          </span>
        </p>
        {amount && (
          <p className="text-purple-600 font-bold text-sm mb-4">{amount}</p>
        )}
        <p className="text-gray-400 text-xs mb-5">
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition"
          >
            Ya, Setujui
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal reject (dengan alasan) ─────────────────────────────────
function RejectModal({ name, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-gray-800 font-bold text-base mb-1">
          Tolak Pembayaran?
        </h3>
        {name && (
          <p className="text-gray-400 text-xs mb-3">
            Pembayaran dari{" "}
            <span className="font-semibold text-gray-600">{name}</span>
          </p>
        )}
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Tuliskan alasan penolakan pembayaran..."
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
            Ya, Tolak
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal preview bukti ──────────────────────────────────────────
function ProofModal({ url, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition"
        >
          <X size={24} />
        </button>
        <img
          src={url}
          alt="Bukti Pembayaran"
          className="w-full rounded-2xl object-contain max-h-[80vh]"
        />
      </div>
    </div>
  );
}

export default function PembayaranAdmin() {
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [payments, setPayments] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subDivisionMap, setSubDivisionMap] = useState({});
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // konfirmasi approve — simpan { id, name, amount }
  const [approveTarget, setApproveTarget] = useState(null);
  // konfirmasi reject — simpan { id, name }
  const [rejectTarget, setRejectTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [proofUrl, setProofUrl] = useState(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const { refresh: refreshNotif } = useNotif();

  // ── FETCH ──────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [paymentsRes, deptRes, usersRes] = await Promise.all([
          getAllPayments(),
          getDepartments(),
          getAllUsers(),
        ]);

        setPayments(paymentsRes.data);
        setUsers(usersRes.data);

        const opDept = deptRes.data.find((d) =>
          d.name.toLowerCase().includes("operasional"),
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
            }),
          );
          setSubDivisionMap(subMap);
        }
      } catch (err) {
        console.error("Gagal load pembayaran:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── APPROVE (setelah konfirmasi) ──────────────────────────────
  const handleApprove = async () => {
    if (!approveTarget) return;
    const { id, name } = approveTarget;
    setActionLoading(id);
    try {
      await reviewPayment(id, { status: "APPROVED" });
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "APPROVED" } : p)),
      );
      toast.success(`Pembayaran ${name || ""} disetujui`);
      refreshNotif();
    } catch (err) {
      console.error("Gagal approve:", err);
      toast.error("Gagal menyetujui pembayaran");
    } finally {
      setActionLoading(null);
      setApproveTarget(null);
    }
  };

  // ── REJECT (setelah konfirmasi + alasan) ──────────────────────
  const handleReject = async (reason) => {
    if (!rejectTarget) return;
    const { id, name } = rejectTarget;
    setActionLoading(id);
    try {
      await reviewPayment(id, { status: "REJECTED", rejectionReason: reason });
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: "REJECTED", rejectionReason: reason }
            : p,
        ),
      );
      toast.error(`Pembayaran ${name || ""} ditolak`);
      refreshNotif();
    } catch (err) {
      console.error("Gagal reject:", err);
      toast.error("Gagal menolak pembayaran");
    } finally {
      setActionLoading(null);
      setRejectTarget(null);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────
  const userMap = {};
  users.forEach((u) => {
    userMap[u.id] = u.profile?.subDivisionId;
  });

  const getSubDivName = (subDivisionId) => {
    for (const subs of Object.values(subDivisionMap)) {
      const found = subs.find((s) => s.id === subDivisionId);
      if (found) return found.name;
    }
    return "-";
  };

  const formatRupiah = (amount) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // ── Export helpers ─────────────────────────────────────────────
  const applyHeaderStyle = (ws, headers) => {
    headers.forEach((_, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      if (!ws[cellRef]) return;
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: "FFFFFF" }, name: "Arial", sz: 11 },
        fill: { fgColor: { rgb: "7B2FBE" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: { bottom: { style: "thin", color: { rgb: "5A1F9A" } } },
      };
    });
  };

  const setColWidths = (ws, headers) => {
    ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 4, 18) }));
  };

  const buildPaymentRows = (paymentList) =>
    paymentList.map((p) => ({
      Nama: p.user?.profile?.fullName || "-",
      NIM: p.user?.profile?.nim || "-",
      Email: p.user?.email || "-",
      "Sub Divisi": getSubDivName(userMap[p.userId]),
      Jumlah: p.amount || 0,
      Status: p.status || "-",
    }));

  const handleExportCurrentDivision = () => {
    const divName = activeDivision?.name || "Semua";
    const approvedInDiv = filtered.filter(
      (p) => p.status === "APPROVED" || p.status === "PAID",
    );
    const rows = buildPaymentRows(approvedInDiv);
    if (rows.length === 0) {
      alert("Tidak ada data pembayaran yang disetujui.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const headers = Object.keys(rows[0]);
    applyHeaderStyle(ws, headers);
    setColWidths(ws, headers);
    ws["!rows"] = [{ hpt: 22 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, divName.slice(0, 31));
    XLSX.writeFile(
      wb,
      `Pembayaran_${divName}_${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}.xlsx`,
    );
    setExportMenuOpen(false);
  };

  const handleExportAllDivisions = () => {
    const wb = XLSX.utils.book_new();
    const headers = ["Nama", "NIM", "Email", "Sub Divisi", "Jumlah", "Status"];

    divisions.forEach((div) => {
      const subIds = (subDivisionMap[div.id] || []).map((s) => s.id);
      const divPayments = payments.filter((p) => {
        const userSubDivId = userMap[p.userId];
        const inDiv = !userSubDivId || subIds.includes(userSubDivId);
        return inDiv && (p.status === "APPROVED" || p.status === "PAID");
      });

      const rows = buildPaymentRows(divPayments);
      const ws =
        rows.length > 0
          ? XLSX.utils.json_to_sheet(rows)
          : XLSX.utils.json_to_sheet([
              Object.fromEntries(headers.map((h) => [h, ""])),
            ]);

      applyHeaderStyle(ws, headers);
      setColWidths(ws, headers);
      ws["!rows"] = [{ hpt: 22 }];
      XLSX.utils.book_append_sheet(wb, ws, div.name.slice(0, 31));
    });

    XLSX.writeFile(
      wb,
      `Pembayaran_Semua_Divisi_${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}.xlsx`,
    );
    setExportMenuOpen(false);
  };

  // ── FILTER ─────────────────────────────────────────────────────
  const activeDivision = divisions[activeTabIndex];
  const subIdsInActive = activeDivision
    ? (subDivisionMap[activeDivision.id] || []).map((s) => s.id)
    : [];

  const filtered = payments
    .filter((p) => {
      if (activeDivision) {
        const userSubDivId = userMap[p.userId];
        if (userSubDivId && !subIdsInActive.includes(userSubDivId))
          return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          p.user?.profile?.fullName?.toLowerCase().includes(q) ||
          p.user?.profile?.nim?.toLowerCase().includes(q) ||
          p.user?.email?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const order = { PENDING: 0, REJECTED: 1, APPROVED: 2, PAID: 2 };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });

  // ── PAGINATION ─────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

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
      <Toaster position="top-right" />
      <div className="min-h-screen flex flex-col gap-4 pt-10 md:pt-4">
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

        {/* TABS + TABLE */}
        <div className="mt-6">
          <DivisionTabs
            divisions={divisions.map((d) => d.name)}
            bgColor="#1a0023"
            onChange={(_, i) => {
              setActiveTabIndex(i);
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
              {/* SEARCH + EXPORT */}
              <div
                className="flex flex-wrap items-center gap-2 px-4 py-3 border-b"
                style={{ borderColor: "rgba(0,0,0,0.06)" }}
              >
                {/* Search */}
                <div
                  className="flex items-center gap-2 px-3 py-[7px] rounded-full flex-1 min-w-0"
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.10)",
                    minWidth: "120px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Search nama, NIM, atau email..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-xs text-gray-600 outline-none flex-1 min-w-0 placeholder-gray-400"
                  />
                  <Search size={13} className="text-gray-400 shrink-0" />
                </div>

                {/* Tombol Export */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setExportMenuOpen((prev) => !prev)}
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
                            {activeDivision?.name || "Semua"} · Sudah disetujui
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
                            {divisions.length} sheet · Sudah disetujui
                          </span>
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
                    <tr
                      style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}
                    >
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="p-4 text-xs font-bold text-gray-700 whitespace-nowrap"
                          style={{
                            textAlign: [
                              "No",
                              "Bukti",
                              "Status",
                              "Aksi",
                            ].includes(col)
                              ? "center"
                              : "left",
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((p, i) => {
                      const fullName = p.user?.profile?.fullName || "";
                      const amountFormatted = formatRupiah(p.amount);
                      return (
                        <tr
                          key={p.id}
                          className="transition-colors duration-150 hover:bg-purple-50"
                          style={{
                            borderBottom:
                              i < paginated.length - 1
                                ? "1px solid rgba(0,0,0,0.05)"
                                : "none",
                          }}
                        >
                          <td className="p-4 text-gray-500 text-xs text-center">
                            {(currentPage - 1) * ROWS_PER_PAGE + i + 1}
                          </td>
                          <td className="p-4 text-xs whitespace-nowrap">
                            <div className="font-semibold text-gray-800">
                              {fullName || "-"}
                            </div>
                            <div className="text-gray-400 text-[10px]">
                              {p.user?.email}
                            </div>
                            {p.status === "REJECTED" && p.rejectionReason && (
                              <div className="text-red-400 text-[10px] mt-0.5 max-w-[150px] truncate">
                                Alasan: {p.rejectionReason}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-gray-600 text-xs whitespace-nowrap">
                            {p.user?.profile?.nim || "-"}
                          </td>
                          <td className="p-4 text-gray-600 text-xs whitespace-nowrap">
                            {getSubDivName(userMap[p.userId])}
                          </td>
                          <td className="p-4 text-gray-700 text-xs whitespace-nowrap font-semibold">
                            {amountFormatted}
                          </td>

                          {/* Bukti */}
                          <td className="p-4 text-center">
                            {p.proofUrl ? (
                              <button
                                onClick={() => setProofUrl(p.proofUrl)}
                                className="mx-auto block"
                              >
                                <img
                                  src={p.proofUrl}
                                  alt="bukti"
                                  className="w-12 h-12 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition mx-auto"
                                />
                              </button>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>

                          <td className="p-4 text-center">
                            <StatusBadge status={p.status} />
                          </td>

                          {/* Aksi */}
                          <td className="p-4 text-center">
                            {p.status === "PENDING" ? (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() =>
                                    setApproveTarget({
                                      id: p.id,
                                      name: fullName,
                                      amount: amountFormatted,
                                    })
                                  }
                                  disabled={actionLoading === p.id}
                                  title="Setujui"
                                  className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 hover:bg-green-200 transition disabled:opacity-40"
                                >
                                  <Check size={14} className="text-green-600" />
                                </button>
                                <button
                                  onClick={() =>
                                    setRejectTarget({
                                      id: p.id,
                                      name: fullName,
                                    })
                                  }
                                  disabled={actionLoading === p.id}
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
                        <td
                          colSpan={8}
                          className="text-center py-10 text-gray-400 text-sm"
                        >
                          {search
                            ? "Tidak ada data yang cocok."
                            : "Belum ada data pembayaran."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION — ganti blok lama dengan ini */}
              {totalPages > 1 && (
                <div
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                  style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
                >
                  <span className="text-xs text-gray-500">
                    {(currentPage - 1) * ROWS_PER_PAGE + 1}–
                    {Math.min(currentPage * ROWS_PER_PAGE, filtered.length)}{" "}
                    dari {filtered.length}
                  </span>

                  <div className="flex items-center gap-1 flex-wrap">
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
      </div>

      {/* MODAL KONFIRMASI APPROVE */}
      {approveTarget && (
        <ConfirmApproveModal
          name={approveTarget.name}
          amount={approveTarget.amount}
          onConfirm={handleApprove}
          onCancel={() => setApproveTarget(null)}
        />
      )}

      {/* MODAL REJECT */}
      {rejectTarget && (
        <RejectModal
          name={rejectTarget.name}
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {/* MODAL PREVIEW BUKTI */}
      {proofUrl && (
        <ProofModal url={proofUrl} onClose={() => setProofUrl(null)} />
      )}
    </AdminLayout>
  );
}
