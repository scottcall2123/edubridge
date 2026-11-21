'use client';
import {useState,useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {Button,Card} from '@/components/ui';
import {uploadQuestionImage} from '@/lib/upload-image';
export function PhotoRetry({questionId}:{questionId:string}){const t=useTranslations(),router=useRouter(),[file,setFile]=useState<File|null>(null),[pending,start]=useTransition(),[error,setError]=useState('');return <Card className="space-y-4"><p>{t('ask.imageUpload')}</p><label htmlFor="retry-photo">{t('ask.image')}</label><input id="retry-photo" type="file" accept="image/png,image/jpeg" onChange={e=>setFile(e.target.files?.[0]??null)}/><Button disabled={!file||pending} onClick={()=>{setError('');start(async()=>{try{await uploadQuestionImage(questionId,file!);router.refresh();}catch{setError('imageUpload');}});}}>{t(pending?'common.loading':'ask.uploadImage')}</Button>{error&&<p role="alert" className="text-danger">{t(`ask.${error}`)}</p>}</Card>;}
