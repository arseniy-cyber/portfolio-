/* Lumo Sites V4: native scroll as a timeline; sticky horizontal title,
   horizontal selected work and reversible transitions. No wheel hijacking. */
(()=>{'use strict';
const C=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),smooth=x=>{x=C(x);return x*x*(3-2*x)};
const hero=document.getElementById('hero'),selected=document.getElementById('selected');if(!hero)return;
const track=selected?.querySelector('.selected__track'),viewport=selected?.querySelector('.selected__viewport');const touchGallery=matchMedia('(max-width:780px)');
const statements=[...document.querySelectorAll('.v8-statement-transition__word')];const chapters=[...document.querySelectorAll('.chapter')];const lights=document.querySelector('.film-stage__lights');
let ticking=false;
function update(){ticking=false;const vh=innerHeight;
const h=hero.getBoundingClientRect();const progress=C(-h.top/Math.max(1,h.height-vh));
// The first frame shows LUMO; horizontal scroll reveals SITES and contracts the
// full wordmark to fit instead of animating individual letters or clipping CTAs.
hero.style.setProperty('--intro-progress',smooth(progress).toFixed(4));
statements.forEach(el=>{const r=el.getBoundingClientRect(), root=el.closest('.chapter').getBoundingClientRect();const raw=C((innerHeight*.96-root.top)/(innerHeight*.57));el.style.setProperty('--v101-statement-arrival',smooth(raw).toFixed(4));});
hero.dataset.introFinished=progress>.997?'true':'false';
if(lights){const x=64+Math.sin(scrollY*.00064)*10,y=43+Math.cos(scrollY*.00038)*9;lights.style.setProperty('--glow-x',x+'%');lights.style.setProperty('--glow-y',y+'%');}
let active=chapters[0],best=Infinity;
for(const s of chapters){const r=s.getBoundingClientRect();const middle=(r.top+r.bottom)/2;const dist=Math.abs(middle-vh*.5);if(dist<best){best=dist;active=s;}}
if(active){const skin=active.dataset.skin||'forest';if(document.body.dataset.skin!==skin)document.body.dataset.skin=skin;}
if(selected&&track&&viewport){if(touchGallery.matches){track.style.transform='none';}else{const r=selected.getBoundingClientRect(),p=C(-r.top/Math.max(1,r.height-vh));const distance=Math.max(0,track.scrollWidth-viewport.clientWidth);track.style.transform=`translate3d(${(-distance*smooth(p)).toFixed(2)}px,0,0)`;}}
chapters.forEach(s=>{
 if(s===hero||s===selected)return;
 const r=s.getBoundingClientRect();const p=C((vh-r.top)/(vh+r.height));s.style.setProperty('--chapter-progress',p.toFixed(4));
});
}
function schedule(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});addEventListener('load',schedule,{once:true});schedule();
})();
