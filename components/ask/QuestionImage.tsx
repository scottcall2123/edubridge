import 'server-only';
import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {createClient} from '@/lib/supabase/server';
import {validImagePath} from '@/lib/image-input';
export async function QuestionImage({path,userId,questionId}:{path:string|null;userId:string;questionId:string}){if(!path||!validImagePath(path,userId,questionId))return null;const client=await createClient(),{data,error}=await client.storage.from('question-images').createSignedUrl(path,300);const t=await getTranslations('ask');if(error||!data)return <p className="text-sm text-muted">{t('imageUnavailable')}</p>;return <figure className="space-y-2"><a href={data.signedUrl} target="_blank" rel="noopener noreferrer" className="inline-block rounded-xl focus-visible:outline-royal"><Image unoptimized src={data.signedUrl} width={800} height={600} className="max-h-96 w-full rounded-xl object-contain" alt={t('imageAlt')}/></a><figcaption className="text-xs text-muted">{t('imageHint')}</figcaption></figure>;}
