import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, jest } from '@jest/globals';
import { IMemoryDb } from 'pg-mem';
import { setupTestDb, initializeSchema, cleanDatabase, createMockQueryFunction } from '../../../../setup/test-db';
import { mockCars } from '../../../../setup/test-data';
import * as dbIndex from '@/lib/db/index';

import {
  getAllCars,
  getCarById,
  getCarWithServices,
  createCar,
  updateCar,
  deleteCar,
  searchCars,
} from '@/lib/db/queries/cars';

let db: IMemoryDb;

beforeAll(async () => {
  db = setupTestDb();
  await initializeSchema(db);
  
  const mockQuery = createMockQueryFunction(db.adapters.createPg().Pool);
  jest.spyOn(dbIndex, 'query').mockImplementation(mockQuery as any);
});

afterEach(async () => {
  await cleanDatabase(db);
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Car Queries - CRUD Operations', () => {
  describe('createCar', () => {
    it('should create a new car with all fields', async () => {
      const carData = mockCars[0];
      const car = await createCar({
        brand: carData.brand,
        model: carData.model,
        year: carData.year,
        color: carData.color,
        licensePlate: carData.license_plate || undefined,
        owner: carData.owner || undefined,
      });

      expect(car).toBeDefined();
      expect(car.id).toBeDefined();
      expect(car.brand).toBe(carData.brand);
      expect(car.model).toBe(carData.model);
      expect(car.year).toBe(carData.year);
      expect(car.color).toBe(carData.color);
      expect(car.license_plate).toBe(carData.license_plate);
      expect(car.owner).toBe(carData.owner);
      expect(car.created_at).toBeDefined();
      expect(car.updated_at).toBeDefined();
    });

    it('should create a car with optional fields as null', async () => {
      const carData = mockCars[2];
      const car = await createCar({
        brand: carData.brand,
        model: carData.model,
        year: carData.year,
        color: carData.color,
      });

      expect(car).toBeDefined();
      expect(car.license_plate).toBeNull();
      expect(car.owner).toBeNull();
    });

    it('should create multiple cars successfully', async () => {
      const car1 = await createCar({
        brand: mockCars[0].brand,
        model: mockCars[0].model,
        year: mockCars[0].year,
        color: mockCars[0].color,
        licensePlate: mockCars[0].license_plate || undefined,
        owner: mockCars[0].owner || undefined,
      });
      const car2 = await createCar({
        brand: mockCars[1].brand,
        model: mockCars[1].model,
        year: mockCars[1].year,
        color: mockCars[1].color,
        licensePlate: mockCars[1].license_plate || undefined,
        owner: mockCars[1].owner || undefined,
      });

      expect(car1.id).not.toBe(car2.id);
      expect(car1.brand).toBe(mockCars[0].brand);
      expect(car2.brand).toBe(mockCars[1].brand);
    });
  });

  describe('getAllCars', () => {
    it('should return empty array when no cars exist', async () => {
      const cars = await getAllCars();
      expect(cars).toEqual([]);
    });

    it('should return all cars ordered by created_at DESC', async () => {
      const car1 = await createCar({
        brand: mockCars[0].brand,
        model: mockCars[0].model,
        year: mockCars[0].year,
        color: mockCars[0].color,
        licensePlate: mockCars[0].license_plate || undefined,
        owner: mockCars[0].owner || undefined,
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      const car2 = await createCar({
        brand: mockCars[1].brand,
        model: mockCars[1].model,
        year: mockCars[1].year,
        color: mockCars[1].color,
        licensePlate: mockCars[1].license_plate || undefined,
        owner: mockCars[1].owner || undefined,
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      const car3 = await createCar({
        brand: mockCars[2].brand,
        model: mockCars[2].model,
        year: mockCars[2].year,
        color: mockCars[2].color,
      });

      const cars = await getAllCars();

      expect(cars).toHaveLength(3);
      expect(cars.map(c => c.id)).toContain(car1.id);
      expect(cars.map(c => c.id)).toContain(car2.id);
      expect(cars.map(c => c.id)).toContain(car3.id);
    });
  });

  describe('getCarById', () => {
    it('should return car by id', async () => {
      const created = await createCar({
        brand: mockCars[0].brand,
        model: mockCars[0].model,
        year: mockCars[0].year,
        color: mockCars[0].color,
        licensePlate: mockCars[0].license_plate || undefined,
        owner: mockCars[0].owner || undefined,
      });
      const car = await getCarById(created.id);

      expect(car).toBeDefined();
      expect(car?.id).toBe(created.id);
      expect(car?.brand).toBe(mockCars[0].brand);
      expect(car?.model).toBe(mockCars[0].model);
    });

    it('should return null for non-existent car id', async () => {
      const car = await getCarById(99999);
      expect(car).toBeNull();
    });
  });

  describe('updateCar', () => {
    it('should update car with new values', async () => {
      const created = await createCar({
        brand: mockCars[0].brand,
        model: mockCars[0].model,
        year: mockCars[0].year,
        color: mockCars[0].color,
        licensePlate: mockCars[0].license_plate || undefined,
        owner: mockCars[0].owner || undefined,
      });
      
      const updated = await updateCar(created.id, {
        brand: 'Updated Brand',
        color: 'Green',
      });

      expect(updated).toBeDefined();
      expect(updated?.brand).toBe('Updated Brand');
      expect(updated?.color).toBe('Green');
      expect(updated?.model).toBe(mockCars[0].model);
      expect(updated?.year).toBe(mockCars[0].year);
    });

    it('should update only provided fields', async () => {
      const created = await createCar({
        brand: mockCars[0].brand,
        model: mockCars[0].model,
        year: mockCars[0].year,
        color: mockCars[0].color,
        licensePlate: mockCars[0].license_plate || undefined,
        owner: mockCars[0].owner || undefined,
      });
      
      const updated = await updateCar(created.id, {
        color: 'Purple',
      });

      expect(updated?.color).toBe('Purple');
      expect(updated?.brand).toBe(mockCars[0].brand);
      expect(updated?.model).toBe(mockCars[0].model);
    });

    it('should return null for non-existent car', async () => {
      const updated = await updateCar(99999, { brand: 'Test' });
      expect(updated).toBeNull();
    });

    it('should maintain optional fields when not updated', async () => {
      const created = await createCar({
        brand: mockCars[0].brand,
        model: mockCars[0].model,
        year: mockCars[0].year,
        color: mockCars[0].color,
        licensePlate: mockCars[0].license_plate || undefined,
        owner: mockCars[0].owner || undefined,
      });
      
      const updated = await updateCar(created.id, {
        color: 'New Color',
      });

      expect(updated?.license_plate).toBe(mockCars[0].license_plate);
      expect(updated?.owner).toBe(mockCars[0].owner);
    });
  });

  describe('deleteCar', () => {
    it('should delete existing car', async () => {
      const created = await createCar({
        brand: mockCars[0].brand,
        model: mockCars[0].model,
        year: mockCars[0].year,
        color: mockCars[0].color,
        licensePlate: mockCars[0].license_plate || undefined,
        owner: mockCars[0].owner || undefined,
      });
      
      const deleted = await deleteCar(created.id);
      expect(deleted).toBe(true);

      const car = await getCarById(created.id);
      expect(car).toBeNull();
    });

    it('should return false when deleting non-existent car', async () => {
      const deleted = await deleteCar(99999);
      expect(deleted).toBe(false);
    });

    it('should only delete specified car', async () => {
      const car1 = await createCar({
        brand: mockCars[0].brand,
        model: mockCars[0].model,
        year: mockCars[0].year,
        color: mockCars[0].color,
        licensePlate: mockCars[0].license_plate || undefined,
        owner: mockCars[0].owner || undefined,
      });
      const car2 = await createCar({
        brand: mockCars[1].brand,
        model: mockCars[1].model,
        year: mockCars[1].year,
        color: mockCars[1].color,
        licensePlate: mockCars[1].license_plate || undefined,
        owner: mockCars[1].owner || undefined,
      });

      await deleteCar(car1.id);

      const remaining = await getAllCars();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(car2.id);
    });
  });

  describe('searchCars', () => {
    beforeEach(async () => {
      await createCar({
        brand: mockCars[0].brand,
        model: mockCars[0].model,
        year: mockCars[0].year,
        color: mockCars[0].color,
        licensePlate: mockCars[0].license_plate || undefined,
        owner: mockCars[0].owner || undefined,
      });
      await createCar({
        brand: mockCars[1].brand,
        model: mockCars[1].model,
        year: mockCars[1].year,
        color: mockCars[1].color,
        licensePlate: mockCars[1].license_plate || undefined,
        owner: mockCars[1].owner || undefined,
      });
      await createCar({
        brand: mockCars[2].brand,
        model: mockCars[2].model,
        year: mockCars[2].year,
        color: mockCars[2].color,
      });
    });

    it('should find cars by brand (case insensitive)', async () => {
      const results = await searchCars('toyota');
      expect(results).toHaveLength(1);
      expect(results[0].brand).toBe('Toyota');
    });

    it('should find cars by model', async () => {
      const results = await searchCars('Civic');
      expect(results).toHaveLength(1);
      expect(results[0].model).toBe('Civic');
    });

    it('should find cars by owner', async () => {
      const results = await searchCars('Jane');
      expect(results).toHaveLength(1);
      expect(results[0].owner).toBe('Jane Smith');
    });

    it('should find cars with partial match', async () => {
      const results = await searchCars('ust');
      expect(results).toHaveLength(1);
      expect(results[0].model).toBe('Mustang');
    });

    it('should return empty array when no matches found', async () => {
      const results = await searchCars('Nonexistent');
      expect(results).toEqual([]);
    });

    it('should return multiple matches', async () => {
      const results = await searchCars('o');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('getCarWithServices', () => {
    it('should return car with empty services array', async () => {
      const created = await createCar({
        brand: mockCars[0].brand,
        model: mockCars[0].model,
        year: mockCars[0].year,
        color: mockCars[0].color,
        licensePlate: mockCars[0].license_plate || undefined,
        owner: mockCars[0].owner || undefined,
      });
      const carWithServices = await getCarWithServices(created.id);

      expect(carWithServices).toBeDefined();
      expect(carWithServices?.id).toBe(created.id);
      expect(carWithServices?.services).toEqual([]);
    });

    it('should return null for non-existent car', async () => {
      const result = await getCarWithServices(99999);
      expect(result).toBeNull();
    });
  });
});

