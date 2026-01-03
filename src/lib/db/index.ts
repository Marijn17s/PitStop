import { Pool, QueryResult, QueryResultRow, PoolClient } from 'pg';

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'test') {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Use a singleton pattern in development to prevent multiple pools on hot reload
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const pool = globalForDb.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2, // Reduced for free tier database limits
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

pool.on('connect', async (client) => {
  await client.query('SET search_path = "PitStop_direction"');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Note: Cannot use process.exit() in Edge Runtime
  // The application will need to handle reconnection
});

export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', { text, error });
    throw error;
  }
}

export async function getClient() {
  return await pool.connect();
}

export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Graceful shutdown
export async function closePool() {
  await pool.end();
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await closePool();
  });
  process.on('SIGTERM', async () => {
    await closePool();
  });
}

export default pool;

