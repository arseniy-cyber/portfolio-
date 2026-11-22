(()=>{'use strict';const allowed={theme:['forest','burgundy','ivory','midnight'],font:['editorial','modern','expressive'],layout:['split','center','cover'],cards:['soft','sharp','borderless'],button:['pill','straight','text'],motion:['soft','bold','none']};
function apply(settings){if(!settings||typeof settings!=='object')return;for(const [key,opts] of Object.entries(allowed)){const v=settings[key];if(!opts.includes(v))continue;document.body.className=document.body.className.replace(new RegExp('(?:^|\\s)'+key+'-[^\\s]+','g'),'').trim();document.body.classList.add(key+'-'+v)}}
const initial=new URLSearchParams(location.search);apply(Object.fromEntries(initial));
addEventListener('message',e=>{if(window.parent!==window&&e.source!==window.parent)return;if(e.data?.type==='LUMO_LAB_SETTINGS'){
 apply(e.data.settings);e.source?.postMessage({type:'LUMO_LAB_APPLIED',sequence:e.data.sequence},'*');
}});
const nav=document.querySelector('.aura-header nav');document.querySelector('.aura-menu')?.addEventListener('click',()=>{nav.classList.toggle('is-open')});
})();
