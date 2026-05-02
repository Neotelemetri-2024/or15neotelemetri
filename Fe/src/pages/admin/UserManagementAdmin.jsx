import { useState, useEffect } from "react";
import { User, Search, Trash2, ShieldOff, ShieldCheck } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";
import {
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
} from "../../services/userServices";
import api from "../../components/api/axios";

const getUsers = () => api.get("/users");
const toggleActiveApi = (id) => api.patch(`/users/${id}/toggle-active`);
const deleteUserApi = (id) => api.delete(`/users/${id}`);

const ROWS_PER_PAGE = 10;

function ActiveBadge({ isActive }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{
        background: isActive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
        color: isActive ? "#16a34a" : "#dc2626",
      }}
    >
      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}

export default function UserManagementAdmin() {
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subDivisionMap, setSubDivisionMap] = useState({});
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [filterSubDiv, setFilterSubDiv] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const [usersRes, deptRes] = await Promise.all([
          getUsers(),
          getDepartments(),
        ]);
        setUsers(usersRes.data.filter((u) => u.role !== "ADMIN"));

        const opDept = deptRes.data.find((d) =>
          d.name.toLowerCase().includes("operasional"),
        );
        if (opDept) {
          const divRes = await getDivisionsByDepartment(opDept.id);
          setDivisions(divRes.data);
          const subMap = {};
          await Promise.all(
            divRes.data.map(async (div) => {
              const subRes = await getSubDivisionsByDivision(div.id);
              subMap[div.id] = subRes.data;
            }),
          );
          setSubDivisionMap(subMap);
        }
      } catch (err) {
        console.error("Gagal load users:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const getSubDivName = (subDivisionId) => {
    for (const subs of Object.values(subDivisionMap)) {
      const found = subs.find((s) => s.id === subDivisionId);
      if (found) return found.name;
    }
    return "-";
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleToggleActive = async () => {
    if (!toggleTarget) return;
    setActionLoading(toggleTarget.id);
    try {
      const res = await toggleActiveApi(toggleTarget.id);
      setUsers((p) =>
        p.map((u) =>
          u.id === toggleTarget.id ? { ...u, isActive: res.data.isActive } : u,
        ),
      );
      showSuccess(
        `Akun ${toggleTarget.profile?.fullName || toggleTarget.email} berhasil ${
          res.data.isActive ? "diaktifkan" : "dinonaktifkan"
        }.`,
      );
    } catch (err) {
      console.error("Gagal toggle active:", err);
    } finally {
      setActionLoading(null);
      setToggleTarget(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    try {
      await deleteUserApi(deleteTarget.id);
      setUsers((p) => p.filter((u) => u.id !== deleteTarget.id));
      showSuccess(
        `Akun ${deleteTarget.profile?.fullName || deleteTarget.email} berhasil dihapus.`,
      );
    } catch (err) {
      console.error("Gagal hapus user:", err);
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

  const activeDivision = divisions[activeTabIndex];
  const subIdsInActive = activeDivision
    ? (subDivisionMap[activeDivision.id] || []).map((s) => s.id)
    : [];

  const filtered = users.filter((u) => {
    if (activeDivision) {
      const subDivId = u.profile?.subDivisionId;
      if (subDivId && !subIdsInActive.includes(subDivId)) return false;
    }
    if (filterSubDiv !== "all" && u.profile.subDivisionId !== filterSubDiv)
      return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        u.profile?.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.profile?.nim?.toLowerCase().includes(q)
      );
    }
    return true;
  });

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

        {/* SUCCESS MSG */}
        {successMsg && (
          <div
            className="px-4 py-3 rounded-xl text-sm text-green-700 font-medium"
            style={{
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.25)",
            }}
          >
            ✓ {successMsg}
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total User",
              value: users.length,
              color: "#a78bfa",
              glow: "rgba(167,139,250,0.2)",
            },
            {
              label: "Aktif",
              value: users.filter((u) => u.isActive).length,
              color: "#4ade80",
              glow: "rgba(74,222,128,0.2)",
            },
            {
              label: "Nonaktif",
              value: users.filter((u) => !u.isActive).length,
              color: "#f87171",
              glow: "rgba(248,113,113,0.2)",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl flex flex-col items-center justify-center gap-1 py-4"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: `1.5px solid ${s.glow}`,
              }}
            >
              <span className="text-2xl font-bold" style={{ color: s.color }}>
                {s.value}
              </span>
              <span className="text-[11px] font-semibold text-white/60">
                {s.label}
              </span>
            </div>
          ))}
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
              setFilterSubDiv("all");
            }}
          >
            <div
              className="flex flex-col bg-white"
              style={{
                borderRadius: "0 0 16px 16px",
                boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
              }}
            >
              {/* SEARCH + FILTER (1 ROW) */}
              {/* SEARCH + FILTER (1 ROW, SEMUA UKURAN) */}
              <div
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ borderColor: "rgba(0,0,0,0.06)" }}
              >
                {/* SEARCH */}
                <div
                  className="flex items-center gap-2 px-3 py-[7px] rounded-full flex-1 min-w-0"
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.10)",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Cari nama / NIM..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-xs text-gray-600 outline-none flex-1 min-w-0 placeholder-gray-400"
                  />
                  <Search size={13} className="text-gray-400 shrink-0" />
                </div>

                {/* FILTER */}
                <select
                  value={filterSubDiv}
                  onChange={(e) => {
                    setFilterSubDiv(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs rounded-full px-3 py-2 outline-none cursor-pointer shrink-0 max-w-[130px]"
                  style={{
                    background:
                      filterSubDiv !== "all"
                        ? "rgba(123,47,190,0.1)"
                        : "rgba(0,0,0,0.05)",
                    border:
                      filterSubDiv !== "all"
                        ? "1px solid rgba(123,47,190,0.4)"
                        : "1px solid rgba(0,0,0,0.10)",
                    color: filterSubDiv !== "all" ? "#7B2FBE" : "#6b7280",
                  }}
                >
                  <option value="all">Semua Sub Divisi</option>
                  {(subDivisionMap[activeDivision?.id] || []).map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr
                      style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}
                    >
                      {[
                        "No",
                        "Nama",
                        "NIM",
                        "Sub Divisi",
                        "Status",
                        "Aksi",
                      ].map((col) => (
                        <th
                          key={col}
                          className="p-4 text-xs font-bold text-gray-700 whitespace-nowrap"
                          style={{
                            textAlign: ["No", "Status", "Aksi"].includes(col)
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
                    {paginated.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-10 text-gray-400 text-sm"
                        >
                          {search
                            ? "Tidak ada data yang cocok."
                            : "Belum ada data user."}
                        </td>
                      </tr>
                    ) : (
                      paginated.map((u, i) => (
                        <tr
                          key={u.id}
                          className="transition-colors hover:bg-purple-50"
                          style={{
                            borderBottom:
                              i < paginated.length - 1
                                ? "1px solid rgba(0,0,0,0.05)"
                                : "none",
                            opacity: u.isActive ? 1 : 0.6,
                          }}
                        >
                          <td className="p-4 text-gray-500 text-xs text-center">
                            {(currentPage - 1) * ROWS_PER_PAGE + i + 1}
                          </td>
                          <td className="p-4 text-xs whitespace-nowrap">
                            <div className="font-semibold text-gray-800">
                              {u.profile?.fullName || "-"}
                            </div>
                            <div className="text-gray-400 text-[10px]">
                              {u.email}
                            </div>
                          </td>
                          <td className="p-4 text-gray-600 text-xs whitespace-nowrap">
                            {u.profile?.nim || "-"}
                          </td>
                          <td className="p-4 text-gray-600 text-xs whitespace-nowrap">
                            {getSubDivName(u.profile?.subDivisionId)}
                          </td>
                          <td className="p-4 text-center">
                            <ActiveBadge isActive={u.isActive} />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setToggleTarget(u)}
                                disabled={actionLoading === u.id}
                                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110 disabled:opacity-40 whitespace-nowrap"
                                style={{
                                  background: u.isActive
                                    ? "linear-gradient(135deg,#F0A000,#CC7700)"
                                    : "linear-gradient(135deg,#22C55E,#16A34A)",
                                }}
                              >
                                {u.isActive ? (
                                  <>
                                    <ShieldOff size={11} /> Nonaktifkan
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck size={11} /> Aktifkan
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => setDeleteTarget(u)}
                                disabled={actionLoading === u.id}
                                className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-red-50 disabled:opacity-40"
                                style={{ color: "#dc2626" }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
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

      {/* MODAL TOGGLE ACTIVE */}
      {toggleTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: toggleTarget.isActive
                    ? "rgba(245,158,11,0.12)"
                    : "rgba(34,197,94,0.12)",
                }}
              >
                {toggleTarget.isActive ? (
                  <ShieldOff size={18} className="text-yellow-600" />
                ) : (
                  <ShieldCheck size={18} className="text-green-600" />
                )}
              </div>
              <h2 className="text-gray-800 font-bold text-base">
                {toggleTarget.isActive ? "Nonaktifkan" : "Aktifkan"} Akun?
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              <strong>
                {toggleTarget.profile?.fullName || toggleTarget.email}
              </strong>
            </p>
            <p className="text-xs text-gray-400 mb-5">
              {toggleTarget.isActive
                ? "User tidak akan menerima pembaruan data baru, namun masih bisa mengakses aplikasi dan data yang sudah ada."
                : "User akan kembali menerima pembaruan data seperti biasa."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setToggleTarget(null)}
                className="flex-1 py-2 rounded-full text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleToggleActive}
                disabled={actionLoading === toggleTarget.id}
                className="flex-1 py-2 rounded-full text-sm font-semibold text-white transition disabled:opacity-50"
                style={{
                  background: toggleTarget.isActive
                    ? "linear-gradient(135deg,#F0A000,#CC7700)"
                    : "linear-gradient(135deg,#22C55E,#16A34A)",
                }}
              >
                {actionLoading === toggleTarget.id
                  ? "Memproses..."
                  : toggleTarget.isActive
                    ? "Ya, Nonaktifkan"
                    : "Ya, Aktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(239,68,68,0.12)" }}
              >
                <Trash2 size={18} className="text-red-500" />
              </div>
              <h2 className="text-gray-800 font-bold text-base">Hapus User?</h2>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              <strong>
                {deleteTarget.profile?.fullName || deleteTarget.email}
              </strong>
            </p>
            <p className="text-xs text-gray-400 mb-5">
              Seluruh data terkait (profil, absensi, pembayaran, verifikasi,
              ujian, dan tugas) akan ikut terhapus secara permanen dan tidak
              dapat dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 rounded-full text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading === deleteTarget.id}
                className="flex-1 py-2 rounded-full text-sm font-semibold text-white transition disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg,#EE2222,#AA0000)",
                }}
              >
                {actionLoading === deleteTarget.id
                  ? "Menghapus..."
                  : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
