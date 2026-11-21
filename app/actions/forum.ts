'use server';
import {revalidatePath} from 'next/cache';
import {requireUser} from '@/lib/auth';
import {createAdminClient} from '@/lib/supabase/admin';
import {answerInput,ratingInput,reportInput} from '@/lib/forum-input';
import {rateHelper} from '@/lib/points';
export async function postAnswer(input:unknown){const {user}=await requireUser(),parsed=answerInput.safeParse(input);if(!parsed.success)return {error:'invalid' as const};const p=parsed.data;const {error}=await createAdminClient().rpc('post_forum_answer',{p_id:p.requestId,p_user:user.id,p_question:p.questionId,p_steps:p.steps});if(error)return {error:'save' as const};revalidatePath(`/forum/${p.questionId}`);revalidatePath('/forum');return {ok:true};}
export async function rateAnswer(input:unknown){const {user}=await requireUser(),parsed=ratingInput.safeParse(input);if(!parsed.success)return {error:'invalid' as const};try{await rateHelper(user.id,parsed.data.answerId,parsed.data.stars);revalidatePath('/forum','layout');revalidatePath('/dashboard');revalidatePath('/profile');return {ok:true};}catch{return {error:'save' as const};}}
export async function reportPost(input:unknown){const {user}=await requireUser(),parsed=reportInput.safeParse(input);if(!parsed.success)return {error:'invalid' as const};const {error}=await createAdminClient().rpc('report_forum_post',{p_user:user.id,p_type:parsed.data.targetType,p_target:parsed.data.targetId});return error?{error:'save' as const}:{ok:true};}
