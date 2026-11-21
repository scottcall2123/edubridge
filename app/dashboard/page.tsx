import Link from 'next/link';
import {Flame,Star,MessageCircleQuestion,ArrowRight,History,BookOpen} from 'lucide-react';
import {getLocale,getTranslations,getFormatter} from 'next-intl/server';
import {requireUser} from '@/lib/auth';
import {loadDashboard} from '@/lib/dashboard';
import {Card,Tag,ProgressRing,Avatar} from '@/components/ui';
export async function generateMetadata(){const t=await getTranslations('nav');return {title:t('home')};}
export default async function Dashboard(){
 const {user}=await requireUser();const {profile,recent,goalDone,leaders}=await loadDashboard(user.id);
 const t=await getTranslations(),format=await getFormatter(),locale=await getLocale(),now=new Date();
 return <main className="container py-8"><div className="grid gap-6 md:grid-cols-3">
 <Card className="space-y-5 md:col-span-2"><p className="eyebrow">{t('common.tagline')}</p><h1>{t('dashboard.hello',{name:profile.full_name.split(' ')[0]})}</h1><p className="text-muted">{t('dashboard.subtitle')}</p><Link href="/ask" className="button button-primary"><MessageCircleQuestion/>{t('nav.ask')}</Link></Card>
 <Card className="space-y-3"><Flame className="text-gold"/><p className="text-4xl font-extrabold">{profile.streak_days}</p><h2>{t('dashboard.streak')}</h2>{profile.is_demo&&<Tag>{t('common.sample')}</Tag>}<p className="text-sm text-muted">{t('dashboard.streakHint')}</p></Card>
 <Card className="space-y-3"><Star className="text-gold"/><p className="text-4xl font-extrabold">{format.number(profile.points)}</p><h2>{t('dashboard.points')}</h2><Link href="/profile#points" className="inline-flex min-h-11 items-center gap-2 font-bold text-royal"><History/>{t('dashboard.history')}</Link></Card>
 <Card className="space-y-4"><h2>{t('dashboard.goal')}</h2><ProgressRing value={goalDone?1:0} label={t('dashboard.goalLabel',{value:goalDone?1:0})}/><p className="text-sm text-muted">{t('dashboard.goalText')}</p></Card>
 <Card className="space-y-4"><BookOpen/><h2>{t('dashboard.lessons')}</h2><Tag>{t('common.soon')}</Tag><p className="text-sm text-muted">{t('dashboard.lessonsText')}</p></Card>
 <Card className="space-y-5 md:col-span-2"><h2>{t('dashboard.activity')}</h2>{recent.length?<ul className="divide-y divide-line">{recent.map(e=><li key={e.id} className="flex items-start gap-3 py-4"><Star className={e.points<0?'text-muted':'text-gold'}/><div className="min-w-0 flex-1 space-y-1"><p>{t(`events.${e.reason}`)}</p><p className="text-xs text-muted"><time dateTime={e.created_at} title={new Intl.DateTimeFormat(locale,{timeZone:'Asia/Tashkent',dateStyle:'medium',timeStyle:'short'}).format(new Date(e.created_at))}>{format.relativeTime(new Date(e.created_at),now)}</time></p>{e.is_sample&&<Tag>{t('common.sample')}</Tag>}</div><span className="font-bold">{e.points>0?'+':''}{e.points}</span></li>)}</ul>:<p className="text-muted">{t('dashboard.noActivity')}</p>}</Card>
 <Card className="space-y-4"><h2>{t('dashboard.top5')}</h2>{leaders.length?<ol className="space-y-4">{leaders.map((p,i)=><li key={`${p.full_name}-${i}`} className="flex items-start gap-3"><Avatar name={p.full_name}/><div className="min-w-0"><p className="font-bold">{i+1}. {p.full_name}</p><p className="text-xs text-muted">{p.school} · {p.district}</p><p className="text-sm">{p.points} {t('dashboard.points')}</p>{p.is_sample&&<Tag>{t('common.sample')}</Tag>}</div></li>)}</ol>:<p>{t('dashboard.noLeaders')}</p>}<Link className="inline-flex min-h-11 items-center gap-2 font-bold text-royal" href="/leaderboard">{t('nav.leaderboard')}<ArrowRight/></Link></Card>
 <Card className="md:col-span-3"><details><summary className="min-h-11 cursor-pointer text-lg font-bold">{t('dashboard.rules')}</summary><ul className="mt-4 grid gap-3 text-sm text-muted md:grid-cols-2">{['daily_visit','question_asked','forum_helped','ai_understood','helper_star','booking_made','streak_loss'].map(r=><li key={r}>{t(`dashboard.rule_${r}`)}</li>)}</ul></details></Card>
 </div></main>;
}
