import { describe, it, expect, beforeAll, afterEach, afterAll, beforeEach, jest } from '@jest/globals';
import { IMemoryDb } from 'pg-mem';
import { setupTestDb, initializeSchema, cleanDatabase, createMockQueryFunction } from '../../setup/test-db';

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

import * as dbIndex from '@/lib/db/index';
import * as nextCache from 'next/cache';
import * as nextNavigation from 'next/navigation';
import { createCar } from '@/lib/db/queries/cars';
import { createMechanic } from '@/lib/db/queries/mechanics';

import { createServiceAction, updateServiceAction, deleteServiceAction } from '@/actions/services';
import { getAllServices, getServiceById } from '@/lib/db/queries/services';

let db: IMemoryDb;
let testCarId: number;
let testMechanicIds: number[];

beforeAll(async () => {
  db = setupTestDb();
  await initializeSchema(db);
  
  const mockQuery = createMockQueryFunction(db.adapters.createPg().Pool);
  jest.spyOn(dbIndex, 'query').mockImplementation(mockQuery as any);
  jest.spyOn(dbIndex, 'transaction').mockImplementation(async (callback: any) => {
    const PoolClass = db.adapters.createPg().Pool;
    const pool = new PoolClass();
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
  });
  
  jest.spyOn(nextCache, 'revalidatePath').mockImplementation(() => {});
  jest.spyOn(nextNavigation, 'redirect').mockImplementation((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  });
});

beforeEach(async () => {
  const car = await createCar({
    brand: 'Toyota',
    model: 'Camry',
    year: 2020,
    color: 'Blue',
    licensePlate: 'TEST-123',
    owner: 'Test Owner',
  });
  testCarId = car.id;

  const mech1 = await createMechanic({
    firstName: 'Mike',
    lastName: 'Johnson',
    yearsExperience: 10,
    email: 'mike@test.com',
  });
  const mech2 = await createMechanic({
    firstName: 'Sarah',
    lastName: 'Williams',
    yearsExperience: 5,
    email: 'sarah@test.com',
  });
  testMechanicIds = [mech1.id, mech2.id];
});

afterEach(async () => {
  await cleanDatabase(db);
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Service Actions - Integration Tests', () => {
  describe('createServiceAction', () => {
    it('should create a service with valid data', async () => {
      const formData = new FormData();
      formData.append('carId', testCarId.toString());
      formData.append('startDate', '2024-01-15');
      formData.append('endDate', '2024-01-16');
      formData.append('status', 'completed');
      formData.append('notes', 'Oil change');
      testMechanicIds.forEach(id => formData.append('mechanicIds', id.toString()));

      await expect(createServiceAction(formData)).rejects.toThrow('REDIRECT:/services');

      const services = await getAllServices();
      expect(services).toHaveLength(1);
      expect(services[0].car_id).toBe(testCarId);
      expect(services[0].status).toBe('completed');
      expect(nextCache.revalidatePath).toHaveBeenCalledWith('/services');
    });

    it('should create a service without end date', async () => {
      const formData = new FormData();
      formData.append('carId', testCarId.toString());
      formData.append('startDate', '2024-02-01');
      formData.append('status', 'in_progress');
      formData.append('mechanicIds', testMechanicIds[0].toString());

      await expect(createServiceAction(formData)).rejects.toThrow('REDIRECT:/services');

      const services = await getAllServices();
      expect(services).toHaveLength(1);
      expect(services[0].end_date).toBeNull();
    });

    it('should return validation errors for missing required fields', async () => {
      const formData = new FormData();
      formData.append('startDate', '2024-01-15');
      formData.append('status', 'scheduled');

      const result = await createServiceAction(formData);

      expect(result?.errors).toBeDefined();
    });

    it('should require at least one mechanic', async () => {
      const formData = new FormData();
      formData.append('carId', testCarId.toString());
      formData.append('startDate', '2024-01-15');
      formData.append('status', 'scheduled');

      const result = await createServiceAction(formData);

      expect(result?.errors?.mechanicIds).toBeDefined();
    });

    it('should validate status enum', async () => {
      const formData = new FormData();
      formData.append('carId', testCarId.toString());
      formData.append('startDate', '2024-01-15');
      formData.append('status', 'invalid_status');
      formData.append('mechanicIds', testMechanicIds[0].toString());

      const result = await createServiceAction(formData);

      expect(result?.errors?.status).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(dbIndex, 'transaction').mockRejectedValueOnce(new Error('DB Error'));

      const formData = new FormData();
      formData.append('carId', testCarId.toString());
      formData.append('startDate', '2024-01-15');
      formData.append('status', 'scheduled');
      formData.append('mechanicIds', testMechanicIds[0].toString());

      const result = await createServiceAction(formData);

      expect(result?.error).toBe('Failed to create service. Please try again.');
    });
  });

  describe('updateServiceAction', () => {
    it('should update service with valid data', async () => {
      const formData = new FormData();
      formData.append('carId', testCarId.toString());
      formData.append('startDate', '2024-01-15');
      formData.append('status', 'scheduled');
      testMechanicIds.forEach(id => formData.append('mechanicIds', id.toString()));

      await expect(createServiceAction(formData)).rejects.toThrow();

      const services = await getAllServices();
      const serviceId = services[0].id;

      const updateFormData = new FormData();
      updateFormData.append('carId', testCarId.toString());
      updateFormData.append('startDate', '2024-01-15');
      updateFormData.append('endDate', '2024-01-16');
      updateFormData.append('status', 'completed');
      updateFormData.append('notes', 'Service completed');
      updateFormData.append('mechanicIds', testMechanicIds[0].toString());

      await expect(updateServiceAction(serviceId, updateFormData)).rejects.toThrow(`REDIRECT:/services/${serviceId}`);

      const updated = await getServiceById(serviceId);
      expect(updated?.status).toBe('completed');
      expect(updated?.notes).toBe('Service completed');
      expect(updated?.end_date).toEqual(new Date('2024-01-16'));
      expect(nextCache.revalidatePath).toHaveBeenCalledWith('/services');
      expect(nextCache.revalidatePath).toHaveBeenCalledWith(`/services/${serviceId}`);
    });

    it('should return validation errors for invalid update data', async () => {
      const formData = new FormData();
      formData.append('carId', testCarId.toString());
      formData.append('startDate', '2024-01-15');
      formData.append('status', 'scheduled');
      formData.append('mechanicIds', testMechanicIds[0].toString());

      await expect(createServiceAction(formData)).rejects.toThrow();
      const services = await getAllServices();
      const serviceId = services[0].id;

      const updateFormData = new FormData();
      updateFormData.append('carId', testCarId.toString());
      updateFormData.append('startDate', '2024-01-15');
      updateFormData.append('status', 'invalid');
      updateFormData.append('mechanicIds', testMechanicIds[0].toString());

      const result = await updateServiceAction(serviceId, updateFormData);

      expect(result?.errors?.status).toBeDefined();
    });

    it('should handle database errors during update', async () => {
      const formData = new FormData();
      formData.append('carId', testCarId.toString());
      formData.append('startDate', '2024-01-15');
      formData.append('status', 'scheduled');
      formData.append('mechanicIds', testMechanicIds[0].toString());

      await expect(createServiceAction(formData)).rejects.toThrow();
      const services = await getAllServices();
      const serviceId = services[0].id;

      jest.spyOn(dbIndex, 'transaction').mockRejectedValueOnce(new Error('DB Error'));

      const updateFormData = new FormData();
      updateFormData.append('carId', testCarId.toString());
      updateFormData.append('startDate', '2024-01-15');
      updateFormData.append('status', 'in_progress');
      updateFormData.append('mechanicIds', testMechanicIds[0].toString());

      const result = await updateServiceAction(serviceId, updateFormData);

      expect(result?.error).toBe('Failed to update service. Please try again.');
    });
  });

  describe('deleteServiceAction', () => {
    it('should delete existing service', async () => {
      const formData = new FormData();
      formData.append('carId', testCarId.toString());
      formData.append('startDate', '2024-01-15');
      formData.append('status', 'scheduled');
      formData.append('mechanicIds', testMechanicIds[0].toString());

      await expect(createServiceAction(formData)).rejects.toThrow();
      const services = await getAllServices();
      const serviceId = services[0].id;

      await expect(deleteServiceAction(serviceId)).rejects.toThrow('REDIRECT:/services');

      const deletedService = await getServiceById(serviceId);
      expect(deletedService).toBeNull();
      expect(nextCache.revalidatePath).toHaveBeenCalledWith('/services');
    });

    it('should handle database errors during delete', async () => {
      const formData = new FormData();
      formData.append('carId', testCarId.toString());
      formData.append('startDate', '2024-01-15');
      formData.append('status', 'scheduled');
      formData.append('mechanicIds', testMechanicIds[0].toString());

      await expect(createServiceAction(formData)).rejects.toThrow();
      const services = await getAllServices();
      const serviceId = services[0].id;

      jest.spyOn(dbIndex, 'query').mockRejectedValueOnce(new Error('DB Error'));

      const result = await deleteServiceAction(serviceId);

      expect(result?.error).toBe('Failed to delete service. Please try again.');
    });
  });
});

