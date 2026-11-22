/* V10.21: Only the mobile service-card module. Other pages and desktop untouched. */
(() => {
  'use strict';
  if (!window.matchMedia('(max-width:780px)').matches) return;
  const grid = document.querySelector('.subpage--services .services-flip-grid');
  if (!grid) return;
  document.body.classList.add('v1021-services-mobile');
  const makeIcon = () => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12a7 7 0 0 1 12-5"/><path d="M17 3v5h-5"/><path d="M19 12a7 7 0 0 1-12 5"/><path d="M7 21v-5h5"/></svg>';
  let flips = 0;
  for (const old of [...grid.querySelectorAll('.service-flip')]) {
    // A clone drops all old click, touch and hover handlers registered by V6-V10.20.
    // It retains the approved text, prices, links, gradients and front-side artwork.
    const card = old.cloneNode(true);
    const inner = card.querySelector('.service-flip__inner');
    const front = inner?.querySelector('.service-flip__front');
    const back = inner?.querySelector('.service-flip__back');
    if (!inner || !front || !back) continue;
    card.classList.remove('is-flipped','manual-front');
    card.classList.add('v1021-service');
    card.removeAttribute('role');card.removeAttribute('tabindex');
    card.removeAttribute('aria-label');
    // Delete every control inherited from the previous mobile implementations.
    for (const node of card.querySelectorAll(
      '.service-flip__toggle, .v1015-flip-back, .v1016-service-return, .v1017-service-turn, .v1018-service-control, .v1018-service-turn, .v1016-flip, .v1021-service-button')) node.remove();
    front.querySelector('.service-flip__front-hint')?.remove();
    // Artwork stays only on the front. Avoid accidental back-layer bleed.
    back.querySelectorAll('.v8-service-art, .service-flip__art').forEach(node => node.remove());
    function button(label) {
      const b = document.createElement('button');
      b.type = 'button';b.className = 'v1021-service-button';
      b.setAttribute('aria-label',label);
      b.innerHTML = makeIcon();
      return b;
    }
    const open = button('Перевернуть карточку услуги');
    const close = button('Вернуть лицевую сторону услуги');
    front.append(open);back.append(close);
    let flipped = false;
    let lock = false;
    function setFlip(next) {
      if (lock || next === flipped) return;
      lock = true;flipped = next;
      card.classList.toggle('is-flipped',flipped);
      card.setAttribute('aria-expanded',String(flipped));
      open.tabIndex = flipped ? -1 : 0;
      close.tabIndex = flipped ? 0 : -1;
      open.setAttribute('aria-hidden',String(flipped));
      close.setAttribute('aria-hidden',String(!flipped));
      flips++;
      setTimeout(() => {lock = false;}, 720);
    }
    open.addEventListener('click',e => {e.preventDefault();e.stopPropagation();setFlip(true);});
    close.addEventListener('click',e => {e.preventDefault();e.stopPropagation();setFlip(false);});
    card.addEventListener('keydown',e => {
      if (e.key === 'Escape' && flipped) { e.preventDefault();setFlip(false);open.focus({preventScroll:true}); }
    });
    card.setAttribute('aria-expanded','false');
    close.tabIndex = -1;close.setAttribute('aria-hidden','true');
    open.setAttribute('aria-hidden','false');
    old.replaceWith(card);
  }
  window.LUMO_V1021_SERVICES_DEBUG = () => ({cards:grid.querySelectorAll('.v1021-service').length,flips});
})();
