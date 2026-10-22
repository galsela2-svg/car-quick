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
function cur(){return PR.list[PR.cur]||null;}
function addUser(){return ask(PR.list.length?'הוספת משתמש':'כניסה לאתר הרכבים','הפרטים נשמרים רק בטלפון',[{label:'שם משתמש'},{label:'קוד כניסה',type:'password'}],'שמור והתחבר','ביטול').then(function(v){if(!v||!v[1])return null;PR.list.push({u:v[0].trim(),c:v[1].trim()});PR.cur=PR.list.length-1;sv('qbu',PR);return cur();});}
function creds(){var c=cur();return c?Promise.resolve(c):addUser();}
function doLogin(lf){
return creds().then(function(c){
if(!c)throw 'הכניסה בוטלה';
Array.prototype.forEach.call(lf.querySelectorAll('input'),function(i){var t=(i.type||'text').toLowerCase();if(t=='password')i.value=c.c;else if(t=='text'||t=='tel'||t=='number'||t=='email')i.value=c.u;});
var loc=lf.querySelector('[name="location"]');if(loc)loc.value='/order.php';
var body=ser(lf);body.append('front_login_btn','כניסה');
return fetch(lf.getAttribute('action')||'/login.php',{method:'POST',body:body,credentials:'same-origin'}).then(function(){return getDoc('/order.php');});
});
}
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
draw();
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
'.qbx .hb{display:flex;gap:6px}'+
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
var VER='22.10-1';
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
function dateIn(v,f){var i=el('input');i.type='date';i.value=v;i.onchange=function(){if(i.value)f(i.value);};return i;}
function seg(items,isOn,onTap){var s=el('div','seg');items.forEach(function(it){s.appendChild(btn(it[0],isOn(it[1])?'on':'',function(){onTap(it[1]);}));});return s;}
function keepDur(fn){var h=dur();fn();setDur(h>0?h:2);draw();}
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
function back(){if(form)draw();else box.remove();}
function shell(){
box.innerHTML='';box.appendChild(el('style',null,css));
var h=el('div','hdr');var ttl=el('b',null,'הזמנת רכב');ttl.onclick=pickTheme;ttl.style.cursor='pointer';h.appendChild(ttl);
var hb=el('div','hb');hb.appendChild(btn('📋 ההזמנות שלי',null,ordersView));hb.appendChild(btn('✕',null,function(){box.remove();}));h.appendChild(hb);
box.appendChild(h);
var us=el('div','users');
PR.list.forEach(function(p,i){us.appendChild(btn('👤 '+(p.u||'משתמש'),i==PR.cur?((p.u||'').indexOf('ניבה')>=0?'pk':'on'):'',function(){switchUser(i);}));});
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
function drag(e,apply){
var y0=null,last=0,moved=false;
e.style.touchAction='none';
e.addEventListener('touchstart',function(ev){y0=ev.touches[0].clientY;last=0;moved=false;},{passive:true});
e.addEventListener('touchmove',function(ev){if(y0==null)return;var dy=ev.touches[0].clientY-y0;if(!moved&&Math.abs(dy)<8)return;moved=true;ev.preventDefault();var n=Math.round(-dy/22);if(n!=last){apply(n-last);last=n;}},{passive:false});
e.addEventListener('touchend',function(ev){var m=moved;y0=null;moved=false;if(m){ev.preventDefault();draw();}},{passive:false});
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
function draw(){
var w=shell();
var c=el('div','c');
c.appendChild(el('div','h','📅 מתי'));
c.appendChild(seg([['היום',0],['מחר',1],['מחרתיים',2]],function(o){return S.sd==dayIso(o);},function(o){keepDur(function(){S.sd=dayIso(o);});}));
var r=el('div','r');
r.appendChild(fld('קבלה',dateIn(S.sd,function(v){keepDur(function(){S.sd=v;});})));
r.appendChild(fld('החזרה',dateIn(S.ed,function(v){S.ed=v;draw();})));
c.appendChild(r);
r=el('div','r');
var stS=sel(TO,S.st,function(v){keepDur(function(){S.st=v;});});
var etS=sel(TO,S.et,function(v){S.et=v;draw();});
drag(stS,function(n){var h=dur();S.st=TO[clampI(idx(S.st)+n)].v;setDur(h>0?h:2);stS.value=S.st;etS.value=S.et;});
drag(etS,function(n){S.et=TO[clampI(idx(S.et)+n)].v;etS.value=S.et;});
r.appendChild(fld('משעה ↕',stS));
r.appendChild(fld('עד שעה ↕',etS));
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
var hd=el('div','hrow');hd.appendChild(el('div','h','📍 לאן'));hd.appendChild(btn(S.edit?'סיום':'עריכה','lnk',function(){S.edit=!S.edit;draw();}));c.appendChild(hd);
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
c.appendChild(el('div','h','🚙 איזה רכב'));
if(GRPS.length){
ch=el('div','ch');
GRPS.forEach(function(g){var v=P[g.id]==null?-1:Number(P[g.id]);ch.appendChild(btn((v==1?'✓ ':v==0?'✕ ':'')+short(g.t),v==1?'g':v==0?'x':'n',function(){P[g.id]=v==-1?1:v==1?0:-1;draw();}));});
c.appendChild(ch);
c.appendChild(el('div','lg','ירוק = רוצה · אדום = לא רוצה · אפור = לא משנה'));
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
if(cur())w.appendChild(btn('הסר את המשתמש '+cur().u+' מהטלפון','lnk ctrb',function(){ask('להסיר את '+cur().u+'?','שם המשתמש והקוד שלו יימחקו מהטלפון',null,'הסר','ביטול').then(function(ok){if(!ok)return;PR.list.splice(PR.cur,1);PR.cur=0;sv('qbu',PR);relogin();});}));
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
function sh(x){return site(x).replace(/-/g,'/');}
function whenTxt(){return sh(S.sd)+' '+S.st+' עד '+(S.ed!=S.sd?sh(S.ed)+' ':'')+S.et;}
function send(){
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
var m=t.match(/\d{2,3}-\d{2,3}-\d{2,3}/);
if(m){var c=CARS.filter(function(x){return x.t.indexOf(m[0])>=0;})[0];return c?noNum(c.t):m[0];}
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
var vals=tds.map(function(x){return clean(x.textContent);});
var text=vals.join(' ');
if(!text||text.length>600)return;
var fields=vals.map(function(v,i){return [hdr&&hdr[i]?hdr[i]:'',v];}).filter(function(f){return f[1];});
out.push({fields:fields,text:text});
});
});
return out;
}
function carOf(o){var f=o.fields.filter(function(x){return /רכב/.test(x[0]);})[0];if(f&&f[1]&&f[1]!='-')return f[1];return findCar(o.text);}
function carBox(parent,car,emptyTxt){var cb=el('div','carbox'+(car?'':' none'));cb.appendChild(el('div','sub',car?'הרכב ששובץ לך':'רכב'));cb.appendChild(el('div','carname',car||emptyTxt));parent.appendChild(cb);}
function orderCard(o,parent,hl,withCar){
var c=el('div','c ord'+(hl?' hl':''));
var car=carOf(o);
if(withCar)carBox(c,car,'טרם שובץ');
o.fields.forEach(function(f){if(withCar&&car&&f[1]==car)return;var kv=el('div','kv');kv.appendChild(el('span','k',f[0]||'•'));kv.appendChild(el('span','v',f[1]));c.appendChild(kv);});
parent.appendChild(c);
}
function ordersView(){
loading('טוען הזמנות…');
withLogin('/my_orders.php').then(function(doc){
var w=shell();
w.appendChild(el('div','h ctr','📋 ההזמנות שלי'));
var list=parseOrders(doc);
if(!list.length){var nc=doc.querySelector('.no-content');var c=el('div','c');c.appendChild(el('div','ttl',nc?clean(nc.textContent):'לא נמצאו הזמנות'));w.appendChild(c);}
list.forEach(function(o){orderCard(o,w,false,true);});
var a=el('div','acts');a.appendChild(btn('הזמנה חדשה','on',back));a.appendChild(btn('פתח באתר',null,function(){location.href='/my_orders.php';}));w.appendChild(a);
}).catch(function(e){say(String(e)).then(back);});
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
var match=parseOrders(d2).filter(function(o){return (o.text.indexOf(k1)>=0||o.text.indexOf(k2)>=0||o.text.indexOf(k3)>=0)&&o.text.indexOf(S.st)>=0;})[0]||null;
if(match&&!isBad)isOk=true;
if(match)car=carOf(match)||car;
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
var c=el('div','c res '+kind);
c.appendChild(el('div','big',kind=='ok'?'✅':kind=='bad'?'❌':'ℹ️'));
c.appendChild(el('div','ttl',title));
c.appendChild(el('div','sub',dn+' · '+when));
carBox(c,car,kind=='ok'?'טרם שובץ':'לא שובץ רכב');
if(!car&&kind=='ok')c.appendChild(el('div','lg','הסדרן ישבץ רכב בהמשך - בדוק ב"ההזמנות שלי"'));
list.forEach(function(t){c.appendChild(el('div','msg',t));});
if(!list.length&&!match&&kind!='ok')c.appendChild(el('div','msg','האתר לא החזיר הודעה. בדוק ב"ההזמנות שלי".'));
w.appendChild(c);
if(match){w.appendChild(el('div','sub','פרטי ההזמנה במערכת'));orderCard(match,w,true,false);}
var a=el('div','acts');
a.appendChild(btn('📋 ההזמנות שלי','on',ordersView));
a.appendChild(btn('הזמנה נוספת',null,back));
if(html)a.appendChild(btn('דף האתר המקורי',null,function(){d.open();d.write(html);d.close();}));
w.appendChild(a);
}
d.body.appendChild(box);
loading('מתחבר…');
var live=orderForm(d);
if(live){init(live);return;}
withLogin('/order.php').then(function(doc){var f=orderForm(doc);if(!f)throw 'לא נמצא דף ההזמנה באתר';return f;}).then(init).catch(function(e){say(String(e)).then(function(){box.remove();});});
})();
