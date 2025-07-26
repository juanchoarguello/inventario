export async function sendEmail(to: string, subject: string, html: string) {
  // En desarrollo, solo logueamos el email
  console.log("📧 EMAIL ENVIADO:")
  console.log("Para:", to)
  console.log("Asunto:", subject)
  console.log("Contenido:", html)
  console.log("=" * 50)

  // Simular delay de envío
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // En producción, aquí usarías un servicio real:
  /*
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'AutoParts Pro <noreply@autoparts.com>',
      to: [to],
      subject: subject,
      html: html,
    }),
  });
  */

  return { success: true, messageId: `sim_${Date.now()}` }
}

export function generatePasswordResetEmail(name: string, resetLink: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Recuperar Contraseña - AutoParts Pro</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔧 AutoParts Pro</h1>
            </div>
            <div class="content">
                <h2>Hola ${name},</h2>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en AutoParts Pro.</p>
                <p>Si fuiste tú quien solicitó este cambio, haz clic en el siguiente botón:</p>
                <a href="${resetLink}" class="button">Restablecer Contraseña</a>
                <p>Este enlace expirará en 1 hora por seguridad.</p>
                <p>Si no solicitaste este cambio, puedes ignorar este email de forma segura.</p>
                <hr>
                <p><strong>Consejos de seguridad:</strong></p>
                <ul>
                    <li>Nunca compartas tu contraseña con nadie</li>
                    <li>Usa una contraseña única y segura</li>
                    <li>Cierra sesión cuando uses computadoras públicas</li>
                </ul>
            </div>
            <div class="footer">
                <p>© 2024 AutoParts Pro - Sistema de Inventario</p>
                <p>Este es un email automático, no respondas a este mensaje.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

export function generateWelcomeEmail(name: string, username: string, verificationLink: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Bienvenido a AutoParts Pro</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .info-box { background: #e0f2fe; padding: 15px; border-left: 4px solid #0284c7; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 ¡Bienvenido a AutoParts Pro!</h1>
            </div>
            <div class="content">
                <h2>Hola ${name},</h2>
                <p>¡Tu cuenta ha sido creada exitosamente en AutoParts Pro!</p>
                
                <div class="info-box">
                    <strong>Detalles de tu cuenta:</strong><br>
                    👤 Usuario: <strong>${username}</strong><br>
                    📧 Email: Verificación pendiente
                </div>

                <p>Para completar el registro, por favor verifica tu dirección de email:</p>
                <a href="${verificationLink}" class="button">Verificar Email</a>

                <h3>🚀 ¿Qué puedes hacer ahora?</h3>
                <ul>
                    <li>📦 Gestionar inventario de partes automotrices</li>
                    <li>🔍 Buscar y filtrar partes por categoría</li>
                    <li>📊 Ver estadísticas del inventario</li>
                    <li>⚠️ Recibir alertas de stock bajo</li>
                </ul>

                <h3>💡 Primeros pasos:</h3>
                <ol>
                    <li>Verifica tu email haciendo clic en el botón de arriba</li>
                    <li>Inicia sesión en la aplicación</li>
                    <li>Explora el dashboard principal</li>
                    <li>Agrega tu primera parte al inventario</li>
                </ol>
            </div>
            <div class="footer">
                <p>© 2024 AutoParts Pro - Sistema de Inventario</p>
                <p>¿Necesitas ayuda? Contacta al administrador del sistema.</p>
            </div>
        </div>
    </body>
    </html>
  `
}
