const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const emailUser = process.env.EMAIL_USER || "info@outdidunified.com";
const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "465"),
    secure: process.env.EMAIL_SECURE !== "false",
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

const verifyEmailConnection = async () => {
    try {
        await transporter.verify();
        logger.info('Email service is ready to send emails');
        return true;
    } catch (error) {
        logger.warn('Email service connection warning (check EMAIL_USER / EMAIL_PASS in .env):', error.message);
        return false;
    }
};

const isAuthError = (errorMsg) => {
    return errorMsg && (
        errorMsg.includes('535') ||
        errorMsg.includes('Invalid login') ||
        errorMsg.includes('BadCredentials') ||
        errorMsg.includes('Username and Password not accepted')
    );
};

const sendEmail = async (to, subject, html, text = '') => {
    try {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'E-Commerce'}" <${emailUser}>`,
            to,
            subject,
            html,
            text
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        if (isAuthError(error.message)) {
            logger.warn(`Email authentication failed for ${to}. Please update EMAIL_PASS in BACKEND/.env with a valid Google App Password.`);
        } else {
            logger.error(`Failed to send email to ${to}:`, error.message);
        }
        return { success: false, error: error.message };
    }
};

const sendOrderConfirmation = async (userEmail, orderDetails) => {
    const subject = `Order Confirmation - #${orderDetails.orderId}`;
    const html = `
        <h1>Order Confirmation</h1>
        <p>Thank you for your order!</p>
        <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
        <p><strong>Total Amount:</strong> $${orderDetails.totalAmount}</p>
        <p><strong>Order Date:</strong> ${orderDetails.orderDate}</p>
        <h2>Items:</h2>
        <ul>
            ${orderDetails.items.map(item => `
                <li>${item.name} - Quantity: ${item.qty} - Price: $${item.price}</li>
            `).join('')}
        </ul>
        <p>We'll send you another email when your order ships.</p>
    `;
    return await sendEmail(userEmail, subject, html);
};

const sendPaymentConfirmation = async (userEmail, paymentDetails) => {
    const subject = `Payment Confirmation - Transaction #${paymentDetails.transactionId}`;
    const html = `
        <h1>Payment Received</h1>
        <p>Your payment has been successfully processed.</p>
        <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
        <p><strong>Amount:</strong> $${paymentDetails.amount}</p>
        <p><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</p>
        <p><strong>Date:</strong> ${paymentDetails.paymentDate}</p>
        <p>Thank you for your purchase!</p>
    `;
    return await sendEmail(userEmail, subject, html);
};

const sendOrderStatusUpdate = async (userEmail, orderId, status) => {
    const subject = `Order Status Update - #${orderId}`;
    const html = `
        <h1>Order Status Update</h1>
        <p>Your order status has been updated.</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>New Status:</strong> ${status.toUpperCase()}</p>
        <p>You can track your order in your account dashboard.</p>
    `;
    return await sendEmail(userEmail, subject, html);
};

const sendEmailWithRetry = async (to, subject, html, text = '', retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const result = await sendEmail(to, subject, html, text);
        if (result.success) {
            return result;
        }
        
        // Don't retry if credentials are wrong
        if (result.error && isAuthError(result.error)) {
            break;
        }

        if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
    
    return { success: false, error: 'Email send failed' };
};

const sendOtpEmail = async (to, otpCode, purpose = 'verification') => {
    const subject = purpose === 'reset' ? 'Password Reset OTP' : 'Registration OTP';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Your OTP Code</h1>
            <p>Hello,</p>
            <p>Your OTP for ${purpose === 'reset' ? 'password reset' : 'registration'} is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                <h2 style="color: #007bff; letter-spacing: 8px; font-size: 32px; margin: 0;">${otpCode}</h2>
            </div>
            <p><strong>This OTP will expire in 3 minutes.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
    `;
    const text = `Your OTP is: ${otpCode}. It will expire in 3 minutes.`;
    
    sendEmailWithRetry(to, subject, html, text).catch(err => {
        logger.error('OTP email background send error:', err);
    });
};

const sendWelcomeEmail = async (to, firstName) => {
    const subject = 'Welcome to E-Commerce!';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Welcome to E-Commerce, ${firstName}!</h1>
            <p>Thank you for registering with us.</p>
            <p>Your account has been successfully created. You can now:</p>
            <ul>
                <li>Browse our products</li>
                <li>Add items to your cart</li>
                <li>Place orders</li>
                <li>Track your deliveries</li>
            </ul>
            <p>Start shopping now and enjoy exclusive deals!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
    `;
    const text = `Welcome to E-Commerce, ${firstName}! Your account has been successfully created.`;
    
    sendEmailWithRetry(to, subject, html, text).catch(err => {
        logger.error('Welcome email background send error:', err);
    });
};

const sendLoginNotification = async (to, firstName, loginDetails) => {
    const subject = 'New Login to Your Account';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">New Login Detected</h1>
            <p>Hello ${firstName},</p>
            <p>We detected a new login to your account:</p>
            <ul>
                <li><strong>Time:</strong> ${loginDetails.time}</li>
                <li><strong>IP Address:</strong> ${loginDetails.ip || 'Unknown'}</li>
                <li><strong>Device:</strong> ${loginDetails.device || 'Unknown'}</li>
            </ul>
            <p>If this was you, you can safely ignore this email.</p>
            <p>If you don't recognize this login, please reset your password immediately.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
    `;
    const text = `New login detected to your account at ${loginDetails.time}. If this wasn't you, please reset your password.`;
    
    sendEmailWithRetry(to, subject, html, text).catch(err => {
        logger.error('Login notification background send error:', err);
    });
};

module.exports = {
    transporter,
    verifyEmailConnection,
    sendEmail,
    sendEmailWithRetry,
    sendOrderConfirmation,
    sendPaymentConfirmation,
    sendOrderStatusUpdate,
    sendOtpEmail,
    sendWelcomeEmail,
    sendLoginNotification
};
