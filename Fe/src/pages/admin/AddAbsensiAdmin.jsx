import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import { createActivity } from "../../services/attendanceService";

export default function AddAbsensiAdmin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", deadline: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleKirim = async () => {
    if (!form.name || !form.deadline) {
      setError("Semua field wajib diisi.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      // Convert date input (YYYY-MM-DD) ke ISO string untuk BE
      const deadlineISO = new Date(form.deadline).toISOString();
      await createActivity({ name: form.name, deadline: deadlineISO });
      navigate("/admin/absensi");
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal membuat kegiatan.");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col gap-4 pt-10 md:pt-4">

        {/* TOP ROW */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          
        </div>

        {/* CARD */}
        <div
          className="flex flex-col gap-5 px-5 md:px-8 py-6 md:py-7"
          style={{
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
            minHeight: "340px",
          }}
        >
          <div>
            <p className="text-gray-800 font-bold text-sm">List Absen</p>
            <p className="text-gray-400 text-xs mt-0.5 pb-3 border-b border-gray-100">Add List Absen</p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          {/* TITLE */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-700 font-semibold text-xs">Title</label>
            <input
              type="text"
              placeholder="Masukkan Nama Kegiatan"
              value={form.name}
              onChange={set("name")}
              style={inputStyle}
            />
          </div>

          {/* DEADLINE */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-700 font-semibold text-xs">Deadline</label>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={set("deadline")}
              style={{ ...inputStyle, color: form.deadline ? "#333" : "#aaa" }}
            />
          </div>

          {/* KIRIM */}
          <div className="flex-1 flex items-end justify-end pt-4">
            <button
              onClick={handleKirim}
              disabled={loading}
              className="w-full md:w-auto px-10 py-3 rounded-full text-white text-sm font-semibold transition-all hover:opacity-80 active:scale-95 disabled:opacity-40"
              style={{ background: "#FF00FF" }}
            >
              {loading ? "Menyimpan..." : "Kirim"}
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}