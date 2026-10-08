const routeData = {
 south:{
  detect:[
   {q:"南の結晶は？", yes:"purple", no:"west"},
   {q:"西側の結晶は？", yes:"ant", no:"green"},
   {q:"アリ道の結晶は？", yes:"blue", no:"red"}
  ],
 },
 kaiden:{
  detect:[
   {q:"毒／血の廃墟内に結晶は？",yes:"blue",no:"belowRuins"},
   {q:"毒／血の廃墟の下に結晶は？",yes:"green",no:"overlook"},
   {q:"中央の見晴らし地点に結晶は？",yes:"red",no:"purple"}
  ],
 },
 north:{
  detect:[
   {q:"開始地点の結晶は？",yes:"red",no:"waterfall"},
   {q:"滝側の結晶は？",yes:"green",no:"alcove"},
   {q:"地下アルコーブの結晶は？",yes:"blue",no:"purple"}
  ],
 }
};

const colors={RED:"#c86c6c",BLUE:"#6fa5db",GREEN:"#82b97b",PURPLE:"#a98bc9"};
// Image-relative percentages from the published crystal map. Route-name mapping is provisional.
const mapPoints={
 "南・カイデン間":{x:22.58,y:92.11,zone:"top"},
 "中央":{x:41.22,y:61.65,zone:"top"},
 "中央見晴らし":{x:30.29,y:41.22,zone:"top"},
 "北塔下":{x:10.93,y:48.57,zone:"top"},
 "アリ道":{x:50.54,y:76.88,zone:"top"},
 "北城・木の右":{x:41.94,y:20.07,zone:"top"},
 "毒/血の廃墟":{x:17.03,y:67.92,zone:"top"},
 "毒/血の廃墟下":{x:4.66,y:68.1,zone:"top"},
 "中央橋":{x:37.28,y:48.03,zone:"top"},
 "最終橋の南":{x:82.97,y:86.38,zone:"bottom"},
 "南スタート":{x:40.86,y:95.88,zone:"top"},
 "南側の木の下":{x:35.3,y:70.43,zone:"top"},
 "南の木の下":{x:35.3,y:70.43,zone:"top"},
 "木の下":{x:35.3,y:70.43,zone:"top"},
 "北東の木の端":{x:74.19,y:44.27,zone:"top"},
 "開始地点":{x:82.8,y:19.89,zone:"top"},
 "地下教会への途中":{x:74.37,y:24.37,zone:"bottom"},
 "開始地点南側":{x:87.28,y:43.37,zone:"top"},
 "北城へ向かう橋の先":{x:54.3,y:38.35,zone:"top"},
 "地下アルコーブ":{x:64.16,y:51.97,zone:"bottom"},
 "地下北西":{x:44.27,y:65.77,zone:"bottom"}
};
const detectionPoints={
 south:["南スタート","南・カイデン間","アリ道"],
 kaiden:["毒/血の廃墟","毒/血の廃墟下","中央見晴らし"],
 north:["開始地点","開始地点南側","地下アルコーブ"]
};
// Candidate coordinates and distribution membership transcribed from Nightreign Hub.
// Source checked 2026-10-09. Group 1=blue, 2=purple, 3=red, 4=green.
// Coordinates are image-relative; existing landmark names remain provisional.
// These historical distributions do not guarantee current in-game spawns.
const candidatePoints = [
 {
  "id": "g1-1",
  "x": 22.58,
  "y": 92.11,
  "zone": "top",
  "name": "南・カイデン間"
 },
 {
  "id": "g1-2",
  "x": 17.03,
  "y": 67.92,
  "zone": "top",
  "name": "毒/血の廃墟"
 },
 {
  "id": "g1-3",
  "x": 35.3,
  "y": 70.43,
  "zone": "top",
  "name": "南側の木の下"
 },
 {
  "id": "g1-4",
  "x": 30.29,
  "y": 41.22,
  "zone": "top",
  "name": "中央見晴らし"
 },
 {
  "id": "g1-5",
  "x": 41.94,
  "y": 20.07,
  "zone": "top",
  "name": "北城・木の右"
 },
 {
  "id": "g1-6",
  "x": 74.19,
  "y": 44.27,
  "zone": "top",
  "name": "北東の木の端"
 },
 {
  "id": "g1-7",
  "x": 64.16,
  "y": 51.97,
  "zone": "bottom",
  "name": "地下アルコーブ"
 },
 {
  "id": "g1-8",
  "x": 44.27,
  "y": 65.77,
  "zone": "bottom",
  "name": "地下北西"
 },
 {
  "id": "g2-1",
  "x": 40.86,
  "y": 95.88,
  "zone": "top",
  "name": "南スタート"
 },
 {
  "id": "g2-2",
  "x": 50.54,
  "y": 76.88,
  "zone": "top",
  "name": "アリ道"
 },
 {
  "id": "g2-3",
  "x": 10.93,
  "y": 48.57,
  "zone": "top",
  "name": "北塔下"
 },
 {
  "id": "g2-4",
  "x": 37.28,
  "y": 48.03,
  "zone": "top",
  "name": "中央橋"
 },
 {
  "id": "g2-5",
  "x": 91.04,
  "y": 48.75,
  "zone": "bottom",
  "name": "地下候補（東側）"
 },
 {
  "id": "g3-1",
  "x": 41.22,
  "y": 61.65,
  "zone": "top",
  "name": "中央"
 },
 {
  "id": "g3-2",
  "x": 82.8,
  "y": 19.89,
  "zone": "top",
  "name": "教会の開始地点"
 },
 {
  "id": "g3-3",
  "x": 47.31,
  "y": 83.15,
  "zone": "bottom",
  "name": "地下候補（南西側）"
 },
 {
  "id": "g3-4",
  "x": 82.97,
  "y": 86.38,
  "zone": "bottom",
  "name": "最終橋の南"
 },
 {
  "id": "g3-5",
  "x": 74.37,
  "y": 24.37,
  "zone": "bottom",
  "name": "地下教会への途中"
 },
 {
  "id": "g4-1",
  "x": 4.66,
  "y": 68.1,
  "zone": "top",
  "name": "毒/血の廃墟下"
 },
 {
  "id": "g4-2",
  "x": 54.3,
  "y": 38.35,
  "zone": "top",
  "name": "北城へ向かう橋の先"
 },
 {
  "id": "g4-3",
  "x": 87.28,
  "y": 43.37,
  "zone": "top",
  "name": "教会の開始地点南側"
 }
];
const candidateGroups = {
 "blue": [
  "g1-1",
  "g1-2",
  "g1-3",
  "g1-4",
  "g1-5",
  "g1-6",
  "g1-7",
  "g1-8"
 ],
 "purple": [
  "g1-3",
  "g2-1",
  "g2-2",
  "g2-3",
  "g2-4",
  "g1-6",
  "g1-8",
  "g2-5"
 ],
 "red": [
  "g1-1",
  "g2-3",
  "g3-1",
  "g1-4",
  "g3-2",
  "g3-3",
  "g3-4",
  "g3-5"
 ],
 "green": [
  "g4-1",
  "g3-1",
  "g2-4",
  "g4-2",
  "g4-3",
  "g2-5",
  "g3-4",
  "g3-3"
 ]
};
// Only direct start/near-start entries supported by the supplied route table.
// Highlight means a source suggestion, not verified travel ease or a fixed order.
const startHints={south:{purple:["g2-1"]},kaiden:{blue:["g1-2"],green:["g4-1"]},north:{red:["g3-2"],green:["g4-3"]}};
function hasStartHint(id){return (startHints[state.start]?.[state.seed]||[]).includes(id);}
let state={start:null,seed:null,candidates:[],done:new Set(),extra:0,mismatch:false};

const $=s=>document.querySelector(s);
document.querySelectorAll("[data-start]").forEach(b=>b.onclick=()=>{
 clearResult();
 state.start=b.dataset.start;
 document.querySelectorAll("[data-start]").forEach(x=>x.classList.remove("active")); b.classList.add("active");
 showDetect();
});
function clearResult(){
 state.seed=null;state.candidates=[];state.done=new Set();state.extra=0;state.mismatch=false;
 $("#result").classList.add("hidden");
}
function showDetect(){
 $("#detect").classList.remove("hidden");
 const first=routeData[state.start].detect[0]; renderQuestion(first);
}
function renderQuestion(node){
 $("#question").innerHTML=`<div class="question">${node.q}</div>`;
 $("#answers").innerHTML=`<button onclick="answer('yes')">ある</button><button onclick="answer('no')">ない</button><button onclick="answer('unknown')">未確認</button>`;
 $("#detectNote").textContent="";
 state.currentNode=node;
 drawDetectionMap(node);
}
function drawDetectionMap(node){
 const index=routeData[state.start].detect.indexOf(node);
 const name=detectionPoints[state.start][index];
 const p=mapPoints[name],x=p.x*10,y=p.y*10;
 $("#detectMapViews").innerHTML=`<section class="mapLayer"><div class="mapTitle">${p.zone==="top"?"地上":"地下"} · 確認する地点</div><svg viewBox="-30 -30 1060 1060" role="img" aria-label="${node.q}。丸で囲んだ地点を確認"><image href="map-${p.zone==="top"?"top":"bottom"}.webp" width="1000" height="1000"/><circle cx="${x}" cy="${y}" r="48" fill="#f8d77b" fill-opacity=".18" stroke="#08090b" stroke-width="15"/><circle cx="${x}" cy="${y}" r="48" fill="none" stroke="#f8d77b" stroke-width="8"/><path d="M${x-68} ${y}H${x-38} M${x+38} ${y}H${x+68} M${x} ${y-68}V${y-38} M${x} ${y+38}V${y+68}" stroke="#fff" stroke-width="5"/><circle cx="${x}" cy="${y}" r="8" fill="#fff"/><title>${name}</title></svg></section>`;
}
$("#zoomDetectMap").onclick=()=>{
 const zoomed=$("#detectMapViews").classList.contains("zoomed");
 $("#detectMapViews").classList.toggle("zoomed",!zoomed);
 $("#zoomDetectMap").textContent=zoomed?"地図を拡大":"拡大を戻す";
};
window.answer=function(ans){
 if(ans==="unknown"){$("#detectNote").textContent="判定を保留中";return;}
 if(!["yes","no"].includes(ans))return;
 const target=state.currentNode[ans];
 const seed=["red","blue","green","purple"].includes(target)?target:null;
 if(seed){setSeed(seed);return;}
 const idx=routeData[state.start].detect.findIndex(x=>x===state.currentNode);
 const next=routeData[state.start].detect[idx+1];
 if(next) renderQuestion(next);
};
function setSeed(seed){
 $("#detect").classList.add("hidden");
 state.seed=seed; state.candidates=candidateGroups[seed].map(id=>candidatePoints.find(p=>p.id===id));
 state.done=new Set();state.extra=0;state.mismatch=false;
 $("#result").classList.remove("hidden"); $("#seed").textContent=seed.toUpperCase()+" 候補"; $("#seed").style.color=colors[seed.toUpperCase()];
 $("#status").textContent="";
 render();
}
function render(){
 const count=state.done.size+state.extra;
 $("#remaining").textContent=Math.max(0,4-count);
 $("#next").textContent=state.mismatch?"配置判定を保留中":count>=4?"4個回収を記録済み":"資料上の結晶候補地点";
 $("#nextMeta").textContent=state.mismatch?"候補表示を保留しています。回収記録は保持しています。":count>=4?"実際の解放状況はゲーム内で確認してください。":"収縮や味方の動きを見て、回収順を決めてください。";
 $("#collectedCount").textContent=count;
 $("#extraCount").textContent=state.extra;
 $("#extraMinus").disabled=state.extra===0;
 $("#route").innerHTML=state.candidates.map(p=>`
 <div class="routeItem ${state.done.has(p.id)?"done":""}">
  <div class="routeNum">${p.zone==="top"?"地上":"地下"} · ${hasStartHint(p.id)&&!state.mismatch?"資料で開始付近の候補":"候補"}</div><div class="routeName">${p.name}</div>
  <div class="routeBtns"><button data-crystal="${p.id}" aria-pressed="${state.done.has(p.id)}">${state.done.has(p.id)?"未回収に戻す":"回収済みにする"}</button></div>
 </div>`).join("");
 drawMap();
}
function toggleDone(id){
 if(!state.candidates.some(p=>p.id===id))return;
 state.done.has(id)?state.done.delete(id):state.done.add(id);render();
}
$("#route").addEventListener("click",e=>{const b=e.target.closest("[data-crystal]");if(b)toggleDone(b.dataset.crystal);});
$("#mapViews").addEventListener("click",e=>{const b=e.target.closest("[data-crystal]");if(b)toggleDone(b.dataset.crystal);});
$("#extraPlus").onclick=()=>{state.extra++;render();};
$("#extraMinus").onclick=()=>{state.extra=Math.max(0,state.extra-1);render();};
function drawMap(){
 const tint=colors[state.seed.toUpperCase()];
 $("#mapViews").innerHTML=["top","bottom"].map(zone=>{
  const points=state.candidates.filter(p=>p.zone===zone);
  const marks=state.mismatch?"":points.map(p=>{
   const done=state.done.has(p.id);
   return `<button type="button" class="crystalMarker ${done?"collected":""} ${hasStartHint(p.id)?"startHint":""}" data-crystal="${p.id}" style="left:${p.x}%;top:${p.y}%;--marker-color:${tint}" aria-label="${p.name}（候補・位置は目安）：${done?"未回収に戻す":"回収済みにする"}" aria-pressed="${done}" title="${p.name}"><span aria-hidden="true">${done?"✓":"◆"}</span></button>`;
  }).join("");
  return `<section class="mapLayer"><div class="mapTitle">${zone==="top"?"地上":"地下"} · ${state.mismatch?"候補表示を保留":points.length+"候補"}</div><div class="candidateMap"><img src="map-${zone}.webp" alt="${zone==="top"?"地上":"地下"}の地図" draggable="false">${marks}</div></section>`;
 }).join("");
}
$("#zoomMap").onclick=()=>{
 const zoomed=$("#mapViews").classList.contains("zoomed");
 $("#mapViews").classList.toggle("zoomed",!zoomed);
 $("#zoomMap").textContent=zoomed?"地図を拡大":"拡大を戻す";
};
$("#reportMismatch").onclick=()=>{
 state.mismatch=true;
 $("#status").textContent="配置判定を保留中。開始地点を選び直すと再判定できます。";
 render();
};
$("#reset").onclick=()=>location.reload();

$("#copyDiagnostic").onclick=async()=>{
 const data={version:"candidate-map-20261009",start:state.start,question:state.currentNode?.q,seed:state.seed,candidateIds:state.candidates.map(p=>p.id),done:[...state.done],extraCollected:state.extra,totalCollected:state.done.size+state.extra,startHintIds:startHints[state.start]?.[state.seed]||[],source:"Nightreign Hub distributions + supplied route table; checked 2026-10-09",mismatch:state.mismatch,locationVerification:"source-map-relative; provisional-name-matching; not-in-game-verified"};
 const report=JSON.stringify(data,null,2);
 $("#diagnosticText").value=report;$("#diagnosticText").classList.remove("hidden");
 try{await navigator.clipboard.writeText(report);$("#diagnosticMessage").textContent="診断情報をコピーしました。問題の説明と一緒に貼り付けてください。";}
 catch{$("#diagnosticMessage").textContent="下の診断情報を選択してコピーしてください。";}
};



