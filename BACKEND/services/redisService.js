const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
    try {
        redisClient = redis.createClient({
            socket: {
                host: process.env.REDIS_HOST || '127.0.0.1',
                port: process.env.REDIS_PORT || 6379,
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        logger.error('Redis max retries reached. Disabling Redis.');
                        return false; // Stop retrying
                    }
                    return Math.min(retries * 100, 3000);
                }
            },
            password: process.env.REDIS_PASSWORD || undefined
        });

        redisClient.on('connect', () => {
            logger.info('Redis client connecting...');
        });

        redisClient.on('error', (err) => {
            // Only log errors if not a connection refused (to avoid spam)
            if (err.code !== 'ECONNREFUSED') {
                logger.error('Redis client error:', err);
            }
        });

        redisClient.on('ready', () => {
            logger.info('Redis client is ready to use');
        });

        await redisClient.connect();
        return redisClient;
    } catch (error) {
        logger.error('Failed to connect to Redis initially');
        throw error;
    }
};

const isClientReady = () => {
    return redisClient && redisClient.isOpen && redisClient.isReady;
};

const getRedisClient = () => {
    if (!redisClient) {
        return null;
    }
    return redisClient;
};

const setCache = async (key, value, expiryInSeconds = 3600) => {
    try {
        if (!isClientReady()) return false;
        const client = getRedisClient();
        await client.setEx(key, expiryInSeconds, JSON.stringify(value));
        return true;
    } catch (error) {
        return false;
    }
};

const getCache = async (key) => {
    try {
        if (!isClientReady()) return null;
        const client = getRedisClient();
        const data = await client.get(key);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        return null;
    }
};

const deleteCache = async (key) => {
    try {
        if (!isClientReady()) return false;
        const client = getRedisClient();
        await client.del(key);
        return true;
    } catch (error) {
        return false;
    }
};

const deleteCachePattern = async (pattern) => {
    try {
        if (!isClientReady()) return false;
        const client = getRedisClient();
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(keys);
        }
        return true;
    } catch (error) {
        return false;
    }
};

const generateUniqueId = async (prefix = 'id') => {
    try {
        const client = getRedisClient();
        const key = `${prefix}:counter`;
        const id = await client.incr(key);
        return `${prefix}_${id}`;
    } catch (error) {
        logger.error(`Failed to generate unique ID for prefix ${prefix}:`, error);
        return null;
    }
};

const setKeyWithId = async (prefix, id, value, expiryInSeconds = 3600) => {
    const key = `${prefix}:${id}`;
    return await setCache(key, value, expiryInSeconds);
};

const getKeyById = async (prefix, id) => {
    const key = `${prefix}:${id}`;
    return await getCache(key);
};

const deleteKeyById = async (prefix, id) => {
    const key = `${prefix}:${id}`;
    return await deleteCache(key);
};

const closeRedis = async () => {
    try {
        if (redisClient) {
            await redisClient.quit();
            logger.info('Redis connection closed');
        }
    } catch (error) {
        logger.error('Error closing Redis connection:', error);
    }
};

module.exports = {
    connectRedis,
    getRedisClient,
    setCache,
    getCache,
    deleteCache,
    deleteCachePattern,
    generateUniqueId,
    setKeyWithId,
    getKeyById,
    deleteKeyById,
    closeRedis
};
