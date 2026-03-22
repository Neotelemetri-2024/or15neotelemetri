import { useState, useEffect, useRef } from "react";
import { User, Pencil, ChevronDown } from "lucide-react";
import UserLayout from "../../components/user/LayoutUser";
import {
  getMyProfile,
  updateMyProfile,
  updateAvatar,
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
  submitVerification,
  getMyVerification,
} from "../../services/userServices";

const inputStyle = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "10px",
  color: "white",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

const labelStyle = "text-white/70 text-xs mb-1 block";

function InputField({ label, placeholder, value, onChange, type = "text", readOnly = false }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelStyle}>{label}</label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          className="w-full px-4 py-3 pr-10 text-sm placeholder-white/30 outline-none focus:border-[#FF00FF]/60 transition-colors"
          style={{
            ...inputStyle,
            opacity: readOnly ? 0.6 : 1,
            cursor: readOnly ? "not-allowed" : "text",
          }}
        />
        {!readOnly && (
          <Pencil size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
        )}
      </div>
    </div>
  );
}

// options: [{ id, name }]
function SelectField({ label, options, value, onChange, disabled = false, placeholder = "Pilih" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelStyle}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full px-4 py-3 pr-10 text-sm outline-none appearance-none focus:border-[#FF00FF]/60 transition-colors cursor-pointer"
          style={{
            ...inputStyle,
            color: value ? "white" : "rgba(255,255,255,0.3)",
            opacity: disabled ? 0.4 : 1,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <option value="" disabled hidden style={{ background: "#2d0045" }}>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id} style={{ background: "#2d0045", color: "white" }}>
              {opt.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
      </div>
    </div>
  );
}

export default function EditProfile() {
  const [form, setForm] = useState({
    namaLengkap: "",
    nickName: "",
    nim: "",
    email: "",
    noWa: "",
    programStudi: "",
    divisionId: "",
    subDivisionId: "",
    linkTwibbon: "",
  });

  // Data dropdown dari BE
  const [operasionalDeptId, setOperasionalDeptId] = useState("");
  const [divisions, setDivisions] = useState([]);
  const [subDivisions, setSubDivisions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  // ── INIT: fetch profile + departments + divisions ──────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [profileRes, deptRes, verifRes] = await Promise.all([
          getMyProfile(),
          getDepartments(),
          getMyVerification().catch(() => ({ data: null })), // tidak error jika belum ada
        ]);

        const p = profileRes.data;
        const depts = deptRes.data;
        const verif = verifRes.data;
        console.log("Profile:", p);
        console.log("Departments:", depts);

        // Cari department Operasional
        const opDept = depts.find((d) =>
          d.name.toLowerCase().includes("operasional")
        );
        if (opDept) {
          setOperasionalDeptId(opDept.id);

          // Fetch semua divisi milik Operasional
          const divRes = await getDivisionsByDepartment(opDept.id);
          setDivisions(divRes.data);

          // Jika user sudah punya divisionId tersimpan, fetch sub divisinya
          if (p.divisionId) {
            const subRes = await getSubDivisionsByDivision(p.divisionId);
            setSubDivisions(subRes.data);
          }
        }

        // Set avatar preview dari profile
        setAvatarPreview(p.avatarUrl || null);

        // Ambil email dari localStorage sebagai fallback
        const userLocal = JSON.parse(localStorage.getItem("user") || "{}");

        setForm({
          namaLengkap: p.fullName || "",
          nickName: p.nickName || "",
          nim: p.nim || "",
          email: p.user?.email || userLocal.email || "",
          noWa: p.whatsappNumber || "",
          programStudi: p.studyProgram || "",
          divisionId: p.divisionId || "",
          subDivisionId: p.subDivisionId || "",
          linkTwibbon: verif?.twibbonLink || "",
        });

      } catch (err) {
        console.error("Gagal load profile:", err);
        setErrorMsg("Gagal memuat data profil.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ── HANDLER: saat user ganti divisi, fetch sub divisinya ──────────
  const handleDivisiChange = async (e) => {
    const divId = e.target.value;
    setForm((prev) => ({ ...prev, divisionId: divId, subDivisionId: "" }));
    setSubDivisions([]);
    if (divId) {
      try {
        const res = await getSubDivisionsByDivision(divId);
        setSubDivisions(res.data);
      } catch {
        console.error("Gagal fetch sub divisi");
      }
    }
  };

  // ── HANDLER: ganti avatar ────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── SIMPAN ────────────────────────────────────────────────────────
  const handleSimpan = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      // 1. Upload avatar jika ada file baru
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await updateAvatar(fd);
      }

      // 2. Simpan twibbon link ke submission_verifications
      if (form.linkTwibbon) {
        const fd = new FormData();
        fd.append("twibbonLink", form.linkTwibbon);
        await submitVerification(fd);
      }

      // 3. Update profile data
      await updateMyProfile({
        fullName: form.namaLengkap,
        nickName: form.nickName,
        whatsappNumber: form.noWa,
        studyProgram: form.programStudi,
        departmentId: operasionalDeptId,
        ...(form.divisionId && { divisionId: form.divisionId }),
        ...(form.subDivisionId && { subDivisionId: form.subDivisionId }),
      });

      setSuccessMsg("Profil berhasil disimpan!");
      setAvatarFile(null); // reset file setelah upload
    } catch (err) {
      console.error("Gagal simpan:", err);
      setErrorMsg(err.response?.data?.message || "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white/60 text-sm animate-pulse">Memuat profil...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col gap-6 pt-10 md:pt-4">

        {/* TITLE */}
        <h1 className="text-white text-lg md:text-xl font-bold">Edit Profile</h1>

        {/* AVATAR */}
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={44} className="text-white/60" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#FF00FF,#990099)",
                boxShadow: "0 2px 8px #FF00FF55",
              }}
            >
              <Pencil size={12} className="text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* FORM */}
        <div className="flex flex-col gap-4">

          {/* ROW 1 — Nama & Panggilan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Nama Lengkap"
              placeholder="Masukan Nama Lengkap"
              value={form.namaLengkap}
              onChange={set("namaLengkap")}
            />
            <InputField
              label="Panggilan"
              placeholder="Masukan Nama panggilan"
              value={form.nickName}
              onChange={set("nickName")}
            />
          </div>

          {/* ROW 2 — NIM & Email (readonly) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="NIM" placeholder="NIM" value={form.nim} readOnly />
            <InputField label="Email" placeholder="Email" value={form.email} type="email" readOnly />
          </div>

          {/* ROW 3 — No WA & Program Studi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="No Whatsapp"
              placeholder="Masukan no WA"
              value={form.noWa}
              onChange={set("noWa")}
            />
            <InputField
              label="Program Studi"
              placeholder="Masukan Program Studi"
              value={form.programStudi}
              onChange={set("programStudi")}
            />
          </div>

          {/* ROW 4 — Divisi & Sub Divisi (dari BE) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Divisi"
              placeholder="Pilih Divisi"
              options={divisions}
              value={form.divisionId}
              onChange={handleDivisiChange}
            />
            <SelectField
              label="Sub Divisi"
              placeholder={form.divisionId ? "Pilih Sub Divisi" : "Pilih Divisi dulu"}
              options={subDivisions}
              value={form.subDivisionId}
              onChange={(e) => setForm((prev) => ({ ...prev, subDivisionId: e.target.value }))}
              disabled={subDivisions.length === 0}
            />
          </div>

          {/* ROW 5 — Link Twibbon */}
          <InputField
            label="Link Twibbon"
            placeholder="Masukkan Link Twibbon"
            value={form.linkTwibbon}
            onChange={set("linkTwibbon")}
          />

          {/* PESAN SUKSES / ERROR */}
          {successMsg && (
            <p className="text-green-400 text-sm text-center">{successMsg}</p>
          )}
          {errorMsg && (
            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
          )}

          {/* TOMBOL SIMPAN */}
          <button
            onClick={handleSimpan}
            disabled={saving}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base mt-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_32px_#FF00FF55] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            style={{
              background: "linear-gradient(90deg, #FF00FF 0%, #CC00CC 100%)",
              boxShadow: "0 4px 24px rgba(255,0,255,0.35)",
            }}
          >
            {saving ? "Menyimpan..." : "Simpan!"}
          </button>
        </div>
      </div>
    </UserLayout>
  );
}