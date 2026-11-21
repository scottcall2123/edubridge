'use server';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {createClient,isSupabaseConfigured} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {registrationInput,phoneInput,PARENT_DEMO_CODE} from '@/lib/registration';
import {signParentCheck,verifyParentCheck} from '@/lib/parent-check';
export async function startParentCheck(phone:string){const parsed=phoneInput.safeParse(phone);if(!parsed.success)return {error:'phone' as const};const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!secret)return {error:'setup' as const};const client=await createClient();await client.auth.getUser();(await cookies()).set('parent_demo_check',signParentCheck(parsed.data,secret),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',maxAge:600,path:'/'});return {code:PARENT_DEMO_CODE};}
export type RegistrationState={error?:'invalid'|'parent'|'exists'|'setup'|'save'|'created'};
export async function register(_state:RegistrationState,form:FormData):Promise<RegistrationState>{
 if(!isSupabaseConfigured()||!process.env.SUPABASE_SERVICE_ROLE_KEY)return {error:'setup'};
 const client=await createClient(),{data:{user}}=await client.auth.getUser();if(user)redirect('/dashboard');
 const parsed=registrationInput.safeParse(Object.fromEntries([...form.entries()].filter(([,v])=>typeof v==='string')));if(!parsed.success)return {error:'invalid'};
 const p=parsed.data,phone=p.grade<=7?phoneInput.parse(p.parentPhone):null,jar=await cookies();if(phone&&!verifyParentCheck(jar.get('parent_demo_check')?.value,phone,process.env.SUPABASE_SERVICE_ROLE_KEY!))return {error:'parent'};
 const admin=createAdminClient();const created=await admin.auth.admin.createUser({email:p.email,password:p.password,email_confirm:true});if(created.error||!created.data.user)return {error:created.error?.code?.includes('email')?'exists':'save'};
 const id=created.data.user.id;const profile=await admin.from('profiles').insert({id,full_name:p.fullName,grade:p.grade,school:p.school,district:p.district,locale:p.locale,parent_phone:phone});
 if(profile.error){await admin.auth.admin.deleteUser(id);return {error:'save'};}
 const {error}=await client.auth.signInWithPassword({email:p.email,password:p.password});if(error)return {error:'created'};
 jar.delete('parent_demo_check');jar.set('NEXT_LOCALE',p.locale,{httpOnly:true,path:'/',maxAge:31536000,sameSite:'lax',secure:process.env.NODE_ENV==='production'});redirect('/dashboard');
}
