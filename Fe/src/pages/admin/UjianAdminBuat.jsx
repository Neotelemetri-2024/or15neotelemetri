import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, ChevronDown, ArrowLeft } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import {
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
} from "../../services/userServices";
import api from "../../components/api/axios";

const createExam = (payload) => api.post("/exams", payload);

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: "8px",
  border: "1px solid rgba(0,0,0,0.12)", background: "white",
  fontSize: "13px", color: "#333", outline: "none", boxSizing: "border-box",
};
const label = "text-gray-700 font-semibold text-xs mb-1 block";

function SelectInput({ value, onChange, options, placeholder, disabled }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} disabled={disabled}
        className="appearance-none cursor-pointer"
        style={{ ...inputStyle, paddingRight: "36px", color: value ? "#333" : "#aaa", opacity: disabled ? 0.5 : 1 }}>
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

export default function UjianAdminBuat() {
  const navigate  = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [divisions,    setDivisions]    = useState([]);
  const [subDivisions, setSubDivisions] = useState([]);
  const [form, setForm] = useState({
    title: "", description: "", durationMinutes: 60, maxAttempts: 1,
    startAt: "", endAt: "", subDivisionId: "", divisionId: "", isActive: true,
  });
  const [saving,      setSaving]      = useState(false);
  const [errorMsg,    setErrorMsg]    = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const deptRes = await getDepartments();
        const opDept  = deptRes.data.find((d) => d.name.toLowerCase().includes("operasional"));
        if (opDept) {
          const divRes = await getDivisionsByDepartment(opDept.id);
          setDivisions(divRes.data);
        }
      } catch (err) { console.error(err); }
    };
    init();
  }, []);

  const handleDivisionChange = async (e) => {
    const divId = e.target.value;
    setForm((p) => ({ ...p, divisionId: divId, subDivisionId: "" }));
    setSubDivisions([]);
    if (divId) {
      const res = await getSubDivisionsByDivision(divId);
      setSubDivisions(res.data);
    }
  };

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.subDivisionId) {
      setErrorMsg("Judul dan Sub Divisi wajib diisi."); return;
    }
    setSaving(true); setErrorMsg("");
    try {
      const payload = {
        title:           form.title.trim(),
        description:     form.description || undefined,
        durationMinutes: parseInt(form.durationMinutes),
        maxAttempts:     parseInt(form.maxAttempts),
        subDivisionId:   form.subDivisionId,
        isActive:        form.isActive,
        startAt:         form.startAt ? new Date(form.startAt).toISOString() : undefined,
        endAt:           form.endAt   ? new Date(form.endAt).toISOString()   : undefined,
      };
      const res = await createExam(payload);
      // Langsung navigasi ke halaman detail untuk tambah soal
      navigate(`/admin/ujian/${res.data.id}`, { replace: true });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Gagal membuat ujian.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col gap-6 pt-10 md:pt-4 pb-10">

        {/* TOP RIGHT */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-white font-semibold text-sm">{adminUser.email || "Admin"}</span>
          <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <User size={18} className="text-white/70" />
          </div>
        </div>

        {/* HEADER */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/admin/ujian")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:brightness-110 transition-all"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <ArrowLeft size={16} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Buat Ujian Baru</h1>
            <p className="text-white/40 text-xs mt-1">Isi detail ujian, soal ditambahkan setelah ujian dibuat</p>
          </div>
        </div>

        {/* FORM */}
        <div className=" bg-white rounded-2xl p-6 shadow-lg flex flex-col gap-5">

          <div className="flex flex-col gap-1">
            <label className={label}>Judul Ujian *</label>
            <input type="text" placeholder="Contoh: Ujian Programming Batch 1"
              value={form.title} onChange={set("title")} style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1">
            <label className={label}>Deskripsi</label>
            <textarea placeholder="Deskripsi ujian (opsional)" rows={2}
              value={form.description} onChange={set("description")}
              style={{ ...inputStyle, resize: "none" }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className={label}>Durasi (menit) *</label>
              <input type="number" value={form.durationMinutes} onChange={set("durationMinutes")} style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={label}>Maks Percobaan</label>
              <input type="number" value={form.maxAttempts} onChange={set("maxAttempts")} style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className={label}>Waktu Mulai</label>
              <input type="datetime-local" value={form.startAt} onChange={set("startAt")} style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={label}>Waktu Selesai</label>
              <input type="datetime-local" value={form.endAt} onChange={set("endAt")} style={inputStyle} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className={label}>Divisi *</label>
            <SelectInput value={form.divisionId} onChange={handleDivisionChange}
              options={divisions} placeholder="Pilih Divisi" />
          </div>

          <div className="flex flex-col gap-1">
            <label className={label}>Sub Divisi *</label>
            <SelectInput value={form.subDivisionId}
              onChange={(e) => setForm((p) => ({ ...p, subDivisionId: e.target.value }))}
              options={subDivisions}
              placeholder={form.divisionId ? "Pilih Sub Divisi" : "Pilih Divisi dulu"}
              disabled={subDivisions.length === 0} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="accent-purple-600" />
            <label htmlFor="isActive" className="text-gray-700 text-xs font-semibold cursor-pointer">
              Aktifkan ujian sekarang
            </label>
          </div>

          {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}

          <div className="flex gap-3 mt-1">
            <button onClick={() => navigate("/admin/ujian")}
              className="flex-1 py-3 rounded-xl text-gray-500 text-sm border border-gray-200 hover:bg-gray-50 transition">
              Batal
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3 rounded-xl text-white font-semibold text-sm hover:brightness-110 disabled:opacity-50 transition"
              style={{ background: "linear-gradient(135deg,#7B2FBE,#501A5E)", boxShadow: "0 3px 16px rgba(120,0,200,0.3)" }}>
              {saving ? "Menyimpan..." : "Buat & Tambah Soal"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}