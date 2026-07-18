import pg from 'pg';
import { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } from './env.js';

const { Pool } = pg;

const pool = new Pool({
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds not being used
  connectionTimeoutMillis: 5000, // if after 5 seconds not connect with database, throw error
});

pool.on('error', (err) => { // This event is emitted when a client is idle in the pool and an error occurs in the PostgreSQL server
  console.error('PostgreSQL pool error: ', err);
});

export const connectDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query('SELECT 1');
    console.log('Connected to PostgreSQL database');
  } finally {
    client.release(); // Release the client back to the pool
  }
};

export default pool;