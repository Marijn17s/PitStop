CREATE TABLE IF NOT EXISTS "PitStop_direction".service (
  id SERIAL PRIMARY KEY,
  car_id INTEGER NOT NULL REFERENCES "PitStop_direction".car(id) ON DELETE CASCADE,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_car_id ON "PitStop_direction".service(car_id);
CREATE INDEX IF NOT EXISTS idx_service_status ON "PitStop_direction".service(status);
CREATE INDEX IF NOT EXISTS idx_service_start_date ON "PitStop_direction".service(start_date);
