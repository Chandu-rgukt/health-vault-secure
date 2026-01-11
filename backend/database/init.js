import db, { ready } from './db.js';

// Wait for database to be ready and create tables
async function initializeTables() {
  await ready();

  // Create profiles table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'viewer')),
      avatar_url TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create health_reports table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS health_reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      report_type TEXT NOT NULL,
      report_date DATE NOT NULL,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER,
      notes TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
    )
  `);

  // Create vitals table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS vitals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      vital_type TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT NOT NULL,
      recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
    )
  `);

  // Create shared_reports table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS shared_reports (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      shared_with_email TEXT NOT NULL,
      shared_with_user_id TEXT,
      access_type TEXT NOT NULL DEFAULT 'read' CHECK (access_type IN ('read')),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (report_id) REFERENCES health_reports(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES profiles(user_id) ON DELETE CASCADE,
      FOREIGN KEY (shared_with_user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
    )
  `);

  // Create users table for authentication (separate from profiles)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_health_reports_user_id ON health_reports(user_id);
    CREATE INDEX IF NOT EXISTS idx_vitals_user_id ON vitals(user_id);
    CREATE INDEX IF NOT EXISTS idx_shared_reports_owner_id ON shared_reports(owner_id);
    CREATE INDEX IF NOT EXISTS idx_shared_reports_shared_with_user_id ON shared_reports(shared_with_user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
  `);

  console.log('Database tables created/verified successfully');
}

// Export initialization function
export default initializeTables;
