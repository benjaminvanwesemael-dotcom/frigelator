import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xptfmsjtvyrwjrhtwjqf.supabase.co'
const supabaseAnonKey = 'sb_publishable_ArTPKQKWMlGj1nyqXKvf_g__S_HG0Jg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)