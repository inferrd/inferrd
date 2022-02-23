import redis from 'async-redis'

const client = redis.createClient(process.env.REDIS_URL)

export async function cachedValue<T>(id: string, fetcher: () => Promise<T>, expiry: number = 60): Promise<T> {
  const cachedValue = await client.get(id)

  if(cachedValue) {
    return JSON.parse(cachedValue as any as string) as T
  }

  const value: T = await fetcher()

  await client.setex(id, expiry, JSON.stringify(value))

  return value
}

export async function invalidateCachedValue(id: string): Promise<void> {
  await client.del(id)
}

export default client