// ViralReels AI - Supabase Configuration
// Replace these placeholders with your actual Supabase Project URL and Anon Public Key.
// Find them in: Supabase Dashboard -> Project Settings -> API

window.VIRALREELS_CONFIG = {
  SUPABASE_URL: "https://cypbwmpcjrcfjuhlwwaj.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable__DwxFlAHxIUi8Zy2nUY2qg_vUiTu6rt",
  APP_NAME: "ViralReels AI",
  DEMO_STORAGE_KEY: "viralreels_demo_user"
};

window.isSupabaseConfigured = function () {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.VIRALREELS_CONFIG;
  return (
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes("YOUR_SUPABASE") &&
    !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE")
  );
};

window.getSupabaseClient = function () {
  if (!window.isSupabaseConfigured() || typeof window.supabase === "undefined") {
    return null;
  }
  if (!window._supabaseClient) {
    window._supabaseClient = window.supabase.createClient(
      window.VIRALREELS_CONFIG.SUPABASE_URL,
      window.VIRALREELS_CONFIG.SUPABASE_ANON_KEY
    );
  }
  return window._supabaseClient;
};
