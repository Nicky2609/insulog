import { Link } from 'react-router-dom';

export default function PublicHeader() {
  return (
    <header className="border-b border-steel-800/10 bg-paper/90 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/insulog-logo.png" alt="Insulog S.A.S." className="h-11 w-auto" />
        </Link>
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
        <Link
          to="/cotizar"
          className="bg-signal text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-signal-dark transition-colors"
        >
          Solicitar cotizacion
        </Link>
      </div>
    </header>
  );
}