import { useState, useRef } from "react";
import { ShieldCheck, Upload, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/user/LayoutUser";

const uploadFields = [
  { key: "krs", label: "Kartu Rencana Studi (KRS)" },
  { key: "fotoFormal", label: "Foto Formal" },
  { key: "igNeo", label: "Bukti Follow Instagram Neo Telemetri" },
  { key: "igMarketing", label: "Bukti Follow Instagram Marketing Neo Telemetri" },
];

function UploadBox({ label, file, onFileChange }) {
  const inputRef = useRef();
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    // h-full + flex flex-col agar semua card sama tinggi dalam satu baris grid
    <div className="flex flex-col gap-2 h-full">
      <label className="text-white/70 text-xs min-h-[32px] flex items-start">
        {label}
      </label>

      {/* BOX — flex-1 agar mengisi sisa tinggi */}
      <div
        className="w-full flex-1 min-h-[140px] rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1.5px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={() => inputRef.current.click()}
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <Upload size={28} className="text-white/20" />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files[0])}
      />

      <button
        onClick={() => inputRef.current.click()}
        className="w-full py-[10px] rounded-full text-white text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_20px_#FF00FF55]"
        style={{
          background: "linear-gradient(90deg, #FF00FF 0%, #990099 100%)",
          boxShadow: "0 3px 16px rgba(255,0,255,0.3)",
        }}
      >
        Ganti File
      </button>
    </div>
  );
}

export default function VerifikasiPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState({
    krs: null,
    fotoFormal: null,
    igNeo: null,
    igMarketing: null,
  });

  const setFile = (key) => (file) =>
    setFiles((prev) => ({ ...prev, [key]: file }));

  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col gap-6 pt-10 md:pt-4">

        {/* TOP RIGHT: NAMA + AVATAR */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-white font-semibold text-sm">NamaUser</span>
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

        {/* BANNER */}
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-xl"
          style={{
            background: "linear-gradient(90deg, #CC00CC 0%, #7B2FBE 60%, #501A5E 100%)",
            border: "1px solid rgba(255,0,255,0.3)",
            boxShadow: "0 0 24px rgba(255,0,255,0.2)",
          }}
        >
          <ShieldCheck size={18} className="text-white shrink-0" />
          <span className="text-white text-sm font-medium">Verifikasi Berhasil !</span>
        </div>

        {/* TITLE */}
        <h2 className="text-white text-lg md:text-xl font-semibold -mt-2">
          Upload berkas yang diperlukan disini
        </h2>

        {/* UPLOAD GRID
            - Mobile: 1 kolom
            - Desktop: 2 kolom dengan items-stretch agar tiap baris sama tinggi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {uploadFields.map(({ key, label }) => (
            <UploadBox
              key={key}
              label={label}
              file={files[key]}
              onFileChange={setFile(key)}
            />
          ))}
        </div>

        {/* TOMBOL KIRIM */}
        <button
          className="w-full md:w-[160px] py-4 rounded-2xl text-white font-semibold text-base transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_32px_#FF00FF66]"
          style={{
            background: "linear-gradient(90deg, #FF00FF 0%, #CC00CC 100%)",
            boxShadow: "0 4px 24px rgba(255,0,255,0.35)",
          }}
        >
          Kirim!
        </button>
      </div>
    </UserLayout>
  );
}