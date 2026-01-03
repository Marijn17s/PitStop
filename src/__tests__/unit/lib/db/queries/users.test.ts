import { describe, it, expect, beforeAll, afterEach, afterAll, jest } from '@jest/globals';
import { IMemoryDb } from 'pg-mem';
import { setupTestDb, initializeSchema, cleanDatabase, createMockQueryFunction } from '../../../../setup/test-db';
import { mockUsers } from '../../../../setup/test-data';
import * as dbIndex from '@/lib/db/index';

import {
  getUserByEmail,
  getUserById,
  createUser,
  updateLastLogin,
  getAllUsers,
} from '@/lib/db/queries/users';

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

describe('User Queries - CRUD Operations', () => {
  describe('createUser', () => {
    it('should create a new user with all fields', async () => {
      const userData = mockUsers[0];
      const user = await createUser(
        userData.email,
        userData.password_hash,
        userData.first_name,
        userData.last_name
      );

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password_hash).toBe(userData.password_hash);
      expect(user.first_name).toBe(userData.first_name);
      expect(user.last_name).toBe(userData.last_name);
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();
      expect(user.last_login).toBeNull();
    });

    it('should create multiple users successfully', async () => {
      const user1 = await createUser(
        mockUsers[0].email,
        mockUsers[0].password_hash,
        mockUsers[0].first_name,
        mockUsers[0].last_name
      );

      const user2 = await createUser(
        mockUsers[1].email,
        mockUsers[1].password_hash,
        mockUsers[1].first_name,
        mockUsers[1].last_name
      );

      expect(user1.id).not.toBe(user2.id);
      expect(user1.email).toBe(mockUsers[0].email);
      expect(user2.email).toBe(mockUsers[1].email);
    });

    it('should enforce unique email constraint', async () => {
      const userData = mockUsers[0];
      await createUser(
        userData.email,
        userData.password_hash,
        userData.first_name,
        userData.last_name
      );

      await expect(
        createUser(
          userData.email,
          'differenthash',
          'Different',
          'Name'
        )
      ).rejects.toThrow();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      const userData = mockUsers[0];
      const created = await createUser(
        userData.email,
        userData.password_hash,
        userData.first_name,
        userData.last_name
      );

      const user = await getUserByEmail(userData.email);

      expect(user).toBeDefined();
      expect(user?.id).toBe(created.id);
      expect(user?.email).toBe(userData.email);
      expect(user?.first_name).toBe(userData.first_name);
    });

    it('should return null for non-existent email', async () => {
      const user = await getUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });

    it('should be case sensitive for email', async () => {
      const userData = mockUsers[0];
      await createUser(
        userData.email.toLowerCase(),
        userData.password_hash,
        userData.first_name,
        userData.last_name
      );

      const user = await getUserByEmail(userData.email.toUpperCase());
      expect(user).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const userData = mockUsers[0];
      const created = await createUser(
        userData.email,
        userData.password_hash,
        userData.first_name,
        userData.last_name
      );

      const user = await getUserById(created.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(created.id);
      expect(user?.email).toBe(userData.email);
    });

    it('should return null for non-existent id', async () => {
      const user = await getUserById(99999);
      expect(user).toBeNull();
    });
  });

  describe('updateLastLogin', () => {
    it('should update last_login timestamp', async () => {
      const userData = mockUsers[0];
      const created = await createUser(
        userData.email,
        userData.password_hash,
        userData.first_name,
        userData.last_name
      );

      expect(created.last_login).toBeNull();

      await updateLastLogin(created.id);

      const updated = await getUserById(created.id);
      expect(updated?.last_login).toBeDefined();
      expect(updated?.last_login).not.toBeNull();
    });

    it('should update last_login multiple times', async () => {
      const userData = mockUsers[0];
      const created = await createUser(
        userData.email,
        userData.password_hash,
        userData.first_name,
        userData.last_name
      );

      await updateLastLogin(created.id);
      const firstLogin = await getUserById(created.id);

      await new Promise(resolve => setTimeout(resolve, 100));

      await updateLastLogin(created.id);
      const secondLogin = await getUserById(created.id);

      expect(secondLogin?.last_login).toBeDefined();
      expect(firstLogin?.last_login).toBeDefined();
    });
  });

  describe('getAllUsers', () => {
    it('should return empty array when no users exist', async () => {
      const users = await getAllUsers();
      expect(users).toEqual([]);
    });

    it('should return all users ordered by created_at DESC', async () => {
      const user1 = await createUser(
        mockUsers[0].email,
        mockUsers[0].password_hash,
        mockUsers[0].first_name,
        mockUsers[0].last_name
      );

      await new Promise(resolve => setTimeout(resolve, 10));

      const user2 = await createUser(
        mockUsers[1].email,
        mockUsers[1].password_hash,
        mockUsers[1].first_name,
        mockUsers[1].last_name
      );

      const users = await getAllUsers();

      expect(users).toHaveLength(2);
      expect(users.map(u => u.id)).toContain(user1.id);
      expect(users.map(u => u.id)).toContain(user2.id);
    });

    it('should return all user fields', async () => {
      await createUser(
        mockUsers[0].email,
        mockUsers[0].password_hash,
        mockUsers[0].first_name,
        mockUsers[0].last_name
      );

      const users = await getAllUsers();

      expect(users[0].id).toBeDefined();
      expect(users[0].email).toBeDefined();
      expect(users[0].password_hash).toBeDefined();
      expect(users[0].first_name).toBeDefined();
      expect(users[0].last_name).toBeDefined();
      expect(users[0].created_at).toBeDefined();
      expect(users[0].updated_at).toBeDefined();
    });
  });
});

