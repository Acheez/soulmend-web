/* Online booking URL comes from assets/js/config.js (not in Git — see config.example.js and the README).
   Empty or missing → every booking button and the Book section stay hidden. */
const BOOKING_URL = ((window.SOULMEND_CONFIG || {}).bookingUrl || '').trim();

(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header background after leaving the hero ---------- */
  const head = document.querySelector('.site-head');
  const onScrollHead = () => head.classList.toggle('is-solid', scrollY > 40);
  addEventListener('scroll', onScrollHead, {passive:true}); onScrollHead();
  document.getElementById('yr').textContent = new Date().getFullYear();

  /* ---------- Language switch: remember the choice and land on the same section ---------- */
  document.querySelectorAll('.lang a[hreflang]').forEach(a => {
    // Opened straight from disk (file://) a folder link shows a file listing, so point at index.html
    if (location.protocol === 'file:' && a.pathname.endsWith('/')) a.pathname += 'index.html';
    a.addEventListener('click', () => {
      try { localStorage.setItem('lang', a.hreflang); } catch (e) {}
      a.hash = location.hash;
    });
  });

  /* ---------- Online booking (Google Calendar appointment schedule, see BOOKING_URL at the top) ---------- */
  // Only the long calendar.google.com URL can be framed; the short calendar.app.google link sends
  // X-Frame-Options: SAMEORIGIN. A blocked iframe still fires "load", so we decide by URL instead.
  function bookingEmbedUrl(u){
    try {
      const url = new URL(u);
      if (url.hostname !== 'calendar.google.com' || !url.pathname.startsWith('/calendar/appointments/')) return null;
      url.searchParams.set('gv', 'true');                       // Google's own "website embed" flag
      url.searchParams.set('hl', root.lang);                    // match the page language
      return url.href;
    } catch (e) { return null; }
  }
  if (/^https:\/\//.test(BOOKING_URL)) {
    document.querySelectorAll('[data-booking-link]').forEach(a => a.href = BOOKING_URL);
    document.querySelectorAll('[data-booking]').forEach(el => el.hidden = false);
    const frame = document.querySelector('[data-booking-frame]');
    const box = frame && frame.closest('.book-frame');
    const embed = frame && bookingEmbedUrl(BOOKING_URL);
    if (box && !embed) { box.hidden = true; box.parentElement.classList.add('is-linkonly'); }   // link-only layout
    if (embed) {
      // Load the calendar only as the section comes near; give up after 15s and show the link instead
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        const timer = setTimeout(() => box.dataset.state = 'failed', 15000);
        frame.addEventListener('load', () => { clearTimeout(timer); box.dataset.state = 'ready'; }, {once: true});
        frame.src = embed;
      }, {rootMargin: '600px 0px'});
      io.observe(box);
    }
  }

  /* ---------- Swoosh stroke lengths (for the draw-on) ---------- */
  document.querySelectorAll('.swoosh path').forEach(p => p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1));

  /* ---------- Hero intro: photos gather in a deck, then fly out; the main one comes forward ----------
     FLIP: each photo is already in its final CSS position. We compute the transform that puts it
     in the centre deck, then animate from there back to its resting transform. */
  function runIntro(){
    const stage = document.querySelector('.stage');
    const s = stage.getBoundingClientRect();
    const cx = s.left + s.width/2, cy = s.top + Math.min(s.height, innerHeight)/2;
    const deckW = Math.min(230, s.width * 0.34);
    const order = ['.ph-tl', '.ph-br', '.ph-tr', '.ph-main'];      // last = top of deck = the one that comes forward
    const fan   = [-12, 9, -5, 0];
    const nudge = [[-46, 10], [44, 18], [20, -16], [0, 0]];   // fan the deck so every card peeks out
    const outDelay = 1350;   // deck is complete at ~1.2s; then the photos fly out

    order.forEach((sel, i) => {
      const el = document.querySelector(sel);
      const r = el.getBoundingClientRect();
      const rest = getComputedStyle(el).getPropertyValue('--r').trim() || '0deg';
      // getBoundingClientRect includes the rest rotation; for small angles this is close enough
      const k = deckW / r.width;
      const dx = cx + nudge[i][0] - (r.left + r.width/2), dy = cy + nudge[i][1] - (r.top + r.height/2);
      const deck   = `translate(${dx}px, ${dy}px) scale(${k}) rotate(${fan[i]}deg)`;
      const before = `translate(${dx}px, ${dy + 60}px) scale(${k * .92}) rotate(${fan[i]}deg)`;
      const final  = `rotate(${rest})`;
      const isMain = sel === '.ph-main';

      el.style.opacity = 1;
      el.animate([
        {transform: before, opacity: 0},
        {transform: deck, opacity: 1}
      ], {duration: 650, delay: 120 + i * 140, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards'});

      el.animate([
        {transform: deck},
        {transform: final}
      ], {duration: isMain ? 1300 : 1150, delay: outDelay + (isMain ? 120 : i * 70),
          easing: 'cubic-bezier(.75,0,.2,1)', fill: 'backwards'});
    });

    setTimeout(() => root.classList.add('intro-text'), outDelay + 750);
    setTimeout(() => root.classList.remove('is-intro'), outDelay + 2600);
  }

  if (root.classList.contains('is-intro')) {
    const imgs = [...document.querySelectorAll('.stage img')];
    const ready = Promise.all(imgs.map(img => img.decode ? img.decode().catch(() => {}) : Promise.resolve()));
    let started = false;
    const go = () => { if (!started) { started = true; runIntro(); } };
    ready.then(go);
    setTimeout(go, 1800);   // don't hold the page hostage on a slow connection
  }

  /* ---------- Hero: corner photos drift out to their corners and fade as the hero scrolls away ---------- */
  const hero = document.querySelector('.hero');
  const drift = [
    ['.ph-tl img', -1, -1],   // up-left
    ['.ph-tr img',  1, -1],   // up-right
    ['.ph-br img',  1,  1],   // down-right
  ].map(([sel, x, y]) => [document.querySelector(sel), x, y]);
  const mainImg = document.querySelector('.ph-main .frame img');
  let heroTick = false;
  function updateHero(){
    heroTick = false;
    const r = hero.getBoundingClientRect();
    // 0 at the top of the page, 1 once ~45% of the hero has scrolled past
    const p = Math.min(1, Math.max(0, -r.top / (r.height * 0.45)));
    const e = p * p * (3 - 2 * p);                     // smoothstep
    const dist = Math.min(innerWidth, 900) * 0.22;
    drift.forEach(([img, x, y]) => {
      img.style.transform = `translate(${x * dist * e}px, ${y * dist * e}px) scale(${1 - e * 0.25})`;
      img.style.opacity = String(1 - Math.min(1, e * 1.25));
    });
    mainImg.style.transform = `scale(${1 + e * 0.06})`;  // main photo leans in slightly as the others leave
  }
  if (!reduce) {
    addEventListener('scroll', () => { if (!heroTick) { heroTick = true; requestAnimationFrame(updateHero); } }, {passive:true});
    addEventListener('resize', updateHero);
    updateHero();
  } else {
    // No movement, but still clear the corner photos once the hero is out of the way
    const io = new IntersectionObserver(([en]) => drift.forEach(([img]) => img.style.opacity = en.intersectionRatio > .55 ? 1 : 0),
      {threshold: [0, .55, 1]});
    io.observe(hero);
  }

  /* ---------- Stacking cards: earlier cards shrink and dim as the next one covers them ---------- */
  const cards = [...document.querySelectorAll('.card')];
  let ticking = false;
  function updateStack(){
    ticking = false;
    for (let i = 0; i < cards.length - 1; i++) {
      const a = cards[i].getBoundingClientRect();
      const b = cards[i+1].getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - (b.top - a.top) / a.height));   // 0 = next card far, 1 = fully covering
      const depth = cards.length - 1 - i;
      cards[i].style.transform = `scale(${1 - p * 0.035 * depth})`;
      cards[i].style.filter = `brightness(${1 - p * 0.28})`;
    }
  }
  if (!reduce) {
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateStack); } }, {passive:true});
    addEventListener('resize', updateStack);
    updateStack();
  }

})();
