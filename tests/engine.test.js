// Run: node tests/engine.test.js
const E = require('../engine.js');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
for (const n of [7, 9, 11]) {
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
console.log(fails ? `${fails} failures` : 'all engine checks passed');
process.exit(fails ? 1 : 0);
