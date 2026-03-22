import logoNeo from "../../assets/images/Logo_Neo_White.svg";
import { Instagram, Facebook, Youtube, Twitter } from "lucide-react";
import { FaTiktok, FaSpotify } from "react-icons/fa";

const quickLinks = ["Home", "Division", "Project", "Achievement", "FAQ"];

const websiteTeam = [
  { role: "Fronted Developer", name: "Reynard Ghazy Tsaqif" },
  { role: "Backend Developer", name: "Rahmat Fajar Saputra" },
  { role: "UI/UX Design", name: "Amara Marshinta" },
];

const socials = [
  { icon: Instagram, href: "https://www.instagram.com/neotelemetri?igsh=MWNlZXVwNXBuNDlqNA==", label: "Instagram" },
  { icon: Facebook, href: "https://www.facebook.com/share/1GehkvZfnQ/", label: "Facebook" },
  { icon: FaSpotify, href: "https://spotify.com", label: "Spotify" },
  { icon: Twitter, href: "https://x.com/neotelemetri", label: "X" },
  { icon: FaTiktok, href: "https://www.tiktok.com/@neotelemetri.project?_r=1&_t=ZS-94lChUS75hE", label: "TikTok" },
  { icon: Youtube, href: "https://youtube.com/@neotelemetri?si=xoBqWsWq3OFNzZ1X", label: "Youtube" },
];

export default function FooterSection() {
  return (
    <footer className="relative border-t border-white/10 pt-14 pb-6 overflow-hidden">
      {/* top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10">

          {/* COL 1: LOGO + ALAMAT — full width di mobile */}
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-4">
            <img src={logoNeo} alt="Neo Telemetri" className="w-[140px]" />
            <p className="text-white/50 text-sm leading-relaxed">
              Neo Telemetri, Lt. 2, Gedung Pusat Kegiatan Mahasiswa, Universitas
              Andalas, Kota Padang, Sumatera Barat, Indonesia.
            </p>
          </div>

          {/* COL 2: QUICK LINKS */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-1">
              Quick Links
            </h4>
            {quickLinks.map((link, i) => (
              <a
                key={i}
                href={`#${link.toLowerCase()}`}
                className="text-white/50 text-sm hover:text-white transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </div>

          {/* COL 3: WEBSITE TEAM */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-1">
              Website
            </h4>
            {websiteTeam.map((member, i) => (
              <div key={i}>
                <p className="text-white font-semibold text-sm">{member.role}</p>
                <p className="text-white/50 text-sm">{member.name}</p>
              </div>
            ))}
          </div>

          {/* COL 4: FOLLOW + CONTACT */}
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-5">
            <div>
              <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-4">
                Follow Us
              </h4>
              <div className="grid grid-cols-3 gap-3 w-fit">
                {socials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all duration-200"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-2">
                Contact Us
              </h4>
              <p className="text-white/50 text-sm">+62 800 0000 0000</p>
              <p className="text-white/50 text-sm">or.neotelemetri@gmail.com</p>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Neo Telemetri. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}