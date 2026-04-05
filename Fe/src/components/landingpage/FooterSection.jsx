import logoNeo from "../../assets/images/Logo_Neo_White.svg";
import { Instagram, Facebook, Youtube, Twitter } from "lucide-react";
import { FaTiktok } from "react-icons/fa";

const quickLinks = [
  { name: "Home", id: "home" },
  { name: "Division", id: "division" },
  { name: "Project", id: "project" },
  { name: "Achievement", id: "achievement" },
  { name: "FAQ", id: "faq" },
];

const websiteTeam = [
  {
    role: "Project Manager",
    name: "Rizki Dafa Naldi",
    ig: "https://www.instagram.com/daf_nal?igsh=bDYzN2FhbWtrdmcy",
  },
  {
    role: "Fronted Developer",
    name: "Reynard Ghazy Tsaqif",
    ig: "https://www.instagram.com/reynard_ghazy?igsh=bmQybGxvZHRqYW44",
  },
  {
    role: "Backend Developer",
    name: "Rahmat Fajar Saputra",
    ig: "https://www.instagram.com/jaaeyii__?igsh=MTU2djhlbnZnMGVrdA==",
  },
  {
    role: "UI/UX Design",
    name: "Amara Marshinta",
    ig: "https://www.instagram.com/amararutaceae?igsh=dWdlM2l5bGxscmp2",
  },
];
const socials = [
  {
    icon: Instagram,
    href: "https://www.instagram.com/neotelemetri?igsh=MWNlZXVwNXBuNDlqNA==",
    label: "Instagram",
  },
  {
    icon: Facebook,
    href: "https://www.facebook.com/share/1GehkvZfnQ/",
    label: "Facebook",
  },

  { icon: Twitter, href: "https://x.com/neotelemetri", label: "X" },
  {
    icon: FaTiktok,
    href: "https://www.tiktok.com/@neotelemetri.project?_r=1&_t=ZS-94lChUS75hE",
    label: "TikTok",
  },
  {
    icon: Youtube,
    href: "https://youtube.com/@neotelemetri?si=xoBqWsWq3OFNzZ1X",
    label: "Youtube",
  },
];

const NAVBAR_HEIGHT = 72;

const handleLinkClick = (e, id) => {
  e.preventDefault();

  if (id === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const el = document.getElementById(id);
  if (!el) return;

  window.scrollTo({
    top: el.offsetTop - NAVBAR_HEIGHT,
    behavior: "smooth",
  });
};

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
                href={`#${link.id}`}
                onClick={(e) => handleLinkClick(e, link.id)}
                className="text-white/50 text-sm hover:text-white transition-colors duration-200 cursor-pointer"
              >
                {link.name}
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
                <p className="text-white font-semibold text-sm">
                  {member.role}
                </p>
                <a
                  href={member.ig}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 text-sm hover:text-white hover:underline transition-colors duration-200"
                >
                  {member.name}
                </a>
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
              <p className="text-white/50 text-sm">
                +62-831-8195-9775 ( Hafid )
              </p>
              <p className="text-white/50 text-sm">+62 812-6162-5026 ( Ima )</p>
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
