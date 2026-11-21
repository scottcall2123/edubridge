import {getTranslations} from 'next-intl/server';
import {getCurrentUser} from '@/lib/auth';
import {loadLeaderboard} from '@/lib/leaderboard';
import {LeaderboardView} from '@/components/leaderboard/LeaderboardView';
export async function generateMetadata(){return {title:(await getTranslations('leaderboard'))('title')};}
export default async function Leaderboard(){const current=await getCurrentUser();return <LeaderboardView rows={await loadLeaderboard(current?.user.id)}/>;}
