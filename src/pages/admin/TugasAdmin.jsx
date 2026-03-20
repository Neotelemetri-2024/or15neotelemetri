import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Search, Plus } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";

const dummyData = [
  { id: 1, title: "Title 1", description: "Description 1", subDivisi: "UI/UX",        deadline: "DD/MM/YYY", submitted: 0 },
  { id: 2, title: "Title 1", description: "Description 1", subDivisi: "UI/UX",        deadline: "DD/MM/YYY", submitted: 0 },
  { id: 3, title: "Title 1", description: "Description 1", subDivisi: "Video Editing", deadline: "DD/MM/YYY", submitted: 0 },
  { id: 4, title: "Title 1", description: "Description 1", subDivisi: "Video Editing", deadline: "DD/MM/YYY", submitted: 0 },
  { id: 5, title: "Title 1", description: "Description 1", subDivisi: "Video Editing", deadline: "DD/MM/YYY", submitted: 0 },
];

const columns = ["No", "Title", "Description", "Sub Divisi", "Deadline", "Submitted", "Action"];

export default function TugasAdmin() {
  const navigate = useNavigate();
  const [activeDivision, setActiveDivision] = useState(0);
  const [search, setSearch]                 = useState("");

  const filtered = dummyData.filter((row) =>
    [row.title, row.description, row.subDivisi]
      .some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  const handleEdit   = (id) => navigate(`/admin/tugas/${id}/edit`);
  const handleDelete = (id) => console.log("Delete tugas:", id);
  const handleAdd    = ()   => navigate("/admin/tugas/add");

  return (
    <AdminLayout>
      <div className="min-h-screen px-8 py-8 flex flex-col gap-4">

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

        {/* TABS + CARD */}
        <div className="mt-6">
          <DivisionTabs
            activeDivision={activeDivision}
            setActiveDivision={setActiveDivision}
          />

          {/* CARD PUTIH */}
          <div
            className="flex flex-col"
            style={{
              background: "white",
              borderRadius: "0 0 16px 16px",
              boxShadow: "0 8px 48px rgba(120,0,200,0.18)",
              position: "relative",
              zIndex: 15,
            }}
          >
            {/* ADD TUGAS BUTTON */}
            <div className="px-5 pt-4 pb-2">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                  boxShadow: "0 2px 10px rgba(120,0,200,0.25)",
                }}
              >
                <Plus size={13} />
                Add Tugas
              </button>
            </div>

            {/* DIVIDER */}
            <div className="w-full h-px mx-0" style={{ background: "rgba(0,0,0,0.06)" }} />

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-xs font-bold text-gray-700"
                        style={{ textAlign: col === "Action" || col === "No" || col === "Submitted" ? "center" : "left" }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <tr
                      key={row.id}
                      className="transition-colors duration-150 hover:bg-purple-50"
                      style={{
                        borderBottom: i < filtered.length - 1
                          ? "1px solid rgba(0,0,0,0.05)"
                          : "none",
                      }}
                    >
                      <td className="px-4 py-3 text-gray-500 text-xs text-center">{row.id}</td>
                      <td className="px-4 py-3 text-gray-800 text-xs">{row.title}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{row.description}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{row.subDivisi}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{row.deadline}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs text-center">{row.submitted}</td>

                      {/* ACTION */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(row.id)}
                            className="px-4 py-1 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110"
                            style={{
                              background: "#F0C000",
                              boxShadow: "0 2px 8px rgba(200,160,0,0.3)",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="px-4 py-1 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110"
                            style={{
                              background: "linear-gradient(135deg,#EE2222,#AA0000)",
                              boxShadow: "0 2px 8px rgba(200,0,0,0.3)",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}