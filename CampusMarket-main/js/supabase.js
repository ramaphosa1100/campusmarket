
const SUPABASE_URL = "https://trjkotguvidbyvzhenau.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Sz-AnMeC-IOf-7cg2qJl1Q_i0yc6ie6";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("CampusMarket Supabase connection initialized!");
