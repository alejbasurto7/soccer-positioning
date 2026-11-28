/* Find Your Spot: positioning engine.
 * Field coordinates are meters. x runs 0 (left touchline) to W (right touchline),
 * y runs 0 (our goal line) to L (their goal line). Our team always attacks up (toward y = L).
 */
(function (root) {
  'use strict';

  const SIZES = {
    5:  { n: 5,  label: '5v5',   L: 40,  W: 27, pa: [8, 16],      ga: [3, 8],     goal: 5.5,  circle: 5.5,  spot: 6,   fk: 5.5,  buildOut: false,
          forms: ['1-2-1', '2-2', '2-1-1'] },
    7:  { n: 7,  label: '7v7',   L: 55,  W: 36, pa: [11, 22],     ga: [3.7, 11],  goal: 5.5,  circle: 7.3,  spot: 7.3, fk: 7.3,  buildOut: true,
          forms: ['2-3-1', '3-2-1', '2-1-2-1'] },
    9:  { n: 9,  label: '9v9',   L: 73,  W: 46, pa: [12.8, 32.9], ga: [4.6, 15.5], goal: 5.5,  circle: 7.3,  spot: 9.1, fk: 9.15, buildOut: true,
          forms: ['3-2-3', '3-3-2', '2-4-2'] },
    11: { n: 11, label: '11v11', L: 105, W: 68, pa: [16.5, 40.3], ga: [5.5, 18.3], goal: 7.32, circle: 9.15, spot: 11,  fk: 9.15, buildOut: false,
          forms: ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '3-4-3'] },
  };

  // [short label, full name, role, x (0 left..1 right), y (0 own goal..1 their goal)]
  // Roles: GK goalkeeper, CB center back, FB outside back, CM central mid, WM wide mid / winger, FW forward
  const BACK4 = [
    ['LB', 'Left back', 'FB', .12, .22], ['LCB', 'Left center back', 'CB', .37, .17],
    ['RCB', 'Right center back', 'CB', .63, .17], ['RB', 'Right back', 'FB', .88, .22],
  ];
  const BACK3 = [
    ['LCB', 'Left center back', 'CB', .28, .18], ['CB', 'Center back', 'CB', .5, .16],
    ['RCB', 'Right center back', 'CB', .72, .18],
  ];
  const FORMATIONS = {
    5: {
      '1-2-1': [['D', 'Defender', 'CB', .50, .18], ['LM', 'Left midfielder', 'WM', .18, .40],
                ['RM', 'Right midfielder', 'WM', .82, .40], ['F', 'Forward', 'FW', .50, .60]],
      '2-2':   [['LD', 'Left defender', 'CB', .30, .19], ['RD', 'Right defender', 'CB', .70, .19],
                ['LF', 'Left forward', 'FW', .30, .58], ['RF', 'Right forward', 'FW', .70, .58]],
      '2-1-1': [['LD', 'Left defender', 'CB', .30, .18], ['RD', 'Right defender', 'CB', .70, .18],
                ['CM', 'Center midfielder', 'CM', .50, .38], ['F', 'Forward', 'FW', .50, .60]],
    },
    7: {
      '2-3-1': [['LCB', 'Left center back', 'CB', .30, .18], ['RCB', 'Right center back', 'CB', .70, .18],
                ['LM', 'Left midfielder', 'WM', .12, .40], ['CM', 'Center midfielder', 'CM', .50, .36],
                ['RM', 'Right midfielder', 'WM', .88, .40], ['ST', 'Striker', 'FW', .50, .60]],
      '3-2-1': [['LB', 'Left back', 'FB', .16, .21], ['CB', 'Center back', 'CB', .50, .17], ['RB', 'Right back', 'FB', .84, .21],
                ['LCM', 'Left center mid', 'CM', .34, .38], ['RCM', 'Right center mid', 'CM', .66, .38],
                ['ST', 'Striker', 'FW', .50, .60]],
      '2-1-2-1': [['LCB', 'Left center back', 'CB', .30, .17], ['RCB', 'Right center back', 'CB', .70, .17],
                  ['DM', 'Defensive mid', 'CM', .50, .30], ['LM', 'Left midfielder', 'WM', .16, .44],
                  ['RM', 'Right midfielder', 'WM', .84, .44], ['ST', 'Striker', 'FW', .50, .62]],
    },
    9: {
      '3-2-3': [['LB', 'Left back', 'FB', .16, .20], ['CB', 'Center back', 'CB', .50, .16], ['RB', 'Right back', 'FB', .84, .20],
                ['LCM', 'Left center mid', 'CM', .35, .36], ['RCM', 'Right center mid', 'CM', .65, .36],
                ['LW', 'Left wing', 'WM', .14, .58], ['ST', 'Striker', 'FW', .50, .62], ['RW', 'Right wing', 'WM', .86, .58]],
      '3-3-2': [['LB', 'Left back', 'FB', .16, .20], ['CB', 'Center back', 'CB', .50, .16], ['RB', 'Right back', 'FB', .84, .20],
                ['LM', 'Left midfielder', 'WM', .14, .40], ['CM', 'Center midfielder', 'CM', .50, .36], ['RM', 'Right midfielder', 'WM', .86, .40],
                ['LS', 'Left striker', 'FW', .38, .60], ['RS', 'Right striker', 'FW', .62, .60]],
      '2-4-2': [['LCB', 'Left center back', 'CB', .32, .17], ['RCB', 'Right center back', 'CB', .68, .17],
                ['LM', 'Left midfielder', 'WM', .12, .40], ['LCM', 'Left center mid', 'CM', .38, .35],
                ['RCM', 'Right center mid', 'CM', .62, .35], ['RM', 'Right midfielder', 'WM', .88, .40],
                ['LS', 'Left striker', 'FW', .38, .60], ['RS', 'Right striker', 'FW', .62, .60]],
    },
    11: {
      '4-3-3': [...BACK4, ['DM', 'Defensive mid', 'CM', .50, .31], ['LCM', 'Left center mid', 'CM', .32, .41],
                ['RCM', 'Right center mid', 'CM', .68, .41], ['LW', 'Left wing', 'WM', .13, .60],
                ['ST', 'Striker', 'FW', .50, .63], ['RW', 'Right wing', 'WM', .87, .60]],
      '4-4-2': [...BACK4, ['LM', 'Left midfielder', 'WM', .12, .42], ['LCM', 'Left center mid', 'CM', .38, .37],
                ['RCM', 'Right center mid', 'CM', .62, .37], ['RM', 'Right midfielder', 'WM', .88, .42],
                ['LS', 'Left striker', 'FW', .40, .60], ['RS', 'Right striker', 'FW', .60, .60]],
      '4-2-3-1': [...BACK4, ['LDM', 'Left holding mid', 'CM', .38, .33], ['RDM', 'Right holding mid', 'CM', .62, .33],
                  ['LW', 'Left wing', 'WM', .15, .52], ['CAM', 'Attacking mid', 'CM', .50, .50],
                  ['RW', 'Right wing', 'WM', .85, .52], ['ST', 'Striker', 'FW', .50, .65]],
      '3-5-2': [...BACK3, ['LWB', 'Left wing back', 'FB', .08, .37], ['LCM', 'Left center mid', 'CM', .34, .38],
                ['DM', 'Defensive mid', 'CM', .50, .31], ['RCM', 'Right center mid', 'CM', .66, .38],
                ['RWB', 'Right wing back', 'FB', .92, .37], ['LS', 'Left striker', 'FW', .40, .60], ['RS', 'Right striker', 'FW', .60, .60]],
      '3-4-3': [...BACK3, ['LM', 'Left midfielder', 'WM', .10, .40], ['LCM', 'Left center mid', 'CM', .38, .36],
                ['RCM', 'Right center mid', 'CM', .62, .36], ['RM', 'Right midfielder', 'WM', .90, .40],
                ['LW', 'Left wing', 'WM', .15, .61], ['ST', 'Striker', 'FW', .50, .64], ['RW', 'Right wing', 'WM', .85, .61]],
    },
  };

  const OPP_FORM = { 5: '1-2-1', 7: '2-3-1', 9: '3-3-2', 11: '4-4-2' };

  const SITUATIONS = [
    { id: 'open',          label: 'Open play',         drag: true },
    { id: 'cornerFor',     label: 'Corner for us',     sides: true },
    { id: 'cornerAgainst', label: 'Corner against us', sides: true },
    { id: 'fkFor',         label: 'Free kick for us',  drag: true },
    { id: 'fkAgainst',     label: 'Free kick against', drag: true },
    { id: 'gkFor',         label: 'Our goal kick' },
    { id: 'gkAgainst',     label: 'Their goal kick' },
    { id: 'koFor',         label: 'Our kickoff' },
    { id: 'koAgainst',     label: 'Their kickoff' },
    { id: 'tiFor',         label: 'Our throw-in',      drag: true },
    { id: 'tiAgainst',     label: 'Their throw-in',    drag: true },
  ];
  const MIRROR = {
    open: 'open', cornerFor: 'cornerAgainst', cornerAgainst: 'cornerFor', fkFor: 'fkAgainst', fkAgainst: 'fkFor',
    gkFor: 'gkAgainst', gkAgainst: 'gkFor', koFor: 'koAgainst', koAgainst: 'koFor',
    tiFor: 'tiAgainst', tiAgainst: 'tiFor',
  };
  const FLIP_PHASE = { att: 'def', def: 'att', loose: 'loose' };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const unit = (a, b) => { const d = dist(a, b) || 1; return { x: (b.x - a.x) / d, y: (b.y - a.y) / d }; };

  function slotsFor(size, form) {
    const list = (FORMATIONS[size] && FORMATIONS[size][form]) || FORMATIONS[size][SIZES[size].forms[0]];
    return [{ abbr: 'GK', name: 'Goalkeeper', role: 'GK', x: .5, y: .03 }]
      .concat(list.map(([abbr, name, role, x, y]) => ({ abbr, name, role, x, y })));
  }

  const tokenR = (size) => size.W * 0.036;

  /* ---------- open play ---------- */
  const PH = {
    att:   { S: 1.15, off: .08, V: .60, Wd: 1.00, lat: .25, pull: 0 },
    def:   { S: .80,  off: .06, V: .55, Wd: .72,  lat: .42, pull: .18 },
    loose: { S: .95,  off: .07, V: .57, Wd: .85,  lat: .33, pull: .10 },
  };

  function gkSpot(size, ball, phase) {
    const { L, W, pa } = size;
    const g = { x: W / 2, y: 0 };
    const by = ball.y / L;
    const want = phase === 'att' ? clamp(2 + by * L * 0.2, 2, pa[0] + 3) : clamp(1 + by * L * 0.08, 1, pa[0] * 0.6);
    const d = dist(g, ball);
    const depth = Math.min(want, Math.max(d * 0.5, 0.8));
    const u = unit(g, ball);
    return { x: g.x + u.x * depth, y: Math.max(0.6, g.y + u.y * depth) };
  }

  function shape(slots, size, ball, phase) {
    const { W, L } = size, bx = ball.x / W, by = ball.y / L, p = PH[phase];
    return slots.map((s, i) => {
      if (s.role === 'GK') return Object.assign({ i, job: 'gk' }, gkSpot(size, ball, phase));
      let y = s.y * p.S + p.off + (by - .5) * p.V;
      let x = .5 + (s.x - .5) * p.Wd + (bx - .5) * p.lat;
      x += (bx - x) * p.pull;
      if (phase !== 'att') {
        if (s.y < .25) y = Math.min(y, by - .035);       // defenders: stay goal side of the ball
        else if (s.y < .47) y = Math.min(y, by + .06);   // midfielders: get back level with the ball
      }
      y = clamp(y, .03 + s.y * .25, .93);
      x = clamp(x, .04, .96);
      return { i, x: x * W, y: y * L, job: 'shape' };
    });
  }

  function fieldIdx(slots) { return slots.map((s, i) => i).filter(i => slots[i].role !== 'GK'); }

  function openPlay(slots, size, ball, phase) {
    const out = shape(slots, size, ball, phase);
    const { W, L } = size, sc = W / 68;
    const goal = { x: W / 2, y: 0 };
    const near = fieldIdx(slots).sort((a, b) => dist(out[a], ball) - dist(out[b], ball));
    const [n1, n2] = near;
    const toGoal = unit(ball, goal);
    const coverD = Math.min(L * 0.08, dist(ball, goal) * 0.5);
    if (phase === 'att') {
      out[n1] = { i: n1, x: ball.x, y: ball.y - 0.8 * sc, job: 'onBall' };
      // Support from the helper's own side of the ball (a right mid helps on the right).
      // Only switch sides when the touchline leaves no room.
      const off = W * 0.13;
      let dir = out[n2].x >= ball.x ? 1 : -1;
      if (ball.x + dir * off > W - 2 || ball.x + dir * off < 2) dir = -dir;
      out[n2] = { i: n2, x: clamp(ball.x + dir * off, 2, W - 2), y: clamp(ball.y - L * 0.06, 2, L - 2), job: 'support' };
    } else {
      out[n1] = phase === 'def'
        ? { i: n1, x: ball.x + toGoal.x * 1.5 * sc, y: ball.y + toGoal.y * 1.5 * sc, job: 'press' }
        : { i: n1, x: ball.x, y: ball.y, job: 'win' };
      out[n2] = { i: n2, x: ball.x + toGoal.x * coverD, y: Math.max(1, ball.y + toGoal.y * coverD), job: 'cover' };
    }
    return out;
  }

  /* ---------- helpers for set pieces ---------- */
  const ROLE_ORDER_ATTACK = { FW: 0, CB: 1, CM: 2, WM: 3, FB: 4, GK: 9 };
  const ROLE_ORDER_WALL = { FW: 0, WM: 1, CM: 2, FB: 3, CB: 4, GK: 9 };

  function take(pool, n, cmp) { pool.sort(cmp); return pool.splice(0, n); }
  function spreadX(size, k, half) {
    const { W } = size;
    if (k === 1) return [W / 2];
    return Array.from({ length: k }, (_, j) => W / 2 + (j - (k - 1) / 2) * (2 * half / (k - 1)));
  }
  function basePt(s, size) { return { x: s.x * size.W, y: s.y * size.L }; }

  /* ---------- corners ---------- */
  function cornerFor(slots, size, ball, opts) {
    const { W, L, ga, pa, goal, spot, n } = size, gx = W / 2, sc = W / 68;
    const sgn = ball.x < gx ? -1 : 1;
    const out = [];
    const pool = fieldIdx(slots);
    out[0] = { i: 0, x: gx, y: L * 0.3, job: 'gkUp' };
    const skip = opts && opts.notTaker;  // slot index that chose not to take it
    const cost = (i) => dist(basePt(slots[i], size), ball) + (/CB|FB/.test(slots[i].role) ? 999 : 0) + (i === skip ? 9999 : 0);
    const [taker] = take(pool, 1, (a, b) => cost(a) - cost(b));
    out[taker] = { i: taker, x: ball.x - sgn * 0.8 * sc, y: ball.y - 0.8 * sc, job: 'cornerTaker' };
    const restN = { 5: 1, 7: 1, 9: 2, 11: 3 }[n];
    const rest = take(pool, restN, (a, b) => slots[a].y - slots[b].y);
    spreadX(size, rest.length, W * 0.22).forEach((x, j) => { out[rest[j]] = { i: rest[j], x, y: L * 0.5, job: 'restD' }; });
    const spots = [
      ['nearPost', gx + sgn * (goal / 2 + 0.5 * sc), L - ga[0] * 0.7],
      ['farPost', gx - sgn * (goal / 2 + 1 * sc), L - ga[0] * 0.9],
      ['penSpot', gx, L - spot],
      ['edge', gx - sgn * pa[1] * 0.1, L - pa[0] - 2 * sc],
      ['sixCenter', gx + sgn * 1.5 * sc, L - ga[0] - 1 * sc],
      ['farBack', gx - sgn * pa[1] * 0.35, L - spot],
      ['short', ball.x - sgn * 10 * sc, L - 6 * sc],
      ['edge', gx + sgn * pa[1] * 0.2, L - pa[0] - 2 * sc],
    ];
    pool.sort((a, b) => (ROLE_ORDER_ATTACK[slots[a].role] - ROLE_ORDER_ATTACK[slots[b].role]) || (slots[b].y - slots[a].y));
    pool.forEach((idx, j) => { const s = spots[j % spots.length]; out[idx] = { i: idx, x: s[1], y: s[2], job: s[0] }; });
    return out;
  }

  function cornerAgainst(slots, size, ball) {
    const { W, L, ga, pa, goal, spot, fk, n } = size, gx = W / 2, sc = W / 68;
    const sgn = ball.x < gx ? -1 : 1;
    const out = [];
    out[0] = { i: 0, x: gx - sgn * goal * 0.12, y: 0.7, job: 'gkCorner' };
    const pool = fieldIdx(slots);
    const counterN = n === 11 ? 2 : 1;
    const counter = take(pool, counterN, (a, b) => slots[b].y - slots[a].y);
    const cSpots = [[gx - sgn * W * 0.1, L * 0.42], [gx + sgn * W * 0.3, L * 0.36]];
    counter.forEach((idx, j) => { out[idx] = { i: idx, x: cSpots[j][0], y: cSpots[j][1], job: 'counter' }; });
    const sc2 = unit(ball, { x: gx, y: pa[0] });
    const spots = [
      ['nearZone', gx + sgn * goal * 0.6, ga[0] * 1.15],
      ['sixZone', gx - sgn * goal * 0.05, ga[0] * 1.6],
      ['farZone', gx - sgn * goal * 0.8, ga[0] * 1.25],
      ['penZone', gx + sgn * pa[1] * 0.12, spot * 1.1],
      ['edgeD', gx - sgn * pa[1] * 0.05, pa[0] + 1.5 * sc],
      ['postGuard', gx + sgn * (goal / 2 + 0.2), 0.9],
      ['shortCorner', ball.x + sc2.x * (fk + 0.5), ball.y + sc2.y * (fk + 0.5)],
      ['farEdge', gx - sgn * pa[1] * 0.3, pa[0] + 1 * sc],
    ];
    pool.sort((a, b) => slots[a].y - slots[b].y);
    pool.forEach((idx, j) => { const s = spots[j % spots.length]; out[idx] = { i: idx, x: s[1], y: s[2], job: s[0] }; });
    return out;
  }

  /* ---------- free kicks ---------- */
  function fkAgainst(slots, size, ball) {
    const { W, L, ga, pa, goal, fk, n } = size, gx = W / 2, sc = W / 68, r = tokenR(size);
    const sgn = ball.x < gx ? -1 : 1; // near-post side
    const G = { x: gx, y: 0 };
    const d = dist(ball, G);
    const maxWall = { 5: 1, 7: 2, 9: 3, 11: 4 }[n];
    let nWall = d < pa[0] + 12 * sc ? maxWall : d < L * 0.3 ? Math.max(1, maxWall - 1) : d < L * 0.42 ? 1 : 0;
    if (Math.abs(ball.x - gx) > pa[1] / 2 + 2 && nWall > 1) nWall -= 1;
    const out = [];
    const gAim = { x: gx - sgn * goal * 0.12, y: 0 };
    const gu = unit(gAim, ball);
    const gd = Math.min(1.5 + 1.5 * sc, dist(gAim, ball) * 0.3);
    out[0] = { i: 0, x: gAim.x + gu.x * gd, y: Math.max(0.6, gu.y * gd), job: 'gkFk' };
    const pool = fieldIdx(slots);
    const counter = take(pool, 1, (a, b) => slots[b].y - slots[a].y)[0];
    out[counter] = { i: counter, x: gx - sgn * W * 0.15, y: clamp(ball.y + L * 0.3, L * 0.4, L * 0.6), job: 'counter' };
    const wall = take(pool, nWall, (a, b) => (ROLE_ORDER_WALL[slots[a].role] - ROLE_ORDER_WALL[slots[b].role]) || (slots[a].y - slots[b].y));
    const aim = { x: gx + sgn * goal * 0.25, y: 0 };
    const dir = unit(ball, aim);
    const C = { x: ball.x + dir.x * fk, y: ball.y + dir.y * fk };
    const perp = { x: -dir.y, y: dir.x };
    const gap = 2.1 * r;
    wall.forEach((idx, k) => {
      const o = (k - (wall.length - 1) / 2) * gap;
      out[idx] = { i: idx, x: C.x + perp.x * o, y: C.y + perp.y * o, job: 'wall' };
    });
    const lineY = clamp(Math.min(ball.y - 2 * sc, pa[0] + 1), ga[0] + 1, L * 0.45);
    const lineCap = { 5: 2, 7: 3, 9: 4, 11: 5 }[n];
    pool.sort((a, b) => slots[a].y - slots[b].y);
    const line = pool.splice(0, lineCap);
    spreadX(size, line.length, pa[1] * 0.36).sort((a, b) => a - b).forEach((x, j) => {
      const sorted = line.slice().sort((a, b) => slots[a].x - slots[b].x);
      out[sorted[j]] = { i: sorted[j], x, y: lineY, job: 'holdLine' };
    });
    pool.forEach((idx, j) => {
      out[idx] = { i: idx, x: gx - sgn * pa[1] * (0.25 + 0.15 * j), y: clamp(ball.y - 3 * sc, pa[0] - 2, L * 0.48), job: 'secondBall' };
    });
    // nobody except the wall closer than the free kick distance
    out.forEach(p => {
      if (!p || p.job === 'wall' || p.job === 'gkFk') return;
      if (dist(p, ball) < fk + 0.5) { const u = unit(ball, p); p.x = ball.x + u.x * (fk + 0.5); p.y = ball.y + u.y * (fk + 0.5); }
    });
    return out;
  }

  function fkFor(slots, size, ball, opts) {
    const { W, L, ga, pa, n } = size, gx = W / 2, sc = W / 68;
    const G = { x: gx, y: L };
    const out = [];
    out[0] = { i: 0, x: gx, y: clamp(ball.y * 0.35, 2, L * 0.3), job: 'gkUp' };
    const pool = fieldIdx(slots);
    const pref = (s) => (s.role === 'CM' || s.role === 'WM' ? 0 : 40);
    const skip = opts && opts.notTaker;  // slot index that chose not to take it
    const cost = (i) => dist(basePt(slots[i], size), ball) + pref(slots[i]) + (i === skip ? 9999 : 0);
    const taker = take(pool, 1, (a, b) => cost(a) - cost(b))[0];
    const back = unit(G, ball);
    out[taker] = { i: taker, x: ball.x + back.x * 1.2 * sc, y: ball.y + back.y * 1.2 * sc, job: 'fkTaker' };
    const close = dist(ball, G) < L * 0.35;
    if (close) {
      const dummy = take(pool, 1, (a, b) => dist(basePt(slots[a], size), ball) - dist(basePt(slots[b], size), ball))[0];
      const perp = { x: -back.y, y: back.x };
      out[dummy] = { i: dummy, x: ball.x + perp.x * 2 * sc + back.x * 1.2 * sc, y: ball.y + perp.y * 2 * sc + back.y * 1.2 * sc, job: 'fkDummy' };
    }
    const restN = { 5: 1, 7: 1, 9: 2, 11: 3 }[n];
    const rest = take(pool, restN, (a, b) => slots[a].y - slots[b].y);
    const restY = clamp(ball.y - L * 0.35, L * 0.3, L * 0.55);
    spreadX(size, rest.length, W * 0.22).forEach((x, j) => { out[rest[j]] = { i: rest[j], x, y: restY, job: 'restD' }; });
    const lineY = close ? L - ga[0] - 3 * sc : ball.y + (L - ball.y) * 0.6;
    const sorted = pool.slice().sort((a, b) => slots[a].x - slots[b].x);
    const xs = spreadX(size, sorted.length, pa[1] * 0.38);
    sorted.forEach((idx, j) => { out[idx] = { i: idx, x: xs[j], y: lineY - (j % 2) * 2 * sc, job: 'attackLine' }; });
    return out;
  }

  /* ---------- goal kicks ---------- */
  function buildOutY(size) { return size.pa[0] + (size.L / 2 - size.pa[0]) / 2; }

  function gkFor(slots, size, ball) {
    const { W, L, pa } = size, gx = W / 2;
    const out = shape(slots, size, { x: gx, y: L * 0.12 }, 'att');
    out[0] = { i: 0, x: ball.x, y: ball.y - 0.8, job: 'gkKick' };
    const cbs = fieldIdx(slots).filter(i => slots[i].role === 'CB').sort((a, b) => slots[a].x - slots[b].x);
    const fbs = fieldIdx(slots).filter(i => slots[i].role === 'FB');
    if (cbs.length >= 2) {
      out[cbs[0]] = { i: cbs[0], x: gx - pa[1] * 0.45, y: pa[0] * 0.45, job: 'splitWide' };
      out[cbs[cbs.length - 1]] = { i: cbs[cbs.length - 1], x: gx + pa[1] * 0.45, y: pa[0] * 0.45, job: 'splitWide' };
      if (cbs.length === 3) out[cbs[1]] = { i: cbs[1], x: gx, y: pa[0] + 2, job: 'showCenter' };
      fbs.forEach(i => { out[i] = { i, x: slots[i].x < .5 ? W * 0.06 : W * 0.94, y: pa[0] + L * 0.1, job: 'fbHigh' }; });
    } else {
      fbs.forEach(i => { out[i] = { i, x: slots[i].x < .5 ? gx - pa[1] * 0.48 : gx + pa[1] * 0.48, y: pa[0] * 0.5, job: 'splitWide' }; });
      cbs.forEach(i => { out[i] = { i, x: gx, y: pa[0] + 2, job: 'showCenter' }; });
    }
    const cms = fieldIdx(slots).filter(i => slots[i].role === 'CM').sort((a, b) => slots[a].y - slots[b].y);
    if (cms.length) out[cms[0]] = { i: cms[0], x: gx + (cbs.length === 3 ? W * 0.12 : 0), y: pa[0] + L * 0.09, job: 'showForBall' };
    return out;
  }

  function gkAgainst(slots, size, ball) {
    const { W, L, pa, buildOut } = size, gx = W / 2;
    const out = shape(slots, size, { x: gx, y: L * 0.8 }, 'def');
    const fws = fieldIdx(slots).filter(i => slots[i].role === 'FW' || slots[i].y > .55).sort((a, b) => slots[a].x - slots[b].x);
    const lim = buildOut ? L - buildOutY(size) - 0.8 : L - pa[0] - 1.5;
    const xs = spreadX(size, fws.length, pa[1] * 0.25);
    fws.forEach((i, j) => { out[i] = { i, x: xs[j], y: lim, job: buildOut ? 'buildOut' : 'pressHigh' }; });
    if (buildOut) out.forEach(p => { if (p.y > lim) p.y = lim; });
    return out;
  }

  /* ---------- kickoffs ---------- */
  function keepOwnHalf(out, size, outsideCircle) {
    const c = { x: size.W / 2, y: size.L / 2 }, R = size.circle + 0.8;
    out.forEach(p => {
      if (p.y > size.L / 2 - 0.6) p.y = size.L / 2 - 0.6;
      if (outsideCircle && dist(p, c) < R) {
        const u = unit(c, p); p.x = c.x + u.x * R; p.y = c.y + u.y * R;
        if (p.y > size.L / 2 - 0.6) p.y = size.L / 2 - 0.6;
      }
    });
  }

  function koFor(slots, size, ball, opts) {
    const { W, L } = size, gx = W / 2, sc = W / 68;
    const out = shape(slots, size, ball, 'att');
    keepOwnHalf(out, size, false);
    const pool = fieldIdx(slots);
    const skip = opts && opts.notTaker;  // slot index that chose not to take it
    const KO_ORDER = { FW: 0, CM: 1, WM: 2, FB: 3, CB: 4 };
    const rank = (i) => (i === skip ? 99 : KO_ORDER[slots[i].role]);
    const kicker = take(pool, 1, (a, b) => (rank(a) - rank(b)) || (Math.abs(slots[a].x - .5) - Math.abs(slots[b].x - .5)))[0];
    out[kicker] = { i: kicker, x: gx, y: L / 2 - 0.6, job: 'kicker' };
    const recv = take(pool.filter(i => slots[i].role === 'CM'), 1, (a, b) => slots[b].y - slots[a].y)[0];
    if (recv !== undefined) out[recv] = { i: recv, x: gx - 3 * sc, y: L / 2 - 6 * sc, job: 'koReceiver' };
    pool.forEach(i => {
      const s = slots[i];
      if (i !== recv && (s.role === 'FW' || (s.role === 'WM' && s.y > .5))) {
        // A central forward who passed on the kickoff steps beside the kicker.
        const x = Math.abs(s.x - .5) < .1 ? gx + (s.x < .5 ? -1 : 1) * W * 0.17 : s.x * W;
        out[i] = { i, x, y: L / 2 - 0.8, job: 'koRun' };
      }
      else if (i !== recv) out[i].job = 'koShape';
    });
    return out;
  }

  function koAgainst(slots, size, ball) {
    const out = shape(slots, size, ball, 'def');
    out.forEach((p, i) => { if (slots[i].role !== 'GK') p.job = (slots[i].role === 'FW' ? 'koPress' : 'koShape'); });
    keepOwnHalf(out, size, true);
    return out;
  }

  /* ---------- throw-ins ---------- */
  // Ball sits on a touchline. sgn: +1 into the field from that line.
  function tiFor(slots, size, ball, opts) {
    const { W, L } = size, sc = W / 68;
    const left = ball.x < W / 2, sgn = left ? 1 : -1, lineX = left ? 0 : W;
    const out = shape(slots, size, ball, 'att');
    const pool = fieldIdx(slots);
    const skip = opts && opts.notTaker;  // slot index that chose not to take it
    const sideOk = (s) => (left ? s.x < .5 : s.x > .5);
    // Outside backs take it in our half, wide players up the field.
    const pref = (s) => (!sideOk(s) ? 60 : ball.y < L * 0.5 ? (s.role === 'FB' ? 0 : s.role === 'WM' ? 8 : 25) : (s.role === 'WM' ? 0 : s.role === 'FB' ? 8 : 25));
    const cost = (i) => dist(basePt(slots[i], size), ball) * 0.5 + pref(slots[i]) + (i === skip ? 9999 : 0);
    const taker = take(pool, 1, (a, b) => cost(a) - cost(b))[0];
    out[taker] = { i: taker, x: lineX + sgn * 0.4, y: ball.y, job: 'tiTaker' };
    const near = (i) => dist(out[i], ball);
    const opts3 = [
      ['tiLine', lineX + sgn * 2.5 * sc, clamp(ball.y + 9 * sc, 2, L - 1.5)],
      ['tiShort', lineX + sgn * 8 * sc, clamp(ball.y + 1.5 * sc, 2, L - 2)],
      ['tiBack', lineX + sgn * 5 * sc, clamp(ball.y - 8 * sc, 1.5, L - 2)],
    ];
    opts3.forEach(([job, x, y]) => {
      if (!pool.length) return;
      const tgt = { x, y };
      const idx = take(pool, 1, (a, b) => (dist(out[a], tgt) + near(a) * 0.3) - (dist(out[b], tgt) + near(b) * 0.3))[0];
      out[idx] = { i: idx, x, y, job };
    });
    // Near their goal, a big player attacks the box for a long throw.
    if (ball.y > L * 0.75 && pool.length) {
      const fw = take(pool, 1, (a, b) => (slots[a].role === 'FW' ? 0 : 1) - (slots[b].role === 'FW' ? 0 : 1) || slots[b].y - slots[a].y)[0];
      out[fw] = { i: fw, x: W / 2 - sgn * W * 0.05, y: L - size.spot, job: 'tiBox' };
    }
    pool.forEach(i => { if (slots[i].role !== 'GK') out[i].job = 'tiShape'; });
    return out;
  }

  function tiAgainst(slots, size, ball) {
    const { W, L } = size, sc = W / 68;
    const left = ball.x < W / 2, sgn = left ? 1 : -1, lineX = left ? 0 : W;
    const out = shape(slots, size, ball, 'def');
    const pool = fieldIdx(slots);
    // Mark where they want to throw it: down the line and short inside. Stay goal side.
    const marks = [
      ['tiMarkLine', lineX + sgn * 3 * sc, clamp(ball.y + 7 * sc, 2, L - 2)],
      ['tiMarkShort', lineX + sgn * 8 * sc, clamp(ball.y - 1.5 * sc, 1.5, L - 2)],
      ['tiMarkBack', lineX + sgn * 6.5 * sc, clamp(ball.y - 9 * sc, 1.5, L - 2)],
    ];
    marks.forEach(([job, x, y]) => {
      const tgt = { x, y };
      const idx = take(pool, 1, (a, b) => dist(out[a], tgt) - dist(out[b], tgt))[0];
      out[idx] = { i: idx, x, y, job };
    });
    pool.forEach(i => { out[i].job = 'tiShape'; });
    return out;
  }

  // Defenders stay 2 m (about 2 yards) away from the thrower.
  function throwSpace(out, ball) {
    out.forEach(p => {
      if (p.job === 'gk' || p.job === 'tiTaker') return;
      if (dist(p, ball) < 2.5) { const u = unit(ball, p); p.x = ball.x + u.x * 2.5; p.y = ball.y + u.y * 2.5; }
    });
  }

  /* ---------- public ---------- */
  const SIT_FN = { cornerFor, cornerAgainst, fkFor, fkAgainst, gkFor, gkAgainst, koFor, koAgainst, tiFor, tiAgainst };

  function relax(out, size) {
    const minD = tokenR(size) * 2.15;
    const pinned = new Set(['onBall', 'press', 'win', 'wall', 'gkKick', 'cornerTaker', 'fkTaker', 'kicker', 'tiTaker']);
    for (let it = 0; it < 24; it++) {
      for (let a = 0; a < out.length; a++) for (let b = a + 1; b < out.length; b++) {
        const p = out[a], q = out[b];
        let d = dist(p, q);
        if (d >= minD) continue;
        if (d < 1e-3) { q.x += 0.01; d = 0.01; }
        const push = (minD - d) / 2, ux = (q.x - p.x) / d, uy = (q.y - p.y) / d;
        const pa = pinned.has(p.job), pb = pinned.has(q.job);
        if (pa && pb) continue;
        const kp = pa ? 0 : pb ? 2 : 1, kq = pb ? 0 : pa ? 2 : 1;
        p.x -= ux * push * kp; p.y -= uy * push * kp;
        q.x += ux * push * kq; q.y += uy * push * kq;
      }
    }
    out.forEach(p => { p.x = clamp(p.x, 0.4, size.W - 0.4); p.y = clamp(p.y, 0.4, size.L - 0.4); });
    return out;
  }

  // opts.notTaker: slot index that will not take the corner, free kick, kickoff or throw-in (someone else takes it)
  function positions(sitId, slots, size, ball, phase, opts) {
    const out = sitId === 'open' ? openPlay(slots, size, ball, phase || 'att') : SIT_FN[sitId](slots, size, ball, opts);
    relax(out, size);
    if (sitId === 'koFor' || sitId === 'koAgainst') keepOwnHalf(out, size, sitId === 'koAgainst');
    if (sitId === 'tiAgainst') throwSpace(out, ball);
    return out;
  }

  function mirrorPt(p, size) { return { x: size.W - p.x, y: size.L - p.y }; }

  function opponentPositions(sitId, slots, size, ball, phase) {
    const out = positions(MIRROR[sitId], slots, size, mirrorPt(ball, size), FLIP_PHASE[phase || 'att']);
    return out.map(p => Object.assign({}, p, mirrorPt(p, size)));
  }

  function defaultBall(sitId, size, side) {
    const { W, L, pa, ga } = size, gx = W / 2, sc = W / 68;
    const left = side !== 'R';
    switch (sitId) {
      case 'cornerFor': return { x: left ? 0.3 : W - 0.3, y: L - 0.3 };
      case 'cornerAgainst': return { x: left ? 0.3 : W - 0.3, y: 0.3 };
      case 'fkFor': return { x: gx + 7 * sc, y: L - pa[0] - 8 * sc };
      case 'fkAgainst': return { x: gx - 7 * sc, y: pa[0] + 8 * sc };
      case 'gkFor': return { x: gx - ga[1] / 4, y: ga[0] };
      case 'gkAgainst': return { x: gx + ga[1] / 4, y: L - ga[0] };
      case 'tiFor': return { x: left ? 0.3 : W - 0.3, y: L * 0.6 };
      case 'tiAgainst': return { x: left ? 0.3 : W - 0.3, y: L * 0.4 };
      default: return { x: gx, y: L / 2 };
    }
  }

  function clampBall(sitId, size, b) {
    const { W, L } = size;
    let x = clamp(b.x, 0.3, W - 0.3), y = clamp(b.y, 0.3, L - 0.3);
    if (sitId === 'fkFor') y = Math.max(y, L / 2);
    if (sitId === 'fkAgainst') y = Math.min(y, L / 2);
    if (sitId === 'tiFor' || sitId === 'tiAgainst') { x = x < W / 2 ? 0.3 : W - 0.3; y = clamp(y, 2, L - 2); }
    return { x, y };
  }

  function thirdOf(size, ball) { const f = ball.y / size.L; return f < 1 / 3 ? 'D' : f < 2 / 3 ? 'M' : 'A'; }

  const API = {
    SIZES, FORMATIONS, OPP_FORM, SITUATIONS, MIRROR,
    slotsFor, positions, opponentPositions, defaultBall, clampBall, thirdOf, tokenR, buildOutY, dist,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.FYS = API;
})(typeof window !== 'undefined' ? window : globalThis);
