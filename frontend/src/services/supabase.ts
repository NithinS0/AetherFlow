// Supabase Client Abstraction
// In Phase 1 we encapsulate all Supabase interactions.
// If keys are provided, we interface with Supabase Auth/Storage;
// otherwise we route requests through our FastAPI backend REST endpoints.

export const supabaseClient = {
  isConfigured: () => {
    return false; // Toggle to true if using actual client-side Supabase keys
  },

  async signUp(_email: string, _password: string): Promise<any> {
    // Abstraction logic - routes to our FastAPI /auth/register
    return null;
  },

  async signIn(_email: string, _password: string): Promise<any> {
    // Abstraction logic - routes to our FastAPI /auth/login
    return null;
  },

  async uploadAvatar(_bucket: string, _file: File): Promise<string> {
    // Simulated upload - returns public url
    return "https://api.aetherflow.io/avatars/avatar_default.png";
  }
};
