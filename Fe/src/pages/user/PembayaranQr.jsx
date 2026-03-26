import { useNavigate } from "react-router-dom";
import QrPembayaran from "../../assets/images/QrPembayaran.png";
import UserLayout from "../../components/user/LayoutUser";

export default function PembayaranQr() {
  const navigate = useNavigate();

  return (
    <UserLayout>
      <div className="min-h-screen px-6 py-4 text-white flex flex-col">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white text-sm font-medium w-fit  hover:opacity-70 transition-opacity"
        >
          <span className="text-base">←</span>
          <span>Back</span>
        </button>

        {/* Content Center */}
        <div className="flex flex-col items-center flex-1 justify-center gap-2">

          {/* Label */}
          <p className="text-xl text-white tracking-wide font-semibold">Kode Qris</p>

          {/* Nominal */}
          <h2 className="text-3xl font-bold text-white tracking-wide">
            Rp40.000
          </h2>

          {/* QR Code Card */}
          <div className="bg-white rounded-2xl p-4 mt-2 ">
            <img
              src={QrPembayaran}
              alt="QR Code Pembayaran"
              className="w-48 h-48 object-contain block"
            />
          </div>

          {/* Scan Label */}
          <p className="text-sm text-white/70 mt-2">Scan QR Code di Atas</p>

          {/* Nama */}
          <p className="text-sm font-bold text-white tracking-widest uppercase">
            A.N FAZILA, DIGITAL &amp; KREATIF
          </p>

        </div>

        {/* Bottom Button */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/pembayaran/bukti")}
            className="bg-[#FF00FF] w-full text-white font-bold text-sm px-16 py-4 rounded-full cursor-pointer hover:bg-[#FF00FF]/90 transition-colors duration-300"
          >
            Lanjutkan ke Upload Bukti Pembayaran
          </button>
        </div>

      </div>
    </UserLayout>
  );
}