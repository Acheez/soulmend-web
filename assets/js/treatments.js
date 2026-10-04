/* Treatment card summaries, the treatment details window and the "find your massage" quiz.
   All content and prices come from services.js; this file only builds the interface. */
(() => {
  const DATA = window.SOULMEND_SERVICES;
  if (!DATA) return;
  const root = document.documentElement;
  const lang = root.lang === 'ka' ? 'ka' : 'en';
  const tr = o => (o && (o[lang] || o.en)) || '';
  const PHONE = '995598300198';

  const UI = {
    en: {
      min: 'min', from: p => `<span class="from">from </span>${p}`, durLabel: 'Duration', priceLabel: 'Price',
      multiHint: 'Choose all that apply.', next: 'Next', start: 'Find your massage',
      choose: 'Choose a treatment', close: 'Close',
      duration: 'Duration & price', goodFor: 'Good for', covers: 'What it covers',
      chooseArea: 'Or tell us which area you’d like us to focus on.',
      intensity: 'Intensity', levels: ['Light', 'Medium', 'Strong'],
      notFor: 'Who it’s not for',
      doctor: 'This list isn’t complete. If you have a medical condition, are pregnant or aren’t sure, check with your doctor first and tell us before the session.',
      book: 'Book this massage', bookWa: 'Book on WhatsApp',
      genericNote: 'The online calendar books the time only. To tell us which massage you chose, use WhatsApp: the message is already filled in.',
      waMsg: (n, m, p) => `Hello! I’d like to book: ${n}, ${m} min (₾${p}).`,
      quizTitle: 'Find your massage', step: (n, t) => `Question ${n} of ${t}`, back: 'Back',
      result: 'Our suggestion', details: 'See details and book', also: 'Also worth a look',
      restart: 'Start again', resultNote: 'It’s a suggestion: we’ll confirm it together at the start of your session.',
    },
    ka: {
      min: 'წთ', from: p => `${p}<span class="from">-დან</span>`, durLabel: 'ხანგრძლივობა', priceLabel: 'ფასი',
      multiHint: 'შეგიძლიათ აირჩიოთ რამდენიმე პასუხი.', next: 'შემდეგი', start: 'იპოვეთ თქვენი მასაჟი',
      choose: 'აირჩიეთ პროცედურა', close: 'დახურვა',
      duration: 'ხანგრძლივობა და ფასი', goodFor: 'რისთვის არის', covers: 'რას მოიცავს',
      chooseArea: 'ან თავად აირჩიეთ ზონა, რომელზეც გსურთ, რომ ვიმუშაოთ.',
      intensity: 'ინტენსივობა', levels: ['მსუბუქი', 'საშუალო', 'ძლიერი'],
      notFor: 'ვისთვის არ არის რეკომენდებული',
      doctor: 'ეს სია სრული არ არის. თუ გაქვთ ჯანმრთელობის პრობლემა, ხართ ორსულად ან არ ხართ დარწმუნებული, ჯერ გაიარეთ კონსულტაცია ექიმთან და სეანსამდე შეგვატყობინეთ.',
      book: 'დაჯავშნეთ ეს მასაჟი', bookWa: 'ჩაწერა WhatsApp-ით',
      genericNote: 'ონლაინ კალენდარი მხოლოდ დროს ჯავშნის. რომ ვიცოდეთ, რომელი მასაჟი აირჩიეთ, გამოიყენეთ WhatsApp: შეტყობინება უკვე შევსებულია.',
      waMsg: (n, m, p) => `გამარჯობა! მსურს ჩაწერა: ${n}, ${m} წთ (₾${p}).`,
      quizTitle: 'იპოვეთ თქვენი მასაჟი', step: (n, t) => `კითხვა ${n} / ${t}`, back: 'უკან',
      result: 'ჩვენი რეკომენდაცია', details: 'დეტალები და ჩაწერა', also: 'ასევე შეგიძლიათ განიხილოთ',
      restart: 'თავიდან დაწყება', resultNote: 'ეს მხოლოდ რეკომენდაციაა — სეანსის დასაწყისში ერთად დავაზუსტებთ.',
    },
  }[lang];

  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const byId = Object.fromEntries(DATA.SERVICES.map(s => [s.id, s]));
  const inCategory = c => DATA.SERVICES.filter(s => s.category === c);
  const icon = (id, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} aria-hidden="true"><use href="#${id}"/></svg>`;

  /* Booking link: a per-category Google booking page if one is configured (paid Google plans),
     otherwise the single shared one. Only the per-category page tells Google which massage it is. */
  const cfg = window.SOULMEND_CONFIG || {};
  const isUrl = u => /^https:\/\//.test((u || '').trim());
  const ownUrl = cat => isUrl((cfg.bookingUrls || {})[cat]) ? cfg.bookingUrls[cat].trim() : '';
  const bookingUrl = cat => ownUrl(cat) || (isUrl(cfg.bookingUrl) ? cfg.bookingUrl.trim() : '');

  /* ---------- Card summaries: duration range and starting price of the whole group ---------- */
  document.querySelectorAll('[data-category-facts]').forEach(dl => {
    const group = inCategory(dl.dataset.categoryFacts);
    const mins = group.flatMap(s => s.options.map(o => o.min)), prices = group.flatMap(s => s.options.map(o => o.price));
    const lo = Math.min(...mins), hi = Math.max(...mins);
    dl.innerHTML = `
      <div class="row"><dt>${UI.durLabel}</dt><dd>${lo === hi ? lo : `${lo}–${hi}`} ${UI.min}</dd></div>
      <div class="row"><dt>${UI.priceLabel}</dt><dd>${UI.from(`₾${Math.min(...prices)}`)}</dd></div>`;
  });

  /* ---------- Shared dialog shell (native <dialog>: focus trap, Esc to close, inert page) ---------- */
  function makeDialog(cls, labelId){
    const d = document.createElement('dialog');
    d.className = `sheet ${cls}`;
    d.setAttribute('aria-labelledby', labelId);
    d.addEventListener('click', e => { if (e.target === d) d.close(); });       // click on the backdrop
    d.addEventListener('close', () => root.classList.remove('has-dialog'));
    document.body.append(d);
    return d;
  }
  const show = d => {
    if (d.open) return;
    d.showModal();
    root.classList.add('has-dialog');
    const h = d.querySelector('h2[tabindex]'); if (h) h.focus();       // start reading at the title, not the close button
  };
  const closeBtn = `<button type="button" class="sheet-close" data-close>${icon('i-close')}<span class="sr-only">${UI.close}</span></button>`;

  /* ---------- Treatment details ---------- */
  const sheet = makeDialog('svc-sheet', 'svc-title');
  let current = null, opt = 0;

  function openService(id, optIndex = 0){
    const s = byId[id]; if (!s) return;
    const sameGroup = current && current.category === s.category && sheet.open;
    current = s; opt = Math.max(0, Math.min(optIndex, s.options.length - 1));
    if (!sameGroup) {
      const group = inCategory(s.category);
      sheet.innerHTML = `
        <div class="sheet-head">
          <p class="sheet-kicker">${esc(tr(DATA.CATEGORIES[s.category]))}</p>
          ${closeBtn}
        </div>
        <div class="sheet-body">
          ${group.length > 1 ? `<section class="svc-picker">
            <h3 id="svc-pick">${UI.choose}</h3>
            <div class="svc-tabs" role="radiogroup" aria-labelledby="svc-pick">
              ${group.map(g => `<label class="chip"><input type="radio" name="svc" value="${g.id}"><span>${esc(tr(g.name))}</span></label>`).join('')}
            </div>
          </section>` : ''}
          <div class="svc-detail"></div>
        </div>
        <div class="sheet-foot"></div>`;
    }
    const radio = sheet.querySelector(`input[name="svc"][value="${s.id}"]`);
    if (radio) radio.checked = true;
    renderBody(); renderFoot();
    if (!sameGroup) sheet.querySelector('.sheet-body').scrollTop = 0;
    show(sheet);
  }

  function renderBody(){
    const s = current;
    const lvls = UI.levels.map((l, i) => `<li class="${s.intensity.includes(i + 1) ? 'on' : ''}">${l}</li>`).join('');
    const aria = s.intensity.map(i => UI.levels[i - 1]).join(', ');
    sheet.querySelector('.svc-detail').innerHTML = `
      <h2 id="svc-title" tabindex="-1">${esc(tr(s.name))}</h2>
      <p class="svc-about">${esc(tr(s.about))}</p>

      <section class="svc-sec">
        <h3>${UI.duration}</h3>
        <div class="durs" role="radiogroup" aria-label="${UI.duration}">
          ${s.options.map((o, i) => `<label class="dur-opt"><input type="radio" name="dur" value="${i}"${i === opt ? ' checked' : ''}>
            <span><strong>${o.min} ${UI.min}</strong><em>₾${o.price}</em></span></label>`).join('')}
        </div>
      </section>

      <section class="svc-sec">
        <h3>${UI.goodFor}</h3>
        <ul class="svc-list">${(s.goodFor[lang] || s.goodFor.en).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      </section>

      <section class="svc-sec">
        <h3>${UI.covers}</h3>
        <ul class="tags">${s.areas.map(a => `<li>${esc(tr(DATA.AREAS[a]))}</li>`).join('')}</ul>
        ${s.chooseArea ? `<p class="svc-small">${UI.chooseArea}</p>` : ''}
      </section>

      <section class="svc-sec">
        <h3>${UI.intensity}</h3>
        <ol class="levels" aria-label="${UI.intensity}: ${aria}">${lvls}</ol>
      </section>

      <section class="svc-sec svc-caution">
        <h3>${UI.notFor}</h3>
        <ul class="svc-list">${s.cautions.map(c => `<li>${esc(tr(DATA.CAUTIONS[c]))}</li>`).join('')}</ul>
        <p class="svc-small">${UI.doctor}</p>
      </section>`;
  }

  function renderFoot(){
    const s = current, o = s.options[opt];
    const online = bookingUrl(s.category);
    const wa = `https://wa.me/${PHONE}?text=${encodeURIComponent(UI.waMsg(tr(s.name), o.min, o.price))}`;
    sheet.querySelector('.sheet-foot').innerHTML = online
      ? `<div class="foot-btns">
           <a class="btn btn-pine" href="${esc(online)}" target="_blank" rel="noopener">${UI.book}${icon('i-ext')}</a>
           <a class="btn btn-line btn-icon-sm" href="${wa}" target="_blank" rel="noopener">${icon('i-whatsapp')}<span class="lbl">WhatsApp</span></a>
         </div>
         ${ownUrl(s.category) ? '' : `<p class="svc-small">${UI.genericNote}</p>`}`
      : `<div class="foot-btns">
           <a class="btn btn-pine" href="${wa}" target="_blank" rel="noopener">${icon('i-whatsapp')}${UI.bookWa}</a>
           <a class="btn btn-line btn-icon-sm" href="tel:+${PHONE}">${icon('i-phone')}<span class="lbl">598 300 198</span></a>
         </div>`;
  }

  sheet.addEventListener('change', e => {
    if (e.target.name === 'svc') openService(e.target.value);
    if (e.target.name === 'dur') { opt = +e.target.value; renderFoot(); }
  });
  sheet.addEventListener('click', e => { if (e.target.closest('[data-close]')) sheet.close(); });

  /* ---------- "Find your massage" quiz ---------- */
  const quiz = makeDialog('quiz-sheet', 'quiz-title');
  let step = 0, answers = {};

  function openQuiz(pre = {}){ step = 0; answers = pre; renderQuiz(); show(quiz); }
  const picked = id => [].concat(answers[id] ?? []);

  function renderQuiz(){
    const total = DATA.QUIZ.length;
    const head = `<div class="sheet-head"><p class="sheet-kicker" id="quiz-title">${UI.quizTitle}</p>${closeBtn}
      <div class="quiz-progress" aria-hidden="true"><span style="width:${Math.min(step, total) / total * 100}%"></span></div></div>`;
    if (step < total) {
      const q = DATA.QUIZ[step];
      quiz.innerHTML = `${head}
        <div class="sheet-body">
          <p class="quiz-step">${UI.step(step + 1, total)}</p>
          <h2 class="quiz-q" id="quiz-q" tabindex="-1">${esc(tr(q.q))}</h2>
          ${q.multi ? `<p class="quiz-hint">${UI.multiHint}</p>` : ''}
          <div class="quiz-opts" role="group" aria-labelledby="quiz-q">
            ${q.options.map(o => `<button type="button" class="quiz-opt" data-answer="${o.id}" aria-pressed="${picked(q.id).includes(o.id)}">${
              q.multi ? `<span class="box">${icon('i-check')}</span>` : ''}${esc(o[lang] || o.en)}</button>`).join('')}
          </div>
        </div>
        <div class="sheet-foot"${!q.multi && step === 0 ? ' hidden' : ''}><div class="foot-btns">
          ${step > 0 ? `<button type="button" class="btn btn-line" data-quiz-back>${UI.back}</button>` : '<span></span>'}
          ${q.multi ? `<button type="button" class="btn btn-pine" data-quiz-next${picked(q.id).length ? '' : ' disabled'}>${UI.next}${icon('i-arrow')}</button>` : ''}
        </div></div>`;
    } else {
      const [best, ...rest] = rank();
      const o = best.options[pickOption(best)];
      quiz.innerHTML = `${head}
        <div class="sheet-body">
          <p class="quiz-step">${UI.result}</p>
          <h2 class="quiz-q" tabindex="-1">${esc(tr(best.name))}</h2>
          <p class="quiz-meta">${o.min} ${UI.min} · ₾${o.price}</p>
          <p class="svc-about">${esc(tr(best.about))}</p>
          <p class="svc-small">${UI.resultNote}</p>
          <h3 class="quiz-also">${UI.also}</h3>
          <ul class="quiz-alts">${rest.slice(0, 2).map(s => `<li><button type="button" class="link-btn" data-quiz-pick="${s.id}">${esc(tr(s.name))}</button></li>`).join('')}</ul>
        </div>
        <div class="sheet-foot"><div class="foot-btns">
          <button type="button" class="btn btn-pine" data-quiz-pick="${best.id}">${UI.details}</button>
          <button type="button" class="btn btn-line" data-quiz-restart>${UI.restart}</button>
        </div></div>`;
    }
    const h = quiz.querySelector('.quiz-q');
    if (h && quiz.open) h.focus();
  }

  /* Score every service against the answers: goal matters most, then area, then pressure and time.
     With several answers picked, a service that fits more of them ranks higher. */
  function rank(){
    const goals = picked('goal'), areas = picked('area');
    const fitsTime = s => answers.time === 45 ? s.options.some(o => o.min <= 45) : s.options.some(o => o.min === answers.time);
    const score = s => {
      const g = goals.filter(x => s.quiz.goals.includes(x)).length;
      const a = areas.filter(x => s.quiz.areas.includes(x)).length;
      return (g ? 4 + 1.5 * (g - 1) : 0)
        + (a ? 2 + 0.5 * (a - 1) : 0)
        + (areas.includes(s.quiz.areas[0]) ? 0.5 : 0)                 // its main area breaks ties
        + (answers.pressure ? (s.intensity.includes(answers.pressure) ? 1 : -1) : 0)
        + (fitsTime(s) ? 1 : 0);
    };
    return DATA.SERVICES.map((s, i) => ({s, i, v: score(s)})).sort((a, b) => b.v - a.v || a.i - b.i).map(x => x.s);
  }

  // Duration closest to the time they have (never longer, if they said "up to 45")
  function pickOption(s){
    const all = s.options.map((o, i) => ({o, i}));
    const fit = all.filter(x => answers.time !== 45 || x.o.min <= 45);
    return (fit.length ? fit : all).reduce((b, x) => Math.abs(x.o.min - answers.time) < Math.abs(b.o.min - answers.time) ? x : b).i;
  }

  quiz.addEventListener('click', e => {
    const a = e.target.closest('[data-answer]');
    if (a) {
      const q = DATA.QUIZ[step];
      const v = typeof q.options[0].id === 'number' ? +a.dataset.answer : a.dataset.answer;
      if (q.multi) {                                                   // toggle, then "Next"
        const set = picked(q.id);
        answers[q.id] = set.includes(v) ? set.filter(x => x !== v) : [...set, v];
        a.setAttribute('aria-pressed', answers[q.id].includes(v));
        quiz.querySelector('[data-quiz-next]').disabled = !answers[q.id].length;
        return;
      }
      answers[q.id] = v; step++; renderQuiz(); return;                 // single answer: go straight on
    }
    if (e.target.closest('[data-quiz-next]')) { step++; renderQuiz(); return; }
    if (e.target.closest('[data-quiz-back]')) { step = Math.max(0, step - 1); renderQuiz(); return; }
    if (e.target.closest('[data-quiz-restart]')) { openQuiz(); return; }
    const pick = e.target.closest('[data-quiz-pick]');
    if (pick) { const s = byId[pick.dataset.quizPick]; quiz.close(); openService(s.id, pickOption(s)); return; }
    if (e.target.closest('[data-close]')) quiz.close();
  });

  /* ---------- Quiz teaser on the page: the first question's answers, one click starts the quiz ---------- */
  document.querySelectorAll('[data-quiz-teaser]').forEach(box => {
    const q = DATA.QUIZ[0];
    box.innerHTML = `<p class="quiz-step">${UI.step(1, DATA.QUIZ.length)}</p>
      <p class="teaser-q" id="teaser-q">${esc(tr(q.q))}</p>
      ${q.multi ? `<p class="quiz-hint">${UI.multiHint}</p>` : ''}
      <ul class="teaser-opts" aria-labelledby="teaser-q">${q.options.map(o =>
        `<li><button type="button" class="quiz-opt" data-teaser="${o.id}" aria-haspopup="dialog">${
          q.multi ? `<span class="box">${icon('i-check')}</span>` : ''}${esc(o[lang] || o.en)}</button></li>`).join('')}</ul>`;
    box.addEventListener('click', e => {
      const b = e.target.closest('[data-teaser]'); if (!b) return;
      openQuiz({[q.id]: q.multi ? [b.dataset.teaser] : b.dataset.teaser});   // opens on question 1 with it ticked
    });
  });

  /* ---------- Openers anywhere on the page ---------- */
  document.addEventListener('click', e => {
    const svc = e.target.closest('[data-open-service]');
    const cat = e.target.closest('[data-open-category]');
    const q = e.target.closest('[data-open-quiz]');
    if (!svc && !cat && !q) return;
    if (svc && svc.closest('dialog')) return;                 // handled inside the dialogs
    e.preventDefault();
    if (svc) openService(svc.dataset.openService);
    else if (cat) openService(inCategory(cat.dataset.openCategory)[0].id);
    else openQuiz();
  });
})();
