const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Minimal browser stubs so the bookmarklet IIFE loads in Node without a DOM.
// window.open returns null -> openPopup() takes its "popup blocked" path and
// renderPopup() no-ops on the null popup.
const fakeEl = () => ({
  style: {},
  className: '',
  textContent: '',
  setAttribute() {},
  appendChild() {},
  remove() {}
});

global.window = { _HL: undefined, scrollX: 0, scrollY: 0, open: () => null };
global.document = {
  querySelectorAll: () => [],
  createElement: () => fakeEl(),
  body: { appendChild() {} }
};
global.alert = () => {};

eval(fs.readFileSync(path.join(__dirname, '..', 'highlight-tool.js'), 'utf8'));
const HL = window._HL;

const rect = (top, left, width, height) => ({ top, left, width, height });
const seed = (h) => HL.__test.seed(h);

test('htmlEncode escapes &, <, " and \' ', () => {
  assert.equal(HL.__test.htmlEncode('<&"\''), '&lt;&amp;&quot;&#39;');
});

test('htmlEncode passes through plain text', () => {
  assert.equal(HL.__test.htmlEncode('hello world'), 'hello world');
});

test('gridPosCSS positions corner, edge and centre cells', () => {
  assert.equal(HL.__test.gridPosCSS('tl', { x: 0, y: 0 }), 'top:4px;left:4px');
  assert.equal(HL.__test.gridPosCSS('br', { x: 0, y: 0 }), 'bottom:4px;right:4px');
  assert.equal(HL.__test.gridPosCSS('bl', { x: 0, y: 0 }), 'bottom:4px;left:4px');
  assert.equal(
    HL.__test.gridPosCSS('mc', { x: 0, y: 0 }),
    'top:50%;left:50%;transform:translate(calc(-50% + 0px), calc(-50% + 0px))'
  );
});

test('gridPosCSS applies margin offsets', () => {
  assert.equal(HL.__test.gridPosCSS('tr', { x: 5, y: -3 }), 'top:1px;right:-1px');
  assert.equal(HL.__test.gridPosCSS('tc', { x: 2, y: 0 }), 'top:4px;left:50%;transform:translateX(calc(-50% + 2px))');
});

test('gridPosCSS centres for an unknown grid', () => {
  assert.equal(HL.__test.gridPosCSS('xx', { x: 0, y: 0 }), 'top:50%;left:50%;transform:translate(-50%,-50%)');
});

test('getDefaultHighlight increments ids and cycles the palette', () => {
  const h1 = HL.__test.getDefaultHighlight(rect(10, 20, 100, 50), '#a');
  const h2 = HL.__test.getDefaultHighlight(rect(10, 20, 100, 50), '#b');
  assert.equal(h2.id, h1.id + 1);
  assert.notEqual(h1.badge.color, h2.badge.color);
});

test('getDefaultHighlight stores rect, scroll and defaults', () => {
  HL.clearAll();
  window.scrollX = 33;
  window.scrollY = 44;
  const h = HL.__test.getDefaultHighlight(rect(1, 2, 3, 4), '#x');
  assert.deepEqual(h.rect, { top: 1, left: 2, width: 3, height: 4, scrollX: 33, scrollY: 44 });
  assert.equal(h.padding.top, 0);
  assert.equal(h.margin.x, 0);
  assert.equal(h.border.width, 2);
  assert.equal(h.border.style, 'solid');
  assert.equal(h.background.opacity, 12);
  assert.equal(h.badge.number, 1);
  assert.equal(h.badge.grid, 'tr');
  assert.equal(h.label.grid, 'tl');
  assert.equal(h.label.text, '');
});

test('updateHL 4-arg sets section[key]', () => {
  HL.clearAll();
  const h = HL.__test.getDefaultHighlight(rect(0, 0, 10, 10), '#u');
  seed(h);
  HL.updateHL(h.id, 'border', 'width', 7);
  const stored = HL.getHighlights().find((x) => x.id === h.id);
  assert.equal(stored.border.width, 7);
});

test('updateHL 5-arg sets nested section[key][subKey]', () => {
  HL.clearAll();
  const h = HL.__test.getDefaultHighlight(rect(0, 0, 10, 10), '#v');
  seed(h);
  HL.updateHL(h.id, 'badge', 'margin', 'x', 5);
  const stored = HL.getHighlights().find((x) => x.id === h.id);
  assert.equal(stored.badge.margin.x, 5);
});

test('updateHL clamps badge.z to at least 1', () => {
  HL.clearAll();
  const h = HL.__test.getDefaultHighlight(rect(0, 0, 10, 10), '#z1');
  seed(h);
  HL.updateHL(h.id, 'badge', 'z', 0);
  let stored = HL.getHighlights().find((x) => x.id === h.id);
  assert.equal(stored.badge.z, 1);
  HL.updateHL(h.id, 'badge', 'z', '');
  stored = HL.getHighlights().find((x) => x.id === h.id);
  assert.equal(stored.badge.z, 1);
  HL.updateHL(h.id, 'badge', 'z', 500);
  stored = HL.getHighlights().find((x) => x.id === h.id);
  assert.equal(stored.badge.z, 500);
});

test('updateHL with an unknown id is a no-op', () => {
  const before = HL.getHighlights().length;
  HL.updateHL(9999, 'label', 'text', 'nope');
  assert.equal(HL.getHighlights().length, before);
});

test('removeHL removes a highlight and renumbers badges', () => {
  HL.clearAll();
  const a = HL.__test.getDefaultHighlight(rect(0, 0, 10, 10), '#r1');
  const b = HL.__test.getDefaultHighlight(rect(0, 0, 10, 10), '#r2');
  const c = HL.__test.getDefaultHighlight(rect(0, 0, 10, 10), '#r3');
  [a, b, c].forEach(seed);
  HL.removeHL(b.id);
  const hs = HL.getHighlights();
  assert.equal(hs.length, 2);
  assert.deepEqual([hs[0].id, hs[1].id], [a.id, c.id]);
  assert.equal(hs[0].badge.number, 1);
  assert.equal(hs[1].badge.number, 2);
});

test('badge numbers stay contiguous after delete + add', () => {
  HL.clearAll();
  const a = HL.__test.getDefaultHighlight(rect(0, 0, 10, 10), '#n1');
  const b = HL.__test.getDefaultHighlight(rect(0, 0, 10, 10), '#n2');
  const c = HL.__test.getDefaultHighlight(rect(0, 0, 10, 10), '#n3');
  [a, b, c].forEach(seed);
  HL.removeHL(b.id);
  const d = HL.__test.getDefaultHighlight(rect(0, 0, 10, 10), '#n4');
  seed(d);
  assert.deepEqual(HL.getHighlights().map((x) => x.badge.number), [1, 2, 3]);
});

test('moveHL moves a highlight down and back up', () => {
  HL.clearAll();
  const a = HL.__test.getDefaultHighlight(rect(0, 0, 10, 10), '#m1');
  const b = HL.__test.getDefaultHighlight(rect(0, 0, 10, 10), '#m2');
  const c = HL.__test.getDefaultHighlight(rect(0, 0, 10, 10), '#m3');
  [a, b, c].forEach(seed);
  HL.moveHL(b.id, 1);
  assert.deepEqual(HL.getHighlights().map((x) => x.id), [a.id, c.id, b.id]);
  assert.deepEqual(HL.getHighlights().map((x) => x.badge.number), [1, 2, 3]);
  HL.moveHL(b.id, -1);
  assert.deepEqual(HL.getHighlights().map((x) => x.id), [a.id, b.id, c.id]);
});

test('moveHL clamps at the edges', () => {
  HL.clearAll();
  const a = HL.__test.getDefaultHighlight(rect(0, 0, 10, 10), '#e1');
  const b = HL.__test.getDefaultHighlight(rect(0, 0, 10, 10), '#e2');
  [a, b].forEach(seed);
  HL.moveHL(a.id, -1);
  assert.deepEqual(HL.getHighlights().map((x) => x.id), [a.id, b.id]);
  HL.moveHL(b.id, 1);
  assert.deepEqual(HL.getHighlights().map((x) => x.id), [a.id, b.id]);
});
