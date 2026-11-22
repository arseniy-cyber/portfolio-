/* Lumo Sites V10.2 — V8 foundation; no wheel interception, no perpetual card loops. */
(()=>{'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(pointer:fine)').matches;
// Fully contained book: only two real pages ever participate, no clone or phantom backside.
const book=document.querySelector('.v102-book');
if(book){
 const pages=[...book.querySelectorAll('.storybook__page')],status=book.querySelector('[data-story-status]');
 const prev=book.querySelector('[data-story="prev"]'),next=book.querySelector('[data-story="next"]');
 let current=0,busy=false,swipeStart=null;
 function update(){pages.forEach((p,i)=>{p.classList.toggle('is-active',i===current);p.setAttribute('aria-hidden',String(i!==current));});if(status)status.textContent=`${current+1} из ${pages.length}`;}
 function turn(dir){if(busy||pages.length<2)return;busy=true;const from=current,to=(current+dir+pages.length)%pages.length;
  const old=pages[from],target=pages[to];current=to;
  if(reduce){old.classList.remove('is-active');target.classList.add('is-active');update();busy=false;return;}
  old.classList.add('is-exiting');target.classList.add('is-active','is-entering');old.setAttribute('aria-hidden','true');target.setAttribute('aria-hidden','false');
  if(status)status.textContent=`${current+1} из ${pages.length}`;
  prev.disabled=true;next.disabled=true;
  let finished=false;const done=()=>{if(finished)return;finished=true;old.classList.remove('is-active','is-exiting');target.classList.remove('is-entering');update();busy=false;prev.disabled=false;next.disabled=false;};
  target.addEventListener('animationend',done,{once:true});setTimeout(done,820);
 }
 prev?.addEventListener('click',()=>turn(-1));next?.addEventListener('click',()=>turn(1));
 book.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();turn(e.key==='ArrowRight'?1:-1);}});
 book.addEventListener('touchstart',e=>{swipeStart=e.touches[0]?.clientX??null},{passive:true});
 book.addEventListener('touchend',e=>{if(swipeStart===null)return;const d=(e.changedTouches[0]?.clientX??swipeStart)-swipeStart;swipeStart=null;if(Math.abs(d)>62)turn(d<0?1:-1)},{passive:true});
 // Cover can reopen at chapter one without changing the page-turn animation.
 book.lumoReset=()=>{if(busy)return false;current=0;update();return true;};
 update();
}
// Service cards: click anywhere to flip, no decorative arrows or miniature controls.
for(const card of document.querySelectorAll('.service-flip')){
 const button=card.querySelector('.service-flip__toggle');if(!button)continue;
 card.setAttribute('role','button');card.tabIndex=0;
 card.setAttribute('aria-label',`Узнать больше: ${card.querySelector('h2')?.textContent||'услуга'}`);
 card.addEventListener('click',e=>{if(e.target.closest('a,button'))return;button.click();card.setAttribute('aria-expanded',String(card.classList.contains('is-flipped')));});
 card.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('a,button')){e.preventDefault();button.click();card.setAttribute('aria-expanded',String(card.classList.contains('is-flipped')));}});
 card.setAttribute('aria-expanded','false');
}
// Communication method: a second proper listbox, native select remains usable for FormData.
const select=document.querySelector('#contact-method'),picker=document.querySelector('.v102-method-select');
if(select&&picker){const trigger=picker.querySelector('.premium-select__trigger'),label=trigger?.querySelector('span'),options=[...picker.querySelectorAll('[role=option]')];
 picker.classList.add('is-ready');select.closest('label')?.classList.add('v102-enhanced-method');
 let open=false;
 function show(value){open=value;picker.classList.toggle('is-open',open);trigger.setAttribute('aria-expanded',String(open));}
 function choose(b){select.value=b.dataset.value;select.dispatchEvent(new Event('change',{bubbles:true}));label.textContent=b.dataset.value;options.forEach(o=>o.setAttribute('aria-selected',String(o===b)));show(false);trigger.focus();}
 trigger.addEventListener('click',()=>show(!open));
 trigger.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();show(true);options[e.key==='ArrowDown'?0:options.length-1]?.focus();}else if(e.key==='Escape'){show(false)}});
 options.forEach((b,i)=>{b.addEventListener('click',()=>choose(b));b.addEventListener('keydown',e=>{if(e.key==='Escape'){show(false);trigger.focus();}if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();options[(i+(e.key==='ArrowDown'?1:-1)+options.length)%options.length]?.focus();}if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(b);}})});
 document.addEventListener('pointerdown',e=>{if(!picker.contains(e.target))show(false)});
 select.addEventListener('change',()=>{label.textContent=select.value;options.forEach(b=>b.setAttribute('aria-selected',String(b.dataset.value===select.value)))});
}
// Cursor smoke is now rendered by v104.js with irregular procedural smoke volumes.
window.LUMO_V102_DEBUG=()=>({version:'10.3',v8About:!!document.querySelector('.v102-book'),techCards:document.querySelectorAll('.v8-capabilities>div').length,bookPages:document.querySelectorAll('.v102-book .storybook__page').length,mouseSmoke:!!document.querySelector('.v102-cursor-smoke'),serviceCards:document.querySelectorAll('.service-flip').length,methodSelect:!!document.querySelector('.v102-method-select')});
})();
