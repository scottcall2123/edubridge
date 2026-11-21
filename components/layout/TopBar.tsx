import Link from 'next/link';
import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {LanguageSwitcher} from './LanguageSwitcher';
import {UserMenu} from './UserMenu';
export async function TopBar({name,logout}:{name?:string;logout?:()=>Promise<void>}) {const t=await getTranslations('nav');return <header className="bg-navy text-white"><div className="container flex h-16 items-center justify-between gap-2"><Link href={name?'/dashboard':'/'}><Image src="/brand/edubridge-logo-horizontal-on-dark.svg" width={164} height={36} className="h-9 w-auto max-w-36 lg:max-w-none" alt="EduBridge" priority/></Link>{name&&<nav className="hidden items-center gap-3 xl:flex">{[['home','dashboard'],['ask','ask'],['teachers','teachers'],['forum','forum'],['leaderboard','leaderboard']].map(([key,path])=><Link key={key} href={`/${path}`} className="py-3 text-sm hover:underline">{t(key)}</Link>)}</nav>}<div className="flex items-center gap-2"><LanguageSwitcher/><UserMenu name={name} logout={logout}/></div></div></header>;}
