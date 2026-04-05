import { useState, useEffect } from "react";
import { User, Search, SlidersHorizontal, ExternalLink } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";
import {
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
} from "../../services/userServices";
import api from "../../components/api/axios";

const getAllAssignments = () => api.get("/assignments");
const getSubmissions = (assignmentId) =>
  api.get(`/assignments/${assignmentId}/submissions`);
const scoreSubmission = (submissionId, payload) =>
  api.patch(`/assignments/submissions/${submissionId}/score`, payload);

const ROWS_PER_PAGE = 10;
const columns = [
  "No",
  "Nama",
  "NIM",
  "Sub Divisi",
  "Tugas",
  "File",
  "Dikumpulkan",
  "Nilai",
  "Aksi",
];

export default function PengumpulanTugasAdmin() {
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [rows, setRows] = useState([]); // flat list: { submission + assignment + user info }
  const [divisions, setDivisions] = useState([]);
  const [subDivisionMap, setSubDivisionMap] = useState({});
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Score modal
  const [scoreTarget, setScoreTarget] = useState(null); // { submissionId, currentScore, currentFeedback }
  const [scoreForm, setScoreForm] = useState({ score: "", feedback: "" });
  const [scoring, setScoring] = useState(false);

  // ── FETCH ──────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [assignmentsRes, deptRes] = await Promise.all([
          getAllAssignments(),
          getDepartments(),
        ]);

        const assignments = assignmentsRes.data;

        // Fetch semua submissions dari semua assignment sekaligus
        const submissionResults = await Promise.all(
          assignments.map(async (a) => {
            try {
              const res = await getSubmissions(a.id);
              return res.data.map((s) => ({ ...s, assignment: a }));
            } catch {
              return [];
            }
          }),
        );

        // Flatten semua submissions
        setRows(submissionResults.flat());

        // Fetch divisions
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
        console.error("Gagal load pengumpulan tugas:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── FILTER per tab divisi + search ────────────────────────────
  const activeDivision = divisions[activeTabIndex];
  const subIdsInActive = activeDivision
    ? (subDivisionMap[activeDivision.id] || []).map((s) => s.id)
    : [];

  const filtered = rows.filter((row) => {
    // Filter per divisi
    if (activeDivision) {
      const subDivId = row.assignment?.subDivisionId;
      if (subDivId && !subIdsInActive.includes(subDivId)) return false;
    }
    // Filter search
    if (search) {
      const q = search.toLowerCase();
      return (
        row.user?.profile?.fullName?.toLowerCase().includes(q) ||
        row.user?.profile?.nim?.toLowerCase().includes(q) ||
        row.assignment?.title?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── PAGINATION ─────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice(
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

  const handleDownload = async (url, filename) => {
    try {
      const ext = url.split(".").pop().split("?")[0];
      const filenameWithExt = filename.endsWith(`.${ext}`)
        ? filename
        : `${filename}.${ext}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filenameWithExt;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error("Gagal download:", err);
      window.open(url, "_blank");
    }
  };

  // ── BERI NILAI ────────────────────────────────────────────────
  const openScoreModal = (row) => {
    setScoreTarget(row);
    setScoreForm({
      score: row.score ?? "",
      feedback: row.feedback ?? "",
    });
  };

  const handleScore = async () => {
    if (!scoreTarget) return;
    setScoring(true);
    try {
      await scoreSubmission(scoreTarget.id, {
        score: parseFloat(scoreForm.score),
        feedback: scoreForm.feedback || undefined,
      });
      // Update lokal
      setRows((prev) =>
        prev.map((r) =>
          r.id === scoreTarget.id
            ? {
                ...r,
                score: parseFloat(scoreForm.score),
                feedback: scoreForm.feedback,
              }
            : r,
        ),
      );
      setScoreTarget(null);
    } catch (err) {
      console.error("Gagal beri nilai:", err);
    } finally {
      setScoring(false);
    }
  };

  // Format tanggal
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper nama sub divisi
  const getSubDivName = (subDivisionId) => {
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
            onChange={handleTabChange}
          >
            <div
              className="flex flex-col bg-white"
              style={{
                borderRadius: "0 0 16px 16px",
                boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
              }}
            >
              {/* FILTER + SEARCH */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b"
                style={{ borderColor: "rgba(0,0,0,0.06)" }}
              >
                
                <div
                  className="flex items-center gap-2 px-3 py-[7px] rounded-full flex-1"
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.10)",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Search nama, NIM, atau judul tugas..."
                    value={search}
                    onChange={handleSearch}
                    className="bg-transparent text-xs text-gray-600 outline-none flex-1 placeholder-gray-400"
                  />
                  <Search size={13} className="text-gray-400 shrink-0" />
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
                            textAlign: ["No", "File", "Nilai", "Aksi"].includes(
                              col,
                            )
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
                    {paginated.map((row, i) => (
                      <tr
                        key={row.id}
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
                        <td className="p-4 text-gray-800 text-xs whitespace-nowrap font-semibold">
                          {row.user?.profile?.fullName || "-"}
                        </td>
                        <td className="p-4 text-gray-600 text-xs whitespace-nowrap">
                          {row.user?.profile?.nim || "-"}
                        </td>
                        <td className="p-4 text-gray-600 text-xs whitespace-nowrap">
                          {getSubDivName(row.assignment?.subDivisionId)}
                        </td>
                        <td className="p-4 text-gray-600 text-xs whitespace-nowrap">
                          {row.assignment?.title || "-"}
                        </td>
                        {/* File submission */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() =>
                              handleDownload(
                                row.fileUrl,
                                `${row.user?.profile?.fullName || "submission"}-${row.assignment?.title || "tugas"}`,
                              )
                            }
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110"
                            style={{
                              background:
                                "linear-gradient(135deg,#0077CC,#004499)",
                              boxShadow: "0 2px 8px rgba(0,100,200,0.3)",
                            }}
                          >
                            <ExternalLink size={10} />
                            Lihat
                          </button>
                        </td>
                        {/* Waktu kumpul */}
                        <td className="p-4 text-gray-500 text-xs whitespace-nowrap">
                          {formatDate(row.submittedAt)}
                        </td>
                        {/* Nilai */}
                        <td className="p-4 text-center">
                          {row.score != null ? (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-bold"
                              style={{
                                background:
                                  row.score >= 80
                                    ? "rgba(34,197,94,0.15)"
                                    : row.score >= 60
                                      ? "rgba(245,158,11,0.15)"
                                      : "rgba(239,68,68,0.15)",
                                color:
                                  row.score >= 80
                                    ? "#16a34a"
                                    : row.score >= 60
                                      ? "#d97706"
                                      : "#dc2626",
                              }}
                            >
                              {parseFloat(row.score).toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        {/* Aksi beri nilai */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => openScoreModal(row)}
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110 whitespace-nowrap"
                            style={{
                              background:
                                row.score != null
                                  ? "linear-gradient(135deg,#F0A000,#CC7700)"
                                  : "linear-gradient(135deg,#7B2FBE,#501A5E)",
                              boxShadow: "0 2px 8px rgba(120,0,200,0.2)",
                            }}
                          >
                            {row.score != null ? "Edit Nilai" : "Beri Nilai"}
                          </button>
                        </td>
                      </tr>
                    ))}

                    {paginated.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="text-center py-10 text-gray-400 text-sm"
                        >
                          {search
                            ? "Tidak ada data yang cocok."
                            : "Belum ada pengumpulan tugas."}
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
                    {Math.min(currentPage * ROWS_PER_PAGE, filtered.length)}{" "}
                    dari {filtered.length}
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className="px-3 py-1 text-xs rounded-lg border transition"
                          style={{
                            borderColor:
                              currentPage === p ? "#7B2FBE" : "rgba(0,0,0,0.1)",
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

      {/* MODAL BERI NILAI */}
      {scoreTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-gray-800 font-bold text-base mb-1">
              Beri Nilai
            </h3>
            <p className="text-gray-500 text-xs mb-4">
              {scoreTarget.user?.profile?.fullName} —{" "}
              {scoreTarget.assignment?.title}
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-gray-700 font-semibold text-xs">
                  Nilai (0–100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={scoreForm.score}
                  onChange={(e) =>
                    setScoreForm((p) => ({ ...p, score: e.target.value }))
                  }
                  placeholder="Contoh: 85"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-purple-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-700 font-semibold text-xs">
                  Feedback (opsional)
                </label>
                <textarea
                  value={scoreForm.feedback}
                  onChange={(e) =>
                    setScoreForm((p) => ({ ...p, feedback: e.target.value }))
                  }
                  placeholder="Tulis feedback untuk peserta..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-purple-400 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setScoreTarget(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleScore}
                disabled={!scoreForm.score || scoring}
                className="flex-1 py-2 rounded-xl text-white text-sm font-semibold transition disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                }}
              >
                {scoring ? "Menyimpan..." : "Simpan Nilai"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
