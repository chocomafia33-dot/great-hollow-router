const test = require('node:test');
const assert = require('node:assert/strict');
const {app, markers, routes} = require('./helpers/app.cjs');
function result() {
  const a=app();a.starts[0].onclick();a.answer('yes');return a;
}
function zoomAndPan(a) {
  a.get('#zoomMap').onclick();
  a.get('#mapViews').parentElement.scrollTop=240;
  a.get('#mapViews').parentElement.scrollLeft=120;
}
for(const [from,to] of [[0,1],[1,0]]) test(`zoomed ${from} -> full ${to}`,()=>{
  const a=result();if(from)a.zones[from].onclick();zoomAndPan(a);a.zones[to].onclick();
  assert.equal(a.state().zone,to?'bottom':'top');
  assert(!a.get('#mapViews').classList.contains('zoomed'));
});
test('unzoomed floor switches retain full view and active tab',()=>{
  const a=result();for(const to of [1,0]) {
    a.zones[to].onclick();assert(!a.get('#mapViews').classList.contains('zoomed'));
    assert.equal(a.zones[to].attributes['aria-pressed'],'true');
    assert.equal(a.zones[1-to].attributes['aria-pressed'],'false');
  }
});
test('same floor tap leaves state, map, zoom, label and pan unchanged',()=>{
  const a=result();for(const to of [0,1]) {
    if(to)a.zones[to].onclick();zoomAndPan(a);
    const before=JSON.stringify(a.state()), map=a.get('#mapViews').innerHTML;
    a.zones[to].onclick();assert.equal(JSON.stringify(a.state()),before);
    assert.equal(a.get('#mapViews').innerHTML,map);assert(a.get('#mapViews').classList.contains('zoomed'));
    assert.equal(a.get('#zoomMap').textContent,'戻す');
    assert.equal(a.get('#mapViews').parentElement.scrollTop,240);assert.equal(a.get('#mapViews').parentElement.scrollLeft,120);
  }
});
test('switch resets zoom label and zoom remains usable',()=>{
  const a=result();for(const to of [1,0]) {
    zoomAndPan(a);a.zones[to].onclick();assert.equal(a.get('#zoomMap').textContent,'拡大');
  }
  a.get('#zoomMap').onclick();assert(a.get('#mapViews').classList.contains('zoomed'));assert.equal(a.get('#zoomMap').textContent,'戻す');
});
test('switch resets vertical and horizontal pan in both directions',()=>{
  const a=result();for(const to of [1,0]) {
    zoomAndPan(a);a.zones[to].onclick();
    assert.equal(a.get('#mapViews').parentElement.scrollTop,0);assert.equal(a.get('#mapViews').parentElement.scrollLeft,0);
  }
});
test('markers retain exact markup and coordinates across switches for all routes, union and mismatch',()=>{
  for(const start of Object.keys(routes))for(const answers of [...Object.values(routes[start]),['unknown','unknown','unknown']])for(const mismatch of [false,true]) {
    const a=app();a.starts.find(b=>b.dataset.start===start).onclick();answers.forEach(a.answer);
    if(mismatch)a.get('#reportMismatch').onclick();
    const beforeState=JSON.stringify(a.state());const top=markers(a);
    a.zones[1].onclick();const bottom=markers(a);
    zoomAndPan(a);a.zones[0].onclick();assert.deepEqual(markers(a),top);assert.equal(JSON.stringify(a.state()),beforeState);
    zoomAndPan(a);a.zones[1].onclick();assert.deepEqual(markers(a),bottom);
    for(const m of markers(a)) {
      const p=a.points.find(p=>p.id===m.id);assert.equal(p.zone,'bottom');assert(m.html.includes(`left:${p.x}%;top:${p.y}%`));
    }
  }
});
