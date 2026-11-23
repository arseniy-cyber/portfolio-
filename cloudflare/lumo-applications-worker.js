// Deploy separately in Cloudflare Workers; this file is NOT used by GitHub Pages.
// Required secrets: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TURNSTILE_SECRET.
// Before enabling Turnstile frontend, deploy this worker and configure the secrets.
const ALLOWED_ORIGIN='https://lumosites.ru';
function cors(origin){return {'Access-Control-Allow-Origin':origin==='https://www.lumosites.ru'?'https://www.lumosites.ru':ALLOWED_ORIGIN,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'};}
function response(payload,status,origin){return new Response(JSON.stringify(payload),{status,headers:{'Content-Type':'application/json; charset=utf-8',...cors(origin)}});}
export default {async fetch(request,env){
 const origin=request.headers.get('Origin')||'';
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});
 if(request.method!=='POST')return response({success:false,error:'Method not allowed'},405,origin);
 if(![ALLOWED_ORIGIN,'https://www.lumosites.ru'].includes(origin))return response({success:false,error:'Origin denied'},403,origin);
 let payload;try{payload=await request.json();}catch{return response({success:false,error:'Invalid JSON'},400,origin);}
 const name=String(payload.name||'').trim().slice(0,100);
 const contact=String(payload.contact||'').trim().slice(0,200);
 const task=String(payload.task||'').trim().slice(0,3000);
 const token=String(payload.turnstileToken||'');
 if(!name||!contact||!task)return response({success:false,error:'Missing fields'},400,origin);
 if(!env.TURNSTILE_SECRET||!env.TELEGRAM_BOT_TOKEN||!env.TELEGRAM_CHAT_ID)return response({success:false,error:'Server configuration incomplete'},503,origin);
 if(!token)return response({success:false,error:'Challenge required'},403,origin);
 const verifyForm=new FormData();verifyForm.append('secret',env.TURNSTILE_SECRET);verifyForm.append('response',token);
 verifyForm.append('remoteip',request.headers.get('CF-Connecting-IP')||'');
 let checked;try{const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:verifyForm});checked=await r.json();}catch{return response({success:false,error:'Verification failed'},502,origin);}
 if(!checked.success)return response({success:false,error:'Challenge rejected'},403,origin);
 const text=`Новая заявка Lumo Sites\nИмя: ${name}\nКонтакт: ${contact}\n${task}`;
 const tg=await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:env.TELEGRAM_CHAT_ID,text})});
 let result;try{result=await tg.json();}catch{result={};}
 return result.ok?response({success:true},200,origin):response({success:false,error:'Telegram delivery failed'},502,origin);
 }};
