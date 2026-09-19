import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { UserProfile } from '../types';

// Load Supabase credentials from client environment or local storage override
const metaEnv = (import.meta as any).env || {};
const envSupabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const envSupabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

// Allow runtime user override if they want to connect their Supabase project live during demo
const storedSupabaseUrl = typeof window !== 'undefined' ? localStorage.getItem('ecowise_supabase_url') || '' : '';
const storedSupabaseKey = typeof window !== 'undefined' ? localStorage.getItem('ecowise_supabase_key') || '' : '';

export const supabaseUrl = storedSupabaseUrl || envSupabaseUrl;
export const supabaseAnonKey = storedSupabaseKey || envSupabaseAnonKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  supabaseUrl.startsWith('https://')
);

// Fallback mock user for immediate hackathon testing/judging
export const DEMO_FACILITY_MANAGER: UserProfile = {
  id: 'demo-facility-mgr-01',
  email: 'marcus.vance@ecowise.ai',
  name: 'Marcus Vance',
  role: 'Lead Sustainability Engineer',
  organization: 'Apex BioTower & Schneider Campus',
  buildingAssigned: 'EcoTower Delta (Zone 4)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  provider: 'demo',
};

let clientInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Supabase client initialization warning:', error);
  }
}

export const supabase = clientInstance;

/**
 * Maps a Supabase user or demo profile into our standard UserProfile
 */
export function mapSupabaseUserToProfile(user: SupabaseUser): UserProfile {
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || 'user@ecowise.ai',
    name: meta.full_name || meta.name || user.email?.split('@')[0] || 'Facility Manager',
    avatarUrl: meta.avatar_url || meta.picture || undefined,
    role: meta.role || 'Facility Operations Manager',
    organization: meta.organization || 'Smart Campus Operations',
    buildingAssigned: meta.building || 'Tower A - Main Complex',
    provider: (user.app_metadata?.provider as any) || 'email',
  };
}

/**
 * Saves custom Supabase credentials to localStorage and reloads
 */
export function saveSupabaseConfig(url: string, key: string) {
  if (url.trim()) {
    localStorage.setItem('ecowise_supabase_url', url.trim());
  } else {
    localStorage.removeItem('ecowise_supabase_url');
  }
  if (key.trim()) {
    localStorage.setItem('ecowise_supabase_key', key.trim());
  } else {
    localStorage.removeItem('ecowise_supabase_key');
  }
}

/**
 * Computes the OAuth redirect URL using the active window origin
 */
export function getOAuthRedirectUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

/**
 * Trigger Supabase Google OAuth
 */
export async function signInWithGoogleOAuth(): Promise<{ data?: any; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const redirectUrl = getOAuthRedirectUrl();
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

    if (isInIframe) {
      // In an iframe, browser navigation is restricted and external redirects trigger 403 on ais-dev-.
      // Use skipBrowserRedirect and open Google OAuth in a popup/new window.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) return { error: error.message };
      if (data?.url) {
        // Open Google OAuth authorization directly
        window.open(data.url, '_blank');
        return { data: { redirected: true } };
      }
      return { data };
    } else {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) return { error: error.message };
      return { data };
    }
  } else {
    // If Supabase is not configured with live API keys yet, simulate the Google OAuth experience
    // with a real Google facility manager profile
    await new Promise((resolve) => setTimeout(resolve, 850));
    const googleDemoUser: UserProfile = {
      id: 'google-oauth-demo-user',
      email: 'rajugumadal@gmail.com',
      name: 'Raju Gumadal',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Director of Smart Infrastructure',
      organization: 'GreenTech Global Facilities',
      buildingAssigned: 'Metropolis EcoHub Plaza',
      provider: 'google',
    };
    localStorage.setItem('ecowise_session_user', JSON.stringify(googleDemoUser));
    return { data: googleDemoUser };
  }
}
