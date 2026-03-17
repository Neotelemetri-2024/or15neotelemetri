import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, X, FileText } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";

// Dummy data - nanti dari API
const tugasData = {
  1: { title: "Tugas 1", deskripsi: "Tugas 1 adalah tugas ..." },
  2: { title: "Tugas 2", deskripsi: "Tugas 2 adalah tugas ..." },
  3: { title: "Tugas 3", deskripsi: "Tugas 3 adalah tugas ..." },
};

export default function TugasDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef();
  const [file, setFile] = useState(null);

  const tugas = tugasData[id] ?? { title: "Tugas", deskripsi: "-" };

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const handleKumpul = () => {
    if (!file) {
      inputRef.current.click();
      return;
    }
    // Nanti kirim file ke API
    console.log("Kumpul tugas:", file);
    navigate("/tugas");
  };

  return (
    <UserLayout>
      <div className="min-h-screen flex items-center justify-center px-8 py-8">
        <div className="absolute inset-0 backdrop-blur-xl bg-black/30 z-0" />
        {/* ===== CARD ===== */}
        <div
          className="relative z-10 w-full max-w-[560px]  rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: "rgba(255,255,255,0.97)",
            boxShadow: "0 8px 48px rgba(180,0,255,0.25)",
          }}
        >
          {/* HEADER */}
          <div
            className="px-8 py-5 text-center border-b"
            style={{ borderColor: "rgba(0,0,0,0.10)" }}
          >
            <h2 className="text-gray-800 font-bold text-lg">{tugas.title}</h2>
          </div>

          {/* BODY */}
          <div className="px-8 py-6 flex flex-col gap-4 min-h-[260px]">
            {/* DESKRIPSI */}
            <div>
              <p className="text-gray-700 font-semibold text-sm mb-1">
                Deskripsi Tugas :
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                {tugas.deskripsi}
              </p>
            </div>

            {/* UPLOAD AREA - muncul jika belum ada file */}
            {!file ? (
              <div
                className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-purple-400 hover:bg-purple-50 py-8"
                style={{ borderColor: "rgba(160,60,200,0.25)" }}
                onClick={() => inputRef.current.click()}
              >
                <Upload size={28} className="text-purple-300" />
                <p className="text-gray-400 text-xs">
                  Klik untuk upload file tugas
                </p>
              </div>
            ) : (
              /* FILE PREVIEW */
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: "rgba(160,60,200,0.08)",
                  border: "1.5px solid rgba(160,60,200,0.2)",
                }}
              >
                <FileText size={20} className="text-purple-500 shrink-0" />
                <span className="text-gray-700 text-sm flex-1 truncate">
                  {file.name}
                </span>
                <button
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {/* FOOTER */}
          <div className="px-8 pb-6 flex justify-end">
            <button
              onClick={handleKumpul}
              className="px-7 py-[10px] rounded-full text-white text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(120,0,200,0.4)]"
              style={{
                background: "linear-gradient(135deg, #7B2FBE 0%, #501A5E 100%)",
                boxShadow: "0 3px 16px rgba(120,0,200,0.30)",
              }}
            >
              Kumpul Tugas
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
