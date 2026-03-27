import { useState, useEffect } from "react";
import {
  User, Plus, Pencil, Trash2, X,
  ChevronRight, ChevronDown,
  Building2, Layers, GitBranch, AlertCircle,
} from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getDivisions, createDivision, updateDivision, deleteDivision,
  getSubDivisions, createSubDivision, updateSubDivision, deleteSubDivision,
} from "../../services/masterdataServices";

const glassCard = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};
const inputStyle = {
  width: "100%", padding: "9px 13px", borderRadius: "10px",
  border: "1px solid rgba(0,0,0,0.12)", background: "white",
  fontSize: "13px", color: "#333", outline: "none", boxSizing: "border-box",
};
const btnPrimary = {
  background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
  boxShadow: "0 2px 10px rgba(120,0,200,0.28)",
};

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const c = type === "error"
    ? { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" }
    : { bg: "#F0FDF4", border: "#BBF7D0", text: "#16A34A" };
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <AlertCircle size={16} style={{ color: c.text }} />
      <span className="text-sm font-medium" style={{ color: c.text }}>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100"><X size={14} style={{ color: c.text }} /></button>
    </div>
  );
}

function Modal({ title, value, onChange, onClose, onSave, saving, placeholder, error }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-[400px] rounded-2xl px-7 py-6 flex flex-col gap-5"
        style={{ background: "white", boxShadow: "0 8px 48px rgba(120,0,200,0.25)" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-gray-800 font-bold text-base">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-gray-700 font-semibold text-xs">Nama</label>
          <input type="text" placeholder={placeholder} value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...inputStyle, borderColor: error ? "#FCA5A5" : "rgba(0,0,0,0.12)" }}
            autoFocus onKeyDown={(e) => e.key === "Enter" && onSave()} />
          {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-full text-gray-500 text-sm border border-gray-200 hover:bg-gray-50">Batal</button>
          <button onClick={onSave} disabled={saving || !value.trim()}
            className="px-6 py-2 rounded-full text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50"
            style={btnPrimary}>
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDelete({ label, onClose, onConfirm, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-[340px] rounded-2xl px-7 py-6 flex flex-col gap-4 text-center"
        style={{ background: "white", boxShadow: "0 8px 48px rgba(120,0,200,0.25)" }}>
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-gray-800 font-bold text-base">Hapus?</h2>
          <p className="text-gray-500 text-xs mt-1">
            Hapus <span className="font-semibold text-gray-700">"{label}"</span>? Semua data di dalamnya ikut terhapus.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-5 py-2 rounded-full text-gray-500 text-sm border border-gray-200 hover:bg-gray-50">Batal</button>
          <button onClick={onConfirm} disabled={deleting}
            className="px-6 py-2 rounded-full text-white text-sm font-semibold hover:brightness-110 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#EE2222,#AA0000)" }}>
            {deleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionBtns({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button onClick={onEdit} className="w-7 h-7 rounded-full flex items-center justify-center hover:brightness-110"
        style={{ background: "#F0C000", boxShadow: "0 2px 8px rgba(200,160,0,0.3)" }}>
        <Pencil size={12} className="text-white" />
      </button>
      <button onClick={onDelete} className="w-7 h-7 rounded-full flex items-center justify-center hover:brightness-110"
        style={{ background: "#EE2222", boxShadow: "0 2px 8px rgba(200,0,0,0.3)" }}>
        <Trash2 size={12} className="text-white" />
      </button>
    </div>
  );
}

export default function DivisionAdmin() {
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [departments, setDepartments] = useState([]);
  const [divisionMap, setDivisionMap] = useState({});
  const [subDivisionMap, setSubDivisionMap] = useState({});
  const [expandedDepts, setExpandedDepts] = useState({});
  const [expandedDivs, setExpandedDivs] = useState({});
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(null);
  const [modalValue, setModalValue] = useState("");
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const deptsRes = await getDepartments();
      const depts = deptsRes.data;
      setDepartments(depts);

      const divMap = {};
      const subMap = {};
      await Promise.all(
        depts.map(async (dept) => {
          const divRes = await getDivisions(dept.id);
          divMap[dept.id] = divRes.data;
          await Promise.all(
            divRes.data.map(async (div) => {
              const subRes = await getSubDivisions(div.id);
              subMap[div.id] = subRes.data;
            })
          );
        })
      );
      setDivisionMap(divMap);
      setSubDivisionMap(subMap);
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const toggleDept = (id) => setExpandedDepts((p) => ({ ...p, [id]: !p[id] }));
  const toggleDiv = (id) => setExpandedDivs((p) => ({ ...p, [id]: !p[id] }));

  const openAdd = (type, parentId) => {
    setModal({ type, mode: "add", parentId });
    setModalValue(""); setModalError("");
  };
  const openEdit = (type, target, parentId) => {
    setModal({ type, mode: "edit", target, parentId });
    setModalValue(target.name); setModalError("");
  };
  const closeModal = () => { setModal(null); setModalValue(""); setModalError(""); };

  const handleSave = async () => {
    if (!modalValue.trim()) return;
    setSaving(true); setModalError("");
    try {
      const { type, mode, target, parentId } = modal;
      const name = modalValue.trim();
      if (type === "dept") {
        mode === "add" ? await createDepartment({ name }) : await updateDepartment(target.id, { name });
      } else if (type === "div") {
        mode === "add" ? await createDivision({ name, departmentId: parentId }) : await updateDivision(target.id, { name });
      } else {
        mode === "add" ? await createSubDivision({ name, divisionId: parentId }) : await updateSubDivision(target.id, { name });
      }
      const labels = { dept: "Departemen", div: "Divisi", sub: "Sub Divisi" };
      showToast(`${labels[type]} berhasil ${mode === "add" ? "ditambahkan" : "diperbarui"}.`);
      closeModal();
      await fetchAll();
    } catch (err) {
      if (err?.response?.status === 409) {
        setModalError("Nama sudah digunakan di sini.");
      } else {
        setModalError("Terjadi kesalahan, coba lagi.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { type, id } = deleteTarget;
      if (type === "dept") await deleteDepartment(id);
      else if (type === "div") await deleteDivision(id);
      else await deleteSubDivision(id);
      const labels = { dept: "Departemen", div: "Divisi", sub: "Sub Divisi" };
      showToast(`${labels[type]} berhasil dihapus.`);
      setDeleteTarget(null);
      await fetchAll();
    } catch (err) {
      showToast(err?.response?.data?.message || "Gagal menghapus.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const modalTitle = () => {
    if (!modal) return "";
    const l = { dept: "Departemen", div: "Divisi", sub: "Sub Divisi" };
    return `${modal.mode === "add" ? "Tambah" : "Edit"} ${l[modal.type]}`;
  };
  const modalPlaceholder = () => {
    if (!modal) return "";
    return { dept: "Nama departemen", div: "Nama divisi", sub: "Nama sub divisi" }[modal.type];
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
          <span className="text-white font-semibold text-sm">{adminUser.email || "Admin"}</span>
          <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <User size={18} className="text-white/70" />
          </div>
        </div>

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl font-bold">Manajemen Divisi</h1>
            <p className="text-white/40 text-xs mt-1">Kelola departemen, divisi, dan sub divisi</p>
          </div>
          <button onClick={() => openAdd("dept")}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-semibold hover:brightness-110"
            style={btnPrimary}>
            <Plus size={15} /> Add Departemen
          </button>
        </div>

        {/* LEGEND */}
        <div className="flex items-center gap-4 flex-wrap">
          {[
            { icon: Building2, label: "Departemen", color: "#A78BFA" },
            { icon: Layers, label: "Divisi", color: "#38BDF8" },
            { icon: GitBranch, label: "Sub Divisi", color: "#34D399" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: color + "22", border: `1px solid ${color}55` }}>
                <Icon size={11} style={{ color }} />
              </div>
              <span className="text-white/50 text-xs">{label}</span>
            </div>
          ))}
        </div>

        {/* LIST */}
        {departments.length === 0 ? (
          <div className="rounded-2xl py-12 flex flex-col items-center gap-3" style={glassCard}>
            <Building2 size={32} className="text-white/20" />
            <p className="text-white/40 text-sm">Belum ada departemen.</p>
            <button onClick={() => openAdd("dept")}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-semibold hover:brightness-110"
              style={btnPrimary}>
              <Plus size={12} /> Tambah Departemen
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {departments.map((dept) => {
              const divs = divisionMap[dept.id] || [];
              const isOpenDept = expandedDepts[dept.id];
              const totalSubs = divs.reduce((acc, div) => acc + (subDivisionMap[div.id]?.length || 0), 0);

              return (
                <div key={dept.id} className="rounded-2xl overflow-hidden" style={glassCard}>
                  {/* DEPT ROW */}
                  <div className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
                    style={{ borderBottom: isOpenDept ? "1px solid rgba(255,255,255,0.08)" : "none" }}
                    onClick={() => toggleDept(dept.id)}>
                    <div className="w-6 h-6 flex items-center justify-center rounded-md"
                      style={{ background: "rgba(255,255,255,0.08)" }}>
                      {isOpenDept ? <ChevronDown size={14} className="text-white/60" /> : <ChevronRight size={14} className="text-white/60" />}
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}>
                      <Building2 size={15} style={{ color: "#A78BFA" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{dept.name}</p>
                      <p className="text-white/40 text-xs">{divs.length} divisi · {totalSubs} sub divisi</p>
                    </div>
                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                      <button
                        onClick={() => { openAdd("div", dept.id); setExpandedDepts((p) => ({ ...p, [dept.id]: true })); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold hover:brightness-110"
                        style={{ background: "rgba(56,189,248,0.18)", border: "1px solid rgba(56,189,248,0.35)", color: "#7DD3FC" }}>
                        <Plus size={11} /> Divisi
                      </button>
                      <ActionBtns
                        onEdit={() => openEdit("dept", dept)}
                        onDelete={() => setDeleteTarget({ type: "dept", id: dept.id, name: dept.name })}
                      />
                    </div>
                  </div>

                  {/* DIVISIONS */}
                  {isOpenDept && (
                    <div className="px-5 py-4 flex flex-col gap-3">
                      {divs.length === 0 ? (
                        <p className="text-white/30 text-xs py-2 flex items-center gap-2"><Layers size={13} />Belum ada divisi.</p>
                      ) : divs.map((div) => {
                        const subs = subDivisionMap[div.id] || [];
                        const isOpenDiv = expandedDivs[div.id];
                        return (
                          <div key={div.id} className="rounded-xl overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            {/* DIV ROW */}
                            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                              style={{ borderBottom: isOpenDiv ? "1px solid rgba(255,255,255,0.06)" : "none" }}
                              onClick={() => toggleDiv(div.id)}>
                              <div className="w-5 h-5 flex items-center justify-center rounded-md"
                                style={{ background: "rgba(255,255,255,0.06)" }}>
                                {isOpenDiv ? <ChevronDown size={12} className="text-white/50" /> : <ChevronRight size={12} className="text-white/50" />}
                              </div>
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)" }}>
                                <Layers size={13} style={{ color: "#38BDF8" }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white/85 font-semibold text-xs">{div.name}</p>
                                <p className="text-white/35 text-[10px]">{subs.length} sub divisi</p>
                              </div>
                              <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                                <button
                                  onClick={() => { openAdd("sub", div.id); setExpandedDivs((p) => ({ ...p, [div.id]: true })); }}
                                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold hover:brightness-110"
                                  style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", color: "#6EE7B7" }}>
                                  <Plus size={10} /> Sub Divisi
                                </button>
                                <ActionBtns
                                  onEdit={() => openEdit("div", div, dept.id)}
                                  onDelete={() => setDeleteTarget({ type: "div", id: div.id, name: div.name })}
                                />
                              </div>
                            </div>

                            {/* SUB DIVISIONS */}
                            {isOpenDiv && (
                              <div className="px-4 py-3 flex flex-col gap-2">
                                {subs.length === 0 ? (
                                  <p className="text-white/25 text-[10px] py-1 flex items-center gap-2"><GitBranch size={11} />Belum ada sub divisi.</p>
                                ) : subs.map((sub) => (
                                  <div key={sub.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                                    style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                                    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                      style={{ background: "rgba(52,211,153,0.15)" }}>
                                      <GitBranch size={10} style={{ color: "#34D399" }} />
                                    </div>
                                    <p className="flex-1 text-white/70 text-xs font-medium">{sub.name}</p>
                                    <ActionBtns
                                      onEdit={() => openEdit("sub", sub, div.id)}
                                      onDelete={() => setDeleteTarget({ type: "sub", id: sub.id, name: sub.name })}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modalTitle()} placeholder={modalPlaceholder()}
          value={modalValue} onChange={(v) => { setModalValue(v); setModalError(""); }}
          onClose={closeModal} onSave={handleSave} saving={saving} error={modalError} />
      )}
      {deleteTarget && (
        <ConfirmDelete label={deleteTarget.name}
          onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} deleting={deleting} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}