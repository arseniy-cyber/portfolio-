/* LUMO SITES — spring-based tactile buttons. All effects progressively enhanced. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const elements = [...document.querySelectorAll('.magnetic,.pill,.header__cta,.filter,.menu-trigger,.lab-copy,.lab-viewer__devices button,.contact-form button[type="submit"],.contact-result button')];
  // One lightweight animation loop for all buttons; no mousewheel interception.
  if (fine && !reduced) {
    const active = new Set();
    elements.forEach((el) => {
      const item = {el, x:0, y:0, tx:0, ty:0, awake:false, heat:false};
      const move = (ev) => {
        const r = el.getBoundingClientRect();
        const centerX = r.left + r.width/2, centerY = r.top + r.height/2;
        const x = (ev.clientX-centerX)/Math.max(1,r.width/2);
        const y = (ev.clientY-centerY)/Math.max(1,r.height/2);
        const limit = Math.min(12, Math.max(5,r.width*.05));
        item.tx = Math.max(-1,Math.min(1,x))*limit;
        item.ty = Math.max(-1,Math.min(1,y))*Math.min(9,limit);
        el.style.setProperty('--light-x',`${Math.max(0,Math.min(100,(ev.clientX-r.left)/r.width*100))}%`);
        el.style.setProperty('--light-y',`${Math.max(0,Math.min(100,(ev.clientY-r.top)/r.height*100))}%`);
        item.awake=true; active.add(item);
      };
      el.addEventListener('pointerenter',move,{passive:true});
      el.addEventListener('pointermove',move,{passive:true});
      el.addEventListener('pointerleave',() => {item.tx=0;item.ty=0;item.awake=false;active.add(item)}, {passive:true});
      el.addEventListener('blur',() => {item.tx=0;item.ty=0;item.awake=false;active.add(item)});
    });
    let raf=0;
    const tick=() => {
      for(const it of [...active]) {
        it.x += (it.tx-it.x)*.19; it.y+=(it.ty-it.y)*.19;
        it.el.style.setProperty('--mag-x',`${it.x.toFixed(2)}px`);
        it.el.style.setProperty('--mag-y',`${it.y.toFixed(2)}px`);
        if(!it.awake && Math.abs(it.x)<.08 && Math.abs(it.y)<.08){
          it.x=it.y=0;it.el.style.setProperty('--mag-x','0px');it.el.style.setProperty('--mag-y','0px');active.delete(it);
        }
      }
      raf=active.size?requestAnimationFrame(tick):0;
    };
    document.addEventListener('pointermove',()=>{if(active.size && !raf)raf=requestAnimationFrame(tick)},{passive:true});
    document.addEventListener('pointerleave',()=>{if(active.size && !raf)raf=requestAnimationFrame(tick)},{passive:true});
  }
  // On touch, first tap reveals the 180-degree backside; second tap opens the real case.
  // Desktop hover reveals it; click always follows the link.
  if (matchMedia('(hover: none), (pointer: coarse)').matches) {
    document.querySelectorAll('.portfolio-tile, .selected__project').forEach(card => {
      card.addEventListener('click',ev=>{
        if(!card.classList.contains('is-flipped')) {
          ev.preventDefault();
          document.querySelectorAll('.portfolio-tile.is-flipped, .selected__project.is-flipped').forEach(other=>{if(other!==card)other.classList.remove('is-flipped')});
          card.classList.add('is-flipped');
        }
      });
    });
  }
})();
