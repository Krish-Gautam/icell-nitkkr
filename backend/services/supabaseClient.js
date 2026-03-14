import dotenv from "dotenv"
dotenv.config()
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY



// ✅ Fail fast with a clear message if env vars are missing
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ FATAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in backend/.env");
  process.exit(1);
}





const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase