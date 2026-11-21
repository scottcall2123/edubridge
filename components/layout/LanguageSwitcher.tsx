'use client';
import {useTransition} from 'react';
import {useLocale,useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {setLocale} from '@/app/actions/locale';
import {locales} from '@/lib/i18n';
export function LanguageSwitcher(){const locale=useLocale(),t=useTranslations('common'),router=useRouter();const [pending,start]=useTransition();return <div role="group" aria-label={t('language')} className="flex rounded-xl border border-white/25 p-1">{locales.map(l=><button key={l} aria-pressed={l===locale} disabled={pending} onClick={()=>start(async()=>{await setLocale(l);router.refresh();})} className={`min-h-11 min-w-11 rounded-lg text-xs font-bold ${l===locale?'bg-white text-navy':'text-white hover:bg-white/10'}`}>{l.toUpperCase()}</button>)}</div>;}
