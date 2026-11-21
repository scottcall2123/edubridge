import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
const manrope = Manrope({subsets:['latin','latin-ext','cyrillic'],weight:['400','500','600','700','800'],variable:'--font-manrope'});
export const metadata: Metadata = {title:{default:'EduBridge — Bilimga ko‘prik',template:'EduBridge — %s'},description:'EduBridge — Bilimga ko‘prik',icons:{icon:[{url:'/brand/favicon-16.png',sizes:'16x16'},{url:'/brand/favicon-32.png',sizes:'32x32'}],apple:'/brand/favicon-192.png'},manifest:'/manifest.webmanifest'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="uz" className={manrope.variable}><body>{children}</body></html>;}
