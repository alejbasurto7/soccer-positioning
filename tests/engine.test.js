// Run: node tests/engine.test.js
const E = require('../engine.js');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
for (const n of [5, 7, 9, 11]) {
  const size = E.SIZES[n];
  for (const form of size.forms) {
    const slots = E.slotsFor(n, form);
    ok(slots.length === n, `${form} has ${slots.length} players`);
    for (const sit of E.SITUATIONS) {
      for (const side of ['L', 'R']) for (const phase of ['att', 'def', 'loose']) {
        for (let k = 0; k < (sit.drag ? 25 : 1); k++) {
          let ball = E.defaultBall(sit.id, size, side);
          if (sit.drag && k) ball = E.clampBall(sit.id, size, { x: Math.random() * size.W, y: Math.random() * size.L });
          for (const fn of ['positions', 'opponentPositions']) {
            const out = E[fn](sit.id, slots, size, ball, phase);
            const tag = `${n} ${form} ${sit.id} ${side} ${phase} ${fn}`;
            ok(out.length === n && out.every(Boolean), tag + ' missing players');
            out.forEach(p => ok(p.x >= 0 && p.x <= size.W && p.y >= 0 && p.y <= size.L && p.job, tag + ' bad ' + JSON.stringify(p)));
          }
          if (sit.id === 'open' && phase === 'def') {
            const out = E.positions('open', slots, size, ball, 'def');
            slots.forEach((s, i) => { if (s.role === 'CB' && out[i].job === 'shape') ok(out[i].y <= ball.y + 0.5 || ball.y < size.L * 0.1, `CB goal side ${form} ${JSON.stringify(ball)} ${out[i].y}`); });
          }
          if (/^ko/.test(sit.id)) E.positions(sit.id, slots, size, ball, phase).forEach(p => ok(p.y < size.L / 2, 'kickoff own half ' + form));
        }
      }
    }
  }
}
// Throw-ins: one thrower on the line, nobody else within 2 m of the ball when defending.
for (const n of [5, 7, 9, 11]) for (const form of E.SIZES[n].forms) for (let k = 0; k < 20; k++) {
  const size = E.SIZES[n], slots = E.slotsFor(n, form);
  const ball = E.clampBall('tiFor', size, { x: Math.random() * size.W, y: Math.random() * size.L });
  const f = E.positions('tiFor', slots, size, ball);
  ok(f.filter(p => p.job === 'tiTaker').length === 1, `tiFor ${form} one thrower`);
  ok(slots[f.findIndex(p => p.job === 'tiTaker')].role !== 'GK', `tiFor ${form} keeper throws`);
  E.positions('tiAgainst', slots, size, ball).forEach(p => ok(p.job === 'gk' || E.dist(p, ball) >= 2, `tiAgainst ${form} too close`));
}
// Opting out of a corner or free kick: someone else takes it, and you get another spot.
for (const [sit, job] of [['cornerFor', 'cornerTaker'], ['fkFor', 'fkTaker'], ['koFor', 'kicker'], ['tiFor', 'tiTaker']])
for (const n of [5, 7, 9, 11]) for (const form of E.SIZES[n].forms) for (const side of ['L', 'R']) for (let k = 0; k < 10; k++) {
  const size = E.SIZES[n], slots = E.slotsFor(n, form);
  let ball = E.defaultBall(sit, size, side);
  if ((sit === 'fkFor' || sit === 'tiFor') && k) ball = E.clampBall(sit, size, { x: Math.random() * size.W, y: Math.random() * size.L });
  const base = E.positions(sit, slots, size, ball);
  const me = base.findIndex(p => p.job === job);
  const out = E.positions(sit, slots, size, ball, null, { notTaker: me });
  ok(out[me].job !== job, `${sit} ${form} ${side} skip: still taker`);
  ok(out.filter(p => p.job === job).length === 1, `${sit} ${form} ${side} skip: one taker`);
}
// Support player helps from their own side: the screenshot case (7v7 2-3-1, ball just right of center, high up).
{
  const size = E.SIZES[7], slots = E.slotsFor(7, '2-3-1');
  for (const bx of [0.52, 0.6, 0.7]) {
    const ball = { x: size.W * bx, y: size.L * 0.8 };
    const out = E.positions('open', slots, size, ball, 'att');
    const s = out.findIndex(p => p.job === 'support');
    if (slots[s].x > .5) ok(out[s].x > ball.x, `support on own side ${slots[s].abbr} ${bx}`);
  }
}
console.log(fails ? `${fails} failures` : 'all engine checks passed');
process.exit(fails ? 1 : 0);
