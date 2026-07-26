const nodemailer = require("nodemailer");

/**
 * @desc    Send contact form message via email
 * @route   POST /api/v1/contact
 * @access  Public
 */
const sendContactEmail = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide all fields." });
    }

    // Configure Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email Layout Options
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `⚡ New IntelliViz Pro Inquiry from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-top: 0;">⚡ New Contact Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p><strong>Message:</strong></p>
          <p style="background: #ffffff; padding: 16px; border-radius: 6px; border: 1px solid #cbd5e1; white-space: pre-wrap;">${message}</p>
          <footer style="margin-top: 20px; font-size: 12px; color: #64748b;">
            Sent automatically via IntelliViz Pro Landing Page
          </footer>
        </div>
      `,
    };

    // Send Mail
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Message sent successfully to administrator email.",
    });
  } catch (error) {
    console.error("Nodemailer Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send email. Check backend configuration.",
    });
  }
};

module.exports = { sendContactEmail };
