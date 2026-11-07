/* Cloud sync settings (docs/SUPABASE_SETUP.md, step 7). Empty values keep PulseFit fully local.
   Both values are PUBLIC by design: the publishable key only works within the database's
   row-level security rules. Never put the service_role / secret key (or any other secret) here. */
window.PF_SYNC_CONFIG = {
  url: 'https://ojfkaauancoydrsulpph.supabase.co',
  anonKey: 'sb_publishable_ngAczA03DS88vhh22htHkA_z8yagnbT',  // publishable key (public by design)
};
