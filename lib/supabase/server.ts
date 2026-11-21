import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
export function isSupabaseConfigured(){return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);}
export async function createClient(){const jar=await cookies();return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>jar.getAll(),setAll(values){try{values.forEach(({name,value,options})=>jar.set(name,value,options));}catch{/* Read-only Server Components rely on middleware for refresh. */}}}});}
