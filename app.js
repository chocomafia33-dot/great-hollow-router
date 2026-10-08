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
  checks:"カイデン：廃墟内→廃墟の下→中央の見晴らしの順。最初の2地点がなければ、廃墟の先・北塔下の結晶を経由し、霊脈で中央の見晴らしを確認します。見える位置まで移動して確認してください。未確認・味方が破壊済みの場合は「ない」で判定しないでください。",
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
const routeVideos={
 south:{red:"W6m01kvV46E",blue:"_dkyk3RStr4",green:"eLTu0nYEzuI",purple:"kwfA5vjK46s"},
 kaiden:{red:"NzcYpxCDdio",blue:"tzfN1NTmEJM",green:"y3Xk85p9n3Y",purple:"tE7UN9yONbk"},
 north:{red:"7nGSpGAcBD4",blue:"6rVA0JYXS2I",green:"Ct0LhToSzjY",purple:"31EuBaCaD4g"}
};

let state={start:null,seed:null,route:[],done:new Set()};

const $=s=>document.querySelector(s);
document.querySelectorAll("[data-start]").forEach(b=>b.onclick=()=>{
 clearResult();
 state.start=b.dataset.start;
 document.querySelectorAll("[data-start]").forEach(x=>x.classList.remove("active")); b.classList.add("active");
 showDetect();
});
function clearResult(){
 state.seed=null;state.route=[];state.done=new Set();
 $("#result").classList.add("hidden");
}
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
 state.seed=seed; state.route=[...routeData[state.start].routes[seed]];
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
 const video=routeVideos[state.start]?.[state.seed];
 $("#routeVideo").href=video?`https://www.youtube.com/watch?v=${video}`:"https://docs.google.com/spreadsheets/d/1TKQzHILCI2jmb5qP7H0ke_ov2Z4Qw_Dj4n59nDWSHSE/edit";
 $("#routeVideo").textContent=`${state.seed.toUpperCase()}の回収ルート動画を開く`;
 $("#mapNote").textContent="参考地図の結晶位置とルート動画を照合してください。地図側の選択は、このアプリの回収状態には連動しません。動画の全経路・現行ゲームでの一致は未検証です。";
}
$("#reset").onclick=()=>location.reload();

$("#copyDiagnostic").onclick=async()=>{
 const data={version:"location-reference-20261008",start:state.start,question:state.currentNode?.q,seed:state.seed,route:state.route,done:[...state.done],locationVerification:"source-text-only; map/video-reference; not-in-game-verified"};
 const report=JSON.stringify(data,null,2);
 $("#diagnosticText").value=report;$("#diagnosticText").classList.remove("hidden");
 try{await navigator.clipboard.writeText(report);$("#diagnosticMessage").textContent="診断情報をコピーしました。問題の説明と一緒に貼り付けてください。";}
 catch{$("#diagnosticMessage").textContent="下の診断情報を選択してコピーしてください。";}
};



