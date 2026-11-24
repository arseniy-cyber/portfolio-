
/* Lumo Sites select widgets: accessible trigger, real <select> retains form state. */
(()=>{'use strict';
for(const select of document.querySelectorAll('.brief-form select:not([data-native-select]),.lab-control select:not([data-native-select])')){
 const parent=select.parentElement;if(!parent||select.closest('.lumo-select'))continue;
 const wrap=document.createElement('div');wrap.className='lumo-select';
 parent.insertBefore(wrap,select);wrap.append(select);
 const button=document.createElement('button');button.type='button';button.className='lumo-select-trigger';
 const menu=document.createElement('div');menu.className='lumo-select-menu';menu.setAttribute('role','listbox');const key=select.id||'lumo-'+(select.name||select.dataset.lab);menu.id=key+'-options';button.setAttribute('aria-controls',menu.id);const label=[...parent.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent.trim()).filter(Boolean).join(' ');const updateLabel=()=>button.setAttribute('aria-label',label?label+': '+selected():selected());select.tabIndex=-1;
 const opts=[...select.options];const selected=()=>opts[select.selectedIndex]?.textContent||opts[0]?.textContent||'Выберите';
 button.textContent=selected();updateLabel();button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');
 const close=()=>{wrap.classList.remove('is-open');button.setAttribute('aria-expanded','false');menu.inert=true};menu.inert=true;
 const open=()=>{document.querySelectorAll('.lumo-select.is-open').forEach(x=>{if(x!==wrap){x.classList.remove('is-open');x.querySelector('.lumo-select-trigger')?.setAttribute('aria-expanded','false');const other=x.querySelector('.lumo-select-menu');if(other)other.inert=true}});wrap.classList.add('is-open');menu.inert=false;button.setAttribute('aria-expanded','true')};
 opts.forEach((opt,index)=>{const optBtn=document.createElement('button');optBtn.type='button';optBtn.className='lumo-select-option';optBtn.setAttribute('role','option');optBtn.textContent=opt.textContent;
   optBtn.disabled=opt.disabled;optBtn.setAttribute('aria-selected',index===select.selectedIndex?'true':'false');
   optBtn.addEventListener('click',()=>{select.selectedIndex=index;select.dispatchEvent(new Event('change',{bubbles:true}));button.textContent=selected();updateLabel();[...menu.children].forEach((x,j)=>x.setAttribute('aria-selected',String(j===index)));close();button.focus()});
   menu.append(optBtn)});
 wrap.append(button,menu);
 select.addEventListener('invalid',()=>{open();button.focus()});
 select.form?.addEventListener('reset',()=>setTimeout(()=>{button.textContent=selected();updateLabel();[...menu.children].forEach((x,j)=>x.setAttribute('aria-selected',String(j===select.selectedIndex)));close()},0));
 button.addEventListener('click',()=>wrap.classList.contains('is-open')?close():open());
 button.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='ArrowDown'){e.preventDefault();open();menu.querySelector('.lumo-select-option:not(:disabled)')?.focus()}});
 menu.addEventListener('keydown',e=>{const items=[...menu.querySelectorAll('button:not(:disabled)')];const index=items.indexOf(document.activeElement);if(e.key==='Escape'){close();button.focus()};if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();items[(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus()};if(e.key==='Tab')close()});
 document.addEventListener('pointerdown',e=>{if(!wrap.contains(e.target))close()});
 const sync=()=>{button.textContent=selected();updateLabel();[...menu.children].forEach((x,i)=>x.setAttribute('aria-selected',String(i===select.selectedIndex)))};select.addEventListener('change',sync);select.addEventListener('lumo-lab-sync',sync);
 }
})();
