import { useState, useEffect } from "react";
import { User, Search } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";
import {
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
} from "../../services/userServices";
import { getAllUsers } from "../../services/adminServices";
import api from "../../components/api/axios";

const ROWS_PER_PAGE = 10;
const COLUMNS_SUDAH = ["Nama", "NIM", "Sub Divisi", "Benar", "Salah", "Nilai"];
const COLUMNS_BELUM = ["Nama", "NIM", "Sub Divisi", "Status"];

const getAllAttempts = () => api.get("/exams/attempts/all");
const getAllPayments = () => api.get("/payments");

export default function HasilUjianAdmin() {
  const [attempts, setAttempts] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subDivisionMap, setSubDivisionMap] = useState({});
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [usersNotAttempted, setUsersNotAttempted] = useState([]);
  const [viewMode, setViewMode] = useState("sudah"); // "sudah" | "belum"

  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const init = async () => {
      try {
        const [attemptsRes, deptRes, usersRes, paymentsRes] = await Promise.all(
          [getAllAttempts(), getDepartments(), getAllUsers(), getAllPayments()],
        );

        setAttempts(attemptsRes.data);

        const attemptedUserIds = new Set(attemptsRes.data.map((a) => a.userId));
        const approvedUserIds = new Set(
          paymentsRes.data
            .filter((p) => p.status === "APPROVED")
            .map((p) => p.userId),
        );
        const notAttempted = usersRes.data.filter(
          (u) =>
            u.role === "USER" &&
            approvedUserIds.has(u.id) &&
            !attemptedUserIds.has(u.id),
        );
        setUsersNotAttempted(notAttempted);

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
        console.error("Gagal fetch hasil ujian:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const activeDivision = divisions[activeTabIndex];

  const filterByDivisionAndSearch = (list, getSubDivId) => {
    return list.filter((item) => {
      if (activeDivision) {
        const subIds = (subDivisionMap[activeDivision.id] || []).map(
          (s) => s.id,
        );
        const userSubDivId = getSubDivId(item);
        if (userSubDivId && !subIds.includes(userSubDivId)) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const name =
          viewMode === "sudah"
            ? item.user?.profile?.fullName
            : item.profile?.fullName;
        const nim =
          viewMode === "sudah" ? item.user?.profile?.nim : item.profile?.nim;
        return (
          name?.toLowerCase().includes(q) || nim?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  };

  const bestAttemptPerUser = Object.values(
    attempts.reduce((acc, a) => {
      const uid = a.userId;
      if (!acc[uid] || (a.score ?? 0) > (acc[uid].score ?? 0)) {
        acc[uid] = a;
      }
      return acc;
    }, {}),
  );

  const filteredSudah = filterByDivisionAndSearch(
    bestAttemptPerUser,
    (a) => a.user?.profile?.subDivisionId,
  ).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const filteredBelum = filterByDivisionAndSearch(
    usersNotAttempted,
    (u) => u.profile?.subDivisionId,
  );

  const activeData = viewMode === "sudah" ? filteredSudah : filteredBelum;
  const totalPages = Math.ceil(activeData.length / ROWS_PER_PAGE);
  const paginated = activeData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
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

  const handleViewMode = (mode) => {
    setViewMode(mode);
    setCurrentPage(1);
    setSearch("");
  };

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

  const columns = viewMode === "sudah" ? COLUMNS_SUDAH : COLUMNS_BELUM;

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
              {/* FILTER + SEARCH + TOGGLE */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b flex-wrap"
                style={{ borderColor: "rgba(0,0,0,0.06)" }}
              >
                {/* Search */}
                <div
                  className="flex items-center gap-2 px-3 py-[7px] rounded-full flex-1"
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.10)",
                    minWidth: "160px",
                  }}
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

                {/* Toggle Sudah / Belum */}
                <div
                  className="flex items-center rounded-full p-[3px] shrink-0"
                  style={{
                    background: "rgba(0,0,0,0.06)",
                    border: "1px solid rgba(0,0,0,0.10)",
                  }}
                >
                  <button
                    onClick={() => handleViewMode("sudah")}
                    className="text-xs font-semibold px-4 py-[6px] rounded-full transition-all duration-200 whitespace-nowrap"
                    style={
                      viewMode === "sudah"
                        ? {
                            background: "#7B2FBE",
                            color: "white",
                            boxShadow: "0 2px 8px rgba(123,47,190,0.30)",
                          }
                        : { color: "#6b7280" }
                    }
                  >
                    ✓ Sudah Ujian
                    {viewMode === "sudah" && filteredSudah.length > 0 && (
                      <span
                        className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                        style={{ background: "rgba(255,255,255,0.25)" }}
                      >
                        {filteredSudah.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleViewMode("belum")}
                    className="text-xs font-semibold px-4 py-[6px] rounded-full transition-all duration-200 whitespace-nowrap"
                    style={
                      viewMode === "belum"
                        ? {
                            background: "#dc2626",
                            color: "white",
                            boxShadow: "0 2px 8px rgba(220,38,38,0.25)",
                          }
                        : {
                            color:
                              filteredBelum.length > 0 ? "#dc2626" : "#6b7280",
                          }
                    }
                  >
                    ✕ Belum Ujian
                    {filteredBelum.length > 0 && (
                      <span
                        className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                        style={
                          viewMode === "belum"
                            ? { background: "rgba(255,255,255,0.25)" }
                            : {
                                background: "rgba(220,38,38,0.12)",
                                color: "#dc2626",
                              }
                        }
                      >
                        {filteredBelum.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr
                      style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}
                    >
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
                    {viewMode === "sudah"
                      ? paginated.map((a, i) => (
                          <tr
                            key={a.id}
                            className="transition-colors duration-150 hover:bg-purple-50 cursor-pointer"
                            style={{
                              borderBottom:
                                i < paginated.length - 1
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
                              {getSubDivisionName(
                                a.user?.profile?.subDivisionId,
                              )}
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
                        ))
                      : paginated.map((u, i) => (
                          <tr
                            key={u.id}
                            style={{
                              borderBottom:
                                i < paginated.length - 1
                                  ? "0.5px solid rgba(0,0,0,0.05)"
                                  : "none",
                              background:
                                i % 2 === 0
                                  ? "rgba(239,68,68,0.018)"
                                  : "transparent",
                            }}
                          >
                            <td className="px-4 py-3 text-gray-800 text-xs font-semibold whitespace-nowrap">
                              {u.profile?.fullName || "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                              {u.profile?.nim || "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                              {getSubDivisionName(u.profile?.subDivisionId)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="px-2 py-1 rounded-full text-[10px] font-semibold"
                                style={{
                                  background: "rgba(239,68,68,0.10)",
                                  color: "#dc2626",
                                }}
                              >
                                Belum Ujian
                              </span>
                            </td>
                          </tr>
                        ))}

                    {paginated.length === 0 && (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="text-center py-10 text-gray-400 text-sm"
                        >
                          {search
                            ? "Tidak ada data yang cocok."
                            : viewMode === "sudah"
                              ? "Belum ada peserta yang mengumpulkan ujian."
                              : "Semua peserta sudah mengerjakan ujian!"}
                        </td>
                      </tr>
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
                    {Math.min(currentPage * ROWS_PER_PAGE, activeData.length)}{" "}
                    dari {activeData.length} peserta
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
    </AdminLayout>
  );
}
