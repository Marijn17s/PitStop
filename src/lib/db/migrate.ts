import { readFileSync } from 'fs';
import { join } from 'path';
import pool from './index';

const migrations = [
  '001_create_users_table.sql',
  '002_create_cars_table.sql',
  '003_create_mechanics_table.sql',
  '004_create_services_table.sql',
  '005_create_service_mechanics_table.sql',
];

export async function runMigrations() {
  console.log('Running migrations...');
  
  for (const migration of migrations) {
    try {
      const filePath = join(process.cwd(), 'src', 'lib', 'db', 'migrations', migration);
      const sql = readFileSync(filePath, 'utf-8');
      await pool.query(sql);
      console.log(`✓ ${migration} executed successfully`);
    } catch (error) {
      console.error(`✗ Error running ${migration}:`, error);
      throw error;
    }
  }
  
  console.log('All migrations completed successfully!');
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

