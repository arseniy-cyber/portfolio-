/* Lumo Sites V6: interactions are scoped to cards; no fake controls. */
(()=>{'use strict';
const cards=[...document.querySelectorAll('.service-flip')];
for(const card of cards){
 const button=card.querySelector('.service-flip__toggle');
 const toggle=()=>{const opened=card.classList.toggle('is-flipped');card.classList.toggle('manual-front',!opened);button.setAttribute('aria-expanded',String(opened));button.textContent='';button.setAttribute('aria-label',opened?'Показать лицевую сторону':'Подробнее об услуге');};
 card.addEventListener('pointerleave',()=>card.classList.remove('manual-front'));
 button.addEventListener('click',toggle);
 card.addEventListener('keydown',e=>{if(e.key==='Escape'&&card.classList.contains('is-flipped')){card.classList.remove('is-flipped');card.classList.add('manual-front');button.setAttribute('aria-expanded','false');button.textContent='';button.setAttribute('aria-label','Подробнее об услуге');button.focus();}});
}
})();
