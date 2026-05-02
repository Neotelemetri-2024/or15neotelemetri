import { useState, useEffect, useRef } from "react";
import {
  User,
  Plus,
  Trash2,
  Pencil,
  X,
  Upload,
  Phone,
  Instagram,
  Users,
  Search,
  ChevronDown,
} from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import {
  getDepartments,
  getDivisionsByDepartment,
  getSubDivisionsByDivision,
} from "../../services/userServices";
import api from "../../components/api/axios";

// ── API ────────────────────────────────────────────────────────
const getMentors = () => api.get("/mentors");
const createMentor = (fd) =>
  api.post("/mentors", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
const updateMentor = (id, fd) =>
  api.patch(`/mentors/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
const deleteMentor = (id) => api.delete(`/mentors/${id}`);
const getUsers = () => api.get("/users"); // endpoint list user
const assignMentor = (userId, mentorId) =>
  api.patch(`/users/${userId}/mentor`, { mentorId });

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

const TABS = ["Daftar Mentor", "Assign Mentor"];

function PhotoPreviewModal({ avatarUrl, fullName, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center gap-3 p-4 rounded-2xl"
        style={{
          background: "white",
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
          maxWidth: "90vw",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X size={15} />
        </button>
        <img
          src={avatarUrl}
          alt={fullName || "foto"}
          className="rounded-xl object-cover"
          style={{
            width: "260px",
            height: "260px",
            border: "2px solid rgba(123,47,190,0.2)",
          }}
        />
        {fullName && (
          <p className="text-sm font-semibold text-gray-700 text-center pb-1">
            {fullName}
          </p>
        )}
      </div>
    </div>
  );
}

function UserAvatar({ avatarUrl, fullName }) {
  const [imgError, setImgError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const initials = fullName
    ? fullName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <>
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={fullName || "avatar"}
          onError={() => setImgError(true)}
          onClick={() => setShowModal(true)}
          className="w-8 h-8 rounded-full object-cover shrink-0 cursor-pointer transition-transform hover:scale-110"
          style={{ border: "1.5px solid rgba(123,47,190,0.25)" }}
          title="Klik untuk lihat foto"
        />
      ) : (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
          style={{
            background: "rgba(123,47,190,0.12)",
            border: "1.5px solid rgba(123,47,190,0.25)",
            color: "#7B2FBE",
          }}
        >
          {initials}
        </div>
      )}
      {showModal && avatarUrl && !imgError && (
        <PhotoPreviewModal
          avatarUrl={avatarUrl}
          fullName={fullName}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export default function MentorAdmin() {
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");
  const fileInputRef = useRef();

  const [activeTab, setActiveTab] = useState(0);
  const [mentors, setMentors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchUser, setSearchUser] = useState("");

  const [subDivisionMap, setSubDivisionMap] = useState({});

  // Form mentor
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({
    name: "",
    whatsappNumber: "",
    instagramUsername: "",
    photo: null,
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null);

  // Assign mentor
  const [assignTarget, setAssignTarget] = useState(null); // user yang dipilih
  const [assignMentorId, setAssignMentorId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState("");

  // ── FETCH ────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [mentorsRes, usersRes, deptRes] = await Promise.all([
          getMentors(),
          getUsers().catch(() => ({ data: [] })),
          getDepartments().catch(() => ({ data: [] })),
        ]);

        const mentorList = mentorsRes.data;
        setMentors(mentorList);

        
        const enrichedUsers = usersRes.data.map((u) => {
          const mentorId = u.profile?.mentorId ?? u.profile?.mentor?.id ?? null;
          const resolvedMentor =
            u.profile?.mentor ?? // sudah ada dari BE → pakai langsung
            (mentorId
              ? (mentorList.find((m) => m.id === mentorId) ?? null)
              : null);

          return {
            ...u,
            profile: u.profile
              ? { ...u.profile, mentor: resolvedMentor }
              : u.profile,
          };
        });
        setUsers(enrichedUsers);

        // Fetch sub divisi untuk resolve nama kolom Sub Divisi
        const flatSubMap = {};
        if (deptRes.data?.length) {
          await Promise.all(
            deptRes.data.map(async (dept) => {
              try {
                const divRes = await getDivisionsByDepartment(dept.id);
                await Promise.all(
                  divRes.data.map(async (div) => {
                    const subRes = await getSubDivisionsByDivision(div.id);
                    subRes.data.forEach((sub) => {
                      flatSubMap[sub.id] = sub.name;
                    });
                  }),
                );
              } catch {}
            }),
          );
        }
        setSubDivisionMap(flatSubMap);
      } catch (err) {
        console.error("Gagal load mentor:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── FORM HELPERS ─────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm({
      name: "",
      whatsappNumber: "",
      instagramUsername: "",
      photo: null,
    });
    setErrorMsg("");
    setShowForm(true);
  };

  const openEdit = (mentor) => {
    setEditTarget(mentor);
    setForm({
      name: mentor.name,
      whatsappNumber: mentor.whatsappNumber || "",
      instagramUsername: mentor.instagramUsername || "",
      photo: null,
    });
    setErrorMsg("");
    setShowForm(true);
  };

  const handleFile = (file) => {
    if (file) setForm((p) => ({ ...p, photo: file }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setErrorMsg("Nama mentor wajib diisi.");
      return;
    }
    setSaving(true);
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      if (form.whatsappNumber) fd.append("whatsappNumber", form.whatsappNumber);
      if (form.instagramUsername)
        fd.append("instagramUsername", form.instagramUsername);
      if (form.photo) fd.append("photo", form.photo);

      if (editTarget) {
        const res = await updateMentor(editTarget.id, fd);
        setMentors((p) =>
          p.map((m) => (m.id === editTarget.id ? res.data : m)),
        );
      } else {
        const res = await createMentor(fd);
        setMentors((p) => [res.data, ...p]);
      }

      setShowForm(false);
      setSuccessMsg(
        editTarget
          ? "Mentor berhasil diupdate!"
          : "Mentor berhasil ditambahkan!",
      );
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Gagal simpan mentor:", err);
      setErrorMsg(err.response?.data?.message || "Gagal menyimpan mentor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMentor(deleteId);
      setMentors((p) => p.filter((m) => m.id !== deleteId));
    } catch (err) {
      console.error("Gagal hapus mentor:", err);
    } finally {
      setDeleteId(null);
    }
  };

  // ── ASSIGN ───────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!assignTarget || !assignMentorId) return;
    setAssigning(true);
    setAssignMsg("");
    try {
      await assignMentor(assignTarget.id, assignMentorId);

      // Cari data mentor yang dipilih untuk update lokal
      const selectedMentor = mentors.find((m) => m.id === assignMentorId);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === assignTarget.id
            ? {
                ...u,
                profile: {
                  ...u.profile,
                  mentorId: assignMentorId,
                  mentor: selectedMentor || null,
                },
              }
            : u,
        ),
      );

      setAssignTarget(null);
      setAssignMentorId("");
      setAssignMsg("Mentor berhasil di-assign!");
      setTimeout(() => setAssignMsg(""), 3000);
    } catch (err) {
      console.error("Gagal assign mentor:", err);
      setAssignMsg(err.response?.data?.message || "Gagal assign mentor.");
    } finally {
      setAssigning(false);
    }
  };

  // ── FILTER ───────────────────────────────────────────────────
  const filteredMentors = mentors.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredUsers = users.filter((u) => {
    const q = searchUser.toLowerCase();
    return (
      u.profile?.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.profile?.nim?.toLowerCase().includes(q)
    );
  });

  const getSubDivName = (subDivisionId) => subDivisionMap[subDivisionId] || "-";

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
      <div className="min-h-screen flex flex-col gap-4 pt-10 md:pt-4">
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

        {/* TABS */}
        <div className="flex gap-2">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background:
                  activeTab === i
                    ? "linear-gradient(135deg,#7B2FBE,#501A5E)"
                    : "rgba(255,255,255,0.1)",
                color: activeTab === i ? "white" : "rgba(255,255,255,0.6)",
                boxShadow:
                  activeTab === i ? "0 2px 10px rgba(120,0,200,0.3)" : "none",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SUCCESS MSG */}
        {(successMsg || assignMsg) && (
          <p className="text-green-400 text-sm text-center">
            {successMsg || assignMsg}
          </p>
        )}

        {/* ── TAB 0: DAFTAR MENTOR ── */}
        {activeTab === 0 && (
          <div
            className="flex flex-col bg-white"
            style={{
              borderRadius: "16px",
              boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
            }}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 gap-3">
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                  boxShadow: "0 2px 10px rgba(120,0,200,0.25)",
                }}
              >
                <Plus size={13} />
                Tambah Mentor
              </button>

              {/* Search */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-full"
                style={{
                  background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              >
                <input
                  type="text"
                  placeholder="Cari mentor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-xs text-gray-600 outline-none w-[140px] placeholder-gray-400"
                />
                <Search size={13} className="text-gray-400" />
              </div>
            </div>

            <div
              className="w-full h-px"
              style={{ background: "rgba(0,0,0,0.06)" }}
            />

            {/* GRID MENTOR CARDS */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMentors.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8 col-span-3">
                  Belum ada mentor.
                </p>
              ) : (
                filteredMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      background: "rgba(120,0,200,0.04)",
                      border: "1px solid rgba(120,0,200,0.12)",
                    }}
                  >
                    {/* FOTO */}
                    <div
                      className="w-12 h-12 rounded-full shrink-0 overflow-hidden flex items-center justify-center"
                      style={{ background: "rgba(120,0,200,0.12)" }}
                    >
                      {mentor.photoUrl ? (
                        <img
                          src={mentor.photoUrl}
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users size={20} className="text-purple-400" />
                      )}
                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-xs font-semibold truncate">
                        {mentor.name}
                      </p>
                      {mentor.whatsappNumber && (
                        <p className="text-gray-400 text-[10px] flex items-center gap-1 mt-0.5">
                          <Phone size={9} /> {mentor.whatsappNumber}
                        </p>
                      )}
                      {mentor.instagramUsername && (
                        <p className="text-gray-400 text-[10px] flex items-center gap-1">
                          <Instagram size={9} /> @{mentor.instagramUsername}
                        </p>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(mentor)}
                        className="p-1.5 rounded-lg text-purple-500 hover:bg-purple-50 transition"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteId(mentor.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition"
                        title="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── TAB 1: ASSIGN MENTOR ── */}
        {activeTab === 1 && (
          <div
            className="flex flex-col bg-white"
            style={{
              borderRadius: "16px",
              boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
            }}
          >
            {/* SEARCH USER */}
            <div className="px-4 pt-4 pb-3">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-full"
                style={{
                  background: "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              >
                <input
                  type="text"
                  placeholder="Cari nama, NIM, atau email pendaftar..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="bg-transparent text-xs text-gray-600 outline-none flex-1 placeholder-gray-400"
                />
                <Search size={13} className="text-gray-400 shrink-0" />
              </div>
            </div>

            <div
              className="w-full h-px"
              style={{ background: "rgba(0,0,0,0.06)" }}
            />

            {/* TABLE USER */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}>
                    {[
                      "No",
                      "Foto",
                      "Nama",
                      "NIM",
                      "Sub Divisi",
                      "Mentor Saat Ini",
                      "Aksi",
                    ].map((col) => (
                      <th
                        key={col}
                        className="p-4 text-xs font-bold text-gray-700 whitespace-nowrap"
                        style={{
                          textAlign: ["No", "Foto", "Aksi"].includes(col)
                            ? "center"
                            : "left",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-gray-400 text-sm"
                      >
                        Tidak ada data pendaftar.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, i) => (
                      <tr
                        key={u.id}
                        className="hover:bg-purple-50 transition-colors"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                      >
                        <td className="p-4 text-gray-500 text-xs text-center">
                          {i + 1}
                        </td>

                        {/* FOTO — bisa diklik */}
                        <td className="p-4 text-center">
                          <div className="flex justify-center">
                            <UserAvatar
                              avatarUrl={u.profile?.avatarUrl}
                              fullName={u.profile?.fullName}
                            />
                          </div>
                        </td>

                        <td className="p-4 text-gray-800 text-xs font-semibold whitespace-nowrap">
                          {u.profile?.fullName || "-"}
                        </td>
                        <td className="p-4 text-gray-600 text-xs whitespace-nowrap">
                          {u.profile?.nim || "-"}
                        </td>

                        {/* SUB DIVISI — pakai helper */}
                        <td className="p-4 text-gray-600 text-xs whitespace-nowrap">
                          {getSubDivName(u.profile?.subDivisionId)}
                        </td>

                        <td className="p-4 text-gray-600 text-xs whitespace-nowrap">
                          {u.profile?.mentor ? (
                            <span className="flex items-center gap-2">
                              <UserAvatar
                                avatarUrl={u.profile.mentor.photoUrl}
                                fullName={u.profile.mentor.name}
                              />
                              {u.profile.mentor.name}
                            </span>
                          ) : (
                            <span className="text-gray-300">Belum ada</span>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setAssignTarget(u);
                              setAssignMentorId(u.profile?.mentorId || "");
                            }}
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110 whitespace-nowrap"
                            style={{
                              background: u.profile?.mentor
                                ? "linear-gradient(135deg,#F0A000,#CC7700)"
                                : "linear-gradient(135deg,#7B2FBE,#501A5E)",
                              boxShadow: "0 2px 8px rgba(120,0,200,0.2)",
                            }}
                          >
                            {u.profile?.mentor
                              ? "Ganti Mentor"
                              : "Assign Mentor"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL FORM MENTOR ── */}
      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-800 font-bold text-base">
                {editTarget ? "Edit Mentor" : "Tambah Mentor"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* NAMA */}
              <div>
                <label className={labelStyle}>Nama *</label>
                <input
                  type="text"
                  placeholder="Nama lengkap mentor"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>

              {/* WA */}
              <div>
                <label className={labelStyle}>Nomor WhatsApp</label>
                <input
                  type="text"
                  placeholder="628xxxxxxxxxx"
                  value={form.whatsappNumber}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, whatsappNumber: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>

              {/* IG */}
              <div>
                <label className={labelStyle}>Username Instagram</label>
                <input
                  type="text"
                  placeholder="username (tanpa @)"
                  value={form.instagramUsername}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      instagramUsername: e.target.value,
                    }))
                  }
                  style={inputStyle}
                />
              </div>

              {/* FOTO */}
              <div>
                <label className={labelStyle}>Foto Mentor</label>
                <div
                  className="relative flex flex-col items-center justify-center gap-2 py-5 rounded-xl cursor-pointer transition-all"
                  style={{
                    border: `2px dashed ${dragging ? "#7B2FBE" : "rgba(0,0,0,0.12)"}`,
                    background: dragging
                      ? "rgba(120,0,200,0.04)"
                      : "rgba(0,0,0,0.02)",
                    minHeight: "90px",
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                  {form.photo ? (
                    <p className="text-gray-600 text-xs font-medium">
                      {form.photo.name}
                    </p>
                  ) : editTarget?.photoUrl ? (
                    <div className="flex flex-col items-center gap-1">
                      <img
                        src={editTarget.photoUrl}
                        alt="foto"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <p className="text-gray-400 text-[10px]">
                        Klik untuk ganti foto
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload size={16} className="text-gray-400" />
                      <p className="text-gray-400 text-xs">
                        Seret foto atau klik untuk pilih
                      </p>
                    </>
                  )}
                </div>
              </div>

              {errorMsg && (
                <p className="text-red-500 text-xs text-center">{errorMsg}</p>
              )}

              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 rounded-full text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 rounded-full text-sm font-semibold text-white transition disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                  }}
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ASSIGN MENTOR ── */}
      {assignTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-800 font-bold text-base">
                Assign Mentor
              </h2>
              <button
                onClick={() => setAssignTarget(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-gray-600 text-xs mb-4">
              Pilih mentor untuk{" "}
              <strong>
                {assignTarget.profile?.fullName || assignTarget.email}
              </strong>
            </p>

            <div className="relative mb-4">
              <select
                value={assignMentorId}
                onChange={(e) => setAssignMentorId(e.target.value)}
                className="appearance-none cursor-pointer w-full"
                style={{
                  ...inputStyle,
                  paddingRight: "36px",
                  color: assignMentorId ? "#333" : "#aaa",
                }}
              >
                <option value="" disabled hidden>
                  Pilih mentor
                </option>
                {mentors.map((m) => (
                  <option key={m.id} value={m.id} style={{ color: "#333" }}>
                    {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setAssignTarget(null)}
                className="flex-1 py-2 rounded-full text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleAssign}
                disabled={assigning || !assignMentorId}
                className="flex-1 py-2 rounded-full text-sm font-semibold text-white transition disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                }}
              >
                {assigning ? "Menyimpan..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DELETE ── */}
      {deleteId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">
            <h2 className="text-lg font-bold text-gray-800">Hapus Mentor?</h2>
            <p className="text-sm text-gray-500 mt-2">
              Mentor yang dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
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
