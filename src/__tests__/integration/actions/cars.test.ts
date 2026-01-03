import { describe, it, expect, beforeAll, afterEach, afterAll, jest } from '@jest/globals';
import { IMemoryDb } from 'pg-mem';
import { setupTestDb, initializeSchema, cleanDatabase, createMockQueryFunction } from '../../setup/test-db';

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

import * as dbIndex from '@/lib/db/index';
import * as nextCache from 'next/cache';
import * as nextNavigation from 'next/navigation';

import { createCarAction, updateCarAction, deleteCarAction } from '@/actions/cars';
import { getAllCars, getCarById } from '@/lib/db/queries/cars';

let db: IMemoryDb;

beforeAll(async () => {
  db = setupTestDb();
  await initializeSchema(db);
  
  const mockQuery = createMockQueryFunction(db.adapters.createPg().Pool);
  jest.spyOn(dbIndex, 'query').mockImplementation(mockQuery as typeof dbIndex.query);
  
  jest.spyOn(nextCache, 'revalidatePath').mockImplementation(() => {});
  jest.spyOn(nextNavigation, 'redirect').mockImplementation((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  });
});

afterEach(async () => {
  await cleanDatabase(db);
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Car Actions - Integration Tests', () => {
  describe('createCarAction', () => {
    it('should create a car with valid data', async () => {
      const formData = new FormData();
      formData.append('brand', 'Toyota');
      formData.append('model', 'Camry');
      formData.append('year', '2020');
      formData.append('color', 'Blue');
      formData.append('licensePlate', 'ABC-123');
      formData.append('owner', 'John Doe');

      await expect(createCarAction(formData)).rejects.toThrow('REDIRECT:/cars');

      const cars = await getAllCars();
      expect(cars).toHaveLength(1);
      expect(cars[0].brand).toBe('Toyota');
      expect(cars[0].model).toBe('Camry');
      expect(nextCache.revalidatePath).toHaveBeenCalledWith('/cars');
    });

    it('should create a car without optional fields', async () => {
      const formData = new FormData();
      formData.append('brand', 'Honda');
      formData.append('model', 'Civic');
      formData.append('year', '2021');
      formData.append('color', 'Red');

      await expect(createCarAction(formData)).rejects.toThrow('REDIRECT:/cars');

      const cars = await getAllCars();
      expect(cars).toHaveLength(1);
      expect(cars[0].license_plate).toBeNull();
      expect(cars[0].owner).toBeNull();
    });

    it('should return validation errors for invalid data', async () => {
      const formData = new FormData();
      formData.append('brand', '');
      formData.append('model', 'Civic');
      formData.append('year', '2021');
      formData.append('color', 'Red');

      const result = await createCarAction(formData);

      expect(result).toBeDefined();
      expect(result?.errors).toBeDefined();
      expect(result?.errors?.brand).toBeDefined();

      const cars = await getAllCars();
      expect(cars).toHaveLength(0);
    });

    it('should validate year is within range', async () => {
      const formData = new FormData();
      formData.append('brand', 'Ford');
      formData.append('model', 'Focus');
      formData.append('year', '1800');
      formData.append('color', 'Black');

      const result = await createCarAction(formData);

      expect(result?.errors?.year).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(dbIndex, 'query').mockRejectedValueOnce(new Error('DB Error'));

      const formData = new FormData();
      formData.append('brand', 'Tesla');
      formData.append('model', 'Model 3');
      formData.append('year', '2023');
      formData.append('color', 'White');

      const result = await createCarAction(formData);

      expect(result?.error).toBe('Failed to create car. Please try again.');
    });
  });

  describe('updateCarAction', () => {
    it('should update car with valid data', async () => {
      const formData = new FormData();
      formData.append('brand', 'Toyota');
      formData.append('model', 'Camry');
      formData.append('year', '2020');
      formData.append('color', 'Blue');

      await expect(createCarAction(formData)).rejects.toThrow();

      const cars = await getAllCars();
      const carId = cars[0].id;

      const updateFormData = new FormData();
      updateFormData.append('brand', 'Toyota');
      updateFormData.append('model', 'Camry');
      updateFormData.append('year', '2020');
      updateFormData.append('color', 'Green');
      updateFormData.append('owner', 'Jane Doe');

      await expect(updateCarAction(carId, updateFormData)).rejects.toThrow(`REDIRECT:/cars/${carId}`);

      const updated = await getCarById(carId);
      expect(updated?.color).toBe('Green');
      expect(updated?.owner).toBe('Jane Doe');
      expect(nextCache.revalidatePath).toHaveBeenCalledWith('/cars');
      expect(nextCache.revalidatePath).toHaveBeenCalledWith(`/cars/${carId}`);
    });

    it('should return validation errors for invalid update data', async () => {
      const formData = new FormData();
      formData.append('brand', 'Honda');
      formData.append('model', 'Civic');
      formData.append('year', '2021');
      formData.append('color', 'Red');

      await expect(createCarAction(formData)).rejects.toThrow();
      const cars = await getAllCars();
      const carId = cars[0].id;

      const updateFormData = new FormData();
      updateFormData.append('brand', '');
      updateFormData.append('model', 'Civic');
      updateFormData.append('year', '2021');
      updateFormData.append('color', 'Red');

      const result = await updateCarAction(carId, updateFormData);

      expect(result?.errors?.brand).toBeDefined();
    });

    it('should handle database errors during update', async () => {
      const formData = new FormData();
      formData.append('brand', 'Honda');
      formData.append('model', 'Civic');
      formData.append('year', '2021');
      formData.append('color', 'Red');

      await expect(createCarAction(formData)).rejects.toThrow();
      const cars = await getAllCars();
      const carId = cars[0].id;

      jest.spyOn(dbIndex, 'query').mockRejectedValueOnce(new Error('DB Error'));

      const updateFormData = new FormData();
      updateFormData.append('brand', 'Honda');
      updateFormData.append('model', 'Accord');
      updateFormData.append('year', '2021');
      updateFormData.append('color', 'Blue');

      const result = await updateCarAction(carId, updateFormData);

      expect(result?.error).toBe('Failed to update car. Please try again.');
    });
  });

  describe('deleteCarAction', () => {
    it('should delete existing car', async () => {
      const formData = new FormData();
      formData.append('brand', 'Ford');
      formData.append('model', 'Mustang');
      formData.append('year', '2019');
      formData.append('color', 'Black');

      await expect(createCarAction(formData)).rejects.toThrow();
      const cars = await getAllCars();
      const carId = cars[0].id;

      await expect(deleteCarAction(carId)).rejects.toThrow('REDIRECT:/cars');

      const deletedCar = await getCarById(carId);
      expect(deletedCar).toBeNull();
      expect(nextCache.revalidatePath).toHaveBeenCalledWith('/cars');
    });

    it('should handle database errors during delete', async () => {
      const formData = new FormData();
      formData.append('brand', 'BMW');
      formData.append('model', 'X5');
      formData.append('year', '2022');
      formData.append('color', 'Silver');

      await expect(createCarAction(formData)).rejects.toThrow();
      const cars = await getAllCars();
      const carId = cars[0].id;

      jest.spyOn(dbIndex, 'query').mockRejectedValueOnce(new Error('DB Error'));

      const result = await deleteCarAction(carId);

      expect(result?.error).toBe('Failed to delete car. Please try again.');
    });
  });
});

