const routeData = {
 south:{
  detect:[
   {q:"南の結晶は？", yes:"purple", no:"west"},
   {q:"西側の結晶は？", yes:"ant", no:"green"},
   {q:"アリ道の結晶は？", yes:"blue", no:"red"}
  ],
  routes:{
   red:["南・カイデン間","中央","中央見晴らし","北塔下"],
   blue:["南・カイデン間","アリ道","中央見晴らし","北城・木の右"],
   green:["毒/血の廃墟下","中央","中央橋","最終橋の南"],
   purple:["南スタート","アリ道","南側の木の下","北東の木の端"]
  },
 },
 kaiden:{
  detect:[
   {q:"毒／血の廃墟内に結晶は？",yes:"blue",no:"belowRuins"},
   {q:"毒／血の廃墟の下に結晶は？",yes:"green",no:"overlook"},
   {q:"中央の見晴らし地点に結晶は？",yes:"red",no:"purple"}
  ],
  routes:{
   red:["北塔下","中央見晴らし","中央","南・カイデン間"],
   blue:["毒/血の廃墟","アリ道","南・カイデン間","北東の木の端"],
   green:["毒/血の廃墟下","中央","中央橋","最終橋の南"],
   purple:["北塔下","中央橋","アリ道","木の下"]
  },
 },
 north:{
  detect:[
   {q:"開始地点の結晶は？",yes:"red",no:"waterfall"},
   {q:"滝側の結晶は？",yes:"green",no:"alcove"},
   {q:"地下アルコーブの結晶は？",yes:"blue",no:"purple"}
  ],
  routes:{
   red:["開始地点","地下教会への途中","中央","中央見晴らし"],
   green:["開始地点南側","北城へ向かう橋の先","中央橋","中央"],
   blue:["北東の木の端","地下アルコーブ","北城・木の右","中央見晴らし"],
   purple:["北東の木の端","地下北西","南の木の下","アリ道"]
  },
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
let state={start:null,seed:null,route:[],done:new Set(),mismatch:false};

const $=s=>document.querySelector(s);
document.querySelectorAll("[data-start]").forEach(b=>b.onclick=()=>{
 clearResult();
 state.start=b.dataset.start;
 document.querySelectorAll("[data-start]").forEach(x=>x.classList.remove("active")); b.classList.add("active");
 showDetect();
});
function clearResult(){
 state.seed=null;state.route=[];state.done=new Set();state.mismatch=false;
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
 state.seed=seed; state.route=[...routeData[state.start].routes[seed]];
 state.done=new Set();state.mismatch=false;
 $("#result").classList.remove("hidden"); $("#seed").textContent=seed.toUpperCase()+" 候補"; $("#seed").style.color=colors[seed.toUpperCase()];
 $("#status").textContent="";
 render();
}
function render(){
 const remaining=state.route.filter((_,i)=>!state.done.has(i)).length;
 $("#remaining").textContent=remaining;
 const nextIdx=state.route.findIndex((_,i)=>!state.done.has(i));
 if(state.mismatch){$("#next").textContent="案内を保留中";$("#nextMeta").textContent="回収記録は保持しています。";}else if(nextIdx<0){$("#next").textContent="4個回収完了";$("#nextMeta").textContent="中央の大結晶へ。";}else{
  $("#next").textContent=`${nextIdx+1}　${state.route[nextIdx]}`;
  $("#nextMeta").textContent="最優先目的地";
 }
 $("#route").innerHTML=state.route.map((name,i)=>`
 <div class="routeItem ${state.done.has(i)?"done":""}">
  <div class="routeNum">CRYSTAL ${i+1}</div><div class="routeName">${name}</div>
  <div class="routeBtns"><button onclick="toggleDone(${i})">${state.done.has(i)?"未回収に戻す":"回収済み"}</button></div>
 </div>`).join("");
 drawMap();
}
window.toggleDone=function(i){if(!Number.isInteger(i)||i<0||i>=state.route.length)return;state.done.has(i)?state.done.delete(i):state.done.add(i);render();};
function drawMap(){
 const points=state.route.map(name=>mapPoints[name]);
 const next=state.route.findIndex((_,i)=>!state.done.has(i));
 const tint=colors[state.seed.toUpperCase()];
 $("#mapViews").innerHTML=["top","bottom"].filter(zone=>points.some(p=>p.zone===zone)).map(zone=>{
  let lines="",marks="";
  points.forEach((p,i)=>{
   if(p.zone!==zone)return;
   const x=p.x*10,y=p.y*10;
   const previous=points[i-1];
   if(previous&&previous.zone===zone)lines+=`<path d="M${previous.x*10} ${previous.y*10} L${x} ${y}" fill="none" stroke="#fff" stroke-width="12" opacity=".8"/><path d="M${previous.x*10} ${previous.y*10} L${x} ${y}" fill="none" stroke="${tint}" stroke-width="7" stroke-dasharray="16 12" marker-end="url(#arrow-${zone})"/>`;
   const done=state.done.has(i),active=i===next&&!state.mismatch;
   marks+=`<g class="map-marker${done?" collected":""}" opacity="${done?.35:1}"><title>${i+1} ${state.route[i]}${done?" 回収済み":""}</title>${active?`<circle cx="${x}" cy="${y}" r="34" fill="none" stroke="#fff" stroke-width="6"/>`:""}<circle cx="${x}" cy="${y}" r="25" fill="${done?"#666":tint}" stroke="#08090b" stroke-width="5"/><text x="${x}" y="${y+1}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="31" font-weight="900">${i+1}</text>${done?`<text x="${x+28}" y="${y-27}" fill="#fff" font-size="27">✓</text>`:""}</g>`;
  });
  return `<section class="mapLayer"><div class="mapTitle">${zone==="top"?"地上":"地下"}</div><svg viewBox="0 0 1000 1000" role="img" aria-label="${zone==="top"?"地上":"地下"}の回収順。番号は下のルート一覧と対応"><defs><marker id="arrow-${zone}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="${tint}"/></marker></defs><image href="map-${zone==="top"?"top":"bottom"}.webp" width="1000" height="1000"/>${lines}${marks}</svg></section>`;
 }).join("");
}
$("#zoomMap").onclick=()=>{
 const zoomed=$("#mapViews").classList.contains("zoomed");
 $("#mapViews").classList.toggle("zoomed",!zoomed);
 $("#zoomMap").textContent=zoomed?"地図を拡大":"拡大を戻す";
};
$("#reportMismatch").onclick=()=>{
 state.mismatch=true;
 $("#status").textContent="案内を保留中。開始地点を選び直すと再判定できます。";
 render();
};
$("#reset").onclick=()=>location.reload();

$("#copyDiagnostic").onclick=async()=>{
 const data={version:"detection-map-20261008",start:state.start,question:state.currentNode?.q,seed:state.seed,route:state.route,done:[...state.done],mismatch:state.mismatch,locationVerification:"source-map-relative; provisional-name-matching; not-in-game-verified"};
 const report=JSON.stringify(data,null,2);
 $("#diagnosticText").value=report;$("#diagnosticText").classList.remove("hidden");
 try{await navigator.clipboard.writeText(report);$("#diagnosticMessage").textContent="診断情報をコピーしました。問題の説明と一緒に貼り付けてください。";}
 catch{$("#diagnosticMessage").textContent="下の診断情報を選択してコピーしてください。";}
};



