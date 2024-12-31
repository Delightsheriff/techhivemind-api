import { logger } from "../utils/logger";
import sendEmail from "../utils/sendEmail";

export const sendOTPEmail = async (email: string, otp: string) => {
  try {
    await sendEmail({
      to: email,
      subject: "Email Verification OTP",
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-radius: 5px;">
        <tr>
            <td style="padding: 20px;">
                <h1 style="color: #2c3e50; text-align: center;">TechHiveMind</h1>
                <h2 style="color: #3498db; text-align: center;">Email Verification OTP</h2>
                <p style="font-size: 16px;">Hello,</p>
                <p style="font-size: 16px;">Your One-Time Password (OTP) for email verification is:</p>
                <p style="font-size: 24px; font-weight: bold; text-align: center; color: #2c3e50; background-color: #ecf0f1; padding: 10px; border-radius: 5px;">${otp}</p>
                <p style="font-size: 16px;">This OTP is valid for 10 minutes. Please do not share this code with anyone.</p>
                <p style="font-size: 16px;">If you didn't request this OTP, please ignore this email.</p>
                <p style="font-size: 16px;">Best regards,<br>The TechHiveMind Team</p>
            </td>
        </tr>
    </table>
</div>`,
    });

    logger.info(`OTP email sent to ${email}`);
  } catch (error) {
    logger.error("Error sending OTP email:", error);
    throw new Error("Error sending OTP email");
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    await sendEmail({
      to: email,
      subject: "Welcome to TechHiveMind",
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-radius: 5px;">
          <tr>
              <td style="padding: 20px;">
                  <h1 style="color: #2c3e50; text-align: center;">TechHiveMind</h1>
                  <h2 style="color: #3498db; text-align: center;">Welcome to TechHiveMind</h2>
                  <p style="font-size: 16px;">Hello ${name},</p>
                  <p style="font-size: 16px;">Welcome to TechHiveMind! We are excited to have you on board.</p>
                  <p style="font-size: 16px;">If you have any questions or need assistance, feel free to reach out to us.</p>
                  <p style="font-size: 16px;">Best regards,<br>The TechHiveMind Team</p>
                  </td>
                  </tr>
                  </table>
                  </div>`,
    });

    logger.info(`Welcome email sent to ${email}`);
  } catch (error) {
    logger.error("Error sending welcome email:", error);
    throw new Error("Error sending welcome email");
  }
};


export const sendWelcomeVendor = async (email: string, name: string) => {
  try {
    await sendEmail({
      to: email,
      subject: "Welcome to TechHiveMind",
      html: `
     <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-radius: 5px;">
    <tr>
      <td style="padding: 20px;">
        <h1 style="color: #2c3e50; text-align: center;">TechHiveMind</h1>
        <h2 style="color: #3498db; text-align: center;">Welcome to TechHiveMind as a Vendor!</h2>
        <p style="font-size: 16px;">Hello ${name},</p>
        <p style="font-size: 16px;">We are thrilled to welcome you as a new vendor on our platform! This is an exciting journey, and we're here to help you every step of the way.</p>
        <p style="font-size: 16px;">If you have any questions, need assistance, or want to explore resources to maximize your success, please don't hesitate to reach out.</p>
        <p style="font-size: 16px;">Best regards,<br>The TechHiveMind Team</p>
      </td>
    </tr>
  </table>
</div>`,
    });

    logger.info(`Welcome email sent to ${email}`);
  } catch (error) {
    logger.error("Error sending welcome email:", error);
    throw new Error("Error sending welcome email");
  }
};