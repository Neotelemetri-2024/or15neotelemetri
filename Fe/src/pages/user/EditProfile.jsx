import { useState, useEffect, useRef } from "react";
import {
  User,
  Pencil,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
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
  getAllProgramStudi,
} from "../../services/userServices";

// ─── Styles ────────────────────────────────────────────────────────────────
const inputStyle = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "10px",
  color: "white",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

const labelStyle = "text-white/70 text-xs mb-1 block";

// ─── Label display untuk ENUM fakultas ─────────────────────────────────────
const FAKULTAS_LABEL = {
  PERTANIAN: "Pertanian",
  KEDOKTERAN: "Kedokteran",
  MIPA: "MIPA",
  PETERNAKAN: "Peternakan",
  TEKNIK: "Teknik",
  TEKNOLOGI_PERTANIAN: "Teknologi Pertanian",
  FARMASI: "Farmasi",
  TEKNOLOGI_INFORMASI: "Teknologi Informasi",
  KEPERAWATAN: "Keperawatan",
  KESEHATAN_MASYARAKAT: "Kesehatan Masyarakat",
  KEDOKTERAN_GIGI: "Kedokteran Gigi",
  EKONOMI_DAN_BISNIS: "Ekonomi dan Bisnis",
  ILMU_SOSIAL_DAN_POLITIK: "Ilmu Sosial dan Politik",
  ILMU_BUDAYA: "Ilmu Budaya",
  HUKUM: "Hukum",
};

// ─── Profile completion check ───────────────────────────────────────────────
const isProfileComplete = (form) =>
  !!(
    form?.namaLengkap?.trim() &&
    form?.noWa?.trim() &&
    form?.studyProgramId &&
    form?.subDivisionId
  );

// ─── Banner ─────────────────────────────────────────────────────────────────
function ProfileProgressBanner({ form, verif }) {
  const profileDone = isProfileComplete(form);

  if (!profileDone) {
    const missing = [];
    if (!form?.namaLengkap?.trim()) missing.push("nama lengkap");
    if (!form?.noWa?.trim()) missing.push("no WhatsApp");
    if (!form?.studyProgramId) missing.push("program studi");
    if (!form?.subDivisionId) missing.push("sub divisi");

    return (
      <div
        className="flex items-start gap-3 px-5 py-4 rounded-2xl"
        style={{
          background: "rgba(239,68,68,0.10)",
          border: "1px solid rgba(239,68,68,0.30)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-white/70 text-xs leading-relaxed">
            Lengkapi profil beserta foto profil terlebih dahulu sebelum mengirim
            berkas verifikasi.
          </p>
          {missing.length > 0 && (
            <p className="text-red-300 text-[11px] mt-1">
              Belum diisi: {missing.join(", ")}.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (verif?.status !== "APPROVED") {
    return (
      <div
        className="flex items-center gap-3 px-5 py-4 rounded-2xl"
        style={{
          background: "rgba(34,197,94,0.10)",
          border: "1px solid rgba(34,197,94,0.30)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <CheckCircle2 size={18} className="text-green-400 shrink-0" />
        <p className="text-white/70 text-xs leading-relaxed">
          Profil sudah lengkap! Segera kirim berkas verifikasi kamu.
        </p>
      </div>
    );
  }

  return null;
}

// ─── Input Field ─────────────────────────────────────────────────────────────
function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  readOnly = false,
}) {
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
          <Pencil
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
          />
        )}
      </div>
    </div>
  );
}

// ─── Select Field ─────────────────────────────────────────────────────────────
function SelectField({
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  placeholder = "Pilih",
  valueKey = "id",
  nameKey = "name",
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelStyle}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full px-4 py-3 pr-10 text-sm outline-none appearance-none focus:border-[#FF00FF]/60 transition-colors"
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
            <option
              key={opt[valueKey]}
              value={opt[valueKey]}
              style={{ background: "#2d0045", color: "white" }}
            >
              {opt[nameKey]}
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EditProfile() {
  const [form, setForm] = useState({
    namaLengkap: "",
    nickName: "",
    nim: "",
    email: "",
    noWa: "",
    fakultas: "", // ENUM string, e.g. "TEKNIK"
    studyProgramId: "", // UUID dari tabel program_studi
    divisionId: "",
    subDivisionId: "",
    linkTwibbon: "",
  });

  // Dropdown data
  const [operasionalDeptId, setOperasionalDeptId] = useState("");
  const [divisions, setDivisions] = useState([]);
  const [subDivisions, setSubDivisions] = useState([]);

  // Program studi — data mentah dari BE [{id, fakultas, name}]
  const [allProgramStudi, setAllProgramStudi] = useState([]);
  // Unique list untuk dropdown Fakultas [{value: "TEKNIK", label: "Teknik"}, ...]
  const [fakultasOptions, setFakultasOptions] = useState([]);
  // Program studi yang tampil setelah user pilih fakultas
  const [filteredProgramStudi, setFilteredProgramStudi] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  const [verif, setVerif] = useState(null);

  // ── INIT ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [profileRes, deptRes, verifRes, prodiRes] = await Promise.all([
          getMyProfile(),
          getDepartments(),
          getMyVerification().catch(() => ({ data: null })),
          // GET /api/master-data/program-studi — returns [{id, fakultas, name}]
          getAllProgramStudi(),
        ]);

        const p = profileRes.data;
        const depts = deptRes.data;
        const verifData = verifRes.data;
        const allProdi = prodiRes.data ?? [];

        setVerif(verifData);
        setAllProgramStudi(allProdi);

        // ── Bangun dropdown Fakultas dari data DB ────────────────────────────
        // Ambil nilai unik field "fakultas", lalu petakan ke label Indonesia
        const uniqueFakultas = [...new Set(allProdi.map((ps) => ps.fakultas))];
        setFakultasOptions(
          uniqueFakultas.map((f) => ({
            value: f,
            label: FAKULTAS_LABEL[f] ?? f,
          })),
        );

        // ── Filter program studi sesuai fakultas yang sudah tersimpan ────────
        const savedFakultas = p.fakultas ?? "";
        if (savedFakultas) {
          setFilteredProgramStudi(
            allProdi.filter((ps) => ps.fakultas === savedFakultas),
          );
        }

        // ── Department Operasional → dropdown Divisi ─────────────────────────
        const opDept = depts.find((d) =>
          d.name.toLowerCase().includes("operasional"),
        );
        if (opDept) {
          setOperasionalDeptId(opDept.id);
          const divRes = await getDivisionsByDepartment(opDept.id);
          setDivisions(divRes.data);

          if (p.divisionId) {
            const subRes = await getSubDivisionsByDivision(p.divisionId);
            setSubDivisions(subRes.data);
          }
        }

        setAvatarPreview(p.avatarUrl ?? null);

        const userLocal = JSON.parse(localStorage.getItem("user") ?? "{}");

        setForm({
          namaLengkap: p.fullName ?? "",
          nickName: p.nickName ?? "",
          nim: p.nim ?? "",
          email: p.user?.email ?? userLocal.email ?? "",
          noWa: p.whatsappNumber ?? "",
          // "fakultas" dari BE adalah nilai ENUM, e.g. "TEKNIK"
          fakultas: p.fakultas ?? "",
          // "studyProgramId" adalah UUID referensi ke tabel program_studi
          studyProgramId: p.studyProgramId ?? "",
          divisionId: p.divisionId ?? "",
          subDivisionId: p.subDivisionId ?? "",
          linkTwibbon: verifData?.twibbonLink ?? "",
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

  // ── HANDLER: ganti Fakultas → filter Program Studi di sisi FE ─────────────
  // Tidak perlu request baru ke BE; cukup filter dari allProgramStudi yang
  // sudah di-fetch sekali waktu init.
  const handleFakultasChange = (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, fakultas: val, studyProgramId: "" }));
    setFilteredProgramStudi(
      allProgramStudi.filter((ps) => ps.fakultas === val),
    );
  };

  // ── HANDLER: ganti Divisi → fetch Sub Divisi ──────────────────────────────
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

  // ── HANDLER: ganti Avatar ─────────────────────────────────────────────────
  const MAX_SIZE = 5 * 1024 * 1024;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_SIZE) {
      setErrorMsg("Ukuran avatar maksimal 5MB");
      return;
    }
    setErrorMsg("");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── SIMPAN ────────────────────────────────────────────────────────────────
  const handleSimpan = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    if (avatarFile && avatarFile.size > MAX_SIZE) {
      setErrorMsg("Ukuran avatar maksimal 5MB");
      setSaving(false);
      return;
    }

    try {
      // 1. Upload avatar jika ada file baru
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await updateAvatar(fd);
      }

      // 2. Simpan twibbon link
      if (form.linkTwibbon) {
        const fd = new FormData();
        fd.append("twibbonLink", form.linkTwibbon);
        await submitVerification(fd);
      }

      // 3. Update profile
      // Kirim "fakultas" (ENUM) + "studyProgramId" (UUID) ke BE.
      // Field "study_program" (varchar) di tabel profiles sudah deprecated —
      // sekarang hanya pakai "study_program_id" yang referensi ke program_studi.
      await updateMyProfile({
        fullName: form.namaLengkap,
        nickName: form.nickName,
        whatsappNumber: form.noWa,
        fakultas: form.fakultas || undefined,
        studyProgramId: form.studyProgramId || undefined,
        departmentId: operasionalDeptId || undefined,
        ...(form.divisionId && { divisionId: form.divisionId }),
        ...(form.subDivisionId && { subDivisionId: form.subDivisionId }),
      });

      setSuccessMsg("Profil berhasil disimpan!");
      setAvatarFile(null);
    } catch (err) {
      console.error("Gagal simpan:", err);
      setErrorMsg(err.response?.data?.message || "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  // ── LOADING STATE ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white/60 text-sm animate-pulse">
            Memuat profil...
          </p>
        </div>
      </UserLayout>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <UserLayout>
      <div className="min-h-screen flex flex-col gap-6 pt-10 md:pt-4">
        <h1 className="text-white text-lg md:text-xl font-bold">
          Edit Profile
        </h1>

        <ProfileProgressBanner form={form} verif={verif} />

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
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
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
              placeholder="Masukan Nama Panggilan"
              value={form.nickName}
              onChange={set("nickName")}
            />
          </div>

          {/* ROW 2 — NIM & Email (readonly) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="NIM"
              placeholder="NIM"
              value={form.nim}
              readOnly
            />
            <InputField
              label="Email"
              placeholder="Email"
              value={form.email}
              type="email"
              readOnly
            />
          </div>

          {/* ROW 3 — No WA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="No Whatsapp"
              placeholder="Masukan no WA"
              value={form.noWa}
              onChange={set("noWa")}
            />
            <div /> {/* spacer */}
          </div>

          {/* ROW 4 — Fakultas & Program Studi (dari DB) */}
          {/*
            Alur:
            1. Saat init, fetch GET /master-data/program-studi → [{id, fakultas, name}]
            2. Ekstrak unique "fakultas" → isi dropdown Fakultas
            3. Saat user pilih Fakultas → filter allProgramStudi di FE → isi dropdown Program Studi
            4. Saat simpan → kirim "fakultas" (ENUM) + "studyProgramId" (UUID) ke BE
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Fakultas"
              placeholder="Pilih Fakultas"
              options={fakultasOptions}
              value={form.fakultas}
              onChange={handleFakultasChange}
              valueKey="value"
              nameKey="label"
            />
            <SelectField
              label="Program Studi"
              placeholder={
                form.fakultas ? "Pilih Program Studi" : "Pilih Fakultas dulu"
              }
              options={filteredProgramStudi}
              value={form.studyProgramId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, studyProgramId: e.target.value }))
              }
              disabled={!form.fakultas || filteredProgramStudi.length === 0}
              valueKey="id"
              nameKey="name"
            />
          </div>

          {/* ROW 5 — Divisi & Sub Divisi */}
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
              placeholder={
                form.divisionId ? "Pilih Sub Divisi" : "Pilih Divisi dulu"
              }
              options={subDivisions}
              value={form.subDivisionId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, subDivisionId: e.target.value }))
              }
              disabled={subDivisions.length === 0}
            />
          </div>

          {/* ROW 6 — Link Twibbon */}
          <InputField
            label="Link Twibbon : https://twb.nz/or15neotelemteri"
            placeholder="Masukkan Link Twibbon"
            value={form.linkTwibbon}
            onChange={set("linkTwibbon")}
          />

          {/* PESAN */}
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
