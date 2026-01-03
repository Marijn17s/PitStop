import { query } from '../index';
import { User } from '@/types';

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM "PitStop_direction".users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM "PitStop_direction".users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  firstName: string,
  lastName: string
): Promise<User> {
  const result = await query<User>(
    `INSERT INTO "PitStop_direction".users (email, password_hash, first_name, last_name)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [email, passwordHash, firstName, lastName]
  );
  return result.rows[0];
}

export async function updateLastLogin(userId: number): Promise<void> {
  await query(
    'UPDATE "PitStop_direction".users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [userId]
  );
}

export async function getAllUsers(): Promise<User[]> {
  const result = await query<User>(
    'SELECT * FROM "PitStop_direction".users ORDER BY created_at DESC'
  );
  return result.rows;
}

