import { useState, useEffect } from "react";
import { User, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import {
  getAllTimelines,
  createTimeline,
  updateTimeline,
  deleteTimeline,
} from "../../services/timelineService";

const emptyForm = { title: "", orderIndex: "", startAt: "", endAt: "" };

const inputStyle = {
  width: "100%",
  padding: "9px 13px",
  borderRadius: "8px",
  border: "1px solid rgba(0,0,0,0.12)",
  background: "white",
  fontSize: "13px",
  color: "#333",
  outline: "none",
};

function formatDisplay(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function TimelineAdmin() {
  const [timelines, setTimelines]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add, obj = edit
  const [form, setForm]             = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId]     = useState(null);

  const fetchTimelines = async () => {
    try {
      setLoading(true);
      const res = await getAllTimelines();
      setTimelines(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTimelines(); }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditTarget(item);
    setForm({
      title:      item.title,
      orderIndex: item.orderIndex,
      startAt:    item.startAt?.slice(0, 16) ?? "",
      endAt:      item.endAt?.slice(0, 16)   ?? "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.orderIndex || !form.startAt || !form.endAt) return;
    try {
      setSubmitting(true);
      const payload = {
        title:      form.title,
        orderIndex: Number(form.orderIndex),
        startAt:    new Date(form.startAt).toISOString(),
        endAt:      new Date(form.endAt).toISOString(),
      };
      if (editTarget) {
        await updateTimeline(editTarget.id, payload);
      } else {
        await createTimeline(payload);
      }
      setShowModal(false);
      fetchTimelines();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTimeline(id);
      setDeleteId(null);
      fetchTimelines();
    } catch (e) {
      console.error(e);
    }
  };

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <AdminLayout>
      <div className="min-h-screen px-8 py-8 flex flex-col gap-6">

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

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-white text-xl font-bold">Timeline Rekrutmen</h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-semibold transition-all hover:brightness-110"
            style={{
              background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
              boxShadow: "0 3px 16px rgba(120,0,200,0.30)",
            }}
          >
            <Plus size={15} />
            Add Timeline
          </button>
        </div>

        {/* TIMELINE LIST */}
        {loading ? (
          <p className="text-white/40 text-sm animate-pulse">Memuat timeline...</p>
        ) : timelines.length === 0 ? (
          <p className="text-white/40 text-sm">Belum ada timeline.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {timelines.map((item, index) => {
              const now     = new Date();
              const start   = new Date(item.startAt);
              const end     = new Date(item.endAt);
              const isActive = now >= start && now <= end;

              return (
                <div key={item.id} className="flex items-center gap-4">

                  {/* ORDER CIRCLE */}
                  <div
                    className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg,#FF00FF,#990099)"
                        : "rgba(255,255,255,0.12)",
                      color:  "white",
                      border:  isActive ? "none" : "1px solid rgba(255,255,255,0.2)",
                      boxShadow: isActive ? "0 0 16px #FF00FF66" : "none",
                    }}
                  >
                    {item.orderIndex}
                  </div>

                  {/* CARD */}
                  <div
                    className="flex-1 flex items-center justify-between px-5 py-4 rounded-2xl gap-4"
                    style={{
                      background: isActive
                        ? "rgba(255,0,255,0.10)"
                        : "rgba(255,255,255,0.06)",
                      border: isActive
                        ? "1px solid rgba(255,0,255,0.35)"
                        : "1px solid rgba(255,255,255,0.12)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    }}
                  >
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: isActive ? "white" : "rgba(255,255,255,0.75)" }}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
                        {formatDisplay(item.startAt)} — {formatDisplay(item.endAt)}
                      </p>
                    </div>

                    {/* BADGE AKTIF */}
                    {isActive && (
                      <span
                        className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: "rgba(255,0,255,0.25)", color: "#FF88FF" }}
                      >
                        Aktif
                      </span>
                    )}

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(item)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:brightness-110"
                        style={{ background: "#F0C000", boxShadow: "0 2px 8px rgba(200,160,0,0.3)" }}
                      >
                        <Pencil size={13} className="text-white" />
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:brightness-110"
                        style={{ background: "#EE2222", boxShadow: "0 2px 8px rgba(200,0,0,0.3)" }}
                      >
                        <Trash2 size={13} className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== MODAL ADD/EDIT ===== */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-[480px] rounded-2xl px-8 py-7 flex flex-col gap-5"
            style={{ background: "white", boxShadow: "0 8px 48px rgba(120,0,200,0.25)" }}
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between">
              <h2 className="text-gray-800 font-bold text-base">
                {editTarget ? "Edit Timeline" : "Add Timeline"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {/* TITLE */}
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-semibold text-xs">Title</label>
              <input type="text" placeholder="Nama tahapan" value={form.title} onChange={set("title")} style={inputStyle} />
            </div>

            {/* ORDER INDEX */}
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-semibold text-xs">Urutan (Order Index)</label>
              <input type="number" placeholder="1" value={form.orderIndex} onChange={set("orderIndex")} style={inputStyle} />
            </div>

            {/* START AT */}
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-semibold text-xs">Tanggal Mulai</label>
              <input type="datetime-local" value={form.startAt} onChange={set("startAt")} style={inputStyle} />
            </div>

            {/* END AT */}
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-semibold text-xs">Tanggal Selesai</label>
              <input type="datetime-local" value={form.endAt} onChange={set("endAt")} style={inputStyle} />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-1">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 rounded-full text-gray-500 text-sm border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 rounded-full text-white text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                  boxShadow: "0 3px 12px rgba(120,0,200,0.3)",
                }}
              >
                {submitting ? "Menyimpan..." : editTarget ? "Simpan" : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL KONFIRMASI DELETE ===== */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-[360px] rounded-2xl px-8 py-7 flex flex-col gap-5 text-center"
            style={{ background: "white", boxShadow: "0 8px 48px rgba(120,0,200,0.25)" }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h2 className="text-gray-800 font-bold text-base">Hapus Timeline?</h2>
              <p className="text-gray-500 text-sm">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteId(null)}
                className="px-6 py-2 rounded-full text-gray-500 text-sm border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-6 py-2 rounded-full text-white text-sm font-semibold transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg,#EE2222,#AA0000)" }}
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