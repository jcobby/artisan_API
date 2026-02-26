import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || "";

export const supabase = createClient(
    supabaseUrl,
    process.env.SUPABASE_KEY || ''
);