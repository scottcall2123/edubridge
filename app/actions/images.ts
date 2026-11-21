'use server';
import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {requireUser} from '@/lib/auth';
import {ownedQuestion} from '@/lib/questions';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {imageMime,MAX_IMAGE_BYTES,validImagePath} from '@/lib/image-input';
export async function attachQuestionImage(input:unknown){const {user}=await requireUser(),parsed=z.object({questionId:z.uuid(),path:z.string().max(200)}).safeParse(input);if(!parsed.success)return {error:'imageInvalid' as const};const {questionId,path}=parsed.data;if(!validImagePath(path,user.id,questionId))return {error:'imageInvalid' as const};try{const q=await ownedQuestion(questionId,user.id);if(q.is_public||q.status!=='open')return {error:'imageInvalid' as const};const client=await createClient(),{data:file,error}=await client.storage.from('question-images').download(path);if(error||!file||file.size<1||file.size>MAX_IMAGE_BYTES||!imageMime(new Uint8Array(await file.arrayBuffer())))return {error:'imageInvalid' as const};const result=await createAdminClient().from('questions').update({image_url:path}).eq('id',q.id).eq('user_id',user.id).eq('status','open').select('id').single();if(result.error)return {error:'imageUpload' as const};if(q.image_url&&q.image_url!==path&&validImagePath(q.image_url,user.id,q.id))await client.storage.from('question-images').remove([q.image_url]);revalidatePath('/ask');revalidatePath(`/tutor/${q.id}`);return {ok:true};}catch{return {error:'imageUpload' as const};}}
