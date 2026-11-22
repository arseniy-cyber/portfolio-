/* LUMO SITES V10.16 — targeted structural corrections; desktop source layouts preserved. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const mobile=matchMedia('(max-width:780px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const debug={version:'10.16',flips:0,book:'none',phoneSticky:!!$('.v8-device'),macDrag:!!$('.gltf-scene--macbook'),linksRemoved:!$('a[href="credits.html"]')};
window.LUMO_V1016_DEBUG=()=>({...debug});
const icon='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 10.5a7.5 7.5 0 1 0-2.8 6.1"/><path d="M19.5 4v6.5H13"/></svg>';
function flipButton(back){const b=document.createElement('button');b.type='button';b.className='v1016-flip '+(back?'v1016-flip--back':'v1016-flip--front');b.setAttribute('aria-label',back?'Показать лицевую сторону':'Показать подробности');b.innerHTML=icon;return b;}
function mobileFlipCards(){
 // Replace outer card links by article elements to avoid nesting buttons within links.
 for(const link of $$('.chapter--selected a.selected__project')){
  const article=document.createElement('article');for(const attr of [...link.attributes]){if(attr.name==='href'||attr.name==='aria-label')continue;article.setAttribute(attr.name,attr.value);}article.classList.add('v1016-flippable');
  const destination=link.getAttribute('href');while(link.firstChild)article.append(link.firstChild);link.replaceWith(article);
  const shot=$('.selected__shot',article),back=$('.selected__reveal',article),action=$('.selected__reveal-action',article);
  if(!shot||!back)continue;
  if(action){const a=document.createElement('a');a.className=action.className;a.href=destination;a.innerHTML=action.innerHTML;action.replaceWith(a);}
  const frontBtn=flipButton(false),backBtn=flipButton(true);shot.append(frontBtn);back.append(backBtn);
  const set=(on)=>{article.classList.toggle('is-flipped',on);frontBtn.tabIndex=on?-1:0;backBtn.tabIndex=on?0:-1;frontBtn.setAttribute('aria-hidden',String(on));backBtn.setAttribute('aria-hidden',String(!on));debug.flips++;};
  frontBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();set(true)});
  backBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();set(false)});set(false);
 }
 for(const link of $$('.subpage--works a.portfolio-tile')){
  const tile=document.createElement('article');for(const attr of [...link.attributes]){if(attr.name==='href'||attr.name==='aria-label')continue;tile.setAttribute(attr.name,attr.value);}tile.classList.add('v1016-flippable');
  const destination=link.getAttribute('href');while(link.firstChild)tile.append(link.firstChild);link.replaceWith(tile);
  const front=$('.portfolio-tile__face--front',tile),back=$('.portfolio-tile__face--back',tile),span=$('.portfolio-tile__open',tile);
  if(!front||!back)continue;
  if(span){const a=document.createElement('a');a.className=span.className;a.href=destination;a.innerHTML=span.innerHTML;span.replaceWith(a);}
  const b1=flipButton(false),b2=flipButton(true);front.append(b1);back.append(b2);
  const set=(on)=>{tile.classList.toggle('is-flipped',on);b1.tabIndex=on?-1:0;b2.tabIndex=on?0:-1;b1.setAttribute('aria-hidden',String(on));b2.setAttribute('aria-hidden',String(!on));debug.flips++};
  b1.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();set(true)});
  b2.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();set(false)});set(false);
 }
 // Existing service button is already linked to the original flip handler;
 // physically relocate BOTH controls into the corresponding rotating faces.
 for(const card of $$('.service-flip')){
  const front=$('.service-flip__front',card),back=$('.service-flip__back',card),frontBtn=$('.service-flip__toggle',card),backBtn=$(':scope > .v1015-flip-back',card);
  if(front&&back&&frontBtn){front.append(frontBtn);if(backBtn){back.append(backBtn);backBtn.classList.add('v1016-service-return');}
   card.classList.add('v1016-service');debug.flips++;
  }
 }
}
if(mobile.matches)mobileFlipCards();

// The book starts with a closed hard cover; the existing page-flip controller
// remains exactly as it was. A close button restores the cover in either viewport.
const book=$('.v1016-book');if(book){const open=$('.v1016-cover-open',book),close=$('.v1016-cover-close',book);
 const unlock=()=>{book.classList.add('is-opening');book.classList.remove('is-closed');debug.book='opening';setTimeout(()=>{book.classList.remove('is-opening');book.classList.add('is-open');debug.book='open'},reduced?0:850)};
 const lock=()=>{book.lumoReset?.();book.classList.remove('is-open','is-opening');book.classList.add('is-closed');debug.book='closed'};
 open?.addEventListener('click',unlock);close?.addEventListener('click',lock);debug.book='closed';}

// The main screen contains a subdued editorial text interaction, not an extra CTA.
const manifesto=$('[data-manifesto]');if(manifesto){const texts=['Код, который работает.','Движение, которое запоминается.','Детали, которые имеют значение.'];let i=0;
 manifesto.addEventListener('click',()=>{i=(i+1)%texts.length;manifesto.classList.remove('is-changing');void manifesto.offsetWidth;manifesto.textContent=texts[i];manifesto.classList.add('is-changing');});}

// MacBook and iPhone have different directions of use. Do not steal vertical
// swipe scrolling from a page on touch devices.
const mac=$('.gltf-scene--macbook'),macHint=document.createElement('p');
if(mac){macHint.className='v1016-device-hint';macHint.textContent=mobile.matches?'Проведи по ноутбуку, чтобы повернуть':'Поверни ноутбук мышью';mac.insertAdjacentElement('afterend',macHint);mac.setAttribute('aria-label','Интерактивный MacBook, поворот по горизонтали');}
const mobilePhone=$('.v8-device');if(mobile.matches&&mobilePhone){
 // Do not leave a pinned empty static image if WebGL fails on a device.
 setTimeout(()=>{if(!mobilePhone.querySelector('.gltf-scene--phone.has-webgl'))mobilePhone.classList.add('v1016-static-fallback');},6500);
}
const phoneHint=$('.gltf-scene--phone .phone-drag-hint');if(phoneHint){phoneHint.textContent=mobile.matches?'Проведи по телефону, чтобы повернуть':'Поверни мышью';}

// Smooth mobile reveal of SITES uses one timeline instead of separate per-letter
// scroll listeners (older versions still write their variables for desktops).
const hero=$('#hero');if(hero&&mobile.matches&&!reduced){let target=0,now=0,active=false;
 const updateTarget=()=>{const r=hero.getBoundingClientRect();target=Math.min(1,Math.max(0,-r.top/Math.max(1,r.height-innerHeight)));if(!active){active=true;requestAnimationFrame(frame)}};
 function frame(){const delta=target-now;now+=delta*.19;if(Math.abs(delta)<.0003)now=target;hero.style.setProperty('--v1016-hero-p',now.toFixed(4));hero.querySelectorAll('.v8-hero-char').forEach((ch,i)=>{ch.style.setProperty('--v1016-char-x',((1-now)*(15+i*2.5)).toFixed(2)+'px');ch.style.setProperty('--v1016-char-y',((1-now)*(i%2?5:-5)).toFixed(2)+'px');});if(Math.abs(target-now)>.0003)requestAnimationFrame(frame);else active=false;}
 window.addEventListener('scroll',updateTarget,{passive:true});window.addEventListener('resize',updateTarget,{passive:true});updateTarget();}
})();
