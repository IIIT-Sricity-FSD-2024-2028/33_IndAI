import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
const key = process.env.MEDIA_URL_SECRET || process.env.JWT_SECRET || randomBytes(48).toString('hex');
function signature(path:string,expires:string) { return createHmac('sha256',key).update(path+'|'+expires).digest('hex'); }
// Stable within a five-minute interval, so polling does not restart video playback.
export function signMediaUrl(url:string) {
  if(!url?.startsWith('/uploads/'))return url;
  const pathname=url.split('?')[0];
  const expires=String((Math.floor(Date.now()/300000)+12)*300);
  return `${pathname}?expires=${expires}&signature=${signature(pathname,expires)}`;
}
export function validMediaUrl(url:string) {
  try {
    const parsed=new URL(url,'http://localhost'),expires=parsed.searchParams.get('expires')||'',value=parsed.searchParams.get('signature')||'';
    const ttl=Number(expires)-Math.floor(Date.now()/1000);
    if(!Number.isInteger(Number(expires))||ttl<0||ttl>3600||!/^[a-f0-9]{64}$/.test(value))return false;
    return timingSafeEqual(Buffer.from(value,'hex'),Buffer.from(signature(parsed.pathname,expires),'hex'));
  }catch{return false;}
}
export function signModule<T extends Record<string,any>>(module:T):T {
  const result={...module};for(const field of ['url','videoUrl','pdfUrl'])if(result[field])(result as any)[field]=signMediaUrl(result[field]);return result;
}
