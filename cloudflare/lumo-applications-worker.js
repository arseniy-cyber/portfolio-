// Publish this file to your existing Cloudflare Worker: lumo-applications.
// Existing encrypted environment secrets: BOT_TOKEN, CHAT_ID, TURNSTILE_SECRET.
// Important: deploy the GitHub Pages site with the Turnstile Site Key first.
const ALLOWED_ORIGINS = [
  'https://arseniy-cyber.github.io',
  'https://lumosites.ru',
  'https://www.lumosites.ru'
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin);
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': allowed ? origin : '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    const reply = (body, status) => new Response(JSON.stringify(body), { status, headers });

    if (!allowed) return reply({ success: false, error: 'Forbidden' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return reply({ success: false, error: 'Method not allowed' }, 405);

    try {
      const raw = await request.text();
      if (raw.length > 10000) return reply({ success: false, error: 'Too large' }, 413);

      let data;
      try { data = JSON.parse(raw); }
      catch { return reply({ success: false, error: 'Invalid JSON' }, 400); }

      const name = String(data.name || '').trim().slice(0, 100);
      const contact = String(data.contact || '').trim().slice(0, 200);
      const task = String(data.task || '').trim().slice(0, 3000);
      const token = String(data.turnstileToken || '').trim();

      if (!name || !contact || !task) return reply({ success: false, error: 'Заполните все поля' }, 400);
      if (!env.TURNSTILE_SECRET || !env.BOT_TOKEN || !env.CHAT_ID)
        return reply({ success: false, error: 'Server configuration incomplete' }, 503);
      if (!token) return reply({ success: false, error: 'Turnstile required' }, 403);

      const verification = new FormData();
      verification.append('secret', env.TURNSTILE_SECRET);
      verification.append('response', token);
      const ip = request.headers.get('CF-Connecting-IP');
      if (ip) verification.append('remoteip', ip);

      const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', body: verification
      });
      if (!verifyResponse.ok) return reply({ success: false, error: 'Verification unavailable' }, 502);
      const verified = await verifyResponse.json();
      if (!verified.success) return reply({ success: false, error: 'Turnstile verification failed' }, 403);

      const message = 'НОВАЯ ЗАЯВКА — LUMO SITES\n\n' +
        'Имя: ' + name + '\n' +
        'Контакт: ' + contact + '\n\n' +
        'Описание проекта:\n' + task;

      const response = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: env.CHAT_ID, text: message })
      });
      if (!response.ok) throw new Error('Telegram delivery failed');
      return reply({ success: true }, 200);
    } catch (error) {
      console.error('Application failed', error.message);
      return reply({ success: false }, 500);
    }
  }
};
