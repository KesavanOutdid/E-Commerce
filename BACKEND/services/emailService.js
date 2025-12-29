const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || "info@outdidunified.com",
        pass: process.env.EMAIL_PASS || "yylh zjwo psvr slqb",
    },
});

const verifyEmailConnection = async () => {
    try {
        await transporter.verify();
        logger.info('Email service is ready to send emails');
        return true;
    } catch (error) {
        logger.error('Email service connection error:', error);
        return false;
    }
};

const sendEmail = async (to, subject, html, text = '') => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || "info@outdidunified.com",
            to,
            subject,
            html,
            text
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error(`Failed to send email to ${to}:`, error);
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

module.exports = {
    transporter,
    verifyEmailConnection,
    sendEmail,
    sendOrderConfirmation,
    sendPaymentConfirmation,
    sendOrderStatusUpdate
};
