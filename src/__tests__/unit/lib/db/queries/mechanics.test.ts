import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll, jest } from '@jest/globals';
import { IMemoryDb } from 'pg-mem';
import { setupTestDb, initializeSchema, cleanDatabase, createMockQueryFunction } from '../../../../setup/test-db';
import { mockMechanics } from '../../../../setup/test-data';
import * as dbIndex from '@/lib/db/index';

import {
  getAllMechanics,
  getMechanicById,
  createMechanic,
  updateMechanic,
  deleteMechanic,
  searchMechanics,
} from '@/lib/db/queries/mechanics';

let db: IMemoryDb;

beforeAll(async () => {
  db = setupTestDb();
  await initializeSchema(db);
  
  const mockQuery = createMockQueryFunction(db.adapters.createPg().Pool);
  jest.spyOn(dbIndex, 'query').mockImplementation(mockQuery as typeof dbIndex.query);
});

afterEach(async () => {
  await cleanDatabase(db);
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Mechanic Queries - CRUD Operations', () => {
  describe('createMechanic', () => {
    it('should create a new mechanic with all fields', async () => {
      const mechanicData = mockMechanics[0];
      const mechanic = await createMechanic({
        firstName: mechanicData.first_name,
        lastName: mechanicData.last_name,
        yearsExperience: mechanicData.years_experience,
        email: mechanicData.email || undefined,
      });

      expect(mechanic).toBeDefined();
      expect(mechanic.id).toBeDefined();
      expect(mechanic.first_name).toBe(mechanicData.first_name);
      expect(mechanic.last_name).toBe(mechanicData.last_name);
      expect(mechanic.years_experience).toBe(mechanicData.years_experience);
      expect(mechanic.email).toBe(mechanicData.email);
      expect(mechanic.created_at).toBeDefined();
      expect(mechanic.updated_at).toBeDefined();
    });

    it('should create a mechanic with email as null', async () => {
      const mechanicData = mockMechanics[2];
      const mechanic = await createMechanic({
        firstName: mechanicData.first_name,
        lastName: mechanicData.last_name,
        yearsExperience: mechanicData.years_experience,
      });

      expect(mechanic).toBeDefined();
      expect(mechanic.email).toBeNull();
    });

    it('should create mechanic with 0 years experience', async () => {
      const mechanic = await createMechanic({
        firstName: 'New',
        lastName: 'Mechanic',
        yearsExperience: 0,
      });

      expect(mechanic.years_experience).toBe(0);
    });

    it('should create multiple mechanics successfully', async () => {
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

      expect(mech1.id).not.toBe(mech2.id);
      expect(mech1.first_name).toBe(mockMechanics[0].first_name);
      expect(mech2.first_name).toBe(mockMechanics[1].first_name);
    });
  });

  describe('getAllMechanics', () => {
    it('should return empty array when no mechanics exist', async () => {
      const mechanics = await getAllMechanics();
      expect(mechanics).toEqual([]);
    });

    it('should return all mechanics ordered by last name, then first name', async () => {
      await createMechanic({
        firstName: 'Zoe',
        lastName: 'Anderson',
        yearsExperience: 3,
      });
      await createMechanic({
        firstName: 'Alice',
        lastName: 'Anderson',
        yearsExperience: 5,
      });
      await createMechanic({
        firstName: 'Bob',
        lastName: 'Brown',
        yearsExperience: 2,
      });

      const mechanics = await getAllMechanics();

      expect(mechanics).toHaveLength(3);
      expect(mechanics[0].first_name).toBe('Alice');
      expect(mechanics[0].last_name).toBe('Anderson');
      expect(mechanics[1].first_name).toBe('Zoe');
      expect(mechanics[2].last_name).toBe('Brown');
    });
  });

  describe('getMechanicById', () => {
    it('should return mechanic by id', async () => {
      const created = await createMechanic({
        firstName: mockMechanics[0].first_name,
        lastName: mockMechanics[0].last_name,
        yearsExperience: mockMechanics[0].years_experience,
        email: mockMechanics[0].email || undefined,
      });
      const mechanic = await getMechanicById(created.id);

      expect(mechanic).toBeDefined();
      expect(mechanic?.id).toBe(created.id);
      expect(mechanic?.first_name).toBe(mockMechanics[0].first_name);
      expect(mechanic?.last_name).toBe(mockMechanics[0].last_name);
    });

    it('should return null for non-existent mechanic id', async () => {
      const mechanic = await getMechanicById(99999);
      expect(mechanic).toBeNull();
    });
  });

  describe('updateMechanic', () => {
    it('should update mechanic with new values', async () => {
      const created = await createMechanic({
        firstName: mockMechanics[0].first_name,
        lastName: mockMechanics[0].last_name,
        yearsExperience: mockMechanics[0].years_experience,
        email: mockMechanics[0].email || undefined,
      });
      
      const updated = await updateMechanic(created.id, {
        firstName: 'Updated',
        yearsExperience: 20,
      });

      expect(updated).toBeDefined();
      expect(updated?.first_name).toBe('Updated');
      expect(updated?.years_experience).toBe(20);
      expect(updated?.last_name).toBe(mockMechanics[0].last_name);
    });

    it('should update only provided fields', async () => {
      const created = await createMechanic({
        firstName: mockMechanics[0].first_name,
        lastName: mockMechanics[0].last_name,
        yearsExperience: mockMechanics[0].years_experience,
        email: mockMechanics[0].email || undefined,
      });
      
      const updated = await updateMechanic(created.id, {
        email: 'newemail@test.com',
      });

      expect(updated?.email).toBe('newemail@test.com');
      expect(updated?.first_name).toBe(mockMechanics[0].first_name);
      expect(updated?.last_name).toBe(mockMechanics[0].last_name);
    });

    it('should return null for non-existent mechanic', async () => {
      const updated = await updateMechanic(99999, { firstName: 'Test' });
      expect(updated).toBeNull();
    });

    it('should allow updating years_experience to 0', async () => {
      const created = await createMechanic({
        firstName: mockMechanics[0].first_name,
        lastName: mockMechanics[0].last_name,
        yearsExperience: mockMechanics[0].years_experience,
        email: mockMechanics[0].email || undefined,
      });
      
      const updated = await updateMechanic(created.id, {
        yearsExperience: 0,
      });

      expect(updated?.years_experience).toBe(0);
    });
  });

  describe('deleteMechanic', () => {
    it('should delete existing mechanic', async () => {
      const created = await createMechanic({
        firstName: mockMechanics[0].first_name,
        lastName: mockMechanics[0].last_name,
        yearsExperience: mockMechanics[0].years_experience,
        email: mockMechanics[0].email || undefined,
      });
      
      const deleted = await deleteMechanic(created.id);
      expect(deleted).toBe(true);

      const mechanic = await getMechanicById(created.id);
      expect(mechanic).toBeNull();
    });

    it('should return false when deleting non-existent mechanic', async () => {
      const deleted = await deleteMechanic(99999);
      expect(deleted).toBe(false);
    });

    it('should only delete specified mechanic', async () => {
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

      await deleteMechanic(mech1.id);

      const remaining = await getAllMechanics();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(mech2.id);
    });
  });

  describe('searchMechanics', () => {
    beforeEach(async () => {
      await createMechanic({
        firstName: mockMechanics[0].first_name,
        lastName: mockMechanics[0].last_name,
        yearsExperience: mockMechanics[0].years_experience,
        email: mockMechanics[0].email || undefined,
      });
      await createMechanic({
        firstName: mockMechanics[1].first_name,
        lastName: mockMechanics[1].last_name,
        yearsExperience: mockMechanics[1].years_experience,
        email: mockMechanics[1].email || undefined,
      });
      await createMechanic({
        firstName: mockMechanics[2].first_name,
        lastName: mockMechanics[2].last_name,
        yearsExperience: mockMechanics[2].years_experience,
      });
    });

    it('should find mechanics by first name (case insensitive)', async () => {
      const results = await searchMechanics('mike');
      expect(results).toHaveLength(1);
      expect(results[0].first_name).toBe('Mike');
    });

    it('should find mechanics by last name', async () => {
      const results = await searchMechanics('Williams');
      expect(results).toHaveLength(1);
      expect(results[0].last_name).toBe('Williams');
    });

    it('should find mechanics by email', async () => {
      const results = await searchMechanics('sarah@');
      expect(results).toHaveLength(1);
      expect(results[0].email).toBe('sarah@pitstop.com');
    });

    it('should find mechanics with partial match', async () => {
      const results = await searchMechanics('bro');
      expect(results).toHaveLength(1);
      expect(results[0].last_name).toBe('Brown');
    });

    it('should return empty array when no matches found', async () => {
      const results = await searchMechanics('NonexistentName');
      expect(results).toEqual([]);
    });

    it('should return results ordered by last name, first name', async () => {
      const results = await searchMechanics('i');
      expect(results.length).toBeGreaterThan(0);
      
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1];
        const curr = results[i];
        const prevFullName = `${prev.last_name} ${prev.first_name}`;
        const currFullName = `${curr.last_name} ${curr.first_name}`;
        expect(prevFullName.localeCompare(currFullName)).toBeLessThanOrEqual(0);
      }
    });
  });
});

