(function () {
  'use strict';

  const ITINERARY_URL = 'https://smarttripplannerai.netlify.app';
  const script = document.currentScript;
  const API_BASE = (script && script.getAttribute('data-api-url')) ||
    (script && script.src ? new URL(script.src).origin : window.location.origin);
  const BOT_SVG = '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><radialGradient id="stpGold" cx="35%" cy="30%" r="70%">' +
    '<stop offset="0%" stop-color="#F0D78A"/><stop offset="55%" stop-color="#D4A34F"/><stop offset="100%" stop-color="#A67C2E"/>' +
    '</radialGradient><linearGradient id="stpShine" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#fff" stop-opacity=".35"/><stop offset="50%" stop-color="#fff" stop-opacity="0"/>' +
    '</linearGradient></defs>' +
    '<circle cx="32" cy="32" r="32" fill="url(#stpGold)"/>' +
    '<ellipse cx="32" cy="18" rx="18" ry="10" fill="url(#stpShine)"/>' +
    '<ellipse cx="32" cy="35" rx="13" ry="12" fill="#C9B8E8"/>' +
    '<rect x="22" y="30" width="20" height="10" rx="5" fill="#1E1B3A"/>' +
    '<ellipse cx="27" cy="35" rx="2.5" ry="3.2" fill="#5DD5FC"/><ellipse cx="37" cy="35" rx="2.5" ry="3.2" fill="#5DD5FC"/>' +
    '<rect x="29" y="39" width="6" height="2" rx="1" fill="#1E1B3A"/>' +
    '<line x1="18" y1="32" x2="22" y2="34" stroke="#F0A0B8" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="17" cy="31" r="2.5" fill="#F06B82"/>' +
    '<line x1="46" y1="32" x2="42" y2="34" stroke="#F0A0B8" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="47" cy="31" r="2.5" fill="#F06B82"/>' +
    '<ellipse cx="32" cy="22" rx="5" ry="3" fill="#F5D76E"/>' +
    '</svg>';

  const OPTION_META = {
    'Within India': { icon: '🇮🇳', color: '#FF6B35', bg: 'rgba(255,107,53,.12)' },
    'Outside India': { icon: '🌍', color: '#3B82F6', bg: 'rgba(59,130,246,.12)' },
    Mountains: { icon: '🏔️', color: '#6366F1', bg: 'rgba(99,102,241,.12)' },
    Beaches: { icon: '🏖️', color: '#06B6D4', bg: 'rgba(6,182,212,.12)' },
    Heritage: { icon: '🏛️', color: '#D97706', bg: 'rgba(217,119,6,.12)' },
    Adventure: { icon: '🧗', color: '#EF4444', bg: 'rgba(239,68,68,.12)' },
    Wildlife: { icon: '🦁', color: '#84CC16', bg: 'rgba(132,204,22,.12)' },
    Spiritual: { icon: '🕉️', color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
    Luxury: { icon: '💎', color: '#A855F7', bg: 'rgba(168,85,247,.12)' },
    Romantic: { icon: '💕', color: '#EC4899', bg: 'rgba(236,72,153,.12)' },
    Family: { icon: '👨‍👩‍👧', color: '#14B8A6', bg: 'rgba(20,184,166,.12)' },
    Europe: { icon: '🏰', color: '#6366F1', bg: 'rgba(99,102,241,.12)' },
    'Southeast Asia': { icon: '🌴', color: '#10B981', bg: 'rgba(16,185,129,.12)' },
    'Middle East': { icon: '🕌', color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
    'East Asia': { icon: '🏯', color: '#EF4444', bg: 'rgba(239,68,68,.12)' },
    Australia: { icon: '🦘', color: '#F97316', bg: 'rgba(249,115,22,.12)' },
    'USA & Canada': { icon: '🗽', color: '#3B82F6', bg: 'rgba(59,130,246,.12)' },
    Africa: { icon: '🌍', color: '#D97706', bg: 'rgba(217,119,6,.12)' },
    'South America': { icon: '🌎', color: '#22C55E', bg: 'rgba(34,197,94,.12)' },
    'Under ₹20,000': { icon: '💵', color: '#22C55E', bg: 'rgba(34,197,94,.12)' },
    '₹20,000–₹50,000': { icon: '💰', color: '#10B981', bg: 'rgba(16,185,129,.12)' },
    '₹50,000–₹1,00,000': { icon: '💳', color: '#3B82F6', bg: 'rgba(59,130,246,.12)' },
    '₹1,00,000–₹2,00,000': { icon: '✨', color: '#A855F7', bg: 'rgba(168,85,247,.12)' },
    '₹2,00,000+': { icon: '👑', color: '#D4A34F', bg: 'rgba(212,163,79,.15)' },
    Weekend: { icon: '⚡', color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
    '3 to 5 Days': { icon: '📅', color: '#3B82F6', bg: 'rgba(59,130,246,.12)' },
    January: { icon: '❄️', color: '#60A5FA', bg: 'rgba(96,165,250,.12)' },
    February: { icon: '💝', color: '#F472B6', bg: 'rgba(244,114,182,.12)' },
    March: { icon: '🌸', color: '#F9A8D4', bg: 'rgba(249,168,212,.12)' },
    April: { icon: '🌷', color: '#34D399', bg: 'rgba(52,211,153,.12)' },
    May: { icon: '☀️', color: '#FBBF24', bg: 'rgba(251,191,36,.12)' },
    June: { icon: '🌧️', color: '#38BDF8', bg: 'rgba(56,189,248,.12)' },
    July: { icon: '🏖️', color: '#F97316', bg: 'rgba(249,115,22,.12)' },
    August: { icon: '🌊', color: '#06B6D4', bg: 'rgba(6,182,212,.12)' },
    September: { icon: '🍃', color: '#84CC16', bg: 'rgba(132,204,22,.12)' },
    October: { icon: '🎃', color: '#FB923C', bg: 'rgba(251,146,60,.12)' },
    November: { icon: '🍂', color: '#D97706', bg: 'rgba(217,119,6,.12)' },
    December: { icon: '🎄', color: '#EF4444', bg: 'rgba(239,68,68,.12)' },
    'Flexible / Any month': { icon: '🗓️', color: '#8B5CF6', bg: 'rgba(139,92,246,.12)' },
    '1 Week': { icon: '🗓️', color: '#6366F1', bg: 'rgba(99,102,241,.12)' },
    '2 Weeks+': { icon: '🌅', color: '#EC4899', bg: 'rgba(236,72,153,.12)' },
    Solo: { icon: '🎒', color: '#6366F1', bg: 'rgba(99,102,241,.12)' },
    Couple: { icon: '💑', color: '#EC4899', bg: 'rgba(236,72,153,.12)' },
    Friends: { icon: '👯', color: '#F97316', bg: 'rgba(249,115,22,.12)' },
    Honeymoon: { icon: '💍', color: '#A855F7', bg: 'rgba(168,85,247,.12)' },
    'Similar Destinations': { icon: '🔄', color: '#3B82F6', bg: 'rgba(59,130,246,.12)' },
    'Cheaper Alternatives': { icon: '💚', color: '#22C55E', bg: 'rgba(34,197,94,.12)' },
    'Luxury Alternatives': { icon: '💎', color: '#A855F7', bg: 'rgba(168,85,247,.12)' },
    'Hidden Gems': { icon: '💎', color: '#06B6D4', bg: 'rgba(6,182,212,.12)' },
    'Best Time To Travel': { icon: '🌤️', color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
    'Visa Information': { icon: '🛂', color: '#6366F1', bg: 'rgba(99,102,241,.12)' },
    'Travel Tips': { icon: '💡', color: '#D4A34F', bg: 'rgba(212,163,79,.15)' },
    'See Other Locations': { icon: '🔄', color: '#10B981', bg: 'rgba(16,185,129,.12)' },
    "Don't Like These? See Other Locations": { icon: '🔄', color: '#10B981', bg: 'rgba(16,185,129,.12)' },
    'Try Again': { icon: '🔁', color: '#D4A34F', bg: 'rgba(212,163,79,.15)' }
  };

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function getMeta(label) {
    const clean = label.replace(/^[\u{1F1E0}-\u{1F1FF}]{2}\s*/u, '').replace(/^[\p{Emoji}\uFE0F]+\s*/u, '').trim();
    const key = Object.keys(OPTION_META).find(k => label.includes(k) || clean === k);
    return OPTION_META[key || clean] || OPTION_META[label] || { icon: '✈️', color: '#D4A34F', bg: 'rgba(212,163,79,.12)' };
  }

  function chipLabel(label) {
    let s = label.replace(/^[\u{1F1E0}-\u{1F1FF}]{2}\s*/u, '');
    if (/^[^\x00-\x7Fa-zA-Z0-9₹]/.test(s)) {
      s = s.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]+\s*/u, '');
    }
    return s.trim() || label;
  }

  function createChip(label, onClick) {
    const meta = getMeta(label);
    const btn = document.createElement('button');
    btn.className = 'stp-chip';
    btn.style.setProperty('--chip-color', meta.color);
    btn.style.setProperty('--chip-bg', meta.bg);
    btn.innerHTML =
      '<span class="stp-chip-icon">' + meta.icon + '</span>' +
      '<span class="stp-chip-label">' + escapeHtml(chipLabel(label)) + '</span>' +
      '<span class="stp-chip-arrow" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';
    btn.addEventListener('click', onClick);
    return btn;
  }

  const STEPS = { WELCOME: 0, REGION: 1, MONTH: 2, CATEGORY: 3, BUDGET: 4, DURATION: 5, STYLE: 6, RECOMMENDATIONS: 7, FOLLOWUP: 8, LEAD: 9 };

  const INDIA_CATS = ['Mountains', 'Beaches', 'Heritage', 'Adventure', 'Wildlife', 'Spiritual', 'Luxury', 'Romantic', 'Family'];
  const INTL_CATS = ['Europe', 'Southeast Asia', 'Middle East', 'East Asia', 'Australia', 'USA & Canada', 'Africa', 'South America'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Flexible / Any month'];
  const BUDGETS = ['Under ₹20,000', '₹20,000–₹50,000', '₹50,000–₹1,00,000', '₹1,00,000–₹2,00,000', '₹2,00,000+'];
  const DURATIONS = ['Weekend', '3 to 5 Days', '1 Week', '2 Weeks+'];
  const STYLES = ['Solo', 'Couple', 'Family', 'Friends', 'Honeymoon'];
  const FOLLOWUPS = [
    { id: 'similar', label: 'Similar Destinations' },
    { id: 'cheaper', label: 'Cheaper Alternatives' },
    { id: 'luxury', label: 'Luxury Alternatives' },
    { id: 'hidden', label: 'Hidden Gems' },
    { id: 'bestTime', label: 'Best Time To Travel' },
    { id: 'visa', label: 'Visa Information' },
    { id: 'tips', label: 'Travel Tips' },
    { id: 'others', label: "Don't Like These? See Other Locations" }
  ];

  const CUSTOM = 'Enter custom answer';

  const NATURE_BACKGROUNDS = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1439069690690-593ad94246d4?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1504198453319-860ce7858549?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1528183429752-a97d0bf99fd5?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=1400&q=85'
  ];

  let state = createInitialState();
  let isOpen = false;
  let started = false;
  let activeReplies = null;
  let bgTimer = null;
  let bgUseA = true;
  let bgIndex = Math.floor(Math.random() * NATURE_BACKGROUNDS.length);

  function createInitialState() {
    return {
      step: STEPS.WELCOME,
      region: '', month: '', category: '', budget: '', duration: '', travelStyle: '',
      destinations: [], interactions: 0, leadShown: false, batchIndex: 0,
      dark: window.matchMedia('(prefers-color-scheme: dark)').matches
    };
  }

  /* ── Fonts ── */
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap';
  document.head.appendChild(fontLink);

  /* ── Styles ── */
  const css = `
    #stp-widget *{box-sizing:border-box;margin:0;padding:0}
    #stp-widget{
      --stp-gold:#D4A34F;--stp-gold-hover:#C4933F;--stp-gold-soft:rgba(212,163,79,.12);
      --stp-bg:#f7f6f3;--stp-surface:#ffffff;--stp-text:#111827;--stp-muted:#6b7280;
      --stp-border:rgba(17,24,39,.09);--stp-shadow:0 20px 60px rgba(17,24,39,.14),0 0 0 1px rgba(17,24,39,.04);
      --stp-radius:20px;--stp-blur:20px;
      font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
      position:fixed;z-index:2147483647;line-height:1.5;-webkit-font-smoothing:antialiased
    }
    #stp-widget.stp-dark{
      --stp-bg:#0b0e14;--stp-surface:#141824;--stp-text:#f3f4f6;--stp-muted:#9ca3af;
      --stp-border:rgba(255,255,255,.07);--stp-shadow:0 20px 60px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.05);
      --stp-gold-soft:rgba(212,163,79,.15)
    }
    #stp-launcher-wrap{
      position:fixed;bottom:24px;right:24px;width:64px;height:64px;z-index:2147483647;
      display:flex;align-items:center;justify-content:center
    }
    #stp-launcher-wrap::before{
      content:'';position:absolute;inset:-4px;border-radius:50%;pointer-events:none;
      background:linear-gradient(135deg,#D4A34F,#F0D78A,#D4A34F);
      animation:stpRingPulse 2.5s ease-in-out infinite;opacity:.55;z-index:0
    }
    #stp-launcher-wrap::after{
      content:'';position:absolute;inset:-8px;border-radius:50%;pointer-events:none;
      border:2px solid rgba(212,163,79,.25);animation:stpRingExpand 2.5s ease-out infinite;z-index:0
    }
    #stp-launcher{
      position:relative;z-index:1;width:60px;height:60px;border-radius:50%;
      border:2px solid rgba(255,255,255,.25);cursor:pointer;padding:0;
      background:transparent;overflow:hidden;pointer-events:auto;
      box-shadow:0 8px 32px rgba(212,163,79,.45),inset 0 1px 0 rgba(255,255,255,.3);
      transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s
    }
    #stp-launcher:hover{transform:scale(1.07);box-shadow:0 14px 40px rgba(212,163,79,.55),inset 0 1px 0 rgba(255,255,255,.4)}
    #stp-launcher svg{width:100%;height:100%;display:block}
    #stp-launcher-wrap.stp-open #stp-launcher{transform:scale(.93)}
    #stp-launcher-wrap.stp-open::before,#stp-launcher-wrap.stp-open::after{animation:none;opacity:0}
    @keyframes stpRingPulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.06);opacity:.75}}
    @keyframes stpRingExpand{0%{transform:scale(.9);opacity:.6}100%{transform:scale(1.2);opacity:0}}
    #stp-panel{
      position:fixed;bottom:96px;right:24px;width:400px;max-width:calc(100vw - 32px);
      height:min(640px,calc(100vh - 112px));border-radius:var(--stp-radius);
      background-color:var(--stp-bg);--stp-bg-fade:rgba(247,246,243,.88);
      border:1px solid var(--stp-border);box-shadow:var(--stp-shadow);
      display:flex;flex-direction:column;overflow:hidden;
      opacity:0;transform:translateY(12px) scale(.98);pointer-events:none;
      transition:opacity .3s ease,transform .3s cubic-bezier(.34,1.56,.64,1);z-index:2147483646
    }
    #stp-widget.stp-dark #stp-panel{--stp-bg-fade:rgba(11,14,20,.9)}
    .stp-bg-layer{
      position:absolute;inset:0;z-index:0;background-size:cover;background-position:center;
      opacity:0;transition:opacity 1.6s ease-in-out;transform:scale(1.05)
    }
    .stp-bg-layer.stp-bg-visible{opacity:1;transform:scale(1)}
    #stp-bg-overlay{
      position:absolute;inset:0;z-index:1;pointer-events:none;
      background:linear-gradient(165deg,var(--stp-bg-fade) 0%,rgba(247,246,243,.72) 45%,var(--stp-bg-fade) 100%)
    }
    #stp-widget.stp-dark #stp-bg-overlay{
      background:linear-gradient(165deg,var(--stp-bg-fade) 0%,rgba(11,14,20,.78) 50%,var(--stp-bg-fade) 100%)
    }
    #stp-header,#stp-progress,#stp-messages,.stp-powered{position:relative;z-index:2}
    #stp-panel.stp-visible{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}
    #stp-header{
      padding:12px 14px;display:flex;align-items:center;gap:10px;
      background:rgba(255,255,255,.88);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
      flex-shrink:0;border-bottom:1px solid var(--stp-border)
    }
    #stp-widget.stp-dark #stp-header{background:rgba(20,24,36,.9)}
    #stp-avatar{
      width:40px;height:40px;flex-shrink:0;border-radius:50%;overflow:hidden;
      box-shadow:0 2px 12px rgba(212,163,79,.35),inset 0 1px 0 rgba(255,255,255,.25);
      border:2px solid rgba(212,163,79,.3)
    }
    #stp-avatar svg{width:40px;height:40px;display:block}
    #stp-header-info{flex:1;min-width:0;overflow:hidden}
    #stp-header-info h3{
      font-family:'Playfair Display',Georgia,serif;font-size:14px;font-weight:700;
      color:var(--stp-text);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis
    }
    .stp-brand{color:var(--stp-gold)}
    #stp-header-info p{font-size:11px;color:var(--stp-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #stp-header-actions{display:flex;gap:2px;flex-shrink:0}
    .stp-icon-btn{
      width:32px;height:32px;border-radius:8px;border:none;background:transparent;
      color:var(--stp-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;
      transition:background .15s,color .15s;flex-shrink:0
    }
    .stp-icon-btn:hover{background:var(--stp-gold-soft);color:var(--stp-gold)}
    #stp-progress{height:2px;background:var(--stp-border);flex-shrink:0}
    #stp-progress-bar{height:100%;background:linear-gradient(90deg,#D4A34F,#E8C068);width:0%;transition:width .4s ease}
    #stp-messages{
      flex:1;overflow-y:auto;overflow-x:hidden;padding:16px 14px;
      display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth;min-height:0
    }
    #stp-messages::-webkit-scrollbar{width:4px}
    #stp-messages::-webkit-scrollbar-thumb{background:var(--stp-border);border-radius:4px}
    .stp-msg{max-width:92%;width:fit-content;animation:stpFadeIn .35s ease;min-width:0}
    .stp-msg-bot{align-self:flex-start;max-width:92%}
    .stp-msg-user{align-self:flex-end;max-width:88%}
    .stp-bubble{
      display:block;max-width:100%;overflow:hidden;
      padding:14px 18px;border-radius:16px;font-size:13.5px;color:var(--stp-text);
      line-height:1.6;white-space:normal;word-break:break-word;overflow-wrap:anywhere
    }
    .stp-msg-bot .stp-bubble{
      background:rgba(255,255,255,.9);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
      border:1px solid var(--stp-border);border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.04)
    }
    #stp-widget.stp-dark .stp-msg-bot .stp-bubble{background:rgba(20,24,36,.9)}
    .stp-msg-user .stp-bubble{
      background:linear-gradient(135deg,#D4A34F,#C4933F);color:#111827;
      border-bottom-right-radius:4px;font-weight:500;box-shadow:0 2px 8px rgba(212,163,79,.22)
    }
    .stp-typing{
      display:flex;gap:4px;padding:12px 16px;align-self:flex-start;
      background:var(--stp-surface);border:1px solid var(--stp-border);
      border-radius:14px;border-bottom-left-radius:4px
    }
    .stp-typing span{width:6px;height:6px;border-radius:50%;background:var(--stp-gold);animation:stpBounce 1.4s infinite}
    .stp-typing span:nth-child(2){animation-delay:.15s}
    .stp-typing span:nth-child(3){animation-delay:.3s}
    .stp-replies-wrap{width:100%;max-width:100%;align-self:stretch;min-width:0;animation:stpFadeIn .35s ease}
    .stp-replies{
      display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:100%
    }
    .stp-replies.stp-replies-1col{grid-template-columns:1fr}
    .stp-chip{
      width:100%;min-width:0;display:flex;align-items:flex-start;gap:10px;
      padding:10px 12px;border-radius:14px;cursor:pointer;font-family:inherit;
      border:1.5px solid color-mix(in srgb,var(--chip-color) 25%,transparent);
      background:linear-gradient(135deg,rgba(255,255,255,.92) 60%,var(--chip-bg));
      color:var(--stp-text);text-align:left;position:relative;overflow:hidden;
      transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s,border-color .22s,background .22s
    }
    .stp-chip::before{
      content:'';position:absolute;inset:0;background:var(--chip-bg);opacity:0;
      transition:opacity .22s
    }
    .stp-chip:hover:not(:disabled){
      transform:translateY(-2px) scale(1.01);
      border-color:var(--chip-color);
      box-shadow:0 6px 20px color-mix(in srgb,var(--chip-color) 30%,transparent)
    }
    .stp-chip:hover:not(:disabled)::before{opacity:1}
    .stp-chip:active:not(:disabled){transform:translateY(0) scale(.98)}
    .stp-chip:disabled{opacity:.4;cursor:not-allowed;transform:none}
    #stp-widget.stp-dark .stp-chip{background:linear-gradient(135deg,rgba(20,24,36,.92) 60%,var(--chip-bg))}
    .stp-chip-icon{
      width:32px;height:32px;border-radius:10px;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;font-size:16px;
      background:var(--chip-bg);border:1px solid color-mix(in srgb,var(--chip-color) 20%,transparent);
      position:relative;z-index:1;transition:transform .22s
    }
    .stp-chip:hover:not(:disabled) .stp-chip-icon{transform:scale(1.1)}
    .stp-chip-label{
      flex:1;font-size:12.5px;font-weight:600;line-height:1.35;
      position:relative;z-index:1;min-width:0;white-space:normal;
      overflow-wrap:anywhere;word-break:break-word;text-overflow:clip
    }
    .stp-chip-arrow{
      flex-shrink:0;color:var(--chip-color);opacity:0;transform:translateX(-4px);
      transition:opacity .2s,transform .2s;position:relative;z-index:1;display:flex
    }
    .stp-chip:hover:not(:disabled) .stp-chip-arrow{opacity:1;transform:translateX(0)}
    .stp-custom-row{width:100%;margin-top:8px}
    .stp-chip-custom{
      --chip-color:#8B5CF6;--chip-bg:rgba(139,92,246,.12);
      border-style:dashed;border-color:rgba(139,92,246,.4)
    }
    .stp-chip-custom .stp-chip-icon{background:rgba(139,92,246,.15)}
    .stp-custom-form{display:flex;gap:6px;width:100%;animation:stpFadeIn .25s ease}
    .stp-custom-form input{
      flex:1;min-width:0;padding:10px 12px;border-radius:10px;border:1px solid var(--stp-border);
      background:var(--stp-surface);color:var(--stp-text);font-size:12.5px;font-family:inherit;
      outline:none;transition:border-color .2s,box-shadow .2s;width:100%;overflow-wrap:anywhere
    }
    .stp-custom-form input:focus{border-color:var(--stp-gold);box-shadow:0 0 0 3px var(--stp-gold-soft)}
    .stp-custom-form input::placeholder{color:var(--stp-muted)}
    .stp-custom-submit{
      flex-shrink:0;padding:10px 14px;border-radius:10px;border:none;
      background:linear-gradient(135deg,#D4A34F,#C4933F);color:#111827;
      font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit
    }
    .stp-followups .stp-replies{grid-template-columns:1fr}
    .stp-ask-box{width:100%;margin-top:10px;padding-top:10px;border-top:1px solid var(--stp-border)}
    .stp-ask-box p{font-size:12px;color:var(--stp-muted);margin-bottom:8px}
    .stp-ask-form{display:flex;gap:6px;width:100%}
    .stp-ask-form input{
      flex:1;min-width:0;padding:11px 14px;border-radius:12px;border:1px solid var(--stp-border);
      background:rgba(255,255,255,.92);color:var(--stp-text);font-size:13px;font-family:inherit;outline:none;
      width:100%;overflow-wrap:anywhere
    }
    #stp-widget.stp-dark .stp-ask-form input{background:rgba(20,24,36,.92)}
    .stp-ask-form input:focus{border-color:var(--stp-gold);box-shadow:0 0 0 3px var(--stp-gold-soft)}
    .stp-ask-submit{
      flex-shrink:0;padding:11px 16px;border:none;border-radius:12px;
      background:linear-gradient(135deg,#D4A34F,#C4933F);color:#111827;
      font-size:13px;font-weight:600;cursor:pointer;font-family:inherit
    }
    .stp-destinations-block{width:100%;align-self:stretch}
    .stp-card{
      background:var(--stp-surface);border:1px solid var(--stp-border);border-radius:12px;
      padding:14px;margin-top:8px;animation:stpFadeIn .4s ease;max-width:100%;overflow:hidden;
      overflow-wrap:anywhere;word-break:break-word
    }
    .stp-card-header{display:flex;justify-content:space-between;align-items:flex-start;gap:6px;margin-bottom:8px}
    .stp-card-name{font-family:'Playfair Display',Georgia,serif;font-size:15px;font-weight:700;color:var(--stp-text);word-break:break-word;overflow-wrap:anywhere}
    .stp-score{background:linear-gradient(135deg,#D4A34F,#E8C068);color:#111827;font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px;flex-shrink:0}
    .stp-card-meta{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px}
    .stp-tag{font-size:11px;padding:3px 8px;border-radius:6px;background:var(--stp-gold-soft);color:var(--stp-muted)}
    .stp-card-why{font-size:12.5px;color:var(--stp-muted);margin-bottom:8px;line-height:1.5;word-break:break-word;overflow-wrap:anywhere}
    .stp-highlights{font-size:11.5px;color:var(--stp-muted);margin-bottom:10px}
    .stp-highlights li{margin-left:14px;margin-bottom:2px;overflow-wrap:anywhere;word-break:break-word}
    .stp-itinerary-btn{
      display:flex;align-items:center;justify-content:center;width:100%;padding:10px;
      border:none;border-radius:999px;background:linear-gradient(135deg,#D4A34F,#C4933F);
      color:#111827;font-size:12.5px;font-weight:600;cursor:pointer;
      text-decoration:none;font-family:inherit;transition:box-shadow .2s
    }
    .stp-itinerary-btn:hover{box-shadow:0 4px 16px rgba(212,163,79,.35)}
    .stp-lead-form{display:flex;flex-direction:column;gap:8px;margin-top:2px}
    .stp-lead-form input{
      padding:10px 12px;border-radius:10px;border:1px solid var(--stp-border);
      background:var(--stp-surface);color:var(--stp-text);font-size:13px;font-family:inherit;outline:none;width:100%
    }
    .stp-lead-form input:focus{border-color:var(--stp-gold);box-shadow:0 0 0 3px var(--stp-gold-soft)}
    .stp-lead-form button{
      padding:10px;border:none;border-radius:999px;width:100%;
      background:linear-gradient(135deg,#D4A34F,#C4933F);color:#111827;
      font-size:13px;font-weight:600;cursor:pointer;font-family:inherit
    }
    .stp-powered{text-align:center;padding:8px;font-size:10px;color:var(--stp-muted);border-top:1px solid var(--stp-border);flex-shrink:0}
    @keyframes stpFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes stpBounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}}
    @media(max-width:480px){
      #stp-panel{bottom:0;right:0;left:0;width:100%;max-width:100%;height:100%;max-height:100%;border-radius:0}
      #stp-launcher-wrap{bottom:16px;right:16px;width:56px;height:56px}
      #stp-launcher{width:52px;height:52px}
      #stp-panel.stp-visible~#stp-launcher-wrap{opacity:0;pointer-events:none}
      .stp-replies{grid-template-columns:1fr}
    }
  `;

  /* ── DOM ── */
  const root = document.createElement('div');
  root.id = 'stp-widget';
  if (state.dark) root.classList.add('stp-dark');

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  root.innerHTML = `
    <div id="stp-launcher-wrap">
      <button id="stp-launcher" aria-label="Open SmartTripPlanner AI">${BOT_SVG}</button>
    </div>
    <div id="stp-panel" role="dialog" aria-label="Destination Discovery Chat">
      <div id="stp-bg-a" class="stp-bg-layer"></div>
      <div id="stp-bg-b" class="stp-bg-layer"></div>
      <div id="stp-bg-overlay"></div>
      <div id="stp-header">
        <div id="stp-avatar">${BOT_SVG}</div>
        <div id="stp-header-info">
          <h3><span class="stp-brand">SmartTripPlanner</span> AI</h3>
          <p>Destination Discovery Expert</p>
        </div>
        <div id="stp-header-actions">
          <button class="stp-icon-btn" id="stp-reset" title="New chat" aria-label="Start new chat">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
          </button>
          <button class="stp-icon-btn" id="stp-theme" title="Toggle theme" aria-label="Toggle theme">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          </button>
          <button class="stp-icon-btn" id="stp-close" title="Close chat" aria-label="Close chat">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <div id="stp-progress"><div id="stp-progress-bar"></div></div>
      <div id="stp-messages"></div>
      <div class="stp-powered">Powered by SmartTripPlanner AI</div>
    </div>
  `;
  document.body.appendChild(root);

  const launcherWrap = root.querySelector('#stp-launcher-wrap');
  const launcher = root.querySelector('#stp-launcher');
  const panel = root.querySelector('#stp-panel');
  const messages = root.querySelector('#stp-messages');
  const progressBar = root.querySelector('#stp-progress-bar');
  const bgA = root.querySelector('#stp-bg-a');
  const bgB = root.querySelector('#stp-bg-b');

  function setBackground(idx) {
    const url = NATURE_BACKGROUNDS[idx % NATURE_BACKGROUNDS.length];
    const next = bgUseA ? bgA : bgB;
    const prev = bgUseA ? bgB : bgA;
    next.style.backgroundImage = "url('" + url + "')";
    next.classList.add('stp-bg-visible');
    prev.classList.remove('stp-bg-visible');
    bgUseA = !bgUseA;
  }

  function pickRandomBackground() {
    bgIndex = Math.floor(Math.random() * NATURE_BACKGROUNDS.length);
    setBackground(bgIndex);
  }

  function startBgRotation() {
    if (bgTimer) return;
    pickRandomBackground();
    bgTimer = setInterval(function () {
      bgIndex = (bgIndex + 1) % NATURE_BACKGROUNDS.length;
      setBackground(bgIndex);
    }, 9000);
  }

  function stopBgRotation() {
    if (bgTimer) { clearInterval(bgTimer); bgTimer = null; }
  }

  function normalizeMonth(m) {
    if (!m || /flexible|any/i.test(m)) return '';
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.find(function (mon) { return m.toLowerCase().startsWith(mon.toLowerCase().slice(0, 3)); }) || m.trim();
  }

  function seasonLabel(dest) {
    const m = normalizeMonth(state.month);
    const bt = dest.bestTimeToVisit || '';
    if (!m) return bt || 'Season varies';
    if (/october\s*[–-]\s*march|oct\s*[–-]\s*mar|peak season|best season/i.test(bt)) return 'Ideal in ' + m;
    if (!bt.toLowerCase().includes(m.toLowerCase().slice(0, 3))) return 'Ideal in ' + m;
    return bt;
  }

  pickRandomBackground();

  function updateProgress() {
    const pct = Math.min(100, (state.step / 7) * 100);
    progressBar.style.width = pct + '%';
  }

  function toggle(open) {
    isOpen = open !== undefined ? open : !isOpen;
    panel.classList.toggle('stp-visible', isOpen);
    launcherWrap.classList.toggle('stp-open', isOpen);
    if (isOpen && !started) { started = true; startConversation(); }
    if (isOpen) { scrollBottom(); startBgRotation(); }
    else stopBgRotation();
  }

  function resetChat() {
    hideTyping();
    stopBgRotation();
    messages.innerHTML = '';
    activeReplies = null;
    const wasDark = state.dark;
    state = createInitialState();
    state.dark = wasDark;
    started = true;
    progressBar.style.width = '0%';
    pickRandomBackground();
    if (isOpen) startBgRotation();
    startConversation();
  }

  launcher.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  launcherWrap.addEventListener('click', e => {
    if (e.target === launcherWrap) toggle();
  });
  root.querySelector('#stp-close').addEventListener('click', () => toggle(false));
  root.querySelector('#stp-reset').addEventListener('click', resetChat);
  root.querySelector('#stp-theme').addEventListener('click', () => {
    state.dark = !state.dark;
    root.classList.toggle('stp-dark', state.dark);
    const btn = root.querySelector('#stp-theme');
    btn.innerHTML = state.dark
      ? '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
  });

  function scrollBottom() {
    requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
  }

  function disableReplies(wrap) {
    if (!wrap) return;
    wrap.querySelectorAll('.stp-chip, .stp-custom-submit').forEach(b => { b.disabled = true; });
    wrap.querySelectorAll('.stp-custom-form input').forEach(i => { i.disabled = true; });
    activeReplies = null;
  }

  function addMessage(text, type) {
    const el = document.createElement('div');
    el.className = 'stp-msg stp-msg-' + (type || 'bot');
    el.innerHTML = '<div class="stp-bubble">' + escapeHtml(text) + '</div>';
    messages.appendChild(el);
    scrollBottom();
    return el;
  }

  function showTyping() {
    hideTyping();
    const el = document.createElement('div');
    el.className = 'stp-typing';
    el.id = 'stp-typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(el);
    scrollBottom();
  }

  function hideTyping() {
    const el = document.getElementById('stp-typing-indicator');
    if (el) el.remove();
  }

  function addReplies(buttons, customPlaceholder, callback, allowCustom, singleColumn) {
    if (activeReplies) disableReplies(activeReplies);

    const wrap = document.createElement('div');
    wrap.className = 'stp-replies-wrap';
    const replies = document.createElement('div');
    replies.className = 'stp-replies' + (singleColumn || buttons.length <= 2 ? ' stp-replies-1col' : '');
    activeReplies = wrap;

    function selectAnswer(answer) {
      disableReplies(wrap);
      callback(answer);
    }

    buttons.forEach(label => {
      replies.appendChild(createChip(label, () => selectAnswer(label)));
    });

    wrap.appendChild(replies);

    if (allowCustom !== false) {
      const customRow = document.createElement('div');
      customRow.className = 'stp-custom-row';

      const customBtn = createChip(CUSTOM, () => {});
      customBtn.classList.add('stp-chip-custom');
      customBtn.querySelector('.stp-chip-label').textContent = CUSTOM;
      customBtn.querySelector('.stp-chip-icon').textContent = '✏️';
      customBtn.onclick = () => {
        if (customRow.querySelector('.stp-custom-form')) return;
        customBtn.style.display = 'none';
        replies.querySelectorAll('.stp-chip').forEach(b => { b.disabled = true; });

        const form = document.createElement('div');
        form.className = 'stp-custom-form';
        form.innerHTML =
          '<input type="text" placeholder="' + escapeHtml(customPlaceholder) + '" maxlength="120" />' +
          '<button class="stp-custom-submit">Go</button>';
        customRow.appendChild(form);

        const input = form.querySelector('input');
        const submit = form.querySelector('.stp-custom-submit');
        input.focus();

        function submitCustom() {
          const val = input.value.trim();
          if (!val) { input.focus(); return; }
          selectAnswer(val);
        }
        submit.addEventListener('click', submitCustom);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') submitCustom(); });
      };
      customRow.appendChild(customBtn);
      wrap.appendChild(customRow);
    }

    messages.appendChild(wrap);
    scrollBottom();
  }

  function trackInteraction() {
    state.interactions++;
    if (state.interactions >= 4 && !state.leadShown && state.step >= STEPS.RECOMMENDATIONS) {
      state.leadShown = true;
      setTimeout(showLeadCapture, 1200);
    }
  }

  function showLeadCapture() {
    state.step = STEPS.LEAD;
    addMessage('Want personalized destination suggestions? Share your details and we\'ll send tailored recommendations to your inbox.');
    const form = document.createElement('div');
    form.className = 'stp-msg stp-msg-bot';
    form.innerHTML = '<div class="stp-bubble"><div class="stp-lead-form">' +
      '<input type="text" id="stp-lead-name" placeholder="Your name" required>' +
      '<input type="email" id="stp-lead-email" placeholder="Your email" required>' +
      '<button id="stp-lead-submit">Get Personalized Suggestions →</button>' +
      '</div></div>';
    messages.appendChild(form);
    scrollBottom();

    form.querySelector('#stp-lead-submit').addEventListener('click', () => {
      const name = form.querySelector('#stp-lead-name').value.trim();
      const email = form.querySelector('#stp-lead-email').value.trim();
      if (!name || !email) { addMessage('Please enter both your name and email.'); return; }
      form.querySelector('#stp-lead-submit').disabled = true;
      fetch(API_BASE + '/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email,
          preferences: { region: state.region, month: state.month, category: state.category, budget: state.budget, duration: state.duration, travelStyle: state.travelStyle }
        })
      })
        .then(r => r.json())
        .then(data => { addMessage(data.message || 'Thank you! Check your inbox soon.'); showFollowups(); })
        .catch(() => { addMessage('Something went wrong. Please try again.'); form.querySelector('#stp-lead-submit').disabled = false; });
    });
  }

  function renderCard(dest) {
    const highlights = (dest.topHighlights || []).map(h => '<li>' + escapeHtml(h) + '</li>').join('');
    const url = ITINERARY_URL + '/form?destination=' + encodeURIComponent(dest.name);
    return '<div class="stp-card">' +
      '<div class="stp-card-header"><div class="stp-card-name">📍 ' + escapeHtml(dest.name) + '</div>' +
      '<div class="stp-score">⭐ ' + (dest.matchScore || 90) + '%</div></div>' +
      '<div class="stp-card-meta">' +
      '<span class="stp-tag">💰 ' + escapeHtml(dest.budgetRange || '') + '</span>' +
      '<span class="stp-tag">✓ ' + escapeHtml(seasonLabel(dest)) + '</span>' +
      '<span class="stp-tag">⏱ ' + escapeHtml(dest.idealTripLength || '') + '</span></div>' +
      '<div class="stp-card-why">✈ ' + escapeHtml(dest.whyItMatches || '') + '</div>' +
      (highlights ? '<ul class="stp-highlights">' + highlights + '</ul>' : '') +
      '<a class="stp-itinerary-btn" href="' + url + '" target="_blank" rel="noopener">Generate Full Itinerary →</a>' +
      '</div>';
  }

  function renderDestinationCards(dests) {
    const wrap = document.createElement('div');
    wrap.className = 'stp-destinations-block';
    wrap.innerHTML = dests.map(renderCard).join('');
    messages.appendChild(wrap);
    scrollBottom();
  }

  function renderDestinations(dests, introMsg) {
    if (introMsg) addMessage(introMsg);
    renderDestinationCards(dests);
    trackInteraction();
    showFollowups();
  }

  function appendMoreDestinations(dests, introMsg) {
    if (introMsg) addMessage(introMsg);
    renderDestinationCards(dests);
    showFollowups();
  }

  function showFollowups() {
    messages.querySelectorAll('.stp-followups').forEach(el => el.remove());

    const wrap = document.createElement('div');
    wrap.className = 'stp-followups';
    const replies = document.createElement('div');
    replies.className = 'stp-replies';

    FOLLOWUPS.forEach(f => {
      replies.appendChild(createChip(f.label, () => {
        handleFollowup(f.id, f.label);
      }));
    });
    wrap.appendChild(replies);

    const askBox = document.createElement('div');
    askBox.className = 'stp-ask-box';
    askBox.innerHTML = '<p>Have a question? Ask anything about destinations, weather, budget, or travel tips.</p>' +
      '<div class="stp-ask-form">' +
      '<input type="text" id="stp-ask-input" placeholder="e.g. Is Ladakh safe in July? Budget tips?" maxlength="200" />' +
      '<button class="stp-ask-submit" id="stp-ask-btn">Ask</button></div>';
    wrap.appendChild(askBox);

    messages.appendChild(wrap);
    scrollBottom();

    const askInput = askBox.querySelector('#stp-ask-input');
    const askBtn = askBox.querySelector('#stp-ask-btn');
    function submitAsk() {
      const q = askInput.value.trim();
      if (!q) { askInput.focus(); return; }
      askBtn.disabled = true;
      askInput.disabled = true;
      handleCustomQuestion(q);
    }
    askBtn.addEventListener('click', submitAsk);
    askInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitAsk(); });
  }

  function handleCustomQuestion(question) {
    addMessage(question, 'user');
    showTyping();
    apiCall('/api/followup', {
      type: 'ask',
      question: question,
      context: getFollowupContext()
    })
      .then(data => {
        hideTyping();
        if (data.destinations && data.destinations.length) {
          state.destinations = state.destinations.concat(data.destinations);
          appendMoreDestinations(data.destinations, data.message);
        } else {
          addMessage(data.message || 'Here\'s what I can tell you.');
          showFollowups();
        }
      })
      .catch(() => {
        hideTyping();
        addMessage('Sorry, I couldn\'t answer that. Please try again.');
        showFollowups();
      });
  }

  function getFollowupContext() {
    return {
      region: state.region, month: state.month, category: state.category,
      budget: state.budget, duration: state.duration, travelStyle: state.travelStyle,
      destinations: state.destinations, batchIndex: state.batchIndex,
      excludeNames: state.destinations.map(d => d.name)
    };
  }

  function apiCall(endpoint, body) {
    return fetch(API_BASE + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Request failed');
      return data;
    }));
  }

  function fetchRecommendations(retries) {
    if (retries === undefined) retries = 0;
    showTyping();
    apiCall('/api/recommend', {
      region: state.region, month: state.month, category: state.category, budget: state.budget,
      duration: state.duration, travelStyle: state.travelStyle
    })
      .then(data => {
        hideTyping();
        state.destinations = data.destinations || [];
        state.step = STEPS.RECOMMENDATIONS;
        updateProgress();
        renderDestinations(state.destinations, data.message);
      })
      .catch(err => {
        hideTyping();
        if (retries < 1) {
          addMessage('Having trouble connecting — retrying…');
          setTimeout(() => fetchRecommendations(retries + 1), 1500);
        } else {
          addMessage('Sorry, I couldn\'t generate recommendations right now. ' + (err.message || 'Please try again.'));
          addReplies(['Try Again'], '', () => fetchRecommendations(0), false);
        }
      });
  }

  function handleFollowup(type, label) {
    addMessage(label, 'user');
    showTyping();
    state.batchIndex++;
    apiCall('/api/followup', { type, context: getFollowupContext() })
      .then(data => {
        hideTyping();
        if (data.destinations && data.destinations.length) {
          const newOnes = data.destinations.filter(d =>
            !state.destinations.some(x => x.name.toLowerCase() === d.name.toLowerCase())
          );
          if (newOnes.length) {
            state.destinations = state.destinations.concat(newOnes);
            appendMoreDestinations(newOnes, data.message);
          } else {
            addMessage('I\'ve already shown the top picks! Try "See Other Locations" for fresh options.');
            showFollowups();
          }
        } else {
          addMessage(data.message || 'Here\'s what I found for you.');
          showFollowups();
        }
        trackInteraction();
      })
      .catch(() => { hideTyping(); addMessage('Sorry, something went wrong. Please try again.'); showFollowups(); });
  }

  function startConversation() {
    setTimeout(() => {
      addMessage('👋 Welcome to SmartTripPlanner AI\n\nI help travelers discover their perfect destination.\n\nAnswer a few quick questions and I\'ll suggest the best places for your next trip.');
      setTimeout(askRegion, 500);
    }, 300);
  }

  function askRegion() {
    state.step = STEPS.REGION;
    updateProgress();
    addMessage('Where would you like to travel?');
    addReplies(['🇮🇳 Within India', '🌎 Outside India'], 'e.g. Southeast Asia, Europe…', answer => {
      addMessage(answer, 'user');
      if (answer.includes('Within') || (/\bindia\b/i.test(answer) && !/outside/i.test(answer))) {
        state.region = 'Within India';
      } else {
        state.region = 'Outside India';
      }
      setTimeout(askMonth, 350);
    }, true);
  }

  function askMonth() {
    state.step = STEPS.MONTH;
    updateProgress();
    addMessage('When are you planning to travel?\n\nI\'ll match destinations to the best season — no desert trips in scorching May!');
    addReplies(MONTHS, 'e.g. Mid-April, Monsoon season', answer => {
      addMessage(answer, 'user');
      state.month = answer;
      setTimeout(askCategory, 350);
    }, true);
  }

  function askCategory() {
    state.step = STEPS.CATEGORY;
    updateProgress();
    const cats = state.region === 'Within India' ? INDIA_CATS : INTL_CATS;
    addMessage(state.region === 'Within India'
      ? 'What kind of experience are you looking for in India?'
      : 'Which region interests you most?');
    addReplies(cats, 'e.g. Islands, Desert, Skiing…', answer => {
      addMessage(answer, 'user');
      state.category = answer;
      setTimeout(askBudget, 350);
    });
  }

  function askBudget() {
    state.step = STEPS.BUDGET;
    updateProgress();
    addMessage('What\'s your approximate budget per person?');
    addReplies(BUDGETS, 'e.g. ₹75,000 per person', answer => {
      addMessage(answer, 'user');
      state.budget = answer;
      setTimeout(askDuration, 350);
    });
  }

  function askDuration() {
    state.step = STEPS.DURATION;
    updateProgress();
    addMessage('How long is your trip?');
    addReplies(DURATIONS, 'e.g. 10 days, 3 weeks', answer => {
      addMessage(answer, 'user');
      state.duration = answer;
      setTimeout(askStyle, 350);
    }, true, true);
  }

  function askStyle() {
    state.step = STEPS.STYLE;
    updateProgress();
    addMessage('Who are you traveling with?');
    addReplies(STYLES, 'e.g. Group tour, Seniors', answer => {
      addMessage(answer, 'user');
      state.travelStyle = answer;
      setTimeout(() => {
        addMessage('Perfect! Let me find the best destinations for you… ✨');
        fetchRecommendations();
      }, 350);
    });
  }
})();
