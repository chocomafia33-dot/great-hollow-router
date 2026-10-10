const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const {app} = require('./helpers/app.cjs');
function replay(start,path) {
  const a=app();a.starts.find(b=>b.dataset.start===start).onclick();path.forEach(a.answer);return a;
}
const questions=new Map();
function visit(start,path) {
  const a=replay(start,path);if(!a.state().currentNode)return;
  const p=vm.runInContext('questionPoint(state.currentNode)',a.context);
  if(!questions.has(p.id))questions.set(p.id,{start,path,point:{...p}});
  for(const answer of ['yes','no','unknown'])visit(start,[...path,answer]);
}
for(const start of ['south','kaiden','north'])visit(start,[]);
for(const [id,{start,path,point}] of questions)test(`question UI ${id}: layer hint and unchanged target geometry`,()=>{
  const a=replay(start,path),map=a.get('#detectMapViews').innerHTML;
  assert.equal(a.get('#detectMapHint').textContent,`${point.zone==='top'?'地上':'地下'} · 丸を確認 · 位置は目安`);
  assert(!map.includes('mapTitle'));assert(!map.includes('確認する地点'));
  assert(map.includes('viewBox="-30 -30 1060 1060"'));
  assert(map.includes(`href="map-${point.zone}.webp" width="1000" height="1000"`));
  assert(map.includes(`cx="${point.x*10}" cy="${point.y*10}" r="48" fill="#f8d77b" fill-opacity=".18" stroke="#08090b" stroke-width="15"`));
  assert(map.includes(`cx="${point.x*10}" cy="${point.y*10}" r="48" fill="none" stroke="#f8d77b" stroke-width="8"`));
  assert(map.includes(`cx="${point.x*10}" cy="${point.y*10}" r="8" fill="#fff"`));
  assert.equal(a.get('#answers').innerHTML,'<button onclick="answer(\'yes\')">ある</button><button onclick="answer(\'no\')">ない</button><button onclick="answer(\'unknown\')">未確認</button>');
});
for(const zone of ['top','bottom'])test(`question UI ${zone}: zoom toggles without changing SVG, hint or choices`,()=>{
  const q=[...questions.values()].find(q=>q.point.zone===zone);assert(q);
  const a=replay(q.start,q.path),map=a.get('#detectMapViews').innerHTML,hint=a.get('#detectMapHint').textContent,choices=a.get('#answers').innerHTML;
  for(const expected of [true,false]) {
    a.get('#zoomDetectMap').onclick();assert.equal(a.get('#detectMapViews').classList.contains('zoomed'),expected);
    assert.equal(a.get('#zoomDetectMap').textContent,expected?'戻す':'拡大');
    assert.equal(a.get('#detectMapViews').innerHTML,map);assert.equal(a.get('#detectMapHint').textContent,hint);assert.equal(a.get('#answers').innerHTML,choices);
  }
});
