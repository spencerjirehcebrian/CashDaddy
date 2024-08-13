export interface ICacheService {
  set(key: string, value: string, expiration?: number): Promise<void>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<void>;
  setex(key: string, seconds: number, value: string): Promise<void>;
  hset(key: string, field: string, value: string): Promise<void>;
  hget(key: string, field: string): Promise<string | undefined>;
  hgetall(key: string): Promise<Record<string, string>>;
  hdel(key: string, field: string): Promise<void>;
  hsetex(key: string, seconds: number, fields: Record<string, string>): Promise<void>;
  keys(pattern: string): Promise<string[]>;
}
