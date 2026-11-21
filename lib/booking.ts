import {z} from 'zod';
export const bookingInput=z.object({slotId:z.uuid(),questionId:z.uuid().optional()});
export function localDay(value:Date|string){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tashkent',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));}
export function slotCandidates(now=new Date()){
 const day=localDay(now),result:string[]=[];
 for(let offset=0;offset<4;offset++){const date=new Date(Date.parse(`${day}T00:00:00Z`)+offset*86400000).toISOString().slice(0,10);for(const hour of ['09','14','17']){const at=new Date(`${date}T${hour}:00:00+05:00`);if(at>now)result.push(at.toISOString());}}
 return result;
}
export function slotLabel(startsAt:string,locale:string,t:(key:string)=>string,now=new Date()){
 const day=localDay(startsAt),today=localDay(now),tomorrow=localDay(new Date(now.getTime()+86400000));
 const date=day===today?t('today'):day===tomorrow?t('tomorrow'):new Intl.DateTimeFormat(locale,{timeZone:'Asia/Tashkent',day:'numeric',month:'short'}).format(new Date(startsAt));
 return `${date} ${new Intl.DateTimeFormat(locale,{timeZone:'Asia/Tashkent',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(startsAt))}`;
}
