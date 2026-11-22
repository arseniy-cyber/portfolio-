(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const menuButton=q('.menu-trigger'),menu=q('.menu-panel');
function toggleMenu(force){if(!menuButton||!menu)return;const open=force??menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');menu.setAttribute('aria-hidden',String(!open));menu.classList.toggle('is-open',open);menu.inert=!open;document.body.classList.toggle('is-menu-open',open)}
menuButton?.addEventListener('click',()=>toggleMenu());addEventListener('keydown',e=>{if(e.key==='Escape')toggleMenu(false)});document.addEventListener('click',e=>{if(menu&&!menu.contains(e.target)&&!menuButton?.contains(e.target))toggleMenu(false)});
qa('[data-filter]').forEach(b=>b.addEventListener('click',()=>{qa('[data-filter]').forEach(x=>x.classList.toggle('is-active',x===b));qa('.works-grid__cell').forEach(c=>{c.hidden=b.dataset.filter!=='all'&&c.dataset.type!==b.dataset.filter})}));
qa('.service-item').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)qa('.service-item').filter(x=>x!==item).forEach(x=>x.open=false)}));
// Light magnetic behavior: easing without stealing hit-targets.
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const glow=document.createElement('div'),core=document.createElement('div');glow.className='cursor-glow';core.className='cursor-core';document.body.append(glow,core);const trails=Array.from({length:7},()=>{const n=document.createElement('div');n.className='cursor-particle';document.body.append(n);return n});let point={x:-200,y:-200},sm={x:-200,y:-200},positions=trails.map(()=>({...point}));addEventListener('pointermove',e=>{point.x=e.clientX;point.y=e.clientY},{passive:true});const animate=()=>{sm.x+=(point.x-sm.x)*.22;sm.y+=(point.y-sm.y)*.22;glow.style.transform=`translate(${sm.x-28}px,${sm.y-28}px)`;core.style.transform=`translate(${point.x-2.5}px,${point.y-2.5}px)`;let old={...sm};positions.forEach((p,i)=>{const rate=.21-i*.018;p.x+=(old.x-p.x)*rate;p.y+=(old.y-p.y)*rate;trails[i].style.transform=`translate(${p.x-12}px,${p.y-12}px) scale(${1-i*.08})`;trails[i].style.opacity=String(.7-i*.085);old=p});requestAnimationFrame(animate)};requestAnimationFrame(animate)
}
// Contact form: submit directly to the existing Lumo Sites Cloudflare Worker.
// The Worker keeps Telegram credentials server-side; visitors never leave the site.
const form=q('#brief-form');
if(form){
 const sel=q('#service-select');
 const search=new URLSearchParams(location.search);
 const idx=Number(search.get('service'));
 if(sel&&search.has('service')&&Number.isInteger(idx)&&idx>=0&&idx<sel.options.length-2)sel.selectedIndex=idx+1;
 const submit=form.querySelector('button[type="submit"]');
 const result=q('.contact-result',form);
 const message=result?.querySelector('.contact-result__message');
 const endpoint='https://lumo-applications.arseniylumosites.workers.dev';
 let sending=false;
 form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(sending||!form.reportValidity())return;
  const fd=new FormData(form);
  const name=String(fd.get('name')||'').trim().slice(0,100);
  const contact=String(fd.get('contact')||'').trim().slice(0,200);
  const service=String(fd.get('service')||'').trim();
  const details=String(fd.get('details')||'').trim();
  const method=String(fd.get('method')||'Telegram').trim();
  const budget=String(fd.get('budget')||'').trim();
  if(!name||!contact||!service||!details){
   if(result&&message){result.hidden=false;result.classList.remove('is-success');result.classList.add('is-error');message.textContent='Пожалуйста, заполни обязательные поля.';}
   return;
  }
  // The existing Worker accepts name, contact and task; include the other form fields in task.
  const task=`Услуга: ${service}\nЗадача: ${details}\nПредпочтительный способ связи: ${method}\nБюджет: ${budget||'Не указан'}`.slice(0,3000);
  const originalLabel=submit?.textContent;
  sending=true;
  if(submit){submit.disabled=true;submit.textContent='Отправляем…';}
  form.setAttribute('aria-busy','true');
  if(result)result.hidden=true;
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),15000);
  try{
   const response=await fetch(endpoint,{
    method:'POST',mode:'cors',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name,contact,task}),signal:controller.signal
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok||data?.success!==true)throw new Error(`Submission failed (${response.status})`);
   if(result&&message){
    result.hidden=false;
    result.classList.remove('is-error');result.classList.add('is-success');
    message.textContent='Заявка отправлена! Я свяжусь с тобой выбранным способом.';
   }
  }catch(error){
   if(result&&message){
    result.hidden=false;
    result.classList.remove('is-success');result.classList.add('is-error');
    message.textContent=error?.name==='AbortError'
     ?'Не удалось получить ответ от сервера. Попробуй ещё раз чуть позже.'
     :'Не удалось отправить заявку. Проверь интернет и попробуй ещё раз.';
   }
  }finally{
   clearTimeout(timeout);
   sending=false;
   form.removeAttribute('aria-busy');
   if(submit){submit.disabled=false;submit.textContent=originalLabel||'Отправить заявку';}
   result?.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
 });
}
// Lab — exactly six meaningful settings, synchronized into a real iframe (also works on file://).
const frame=q('#lab-frame');if(frame){const fields=qa('[data-lab]'),deviceBtns=qa('[data-device]'),stage=q('#lab-stage');const defaults={theme:'forest',font:'editorial',layout:'split',cards:'soft',button:'pill',motion:'soft'};let state={...defaults};try{const raw=localStorage.getItem('lumo-lab-v1');if(raw)state={...defaults,...JSON.parse(raw)}}catch(e){}const query=new URLSearchParams(location.search);fields.forEach(f=>{const val=query.get(f.dataset.lab);if(val&&Array.from(f.options).some(o=>o.value===val))state[f.dataset.lab]=val});
 let labSequence=0,labAck=-1,labFallback=null;
 addEventListener('message',event=>{if(event.source===frame.contentWindow&&event.data?.type==='LUMO_LAB_APPLIED')labAck=event.data.sequence;});
 function push(){fields.forEach(f=>f.value=state[f.dataset.lab]||defaults[f.dataset.lab]);try{localStorage.setItem('lumo-lab-v1',JSON.stringify(state))}catch(e){}
   const id=++labSequence;
   frame.contentWindow?.postMessage({type:'LUMO_LAB_SETTINGS',settings:state,sequence:id},'*');
   clearTimeout(labFallback);
   labFallback=setTimeout(()=>{if(labAck===id)return;
     const params=new URLSearchParams(state).toString(),wanted='lab-preview.html?'+params;
     if(!frame.getAttribute('src')?.endsWith('?'+params))frame.setAttribute('src',wanted);
   },350);
 }
 fields.forEach(f=>f.addEventListener('change',()=>{state[f.dataset.lab]=f.value;push()}));frame.addEventListener('load',push);q('#lab-reset')?.addEventListener('click',()=>{state={...defaults};push()});
 deviceBtns.forEach(b=>b.addEventListener('click',()=>{deviceBtns.forEach(x=>x.classList.toggle('is-active',x===b));stage.classList.remove('is-tablet','is-phone');if(b.dataset.device!=='desktop')stage.classList.add('is-'+b.dataset.device)}));
 q('#lab-copy')?.addEventListener('click',async()=>{const url=new URL(location.href);Object.entries(state).forEach(([k,v])=>url.searchParams.set(k,v));try{await navigator.clipboard.writeText(url.href);q('#lab-copy').textContent='Ссылка скопирована'}catch(e){q('#lab-copy').textContent='Не удалось скопировать'}});push();}
// Page entry without intrusive loading overlay; navigation still works with JS disabled.
})();

/* V10.24 — unify arrow strokes across all pages while preserving each link and handler. */
(() => {
 'use strict';
 const paths={
  right:'M4.5 12H19.5 M13 5.5L19.5 12 13 18.5',
  left:'M19.5 12H4.5 M11 5.5L4.5 12 11 18.5',
  up:'M12 19.5V4.5 M5.5 11L12 4.5 18.5 11',
  down:'M12 4.5V19.5 M5.5 13L12 19.5 18.5 13',
  upright:'M5.5 18.5L18.5 5.5 M9.5 5.5H18.5V14.5',
  upleft:'M18.5 18.5L5.5 5.5 M5.5 14.5V5.5H14.5',
  downright:'M5.5 5.5L18.5 18.5 M9.5 18.5H18.5V9.5',
  downleft:'M18.5 5.5L5.5 18.5 M5.5 9.5V18.5H14.5'
 };
 const make=(direction)=>{
  const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
  icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('fill','none');
  icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','1.8');
  icon.setAttribute('stroke-linecap','round');icon.setAttribute('stroke-linejoin','round');
  icon.setAttribute('aria-hidden','true');icon.classList.add('lumo-arrow-v1024');
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d',paths[direction]||paths.right);icon.append(path);return icon;
 };
 const directionOf=(d)=>{
  if(d.includes('M20 12'))return 'left';
  if(d.includes('M12 19'))return 'up';
  if(d.includes('M12 5'))return 'down';
  if(d.includes('M19 19'))return 'upleft';
  if(d.includes('M19 5L5'))return 'downleft';
  if(d.includes('M5 5l14')||d.includes('M5 5l14'))return 'downright';
  if(d.includes('M5 19')||d.includes('M7 17')||d.includes('M6 18'))return 'upright';
  return 'right';
 };
 const apply=()=>{
  document.querySelectorAll('.price-card__flip--front').forEach(el=>el.querySelector('svg')?.replaceWith(make('right')));
  document.querySelectorAll('.price-card__flip--back').forEach(el=>el.querySelector('svg')?.replaceWith(make('left')));
  document.querySelectorAll('.price-card__link svg').forEach(el=>el.replaceWith(make('right')));
  document.querySelectorAll('.v1015-arrow,.v1017-arrow svg,.v1018-action-arrow svg,.selected__reveal-action svg,.portfolio-tile__open svg,.v1017-service-turn svg,.v1018-service-turn svg').forEach(svg=>{
   if(svg.classList.contains('lumo-arrow-v1024'))return;
   const d=svg.querySelector('path')?.getAttribute('d')||'';
   const dir=directionOf(d);
   const normalized=make(dir);
   normalized.classList.add(...svg.classList);
   normalized.setAttribute('width',svg.getAttribute('width')||'17');
   normalized.setAttribute('height',svg.getAttribute('height')||'17');
   svg.replaceWith(normalized);
  });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
 else apply();
})();
