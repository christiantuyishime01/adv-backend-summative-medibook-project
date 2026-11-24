const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });
  redisClient.on('error', (error) => {
    console.error('Redis error:', error.message); });

let connectPromise;

async function connectRedis() {
  if (redisClient.isReady) return redisClient;

  if (!connectPromise) {
    connectPromise = redisClient.connect().catch((error) => {
        connectPromise = null; 
        throw error; }); }
        
        await connectPromise;
        return redisClient; }

module.exports = { redisClient, connectRedis };