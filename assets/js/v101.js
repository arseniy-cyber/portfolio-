/* LUMO V10.1 diagnostics and lightweight UX adjustments; V8 remains the structural base. */
(()=>{'use strict';
 const mobile=matchMedia('(max-width:760px)');
 // Avoid allocating expensive pointer particles on mobile. Menu is restored visually via CSS.
 const b=document.querySelector('.menu-trigger'),panel=document.querySelector('.menu-panel');
 if(panel){const nav=panel.querySelector('nav');const href=location.pathname.split('/').pop()||'index.html';nav?.querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')===href){a.setAttribute('aria-current','page');}});}
 // Touching a phone screen is user-controlled 3D; free swipe scrolling elsewhere.
 const cnv=document.querySelector('.gltf-scene--phone canvas');
 if(cnv){cnv.addEventListener('pointercancel',()=>cnv.classList.remove('is-dragging'));}
 // Smoothly move the atmospheric glow toward the pointer without forced reflow.
 const atm=document.querySelector('.v10-atmosphere');
 if(atm&&!mobile.matches){let pending=0,x=.5,y=.5;
  document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=atm.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;x=Math.max(0,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width)));y=Math.max(0,Math.min(1,(e.clientY-r.top)/Math.max(1,r.height)));if(!pending)pending=requestAnimationFrame(()=>{pending=0;atm.style.setProperty('--v101-mouse-x',(x*100).toFixed(2)+'%');atm.style.setProperty('--v101-mouse-y',(y*100).toFixed(2)+'%')});},{passive:true});
 }
 // A single semantic page-count label; never duplicate print-only book indices.
 const status=document.querySelector('[data-story-status]');
 if(status){status.setAttribute('aria-live','polite');const format=()=>{const m=status.textContent.match(/(\d+)\s*\/\s*(\d+)/);if(m)status.textContent=`${Number(m[1])} из ${Number(m[2])}`;};const obs=new MutationObserver(()=>{if(status.textContent.includes('/'))format()});obs.observe(status,{childList:true,characterData:true,subtree:true});format();}
 window.LUMO_V101_DEBUG={version:'10.1',foundation:'V8',book:'V9 adapted',smokeHeroOnly:!!atm,iphoneInSection:!!document.querySelector('.v8-device>.chapter__inner>.gltf-scene--phone'),decorativeCountersRemoved:document.querySelectorAll('.storybook__top,.v8-capability-index').length===0};
})();
