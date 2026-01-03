import { query } from '../index';
import { Mechanic } from '@/types';

export async function getAllMechanics(): Promise<Mechanic[]> {
  const result = await query<Mechanic>(
    'SELECT * FROM mechanic ORDER BY last_name, first_name'
  );
  return result.rows;
}

export async function getMechanicById(id: number): Promise<Mechanic | null> {
  const result = await query<Mechanic>(
    'SELECT * FROM mechanic WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function createMechanic(data: {
  firstName: string;
  lastName: string;
  yearsExperience: number;
  email?: string;
}): Promise<Mechanic> {
  const result = await query<Mechanic>(
    `INSERT INTO mechanic (first_name, last_name, years_experience, email)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.firstName, data.lastName, data.yearsExperience, data.email || null]
  );
  return result.rows[0];
}

export async function updateMechanic(id: number, data: {
  firstName?: string;
  lastName?: string;
  yearsExperience?: number;
  email?: string;
}): Promise<Mechanic | null> {
  const mechanic = await getMechanicById(id);
  if (!mechanic) return null;

  const result = await query<Mechanic>(
    `UPDATE mechanic 
     SET first_name = $1, last_name = $2, years_experience = $3, 
         email = $4, updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING *`,
    [
      data.firstName ?? mechanic.first_name,
      data.lastName ?? mechanic.last_name,
      data.yearsExperience ?? mechanic.years_experience,
      data.email !== undefined ? data.email : mechanic.email,
      id
    ]
  );
  return result.rows[0];
}

export async function deleteMechanic(id: number): Promise<boolean> {
  const result = await query(
    'DELETE FROM mechanic WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function searchMechanics(searchTerm: string): Promise<Mechanic[]> {
  const result = await query<Mechanic>(
    `SELECT * FROM mechanic 
     WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1
     ORDER BY last_name, first_name`,
    [`%${searchTerm}%`]
  );
  return result.rows;
}

