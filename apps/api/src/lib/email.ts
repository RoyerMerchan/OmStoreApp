import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

async function getAdminEmails(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'MANAGER'] }, isActive: true },
    select: { email: true },
  })
  return admins.map((a) => a.email)
}

interface OrderEmailData {
  orderId: string
  orderNumber: string
  clientName: string
  clientEmail: string
  total: string
  paymentMethod: string
  paymentReference?: string
  items: Array<{ name: string; quantity: number; price: string }>
}

export async function sendNewOrderAlertToAdmins(order: OrderEmailData) {
  const adminEmails = await getAdminEmails()
  if (!adminEmails.length) return

  const itemsList = order.items
    .map((i) => `• ${i.name} x${i.quantity} — ${i.price}`)
    .join('\n')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">🛒 Nueva orden online #${order.orderNumber}</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
        <tr>
          <td style="padding: 8px 0; color: #666;">Cliente</td>
          <td style="padding: 8px 0; font-weight: 600;">${order.clientName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Email</td>
          <td style="padding: 8px 0;">${order.clientEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Total</td>
          <td style="padding: 8px 0; font-weight: 600; font-size: 1.2em;">${order.total}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Método de pago</td>
          <td style="padding: 8px 0;">${order.paymentMethod}</td>
        </tr>
        ${order.paymentReference ? `
        <tr>
          <td style="padding: 8px 0; color: #666;">Referencia</td>
          <td style="padding: 8px 0;">${order.paymentReference}</td>
        </tr>
        ` : ''}
      </table>
      <h3 style="color: #1a1a1a; margin-top: 1.5rem;">Productos</h3>
      <pre style="background: #f5f5f5; padding: 1rem; border-radius: 8px;">${itemsList}</pre>
      <a href="${process.env.ADMIN_URL || 'http://localhost:5173'}/pedidos/${order.orderId}" 
         style="display: inline-block; background: #1a1a1a; color: #fff; padding: 12px 24px; 
                text-decoration: none; border-radius: 6px; margin-top: 1rem;">
        Ver pedido en admin
      </a>
    </div>
  `

  const transporter = getTransporter()
  const from = process.env.SMTP_FROM || 'OmStore <noreply@omstore.com>'

  await transporter.sendMail({
    from,
    to: adminEmails.join(', '),
    subject: `[OmStore] Nueva orden #${order.orderNumber}`,
    html,
  })
}

export async function sendOrderConfirmationToClient(
  clientEmail: string,
  clientName: string,
  orderNumber: string,
  total: string,
  paymentMethod: string,
  paymentReference?: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">¡Gracias por tu compra, ${clientName}!</h2>
      <p style="color: #666;">Tu pedido <strong>#${orderNumber}</strong> ha sido confirmado y está siendo preparado.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
        <tr>
          <td style="padding: 8px 0; color: #666;">Pedido</td>
          <td style="padding: 8px 0; font-weight: 600;">#${orderNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Total pagado</td>
          <td style="padding: 8px 0; font-weight: 600; font-size: 1.2em;">${total}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Método</td>
          <td style="padding: 8px 0;">${paymentMethod}</td>
        </tr>
        ${paymentReference ? `
        <tr>
          <td style="padding: 8px 0; color: #666;">Referencia</td>
          <td style="padding: 8px 0;">${paymentReference}</td>
        </tr>
        ` : ''}
      </table>
      <p style="color: #666;">Te notificaremos cuando tu pedido esté listo para envío o retiro.</p>
      <p style="color: #999; font-size: 0.875rem; margin-top: 2rem;">— El equipo de OmStore</p>
    </div>
  `

  const transporter = getTransporter()
  const from = process.env.SMTP_FROM || 'OmStore <noreply@omstore.com>'

  await transporter.sendMail({
    from,
    to: clientEmail,
    subject: `Tu pedido #${orderNumber} ha sido confirmado - OmStore`,
    html,
  })
}
