import {redirect} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {getCurrentUser} from '@/lib/auth';
import {Card} from '@/components/ui';
import {RegisterForm} from '@/components/auth/RegisterForm';
export async function generateMetadata(){return {title:(await getTranslations('common'))('register')};}
export default async function Register(){if(await getCurrentUser())redirect('/dashboard');const t=await getTranslations();return <main className="container py-10"><Card className="mx-auto max-w-xl space-y-6"><h1>{t('common.register')}</h1><p className="text-muted">{t('common.tagline')}</p><RegisterForm/></Card></main>;}
