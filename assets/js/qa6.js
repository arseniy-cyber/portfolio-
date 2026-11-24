(()=>{'use strict';
 const root=document.querySelector('.is-inner:is([data-page=lab],[data-page=contact],[data-page=about],[data-page=process],[data-page=works])');
 const hero=root?.querySelector('.page-hero-directed');if(!hero)return;
 const stage=hero.closest('.about-hero-stage');let raf=0;
 function update(){raf=0;const r=hero.getBoundingClientRect(),h=innerHeight;let travelled=Math.max(0,-r.top);if(stage&&stage.classList.contains('is-motion')){const end=Math.max(1,stage.offsetHeight-h),p=Math.max(0,Math.min(1,-stage.getBoundingClientRect().top/end));travelled=Math.max(0,(p-.78)/.22)*h*.65+Math.max(0,-r.top)}
 const t=Math.max(0,Math.min(1,travelled/(Math.max(1,h)*.45)));const eased=t*t*(3-2*t);const height=travelled>0?Math.min(28,Math.max(.12,28*eased,travelled/Math.max(1,h)*36)):0;hero.style.setProperty('--qa6-seam',travelled>0?'1':'0');hero.style.setProperty('--qa6-seam-height',`${height.toFixed(3)}%`);hero.dataset.qa6Seam=eased.toFixed(4);
 }
 const schedule=()=>{if(!raf)raf=requestAnimationFrame(update)};addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});update();
})();
