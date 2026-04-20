import nodemailer from "nodemailer";

/**
 * Email service for sending notifications
 * Uses environment variables for configuration
 */

// Initialize transporter (using test account for development)
let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  // For development/testing, use ethereal email
  // For production, configure with your email provider
  if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Use test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const transporter = await getTransporter();
    const from = process.env.EMAIL_FROM || "noreply@chemistry-lab.com";

    const info = await transporter.sendMail({
      from,
      ...options,
    });

    console.log("Email sent:", info.messageId);

    // For development, log preview URL
    if (!process.env.EMAIL_HOST) {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Send loan approval email
 */
export async function sendLoanApprovalEmail(
  userEmail: string,
  userName: string,
  experimentTitle: string,
  withdrawalDate: Date,
  returnDate: Date
) {
  const html = `
    <h2>Empréstimo Aprovado!</h2>
    <p>Olá ${userName},</p>
    <p>Seu empréstimo foi <strong>aprovado</strong>!</p>
    <p><strong>Detalhes do Empréstimo:</strong></p>
    <ul>
      <li><strong>Experimento:</strong> ${experimentTitle}</li>
      <li><strong>Data de Retirada:</strong> ${withdrawalDate.toLocaleDateString("pt-BR")}</li>
      <li><strong>Data de Devolução:</strong> ${returnDate.toLocaleDateString("pt-BR")}</li>
    </ul>
    <p>Compareça no laboratório na data agendada para retirar o kit.</p>
    <p>Obrigado!</p>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Empréstimo Aprovado - ${experimentTitle}`,
    html,
    text: `Seu empréstimo de ${experimentTitle} foi aprovado para ${withdrawalDate.toLocaleDateString("pt-BR")} até ${returnDate.toLocaleDateString("pt-BR")}`,
  });
}

/**
 * Send loan rejection email
 */
export async function sendLoanRejectionEmail(
  userEmail: string,
  userName: string,
  experimentTitle: string,
  reason?: string
) {
  const html = `
    <h2>Empréstimo Rejeitado</h2>
    <p>Olá ${userName},</p>
    <p>Infelizmente, seu empréstimo foi <strong>rejeitado</strong>.</p>
    <p><strong>Experimento:</strong> ${experimentTitle}</p>
    ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ""}
    <p>Entre em contato com o laboratório para mais informações.</p>
    <p>Obrigado!</p>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Empréstimo Rejeitado - ${experimentTitle}`,
    html,
    text: `Seu empréstimo de ${experimentTitle} foi rejeitado. ${reason ? `Motivo: ${reason}` : ""}`,
  });
}

/**
 * Send return reminder email
 */
export async function sendReturnReminderEmail(
  userEmail: string,
  userName: string,
  experimentTitle: string,
  returnDate: Date
) {
  const daysUntilReturn = Math.ceil(
    (returnDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const html = `
    <h2>Lembrete de Devolução</h2>
    <p>Olá ${userName},</p>
    <p>Este é um lembrete de que você tem um empréstimo que vence em breve.</p>
    <p><strong>Detalhes:</strong></p>
    <ul>
      <li><strong>Experimento:</strong> ${experimentTitle}</li>
      <li><strong>Data de Devolução:</strong> ${returnDate.toLocaleDateString("pt-BR")}</li>
      <li><strong>Dias Restantes:</strong> ${daysUntilReturn}</li>
    </ul>
    <p>Por favor, devolva o kit na data agendada.</p>
    <p>Obrigado!</p>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Lembrete de Devolução - ${experimentTitle}`,
    html,
    text: `Lembrete: Você tem ${daysUntilReturn} dias para devolver ${experimentTitle}`,
  });
}

/**
 * Send return confirmation email
 */
export async function sendReturnConfirmationEmail(
  userEmail: string,
  userName: string,
  experimentTitle: string,
  returnDate: Date
) {
  const html = `
    <h2>Devolução Confirmada</h2>
    <p>Olá ${userName},</p>
    <p>A devolução do seu empréstimo foi <strong>confirmada</strong>.</p>
    <p><strong>Detalhes:</strong></p>
    <ul>
      <li><strong>Experimento:</strong> ${experimentTitle}</li>
      <li><strong>Data de Devolução:</strong> ${returnDate.toLocaleDateString("pt-BR")}</li>
    </ul>
    <p>Obrigado por usar nossos serviços!</p>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Devolução Confirmada - ${experimentTitle}`,
    html,
    text: `Sua devolução de ${experimentTitle} foi confirmada em ${returnDate.toLocaleDateString("pt-BR")}`,
  });
}
