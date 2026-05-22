import { useState, useEffect } from 'react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#menu', label: 'Menú' },
    { href: '#nosotros', label: 'Nosotros' },
    { href: '#contacto', label: 'Contacto' },
  ];

  const scrollTo = (href) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-md border-b border-queso-200'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* ── LOGO ── */}
        <button
          onClick={() => scrollTo('#inicio')}
          className="flex items-center group"
        >
          <img
            src="/logo1.png" 
            alt="La Quesería de Miramu"
            className={`h-10 w-auto object-contain transition-all duration-300 ${
              scrolled
                ? 'brightness-90'        /* un toque más oscuro sobre fondo blanco */
                : 'brightness-110'       /* brillo extra sobre fondo oscuro del hero */
            }`}
          />
        </button>

        {/* Links escritorio */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className={`font-body text-sm font-medium tracking-wide transition-colors hover:text-queso-500 ${
                scrolled ? 'text-corteza-700' : 'text-white/90'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo('#contacto')}
            className="px-5 py-2 rounded-full bg-queso-600 hover:bg-queso-700 text-white text-sm font-medium font-body transition-all duration-200 hover:shadow-lg hover:-translate-y-px"
          >
            Hacer Pedido
          </button>
        </div>

        {/* Hamburger móvil */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${
            scrolled ? 'text-corteza-700 hover:bg-queso-100' : 'text-white'
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          <div className="w-5 flex flex-col gap-1.5">
            <span className={`block h-0.5 bg-current transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-current transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-current transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-queso-100 px-6 py-4 flex flex-col gap-3 shadow-lg animate-fade-in">
          {/* Logo dentro del menú móvil */}
          <div className="flex justify-center pb-3 border-b border-queso-100">
            <img
              src="/logo1.png"
              alt="La Quesería de Miramu"
              className="h-10 w-auto object-contain"
            />
          </div>

          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-left font-body text-corteza-700 py-2 border-b border-queso-100 hover:text-queso-600 transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo('#contacto')}
            className="mt-2 px-5 py-2.5 rounded-full bg-queso-600 text-white font-medium font-body text-center"
          >
            Hacer Pedido
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;