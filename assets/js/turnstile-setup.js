/* Lumo Sites Turnstile. Public site key is configured in contact.html. */
(()=>{
 const box=document.getElementById('lumo-turnstile');
 const key=box?.dataset.sitekey?.trim();
 if(!box||!key)return;
 box.hidden=false;
 box.style.margin='16px 0';
 let widgetId=null;
 window.lumoTurnstileGetToken=()=>widgetId!==null&&window.turnstile?window.turnstile.getResponse(widgetId):'';
 window.lumoTurnstileReset=()=>{if(widgetId!==null&&window.turnstile)window.turnstile.reset(widgetId);};
 const script=document.createElement('script');
 script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
 script.async=true;
 script.onload=()=>{
  if(window.turnstile)widgetId=window.turnstile.render(box,{
   sitekey:key,theme:'auto',
   'error-callback':()=>{},
   'expired-callback':()=>{}
  });
 };
 script.onerror=()=>{box.textContent='Проверка безопасности не загрузилась. Обнови страницу.';};
 document.head.append(script);
})();
