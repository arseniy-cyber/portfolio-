/* LUMO V7: experience refinements, authored in native JS without external dependencies. */
(()=>{'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=matchMedia('(pointer:coarse)').matches;
// Reveal headings as their page chapter crosses the viewport. This never hides text.
const headings=[...document.querySelectorAll('[data-reveal-text]')];
const smoke=document.querySelector('.works-v7__smoke');
const works=smoke?.closest('.works-hero--v7');
const outros=[...document.querySelectorAll('.subpage__outro h2')];
let scheduled=false;
function scrollUpdate(){scheduled=false;const vh=innerHeight;
 if(!reduce)headings.forEach(h=>{const r=h.getBoundingClientRect();const where=Math.max(0,Math.min(1,(vh*.95-r.top)/(vh*.8)));const fade=r.bottom<0?.87:Math.max(.87,Math.min(1,.83+where*.17));h.style.setProperty('--v7-drift',((1-where)*15).toFixed(1));h.style.setProperty('--v7-opacity',fade.toFixed(3));});
 outros.forEach(h=>{const r=h.getBoundingClientRect();const p=Math.max(-1,Math.min(1,(vh*.5-r.top)/Math.max(1,vh)));h.style.setProperty('--v7-outro-x',(reduce?0:p*-24).toFixed(1)+'px');});
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(scrollUpdate)}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});schedule();
if(works&&!coarse&&!reduce){works.addEventListener('pointermove',e=>{const r=works.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;smoke.style.setProperty('--smoke-x',(x*75).toFixed(1)+'px');smoke.style.setProperty('--smoke-y',(y*54).toFixed(1)+'px')},{passive:true});}
// Magnetism is applied to the buttons; static outer hitboxes prevent flip jitter.
if(!coarse&&!reduce){
 for(const el of document.querySelectorAll('.portfolio-tile__open,.selected__reveal-action')){
  const parent=el.closest('.portfolio-tile,.selected__project');if(!parent)continue;
  parent.addEventListener('pointermove',ev=>{const r=el.getBoundingClientRect();const x=Math.max(-8,Math.min(8,(ev.clientX-(r.left+r.width/2))*.08));const y=Math.max(-5,Math.min(5,(ev.clientY-(r.top+r.height/2))*.08));el.style.setProperty('--mag-x',x.toFixed(1)+'px');el.style.setProperty('--mag-y',y.toFixed(1)+'px');},{passive:true});
  parent.addEventListener('pointerleave',()=>{el.style.setProperty('--mag-x','0px');el.style.setProperty('--mag-y','0px')});
 }
 for(const card of document.querySelectorAll('.service-flip')){
  card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--card-x',Math.max(-4,Math.min(4,(e.clientX-r.left-r.width/2)*.017)).toFixed(2)+'px');card.style.setProperty('--card-y',Math.max(-3,Math.min(3,(e.clientY-r.top-r.height/2)*.016)).toFixed(2)+'px');},{passive:true});
  card.addEventListener('pointerleave',()=>{card.style.setProperty('--card-x','0px');card.style.setProperty('--card-y','0px')});
 }
}
// Process: activate description on focus, click and keyboard; predictable touch behavior.
for(const stage of document.querySelectorAll('.process-track--v7 .process-stage')){
 const toggle=()=>{const next=!stage.classList.contains('is-open');stage.classList.toggle('is-open',next);stage.setAttribute('aria-expanded',String(next));};
 stage.addEventListener('click',toggle);stage.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
}
// About: real booklet with four interactive pages, no duplicated paragraphs.
const pages=[...document.querySelectorAll('.storybook__page')];if(pages.length&&!document.body.classList.contains('lumo-v8')){let active=0;const status=document.querySelector('[data-story-status]'),count=document.querySelector('.storybook__page-number');
 function show(n){active=(n+pages.length)%pages.length;pages.forEach((p,i)=>{p.classList.toggle('is-active',i===active);p.setAttribute('aria-hidden',String(i!==active));});const str=String(active+1).padStart(2,'0');if(status)status.textContent=`${str} — ${String(pages.length).padStart(2,'0')}`;if(count)count.textContent=`${str} / ${String(pages.length).padStart(2,'0')}`;}
 document.querySelector('[data-story=prev]')?.addEventListener('click',()=>show(active-1));document.querySelector('[data-story=next]')?.addEventListener('click',()=>show(active+1));show(0);
}
// Accessible, custom service picker. The original select remains in FormData and validation.
const picker=document.querySelector('.premium-select[data-enhanced-dropdown]');const native=document.querySelector('#service-select');
if(picker&&native){const trigger=picker.querySelector('.premium-select__trigger'),items=[...picker.querySelectorAll('[role=option]')],valueLabel=trigger.querySelector('span'),form=native.closest('form');
 picker.classList.add('is-ready');native.classList.add('v7-hidden');
 let open=false;function setOpen(next){open=next;picker.classList.toggle('is-open',open);trigger.setAttribute('aria-expanded',String(open));}
 function choose(i){if(i<0||i>=items.length)return;const item=items[i];native.value=item.dataset.value;native.dispatchEvent(new Event('change',{bubbles:true}));items.forEach(x=>x.setAttribute('aria-selected',String(x===item)));valueLabel.textContent=item.textContent;setOpen(false);trigger.focus();}
 const match=items.findIndex(x=>x.dataset.value===native.value);if(match>=0){valueLabel.textContent=items[match].textContent;items[match].setAttribute('aria-selected','true');}
 trigger.addEventListener('click',()=>setOpen(!open));trigger.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);items[e.key==='ArrowDown'?0:items.length-1].focus();}if(e.key==='Escape')setOpen(false);});
 items.forEach((x,i)=>{x.addEventListener('click',()=>choose(i));x.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();setOpen(false);trigger.focus();}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();items[(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length].focus();}})});
 document.addEventListener('pointerdown',e=>{if(!picker.contains(e.target))setOpen(false)});
 form?.addEventListener('submit',e=>{if(!native.value){e.preventDefault();e.stopImmediatePropagation();setOpen(true);trigger.focus();trigger.setAttribute('aria-invalid','true');}else{trigger.removeAttribute('aria-invalid')}},true);
}
window.LUMO_V7_DEBUG={version:'7.0',stageCount:document.querySelectorAll('.process-stage').length,clientProjects:[...document.querySelectorAll('.works-grid__cell[data-type=client]')].length};
})();
