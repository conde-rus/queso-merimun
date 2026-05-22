const Hero = () => {
  const scrollToMenu = () => {
    document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContacto = () => {
    document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #78350F 0%, #92400E 30%, #B45309 60%, #D97706 100%)' }}
    >
      {/* Patrón decorativo de fondo */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #FCD34D 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, #F59E0B 0%, transparent 40%),
                            radial-gradient(circle at 60% 80%, #FDE68A 0%, transparent 40%)`,
        }}
      />

      {/* Círculos decorativos flotantes */}
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-queso-400/10 blur-3xl animate-float pointer-events-none" />
      <div
        className="absolute bottom-32 left-10 w-48 h-48 rounded-full bg-crema-300/15 blur-2xl animate-float pointer-events-none"
        style={{ animationDelay: '1.5s' }}
      />

      {/* Contenido principal */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-queso-100 text-sm font-body mb-8 animate-fade-in">
          <span>✨</span>
          <span>Queso de miramu esta desde 1987</span>
        </div>

        {/* Título principal */}
        <h1
          className="font-display font-bold text-white leading-none mb-6 animate-slide-up"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
        >
          El Arte del
          <br />
          <span
            className="inline-block"
            style={{
              WebkitTextStroke: '2px rgba(255,255,255,0.3)',
              color: '#FDE68A',
            }}
          >
            Queso miramu
          </span>
        </h1>

        {/* Subtítulo */}
        <p
          className="font-body text-queso-100/90 max-w-xl mx-auto mb-10 leading-relaxed animate-slide-up"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', animationDelay: '0.1s' }}
        >
          Seleccionamos los mejores quesos con procesos artesanales tradicionales.
          Frescos, madurados y tablas gourmet para cada ocasión especial.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <button
            onClick={scrollToMenu}
            className="px-8 py-4 rounded-full bg-white text-corteza-800 font-body font-bold text-base hover:bg-queso-100 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto"
          >
            🧀 Ver el Menú
          </button>
          <button
            onClick={scrollToContacto}
            className="px-8 py-4 rounded-full bg-transparent border-2 border-white/60 text-white font-body font-medium text-base hover:bg-white/10 hover:border-white transition-all duration-200 w-full sm:w-auto"
          >
            Hacer un Pedido →
          </button>
        </div>

        {/* Stats */}
        <div
          className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          {[
            { num: '35+', label: 'Variedades' },
            { num: '37', label: 'Años de experiencia' },
            { num: '100%', label: 'Artesanal' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display font-bold text-queso-200 text-2xl">{stat.num}</p>
              <p className="font-body text-white/60 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wave inferior */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path
            d="M0 80L48 69.3C96 58.7 192 37.3 288 32C384 26.7 480 37.3 576 48C672 58.7 768 69.3 864 64C960 58.7 1056 37.3 1152 32C1248 26.7 1344 37.3 1392 42.7L1440 48V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z"
            fill="#FFFBF0"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
