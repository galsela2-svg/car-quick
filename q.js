(function(){
var HOST='212.199.106.46';
if(location.host!=HOST){location.href='http://'+HOST+'/';return;}
var d=document;
var old=d.querySelector('.qbx');if(old){old.remove();return;}
function ld(k,def){try{var v=JSON.parse(localStorage.getItem(k));return v==null?def:v;}catch(e){return def;}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function clean(t){return (t||'').replace(/\s+/g,' ').trim();}
function getDoc(url){return fetch(url,{credentials:'same-origin'}).then(function(r){return r.text();}).then(function(h){return new DOMParser().parseFromString(h,'text/html');});}
function orderForm(doc){var s=doc.querySelector('[name="submit_order"]');return doc.querySelector('form[name="regular_order"]')||(s?s.form:null);}
function loginForm(doc){var b=doc.querySelector('[name="front_login_btn"]');return b?b.form:null;}
function ser(f){var b=new URLSearchParams();Array.prototype.forEach.call(f.elements,function(e){if(!e.name||e.disabled)return;var t=(e.type||'').toLowerCase();if(t=='submit'||t=='button'||t=='reset'||t=='file')return;if((t=='checkbox'||t=='radio')&&!e.checked)return;b.append(e.name,e.value);});return b;}
var PR=ld('qbu',null);
if(!PR){var c0=ld('qbc',null);PR={list:c0&&c0.c?[{u:c0.u,c:c0.c}]:[],cur:0};sv('qbu',PR);}
(function(){var gi=-1;PR.list.forEach(function(p,i){if(gi<0&&clean(p.u)=='גל')gi=i;});if(gi<0&&PR.list.length)gi=0;if(gi>=0&&PR.cur!=gi){PR.cur=gi;sv('qbu',PR);}})();
function cur(){return PR.list[PR.cur]||null;}
function addUser(){return ask(PR.list.length?'הוספת משתמש':'כניסה לאתר הרכבים','הפרטים נשמרים רק בטלפון',[{label:'שם משתמש'},{label:'קוד כניסה',type:'password'}],'שמור והתחבר','ביטול').then(function(v){if(!v||!v[1])return null;PR.list.push({u:v[0].trim(),c:v[1].trim()});PR.cur=PR.list.length-1;sv('qbu',PR);return cur();});}
function creds(){var c=cur();return c?Promise.resolve(c):addUser();}
function doLoginWith(lf,c){
Array.prototype.forEach.call(lf.querySelectorAll('input'),function(i){var t=(i.type||'text').toLowerCase();if(t=='password')i.value=c.c;else if(t=='text'||t=='tel'||t=='number'||t=='email')i.value=c.u;});
var loc=lf.querySelector('[name="location"]');if(loc)loc.value='/order.php';
var body=ser(lf);body.append('front_login_btn','כניסה');
return fetch(lf.getAttribute('action')||'/login.php',{method:'POST',body:body,credentials:'same-origin'}).then(function(){return getDoc('/order.php');});
}
function doLogin(lf){return creds().then(function(c){if(!c)throw 'הכניסה בוטלה';return doLoginWith(lf,c);});}
function loginAs(p){return fetch('/logout.php',{credentials:'same-origin'}).catch(function(){}).then(function(){return getDoc('/order.php');}).then(function(doc){var lf=loginForm(doc);if(!lf)return doc;return doLoginWith(lf,p);});}
var ORD_ALL=false,RET=null;
function allOrders(){
var res=[],orig=PR.cur,chain=Promise.resolve();
PR.list.forEach(function(p,i){chain=chain.then(function(){return loginAs(p);}).then(function(){return getDoc('/my_orders.php');}).then(function(d2){if(loginForm(d2))return;parseMyOrders(d2).forEach(function(o){o.owner=i;res.push(o);});});});
return chain.then(function(){return loginAs(PR.list[orig]);}).then(function(){res.sort(function(a,b){return (a.s||0)-(b.s||0);});return res;});
}
function asOwner(o,fn){if(o.owner==null||o.owner==PR.cur)return fn();loading('מתחבר כ'+PR.list[o.owner].u+'…');PR.cur=o.owner;sv('qbu',PR);STALE=true;loginAs(cur()).then(fn,function(e){say(String(e)).then(ordersView);});}
function withLogin(url){return getDoc(url).then(function(doc){var lf=loginForm(doc);if(!lf)return doc;return doLogin(lf).then(function(){return getDoc(url);}).then(function(doc2){if(loginForm(doc2)){var bad=cur();PR.list.splice(PR.cur,1);PR.cur=0;sv('qbu',PR);throw 'הכניסה נכשלה עבור '+(bad?bad.u:'המשתמש')+' - שם המשתמש או הקוד שגויים. פתח שוב והזן אותם מחדש';}return doc2;});});}
var WHO='',FIXED=false;
function relogin(){
form=null;loading('מתחבר'+(cur()?' כ'+cur().u:'')+'…');
fetch('/logout.php',{credentials:'same-origin'}).catch(function(){}).then(function(){return withLogin('/order.php');})
.then(function(doc){var f=orderForm(doc);if(!f)throw 'לא נמצא דף ההזמנה באתר';init(f);})
.catch(function(e){say(String(e)).then(function(){box.remove();});});
}
function switchUser(i){if(i==PR.cur&&form)return;PR.cur=i;sv('qbu',PR);relogin();}
var form=null,DEST=[],CARS=[],GRPS=[];
function q(n){return form.querySelector('[name="'+n+'"]');}
function shownOpt(o){if(o.disabled||o.hidden)return false;if(o.style&&o.style.display=='none')return false;var g=o.parentNode;if(g&&g.tagName=='OPTGROUP'&&(g.disabled||g.hidden||(g.style&&g.style.display=='none')))return false;return true;}
function opts(n){var s=q(n);if(!s)return [];return Array.prototype.filter.call(s.options,shownOpt).map(function(o){return {v:o.value,t:clean(o.text)};}).filter(function(o){return o.v!=='-1'&&o.v!=='';});}
function init(f){
form=f;DEST=opts('dest');CARS=opts('req_car_id');GRPS=[];
Array.prototype.forEach.call(form.querySelectorAll('input[type="radio"][name^="grp_val_"]'),function(r){var id=r.name.slice(8);if(GRPS.some(function(g){return g.id==id;}))return;var tr=r.closest('tr');var nm=tr?tr.querySelector('.grp-name'):null;GRPS.push({id:id,t:clean(nm?nm.textContent:'סוג '+id)});});
if(!DEST.some(function(x){return x.v==S.dest;}))S.dest='';
var wl=f.ownerDocument.querySelector('[id="user-welcome"] div');WHO=wl?clean(wl.textContent):'';
if(WHO&&cur()&&cur().u&&WHO.indexOf(cur().u)<0&&!FIXED){FIXED=true;relogin();return;}
if(RET=='orders'){RET=null;ordersView();return;}
draw();setTimeout(toTop,50);
}
var F=ld('qbf',['ראש העין','אשדוד','גדרה']),P={};
function p2(n){return (n<10?'0':'')+n;}
function iso(t){return t.getFullYear()+'-'+p2(t.getMonth()+1)+'-'+p2(t.getDate());}
function hm(t){return p2(t.getHours())+':'+p2(t.getMinutes());}
function site(x){var a=x.split('-');return a[2]+'-'+a[1]+'-'+a[0];}
function mk(x,t){var a=x.split('-'),b=t.split(':');return new Date(Number(a[0]),Number(a[1])-1,Number(a[2]),Number(b[0]),Number(b[1]));}
function dayIso(o){var t=new Date();t.setDate(t.getDate()+o);return iso(t);}
var TO=[];for(var mm=0;mm<1440;mm+=15){var hh=Math.floor(mm/60);var tt=p2(hh)+':'+p2(mm-hh*60);TO.push({v:tt,t:tt});}
var st0=new Date();st0.setMinutes(Math.ceil(st0.getMinutes()/15)*15,0,0);
var S={sd:iso(st0),st:hm(st0),ed:'',et:'',dest:ld('qbd',''),car:'0',edit:false};
function setDur(h){var e=new Date(mk(S.sd,S.st).getTime()+h*3600000);S.ed=iso(e);S.et=hm(e);}
function dur(){return (mk(S.ed,S.et)-mk(S.sd,S.st))/3600000;}
function satEnd(){var s=mk(S.sd,S.st);var t=new Date(s.getFullYear(),s.getMonth(),s.getDate()+(6-s.getDay()),23,0);if(t<=s)t.setDate(t.getDate()+7);return t;}
setDur(2);
var css='.qbx{position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;background:rgb(242,244,248);color:rgb(28,32,38);overflow-y:auto;-webkit-overflow-scrolling:touch;font:16px -apple-system,system-ui,sans-serif;text-align:right;direction:rtl;padding:0 0 120px}'+
'.qbx *{box-sizing:border-box!important;font-family:inherit;float:none!important;letter-spacing:normal}'+
'.qbx .hdr{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:14px 16px;padding-top:calc(14px + env(safe-area-inset-top));background:linear-gradient(135deg,var(--a),var(--b));color:white}'+
'.qbx .hdr b{font-size:19px;color:white}'+
'.qbx .hb{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}'+
'.qbx .wrap{padding:14px}'+
'.qbx .c{background:white;border-radius:18px;padding:16px;margin:0 0 14px;box-shadow:0 1px 2px rgba(16,24,40,.06),0 6px 16px rgba(16,24,40,.05)}'+
'.qbx .h{font-weight:700;font-size:16px;margin:0 0 12px;text-align:right}'+
'.qbx .hrow{display:flex;justify-content:space-between;align-items:center;margin:0 0 12px}'+
'.qbx .hrow .h{margin:0}'+
'.qbx .ctr{text-align:center!important}'+
'.qbx .r{display:flex;gap:10px;margin:0 0 12px;align-items:flex-end}'+
'.qbx .f{display:flex!important;flex-direction:column;flex:1 1 0;min-width:0!important;width:auto!important;gap:6px;font-size:12px;color:rgb(110,118,130);margin:0;text-align:center}'+
'.qbx input,.qbx select{display:block!important;width:auto!important;min-width:0!important;max-width:none!important;height:50px!important;margin:0!important;font-size:17px!important;font-weight:600;padding:0 8px!important;border:1px solid rgb(226,230,236)!important;border-radius:12px!important;background:rgb(248,249,251)!important;color:rgb(28,32,38)!important;-webkit-appearance:none;appearance:none;text-align:center!important;text-align-last:center}'+
'.qbx input::-webkit-date-and-time-value{text-align:center}'+
'.qbx .ch{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}'+
'.qbx button{font-size:15px!important;line-height:1.25!important;height:auto!important;width:auto!important;min-width:0!important;margin:0!important;border-radius:999px!important;padding:10px 16px!important;border:0!important;background:rgb(241,243,246)!important;color:rgb(40,46,56)!important;box-shadow:none!important;text-align:center}'+
'.qbx button.on{background:var(--a)!important;color:white!important}'+
'.qbx button.g{background:rgb(22,163,74)!important;color:white!important}'+
'.qbx button.x{background:rgb(225,45,45)!important;color:white!important}'+
'.qbx button.n{background:rgb(236,238,242)!important;color:rgb(70,78,90)!important}'+
'.qbx .tog{cursor:pointer}'+
'.qbx textarea.dump{display:block;width:calc(100vw - 64px);max-width:420px;height:220px;margin:12px 0 0;font-size:11px;direction:ltr;text-align:left;border:1px solid rgb(226,230,236);border-radius:12px;padding:8px;background:rgb(248,249,251);color:rgb(28,32,38)}'+
'.qbx .ord.neu{border:1px solid rgb(232,235,240);box-shadow:0 1px 2px rgba(16,24,40,.04)!important}'+
'.qbx .ord.neu .h{color:rgb(28,32,38)}'+
'.qbx .ord.neu .tv b{color:rgb(28,32,38)}'+
'.qbx .ord.neu .tv small.od{color:rgb(120,128,140);font-weight:600}'+
'.qbx .ord.neu .carbox{background:rgb(246,247,249);border:1px solid rgb(236,238,242)}'+
'.qbx .ord.neu .carname{color:rgb(28,32,38);font-size:18px}'+
'.qbx .cplate{font-size:14px;font-weight:400;color:rgb(110,118,130);margin-top:2px;direction:ltr;text-align:center}'+
'.qbx .ord.neu .stt{background:rgb(241,243,246);color:rgb(70,78,90)}'+
'.qbx .ord.neu .acts button{background:rgb(241,243,246)!important;color:rgb(40,46,56)!important}'+
'.qbx .ord.neu .acts button.on{background:rgb(40,46,56)!important;color:white!important}'+
'.qbx .ord.neu .acts button.del0{background:rgb(254,242,242)!important;color:rgb(185,28,28)!important}'+
'.qbx .ord.neu.live{border:2px solid var(--a)!important;box-shadow:0 4px 14px var(--sh)!important}'+
'.qbx .lvw{display:flex;align-items:center;gap:6px}'+
'.qbx .livedot{width:10px;height:10px;border-radius:999px;background:var(--a);box-shadow:0 0 0 4px var(--s);animation:qbp 0.9s ease-in-out infinite alternate}'+
'.qbx .livet{font-size:12px;font-weight:800;color:var(--a)}'+
'@keyframes qbp{from{opacity:1;transform:scale(1)}to{opacity:.25;transform:scale(1.35)}}'+
'.qbx .okh{font-size:17px;font-weight:800;text-align:center;margin:4px 0 12px;color:rgb(22,130,60)}'+
'.qbx .tbl{padding:12px 0 4px}'+
'.qbx .tbl .h{padding:0 14px}'+
'.qbx .trow{display:flex;align-items:center;gap:10px;padding:10px 14px;border-top:1px solid rgb(238,240,244);cursor:pointer}'+
'.qbx .trow.free{background:rgb(248,249,251)}'+
'.qbx .trow.free .tct,.qbx .trow.free .twn{color:rgb(150,156,166);font-weight:500}'+
'.qbx .tfree{padding:8px 14px 10px;border-top:1px solid rgb(238,240,244);background:rgb(248,249,251)}'+
'.qbx .tfl{font-size:11px;color:rgb(150,156,166);margin:0 0 6px;text-align:right}'+
'.qbx button.tchip{padding:5px 10px!important;font-size:13px!important;min-width:38px!important;color:rgb(140,148,160)!important;background:rgb(236,238,242)!important}'+
'.qbx .tcar{flex:1 1 0;min-width:0;text-align:right}'+
'.qbx .tct{font-weight:700;font-size:15px}'+
'.qbx .tcp{font-size:12px;color:rgb(130,138,150)}'+
'.qbx .twho{flex:1 1 0;min-width:0;text-align:left}'+
'.qbx .twn{font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'.qbx .ord.neu{position:relative;padding:12px 14px;margin:0 0 10px}'+
'.qbx .ord.neu .bkt{padding:0 0 6px;margin:0 0 6px;gap:8px}'+
'.qbx .ord.neu .tv b{font-size:18px}'+
'.qbx .ord.neu .mid{flex:1 1 0;min-width:0;display:flex;align-items:center;gap:6px}'+
'.qbx .dtok{flex:0 1 auto;min-width:0;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:700;padding:5px 12px;border-radius:999px;background:rgb(241,243,246);color:rgb(40,46,56)}'+
'.qbx .ord.neu .carbox{margin:6px 0 0;padding:8px 10px}'+
'.qbx .ord.neu .carname{font-size:16px}'+
'.qbx .ord.neu .cplate{font-size:13px;margin-top:0}'+
'.qbx .ord.neu .acts{margin-top:8px!important}'+
'.qbx .ord.neu .acts button{padding:8px 14px!important;font-size:14px!important}'+
'.qbx .lvw.abs{position:absolute;top:-9px;left:12px;background:white;padding:2px 8px;border-radius:999px;box-shadow:0 1px 4px rgba(0,0,0,.12)}'+
'.qbx .ord.neu.u-blue{border:2px solid rgb(37,99,235)!important}'+
'.qbx .ord.neu.u-pink{border:2px solid rgb(236,72,153)!important}'+
'.qbx .uown{display:inline-block;font-size:12px;font-weight:800;padding:3px 12px;border-radius:999px;margin:0 0 8px;color:white}'+
'.qbx .u-blue .uown{background:rgb(37,99,235)}'+
'.qbx .u-pink .uown{background:rgb(236,72,153)}'+
'.qbx button.del0{background:rgb(254,226,226)!important;color:rgb(185,28,28)!important;font-weight:700}'+
'.qbx .stt{font-size:12px;padding:4px 10px;border-radius:999px;background:var(--s);color:var(--a);font-weight:700}'+
'.qbx button.del{display:block!important;margin:12px auto 0!important;background:rgb(254,226,226)!important;color:rgb(185,28,28)!important;font-weight:700}'+
'.qbx .dw{position:relative;display:block;min-width:0}'+
'.qbx .dw span{display:flex;align-items:center;justify-content:center;height:50px;border:1px solid rgb(226,230,236);border-radius:12px;background:rgb(248,249,251);font-size:17px;font-weight:600;direction:ltr}'+
'.qbx .dw input{position:absolute!important;top:0;left:0;right:0;bottom:0;height:50px!important;opacity:0.011;z-index:2}'+
'.qbx .ot{font-weight:600}'+
'.qbx .os{font-size:12px;color:rgb(120,128,140);margin-top:2px}'+
'.qbx .gh{font-weight:800;font-size:15px;margin:16px 4px 8px;text-align:right}'+
'.qbx .bk{display:flex;align-items:center;gap:12px;padding:14px 16px}'+
'.qbx .bkm{flex:1 1 0;min-width:0}'+
'.qbx .bkt{display:flex;direction:rtl;align-items:center;gap:10px;padding:0 0 8px;margin:0 0 8px;border-bottom:1px solid rgb(232,235,240)}'+
'.qbx .tv{display:flex;flex-direction:column;align-items:center;flex:0 0 auto}'+
'.qbx .tv b{font-size:20px;font-weight:800;color:var(--a);line-height:1.1}'+
'.qbx .tv small{font-size:11px;color:rgb(130,138,150)}'+
'.qbx .ar{flex:1 1 0;height:2px;background:rgb(225,229,235);border-radius:2px}'+
'.qbx .tv small.od{color:var(--a);font-weight:700}'+
'.qbx .cap{font-size:12px;font-weight:700;color:var(--a);margin:10px 6px 4px;text-align:right}'+
'.qbx .raw{font-size:11px;color:rgb(130,138,150);margin-top:8px;direction:rtl;word-break:break-word}'+
'.qbx .bk.gap{background:rgb(237,239,242);box-shadow:none!important;padding:10px 16px}'+
'.qbx .bk.gap .tv b{color:rgb(140,148,160);font-size:16px}'+
'.qbx .bk.gap .bkn{color:rgb(140,148,160);font-weight:600;font-size:15px}'+
'.qbx .bkn{font-size:17px;font-weight:700;text-align:right}'+
'.qbx .bkd{font-size:13px;color:rgb(110,118,130);margin-top:2px;text-align:right}'+
'.qbx .bks{flex:0 0 auto;min-width:58px;text-align:center}'+
'.qbx .ico{width:46px;height:46px;border-radius:999px;background:var(--s);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto}'+
'.qbx .lbl{font-size:12px;font-weight:800;color:var(--a);margin-top:4px}'+
'.qbx .lbl2{font-size:12px;color:rgb(140,148,160)}'+
'.qbx .bk.now{box-shadow:0 0 0 2px var(--b),0 6px 16px rgba(16,24,40,.08)!important}'+
'.qbx .bk.past{opacity:.6}'+
'.qbx .clist{max-height:280px;overflow-y:auto;-webkit-overflow-scrolling:touch;background:white;border:1px solid rgb(226,230,236);border-radius:12px;margin:8px 0 0;box-shadow:0 6px 16px rgba(16,24,40,.08)}'+
'.qbx .opt{padding:13px 14px;border-bottom:1px solid rgb(240,242,245);text-align:right;font-size:16px;cursor:pointer}'+
'.qbx .opt:last-child{border-bottom:0}'+
'.qbx .opt.cur{color:var(--a);font-weight:700}'+
'.qbx .sw{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:14px 0}'+
'.qbx button.swb{color:white!important;font-weight:700;padding:14px 18px!important;border-radius:14px!important}'+
'.qbx button.swb.cur{box-shadow:0 0 0 3px white,0 0 0 5px rgb(28,32,38)!important}'+
'.qbx .tog .h{margin:0}'+
'.qbx .chev{font-size:18px;color:var(--a)}'+
'.qbx button.pk{background:rgb(236,72,153)!important;color:white!important}'+
'.qbx .seg{display:flex;gap:4px;background:rgb(241,243,246);border-radius:14px;padding:4px;margin:0 0 12px}'+
'.qbx .seg button{flex:1 1 0;border-radius:10px!important;background:transparent!important;color:rgb(70,78,90)!important;padding:10px 4px!important}'+
'.qbx .seg button.on{background:white!important;color:var(--a)!important;box-shadow:0 1px 3px rgba(0,0,0,.12)!important;font-weight:700}'+
'.qbx .hdr button{background:rgba(255,255,255,.2)!important;color:white!important;padding:8px 12px!important;font-size:14px!important}'+
'.qbx button.lnk{background:none!important;color:var(--a)!important;padding:4px 6px!important;font-size:14px!important}'+
'.qbx button.ctrb{display:block!important;margin:6px auto 0!important;color:rgb(140,148,160)!important;font-size:13px!important}'+
'.qbx button.star{border-radius:12px!important;font-size:22px!important;height:50px!important;padding:0 14px!important;flex:0 0 auto;color:rgb(225,150,0)!important}'+
'.qbx .bar{position:fixed;left:0;right:0;bottom:0;z-index:3;display:flex;padding:12px 14px calc(12px + env(safe-area-inset-bottom));background:linear-gradient(rgba(242,244,248,0),rgb(242,244,248) 24px)}'+
'.qbx button.go{flex:1 1 0;border-radius:16px!important;padding:16px!important;font-size:18px!important;font-weight:700;color:white!important;background:linear-gradient(135deg,var(--a),var(--b))!important;box-shadow:0 6px 16px var(--sh)!important}'+
'.qbx .sub{font-size:12px;color:rgb(110,118,130);margin:0 0 6px;text-align:center}'+
'.qbx .lg{font-size:12px;color:rgb(140,148,160);margin:0;text-align:center}'+
'.qbx .warn{font-size:13px;color:rgb(200,30,30);text-align:center;margin:0}'+
'.qbx .big{font-size:44px;text-align:center;margin:0 0 6px}'+
'.qbx .ttl{font-size:21px;font-weight:800;text-align:center;margin:0 0 4px}'+
'.qbx .res.ok{border-top:5px solid rgb(22,163,74)}'+
'.qbx .res.bad{border-top:5px solid rgb(225,45,45)}'+
'.qbx .res.unk{border-top:5px solid rgb(240,180,30)}'+
'.qbx .carbox{margin:14px 0 4px;padding:14px;border-radius:14px;background:var(--s);text-align:center}'+
'.qbx .carbox.none{background:rgb(244,245,247)}'+
'.qbx .carname{font-size:20px;font-weight:800;color:var(--a);text-align:center}'+
'.qbx .carbox.none .carname{color:rgb(110,118,130);font-size:17px}'+
'.qbx .kv{display:flex;gap:12px;padding:9px 0;border-bottom:1px solid rgb(238,240,244);text-align:right}'+
'.qbx .kv:last-child{border-bottom:0}'+
'.qbx .kv .k{flex:0 0 92px;color:rgb(110,118,130);font-size:14px}'+
'.qbx .kv .v{flex:1 1 0;min-width:0;font-weight:600;font-size:15px;text-align:right}'+
'.qbx .msg{font-size:14px;background:rgb(248,249,251);border-radius:12px;padding:10px 12px;margin:10px 0 0;text-align:right;white-space:pre-line}'+
'.qbx .ord.hl{box-shadow:0 0 0 2px var(--b)!important}'+
'.qbx .acts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:4px 0 0}'+
'.qbx .mdl{position:fixed;top:0;left:0;right:0;bottom:0;z-index:10;background:rgba(15,20,30,.45);display:flex;align-items:center;justify-content:center;padding:20px}'+
'.qbx .mdl .c{flex:1 1 0;max-width:420px;margin:0;max-height:85vh;overflow-y:auto}'+
'.qbx .users{display:flex;flex-wrap:wrap;gap:6px;padding:12px 14px 0}'+
'.qbx .who{font-size:12px;color:rgb(110,118,130);padding:6px 16px 0;text-align:right}'+
'.qbx .hs{display:flex;flex-wrap:nowrap;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 -16px 12px;padding:2px 16px 6px;scrollbar-width:none}'+
'.qbx .hs::-webkit-scrollbar{display:none}'+
'.qbx .hs button{flex:0 0 auto;min-width:46px!important;white-space:nowrap}';
var VER='29.10-4';
var box=d.createElement('div');box.className='qbx';box.dir='rtl';
['keydown','keypress','keyup','input','touchstart','mousedown','focusin','selectstart'].forEach(function(ev){box.addEventListener(ev,function(e){e.stopPropagation();},false);});
var THEMES=[
['כתום','194,65,12','234,88,12','255,237,213'],
['כחול','0,84,140','0,128,188','234,245,255'],
['ירוק','21,128,61','34,160,90','220,252,231'],
['סגול','109,40,217','139,92,246','237,233,254'],
['ורוד','190,24,93','236,72,153','252,231,243'],
['אדום','185,28,28','225,50,50','254,226,226'],
['טורקיז','15,118,110','20,160,150','204,251,241'],
['כהה','31,41,55','75,85,99','229,231,235']];
function applyTheme(i){var t=THEMES[i]||THEMES[0];box.style.setProperty('--a','rgb('+t[1]+')');box.style.setProperty('--b','rgb('+t[2]+')');box.style.setProperty('--s','rgb('+t[3]+')');box.style.setProperty('--sh','rgba('+t[1]+',.3)');}
applyTheme(ld('qbt',0));
function pickTheme(){
var m=el('div','mdl');var c=el('div','c');
c.appendChild(el('div','ttl','🎨 צבע האפליקציה'));
var g=el('div','sw');
THEMES.forEach(function(t,i){var b=btn(t[0],'swb'+(ld('qbt',0)==i?' cur':''),function(){sv('qbt',i);applyTheme(i);m.remove();});b.style.setProperty('background','linear-gradient(135deg,rgb('+t[1]+'),rgb('+t[2]+'))','important');g.appendChild(b);});
c.appendChild(g);
var a=el('div','acts');a.appendChild(btn('סגור',null,function(){m.remove();}));c.appendChild(a);
m.appendChild(c);box.appendChild(m);
}
function el(t,c,x){var e=d.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function btn(x,c,f){var b=el('button',c,x);b.type='button';b.onclick=f;return b;}
function sel(list,val,f){var s=el('select');list.forEach(function(o){var op=el('option',null,o.t);op.value=o.v;s.appendChild(op);});s.value=val;s.onchange=function(){f(s.value);};return s;}
function fld(lbl,inp){var l=el('label','f');if(lbl)l.appendChild(el('span',null,lbl));l.appendChild(inp);return l;}
var DAYS=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
function dayName(x){if(!x)return '';var D=typeof x=='string'?mk(x,'12:00'):x;return DAYS[D.getDay()];}
function fdate(x){if(!x)return '';var a=x.split('-');return a[2]+'/'+a[1]+'/'+a[0].slice(2);}
function dateIn(v,f){var w=el('div','dw');var sp=el('span',null,fdate(v));var i=el('input');i.type='date';i.value=v;i.onchange=function(){if(i.value){sp.textContent=fdate(i.value);f(i.value);}};w.appendChild(sp);w.appendChild(i);w.inp=i;w.setV=function(x){i.value=x;sp.textContent=fdate(x);};return w;}
function seg(items,isOn,onTap){var s=el('div','seg');items.forEach(function(it){s.appendChild(btn(it[0],isOn(it[1])?'on':'',function(){onTap(it[1]);}));});return s;}
function minStart(){var t=new Date();t.setMinutes(Math.floor(t.getMinutes()/15)*15,0,0);return t;}
function clampStart(){var m=minStart();if(mk(S.sd,S.st)<m){S.sd=iso(m);S.st=hm(m);}}
function keepDur(fn){var h=dur();fn();clampStart();setDur(h>0?h:2);draw();}
function startOpts(){var m=minStart();return TO.filter(function(x){return mk(S.sd,x.v)>=m;});}
function ask(title,text,inputs,ok,cancel){return new Promise(function(res){
var m=el('div','mdl');var c=el('div','c');
if(title)c.appendChild(el('div','ttl',title));
if(text)c.appendChild(el('div','msg ctr',text));
var ins=(inputs||[]).map(function(p){var i=el('input');i.type=p.type||'text';var wr=el('div','r');wr.style.marginTop='12px';wr.appendChild(fld(p.label,i));c.appendChild(wr);return i;});
var a=el('div','acts');a.style.marginTop='14px';
a.appendChild(btn(ok||'אישור','on',function(){m.remove();res(ins.length?ins.map(function(i){return i.value;}):true);}));
if(cancel)a.appendChild(btn(cancel,null,function(){m.remove();res(null);}));
c.appendChild(a);m.appendChild(c);box.appendChild(m);
});}
function say(t){return ask('',t,null,'סגור',null);}
var STALE=false;
function back(){if(STALE){STALE=false;relogin();return;}if(form)draw();else box.remove();}
var LASTVIEW=null;
function toTop(){try{box.scrollTop=0;window.scrollTo(0,0);var ae=d.activeElement;if(ae&&ae!==d.body&&!box.contains(ae))ae.blur();}catch(e){}}
function shell(){
var newView=VIEW!=LASTVIEW;LASTVIEW=VIEW;
box.innerHTML='';box.appendChild(el('style',null,css));
if(newView)setTimeout(toTop,0);
var h=el('div','hdr');var ttl=el('b',null,'הזמנת רכב');ttl.style.cursor='pointer';ttl.style.webkitUserSelect='none';ttl.style.userSelect='none';ttl.style.webkitTouchCallout='none';
var lpT=null,lpDone=false;
ttl.addEventListener('touchstart',function(){lpDone=false;lpT=setTimeout(function(){lpDone=true;pickTheme();},550);},{passive:true});
ttl.addEventListener('touchmove',function(){clearTimeout(lpT);},{passive:true});
ttl.addEventListener('touchend',function(ev){clearTimeout(lpT);if(lpDone)ev.preventDefault();},{passive:false});
ttl.addEventListener('contextmenu',function(ev){ev.preventDefault();});
ttl.onclick=function(){if(lpDone){lpDone=false;return;}if(VIEW!='order'||!d.querySelector('.qbx .bar'))back();};
h.appendChild(ttl);
var hb=el('div','hb');hb.appendChild(VIEW=='sch'?btn('הזמנה',null,back):btn('סידור',null,scheduleView));hb.appendChild(btn('ההזמנות שלי',null,ordersView));hb.appendChild(btn('✕',null,function(){box.remove();}));h.appendChild(hb);
box.appendChild(h);
var us=el('div','users');
var allOn=VIEW=='orders'&&ORD_ALL;
PR.list.forEach(function(p,i){us.appendChild(btn('👤 '+(p.u||'משתמש'),(i==PR.cur&&!allOn)?((p.u||'').indexOf('ניבה')>=0?'pk':'on'):'',function(){if(VIEW=='orders'){ORD_ALL=false;if(i==PR.cur){ordersView();return;}RET='orders';}switchUser(i);}));});
if(VIEW=='orders'&&PR.list.length>1)us.appendChild(btn('הכל',allOn?'on':'',function(){ORD_ALL=true;ordersView();}));
us.appendChild(btn('+ משתמש',null,function(){addUser().then(function(c){if(c)relogin();});}));
box.appendChild(us);
var w=el('div','wrap');box.appendChild(w);return w;
}
function short(t){
if(/סטיישן/.test(t))return '5 סטיישן';
if(/עגלה/.test(t))return 'רכב + עגלה (פרט בהערות)';
if(/מטען/.test(t))return 'רכב מטען';
if(/סטריה/.test(t))return '9 (סטריה)';
if(/מניבוס|מיניבוס/.test(t))return 'מיניבוס';
var m=t.match(/(\d+)\s*מקומות/);
return m?m[1]:t;
}
function idx(t){for(var i=0;i<TO.length;i++){if(TO[i].v==t)return i;}return 0;}
function clampI(i){return i<0?0:i>TO.length-1?TO.length-1:i;}
function drag(e,apply,onEnd){
var y0=null,last=0,moved=false;
e.style.touchAction='none';
e.addEventListener('touchstart',function(ev){y0=ev.touches[0].clientY;last=0;moved=false;},{passive:true});
e.addEventListener('touchmove',function(ev){if(y0==null)return;var dy=ev.touches[0].clientY-y0;if(!moved&&Math.abs(dy)<8)return;moved=true;ev.preventDefault();var n=Math.round(-dy/(e.qbStep||22));if(n!=last){apply(n-last);last=n;}},{passive:false});
e.addEventListener('touchend',function(ev){var m=moved;y0=null;moved=false;if(m){ev.preventDefault();(onEnd||draw)();}},{passive:false});
}
function pickDest(){return new Promise(function(res){
var m=el('div','mdl');var c=el('div','c');
function done(v){m.remove();res(v);}
c.appendChild(el('div','ttl','📍 לאן נוסעים?'));
var fv=el('div','ch');fv.style.marginTop='12px';
F.forEach(function(t){var o=DEST.filter(function(x){return x.t==t;})[0];if(o)fv.appendChild(btn(t,null,function(){done(o.v);}));});
if(fv.children.length)c.appendChild(fv);
var si=el('input');si.type='search';si.placeholder='הקלד שם יעד…';
var sr=el('div','ch');sr.style.marginTop='8px';
si.oninput=function(){sr.innerHTML='';var qv=si.value.trim();if(!qv)return;DEST.filter(function(x){return x.t.indexOf(qv)>=0;}).slice(0,8).forEach(function(o){sr.appendChild(btn(o.t,null,function(){done(o.v);}));});if(!sr.children.length)sr.appendChild(el('div','lg','לא נמצא יעד בשם הזה'));};
c.appendChild(si);c.appendChild(sr);
var sw=el('div','r');sw.style.marginTop='8px';
sw.appendChild(fld('',sel([{v:'',t:'או בחר מהרשימה…'}].concat(DEST),'',function(v){if(v)done(v);})));
c.appendChild(sw);
var a=el('div','acts');a.appendChild(btn('ביטול',null,function(){done(null);}));c.appendChild(a);
m.appendChild(c);box.appendChild(m);
});}
function loading(t){var w=shell();var c=el('div','c');c.appendChild(el('div','big','⏳'));c.appendChild(el('div','ttl',t));w.appendChild(c);}
var VIEW='order';
function draw(){
VIEW='order';
var w=shell();
var c=el('div','c');
c.appendChild(seg([['היום',0],['מחר',1],['מחרתיים',2]],function(o){return S.sd==dayIso(o);},function(o){keepDur(function(){S.sd=dayIso(o);});}));
var r=el('div','r');
var sdI=dateIn(S.sd,function(v){keepDur(function(){S.sd=v;});});
var edI=dateIn(S.ed,function(v){S.ed=v;draw();});
sdI.inp.min=iso(new Date());edI.inp.min=S.sd;
sdI.inp.qbStep=30;edI.inp.qbStep=30;
drag(sdI.inp,function(n){var h=dur();var t=mk(S.sd,S.st);t.setDate(t.getDate()+n);S.sd=iso(t);clampStart();setDur(h>0?h:2);sdI.setV(S.sd);edI.setV(S.ed);});
drag(edI.inp,function(n){var t=mk(S.ed,S.et);t.setDate(t.getDate()+n);if(t<=mk(S.sd,S.st))return;S.ed=iso(t);edI.setV(S.ed);});
r.appendChild(fld('מ: '+dayName(S.sd),sdI));
r.appendChild(fld('עד: '+dayName(S.ed),edI));
c.appendChild(r);
r=el('div','r');
var stS=sel(startOpts(),S.st,function(v){keepDur(function(){S.st=v;});});
var etS=sel(TO,S.et,function(v){S.et=v;draw();});
drag(stS,function(n){var h=dur();S.st=TO[clampI(idx(S.st)+n)].v;clampStart();setDur(h>0?h:2);stS.value=S.st;etS.value=S.et;});
drag(etS,function(n){S.et=TO[clampI(idx(S.et)+n)].v;etS.value=S.et;});
r.appendChild(fld('משעה',stS));
r.appendChild(fld('עד שעה',etS));
c.appendChild(r);
c.appendChild(el('div','sub','משך בשעות'));
var hs=el('div','hs');
[1,2,3,4,5,6,7,8,9,10,11,12,24,48,72].forEach(function(h){hs.appendChild(btn(String(h),dur()==h?'on':'',function(){setDur(h);draw();}));});
var se=satEnd();
hs.appendChild(btn('עד מוצ״ש 23:00',mk(S.ed,S.et).getTime()==se.getTime()?'on':'',function(){S.ed=iso(se);S.et='23:00';draw();}));
c.appendChild(hs);
var onB=hs.querySelector('button.on');if(onB)setTimeout(function(){onB.scrollIntoView({block:'nearest',inline:'center'});},0);
if(dur()<=0)c.appendChild(el('div','warn','שעת ההחזרה חייבת להיות אחרי שעת הקבלה'));
w.appendChild(c);
c=el('div','c');
var hd=el('div','hrow');hd.appendChild(el('div','h','לאן'));hd.appendChild(btn(S.edit?'סיום':'עריכה','lnk',function(){S.edit=!S.edit;draw();}));c.appendChild(hd);
var ch=el('div','ch');
F.forEach(function(t){var o=DEST.filter(function(x){return x.t==t;})[0];if(!o&&!S.edit)return;ch.appendChild(btn((S.edit?'✕ ':'')+t,S.edit?'x':(o&&S.dest==o.v?'on':''),function(){if(S.edit){F=F.filter(function(x){return x!=t;});sv('qbf',F);}else{S.dest=o.v;}draw();}));});
if(F.length)c.appendChild(ch);
var curT=(DEST.filter(function(x){return x.v==S.dest;})[0]||{}).t;
var isF=!!curT&&F.indexOf(curT)>=0;
r=el('div','r');r.style.marginBottom='0';
var cb=el('div','f');
var ci=el('input');ci.type='search';ci.placeholder='הקלד או בחר יעד…';ci.value=curT||'';
var cl=el('div','clist');cl.style.display='none';
function fillList(qv){cl.innerHTML='';var L=DEST.filter(function(x){return !qv||x.t.indexOf(qv)>=0;});if(!L.length)cl.appendChild(el('div','opt lg','לא נמצא יעד בשם הזה'));L.forEach(function(o){var it=el('div','opt'+(o.v==S.dest?' cur':''),o.t);it.onclick=function(){S.dest=o.v;draw();};cl.appendChild(it);});cl.style.display='block';}
ci.onfocus=function(){fillList('');try{ci.select();}catch(e){}};
ci.oninput=function(){fillList(ci.value.trim());};
ci.onblur=function(){setTimeout(function(){cl.style.display='none';ci.value=curT||'';},250);};
cb.appendChild(ci);
r.appendChild(cb);
r.appendChild(btn(isF?'★':'☆','star',function(){if(!curT)return;if(isF){F=F.filter(function(x){return x!=curT;});}else{F.push(curT);}sv('qbf',F);draw();}));
c.appendChild(r);
c.appendChild(cl);
w.appendChild(c);
if(GRPS.length){
c=el('div','c');
if(GRPS.length){
ch=el('div','ch');
GRPS.forEach(function(g){var v=P[g.id]==null?-1:Number(P[g.id]);ch.appendChild(btn((v==1?'✓ ':v==0?'✕ ':'')+short(g.t),v==1?'g':v==0?'x':'n',function(){P[g.id]=v==-1?1:v==1?0:-1;draw();}));});
c.appendChild(ch);
}
w.appendChild(c);
}
var MU=milUser();
var NT=[['cm','comment','הערה לעצמי'],['cs','comment_to_sadran','הערה לסדרן'],['cp','comment_to_public','הערה ציבורית']].filter(function(a){return !!q(a[1]);});
if(NT.length||CARS.length||MU){
c=el('div','c');
var nFilled=NT.filter(function(a){return S[a[0]];}).length+(S.car&&S.car!='0'?1:0)+(S.mil?1:0);
var nh=el('div','hrow tog');nh.style.margin='0';
nh.appendChild(el('div','h','אפשרויות נוספות'+(nFilled?' ('+nFilled+')':'')));
nh.appendChild(el('span','chev',S.notes?'▴':'▾'));
nh.onclick=function(){S.notes=!S.notes;draw();};
c.appendChild(nh);
if(S.notes){
if(MU){
c.appendChild(el('div','sub','חיוב'));c.lastChild.style.margin='14px 0 6px';
var sg=seg([['פרטי',false],['מילואים',true]],function(v){return !!S.mil==v;},function(v){S.mil=v;draw();});sg.style.margin='0';c.appendChild(sg);
if(S.mil)c.appendChild(el('div','lg','החיוב יועבר לאישור '+MU.t));
}
if(CARS.length){var rc0=el('div','r');rc0.style.margin='12px 0 0';rc0.appendChild(fld('רכב מסוים',sel(CARS,S.car,function(v){S.car=v;draw();})));c.appendChild(rc0);}
NT.forEach(function(a){
var i=el('input');i.type='text';i.value=S[a[0]]||'';i.oninput=function(){S[a[0]]=i.value;};
var rr=el('div','r');rr.style.margin='12px 0 0';rr.appendChild(fld(a[2],i));c.appendChild(rr);
});}
w.appendChild(c);
}
w.appendChild(el('div','lg','גרסה '+VER));
var bar=el('div','bar');bar.appendChild(btn('שלח הזמנה','go',send));box.appendChild(bar);
}
function setv(n,v){var e=q(n);if(!e)throw n;e.value=v;}
function setIf(n,v){var e=q(n);if(e)e.value=v;}
function milUser(){var s=q('user_id');if(!s)return null;var o=Array.prototype.filter.call(s.options,function(x){return /מילואים/.test(x.text);})[0];return o?{v:o.value,t:clean(o.text)}:null;}
function applyMil(){
var mu=milUser();if(!mu)throw 'משתמש המילואים לא נמצא באתר';
for(var i=0;i<=10;i++){setIf('arr_auto_user[0]['+i+']','');setIf('arr_auto_user_name[0]['+i+']','');}
for(var j=0;j<=9;j++){setIf('arr_req_user_id[0]['+j+']','');setIf('arr_req_user_name[0]['+j+']','');setIf('arr_req_text[0]['+j+']','');}
setv('arr_req_user_id[0][0]',mu.v);setIf('arr_req_user_name[0][0]',mu.t);
}
function destName(){return (DEST.filter(function(x){return x.v==S.dest;})[0]||{}).t||'';}
function sh(x){return fdate(x);}
function whenTxt(){return sh(S.sd)+' '+S.st+' עד '+(S.ed!=S.sd?sh(S.ed)+' ':'')+S.et;}
function send(){
if(mk(S.sd,S.st)<minStart()){keepDur(function(){});say('שעת הקבלה כבר עברה - עודכנה לשעה הנוכחית. בדוק ושלח שוב');return;}
if(!S.dest){pickDest().then(function(v){if(v){S.dest=v;draw();send();}});return;}
if(dur()<=0){say('שעת ההחזרה חייבת להיות אחרי שעת הקבלה');return;}
var dn=destName(),when=whenTxt();
ask('לשלוח הזמנה?',dn+'\n'+when+(S.mil?'\nחיוב: מילואים':''),null,'שלח','ביטול').then(function(ok){if(ok)submit(dn,when);});
}
function submit(dn,when){
try{
setv('start_date',site(S.sd));setv('end_date',site(S.ed));setv('start_time',S.st);setv('end_time',S.et);setv('dest',S.dest);
var rc=q('req_car_id');if(rc)rc.value=S.car;
[['cm','comment'],['cs','comment_to_sadran'],['cp','comment_to_public']].forEach(function(a){var e=q(a[1]);if(e)e.value=S[a[0]]||'';});
if(S.mil)applyMil();
GRPS.forEach(function(g){var v=P[g.id]==null?-1:Number(P[g.id]);Array.prototype.forEach.call(form.querySelectorAll('input[name="grp_val_'+g.id+'"]'),function(rr){rr.checked=Number(rr.value)==v;});});
}catch(e){say('שדה לא נמצא בטופס: '+e);return;}
sv('qbd',S.dest);
var body=ser(form);
body.append('submit_order','שלח הזמנה');
loading('שולח הזמנה…');
fetch(form.getAttribute('action')||'/order.php',{method:'POST',body:body,credentials:'same-origin'})
.then(function(r){return r.text();})
.then(function(html){done(html,dn,when);})
.catch(function(e){result('bad','שגיאת תקשורת',[String(e)],dn,when,null,null,null);});
}
function msgs(doc,html){
var out=[];
function add(t,c){t=clean(t);if(t&&!out.some(function(o){return o.t==t;}))out.push({t:t,c:c||''});}
var mi=doc.querySelector('[id="messages-inner"]');
if(mi)Array.prototype.forEach.call(mi.children,function(n){if(n.id=='messages_counter'||n.id=='messages_close')return;add(n.textContent,n.className);});
Array.prototype.forEach.call(doc.querySelectorAll('.error,.err,.success,.warning,.front_login_err_txt'),function(n){add(n.textContent,n.className);});
var re=/alert\(\s*["']([^"']{3,400})["']/g,m;
while((m=re.exec(html)))add(m[1],'alert');
return out;
}
function noNum(t){return t.replace(/^\d+\s+/,'');}
function findCar(t){
if(!t)return null;
var pm=plateOf(t);
if(pm){var c=CARS.filter(function(x){return plateOf(x.t)==pm;})[0];return c?noNum(c.t):pm;}
var c2=CARS.filter(function(x){var n=noNum(x.t);return x.v!='0'&&n.length>4&&t.indexOf(n)>=0;})[0];
return c2?noNum(c2.t):null;
}
function parseOrders(doc){
var out=[];
Array.prototype.forEach.call(doc.querySelectorAll('table'),function(tb){
var hdr=null;
Array.prototype.forEach.call(tb.querySelectorAll('tr'),function(tr){
if(tr.closest('table')!==tb||tr.querySelector('table'))return;
var ths=tr.querySelectorAll('th');
if(ths.length){if(!hdr)hdr=Array.prototype.map.call(ths,function(x){return clean(x.textContent);});return;}
var tds=Array.prototype.filter.call(tr.children,function(x){return x.tagName=='TD';});
if(tds.length<2)return;
var vals=tds.map(function(x){var tt=Array.prototype.map.call(x.querySelectorAll('[title],[alt]'),function(e){return e.getAttribute('title')||e.getAttribute('alt')||'';}).join(' ');return clean(x.textContent+(tt&&x.textContent.indexOf(tt)<0?' '+tt:''));});
var text=vals.join(' ');
if(!text||text.length>600)return;
var fields=vals.map(function(v,i){return [hdr&&hdr[i]?hdr[i]:'',v];}).filter(function(f){return f[1];});
if(!/\d{1,2}[\/.]\d{1,2}|\d{1,2}:\d{2}/.test(text))return;
out.push({fields:fields,text:text,tr:tr});
});
});
if(!out.length)out=parseOrderBlocks(doc);
return out;
}
function parseOrderBlocks(doc){
var cand=[],picked=[];var DT=/\d{1,2}[\/.]\d{1,2}/,TT=/\d{1,2}:\d{2}/,HB=/[א-ת]{2,}[^א-ת]+[א-ת]{2,}/;
Array.prototype.forEach.call(doc.querySelectorAll('div,li,section,article,form,tr'),function(e){
if(e.closest('[id*="vkb"],[class*="vkb"],[id="messages"],.ui-datepicker,[id="footer"],[id="clock"],[id="header"]'))return;
var t=clean(e.innerText||e.textContent);if(t.length<12||t.length>400||!DT.test(t)||!TT.test(t)||!HB.test(t))return;
cand.push({e:e,t:t});});
cand.sort(function(a,b){return a.t.length-b.t.length;});
var out=[];
cand.forEach(function(c){if(picked.some(function(p){return c.e.contains(p)||p.contains(c.e);}))return;picked.push(c.e);
var lines=(c.e.innerText||c.e.textContent).split(/\n+/).map(clean).filter(String);
out.push({fields:lines.map(function(l){var m=l.match(/^([^:]{1,20}):\s*(.+)$/);return m&&!/^\d/.test(l)?[m[1],m[2]]:['',l];}),text:c.t,tr:c.e});});
return out;
}
function carName(v){if(!v)return null;var p=plateOf(v);if(p){var c=CARS.filter(function(x){return plateOf(x.t)==p;})[0];return c?noNum(c.t):p;}
var m=v.match(/^\s*(\d{1,4})\s*$/);if(m){var c2=CARS.filter(function(x){return x.t.split(' ')[0]==m[1];})[0];if(c2){var pl=plateOf(c2.t)||'';return 'רכב '+m[1]+' - '+clean(noNum(c2.t).replace(pl,'').replace(/\d+\s*מקומות/,''))+(pl?' ('+pl+')':'');}}
return null;}
function carOf(o){
var fs=o.fields.filter(function(x){return /רכב/.test(x[0])&&!/מבוקש/.test(x[0]);});
for(var i=0;i<fs.length;i++){var v=fs[i][1];if(!v||/^[-–\s]*$/.test(v)||/סדרן אוטומטי|לא שובץ|טרם/.test(v))continue;return carName(v)||v;}
return findCar(o.text);}
function carBox(parent,car,emptyTxt){var cb=el('div','carbox'+(car?'':' none'));cb.appendChild(el('div','sub',car?'הרכב ששובץ לך':'רכב'));cb.appendChild(el('div','carname',car||emptyTxt));parent.appendChild(cb);}
function orderCard(o,parent,hl,withCar){
var c=el('div','c ord'+(hl?' hl':''));
var car=carOf(o);
if(withCar)carBox(c,car,'טרם שובץ');
o.fields.forEach(function(f){if(withCar&&car&&f[1]==car)return;var kv=el('div','kv');kv.appendChild(el('span','k',f[0]||'•'));kv.appendChild(el('span','v',f[1]));c.appendChild(kv);});
var dt=el('div','raw',o.fields.map(function(f){return (f[0]?f[0]+': ':'')+f[1];}).join(' | '));dt.style.display='none';
var db0=btn('פרטים','lnk',function(){dt.style.display=dt.style.display=='none'?'block':'none';});c.appendChild(db0);c.appendChild(dt);
parent.appendChild(c);
return c;
}
var ALERTS=[];
function patchWin(){try{var wn=IFR.contentWindow;wn.confirm=function(){return true;};wn.alert=function(m){ALERTS.push(clean(String(m||'')));};wn.prompt=function(){return '';};}catch(e){}}
function badCtl(e){return !!e.closest('[id*="vkb"],[class*="vkb"],.ui-datepicker,.ui-timepicker,[id*="pick_users"]');}
function findCancel(root,needOrder){
if(!root)return null;var best=null,bs=0;
Array.prototype.forEach.call(root.querySelectorAll('a,button,input,img,span,div,td,li'),function(e){
if(badCtl(e))return;if(e.getClientRects&&!e.getClientRects().length)return;
var t=clean(e.value||e.getAttribute('title')||e.getAttribute('alt')||e.textContent);
if(!t||t.length>30||!/(בטל|ביטול|מחק|מחיקה)/.test(t)||/סינון/.test(t))return;
var sc=/הזמנה/.test(t)?3:1;if(needOrder&&sc<3)return;
var tgt=e;if(/^(IMG|SPAN|DIV|TD|LI)$/.test(e.tagName)){tgt=e.closest('a,button,[onclick]')||(e.getAttribute('onclick')?e:null);}
if(tgt&&sc>bs){bs=sc;best=tgt;}});
return best;
}
function rowLink(tr){var a=Array.prototype.filter.call(tr.querySelectorAll('a[href]'),function(x){var h=x.getAttribute('href')||'';return h&&h.charAt(0)!='j'&&h!='/'&&!/logout|my_orders\.php$/.test(h);})[0];return a?a.href:'';}
function clickLive(e){return new Promise(function(res){var done=false;var h=function(){if(done)return;done=true;IFR.removeEventListener('load',h);setTimeout(function(){patchWin();res();},700);};IFR.addEventListener('load',h);patchWin();try{e.click();}catch(x){}setTimeout(h,4000);});}
function findYes(doc){var dl=doc.querySelector('.ui-dialog:not([style*="display: none"])');if(!dl)return null;return Array.prototype.filter.call(dl.querySelectorAll('button,input[type="button"],input[type="submit"],a'),function(b){return /(כן|אישור|אשר|מחק|בטל הזמנה)/.test(clean(b.value||b.textContent));})[0]||null;}
function cellText(c){if(!c)return '';var x=c.cloneNode(true);Array.prototype.forEach.call(x.querySelectorAll('.label,.sort_by_me'),function(y){y.remove();});return clean(x.textContent);}
function parseMyOrders(doc){
return Array.prototype.map.call(doc.querySelectorAll('.orders_row'),function(r){
var o={el:r,id:cellText(r.querySelector('.order_id'))};
var tm=r.querySelectorAll('.orders_cell.times');
var ep=function(c){var s=c&&c.querySelector('.sort_by_me');return s?new Date(Number(clean(s.textContent))*1000):null;};
o.s=ep(tm[0]);o.e=ep(tm[1]);o.sTxt=cellText(tm[0]);o.eTxt=cellText(tm[1]);
Array.prototype.forEach.call(r.querySelectorAll('.orders_cell'),function(c){var lb=c.querySelector('.label');if(!lb)return;var k=clean(lb.textContent);var v=cellText(c);
if(/^יעד/.test(k))o.dest=v;else if(/מטרת/.test(k))o.purpose=v;else if(/^רכב/.test(k))o.carRaw=v;else if(/^מצב/.test(k))o.status=v;});
var cr=o.carRaw||'';var num=(cr.match(/מס[׳']?:?\s*(\d+)/)||[])[1]||'';var pl=plateOf(cr)||'';
var mdl=clean(cr.split(/,|מס[׳']?:/)[0].replace(/\d+\s*מקומות/,''));
o.carName=(num||pl)?(num?'רכב '+num+' - ':'')+mdl:'';o.carPlate=pl;
o.car=o.carName?o.carName+(pl?' ('+pl+')':''):'';
var eb=r.querySelector('button[onclick*="mode=edit"]');var mm=eb?(eb.getAttribute('onclick')||'').match(/location\.href='([^']+)'/):null;o.editUrl=mm?mm[1].replace(/&amp;/g,'&'):(o.id?'/my_orders.php?mode=edit&ord_id='+o.id:'');
return o;}).filter(function(o){return o.id||o.s;});
}
function dtTxt(D){return D?p2(D.getDate())+'/'+p2(D.getMonth()+1)+'/'+String(D.getFullYear()).slice(2)+' '+hm(D):'';}
function myOrderCard(o,parent,hl){
var nw=new Date();var live=o.s&&o.e&&o.s<=nw&&nw<o.e;
var c=el('div','c ord neu'+(hl?' hl':'')+(live?' live':''));
if(live){var lv=el('div','lvw abs');lv.appendChild(el('span','livedot'));lv.appendChild(el('span','livet','עכשיו'));c.appendChild(lv);}
var tr=el('div','bkt');var a=el('div','tv');a.appendChild(el('small','od',o.s?fdate(iso(o.s)):''));a.appendChild(el('b',null,o.s?hm(o.s):o.sTxt));a.appendChild(el('small',null,o.s?'מ: '+dayName(o.s):'קבלה'));
var z=el('div','tv');z.appendChild(el('small','od',o.e?fdate(iso(o.e)):''));z.appendChild(el('b',null,o.e?hm(o.e):o.eTxt));z.appendChild(el('small',null,o.e?'עד: '+dayName(o.e):'החזרה'));
var mid=el('div','mid');mid.appendChild(el('div','ar'));if(o.dest)mid.appendChild(el('span','dtok',o.dest));mid.appendChild(el('div','ar'));
tr.appendChild(a);tr.appendChild(mid);tr.appendChild(z);c.appendChild(tr);
var cb=el('div','carbox'+(o.carName?'':' none'));cb.appendChild(el('div','carname',o.carName||'טרם שובץ'));if(o.carPlate)cb.appendChild(el('div','cplate','('+o.carPlate+')'));c.appendChild(cb);
parent.appendChild(c);return c;
}
function ordersView(){
VIEW='orders';
var MY=null;
var all=ORD_ALL&&PR.list.length>1;
loading(all?'טוען את כל ההזמנות…':'טוען הזמנות…');
var src=all?allOrders():withLogin('/my_orders.php').then(function(){return loadFrame('/my_orders.php');}).then(function(doc){if(!doc.querySelector('.orders_row')&&!doc.querySelector('.no-content'))throw 'skip';return parseMyOrders(doc);});
src.then(function(list){
MY=list;
var w=shell();
w.appendChild(el('div','h ctr',all?'כל ההזמנות':'ההזמנות שלי'));
if(!MY.length){var c0=el('div','c');c0.appendChild(el('div','ttl','אין הזמנות'));w.appendChild(c0);}
MY.forEach(function(o){var card=myOrderCard(o,w,false);
if(all&&o.owner!=null){var nm=PR.list[o.owner].u||'';card.classList.add(/ניבה/.test(nm)?'u-pink':'u-blue');card.insertBefore(el('div','uown',nm),card.firstChild);}
var ac=el('div','acts');ac.style.marginTop='12px';
if(o.e)ac.appendChild(btn('+2',null,function(){var ne=new Date(o.e.getTime()+2*3600000);ask('להאריך בשעתיים?','החזרה חדשה: '+dtTxt(ne),null,'הארך','ביטול').then(function(ok){if(ok)asOwner(o,function(){editOrder(o,ne);});});}));
ac.appendChild(btn('עריכת הזמנה',null,function(){asOwner(o,function(){editFull(o);});}));
ac.appendChild(btn('מחק','del0',function(){ask('למחוק את ההזמנה?',(o.dest||'')+'\n'+dtTxt(o.s)+' עד '+dtTxt(o.e),null,'מחק','ביטול').then(function(ok){if(ok)asOwner(o,function(){deleteOrder(o);});});}));
card.appendChild(ac);});
var a=el('div','acts');a.appendChild(btn('הזמנה חדשה','on',back));a.appendChild(btn('פתח באתר',null,function(){location.href='/my_orders.php';}));
w.appendChild(a);
}).catch(function(e){if(e==='skip')return ordersViewOld();say(String(e)).then(back);});
}
function pickReturn(o){
var base=o.e||new Date();var st={d:iso(base),t:hm(base)};
var m=el('div','mdl');var c=el('div','c');c.appendChild(el('div','ttl','שעת החזרה חדשה'));
c.appendChild(el('div','msg ctr','כרגע: '+dtTxt(o.e)));
var r=el('div','r');r.style.marginTop='12px';
var di=dateIn(st.d,function(v){st.d=v;});
var tl=TO.slice();if(!TO.some(function(x){return x.v==st.t;}))tl.unshift({v:st.t,t:st.t});
var ts=sel(tl,st.t,function(v){st.t=v;});
r.appendChild(fld('תאריך',di));r.appendChild(fld('שעה',ts));c.appendChild(r);
var q2=el('div','ch');q2.style.cssText='margin:10px 0 0;justify-content:center';
[1,2,3,4].forEach(function(h){q2.appendChild(btn('+'+h,null,function(){var ne=new Date(base.getTime()+h*3600000);st.d=iso(ne);st.t=hm(ne);di.setV(st.d);if(!Array.prototype.some.call(ts.options,function(op){return op.value==st.t;})){var op=el('option',null,st.t);op.value=st.t;ts.insertBefore(op,ts.firstChild);}ts.value=st.t;}));});
c.appendChild(q2);
var a=el('div','acts');a.style.marginTop='14px';
a.appendChild(btn('שמור','on',function(){var ne=mk(st.d,st.t);if(o.s&&ne<=o.s){say('שעת ההחזרה חייבת להיות אחרי שעת הקבלה');return;}m.remove();editOrder(o,ne);}));
a.appendChild(btn('ביטול',null,function(){m.remove();}));
c.appendChild(a);m.appendChild(c);box.appendChild(m);
}
function jset(doc,n,v){var e=doc.querySelector('[name="'+n+'"]');if(!e)return false;e.value=v;try{var J=doc.defaultView.jQuery;if(J)J(e).val(v).trigger('change');else e.dispatchEvent(new Event('change',{bubbles:true}));}catch(x){}return true;}
function openEdit(o){if(!o.editUrl)return Promise.reject('לא נמצא קישור לעריכת ההזמנה');return withLogin('/my_orders.php').then(function(){return loadFrame(o.editUrl);}).then(function(doc){patchWin();return doc;});}
function afterMsgs(){var dd=IFR.contentDocument;try{return msgs(dd,dd.documentElement.outerHTML).map(function(x){return x.t;}).concat(ALERTS);}catch(e){return ALERTS;}}
function editOrder(o,ne){
loading('מעדכן הזמנה…');ALERTS=[];
openEdit(o).then(function(doc){
var okE=jset(doc,'end_date',p2(ne.getDate())+'-'+p2(ne.getMonth()+1)+'-'+ne.getFullYear());var okT=jset(doc,'end_time',hm(ne));
if(!okE||!okT)throw 'לא מצאתי בדף העריכה את שדות שעת הסיום';
var f=doc.querySelector('[name="end_time"]').form;
var sb=Array.prototype.filter.call((f||doc).querySelectorAll('input[type="submit"],button[type="submit"],button:not([type]),input[type="button"]'),function(b){var t=clean(b.value||b.textContent);return !badCtl(b)&&t&&!/מחק|ביטול|בטל|סגור|בחר|בחירה/.test(t);})[0];
if(!sb)throw 'לא מצאתי כפתור שמירה בדף העריכה';
return clickLive(sb);
}).then(function(){var y=findYes(IFR.contentDocument);if(y)return clickLive(y);})
.then(function(){var ms=afterMsgs();return getDoc('/my_orders.php').then(function(d2){var n=parseMyOrders(d2).filter(function(x){return x.id==o.id;})[0];
var ok=n&&n.e&&Math.abs(n.e-ne)<60000;say((ok?'✅ ההזמנה עודכנה - החזרה ב-'+dtTxt(n.e):'ההזמנה לא עודכנה'+(n&&n.e?' (החזרה עדיין '+dtTxt(n.e)+')':''))+(ms.length?'\n'+ms.join('\n'):'')).then(ordersView);});})
.catch(function(e){say(String(e)).then(ordersView);});
}
function fromSite(x){var a=(x||'').split('-');return a.length==3?a[2]+'-'+a[1]+'-'+a[0]:'';}
function vOf(doc,n){var e=doc.querySelector('[name="'+n+'"]');return e?e.value:'';}
function editFull(o){
loading('טוען את ההזמנה לעריכה…');
openEdit(o).then(function(doc){
if(!doc.querySelector('[name="end_time"]'))throw 'לא נמצא טופס עריכה בדף';
var E={o:o,sd:fromSite(vOf(doc,'start_date'))||(o.s?iso(o.s):''),st:vOf(doc,'start_time')||(o.s?hm(o.s):''),ed:fromSite(vOf(doc,'end_date'))||(o.e?iso(o.e):''),et:vOf(doc,'end_time')||(o.e?hm(o.e):''),car:vOf(doc,'req_car_id')||'0',P:{}};
GRPS.forEach(function(g){var c=doc.querySelector('input[name="grp_val_'+g.id+'"]:checked');E.P[g.id]=c?Number(c.value):-1;});
E.cars=Array.prototype.map.call((doc.querySelector('[name="req_car_id"]')||{options:[]}).options,function(op){return {v:op.value,t:clean(op.text)};}).filter(function(x){return x.v!=='-1'&&x.v!=='';});
if(!E.cars.length)E.cars=CARS;
editDraw(E);
}).catch(function(e){say(String(e)).then(ordersView);});
}
function topts(t){var l=TO.slice();if(t&&!TO.some(function(x){return x.v==t;}))l.unshift({v:t,t:t});return l;}
function editDraw(E){
VIEW='edit';
var w=shell();
var c=el('div','c');
c.appendChild(el('div','h','עריכת הזמנה'+(E.o.dest?' · '+E.o.dest:'')));
var r=el('div','r');
r.appendChild(fld('מ: '+dayName(E.sd),dateIn(E.sd,function(v){var h=(mk(E.ed,E.et)-mk(E.sd,E.st))/3600000;E.sd=v;if(h>0){var ne=new Date(mk(E.sd,E.st).getTime()+h*3600000);E.ed=iso(ne);E.et=hm(ne);}editDraw(E);})));
r.appendChild(fld('משעה',sel(topts(E.st),E.st,function(v){var h=(mk(E.ed,E.et)-mk(E.sd,E.st))/3600000;E.st=v;if(h>0){var ne=new Date(mk(E.sd,E.st).getTime()+h*3600000);E.ed=iso(ne);E.et=hm(ne);}editDraw(E);})));
c.appendChild(r);
r=el('div','r');
r.appendChild(fld('עד: '+dayName(E.ed),dateIn(E.ed,function(v){E.ed=v;editDraw(E);})));
r.appendChild(fld('עד שעה',sel(topts(E.et),E.et,function(v){E.et=v;editDraw(E);})));
c.appendChild(r);
var q2=el('div','ch');q2.style.justifyContent='center';
[1,2,3,4].forEach(function(h){q2.appendChild(btn('+'+h,null,function(){var ne=new Date(mk(E.ed,E.et).getTime()+h*3600000);E.ed=iso(ne);E.et=hm(ne);editDraw(E);}));});
c.appendChild(q2);
if(mk(E.ed,E.et)<=mk(E.sd,E.st))c.appendChild(el('div','warn','שעת ההחזרה חייבת להיות אחרי שעת הקבלה'));
w.appendChild(c);
if(GRPS.length){c=el('div','c');var ch=el('div','ch');
GRPS.forEach(function(g){var v=E.P[g.id]==null?-1:E.P[g.id];ch.appendChild(btn((v==1?'✓ ':v==0?'✕ ':'')+short(g.t),v==1?'g':v==0?'x':'n',function(){E.P[g.id]=v==-1?1:v==1?0:-1;editDraw(E);}));});
c.appendChild(ch);
if(E.cars.length){var rr=el('div','r');rr.style.margin='4px 0 0';rr.appendChild(fld('רכב מסוים',sel(E.cars,E.car,function(v){E.car=v;editDraw(E);})));c.appendChild(rr);}
w.appendChild(c);}
var a=el('div','acts');a.appendChild(btn('שמור שינויים','on',function(){saveEdit(E);}));a.appendChild(btn('ביטול',null,ordersView));w.appendChild(a);
}
function saveEdit(E){
var ns=mk(E.sd,E.st),ne=mk(E.ed,E.et);if(ne<=ns){say('שעת ההחזרה חייבת להיות אחרי שעת הקבלה');return;}
loading('שומר שינויים…');ALERTS=[];
var doc=IFR.contentDocument;
var p=(doc&&doc.querySelector('[name="end_time"]'))?Promise.resolve(doc):openEdit(E.o);
p.then(function(doc){
jset(doc,'start_date',site(E.sd));jset(doc,'start_time',E.st);jset(doc,'end_date',site(E.ed));jset(doc,'end_time',E.et);
jset(doc,'req_car_id',E.car);
GRPS.forEach(function(g){var v=E.P[g.id]==null?-1:E.P[g.id];Array.prototype.forEach.call(doc.querySelectorAll('input[name="grp_val_'+g.id+'"]'),function(rd){rd.checked=Number(rd.value)==v;});});
var f=doc.querySelector('[name="end_time"]').form;
var sb=Array.prototype.filter.call((f||doc).querySelectorAll('input[type="submit"],button[type="submit"],button:not([type]),input[type="button"]'),function(b){var t=clean(b.value||b.textContent);return !badCtl(b)&&t&&!/מחק|ביטול|בטל|סגור|בחר|בחירה/.test(t);})[0];
if(!sb)throw 'לא מצאתי כפתור שמירה בדף העריכה';
return clickLive(sb);
}).then(function(){var y=findYes(IFR.contentDocument);if(y)return clickLive(y);})
.then(function(){var ms=afterMsgs();return getDoc('/my_orders.php').then(function(d2){var n=parseMyOrders(d2).filter(function(x){return x.id==E.o.id;})[0];
var ok=n&&n.s&&n.e&&Math.abs(n.s-ns)<60000&&Math.abs(n.e-ne)<60000;
say((ok?'✅ ההזמנה עודכנה':'ההזמנה לא עודכנה כמו שביקשת')+(n&&n.s?'\nכעת: '+dtTxt(n.s)+' עד '+dtTxt(n.e):'')+(ms.length?'\n'+ms.join('\n'):'')).then(ordersView);});})
.catch(function(e){say(String(e)).then(ordersView);});
}
function deleteOrder(o){
loading('מוחק הזמנה…');ALERTS=[];
openEdit(o).then(function(doc){var c=findCancel(doc.body,true)||findCancel(doc.body,false);if(!c)throw 'לא מצאתי כפתור מחיקה בדף העריכה';return clickLive(c);})
.then(function(){var y=findYes(IFR.contentDocument);if(y)return clickLive(y);})
.then(function(){var ms=afterMsgs();return getDoc('/my_orders.php').then(function(d2){var still=parseMyOrders(d2).some(function(x){return x.id==o.id;});
say((still?'ההזמנה לא נמחקה':'✅ ההזמנה נמחקה')+(ms.length?'\n'+ms.join('\n'):'')).then(ordersView);});})
.catch(function(e){say(String(e)).then(ordersView);});
}
function ordersViewOld(){
loading('טוען הזמנות…');
withLogin('/my_orders.php').then(function(){return loadFrame('/my_orders.php');}).then(function(doc){
patchWin();
var w=shell();
w.appendChild(el('div','h ctr','📋 ההזמנות שלי'));
var list=parseOrders(doc);
if(!list.length){var nc=doc.querySelector('.no-content');var c=el('div','c');c.appendChild(el('div','ttl',nc?clean(nc.textContent):'לא נמצאו הזמנות'));w.appendChild(c);}
list.forEach(function(o){var card=orderCard(o,w,false,true);o.cancel=findCancel(o.tr,false);o.link=o.cancel?'':rowLink(o.tr);
var db=btn('🗑 מחק','del',function(){
if(!o.cancel&&!o.link){ask('לא מצאתי איך לבטל את ההזמנה הזו דרך האפליקציה','אפשר לבטל אותה באתר המקורי, ב"ניהול הזמנות".',null,'פתח באתר','סגור').then(function(ok){if(ok)location.href='/my_orders.php';});return;}
ask('למחוק את ההזמנה?',o.fields.map(function(f){return f[1];}).join(' · '),null,'מחק','ביטול').then(function(ok){if(ok)delOrder(o);});});
card.appendChild(db);});
var a=el('div','acts');a.appendChild(btn('הזמנה חדשה','on',back));a.appendChild(btn('פתח באתר',null,function(){location.href='/my_orders.php';}));a.appendChild(btn('הצג את הדף שנטען',null,showFrame));a.appendChild(btn('העתק מבנה דף',null,function(){dumpOrders(list);}));w.appendChild(a);
}).catch(function(e){say(String(e)).then(back);});
}
function cleanHtml(doc){var b=doc.body.cloneNode(true);Array.prototype.forEach.call(b.querySelectorAll('script,style,link,svg,noscript,[id*="vkb"],[class*="vkb"],.ui-datepicker,[id*="pick_users"]'),function(x){x.remove();});
return b.innerHTML.replace(/\s+/g,' ').replace(/ style="[^"]*"/g,'').slice(0,60000);}
function pageScripts(doc){var s=Array.prototype.map.call(doc.querySelectorAll('script:not([src])'),function(x){return x.textContent;}).filter(function(t){return /cancel|delete|order|edit|bitul|ביטול|מחק|עריכ/i.test(t);}).join('\n---\n').replace(/\s+/g,' ').slice(0,20000);
var ext=Array.prototype.map.call(doc.querySelectorAll('script[src]'),function(x){return x.getAttribute('src');}).join(' , ');return s+'\nEXTERNAL: '+ext;}
function dumpOrders(list){
loading('אוסף את מבנה הדף…');
var doc=IFR.contentDocument;var txt='=== MY_ORDERS '+VER+' ===\n'+cleanHtml(doc)+'\n=== SCRIPTS ===\n'+pageScripts(doc);
var lk=(list.filter(function(o){return o.link;})[0]||{}).link;
var p=lk?getDoc(lk).then(function(d2){txt+='\n=== ORDER PAGE '+lk.replace(/^https?:\/\/[^\/]+/,'')+' ===\n'+cleanHtml(d2)+'\n=== ORDER SCRIPTS ===\n'+pageScripts(d2);}).catch(function(){}):Promise.resolve();
p.then(function(){
var w=shell();var c=el('div','c');c.appendChild(el('div','ttl','מבנה הדף'));
c.appendChild(el('div','msg ctr','לחץ "העתק", ואז הדבק את זה בצ\'אט עם Claude'));
var ta=el('textarea','dump');ta.value=txt;ta.readOnly=true;c.appendChild(ta);
var st=el('div','lg','');
var a=el('div','acts');a.style.marginTop='12px';
a.appendChild(btn('העתק','on',function(){var ok=false;try{ta.readOnly=false;ta.focus();ta.setSelectionRange(0,ta.value.length);ok=d.execCommand('copy');ta.readOnly=true;}catch(e){}
if(!ok&&navigator.clipboard){navigator.clipboard.writeText(txt).then(function(){st.textContent='✅ הועתק';},function(){st.textContent='לא הצלחתי להעתיק אוטומטית - לחץ לחיצה ארוכה על הטקסט ← בחר הכול ← העתק';});}else st.textContent=ok?'✅ הועתק ('+txt.length+' תווים)':'לא הצלחתי להעתיק אוטומטית - לחץ לחיצה ארוכה על הטקסט ← בחר הכול ← העתק';}));
a.appendChild(btn('חזרה',null,ordersView));
c.appendChild(a);c.appendChild(st);w.appendChild(c);
});
}
function delOrder(o){
loading('מוחק הזמנה…');ALERTS=[];
var p=o.cancel?clickLive(o.cancel):loadFrame(o.link).then(function(doc){patchWin();var c=findCancel(doc.body,true)||findCancel(doc.body,false);if(!c)throw 'לא מצאתי כפתור ביטול בדף של ההזמנה. אפשר לבטל דרך "פתח באתר".';return clickLive(c);});
p.then(function(){var y=findYes(IFR.contentDocument);if(y)return clickLive(y);})
.then(function(){return getDoc('/my_orders.php');})
.then(function(d2){var still=parseOrders(d2).some(function(x){return x.text==o.text;});
say((still?'נראה שההזמנה לא נמחקה. בדוק ב"פתח באתר".':'✅ ההזמנה נמחקה')+(ALERTS.length?'\n'+ALERTS.join('\n'):'')).then(ordersView);})
.catch(function(e){say(String(e)).then(ordersView);});
}
var SCH=null,IFR=null,SV={car:'',date:'',hour:'',res:null,busy:false};
function schFrame(){if(IFR&&IFR.parentNode)return IFR;IFR=el('iframe');IFR.setAttribute('sandbox','allow-same-origin allow-scripts allow-forms');IFR.style.cssText='position:fixed;left:0;top:0;width:1100px;height:6000px;border:0;opacity:0.01;pointer-events:none;z-index:1';d.body.appendChild(IFR);return IFR;}
function loadFrame(url){return new Promise(function(res,rej){var f=schFrame();var fin=false;f.onload=function(){if(fin)return;fin=true;setTimeout(function(){res(f.contentDocument);},500);};f.src=url;setTimeout(function(){if(!fin){fin=true;rej('הסידור לא נטען');}},25000);});}
function shownDate(doc){var m=((doc&&doc.body&&doc.body.innerText)||'').match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);if(!m)return null;var y=Number(m[3]);if(y<100)y+=2000;return y+'-'+p2(Number(m[2]))+'-'+p2(Number(m[1]));}
function findClick(doc,re){var all=doc.querySelectorAll('a,button,input,li,span,div,td');for(var i=0;i<all.length;i++){var e=all[i];var t=clean(e.value||e.textContent);if(t.length<20&&re.test(t)&&!e.querySelector('a,button,input'))return e;}return null;}
function waitDate(target,ms){return new Promise(function(res){var t0=Date.now();(function poll(){var doc=IFR.contentDocument;if(doc&&doc.body&&shownDate(doc)==target)return setTimeout(function(){res(IFR.contentDocument);},500);if(Date.now()-t0>ms)return res(null);setTimeout(poll,300);})();});}
function findNav(doc,word){var best=null,bn=1e9;Array.prototype.forEach.call(doc.querySelectorAll('*'),function(e){if(e.tagName=='SCRIPT'||e.tagName=='STYLE')return;var t=clean(e.value||e.textContent);if(t.length>25||t.indexOf(word)<0)return;var n=e.getElementsByTagName('*').length;if(n<bn){bn=n;best=e;}});if(!best)return null;return best.closest('a,button,[onclick],li')||best;}
function stepDay(dir){var doc=IFR.contentDocument;var cur=shownDate(doc);var b=findNav(doc,dir>0?'יום הבא':'יום קודם');
if(!cur||!b)return Promise.reject('לא הצלחתי לעבור תאריך בסידור (תאריך: '+(cur||'לא נמצא')+' · כפתור: '+(b?'נמצא':'לא נמצא')+')');
['mousedown','mouseup'].forEach(function(t){try{b.dispatchEvent(new MouseEvent(t,{bubbles:true}));}catch(e){}});var nt=mk(cur,'12:00');nt.setDate(nt.getDate()+dir);b.click();return waitDate(iso(nt),12000).then(function(x){if(!x)throw 'מעבר התאריך בסידור נכשל (נלחץ: '+clean(b.outerHTML).slice(0,140)+' · תאריך מוצג: '+(shownDate(IFR.contentDocument)||'?')+')';return waitRows(10000);});}
function gotoDate(target){
var base=mk(target,'00:00');base.setDate(base.getDate()-1);var ts=Math.round(base.getTime()/1000);
return loadFrame('/schedule.php?day=next&tmp='+ts).then(function(){return waitRows(12000);}).then(function(doc){
var sd=shownDate(doc);if(sd==target)return doc;
return gotoDateSteps(target).catch(function(){throw 'לא הצלחתי לעבור לתאריך '+sh(target)+' (הוצג: '+(sd?sh(sd):'?')+')';});
});
}
function gotoDateSteps(target){var cur=shownDate(IFR.contentDocument);if(!cur)return Promise.reject('לא זוהה תאריך בסידור');var diff=Math.round((mk(target,'12:00')-mk(cur,'12:00'))/86400000);if(Math.abs(diff)>31)return Promise.reject('אפשר לבחור עד חודש מהיום');var p=Promise.resolve();for(var i=0;i<Math.abs(diff);i++){p=p.then(function(){return stepDay(diff>0?1:-1);});}return p.then(function(){return IFR.contentDocument;});}
var PRE=/(\d{2,3}) ?[-‐-―־−] ?(\d{2,3}) ?[-‐-―־−] ?(\d{2,3})/;
function nbidi(s){return (s||'').replace(/[‎‏‪-‮⁦-⁩ ]/g,' ').replace(/ +/g,' ');}
function plateOf(s){var m=nbidi(s).match(PRE);return m?m[1]+'-'+m[2]+'-'+m[3]:null;}
function plateNodes(doc){var out=[];if(!doc||!doc.body)return out;var tw=doc.createTreeWalker(doc.body,4,null);var nd;while((nd=tw.nextNode())){var p=plateOf(nd.nodeValue);if(p&&nd.parentNode)out.push({e:nd.parentNode,t:p});}
Array.prototype.forEach.call(doc.querySelectorAll('input'),function(e){var p=plateOf(e.value);if(p)out.push({e:e,t:p});});
return out;}
function digitSample(doc){var out=[];if(!doc||!doc.body)return '';var tw=doc.createTreeWalker(doc.body,4,null);var nd;while((nd=tw.nextNode())&&out.length<3){var v=nd.nodeValue;if(/\d{3}/.test(v)&&!/\d{1,2}\/\d{1,2}/.test(v)){out.push(v.trim().slice(0,24)+' ['+v.trim().slice(0,12).split('').map(function(ch){return /\d/.test(ch)?'':ch.charCodeAt(0).toString(16);}).filter(String).join(',')+']');}}return out.join(' | ');}
function resList(doc){try{return doc.defaultView.performance.getEntriesByType('resource').filter(function(x){return /xmlhttprequest|fetch|iframe/.test(x.initiatorType)||/\.php/.test(x.name);}).map(function(x){return x.name.replace(/^https?:\/\/[^\/]+/,'');}).slice(0,6).join(' , ');}catch(e){return '?';}}
function waitRows(ms){return new Promise(function(res){var t0=Date.now(),last=-1,same=0;(function poll(){var doc=IFR.contentDocument;var n=(doc&&doc.body)?doc.getElementsByTagName('div').length:0;if(n==last&&n>200)same++;else same=0;last=n;if(same>=3||plateNodes(doc).length>2||Date.now()-t0>ms)return setTimeout(function(){res(IFR.contentDocument);},200);setTimeout(poll,350);})();});}
function diag(doc,extra){var b=(doc&&doc.body)||null;var tx=b?clean(b.innerText||b.textContent).slice(0,140):'';var q0=function(s){try{return doc.querySelectorAll(s).length;}catch(e){return '?';}};
return '\n('+(extra||'')+' רישויים: '+plateNodes(doc).length+' · iframe: '+q0('iframe')+' · canvas: '+q0('canvas')+' · svg: '+q0('svg')+' · tr: '+q0('tr')+' · div: '+q0('div')+' · בקשות: '+resList(doc)+' · דוגמה: '+digitSample(doc)+' · המשך טקסט: '+(b?clean(b.innerText||b.textContent).slice(140,320):'')+')';}
function parseSchedule(doc){
var win=doc.defaultView,H={},all=doc.body.getElementsByTagName('*');
Array.prototype.forEach.call(all,function(e){if(e.children.length)return;var t=clean(e.textContent);if(!/^\d{1,2}$/.test(t))return;var h=Number(t);if(h>23)return;var r=e.getBoundingClientRect();if(r.width<3||r.height<3)return;if(!H[h]||r.top<H[h].top)H[h]={top:r.top,bot:r.bottom,c:(r.left+r.right)/2};});
var hs=Object.keys(H).map(Number);if(hs.length<6)throw 'לא זוהו שעות בסידור'+diag(doc,'שעות: '+hs.length+' ·');
var n=hs.length,sx=0,sy=0,sxx=0,sxy=0;hs.forEach(function(h){var y=H[h].c;sx+=h;sy+=y;sxx+=h*h;sxy+=h*y;});
var qq=(n*sxy-sx*sy)/(n*sxx-sx*sx),pp=(sy-qq*sx)/n;
function tOf(x){return (x-pp+qq/2)/qq;}
var xa=pp-qq/2,xb=pp-qq/2+24*qq,xmin=Math.min(xa,xb),xmax=Math.max(xa,xb);
var rows=[];
var seenP={};
plateNodes(doc).forEach(function(pn){var e=pn.e,t=pn.t;if(seenP[t])return;var er0=e.getBoundingClientRect();if(er0.left<xmax-2&&er0.right>xmin+2&&er0.left>xmin-2)return;seenP[t]=1;
var tr=e.closest('tr');var rr=(tr||e).getBoundingClientRect();if(rr.height>80){var er=e.getBoundingClientRect();rr={top:er.top-10,bottom:er.bottom+10};}
var info=[];if(tr)Array.prototype.forEach.call(tr.children,function(td){var r=td.getBoundingClientRect();if(r.left>=xmax-2||r.right<=xmin+2){var x=clean(td.textContent);if(x)info.push(x);}});
var num=info.filter(function(x){return /^\d{1,4}$/.test(x);})[0]||'';
var model=info.length?info[info.length-1]:'';if(model==t||model==num)model='';
rows.push({num:num,plate:t,key:t,model:model,top:rr.top,bot:rr.bottom,bars:[]});});
if(!rows.length){
var CMAP={};CARS.forEach(function(c){var m=c.t.match(/^(\d+)\s+(.*)$/);if(m)CMAP[m[1]]={plate:plateOf(m[2])||'',desc:m[2]};});
var minTop=Math.min.apply(null,hs.map(function(h){return H[h].top;}));var hdrBot=minTop;hs.forEach(function(h){if(H[h].top<minTop+6&&H[h].bot>hdrBot)hdrBot=H[h].bot;});
var items=[];
Array.prototype.forEach.call(all,function(e){if(e.children.length)return;var t=clean(e.textContent);if(!t||t.length>40)return;var r=e.getBoundingClientRect();if(r.width<2||r.height<6)return;if(!(r.left>=xmax-2||r.right<=xmin+2))return;var cy=(r.top+r.bottom)/2;if(cy<=hdrBot+2)return;items.push({t:t,cy:cy});});
items.sort(function(a,b){return a.cy-b.cy;});
var groups=[];items.forEach(function(it){var g=groups[groups.length-1];if(g&&Math.abs(it.cy-g.cy)<10)g.items.push(it);else groups.push({cy:it.cy,items:[it]});});
var gaps=[];for(var gi=1;gi<groups.length;gi++)gaps.push(groups[gi].cy-groups[gi-1].cy);gaps.sort(function(a,b){return a-b;});var gap=gaps.length?gaps[Math.floor(gaps.length/2)]:40;
groups.forEach(function(g,i){
var num=(g.items.filter(function(x){return /^\d{1,4}$/.test(x.t);})[0]||{}).t||'';
var mdl=(g.items.filter(function(x){return !/^\d+$/.test(x.t)&&!/[\/:]/.test(x.t);})[0]||{}).t||'';
if(!num&&!mdl)return;
var cm=CMAP[num||'0'];var ok0=cm&&(num||(mdl&&cm.desc.indexOf(mdl)>=0));var pl=ok0?cm.plate:'';
var md=ok0?clean(cm.desc.replace(cm.plate,'').replace(/\d+\s*מקומות/,'')):'';
rows.push({num:num||(ok0?'0':''),plate:pl,key:num?'n'+num:'r'+i,model:md||mdl,top:g.cy-gap/2,bot:g.cy+gap/2,bars:[]});
});
}
var picked=[];
var sd0=shownDate(doc);var day0=sd0?mk(sd0,'00:00'):null;
Array.prototype.forEach.call(all,function(e){
var r=e.getBoundingClientRect();if(r.width<6||r.height<8||r.height>120)return;if(r.right<xmin+2||r.left>xmax-2||r.width>xmax-xmin+10)return;
var t=clean(e.innerText||e.textContent);if(!t||/^[\d\s:]+$/.test(t))return;
var bg=win.getComputedStyle(e).backgroundColor||'';var cn=bg.match(/[\d.]+/g);if(!cn||cn.length<3)return;if(cn.length>3&&Number(cn[3])<0.3)return;
var c3=[Number(cn[0]),Number(cn[1]),Number(cn[2])];if(Math.max.apply(null,c3)-Math.min.apply(null,c3)<45)return;
if(picked.some(function(p){return p.contains(e);}))return;picked.push(e);
var cy=(r.top+r.bottom)/2;var row=rows.filter(function(w){return cy>=w.top&&cy<=w.bot;})[0];if(!row)return;
var ttl=e.getAttribute('title')||'';var te=e.querySelector('[title]');if(!ttl&&te)ttl=te.getAttribute('title')||'';
var a=tOf(r.left),b=tOf(r.right);var s=Math.max(0,Math.min(a,b)),en=Math.min(24,Math.max(a,b));
var parts=ttl.split(/<br\s*\/?>|\n/i).map(clean).filter(String);
var nm=parts.filter(function(x){return !/\d{1,2}:\d{2}/.test(x);}).join(' · ')||t;
var gs=s,ge=en,sT='',eT='',skip=false,sDay='',eDay='';
var tre=/(?:(\d{1,2})[\/.](\d{1,2})(?:[\/.](\d{2,4}))?\s+)?(\d{1,2}):(\d{2})(?:\s+(\d{1,2})[\/.](\d{1,2})(?:[\/.](\d{2,4}))?)?/g,mt,TM=[];
while((mt=tre.exec(ttl))&&TM.length<4){if(!mt[1]&&mt[6]){mt[1]=mt[6];mt[2]=mt[7];mt[3]=mt[8];}TM.push(mt);}
if(TM.length>=2&&day0){
var A=TM[0],B=TM[1];
var dOf=function(x){if(!x[1])return null;var y=x[3]?Number(x[3]):day0.getFullYear();if(y<100)y+=2000;return new Date(y,Number(x[2])-1,Number(x[1]));};
var at=function(D,x){return new Date(D.getFullYear(),D.getMonth(),D.getDate(),Number(x[4]),Number(x[5]));};
var plus=function(D,n){var r=new Date(D.getTime());r.setDate(r.getDate()+n);return r;};
var best=null;
[[A,B],[B,A]].forEach(function(pr){var X=pr[0],Y=pr[1];var dX=dOf(X),dY=dOf(Y);
var sOpts=dX?[dX]:(dY?[dY,plus(dY,-1)]:[plus(day0,-1),day0,plus(day0,1)]);
sOpts.forEach(function(sd){var S0=at(sd,X);var eOpts=dY?[dY]:[sd,plus(sd,1)];
eOpts.forEach(function(ed){var E0=at(ed,Y);if(E0<=S0||E0-S0>7*86400000)return;
var rs=(S0-day0)/3600000,re2=(E0-day0)/3600000;var cs=Math.max(0,Math.min(24,rs)),ce=Math.max(0,Math.min(24,re2));
var sc=Math.abs(cs-gs)+Math.abs(ce-ge)+((re2<=0||rs>=24)?50:0)+(E0-S0)/3600000/1000;
if(!best||sc<best.sc)best={sc:sc,S:S0,E:E0,rs:rs,re:re2};});});});
if(best&&best.sc>=50&&(A[1]||B[1])){skip=true;s=0;en=0;sT=hm(best.S);eT=hm(best.E);sDay=iso(best.S);eDay=iso(best.E);}
else if(best&&best.sc<6){
if(best.re<=0||best.rs>=24)skip=true;
s=Math.max(0,best.rs);en=Math.min(24,best.re);sT=hm(best.S);eT=hm(best.E);
if(iso(best.S)!=iso(day0)||iso(best.E)!=iso(day0)){sDay=iso(best.S);eDay=iso(best.E);}
}
}
var ds=t.indexOf(nm)==0?clean(t.slice(nm.length)):'';if(/(…|\.\.\.)$/.test(ds))ds='';
var bo={s:s,e:en,sT:sT,eT:eT,sDay:sDay,eDay:eDay,t:nm,d:ds,raw:clean(ttl.replace(/<br\s*\/?>/gi,' | '))+(t&&t!=nm?' || '+t:'')};
row.other=row.other||[];
if(skip)row.other.push(bo);else if(en-s>0.02)row.bars.push(bo);
});
rows.forEach(function(w){w.bars.sort(function(x,y){return x.s-y.s;});markOv(w.bars);});
rows=rows.filter(function(w){return w.num||w.plate||w.bars.length;});
return {date:shownDate(doc),rows:rows};
}
function markOv(bars){bars.forEach(function(b){b.ov=false;});for(var i=0;i<bars.length;i++)for(var j=i+1;j<bars.length;j++){if(bars[j].s<bars[i].e-0.02&&bars[i].s<bars[j].e-0.02){bars[i].ov=true;bars[j].ov=true;}}}
function fmtT(x){var m=Math.round(x*12)*5;if(m>=1440)return '24:00';var h=Math.floor(m/60);return p2(h)+':'+p2(m-h*60);}
function carLbl(w){return [w.num?'רכב '+w.num:'',w.model,w.plate].filter(String).join(' · ');}
function carTitle(w){return w.num?'רכב '+w.num+(w.model?' - '+w.model:''):(w.model||w.plate||'רכב');}
function carRank(x,qv){if(!qv)return 5;if(x.num==qv)return 0;if(x.num&&x.num.indexOf(qv)==0)return 1;if(carTitle(x).indexOf(qv)>=0)return 2;if((x.plate||'').indexOf(qv)>=0||(x.plate||'').replace(/-/g,'').indexOf(qv)>=0)return 3;return 9;}
function bT(b){return (b.sT||fmtT(b.s))+' – '+(b.eT||fmtT(b.e));}
function dmy(x){return fdate(x);}
function timeRow(s,e,sd,ed){var r=el('div','bkt');
var a=el('div','tv');if(sd)a.appendChild(el('small','od',dmy(sd)));a.appendChild(el('b',null,s));a.appendChild(el('small',null,'התחלה'));
var z=el('div','tv');if(ed)z.appendChild(el('small','od',dmy(ed)));z.appendChild(el('b',null,e));z.appendChild(el('small',null,'סיום'));
r.appendChild(a);r.appendChild(el('div','ar'));r.appendChild(z);return r;}
function hrs(t){var a=(t||'').split(':');return Number(a[0])+Number(a[1])/60;}
function mergeFrom(base,o,X){
if(!o||!o.rows)return;
o.rows.forEach(function(r2){var row=base.rows.filter(function(w){return w.key==r2.key;})[0];if(!row)return;
r2.bars.concat(r2.other||[]).forEach(function(b){if(!(b.sDay&&b.eDay&&b.sDay<=X&&b.eDay>=X))return;
if(row.bars.some(function(x){return x.t==b.t&&x.sT==b.sT&&(x.sDay||X)==b.sDay;}))return;
var nb={};for(var k in b)nb[k]=b[k];nb.s=b.sDay<X?0:hrs(b.sT);nb.e=b.eDay>X?24:hrs(b.eT);row.bars.push(nb);});
row.bars.sort(function(x,y){return x.s-y.s;});markOv(row.bars);});
}
function addD(x,n){var t=mk(x,'12:00');t.setDate(t.getDate()+n);return iso(t);}
function mergeAdj(){
var base=SCH,X=SCH.date;if(!X)return Promise.resolve();
SV.merging=true;
return gotoDate(addD(X,1)).then(function(doc){mergeFrom(base,parseSchedule(doc),X);}).catch(function(){})
.then(function(){return gotoDate(addD(X,-1));}).then(function(doc){mergeFrom(base,parseSchedule(doc),X);}).catch(function(){})
.then(function(){SCH=base;SV.merging=false;if(VIEW=='sch'&&SV.date==X&&!SV.pending)schDraw();if(SV.pending){SV.pending=false;showSch();}});
}
function withGaps(bars){var out=[];bars.forEach(function(b,i){out.push(b);var nx=bars[i+1];if(nx&&nx.s-b.e>=5/60)out.push({gap:true,s:b.e,e:nx.s,sT:b.eT,eT:nx.sT,t:'לא מוזמן'});});return out;}
function bookingCard(b,parent){
var isToday=SCH.date==iso(new Date());var nw=new Date();var nh=nw.getHours()+nw.getMinutes()/60;
var active=isToday&&b.s<=nh&&nh<b.e,past=isToday&&b.e<=nh;
var dm=fdate;
if(!b.gap&&((b.sDay&&b.sDay<SCH.date)||(b.eDay&&b.eDay>SCH.date)))parent.appendChild(el('div','cap','נסיעה של כמה ימים: '+dm(b.sDay||SCH.date)+' – '+dm(b.eDay||SCH.date)));
var c=el('div','c bk'+(active?' now':'')+(past?' past':'')+(b.gap?' gap':''));
var m=el('div','bkm');m.appendChild(timeRow(b.sT||fmtT(b.s),b.eT||fmtT(b.e),b.sDay&&b.sDay!=SCH.date?b.sDay:'',b.eDay&&b.eDay!=SCH.date?b.eDay:''));m.appendChild(el('div','bkn',b.t));if(b.d)m.appendChild(el('div','bkd',b.d));c.appendChild(m);
if(b.gap&&active){var sg=el('div','bks');sg.appendChild(el('div','lbl2','פנוי עכשיו'));c.appendChild(sg);parent.appendChild(c);return;}
if(b.gap){parent.appendChild(c);return;}
if(b.ov)m.appendChild(el('div','warn','⚠️ חופף להזמנה אחרת לפי נתוני האתר'));
if(b.raw){var rw=el('div','raw','מקור: '+b.raw);rw.style.display='none';m.appendChild(rw);c.onclick=function(){rw.style.display=rw.style.display=='none'?'block':'none';};}
var sd=el('div','bks');
if(active){sd.appendChild(el('div','ico','🚗'));sd.appendChild(el('div','lbl','עכשיו'));}
else if(past)sd.appendChild(el('div','lbl2','הסתיים'));
else if(isToday)sd.appendChild(el('div','lbl2','בהמשך'));
c.appendChild(sd);parent.appendChild(c);
}
function scheduleView(){
VIEW='sch';
if(!SV.date)SV.date=iso(new Date());
loading('טוען סידור…');
withLogin('/schedule.php').then(function(){return loadFrame('/schedule.php');}).then(function(){return waitRows(15000);}).then(function(doc){SCH=parseSchedule(doc);if(!SCH.rows.length)throw 'לא הצלחתי לקרוא את רשימת הרכבים בסידור'+diag(doc,'');if(SCH.date==iso(new Date()))TODAY=SCH;schDraw();if(!SCH.merged){SCH.merged=true;mergeAdj();}})
.catch(function(e){SCH=null;ask('',String(e),null,'סגור','הצג את הדף שנטען').then(function(ok){schDraw();if(ok===null)showFrame();});});
}
function showFrame(){
if(!IFR)return;
var prev=IFR.style.cssText;
IFR.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;border:0;opacity:1;z-index:2147483647;background:white';
var x=d.createElement('button');x.textContent='✕ סגור תצוגה';
x.style.cssText='position:fixed;bottom:24px;left:20px;right:20px;z-index:2147483647;background:black;color:white;border:0;border-radius:999px;padding:14px 22px;font-size:17px';
x.onclick=function(){IFR.style.cssText=prev;x.remove();};
d.body.appendChild(x);
}
var TODAY=null;
function carInfo(x){
var model=x.model||'',plate=x.plate||'';
if((!model||!plate)&&x.num!==''&&x.num!=null){
var c=CARS.filter(function(k){var m=k.t.match(/^(\d+)\s/);return m&&m[1]==String(x.num);})[0];
if(!c&&plate)c=CARS.filter(function(k){return plateOf(k.t)==plate;})[0];
if(c){var pl=plateOf(c.t)||'';if(!plate)plate=pl;if(!model)model=clean(c.t.replace(/^\d+\s+/,'').replace(pl,'').replace(/\d+\s*מקומות/,''));}
}
return {model:model,plate:plate};
}
function nowTable(w){
var T=TODAY;if(!T||T.date!=iso(new Date()))return;
var nw=new Date(),nh=nw.getHours()+nw.getMinutes()/60;
var c=el('div','c tbl');
c.appendChild(el('div','h','מי עם הרכבים עכשיו · '+hm(nw)));
var rows=T.rows.slice().sort(function(a,b){return (Number(a.num)||0)-(Number(b.num)||0);});
var pick=function(x){return function(){SV.car=x.key;SV.date=T.date;SV.hour='';SV.res=null;showSch();try{box.scrollTop=0;}catch(e){}};};
var fr=null;
rows.forEach(function(x){
var on=x.bars.filter(function(b){return !b.gap&&b.s<=nh&&nh<b.e;})[0];
if(!on){
if(!fr){fr=el('div','tfree');fr.appendChild(el('div','tfl','לא משובצים'));fr.wr=el('div','ch');fr.wr.style.margin='0';fr.appendChild(fr.wr);c.appendChild(fr);}
fr.wr.appendChild(btn(x.num||x.model||'?','n tchip',pick(x)));return;}
fr=null;
var r=el('div','trow');
var info=carInfo(x);
var a=el('div','tcar');a.appendChild(el('div','tct',(x.num?'רכב '+x.num:'')+(x.num&&info.model?' - ':'')+(info.model||(x.num?'':'רכב'))));
if(info.plate)a.appendChild(el('div','tcp',info.plate));r.appendChild(a);
var b=el('div','twho');
b.appendChild(el('div','twn',on.t));b.appendChild(el('div','tcp','עד '+(on.eDay&&on.eDay!=T.date?fdate(on.eDay)+' ':'')+(on.eT||fmtT(on.e))));
r.appendChild(b);
r.onclick=pick(x);
c.appendChild(r);});
w.appendChild(c);
}
function schDraw(){
VIEW='sch';
var w=shell();
var c=el('div','c');
c.appendChild(el('div','h','סידור רכבים'));
if(!SCH){c.appendChild(el('div','msg','הסידור לא נטען.'));var a0=el('div','acts');a0.appendChild(btn('נסה שוב','on',scheduleView));a0.appendChild(btn('פתח את הסידור באתר',null,function(){location.href='/schedule.php';}));c.appendChild(a0);w.appendChild(c);return;}
var curRow=SCH.rows.filter(function(x){return x.key==SV.car;})[0];
var ci=el('input');ci.type='search';ci.placeholder='מספר רכב, דגם או מספר רישוי';ci.value=curRow?carTitle(curRow):'';
var cl=el('div','clist');cl.style.display='none';
function fillCars(qv){cl.innerHTML='';
if(!qv){var it0=el('div','opt'+(!SV.car?' cur':''),'כל הרכבים');it0.onclick=function(){SV.car='';SV.res=null;if(SV.hour)showSch();else schDraw();};cl.appendChild(it0);}
var L=SCH.rows.map(function(x){return {x:x,k:carRank(x,qv)};}).filter(function(o){return o.k<9;});
L.sort(function(a,b){return a.k-b.k||(Number(a.x.num)||0)-(Number(b.x.num)||0);});
if(qv&&!L.length)cl.appendChild(el('div','opt lg','לא נמצא רכב'));
L.forEach(function(o){var x=o.x;var it=el('div','opt'+(x.key==SV.car?' cur':''));it.appendChild(el('div','ot',carTitle(x)));if(x.plate)it.appendChild(el('div','os',x.plate));it.onclick=function(){SV.car=x.key;SV.res=null;showSch();};cl.appendChild(it);});
cl.style.display='block';}
ci.onfocus=function(){fillCars('');try{ci.select();}catch(e){}};ci.oninput=function(){fillCars(ci.value.trim());};
ci.onblur=function(){setTimeout(function(){cl.style.display='none';ci.value=curRow?carTitle(curRow):'';},250);};
var r=el('div','r');r.style.marginBottom='0';r.appendChild(fld('רכב',ci));c.appendChild(r);
if(curRow&&curRow.plate){var pl0=el('div','lg',curRow.plate);pl0.style.marginTop='4px';c.appendChild(pl0);}
c.appendChild(cl);
r=el('div','r');r.style.marginTop='12px';
var auto=function(){SV.res=null;if(SV.car||SV.hour)showSch();else schDraw();};
var sdt=dateIn(SV.date,function(v){SV.date=v;auto();});sdt.inp.qbStep=30;
drag(sdt.inp,function(n){var t=mk(SV.date,'12:00');t.setDate(t.getDate()+n);SV.date=iso(t);sdt.setV(SV.date);},auto);
var shr=sel([{v:'',t:'כל היום'}].concat(TO),SV.hour,function(v){SV.hour=v;auto();});
drag(shr,function(n){if(!SV.hour){var nq=new Date();nq.setMinutes(Math.floor(nq.getMinutes()/15)*15,0,0);SV.hour=hm(nq);}SV.hour=TO[clampI(idx(SV.hour)+n)].v;shr.value=SV.hour;},auto);
r.appendChild(fld('תאריך ↕',sdt));
r.appendChild(fld('שעה ↕ (לא חובה)',shr));
c.appendChild(r);
var shiftDay=function(n){if(SV.busy)return;var t=mk(SV.date,'12:00');t.setDate(t.getDate()+n);SV.date=iso(t);auto();};
var a=el('div','acts');a.style.marginTop='12px';
a.appendChild(btn('‹ יום לפני',null,function(){shiftDay(-1);}));
a.appendChild(btn(SV.busy||SV.pending?'טוען…':'הצג','on',showSch));
a.appendChild(btn('יום אחרי ›',null,function(){shiftDay(1);}));
c.appendChild(a);
w.appendChild(c);
if(SV.res)SV.res(w);
nowTable(w);
if(SV.merging&&SV.res)w.appendChild(el('div','lg','בודק נסיעות שגולשות מהיום שלפני ומהיום שאחרי…'));
var a2=el('div','acts');a2.appendChild(btn('חזרה להזמנה',null,back));a2.appendChild(btn('הסידור המקורי',null,function(){location.href='/schedule.php';}));w.appendChild(a2);
}
function showSch(){
if(SV.busy)return;
if(SV.merging){SV.pending=true;SV.res=null;schDraw();return;}
if(!SV.car&&!SV.hour){say('בחר רכב, או שעה כדי לראות את כל הרכבים');return;}
SV.busy=true;schDraw();
var p=SCH.date==SV.date?Promise.resolve(null):gotoDate(SV.date).then(function(doc){SCH=parseSchedule(doc);if(SCH.date==iso(new Date()))TODAY=SCH;});
p.then(function(){SV.busy=false;SV.res=renderSch;schDraw();if(!SCH.merged){SCH.merged=true;mergeAdj();}}).catch(function(e){SV.busy=false;schDraw();say(String(e));});
}
function renderSch(w){
var rows=SCH.rows.filter(function(x){return !SV.car||x.key==SV.car;});
var hdr=el('div','sub','סידור ליום '+sh(SCH.date)+(SV.hour?' בשעה '+SV.hour:''));w.appendChild(hdr);
if(SV.hour){
var hb=SV.hour.split(':'),t=Number(hb[0])+Number(hb[1])/60+0.001;
var free=[];
rows.forEach(function(x){var on=x.bars.filter(function(b){return b.s<=t&&t<b.e;});
if(!on.length){if(SV.car){var c0=el('div','c');carBox(c0,null,'פנוי בשעה '+SV.hour);w.appendChild(c0);var pv=x.bars.filter(function(b){return b.e<=t;}).pop();var nx=x.bars.filter(function(b){return b.s>t;})[0];if(pv){w.appendChild(el('div','sub','לפני'));bookingCard(pv,w);}if(nx){w.appendChild(el('div','sub','אחרי'));bookingCard(nx,w);}}else free.push(x);return;}
if(!SV.car)w.appendChild(el('div','gh',carTitle(x)));
on.forEach(function(b){bookingCard(b,w);});});
if(free.length){var cf=el('div','c');cf.appendChild(el('div','h','פנויים בשעה הזו ('+free.length+')'));var fc=el('div','ch');free.forEach(function(x){fc.appendChild(btn(carTitle(x),'n',function(){SV.car=x.key;SV.hour='';SV.res=renderSch;schDraw();}));});cf.appendChild(fc);w.appendChild(cf);}
}else{
rows.forEach(function(x){
if(!SV.car)w.appendChild(el('div','gh',carTitle(x)));
if(!x.bars.length){var c2=el('div','c');c2.appendChild(el('div','ttl','אין שיבוצים ביום הזה'));w.appendChild(c2);}
withGaps(x.bars).forEach(function(b){bookingCard(b,w);});
if(SV.car){var tb=el('div','acts');var tc=el('div','c');tc.style.display='none';
x.bars.concat(x.other||[]).forEach(function(b){tc.appendChild(el('div','raw',((x.other||[]).indexOf(b)>=0?'[מסונן] ':'')+(b.sDay||'')+' '+(b.sT||fmtT(b.s))+' → '+(b.eDay||'')+' '+(b.eT||fmtT(b.e))+' · '+(b.raw||b.t)));});
if(!tc.children.length)tc.appendChild(el('div','raw','לא נמצאו פסים לרכב הזה'));
tb.appendChild(btn('פרטים טכניים',null,function(){tc.style.display=tc.style.display=='none'?'block':'none';}));w.appendChild(tb);w.appendChild(tc);}
});
}
}
function done(html,dn,when){
var doc=new DOMParser().parseFromString(html,'text/html');
if(loginForm(doc)){result('bad','נותקת מהמערכת',['לחץ שוב על הסימנייה כדי להתחבר מחדש'],dn,when,null,null,html);return;}
var ms=msgs(doc,html);
var all=ms.map(function(o){return o.t;}).join('\n');
var isBad=ms.some(function(o){return /error|err/.test(o.c);})||/(שגיא|נכשל|לא ניתן|אין רכב|לא נמצא רכב|לא שובץ|נדח|חסר|לא תקין|תפוס|חפיפה)/.test(all);
var isOk=!isBad&&/(נקלט|נשמר|בוצע|שובץ|אושר|בהצלחה|הוזמן|התקבל)/.test(all);
var car=findCar(all);
getDoc('/my_orders.php').then(function(d2){
var k1=site(S.sd),k2=k1.replace(/-/g,'/'),k3=k2.slice(0,6)+k2.slice(8);
var st0d=mk(S.sd,S.st);
var match=parseMyOrders(d2).filter(function(o){return o.s&&Math.abs(o.s-st0d)<60000;})[0]||null;
if(match)match.my=true;
if(!match)match=parseOrders(d2).filter(function(o){return (o.text.indexOf(k1)>=0||o.text.indexOf(k2)>=0||o.text.indexOf(k3)>=0)&&o.text.indexOf(S.st)>=0;})[0]||null;
if(match&&!isBad)isOk=true;
if(match)car=(match.my?match.car:carOf(match))||car;
fin(match);
}).catch(function(){fin(null);});
function fin(match){
var kind=isBad?'bad':isOk?'ok':'unk';
var title=isBad?'ההזמנה לא אושרה':isOk?'ההזמנה נקלטה':'התקבלה תשובה מהמערכת';
result(kind,title,ms.map(function(o){return o.t;}),dn,when,car,match,html);
}
}
function result(kind,title,list,dn,when,car,match,html){
var w=shell();
if(match&&match.my&&kind!='bad'){
var hd=el('div','okh',(kind=='ok'?'✅ ':'')+title);w.appendChild(hd);
myOrderCard(match,w,false);
if(kind!='ok')list.forEach(function(t){w.appendChild(el('div','msg',t));});
}else{
var c=el('div','c res '+kind);
c.appendChild(el('div','big',kind=='ok'?'✅':kind=='bad'?'❌':'ℹ️'));
c.appendChild(el('div','ttl',title));
c.appendChild(el('div','sub',dn+' · '+when));
carBox(c,car,kind=='ok'?'טרם שובץ':'לא שובץ רכב');
list.forEach(function(t){c.appendChild(el('div','msg',t));});
if(!list.length&&!match&&kind!='ok')c.appendChild(el('div','msg','האתר לא החזיר הודעה. בדוק ב"ההזמנות שלי".'));
w.appendChild(c);
if(match&&!match.my){w.appendChild(el('div','sub','פרטי ההזמנה במערכת'));orderCard(match,w,true,false);}
}
var a=el('div','acts');
a.appendChild(btn('ההזמנות שלי','on',ordersView));
a.appendChild(btn('הזמנה נוספת',null,back));
if(html)a.appendChild(btn('דף האתר המקורי',null,function(){d.open();d.write(html);d.close();}));
w.appendChild(a);
}
d.body.appendChild(box);
toTop();setTimeout(toTop,400);setTimeout(toTop,1200);
loading('מתחבר…');
var live=orderForm(d);
if(live){init(live);return;}
withLogin('/order.php').then(function(doc){var f=orderForm(doc);if(!f)throw 'לא נמצא דף ההזמנה באתר';return f;}).then(init).catch(function(e){say(String(e)).then(function(){box.remove();});});
})();
