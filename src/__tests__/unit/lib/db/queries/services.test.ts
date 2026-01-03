import { describe, it, expect, beforeAll, afterEach, afterAll, jest, beforeEach } from '@jest/globals';
import { IMemoryDb } from 'pg-mem';
import { setupTestDb, initializeSchema, cleanDatabase, createMockQueryFunction } from '../../../../setup/test-db';
import { mockCars, mockMechanics, getMockService, getMockServiceInProgress } from '../../../../setup/test-data';
import * as dbIndex from '@/lib/db/index';
import { createCar } from '@/lib/db/queries/cars';
import { createMechanic } from '@/lib/db/queries/mechanics';

import {
  getAllServices,
  getServiceById,
  getServiceWithDetails,
  createService,
  updateService,
  deleteService,
  getServicesByCarId,
  getServicesByMechanicId,
  getRecentServices,
  getServiceCountByStatus,
} from '@/lib/db/queries/services';

let db: IMemoryDb;
let testCarId: number;
let testMechanicIds: number[];

beforeAll(async () => {
  db = setupTestDb();
  await initializeSchema(db);
  
  const mockQuery = createMockQueryFunction(db.adapters.createPg().Pool);
  jest.spyOn(dbIndex, 'query').mockImplementation(mockQuery as typeof dbIndex.query);
  jest.spyOn(dbIndex, 'transaction').mockImplementation(async (callback: Parameters<typeof dbIndex.transaction>[0]) => {
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
});

beforeEach(async () => {
  const car = await createCar({
    brand: mockCars[0].brand,
    model: mockCars[0].model,
    year: mockCars[0].year,
    color: mockCars[0].color,
    licensePlate: mockCars[0].license_plate || undefined,
    owner: mockCars[0].owner || undefined,
  });
  testCarId = car.id;

  const mech1 = await createMechanic({
    firstName: mockMechanics[0].first_name,
    lastName: mockMechanics[0].last_name,
    yearsExperience: mockMechanics[0].years_experience,
    email: mockMechanics[0].email || undefined,
  });
  const mech2 = await createMechanic({
    firstName: mockMechanics[1].first_name,
    lastName: mockMechanics[1].last_name,
    yearsExperience: mockMechanics[1].years_experience,
    email: mockMechanics[1].email || undefined,
  });
  testMechanicIds = [mech1.id, mech2.id];
});

afterEach(async () => {
  await cleanDatabase(db);
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Service Queries - CRUD Operations', () => {
  describe('createService', () => {
    it('should create a new service with all fields', async () => {
      const serviceData = getMockService(testCarId);
      
      const service = await createService({
        carId: serviceData.car_id,
        startDate: serviceData.start_date,
        endDate: serviceData.end_date || undefined,
        status: serviceData.status,
        notes: serviceData.notes || undefined,
        mechanicIds: testMechanicIds,
      });

      expect(service).toBeDefined();
      expect(service.id).toBeDefined();
      expect(service.car_id).toBe(testCarId);
      expect(service.status).toBe('completed');
      expect(service.notes).toBe('Oil change and tire rotation');
      expect(service.car).toBeDefined();
      expect(service.mechanics).toHaveLength(2);
      expect(service.created_at).toBeDefined();
    });

    it('should create a service with single mechanic', async () => {
      const serviceData = getMockService(testCarId);
      
      const service = await createService({
        carId: serviceData.car_id,
        startDate: serviceData.start_date,
        endDate: serviceData.end_date || undefined,
        status: serviceData.status,
        notes: serviceData.notes || undefined,
        mechanicIds: [testMechanicIds[0]],
      });

      expect(service.mechanics).toHaveLength(1);
      expect(service.mechanics[0].id).toBe(testMechanicIds[0]);
    });

    it('should create a service with null end_date', async () => {
      const serviceData = getMockServiceInProgress(testCarId);
      
      const service = await createService({
        carId: serviceData.car_id,
        startDate: serviceData.start_date,
        endDate: serviceData.end_date || undefined,
        status: serviceData.status,
        notes: serviceData.notes || undefined,
        mechanicIds: testMechanicIds,
      });

      expect(service.end_date).toBeNull();
      expect(service.status).toBe('in_progress');
    });

    it('should create service without notes', async () => {
      const service = await createService({
        carId: testCarId,
        startDate: new Date('2024-03-01'),
        status: 'scheduled',
        mechanicIds: testMechanicIds,
      });

      expect(service.notes).toBeNull();
    });
  });

  describe('getAllServices', () => {
    it('should return empty array when no services exist', async () => {
      const services = await getAllServices();
      expect(services).toEqual([]);
    });

    it('should return all services ordered by start_date DESC', async () => {
      await createService({
        carId: testCarId,
        startDate: new Date('2024-01-01'),
        status: 'completed',
        mechanicIds: [testMechanicIds[0]],
      });

      await createService({
        carId: testCarId,
        startDate: new Date('2024-03-01'),
        status: 'scheduled',
        mechanicIds: [testMechanicIds[1]],
      });

      await createService({
        carId: testCarId,
        startDate: new Date('2024-02-01'),
        status: 'in_progress',
        mechanicIds: testMechanicIds,
      });

      const services = await getAllServices();

      expect(services).toHaveLength(3);
      expect(services[0].start_date).toEqual(new Date('2024-03-01'));
      expect(services[2].start_date).toEqual(new Date('2024-01-01'));
    });
  });

  describe('getServiceById', () => {
    it('should return service by id', async () => {
      const created = await createService({
        carId: testCarId,
        startDate: new Date('2024-01-15'),
        status: 'completed',
        mechanicIds: testMechanicIds,
      });

      const service = await getServiceById(created.id);

      expect(service).toBeDefined();
      expect(service?.id).toBe(created.id);
      expect(service?.car_id).toBe(testCarId);
    });

    it('should return null for non-existent service id', async () => {
      const service = await getServiceById(99999);
      expect(service).toBeNull();
    });
  });

  describe('getServiceWithDetails', () => {
    it('should return service with car and mechanics details', async () => {
      const created = await createService({
        carId: testCarId,
        startDate: new Date('2024-01-15'),
        status: 'completed',
        mechanicIds: testMechanicIds,
      });

      const service = await getServiceWithDetails(created.id);

      expect(service).toBeDefined();
      expect(service?.car).toBeDefined();
      expect(service?.car.id).toBe(testCarId);
      expect(service?.mechanics).toHaveLength(2);
      expect(service?.mechanics[0].first_name).toBeDefined();
    });

    it('should return null for non-existent service', async () => {
      const result = await getServiceWithDetails(99999);
      expect(result).toBeNull();
    });
  });

  describe('updateService', () => {
    it('should update service fields', async () => {
      const created = await createService({
        carId: testCarId,
        startDate: new Date('2024-01-15'),
        status: 'scheduled',
        mechanicIds: [testMechanicIds[0]],
      });

      const updated = await updateService(created.id, {
        status: 'in_progress',
        notes: 'Started work',
      });

      expect(updated).toBeDefined();
      expect(updated?.status).toBe('in_progress');
      expect(updated?.notes).toBe('Started work');
      expect(updated?.start_date).toEqual(new Date('2024-01-15'));
    });

    it('should update mechanics list', async () => {
      const created = await createService({
        carId: testCarId,
        startDate: new Date('2024-01-15'),
        status: 'scheduled',
        mechanicIds: [testMechanicIds[0]],
      });

      const updated = await updateService(created.id, {
        mechanicIds: testMechanicIds,
      });

      expect(updated?.mechanics).toHaveLength(2);
    });

    it('should update end_date to complete service', async () => {
      const created = await createService({
        carId: testCarId,
        startDate: new Date('2024-01-15'),
        status: 'in_progress',
        mechanicIds: testMechanicIds,
      });

      const updated = await updateService(created.id, {
        endDate: new Date('2024-01-16'),
        status: 'completed',
      });

      expect(updated?.end_date).toEqual(new Date('2024-01-16'));
      expect(updated?.status).toBe('completed');
    });

    it('should return null for non-existent service', async () => {
      const updated = await updateService(99999, { status: 'completed' });
      expect(updated).toBeNull();
    });
  });

  describe('deleteService', () => {
    it('should delete existing service', async () => {
      const created = await createService({
        carId: testCarId,
        startDate: new Date('2024-01-15'),
        status: 'scheduled',
        mechanicIds: testMechanicIds,
      });

      const deleted = await deleteService(created.id);
      expect(deleted).toBe(true);

      const service = await getServiceById(created.id);
      expect(service).toBeNull();
    });

    it('should return false when deleting non-existent service', async () => {
      const deleted = await deleteService(99999);
      expect(deleted).toBe(false);
    });

    it('should cascade delete service_mechanics entries', async () => {
      const created = await createService({
        carId: testCarId,
        startDate: new Date('2024-01-15'),
        status: 'scheduled',
        mechanicIds: testMechanicIds,
      });

      await deleteService(created.id);

      const details = await getServiceWithDetails(created.id);
      expect(details).toBeNull();
    });
  });

  describe('getServicesByCarId', () => {
    it('should return all services for a car', async () => {
      await createService({
        carId: testCarId,
        startDate: new Date('2024-01-15'),
        status: 'completed',
        mechanicIds: [testMechanicIds[0]],
      });

      await createService({
        carId: testCarId,
        startDate: new Date('2024-02-15'),
        status: 'scheduled',
        mechanicIds: [testMechanicIds[1]],
      });

      const services = await getServicesByCarId(testCarId);

      expect(services).toHaveLength(2);
      expect(services[0].start_date).toEqual(new Date('2024-02-15'));
    });

    it('should return empty array for car with no services', async () => {
      const services = await getServicesByCarId(testCarId);
      expect(services).toEqual([]);
    });
  });

  describe('getServicesByMechanicId', () => {
    it('should return all services for a mechanic with details', async () => {
      await createService({
        carId: testCarId,
        startDate: new Date('2024-01-15'),
        status: 'completed',
        mechanicIds: [testMechanicIds[0]],
      });

      await createService({
        carId: testCarId,
        startDate: new Date('2024-02-15'),
        status: 'scheduled',
        mechanicIds: testMechanicIds,
      });

      const services = await getServicesByMechanicId(testMechanicIds[0]);

      expect(services).toHaveLength(2);
      expect(services[0].car).toBeDefined();
      expect(services[0].mechanics).toBeDefined();
    });

    it('should return empty array for mechanic with no services', async () => {
      const services = await getServicesByMechanicId(testMechanicIds[0]);
      expect(services).toEqual([]);
    });
  });

  describe('getRecentServices', () => {
    it('should return limited number of recent services', async () => {
      for (let i = 0; i < 10; i++) {
        await createService({
          carId: testCarId,
          startDate: new Date(`2024-01-${i + 1}`),
          status: 'completed',
          mechanicIds: [testMechanicIds[0]],
        });
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      const services = await getRecentServices(5);

      expect(services).toHaveLength(5);
      expect(services[0].car).toBeDefined();
      expect(services[0].mechanics).toBeDefined();
    });

    it('should return all services if less than limit', async () => {
      await createService({
        carId: testCarId,
        startDate: new Date('2024-01-15'),
        status: 'completed',
        mechanicIds: testMechanicIds,
      });

      const services = await getRecentServices(5);
      expect(services).toHaveLength(1);
    });
  });

  describe('getServiceCountByStatus', () => {
    it('should return count grouped by status', async () => {
      await createService({
        carId: testCarId,
        startDate: new Date('2024-01-15'),
        status: 'completed',
        mechanicIds: [testMechanicIds[0]],
      });

      await createService({
        carId: testCarId,
        startDate: new Date('2024-02-15'),
        status: 'completed',
        mechanicIds: [testMechanicIds[1]],
      });

      await createService({
        carId: testCarId,
        startDate: new Date('2024-03-15'),
        status: 'scheduled',
        mechanicIds: testMechanicIds,
      });

      const counts = await getServiceCountByStatus();

      expect(counts).toHaveLength(2);
      const completedCount = counts.find(c => c.status === 'completed');
      const scheduledCount = counts.find(c => c.status === 'scheduled');

      expect(completedCount?.count).toBe(2);
      expect(scheduledCount?.count).toBe(1);
    });

    it('should return empty array when no services exist', async () => {
      const counts = await getServiceCountByStatus();
      expect(counts).toEqual([]);
    });
  });
});

