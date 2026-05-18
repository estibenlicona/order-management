import { createClient } from '@supabase/supabase-js';

const url = process.env['SUPABASE_URL'];
const anonKey = process.env['SUPABASE_ANON_KEY'];

if (url === undefined || url === '') {
  throw new Error('Missing SUPABASE_URL environment variable');
}
if (anonKey === undefined || anonKey === '') {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
