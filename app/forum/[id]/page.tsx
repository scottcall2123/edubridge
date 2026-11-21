import Link from 'next/link';
import {notFound} from 'next/navigation';
import {z} from 'zod';
import {getLocale,getTranslations} from 'next-intl/server';
import {getCurrentUser} from '@/lib/auth';
import {loadForumDetail} from '@/lib/forum';
import {Card,Tag} from '@/components/ui';
import {AnswerForm,RateAnswer,ReportButton} from '@/components/forum/ForumControls';
import type {Locale} from '@/lib/i18n';
export async function generateMetadata(){return {title:(await getTranslations('forum'))('title')};}
export default async function ForumDetail({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();const current=await getCurrentUser(),data=await loadForumDetail(id,current?.user.id);if(!data)notFound();const t=await getTranslations(),locale=await getLocale() as Locale;return <main className="container max-w-3xl space-y-6 py-8"><Link href="/forum" className="inline-flex min-h-11 items-center font-bold text-royal">{t('forum.back')}</Link><Card className="space-y-4"><div className="flex flex-wrap gap-2"><Tag>{data.subject[`name_${locale}`]}</Tag>{data.topic&&<Tag>{data.topic[`title_${locale}`]}</Tag>}{data.question.is_sample&&<Tag>{t('common.sample')}</Tag>}</div><h1 className="break-words">{data.question.text}</h1>{current&&<ReportButton targetId={id} targetType="question"/>}</Card><h2>{t('forum.answers',{count:data.answers.length})}</h2>{data.answers.map(a=><Card key={a.id} className="space-y-4"><div className="flex flex-wrap items-center gap-2"><p className="font-bold">{a.author_name}</p>{a.is_sample&&<Tag>{t('common.sample')}</Tag>}</div><ol className="list-decimal space-y-3 pl-6">{a.steps.map((s,i)=><li className="whitespace-pre-wrap break-words" key={i}>{s}</li>)}</ol><p className="text-sm">{a.stars?t('forum.rating',{n:a.stars}):t('forum.unrated')}</p>{a.canRate&&<RateAnswer answerId={a.id}/>} {current&&<ReportButton targetId={a.id} targetType="answer"/>}</Card>)}{!data.answers.length&&<Card>{t('forum.noAnswers')}</Card>}<Card>{current?<AnswerForm questionId={id}/>:<Link href="/login" className="button button-primary">{t('forum.loginToAnswer')}</Link>}</Card></main>;}
