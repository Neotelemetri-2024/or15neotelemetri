import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, ArrowLeft } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";

export default function AbsensiAdmin() {
  const navigate = useNavigate();
  const [activeDivision, setActiveDivision] = useState(0);
  const [form, setForm] = useState({ title: "", deadline: "" });

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleKirim = () => {
    console.log("Kirim absensi:", { division: activeDivision, ...form });
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
      <div className="min-h-screen px-8 py-8 flex flex-col gap-4">

        {/* TOP ROW */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex items-center gap-3">
            <span className="text-white font-semibold text-sm">NamaUser</span>
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <User size={18} className="text-white/70" />
            </div>
          </div>
        </div>

        {/* TABS + CARD */}
        <div className="mt-6">
          <DivisionTabs
            activeDivision={activeDivision}
            setActiveDivision={setActiveDivision}
          />

          {/* CARD PUTIH */}
          <div
            className="flex flex-col gap-5 px-8 py-7"
            style={{
              background: "white",
              borderRadius: "0 0 16px 16px",
              boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
              position: "relative",
              zIndex: 15,
              minHeight: "340px",
            }}
          >
            <p className="text-gray-800 font-bold text-sm">Add List absen</p>

            {/* TITLE */}
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-semibold text-xs">Title</label>
              <input
                type="text"
                placeholder="Masukkan Nama Kegiatan"
                value={form.title}
                onChange={set("title")}
                style={inputStyle}
              />
            </div>

            {/* DEADLINE */}
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-semibold text-xs">Deadline</label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={form.deadline}
                onChange={set("deadline")}
                style={inputStyle}
                
              />
            </div>

            {/* SPACER + KIRIM */}
            <div className="flex-1 flex items-end justify-end">
              <button
                onClick={handleKirim}
                className="px-8 py-3 rounded-full text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(120,0,200,0.4)]"
                style={{
                  background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                  boxShadow: "0 3px 16px rgba(120,0,200,0.30)",
                }}
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}