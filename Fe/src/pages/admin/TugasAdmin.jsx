import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Plus, Search } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";
import {
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
} from "../../services/userServices";
import { previewFile, downloadFile } from "../../utils/fileUtils";
import { ExternalLink, Download } from "lucide-react";
import api from "../../components/api/axios";

const getAllAssignments = () => api.get("/assignments");
const deleteAssignment = (id) => api.delete(`/assignments/${id}`);

const ROWS_PER_PAGE = 10;
const columns = [
  "No",
  "Title",
  "Description",
  "Sub Divisi",
  "Deadline",
  "File",
  "Submitted",
  "Action",
];

export default function TugasAdmin() {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [assignments, setAssignments] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subDivisionMap, setSubDivisionMap] = useState({});
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [filterSubDiv, setFilterSubDiv] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteAssignmentId, setDeleteAssignmentId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ── FETCH ──────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [assignmentsRes, deptRes] = await Promise.all([
          getAllAssignments(),
          getDepartments(),
        ]);
        setAssignments(assignmentsRes.data);

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
        console.error("Gagal load tugas:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── HAPUS ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteAssignmentId) return;

    try {
      await deleteAssignment(deleteAssignmentId);

      setAssignments((p) => p.filter((a) => a.id !== deleteAssignmentId));
    } catch (err) {
      console.error("Gagal hapus tugas:", err);
    } finally {
      setDeleteAssignmentId(null);
    }
  };

  // ── FILTER per tab divisi ──────────────────────────────────────
  const activeDivision = divisions[activeTabIndex];
  const subIdsInActive = activeDivision
    ? (subDivisionMap[activeDivision.id] || []).map((s) => s.id)
    : [];

  const filtered = assignments.filter((a) => {
    // Filter tab divisi
    if (activeDivision && !subIdsInActive.includes(a.subDivisionId))
      return false;
    // Filter sub divisi
    if (filterSubDiv !== "all" && a.subDivisionId !== filterSubDiv)
      return false;
    // Filter search
    if (search) {
      const q = search.toLowerCase();
      return (
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

  // Format tanggal
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <User size={18} className="text-white/70" />
          </div>
        </div>

        {/* TABS + CARD */}
        <div className="mt-6">
          <DivisionTabs
            divisions={divisions.map((d) => d.name)}
            bgColor="#1a0023"
            onChange={(_, i) => {
              setActiveTabIndex(i);
              setFilterSubDiv("all");
              setSearch("");
              setCurrentPage(1);
            }}
          >
            <div
              className="flex flex-col bg-white"
              style={{
                borderRadius: "0 0 16px 16px",
                boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
              }}
            >
              {/* TOOLBAR */}
              <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pb-3">
                {/* Add button */}

                {/* Search */}
                <div
                  className="flex items-center gap-2 px-3 py-[7px] rounded-full flex-1 min-w-[160px]"
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.10)",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Cari judul atau deskripsi tugas..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-xs text-gray-600 outline-none flex-1 placeholder-gray-400"
                  />
                  <Search size={13} className="text-gray-400 shrink-0" />
                </div>

                {/* Filter Sub Divisi */}
                <select
                  value={filterSubDiv}
                  onChange={(e) => {
                    setFilterSubDiv(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs text-gray-600 rounded-full px-3 py-[7px] outline-none cursor-pointer shrink-0"
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

                <button
                  onClick={() => navigate("/admin/tugas/add")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110 shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                    boxShadow: "0 2px 10px rgba(120,0,200,0.25)",
                  }}
                >
                  <Plus size={13} />
                  Add Tugas
                </button>
              </div>

              <div
                className="w-full h-px"
                style={{ background: "rgba(0,0,0,0.06)" }}
              />

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr
                      style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}
                    >
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="p-5 text-xs font-bold text-gray-700 whitespace-nowrap"
                          style={{
                            textAlign: [
                              "No",
                              "File",
                              "Submitted",
                              "Action",
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
                    {paginated.map((a, i) => (
                      <tr
                        key={a.id}
                        className="transition-colors duration-150 hover:bg-purple-50"
                        style={{
                          borderBottom:
                            i < paginated.length - 1
                              ? "1px solid rgba(0,0,0,0.05)"
                              : "none",
                        }}
                      >
                        <td className="p-5 text-gray-500 text-xs text-center">
                          {(currentPage - 1) * ROWS_PER_PAGE + i + 1}
                        </td>
                        <td className="p-5 text-gray-800 text-xs whitespace-nowrap font-semibold">
                          {a.title}
                        </td>
                        <td className="p-5 text-gray-600 text-xs max-w-[200px]">
                          <span className="line-clamp-2">
                            {a.description || "-"}
                          </span>
                        </td>
                        <td className="p-5 text-gray-600 text-xs whitespace-nowrap">
                          {a.subDivision?.name || "-"}
                        </td>
                        <td className="p-5 text-gray-600 text-xs whitespace-nowrap">
                          {formatDate(a.dueAt)}
                        </td>
                        <td className="p-5 text-center">
                          {a.fileUrl ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => previewFile(a.id, "assignments")}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110"
                                style={{
                                  background:
                                    "linear-gradient(135deg,#0077CC,#004499)",
                                  boxShadow: "0 2px 8px rgba(0,100,200,0.3)",
                                }}
                                title="Buka file"
                              >
                                <ExternalLink size={10} />
                                Buka
                              </button>
                              <button
                                onClick={() =>
                                  downloadFile(a.id, "assignments")
                                }
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110"
                                style={{
                                  background:
                                    "linear-gradient(135deg,#00AA55,#007733)",
                                  boxShadow: "0 2px 8px rgba(0,150,80,0.3)",
                                }}
                                title="Unduh file"
                              >
                                <Download size={10} />
                                Download
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="p-5 text-gray-600 text-xs text-center">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-semibold"
                            style={{
                              background:
                                (a._count?.submissions || 0) > 0
                                  ? "rgba(34,197,94,0.12)"
                                  : "rgba(0,0,0,0.05)",
                              color:
                                (a._count?.submissions || 0) > 0
                                  ? "#16a34a"
                                  : "#999",
                            }}
                          >
                            {a._count?.submissions ?? 0}
                          </span>
                        </td>

                        {/* ACTION */}
                        <td className="p-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteAssignmentId(a.id);
                              }}
                              className="px-4 py-1 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110 whitespace-nowrap"
                              style={{
                                background:
                                  "linear-gradient(135deg,#EE2222,#AA0000)",
                                boxShadow: "0 2px 8px rgba(200,0,0,0.3)",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-10 text-gray-400 text-sm"
                        >
                          Belum ada tugas untuk divisi ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
      {deleteAssignmentId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800">Hapus Tugas?</h2>

            <p className="text-sm text-gray-500 mt-2">
              Tugas yang dihapus tidak dapat dikembalikan.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteAssignmentId(null)}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-500 hover:bg-gray-300"
              >
                Batal
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: "#DC2626" }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
