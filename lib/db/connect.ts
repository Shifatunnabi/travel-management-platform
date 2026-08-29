import mongoose from "mongoose";
import { env } from "@/lib/env";

/**
 * Next dev reloads modules on every save. Without a global cache each reload
 * opens a fresh connection pool and Atlas eventually refuses new connections.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  __tofizaMongoose?: MongooseCache;
};

const cache: MongooseCache = (globalWithMongoose.__tofizaMongoose ??= {
  conn: null,
  promise: null,
});

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  cache.promise ??= mongoose
    .connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    })
    .then((m) => {
      // Registering every model here guarantees `populate()` works no matter
      // which model a given route imported first.
      void import("@/lib/models");
      return m;
    });

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}

/** Runs `fn` inside a transaction. Atlas replica sets support these; standalone mongod does not. */
export async function withTransaction<T>(
  fn: (session: mongoose.ClientSession) => Promise<T>,
): Promise<T> {
  const conn = await connectDB();
  const session = await conn.startSession();
  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result!;
  } finally {
    await session.endSession();
  }
}
