import { createClient } from "redis";

const BUS = process.env.BOTBUS || "botbus";
const PORT = parseInt(process.env.BOTBUS_PORT as string) || 6379

export module Mem {
  const mem = createClient(PORT);

  export function table<T>(table: string) {
    return {
      set: set.bind(null, table) as <FT = T>(key: string, value: FT) => Promise<void>,
      get: get.bind(null, table) as <FT = T>(key: string) => Promise<FT | null>,
    };
  }

  export function set<T>(table: string, key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      mem.hset(`${BUS}.${table}`, key, JSON.stringify(value), (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  export function get<T>(table: string, key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      mem.hget(`${BUS}.${table}`, key, (err, res) => {
        if (err) return reject(err);
        if (res) resolve(JSON.parse(res) as T);
        else resolve(null);
      });
    });
  }
}
