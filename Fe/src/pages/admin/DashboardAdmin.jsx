import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, User } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";
import { getAllUsers } from "../../services/adminServices";
import {
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
} from "../../services/userServices";
import api from "../../components/api/axios";

const getAllVerifications = () => api.get("/verification/admin/list");
const getAllPayments = () => api.get("/payments");
const getAllAssignments = () => api.get("/assignments");

const ROWS_PER_PAGE = 10;
const columns = [
  "Nama",
  "NIM",
  "Email",
  "No. WA",
  "Program Studi",
  "Sub Divisi",
];

export default function DashboardAdmin() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]); // divisi operasional
  const [subDivisionMap, setSubDivisionMap] = useState({}); // { divisionId: [subDiv] }
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Total Pendaftar", value: "-" },
    { label: "Lulus Verifikasi", value: "-" },
    { label: "Sudah Bayar", value: "-" },
    { label: "Tugas Masuk", value: "-" },
  ]);

  // Nama admin dari localStorage
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  // ── FETCH DATA ──────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [usersRes, deptRes, verifRes, paymentsRes, assignmentsRes] =
          await Promise.all([
            getAllUsers(),
            getDepartments(),
            getAllVerifications().catch(() => ({ data: [] })),
            getAllPayments().catch(() => ({ data: [] })),
            getAllAssignments().catch(() => ({ data: [] })),
          ]);

        const allUsers = usersRes.data;
        setUsers(allUsers);

        // ── HITUNG STATS GLOBAL ────────────────────────────────
        const totalPendaftar = allUsers.filter((u) => u.role === "USER").length;
        // ✅ Hitung APPROVED dari submission unik per user (submission terbaru)
        const latestVerifPerUser = Object.values(
          verifRes.data.reduce((acc, v) => {
            if (
              !acc[v.userId] ||
              new Date(v.createdAt) > new Date(acc[v.userId].createdAt)
            ) {
              acc[v.userId] = v;
            }
            return acc;
          }, {}),
        );
        const lulusVerifikasi = latestVerifPerUser.filter(
          (v) => v.status === "APPROVED",
        ).length;
        const sudahBayar = paymentsRes.data.filter(
          (p) => p.status === "APPROVED" || p.status === "PAID",
        ).length;
        // Hitung total submission dari semua assignment
        const tugasMasuk = assignmentsRes.data.reduce(
          (acc, a) => acc + (a._count?.submissions || 0),
          0,
        );

        setStats([
          { label: "Total Pendaftar", value: totalPendaftar },
          { label: "Lulus Verifikasi", value: lulusVerifikasi },
          { label: "Sudah Bayar", value: sudahBayar },
          { label: "Tugas Masuk", value: tugasMasuk },
        ]);

        // Cari department Operasional
        const opDept = deptRes.data.find((d) =>
          d.name.toLowerCase().includes("operasional"),
        );

        if (opDept) {
          const divRes = await getDivisionsByDepartment(opDept.id);
          const divList = divRes.data;
          setDivisions(divList);

          // Fetch sub divisi untuk semua divisi sekaligus
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
        console.error("Gagal fetch data dashboard admin:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ── FILTER DATA berdasarkan tab divisi aktif ────────────────────
  const activeDivision = divisions[activeTabIndex];

  const filteredUsers = users.filter((u) => {
    if (!u.profile) return false;
    if (u.role !== "USER") return false; // hanya tampilkan user biasa

    // Filter berdasarkan divisi aktif
    // User tanpa subDivisionId tampil di semua tab
    if (activeDivision && u.profile.subDivisionId) {
      const subDivsInActiveDivision = subDivisionMap[activeDivision.id] || [];
      const subDivIds = subDivsInActiveDivision.map((s) => s.id);
      if (!subDivIds.includes(u.profile.subDivisionId)) return false;
    }

    // Filter search
    if (search) {
      const q = search.toLowerCase();
      const profile = u.profile;
      return (
        profile?.fullName?.toLowerCase().includes(q) ||
        profile?.nim?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        profile?.whatsappNumber?.toLowerCase().includes(q) ||
        profile?.studyProgram?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // ── SORT: user tanpa subDivisionId di bawah ────────────────────
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aHasSub = !!a.profile?.subDivisionId;
    const bHasSub = !!b.profile?.subDivisionId;
    if (aHasSub && !bHasSub) return -1;
    if (!aHasSub && bHasSub) return 1;
    return 0;
  });

  // ── PAGINATION ──────────────────────────────────────────────────
  const totalPages = Math.ceil(sortedUsers.length / ROWS_PER_PAGE);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

  // Reset ke halaman 1 saat tab atau search berubah
  const handleTabChange = (_, i) => {
    setActiveTabIndex(i);
    setCurrentPage(1);
    setSearch("");
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // ── Helper: nama sub divisi dari ID ────────────────────────────
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
      <div className="min-h-screen flex flex-col gap-6 pt-10 md:pt-4">
        {/* TOP RIGHT — nama admin */}
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
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <span className="text-white font-bold text-2xl lg:text-3xl">
                {s.value}
              </span>
              <span className="text-white/60 text-xs text-center px-2">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* TABLE SECTION */}
        <div className="mt-6">
          <div className="relative rounded-2xl overflow-visible">
            <DivisionTabs
              divisions={divisions.map((d) => d.name)}
              bgColor="#1a0023"
              onChange={handleTabChange}
            >
              <div className="rounded-b-2xl overflow-hidden flex flex-col bg-white">
                {/* FILTER + SEARCH */}
                <div className="flex items-center gap-3 p-4">
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
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      border: "1px solid rgba(0,0,0,0.10)",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Search nama, NIM, email..."
                      value={search}
                      onChange={handleSearch}
                      className="bg-transparent text-xs text-gray-600 outline-none flex-1 placeholder-gray-400"
                    />
                    <Search size={13} className="text-gray-400 shrink-0" />
                  </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[540px]">
                    <thead>
                      <tr
                        style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}
                      >
                        {columns.map((col) => (
                          <th
                            key={col}
                            className="text-left p-4 text-xs font-bold text-gray-700 whitespace-nowrap"
                          >
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
                          style={{
                            borderBottom:
                              i < paginatedUsers.length - 1
                                ? "1px solid rgba(0,0,0,0.05)"
                                : "none",
                          }}
                        >
                          <td className="p-5 text-gray-800 text-xs whitespace-nowrap">
                            {user.profile?.fullName || "-"}
                          </td>
                          <td className="p-5 text-gray-600 text-xs whitespace-nowrap">
                            {user.profile?.nim || "-"}
                          </td>
                          <td className="p-5 text-gray-600 text-xs">
                            {user.email || "-"}
                          </td>
                          <td className="p-5 text-gray-600 text-xs whitespace-nowrap">
                            {user.profile?.whatsappNumber || "-"}
                          </td>
                          <td className="p-5 text-gray-600 text-xs whitespace-nowrap">
                            {user.profile?.studyProgram || "-"}
                          </td>
                          <td className="p-5 text-gray-600 text-xs whitespace-nowrap">
                            {getSubDivisionName(user.profile?.subDivisionId)}
                          </td>
                        </tr>
                      ))}

                      {paginatedUsers.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-10 text-gray-400 text-sm"
                          >
                            {search
                              ? "Tidak ada data yang cocok dengan pencarian."
                              : "Belum ada pendaftar di divisi ini."}
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
                      Menampilkan {(currentPage - 1) * ROWS_PER_PAGE + 1}–
                      {Math.min(
                        currentPage * ROWS_PER_PAGE,
                        filteredUsers.length,
                      )}{" "}
                      dari {sortedUsers.length} pendaftar
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-xs rounded-lg border transition disabled:opacity-30"
                        style={{ borderColor: "rgba(0,0,0,0.1)" }}
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
                          if (idx > 0 && p - arr[idx - 1] > 1) {
                            acc.push("...");
                          }
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, idx) =>
                          p === "..." ? (
                            <span
                              key={`dot-${idx}`}
                              className="px-2 text-xs text-gray-400"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setCurrentPage(p)}
                              className="px-3 py-1 text-xs rounded-lg border transition"
                              style={{
                                borderColor:
                                  currentPage === p
                                    ? "#7B2FBE"
                                    : "rgba(0,0,0,0.1)",
                                background:
                                  currentPage === p ? "#7B2FBE" : "transparent",
                                color: currentPage === p ? "white" : "inherit",
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
      </div>
    </AdminLayout>
  );
}
