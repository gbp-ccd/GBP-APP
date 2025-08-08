import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://xlnuivlsdzwbejkfeijh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsbnVpdmxzZHp3YmVqa2ZlaWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTc0NjUsImV4cCI6MjA1ODU3MzQ2NX0.q8DlJA3ouiwbNlwa5rF5Mq2zfo27ptL6NauLdWRhm2c'
);