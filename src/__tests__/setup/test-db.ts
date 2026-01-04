import { newDb, IMemoryDb } from 'pg-mem';
import { Pool, QueryResult, QueryResultRow } from 'pg';

let db: IMemoryDb;
let testPool: typeof Pool;

export function setupTestDb(): IMemoryDb {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  
  db = newDb();
  
  db.public.registerFunction({
    name: 'current_database',
    implementation: () => 'test_db',
  });

  db.public.registerFunction({
    name: 'version',
    implementation: () => 'PostgreSQL 14.0 (pg-mem)',
  });

  testPool = db.adapters.createPg().Pool;

  return db;
}

export async function initializeSchema(db: IMemoryDb): Promise<void> {
  await db.public.none(`
    CREATE TABLE IF NOT EXISTS user (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP
    );
  `);

  await db.public.none(`
    CREATE TABLE IF NOT EXISTS car (
      id SERIAL PRIMARY KEY,
      brand VARCHAR(100) NOT NULL,
      model VARCHAR(100) NOT NULL,
      year INTEGER NOT NULL,
      color VARCHAR(50) NOT NULL,
      license_plate VARCHAR(20),
      owner VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.public.none(`
    CREATE TABLE IF NOT EXISTS mechanic (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      years_experience INTEGER NOT NULL,
      email VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.public.none(`
    CREATE TABLE IF NOT EXISTS service (
      id SERIAL PRIMARY KEY,
      car_id INTEGER NOT NULL REFERENCES car(id) ON DELETE CASCADE,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP,
      status VARCHAR(50) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.public.none(`
    CREATE TABLE IF NOT EXISTS service_mechanics (
      id SERIAL PRIMARY KEY,
      service_id INTEGER NOT NULL REFERENCES service(id) ON DELETE CASCADE,
      mechanic_id INTEGER NOT NULL REFERENCES mechanic(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(service_id, mechanic_id)
    );
  `);
}

export function getTestPool(): typeof Pool {
  return testPool;
}

export async function cleanDatabase(db: IMemoryDb): Promise<void> {
  await db.public.none('DELETE FROM service_mechanics');
  await db.public.none('DELETE FROM service');
  await db.public.none('DELETE FROM car');
  await db.public.none('DELETE FROM mechanic');
  await db.public.none('DELETE FROM user');
}

export async function mockQuery<T extends QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const pool = new testPool();
  return pool.query(text, params) as Promise<QueryResult<T>>;
}

export function createMockQueryFunction(poolConstructor: typeof Pool) {
  return async <T extends QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> => {
    const pool = new poolConstructor();
    return pool.query(text, params) as Promise<QueryResult<T>>;
  };
}

