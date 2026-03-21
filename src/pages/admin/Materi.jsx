import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Plus } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";

const dummyData = [
  { id: 1, title: "Materi 1", subDivisi: "UI/UX", fileUrl: "#" },
  { id: 2, title: "Materi 2", subDivisi: "UI/UX", fileUrl: "#" },
  { id: 3, title: "Materi 3", subDivisi: "Video Editing", fileUrl: "#" },
  { id: 4, title: "Materi 4", subDivisi: "Video Editing", fileUrl: "#" },
  { id: 5, title: "Materi 5", subDivisi: "Video Editing", fileUrl: "#" },
];

const columns = ["No", "Title", "Sub Divisi", "File", "Action"];

export default function MateriAdmin() {
  const navigate = useNavigate();
  const [activeDivision, setActiveDivision] = useState(0);
  const [search, setSearch] = useState("");

  const filtered = dummyData.filter((row) =>
    [row.title, row.subDivisi]
      .some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col gap-4 pt-10 md:pt-4">

        {/* TOP RIGHT */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-white font-semibold text-sm">NamaUser</span>
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
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
            {/* ADD MATERI BUTTON */}
            <div className="px-4 pt-4 pb-2">
              <button
                onClick={() => navigate("/admin/materi/add")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                  boxShadow: "0 2px 10px rgba(120,0,200,0.25)",
                }}
              >
                <Plus size={13} />
                Add Materi
              </button>
            </div>

            {/* DIVIDER */}
            <div className="w-full h-px" style={{ background: "rgba(0,0,0,0.06)" }} />

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="p-5 text-xs font-bold text-gray-700 whitespace-nowrap"
                        style={{
                          textAlign: col === "No" || col === "Action" || col === "File"
                            ? "center" : "left",
                        }}
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
                      <td className="p-5 text-gray-500 text-xs text-center">{row.id}</td>
                      <td className="p-5 text-gray-800 text-xs whitespace-nowrap">{row.title}</td>
                      <td className="p-5 text-gray-600 text-xs whitespace-nowrap">{row.subDivisi}</td>

                      {/* FILE */}
                      <td className="p-5 text-center">
                        <a
                          href={row.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-1 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110 whitespace-nowrap inline-block"
                          style={{
                            background: "linear-gradient(135deg,#0077CC,#004499)",
                            boxShadow: "0 2px 8px rgba(0,100,200,0.3)",
                          }}
                        >
                          Lihat
                        </a>
                      </td>

                      {/* ACTION */}
                      <td className="p-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/materi/${row.id}/edit`)}
                            className="px-4 py-1 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110 whitespace-nowrap"
                            style={{
                              background: "#F0C000",
                              boxShadow: "0 2px 8px rgba(200,160,0,0.3)",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => console.log("Delete materi:", row.id)}
                            className="px-4 py-1 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110 whitespace-nowrap"
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
                      <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
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