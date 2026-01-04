import { query } from '../index';
import { Car, CarWithServices, Service } from '@/types';

export async function getAllCars(): Promise<Car[]> {
  const result = await query<Car>(
    'SELECT * FROM "PitStop_direction".car ORDER BY created_at DESC'
  );
  return result.rows;
}

export async function getCarsPaginated(
  page: number = 1,
  pageSize: number = 10
): Promise<{ cars: Car[]; total: number; totalPages: number }> {
  const offset = (page - 1) * pageSize;

  const [dataResult, countResult] = await Promise.all([
    query<Car>(
      'SELECT * FROM "PitStop_direction".car ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [pageSize, offset]
    ),
    query<{ count: string }>('SELECT COUNT(*)::text as count FROM "PitStop_direction".car')
  ]);

  const total = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(total / pageSize);

  return {
    cars: dataResult.rows,
    total,
    totalPages,
  };
}

export async function searchCarsPaginated(
  searchTerm: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ cars: Car[]; total: number; totalPages: number }> {
  const offset = (page - 1) * pageSize;
  const searchPattern = `%${searchTerm}%`;

  const [dataResult, countResult] = await Promise.all([
    query<Car>(
      `SELECT * FROM "PitStop_direction".car 
       WHERE brand ILIKE $1 OR model ILIKE $1 OR owner ILIKE $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [searchPattern, pageSize, offset]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "PitStop_direction".car 
       WHERE brand ILIKE $1 OR model ILIKE $1 OR owner ILIKE $1`,
      [searchPattern]
    )
  ]);

  const total = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(total / pageSize);

  return {
    cars: dataResult.rows,
    total,
    totalPages,
  };
}

export async function getCarById(id: number): Promise<Car | null> {
  const result = await query<Car>(
    'SELECT * FROM "PitStop_direction".car WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function getCarWithServices(id: number): Promise<CarWithServices | null> {
  const car = await getCarById(id);
  if (!car) return null;

  const servicesResult = await query<Service>(
    'SELECT * FROM "PitStop_direction".service WHERE car_id = $1 ORDER BY start_date DESC LIMIT 10',
    [id]
  );

  return {
    ...car,
    services: servicesResult.rows
  };
}

export async function createCar(data: {
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate?: string;
  owner?: string;
}): Promise<Car> {
  const result = await query<Car>(
    `INSERT INTO "PitStop_direction".car (brand, model, year, color, license_plate, owner)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.brand, data.model, data.year, data.color, data.licensePlate || null, data.owner || null]
  );
  return result.rows[0];
}

export async function updateCar(id: number, data: {
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  owner?: string;
}): Promise<Car | null> {
  const car = await getCarById(id);
  if (!car) return null;

  const result = await query<Car>(
    `UPDATE "PitStop_direction".car 
     SET brand = $1, model = $2, year = $3, color = $4, 
         license_plate = $5, owner = $6, updated_at = CURRENT_TIMESTAMP
     WHERE id = $7
     RETURNING *`,
    [
      data.brand ?? car.brand,
      data.model ?? car.model,
      data.year ?? car.year,
      data.color ?? car.color,
      data.licensePlate !== undefined ? data.licensePlate : car.license_plate,
      data.owner !== undefined ? data.owner : car.owner,
      id
    ]
  );
  return result.rows[0];
}

export async function deleteCar(id: number): Promise<boolean> {
  const result = await query(
    'DELETE FROM "PitStop_direction".car WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function searchCars(searchTerm: string): Promise<Car[]> {
  const result = await query<Car>(
    `SELECT * FROM "PitStop_direction".car 
     WHERE brand ILIKE $1 OR model ILIKE $1 OR owner ILIKE $1
     ORDER BY created_at DESC`,
    [`%${searchTerm}%`]
  );
  return result.rows;
}

