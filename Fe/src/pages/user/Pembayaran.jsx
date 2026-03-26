import Bayar1 from "../../assets/images/Bayar1.png";
import Bayar2 from "../../assets/images/Bayar2.png";
import Bayar3 from "../../assets/images/Bayar3.png";
import UserLayout from "../../components/user/LayoutUser";
import { useNavigate } from "react-router-dom";

export default function Pembayaran() {
  const navigate = useNavigate();
  return (
    <UserLayout>
      <div className="min-h-screen  px-6 py-8">
        {/* Header */}
        <h2 className="text-xl font-bold text-white mb-7 tracking-wide">
          Pembayaran OR 15 Neo Telemetri
        </h2>

        {/* Section Instruksi */}
        <div className="text-white">
          <h3 className=" font-bold  mb-4">
            Baca Tata cara pembayaran OR 15 Neo Telemetri
          </h3>
          <ol className="list-decimal list-outside pl-5 space-y-2.5">
            <li className="leading-relaxed">
              Tekan tombol "lanjutkan pembayaran" lalu Screenshot QR Code yang
              tertera
            </li>
            <li className=" leading-relaxed">
              Buka aplikasi E-Wallet (Dana, Ovo, GoPay dll) atau mobile banking
              anda untuk membayar
            </li>
            <li className="  leading-relaxed">
              Scan QR Code tersebut di E-Wallet atau mobile banking
            </li>
            <li className="leading-relaxed">
              Kirim total tagihan sebanyak{" "}
              <span className=" font-bold">Rp40.000</span>
            </li>
            <li className="leading-relaxed">
              Setelah dikirim, screenshot bukti pembayaran dan wajib upload
              bukti pembayaran di menu yang tersedia
            </li>
          </ol>
        </div>

        {/* Section Upload Bukti */}
        <div className="mb-8 py-8">
          <h3 className="text-sm font-bold text-white mb-6 text-center sm:text-left">
            Tata cara Upload Bukti Pembayaran OR 15 Neo Telemetri
          </h3>

          <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6">
            {/* STEP 1 */}
            <div className="flex flex-col justify-between items-center flex-1 max-w-[320px] mx-auto">
              <div className="w-full aspect-[4/3] overflow-hidden rounded-md">
                <img
                  src={Bayar1}
                  alt="Langkah 1"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-white text-center leading-relaxed mt-3 min-h-[48px]">
                Tekan tombol lanjutkan pembayaran
              </p>
            </div>

            {/* ARROW */}
            <span className="hidden lg:flex items-center text-2xl text-purple-400">
              →
            </span>

            {/* STEP 2 */}
            <div className="flex flex-col justify-between items-center flex-1 max-w-[320px] mx-auto">
              <div className="w-full aspect-[4/3] overflow-hidden rounded-md">
                <img
                  src={Bayar2}
                  alt="Langkah 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-white text-center leading-relaxed mt-3 min-h-[48px]">
                Lanjut ke pembayaran lalu tekan tombol "lanjutkan ke Upload
                Bukti Pembayaran"
              </p>
            </div>

            {/* ARROW */}
            <span className="hidden lg:flex items-center text-2xl text-purple-400">
              →
            </span>

            {/* STEP 3 */}
            <div className="flex flex-col justify-between items-center flex-1 max-w-[320px] mx-auto">
              <div className="w-full aspect-[4/3] overflow-hidden rounded-md">
                <img
                  src={Bayar3}
                  alt="Langkah 3"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-white text-center leading-relaxed mt-3 min-h-[48px]">
                Upload bukti pembayaran dan tekan tombol submit
              </p>
            </div>
          </div>
        </div>

        {/* Button */}
        
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/pembayaran/qr")}
            className="bg-[#FF00FF] w-full text-white font-bold text-sm px-16 py-4 rounded-full cursor-pointer hover:bg-[#FF00FF]/90 transition-colors duration-300"
          >
            Lanjutkan ke Pembayaran
          </button>
        </div>
      </div>
    </UserLayout>
  );
}
