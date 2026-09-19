const BACON_DESKTOP = /Electron/i.test(navigator.userAgent);
if(BACON_DESKTOP){
  const legacy=document.getElementById("webFrame"), desktop=document.getElementById("desktopWebFrame");
  if(desktop){ desktop.id="webFrame"; desktop.style.display="block"; legacy?.remove(); }
}
const PAGES=["home","games","music","bookmarks","history","iframe","gaming-pro","account","settings","page-bookmarks-extra","page-history-extra","page-private-extra","page-gaming-extra","page-music-extra","page-bacon-extra","ultimate","arcade","dashboard","tab-islands","gaming-hub","music-studio","toolbox","privacy-center","achievements","mods","social","split-screen","os-lab","assistant-v8"];
let tabCount=1;
let activeTab=null;
function activateTab(tab){$$(".tab").forEach(t=>t.classList.remove("active"));tab.classList.add("active");activeTab=tab;showPage(tab.dataset.page||"home",false)}
function closeTab(tab){
  const all=[...$$(".tab")];
  if(all.length===1){setStatus("You cannot close the last tab.");return}
  const wasActive=tab.classList.contains("active");
  const index=all.indexOf(tab);
  tab.remove();
  if(wasActive){const next=all[index-1]||all[index+1];activateTab(next)}
}
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
let historyItems=JSON.parse(localStorage.getItem("baconHistory")||"[]");
let bookmarks=JSON.parse(localStorage.getItem("baconBookmarks")||"[]");

function save(){localStorage.setItem("baconHistory",JSON.stringify(historyItems));localStorage.setItem("baconBookmarks",JSON.stringify(bookmarks))}
function showPage(id, updateAddress=true){
  id=String(id||"").replace(/^#/,"").trim().toLowerCase();
  const target=document.getElementById(id);
  if(!target || !target.classList.contains("page")) return false;
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  target.classList.add("active");
  document.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("active",String(b.dataset.page||"").toLowerCase()===id));
  if(updateAddress && document.getElementById("address")) document.getElementById("address").value="bacon://"+id;
  if(id==="history" && typeof renderHistory==="function") renderHistory();
  if(id==="bookmarks" && typeof renderBookmarks==="function") renderBookmarks();
  window.scrollTo(0,0);
  return true;
}
window.showPage=showPage;
window.showPage=showPage;
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-page]");
  if(!b) return;
  const id=b.dataset.page;
  if(id && document.getElementById(id)){
    e.preventDefault();
    showPage(id);
  }
});
function wireTab(tab){
  tab.addEventListener("click",(e)=>{
    if(e.target.classList.contains("close-tab")){e.stopPropagation();closeTab(tab);return}
    activateTab(tab);
  });
}
$$(".tab").forEach(wireTab);
activeTab=$(".tab.active");
$("#homeBtn")?.addEventListener("click",()=>showPage("home"));
$("#accountTopBtn")?.addEventListener("click",()=>showPage("account"));
$("#back")?.addEventListener("click",()=>history.back());
$("#forward")?.addEventListener("click",()=>history.forward());
$("#reload")?.addEventListener("click",()=>{if(frame&&frame.src)frame.src=frame.src;else location.reload();setStatus("↻ Browser refreshed");});
$("#addressForm").onsubmit=e=>{e.preventDefault();let v=$("#address").value.trim();if(!v)return;
 if(v.startsWith("bacon://")&&PAGES.includes(v.slice(8).toLowerCase())){showPage(v.slice(8).toLowerCase());return}
 let url=/^https?:\/\//i.test(v)?v:(v.includes(".")?"https://"+v:"https://www.google.com/search?q="+encodeURIComponent(v));
 historyItems.unshift({title:v,url,date:new Date().toLocaleString()});historyItems=historyItems.slice(0,30);save();
 if($("#webFrame")&&url.startsWith("http")){showPage("iframe");loadFrame(url);setStatus("🌐 Loading inside Bacon Browser");}
 else window.open(url,"_blank","noopener");
};
function setStatus(t){const s=$("#status");if(s)s.textContent=t}
$("#focusMode").onclick=()=>document.body.classList.toggle("focus");
$("#bookmarkBtn")?.addEventListener("click",()=>{
 let item={title:$("#address").value,url:$("#address").value};
 if(!bookmarks.some(x=>x.url===item.url)){bookmarks.push(item);save();setStatus("★ Bookmark saved")}else setStatus("★ Already bookmarked");
});
function renderBookmarks(){let box=$("#bookmarkList");box.innerHTML="";if(!bookmarks.length){box.innerHTML='<div class="list-item">No bookmarks yet. Click ☆ in the toolbar.</div>';return}
 bookmarks.forEach((x,i)=>{let d=document.createElement("div");d.className="list-item";d.innerHTML="<span>★ "+escapeHtml(x.title)+"</span><button class='secondary'>Open</button>";d.querySelector("button").onclick=()=>{if(x.url.startsWith("bacon://"))showPage(x.url.slice(8));else window.open(x.url,"_blank","noopener")};box.appendChild(d)})
}
function renderHistory(){let box=$("#historyList");box.innerHTML="";if(!historyItems.length){box.innerHTML='<div class="list-item">No history yet.</div>';return}
 historyItems.forEach(x=>{let d=document.createElement("div");d.className="list-item";d.innerHTML="<span>◷ "+escapeHtml(x.title)+"<small style='display:block;color:var(--muted);margin-top:4px'>"+escapeHtml(x.date)+"</small></span>";box.appendChild(d)})
}
$("#clearHistory")?.addEventListener("click",()=>{historyItems=[];save();renderHistory();setStatus("History cleared")});
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
$$(".themes button").forEach(b=>b.onclick=()=>{
 let t=b.dataset.theme;document.body.dataset.theme=t;localStorage.setItem("baconTheme",t);$$(".themes button").forEach(x=>x.classList.toggle("selected",x===b));setStatus("🎨 Theme changed to "+b.querySelector("b").textContent);
});
let savedTheme=localStorage.getItem("baconTheme")||"crimson";document.body.dataset.theme=savedTheme;
if(localStorage.getItem("baconTurboLegacy")==="0" && $("#turbo"))$("#turbo").checked=false;
if(localStorage.getItem("baconShowStats")==="0" && $("#showStats"))$("#showStats").checked=false;
if(localStorage.getItem("baconCompactLegacy")==="1" && $("#compact"))$("#compact").checked=true;let savedBtn=document.querySelector('.themes button[data-theme="'+savedTheme+'"]');savedBtn?.classList.add("selected");
$("#reset")?.addEventListener("click",()=>{localStorage.removeItem("baconTheme");document.body.dataset.theme="crimson";$("#turbo").checked=true;$("#showStats").checked=true;$("#compact").checked=false;setStatus("Settings reset")});
$("#turbo")?.addEventListener("change",e=>{document.body.classList.toggle("no-motion",!e.target.checked);localStorage.setItem("baconTurboLegacy",e.target.checked?"1":"0")});
$("#showStats")?.addEventListener("change",e=>{const s=$(".side-bottom");if(s)s.style.display=e.target.checked?"":"none";localStorage.setItem("baconShowStats",e.target.checked?"1":"0")});
$("#compact")?.addEventListener("change",e=>{document.body.classList.toggle("compact",e.target.checked);localStorage.setItem("baconCompactLegacy",e.target.checked?"1":"0")});


/* V2 owns the New Tab button; the legacy duplicate handler was removed. */
renderBookmarks();renderHistory();

/* Embedded Web View — compatibility bridge */
const frame=$("#webFrame"), iframeUrl=$("#iframeUrl"), iframeState=$("#iframeState");
function normalizeUrl(v){
  v=(v||"").trim();
  if(!v)return "";
  if(/^https?:\/\//i.test(v))return v;
  if(/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(v))return "https://"+v;
  return "https://www.google.com/search?q="+encodeURIComponent(v);
}
function loadFrame(v){
  const u=normalizeUrl(v);
  if(!u || !frame)return;
  if(iframeUrl)iframeUrl.value=u;
  if(iframeState)iframeState.textContent="Loading…";
  $("#webLoading")?.classList.add("show");
  $("#webBlocked")?.classList.remove("show");
  frame.src=u;
  setStatus("▣ Loading embedded page");
}
window.loadFrame=loadFrame;
$("#iframeForm")?.addEventListener("submit",e=>{e.preventDefault();loadFrame(iframeUrl?.value)});
$("#iframeClan")?.addEventListener("click",()=>loadFrame("https://baconclan.pages.dev"));
$("#iframeReload")?.addEventListener("click",()=>{if(frame)frame.src=frame.src;if(iframeState)iframeState.textContent="Reloading…"});
$("#iframeBack")?.addEventListener("click",()=>{try{if(BACON_DESKTOP)frame?.goBack?.();else frame?.contentWindow?.history.back()}catch(e){}});
$("#iframeForward")?.addEventListener("click",()=>{try{if(BACON_DESKTOP)frame?.goForward?.();else frame?.contentWindow?.history.forward()}catch(e){}});
$("#iframeExternal")?.addEventListener("click",()=>{if(iframeUrl?.value)window.open(iframeUrl.value,"_blank","noopener")});
frame?.addEventListener("load",()=>{if(iframeState)iframeState.textContent="Loaded";$("#webLoading")?.classList.remove("show");setStatus("✓ Page loaded")});
if(BACON_DESKTOP && frame){
  frame.addEventListener("did-start-loading",()=>{ $("#webLoading")?.classList.add("show"); if(iframeState)iframeState.textContent="Loading…"; });
  frame.addEventListener("did-stop-loading",()=>{ $("#webLoading")?.classList.remove("show"); if(iframeState)iframeState.textContent="Loaded"; });
  frame.addEventListener("did-fail-load",()=>{ $("#webLoading")?.classList.remove("show"); if(iframeState)iframeState.textContent="Failed to load"; setStatus("⚠ Page failed to load"); });
  frame.addEventListener("did-navigate",e=>{ if(iframeUrl)iframeUrl.value=e.url; const a=document.getElementById("address"); if(a)a.value=e.url; });
}


// Bacon Clan theme background bridge
(function(){
  const themeMap = {
    "Crimson Bacon":"crimson","Crimson":"crimson","crimson":"crimson",
    "Bloodmoon":"bloodmoon","bloodmoon":"bloodmoon",
    "Midnight Bacon":"midnight","Midnight Stars":"midnight","midnight":"midnight",
    "Neon Bacon":"neon","Neon Sakura":"neon","neon":"neon",
    "Forest Bacon":"forest","Forest":"forest","forest":"forest",
    "Aqua Bacon":"aqua","Aqua":"aqua","aqua":"aqua",
    "Gold Bacon":"gold","Gold":"gold","gold":"gold",
    "Blackout Crimson":"blackout","Blackout":"blackout","blackout":"blackout"
  };
  function applyBaconThemeBackground(){
    const raw = localStorage.getItem("baconBrowserTheme") ||
                localStorage.getItem("theme") ||
                document.body.dataset.theme || "crimson";
    let key = themeMap[raw] || String(raw).toLowerCase().replace(/\s+/g,"-");
    const classes = ["crimson","bloodmoon","midnight","neon","forest","aqua","gold","blackout"];
    document.body.classList.remove(...classes.map(x=>"theme-"+x));
    if(classes.includes(key)) document.body.classList.add("theme-"+key);
    document.body.dataset.theme = key;
  }
  window.applyBaconThemeBackground = applyBaconThemeBackground;
  document.addEventListener("DOMContentLoaded", applyBaconThemeBackground);
  const _setItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(k,v){
    _setItem.call(this,k,v);
    if(k==="baconBrowserTheme" || k==="theme") setTimeout(applyBaconThemeBackground,0);
  };
})();


/* ULTIMATE BACON BROWSER FEATURE LAYER */
(function(){
  const KEY={history:"baconHistory",bookmarks:"baconBookmarks",closed:"baconClosedTabs",private:"baconPrivate",engine:"baconSearchEngine"};
  const get=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
  const put=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const qs=s=>document.querySelector(s), qsa=s=>[...document.querySelectorAll(s)];

  function normalizeUrl(v){
    v=(v||"").trim();
    if(!v)return "";
    if(/^https?:\/\//i.test(v))return v;
    if(/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(v))return "https://"+v;
    return null;
  }
  function openDestination(v, privateMode=false){
    const url=normalizeUrl(v);
    if(url){
      if(typeof window.loadUrl==="function") window.loadUrl(url);
      else if(qs("#iframeUrl")){qs("#iframeUrl").value=url; qs("#iframeForm")?.requestSubmit();}
      else window.open(url,"_blank");
      if(!privateMode) addHistory(url);
    }else{
      const engine=localStorage.getItem(KEY.engine)||"https://www.google.com/search?q=";
      if(engine==="bacon") {
        // Bacon Search falls back to Google with a Bacon-branded query prefix while remaining functional.
        openDestination("https://www.google.com/search?q="+encodeURIComponent("Bacon Clan "+v),privateMode);
      } else openDestination(engine+encodeURIComponent(v),privateMode);
    }
  }
  function addHistory(url){
    if(localStorage.getItem(KEY.private)==="1") return;
    let a=get(KEY.history,[]);
    a.unshift({url,time:Date.now()});
    a=a.filter((x,i)=>i<200 && a.findIndex(y=>y.url===x.url)===i);
    put(KEY.history,a); renderHistory(); renderRecent();
  }
  function renderHistory(){
    const box=qs("#historyList"); if(!box)return;
    const term=(qs("#historySearch")?.value||"").toLowerCase();
    const a=get(KEY.history,[]).filter(x=>x.url.toLowerCase().includes(term));
    box.innerHTML=a.length?a.map((x,i)=>`<div class="bacon-item"><div><b>${esc(x.url)}</b><small>${new Date(x.time).toLocaleString()}</small></div><div><button data-history-open="${i}">Open</button><button data-history-del="${i}">×</button></div></div>`).join(""):"<div class='bacon-item'>No history yet.</div>";
    box.querySelectorAll("[data-history-open]").forEach(b=>b.onclick=()=>openDestination(a[+b.dataset.historyOpen].url));
    box.querySelectorAll("[data-history-del]").forEach(b=>b.onclick=()=>{let all=get(KEY.history,[]);all.splice(all.findIndex(x=>x.url===a[+b.dataset.historyDel].url),1);put(KEY.history,all);renderHistory();renderRecent();});
  }
  function renderRecent(){
    const box=qs("#recentVisits"); if(!box)return;
    const a=get(KEY.history,[]).slice(0,5);
    box.innerHTML=a.length?a.map(x=>`<button class="recent-link" data-recent="${esc(x.url)}">${esc(x.url)}</button>`).join("<br>"):"No recent pages yet.";
    box.querySelectorAll("[data-recent]").forEach(b=>b.onclick=()=>openDestination(b.dataset.recent));
  }
  function renderBookmarks(){
    const box=qs("#bookmarkList"); if(!box)return;
    const term=(qs("#bookmarkSearch")?.value||"").toLowerCase();
    const a=get(KEY.bookmarks,[]).filter(x=>(x.title+" "+x.url).toLowerCase().includes(term));
    box.innerHTML=a.length?a.map((x,i)=>`<div class="bacon-item"><div><b>${esc(x.title)}</b><small>${esc(x.url)}</small></div><div><button data-bm-open="${i}">Open</button><button data-bm-del="${i}">×</button></div></div>`).join(""):"<div class='bacon-item'>No bookmarks yet.</div>";
    box.querySelectorAll("[data-bm-open]").forEach(b=>b.onclick=()=>openDestination(a[+b.dataset.bmOpen].url));
    box.querySelectorAll("[data-bm-del]").forEach(b=>b.onclick=()=>{let all=get(KEY.bookmarks,[]);all.splice(all.findIndex(x=>x.url===a[+b.dataset.bmDel].url),1);put(KEY.bookmarks,all);renderBookmarks();});
  }
  function currentUrl(){
    return qs("#iframeUrl")?.value || qs("#addressBar")?.value || location.href;
  }
  function bookmarkCurrent(){
    const url=currentUrl(); if(!url || url===location.href)return;
    let a=get(KEY.bookmarks,[]);
    if(!a.some(x=>x.url===url)){a.push({url,title:url});put(KEY.bookmarks,a);renderBookmarks();notify("⭐ Bookmark saved");}
  }
  function notify(msg){const n=qs("#baconNotifications");if(n)n.textContent=msg;}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

  function addTab(url="about:blank",privateMode=false){
    if(typeof window.createTab==="function"){window.createTab(url);return;}
    const tabs=qs(".tabs"); if(!tabs)return;
    const t=document.createElement("div");t.className="tab";t.innerHTML='<span>New Bacon Tab</span><i class="close-tab">×</i>';tabs.appendChild(t);
    t.onclick=e=>{if(e.target.classList.contains("close-tab")){if(tabs.children.length>1)t.remove();}else t.classList.add("active")};
  }

  function wire(){
    qsa("[data-open-url]").forEach(b=>b.onclick=()=>{
 const u=b.dataset.openUrl;
 if($("#webFrame")&&u){showPage("iframe");loadFrame(u);setStatus("🌐 Loading "+u+" inside Bacon Browser");}
 else openDestination(u);
});
    qsa("[data-page-target]").forEach(b=>b.onclick=()=>{const id=b.dataset.pageTarget; if(typeof window.showPage==="function")window.showPage(id);});
    qs("#mainBaconSearchBtn")?.addEventListener("click",()=>openDestination(qs("#mainBaconSearch").value));
    qs("#mainBaconSearch")?.addEventListener("keydown",e=>{if(e.key==="Enter")openDestination(e.target.value)});
    qs("#bookmarkCurrent")?.addEventListener("click",bookmarkCurrent);
    qs("#bookmarkSearch")?.addEventListener("input",renderBookmarks);
    qs("#historySearch")?.addEventListener("input",renderHistory);
    qs("#clearHistory")?.addEventListener("click",()=>{put(KEY.history,[]);renderHistory();renderRecent();notify("🧹 History cleared");});
    qs("#reopenClosed")?.addEventListener("click",()=>{const a=get(KEY.closed,[]);if(a[0])openDestination(a.shift().url);put(KEY.closed,a);});
    [qs("#quickPrivate"),qs("#privateBrowseBtn")].forEach(b=>b?.addEventListener("click",()=>{localStorage.setItem(KEY.private,"1");addTab("about:blank",true);notify("🔒 Private Bacon tab opened");setTimeout(()=>localStorage.removeItem(KEY.private),100);}));
    qs("#quickTurbo")?.addEventListener("click",()=>{document.body.classList.toggle("turbo-mode");localStorage.setItem("baconTurbo",document.body.classList.contains("turbo-mode")?"1":"0");notify(document.body.classList.contains("turbo-mode")?"⚡ Turbo ON":"Turbo OFF")});
    qs("#clearHistory")?.addEventListener("dblclick",()=>localStorage.removeItem(KEY.history));
    qs("#searchEngineSelect")?.addEventListener("change",e=>localStorage.setItem(KEY.engine,e.target.value));
    qs("#gamingModeBtn")?.addEventListener("click",()=>{document.body.classList.toggle("gaming-mode");notify(document.body.classList.contains("gaming-mode")?"🎮 Gaming Mode ON":"Gaming Mode OFF")});
    qs("#clanProfileBtn")?.addEventListener("click",()=>openDestination("https://baconclan.pages.dev"));
    qs("#clanStatsBtn")?.addEventListener("click",()=>openDestination("https://baconclan.pages.dev"));
    qs("#clanLeaderboardBtn")?.addEventListener("click",()=>openDestination("https://baconclan.pages.dev"));
    qs("#clanNewsBtn")?.addEventListener("click",()=>openDestination("https://baconclan.pages.dev"));
    renderHistory();renderBookmarks();renderRecent();
    if(localStorage.getItem("baconTurbo")==="1")document.body.classList.add("turbo-mode");
  }
  // Capture iframe navigation as browser history without interfering with the existing iframe controls.
  document.addEventListener("submit",e=>{
    if(e.target?.id==="iframeForm"){
      setTimeout(()=>{const u=qs("#iframeUrl")?.value;if(u)addHistory(u)},150);
    }
  });
  document.addEventListener("DOMContentLoaded",wire);
})();

/* Real browser settings + gaming engine */
(function(){const K="baconBrowserRealSettings",D={startup:"home",search:"google",history:true,sidebar:false,motion:false,dark:false,transparency:70,profile:"Bacon User",gaming:false};let s=(()=>{try{return Object.assign({},D,JSON.parse(localStorage.getItem(K)||"{}"))}catch{return {...D}}})();const q=x=>document.querySelector(x),save=()=>localStorage.setItem(K,JSON.stringify(s));function apply(){document.body.classList.toggle("compact",s.sidebar);document.body.classList.toggle("reduce-motion",s.motion);document.body.classList.toggle("force-dark-frame",s.dark);document.body.classList.toggle("low-transparency",+s.transparency<60);document.body.classList.toggle("gaming-mode",s.gaming)}function load(){let m={settingStartup:"startup",settingHistory:"history",settingSidebar:"sidebar",settingMotion:"motion",settingDark:"dark",settingTransparency:"transparency",settingProfile:"profile"};for(let [id,k] of Object.entries(m)){let e=q("#"+id);if(e)e.type==="checkbox"?e.checked=!!s[k]:e.value=s[k]}if(q("#settingSearch"))q("#settingSearch").value=s.search}function bind(){let m={settingStartup:"startup",settingSearch:"search",settingHistory:"history",settingSidebar:"sidebar",settingMotion:"motion",settingDark:"dark",settingTransparency:"transparency",settingProfile:"profile"};Object.entries(m).forEach(([id,k])=>q("#"+id)?.addEventListener("change",e=>{s[k]=e.target.type==="checkbox"?e.target.checked:e.target.value;save();apply()}));q("#saveBrowserSettings")?.addEventListener("click",()=>{save();apply();if(q("#settingsSaved"))q("#settingsSaved").textContent="✓ Settings saved."});q("#resetBrowserSettings")?.addEventListener("click",()=>{s={...D};save();load();apply();if(q("#settingsSaved"))q("#settingsSaved").textContent="✓ Settings reset."});q("#proGamingToggle")?.addEventListener("click",()=>{s.gaming=!s.gaming;save();apply();q("#proGamingToggle").textContent=s.gaming?"🛑 Disable Gaming Mode":"🎮 Enable Gaming Mode";q("#gameModeTitle").textContent=s.gaming?"Gaming Mode is ON":"Gaming Mode is OFF"});q("#runFpsPro")?.addEventListener("click",()=>{let n=0,t=performance.now();function f(x){n++;if(x-t<3000)requestAnimationFrame(f);else{q("#fpsMetric").textContent=Math.round(n/3)+" FPS";q("#fpsDetails").textContent=n+" frames over 3 seconds"}}requestAnimationFrame(f)});q("#runMemoryTest")?.addEventListener("click",()=>q("#heapMetric").textContent=performance.memory?(performance.memory.usedJSHeapSize/1048576).toFixed(1)+" MB":"Not exposed");q("#runLatencyTest")?.addEventListener("click",async()=>{let t=performance.now();try{await fetch(location.href,{cache:"no-store"});q("#latencyMetric").textContent=Math.round(performance.now()-t)+" ms"}catch{q("#latencyMetric").textContent="N/A"}});q("#runBatteryTest")?.addEventListener("click",async()=>{if(!navigator.getBattery){q("#batteryMetric").textContent="N/A";return}let b=await navigator.getBattery();q("#batteryMetric").textContent=Math.round(b.level*100)+"%"+(b.charging?" ⚡":"")});let fx={effectBloom:"shader-bloom",effectContrast:"shader-contrast",effectCool:"shader-cool",effectWarm:"shader-warm"};Object.entries(fx).forEach(([id,c])=>q("#"+id)?.addEventListener("click",()=>document.body.classList.toggle(c)));q("#effectReduce")?.addEventListener("click",()=>document.body.classList.toggle("reduce-motion"));q("#effectReset")?.addEventListener("click",()=>Object.values(fx).forEach(c=>document.body.classList.remove(c)));document.addEventListener("click",e=>{let b=e.target.closest("[data-theme]");if(b){localStorage.setItem("baconTheme",b.dataset.theme);document.body.dataset.theme=b.dataset.theme}})}document.addEventListener("DOMContentLoaded",()=>{
  load();apply();bind();
  const startup=(JSON.parse(localStorage.getItem(K)||"{}").startup)||"home";
  setTimeout(()=>{ if(document.getElementById(startup)) showPage(startup); },0);
})})();

/* === BACON ID LOCAL ACCOUNT SYSTEM === */
(function(){
  const AK="baconBrowserAccounts", CK="baconBrowserCurrentAccount";
  const q=s=>document.querySelector(s);
  const accounts=()=>{try{return JSON.parse(localStorage.getItem(AK)||"[]")}catch{return[]}};
  const put=a=>localStorage.setItem(AK,JSON.stringify(a));
  const current=()=>localStorage.getItem(CK);
  const setStatus=(id,msg)=>{const e=q(id);if(e)e.textContent=msg};
  const safeName=n=>String(n||"").trim().replace(/[^a-zA-Z0-9_ -]/g,"").slice(0,20);
  async function hash(text){
    if(window.crypto?.subtle){const data=new TextEncoder().encode(text),buf=await crypto.subtle.digest("SHA-256",data);return [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,"0")).join("");}
    return btoa(unescape(encodeURIComponent(text)));
  }
  function initial(name){return (String(name||"B").trim()[0]||"B").toUpperCase()}
  function themeName(){const t=document.body.dataset.theme||"crimson";const b=document.querySelector('.themes button[data-theme="'+t+'"] b');return b?.textContent||t}
  function render(){
    const id=current(),a=accounts().find(x=>x.id===id),out=q("#accountLoggedOut"),inn=q("#accountLoggedIn");
    if(!out||!inn)return;
    if(!a){out.classList.remove("hidden");inn.classList.add("hidden");q("#accountTitle").textContent="Create your Bacon ID.";const badge=q("#accountBadge");if(badge){badge.textContent="GUEST";badge.classList.remove("signed")}return}
    out.classList.add("hidden");inn.classList.remove("hidden");q("#accountTitle").textContent="Your Bacon ID.";const badge=q("#accountBadge");if(badge){badge.textContent=a.username.toUpperCase().slice(0,10);badge.classList.add("signed")}
    q("#profileName").textContent=a.username;q("#profileEmail").textContent=a.email||"Local Bacon ID";q("#profileNameInput").value=a.username;q("#profileColor").value=a.color||"#e42b1b";q("#profileAvatar").textContent=initial(a.username);q("#profileAvatar").style.background=a.color||"#e42b1b";q("#profileSince").textContent=new Date(a.created).toLocaleDateString();q("#profileTheme").textContent=themeName();
  }
  async function create(){
    const username=safeName(q("#accountUsername")?.value),email=q("#accountEmail")?.value.trim(),pw=q("#accountPassword")?.value||"";
    if(username.length<3)return setStatus("#accountFormStatus","Username must be at least 3 characters.");
    if(pw.length<6)return setStatus("#accountFormStatus","Password must be at least 6 characters.");
    const a=accounts();if(a.some(x=>x.username.toLowerCase()===username.toLowerCase()))return setStatus("#accountFormStatus","That username is already taken on this device.");
    const id="bac_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7),rec={id,username,email,passwordHash:await hash(pw),created:Date.now(),color:"#e42b1b",theme:document.body.dataset.theme||"crimson",settings:localStorage.getItem("baconBrowserRealSettings")||""};a.push(rec);put(a);localStorage.setItem(CK,id);q("#accountPassword").value="";setStatus("#accountFormStatus","✓ Bacon ID created. You are signed in.");render();
  }
  async function login(){
    const username=safeName(q("#accountUsername")?.value),pw=q("#accountPassword")?.value||"",a=accounts(),rec=a.find(x=>x.username.toLowerCase()===username.toLowerCase());
    if(!rec)return setStatus("#accountFormStatus","No local account with that username.");
    if((await hash(pw))!==rec.passwordHash)return setStatus("#accountFormStatus","Incorrect password.");
    localStorage.setItem(CK,rec.id);if(rec.theme){document.body.dataset.theme=rec.theme;localStorage.setItem("baconTheme",rec.theme)}if(rec.settings){localStorage.setItem("baconBrowserRealSettings",rec.settings)}setStatus("#accountFormStatus","✓ Logged in as "+rec.username);render();
  }
  function saveProfile(){const id=current(),a=accounts(),i=a.findIndex(x=>x.id===id);if(i<0)return;const name=safeName(q("#profileNameInput").value)||a[i].username;if(a.some((x,n)=>n!==i&&x.username.toLowerCase()===name.toLowerCase()))return setStatus("#profileStatus","That username is already taken.");a[i].username=name;a[i].color=q("#profileColor").value||"#e42b1b";a[i].theme=document.body.dataset.theme||"crimson";a[i].settings=localStorage.getItem("baconBrowserRealSettings")||"";put(a);setStatus("#profileStatus","✓ Profile saved.");render()}
  function logout(){localStorage.removeItem(CK);setStatus("#profileStatus","Logged out.");render()}
  function del(){const id=current();if(!id)return;const a=accounts().filter(x=>x.id!==id);put(a);localStorage.removeItem(CK);render();setStatus("#accountFormStatus","Local account deleted.")}
  q("#createAccountBtn")?.addEventListener("click",create);q("#loginAccountBtn")?.addEventListener("click",login);q("#saveProfileBtn")?.addEventListener("click",saveProfile);q("#logoutBtn")?.addEventListener("click",logout);q("#deleteAccountBtn")?.addEventListener("click",()=>{if(confirm("Delete this local Bacon ID from this device?"))del()});
  document.addEventListener("click",e=>{if(e.target.closest('.themes button'))setTimeout(()=>{const id=current(),a=accounts(),i=a.findIndex(x=>x.id===id);if(i>=0){a[i].theme=document.body.dataset.theme;put(a);render()}},50)});
  document.addEventListener("DOMContentLoaded",()=>{
    render();
    const accountBtn=document.querySelector('.side[data-page="account"]');
    if(accountBtn) accountBtn.addEventListener("click",()=>window.showPage("account"));
  });
})();


/* BACON MUSIC ENGINE — real Web Audio beat + local audio-file player */
(function(){
  const state = {
    playing:false,
    trackIndex:0,
    source:"builtin",
    audio:null,
    audioUrl:null,
    ctx:null,
    master:null,
    timer:null,
    startedAt:0,
    pausedAt:0,
    duration:120,
    volume:0.7,
    tracks:[
      {name:"Bacon Beats — Midnight Sizzle", bpm:112, key:220},
      {name:"Bacon Beats — Crispy Rush", bpm:128, key:196},
      {name:"Bacon Beats — Clan Night", bpm:100, key:247}
    ]
  };

  const $m=s=>document.querySelector(s);
  const els={
    play: $m("#play"), prev:$m("#prev"), next:$m("#next"),
    progress:$m("#progress"), name:$m("#trackName"),
    current:$m("#musicCurrentTime"), duration:$m("#musicDuration"),
    volume:$m("#mainMusicVolume"), upload:$m("#musicUploadBtn"), file:$m("#musicFileInput"),
    extraPlay:$m("#musicPlay"), extraPrev:$m("#musicPrev"), extraNext:$m("#musicNext"),
    extraProgress:$m("#musicProgress"), extraNow:$m("#extraMusicNow"),
    extraVolume:$m("#musicVolume"), extraUpload:$m("#extraMusicUploadBtn"), extraFile:$m("#extraMusicFileInput"),
    status:$m("#musicStatus"), extraStatus:$m("#extraMusicStatus"),
    source:$m("#musicSourceLabel")
  };

  function fmt(sec){
    sec=Math.max(0,Math.floor(sec||0));
    return Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0");
  }
  function setText(el,v){if(el)el.textContent=v;}
  function updateUI(){
    let current=state.source==="file" && state.audio ? state.audio.currentTime : (state.playing ? ((performance.now()-state.startedAt)/1000+state.pausedAt)%state.duration : state.pausedAt);
    let total=state.source==="file" && state.audio && isFinite(state.audio.duration) ? state.audio.duration : state.duration;
    let pct=total?Math.min(100,current/total*100):0;
    if(els.progress)els.progress.style.width=pct+"%";
    if(els.extraProgress)els.extraProgress.style.width=pct+"%";
    setText(els.current,fmt(current)); setText(els.duration,fmt(total));
    setText(els.name,state.source==="file" && state.audio ? (state.audio.dataset.name||"My Music") : state.tracks[state.trackIndex].name);
    setText(els.extraNow,state.source==="file" && state.audio ? (state.audio.dataset.name||"My Music") : state.tracks[state.trackIndex].name);
    setText(els.source,state.source==="file"?"LOCAL FILE":"BACON BEATS");
    const icon=state.playing?"⏸":"▶";
    if(els.play)els.play.textContent=icon;
    if(els.extraPlay)els.extraPlay.textContent=icon;
  }
  function status(msg){setText(els.status,msg);setText(els.extraStatus,msg); if(typeof window.setStatus==="function")window.setStatus("🎵 "+msg);}

  function ensureAudio(){
    if(state.ctx)return;
    const C=window.AudioContext||window.webkitAudioContext;
    if(!C){status("This browser does not support Web Audio.");return false;}
    state.ctx=new C();
    state.master=state.ctx.createGain();
    state.master.gain.value=state.volume;
    state.master.connect(state.ctx.destination);
    return true;
  }
  function tone(freq,time,dur,type="sine",gain=.08){
    if(!state.ctx||!state.master)return;
    const o=state.ctx.createOscillator(), g=state.ctx.createGain();
    o.type=type; o.frequency.setValueAtTime(freq,state.ctx.currentTime+time);
    g.gain.setValueAtTime(.0001,state.ctx.currentTime+time);
    g.gain.exponentialRampToValueAtTime(gain,state.ctx.currentTime+time+.008);
    g.gain.exponentialRampToValueAtTime(.0001,state.ctx.currentTime+time+dur);
    o.connect(g);g.connect(state.master);o.start(state.ctx.currentTime+time);o.stop(state.ctx.currentTime+time+dur+.03);
  }
  function noise(time,dur=.055,gain=.035){
    if(!state.ctx||!state.master)return;
    const buffer=state.ctx.createBuffer(1,state.ctx.sampleRate*dur,state.ctx.sampleRate);
    const data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
    const src=state.ctx.createBufferSource(), g=state.ctx.createGain();
    src.buffer=buffer;g.gain.value=gain;src.connect(g);g.connect(state.master);
    src.start(state.ctx.currentTime+time);
  }
  function kick(time){
    if(!state.ctx||!state.master)return;
    const o=state.ctx.createOscillator(),g=state.ctx.createGain(),now=state.ctx.currentTime+time;
    o.type="sine";o.frequency.setValueAtTime(120,now);o.frequency.exponentialRampToValueAtTime(45,now+.12);
    g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.28,now+.006);g.gain.exponentialRampToValueAtTime(.0001,now+.16);
    o.connect(g);g.connect(state.master);o.start(now);o.stop(now+.18);
  }
  function scheduleBar(){
    if(!state.playing||state.source!=="builtin")return;
    const t=state.tracks[state.trackIndex], beat=60/t.bpm, root=t.key;
    const now=state.ctx.currentTime;
    const notes=[root,root*1.189,root*1.335,root*1.498,root*1.335,root*1.189,root*1.682,root*1.498];
    for(let i=0;i<8;i++){
      const tt=i*beat/2;
      if(i%2===0)kick(tt);
      noise(tt+beat/4,.035,.025);
      tone(notes[i],tt,.16,"triangle",.045);
      if(i===3||i===7)tone(root/2,tt,.28,"sine",.055);
    }
    state.timer=setTimeout(scheduleBar,beat*4000);
  }
  async function play(){
    if(state.source==="file"){
      if(!state.audio)return;
      try{await state.audio.play();state.playing=true;status("Playing your music.");updateUI();}catch(e){status("Click play again to allow audio playback.");}
      return;
    }
    if(!ensureAudio())return;
    if(state.ctx.state==="suspended")await state.ctx.resume();
    if(state.playing)return;
    state.playing=true;state.startedAt=performance.now();
    scheduleBar();status("Playing "+state.tracks[state.trackIndex].name+" • live audio");updateUI();
  }
  function pause(){
    if(state.source==="file"&&state.audio){state.audio.pause();state.playing=false;updateUI();status("Paused.");return;}
    if(!state.playing)return;
    state.pausedAt=(performance.now()-state.startedAt)/1000+state.pausedAt;
    state.playing=false;clearTimeout(state.timer);state.timer=null;
    updateUI();status("Paused.");
  }
  function toggle(){state.playing?pause():play();}
  function next(){
    if(state.source==="file"){return;}
    state.trackIndex=(state.trackIndex+1)%state.tracks.length;
    state.pausedAt=0;state.startedAt=performance.now();
    if(state.playing){clearTimeout(state.timer);scheduleBar();}
    updateUI();status("Loaded "+state.tracks[state.trackIndex].name);
  }
  function prev(){
    if(state.source==="file"){if(state.audio)state.audio.currentTime=0;return;}
    state.trackIndex=(state.trackIndex-1+state.tracks.length)%state.tracks.length;
    state.pausedAt=0;state.startedAt=performance.now();
    if(state.playing){clearTimeout(state.timer);scheduleBar();}
    updateUI();status("Loaded "+state.tracks[state.trackIndex].name);
  }
  function setVolume(v){
    state.volume=Number(v);
    if(state.master)state.master.gain.value=state.volume;
    if(state.audio)state.audio.volume=state.volume;
    if(els.volume)els.volume.value=state.volume;
    if(els.extraVolume)els.extraVolume.value=state.volume;
  }
  function loadFile(file){
    if(!file)return;
    if(state.audioUrl)URL.revokeObjectURL(state.audioUrl);
    if(state.audio)state.audio.pause();
    state.audioUrl=URL.createObjectURL(file);
    state.audio=$m("#userAudio");
    state.audio.src=state.audioUrl;
    state.audio.dataset.name=file.name.replace(/\.[^.]+$/,"");
    state.audio.volume=state.volume;
    state.source="file";state.playing=false;
    state.audio.onloadedmetadata=()=>{state.duration=isFinite(state.audio.duration)?state.audio.duration:120;updateUI();};
    state.audio.ontimeupdate=updateUI;
    state.audio.onplay=()=>{state.playing=true;updateUI();};
    state.audio.onpause=()=>{state.playing=false;updateUI();};
    state.audio.onended=()=>{state.playing=false;updateUI();status("Track finished.");};
    updateUI();status("Loaded "+file.name+" • press ▶ to play");
  }
  function resetToBuiltin(){
    if(state.audio)state.audio.pause();
    state.source="builtin";state.audio=null;state.pausedAt=0;state.duration=120;
    updateUI();status("Bacon Beats selected.");
  }

  [els.play,els.extraPlay].forEach(b=>b?.addEventListener("click",toggle));
  [els.next,els.extraNext].forEach(b=>b?.addEventListener("click",next));
  [els.prev,els.extraPrev].forEach(b=>b?.addEventListener("click",prev));
  [els.volume,els.extraVolume].forEach(b=>b?.addEventListener("input",e=>setVolume(e.target.value)));
  els.upload?.addEventListener("click",()=>els.file?.click());
  els.extraUpload?.addEventListener("click",()=>els.extraFile?.click());
  els.file?.addEventListener("change",e=>loadFile(e.target.files[0]));
  els.extraFile?.addEventListener("change",e=>loadFile(e.target.files[0]));
  document.addEventListener("keydown",e=>{
    if(e.code==="Space" && !["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName)){e.preventDefault();toggle();}
  });
  setVolume(.7);updateUI();
})();


/* ===== BACON OS ULTIMATE LAYER ===== */
(function(){
  const root=document.documentElement;
  const body=document.body;
  const q=s=>document.querySelector(s), qa=s=>document.querySelectorAll(s);
  const storage={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){localStorage.setItem(k,JSON.stringify(v))}};

  function webLoad(url){
    url=(url||"").trim();
    if(!url)return;
    if(!/^https?:\/\//i.test(url))url="https://"+url;
    const input=q("#iframeUrl"), frame=q("#webFrame");
    if(input)input.value=url;
    if(frame)frame.src=url;
    showPage("iframe");
    q("#ultimateWebStatus") && (q("#ultimateWebStatus").textContent="Loading "+url+" …");
    setStatus("🌐 Loading "+url+" inside Bacon Browser");
    gainXP(50,"Loaded a website");
  }
  qa("[data-web-url]").forEach(b=>b.addEventListener("click",()=>webLoad(b.dataset.webUrl)));
  q("#ultimateWebForm")?.addEventListener("submit",e=>{e.preventDefault();webLoad(q("#ultimateUrl").value)});

  q("#splitLoad")?.addEventListener("click",()=>{
    let a=q("#splitLeftUrl").value.trim(),b=q("#splitRightUrl").value.trim();
    if(!/^https?:\/\//i.test(a))a="https://"+a;
    if(!/^https?:\/\//i.test(b))b="https://"+b;
    q("#splitLeft").src=a;q("#splitRight").src=b;
    q("#splitView").classList.add("active");gainXP(50,"Used Split Screen");setStatus("🪟 Split Screen active");
  });
  q("#splitExternal")?.addEventListener("click",()=>{
    let a=q("#splitLeftUrl").value.trim(),b=q("#splitRightUrl").value.trim();
    if(!/^https?:\/\//i.test(a))a="https://"+a;if(!/^https?:\/\//i.test(b))b="https://"+b;
    window.open(a,"_blank","noopener");window.open(b,"_blank","noopener");
  });

  const defaultCustom={accent:"#ff3b1f",glow:75,glass:72,motion:70};
  function applyCustom(c){
    root.style.setProperty("--accent",c.accent);
    root.style.setProperty("--accent2",c.accent);
    root.style.setProperty("--custom-glow",(c.glow/100).toFixed(2));
    root.style.setProperty("--custom-glass",(c.glass/100).toFixed(2));
    root.style.setProperty("--custom-motion",(c.motion/100).toFixed(2));
    q("#themePreview")&&(q("#themePreview").style.boxShadow=`0 0 ${12+c.glow/3}px ${c.accent}`);
    storage.set("baconCustomTheme",c);
  }
  function readCustom(){return storage.get("baconCustomTheme",defaultCustom)}
  function controls(){
    return {accent:q("#customAccent")?.value||defaultCustom.accent,glow:+(q("#customGlow")?.value||75),glass:+(q("#customGlass")?.value||72),motion:+(q("#customMotion")?.value||70)}
  }
  function fill(c){if(q("#customAccent"))q("#customAccent").value=c.accent;if(q("#customGlow"))q("#customGlow").value=c.glow;if(q("#customGlass"))q("#customGlass").value=c.glass;if(q("#customMotion"))q("#customMotion").value=c.motion}
  fill(readCustom());applyCustom(readCustom());
  q("#applyCustomTheme")?.addEventListener("click",()=>{applyCustom(controls());gainXP(35,"Changed the theme");setStatus("🎨 Custom Bacon theme applied")});
  q("#resetCustomTheme")?.addEventListener("click",()=>{fill(defaultCustom);applyCustom(defaultCustom);document.body.dataset.theme="crimson";localStorage.setItem("baconTheme","crimson");setStatus("🎨 Custom theme reset")});
  q("#randomTheme")?.addEventListener("click",()=>{
    const colors=["#ff3b1f","#ff006e","#8b5cf6","#00e5ff","#7cff00","#ffc400","#00ff99","#ff4d00"];
    const c={accent:colors[Math.floor(Math.random()*colors.length)],glow:45+Math.floor(Math.random()*55),glass:50+Math.floor(Math.random()*45),motion:30+Math.floor(Math.random()*70)};
    fill(c);applyCustom(c);gainXP(35,"Changed the theme");setStatus("🎲 Random Bacon theme generated");
  });

  const wsKey="baconWorkspaces";
  let currentWs=localStorage.getItem("baconCurrentWorkspace")||"gaming";
  function renderWs(){q("#workspaceCurrent")&&(q("#workspaceCurrent").textContent="Current workspace: "+currentWs[0].toUpperCase()+currentWs.slice(1));qa("[data-workspace]").forEach(b=>b.classList.toggle("selected",b.dataset.workspace===currentWs))}
  qa("[data-workspace]").forEach(b=>b.addEventListener("click",()=>{currentWs=b.dataset.workspace;localStorage.setItem("baconCurrentWorkspace",currentWs);renderWs();setStatus("🗂️ Workspace: "+currentWs)}));
  q("#saveWorkspace")?.addEventListener("click",()=>{storage.set(wsKey,{workspace:currentWs,address:q("#address")?.value||"",theme:body.dataset.theme||"crimson",savedAt:new Date().toISOString()});setStatus("💾 Workspace state saved locally")});
  renderWs();

  q("#calcRun")?.addEventListener("click",()=>{
    const v=q("#calcInput").value.trim(),out=q("#calcOutput");
    if(!/^[0-9+\-*/().%\s]+$/.test(v)){out.value="Invalid";return}
    try{out.value=String(Function('"use strict";return ('+v+')')())}catch{out.value="Error"}
  });
  let timer=null;
  q("#timerStart")?.addEventListener("click",()=>{
    clearInterval(timer);let left=Math.max(1,parseInt(q("#timerSeconds").value||60,10));
    const out=q("#timerOutput");out.textContent=left+"s";
    timer=setInterval(()=>{left--;out.textContent=left>0?left+"s":"DONE 🔔";if(left<=0)clearInterval(timer)},1000);
  });
  const note=q("#quickNotes");if(note)note.value=localStorage.getItem("baconQuickNotes")||"";
  q("#saveNotes")?.addEventListener("click",()=>{localStorage.setItem("baconQuickNotes",note.value);setStatus("📝 Notes saved")});

  let xp=Number(localStorage.getItem("baconXP")||0), achievements=storage.get("baconAchievements",{});
  function renderXP(){
    const level=Math.floor(xp/100)+1,within=xp%100;
    q("#xpLevel")&&(q("#xpLevel").textContent="LEVEL "+level);
    q("#xpText")&&(q("#xpText").textContent=within+" / 100 XP");
    q("#xpBar")&&(q("#xpBar").style.width=within+"%");
    qa("[data-achievement]").forEach(b=>b.classList.toggle("earned",!!achievements[b.dataset.achievement]));
  }
  window.gainXP=(amount,name)=>{
    if(name&&achievements[name])return;
    xp+=amount;localStorage.setItem("baconXP",xp);
    if(name){achievements[name]=Date.now();storage.set("baconAchievements",achievements)}
    if(q("#achievementStatus"))q("#achievementStatus").textContent="+"+amount+" XP • "+(name||"Bacon progress");
    renderXP();
  };
  qa("[data-achievement]").forEach(b=>b.addEventListener("click",()=>gainXP(+b.dataset.xp,b.dataset.achievement)));
  renderXP();

  let privateMode=localStorage.getItem("baconPrivateMode")==="1";
  function renderPrivate(){const b=q("#privateHistoryToggle");if(b)b.textContent="🕵️ Private session: "+(privateMode?"ON":"OFF")}
  q("#privateHistoryToggle")?.addEventListener("click",()=>{privateMode=!privateMode;localStorage.setItem("baconPrivateMode",privateMode?"1":"0");renderPrivate();setStatus("🕵️ Private session "+(privateMode?"enabled":"disabled"))});
  q("#clearAllHistory")?.addEventListener("click",()=>{historyItems=[];save();renderHistory();setStatus("🧹 History cleared")});
  q("#clearBookmarks")?.addEventListener("click",()=>{bookmarks=[];save();renderBookmarks();setStatus("🔖 Bookmarks cleared")});
  q("#forceDarkWeb")?.addEventListener("click",()=>{body.classList.toggle("force-dark-frame");localStorage.setItem("baconForceDark",body.classList.contains("force-dark-frame")?"1":"0");setStatus("🌙 Web View dark mode "+(body.classList.contains("force-dark-frame")?"ON":"OFF"))});
  if(localStorage.getItem("baconForceDark")==="1")body.classList.add("force-dark-frame");
  renderPrivate();

  q("#modBaconParticles")?.addEventListener("click",()=>body.classList.toggle("bacon-particles"));
  q("#modLiveBackground")?.addEventListener("click",()=>body.classList.toggle("live-bg"));
  q("#modReduceEffects")?.addEventListener("click",()=>body.classList.toggle("reduce-motion"));
  q("#modCustomCursor")?.addEventListener("click",()=>body.classList.toggle("bacon-cursor"));
  let soundOn=localStorage.getItem("baconUiSounds")==="1";
  function clickSound(){if(!soundOn)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=520;g.gain.value=.025;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.035)}
  q("#modKeyboardSounds")?.addEventListener("click",()=>{soundOn=!soundOn;localStorage.setItem("baconUiSounds",soundOn?"1":"0");setStatus("⌨️ UI sounds "+(soundOn?"ON":"OFF") )});
  document.addEventListener("click",e=>{if(soundOn&&e.target.closest("button"))clickSound()},{capture:true});

  let score=Number(localStorage.getItem("baconClickScore")||0),best=Number(localStorage.getItem("baconClickBest")||0);
  function renderScore(){q("#baconScore")&&(q("#baconScore").textContent=score);q("#baconBest")&&(q("#baconBest").textContent=best)}
  q("#baconClick")?.addEventListener("click",()=>{score++;if(score>best)best=score;localStorage.setItem("baconClickScore",score);localStorage.setItem("baconClickBest",best);renderScore();if(score===1)gainXP(25,"Opened Bacon OS")});
  q("#resetBaconGame")?.addEventListener("click",()=>{score=0;renderScore()});renderScore();

  q("#aiRun")?.addEventListener("click",()=>{
    const raw=(q("#aiCommand").value||"").toLowerCase(),out=q("#aiOutput");
    if(raw.includes("bacon clan")){showPage("iframe");loadFrame("https://baconclan.pages.dev");out.textContent="Opening Bacon Clan inside Web View."}
    else if(raw.includes("gaming")){showPage("gaming-pro");out.textContent="Opening Gaming Control Center."}
    else if(raw.includes("music")){showPage("music");out.textContent="Opening Bacon Music."}
    else if(raw.includes("theme")){showPage("settings");out.textContent="Opening Theme Settings."}
    else if(raw.includes("home")){showPage("home");out.textContent="Opening Home."}
    else if(raw.includes("web")){showPage("iframe");out.textContent="Opening Web View."}
    else out.textContent="Try: open bacon clan, gaming, music, theme, web, or home.";
  });

  ["ultimateFocusWeb","ultimateFocusGaming","ultimateFocusMusic","ultimateFocusTheme"].forEach(id=>q("#"+id)?.addEventListener("click",()=>{
    const m={ultimateFocusWeb:"iframe",ultimateFocusGaming:"gaming-pro",ultimateFocusMusic:"music",ultimateFocusTheme:"settings"};showPage(m[id]);
  }));
  gainXP(25,"Opened Bacon OS");
})();


/* ===== BACON BROWSER ENGINE V2 ===== */
(function(){
  const Q=s=>document.querySelector(s), QA=s=>document.querySelectorAll(s);
  const KEY="baconBrowserTabsV2", CLOSED="baconClosedTabsV2";
  let tabs=JSON.parse(localStorage.getItem(KEY)||"null")||[
    {id:Date.now(),title:"🥓 New Tab",url:"bacon://home",page:"home",pinned:false,muted:false}
  ];
  let active=tabs[0].id, closed=JSON.parse(localStorage.getItem(CLOSED)||"[]");
  function persist(){localStorage.setItem(KEY,JSON.stringify(tabs));localStorage.setItem(CLOSED,JSON.stringify(closed.slice(0,12)))}
  function tabById(id){return tabs.find(t=>t.id===id)}
  function setTabPage(page,url,title){
    const t=tabById(active); if(!t)return;
    t.page=page||"home";t.url=url||("bacon://"+t.page);t.title=title||({"home":"🥓 New Tab","music":"🎵 Bacon Music","games":"🎮 Gaming","iframe":"🌐 Web View"}[t.page]||"🥓 Bacon");
    renderTabs();persist();
  }
  function renderTabs(){
    const box=Q("#tabs"); if(!box)return;
    box.innerHTML="";
    tabs.forEach(t=>{
      const b=document.createElement("button");b.className="tab"+(t.id===active?" active":"")+(t.pinned?" pinned":"");b.dataset.tabId=t.id;
      b.innerHTML=`<span>${t.title}</span><i class="close-tab">${t.pinned?"📌":"×"}</i>`;
      b.onclick=e=>{if(e.target.closest(".close-tab")){e.stopPropagation();closeTab(t.id)}else{active=t.id;loadTab(t)}};
      b.oncontextmenu=e=>{e.preventDefault();t.pinned=!t.pinned;renderTabs();persist();setStatus(t.pinned?"📌 Tab pinned":"Tab unpinned")};
      box.appendChild(b);
    });
  }
  function loadTab(t){
    active=t.id;
    renderTabs();
    if(t.page==="iframe"){showPage("iframe");loadFrame(t.url)}
    else showPage(t.page||"home");
    if(Q("#address"))Q("#address").value=t.url;
    setStatus("🗂️ "+t.title);
    persist();
  }
  function newTab(url="bacon://home",page="home",title="🥓 New Tab"){
    const t={id:Date.now()+Math.random(),title,url,page,pinned:false,muted:false};
    tabs.push(t);active=t.id;loadTab(t);
  }
  function closeTab(id){
    const index=tabs.findIndex(t=>t.id===id);if(index<0)return;
    const t=tabs[index];if(t.pinned)return;
    closed.unshift(t);tabs.splice(index,1);
    if(!tabs.length)tabs.push({id:Date.now(),title:"🥓 New Tab",url:"bacon://home",page:"home"});
    if(active===id)active=tabs[Math.max(0,index-1)].id;
    loadTab(tabById(active));persist();
  }
  Q("#newTab")?.addEventListener("click",()=>newTab());
  Q("#tabManagerBtn")?.addEventListener("click",()=>Q("#tabManagerPanel")?.classList.toggle("open"));
  Q("#closeTabManager")?.addEventListener("click",()=>Q("#tabManagerPanel")?.classList.remove("open"));
  Q("#restoreClosedTab")?.addEventListener("click",()=>{const t=closed.shift();if(!t){setStatus("No closed tab to restore");return}tabs.push(t);active=t.id;loadTab(t);persist()});
  Q("#closeOtherTabs")?.addEventListener("click",()=>{tabs=tabs.filter(t=>t.id===active||t.pinned);loadTab(tabById(active));persist()});
  function renderManager(){
    const box=Q("#tabManagerList");if(!box)return;box.innerHTML="";
    tabs.forEach(t=>{const r=document.createElement("button");r.className="tab-manager-row";r.innerHTML=`<span>${t.title}</span><small>${t.url}</small>`;r.onclick=()=>{active=t.id;loadTab(t);Q("#tabManagerPanel").classList.remove("open")};box.appendChild(r)})
  }
  new MutationObserver(renderManager).observe(Q("#tabs")||document.body,{childList:true});
  renderTabs();renderManager();

  // Keep existing navigation synchronized with our tab state.
  const originalShow=window.showPage;
  if(typeof originalShow==="function"){
    window.showPage=function(page){
      originalShow(page);
      const t=tabById(active);if(t){t.page=page;t.url="bacon://"+page;t.title=page==="home"?"🥓 New Tab":page==="music"?"🎵 Bacon Music":page==="games"?"🎮 Gaming":page==="iframe"?"🌐 Web View":("🥓 "+page);renderTabs();persist()}
    }
  }

  // Enhanced embedded navigation.
  window.baconLoadUrl=function(url){
    url=(url||"").trim();if(!url)return;
    if(!/^https?:\/\//i.test(url))url=url.includes(".")?"https://"+url:"https://www.google.com/search?q="+encodeURIComponent(url);
    showPage("iframe");
    const frame=Q("#webFrame"),input=Q("#iframeUrl");
    if(input)input.value=url;
    if(frame){
      Q("#webLoading")?.classList.add("show");Q("#webBlocked")?.classList.remove("show");
      frame.src=url;
      frame.onload=()=>{Q("#webLoading")?.classList.remove("show");Q("#webViewTitle")&&(Q("#webViewTitle").textContent=new URL(url).hostname.toUpperCase())};
      frame.onerror=()=>showBlocked(url);
    }
    const t=tabById(active);if(t){t.url=url;t.page="iframe";t.title="🌐 "+url.replace(/^https?:\/\//,"").split("/")[0];renderTabs();persist()}
  };
  function showBlocked(url){Q("#webLoading")?.classList.remove("show");Q("#webBlocked")?.classList.add("show");Q("#webBlockedOpen")&&(Q("#webBlockedOpen").onclick=()=>window.open(url,"_blank","noopener"))}
  Q("#iframeGo")?.addEventListener("click",()=>window.baconLoadUrl(Q("#iframeUrl").value));
  Q("#iframeUrl")?.addEventListener("keydown",e=>{if(e.key==="Enter")window.baconLoadUrl(e.target.value)});
  Q("#webReload")?.addEventListener("click",()=>{const f=Q("#webFrame");if(f)f.src=f.src});
  Q("#webPopout")?.addEventListener("click",()=>{const u=Q("#iframeUrl")?.value;if(u)window.open(u,"_blank","noopener")});
  Q("#webFullscreen")?.addEventListener("click",()=>{Q("#webBrowserBody")?.requestFullscreen?.()});
  Q("#webBack")?.addEventListener("click",()=>{
    const f=Q("#webFrame");
    try{if(BACON_DESKTOP)f?.goBack?.();else f?.contentWindow?.history.back()}catch(e){history.back()}
  });
  Q("#webForward")?.addEventListener("click",()=>{
    const f=Q("#webFrame");
    try{if(BACON_DESKTOP)f?.goForward?.();else f?.contentWindow?.history.forward()}catch(e){history.forward()}
  });

  // Better shortcut handling.
  document.addEventListener("keydown",e=>{
    if(e.ctrlKey&&!e.shiftKey&&e.key.toLowerCase()==="l"){e.preventDefault();Q("#address")?.focus();Q("#address")?.select()}
    if(e.ctrlKey&&!e.shiftKey&&e.key.toLowerCase()==="t"){e.preventDefault();newTab()}
    if(e.ctrlKey&&!e.shiftKey&&e.key.toLowerCase()==="w"){e.preventDefault();closeTab(active)}
    if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==="t"){e.preventDefault();const t=closed.shift();if(t){tabs.push(t);active=t.id;loadTab(t);persist()}}
    if(e.ctrlKey&&e.key==="Tab"){e.preventDefault();const i=tabs.findIndex(t=>t.id===active);active=tabs[(i+1)%tabs.length].id;loadTab(tabById(active))}
    if(e.key==="F11"){e.preventDefault();document.documentElement.requestFullscreen?.()}
  });
  // Bacon OS cards
  $$(".os-card").forEach(card=>card.addEventListener("click",()=>{
    const action=card.dataset.osAction, out=Q("#osConsoleText");
    if(action==="web") showPage("iframe");
    else if(action==="theme") {
      const theme=Q("#themeLab") || Q("[data-theme]");
      const host=Q("#ultimate");
      if(out) out.textContent="Theme Lab is available in Bacon OS. Use the theme controls below.";
      host?.scrollTo?.({top:host.scrollHeight,behavior:"smooth"});
    } else if(action==="privacy") showPage("settings");
    else if(action==="assistant") { if(out) out.textContent="Bacon Assistant is local-only and ready for commands."; }
    else if(out) out.textContent=(card.querySelector("h3")?.textContent||"Module")+" is ready.";
  }));


  // Arcade — local games with persistence and a proper aim challenge.
  (function(){
    const BEST_KEY="baconArcadeBest";
    let ac=Number(localStorage.getItem("baconArcadeClicker")||0);
    const clickScore=Q("#arcadeClickScore"), clickBtn=Q("#arcadeClick");
    if(clickScore) clickScore.textContent=ac;
    clickBtn?.addEventListener("click",()=>{
      ac++;
      localStorage.setItem("baconArcadeClicker",ac);
      if(clickScore) clickScore.textContent=ac;
    });

    const arena=Q("#aimArena"), target=Q("#aimTarget"), aimScore=Q("#aimScore");
    let hits=0, aimRunning=false, aimEnd=0, aimTimer;
    function moveTarget(){
      if(!arena||!target)return;
      const pad=8, w=Math.max(50,arena.clientWidth-58), h=Math.max(50,arena.clientHeight-58);
      target.style.left=(pad+Math.random()*w)+"px";
      target.style.top=(pad+Math.random()*h)+"px";
    }
    function endAim(){
      aimRunning=false;
      clearInterval(aimTimer);
      if(aimScore) aimScore.textContent=hits+" hits • finished!";
    }
    target?.addEventListener("click",()=>{
      if(!aimRunning){
        aimRunning=true; hits=0; aimEnd=Date.now()+15000;
        if(aimScore) aimScore.textContent="0 hits • 15.0s";
        moveTarget();
        aimTimer=setInterval(()=>{
          const left=Math.max(0,aimEnd-Date.now());
          if(left<=0) endAim();
          else if(aimScore) aimScore.textContent=hits+" hits • "+(left/1000).toFixed(1)+"s";
        },100);
      }
      if(aimRunning){
        hits++;
        moveTarget();
        const best=Math.max(hits,Number(localStorage.getItem(BEST_KEY)||0));
        localStorage.setItem(BEST_KEY,best);
        if(aimScore) aimScore.textContent=hits+" hits • "+(Math.max(0,aimEnd-Date.now())/1000).toFixed(1)+"s";
      }
    });
    moveTarget();

    const mg=Q("#memoryGrid");
    const memoryStateKey="baconMemoryStateV2";
    const memoryBestKey="baconMemoryBestV2";
    const memoryChallenges=[
      ["Classic Bacon",["🥓","🎮","🎵","⚡","🔥","🌙"]],
      ["Rivals Rush",["🥓","🔫","🎯","🏆","💥","🕹️"]],
      ["Night Shift",["🌙","⭐","🦇","🌌","🥓","🕯️"]],
      ["Element Clash",["🔥","⚡","❄️","🌊","🌪️","🌿"]],
      ["Party Bacon",["🥓","🍕","🍔","🍩","🎮","🎧"]],
      ["Neon Vault",["💜","💙","💚","💛","🩷","❤️"]]
    ];
    let memoryState;
    try{memoryState=JSON.parse(localStorage.getItem(memoryStateKey)||"null")}catch{memoryState=null}
    function memoryNewChallenge(index){
      const i=(index ?? Math.floor(Math.random()*memoryChallenges.length))%memoryChallenges.length;
      const icons=[...memoryChallenges[i][1],...memoryChallenges[i][1]];
      icons.sort(()=>Math.random()-.5);
      memoryState={challenge:i,deck:icons,matched:[],moves:0,started:Date.now()};
      localStorage.setItem(memoryStateKey,JSON.stringify(memoryState));
      if(mg) mg.innerHTML="";
      if(Q("#memoryStatus"))Q("#memoryStatus").textContent=memoryChallenges[i][0]+" • 0 moves";
      if(Q("#memoryChallengeName"))Q("#memoryChallengeName").textContent=memoryChallenges[i][0];
      let first=null,lock=false;
      icons.forEach((icon,idx)=>{
        const b=document.createElement("button");
        b.type="button"; b.textContent="❔"; b.dataset.icon=icon; b.dataset.index=idx;
        if(memoryState.matched.includes(idx)){b.textContent=icon;b.classList.add("matched")}
        b.onclick=()=>{
          if(lock||b.classList.contains("matched")||b===first)return;
          b.textContent=icon;
          if(!first){first=b;return}
          memoryState.moves++;
          if(first.dataset.icon===b.dataset.icon){
            first.classList.add("matched");b.classList.add("matched");
            memoryState.matched.push(Number(first.dataset.index),Number(b.dataset.index));
            localStorage.setItem(memoryStateKey,JSON.stringify(memoryState));
            first=null;
            if(Q("#memoryStatus"))Q("#memoryStatus").textContent=memoryChallenges[i][0]+" • "+memoryState.moves+" moves";
            if(memoryState.matched.length===icons.length){
              let best=Number(localStorage.getItem(memoryBestKey)||9999);
              if(memoryState.moves<best)localStorage.setItem(memoryBestKey,memoryState.moves);
              if(Q("#memoryStatus"))Q("#memoryStatus").textContent="🏆 COMPLETE • "+memoryState.moves+" moves";
              setTimeout(()=>memoryNewChallenge(i+1),900);
            }
          }else{
            lock=true;
            localStorage.setItem(memoryStateKey,JSON.stringify(memoryState));
            setTimeout(()=>{first.textContent="❔";b.textContent="❔";first=null;lock=false;if(Q("#memoryStatus"))Q("#memoryStatus").textContent=memoryChallenges[i][0]+" • "+memoryState.moves+" moves"},550);
          }
        };
        mg?.appendChild(b);
      });
    }
    if(mg){
      const valid=memoryState && Number.isInteger(memoryState.challenge) && memoryState.deck?.length===12;
      if(valid){
        const idx=memoryState.challenge;
        const icons=memoryState.deck;
        mg.innerHTML="";
        if(Q("#memoryChallengeName"))Q("#memoryChallengeName").textContent=memoryChallenges[idx][0];
        if(Q("#memoryStatus"))Q("#memoryStatus").textContent=memoryChallenges[idx][0]+" • "+memoryState.moves+" moves";
        let first=null,lock=false;
        icons.forEach((icon,pos)=>{
          const b=document.createElement("button");b.type="button";b.textContent="❔";b.dataset.icon=icon;b.dataset.index=pos;
          if(memoryState.matched.includes(pos)){b.textContent=icon;b.classList.add("matched")}
          b.onclick=()=>{
            if(lock||b.classList.contains("matched")||b===first)return;
            b.textContent=icon;
            if(!first){first=b;return}
            memoryState.moves++;
            if(first.dataset.icon===b.dataset.icon){
              first.classList.add("matched");b.classList.add("matched");
              memoryState.matched.push(Number(first.dataset.index),Number(b.dataset.index));
              localStorage.setItem(memoryStateKey,JSON.stringify(memoryState));first=null;
              if(Q("#memoryStatus"))Q("#memoryStatus").textContent=memoryChallenges[idx][0]+" • "+memoryState.moves+" moves";
              if(memoryState.matched.length===icons.length)setTimeout(()=>memoryNewChallenge(idx+1),900);
            }else{
              lock=true;localStorage.setItem(memoryStateKey,JSON.stringify(memoryState));
              setTimeout(()=>{first.textContent="❔";b.textContent="❔";first=null;lock=false;if(Q("#memoryStatus"))Q("#memoryStatus").textContent=memoryChallenges[idx][0]+" • "+memoryState.moves+" moves"},550);
            }
          };
          mg.appendChild(b);
        });
      }else memoryNewChallenge();
    }
    Q("#memoryNewChallenge")?.addEventListener("click",()=>memoryNewChallenge((memoryState?.challenge??-1)+1));
  })();
  // Bacon OS quick tools.
  $$("[data-os-jump]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.osJump)));
  Q("#osSystemCheck")?.addEventListener("click",()=>{
    const checks=[
      ["DOM",!!document.body],["Storage",(()=>{try{localStorage.setItem("_b","1");localStorage.removeItem("_b");return true}catch{return false}})()],
      ["Web Audio",!!window.AudioContext],["Fullscreen",!!document.documentElement.requestFullscreen],
      ["Network",navigator.onLine]
    ];
    const ok=checks.filter(x=>x[1]).length;
    Q("#osConsoleText").textContent="System check: "+ok+"/"+checks.length+" systems ready • "+(navigator.onLine?"ONLINE":"OFFLINE");
  });
  Q("#osClearLocal")?.addEventListener("click",()=>{
    ["baconHistory","baconBookmarks","baconArcadeClicker","baconArcadeBest"].forEach(k=>localStorage.removeItem(k));
    Q("#osConsoleText").textContent="Browser activity + Arcade data cleared locally.";
  });

  // Command palette.
  (function(){
    const palette=Q("#commandPalette"), input=Q("#commandInput"), results=Q("#commandResults");
    const cmds=[
      ["🏠","Home","home"],["✦","Bacon OS","ultimate"],["🕹","Arcade","arcade"],["🎮","Gaming","gaming-pro"],
      ["🎵","Music","music"],["🌐","Web View","iframe"],["⭐","Bookmarks","bookmarks"],["◷","History","history"],
      ["👤","Account","account"],["⚙","Settings","settings"]
    ];
    function render(q=""){
      if(!results)return;
      const f=cmds.filter(x=>(x[1]+" "+x[2]).toLowerCase().includes(q.toLowerCase()));
      results.innerHTML=f.map(x=>`<button type="button" data-command-page="${x[2]}"><b>${x[0]}</b><span>${x[1]}</span><small>bacon://${x[2]}</small></button>`).join("")||"<p>No command found.</p>";
      results.querySelectorAll("[data-command-page]").forEach(b=>b.onclick=()=>{showPage(b.dataset.commandPage);close()});
    }
    function open(){palette?.classList.add("open");palette?.setAttribute("aria-hidden","false");if(input){input.value="";render();setTimeout(()=>input.focus(),20)}}
    function close(){palette?.classList.remove("open");palette?.setAttribute("aria-hidden","true")}
    Q("#commandClose")?.addEventListener("click",close); Q("#commandBackdrop")?.addEventListener("click",close);
    input?.addEventListener("input",e=>render(e.target.value));
    document.addEventListener("keydown",e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();open()}
      if(e.key==="Escape")close();
    });
    render();
  })();

  // Arcade progression.
  (function(){
    const XPKEY="baconArcadeXP", DAYKEY="baconArcadeDailyV3";
    const dailyChallenges=[
      ["🥓 Bacon Tap","Click bacon 25 times",25],
      ["🎯 Target Hunter","Hit 10 aim targets",10],
      ["🧠 Memory Master","Make 8 memory moves",8],
      ["🎮 Arcade Grinder","Play 30 arcade actions",30],
      ["⚡ XP Rush","Earn 20 arcade XP",20]
    ];
    let xp=Number(localStorage.getItem(XPKEY)||0);
    // Use local calendar date so the challenge does not change because of UTC.
    const now=new Date(), today=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");
    let daily=JSON.parse(localStorage.getItem(DAYKEY)||"null");
    const yesterdayDate=new Date(now); yesterdayDate.setDate(now.getDate()-1);
    const yesterday=yesterdayDate.getFullYear()+"-"+String(yesterdayDate.getMonth()+1).padStart(2,"0")+"-"+String(yesterdayDate.getDate()).padStart(2,"0");
    if(!daily || daily.date!==today){
      daily={date:today,challenge:Math.floor(Math.random()*dailyChallenges.length),count:0,streak:daily?.date===yesterday?(daily.streak||0)+1:1,claimed:false};
      localStorage.setItem(DAYKEY,JSON.stringify(daily));
    }
    function paint(){
      const dc=dailyChallenges[daily.challenge]||dailyChallenges[0];
      Q("#arcadeXp")&&(Q("#arcadeXp").textContent=xp+" XP");
      Q("#dailyChallenge")&&(Q("#dailyChallenge").textContent=dc[0]+" — "+dc[1]);
      Q("#dailyProgress")&&(Q("#dailyProgress").textContent=Math.min(dc[2],daily.count)+" / "+dc[2]+(daily.claimed?" ✓":""));
      Q("#arcadeStreak")&&(Q("#arcadeStreak").textContent=daily.streak+" 🔥");
    }
    const oldClick=Q("#arcadeClick");
    oldClick?.addEventListener("click",()=>{
      xp+=1; daily.count+=1;
      const dc=dailyChallenges[daily.challenge]; if(daily.count>=dc[2]){daily.count=dc[2];daily.claimed=true;xp+=25}
      localStorage.setItem(XPKEY,xp);localStorage.setItem(DAYKEY,JSON.stringify(daily));paint();
    });
    target?.addEventListener("click",()=>{
      xp+=2; daily.count+=1;
      const dc=dailyChallenges[daily.challenge]; if(daily.count>=dc[2]){daily.count=dc[2];daily.claimed=true;xp+=25}
      localStorage.setItem(XPKEY,xp);localStorage.setItem(DAYKEY,JSON.stringify(daily));paint();
    });
    paint();
  })();


  // Initial Web View state.
  Q("#webFrame")?.addEventListener("load",()=>Q("#webLoading")?.classList.remove("show"));
})();

/* ===== BACON BROWSER V8 FUSION LAYER ===== */
(function(){
 const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
 const get=(k,d)=>{try{let v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch{return d}}, put=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=u=>{u=(u||'').trim();if(!u)return '';if(/^https?:\/\//i.test(u))return u;if(/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(u))return 'https://'+u;return 'https://www.google.com/search?q='+encodeURIComponent(u)};
 function inside(u){u=norm(u);if(!u)return;if(typeof loadFrame==='function'){showPage('iframe');loadFrame(u)}else{showPage('iframe');q('#webFrame').src=u;q('#iframeUrl').value=u}if(q('#baconNotifications'))q('#baconNotifications').textContent='🌐 Opened '+u;return u}
 function note(m){if(typeof setStatus==='function')setStatus(m);const n=q('#baconNotifications');if(n)n.textContent=m}
 qa('[data-fusion-url]').forEach(b=>b.addEventListener('click',()=>inside(b.dataset.fusionUrl)));
 q('#fusionSearchBtn')?.addEventListener('click',()=>inside(q('#fusionSearch').value));q('#fusionSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter')inside(e.target.value)});
 function clock(){q('#fusionClock')&&(q('#fusionClock').textContent=new Date().toLocaleTimeString());q('#fusionTabs')&&(q('#fusionTabs').textContent=document.querySelectorAll('.tab').length);q('#fusionXp')&&(q('#fusionXp').textContent=(localStorage.getItem('baconXP')||0)+' XP');q('#fusionTheme')&&(q('#fusionTheme').textContent=document.body.dataset.theme||'crimson')}setInterval(clock,1000);clock();
 // Tab islands: save current shell tabs and restore them.
 const IK='baconTabIslandsV1';function renderIslands(){let box=q('#islandGrid');if(!box)return;let a=get(IK,[]);box.innerHTML=a.length?a.map((x,i)=>`<article class="island-card island-${esc(x.color)}"><div class="island-head"><b>🗂 ${esc(x.name)}</b><button data-del-island="${i}">×</button></div><small>${x.tabs.length} saved tabs</small><div class="island-tabs">${x.tabs.slice(0,8).map(t=>`<button data-island-url="${esc(t.url)}">${esc(t.title)}</button>`).join('')}</div><button class="primary" data-restore-island="${i}">RESTORE</button></article>`).join(''):'<div class="empty-v8">No islands yet. Create one.</div>';box.querySelectorAll('[data-del-island]').forEach(b=>b.onclick=()=>{let a=get(IK,[]);a.splice(+b.dataset.delIsland,1);put(IK,a);renderIslands()});box.querySelectorAll('[data-island-url]').forEach(b=>b.onclick=()=>inside(b.dataset.islandUrl));box.querySelectorAll('[data-restore-island]').forEach(b=>b.onclick=()=>{let x=get(IK,[])[+b.dataset.restoreIsland];x.tabs.forEach(t=>inside(t.url));note('🗂 Restoring '+x.name)})}
 q('#newIsland')?.addEventListener('click',()=>{let tabs=[...document.querySelectorAll('.tab')].map(t=>({title:t.innerText.replace('×','').trim(),url:t.dataset.url||'bacon://'+(t.dataset.page||'home')}));let a=get(IK,[]);a.unshift({name:q('#islandName').value.trim()||'My Bacon Island',color:q('#islandColor').value,tabs,updated:Date.now()});put(IK,a);q('#islandName').value='';renderIslands();note('🗂 Island created')});q('#saveIsland')?.addEventListener('click',()=>q('#newIsland')?.click());renderIslands();
 // Gaming hub
 function bench(out){let n=0,t=performance.now();function f(x){n++;if(x-t<1000)requestAnimationFrame(f);else out.textContent=n+' FPS'}requestAnimationFrame(f)}q('#hubFpsBtn')?.addEventListener('click',()=>bench(q('#hubFps')));q('#hubPingBtn')?.addEventListener('click',async()=>{let o=q('#hubPing'),t=performance.now();try{await fetch(location.href,{cache:'no-store'});o.textContent=Math.round(performance.now()-t)+' ms'}catch{o.textContent='N/A'}});q('#hubMemBtn')?.addEventListener('click',()=>q('#hubMem').textContent=performance.memory?(performance.memory.usedJSHeapSize/1048576).toFixed(1)+' MB':'Not exposed');q('#hubBatteryBtn')?.addEventListener('click',async()=>{let o=q('#hubBattery');if(!navigator.getBattery){o.textContent='N/A';return}let b=await navigator.getBattery();o.textContent=Math.round(b.level*100)+'%'+(b.charging?' ⚡':'')});q('#fusionGamingMode')?.addEventListener('click',()=>{document.body.classList.toggle('gaming-mode');localStorage.setItem('baconV8Gaming',document.body.classList.contains('gaming-mode')?'1':'0');q('#fusionGamingMode').textContent=document.body.classList.contains('gaming-mode')?'🛑 GAMING MODE ON':'🎮 GAMING MODE';note('Gaming Mode '+(document.body.classList.contains('gaming-mode')?'ON':'OFF'))});if(localStorage.getItem('baconV8Gaming')==='1'){document.body.classList.add('gaming-mode');q('#fusionGamingMode')&&(q('#fusionGamingMode').textContent='🛑 GAMING MODE ON')}qa('[data-v8-effect]').forEach(b=>b.onclick=()=>document.body.classList.toggle(b.dataset.v8Effect));q('#hubResetFx')?.addEventListener('click',()=>['shader-bloom','shader-contrast','shader-cool','shader-warm','reduce-motion'].forEach(c=>document.body.classList.remove(c)));
 // Music studio mirrors the existing real player, including uploaded audio.
 q('#studioPlay')?.addEventListener('click',()=>q('#play')?.click());q('#studioPrev')?.addEventListener('click',()=>q('#prev')?.click());q('#studioNext')?.addEventListener('click',()=>q('#next')?.click());q('#fusionMiniPlay')?.addEventListener('click',()=>q('#play')?.click());q('#studioUpload')?.addEventListener('click',()=>q('#musicUploadBtn')?.click());q('#studioShuffle')?.addEventListener('click',e=>{e.currentTarget.classList.toggle('selected');e.currentTarget.textContent=e.currentTarget.classList.contains('selected')?'🔀 SHUFFLE: ON':'🔀 SHUFFLE'});q('#studioRepeat')?.addEventListener('click',e=>{e.currentTarget.classList.toggle('selected');e.currentTarget.textContent=e.currentTarget.classList.contains('selected')?'🔁 REPEAT: ON':'🔁 REPEAT: OFF'});q('#studioVolume')?.addEventListener('input',e=>{if(q('#mainMusicVolume')){q('#mainMusicVolume').value=e.target.value;q('#mainMusicVolume').dispatchEvent(new Event('input'))}});setInterval(()=>{if(q('#studioTrack')&&q('#trackName'))q('#studioTrack').textContent=q('#trackName').textContent;if(q('#studioProgress')&&q('#progress'))q('#studioProgress').style.width=q('#progress').style.width||'0%'},200);
 // Toolbox
 q('#v8CalcBtn')?.addEventListener('click',()=>{let v=q('#v8Calc').value.trim(),o=q('#v8CalcOut');if(!/^[0-9+\-*/().%\s]+$/.test(v)){o.value='Invalid';return}try{o.value=String(Function('"use strict";return ('+v+')')())}catch{o.value='Error'}});let timer=null;q('#v8TimerBtn')?.addEventListener('click',()=>{clearInterval(timer);let n=Math.max(1,+q('#v8Timer').value||60),o=q('#v8TimerOut');o.textContent=n+'s';timer=setInterval(()=>{n--;o.textContent=n?n+'s':'DONE 🔔';if(!n)clearInterval(timer)},1000)});if(q('#v8Notes'))q('#v8Notes').value=localStorage.getItem('baconV8Notes')||'';q('#v8NotesSave')?.addEventListener('click',()=>{localStorage.setItem('baconV8Notes',q('#v8Notes').value);note('📝 Notes saved')});q('#v8Color')?.addEventListener('input',e=>q('#v8ColorPreview').style.background=e.target.value);q('#v8ColorApply')?.addEventListener('click',()=>{let c=q('#v8Color').value;document.documentElement.style.setProperty('--accent',c);document.documentElement.style.setProperty('--accent2',c);localStorage.setItem('baconV8Accent',c);note('🎨 Accent applied')});
 // Privacy
 function pstats(){let o=q('#privacyStats');if(o)o.innerHTML='<div class="privacy-stat-v8"><b>'+Object.keys(localStorage).length+'</b><span>local keys</span></div><div class="privacy-stat-v8"><b>'+((localStorage.getItem('baconHistory')||'').length)+'</b><span>history chars</span></div><div class="privacy-stat-v8"><b>'+((localStorage.getItem('baconBookmarks')||'').length)+'</b><span>bookmark chars</span></div>'}pstats();q('#privacyClearHistory')?.addEventListener('click',()=>{localStorage.removeItem('baconHistory');pstats();note('🧹 History cleared')});q('#privacyClearBookmarks')?.addEventListener('click',()=>{localStorage.removeItem('baconBookmarks');pstats();note('🔖 Bookmarks cleared')});q('#privacyClearApp')?.addEventListener('click',()=>{if(confirm('Clear all Bacon Browser local data?')){localStorage.clear();location.reload()}});let pv=localStorage.getItem('baconV8Private')==='1';q('#privacyPrivate')?.addEventListener('click',()=>{pv=!pv;localStorage.setItem('baconV8Private',pv?'1':'0');q('#privacyPrivate').textContent='🕵️ Private Session: '+(pv?'ON':'OFF')});
 // Achievements
 const ach=[['Fusion Explorer',25,'Opened Fusion Home'],['Island Architect',50,'Created a tab island'],['Game On',50,'Used Gaming Hub'],['Beat Maker',25,'Opened Music Studio'],['Toolbox Hero',25,'Used Toolbox'],['Privacy Pilot',25,'Opened Privacy Center'],['Social Hopper',25,'Opened Social'],['Split Vision',50,'Used Split Screen']];function renderAch(){let box=q('#achievementGridV8');if(!box)return;let d=get('baconV8Achievements',{}),xp=+(localStorage.getItem('baconXP')||0),lv=Math.floor(xp/100)+1,within=xp%100;if(q('#v8XpTotal'))q('#v8XpTotal').textContent=xp+' XP';if(q('#v8LevelBadge'))q('#v8LevelBadge').textContent='LEVEL '+lv;if(q('#v8XpNext'))q('#v8XpNext').textContent=(100-within)+' XP to next level';if(q('#v8XpBar'))q('#v8XpBar').style.width=within+'%';box.innerHTML=ach.map(a=>`<button class="v8-ach ${d[a[2]]?'earned':''}" data-v8-ach="${esc(a[2])}" data-v8-xp="${a[1]}"><b>${a[0]}</b><small>${a[1]} XP • ${a[2]}</small></button>`).join('');box.querySelectorAll('[data-v8-ach]').forEach(b=>b.onclick=()=>{let d=get('baconV8Achievements',{});if(d[b.dataset.v8Ach])return;d[b.dataset.v8Ach]=Date.now();put('baconV8Achievements',d);if(window.gainXP)gainXP(+b.dataset.v8Xp,b.dataset.v8Ach);else{xp+=+b.dataset.v8Xp;localStorage.setItem('baconXP',xp)}renderAch()})}renderAch();setInterval(renderAch,1000);
 // Mods
 qa('[data-v8-mod]').forEach(b=>b.onclick=()=>{let c=b.dataset.v8Mod;document.body.classList.toggle(c);localStorage.setItem('baconV8Mod:'+c,document.body.classList.contains(c)?'1':'0');b.classList.toggle('selected',document.body.classList.contains(c))});['bacon-particles','live-bg','bacon-cursor','reduce-motion','force-dark-frame'].forEach(c=>{if(localStorage.getItem('baconV8Mod:'+c)==='1')document.body.classList.add(c)});
 let snd=localStorage.getItem('baconV8Sound')==='1';q('#v8SoundMod')?.addEventListener('click',()=>{snd=!snd;localStorage.setItem('baconV8Sound',snd?'1':'0');note('⌨️ UI sounds '+(snd?'ON':'OFF'))});
 // Split screen
 q('#v8SplitLoad')?.addEventListener('click',()=>{q('#v8Left').src=norm(q('#v8SplitLeftUrl').value);q('#v8Right').src=norm(q('#v8SplitRightUrl').value);q('#v8Split').classList.add('active');note('🪟 Split Screen 2.0 active')});q('#v8SplitExternal')?.addEventListener('click',()=>{window.open(norm(q('#v8SplitLeftUrl').value),'_blank','noopener');window.open(norm(q('#v8SplitRightUrl').value),'_blank','noopener')});
 // Local assistant
 const routes=[['gaming','gaming-hub'],['music','music-studio'],['roblox','https://www.roblox.com'],['clan','https://baconclan.pages.dev'],['arcade','arcade'],['settings','settings'],['privacy','privacy-center'],['achievement','achievements'],['island','tab-islands'],['tool','toolbox'],['split','split-screen'],['social','social'],['home','dashboard'],['fusion','dashboard'],['os','os-lab']];function ai(v){v=(v||'').toLowerCase();let hit=routes.find(x=>v.includes(x[0]));if(!hit){q('#v8AssistantOutput')&&(q('#v8AssistantOutput').textContent='Try gaming, music, roblox, clan, arcade, settings, privacy, split, social, toolbox or home.');return}hit[1].startsWith('http')?inside(hit[1]):showPage(hit[1]);q('#v8AssistantOutput')&&(q('#v8AssistantOutput').textContent='✓ Executed '+hit[0])}q('#v8AssistantRun')?.addEventListener('click',()=>ai(q('#v8AssistantInput').value));q('#v8AssistantInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')ai(e.target.value)});qa('[data-ai]').forEach(b=>b.onclick=()=>ai(b.dataset.ai));
})();

/* ===== BACON V9 POWER DECK ===== */
(function(){
  const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
  const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
  const put=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const KE={ext:'baconExtensionsV9',dl:'baconDownloadsV9',groups:'baconGroupsV9',perm:'baconPermissionsV9'};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const defaults=[{name:'Bacon Ad Blocker',enabled:true,desc:'Demo content blocker'}, {name:'Bacon Dark Reader',enabled:true,desc:'Frame-friendly dark mode'}, {name:'FPS Bacon',enabled:false,desc:'Performance overlay'}, {name:'Discord Quick Tools',enabled:true,desc:'Quick Discord shortcuts'}];
  function toast(m){if(typeof window.setStatus==='function')window.setStatus(m);const n=q('#baconNotifications');if(n){n.textContent=m;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),1800)}}
  function renderExtensions(){const box=q('#extensionList');if(!box)return;let a=get(KE.ext,defaults);box.innerHTML=a.map((x,i)=>`<div class="extension-row"><div><b>🧩 ${esc(x.name)}</b><small>${esc(x.desc||'Local extension')}</small></div><button data-ext="${i}">${x.enabled?'ON':'OFF'}</button></div>`).join('');qa('[data-ext]').forEach(b=>b.onclick=()=>{let a=get(KE.ext,defaults);a[+b.dataset.ext].enabled=!a[+b.dataset.ext].enabled;put(KE.ext,a);renderExtensions();toast((a[+b.dataset.ext].enabled?'🧩 Enabled ':'🧩 Disabled ')+a[+b.dataset.ext].name)})}
  function renderDownloads(){const box=q('#downloadList');if(!box)return;let a=get(KE.dl,[]);box.innerHTML=a.length?a.map((x,i)=>`<div class="download-row"><div><b>📦 ${esc(x.name)}</b><small>${esc(x.status)} • ${new Date(x.time).toLocaleTimeString()}</small></div><button data-dl="${i}">×</button></div>`).join(''):'<div class="muted">No downloads yet.</div>';qa('[data-dl]').forEach(b=>b.onclick=()=>{let a=get(KE.dl,[]);a.splice(+b.dataset.dl,1);put(KE.dl,a);renderDownloads()})}
  function renderGroups(){const box=q('#groupList');if(!box)return;let a=get(KE.groups,[]);box.innerHTML=a.length?a.map((x,i)=>`<div class="group-row"><div><b><span style="color:${esc(x.color)}">●</span> ${esc(x.name)}</b><small>${x.tabs||0} tabs • local group</small></div><button data-group="${i}">DELETE</button></div>`).join(''):'<div class="muted">No tab groups yet.</div>';qa('[data-group]').forEach(b=>b.onclick=()=>{let a=get(KE.groups,[]);a.splice(+b.dataset.group,1);put(KE.groups,a);renderGroups()})}
  function renderPerms(){const box=q('#permissionList');if(!box)return;let p=get(KE.perm,{camera:'Ask',microphone:'Ask',location:'Ask',notifications:'Ask'});box.innerHTML=Object.entries(p).map(([k,v])=>`<div class="permission-row"><div><b>${k[0].toUpperCase()+k.slice(1)}</b><small>Browser-controlled permission state</small></div><button data-permstate="${k}">${v}</button></div>`).join('');qa('[data-permstate]').forEach(b=>b.onclick=()=>{let p=get(KE.perm,{camera:'Ask',microphone:'Ask',location:'Ask',notifications:'Ask'});p[b.dataset.permstate]=p[b.dataset.permstate]==='Allow'?'Block':p[b.dataset.permstate]==='Block'?'Ask':'Allow';put(KE.perm,p);renderPerms()})}
  function dev(tab){const out=q('#devOutput');if(!out)return;const ext=get(KE.ext,defaults),dl=get(KE.dl,[]),gr=get(KE.groups,[]);if(tab==='elements')out.textContent='BACON DOM\n├─ header.topbar\n├─ nav.sidebar\n├─ main.pages\n└─ iframe#webFrame\n\nDevTools shell ready.';if(tab==='console')out.textContent='Console ready.\n> Bacon Browser V9\n> No errors detected in shell startup.';if(tab==='network')out.textContent='Network\nGET /index.html     200\nGET /css/style.css   200\nGET /js/browser.js   200\n\nEmbedded sites may reject iframe requests.';if(tab==='storage')out.textContent='Local Storage\nExtensions: '+ext.length+'\nDownloads: '+dl.length+'\nTab groups: '+gr.length+'\nKeys: '+Object.keys(localStorage).length}
  function bind(){
    q('#installExtension')?.addEventListener('click',()=>{let name=q('#extensionName').value.trim();if(!name)return toast('Type an extension name first.');let a=get(KE.ext,defaults);a.push({name,enabled:true,desc:'Custom local extension'});put(KE.ext,a);q('#extensionName').value='';renderExtensions();toast('🧩 Extension installed: '+name)});
    q('#clearDownloads')?.addEventListener('click',()=>{put(KE.dl,[]);renderDownloads();toast('🧹 Downloads cleared')});
    q('#createGroup')?.addEventListener('click',()=>{let name=q('#groupName').value.trim()||'New Bacon Group',color=q('#groupColor').value;let a=get(KE.groups,[]);a.push({name,color,tabs:0});put(KE.groups,a);q('#groupName').value='';renderGroups();toast('🗂 Created '+name)});
    q('#resetPermissions')?.addEventListener('click',()=>{put(KE.perm,{camera:'Ask',microphone:'Ask',location:'Ask',notifications:'Ask'});renderPerms();toast('🔐 Permissions reset')});
    qa('[data-devtab]').forEach(b=>b.onclick=()=>{qa('[data-devtab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');dev(b.dataset.devtab)});dev('elements');
    q('#devRun')?.addEventListener('click',()=>{let c=q('#devCommand').value.trim().toLowerCase(),out=q('#devOutput');if(c==='stats')out.textContent='Bacon Browser V9\nTabs: '+document.querySelectorAll('.tab').length+'\nHistory: '+get('baconHistory',[]).length+'\nBookmarks: '+get('baconBookmarks',[]).length;else if(c==='storage')dev('storage');else if(c==='tabs')out.textContent=[...document.querySelectorAll('.tab')].map((t,i)=>(i+1)+'. '+t.innerText.trim()).join('\n')||'No tabs';else if(c==='theme')out.textContent='Theme: '+(document.body.dataset.theme||'crimson');else out.textContent='Unknown command. Try: stats, storage, tabs, theme';});
    qa('[data-device]').forEach(b=>b.onclick=()=>setDevice(b.dataset.device));
    q('#deviceWidth')?.addEventListener('input',e=>{q('#deviceWidthValue').textContent=e.target.value+'px';const f=q('#deviceFrame');if(f&&!f.classList.contains('phone-frame')&&!f.classList.contains('tablet-frame'))f.style.width=e.target.value+'px'});
    setDevice('desktop');
  }
  function setDevice(type){const f=q('#deviceFrame'),r=q('#deviceWidth');if(!f)return;f.classList.remove('phone-frame','tablet-frame','laptop-frame','desktop-frame');f.classList.add(type+'-frame');if(type==='phone')r.value=390;if(type==='tablet')r.value=768;if(type==='laptop')r.value=1100;if(type==='desktop')r.value=900;q('#deviceWidthValue').textContent=r.value+'px';f.style.width='';}
  document.addEventListener('DOMContentLoaded',()=>{bind();renderExtensions();renderDownloads();renderGroups();renderPerms();});
})();

/* =========================================================
   BACON BROWSER V12 — QUICK SEARCH
   ========================================================= */

(function () {
  function v12NormalizeUrl(value) {
    value = (value || "").trim();

    if (!value) return "";

    // Already a web URL
    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    // Looks like a website
    if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) {
      return "https://" + value;
    }

    // Otherwise search Google
    return "https://www.google.com/search?q=" +
      encodeURIComponent(value);
  }

  function v12Open(value) {
    const url = v12NormalizeUrl(value);

    if (!url) return;

    // Use Bacon Browser's existing navigation system
    if (typeof window.baconLoadUrl === "function") {
      window.baconLoadUrl(url);
      return;
    }

    // Fallback to the existing iframe
    if (typeof window.loadFrame === "function") {
      if (typeof window.showPage === "function") {
        window.showPage("iframe");
      }

      window.loadFrame(url);
      return;
    }

    const frame = document.querySelector("#webFrame");

    if (frame) {
      frame.src = url;
      return;
    }

    // Final fallback
    window.open(url, "_blank", "noopener");
  }

  function initV12Search() {
    const form = document.querySelector("#v12SearchForm");
    const input = document.querySelector("#v12Search");

    if (form && input) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        v12Open(input.value);
      });
    }

    document
      .querySelectorAll("[data-fusion-url]")
      .forEach(function (button) {
        button.addEventListener("click", function () {
          v12Open(button.dataset.fusionUrl);
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initV12Search);
  } else {
    initV12Search();
  }
})();

/* =========================================================
   BACON BROWSER V12 — GAMING HUB
   ========================================================= */

(function () {
  function openGamingHub() {
    const gamingHub = document.querySelector("#gaming-hub");

    if (!gamingHub) {
      console.warn("Bacon Browser: Gaming Hub not found.");
      return;
    }

    // Hide every page
    document.querySelectorAll(".page").forEach(function (page) {
      page.classList.remove("active");
    });

    // Show Gaming Hub
    gamingHub.classList.add("active");

    // Update navigation buttons if the browser uses them
    document.querySelectorAll("[data-page]").forEach(function (button) {
      button.classList.remove("active");
    });

    document
      .querySelectorAll('[data-page="gaming-hub"]')
      .forEach(function (button) {
        button.classList.add("active");
      });

    // Update status text
    const status = document.querySelector("#status");

    if (status) {
      status.textContent = "Gaming Hub ready";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function initV12GamingHub() {
    document
      .querySelectorAll('[data-page="gaming-hub"]')
      .forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          openGamingHub();
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initV12GamingHub);
  } else {
    initV12GamingHub();
  }
})();

/* =========================================================
   BACON BROWSER V12 — GAMING MODE
   ========================================================= */

(function () {
  const STORAGE_KEY = "baconBrowserGamingMode";

  function setGamingMode(enabled) {
    document.body.classList.toggle("gaming-mode", enabled);

    localStorage.setItem(
      STORAGE_KEY,
      enabled ? "on" : "off"
    );

    document.querySelectorAll(
      '[data-gaming-mode], #gamingMode, #gamingModeToggle'
    ).forEach(function (button) {
      button.classList.toggle("active", enabled);

      if (button.tagName === "INPUT") {
        button.checked = enabled;
      }
    });

    const status = document.querySelector("#status");

    if (status) {
      status.textContent = enabled
        ? "Gaming Mode enabled ⚡"
        : "Systems ready";
    }
  }

  function initGamingMode() {
    const saved = localStorage.getItem(STORAGE_KEY);

    setGamingMode(saved === "on");

    document.querySelectorAll(
      '[data-gaming-mode], #gamingMode, #gamingModeToggle'
    ).forEach(function (button) {
      button.addEventListener("click", function () {
        const enabled =
          !document.body.classList.contains("gaming-mode");

        setGamingMode(enabled);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initGamingMode
    );
  } else {
    initGamingMode();
  }
})();

/* =========================================================
   BACON BROWSER V12 — POWER CORE CONTROLS
   ========================================================= */

(function () {
  const SOUND_KEY = "baconBrowserSound";
  const EFFECTS_KEY = "baconBrowserEffects";

  function getSaved(key, defaultValue) {
    const saved = localStorage.getItem(key);

    if (saved === null) {
      return defaultValue;
    }

    return saved === "on";
  }

  function updateControl(button, enabled, onText, offText) {
    if (!button) return;

    button.classList.toggle("active", enabled);

    const status = button.querySelector("strong");

    if (status) {
      status.textContent = enabled ? onText : offText;
    }
  }

  function setSound(enabled) {
    localStorage.setItem(
      SOUND_KEY,
      enabled ? "on" : "off"
    );

    document.body.classList.toggle(
      "browser-sound-off",
      !enabled
    );

    updateControl(
      document.querySelector("#v12SoundToggle"),
      enabled,
      "ON",
      "OFF"
    );
  }

  function setEffects(enabled) {
    localStorage.setItem(
      EFFECTS_KEY,
      enabled ? "on" : "off"
    );

    document.body.classList.toggle(
      "browser-effects-off",
      !enabled
    );

    updateControl(
      document.querySelector("#v12EffectsToggle"),
      enabled,
      "ON",
      "OFF"
    );
  }

  function resetBrowserSettings() {
    localStorage.removeItem("baconBrowserGamingMode");
    localStorage.removeItem(SOUND_KEY);
    localStorage.removeItem(EFFECTS_KEY);

    document.body.classList.remove(
      "gaming-mode",
      "browser-sound-off",
      "browser-effects-off"
    );

    setSound(true);
    setEffects(true);

    const status = document.querySelector("#status");

    if (status) {
      status.textContent = "Browser settings reset";
    }

    alert("🥓 Bacon Browser settings have been reset.");
  }

  function initPowerCore() {
    const soundButton =
      document.querySelector("#v12SoundToggle");

    const effectsButton =
      document.querySelector("#v12EffectsToggle");

    const resetButton =
      document.querySelector("#v12ResetSettings");

    // Restore saved settings
    setSound(getSaved(SOUND_KEY, true));
    setEffects(getSaved(EFFECTS_KEY, true));

    // Sound
    if (soundButton) {
      soundButton.addEventListener("click", function () {
        const enabled =
          !document.body.classList.contains(
            "browser-sound-off"
          );

        setSound(!enabled);
      });
    }

    // Visual effects
    if (effectsButton) {
      effectsButton.addEventListener("click", function () {
        const enabled =
          !document.body.classList.contains(
            "browser-effects-off"
          );

        setEffects(!enabled);
      });
    }

    // Reset
    if (resetButton) {
      resetButton.addEventListener(
        "click",
        resetBrowserSettings
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initPowerCore
    );
  } else {
    initPowerCore();
  }
})();

/* =========================================================
   BACON BROWSER V12 — THEME ENGINE 2.0
   ========================================================= */

(function () {
  const THEME_KEY = "baconBrowserTheme";

  function applyTheme(theme) {
    if (!theme) theme = "crimson";

    document.body.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);

    document.querySelectorAll("[data-theme]").forEach(function (button) {
      button.classList.toggle(
        "active",
        button.dataset.theme === theme
      );
    });

    const status = document.querySelector("#status");
    if (status) {
      status.textContent =
        theme.charAt(0).toUpperCase() +
        theme.slice(1) +
        " theme enabled";
    }
  }

  function initThemeEngine() {
    const savedTheme =
      localStorage.getItem(THEME_KEY) ||
      document.body.dataset.theme ||
      "crimson";

    applyTheme(savedTheme);

    document.querySelectorAll("[data-theme]").forEach(function (button) {
      button.addEventListener("click", function () {
        applyTheme(button.dataset.theme);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initThemeEngine
    );
  } else {
    initThemeEngine();
  }
})();

/* =========================================================
   BACON BROWSER V12 — SETTINGS PERSISTENCE
   ========================================================= */

(function () {
  const SETTINGS_KEY = "baconBrowserSettings";

  function saveSettings() {
    const settings = {
      turbo: document.querySelector("#turbo")?.checked ?? true,
      showStats: document.querySelector("#showStats")?.checked ?? true,
      compact: document.querySelector("#compact")?.checked ?? false,
      startup: document.querySelector("#settingStartup")?.value ?? "home",
      search: document.querySelector("#settingSearch")?.value ?? "google",
      history: document.querySelector("#settingHistory")?.checked ?? true,
      sidebar: document.querySelector("#settingSidebar")?.checked ?? false,
      motion: document.querySelector("#settingMotion")?.checked ?? false,
      dark: document.querySelector("#settingDark")?.checked ?? false,
      transparency:
        document.querySelector("#settingTransparency")?.value ?? 70,
      profile:
        document.querySelector("#settingProfile")?.value ?? "Bacon User"
    };

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );

    const saved = document.querySelector("#settingsSaved");

    if (saved) {
      saved.textContent = "✓ Settings saved";
      setTimeout(function () {
        saved.textContent = "";
      }, 2000);
    }
  }

  function loadSettings() {
    const raw = localStorage.getItem(SETTINGS_KEY);

    if (!raw) return;

    let settings;

    try {
      settings = JSON.parse(raw);
    } catch {
      return;
    }

    const setChecked = function (id, value) {
      const element = document.querySelector(id);
      if (element) element.checked = !!value;
    };

    const setValue = function (id, value) {
      const element = document.querySelector(id);
      if (element && value !== undefined) {
        element.value = value;
      }
    };

    setChecked("#turbo", settings.turbo);
    setChecked("#showStats", settings.showStats);
    setChecked("#compact", settings.compact);

    setValue("#settingStartup", settings.startup);
    setValue("#settingSearch", settings.search);

    setChecked("#settingHistory", settings.history);
    setChecked("#settingSidebar", settings.sidebar);
    setChecked("#settingMotion", settings.motion);
    setChecked("#settingDark", settings.dark);

    setValue("#settingTransparency", settings.transparency);
    setValue("#settingProfile", settings.profile);
  }

  function resetSettings() {
    localStorage.removeItem(SETTINGS_KEY);

    location.reload();
  }

  function initSettingsPersistence() {
    loadSettings();

    const saveButton =
      document.querySelector("#saveBrowserSettings");

    if (saveButton) {
      saveButton.addEventListener(
        "click",
        saveSettings
      );
    }

    const resetButton =
      document.querySelector("#resetBrowserSettings");

    if (resetButton) {
      resetButton.addEventListener(
        "click",
        resetSettings
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initSettingsPersistence
    );
  } else {
    initSettingsPersistence();
  }
})();

/* =========================================================
   BACON BROWSER V12 — SETTINGS EFFECTS
   ========================================================= */

(function () {
  function applySettingEffects() {
    const settings = localStorage.getItem("baconBrowserSettings");

    if (!settings) return;

    let data;

    try {
      data = JSON.parse(settings);
    } catch {
      return;
    }

    document.body.classList.toggle(
      "turbo-off",
      data.turbo === false
    );

    document.body.classList.toggle(
      "compact-sidebar",
      data.compact === true || data.sidebar === true
    );

    document.body.classList.toggle(
      "reduce-motion",
      data.motion === true
    );

    document.body.classList.toggle(
      "dark-webview",
      data.dark === true
    );

    if (data.transparency !== undefined) {
      document.documentElement.style.setProperty(
        "--panel-opacity",
        String(Number(data.transparency) / 100)
      );
    }

    const stats = document.querySelector("#performanceStats");

    if (stats) {
      stats.style.display =
        data.showStats === false ? "none" : "";
    }
  }

  function initSettingEffects() {
    applySettingEffects();

    const saveButton =
      document.querySelector("#saveBrowserSettings");

    if (saveButton) {
      saveButton.addEventListener(
        "click",
        function () {
          setTimeout(applySettingEffects, 50);
        }
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initSettingEffects
    );
  } else {
    initSettingEffects();
  }
})();
