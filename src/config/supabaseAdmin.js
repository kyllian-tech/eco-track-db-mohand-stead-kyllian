const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant")
}

// Client “admin” : bypass RLS (à protéger derrière ton API)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

console.log("✅ Using SUPABASE_URL:", process.env.SUPABASE_URL);


module.exports = { supabaseAdmin }

console.log("SUPABASE_URL =", process.env.SUPABASE_URL);
