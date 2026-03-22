import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, ArrowLeft, ChevronDown, Upload, FileText, Trash2, ExternalLink } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";
import {
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
} from "../../services/userServices";
import api from "../../components/api/axios";

// ── API ────────────────────────────────────────────────────────
const getAllAssignments  = () => api.get("/assignments");
const createAssignment  = (formData) => api.post("/assignments", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
const deleteAssignment  = (id) => api.delete(`/assignments/${id}`);

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid rgba(0,0,0,0.12)",
  background: "white",
  fontSize: "13px",
  color: "#333",
  outline: "none",
};

const labelStyle = "text-gray-700 font-semibold text-xs mb-1 block";

export default function AddTugasAdmin() {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Dropdown
  const [divisions, setDivisions] = useState([]);
  const [subDivisions, setSubDivisions] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // List tugas
  const [assignments, setAssignments] = useState([]);

  // Form
  const [form, setForm] = useState({
    title: "",
    description: "",
    subDivisionId: "",
    divisionId: "",
    dueAt: "",
    file: null,
  });
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // ── FETCH ────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [assignmentsRes, deptRes] = await Promise.all([
          getAllAssignments(),
          getDepartments(),
        ]);
        setAssignments(assignmentsRes.data);

        const opDept = deptRes.data.find((d) =>
          d.name.toLowerCase().includes("operasional")
        );
        if (opDept) {
          const divRes = await getDivisionsByDepartment(opDept.id);
          setDivisions(divRes.data);

          if (divRes.data.length > 0) {
            const subRes = await getSubDivisionsByDivision(divRes.data[0].id);
            setSubDivisions(subRes.data);
            setForm((p) => ({ ...p, divisionId: divRes.data[0].id }));
          }
        }
      } catch (err) {
        console.error("Gagal load data:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch sub divisi saat tab berubah
  const handleTabChange = async (_, i) => {
    setActiveTabIndex(i);
    setForm((p) => ({ ...p, subDivisionId: "", divisionId: divisions[i]?.id || "" }));
    setSubDivisions([]);
    if (divisions[i]) {
      const subRes = await getSubDivisionsByDivision(divisions[i].id);
      setSubDivisions(subRes.data);
    }
  };

  // ── FILE HANDLER ─────────────────────────────────────────────
  const handleFile = (file) => {
    if (file) setForm((p) => ({ ...p, file }));
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // ── KIRIM ────────────────────────────────────────────────────
  const handleKirim = async () => {
    if (!form.title || !form.subDivisionId || !form.dueAt) {
      setErrorMsg("Title, Sub Divisi, dan Deadline wajib diisi.");
      return;
    }
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("subDivisionId", form.subDivisionId);
      // Convert datetime-local ke ISO string
      fd.append("dueAt", new Date(form.dueAt).toISOString());
      if (form.description) fd.append("description", form.description);
      if (form.file) fd.append("file", form.file);

      const res = await createAssignment(fd);
      setAssignments((p) => [res.data, ...p]);

      // Reset form
      setForm((p) => ({
        ...p,
        title: "",
        description: "",
        subDivisionId: "",
        dueAt: "",
        file: null,
      }));
      setSuccessMsg("Tugas berhasil ditambahkan!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Gagal buat tugas:", err);
      setErrorMsg(err.response?.data?.message || "Gagal membuat tugas.");
    } finally {
      setSaving(false);
    }
  };

  // ── HAPUS ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus tugas ini?")) return;
    try {
      await deleteAssignment(id);
      setAssignments((p) => p.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Gagal hapus tugas:", err);
    }
  };

  // Filter assignments berdasarkan tab divisi aktif
  const activeDivision = divisions[activeTabIndex];
  const filteredAssignments = assignments.filter((a) => {
    if (!activeDivision) return true;
    return a.subDivision?.divisionId === activeDivision.id;
  });

  // Format tanggal
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
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
      <div className="min-h-screen flex flex-col gap-4 pt-10 md:pt-4 pb-10">

        {/* TOP ROW */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors shrink-0"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
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
        </div>

        {/* TABS + CARD */}
        <div className="mt-4">
          <DivisionTabs
            divisions={divisions.map((d) => d.name)}
            bgColor="#1a0023"
            onChange={handleTabChange}
          >
            <div
              className="flex flex-col gap-5 px-5 md:px-8 py-6 md:py-7"
              style={{
                background: "white",
                borderRadius: "0 0 16px 16px",
                boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
              }}
            >
              <p className="text-gray-800 font-bold text-sm">Add Tugas</p>

              {/* TITLE */}
              <div className="flex flex-col gap-1">
                <label className={labelStyle}>Judul Tugas *</label>
                <input
                  type="text"
                  placeholder="Input Title"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              {/* DESCRIPTION */}
              <div className="flex flex-col gap-1">
                <label className={labelStyle}>Deskripsi</label>
                <textarea
                  placeholder="Input Description"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  style={{ ...inputStyle, resize: "none", lineHeight: "1.6" }}
                />
              </div>

              {/* SUB DIVISI */}
              <div className="flex flex-col gap-1">
                <label className={labelStyle}>Sub Divisi *</label>
                <div className="relative">
                  <select
                    value={form.subDivisionId}
                    onChange={(e) => setForm((p) => ({ ...p, subDivisionId: e.target.value }))}
                    className="appearance-none cursor-pointer"
                    style={{
                      ...inputStyle,
                      paddingRight: "36px",
                      color: form.subDivisionId ? "#333" : "#aaa",
                    }}
                  >
                    <option value="" disabled hidden>
                      Pilih satu diantara beberapa Sub Divisi
                    </option>
                    {subDivisions.map((s) => (
                      <option key={s.id} value={s.id} style={{ color: "#333" }}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* DEADLINE */}
              <div className="flex flex-col gap-1">
                <label className={labelStyle}>Deadline *</label>
                <input
                  type="datetime-local"
                  value={form.dueAt}
                  onChange={(e) => setForm((p) => ({ ...p, dueAt: e.target.value }))}
                  style={{ ...inputStyle, color: form.dueAt ? "#333" : "#aaa" }}
                />
              </div>

              {/* FILE OPSIONAL */}
              <div className="flex flex-col gap-1">
                <label className={labelStyle}>File Template (opsional — PDF, DOCX, dll)</label>
                <div
                  className="relative flex flex-col items-center justify-center gap-3 py-6 rounded-xl transition-all duration-200 cursor-pointer"
                  style={{
                    border: `2px dashed ${dragging ? "#7B2FBE" : "rgba(0,0,0,0.12)"}`,
                    background: dragging ? "rgba(120,0,200,0.04)" : "rgba(0,0,0,0.02)",
                    minHeight: "100px",
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.pptx,.docx,.ppt,.doc"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                  {form.file ? (
                    <div className="flex items-center gap-2 text-gray-600 text-xs font-medium px-4">
                      <FileText size={16} className="text-purple-500 shrink-0" />
                      <span className="truncate max-w-[200px]">{form.file.name}</span>
                    </div>
                  ) : (
                    <>
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#7B2FBE,#501A5E)" }}
                      >
                        <Upload size={16} className="text-white" />
                      </div>
                      <p className="text-gray-400 text-xs text-center px-4">
                        Seret dan lepas berkas di sini (opsional)
                      </p>
                    </>
                  )}
                  <button
                    type="button"
                    className="mt-2 md:mt-0 md:absolute md:right-4 md:bottom-4 px-4 py-1.5 rounded-full text-white text-xs font-semibold hover:brightness-110 transition-all"
                    style={{ background: "linear-gradient(135deg,#00AA55,#007733)" }}
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                  >
                    Pilih File
                  </button>
                </div>
              </div>

              {/* PESAN */}
              {successMsg && <p className="text-green-600 text-xs text-center">{successMsg}</p>}
              {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}

              {/* KIRIM */}
              <div className="flex justify-end">
                <button
                  onClick={handleKirim}
                  disabled={saving}
                  className="w-full md:w-auto px-8 py-3 rounded-full text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(120,0,200,0.4)] disabled:opacity-50 disabled:scale-100"
                  style={{
                    background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                    boxShadow: "0 3px 16px rgba(120,0,200,0.30)",
                  }}
                >
                  {saving ? "Menyimpan..." : "Kirim"}
                </button>
              </div>

              {/* DIVIDER + LIST TUGAS */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-gray-700 font-bold text-sm mb-3">
                  Daftar Tugas — {activeDivision?.name || ""}
                </p>

                {filteredAssignments.length === 0 ? (
                  <p className="text-gray-400 text-xs text-center py-6">
                    Belum ada tugas untuk divisi ini.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredAssignments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                        style={{
                          background: "rgba(120,0,200,0.04)",
                          border: "1px solid rgba(120,0,200,0.1)",
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 text-xs font-semibold truncate">
                            {a.title}
                          </p>
                          <p className="text-gray-400 text-[10px] mt-0.5">
                            {a.subDivision?.name || "-"} · Deadline: {formatDate(a.dueAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {a.fileUrl && (
                            <a
                              href={a.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-500 hover:text-purple-700 transition"
                              title="Lihat file"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="text-red-400 hover:text-red-600 transition"
                            title="Hapus tugas"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DivisionTabs>
        </div>
      </div>
    </AdminLayout>
  );
}