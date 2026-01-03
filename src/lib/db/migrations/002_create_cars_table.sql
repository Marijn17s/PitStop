CREATE TABLE IF NOT EXISTS "PitStop_direction".car (
  id SERIAL PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(50) NOT NULL,
  license_plate VARCHAR(20),
  owner VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_car_brand ON "PitStop_direction".car(brand);
CREATE INDEX IF NOT EXISTS idx_car_model ON "PitStop_direction".car(model);
CREATE INDEX IF NOT EXISTS idx_car_owner ON "PitStop_direction".car(owner);
