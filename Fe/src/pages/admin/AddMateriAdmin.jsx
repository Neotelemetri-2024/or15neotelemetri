import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ArrowLeft,
  Upload,
  ChevronDown,
  Trash2,
  FileText,
  ExternalLink,
  Download,
} from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";
import {
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
} from "../../services/userServices";
import api from "../../components/api/axios";

// ── API ────────────────────────────────────────────────────────
const getAllModules = () => api.get("/learning-modules");
const createModule = (formData) =>
  api.post("/learning-modules", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
const deleteModule = (id) => api.delete(`/learning-modules/${id}`);

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

export default function AddMateriAdmin() {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Dropdown data
  const [divisions, setDivisions] = useState([]);
  const [subDivisions, setSubDivisions] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // List modul yang sudah ada
  const [modules, setModules] = useState([]);

  // Form
  const [form, setForm] = useState({
    title: "",
    description: "",
    subDivisionId: "",
    divisionId: "",
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
          setDivisions(divRes.data);

          // Auto-fetch sub divisi untuk tab pertama
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
    setForm((p) => ({
      ...p,
      subDivisionId: "",
      divisionId: divisions[i]?.id || "",
    }));
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

  // ── SIMPAN MATERI ────────────────────────────────────────────
  const handleKirim = async () => {
    if (!form.title || !form.subDivisionId || !form.file) {
      setErrorMsg("Title, Sub Divisi, dan File wajib diisi.");
      return;
    }
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("subDivisionId", form.subDivisionId);
      fd.append("file", form.file);
      if (form.description) fd.append("description", form.description);

      const res = await createModule(fd);
      setModules((p) => [res.data, ...p]);

      // Reset form
      setForm((p) => ({
        ...p,
        title: "",
        description: "",
        file: null,
        subDivisionId: "",
      }));
      setSuccessMsg("Materi berhasil ditambahkan!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Gagal upload materi:", err);
      setErrorMsg(err.response?.data?.message || "Gagal mengunggah materi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (id) => {
      const secureUrl = await getSecureFileUrl(
        `/learning-modules/${id}/download`,
      );
      if (secureUrl) {
        window.location.href = secureUrl;
      }
    };

  const handlePreview = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  // ── HAPUS MATERI ─────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus materi ini?")) return;
    try {
      await deleteModule(id);
      setModules((p) => p.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Gagal hapus materi:", err);
    }
  };

  // Filter modules berdasarkan tab divisi aktif
  const activeDivision = divisions[activeTabIndex];
  const filteredModules = modules.filter((m) => {
    if (!activeDivision) return true;
    return m.subDivision?.divisionId === activeDivision.id;
  });

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
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex items-center gap-3">
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
              <p className="text-gray-800 font-bold text-sm">Tambah Materi</p>

              {/* TITLE */}
              <div className="flex flex-col gap-1">
                <label className={labelStyle}>Judul Materi *</label>
                <input
                  type="text"
                  placeholder="Contoh: Pengantar Machine Learning"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>

              {/* DESKRIPSI */}
              <div className="flex flex-col gap-1">
                <label className={labelStyle}>Deskripsi (opsional)</label>
                <textarea
                  placeholder="Deskripsi singkat materi..."
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>

              {/* SUB DIVISI */}
              <div className="flex flex-col gap-1">
                <label className={labelStyle}>Sub Divisi *</label>
                <div className="relative">
                  <select
                    value={form.subDivisionId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, subDivisionId: e.target.value }))
                    }
                    className="appearance-none cursor-pointer"
                    style={{
                      ...inputStyle,
                      paddingRight: "36px",
                      color: form.subDivisionId ? "#333" : "#aaa",
                    }}
                  >
                    <option value="" disabled hidden>
                      Pilih Sub Divisi
                    </option>
                    {subDivisions.map((s) => (
                      <option key={s.id} value={s.id} style={{ color: "#333" }}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* UPLOAD FILE */}
              <div className="flex flex-col gap-1">
                <label className={labelStyle}>
                  File Materi * (PDF, DOCX, PPTX)
                </label>
                <div
                  className="relative flex flex-col items-center justify-center gap-3 py-8 rounded-xl transition-all duration-200 cursor-pointer"
                  style={{
                    border: `2px dashed ${dragging ? "#7B2FBE" : "rgba(0,0,0,0.12)"}`,
                    background: dragging
                      ? "rgba(120,0,200,0.04)"
                      : "rgba(0,0,0,0.02)",
                    minHeight: "120px",
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
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
                      <FileText
                        size={16}
                        className="text-purple-500 shrink-0"
                      />
                      <span className="truncate max-w-[200px]">
                        {form.file.name}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg,#FF00FF,#990099)",
                        }}
                      >
                        <Upload size={18} className="text-white" />
                      </div>
                      <p className="text-gray-400 text-xs text-center px-4">
                        Seret dan lepas berkas di sini untuk menambahkan
                      </p>
                    </>
                  )}

                  <button
                    type="button"
                    className="mt-2 md:mt-0 md:absolute md:right-4 md:bottom-4 px-5 py-2 rounded-full text-white text-xs font-semibold hover:brightness-110 transition-all"
                    style={{
                      background: "linear-gradient(135deg,#00AA55,#007733)",
                      boxShadow: "0 2px 10px rgba(0,150,80,0.3)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current.click();
                    }}
                  >
                    Pilih File
                  </button>
                </div>
              </div>

              {/* PESAN */}
              {successMsg && (
                <p className="text-green-600 text-xs text-center">
                  {successMsg}
                </p>
              )}
              {errorMsg && (
                <p className="text-red-500 text-xs text-center">{errorMsg}</p>
              )}

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
                  {saving ? "Mengunggah..." : "Kirim"}
                </button>
              </div>

              {/* DIVIDER */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-gray-700 font-bold text-sm mb-3">
                  Daftar Materi — {activeDivision?.name || ""}
                </p>

                {filteredModules.length === 0 ? (
                  <p className="text-gray-400 text-xs text-center py-6">
                    Belum ada materi untuk divisi ini.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredModules.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                        style={{
                          background: "rgba(120,0,200,0.04)",
                          border: "1px solid rgba(120,0,200,0.1)",
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText
                            size={16}
                            className="text-purple-500 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-800 text-xs font-semibold truncate">
                              {m.title}
                            </p>
                            <p className="text-gray-400 text-[10px] mt-0.5">
                              {m.subDivision?.name || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handlePreview(m.fileUrl)}
                            className="text-blue-400 hover:text-blue-600 transition"
                            title="Buka file"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button
                            onClick={() => handleDownload(m.id, m.title)}
                            className="text-purple-500 hover:text-purple-700 transition"
                            title="Unduh file"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="text-red-400 hover:text-red-600 transition"
                            title="Hapus materi"
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
