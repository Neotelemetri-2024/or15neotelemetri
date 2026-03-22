import { useState, useEffect } from "react";
import { User, ChevronDown, Plus, Trash2, Clock, BookOpen } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import { getDepartments, getDivisionsByDepartment, getSubDivisionsByDivision } from "../../services/userServices";
import api from "../../components/api/axios";

// ── API ────────────────────────────────────────────────────────
const getAllExams    = () => api.get("/exams");
const createExam    = (payload) => api.post("/exams", payload);
const deleteExam    = (id) => api.delete(`/exams/${id}`);
const addQuestion   = (examId, payload) => api.post(`/exams/${examId}/questions`, payload);
const deleteQuestion = (questionId) => api.delete(`/exams/questions/${questionId}`);

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

const labelStyle = "text-gray-700 font-semibold text-xs mb-1 block";

// ── KOMPONEN SELECT ────────────────────────────────────────────
function SelectInput({ value, onChange, options, placeholder, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="appearance-none cursor-pointer"
        style={{
          ...inputStyle,
          paddingRight: "36px",
          color: value ? "#333" : "#aaa",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ── KOMPONEN FORM TAMBAH SOAL ──────────────────────────────────
function QuestionForm({ onAdd }) {
  const [form, setForm] = useState({
    type: "MCQ",
    prompt: "",
    points: 10,
    orderIndex: 1,
    correctTextAnswer: "",
    choices: [
      { label: "", isCorrect: true,  orderIndex: 0 },
      { label: "", isCorrect: false, orderIndex: 1 },
      { label: "", isCorrect: false, orderIndex: 2 },
      { label: "", isCorrect: false, orderIndex: 3 },
    ],
  });

  const setCorrectChoice = (idx) => {
    setForm((p) => ({
      ...p,
      choices: p.choices.map((c, i) => ({ ...c, isCorrect: i === idx })),
    }));
  };

  const setChoiceLabel = (idx, label) => {
    setForm((p) => ({
      ...p,
      choices: p.choices.map((c, i) => (i === idx ? { ...c, label } : c)),
    }));
  };

  const handleAdd = () => {
    if (!form.prompt.trim()) return;
    // Hanya kirim choices jika MCQ
    const payload = {
      type: form.type,
      prompt: form.prompt,
      points: form.points,
      orderIndex: form.orderIndex,
      ...(form.type === "MCQ" && { choices: form.choices }),
      ...(form.type !== "MCQ" && form.correctTextAnswer && { correctTextAnswer: form.correctTextAnswer }),
    };
    onAdd(payload);
    setForm((p) => ({ ...p, prompt: "", correctTextAnswer: "", choices: p.choices.map((c) => ({ ...c, label: "" })) }));
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl bg-gray-50 border border-gray-100">
      <p className="text-gray-700 font-bold text-sm">Tambah Soal</p>

      {/* Tipe soal */}
      <div className="flex flex-col gap-1">
        <label className={labelStyle}>Tipe Soal</label>
        <div className="flex gap-2">
          {["MCQ", "TRUE_FALSE", "SHORT_TEXT"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((p) => ({ ...p, type: t }))}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
              style={{
                background: form.type === t ? "linear-gradient(135deg,#7B2FBE,#501A5E)" : "rgba(0,0,0,0.06)",
                color: form.type === t ? "white" : "#555",
              }}
            >
              {t === "MCQ" ? "Pilihan Ganda" : t === "TRUE_FALSE" ? "Benar/Salah" : "Isian Singkat"}
            </button>
          ))}
        </div>
      </div>

      {/* Pertanyaan */}
      <div className="flex flex-col gap-1">
        <label className={labelStyle}>Pertanyaan</label>
        <textarea
          value={form.prompt}
          onChange={(e) => setForm((p) => ({ ...p, prompt: e.target.value }))}
          placeholder="Tulis pertanyaan di sini..."
          rows={3}
          style={{ ...inputStyle, resize: "none" }}
        />
      </div>

      {/* Poin & Order */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className={labelStyle}>Poin</label>
          <input
            type="number"
            value={form.points}
            onChange={(e) => setForm((p) => ({ ...p, points: parseInt(e.target.value) || 0 }))}
            style={inputStyle}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelStyle}>Urutan Soal</label>
          <input
            type="number"
            value={form.orderIndex}
            onChange={(e) => setForm((p) => ({ ...p, orderIndex: parseInt(e.target.value) || 1 }))}
            style={inputStyle}
          />
        </div>
      </div>

      {/* MCQ — pilihan jawaban */}
      {form.type === "MCQ" && (
        <div className="flex flex-col gap-2">
          <label className={labelStyle}>Pilihan Jawaban (centang yang benar)</label>
          {form.choices.map((choice, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={choice.isCorrect}
                onChange={() => setCorrectChoice(idx)}
                className="accent-purple-600 shrink-0"
              />
              <input
                type="text"
                placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                value={choice.label}
                onChange={(e) => setChoiceLabel(idx, e.target.value)}
                style={{ ...inputStyle, marginBottom: 0 }}
              />
            </div>
          ))}
        </div>
      )}

      {/* TRUE/FALSE — otomatis */}
      {form.type === "TRUE_FALSE" && (
        <div className="flex flex-col gap-1">
          <label className={labelStyle}>Jawaban Benar</label>
          <div className="flex gap-3">
            {["Benar", "Salah"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setForm((p) => ({ ...p, correctTextAnswer: opt }))}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition"
                style={{
                  background: form.correctTextAnswer === opt ? "linear-gradient(135deg,#7B2FBE,#501A5E)" : "rgba(0,0,0,0.06)",
                  color: form.correctTextAnswer === opt ? "white" : "#555",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SHORT TEXT */}
      {form.type === "SHORT_TEXT" && (
        <div className="flex flex-col gap-1">
          <label className={labelStyle}>Jawaban yang Benar</label>
          <input
            type="text"
            placeholder="Tulis jawaban yang benar..."
            value={form.correctTextAnswer}
            onChange={(e) => setForm((p) => ({ ...p, correctTextAnswer: e.target.value }))}
            style={inputStyle}
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={!form.prompt.trim()}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-white text-sm font-semibold transition disabled:opacity-40"
        style={{ background: "linear-gradient(135deg,#7B2FBE,#501A5E)" }}
      >
        <Plus size={15} /> Tambah Soal
      </button>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────
export default function UjianAdmin() {
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Dropdown data
  const [divisions, setDivisions] = useState([]);
  const [subDivisions, setSubDivisions] = useState([]);
  const [operasionalDeptId, setOperasionalDeptId] = useState("");

  // List exam
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null); // exam yang dipilih untuk tambah soal

  // Form buat exam baru
  const [form, setForm] = useState({
    title: "",
    description: "",
    durationMinutes: 60,
    maxAttempts: 1,
    startAt: "",
    endAt: "",
    subDivisionId: "",
    divisionId: "",
    isActive: true,
  });

  // Soal sementara sebelum exam dibuat
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // ── FETCH ────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [examsRes, deptRes] = await Promise.all([
          getAllExams(),
          getDepartments(),
        ]);
        setExams(examsRes.data);

        const opDept = deptRes.data.find((d) => d.name.toLowerCase().includes("operasional"));
        if (opDept) {
          setOperasionalDeptId(opDept.id);
          const divRes = await getDivisionsByDepartment(opDept.id);
          setDivisions(divRes.data);
        }
      } catch (err) {
        console.error("Gagal load data:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch sub divisi saat divisi berubah
  const handleDivisionChange = async (e) => {
    const divId = e.target.value;
    setForm((p) => ({ ...p, divisionId: divId, subDivisionId: "" }));
    setSubDivisions([]);
    if (divId) {
      const res = await getSubDivisionsByDivision(divId);
      setSubDivisions(res.data);
    }
  };

  // ── TAMBAH SOAL KE PENDING ───────────────────────────────────
  const handleAddPendingQuestion = (q) => {
    setPendingQuestions((p) => [...p, { ...q, _tempId: Date.now() }]);
  };

  const handleRemovePendingQuestion = (tempId) => {
    setPendingQuestions((p) => p.filter((q) => q._tempId !== tempId));
  };

  // ── SIMPAN EXAM ──────────────────────────────────────────────
  const handleSaveExam = async () => {
    if (!form.title || !form.subDivisionId) {
      setErrorMsg("Title dan Sub Divisi wajib diisi.");
      return;
    }
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        durationMinutes: parseInt(form.durationMinutes),
        maxAttempts: parseInt(form.maxAttempts),
        subDivisionId: form.subDivisionId,
        isActive: form.isActive,
        startAt: form.startAt ? new Date(form.startAt).toISOString() : undefined,
        endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
        questions: pendingQuestions.map(({ _tempId, ...q }) => q),
      };

      const res = await createExam(payload);
      // Fetch detail exam agar soal langsung terlihat
      const detailRes = await api.get(`/exams/${res.data.id}`);
      setExams((p) => [detailRes.data, ...p]);
      // Reset form
      setForm({ title: "", description: "", durationMinutes: 60, maxAttempts: 1, startAt: "", endAt: "", subDivisionId: "", divisionId: "", isActive: true });
      setSubDivisions([]);
      setPendingQuestions([]);
      setSuccessMsg("Ujian berhasil dibuat!");
    } catch (err) {
      console.error("Gagal buat exam:", err);
      setErrorMsg(err.response?.data?.message || "Gagal membuat ujian.");
    } finally {
      setSaving(false);
    }
  };

  // ── HAPUS EXAM ───────────────────────────────────────────────
  const handleDeleteExam = async (id) => {
    if (!window.confirm("Yakin hapus ujian ini?")) return;
    try {
      await deleteExam(id);
      setExams((p) => p.filter((e) => e.id !== id));
      if (selectedExam?.id === id) setSelectedExam(null);
    } catch (err) {
      console.error("Gagal hapus exam:", err);
    }
  };

  // ── TAMBAH SOAL KE EXAM YANG SUDAH ADA ──────────────────────
  const handleAddQuestionToExam = async (q) => {
    if (!selectedExam) return;
    try {
      const { _tempId, ...payload } = q;
      const res = await addQuestion(selectedExam.id, payload);
      setSelectedExam((p) => {
        const newQuestions = [...(p.questions || []), res.data];
        return { ...p, questions: newQuestions, _count: { questions: newQuestions.length } };
      });
      // Update count di list exam juga
      setExams((prev) => prev.map((e) =>
        e.id === selectedExam.id
          ? { ...e, _count: { questions: (e._count?.questions || 0) + 1 } }
          : e
      ));
      setSuccessMsg("Soal berhasil ditambahkan!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Gagal menambah soal.");
    }
  };

  // ── HAPUS SOAL DARI EXAM ─────────────────────────────────────
  const handleDeleteQuestion = async (questionId) => {
    try {
      await deleteQuestion(questionId);
      setSelectedExam((p) => {
        const newQuestions = p.questions.filter((q) => q.id !== questionId);
        return { ...p, questions: newQuestions, _count: { questions: newQuestions.length } };
      });
      // Update count di list exam juga
      setExams((prev) => prev.map((e) =>
        e.id === selectedExam?.id
          ? { ...e, _count: { questions: Math.max((e._count?.questions || 1) - 1, 0) } }
          : e
      ));
    } catch (err) {
      console.error("Gagal hapus soal:", err);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white/60 text-sm animate-pulse">Memuat data...</p>
        </div>
      </AdminLayout>
    );
  }

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ── KOLOM KIRI: FORM BUAT EXAM ── */}
          <div className="flex flex-col gap-4 bg-white rounded-2xl p-6 shadow-lg">
            <p className="text-gray-800 font-bold text-base">Buat Ujian Baru</p>

            <div className="flex flex-col gap-1">
              <label className={labelStyle}>Judul Ujian *</label>
              <input type="text" placeholder="Contoh: Ujian Programming Batch 1"
                value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                style={inputStyle} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelStyle}>Deskripsi</label>
              <textarea placeholder="Deskripsi ujian (opsional)" rows={2}
                value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                style={{ ...inputStyle, resize: "none" }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelStyle}>Durasi (menit) *</label>
                <input type="number" value={form.durationMinutes}
                  onChange={(e) => setForm((p) => ({ ...p, durationMinutes: e.target.value }))}
                  style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelStyle}>Maks Percobaan</label>
                <input type="number" value={form.maxAttempts}
                  onChange={(e) => setForm((p) => ({ ...p, maxAttempts: e.target.value }))}
                  style={inputStyle} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelStyle}>Mulai</label>
                <input type="datetime-local" value={form.startAt}
                  onChange={(e) => setForm((p) => ({ ...p, startAt: e.target.value }))}
                  style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelStyle}>Selesai</label>
                <input type="datetime-local" value={form.endAt}
                  onChange={(e) => setForm((p) => ({ ...p, endAt: e.target.value }))}
                  style={inputStyle} />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelStyle}>Divisi *</label>
              <SelectInput
                value={form.divisionId}
                onChange={handleDivisionChange}
                options={divisions}
                placeholder="Pilih Divisi"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelStyle}>Sub Divisi *</label>
              <SelectInput
                value={form.subDivisionId}
                onChange={(e) => setForm((p) => ({ ...p, subDivisionId: e.target.value }))}
                options={subDivisions}
                placeholder={form.divisionId ? "Pilih Sub Divisi" : "Pilih Divisi dulu"}
                disabled={subDivisions.length === 0}
              />
            </div>

            {/* Status aktif */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                className="accent-purple-600" />
              <label htmlFor="isActive" className="text-gray-700 text-xs font-semibold cursor-pointer">
                Aktifkan ujian sekarang
              </label>
            </div>

            {/* TAMBAH SOAL SEBELUM SIMPAN */}
            <QuestionForm onAdd={handleAddPendingQuestion} />

            {/* LIST SOAL PENDING */}
            {pendingQuestions.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-gray-700 font-semibold text-xs">{pendingQuestions.length} soal ditambahkan:</p>
                {pendingQuestions.map((q, i) => (
                  <div key={q._tempId} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-purple-50 border border-purple-100">
                    <span className="text-xs text-gray-700 flex-1 truncate">
                      {i + 1}. [{q.type}] {q.prompt}
                    </span>
                    <button onClick={() => handleRemovePendingQuestion(q._tempId)}
                      className="text-red-400 hover:text-red-600 transition shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {successMsg && <p className="text-green-600 text-xs text-center">{successMsg}</p>}
            {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}

            <button onClick={handleSaveExam} disabled={saving}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition hover:brightness-110 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#7B2FBE,#501A5E)", boxShadow: "0 3px 16px rgba(120,0,200,0.3)" }}>
              {saving ? "Menyimpan..." : "Simpan Ujian"}
            </button>
          </div>

          {/* ── KOLOM KANAN: LIST EXAM ── */}
          <div className="flex flex-col gap-4">
            <p className="text-white font-bold text-base">Daftar Ujian</p>

            {exams.length === 0 && (
              <p className="text-white/40 text-sm">Belum ada ujian dibuat.</p>
            )}

            {exams.map((exam) => (
              <div key={exam.id}
                className="flex flex-col gap-3 p-5 rounded-2xl cursor-pointer transition-all"
                style={{
                  background: selectedExam?.id === exam.id ? "rgba(123,47,190,0.25)" : "rgba(255,255,255,0.07)",
                  border: selectedExam?.id === exam.id ? "1.5px solid #7B2FBE" : "1px solid rgba(255,255,255,0.12)",
                }}
                onClick={async () => {
                  if (selectedExam?.id === exam.id) {
                    setSelectedExam(null);
                  } else {
                    // Fetch detail exam dari BE agar soal selalu up-to-date
                    const detailRes = await api.get(`/exams/${exam.id}`);
                    setSelectedExam(detailRes.data);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{exam.title}</p>
                    <p className="text-white/50 text-xs mt-0.5">{exam.subDivision?.name || "-"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${exam.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {exam.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteExam(exam.id); }}
                      className="text-red-400 hover:text-red-300 transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-white/40 text-xs">
                  <span className="flex items-center gap-1"><Clock size={11} /> {exam.durationMinutes} menit</span>
                  <span className="flex items-center gap-1"><BookOpen size={11} /> {exam._count?.questions ?? exam.questions?.length ?? 0} soal</span>
                </div>

                {/* PANEL TAMBAH SOAL — muncul saat exam dipilih */}
                {selectedExam?.id === exam.id && (
                  <div className="mt-2 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                    <p className="text-white/70 text-xs font-semibold">Soal dalam ujian ini:</p>

                    {(selectedExam.questions || []).length === 0 && (
                      <p className="text-white/30 text-xs">Belum ada soal.</p>
                    )}

                    {(selectedExam.questions || []).map((q, i) => (
                      <div key={q.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <span className="text-white/70 text-xs flex-1 truncate">
                          {i + 1}. [{q.type}] {q.prompt}
                        </span>
                        <button onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-400 hover:text-red-300 transition shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}

                    <div className="bg-white rounded-xl p-4">
                      <QuestionForm onAdd={handleAddQuestionToExam} />
                    </div>

                    {successMsg && <p className="text-green-400 text-xs text-center">{successMsg}</p>}
                    {errorMsg && <p className="text-red-400 text-xs text-center">{errorMsg}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}