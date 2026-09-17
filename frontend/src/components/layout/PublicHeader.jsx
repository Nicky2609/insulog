import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-[#071b33]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md shadow-cyan-500/20 font-mono">
            IN
          </div>
          <div>
            <span className="font-bold tracking-tight text-white font-mono text-base">INSULOG S.A.S.</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest border-l border-slate-700 pl-2">
              Ingeniería & Logística
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono uppercase tracking-wider text-slate-300">
          <a href="/#servicios" className="hover:text-cyan-400 transition-colors">
            Servicios
          </a>
          <a href="/#servicios" className="hover:text-cyan-400 transition-colors">
            Obras & Proyectos
          </a>
          <Link to="/cotizar" className="hover:text-cyan-400 transition-colors">
            Cotizador
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/ingresar"
            className="text-xs font-mono text-slate-300 hover:text-white px-3 py-1.5 rounded border border-slate-700 hover:border-slate-500 transition-all flex items-center gap-1.5"
          >
            <span>Acceso Interno</span>
          </Link>

          <Link
            to="/cotizar"
            className="hidden sm:inline-block bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded shadow-md shadow-orange-600/20 transition-all uppercase tracking-wide"
          >
            Solicitar Cotización
          </Link>

          {/* Botón menú móvil */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Abrir menú"
            className="md:hidden w-8 h-8 flex items-center justify-center rounded border border-slate-700 text-slate-300"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Menú Móvil */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#071b33] px-6 py-4 space-y-2">
          <a
            href="/#servicios"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-cyan-400"
          >
            Servicios
          </a>
          <Link
            to="/cotizar"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-cyan-400"
          >
            Cotizador
          </Link>
          <Link
            to="/ingresar"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm text-slate-300 hover:text-cyan-400"
          >
            Acceso Interno
          </Link>
        </div>
      )}
    </header>
  );
}