/* Website analytics only. No Google code or requests until the visitor opts in. */
(() => {
  'use strict';
  const id = 'G-70ZXTM19E0';
  const key = 'rolltimer.analytics.v1';
  const ui = document.getElementById('analytics-consent');
  const disabled = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  let active = false;
  const read = () => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = value => { try { localStorage.setItem(key, value); } catch { /* in-memory consent */ } };
  const event = (name, params = {}) => {
    if (active) window.gtag('event', name, { site_language: document.documentElement.lang, ...params });
  };
  function start() {
    if (active || disabled || location.hostname !== 'grishaster80.github.io') return;
    active = true;
    window['ga-disable-' + id] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    // Strip arbitrary query strings and fragments from pages, referrers and links.
    const page = new URL(location.origin + location.pathname);
    for (const name of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
      const value = new URL(location.href).searchParams.get(name);
      if (value && /^[a-zA-Z0-9_. -]{1,100}$/.test(value)) page.searchParams.set(name, value);
    }
    let referrer = '';
    try { referrer = new URL(document.referrer).origin; } catch { /* direct */ }
    window.gtag('config', id, { page_location: page.href, page_referrer: referrer,
      allow_google_signals: false, allow_ad_personalization_signals: false,
      cookie_path: '/rolltimer/', cookie_expires: 60 * 60 * 24 * 365,
      site_language: document.documentElement.lang });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.append(script);
  }
  function reject() {
    active = false;
    window['ga-disable-' + id] = true;
    save('denied');
    // Remove cookies set on this site's path, including GA's default parent domain.
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const domain of ['', '; domain=grishaster80.github.io', '; domain=.github.io']) {
        for (const path of ['/rolltimer/', '/']) document.cookie = name + '=; Max-Age=0; path=' + path + domain;
      }
    }
    ui.hidden = true;
    // Unload Google code when withdrawing an existing consent.
    if (window.gtag) location.reload();
  }
  document.getElementById('analytics-accept').addEventListener('click', () => { save('granted'); ui.hidden = true; start(); });
  document.getElementById('analytics-reject').addEventListener('click', reject);
  document.getElementById('analytics-settings').addEventListener('click', () => { ui.hidden = false; document.getElementById('analytics-reject').focus(); });
  ui.hidden = disabled || read() !== null;
  if (read() === 'granted') start();
  function trackLink(e) {
    if (e.type === 'auxclick' && e.button !== 1) return;
    const a = e.target.closest('a[href]');
    if (!a || !active) return;
    const url = new URL(a.href, location.href);
    const destination = a.dataset.analytics || (a.hreflang ? 'language' :
      url.protocol === 'mailto:' ? 'email' : url.pathname.includes('/privacy/') ? 'privacy' :
      url.pathname.includes('/support/') ? 'support' : url.origin !== location.origin ? 'external' : 'navigation');
    const names = { app_store: 'app_store_click', android_apk: 'android_apk_download', rustore: 'rustore_click', language: 'language_change' };
    event(names[destination] || 'link_click', { link_destination: destination,
      link_url: url.protocol === 'mailto:' ? 'mailto:' : url.origin + url.pathname,
      link_placement: a.closest('footer') ? 'footer' : a.closest('nav') ? 'navigation' : 'content',
      ...(a.hreflang ? { target_language: a.hreflang } : {}) });
  }
  document.addEventListener('click', trackLink);
  document.addEventListener('auxclick', trackLink);
  document.querySelectorAll('details.install').forEach(el => el.addEventListener('toggle', () => { if (el.open) event('install_help_open'); }));
  let scrolled = false;
  document.addEventListener('scroll', () => {
    if (!active || scrolled) return;
    const height = document.documentElement.scrollHeight;
    if (window.scrollY + window.innerHeight >= height * .9) { scrolled = true; event('scroll', { percent_scrolled: 90 }); }
  }, { passive: true });
})();
