/* Find Your Spot: UI */
(function () {
  'use strict';
  const E = window.FYS, T = window.FYS_TIPS;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);

  const KITS = [
    { id: 'red', name: 'Red', c: '#D7263D', t: '#fff' },
    { id: 'blue', name: 'Blue', c: '#1F5FD1', t: '#fff' },
    { id: 'sky', name: 'Sky blue', c: '#5BC0F8', t: '#0B2239' },
    { id: 'yellow', name: 'Yellow', c: '#FFD23F', t: '#2A2000' },
    { id: 'white', name: 'White', c: '#FFFFFF', t: '#1A1A1A' },
    { id: 'black', name: 'Black', c: '#1D1D1F', t: '#fff' },
  ];
  const GK_KIT = { c: '#FF8C1A', t: '#1A1A1A' };
  const OPP_GK = { c: '#B06CF0', t: '#fff' };
  const kitOf = (id) => KITS.find(k => k.id === id) || KITS[0];
  const oppKit = (k) => (['white', 'yellow', 'sky'].includes(k.id) ? { c: '#3B4A57', t: '#fff' } : { c: '#EEF1F4', t: '#1A1A1A' });

  /* ---------- state ---------- */
  const KEY = 'fys.v1';
  const DEFAULTS = { size: 9, form: '3-2-3', slot: 4, kit: 'red', num: 10, name: '', sit: 'open', side: 'L', phase: 'att', showOpp: true, skipTake: false, best: 0, onboarded: false };
  let S = Object.assign({}, DEFAULTS);
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* storage blocked */ }
  if ('skipCorner' in S) { S.skipTake = !!S.skipCorner; delete S.skipCorner; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };

  // Coach link: ?size=9&f=3-2-3
  const qp = new URLSearchParams(location.search);
  if (qp.get('size') && E.SIZES[qp.get('size')]) {
    S.size = +qp.get('size');
    const f = qp.get('f');
    S.form = E.SIZES[S.size].forms.includes(f) ? f : E.SIZES[S.size].forms[0];
    if (S.slot >= S.size) S.slot = 1;
    S.onboarded = false;
  }
  if (!E.SIZES[S.size]) S.size = 9;
  if (!E.SIZES[S.size].forms.includes(S.form)) S.form = E.SIZES[S.size].forms[0];
  if (S.slot >= S.size) S.slot = 1;

  let ball = null;            // current ball in meters
  let quiz = null;            // { sit, side, phase, ball, answer, guess }
  let streak = 0;

  const size = () => E.SIZES[S.size];
  const slots = () => E.slotsFor(S.size, S.form);
  const oppSlots = () => E.slotsFor(S.size, E.OPP_FORM[S.size]);
  const cur = () => quiz ? { sit: quiz.sit, side: quiz.side, phase: quiz.phase } : { sit: S.sit, side: S.side, phase: S.phase };
  const sitDef = (id) => E.SITUATIONS.find(s => s.id === id);

  /* ---------- field drawing ---------- */
  const svg = $('field');
  let layer = {};

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function drawPitch(target, sz, opts) {
    const { W, L, pa, ga, goal, circle, spot } = sz, gx = W / 2, sc = W / 68, m = opts.mini ? 1.5 : W * .065 + 1.2;
    const sy = (y) => L - y;
    target.setAttribute('viewBox', `${-m} ${-m} ${W + 2 * m} ${L + 2 * m}`);
    target.innerHTML = '';
    const g = el('g', {}, target);
    const clipId = opts.mini ? 'clipMini' : 'clipMain';
    el('rect', { x: 0, y: 0, width: W, height: L }, el('clipPath', { id: clipId }, el('defs', {}, g)));
    el('rect', { x: -m, y: -m, width: W + 2 * m, height: L + 2 * m, fill: '#277A4C', rx: m * .6 }, g);
    const bands = 10;
    for (let i = 0; i < bands; i++) el('rect', { x: 0, y: i * L / bands, width: W, height: L / bands, fill: i % 2 ? 'var(--grass-a)' : 'var(--grass-b)' }, g);
    const lw = Math.max(.14, W * .0055);
    const ln = { fill: 'none', stroke: 'var(--line)', 'stroke-width': lw };
    el('rect', Object.assign({ x: 0, y: 0, width: W, height: L }, ln), g);
    el('line', Object.assign({ x1: 0, y1: L / 2, x2: W, y2: L / 2 }, ln), g);
    el('circle', Object.assign({ cx: gx, cy: L / 2, r: circle }, ln), g);
    el('circle', { cx: gx, cy: L / 2, r: lw * 1.8, fill: 'var(--line)' }, g);
    [0, L].forEach((end) => {
      const top = end === L, dir = top ? -1 : 1; // dir: field y direction into the pitch
      const yAt = (d) => sy(end + dir * d);
      el('rect', Object.assign({ x: gx - pa[1] / 2, y: Math.min(yAt(0), yAt(pa[0])), width: pa[1], height: pa[0] }, ln), g);
      el('rect', Object.assign({ x: gx - ga[1] / 2, y: Math.min(yAt(0), yAt(ga[0])), width: ga[1], height: ga[0] }, ln), g);
      el('circle', { cx: gx, cy: yAt(spot), r: lw * 1.6, fill: 'var(--line)' }, g);
      const off = pa[0] - spot;
      if (circle > off) {
        const dx = Math.sqrt(circle * circle - off * off);
        el('path', Object.assign({ d: `M ${gx - dx} ${yAt(pa[0])} A ${circle} ${circle} 0 0 ${top ? 0 : 1} ${gx + dx} ${yAt(pa[0])}` }, ln), g);
      }
      const gd = 1.6 * Math.max(sc, .6);
      el('rect', { x: gx - goal / 2, y: top ? -gd : L, width: goal, height: gd, fill: 'rgba(255,255,255,.35)', stroke: 'var(--line)', 'stroke-width': lw }, g);
      [0, W].forEach((cx) => {
        el('circle', Object.assign({ cx, cy: sy(end), r: Math.max(sc, .6), 'clip-path': `url(#${clipId})` }, ln), g);
      });
      if (sz.buildOut && !opts.mini) {
        const by = E.buildOutY(sz);
        el('line', Object.assign({ x1: 0, y1: yAt(by), x2: W, y2: yAt(by), 'stroke-dasharray': `${lw * 4} ${lw * 4}`, opacity: .55 }, ln), g);
      }
    });
    if (!opts.mini) {
      el('text', { x: gx, y: L + m * .78, 'text-anchor': 'middle', 'font-size': W * .03, fill: 'rgba(255,255,255,.75)', 'font-weight': 700 }, g).textContent = 'OUR GOAL';
      // Sit the label above the attacking goal's net, with clear space between them.
      const netTop = -1.6 * Math.max(sc, .6), fs = W * .03;
      el('text', { x: gx, y: netTop - fs * .5, 'text-anchor': 'middle', 'font-size': fs, fill: 'rgba(255,255,255,.75)', 'font-weight': 700 }, g).textContent = 'WE ATTACK THIS WAY ↑';
    }
    return g;
  }

  function buildField() {
    const sz = size();
    drawPitch(svg, sz, {});
    layer.guide = el('g', {}, svg);
    layer.opp = el('g', {}, svg);
    layer.own = el('g', {}, svg);
    layer.quiz = el('g', {}, svg);
    layer.ballG = el('g', { id: 'ball', class: 'tok' }, svg);
    const br = sz.W * .021;
    el('circle', { r: sz.W * .07, fill: 'transparent' }, layer.ballG);
    el('circle', { r: br * 1.25, fill: 'rgba(0,0,0,.25)', cy: br * .35 }, layer.ballG);
    el('circle', { r: br, fill: '#fff', stroke: '#111', 'stroke-width': br * .14 }, layer.ballG);
    el('path', { d: pentagon(br * .42), fill: '#111' }, layer.ballG);
    buildTokens();
  }

  function pentagon(r) {
    let d = '';
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(3) + ' ' + (Math.sin(a) * r).toFixed(3); }
    return d + 'Z';
  }

  // Shift the baseline down by half a cap height so caps/digits sit on the dot's centre.
  // Works in every browser, unlike dominant-baseline, which Safari renders inconsistently.
  const CENTER_DY = '0.35em';
  let ownToks = [], oppToks = [];
  function token(parent, label, kit, r, cls) {
    const g = el('g', { class: 'tok ' + cls }, parent);
    if (cls.includes('you')) el('circle', { class: 'pulse', r: r, fill: 'none', stroke: '#fff', 'stroke-width': r * .18 }, g);
    el('circle', { r: r * 1.08, fill: 'rgba(0,0,0,.28)', cy: r * .22 }, g);
    el('circle', { r, fill: kit.c, stroke: cls.includes('you') ? '#fff' : 'rgba(0,0,0,.45)', 'stroke-width': r * (cls.includes('you') ? .2 : .1) }, g);
    const t = el('text', { 'font-size': r * (String(label).length > 2 ? .78 : .95), fill: kit.t, dy: CENTER_DY }, g);
    t.textContent = label;
    if (cls.includes('you')) {
      const tag = el('g', { transform: `translate(0 ${-r * 1.95})` }, g);
      el('rect', { x: -r * 1.05, y: -r * .5, width: r * 2.1, height: r, rx: r * .45, fill: '#FF7A3D' }, tag);
      el('text', { 'font-size': r * .62, fill: '#2A1407', dy: CENTER_DY }, tag).textContent = 'YOU';
    }
    return g;
  }

  function buildTokens() {
    layer.own.innerHTML = ''; layer.opp.innerHTML = '';
    const sz = size(), r = E.tokenR(sz), k = kitOf(S.kit), ok = oppKit(k);
    ownToks = slots().map((s, i) => {
      const isYou = i === S.slot;
      const kit = s.role === 'GK' ? GK_KIT : k;
      return token(layer.own, isYou ? S.num : s.abbr, kit, isYou ? r * 1.18 : r, isYou ? 'you' : 'mate');
    });
    // draw "you" on top
    layer.own.appendChild(ownToks[S.slot]);
    oppToks = oppSlots().map((s) => token(layer.opp, '', s.role === 'GK' ? OPP_GK : ok, r * .9, 'opp'));
  }

  const place = (g, p) => { g.style.transform = `translate(${p.x}px, ${size().L - p.y}px)`; };

  /* ---------- render ---------- */
  let ownPos = [], canSkip = false;
  const TAKER_JOB = { cornerFor: 'cornerTaker', fkFor: 'fkTaker', koFor: 'kicker', tiFor: 'tiTaker' };
  function render() {
    const sz = size(), c = cur();
    if (!ball) ball = E.defaultBall(c.sit, sz, c.side);
    const b = quiz ? quiz.ball : ball;
    const takerJob = TAKER_JOB[c.sit];
    const skip = !quiz && !!takerJob && S.skipTake;
    ownPos = E.positions(c.sit, slots(), sz, b, c.phase, skip ? { notTaker: S.slot } : null);
    // Only offer the choice when you would be the one taking it.
    canSkip = !quiz && !!takerJob && (skip || ownPos[S.slot].job === takerJob);
    ownPos.forEach((p, i) => place(ownToks[i], p));
    const hideYou = quiz && !quiz.guess;
    ownToks[S.slot].style.opacity = hideYou ? 0 : 1;
    layer.opp.style.display = S.showOpp ? '' : 'none';
    if (S.showOpp) E.opponentPositions(c.sit, oppSlots(), sz, b, c.phase).forEach((p, i) => place(oppToks[i], p));
    place(layer.ballG, b);
    renderControls();
    renderStatus();
    renderCoach();
  }

  function renderControls() {
    const c = cur(), def = sitDef(c.sit);
    const g = sitGroup(c.sit);
    [...$('sitChips').children].forEach(btn => btn.setAttribute('aria-selected', String(btn.dataset.group === g.id)));
    $('phaseSeg').classList.toggle('hide', c.sit !== 'open');
    $('teamSeg').classList.toggle('hide', !g.paired);
    [...$('teamSeg').children].forEach(b => b.setAttribute('aria-checked', String(c.sit === g.id + b.dataset.team)));
    $('sideSeg').classList.toggle('hide', !def.sides);
    [...$('phaseSeg').children].forEach(b => b.setAttribute('aria-checked', String(b.dataset.phase === c.phase)));
    [...$('sideSeg').children].forEach(b => b.setAttribute('aria-checked', String(b.dataset.side === c.side)));
    $('sitChips').style.pointerEvents = quiz ? 'none' : '';
    $('sitChips').style.opacity = quiz ? .5 : 1;
    $('oppToggle').checked = S.showOpp;
    $('takeToggleWrap').classList.toggle('hide', !canSkip);
    $('takeToggle').checked = !!S.skipTake;
    const k = kitOf(S.kit), s = slots()[S.slot];
    $('meChip').innerHTML = `<i style="background:${s.role === 'GK' ? GK_KIT.c : k.c}"></i>${esc(s.abbr)} #${esc(S.num)}`;
  }

  function myJob() { return ownPos[S.slot] ? ownPos[S.slot].job : 'shape'; }

  function renderStatus() {
    const s = slots()[S.slot], j = T.JOBS[myJob()] || T.JOBS.shape, c = cur();
    if (quiz && !quiz.guess) { $('status').textContent = `You are the ${s.name}. Tap where you should stand.`; return; }
    const hint = sitDef(c.sit).drag && !quiz ? ' Drag the ball to move everyone.' : '';
    $('status').textContent = `${s.name}: ${j.title}.${hint}`;
  }

  function esc(v) { return String(v).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
  const list = (tips) => `<ol class="tips">${tips.map(t => `<li>${esc(t)}</li>`).join('')}</ol>`;

  function renderCoach() {
    const s = slots()[S.slot], c = cur(), sz = size(), b = quiz ? quiz.ball : ball;
    const job = T.JOBS[myJob()];
    const who = `${S.name ? esc(S.name) + ', ' : ''}${esc(s.name)} #${esc(S.num)}`;
    let html = `<div class="coach-who">${who}</div>`;
    if (quiz && !quiz.guess) { $('coach').innerHTML = html + '<p class="muted">Make your guess first. Tips appear after you tap the field.</p>'; return; }
    if (c.sit === 'open') {
      const third = E.thirdOf(sz, b);
      html += `<div class="coach-where">Open play, ball ${T.THIRD_LABEL[third]}</div>`;
      if (job && job.tips) html += `<div class="job"><h3>Right now: ${esc(job.title)}</h3>${list(job.tips)}</div>`;
      const order = [c.phase].concat(['att', 'def', 'loose'].filter(p => p !== c.phase));
      order.forEach((ph, idx) => {
        html += `<div class="phase ${idx === 0 ? 'now' : ''}">${idx === 0 ? '<div class="tag">Now</div>' : ''}<h3>${T.PHASE_LABEL[ph]}</h3>${list(T.ROLE_TIPS[s.role][third][ph])}</div>`;
      });
    } else {
      html += `<div class="coach-where">${esc(sitDef(c.sit).label)}</div>`;
      if (canSkip && S.skipTake) html += `<p class="muted small">A teammate takes this ${{ fkFor: 'free kick', koFor: 'kickoff', tiFor: 'throw-in' }[c.sit] || 'corner'}, so get to your spot.</p>`;
      if (job && job.tips) html += `<div class="job"><h3>Your job: ${esc(job.title)}</h3>${list(job.tips)}</div>`;
      else {
        const ph = /For$/.test(c.sit) ? 'att' : 'def';
        html += `<div class="phase now"><h3>${esc(T.ROLE_NAMES[s.role])}</h3>${list(T.ROLE_TIPS[s.role][E.thirdOf(sz, b)][ph])}</div>`;
      }
      html += '<p class="muted small">Tip: try a different position in My team to see everyone\'s job.</p>';
    }
    $('coach').innerHTML = html;
  }

  /* ---------- ball dragging ---------- */
  let dragging = false, raf = 0, pending = null;
  function toField(evt) {
    const pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x, y: size().L - p.y };
  }
  function moveBall(p) {
    pending = E.clampBall(cur().sit, size(), p);
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; ball = pending; render(); });
  }
  svg.addEventListener('pointerdown', (e) => {
    if (quiz) { if (!quiz.guess) quizGuess(toField(e)); return; }
    if (!sitDef(S.sit).drag) { toast('Pick Open play, a free kick or a throw-in to move the ball.'); return; }
    dragging = true; svg.classList.add('dragging');
    svg.setPointerCapture(e.pointerId);
    moveBall(toField(e));
  });
  svg.addEventListener('pointermove', (e) => { if (dragging) moveBall(toField(e)); });
  const endDrag = () => { if (!dragging) return; dragging = false; svg.classList.remove('dragging'); };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);
  svg.addEventListener('keydown', (e) => {
    const step = size().W * .04, d = { ArrowUp: [0, step], ArrowDown: [0, -step], ArrowLeft: [-step, 0], ArrowRight: [step, 0] }[e.key];
    if (!d || quiz || !sitDef(S.sit).drag) return;
    e.preventDefault();
    moveBall({ x: ball.x + d[0], y: ball.y + d[1] });
  });

  /* ---------- controls ---------- */
  // Situations are shown as 6 groups so they fit without swiping; set pieces get a "For us / Against us" switch.
  const SIT_GROUPS = [
    { id: 'open', label: 'Open play' }, { id: 'corner', label: 'Corner', paired: true }, { id: 'fk', label: 'Free kick', paired: true },
    { id: 'gk', label: 'Goal kick', paired: true }, { id: 'ko', label: 'Kickoff', paired: true },
    { id: 'ti', label: 'Throw-in', paired: true },
  ];
  const sitGroup = (sit) => SIT_GROUPS.find(g => sit === g.id || sit.startsWith(g.id) && /^(For|Against)$/.test(sit.slice(g.id.length))) || SIT_GROUPS[0];
  const sitTeam = (sit) => /Against$/.test(sit) ? 'Against' : 'For';
  function setSit(sit) { S.sit = sit; ball = E.defaultBall(S.sit, size(), S.side); save(); render(); }
  function buildChips() {
    $('sitChips').innerHTML = SIT_GROUPS.map(g => `<button type="button" role="tab" data-group="${g.id}">${esc(g.label)}</button>`).join('');
  }
  $('sitChips').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const g = SIT_GROUPS.find(x => x.id === b.dataset.group);
    const sit = g.paired ? g.id + sitTeam(S.sit) : g.id;
    if (sit !== S.sit) setSit(sit);
  });
  $('teamSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b || quiz) return;
    const sit = sitGroup(S.sit).id + b.dataset.team;
    if (sit !== S.sit) setSit(sit);
  });
  $('phaseSeg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b || quiz) return; S.phase = b.dataset.phase; save(); render(); });
  $('sideSeg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b || quiz) return; S.side = b.dataset.side; ball = E.defaultBall(S.sit, size(), S.side); save(); render(); });
  $('takeToggle').addEventListener('change', (e) => { S.skipTake = e.target.checked; save(); render(); });
  $('oppToggle').addEventListener('change', (e) => { S.showOpp = e.target.checked; save(); render(); });

  const panel = $('panel'), scrim = $('scrim');
  const openPanel = (on) => { panel.classList.toggle('open', on); scrim.classList.toggle('hide', !on); };
  $('coachBtn').addEventListener('click', () => openPanel(true));
  $('panelClose').addEventListener('click', () => openPanel(false));
  scrim.addEventListener('click', () => openPanel(false));

  let toastT = 0;
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.remove('hide'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.add('hide'), 2200); }

  /* ---------- quiz ---------- */
  const QUIZ_SITS = ['open', 'open', 'open', 'open', 'open', 'cornerFor', 'cornerAgainst', 'fkAgainst', 'gkFor', 'gkAgainst', 'koFor', 'koAgainst', 'tiFor', 'tiAgainst', 'tiFor', 'tiAgainst'];
  function quizNew() {
    const sz = size();
    const sit = QUIZ_SITS[Math.floor(Math.random() * QUIZ_SITS.length)];
    const side = Math.random() < .5 ? 'L' : 'R';
    const phase = ['att', 'def', 'loose'][Math.floor(Math.random() * 3)];
    let b = E.defaultBall(sit, sz, side);
    if (sit === 'open') b = { x: sz.W * (.08 + Math.random() * .84), y: sz.L * (.08 + Math.random() * .84) };
    if (/^ti/.test(sit)) b = E.clampBall(sit, sz, { x: side === 'L' ? 0 : sz.W, y: sz.L * (.08 + Math.random() * .84) });
    if (sit === 'fkAgainst') b = E.clampBall(sit, sz, { x: sz.W * (.15 + Math.random() * .7), y: sz.pa[0] + Math.random() * sz.L * .3 });
    quiz = { sit, side, phase, ball: b, guess: null };
    layer.quiz.innerHTML = '';
    const phaseTxt = sit === 'open' ? ` ${T.PHASE_LABEL[phase]}.` : '';
    $('quizQ').textContent = `${sitDef(sit).label}.${phaseTxt}`;
    $('quizHint').textContent = 'Where should you be? Tap the field.';
    $('quizNext').classList.add('hide');
    render();
  }
  function quizGuess(p) {
    const sz = size(), ans = ownPos[S.slot], r = E.tokenR(sz);
    quiz.guess = p;
    const d = E.dist(p, ans), yd = Math.round(d * 1.094);
    const great = d < sz.L * .06, good = d < sz.L * .12;
    const sy = (y) => sz.L - y;
    el('line', { x1: p.x, y1: sy(p.y), x2: ans.x, y2: sy(ans.y), stroke: '#fff', 'stroke-width': r * .18, 'stroke-dasharray': `${r * .5} ${r * .4}`, class: 'guess' }, layer.quiz);
    el('circle', { cx: p.x, cy: sy(p.y), r: r * .8, fill: 'none', stroke: '#FF7A3D', 'stroke-width': r * .28, class: 'guess' }, layer.quiz);
    if (great) streak++; else streak = 0;
    if (streak > S.best) { S.best = streak; save(); }
    $('quizQ').textContent = great ? 'Spot on!' : good ? 'Close!' : 'Not quite.';
    $('quizHint').textContent = `You were ${yd} yards away. ${great ? '' : 'The pulsing player shows the right spot.'}`;
    $('quizNext').classList.remove('hide');
    $('streak').textContent = `Streak ${streak} · Best ${S.best}`;
    render();
  }
  $('quizBtn').addEventListener('click', () => { $('quizBar').classList.remove('hide'); streak = 0; $('streak').textContent = `Best ${S.best}`; quizNew(); });
  $('quizNext').addEventListener('click', quizNew);
  $('quizExit').addEventListener('click', () => { quiz = null; layer.quiz.innerHTML = ''; $('quizBar').classList.add('hide'); render(); });

  /* ---------- setup dialog ---------- */
  const dlg = $('setup');
  function renderSetup() {
    $('nameIn').value = S.name;
    $('numIn').value = S.num;
    $('sizeSeg').innerHTML = [5, 7, 9, 11].map(n => `<button type="button" role="radio" data-size="${n}" aria-checked="${n === S.size}">${E.SIZES[n].label}</button>`).join('');
    $('formSeg').innerHTML = E.SIZES[S.size].forms.map(f => `<button type="button" role="radio" data-form="${f}" aria-checked="${f === S.form}">${f}</button>`).join('');
    $('kitRow').innerHTML = KITS.map(k => `<button type="button" role="radio" aria-label="${k.name}" data-kit="${k.id}" aria-checked="${k.id === S.kit}" style="background:${k.c}"></button>`).join('');
    const mini = $('miniField'), sz = size();
    drawPitch(mini, sz, { mini: true });
    const r = sz.W * .055, k = kitOf(S.kit);
    slots().forEach((s, i) => {
      const g = el('g', { class: 'dot', 'data-slot': i, transform: `translate(${s.x * sz.W} ${sz.L - (s.y * 1.15 + .05) * sz.L})`, role: 'button', tabindex: 0, 'aria-label': s.name }, mini);
      const kit = s.role === 'GK' ? GK_KIT : k;
      el('circle', { r, fill: kit.c, stroke: i === S.slot ? '#FF7A3D' : 'rgba(0,0,0,.4)', 'stroke-width': i === S.slot ? r * .3 : r * .1 }, g);
      el('text', { 'font-size': r * .7, fill: kit.t, 'text-anchor': 'middle', dy: CENTER_DY, 'font-weight': 800 }, g).textContent = s.abbr;
    });
    $('posName').textContent = slots()[S.slot].name;
  }
  function setupChanged() { save(); renderSetup(); buildField(); ball = E.defaultBall(S.sit, size(), S.side); render(); }
  $('sizeSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const role = slots()[S.slot].role;
    S.size = +b.dataset.size; S.form = E.SIZES[S.size].forms[0];
    const idx = slots().findIndex(s => s.role === role); S.slot = idx >= 0 ? idx : 1;
    setupChanged();
  });
  $('formSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const role = slots()[S.slot].role;
    S.form = b.dataset.form;
    const idx = slots().findIndex(s => s.role === role); S.slot = idx >= 0 ? idx : Math.min(S.slot, S.size - 1);
    setupChanged();
  });
  $('kitRow').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; S.kit = b.dataset.kit; setupChanged(); });
  const pickSlot = (e) => { const g = e.target.closest('.dot'); if (!g) return; S.slot = +g.dataset.slot; setupChanged(); };
  $('miniField').addEventListener('click', pickSlot);
  $('miniField').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickSlot(e); } });
  $('nameIn').addEventListener('input', (e) => { S.name = e.target.value.trim().slice(0, 20); save(); renderCoach(); });
  $('numIn').addEventListener('change', (e) => { const n = Math.max(0, Math.min(99, parseInt(e.target.value, 10) || 0)); S.num = n; setupChanged(); });
  $('shareBtn').addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?size=${S.size}&f=${encodeURIComponent(S.form)}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Find Your Spot', text: `Our team plays ${E.SIZES[S.size].label} ${S.form}`, url });
      else { await navigator.clipboard.writeText(url); toast('Team link copied'); }
    } catch (e) { prompt('Copy this team link:', url); }
  });
  $('setupBtn').addEventListener('click', () => { renderSetup(); dlg.showModal(); });
  dlg.addEventListener('close', () => { S.onboarded = true; save(); });

  /* ---------- boot ---------- */
  buildChips();
  buildField();
  render();
  if (!S.onboarded) { renderSetup(); dlg.showModal(); }
  if (qp.has('size')) history.replaceState(null, '', location.pathname);
})();
