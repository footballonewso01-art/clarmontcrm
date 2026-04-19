import "dotenv/config";
import { Pool } from "pg";

async function checkDb() {
  const connectionString = process.env.DATABASE_URL;
  console.log(`Checking connection to: ${connectionString}`);
  
  const pool = new Pool({ connectionString });
  
  try {
    const res = await pool.query("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User'");
    const count = parseInt(res.rows[0].count);
    
    if (count === 0) {
      console.log("❌ Table 'User' DOES NOT EXIST.");
      console.log("Please run: npm run db:push");
    } else {
      console.log("✅ Table 'User' exists.");
    }
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  } finally {
    await pool.end();
  }
}

checkDb();
