import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Plus } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";
import {
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
} from "../../services/userServices";
import api from "../../components/api/axios";

const getAllAssignments = () => api.get("/assignments");
const deleteAssignment = (id) => api.delete(`/assignments/${id}`);

const columns = [
  "No",
  "Title",
  "Description",
  "Sub Divisi",
  "Deadline",
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
  const [loading, setLoading] = useState(true);
  const [deleteAssignmentId, setDeleteAssignmentId] = useState(null);

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
    if (!activeDivision) return true;
    return subIdsInActive.includes(a.subDivisionId);
  });

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
            onChange={(_, i) => setActiveTabIndex(i)}
          >
            <div
              className="flex flex-col bg-white"
              style={{
                borderRadius: "0 0 16px 16px",
                boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
              }}
            >
              {/* ADD BUTTON */}
              <div className="px-4 pt-4 pb-2">
                <button
                  onClick={() => navigate("/admin/tugas/add")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110"
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
                            textAlign: ["No", "Submitted", "Action"].includes(
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
                    {filtered.map((a, i) => (
                      <tr
                        key={a.id}
                        className="transition-colors duration-150 hover:bg-purple-50"
                        style={{
                          borderBottom:
                            i < filtered.length - 1
                              ? "1px solid rgba(0,0,0,0.05)"
                              : "none",
                        }}
                      >
                        <td className="p-5 text-gray-500 text-xs text-center">
                          {i + 1}
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
