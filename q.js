(function(){
var HOST='212.199.106.46';
if(location.host!=HOST){location.href='http://'+HOST+'/';return;}
var d=document;
var old=d.querySelector('.qbx');if(old){old.remove();return;}
function ld(k,def){try{var v=JSON.parse(localStorage.getItem(k));return v==null?def:v;}catch(e){return def;}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function getDoc(url){return fetch(url,{credentials:'same-origin'}).then(function(r){return r.text();}).then(function(h){return new DOMParser().parseFromString(h,'text/html');});}
function orderForm(doc){var s=doc.querySelector('[name="submit_order"]');return doc.querySelector('form[name="regular_order"]')||(s?s.form:null);}
function loginForm(doc){var b=doc.querySelector('[name="front_login_btn"]');return b?b.form:null;}
function ser(f){var b=new URLSearchParams();Array.prototype.forEach.call(f.elements,function(e){if(!e.name||e.disabled)return;var t=(e.type||'').toLowerCase();if(t=='submit'||t=='button'||t=='reset'||t=='file')return;if((t=='checkbox'||t=='radio')&&!e.checked)return;b.append(e.name,e.value);});return b;}
function creds(){var c=ld('qbc',null);if(c&&c.c)return c;var u=prompt('פעם אחת בלבד - שם משתמש לאתר הרכבים (אם האתר לא מבקש שם משתמש, השאר ריק):','');if(u===null)return null;var k=prompt('קוד כניסה:','');if(!k)return null;c={u:u.trim(),c:k.trim()};sv('qbc',c);return c;}
function doLogin(lf){
var c=creds();if(!c)return Promise.reject('הכניסה בוטלה');
Array.prototype.forEach.call(lf.querySelectorAll('input'),function(i){var t=(i.type||'text').toLowerCase();if(t=='password')i.value=c.c;else if(t=='text'||t=='tel'||t=='number'||t=='email')i.value=c.u;});
var loc=lf.querySelector('[name="location"]');if(loc)loc.value='/order.php';
var body=ser(lf);body.append('front_login_btn','כניסה');
return fetch(lf.getAttribute('action')||'/login.php',{method:'POST',body:body,credentials:'same-origin'}).then(function(){return getDoc('/order.php');});
}
var form,DEST,CARS,GRPS;
function q(n){return form.querySelector('[name="'+n+'"]');}
function opts(n){var s=q(n);if(!s)return [];return Array.prototype.map.call(s.options,function(o){return {v:o.value,t:o.text.replace(/\s+/g,' ').trim()};}).filter(function(o){return o.v!=='-1'&&o.v!=='';});}
function init(f){
form=f;DEST=opts('dest');CARS=opts('req_car_id');GRPS=[];
Array.prototype.forEach.call(form.querySelectorAll('input[type="radio"][name^="grp_val_"]'),function(r){var id=r.name.slice(8);if(GRPS.some(function(g){return g.id==id;}))return;var tr=r.closest('tr');var nm=tr?tr.querySelector('.grp-name'):null;GRPS.push({id:id,t:(nm?nm.textContent:'סוג '+id).replace(/\s+/g,' ').trim()});});
if(!DEST.some(function(x){return x.v==S.dest;}))S.dest='';
draw();
}
var F=ld('qbf',['ראש העין','אשדוד','גדרה']),P=ld('qbp',{});
function p2(n){return (n<10?'0':'')+n;}
function iso(t){return t.getFullYear()+'-'+p2(t.getMonth()+1)+'-'+p2(t.getDate());}
function hm(t){return p2(t.getHours())+':'+p2(t.getMinutes());}
function site(x){var a=x.split('-');return a[2]+'-'+a[1]+'-'+a[0];}
function mk(x,t){var a=x.split('-'),b=t.split(':');return new Date(Number(a[0]),Number(a[1])-1,Number(a[2]),Number(b[0]),Number(b[1]));}
var TO=[];for(var mm=0;mm<1440;mm+=15){var hh=Math.floor(mm/60);var tt=p2(hh)+':'+p2(mm-hh*60);TO.push({v:tt,t:tt});}
var st0=new Date();st0.setMinutes(0,0,0);st0.setHours(st0.getHours()+1);
var S={sd:iso(st0),st:hm(st0),ed:'',et:'',dest:ld('qbd',''),car:'0',edit:false};
function setDur(h){var e=new Date(mk(S.sd,S.st).getTime()+h*3600000);S.ed=iso(e);S.et=hm(e);}
function dur(){return (mk(S.ed,S.et)-mk(S.sd,S.st))/3600000;}
setDur(2);
var css='.qbx{position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;background:rgb(245,247,250);color:rgb(23,23,23);overflow-y:auto;-webkit-overflow-scrolling:touch;font:16px -apple-system,system-ui,sans-serif;text-align:right;padding:12px 12px 110px;direction:rtl}'+
'.qbx *{box-sizing:border-box!important;font-family:inherit;float:none!important}'+
'.qbx .c{background:white;border:1px solid rgb(217,222,229);border-radius:14px;padding:12px;margin:0 0 12px}'+
'.qbx .h{font-weight:700;font-size:15px;color:rgb(60,70,80)}'+
'.qbx .top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:0 0 10px}'+
'.qbx .top b{font-size:21px}'+
'.qbx .r{display:flex;gap:8px;margin:0 0 10px;align-items:flex-end}'+
'.qbx .f{display:flex!important;flex-direction:column;flex:1 1 0;min-width:0!important;width:auto!important;gap:4px;font-size:13px;color:rgb(90,100,110);margin:0}'+
'.qbx input,.qbx select{display:block!important;width:auto!important;min-width:0!important;max-width:none!important;height:48px!important;margin:0!important;font-size:16px!important;padding:0 10px!important;border:1px solid rgb(200,206,214)!important;border-radius:10px!important;background:white!important;color:rgb(23,23,23)!important;-webkit-appearance:none;appearance:none;text-align:right}'+
'.qbx .ch{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}'+
'.qbx button{font-size:15px!important;line-height:1.2!important;height:auto!important;width:auto!important;min-width:0!important;margin:0!important;border-radius:999px!important;padding:9px 14px!important;border:1px solid rgb(200,206,214)!important;background:white!important;color:rgb(23,23,23)!important;box-shadow:none!important}'+
'.qbx button.on{background:rgb(0,102,161)!important;border-color:rgb(0,102,161)!important;color:white!important}'+
'.qbx button.g{background:rgb(22,163,74)!important;border-color:rgb(22,163,74)!important;color:white!important}'+
'.qbx button.x{background:rgb(220,38,38)!important;border-color:rgb(220,38,38)!important;color:white!important}'+
'.qbx button.n{background:rgb(229,231,235)!important;border-color:rgb(209,213,219)!important;color:rgb(55,65,81)!important}'+
'.qbx button.lnk{border:0!important;background:none!important;color:rgb(0,102,161)!important;text-decoration:underline;padding:4px!important}'+
'.qbx button.star{border-radius:10px!important;font-size:22px!important;height:48px!important;padding:0 14px!important;flex:0 0 auto}'+
'.qbx .bar{position:fixed;left:0;right:0;bottom:0;display:flex;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:rgb(245,247,250);border-top:1px solid rgb(217,222,229)}'+
'.qbx .bar button{flex:1 1 0;border-radius:12px!important;padding:15px!important;font-size:18px!important;font-weight:700}'+
'.qbx .lg{font-size:12px;color:rgb(100,110,120);margin:0 0 8px}'+
'.qbx .warn{font-size:13px;color:rgb(185,28,28);margin:0 0 6px}'+
'.qbx .res{border-radius:16px;padding:16px;margin:0 0 12px;border:1px solid}'+
'.qbx .ok{background:rgb(240,253,244);border-color:rgb(134,239,172)}'+
'.qbx .bad{background:rgb(254,242,242);border-color:rgb(252,165,165)}'+
'.qbx .unk{background:rgb(255,251,235);border-color:rgb(252,211,77)}'+
'.qbx .res h2{margin:0 0 10px;font-size:21px}'+
'.qbx .kv{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid rgb(225,229,234)}'+
'.qbx .kv span:first-child{color:rgb(100,110,120);flex:0 0 auto}'+
'.qbx .kv span:last-child{font-weight:600;text-align:left;direction:rtl}'+
'.qbx .kv.car span:last-child{font-size:18px;font-weight:800}'+
'.qbx .msg{font-size:14px;background:white;border-radius:10px;padding:10px;margin:8px 0 0;white-space:pre-line}';
var box=d.createElement('div');box.className='qbx';box.dir='rtl';
function el(t,c,x){var e=d.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function btn(x,c,f){var b=el('button',c,x);b.type='button';b.onclick=f;return b;}
function sel(list,val,f){var s=el('select');list.forEach(function(o){var op=el('option',null,o.t);op.value=o.v;s.appendChild(op);});s.value=val;s.onchange=function(){f(s.value);};return s;}
function fld(lbl,inp){var l=el('label','f');if(lbl)l.appendChild(el('span',null,lbl));l.appendChild(inp);return l;}
function dateIn(v,f){var i=el('input');i.type='date';i.value=v;i.onchange=function(){if(i.value)f(i.value);};return i;}
function keepDur(fn){var h=dur();fn();setDur(h>0?h:2);draw();}
function head(){box.innerHTML='';box.appendChild(el('style',null,css));var top=el('div','top');top.appendChild(el('b',null,'🚗 הזמנת רכב'));top.appendChild(btn('✕',null,function(){box.remove();}));box.appendChild(top);}
function draw(){
head();
var c=el('div','c');
var ch=el('div','ch');
[['היום',0],['מחר',1],['מחרתיים',2]].forEach(function(a){var t=new Date();t.setDate(t.getDate()+a[1]);var v=iso(t);ch.appendChild(btn(a[0],S.sd==v?'on':'',function(){keepDur(function(){S.sd=v;});}));});
c.appendChild(ch);
var r=el('div','r');
r.appendChild(fld('תאריך קבלה',dateIn(S.sd,function(v){keepDur(function(){S.sd=v;});})));
r.appendChild(fld('תאריך החזרה',dateIn(S.ed,function(v){S.ed=v;draw();})));
c.appendChild(r);
r=el('div','r');
r.appendChild(fld('משעה',sel(TO,S.st,function(v){keepDur(function(){S.st=v;});})));
r.appendChild(fld('עד שעה',sel(TO,S.et,function(v){S.et=v;draw();})));
c.appendChild(r);
ch=el('div','ch');
[1,2,3,4,6,8].forEach(function(h){ch.appendChild(btn(h==1?'שעה':h+' שעות',dur()==h?'on':'',function(){setDur(h);draw();}));});
c.appendChild(ch);
if(dur()<=0)c.appendChild(el('div','warn','⚠️ שעת ההחזרה חייבת להיות אחרי שעת הקבלה'));
box.appendChild(c);
c=el('div','c');
var hd=el('div','top');hd.appendChild(el('div','h','יעד'));hd.appendChild(btn(S.edit?'סיום':'עריכת מועדפים','lnk',function(){S.edit=!S.edit;draw();}));c.appendChild(hd);
ch=el('div','ch');
F.forEach(function(t){var o=DEST.filter(function(x){return x.t==t;})[0];if(!o&&!S.edit)return;ch.appendChild(btn((S.edit?'✕ ':'')+t,S.edit?'x':(o&&S.dest==o.v?'on':''),function(){if(S.edit){F=F.filter(function(x){return x!=t;});sv('qbf',F);}else{S.dest=o.v;}draw();}));});
if(!F.length)ch.appendChild(el('div','lg','אין מועדפים. בחר יעד ולחץ ☆'));
c.appendChild(ch);
var curT=(DEST.filter(function(x){return x.v==S.dest;})[0]||{}).t;
var isF=!!curT&&F.indexOf(curT)>=0;
r=el('div','r');
r.appendChild(fld('',sel([{v:'',t:'בחר יעד…'}].concat(DEST),S.dest,function(v){S.dest=v;draw();})));
r.appendChild(btn(isF?'★':'☆','star',function(){if(!curT)return;if(isF){F=F.filter(function(x){return x!=curT;});}else{F.push(curT);}sv('qbf',F);draw();}));
c.appendChild(r);
box.appendChild(c);
if(GRPS.length||CARS.length){
c=el('div','c');
c.appendChild(el('div','h','סוג רכב'));
c.appendChild(el('div','lg','אפור = לא משנה · ירוק = רוצה · אדום = לא רוצה (לחיצה מחליפה)'));
ch=el('div','ch');
GRPS.forEach(function(g){var v=P[g.id]==null?-1:Number(P[g.id]);ch.appendChild(btn((v==1?'✓ ':v==0?'✕ ':'')+g.t,v==1?'g':v==0?'x':'n',function(){P[g.id]=v==-1?1:v==1?0:-1;sv('qbp',P);draw();}));});
c.appendChild(ch);
if(CARS.length){r=el('div','r');r.appendChild(fld('רכב ספציפי (לא חובה)',sel(CARS,S.car,function(v){S.car=v;draw();})));c.appendChild(r);}
box.appendChild(c);
}
box.appendChild(btn('מחק את פרטי הכניסה השמורים','lnk',function(){if(confirm('למחוק את שם המשתמש והקוד השמורים בטלפון?')){localStorage.removeItem('qbc');alert('נמחק. בפעם הבאה תתבקש להזין אותם שוב');}}));
var bar=el('div','bar');bar.appendChild(btn('שלח הזמנה','on',send));box.appendChild(bar);
}
function setv(n,v){var e=q(n);if(!e)throw n;e.value=v;}
function destName(){return (DEST.filter(function(x){return x.v==S.dest;})[0]||{}).t||'';}
function whenTxt(){return site(S.sd).replace(/-/g,'/')+' '+S.st+' עד '+(S.ed!=S.sd?site(S.ed).replace(/-/g,'/')+' ':'')+S.et;}
function send(){
if(!S.dest){alert('בחר יעד');return;}
if(dur()<=0){alert('שעת ההחזרה חייבת להיות אחרי שעת הקבלה');return;}
var dn=destName(),when=whenTxt();
if(!confirm('לשלוח הזמנה?\n'+dn+'\n'+when))return;
try{
setv('start_date',site(S.sd));setv('end_date',site(S.ed));setv('start_time',S.st);setv('end_time',S.et);setv('dest',S.dest);
var rc=q('req_car_id');if(rc)rc.value=S.car;
GRPS.forEach(function(g){var v=P[g.id]==null?-1:Number(P[g.id]);Array.prototype.forEach.call(form.querySelectorAll('input[name="grp_val_'+g.id+'"]'),function(rr){rr.checked=Number(rr.value)==v;});});
}catch(e){alert('שדה לא נמצא בטופס: '+e);return;}
sv('qbd',S.dest);
var body=ser(form);
body.append('submit_order','שלח הזמנה');
head();
var w=el('div','res unk');w.appendChild(el('h2',null,'⏳ שולח הזמנה…'));box.appendChild(w);
fetch(form.getAttribute('action')||'/order.php',{method:'POST',body:body,credentials:'same-origin'})
.then(function(r){return r.text();})
.then(function(html){done(html,dn,when);})
.catch(function(e){result('bad','❌ שגיאת תקשורת',[String(e)],dn,when,null,'',null);});
}
function clean(t){return (t||'').replace(/\s+/g,' ').trim();}
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
function findCar(t){
if(!t)return null;
var m=t.match(/\d{2,3}-\d{2,3}-\d{2,3}/);
if(m){var c=CARS.filter(function(x){return x.t.indexOf(m[0])>=0;})[0];return c?c.t.replace(/^\d+\s+/,''):m[0];}
var c2=CARS.filter(function(x){var n=x.t.replace(/^\d+\s+/,'');return x.v!='0'&&n.length>4&&t.indexOf(n)>=0;})[0];
return c2?c2.t.replace(/^\d+\s+/,''):null;
}
function done(html,dn,when){
var doc=new DOMParser().parseFromString(html,'text/html');
if(doc.querySelector('[name="front_login_btn"]')){result('bad','❌ נותקת מהמערכת',['התחבר שוב לאתר ואז לחץ שוב על הסימנייה'],dn,when,null,'',html);return;}
var ms=msgs(doc,html);
var all=ms.map(function(o){return o.t;}).join('\n');
var isBad=ms.some(function(o){return /error|err/.test(o.c);})||/(שגיא|נכשל|לא ניתן|אין רכב|לא נמצא רכב|לא שובץ|נדח|חסר|לא תקין|תפוס|חפיפה)/.test(all);
var isOk=!isBad&&/(נקלט|נשמר|בוצע|שובץ|אושר|בהצלחה|הוזמן|התקבל)/.test(all);
var car=findCar(all);
fetch('/my_orders.php',{credentials:'same-origin'}).then(function(r){return r.text();}).then(function(h2){
var d2=new DOMParser().parseFromString(h2,'text/html');
var k1=site(S.sd),k2=k1.replace(/-/g,'/'),k3=k2.slice(0,6)+k2.slice(8);
var row='';
Array.prototype.forEach.call(d2.querySelectorAll('tr'),function(tr){var t=clean(tr.textContent);if(!row&&t.length<400&&(t.indexOf(k1)>=0||t.indexOf(k2)>=0||t.indexOf(k3)>=0)&&t.indexOf(S.st)>=0)row=t;});
if(row&&!isBad)isOk=true;
car=car||findCar(row);
fin(row);
}).catch(function(){fin('');});
function fin(row){
var kind=isBad?'bad':isOk?'ok':'unk';
var title=isBad?'❌ ההזמנה לא אושרה':isOk?'✅ ההזמנה נקלטה':'ℹ️ התקבלה תשובה מהמערכת';
result(kind,title,ms.map(function(o){return o.t;}),dn,when,car,row,html);
}
}
function result(kind,title,list,dn,when,car,row,html){
head();
var w=el('div','res '+kind);
w.appendChild(el('h2',null,title));
function kv(a,b,c){var r=el('div','kv'+(c?' '+c:''));r.appendChild(el('span',null,a));r.appendChild(el('span',null,b));w.appendChild(r);}
kv('יעד',dn);
kv('מועד',when);
kv('רכב',car?car:(kind=='ok'?'טרם שובץ - יופיע בניהול הזמנות':'לא התקבל רכב'),'car');
if(row)w.appendChild(el('div','msg','בניהול הזמנות: '+row));
list.forEach(function(t){w.appendChild(el('div','msg',t));});
if(!list.length&&!row)w.appendChild(el('div','msg','האתר לא החזיר הודעה. בדוק בניהול הזמנות.'));
box.appendChild(w);
var ch=el('div','ch');
ch.appendChild(btn('לניהול הזמנות','on',function(){location.href='/my_orders.php';}));
ch.appendChild(btn('הזמנה נוספת',null,function(){draw();}));
if(html)ch.appendChild(btn('הצג את דף האתר המקורי',null,function(){d.open();d.write(html);d.close();}));
box.appendChild(ch);
}
d.body.appendChild(box);
head();
var w0=el('div','res unk');w0.appendChild(el('h2',null,'⏳ מתחבר…'));box.appendChild(w0);
var live=orderForm(d);
if(live){init(live);return;}
getDoc('/order.php').then(function(doc){
var f=orderForm(doc);if(f)return f;
var lf=loginForm(doc)||loginForm(d);
if(!lf)throw 'לא נמצא דף ההזמנה באתר';
return doLogin(lf).then(function(doc2){var f2=orderForm(doc2);if(f2)return f2;localStorage.removeItem('qbc');throw 'הכניסה נכשלה - שם המשתמש או הקוד שגויים. לחץ שוב על הסימנייה כדי להזין אותם מחדש';});
}).then(init).catch(function(e){box.remove();alert(String(e));});
})();
