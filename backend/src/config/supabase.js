'use strict';

const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Test the Supabase connection by running a simple query.
 * Call this once at server startup.
 */
async function testConnection() {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows — that's fine
      throw error;
    }
    console.log('[supabase] Connected to Supabase PostgreSQL ✓');
  } catch (err) {
    console.error('[supabase] Connection test failed:', err.message);
    console.error('[supabase] Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  }
}

module.exports = { supabase, testConnection };
