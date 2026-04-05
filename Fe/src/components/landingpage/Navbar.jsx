import logoORWhite from "../../assets/images/Logo_OR_White.png";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef(null);

  const menus = [
    { name: "Home", id: "home" },
    { name: "Division", id: "division" },
    { name: "Project", id: "project" },
    { name: "Achievement", id: "achievement" },
    { name: "FAQ", id: "faq" },
  ];

  const NAVBAR_HEIGHT = 72;

  useEffect(() => {
    const handleScroll = () => {
      // Block deteksi otomatis saat sedang scroll programatik
      if (isScrollingRef.current) return;

      const scrollY = window.scrollY;

      if (scrollY < 80) {
        setActive("home");
        return;
      }

      let currentActive = "home";
      for (const { id } of menus) {
        const el = document.getElementById(id);
        if (!el) continue;
        const elementTop = el.offsetTop;
        if (scrollY + NAVBAR_HEIGHT >= elementTop - 10) {
          currentActive = id;
        }
      }
      setActive(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tutup menu saat resize ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = (id) => {
    setActive(id); // Set langsung, tidak akan di-override
    setMenuOpen(false);

    // Block handleScroll selama ~800ms (durasi smooth scroll)
    isScrollingRef.current = true;
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);

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

  return (
    <div>
      <nav className="fixed top-0 left-0 right-0 backdrop-blur-md z-50 flex items-center justify-between px-6 md:px-16 py-4">
        {/* Logo */}
        <img src={logoORWhite} className="w-32 md:w-44" alt="Logo" />

        {/* Menu desktop — tengah */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex gap-2 items-center">
          {menus.map((menu) => (
            <a
              key={menu.id}
              onClick={() => handleClick(menu.id)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer select-none
                ${
                  active === menu.id
                    ? "bg-white text-black"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
            >
              {menu.name}
            </a>
          ))}
        </div>

        {/* Spacer kanan (desktop) */}
        <div className="w-44 hidden md:block" />

        {/* Hamburger button (mobile) */}
        <button
          className="md:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8 focus:outline-none"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      <div
        className={`fixed top-[64px] left-0 right-0 z-40 md:hidden backdrop-blur-md transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col px-6 py-3 gap-1 bg-black/40">
          {menus.map((menu) => (
            <a
              key={menu.id}
              onClick={() => handleClick(menu.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer select-none
                ${
                  active === menu.id
                    ? "bg-white text-black"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
            >
              {menu.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
