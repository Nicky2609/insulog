import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';
import {
    AuthShell,
    CampoTexto,
    BotonPrincipal,
    MensajeError,
    MensajeExito,
} from '../components/common/FormShell';

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
        <div className="min-h-screen flex flex-col bg-steel-900">
            <PublicHeader />

            <AuthShell
                eyebrow="Acceso"
                titulo="Recuperar contraseña"
                descripcion="Escriba el correo de su cuenta y le enviaremos un enlace para crear una contraseña nueva."
                pie={
                    <Link to="/ingresar" className="text-sm font-semibold text-blueprint-bright hover:underline">
                        &larr; Volver a ingresar
                    </Link>
                }
            >
                {status === 'sent' ? (
                    <MensajeExito titulo="Revise su correo">
                        Si el correo <span className="font-semibold text-steel-900">{email}</span> tiene una cuenta,
                        le enviamos un enlace para restablecer la contraseña. El enlace es valido por 1 hora.
                    </MensajeExito>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <CampoTexto
                            label="Correo electronico"
                            type="email"
                            value={email}
                            onChange={setEmail}
                            autoComplete="username"
                            required
                        />

                        <MensajeError texto={error} />

                        <BotonPrincipal loading={status === 'sending'} textoCargando="Enviando...">
                            Enviar enlace
                        </BotonPrincipal>
                    </form>
                )}
            </AuthShell>

            <PublicFooter />
        </div>
    );
}