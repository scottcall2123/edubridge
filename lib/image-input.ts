export const MAX_IMAGE_BYTES=5*1024*1024;
export function imageMime(bytes:Uint8Array):'image/png'|'image/jpeg'|null{if(bytes.length>=8&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n))return 'image/png';if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';return null;}
export function validImagePath(path:string,userId:string,questionId:string){return path.startsWith(`${userId}/${questionId}/`)&&/^[0-9a-f-]{36}\/(?:[0-9a-f-]{36})\/[0-9a-f-]{36}\.(png|jpg)$/.test(path);}
