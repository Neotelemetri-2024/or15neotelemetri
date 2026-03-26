import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Plus, ExternalLink } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";
import {
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
} from "../../services/userServices";
import api from "../../components/api/axios";

const getAllModules = () => api.get("/learning-modules");
const deleteModule = (id) => api.delete(`/learning-modules/${id}`);

const columns = ["No", "Title", "Sub Divisi", "File", "Action"];

export default function MateriAdmin() {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [modules, setModules] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subDivisionMap, setSubDivisionMap] = useState({});
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── FETCH ──────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [modulesRes, deptRes] = await Promise.all([
          getAllModules(),
          getDepartments(),
        ]);
        setModules(modulesRes.data);

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
        console.error("Gagal load materi:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── HAPUS ──────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus materi ini?")) return;
    try {
      await deleteModule(id);
      setModules((p) => p.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Gagal hapus materi:", err);
    }
  };

  // Tambah setelah handleDelete
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

  // ── FILTER per tab divisi ──────────────────────────────────────
  const activeDivision = divisions[activeTabIndex];
  const subIdsInActive = activeDivision
    ? (subDivisionMap[activeDivision.id] || []).map((s) => s.id)
    : [];

  const filtered = modules.filter((m) => {
    if (!activeDivision) return true;
    return subIdsInActive.includes(m.subDivisionId);
  });

  // ── HELPER nama sub divisi ─────────────────────────────────────
  const getSubDivisionName = (subDivisionId) => {
    for (const subs of Object.values(subDivisionMap)) {
      const found = subs.find((s) => s.id === subDivisionId);
      if (found) return found.name;
    }
    return m?.subDivision?.name || "-";
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
                  onClick={() => navigate("/admin/materi/add")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110"
                  style={{
                    background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                    boxShadow: "0 2px 10px rgba(120,0,200,0.25)",
                  }}
                >
                  <Plus size={13} />
                  Add Materi
                </button>
              </div>

              <div
                className="w-full h-px"
                style={{ background: "rgba(0,0,0,0.06)" }}
              />

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr
                      style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}
                    >
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="p-5 text-xs font-bold text-gray-700 whitespace-nowrap"
                          style={{
                            textAlign: ["No", "File", "Action"].includes(col)
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
                    {filtered.map((m, i) => (
                      <tr
                        key={m.id}
                        className="transition-colors duration-150 hover:bg-purple-50"
                        style={{
                          borderBottom:
                            i < filtered.length - 1
                              ? "1px solid rgba(0,0,0,0.05)"
                              : "none",
                        }}
                      >
                        {/* No */}
                        <td className="p-5 text-gray-500 text-xs text-center">
                          {i + 1}
                        </td>

                        {/* Title */}
                        <td className="p-5 text-gray-800 text-xs whitespace-nowrap">
                          <div className="font-semibold">{m.title}</div>
                          {m.description && (
                            <div className="text-gray-400 text-[10px] mt-0.5 max-w-[200px] truncate">
                              {m.description}
                            </div>
                          )}
                        </td>

                        {/* Sub Divisi */}
                        <td className="p-5 text-gray-600 text-xs whitespace-nowrap">
                          {m.subDivision?.name ||
                            getSubDivisionName(m.subDivisionId)}
                        </td>

                        {/* File */}
                        <td className="p-5 text-center">
                          <button
                            onClick={() => handleDownload(m.fileUrl, m.title)}
                            className="inline-flex items-center gap-1 px-4 py-1 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110 whitespace-nowrap"
                            style={{
                              background:
                                "linear-gradient(135deg,#0077CC,#004499)",
                              boxShadow: "0 2px 8px rgba(0,100,200,0.3)",
                            }}
                          >
                            <ExternalLink size={11} />
                            Lihat
                          </button>
                        </td>

                        {/* Action */}
                        <td className="p-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleDelete(m.id)}
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
                          colSpan={5}
                          className="text-center py-10 text-gray-400 text-sm"
                        >
                          Belum ada materi untuk divisi ini.
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
    </AdminLayout>
  );
}
