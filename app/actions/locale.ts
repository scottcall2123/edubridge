'use server';
import {cookies} from 'next/headers';
import {z} from 'zod';
export async function setLocale(value:string) {const locale=z.enum(['uz','en','ru']).parse(value);(await cookies()).set('NEXT_LOCALE',locale,{maxAge:31536000,path:'/',sameSite:'lax',httpOnly:true,secure:process.env.NODE_ENV==='production'});}
