import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";

const divisiOptions = [
  "Programming",
  "Multimedia & Desain",
  "Sistem Komputer dan Jaringan",
];
const subDivisiMap = {
  Programming: ["Web Development", "Mobile Development", "Machine Learning"],
  "Multimedia & Desain": ["UI/UX", "Motion Graphic", "Fotografi & Videografi"],
  "Sistem Komputer dan Jaringan": [
    "Jaringan",
    "Sistem Operasi",
    "Keamanan Siber",
  ],
};

const inputStyle = {
  background: "white",
  border: "1.5px solid rgba(0,0,0,0.12)",
  borderRadius: "8px",
  color: "#333",
  width: "100%",
  padding: "10px 14px",
  fontSize: "13px",
  outline: "none",
};

const labelStyle = "text-gray-700 font-semibold text-sm mb-1 block";

export default function TugasKumpul() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama: "",
    divisi: "",
    subDivisi: "",
    linkTugas: "",
  });

  const set = (key) => (e) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      [key]: val,
      // reset subDivisi kalau divisi berubah
      ...(key === "divisi" ? { subDivisi: "" } : {}),
    }));
  };

  const handleSubmit = () => {
    console.log("Submit tugas:", { tugasId: id, ...form });
    navigate("/tugas");
  };

  const subOptions = subDivisiMap[form.divisi] ?? [];

  return (
    <UserLayout>
      <div className="min-h-screen flex items-center justify-center px-8 py-8">
        {/* ===== CARD ===== */}
        <div className="absolute inset-0 backdrop-blur-xl bg-black/30 z-0" />
        <div
          className="relative z-10 w-full max-w-[500px] rounded-2xl overflow-hidden"
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
            <h2 className="text-gray-800 font-bold text-lg">Kumpul Tugas</h2>
          </div>

          {/* BODY */}
          <div className="px-8 py-6 flex flex-col gap-4">
            {/* JUDUL TUGAS */}
            <p className="text-gray-800 font-bold text-sm">Tugas {id}</p>

            {/* NAMA */}
            <div>
              <label className={labelStyle}>Nama</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={form.nama}
                onChange={set("nama")}
                style={inputStyle}
              />
            </div>

            {/* DIVISI */}
            <div>
              <label className={labelStyle}>Divisi</label>
              <div className="relative">
                <select
                  value={form.divisi}
                  onChange={set("divisi")}
                  className="appearance-none cursor-pointer"
                  style={{
                    ...inputStyle,
                    color: form.divisi ? "#333" : "#aaa",
                    paddingRight: "36px",
                  }}
                >
                  <option value="" disabled hidden>
                    Pilih Divisi
                  </option>
                  {divisiOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* SUB DIVISI */}
            <div>
              <label className={labelStyle}>Sub Divisi</label>
              <div className="relative">
                <select
                  value={form.subDivisi}
                  onChange={set("subDivisi")}
                  disabled={!form.divisi}
                  className="appearance-none cursor-pointer disabled:opacity-50"
                  style={{
                    ...inputStyle,
                    color: form.subDivisi ? "#333" : "#aaa",
                    paddingRight: "36px",
                  }}
                >
                  <option value="" disabled hidden>
                    Pilih Sub Divisi
                  </option>
                  {subOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* LINK TUGAS */}
            <div>
              <label className={labelStyle}>Link Tugas</label>
              <input
                type="url"
                placeholder="Masukkan link Tugas"
                value={form.linkTugas}
                onChange={set("linkTugas")}
                style={inputStyle}
              />
            </div>

            {/* SUBMIT */}
            <div className="flex justify-end mt-1">
              <button
                onClick={handleSubmit}
                className="px-7 py-[10px] rounded-full text-white text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(120,0,200,0.4)]"
                style={{
                  background:
                    "linear-gradient(135deg, #7B2FBE 0%, #501A5E 100%)",
                  boxShadow: "0 3px 16px rgba(120,0,200,0.30)",
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
