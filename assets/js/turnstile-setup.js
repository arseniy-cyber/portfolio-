/* Optional Turnstile integration. Add your public Cloudflare SITE KEY to data-sitekey in contact.html.
   Also enforce TURNSTILE_SECRET verification in the Cloudflare Worker before enabling. */
(()=>{
 const box=document.getElementById('lumo-turnstile');
 const key=box?.dataset.sitekey?.trim();
 if(!box||!key)return;
 box.hidden=false;
 box.style.margin='16px 0';
 const script=document.createElement('script');
 script.src='https://challenges.cloudflare.com/turnstile/v0/api.js';
 script.async=true;script.defer=true;
 script.onerror=()=>{box.textContent='Проверка безопасности не загрузилась. Обнови страницу.';};
 script.onload=()=>{
  if(window.turnstile)window.turnstile.render(box,{sitekey:key,theme:'auto'});
 };
 document.head.append(script);
})();
