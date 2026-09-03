export default function PublicFooter() {
  return (
    <footer className="bg-steel-950 text-concrete-200 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-display text-xl text-white">INSULOG S.A.S.</p>
          <p className="mt-2 text-sm leading-relaxed">
            Ingenieria, suministros y logistica para proyectos de construccion en Colombia.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-signal mb-3">Contacto</p>
          <p className="text-sm">La Belleza, Santander, Colombia</p>
          <p className="text-sm">insulogsas@gmail.com</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-signal mb-3">Acceso</p>
          <p className="text-sm">Personal autorizado: use el boton "Ingresar" para entrar al panel.</p>
        </div>
      </div>
      <div className="dimension-line max-w-6xl mx-auto opacity-20" />
      <p className="text-center text-xs text-concrete-400 pb-6">
        © {new Date().getFullYear()} Insulog S.A.S. Todos los derechos reservados.
      </p>
    </footer>
  );
}