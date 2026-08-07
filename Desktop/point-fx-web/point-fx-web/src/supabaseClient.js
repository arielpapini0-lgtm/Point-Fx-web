import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sbptfdzxducvstmanlnx.supabase.co'
const supabaseAnonKey = 'sb_publishable_iGQo-_p7TtNfOGenwa1FuQ_ZjHR0rhu'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)