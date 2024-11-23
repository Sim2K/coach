import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpoymiyamqnfkpucxjcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwb3ltaXlhbXFuZmtwdWN4amN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg2MTAyMzUsImV4cCI6MjA0NDE4NjIzNX0.W__VFHZhwY8pyeneTqCLNd5dDpy-cP2KKrIBhgZkMmo';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});