import { useState } from "react";
import { User, Search, SlidersHorizontal } from "lucide-react";
import AdminLayout from "../../components/admin/LayoutAdmin";
import DivisionTabs from "../../components/admin/DivisionsTab";

const dummyData = [
  { id: 1, tanggal: "13 Juni 2026, 21:00", orderId: "INV 99999999", jenis: "Pembayaran", channel: "Qris",    status: "settlement", nilai: "Rp40.000", email: "yunus@g." },
  { id: 2, tanggal: "13 Juni 2026, 21:00", orderId: "INV 99999999", jenis: "Pembayaran", channel: "Mandiri", status: "settlement", nilai: "Rp40.000", email: "yunus@g." },
  { id: 3, tanggal: "13 Juni 2026, 21:00", orderId: "INV 99999999", jenis: "Pembayaran", channel: "Mandiri", status: "Tertunda",   nilai: "Rp40.000", email: "yunus@g." },
  { id: 4, tanggal: "13 Juni 2026, 21:00", orderId: "INV 99999999", jenis: "Pembayaran", channel: "Mandiri", status: "Tertunda",   nilai: "Rp40.000", email: "yunus@g." },
  { id: 5, tanggal: "13 Juni 2026, 21:00", orderId: "INV 99999999", jenis: "Pembayaran", channel: "Mandiri", status: "Tertunda",   nilai: "Rp40.000", email: "yunus@g." },
  { id: 6, tanggal: "13 Juni 2026, 21:00", orderId: "INV 99999999", jenis: "Pembayaran", channel: "Mandiri", status: "Kadaluarsa", nilai: "Rp40.000", email: "yunus@g." },
];

const columns = ["Tanggal & Waktu", "Order ID", "Jenis Transaksi", "Channel", "Status", "Nilai", "Email"];

const statusConfig = {
  settlement: { bg: "#D1FAE5", color: "#065F46" },
  Tertunda:   { bg: "#EDE9FE", color: "#5B21B6" },
  Kadaluarsa: { bg: "#FEE2E2", color: "#991B1B" },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] ?? { bg: "#F3F4F6", color: "#374151" };
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {status}
    </span>
  );
}

export default function PembayaranAdmin() {
  const [activeDivision, setActiveDivision] = useState(0);
  const [search, setSearch] = useState("");

  const filtered = dummyData.filter((row) =>
    [row.tanggal, row.orderId, row.jenis, row.channel, row.status, row.email]
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
            {/* FILTER + SEARCH */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            >
              <button
                className="flex items-center gap-2 px-4 py-[7px] rounded-full text-xs font-semibold text-white transition-all hover:brightness-110 shrink-0"
                style={{
                  background: "linear-gradient(135deg,#7B2FBE,#501A5E)",
                  boxShadow: "0 2px 10px rgba(120,0,200,0.25)",
                }}
              >
                <SlidersHorizontal size={13} />
                Filter
              </button>

              <div
                className="flex items-center gap-2 px-3 py-[7px] rounded-full flex-1"
                style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.10)" }}
              >
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-xs text-gray-600 outline-none flex-1 placeholder-gray-400"
                />
                <Search size={13} className="text-gray-400 shrink-0" />
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[680px]">
                <thead>
                  <tr style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="p-5 text-xs font-bold text-gray-700 text-left whitespace-nowrap"
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
                      <td className="p-5 text-gray-600 text-xs whitespace-nowrap">{row.tanggal}</td>
                      <td className="p-5 text-gray-800 text-xs whitespace-nowrap">{row.orderId}</td>
                      <td className="p-5 text-gray-600 text-xs whitespace-nowrap">{row.jenis}</td>
                      <td className="p-5 text-gray-600 text-xs whitespace-nowrap">{row.channel}</td>
                      <td className="p-5 text-xs">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="p-5 text-gray-800 text-xs font-medium whitespace-nowrap">{row.nilai}</td>
                      <td className="p-5 text-gray-600 text-xs whitespace-nowrap">{row.email}</td>
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