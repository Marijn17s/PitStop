import { describe, it, expect, beforeAll, afterEach, afterAll, jest } from '@jest/globals';
import { IMemoryDb } from 'pg-mem';
import { setupTestDb, initializeSchema, cleanDatabase, createMockQueryFunction } from '../../setup/test-db';

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

import * as dbIndex from '@/lib/db/index';
import * as nextCache from 'next/cache';
import * as nextNavigation from 'next/navigation';

import { createMechanicAction, updateMechanicAction, deleteMechanicAction } from '@/actions/mechanics';
import { getAllMechanics, getMechanicById } from '@/lib/db/queries/mechanics';

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

describe('Mechanic Actions - Integration Tests', () => {
  describe('createMechanicAction', () => {
    it('should create a mechanic with valid data', async () => {
      const formData = new FormData();
      formData.append('firstName', 'Mike');
      formData.append('lastName', 'Johnson');
      formData.append('yearsExperience', '10');
      formData.append('email', 'mike@pitstop.com');

      await expect(createMechanicAction(formData)).rejects.toThrow('REDIRECT:/mechanics');

      const mechanics = await getAllMechanics();
      expect(mechanics).toHaveLength(1);
      expect(mechanics[0].first_name).toBe('Mike');
      expect(mechanics[0].last_name).toBe('Johnson');
      expect(mechanics[0].years_experience).toBe(10);
      expect(nextCache.revalidatePath).toHaveBeenCalledWith('/mechanics');
    });

    it('should create a mechanic without email', async () => {
      const formData = new FormData();
      formData.append('firstName', 'Sarah');
      formData.append('lastName', 'Williams');
      formData.append('yearsExperience', '5');

      await expect(createMechanicAction(formData)).rejects.toThrow('REDIRECT:/mechanics');

      const mechanics = await getAllMechanics();
      expect(mechanics).toHaveLength(1);
      expect(mechanics[0].email).toBeNull();
    });

    it('should create mechanic with 0 years experience', async () => {
      const formData = new FormData();
      formData.append('firstName', 'Junior');
      formData.append('lastName', 'Mechanic');
      formData.append('yearsExperience', '0');

      await expect(createMechanicAction(formData)).rejects.toThrow('REDIRECT:/mechanics');

      const mechanics = await getAllMechanics();
      expect(mechanics[0].years_experience).toBe(0);
    });

    it('should return validation errors for missing required fields', async () => {
      const formData = new FormData();
      formData.append('firstName', '');
      formData.append('lastName', 'Smith');
      formData.append('yearsExperience', '5');

      const result = await createMechanicAction(formData);

      expect(result?.errors?.firstName).toBeDefined();

      const mechanics = await getAllMechanics();
      expect(mechanics).toHaveLength(0);
    });

    it('should validate email format', async () => {
      const formData = new FormData();
      formData.append('firstName', 'John');
      formData.append('lastName', 'Doe');
      formData.append('yearsExperience', '3');
      formData.append('email', 'invalid-email');

      const result = await createMechanicAction(formData);

      expect(result?.errors?.email).toBeDefined();
    });

    it('should validate years experience range', async () => {
      const formData = new FormData();
      formData.append('firstName', 'John');
      formData.append('lastName', 'Doe');
      formData.append('yearsExperience', '-5');

      const result = await createMechanicAction(formData);

      expect(result?.errors?.yearsExperience).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(dbIndex, 'query').mockRejectedValueOnce(new Error('DB Error'));

      const formData = new FormData();
      formData.append('firstName', 'Bob');
      formData.append('lastName', 'Builder');
      formData.append('yearsExperience', '15');

      const result = await createMechanicAction(formData);

      expect(result?.error).toBe('Failed to create mechanic. Please try again.');
    });
  });

  describe('updateMechanicAction', () => {
    it('should update mechanic with valid data', async () => {
      const formData = new FormData();
      formData.append('firstName', 'Mike');
      formData.append('lastName', 'Johnson');
      formData.append('yearsExperience', '10');
      formData.append('email', 'mike@pitstop.com');

      await expect(createMechanicAction(formData)).rejects.toThrow();

      const mechanics = await getAllMechanics();
      const mechanicId = mechanics[0].id;

      const updateFormData = new FormData();
      updateFormData.append('firstName', 'Michael');
      updateFormData.append('lastName', 'Johnson');
      updateFormData.append('yearsExperience', '12');
      updateFormData.append('email', 'michael@pitstop.com');

      await expect(updateMechanicAction(mechanicId, updateFormData)).rejects.toThrow(`REDIRECT:/mechanics/${mechanicId}`);

      const updated = await getMechanicById(mechanicId);
      expect(updated?.first_name).toBe('Michael');
      expect(updated?.years_experience).toBe(12);
      expect(updated?.email).toBe('michael@pitstop.com');
      expect(nextCache.revalidatePath).toHaveBeenCalledWith('/mechanics');
      expect(nextCache.revalidatePath).toHaveBeenCalledWith(`/mechanics/${mechanicId}`);
    });

    it('should return validation errors for invalid update data', async () => {
      const formData = new FormData();
      formData.append('firstName', 'Sarah');
      formData.append('lastName', 'Williams');
      formData.append('yearsExperience', '5');

      await expect(createMechanicAction(formData)).rejects.toThrow();
      const mechanics = await getAllMechanics();
      const mechanicId = mechanics[0].id;

      const updateFormData = new FormData();
      updateFormData.append('firstName', 'Sarah');
      updateFormData.append('lastName', '');
      updateFormData.append('yearsExperience', '5');

      const result = await updateMechanicAction(mechanicId, updateFormData);

      expect(result?.errors?.lastName).toBeDefined();
    });

    it('should handle database errors during update', async () => {
      const formData = new FormData();
      formData.append('firstName', 'Tom');
      formData.append('lastName', 'Brown');
      formData.append('yearsExperience', '8');

      await expect(createMechanicAction(formData)).rejects.toThrow();
      const mechanics = await getAllMechanics();
      const mechanicId = mechanics[0].id;

      jest.spyOn(dbIndex, 'query').mockRejectedValueOnce(new Error('DB Error'));

      const updateFormData = new FormData();
      updateFormData.append('firstName', 'Thomas');
      updateFormData.append('lastName', 'Brown');
      updateFormData.append('yearsExperience', '9');

      const result = await updateMechanicAction(mechanicId, updateFormData);

      expect(result?.error).toBe('Failed to update mechanic. Please try again.');
    });
  });

  describe('deleteMechanicAction', () => {
    it('should delete existing mechanic', async () => {
      const formData = new FormData();
      formData.append('firstName', 'Delete');
      formData.append('lastName', 'Me');
      formData.append('yearsExperience', '3');

      await expect(createMechanicAction(formData)).rejects.toThrow();
      const mechanics = await getAllMechanics();
      const mechanicId = mechanics[0].id;

      await expect(deleteMechanicAction(mechanicId)).rejects.toThrow('REDIRECT:/mechanics');

      const deletedMechanic = await getMechanicById(mechanicId);
      expect(deletedMechanic).toBeNull();
      expect(nextCache.revalidatePath).toHaveBeenCalledWith('/mechanics');
    });

    it('should handle database errors during delete', async () => {
      const formData = new FormData();
      formData.append('firstName', 'Keep');
      formData.append('lastName', 'Me');
      formData.append('yearsExperience', '7');

      await expect(createMechanicAction(formData)).rejects.toThrow();
      const mechanics = await getAllMechanics();
      const mechanicId = mechanics[0].id;

      jest.spyOn(dbIndex, 'query').mockRejectedValueOnce(new Error('DB Error'));

      const result = await deleteMechanicAction(mechanicId);

      expect(result?.error).toBe('Failed to delete mechanic. Please try again.');
    });
  });
});

