export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
}

export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  license_plate: string | null;
  owner: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Mechanic {
  id: number;
  first_name: string;
  last_name: string;
  years_experience: number;
  email: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  id: number;
  car_id: number;
  start_date: Date;
  end_date: Date | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ServiceMechanic {
  id: number;
  service_id: number;
  mechanic_id: number;
  created_at: Date;
}

export interface ServiceWithDetails extends Service {
  car: Car;
  mechanics: Mechanic[];
}

export interface CarWithServices extends Car {
  services: Service[];
}

export interface MechanicWithServices extends Mechanic {
  services: ServiceWithDetails[];
}

