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
  checks:"南スタート：開始地点→西側→アリ道の順。ルート表ではRed/Blue/Green/Purpleをこの3チェックで分岐。",
 },
 kaiden:{
  detect:[
   {q:"飛行中／見晴らしの結晶は？",yes:"red",no:"ruins"},
   {q:"毒/血の廃墟側の結晶は？",yes:"blue",no:"green"},
   {q:"中央側の緑チェック結晶は？",yes:"green",no:"purple"}
  ],
  routes:{
   red:["カイデン周辺","北塔下","中央見晴らし","中央","南・カイデン間"],
   blue:["カイデン後","毒/血の廃墟","アリ道","南・カイデン間","北東の木の端"],
   green:["カイデン後・下側","毒/血の廃墟下","中央","中央橋","最終橋の南"],
   purple:["北塔下","中央橋","アリ道","木の下"]
  },
  checks:"北東カイデン：飛行中の見晴らし→廃墟側→中央側の順。飛行中に見える位置は描画距離等で確認しにくい場合があります。",
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
  checks:"北・教会：開始地点→滝側→地下アルコーブ。これは指定された判定順とプレイヤー検証ルート表の記載に対応。",
 }
};

const colors={RED:"#c86c6c",BLUE:"#6fa5db",GREEN:"#82b97b",PURPLE:"#a98bc9"};
const pos={
 "南・カイデン間":[210,600],"中央":[500,410],"中央見晴らし":[565,300],"北塔下":[720,150],
 "アリ道":[380,540],"北城・木の右":[790,230],"毒/血の廃墟下":[300,350],"中央橋":[470,360],
 "最終橋の南":[610,500],"南スタート":[180,620],"南側の木の下":[350,620],"北東の木の端":[820,120],
 "カイデン周辺":[800,120],"カイデン後":[760,210],"毒/血の廃墟":[330,300],"北塔下":[720,150],
 "木の下":[600,600],"開始地点":[820,110],"地下教会への途中":[730,420],"開始地点南側":[760,250],
 "北城へ向かう橋の先":[780,330],"地下アルコーブ":[670,540],"地下北西":[270,540]
};

let state={start:null,role:null,seed:null,route:[],done:new Set(),timer:0,interval:null};

const $=s=>document.querySelector(s);
document.querySelectorAll("[data-start]").forEach(b=>b.onclick=()=>{
 state.start=b.dataset.start; state.role="crystal";
 document.querySelectorAll("[data-start]").forEach(x=>x.classList.remove("active")); b.classList.add("active");
 $("#rolePanel").classList.remove("hidden"); showDetect();
});
document.querySelectorAll("[data-role]").forEach(b=>b.onclick=()=>{
 state.role=b.dataset.role; document.querySelectorAll("[data-role]").forEach(x=>x.classList.remove("active"));b.classList.add("active");
});
function showDetect(){
 $("#detect").classList.remove("hidden");
 const first=routeData[state.start].detect[0]; renderQuestion(first);
}
function renderQuestion(node){
 $("#question").innerHTML=`<div class="question">${node.q}</div>`;
 $("#answers").innerHTML=`<button onclick="answer('yes')">ある</button><button onclick="answer('no')">ない</button>`;
 $("#detectNote").textContent=routeData[state.start].checks;
 state.currentNode=node;
}
window.answer=function(ans){
 const target=state.currentNode[ans];
 const seed=["red","blue","green","purple"].includes(target)?target:null;
 if(seed){setSeed(seed);return;}
 const idx=routeData[state.start].detect.findIndex(x=>x===state.currentNode);
 const next=routeData[state.start].detect[idx+1];
 if(next) renderQuestion(next);
};
function setSeed(seed){
 state.seed=seed; state.route=[...routeData[state.start].routes[seed]].slice(0,4);
 state.done=new Set();
 $("#result").classList.remove("hidden"); $("#seed").textContent=seed.toUpperCase(); $("#seed").style.color=colors[seed.toUpperCase()];
 $("#status").textContent=`確認済みルート表ベース。3人マルチでは4個が必要。チームが途中の結晶を取った場合は、その地点を「回収済み」にしてください。`;
 render();
}
function render(){
 const remaining=state.route.filter((_,i)=>!state.done.has(i)).length;
 $("#remaining").textContent=remaining;
 const nextIdx=state.route.findIndex((_,i)=>!state.done.has(i));
 if(nextIdx<0){$("#next").textContent="4個回収完了";$("#nextMeta").textContent="中央の大結晶へ。";}else{
  $("#next").textContent=`${nextIdx+1}　${state.route[nextIdx]}`;
  $("#nextMeta").textContent=state.role==="growth"?"育成担当：結晶ルートは参考。味方の結晶進捗を確認してください。":"最優先目的地";
 }
 $("#route").innerHTML=state.route.map((name,i)=>`
 <div class="routeItem ${state.done.has(i)?"done":""}">
  <div class="routeNum">CRYSTAL ${i+1}</div><div class="routeName">${name}</div>
  <div class="routeBtns"><button onclick="toggleDone(${i})">${state.done.has(i)?"未回収に戻す":"回収済み"}</button></div>
 </div>`).join("");
 drawMap();
 const advice=state.role==="crystal"?"結晶担当：NEXTを優先。味方が取ったら即座に「回収済み」。":
 state.role==="growth"?"育成担当：教会・拠点・強敵は固定配置/検証情報が不足するため、現版では結晶以外の具体座標を自動指定しません。":"フレックス：結晶NEXTを基準にしつつ、味方の育成状況に応じて離脱してください。";
 $("#roleAdvice").textContent=advice;
}
window.toggleDone=function(i){state.done.has(i)?state.done.delete(i):state.done.add(i);render();};
function drawMap(){
 const svg=$("#map"); svg.innerHTML="";
 const NS="http://www.w3.org/2000/svg";
 const el=(tag,attrs)=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));svg.appendChild(e);return e};
 // schematic terrain
 el("path",{d:"M90 150 Q260 50 430 120 T760 80 Q900 170 840 330 T900 620 Q700 720 500 650 T150 690 Q60 520 110 360Z",fill:"#171b1d",stroke:"#3b4145","stroke-width":"4"});
 el("path",{d:"M160 470 Q350 390 500 430 T820 330",fill:"none",stroke:"#31373a","stroke-width":"28","stroke-linecap":"round"});
 el("path",{d:"M300 150 Q450 260 520 360 T700 600",fill:"none",stroke:"#292f31","stroke-width":"22","stroke-linecap":"round"});
 // fixed markers, deliberately schematic
 [["教会",[150,180]],["拠点",[500,650]],["地下入口",[650,540]],["霊脈",[440,250]]].forEach(([n,p])=>{
  el("circle",{cx:p[0],cy:p[1],r:14,fill:"#62686c",stroke:"#b1b5b5","stroke-width":"2"});
  const t=el("text",{x:p[0]+18,y:p[1]+4,fill:"#aeb2b5","font-size":"15"});t.textContent=n;
 });
 const pts=state.route.map((n,i)=>({name:n,p:pos[n]||[500,380],i}));
 for(let i=0;i<pts.length-1;i++)el("line",{x1:pts[i].p[0],y1:pts[i].p[1],x2:pts[i+1].p[0],y2:pts[i+1].p[1],stroke:colors[state.seed.toUpperCase()], "stroke-width":"8","stroke-linecap":"round","opacity":".8"});
 pts.forEach(o=>{
  const done=state.done.has(o.i), next=state.route.findIndex((_,i)=>!state.done.has(i))===o.i;
  el("circle",{cx:o.p[0],cy:o.p[1],r:next?27:22,fill:done?"#383c40":colors[state.seed.toUpperCase()],stroke:next?"#fff":"#111","stroke-width":next?4:3,opacity:done?".35":"1"});
  const t=el("text",{x:o.p[0],y:o.p[1]+6,fill:"#08090b","font-size":"17","font-weight":"900","text-anchor":"middle"});t.textContent=o.i+1;
  const lab=el("text",{x:o.p[0]+30,y:o.p[1]-18,fill:done?"#777":"#ddd","font-size":"14","font-weight":"700"});lab.textContent=o.name;
 });
}
document.querySelectorAll("[data-time]").forEach(b=>b.onclick=()=>{state.timer=+b.dataset.time;updateTimer();});
$("#timerStart").onclick=()=>{
 if(state.interval){clearInterval(state.interval);state.interval=null;$("#timerStart").textContent="タイマー";return;}
 if(!state.timer)state.timer=600; $("#timerStart").textContent="停止";
 state.interval=setInterval(()=>{state.timer--;updateTimer();if(state.timer<=0){clearInterval(state.interval);state.interval=null;$("#timerStart").textContent="タイマー";}},1000);
};
function updateTimer(){let m=Math.floor(state.timer/60),s=String(state.timer%60).padStart(2,"0");$("#timer").textContent=state.timer?`${m}:${s}`:"—";}
$("#reset").onclick=()=>location.reload();
