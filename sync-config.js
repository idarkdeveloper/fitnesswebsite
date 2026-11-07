/* Cloud sync settings. Leave empty to keep PulseFit fully local.
   Fill these in after creating the Supabase project (docs/SUPABASE_SETUP.md, step 4).
   Both values are PUBLIC by design: the anon key only works within the database's row-level
   security rules. Never put the service_role key (or any other secret) here. */
window.PF_SYNC_CONFIG = {
  url: '',      // e.g. 'https://abcdefghijklm.supabase.co'
  anonKey: '',  // Project Settings → API → "anon public" key
};
