import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('FATAL: DATABASE_URL environment variable is not set');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const pool = new Pool({
  connectionString: connectionString || 'postgresql://postgres:password@localhost:5432/lazyscaper',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('Database connection pool created');
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Failed to connect to database on startup:', err.message);
  } else {
    console.log('Database connection verified');
  }
});

export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params as any);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', { text, error });
    throw error;
  }
};

export const getClient = async () => {
  return pool.connect();
};

export default pool;
