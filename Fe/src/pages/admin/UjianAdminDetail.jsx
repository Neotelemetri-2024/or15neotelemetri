import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  BookOpen,
  Clock,
  Pencil,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import api from "../../components/api/axios";

const getExam = (id) => api.get(`/exams/${id}`);
const updateExam = (id, data) => api.patch(`/exams/${id}`, data);
const addQuestion = (id, data) => api.post(`/exams/${id}/questions`, data);
const deleteQuestion = (qId) => api.delete(`/exams/questions/${qId}`);

const QUESTIONS_PER_PAGE = 10;

const inputStyle = {
  width: "100%",
  padding: "9px 13px",
  borderRadius: "8px",
  border: "1px solid rgba(0,0,0,0.12)",
  background: "white",
  fontSize: "13px",
  color: "#333",
  outline: "none",
  boxSizing: "border-box",
};
const labelCls = "text-gray-700 font-semibold text-xs mb-1 block";

// ── QUESTION TYPE BADGE ─────────────────────────────────────────
function TypeBadge({ type }) {
  const map = {
    MCQ: { label: "PG", bg: "#EDE9FE", color: "#7C3AED" },
    TRUE_FALSE: { label: "B/S", bg: "#FEF9C3", color: "#CA8A04" },
    SHORT_TEXT: { label: "Isian", bg: "#DCFCE7", color: "#16A34A" },
  };
  const s = map[type] || map.MCQ;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

// ── FORM TAMBAH SOAL ─────────────────────────────────────────────
function QuestionForm({ onAdd, saving }) {
  const [form, setForm] = useState({
    type: "MCQ",
    prompt: "",
    points: 10,
    orderIndex: 1,
    correctTextAnswer: "",
    choices: [
      { label: "", isCorrect: true, orderIndex: 0 },
      { label: "", isCorrect: false, orderIndex: 1 },
      { label: "", isCorrect: false, orderIndex: 2 },
      { label: "", isCorrect: false, orderIndex: 3 },
    ],
  });

  const setCorrectChoice = (idx) =>
    setForm((p) => ({
      ...p,
      choices: p.choices.map((c, i) => ({ ...c, isCorrect: i === idx })),
    }));
  const setChoiceLabel = (idx, lbl) =>
    setForm((p) => ({
      ...p,
      choices: p.choices.map((c, i) => (i === idx ? { ...c, label: lbl } : c)),
    }));

  const handleAdd = () => {
    if (!form.prompt.trim()) return;
    const payload = {
      type: form.type,
      prompt: form.prompt,
      points: form.points,
      orderIndex: form.orderIndex,
      ...(form.type === "MCQ" && { choices: form.choices }),
      ...(form.type !== "MCQ" &&
        form.correctTextAnswer && {
          correctTextAnswer: form.correctTextAnswer,
        }),
    };
    onAdd(payload);
    setForm((p) => ({
      ...p,
      prompt: "",
      correctTextAnswer: "",
      choices: p.choices.map((c) => ({ ...c, label: "" })),
      orderIndex: p.orderIndex + 1,
    }));
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl bg-gray-50 border border-gray-100">
      <p className="text-gray-800 font-bold text-sm">Tambah Soal Baru</p>

      {/* Tipe */}
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Tipe Soal</label>
        <div className="flex gap-2 flex-wrap">
          {[
            { val: "MCQ", lbl: "Pilihan Ganda" },
            { val: "TRUE_FALSE", lbl: "Benar / Salah" },
            { val: "SHORT_TEXT", lbl: "Isian Singkat" },
          ].map(({ val, lbl }) => (
            <button
              key={val}
              type="button"
              onClick={() => setForm((p) => ({ ...p, type: val }))}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
              style={{
                background:
                  form.type === val
                    ? "linear-gradient(135deg,#7B2FBE,#501A5E)"
                    : "rgba(0,0,0,0.06)",
                color: form.type === val ? "white" : "#555",
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt */}
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Pertanyaan *</label>
        <textarea
          value={form.prompt}
          onChange={(e) => setForm((p) => ({ ...p, prompt: e.target.value }))}
          placeholder="Tulis pertanyaan di sini..."
          rows={3}
          style={{ ...inputStyle, resize: "none" }}
        />
      </div>

      {/* Poin & Urutan */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Poin</label>
          <input
            type="number"
            value={form.points}
            onChange={(e) =>
              setForm((p) => ({ ...p, points: parseInt(e.target.value) || 0 }))
            }
            style={inputStyle}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Urutan Soal</label>
          <input
            type="number"
            value={form.orderIndex}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                orderIndex: parseInt(e.target.value) || 1,
              }))
            }
            style={inputStyle}
          />
        </div>
      </div>

      {/* MCQ choices */}
      {form.type === "MCQ" && (
        <div className="flex flex-col gap-2">
          <label className={labelCls}>
            Pilihan Jawaban (centang yang benar)
          </label>
          {form.choices.map((choice, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct_new"
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

      {/* True/False */}
      {form.type === "TRUE_FALSE" && (
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Jawaban Benar</label>
          <div className="flex gap-3">
            {["Benar", "Salah"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, correctTextAnswer: opt }))
                }
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition"
                style={{
                  background:
                    form.correctTextAnswer === opt
                      ? "linear-gradient(135deg,#7B2FBE,#501A5E)"
                      : "rgba(0,0,0,0.06)",
                  color: form.correctTextAnswer === opt ? "white" : "#555",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Short text */}
      {form.type === "SHORT_TEXT" && (
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Jawaban yang Benar</label>
          <input
            type="text"
            placeholder="Jawaban yang benar..."
            value={form.correctTextAnswer}
            onChange={(e) =>
              setForm((p) => ({ ...p, correctTextAnswer: e.target.value }))
            }
            style={inputStyle}
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={saving || !form.prompt.trim()}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-white text-sm font-semibold transition disabled:opacity-40"
        style={{ background: "linear-gradient(135deg,#7B2FBE,#501A5E)" }}
      >
        {saving ? (
          "Menyimpan..."
        ) : (
          <>
            <Plus size={15} /> Tambah Soal
          </>
        )}
      </button>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function UjianAdminDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingQ, setSavingQ] = useState(false);

  // Edit info exam
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);

  // Pagination soal
  const [page, setPage] = useState(1);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── FETCH ──────────────────────────────────────────────────────
  const fetchExam = async () => {
    try {
      const res = await getExam(id);
      setExam(res.data);
      setQuestions(
        [...(res.data.questions || [])].sort(
          (a, b) => a.orderIndex - b.orderIndex,
        ),
      );
      setEditForm({
        title: res.data.title,
        description: res.data.description || "",
        durationMinutes: res.data.durationMinutes,
        maxAttempts: res.data.maxAttempts,
        isActive: res.data.isActive,
        startAt: res.data.startAt ? res.data.startAt.slice(0, 16) : "",
        endAt: res.data.endAt ? res.data.endAt.slice(0, 16) : "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExam();
  }, [id]);

  // ── SAVE EDIT INFO ─────────────────────────────────────────────
  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      await updateExam(id, {
        title: editForm.title,
        description: editForm.description || undefined,
        durationMinutes: parseInt(editForm.durationMinutes),
        maxAttempts: parseInt(editForm.maxAttempts),
        isActive: editForm.isActive,
        startAt: editForm.startAt
          ? new Date(editForm.startAt).toISOString()
          : undefined,
        endAt: editForm.endAt
          ? new Date(editForm.endAt).toISOString()
          : undefined,
      });
      await fetchExam();
      setEditMode(false);
      showToast("Informasi ujian diperbarui.");
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal memperbarui.", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  // ── ADD QUESTION ───────────────────────────────────────────────
  const handleAddQuestion = async (payload) => {
    setSavingQ(true);
    try {
      const res = await addQuestion(id, payload);
      const updated = [...questions, res.data].sort(
        (a, b) => a.orderIndex - b.orderIndex,
      );
      setQuestions(updated);
      // Pindah ke halaman terakhir agar soal baru kelihatan
      setPage(Math.ceil(updated.length / QUESTIONS_PER_PAGE));
      showToast("Soal berhasil ditambahkan.");
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal tambah soal.", "error");
    } finally {
      setSavingQ(false);
    }
  };

  // ── DELETE QUESTION ────────────────────────────────────────────
  const handleDeleteQuestion = async () => {
    if (!deleteQuestionId) return;

    try {
      await deleteQuestion(deleteQuestionId);

      const updated = questions.filter((q) => q.id !== deleteQuestionId);
      setQuestions(updated);

      // Fix pagination
      const maxPage = Math.max(
        1,
        Math.ceil(updated.length / QUESTIONS_PER_PAGE),
      );
      if (page > maxPage) setPage(maxPage);

      showToast("Soal berhasil dihapus.");
    } catch (err) {
      showToast("Gagal hapus soal.", "error");
    } finally {
      setDeleteQuestionId(null);
    }
  };

  // ── PAGINATION ─────────────────────────────────────────────────
  const totalPages = Math.max(
    1,
    Math.ceil(questions.length / QUESTIONS_PER_PAGE),
  );
  const pagedQuestions = questions.slice(
    (page - 1) * QUESTIONS_PER_PAGE,
    page * QUESTIONS_PER_PAGE,
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white/60 text-sm animate-pulse">Memuat ujian...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col gap-6 pt-10 md:pt-4 pb-10">
        {/* TOP RIGHT */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-white font-semibold text-sm">
            {adminUser.email || "Admin"}
          </span>
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

        {/* BACK + TITLE */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/ujian")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:brightness-110"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <ArrowLeft size={16} className="text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-xl font-bold truncate">
              {exam?.title}
            </h1>
            <p className="text-white/40 text-xs mt-0.5">
              {exam?.subDivision?.name || "-"} · {questions.length} soal
            </p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-semibold hover:brightness-110 transition-all"
            style={{
              background: editMode
                ? "rgba(239,68,68,0.2)"
                : "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {editMode ? (
              <>
                <X size={13} /> Batal Edit
              </>
            ) : (
              <>
                <Pencil size={13} /> Edit Info
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          {/* ── KIRI: INFO EXAM ── */}
          <div className="flex flex-col gap-4">
            {/* Info Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              {editMode ? (
                <>
                  <p className="text-gray-800 font-bold text-sm">
                    Edit Informasi Ujian
                  </p>

                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Judul</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, title: e.target.value }))
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Deskripsi</label>
                    <textarea
                      rows={2}
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      style={{ ...inputStyle, resize: "none" }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className={labelCls}>Durasi (menit)</label>
                      <input
                        type="number"
                        value={editForm.durationMinutes}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            durationMinutes: e.target.value,
                          }))
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={labelCls}>Maks Percobaan</label>
                      <input
                        type="number"
                        value={editForm.maxAttempts}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            maxAttempts: e.target.value,
                          }))
                        }
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className={labelCls}>Mulai</label>
                      <input
                        type="datetime-local"
                        value={editForm.startAt}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            startAt: e.target.value,
                          }))
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={labelCls}>Selesai</label>
                      <input
                        type="datetime-local"
                        value={editForm.endAt}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, endAt: e.target.value }))
                        }
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="editActive"
                      checked={editForm.isActive}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          isActive: e.target.checked,
                        }))
                      }
                      className="accent-purple-600"
                    />
                    <label
                      htmlFor="editActive"
                      className="text-gray-700 text-xs font-semibold cursor-pointer"
                    >
                      Aktif
                    </label>
                  </div>
                  <button
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                    }}
                  >
                    {savingEdit ? (
                      "Menyimpan..."
                    ) : (
                      <>
                        <Save size={14} /> Simpan Perubahan
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-800 font-bold text-sm">
                      Informasi Ujian
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${exam?.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                    >
                      {exam?.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  {[
                    ["Sub Divisi", exam?.subDivision?.name || "-"],
                    ["Durasi", `${exam?.durationMinutes} menit`],
                    ["Maks Percobaan", exam?.maxAttempts ?? "-"],
                    ["Total Soal", questions.length],
                    [
                      "Mulai",
                      exam?.startAt
                        ? new Date(exam.startAt).toLocaleString("id-ID")
                        : "-",
                    ],
                    [
                      "Selesai",
                      exam?.endAt
                        ? new Date(exam.endAt).toLocaleString("id-ID")
                        : "-",
                    ],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between items-center text-xs py-1"
                      style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                    >
                      <span className="text-gray-500">{k}</span>
                      <span className="text-gray-800 font-semibold">{v}</span>
                    </div>
                  ))}
                  {exam?.description && (
                    <p className="text-gray-500 text-xs mt-1">
                      {exam.description}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Form Tambah Soal */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <QuestionForm onAdd={handleAddQuestion} saving={savingQ} />
            </div>
          </div>

          {/* ── KANAN: DAFTAR SOAL ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-white font-bold text-sm">
                Daftar Soal
                <span className="ml-2 text-white/40 font-normal text-xs">
                  ({questions.length} soal · halaman {page}/{totalPages})
                </span>
              </p>
              {/* Stats ringkas */}
              <div className="flex items-center gap-3">
                {[
                  { type: "MCQ", label: "PG", color: "#7C3AED" },
                  { type: "TRUE_FALSE", label: "B/S", color: "#CA8A04" },
                  { type: "SHORT_TEXT", label: "Isian", color: "#16A34A" },
                ].map(({ type, label: lbl, color }) => (
                  <span
                    key={type}
                    className="text-xs font-semibold"
                    style={{ color }}
                  >
                    {questions.filter((q) => q.type === type).length} {lbl}
                  </span>
                ))}
              </div>
            </div>

            {/* Soal list */}
            <div className="flex flex-col gap-2">
              {pagedQuestions.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-16 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <BookOpen size={28} className="text-white/20 mb-2" />
                  <p className="text-white/40 text-sm">
                    Belum ada soal. Tambahkan di panel kiri.
                  </p>
                </div>
              ) : (
                pagedQuestions.map((q, i) => {
                  const globalIdx = (page - 1) * QUESTIONS_PER_PAGE + i + 1;
                  return (
                    <div
                      key={q.id}
                      className="flex items-start gap-3 px-4 py-3 rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {/* Number */}
                      <span className="text-white/40 text-xs font-bold w-6 shrink-0 mt-0.5">
                        {globalIdx}.
                      </span>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <TypeBadge type={q.type} />
                          <span className="text-white/30 text-[10px]">
                            {q.points} poin
                          </span>
                        </div>
                        <p className="text-white/80 text-xs leading-relaxed">
                          {q.prompt}
                        </p>
                        {/* Preview choices */}
                        {q.type === "MCQ" && q.choices?.length > 0 && (
                          <div className="mt-2 flex flex-col gap-1">
                            {[...q.choices]
                              .sort((a, b) => a.orderIndex - b.orderIndex)
                              .map((c) => (
                                <p
                                  key={c.id}
                                  className="text-[11px] px-2 py-0.5 rounded"
                                  style={{
                                    background: c.isCorrect
                                      ? "rgba(34,197,94,0.15)"
                                      : "rgba(255,255,255,0.04)",
                                    color: c.isCorrect
                                      ? "#4ade80"
                                      : "rgba(255,255,255,0.45)",
                                    border: c.isCorrect
                                      ? "1px solid rgba(34,197,94,0.25)"
                                      : "none",
                                  }}
                                >
                                  {c.isCorrect ? "✓ " : ""}
                                  {c.label}
                                </p>
                              ))}
                          </div>
                        )}
                        {(q.type === "TRUE_FALSE" || q.type === "SHORT_TEXT") &&
                          q.correctTextAnswer && (
                            <p className="mt-1 text-[11px] text-green-400">
                              ✓ {q.correctTextAnswer}
                            </p>
                          )}
                      </div>
                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteQuestionId(q.id);
                        }}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:brightness-110 shrink-0 mt-0.5"
                        style={{
                          background: "rgba(238,34,34,0.2)",
                          border: "1px solid rgba(238,34,34,0.3)",
                        }}
                      >
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination soal */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-1 pt-1">
                <span className="text-white/40 text-xs">
                  Menampilkan {(page - 1) * QUESTIONS_PER_PAGE + 1}–
                  {Math.min(page * QUESTIONS_PER_PAGE, questions.length)} dari{" "}
                  {questions.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-30"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <ChevronLeft size={14} className="text-white" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pg) => (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className="w-8 h-8 rounded-lg text-xs font-semibold transition"
                        style={{
                          background:
                            page === pg ? "#7B2FBE" : "rgba(255,255,255,0.08)",
                          color: "white",
                        }}
                      >
                        {pg}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-30"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <ChevronRight size={14} className="text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
          style={{
            background: toast.type === "error" ? "#FEF2F2" : "#F0FDF4",
            border: `1px solid ${toast.type === "error" ? "#FECACA" : "#BBF7D0"}`,
          }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: toast.type === "error" ? "#DC2626" : "#16A34A" }}
          >
            {toast.msg}
          </span>
        </div>
      )}

      {deleteQuestionId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800">Hapus Soal?</h2>

            <p className="text-sm text-gray-500 mt-2">
              Soal yang dihapus tidak dapat dikembalikan.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteQuestionId(null)}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-500 hover:bg-gray-300"
              >
                Batal
              </button>

              <button
                onClick={handleDeleteQuestion}
                className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: "#DC2626" }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}


    </AdminLayout>
  );
}
