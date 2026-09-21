// Lovable often rewrites this file when Cloud is enabled or the backend is
// reconnected. Keep URL/key resolution in ./env so prerender, robots.txt and
// HTML preconnect follow VITE_SUPABASE_* even if this file is regenerated.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './env';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY };
