import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }
    return transporter;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Sends the company a notification email for a new quote request.
// Silently skips (with a console warning) if email isn't configured yet,
// and never throws - a missing/broken email setup should not block the
// quote from being saved and shown in the panel.
export async function sendQuoteRequestEmail(request) {
    const companyEmail = process.env.COMPANY_EMAIL;

    if (!companyEmail || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.warn('Email no configurado (falta COMPANY_EMAIL, SMTP_USER o SMTP_PASSWORD); se omite el correo.');
        return;
    }

    const html = `
    <h2>Nueva solicitud de cotizacion</h2>
    <p><strong>Nombre:</strong> ${escapeHtml(request.full_name)}</p>
    <p><strong>Correo:</strong> ${escapeHtml(request.email)}</p>
    <p><strong>Telefono:</strong> ${escapeHtml(request.phone)}</p>
    ${request.company_name ? `<p><strong>Empresa:</strong> ${escapeHtml(request.company_name)}</p>` : ''}
    ${request.service_type ? `<p><strong>Tipo de servicio:</strong> ${escapeHtml(request.service_type)}</p>` : ''}
    <p><strong>Descripcion:</strong></p>
    <p>${escapeHtml(request.description).replace(/\n/g, '<br>')}</p>
  `;

    try {
        await getTransporter().sendMail({
            from: `"Insulog - Sitio web" <${process.env.SMTP_USER}>`,
            to: companyEmail,
            replyTo: request.email,
            subject: `Nueva cotizacion de ${request.full_name}`,
            html,
        });
    } catch (err) {
        console.error('Error enviando el correo de notificacion de cotizacion:', err.message);
    }
}

// Sends the user a link to reset their password. Unlike the quote email,
// this one DOES throw on failure, since the caller needs to know whether
// the link actually went out before telling the user to check their inbox.
export async function sendPasswordResetEmail(user, token) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        throw new Error('Email no configurado (falta SMTP_USER o SMTP_PASSWORD)');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/restablecer/${token}`;

    const html = `
    <h2>Restablecer contraseña - Insulog</h2>
    <p>Hola ${escapeHtml(user.full_name)},</p>
    <p>Recibimos una solicitud para restablecer su contraseña. Este enlace es valido por 1 hora:</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p>Si usted no solicito esto, puede ignorar este correo.</p>
  `;

    await getTransporter().sendMail({
        from: `"Insulog - Cuentas" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Restablecer su contraseña de Insulog',
        html,
    });
}