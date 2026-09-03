import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicHeader from '../components/layout/PublicHeader';

export default function ForgotPassword() {
    const { requestPasswordReset } = useAuth();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | sending | sent
    const [error, setError] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setStatus('sending');
        try {
            await requestPasswordReset(email);
            setStatus('sent');
        } catch (err) {
            setError(err.response?.data?.error || 'No fue posible procesar la solicitud.');
            setStatus('idle');
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <PublicHeader />

            <section className="max-w-md mx-auto px-6 py-20 w-full flex-1">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-signal mb-2">Acceso</p>
                <h1 className="font-display text-3xl text-steel-900 mb-3">Recuperar contraseña</h1>
                <p className="text-steel-600 mb-8 text-sm">
                    Escriba el correo de su cuenta y le enviaremos un enlace para crear una contraseña nueva.
                </p>

                <div className="panel-card p-6">
                    {status === 'sent' ? (
                        <div>
                            <p className="font-display text-xl text-steel-900 mb-2">Revise su correo</p>
                            <p className="text-sm text-steel-600">
                                Si el correo <span className="font-semibold">{email}</span> tiene una cuenta, le enviamos un
                                enlace para restablecer la contraseña. El enlace es valido por 1 hora.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <label className="block">
                                <span className="text-xs font-semibold uppercase tracking-wide text-steel-700">
                                    Correo electronico
                                </span>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1.5 w-full border border-steel-800/15 rounded-lg px-3 py-2.5 text-sm"
                                />
                            </label>

                            {error && <p className="text-sm text-signal-dark">{error}</p>}

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full bg-signal text-white font-semibold px-6 py-3 rounded-lg hover:bg-signal-dark transition-colors disabled:opacity-60"
                            >
                                {status === 'sending' ? 'Enviando...' : 'Enviar enlace'}
                            </button>
                        </form>
                    )}
                </div>

                <p className="mt-6 text-sm text-steel-600">
                    <Link to="/ingresar" className="text-blueprint font-semibold hover:underline">
                        Volver a ingresar
                    </Link>
                </p>
            </section>
        </div>
    );
}