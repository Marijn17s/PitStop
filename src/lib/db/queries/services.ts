import { query, transaction } from '../index';
import { Service, ServiceWithDetails, Car, Mechanic } from '@/types';

export async function getAllServices(): Promise<Service[]> {
  const result = await query<Service>(
    'SELECT * FROM "PitStop_direction".service ORDER BY start_date DESC'
  );
  return result.rows;
}

export async function getServiceById(id: number): Promise<Service | null> {
  const result = await query<Service>(
    'SELECT * FROM "PitStop_direction".service WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function getServiceWithDetails(id: number): Promise<ServiceWithDetails | null> {
  const service = await getServiceById(id);
  if (!service) return null;

  const carResult = await query<Car>(
    'SELECT * FROM "PitStop_direction".car WHERE id = $1',
    [service.car_id]
  );

  const mechanicsResult = await query<Mechanic>(
    `SELECT m.* FROM "PitStop_direction".mechanic m
     INNER JOIN "PitStop_direction".service_mechanics sm ON m.id = sm.mechanic_id
     WHERE sm.service_id = $1`,
    [id]
  );

  return {
    ...service,
    car: carResult.rows[0],
    mechanics: mechanicsResult.rows
  };
}

export async function createService(data: {
  carId: number;
  startDate: Date;
  endDate?: Date;
  status: string;
  notes?: string;
  mechanicIds: number[];
}): Promise<ServiceWithDetails> {
  return transaction(async (client) => {
    const serviceResult = await client.query(
      `INSERT INTO "PitStop_direction".service (car_id, start_date, end_date, status, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.carId, data.startDate, data.endDate || null, data.status, data.notes || null]
    );
    const service = serviceResult.rows[0];

    for (const mechanicId of data.mechanicIds) {
      await client.query(
        'INSERT INTO "PitStop_direction".service_mechanics (service_id, mechanic_id) VALUES ($1, $2)',
        [service.id, mechanicId]
      );
    }

    const carResult = await client.query('SELECT * FROM "PitStop_direction".car WHERE id = $1', [data.carId]);
    const mechanicsResult = await client.query(
      `SELECT m.* FROM "PitStop_direction".mechanic m
       INNER JOIN "PitStop_direction".service_mechanics sm ON m.id = sm.mechanic_id
       WHERE sm.service_id = $1`,
      [service.id]
    );

    return {
      ...service,
      car: carResult.rows[0],
      mechanics: mechanicsResult.rows
    };
  });
}

export async function updateService(id: number, data: {
  carId?: number;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  notes?: string;
  mechanicIds?: number[];
}): Promise<ServiceWithDetails | null> {
  const service = await getServiceById(id);
  if (!service) return null;

  return transaction(async (client) => {
    const serviceResult = await client.query(
      `UPDATE "PitStop_direction".service 
       SET car_id = $1, start_date = $2, end_date = $3, status = $4, 
           notes = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        data.carId ?? service.car_id,
        data.startDate ?? service.start_date,
        data.endDate !== undefined ? data.endDate : service.end_date,
        data.status ?? service.status,
        data.notes !== undefined ? data.notes : service.notes,
        id
      ]
    );
    const updatedService = serviceResult.rows[0];

    if (data.mechanicIds) {
      await client.query('DELETE FROM "PitStop_direction".service_mechanics WHERE service_id = $1', [id]);
      for (const mechanicId of data.mechanicIds) {
        await client.query(
          'INSERT INTO "PitStop_direction".service_mechanics (service_id, mechanic_id) VALUES ($1, $2)',
          [id, mechanicId]
        );
      }
    }

    const carResult = await client.query('SELECT * FROM "PitStop_direction".car WHERE id = $1', [updatedService.car_id]);
    const mechanicsResult = await client.query(
      `SELECT m.* FROM "PitStop_direction".mechanic m
       INNER JOIN "PitStop_direction".service_mechanics sm ON m.id = sm.mechanic_id
       WHERE sm.service_id = $1`,
      [id]
    );

    return {
      ...updatedService,
      car: carResult.rows[0],
      mechanics: mechanicsResult.rows
    };
  });
}

export async function deleteService(id: number): Promise<boolean> {
  const result = await query(
    'DELETE FROM "PitStop_direction".service WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getServicesByCarId(carId: number): Promise<Service[]> {
  const result = await query<Service>(
    'SELECT * FROM "PitStop_direction".service WHERE car_id = $1 ORDER BY start_date DESC',
    [carId]
  );
  return result.rows;
}

export async function getServicesByMechanicId(mechanicId: number): Promise<ServiceWithDetails[]> {
  const result = await query<Service>(
    `SELECT s.* FROM "PitStop_direction".service s
     INNER JOIN "PitStop_direction".service_mechanics sm ON s.id = sm.service_id
     WHERE sm.mechanic_id = $1
     ORDER BY s.start_date DESC`,
    [mechanicId]
  );

  const services: ServiceWithDetails[] = [];
  for (const service of result.rows) {
    const details = await getServiceWithDetails(service.id);
    if (details) services.push(details);
  }

  return services;
}

export async function getRecentServices(limit: number = 5): Promise<ServiceWithDetails[]> {
  const result = await query<Service>(
    'SELECT * FROM "PitStop_direction".service ORDER BY created_at DESC LIMIT $1',
    [limit]
  );

  const services: ServiceWithDetails[] = [];
  for (const service of result.rows) {
    const details = await getServiceWithDetails(service.id);
    if (details) services.push(details);
  }

  return services;
}

export async function getServiceCountByStatus(): Promise<{ status: string; count: number }[]> {
  const result = await query<{ status: string; count: string }>(
    'SELECT status, COUNT(*)::text as count FROM "PitStop_direction".service GROUP BY status'
  );
  return result.rows.map(row => ({ status: row.status, count: parseInt(row.count) }));
}
