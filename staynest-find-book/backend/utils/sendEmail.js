const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Email options
  const mailOptions = {
    from: `"StayNest" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent: ${info.messageId}`);
  return info;
};

// Email templates
const emailTemplates = {
  // OTP Verification
  otpVerification: (otp, name) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4F46E5;">Welcome to StayNest, ${name}!</h2>
        <p>Thank you for registering. Please verify your email address using the OTP below:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">This is an automated message from StayNest. Please do not reply.</p>
      </div>
    `;
  },

  // Booking Confirmation
  bookingConfirmation: (booking, property, student) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4F46E5;">Booking Confirmed! 🎉</h2>
        <p>Dear ${student.name},</p>
        <p>Your booking at <strong>${property.name}</strong> has been confirmed!</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Property:</strong> ${property.name}</p>
          <p><strong>Room Type:</strong> ${booking.roomType}</p>
          <p><strong>Move-in Date:</strong> ${new Date(booking.moveInDate).toLocaleDateString()}</p>
          <p><strong>Booking Amount:</strong> ₹${booking.bookingAmount}</p>
          <p><strong>Address:</strong> ${property.address}</p>
        </div>
        <p>Please keep this email for your records.</p>
        <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">StayNest - Find your perfect stay!</p>
      </div>
    `;
  },

  // Booking Request (for landlord)
  bookingRequest: (booking, property, student) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4F46E5;">New Booking Request! 📋</h2>
        <p>You have received a new booking request for your property.</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Student:</strong> ${student.name}</p>
          <p><strong>Email:</strong> ${student.email}</p>
          <p><strong>Phone:</strong> ${student.phone}</p>
          <p><strong>Property:</strong> ${property.name}</p>
          <p><strong>Room Type:</strong> ${booking.roomType}</p>
          <p><strong>Move-in Date:</strong> ${new Date(booking.moveInDate).toLocaleDateString()}</p>
        </div>
        <p>Please login to your dashboard to accept or reject this booking.</p>
        <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">StayNest - Find your perfect stay!</p>
      </div>
    `;
  },

  // Booking Status Update
  bookingStatusUpdate: (booking, property, student, status) => {
    const statusMessages = {
      confirmed: 'has been confirmed ✅',
      rejected: 'has been rejected ❌',
      cancelled: 'has been cancelled ❌',
      completed: 'has been marked as completed ✅',
    };

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4F46E5;">Booking Status Update</h2>
        <p>Dear ${student.name},</p>
        <p>Your booking at <strong>${property.name}</strong> ${statusMessages[status] || 'has been updated'}.</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Property:</strong> ${property.name}</p>
          <p><strong>Room Type:</strong> ${booking.roomType}</p>
          <p><strong>Move-in Date:</strong> ${new Date(booking.moveInDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${status.toUpperCase()}</p>
        </div>
        <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">StayNest - Find your perfect stay!</p>
      </div>
    `;
  },
};

module.exports = { sendEmail, emailTemplates };