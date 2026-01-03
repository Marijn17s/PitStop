CREATE TABLE IF NOT EXISTS "PitStop_direction".service_mechanics (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES "PitStop_direction".service(id) ON DELETE CASCADE,
  mechanic_id INTEGER NOT NULL REFERENCES "PitStop_direction".mechanic(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(service_id, mechanic_id)
);

CREATE INDEX IF NOT EXISTS idx_service_mechanics_service_id ON "PitStop_direction".service_mechanics(service_id);
CREATE INDEX IF NOT EXISTS idx_service_mechanics_mechanic_id ON "PitStop_direction".service_mechanics(mechanic_id);
