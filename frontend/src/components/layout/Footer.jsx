const Footer = () => (
  <footer className="bg-corteza-800 text-white">
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

        {/* ── logo  ── */}
        <div>
          {/* logo de la empresa */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src="logo2.png"
              alt="La Quesería de Merimun"
              className="h-12 w-auto object-contain"
              style={{ filter: 'brightness(1.1)' }}
            />
          </div>
          <p className="font-body text-queso-300/70 text-sm leading-relaxed">
            Quesos artesanales colombianos elaborados con tradición y los mejores
            ingredientes desde 1987.
          </p>
        </div>

        {/* Navegación */}
        <div>
          <p className="font-body font-bold text-queso-200 mb-4 tracking-wide text-sm uppercase">
            Navegación
          </p>
          <ul className="space-y-2">
            {['#inicio', '#menu', '#nosotros', '#contacto'].map((href) => (
              <li key={href}>
                <button
                  onClick={() =>
                    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="font-body text-queso-300/70 text-sm hover:text-queso-200 transition-colors capitalize"
                >
                  {href.replace('#', '')}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <p className="font-body font-bold text-queso-200 mb-4 tracking-wide text-sm uppercase">
            Contacto
          </p>
          <ul className="space-y-2 font-body text-queso-300/70 text-sm">
            <li>📧 ventas@quesomerimun.com</li>
            <li>📱 +57 3007806178</li>
            <li>📍 Medellín, Antioquia</li>
            <li className="flex gap-4 pt-2">
              {['Instagram', 'Facebook', 'WhatsApp'].map((red) => (
                <button key={red} className="hover:text-queso-200 transition-colors">
                  {red}
                </button>
              ))}
            </li>
          </ul>
        </div>
      </div>

      {/* Franja inferior */}
      <div className="border-t border-queso-700/50 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Logo pequeño en el copyright */}
        <div className="flex items-center gap-3">
          <img
            src="logo2.png"
            alt="La Quesería de Merimun"
            className="h-7 w-auto object-contain opacity-70"
          />
          <p className="font-body text-queso-400/60 text-xs">
            © {new Date().getFullYear()} La Quesería de Merimun. Todos los derechos reservados.
          </p>
        </div>
        <p className="font-body text-queso-500/50 text-xs">
          Hecho con 🧀 en Medellín, Colombia
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;