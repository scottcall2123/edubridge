import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale} from 'next-intl/server';
import {TopBar} from '@/components/layout/TopBar';
const manrope = Manrope({subsets:['latin','latin-ext','cyrillic'],weight:['400','500','600','700','800'],variable:'--font-manrope'});
export const metadata: Metadata = {title:{default:'EduBridge — Bilimga ko‘prik',template:'EduBridge — %s'},description:'EduBridge — Bilimga ko‘prik',icons:{icon:[{url:'/brand/favicon-16.png',sizes:'16x16'},{url:'/brand/favicon-32.png',sizes:'32x32'}],apple:'/brand/favicon-192.png'},manifest:'/manifest.webmanifest'};
export default async function RootLayout({children}:{children:React.ReactNode}) {const locale=await getLocale();return <html lang={locale} className={manrope.variable}><body><NextIntlClientProvider><TopBar/>{children}</NextIntlClientProvider></body></html>;}
