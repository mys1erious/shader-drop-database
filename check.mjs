// Self-check: hold works with mouse, touch and keyboard; letting go cools; a full hold ends. Needs @playwright/test and a local server.
// usage: node check.mjs http://127.0.0.1:<port>/<path>/   (PW_FROM=<a package.json beside @playwright/test> if it is installed elsewhere)
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(process.env.PW_FROM || import.meta.url);
const { chromium } = require('@playwright/test');
const url = process.argv[2], errors = [];
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const open = async (opt) => {
  const c = await b.newContext(opt), p = await c.newPage();
  p.on('pageerror', e => errors.push(e.message)); p.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await p.goto(url); await p.waitForFunction('window.__ready===true');
  return p;
};
const peek = (p) => p.evaluate('window.__peek()');
const rect = (p) => p.evaluate(() => { const r = document.getElementById('hold').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
const wait = (p, ms) => p.waitForTimeout(ms);
async function holds(name, p, down, up) {
  await down(); await wait(p, 900);
  const a = await peek(p); assert(a.held && a.P > .05, `${name}: holding raises P (${a.P})`);
  await up(); await wait(p, 200);
  const r = await peek(p); assert(!r.held, `${name}: let go`);
  await wait(p, 900);
  const c = await peek(p); assert(c.P < r.P, `${name}: cools (${r.P} -> ${c.P})`);
  console.log('ok', name, a.P.toFixed(2), '->', c.P.toFixed(2));
}
let p = await open({ viewport: { width: 1280, height: 800 } }), r = await rect(p);
await p.mouse.move(r.x, r.y);
await holds('mouse', p, () => p.mouse.down(), () => p.mouse.up());
await p.mouse.down(); await wait(p, 300); await p.mouse.move(5, 5); await wait(p, 300);
assert((await peek(p)).held, 'mouse: dragging off the button keeps the hold'); await p.mouse.up();
await holds('space', p, () => p.keyboard.down(' '), () => p.keyboard.up(' '));
await p.focus('#hold');
await holds('enter on focused button', p, () => p.keyboard.down('Enter'), () => p.keyboard.up('Enter'));

p = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 }); r = await rect(p);
const cdp = await p.context().newCDPSession(p);
const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
await holds('touch', p, () => touch('touchStart', [r]), () => touch('touchEnd', []));
assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no horizontal scroll');

// a full hold ends the page, and restore brings it back
p = await open({ viewport: { width: 800, height: 900 } }); r = await rect(p);
await p.mouse.move(r.x, r.y); await p.mouse.down();
await p.waitForFunction('window.__peek().done', null, { timeout: 30000 }); await p.mouse.up();
await p.waitForSelector('#again', { state: 'visible', timeout: 20000 });
await p.click('#again');
const z = await peek(p); assert(!z.done && z.P === 0, 'restore resets'); console.log('ok full hold and restore');
assert.deepEqual(errors, []);
await b.close(); console.log('all ok');
