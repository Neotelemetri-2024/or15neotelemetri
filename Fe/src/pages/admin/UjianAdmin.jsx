import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Search,
} from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";
import {
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
} from "../../services/userServices";
import api from "../../components/api/axios";

const getAllExams = () => api.get("/exams");
const deleteExam = (id) => api.delete(`/exams/${id}`);
const toggleExam = (id, isActive) => api.patch(`/exams/${id}`, { isActive });

export default function UjianAdmin() {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [exams, setExams] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subDivisionMap, setSubDivisionMap] = useState({});
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── FETCH ───────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [examsRes, deptRes] = await Promise.all([
          getAllExams(),
          getDepartments(),
        ]);
        setExams(examsRes.data);

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
        console.error("Gagal load data:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── FILTER per tab divisi ────────────────────────────────────────
  const activeDivision = divisions[activeTabIndex];
  const subIdsInActive = activeDivision
    ? (subDivisionMap[activeDivision.id] || []).map((s) => s.id)
    : [];

  const filtered = exams.filter((e) => {
    const matchDiv =
      !activeDivision || subIdsInActive.includes(e.subDivisionId);
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      e.title?.toLowerCase().includes(q) ||
      e.subDivision?.name?.toLowerCase().includes(q);
    return matchDiv && matchSearch;
  });

  // ── DELETE ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteExam(deleteId);

      setExams((p) => p.filter((ex) => ex.id !== deleteId));

      showToast("Ujian berhasil dihapus.");
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus ujian.", "error");
    } finally {
      setDeleteId(null);
    }
  };

  // ── TOGGLE AKTIF ─────────────────────────────────────────────────
  const handleToggle = async (id, isActive, e) => {
    e.stopPropagation();
    try {
      await toggleExam(id, !isActive);
      setExams((p) =>
        p.map((ex) => (ex.id === id ? { ...ex, isActive: !isActive } : ex)),
      );
    } catch (err) {
      console.error(err);
    }
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

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl font-bold">Manajemen Ujian</h1>
            <p className="text-white/40 text-xs mt-1">
              {exams.length} ujian terdaftar
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/ujian/buat")}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-semibold hover:brightness-110 transition-all"
            style={{
              background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
              boxShadow: "0 3px 16px rgba(120,0,200,0.3)",
            }}
          >
            <Plus size={15} /> Buat Ujian
          </button>
        </div>

        {/* TABS + TABLE */}
        <div className="mt-2">
          <DivisionTabs
            divisions={divisions.map((d) => d.name)}
            bgColor="#1a0023"
            onChange={(_, i) => {
              setActiveTabIndex(i);
              setSearch("");
            }}
          >
            <div className="rounded-b-2xl overflow-hidden flex flex-col bg-white">
              {/* SEARCH */}
              <div
                className="flex items-center gap-2 p-4"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-full flex-1"
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Cari judul atau sub divisi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent text-xs text-gray-600 outline-none flex-1 placeholder-gray-400"
                  />
                  <Search size={13} className="text-gray-400 shrink-0" />
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr
                      style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}
                    >
                      {[
                        "Judul",
                        "Sub Divisi",
                        "Durasi",
                        "Soal",
                        "Status",
                        "Aksi",
                      ].map((col) => (
                        <th
                          key={col}
                          className="p-4 text-xs font-bold text-gray-700 whitespace-nowrap"
                          style={{
                            textAlign: [
                              "Durasi",
                              "Soal",
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
                    {filtered.map((exam, i) => (
                      <tr
                        key={exam.id}
                        className="hover:bg-purple-50 cursor-pointer transition-colors"
                        style={{
                          borderBottom:
                            i < filtered.length - 1
                              ? "1px solid rgba(0,0,0,0.05)"
                              : "none",
                        }}
                        onClick={() => navigate(`/admin/ujian/${exam.id}`)}
                      >
                        {/* Judul */}
                        <td className="p-4">
                          <p className="text-gray-800 text-xs font-semibold">
                            {exam.title}
                          </p>
                          {exam.description && (
                            <p className="text-gray-400 text-[10px] mt-0.5 max-w-[200px] truncate">
                              {exam.description}
                            </p>
                          )}
                        </td>
                        {/* Sub Divisi */}
                        <td className="p-4 text-gray-600 text-xs whitespace-nowrap">
                          {exam.subDivision?.name || "-"}
                        </td>
                        {/* Durasi */}
                        <td className="p-4 text-center">
                          <span className="flex items-center justify-center gap-1 text-gray-600 text-xs">
                            <Clock size={11} /> {exam.durationMinutes} mnt
                          </span>
                        </td>
                        {/* Soal */}
                        <td className="p-4 text-center">
                          <span className="flex items-center justify-center gap-1 text-gray-600 text-xs">
                            <BookOpen size={11} /> {exam._count?.questions ?? 0}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="p-4 text-center">
                          <button
                            onClick={(e) =>
                              handleToggle(exam.id, exam.isActive, e)
                            }
                            className="flex items-center gap-1 mx-auto text-xs font-semibold px-2 py-1 rounded-full transition-all hover:brightness-110"
                            style={{
                              background: exam.isActive
                                ? "rgba(34,197,94,0.12)"
                                : "rgba(239,68,68,0.10)",
                              color: exam.isActive ? "#16a34a" : "#dc2626",
                            }}
                          >
                            {exam.isActive ? (
                              <>
                                <ToggleRight size={14} /> Aktif
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={14} /> Nonaktif
                              </>
                            )}
                          </button>
                        </td>
                        {/* Aksi */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/ujian/${exam.id}`);
                              }}
                              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold hover:brightness-110 transition-all"
                              style={{
                                background:
                                  "linear-gradient(135deg,#7B2FBE,#501A5E)",
                                color: "white",
                              }}
                            >
                              <ChevronRight size={12} /> Kelola
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(exam.id);
                              }}
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:brightness-110"
                              style={{
                                background: "#EE2222",
                                boxShadow: "0 2px 8px rgba(200,0,0,0.3)",
                              }}
                            >
                              <Trash2 size={12} className="text-white" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-12 text-gray-400 text-sm"
                        >
                          {search
                            ? "Tidak ada ujian yang cocok."
                            : "Belum ada ujian di divisi ini."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </DivisionTabs>
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800">Hapus Ujian?</h2>

            <p className="text-sm text-gray-500 mt-2">
              Semua soal yang terkait juga akan terhapus.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
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
      
      {/* TOAST */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-fade-in"
          style={{
            background: toast.type === "error" ? "#FEF2F2" : "#F0FDF4",
            border: `1px solid ${
              toast.type === "error" ? "#FECACA" : "#BBF7D0"
            }`,
          }}
        >
          <span
            className="text-sm font-medium"
            style={{
              color: toast.type === "error" ? "#DC2626" : "#16A34A",
            }}
          >
            {toast.msg}
          </span>
        </div>
      )}
    </AdminLayout>
  );
}
