import Redis, { RedisOptions } from 'ioredis';


const redisConfig: RedisOptions = {
  port: 6379,
  host: '127.0.0.1',
  maxRetriesPerRequest: null
};

const redisConnection: Redis = new Redis(redisConfig);

export default redisConnection;