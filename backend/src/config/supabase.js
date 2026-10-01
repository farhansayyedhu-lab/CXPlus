'use strict';

const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const isRealSupabaseConfig = Boolean(
  env.supabaseUrl &&
  !env.supabaseUrl.includes('your-project') &&
  env.supabaseServiceRoleKey &&
  !env.supabaseServiceRoleKey.includes('your-service-role-key')
);

let isSupabaseConnected = false;

const supabase = createClient(
  isRealSupabaseConfig ? env.supabaseUrl : 'https://cxpulse-mock.supabase.co',
  isRealSupabaseConfig ? env.supabaseServiceRoleKey : 'cxpulse-mock-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Test the Supabase connection by running a simple query.
 * Call this once at server startup.
 */
async function testConnection() {
  if (!isRealSupabaseConfig) {
    console.log('[supabase] Offline/Demo mode active (Configure .env for live Supabase PostgreSQL connection)');
    isSupabaseConnected = false;
    return;
  }

  try {
    const { error } = await Promise.race([
      supabase.from('users').select('id').limit(1),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 3000))
    ]);

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    isSupabaseConnected = true;
    console.log('[supabase] Connected to Supabase PostgreSQL ✓');
  } catch (err) {
    isSupabaseConnected = false;
    console.error('[supabase] Connection test failed:', err.message);
    console.error('[supabase] Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  }
}

module.exports = {
  supabase,
  testConnection,
  isRealSupabaseConfig: () => isRealSupabaseConfig,
  isConnected: () => isSupabaseConnected
};
