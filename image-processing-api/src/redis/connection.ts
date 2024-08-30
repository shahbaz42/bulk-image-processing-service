import Redis, { RedisOptions } from 'ioredis';
import { REDIS_HOST, REDIS_PORT } from '../config';

const redisConfig: RedisOptions = {
  port: Number(REDIS_PORT),
  host: REDIS_HOST,
  maxRetriesPerRequest: null,
};

const redisConnection: Redis = new Redis(redisConfig);

export default redisConnection;
