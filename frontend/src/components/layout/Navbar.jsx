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

        {/* ── LOGO ESCRITORIO ── */}
        <button onClick={() => scrollTo('#inicio')} className="flex items-center group">
          <img
            src="logo2.png"
            alt="La Quesería de Merimun"
            className={`h-12 w-auto object-contain transition-all duration-300 ${
              scrolled ? 'brightness-90' : 'brightness-110'
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

      {/* ── MENÚ MÓVIL ── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-queso-100 px-6 py-5 flex flex-col gap-3 shadow-xl animate-fade-in">

          {/* Logo grande y visible sobre fondo marrón */}
          <div className="flex justify-center items-center py-4 mb-1">
            <div
              className="flex items-center justify-center rounded-2xl px-8 py-4 shadow-lg w-full"
              style={{ background: 'linear-gradient(135deg, #78350F, #92400E)' }}
            >
              <img
                src="logo2.png"
                alt="La Quesería de Merimun"
                style={{
                  height: '72px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'brightness(1.15)',
                }}
              />
            </div>
          </div>

          {/* Separador */}
          <div className="border-b border-queso-100 mb-1" />

          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-left font-body text-corteza-700 py-2.5 border-b border-queso-50 hover:text-queso-600 transition-colors text-base font-medium"
            >
              {link.label}
            </button>
          ))}

          <button
            onClick={() => scrollTo('#contacto')}
            className="mt-3 px-5 py-3 rounded-full bg-queso-600 text-white font-bold font-body text-center text-base hover:bg-queso-700 transition-colors"
          >
            Hacer Pedido
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;