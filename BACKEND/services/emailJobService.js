const Queue = require('bull');
const logger = require('../utils/logger');
const { sendEmail, sendOrderConfirmation, sendPaymentConfirmation, sendOrderStatusUpdate } = require('./emailService');

const emailQueue = new Queue('email-queue', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined
    }
});

emailQueue.process('send-email', async (job) => {
    const { to, subject, html, text } = job.data;
    logger.info(`Processing email job ${job.id} to ${to}`);
    return await sendEmail(to, subject, html, text);
});

emailQueue.process('order-confirmation', async (job) => {
    const { userEmail, orderDetails } = job.data;
    logger.info(`Processing order confirmation email job ${job.id}`);
    return await sendOrderConfirmation(userEmail, orderDetails);
});

emailQueue.process('payment-confirmation', async (job) => {
    const { userEmail, paymentDetails } = job.data;
    logger.info(`Processing payment confirmation email job ${job.id}`);
    return await sendPaymentConfirmation(userEmail, paymentDetails);
});

emailQueue.process('order-status-update', async (job) => {
    const { userEmail, orderId, status } = job.data;
    logger.info(`Processing order status update email job ${job.id}`);
    return await sendOrderStatusUpdate(userEmail, orderId, status);
});

emailQueue.on('completed', (job, result) => {
    logger.info(`Email job ${job.id} completed successfully`);
});

emailQueue.on('failed', (job, err) => {
    logger.error(`Email job ${job.id} failed:`, err);
});

const addEmailToQueue = async (to, subject, html, text = '') => {
    return await emailQueue.add('send-email', { to, subject, html, text }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        }
    });
};

const addOrderConfirmationToQueue = async (userEmail, orderDetails) => {
    return await emailQueue.add('order-confirmation', { userEmail, orderDetails }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        }
    });
};

const addPaymentConfirmationToQueue = async (userEmail, paymentDetails) => {
    return await emailQueue.add('payment-confirmation', { userEmail, paymentDetails }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        }
    });
};

const addOrderStatusUpdateToQueue = async (userEmail, orderId, status) => {
    return await emailQueue.add('order-status-update', { userEmail, orderId, status }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        }
    });
};

const startEmailJobService = async () => {
    logger.info('Email job service started and ready to process emails');
    return emailQueue;
};

module.exports = {
    emailQueue,
    addEmailToQueue,
    addOrderConfirmationToQueue,
    addPaymentConfirmationToQueue,
    addOrderStatusUpdateToQueue,
    startEmailJobService
};
