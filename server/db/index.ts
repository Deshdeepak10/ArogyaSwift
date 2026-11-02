import pg from "pg";
const { Pool } = pg;

// Supabase PostgreSQL Connection Pool
const connectionString = process.env.DATABASE_URL;

let pool: pg.Pool | null = null;
let isConnected = false;

if (connectionString && connectionString.trim().length > 0 && !connectionString.includes("YOUR_")) {
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false }, // Required for Supabase cloud PostgreSQL
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on("error", (err) => {
    console.error("[Supabase DB Error] Unexpected pool error on idle client:", err.message);
  });

  // Test connection on startup
  pool
    .query("SELECT NOW() as current_time, current_database() as db_name")
    .then((res) => {
      isConnected = true;
      console.log(
        `[Supabase DB] Connected to PostgreSQL (${res.rows[0].db_name}) at ${res.rows[0].current_time}`
      );
    })
    .catch((err) => {
      isConnected = false;
      console.warn(
        `[Supabase DB] Could not connect to DATABASE_URL: ${err.message}. Running with fallback in-memory store.`
      );
    });
} else {
  console.log(
    "[Supabase DB] No DATABASE_URL provided in .env. Running in demo mode. Add DATABASE_URL to connect live Supabase."
  );
}

export async function query(text: string, params?: any[]) {
  if (!pool) {
    throw new Error(
      "Database not connected. Please provide DATABASE_URL in your .env file."
    );
  }
  return pool.query(text, params);
}

export function getDbStatus() {
  return {
    configured: Boolean(connectionString && !connectionString.includes("YOUR_")),
    connected: isConnected,
    provider: "Supabase PostgreSQL",
  };
}

export { pool };

