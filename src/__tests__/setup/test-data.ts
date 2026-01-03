import { Car, Mechanic, Service, User } from '@/types';

export const mockUsers: Omit<User, 'id' | 'created_at' | 'updated_at' | 'last_login'>[] = [
  {
    email: 'john@example.com',
    password_hash: '$2a$10$mockhashedpassword1',
    first_name: 'John',
    last_name: 'Doe',
  },
  {
    email: 'jane@example.com',
    password_hash: '$2a$10$mockhashedpassword2',
    first_name: 'Jane',
    last_name: 'Smith',
  },
];

export const mockCars: Omit<Car, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    brand: 'Toyota',
    model: 'Camry',
    year: 2020,
    color: 'Blue',
    license_plate: 'ABC-123',
    owner: 'John Doe',
  },
  {
    brand: 'Honda',
    model: 'Civic',
    year: 2021,
    color: 'Red',
    license_plate: 'XYZ-789',
    owner: 'Jane Smith',
  },
  {
    brand: 'Ford',
    model: 'Mustang',
    year: 2019,
    color: 'Black',
    license_plate: null,
    owner: null,
  },
];

export const mockMechanics: Omit<Mechanic, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    first_name: 'Mike',
    last_name: 'Johnson',
    years_experience: 10,
    email: 'mike@pitstop.com',
  },
  {
    first_name: 'Sarah',
    last_name: 'Williams',
    years_experience: 5,
    email: 'sarah@pitstop.com',
  },
  {
    first_name: 'Tom',
    last_name: 'Brown',
    years_experience: 15,
    email: null,
  },
];

export function getMockService(carId: number): Omit<Service, 'id' | 'created_at' | 'updated_at'> {
  return {
    car_id: carId,
    start_date: new Date('2024-01-15'),
    end_date: new Date('2024-01-16'),
    status: 'completed',
    notes: 'Oil change and tire rotation',
  };
}

export function getMockServiceInProgress(carId: number): Omit<Service, 'id' | 'created_at' | 'updated_at'> {
  return {
    car_id: carId,
    start_date: new Date('2024-02-01'),
    end_date: null,
    status: 'in_progress',
    notes: 'Brake inspection',
  };
}

