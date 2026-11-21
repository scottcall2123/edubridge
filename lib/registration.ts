import {z} from 'zod';
export const DISTRICTS=['Farg‘ona sh.','Marg‘ilon','Qo‘qon','Quvasoy','Rishton','Oltiariq','Beshariq','Bag‘dod','Buvayda','Dang‘ara','Farg‘ona t.','Furqat','Qo‘shtepa','Toshloq','Uchko‘prik','O‘zbekiston t.','Yozyovon','So‘x'] as const;
export const PARENT_DEMO_CODE='4821';
export const phoneInput=z.string().transform(v=>v.replace(/[\s()-]/g,'')).pipe(z.string().regex(/^\+998\d{9}$/));
export const registrationInput=z.object({fullName:z.string().trim().min(2).max(100),email:z.email().max(254),password:z.string().min(8).max(128),grade:z.coerce.number().int().min(5).max(11),school:z.string().trim().min(2).max(100),district:z.enum(DISTRICTS),locale:z.enum(['uz','en','ru']),parentPhone:z.string().optional(),parentCode:z.string().optional()}).superRefine((value,ctx)=>{if(value.grade<=7&&(!phoneInput.safeParse(value.parentPhone).success||value.parentCode!==PARENT_DEMO_CODE))ctx.addIssue({code:'custom',path:['parentCode'],message:'Parent check required'});});
