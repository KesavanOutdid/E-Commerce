const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
    try {
        redisClient = redis.createClient({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            retry_strategy: (options) => {
                if (options.error && options.error.code === 'ECONNREFUSED') {
                    logger.error('Redis connection refused');
                    return new Error('Redis server refused the connection');
                }
                if (options.total_retry_time > 1000 * 60 * 60) {
                    return new Error('Redis retry time exhausted');
                }
                if (options.attempt > 10) {
                    return undefined;
                }
                return Math.min(options.attempt * 100, 3000);
            }
        });

        redisClient.on('connect', () => {
            logger.info('Redis client connected successfully');
        });

        redisClient.on('error', (err) => {
            logger.error('Redis client error:', err);
        });

        redisClient.on('ready', () => {
            logger.info('Redis client is ready to use');
        });

        redisClient.on('end', () => {
            logger.warn('Redis client disconnected');
        });

        await redisClient.connect();
        return redisClient;
    } catch (error) {
        logger.error('Failed to connect to Redis:', error);
        throw error;
    }
};

const getRedisClient = () => {
    if (!redisClient) {
        throw new Error('Redis client not initialized. Call connectRedis first.');
    }
    return redisClient;
};

const setCache = async (key, value, expiryInSeconds = 3600) => {
    try {
        const client = getRedisClient();
        await client.setEx(key, expiryInSeconds, JSON.stringify(value));
        logger.info(`Cache set for key: ${key}`);
        return true;
    } catch (error) {
        logger.error(`Failed to set cache for key ${key}:`, error);
        return false;
    }
};

const getCache = async (key) => {
    try {
        const client = getRedisClient();
        const data = await client.get(key);
        if (data) {
            logger.info(`Cache hit for key: ${key}`);
            return JSON.parse(data);
        }
        logger.info(`Cache miss for key: ${key}`);
        return null;
    } catch (error) {
        logger.error(`Failed to get cache for key ${key}:`, error);
        return null;
    }
};

const deleteCache = async (key) => {
    try {
        const client = getRedisClient();
        await client.del(key);
        logger.info(`Cache deleted for key: ${key}`);
        return true;
    } catch (error) {
        logger.error(`Failed to delete cache for key ${key}:`, error);
        return false;
    }
};

const deleteCachePattern = async (pattern) => {
    try {
        const client = getRedisClient();
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(keys);
            logger.info(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
        }
        return true;
    } catch (error) {
        logger.error(`Failed to delete cache pattern ${pattern}:`, error);
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
