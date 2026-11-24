/* Lumo Sites 2.0. Shared navigation, forms, case previews and live lab. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const header=$('#site-header'),menu=$('#menu-switch'),mobileNav=$('#mobile-nav');
function setMenu(open){if(!menu||!mobileNav)return;menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');mobileNav.hidden=!open;document.body.classList.toggle('is-menu-open',open)}
menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
$$('#mobile-nav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){setMenu(false);closePreview()}});
// Interior page header is opaque after scrolling; scene page owns the light/dark flip.
if(!document.body.classList.contains('is-home')){
 const update=()=>header?.classList.toggle('scrolled',scrollY>32);
 addEventListener('scroll',update,{passive:true});update();
}
// Document-scope project modal. No fragile remote iframe or invented live content.
const preview=$('#preview-overlay'),closePreviewBtn=$('#preview-close');let prevFocus=null;
let projects=[];try{const embedded=$('#projects-data');if(embedded)projects=JSON.parse(embedded.textContent)}catch{}
const projectFallback={
 lav:{name:'Лав Парфюм',category:'Клиентский проект',details:'Парфюмерный каталог',image:'assets/img/works/lav-parfum-screen.webp',file:'project-lav-parfum.html',live:'https://лавпарфюм.рф/'},
 form:{name:'FORM / iPhone',category:'Демонстрация',details:'Интерактивная 3D презентация',image:'assets/img/works/iphone-screen.webp',file:'project-iphone.html',live:'https://arseniy-cyber.github.io/iphone18pro_demo/'},
 mmrsiq:{name:'mmrsiq ta2',category:'Клиентский проект',details:'Портфолио тату мастера',image:'assets/img/works/mmrsiq-screen.webp',file:'project-mmrsiq.html',live:'https://mmrsiqta2.ru/'}
};
const projectIndex={};
const ref=Promise.resolve().then(async()=>{
 if(!projects.length){try{const r=await fetch('assets/data/projects.json',{cache:'force-cache'});if(r.ok)projects=await r.json()}catch(err){/* file:// uses embedded data */}}
 projects.forEach(p=>projectIndex[p.id]=p);
});
function trapTab(e){if(e.key!=='Tab'||!preview||preview.hidden)return;const nodes=$$('a[href],button:not([disabled])',preview).filter(e=>e.offsetParent!==null);if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault()}else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault()}}
async function openPreview(id){if(!preview)return;await ref;
 const p=projectIndex[id]||projectFallback[id];if(!p)return;
 prevFocus=document.activeElement;
 $('#preview-image').src=p.image;$('#preview-image').alt=`Скриншот проекта ${p.name}`;
 $('#preview-type').textContent=p.category;$('#preview-heading').textContent=p.name;
 $('#preview-description').textContent=p.details||p.tag||'';$('#preview-case').href=p.file;
 const live=$('#preview-live');if(p.live){live.href=p.live;live.hidden=false}else{live.hidden=true}
 preview.hidden=false;document.body.classList.add('is-menu-open');preview.addEventListener('keydown',trapTab);closePreviewBtn?.focus();
}
function closePreview(){if(!preview||preview.hidden)return;preview.hidden=true;document.body.classList.remove('is-menu-open');preview.removeEventListener('keydown',trapTab);prevFocus?.focus?.()}
$$('[data-preview]').forEach(el=>el.addEventListener('click',()=>openPreview(el.dataset.preview)));
$$('[data-close-preview]').forEach(el=>el.addEventListener('click',closePreview));

// Portfolio filters preserve document semantics and work without a framework.
$$('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
 const value=btn.dataset.filter;
 $$('[data-filter]').forEach(x=>{x.classList.toggle('active',x===btn);x.setAttribute('aria-pressed',String(x===btn))});
 $$('.catalogue-item').forEach(item=>item.hidden=value!=='all'&&item.dataset.category!==value);
}));
// Full contact form. Server-side secret remains on Cloudflare, never in page code.
const form=$('#brief-form');
if(form){
 const sel=$('#service-select'),query=new URLSearchParams(location.search),service=Number(query.get('service'));
 if(sel&&query.has('service')&&Number.isInteger(service)&&service>=0&&service<sel.options.length-2)sel.selectedIndex=service+1;
 const status=$('.form-status',form),submit=$('button[type=submit]',form),worker='https://lumo-applications.arseniylumosites.workers.dev';
 const setStatus=(message,error=false)=>{if(!status)return;status.hidden=false;status.textContent=message;status.classList.toggle('error',error)};
 let pending=false;
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(pending)return;
  if(!form.checkValidity()){form.reportValidity();setStatus('Заполните обязательные поля и подтвердите согласие.',true);return}
  const turnstileBox=$('#lumo-turnstile');const needsTurnstile=Boolean(turnstileBox?.dataset.sitekey?.trim());
  const token=needsTurnstile?(window.lumoTurnstileGetToken?.()||''):'';
  if(needsTurnstile&&!token){setStatus('Подтвердите проверку безопасности перед отправкой.',true);return}
  const fd=new FormData(form),name=String(fd.get('name')||'').trim().slice(0,80),contact=String(fd.get('contact')||'').trim().slice(0,200),serviceName=String(fd.get('service')||'').trim(),details=String(fd.get('details')||'').trim(),method=String(fd.get('method')||'Telegram').trim(),budget=String(fd.get('budget')||'').trim();
  if(!name||!contact||!serviceName||!details){setStatus('Заполните обязательные поля.',true);return}
  const task=`Услуга: ${serviceName}\nЗадача: ${details}\nСвязь: ${method}\nБюджет: ${budget||'не указан'}`.slice(0,3000);
  pending=true;submit.disabled=true;submit.textContent='Отправка…';form.setAttribute('aria-busy','true');status.hidden=true;
  const controller=new AbortController(),id=setTimeout(()=>controller.abort(),15000);
  try{
   const res=await fetch(worker,{method:'POST',mode:'cors',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,contact,task,...(needsTurnstile?{turnstileToken:token}:{})}),signal:controller.signal});
   const data=await res.json().catch(()=>null);
   if(!res.ok||data?.success!==true)throw Error('Failed '+res.status);
   setStatus('Заявка отправлена. Я свяжусь с вами выбранным способом.');form.reset();
  }catch(err){setStatus(err?.name==='AbortError'?'Сервер долго не отвечает. Попробуйте позже.':'Не удалось отправить заявку. Проверьте соединение или напишите в Telegram.',true)}
  finally{clearTimeout(id);pending=false;submit.disabled=false;submit.innerHTML="Отправить заявку <svg class=\"qa12-arrow\" aria-hidden=\"true\" focusable=\"false\" viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 12 12 4 M5 4h7v7\"/></svg>";form.removeAttribute('aria-busy');if(needsTurnstile)window.lumoTurnstileReset?.()}
 });
}
// Real lab iframe with all six settings; immediate postMessage update plus URL fallback.
const labFrame=$('#lab-preview-frame');
if(labFrame){
 const controls=$$('[data-lab]'),devices=$$('[data-device]'),frameWrap=$('#lab-frame-wrap');
 const defaults={theme:'forest',font:'editorial',layout:'split',cards:'soft',button:'pill',motion:'soft',};
 let settings={...defaults};try{settings={...settings,...JSON.parse(localStorage.getItem('lumo-lab-2')||'{}')}}catch{}
 settings=Object.fromEntries(Object.keys(defaults).map(k=>[k,settings[k]||defaults[k]]));const url=new URLSearchParams(location.search);controls.forEach(c=>{const p=url.get(c.dataset.lab);if(p&&Array.from(c.options).some(o=>o.value===p))settings[c.dataset.lab]=p});
 let serial=0,ack=-1,timeout=null;
 addEventListener('message',e=>{if(e.source===labFrame.contentWindow&&e.data?.type==='LUMO_LAB_APPLIED')ack=e.data.sequence});
 const push=()=>{
  controls.forEach(c=>{const k=c.dataset.lab;if(!Array.from(c.options).some(o=>o.value===settings[k]))settings[k]=defaults[k];c.value=settings[k]});
  try{localStorage.setItem('lumo-lab-2',JSON.stringify(settings))}catch{}
  controls.forEach(c=>c.dispatchEvent(new Event('lumo-lab-sync')));const full=document.querySelector('.lab-devices a');if(full)full.href='lab-preview.html?'+new URLSearchParams(settings).toString();const n=++serial;labFrame.contentWindow?.postMessage({type:'LUMO_LAB_SETTINGS',sequence:n,settings},'*');clearTimeout(timeout);
  timeout=setTimeout(()=>{if(ack===n)return;const params=new URLSearchParams(settings);if(!labFrame.src.endsWith('?'+params.toString()))labFrame.src='lab-preview.html?'+params.toString()},500)
 };
 controls.forEach(c=>c.addEventListener('change',()=>{settings[c.dataset.lab]=c.value;push()}));
 labFrame.addEventListener('load',push);$('[data-lab-reset]')?.addEventListener('click',()=>{settings={...defaults};push()});
 $('[data-lab-copy]')?.addEventListener('click',async e=>{const button=e.currentTarget;const u=new URL(location.href);Object.entries(settings).forEach(([k,v])=>u.searchParams.set(k,v));try{await navigator.clipboard.writeText(u.href);button.textContent='Ссылка скопирована'}catch{button.textContent='Копирование недоступно'}});
 const sizes={desktop:[1440,900,'Компьютер'],tablet:[768,1024,'Планшет'],phone:[390,844,'Телефон']};let device='desktop';const available=frameWrap.parentElement;function fitDevice(){const [w,h,label]=sizes[device];const scale=Math.min(1,Math.max(1,available.clientWidth-4)/w);frameWrap.style.setProperty('--qa12-frame-w',w+'px');frameWrap.style.setProperty('--qa12-frame-h',h+'px');frameWrap.style.setProperty('--qa12-frame-scale',String(scale));frameWrap.style.setProperty('--qa12-fit-w',Math.round(w*scale)+'px');frameWrap.style.setProperty('--qa12-fit-h',Math.round(h*scale)+'px');labFrame.width=w;labFrame.height=h;frameWrap.dataset.previewDevice=device;const status=document.querySelector('#qa12-preview-size');if(status)status.textContent=label+' · '+w+' × '+h;devices.forEach(x=>{x.classList.toggle('selected',x.dataset.device===device);x.setAttribute('aria-pressed',String(x.dataset.device===device))});frameWrap.classList.toggle('is-tablet',device==='tablet');frameWrap.classList.toggle('is-phone',device==='phone');}devices.forEach(b=>b.addEventListener('click',()=>{device=b.dataset.device;fitDevice()}));if('ResizeObserver'in window)new ResizeObserver(fitDevice).observe(available);addEventListener('resize',fitDevice,{passive:true});fitDevice();
 push();
}
})();
