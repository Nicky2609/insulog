import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-steel-800/10 bg-paper/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center" onClick={() => setMenuOpen(false)}>
          <img src="/insulog-logo.jpg" alt="Insulog S.A.S." className="h-11 w-auto" />
        </Link>

        {/* Desktop nav - unchanged */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-steel-700">
          <a href="/#servicios" className="hover:text-signal transition-colors">
            Servicios
          </a>
          <a href="/#cotizar" className="hover:text-signal transition-colors">
            Cotizar
          </a>
          <Link to="/ingresar" className="hover:text-signal transition-colors">
            Ingresar
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/cotizar"
            className="hidden sm:inline-block bg-signal text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-signal-dark transition-colors"
          >
            Solicitar cotizacion
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-steel-800/15 text-steel-800"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-steel-800/10 bg-paper px-6 py-4 space-y-1">
          <a
            href="/#servicios"
            onClick={() => setMenuOpen(false)}
            className="block py-2.5 text-base font-medium text-steel-800 hover:text-signal transition-colors"
          >
            Servicios
          </a>
          <a
            href="/#cotizar"
            onClick={() => setMenuOpen(false)}
            className="block py-2.5 text-base font-medium text-steel-800 hover:text-signal transition-colors"
          >
            Cotizar
          </a>
          <Link
            to="/ingresar"
            onClick={() => setMenuOpen(false)}
            className="block py-2.5 text-base font-medium text-steel-800 hover:text-signal transition-colors"
          >
            Ingresar
          </Link>
          <Link
            to="/cotizar"
            onClick={() => setMenuOpen(false)}
            className="block mt-2 bg-signal text-white text-center text-sm font-semibold px-4 py-3 rounded-lg hover:bg-signal-dark transition-colors"
          >
            Solicitar cotizacion
          </Link>
        </div>
      )}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}