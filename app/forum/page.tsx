import {getTranslations} from 'next-intl/server';
import {loadForum} from '@/lib/forum';
import {ForumList} from '@/components/forum/ForumList';
export async function generateMetadata(){return {title:(await getTranslations('forum'))('title')};}
export default async function Forum({searchParams}:{searchParams:Promise<{subject?:string}>}){const data=await loadForum(),{subject}=await searchParams;return <ForumList {...data} selected={data.subjects.some(s=>s.slug===subject)?subject:''}/>;}
