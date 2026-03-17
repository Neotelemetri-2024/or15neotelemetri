import { useState } from "react";
import { User, Pencil } from "lucide-react";
import { ChevronDown } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";

const inputStyle = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "10px",
  color: "white",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

const labelStyle = "text-white/70 text-xs mb-1 block";

function InputField({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelStyle}>{label}</label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 pr-10 text-sm placeholder-white/30 outline-none focus:border-[#FF00FF]/60 transition-colors"
          style={inputStyle}
        />
        <Pencil
          size={13}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
        />
      </div>
    </div>
  );
}

function SelectField({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelStyle}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 pr-10 text-sm outline-none appearance-none focus:border-[#FF00FF]/60 transition-colors cursor-pointer"
          style={{
            ...inputStyle,
            color: value ? "white" : "rgba(255,255,255,0.3)",
          }}
        >
          <option value="" disabled hidden>
            {options[0]}
          </option>
          {options.slice(1).map((opt) => (
            <option
              key={opt}
              value={opt}
              style={{ background: "#2d0045", color: "white" }}
            >
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
        />
      </div>
    </div>
  );
}

export default function EditProfile() {
  const [form, setForm] = useState({
    namaLengkap: "",
    panggilan: "",
    nim: "",
    email: "neotelemetri@example.com",
    noWa: "",
    programStudi: "",
    departemenDiminati1: "",
    departemenDiminati2: "",
    divisi: "",
    subDivisi: "",
    linkTwibbon: "",
  });

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = () => {
    console.log("Simpan:", form);
  };

  return (
    <UserLayout>
      <div className="min-h-screen px-8 py-8 flex flex-col gap-6">
        {/* ===== TITLE ===== */}
        <h1 className="text-white text-xl font-bold">Edit Profile</h1>

        {/* ===== AVATAR ===== */}
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              <User size={44} className="text-white/60" />
            </div>
            <button
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#FF00FF,#990099)",
                boxShadow: "0 2px 8px #FF00FF55",
              }}
            >
              <Pencil size={12} className="text-white" />
            </button>
          </div>
        </div>

        {/* ===== FORM GRID ===== */}
        <div className="flex flex-col gap-4">
          {/* ROW 1 */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Nama Lengkap"
              placeholder="Masukan Nama Lengkap"
              value={form.namaLengkap}
              onChange={set("namaLengkap")}
            />
            <InputField
              label="Panggilan"
              placeholder="Masukan Nama panggilan"
              value={form.panggilan}
              onChange={set("panggilan")}
            />
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="NIM"
              placeholder="Masukan NIM"
              value={form.nim}
              onChange={set("nim")}
            />
            <InputField
              label="Email"
              placeholder="neotelemetri@example.com"
              value={form.email}
              onChange={set("email")}
              type="email"
            />
          </div>

          {/* ROW 3 */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="No Whatsapp"
              placeholder="Masukan no WA"
              value={form.noWa}
              onChange={set("noWa")}
            />
            <SelectField
              label="Program Studi"
              options={[
                "Pilih Program Studi",
                "Teknik Informatika",
                "Sistem Informasi",
                "Teknik Elektro",
                "Lainnya",
              ]}
              value={form.programStudi}
              onChange={set("programStudi")}
            />
          </div>

          {/* ROW 4 */}
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Departemen yang Diminati"
              options={["Organisasi", "Operasional", "Lainnya"]}
              value={form.departemenDiminati1}
              onChange={set("departemenDiminati1")}
            />
            <SelectField
              label="Departemen yang Diminati"
              options={["Operasional", "Organisasi", "Lainnya"]}
              value={form.departemenDiminati2}
              onChange={set("departemenDiminati2")}
            />
          </div>

          {/* ROW 5 */}
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Divisi"
              options={["Pilih Divisi", "Programming", "MMD", "SKJ"]}
              value={form.divisi}
              onChange={set("divisi")}
            />
            <SelectField
              label="Sub Divisi"
              options={[
                "Pilih Sub Divisi",
                "Machine Learning",
                "Web Dev",
                "Mobile Dev",
              ]}
              value={form.subDivisi}
              onChange={set("subDivisi")}
            />
          </div>

          {/* ROW 6 - FULL WIDTH */}
          <InputField
            label="Link Twibbon"
            placeholder="Masukkan Link Twibbon"
            value={form.linkTwibbon}
            onChange={set("linkTwibbon")}
          />

          {/* TOMBOL SIMPAN */}
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base mt-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_32px_#FF00FF55]"
            style={{
              background: "linear-gradient(90deg, #FF00FF 0%, #CC00CC 100%)",
              boxShadow: "0 4px 24px rgba(255,0,255,0.35)",
            }}
          >
            Simpan!
          </button>
        </div>
      </div>
    </UserLayout>
  );
}
