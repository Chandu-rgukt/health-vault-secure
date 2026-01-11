import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'health_vault.db');

let SQL = null;
let dbInstance = null;
let dbReady = false;
const initPromise = initializeDatabase();

// Initialize SQL.js and load/create database
async function initializeDatabase() {
  if (dbReady && dbInstance) {
    return dbInstance;
  }

  try {
    // Initialize SQL.js - for Node.js, it will find the WASM in node_modules automatically
    // If that doesn't work, we'll provide a path
    try {
      SQL = await initSqlJs();
    } catch (error) {
      // Fallback: try to locate WASM file in node_modules
      const wasmPath = path.join(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm');
      if (fs.existsSync(wasmPath)) {
        SQL = await initSqlJs({
          locateFile: () => wasmPath,
        });
      } else {
        // Last resort: use CDN (will work if Node.js has fetch or with node-fetch)
        SQL = await initSqlJs({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/${file}`,
        });
      }
    }

    // Load existing database or create new one
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      dbInstance = new SQL.Database(new Uint8Array(buffer));
      console.log('Database loaded from file');
    } else {
      dbInstance = new SQL.Database();
      console.log('New database created');
    }

    // Enable foreign keys
    dbInstance.run('PRAGMA foreign_keys = ON');
    dbReady = true;

    return dbInstance;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Wait for database to be ready
export const ready = async () => {
  await initPromise;
  return dbInstance;
};

// Save database to file
function saveDatabase() {
  if (!dbInstance || !dbReady) {
    console.warn('Database not initialized, cannot save');
    return;
  }
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Ensure database is ready (call before using)
async function ensureReady() {
  if (!dbReady) {
    await initPromise;
  }
  if (!dbInstance) {
    throw new Error('Database initialization failed');
  }
}

// Wrapper to provide better-sqlite3-like API
export default {
  exec: async (sql) => {
    await ensureReady();
    dbInstance.run(sql);
    saveDatabase();
  },
  prepare: (sql) => {
    // Database should be ready by now (initialized before routes are loaded)
    // But check anyway for safety
    if (!dbReady || !dbInstance) {
      throw new Error('Database not initialized. Server initialization error.');
    }

    return {
      get: (...params) => {
        const stmt = dbInstance.prepare(sql);
        try {
          // sql.js bind() accepts parameters as individual arguments or array
          if (params.length > 0) {
            stmt.bind(Array.isArray(params[0]) ? params[0] : params);
          }
          const hasRow = stmt.step();
          if (!hasRow) {
            stmt.free();
            return null;
          }
          // Get result as object (sql.js returns array of values)
          const columns = stmt.getColumnNames();
          const values = stmt.get();
          stmt.free();
          
          // Convert array to object
          const result = {};
          columns.forEach((col, idx) => {
            result[col] = values[idx];
          });
          return result;
        } catch (error) {
          stmt.free();
          throw error;
        }
      },
      all: (...params) => {
        const stmt = dbInstance.prepare(sql);
        try {
          if (params.length > 0) {
            stmt.bind(Array.isArray(params[0]) ? params[0] : params);
          }
          const columns = stmt.getColumnNames();
          const results = [];
          while (stmt.step()) {
            const values = stmt.get();
            const obj = {};
            columns.forEach((col, idx) => {
              obj[col] = values[idx];
            });
            results.push(obj);
          }
          stmt.free();
          return results;
        } catch (error) {
          stmt.free();
          throw error;
        }
      },
      run: (...params) => {
        const stmt = dbInstance.prepare(sql);
        try {
          if (params.length > 0) {
            stmt.bind(Array.isArray(params[0]) ? params[0] : params);
          }
          stmt.step();
          const changes = dbInstance.getRowsModified();
          stmt.free();
          saveDatabase(); // Auto-save after modifications
          return { changes };
        } catch (error) {
          stmt.free();
          throw error;
        }
      },
    };
  },
  pragma: (setting) => {
    if (!dbReady) {
      throw new Error('Database not initialized');
    }
    dbInstance.run(`PRAGMA ${setting}`);
  },
  ready: initPromise,
  saveDatabase,
};
