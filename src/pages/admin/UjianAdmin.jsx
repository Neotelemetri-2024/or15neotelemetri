import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, ArrowLeft, Upload, ChevronDown } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";

const subDivisiOptions = {
  0: ["Machine Learning", "Web Development", "Mobile Development"],
  1: ["UI/UX", "Motion Graphic", "Fotografi & Videografi"],
  2: ["Jaringan", "Sistem Operasi", "Keamanan Siber"],
};

export default function UjianAdmin() {
  const navigate              = useNavigate();
  const fileInputRef          = useRef();
  const [activeDivision, setActiveDivision] = useState(0);
  const [form, setForm]       = useState({ title: "", file: null, subDivisi: "", deadline: "" });
  const [dragging, setDragging] = useState(false);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleFile = (file) => {
    if (file) setForm((p) => ({ ...p, file }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleKirim = () => {
    console.log("Kirim ujian:", { division: activeDivision, ...form });
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

        {/* TOP RIGHT */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-white font-semibold text-sm">NamaUser</span>
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <User size={18} className="text-white/70" />
          </div>
        </div>

        

        {/* TABS + CARD */}
        <div className="mt-6">
          <DivisionTabs
            activeDivision={activeDivision}
            setActiveDivision={setActiveDivision}
            bgColor="#1a0023"
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
            }}
          >
            <p className="text-gray-800 font-bold text-sm">Add Ujian</p>

            {/* TITLE */}
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-semibold text-xs">Title</label>
              <input
                type="text"
                placeholder="Input Title"
                value={form.title}
                onChange={set("title")}
                style={inputStyle}
              />
            </div>

            {/* IMPORT SOAL */}
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-semibold text-xs">Impor Soal dari Berkas</label>
              <div
                className="relative flex flex-col items-center justify-center gap-3 py-8 rounded-xl transition-all duration-200"
                style={{
                  border: `2px dashed ${dragging ? "#7B2FBE" : "rgba(0,0,0,0.12)"}`,
                  background: dragging ? "rgba(120,0,200,0.04)" : "rgba(0,0,0,0.02)",
                  minHeight: "130px",
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
                  accept=".xlsx,.csv,.pdf"
                  onChange={(e) => handleFile(e.target.files[0])}
                />

                {form.file ? (
                  <p className="text-gray-600 text-xs font-medium">{form.file.name}</p>
                ) : (
                  <>
                    {/* ARROW ICON */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg,#FF00FF,#990099)" }}
                    >
                      <Upload size={18} className="text-white" />
                    </div>
                    <p className="text-gray-400 text-xs text-center">
                      Anda dapat seret dan lepas berkas disini untuk menambahkan
                    </p>
                  </>
                )}

                {/* TOMBOL IMPOR */}
                <button
                  className="absolute right-4 bottom-4 px-5 py-2 rounded-full text-white text-xs font-semibold hover:brightness-110 transition-all"
                  style={{
                    background: "linear-gradient(135deg,#00AA55,#007733)",
                    boxShadow: "0 2px 10px rgba(0,150,80,0.3)",
                  }}
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                >
                  Impor
                </button>
              </div>
            </div>

            {/* SUB DIVISI */}
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-semibold text-xs">Sub Divisi</label>
              <div className="relative">
                <select
                  value={form.subDivisi}
                  onChange={set("subDivisi")}
                  className="appearance-none cursor-pointer"
                  style={{
                    ...inputStyle,
                    paddingRight: "36px",
                    color: form.subDivisi ? "#333" : "#aaa",
                  }}
                >
                  <option value="" disabled hidden>Pilih satu diantara beberapa Sub Divisi</option>
                  {subDivisiOptions[activeDivision].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
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

            {/* KIRIM */}
            <div className="flex justify-end">
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