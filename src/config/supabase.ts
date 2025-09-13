import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Enhanced validation for Supabase configuration
export const isSupabaseConfigured =
  Boolean(
    url && 
    key && 
    url.startsWith('https://') && 
    url.includes('.supabase.co') &&
    url.length > 25 && // Ensure URL is not just a placeholder
    key.length > 40 && // Ensure key is not just a placeholder
    !url.includes('YOUR-PROJECT') && // Check for placeholder text
    !url.includes('your-project') &&
    !url.includes('YOUR_PROJECT') &&
    !key.includes('YOUR_ANON') &&
    !key.includes('your-anon') &&
    !key.includes('YOUR-ANON') &&
    !key.includes('ANON_PUBLIC_KEY') &&
    !key.includes('your-supabase') &&
    !key.includes('YOUR-SUPABASE') &&
    url !== 'https://YOUR-PROJECT.supabase.co' &&
    key !== 'YOUR_ANON_PUBLIC_KEY' &&
    key !== 'your-anon-key' &&
    key !== 'YOUR-ANON-KEY'
  )

console.log('🔍 Supabase URL present:', !!url)
console.log('🔍 Supabase URL format valid:', url ? url.startsWith('https://') && url.includes('.supabase.co') : false)
console.log('🔍 Supabase Key present:', !!key)
console.log('🔍 Supabase Key length:', key ? key.length : 0)
console.log('🔍 Overall Configured:', isSupabaseConfigured ? '✅' : '❌')

// Log the actual URL (masked) for debugging
if (url) {
  const maskedUrl = url.replace(/https:\/\/([^.]+)/, 'https://***');
  console.log('🔍 Supabase URL (masked):', maskedUrl);
}

export const supabase: SupabaseClient | null =
  isSupabaseConfigured ? createClient(url!, key!) : null

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}