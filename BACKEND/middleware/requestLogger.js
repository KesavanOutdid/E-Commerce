const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'api-requests.log');

const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    const originalSend = res.send;
    res.send = function(data) {
        res.send = originalSend;
        
        const responseTime = Date.now() - startTime;
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        let extraInfo = '';
        try {
            const responseData = typeof data === 'string' ? JSON.parse(data) : data;
            
            if (responseData.data?.otpCode) {
                extraInfo = ` | OTP: ${responseData.data.otpCode}`;
            }
            
            if (responseData.message) {
                extraInfo += ` | ${responseData.message}`;
            }
        } catch (e) {
            // Ignore parsing errors
        }
        
        const logEntry = `${timestamp} ${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime}ms)${extraInfo}\n`;
        
        console.log(logEntry.trim());
        
        fs.appendFileSync(logFilePath, logEntry);

        return res.send(data);
    };

    next();
};

module.exports = requestLogger;