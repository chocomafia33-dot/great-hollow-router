const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const {app,markers,routes} = require('./helpers/app.cjs');
const {groups,ids,colors,sorted,union,floor} = require('./helpers/fixtures.cjs');
const evaluate = (a,code) => vm.runInContext(code,a.context);
function replay(start,answers=[]) {
  const a=app(); a.starts.find(b=>b.dataset.start===start).onclick();
  for(const answer of answers) {
    assert(a.state().currentNode, `${start}/${answers}: ended before ${answer}`);
    a.answer(answer);
  }
  return a;
}
function check(a) {
  const s=a.state(), h=Array.from(s.history);
  assert(h.length<=3,'answer budget exceeded');
  assert.equal(new Set(h.map(x=>x.pointId)).size,h.length,'repeated question');
  if(s.cautious) {
    const expected=Object.keys(groups).filter(seed=>h.filter(x=>x.answer==='no').every(x=>!groups[seed].includes(x.pointId)));
    assert.deepEqual(sorted(s.seeds),sorted(expected),'absence-only candidate reevaluation');
  }
  if(s.currentNode) {
    const p=evaluate(a,'questionPoint(state.currentNode)');
    assert(!h.some(x=>x.pointId===p.id),'used location requested again');
    assert(a.get('#detectMapViews').innerHTML.includes(`cx="${p.x*10}" cy="${p.y*10}"`),'question map highlight');
    return;
  }
  const candidateIds=union(Array.from(s.seeds));
  assert.deepEqual(sorted(s.candidates.map(p=>p.id)),sorted(candidateIds),'union membership');
  for(const zone of ['top','bottom']) {
    a.zones.find(b=>b.dataset.zone===zone).onclick();
    const visible=markers(a);
    const expected=(s.mismatch||s.fallback?ids:candidateIds).filter(id=>floor(id)===zone);
    assert.deepEqual(sorted(visible.map(p=>p.id)),sorted(expected),`${zone} marker IDs`);
    assert.equal(new Set(visible.map(p=>p.id)).size,visible.length,'duplicate marker');
    for(const m of visible) {
      const extra=s.mismatch&&!s.fallback&&!candidateIds.includes(m.id);
      assert.equal(m.shape,extra?'○':'◆',`${m.id} shape`);
      assert.equal(m.classes.includes('extraCandidate'),extra,`${m.id} class`);
      const color=extra?'#d5d9df':s.seed?colors[s.seed]:'#e5e2d8';
      assert(m.html.includes(`--marker-color:${color}`),`${m.id} individual color`);
      const p=a.points.find(p=>p.id===m.id);
      assert(m.html.includes(`left:${p.x}%;top:${p.y}%`),`${m.id} coordinates`);
    }
    assert.equal(a.get(zone==='top'?'#showTop':'#showBottom').attributes['aria-pressed'],'true');
  }
  if(s.seeds.length>1) {
    assert.equal(s.seed,null);assert.match(a.get('#seed').textContent,/未確定/);
    if(!s.mismatch) assert.match(a.get('#status').textContent,/存在は未確認/);
  }
  if(s.fallback) {
    assert.equal(s.seed,null);assert.match(a.get('#seed').textContent,/配置未確定/);
    assert.match(a.get('#status').textContent,/一致しません/);
  }
}
test('registered data: 21 unique points, 15 surface / 6 underground, four groups of eight',()=>{
  const a=app();assert.deepEqual(sorted(a.points.map(p=>p.id)),sorted(ids));
  for(const [seed,expected] of Object.entries(groups)) assert.deepEqual(sorted(a.groups[seed]),sorted(expected));
  for(const p of a.points) assert.equal(p.zone,floor(p.id),p.id);
  assert.equal(a.points.filter(p=>p.zone==='top').length,15);
  assert.equal(a.points.filter(p=>p.zone==='bottom').length,6);
});
for(const [start,seeds] of Object.entries(routes)) for(const [seed,answers] of Object.entries(seeds)) {
  test(`normal ${start}/${seed}: ${answers.length+1} total taps`,()=>{
    const a=replay(start,answers);assert.equal(a.state().seed,seed);
    assert.equal(a.state().currentNode,null);assert.equal(a.state().history.length,answers.length);
    assert(answers.length+1>=2&&answers.length+1<=4);assert.equal(a.state().cautious,false);
    assert.equal(a.get('#seed').textContent,seed.toUpperCase()+' 候補');check(a);
    a.get('#otherMenu').open=true;a.get('#reportMismatch').onclick();
    assert.equal(a.get('#otherMenu').open,false);check(a);
    assert.match(a.get('#status').textContent,/存在するとは限りません/);
    a.get('#otherMenu').open=true;assert.equal(a.get('#otherMenu').open,true);
  });
}
// Exhaust all public answer branches; each terminal path is a separately named test.
function paths(start,answers=[]) {
  const a=replay(start,answers);
  if(!a.state().currentNode) return [answers];
  assert(answers.length<3,`${start}/${answers}: question after third answer`);
  return ['yes','no','unknown'].flatMap(answer=>paths(start,[...answers,answer]));
}
for(const start of Object.keys(routes)) for(const answers of paths(start)) {
  test(`answer path ${start}/${answers.join('/')}`,()=>{
    const a=replay(start);check(a);
    for(const answer of answers) {a.answer(answer);check(a);}
    assert.equal(a.state().currentNode,null);
    const before=JSON.stringify(a.state());a.answer('yes');a.answer('unknown');
    assert.equal(JSON.stringify(a.state()),before,'late answers must be ignored');
  });
}
for(let mask=1;mask<16;mask++) {
  const seeds=Object.keys(groups).filter((_,i)=>mask&(1<<i));
  test(`union ${seeds.join('+')}: neutral/single color, deduplication and full map`,()=>{
    const a=replay('south');evaluate(a,`showCandidates(${JSON.stringify(seeds)})`);check(a);
    a.get('#otherMenu').open=true;a.get('#reportMismatch').onclick();
    assert.equal(a.get('#otherMenu').open,false);check(a);
  });
}
for(const start of Object.keys(routes)) for(const seed of Object.keys(groups)) for(let mask=0;mask<8;mask++) {
  test(`truthful layout ${start}/${seed}, unknown mask ${mask}`,()=>{
    const a=replay(start);let i=0;
    while(a.state().currentNode) {
      assert(i<3,'more than three answers');const p=evaluate(a,'questionPoint(state.currentNode)');
      a.answer(mask&(1<<i)?'unknown':groups[seed].includes(p.id)?'yes':'no');i++;check(a);
    }
    assert(a.state().seeds.includes(seed),'true layout discarded');
  });
}
for(const start of Object.keys(routes)) for(const seed of Object.keys(groups)) for(const extra of ids.filter(id=>!groups[seed].includes(id))) {
  test(`single extra after unknown ${start}/${seed}/${extra}`,()=>{
    const a=replay(start,['unknown']);
    while(a.state().currentNode) {
      const p=evaluate(a,'questionPoint(state.currentNode)');
      a.answer(groups[seed].includes(p.id)||p.id===extra?'yes':'no');check(a);
    }
    assert(a.state().seeds.includes(seed),'extra crystal discarded true layout');
  });
}
test('unknown reevaluates earlier positive; positive and unknown eliminate nothing',()=>{
  const a=replay('south',['no','yes','unknown']);assert.deepEqual(sorted(a.state().seeds),['blue','green','red']);check(a);
  const b=replay('south',['unknown','yes','yes']);assert.equal(b.state().seeds.length,4);check(b);
});
test('no alternative question: immediate union without repeat (injected branch)',()=>{
  const a=replay('south');evaluate(a,'alternativePoint=()=>undefined');a.answer('unknown');
  assert.equal(a.state().history.length,1);assert.equal(a.state().currentNode,null);assert.equal(a.state().candidates.length,21);check(a);
});
test('contradictory absent history: fallback to all 21 neutral diamonds (injected branch)',()=>{
  const a=replay('south');evaluate(a,'state.history=[{pointId:"g1-1",answer:"no"},{pointId:"g2-4",answer:"no"}]');
  a.answer('unknown');assert.equal(a.state().seeds.length,0);assert.equal(a.state().fallback,true);check(a);
});
test('invalid answers do not alter history or current question',()=>{
  const a=replay('south');const before=JSON.stringify(a.state());a.answer('invalid');assert.equal(JSON.stringify(a.state()),before);
});
test('detection and result zoom toggle; floor switching resets pan and retains zoom',()=>{
  const a=replay('south');a.get('#zoomDetectMap').onclick();assert(a.get('#detectMapViews').classList.contains('zoomed'));
  assert.equal(a.get('#zoomDetectMap').textContent,'戻す');a.get('#zoomDetectMap').onclick();assert(!a.get('#detectMapViews').classList.contains('zoomed'));
  a.answer('yes');a.get('#zoomMap').onclick();assert(a.get('#mapViews').classList.contains('zoomed'));
  a.get('#mapViews').parentElement.scrollTop=300;a.get('#mapViews').parentElement.scrollLeft=100;
  a.zones[1].onclick();assert.equal(a.get('#mapViews').parentElement.scrollTop,0);assert.equal(a.get('#mapViews').parentElement.scrollLeft,0);
  assert(a.get('#mapViews').classList.contains('zoomed'));a.get('#zoomMap').onclick();assert(!a.get('#mapViews').classList.contains('zoomed'));
});
for(const selector of ['#redetect','#changeStart']) test(`${selector}: clears all result, answer, floor, mismatch and zoom state`,()=>{
  const a=replay('south',['unknown','unknown','unknown']);a.get('#reportMismatch').onclick();a.zones[1].onclick();
  a.get('#zoomMap').onclick();a.get('#otherMenu').open=true;a.get(selector).onclick();
  const s=a.state();assert.equal(s.start,null);assert.equal(s.seed,null);assert.equal(s.currentNode,null);
  for(const key of ['seeds','candidates','history']) assert.equal(s[key].length,0,key);
  for(const key of ['cautious','fallback','mismatch']) assert.equal(s[key],false,key);
  assert.equal(s.zone,'top');assert.equal(a.get('#otherMenu').open,false);
  assert(a.get('#reportMismatch').disabled);assert(!a.get('#mapViews').classList.contains('zoomed'));
  assert(!a.get('#step1').classList.contains('hidden'));assert(a.get('#result').classList.contains('hidden'));
  a.starts[0].onclick();a.answer('yes');assert.equal(a.state().seed,'purple');check(a);
});
test('diagnostic output reflects current remaining candidates and displayed floor',async()=>{
  const a=replay('south',['unknown','unknown','unknown']);a.zones[1].onclick();await a.get('#copyDiagnostic').onclick();
  const d=JSON.parse(a.clipboard());assert.equal(d.answers.length,3);assert.equal(d.remainingSeeds.length,4);
  assert.equal(d.candidateIds.length,21);assert.equal(d.displayedCandidateIds.length,6);assert.equal(d.zone,'bottom');
});
