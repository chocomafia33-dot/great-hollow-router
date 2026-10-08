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
  checks:"教会：降下中に開始地点の結晶を確認。なければ霊脈ジャンプ中に滝側を確認し、次にカメラを反転して地下の窪み（アルコーブ）を確認します。ルート表に記載された判定手順です。",
 }
};

const colors={RED:"#c86c6c",BLUE:"#6fa5db",GREEN:"#82b97b",PURPLE:"#a98bc9"};
const routeVideos={
 south:{red:"W6m01kvV46E",blue:"_dkyk3RStr4",green:"eLTu0nYEzuI",purple:"kwfA5vjK46s"},
 kaiden:{red:"NzcYpxCDdio",blue:"tzfN1NTmEJM",green:"y3Xk85p9n3Y",purple:"tE7UN9yONbk"},
 north:{red:"7nGSpGAcBD4",blue:"6rVA0JYXS2I",green:"Ct0LhToSzjY",purple:"31EuBaCaD4g"}
};

const movementNotes={
 south:{red:"ルート表の順に中央、中央見晴らし、北塔下へ進みます。",blue:"北城側の4個目は、木の右側にある地点です。",green:"ルート表では、南から霊脈を使って中央へ向かう移動を推奨しています。",purple:"南側の木の下を経由し、北東の木の端へ。味方が回収した地点だけ回収済みにしてください。"},
 kaiden:{red:"注意：中央（3個目）から南・カイデン間（4個目）への直行ジャンプは、ルート表で精密な操作が必要・落下しやすいとされています。未習得なら無理に跳ばず、動画で経路を確認してください。",blue:"ルート表には、南・カイデン間を味方が回収した時の代案として中央見晴らしも記載されています。味方の回収を確認できない時は省略しないでください。",green:"廃墟の下を確認し、霊脈で中央へ。ルート表では、味方の回収を当てにせず4個の回収を想定しています。",purple:"北塔下から霊脈へ戻り、中央見晴らしを確認。結晶がなければ中央の壊れた橋へ向かう手順です。"},
 north:{red:"ルート表の順に、地下教会へ向かう途中の結晶を回収して中央へ進みます。",green:"開始地点の南側から、北城へ向かう橋の先、中央橋、中央の順です。",blue:"地下の窪みを回収した後、北城の木の右側へ。ルート表では3個目の後に鳥を使えると記載されています。",purple:"地下の窪みに結晶がなければ、鳥で地下を通る移動をルート表は指定しています。地下北西、南の木の下、アリ道の順です。"}
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
 $("#detectNote").textContent=routeData[state.start].checks+" 見えていない・味方が破壊した可能性がある時は「未確認」を選択してください。";
 state.currentNode=node;
}
window.answer=function(ans){
 if(ans==="unknown"){$("#detectNote").textContent="判定を保留しています。見える位置まで移動して確認してください。味方が破壊済みの場合は、破壊前にあったかを確認してください。";return;}
 if(!["yes","no"].includes(ans))return;
 const target=state.currentNode[ans];
 const seed=["red","blue","green","purple"].includes(target)?target:null;
 if(seed){setSeed(seed);return;}
 const idx=routeData[state.start].detect.findIndex(x=>x===state.currentNode);
 const next=routeData[state.start].detect[idx+1];
 if(next) renderQuestion(next);
};
function setSeed(seed){
 state.seed=seed; state.route=[...routeData[state.start].routes[seed]];
 state.done=new Set();state.mismatch=false;
 $("#result").classList.remove("hidden"); $("#seed").textContent=seed.toUpperCase()+" 候補"; $("#seed").style.color=colors[seed.toUpperCase()];
 $("#status").textContent=`従来4色のルート表に基づく候補です。追加結晶や配置変更には対応しきれない場合があります。3人マルチでは4個が必要。チームが途中の結晶を取った場合は、その地点を「回収済み」にしてください。`;
 render();
}
function render(){
 const remaining=state.route.filter((_,i)=>!state.done.has(i)).length;
 $("#remaining").textContent=remaining;
 const nextIdx=state.route.findIndex((_,i)=>!state.done.has(i));
 if(state.mismatch){$("#next").textContent="案内を保留中";$("#nextMeta").textContent="未発見・味方の回収・配置変更を確認してください。";}else if(nextIdx<0){$("#next").textContent="4個回収完了";$("#nextMeta").textContent="中央の大結晶へ。";}else{
  $("#next").textContent=`${nextIdx+1}　${state.route[nextIdx]}`;
  $("#nextMeta").textContent="最優先目的地";
 }
 $("#route").innerHTML=state.route.map((name,i)=>`
 <div class="routeItem ${state.done.has(i)?"done":""}">
  <div class="routeNum">CRYSTAL ${i+1}</div><div class="routeName">${name}</div>
  <div class="routeBtns"><button onclick="toggleDone(${i})">${state.done.has(i)?"未回収に戻す":"回収済み"}</button></div>
 </div>`).join("");
 $("#movementNote").textContent=movementNotes[state.start][state.seed];
 drawMap();
}
window.toggleDone=function(i){if(!Number.isInteger(i)||i<0||i>=state.route.length)return;state.done.has(i)?state.done.delete(i):state.done.add(i);render();};
function drawMap(){
 const video=routeVideos[state.start]?.[state.seed];
 $("#routeVideo").href=video?`https://www.youtube.com/watch?v=${video}`:"https://docs.google.com/spreadsheets/d/1TKQzHILCI2jmb5qP7H0ke_ov2Z4Qw_Dj4n59nDWSHSE/edit";
 $("#routeVideo").textContent=`${state.seed.toUpperCase()}の回収ルート動画を開く`;
 $("#mapNote").textContent="参考地図の結晶位置とルート動画を照合してください。地図側の選択は、このアプリの回収状態には連動しません。動画の全経路・現行ゲームでの一致は未検証です。";
}
$("#reportMismatch").onclick=()=>{
 state.mismatch=true;
 $("#status").textContent="配置の不一致を記録しました。現在の回収数は保持しています。未発見・味方の回収・追加結晶・更新による変更などが考えられますが、原因は判別できません。参考地図で実際に見つけた結晶を優先し、再判定する時は開始地点を選び直してください。";
 render();
};
$("#reset").onclick=()=>location.reload();

$("#copyDiagnostic").onclick=async()=>{
 const data={version:"route-guidance-20261008",start:state.start,question:state.currentNode?.q,seed:state.seed,route:state.route,done:[...state.done],mismatch:state.mismatch,locationVerification:"source-text-only; map/video-reference; not-in-game-verified"};
 const report=JSON.stringify(data,null,2);
 $("#diagnosticText").value=report;$("#diagnosticText").classList.remove("hidden");
 try{await navigator.clipboard.writeText(report);$("#diagnosticMessage").textContent="診断情報をコピーしました。問題の説明と一緒に貼り付けてください。";}
 catch{$("#diagnosticMessage").textContent="下の診断情報を選択してコピーしてください。";}
};



