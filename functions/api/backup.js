const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const decode=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
async function identity(request,env){
 if(!env.ACCESS_TEAM_DOMAIN||!env.ACCESS_AUD)throw Error('Not configured');
 const token=request.headers.get('Cf-Access-Jwt-Assertion')||'';
 const parts=token.split('.');if(parts.length!==3)throw Error('Sign in');
 const header=JSON.parse(new TextDecoder().decode(decode(parts[0]))),claims=JSON.parse(new TextDecoder().decode(decode(parts[1])));
 const issuer='https://'+env.ACCESS_TEAM_DOMAIN;
 if(header.alg!=='RS256'||claims.iss!==issuer||!Array.isArray(claims.aud)||!claims.aud.includes(env.ACCESS_AUD)||!Number.isFinite(claims.exp)||claims.exp<=Date.now()/1000||!claims.sub||claims.type!=='app'||(claims.nbf&&claims.nbf>Date.now()/1000))throw Error('Invalid session');
 const res=await fetch(issuer+'/cdn-cgi/access/certs');if(!res.ok)throw Error('Sign in unavailable');
 const jwk=(await res.json()).keys.find(k=>k.kid===header.kid);if(!jwk)throw Error('Invalid key');
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1])))throw Error('Invalid signature');
 return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(claims.sub)))].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function onRequest({request,env}){
 let user;try{user=await identity(request,env)}catch{return reply({error:'Sign in to use cloud backups'},401)}
 if(!env.BACKUPS)return reply({error:'Cloud backup storage is not configured'},503);
 const url=new URL(request.url),prefix=user+'/';
 try{
 if(request.method==='GET'){
  const id=url.searchParams.get('id');if(id){if(!/^\d{13}-[a-f0-9-]{36}\.json$/.test(id))return reply({error:'Invalid backup'},400);const obj=await env.BACKUPS.get(prefix+id);if(!obj)return reply({error:'Backup not found'},404);return new Response(obj.body,{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Content-Disposition':'attachment; filename="faru-'+id+'"','X-Content-Type-Options':'nosniff'}})}
  const list=await env.BACKUPS.list({prefix,limit:50});return reply({backups:list.objects.map(o=>({id:o.key.slice(prefix.length),savedAt:o.uploaded,size:o.size})),more:list.truncated});
 }
 if(request.method!=='POST')return reply({error:'Method not allowed'},405);
 if(request.headers.get('Origin')!==url.origin||request.headers.get('Content-Type')?.split(';')[0]!=='application/json')return reply({error:'Invalid origin or content type'},403);
 const reader=request.body?.getReader();if(!reader)return reply({error:'Empty backup'},400);let size=0,chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>5*1024*1024){await reader.cancel();return reply({error:'Backup exceeds 5 MB'},413)}chunks.push(value)}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}const text=new TextDecoder().decode(bytes);let data;try{data=JSON.parse(text)}catch{return reply({error:'Invalid JSON'},400)}
 if(data.version!==1||!['spaces','accounts','transactions','budgets','goals'].every(k=>Array.isArray(data[k])))return reply({error:'Invalid Faru backup'},400);
 // Reverse timestamp sorts newest first. Immutable snapshots protect other devices' backups.
 const id=String(9999999999999-Date.now()).padStart(13,'0')+'-'+crypto.randomUUID()+'.json';
 await env.BACKUPS.put(prefix+id,text,{httpMetadata:{contentType:'application/json'}});
 return reply({id,savedAt:new Date().toISOString()},201);
 }catch{return reply({error:'Cloud storage unavailable. Your local records are unchanged.'},503)}
}
