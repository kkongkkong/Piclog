import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing',
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage Buckets
export const PHOTOS_BUCKET = 'photos';
export const STICKERS_BUCKET = 'stickers';

// Tables
export const PHOTOS_TABLE = 'photos';
export const DECORATIONS_TABLE = 'decorations';
export const PHOTO_POSITIONS_TABLE = 'photo_positions';
export const TEXT_ITEMS_TABLE = 'text_items';
