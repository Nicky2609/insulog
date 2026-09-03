import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ChangePasswordRequired() {
    const { changePassword, signOut } = useAuth();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        try {
            await changePassword(password);
            navigate('/panel', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'No fue posible cambiar la contraseña.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-steel-950 blueprint-grid-dark p-6">
            <div className="panel-card p-8 max-w-md w-full">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-signal mb-2">Primer ingreso</p>
                <h1 className="font-display text-2xl text-steel-900 mb-3">Cree su contraseña</h1>
                <p className="text-sm text-steel-600 mb-6">
                    Su cuenta fue creada con una contraseña temporal. Antes de continuar, debe elegir una contraseña
                    propia.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-steel-700">
                            Nueva contraseña
                        </span>
                        <input
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1.5 w-full border border-steel-800/15 rounded-lg px-3 py-2.5 text-sm"
                        />
                    </label>

                    <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-steel-700">
                            Confirmar contraseña
                        </span>
                        <input
                            required
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1.5 w-full border border-steel-800/15 rounded-lg px-3 py-2.5 text-sm"
                        />
                    </label>

                    {error && <p className="text-sm text-signal-dark">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-signal text-white font-semibold px-6 py-3 rounded-lg hover:bg-signal-dark transition-colors disabled:opacity-60"
                    >
                        {loading ? 'Guardando...' : 'Guardar y continuar'}
                    </button>
                </form>

                <button
                    onClick={signOut}
                    className="mt-4 text-xs uppercase tracking-wide text-steel-500 hover:text-signal transition-colors"
                >
                    Cerrar sesion
                </button>
            </div>
        </div>
    );
}