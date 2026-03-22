import { useState, useEffect } from "react";
import { User, Search, SlidersHorizontal } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";
import { getDepartments, getDivisionsByDepartment, getSubDivisionsByDivision } from "../../services/userServices";
import api from "../../components/api/axios";

const ROWS_PER_PAGE = 10;
const columns = ["Nama", "NIM", "Sub Divisi", "Benar", "Salah", "Nilai"];

const getAllAttempts = () => api.get("/exams/attempts/all");

export default function HasilUjianAdmin() {
  const [attempts, setAttempts] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subDivisionMap, setSubDivisionMap] = useState({});
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  // ── FETCH ──────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [attemptsRes, deptRes] = await Promise.all([
          getAllAttempts(),
          getDepartments(),
        ]);

        setAttempts(attemptsRes.data);

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
        console.error("Gagal fetch hasil ujian:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── FILTER per tab divisi ──────────────────────────────────────
  const activeDivision = divisions[activeTabIndex];

  const filtered = attempts
    .filter((a) => {
      // Filter berdasarkan divisi aktif lewat sub divisi user
      if (activeDivision) {
        const subIds = (subDivisionMap[activeDivision.id] || []).map((s) => s.id);
        const userSubDivId = a.user?.profile?.subDivisionId;
        // Jika user tidak punya sub divisi → tampil di semua tab
        if (userSubDivId && !subIds.includes(userSubDivId)) return false;
      }
      // Filter search
      if (search) {
        const q = search.toLowerCase();
        return (
          a.user?.profile?.fullName?.toLowerCase().includes(q) ||
          a.user?.profile?.nim?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    // Urutkan nilai tertinggi ke terendah
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  // ── PAGINATION ─────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleTabChange = (_, i) => {
    setActiveTabIndex(i);
    setCurrentPage(1);
    setSearch("");
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Helper: nama sub divisi
  const getSubDivisionName = (subDivisionId) => {
    for (const subs of Object.values(subDivisionMap)) {
      const found = subs.find((s) => s.id === subDivisionId);
      if (found) return found.name;
    }
    return "-";
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
      <div className="min-h-screen flex flex-col gap-4 pt-10 md:pt-4">

        {/* TOP RIGHT */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-white font-semibold text-sm">
            {adminUser.email || "Admin"}
          </span>
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <User size={18} className="text-white/70" />
          </div>
        </div>

        {/* TABS + TABLE */}
        <div className="mt-6">
          <DivisionTabs
            divisions={divisions.map((d) => d.name)}
            bgColor="#1a0023"
            onChange={handleTabChange}
          >
            <div
              className="flex flex-col bg-white"
              style={{ borderRadius: "0 0 16px 16px" }}
            >
              {/* FILTER + SEARCH */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b"
                style={{ borderColor: "rgba(0,0,0,0.06)" }}
              >
                <button
                  className="flex items-center gap-2 px-4 py-[7px] rounded-full text-xs font-semibold text-white transition-all hover:brightness-110 shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                    boxShadow: "0 2px 10px rgba(120,0,200,0.25)",
                  }}
                >
                  <SlidersHorizontal size={13} />
                  Filter
                </button>

                <div
                  className="flex items-center gap-2 px-3 py-[7px] rounded-full flex-1"
                  style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.10)" }}
                >
                  <input
                    type="text"
                    placeholder="Search nama atau NIM..."
                    value={search}
                    onChange={handleSearch}
                    className="bg-transparent text-xs text-gray-600 outline-none flex-1 placeholder-gray-400"
                  />
                  <Search size={13} className="text-gray-400 shrink-0" />
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="text-left px-4 py-3 text-xs font-bold text-gray-700 whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((a, i) => (
                      <tr
                        key={a.id}
                        className="transition-colors duration-150 hover:bg-purple-50 cursor-pointer"
                        style={{
                          borderBottom: i < paginated.length - 1
                            ? "1px solid rgba(0,0,0,0.05)"
                            : "none",
                        }}
                      >
                        <td className="px-4 py-4 text-gray-800 text-xs whitespace-nowrap">
                          <div className="font-semibold">
                            {a.user?.profile?.fullName || "-"}
                          </div>
                          <div className="text-gray-400 text-[10px]">
                            {a.exam?.title || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-600 text-xs whitespace-nowrap">
                          {a.user?.profile?.nim || "-"}
                        </td>
                        <td className="px-4 py-4 text-gray-600 text-xs whitespace-nowrap">
                          {getSubDivisionName(a.user?.profile?.subDivisionId)}
                        </td>
                        <td className="px-4 py-4 text-green-600 text-xs font-semibold">
                          {a.correctCount ?? "-"}
                        </td>
                        <td className="px-4 py-4 text-red-500 text-xs font-semibold">
                          {a.wrongCount ?? "-"}
                        </td>
                        <td className="px-4 py-4 text-xs font-bold">
                          <span
                            className="px-2 py-1 rounded-full text-xs"
                            style={{
                              background:
                                (a.score ?? 0) >= 80
                                  ? "rgba(34,197,94,0.15)"
                                  : (a.score ?? 0) >= 60
                                  ? "rgba(245,158,11,0.15)"
                                  : "rgba(239,68,68,0.15)",
                              color:
                                (a.score ?? 0) >= 80
                                  ? "#16a34a"
                                  : (a.score ?? 0) >= 60
                                  ? "#d97706"
                                  : "#dc2626",
                            }}
                          >
                            {parseFloat(a.score ?? 0).toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {paginated.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                          {search
                            ? "Tidak ada data yang cocok."
                            : "Belum ada peserta yang mengumpulkan ujian."}
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
                    {Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} dari{" "}
                    {filtered.length} peserta
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) =>
                        p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
                      )
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === "..." ? (
                          <span key={`dot-${idx}`} className="px-2 text-xs text-gray-400">...</span>
                        ) : (
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
                        )
                      )}
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
    </AdminLayout>
  );
}