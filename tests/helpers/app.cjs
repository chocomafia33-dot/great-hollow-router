// Reused from the prior local all-candidates verification.
// Minimal DOM simulation; this does not emulate browser rendering.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const htmlClasses = new Set([...html.matchAll(/\bclass="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)));

function element(dataset = {}) {
  const classes = new Set();
  return {
    dataset, textContent: '', innerHTML: '', value: '', disabled: false,
    open: false, attributes: {}, parentElement: { scrollTop: 0, scrollLeft: 0 },
    classList: {
      add: (...names) => names.forEach(n => classes.add(n)),
      remove: (...names) => names.forEach(n => classes.delete(n)),
      contains: n => classes.has(n),
      toggle(n, force) {
        const on = force === undefined ? !classes.has(n) : force;
        if (on) classes.add(n); else classes.delete(n);
        return on;
      }
    },
    setAttribute(n, v) { this.attributes[n] = v; }, style: {}
  };
}
function app() {
  const elements = new Map();
  const get = selector => {
    assert.ok((selector.startsWith('#') && ids.has(selector.slice(1))) ||
      (selector.startsWith('.') && htmlClasses.has(selector.slice(1))),
      `app.jsの参照先がindex.htmlにない: ${selector}`);
    if (!elements.has(selector)) elements.set(selector, element());
    return elements.get(selector);
  };
  const startValues = [...html.matchAll(/\bdata-start="([^"]+)"/g)].map(m => m[1]);
  const zoneValues = [...html.matchAll(/\bdata-zone="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(startValues, ['south', 'kaiden', 'north'], '開始地点ボタン');
  assert.deepEqual(zoneValues, ['top', 'bottom'], '地上・地下ボタン');
  const starts = startValues.map(start => element({ start }));
  const zones = zoneValues.map(zone => element({ zone }));
  elements.set('#showTop', zones[0]);
  elements.set('#showBottom', zones[1]);
  let clipboard = '';
  const context = vm.createContext({
    document: {
      querySelector: get,
      querySelectorAll: s => s === '[data-start]' ? starts : s === '[data-zone]' ? zones : []
    },
    window: { scrollTo() {} },
    navigator: { clipboard: { async writeText(value) { clipboard = value; } } }
  });
  vm.runInContext(source, context);
  return { get, starts, zones, context,
    answer: value => context.window.answer(value),
    state: () => vm.runInContext('state', context),
    groups: vm.runInContext('candidateGroups', context),
    points: vm.runInContext('candidatePoints', context),
    clipboard: () => clipboard
  };
}
const routes = {
  south: { purple: ['yes'], green: ['no', 'no'], blue: ['no', 'yes', 'yes'], red: ['no', 'yes', 'no'] },
  kaiden: { blue: ['yes'], green: ['no', 'yes'], red: ['no', 'no', 'yes'], purple: ['no', 'no', 'no'] },
  north: { red: ['yes'], green: ['no', 'yes'], blue: ['no', 'no', 'yes'], purple: ['no', 'no', 'no'] }
};
function markers(a) {
  return [...a.get('#mapViews').innerHTML.matchAll(/<span class="([^"]*)" data-candidate-id="([^"]+)"[^>]*>([^<]+)<\/span>/g)]
    .map(m => ({ classes: m[1], id: m[2], shape: m[3], html: m[0] }));
}

module.exports = { app, markers, routes };
