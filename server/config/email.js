const nodemailer = require('nodemailer');

// Create transporter for sending emails
// For production, use SMTP settings from .env
// For development/testing, use Gmail or other email service
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || '',
    },
  });
};

const sendResetPasswordEmail = async (email, resetToken, resetUrl) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Thiên Sử Ký" <${process.env.EMAIL_USER || 'noreply@thiensuky.com'}>`,
      to: email,
      subject: 'Đặt lại mật khẩu - Thiên Sử Ký',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8B0000; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #8B0000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thiên Sử Ký</h1>
            </div>
            <div class="content">
              <h2>Đặt lại mật khẩu</h2>
              <p>Xin chào,</p>
              <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng click vào nút bên dưới để đặt lại mật khẩu:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
              </div>
              <p>Hoặc copy và paste link này vào trình duyệt:</p>
              <p style="word-break: break-all; color: #8B0000;">${resetUrl}</p>
              <p><strong>Link này sẽ hết hạn sau 1 giờ.</strong></p>
              <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
              <p>Trân trọng,<br>Đội ngũ Thiên Sử Ký</p>
            </div>
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Đặt lại mật khẩu - Thiên Sử Ký
        
        Xin chào,
        
        Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào link sau:
        ${resetUrl}
        
        Link này sẽ hết hạn sau 1 giờ.
        
        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        
        Trân trọng,
        Đội ngũ Thiên Sử Ký
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
};

module.exports = {
  sendResetPasswordEmail,
};
