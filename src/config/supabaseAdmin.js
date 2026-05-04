const { getSupabaseAdmin } = require("../utils/supabase");

module.exports = {
  get supabaseAdmin() {
    return getSupabaseAdmin();
  },
};
