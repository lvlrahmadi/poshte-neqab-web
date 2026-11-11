'use strict';
const $=id=>document.getElementById(id);
const Engine=window.PoshteNeghabEngine;
const TEAM_COUNTS={10:[6,3,1],11:[6,4,1],12:[7,4,1],13:[8,4,1],14:[8,4,2],15:[9,4,2],16:[9,5,2],17:[10,5,2],18:[10,5,3],19:[11,5,3],20:[11,6,3]};
const ROLES=[
{name:'کارآگاه',team:'شهروند',desc:'هر شب استعلام تیمی یک بازیکن را می‌گیرد. قاب‌سازی، پدرخوانده و نفوذی می‌توانند نتیجه را تغییر دهند.',action:'investigate'},
{name:'پزشک',team:'شهروند',desc:'هر شب یک نفر را از حمله نجات می‌دهد؛ یک پزشک نمی‌تواند دو شب پیاپی یک هدف را نجات دهد.',action:'protect_doctor'},
{name:'محافظ',team:'شهروند',desc:'هر شب از یک نفر محافظت می‌کند؛ اگر حمله به هدف برسد، محافظ به‌جای او آسیب می‌بیند.',action:'protect_guard'},
{name:'بازپرس',team:'شهروند',desc:'یک بار در بازی نقش و تیم واقعی یک بازیکن را از پرونده محرمانه گرداننده استعلام می‌کند.',action:'interrogate'},
{name:'ردیاب',team:'شهروند',desc:'هر شب مقصد اقدام یک بازیکن را می‌بیند، نه ماهیت اقدام او را.',action:'track'},
{name:'روان‌شناس',team:'شهروند',desc:'یک بار در بازی زمان صحبت یک بازیکن را در روز بعد کوتاه‌تر می‌کند؛ رأی او را نمی‌گیرد.',action:'psych'},
{name:'قاضی',team:'شهروند',desc:'یک بار در بازی رأی‌گیری روز را به رأی‌گیری مجدد میان دو نفر اول محدود می‌کند.',action:'judge'},
{name:'خبرنگار',team:'شهروند',desc:'یک بار در بازی گزارش عمومی از تیم یک بازیکن می‌گیرد؛ هویت منبع اطلاعاتی محفوظ می‌ماند.',action:'reporter'},
{name:'تک‌تیرانداز',team:'شهروند',desc:'یک شلیک در کل بازی؛ شلیک با تأیید گرداننده و در فاز شب ثبت می‌شود.',action:'shot'},
{name:'متخصص',team:'شهروند',desc:'یک بار می‌تواند وجود و جزئیات یک اقدام شبانه ثبت‌شده را راستی‌آزمایی کند.',action:'verify'},
{name:'پدرخوانده',team:'مافیا',desc:'رهبر گروه مافیاست و در استعلام معمول کارآگاه، شهروند دیده می‌شود.'},
{name:'قاب‌ساز',team:'مافیا',desc:'هر شب یک هدف را برای استعلام کارآگاه مافیا نشان می‌دهد؛ دو شب پیاپی یک نفر را انتخاب نمی‌کند.',action:'frame'},
{name:'سم‌ساز',team:'مافیا',desc:'یک بار در بازی اثر نجات پزشک را روی هدف همان شب خنثی می‌کند.',action:'poison'},
{name:'خاموش‌کننده',team:'مافیا',desc:'یک بار در بازی توانایی فعال یک شهروند را برای یک شب مختل می‌کند؛ حذف و سلب رأی ندارد.',action:'jam'},
{name:'نفوذی',team:'مافیا',desc:'در استعلام کارآگاه شهروند دیده می‌شود؛ توانایی حمله جداگانه ندارد.'},
{name:'رئیس عملیات',team:'مافیا',desc:'در صورت زنده بودن، هماهنگی اقدام گروه مافیا را برعهده دارد؛ قدرت کشتن اضافه ندارد.'},
{name:'جانی',team:'مستقل',desc:'با حذف همه بازیکنان دیگر برنده می‌شود؛ هر شب یک هدف را با رعایت قواعد حفاظتی انتخاب می‌کند.',action:'serial_attack'},
{name:'فریبکار',team:'مستقل',desc:'اگر تا روز ششم یا بعد از آن با حداکثر چهار بازیکن زنده بماند برنده می‌شود؛ یک بار می‌تواند ردپای استعلامی خود را تغییر دهد.',action:'deceive'},
{name:'فرصت‌طلب',team:'مستقل',desc:'شرط پیش‌فرض این نسخه: تا پایان شب چهارم زنده بماند و دست‌کم دو مافیا حذف شده باشند؛ گرداننده می‌تواند برد را تأیید کند.'},
{name:'محافظ شخصی',team:'مستقل',desc:'یک موکل مخفی انتخاب می‌کند؛ اگر هر دو تا پایان شرط سناریو زنده بمانند، گرداننده برد مستقل را تأیید می‌کند.',action:'personal_bond'}
];
const ACTION_ROLE={protect_doctor:'پزشک',protect_guard:'محافظ',jam:'خاموش‌کننده',frame:'قاب‌ساز',investigate:'کارآگاه',interrogate:'بازپرس',track:'ردیاب',mafia_attack:'مافیا',serial_attack:'جانی',poison:'سم‌ساز',shot:'تک‌تیرانداز',psych:'روان‌شناس',judge:'قاضی',reporter:'خبرنگار',verify:'متخصص',deceive:'فریبکار',personal_bond:'محافظ شخصی'};
const ONE_TIME=new Set(['interrogate','psych','judge','reporter','shot','verify','poison','jam','deceive','personal_bond']);
let game=null,activeReveal=false,undoStack=[];
let speechTimer=null,speechRemaining=60,speechRunning=false,speechIndex=0,speechOrder=[];
function stopSpeechTimer(){if(speechTimer){clearInterval(speechTimer);speechTimer=null;}speechRunning=false;}
function speechDuration(p){return p&&p.status&&p.status.shortSpeechActive?30:60;}
function advanceSpeakerTurn(reason){
 if(!currentSpeaker())return;
 stopSpeechTimer();
 speechIndex++;
 const next=currentSpeaker();
 speechRemaining=next?speechDuration(next):0;
 renderDayTurns();
 if(next)startSpeakerTurn();
 else $('nextSpeakerHint').textContent='نوبت صحبت همه بازیکنان تمام شده است.';
 if(reason==='violation'&&next)$('nextSpeakerHint').textContent='به‌دلیل تخلف، نوبت قبلی گرفته شد؛ اکنون '+next.name+' صحبت می‌کند.';
 else if(reason==='next'&&next)$('nextSpeakerHint').textContent='نوبت قبلی پایان یافت؛ اکنون '+next.name+' صحبت می‌کند.';
}
function initDayTurns(){stopSpeechTimer();speechOrder=alive().map(p=>p.id);speechIndex=0;speechRemaining=speechOrder.length?speechDuration(game.players.find(p=>p.id===speechOrder[0])):0;renderDayTurns();}
function currentSpeaker(){return game&&game.players.find(p=>p.id===speechOrder[speechIndex]&&p.alive)||null;}
function currentSpeakerAfter(){return speechOrder.slice(speechIndex+1).map(id=>game.players.find(p=>p.id===id&&p.alive)).find(Boolean)||null;}
function formatClock(n){n=Math.max(0,Math.ceil(n));return fa(String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0'));}
function renderDayTurns(){
 const box=$('dayTurns');if(!box||!game)return;
 const isDay=game.phase==='روز';box.classList.toggle('hidden',!isDay);if(!isDay)return;
 const p=currentSpeaker(),next=currentSpeakerAfter();
 $('speakerName').textContent=p?p.name:'همه بازیکنان نوبت گرفته‌اند';
 $('speakerPosition').textContent=p?('نفر '+fa(speechIndex+1)+' از '+fa(speechOrder.length)):'پایان نوبت‌های صحبت';
 $('speechClock').textContent=formatClock(speechRemaining);
 $('speechHint').textContent=p?(p.status.shortSpeechActive?'۳۰ ثانیه؛ زمان کوتاه‌شده توسط روان‌شناس':'۶۰ ثانیه زمان صحبت'):'';
 $('nextSpeakerHint').textContent=speechRunning?'زمان صحبت در حال اجراست.':(speechRemaining===0&&p?('وقت '+p.name+' تمام شد. نفر بعدی: '+(next?next.name:'پایان نوبت‌ها')+'. برای آغاز نوبت بعدی دکمه را بزن.'):(p?'با فرمان گرداننده، زمان صحبت این بازیکن آغاز می‌شود.':'نوبت صحبت همه بازیکنان تمام شده است.'));
 $('startSpeaker').textContent=speechRemaining===0&&p?'شروع نوبت نفر بعدی':'شروع نوبت صحبت';
 $('startSpeaker').disabled=!p||speechRunning;
 $('pauseSpeaker').disabled=!speechRunning;
 $('extendSpeaker').disabled=!p;
}
function startSpeakerTurn(){
 if(speechRunning)return;
 if(speechRemaining===0){speechIndex++;const p=currentSpeaker();if(!p){renderDayTurns();return;}speechRemaining=speechDuration(p);}
 const p=currentSpeaker();if(!p){renderDayTurns();return;}
 speechRunning=true;renderDayTurns();
 speechTimer=setInterval(()=>{speechRemaining=Math.max(0,speechRemaining-1);if(speechRemaining===0){stopSpeechTimer();renderDayTurns();alert('وقت صحبت '+p.name+' تمام شد. نفر بعدی: '+(currentSpeakerAfter()?currentSpeakerAfter().name:'پایان نوبت‌ها')+'.');}else renderDayTurns();},1000);
}
$('startSpeaker').onclick=startSpeakerTurn;
$('finishSpeaker').onclick=()=>advanceSpeakerTurn('next');
$('takeSpeakerTurn').onclick=()=>{if(!confirm('نوبت صحبت بازیکن فعلی به‌دلیل تخلف گرفته شود و نفر بعدی شروع کند؟'))return;advanceSpeakerTurn('violation');};
$('pauseSpeaker').onclick=()=>{stopSpeechTimer();renderDayTurns();};
$('extendSpeaker').onclick=()=>{if(!currentSpeaker())return;speechRemaining+=15;renderDayTurns();};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function checkpoint(){if(game){undoStack.push(JSON.stringify(game));if(undoStack.length>40)undoStack.shift();}}
function fa(n){return String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function alive(){return game.players.filter(p=>p.alive);}
function log(message){game.logs.unshift({at:new Date().toISOString(),phase:game.phase,round:game.round,message});save();renderLog();}
function save(){if(game)localStorage.setItem('poshteNeghabV5',JSON.stringify(game));}
function updateComposition(){const n=Number($('count').value),c=TEAM_COUNTS[n];$('composition').textContent=c?`برای ${fa(n)} نفر: ${fa(c[0])} شهروند، ${fa(c[1])} مافیا، ${fa(c[2])} مستقل`:'تعداد بازیکنان باید بین ۱۰ تا ۲۰ باشد.';}
$('count').addEventListener('input',updateComposition);updateComposition();
function makeDeck(n){const [c,m,s]=TEAM_COUNTS[n],groups=[ROLES.filter(r=>r.team==='شهروند'),ROLES.filter(r=>r.team==='مافیا'),ROLES.filter(r=>r.team==='مستقل')],counts=[c,m,s],deck=[];groups.forEach((bank,g)=>{const picked=shuffle(bank);for(let i=0;i<counts[g];i++)deck.push(picked[i%picked.length]);});return shuffle(deck);}
$('makeGame').onclick=()=>{const names=$('names').value.split('\n').map(x=>x.trim()).filter(Boolean),n=Number($('count').value);if(!TEAM_COUNTS[n])return alert('تعداد بازیکنان باید بین ۱۰ تا ۲۰ باشد.');if(names.length!==n)return alert(`باید دقیقاً ${fa(n)} نام وارد کنی.`);if(new Set(names).size!==n)return alert('نام تکراری وجود دارد.');if(game&&!confirm('بازی جدید ساخته شود؟ ذخیره بازی قبلی جایگزین می‌شود.'))return;const deck=makeDeck(n);game={version:5,players:names.map((name,i)=>({id:`p${i+1}`,name,role:deck[i].name,team:deck[i].team,alive:true,converted:false,used:{},status:{}})),phase:'شب',round:1,logs:[],actions:[],independentWins:[],rules:{deceiverRound:6,deceiverAliveLimit:4,opportunistRound:5,opportunistMafiaEliminations:2},createdAt:new Date().toISOString()};undoStack=[];log('بازی جدید ساخته شد؛ نقش‌ها به‌صورت تصادفی پخش شدند.');$('setup').classList.add('hidden');$('game').classList.remove('hidden');render();};
function roleOf(p){return ROLES.find(r=>r.name===p.role)||{desc:'نقش ثبت‌شده در نسخه قبلی.'};}
function isMafia(p){return Engine.isMafia(p);}
function winner(){return Engine.checkWin(game);}
function playerOptions(filter=()=>true,selected=''){return game.players.map(p=>`<option value="${esc(p.id)}" ${!p.alive||!filter(p)?'disabled':''} ${p.id===selected?'selected':''}>${esc(p.name)} — ${esc(p.role)}${p.alive?'':' (حذف‌شده)'}</option>`).join('');}
function actorOptions(type){const role=ACTION_ROLE[type];return game.players.filter(p=>p.alive&&(type==='mafia_attack'?isMafia(p):p.role===role)).map(p=>`<option value="${esc(p.id)}">${esc(p.name)} — ${esc(p.role)}</option>`).join('');}
function render(){if(!game)return;$('roundLabel').textContent=(game.phase==='شب'?'شب ':'روز ')+fa(game.round);$('phaseName').textContent=game.phase;$('phaseTag').textContent=game.phase;$('aliveCount').textContent=fa(alive().length);$('winStatus').textContent=winner()||'در جریان';$('nextPhase').textContent=game.phase==='شب'?'رفتن به روز و حل شب':'رفتن به شب بعد';$('playerList').innerHTML=game.players.map((p,i)=>`<div class="player ${p.alive?'':'dead'}"><span>${esc(p.name)} ${p.alive?'':'— حذف شده'}</span><button class="secondary" ${!p.alive?'disabled':''} onclick="showRole(${i})">دیدن نقش</button></div>`).join('');$('secretRoster').innerHTML=game.players.map(p=>`<details class="role-dropdown"><summary><strong>${esc(p.name)}</strong><span class="tag">${p.alive?'زنده':'حذف‌شده'}</span></summary><div class="role-dropdown-content"><strong>${p.converted?'عضو مافیای تبدیل‌شده':esc(p.role)}</strong><span class="tag">تیم: ${p.converted?'مافیا':esc(p.team)}</span>${p.status.shortSpeechActive?'<span class="tag">صحبت محدود</span>':''}<p class="hint">${esc(p.converted?'تو به گروه مافیا پیوسته‌ای.':roleOf(p).desc)}</p></div></details>`).join('');$('eliminateTarget').innerHTML=playerOptions();$('independentWinner').innerHTML=game.players.map((p,i)=>`<option value="${i}" ${!p.alive||p.team!=='مستقل'?'disabled':''}>${esc(p.name)} — ${esc(p.role)}${p.alive?'':' (حذف‌شده)'}</option>`).join('');$('actionFields').innerHTML=actionFields();renderLog();renderDayTurns();save();}
window.showRole=i=>{if(activeReveal)return alert('اول نقش بازیکن قبلی را پنهان کن.');const p=game.players[i],r=roleOf(p);$('revealWho').textContent=p.name+'، نقش تو';$('revealRole').textContent=p.converted?'عضو مافیای تبدیل‌شده':p.role;$('revealTeam').textContent='تیم: '+(p.converted?'مافیا':p.team);$('revealDesc').textContent=p.converted?'تو به گروه مافیا پیوسته‌ای.':r.desc;$('reveal').classList.remove('hidden');$('playerList').classList.add('hidden');activeReveal=true;};
$('hideRole').onclick=()=>{activeReveal=false;$('reveal').classList.add('hidden');$('playerList').classList.remove('hidden');};
function selectField(id,label,filter=()=>true){return `<label>${label}</label><select id="${id}">${playerOptions(filter)}</select>`;}
function actionFields(){if(!game)return '';const t=$('actionType').value,role=ACTION_ROLE[t];let html='';if(role){html+=`<label>اقدام‌کننده</label><select id="actor">${actorOptions(t)}</select>`;if(!actorOptions(t))html+='<p class="hint warning">نقش زنده و مجاز برای این اقدام وجود ندارد.</p>';}
 if(['protect_doctor','protect_guard','jam','frame','investigate','interrogate','mafia_attack','serial_attack','poison','shot','psych','reporter','personal_bond'].includes(t))html+=selectField('target','هدف اقدام',p=>t==='jam'?p.team==='شهروند':true);
 if(t==='track')html+=selectField('target','بازیکنی که مسیرش ردیابی می‌شود');
 if(t==='verify'){const arr=game.actions.map((a,i)=>({a,i})).filter(x=>x.a.round===game.round);html+='<label>اقدام ثبت‌شده برای بررسی</label><select id="verifyAction">'+arr.map(x=>`<option value="${x.i}">${esc(x.a.type)} · ${esc(game.players.find(p=>p.id===x.a.actor)?.name||'بدون اقدام‌کننده')} ← ${esc(game.players.find(p=>p.id===x.a.target)?.name||'بدون هدف')}</option>`).join('')+'</select>';}
 if(t==='judge')html+='<label>نام دو نفر اول رأی‌گیری (با ویرگول جدا کن)</label><input id="topTwo" placeholder="نام اول، نام دوم">';
 if(t==='deceive')html+='<label>تیمی که در استعلام کارآگاه دیده می‌شوی</label><select id="maskTeam"><option>شهروند</option><option>مافیا</option></select>';
 return html;}
$('actionType').onchange=()=>$('actionFields').innerHTML=actionFields();
function useOnce(p,key){if(p.used[key])throw Error('این توانایی قبلاً مصرف شده است.');p.used[key]=true;}
function requireActor(type){const id=$('actor')?.value,p=game.players.find(x=>x.id===id);if(!p||!p.alive)throw Error('اقدام‌کننده زنده و معتبر انتخاب کن.');if(type==='mafia_attack'?!isMafia(p):p.role!==ACTION_ROLE[type])throw Error('نقش اقدام‌کننده با این توانایی مطابقت ندارد.');if(p.status.jammedRound===game.round&&type!=='jam')throw Error('توانایی این بازیکن در این شب مختل شده است.');return p;}
function requireTarget(){const p=game.players.find(x=>x.id===$('target')?.value);if(!p||!p.alive)throw Error('هدف باید بازیکن زنده باشد.');return p;}
function record(type,actor,target,result,extra={}){const a={id:`a${Date.now()}${Math.random().toString(16).slice(2,6)}`,type,actor:actor?.id||null,target:target?.id||null,round:game.round,phase:game.phase,at:new Date().toISOString(),result,...extra};game.actions.push(a);log(result);return a;}
function applyAction(){const type=$('actionType').value,actor=requireActor(type),target=()=>requireTarget();let t=null,result='';
 const nightOnly=new Set(['protect_doctor','protect_guard','jam','frame','investigate','interrogate','track','mafia_attack','serial_attack','poison','shot','verify','deceive','personal_bond']);
 if(nightOnly.has(type)&&game.phase!=='شب')throw Error('این اقدام فقط در فاز شب مجاز است.');if(['psych','judge','reporter'].includes(type)&&game.phase!=='روز')throw Error('این اقدام فقط در فاز روز مجاز است.');
 if(game.actions.some(a=>a.round===game.round&&a.actor===actor.id&&a.type===type))throw Error('این اقدام از طرف این بازیکن در این دور قبلاً ثبت شده است.');
 if(['protect_doctor','protect_guard','jam','frame','investigate','interrogate','mafia_attack','serial_attack','poison','shot','psych','reporter','personal_bond'].includes(type))t=target();
 if(type==='protect_doctor'){if(actor.status.lastDoctorTarget===t.id)throw Error('پزشک نمی‌تواند دو شب پیاپی یک نفر را نجات دهد.');actor.status.lastDoctorTarget=t.id;result=`پزشک ${actor.name} از ${t.name} محافظت کرد.`;record(type,actor,t,result);}
 else if(type==='protect_guard'){if(actor.id===t.id)throw Error('محافظ نمی‌تواند از خودش محافظت کند.');result=`محافظ ${actor.name} از ${t.name} محافظت کرد.`;record(type,actor,t,result);}
 else if(type==='jam'){if(t.team!=='شهروند')throw Error('خاموش‌کننده فقط می‌تواند توانایی یک شهروند را مختل کند.');useOnce(actor,type);t.status.jammedRound=game.round;result=`خاموش‌کننده توانایی ${t.name} را برای این شب مختل کرد.`;record(type,actor,t,result);}
 else if(type==='frame'){if(actor.status.lastFrameTarget===t.id)throw Error('قاب‌ساز نمی‌تواند دو شب پیاپی یک نفر را انتخاب کند.');actor.status.lastFrameTarget=t.id;result=`قاب‌سازی روی ${t.name} ثبت شد.`;record(type,actor,t,result);}
 else if(type==='investigate'){const team=Engine.investigationTeam(t,{round:game.round,actions:game.actions});result=`نتیجه محرمانه استعلام ${t.name}: ${team}.`;record(type,actor,t,result,{private:true});}
 else if(type==='interrogate'){useOnce(actor,type);result=`نتیجه محرمانه بازپرسی: ${t.name}، نقش ${t.role}، تیم ${t.converted?'مافیا':t.team}.`;record(type,actor,t,result,{private:true});}
 else if(type==='track'){const visits=game.actions.filter(a=>a.round===game.round&&a.actor===t.id&&a.target).map(a=>game.players.find(p=>p.id===a.target)?.name).filter(Boolean);result=`ردیابی ${t.name}: ${visits.length?visits.join('، '):'هیچ مقصدی در سامانه ثبت نشده است.'}`;record(type,actor,t,result,{private:true});}
 else if(type==='mafia_attack'){if(game.actions.some(a=>a.round===game.round&&a.type==='mafia_attack'))throw Error('حمله گروهی مافیا برای این شب قبلاً ثبت شده است.');if(isMafia(t))throw Error('مافیا نمی‌تواند هم‌تیمی خود را هدف حمله گروهی قرار دهد.');record(type,actor,t,`حمله گروه مافیا به ${t.name} برای پایان شب ثبت شد.`);}
 else if(type==='serial_attack'){if(t.id===actor.id)throw Error('جانی نمی‌تواند خودش را هدف بگیرد.');record(type,actor,t,`حمله جانی به ${t.name} برای پایان شب ثبت شد.`);}
 else if(type==='poison'){if(!game.actions.some(a=>a.round===game.round&&a.type==='mafia_attack'&&a.target===t.id))throw Error('سم‌ساز باید همان هدف حمله مافیا را انتخاب کند. ابتدا حمله مافیا را ثبت کن.');useOnce(actor,type);record(type,actor,t,`سم روی ${t.name} ثبت شد؛ نجات پزشک در برابر این حمله خنثی می‌شود.`);}
 else if(type==='shot'){if(t.id===actor.id)throw Error('تک‌تیرانداز نمی‌تواند خودش را هدف بگیرد.');useOnce(actor,type);record(type,actor,t,`شلیک تک‌تیرانداز به ${t.name} برای پایان شب ثبت شد.`);}
 else if(type==='psych'){useOnce(actor,type);t.status.shortSpeechNextDay=true;record(type,actor,t,`روان‌شناس زمان صحبت ${t.name} را در روز بعد محدود کرد.`);}
 else if(type==='judge'){useOnce(actor,type);const names=$('topTwo').value.split(/[،,]/).map(x=>x.trim()).filter(Boolean);if(names.length!==2||names[0]===names[1]||names.some(n=>!game.players.some(p=>p.alive&&p.name===n)))throw Error('نام دو بازیکن زنده و متفاوت را دقیق وارد کن.');record(type,actor,null,`قاضی رأی‌گیری مجدد را به دو نفر محدود کرد: ${names.join(' و ')}.`,{topTwo:names});}
 else if(type==='reporter'){useOnce(actor,type);const team=Engine.investigationTeam(t,{round:game.round,actions:game.actions});record(type,actor,t,`گزارش عمومی خبرنگار: ${t.name} در استعلام تیم ${team} دیده شد.`,{public:true});}
 else if(type==='verify'){const a=game.actions[Number($('verifyAction').value)];if(!a||a.round!==game.round)throw Error('اقدام ثبت‌شده معتبری برای بررسی وجود ندارد.');useOnce(actor,type);record(type,actor,null,`متخصص تأیید کرد اقدام «${a.type}» در شب ${fa(a.round)} با هدف ${game.players.find(p=>p.id===a.target)?.name||'نامشخص'} ثبت شده است.`,{verifiedAction:a.id});}
 else if(type==='deceive'){useOnce(actor,type);actor.status.deceiverMaskRound=game.round;actor.status.deceiverMaskTeam=$('maskTeam').value;record(type,actor,actor,`فریبکار ردپای استعلامی خود را برای این شب به شکل ${actor.status.deceiverMaskTeam} تغییر داد.`,{private:true});}
 else if(type==='personal_bond'){if(t.id===actor.id)throw Error('موکل باید بازیکن دیگری باشد.');if(actor.status.clientId)throw Error('موکل قبلاً انتخاب شده است.');useOnce(actor,type);actor.status.clientId=t.id;record(type,actor,t,`موکل مخفی محافظ شخصی برای گرداننده ثبت شد.`,{private:true});}
 else throw Error('این اقدام تعریف نشده است.');
 render();alert(result||'اقدام ثبت شد.');}
$('applyAction').onclick=()=>{checkpoint();try{applyAction();}catch(e){game=JSON.parse(undoStack.pop());save();render();alert(e.message);}};
$('undoAction').onclick=()=>{if(!undoStack.length)return alert('در این نشست، اقدامی برای بازگردانی ثبت نشده است.');if(!confirm('تمام تغییرات آخرین اقدام به حالت قبل برگردد؟'))return;game=JSON.parse(undoStack.pop());save();render();alert('آخرین اقدام به حالت قبل برگشت.');};
function eliminate(id,reason){const p=game.players.find(x=>x.id===id);if(!p||!p.alive)throw Error('بازیکن زنده انتخاب کن.');p.alive=false;if(isMafia(p))game.mafiaEliminated=(game.mafiaEliminated||0)+1;log(`${p.name} حذف شد؛ علت: ${reason}؛ نقش: ${p.role}`);}
$('eliminateBtn').onclick=()=>{checkpoint();try{eliminate($('eliminateTarget').value,$('eliminateReason').value);render();}catch(e){game=JSON.parse(undoStack.pop());save();render();alert(e.message);}};
function resolveNight(){const outcome=Engine.resolveNight(game.players,game.actions,game.round);for(const ev of outcome.events)log(ev);for(const d of outcome.deaths){const p=game.players.find(x=>x.id===d.id);if(p?.alive)eliminate(p.id,d.reason);}game.actions=game.actions.filter(a=>a.round!==game.round);log('حل شب تکمیل شد.');}
$('nextPhase').onclick=()=>{if(winner())return alert('بازی پایان یافته است: '+winner());checkpoint();if(game.phase==='شب'){resolveNight();game.phase='روز';game.players.forEach(p=>{delete p.status.jammedRound;if(p.status.shortSpeechNextDay){p.status.shortSpeechActive=true;delete p.status.shortSpeechNextDay;}});initDayTurns();}else{stopSpeechTimer();game.phase='شب';game.round++;game.players.forEach(p=>{delete p.status.deceiverMaskRound;delete p.status.deceiverMaskTeam;delete p.status.shortSpeechActive;});}
 const opp=game.players.find(p=>p.alive&&p.role==='فرصت‌طلب');if(opp&&game.phase==='روز'&&game.round>=(game.rules.opportunistRound||5)&&game.mafiaEliminated>= (game.rules.opportunistMafiaEliminations||2)){log('شرط پیش‌فرض فرصت‌طلب محقق شده؛ گرداننده می‌تواند برد مستقل را تأیید کند.');}
 const personal=game.players.find(p=>p.alive&&p.role==='محافظ شخصی');if(personal?.status.clientId){const client=game.players.find(p=>p.id===personal.status.clientId);if(client?.alive&&game.phase==='روز'&&alive().length<=4)log('شرط بقا برای محافظ شخصی به مرحله پایانی رسیده؛ گرداننده شرط سناریو را بررسی کند.');}
 const w=winner();if(w)log('پایان بازی: '+w);render();};
$('declareIndependentWin').onclick=()=>{const i=Number($('independentWinner').value),p=game.players[i];if(!p||!p.alive||p.team!=='مستقل')return alert('یک بازیکن مستقل زنده انتخاب کن.');if(!confirm(`شرط اختصاصی ${p.role} طبق قوانین میز محقق شده و ${p.name} برنده مستقل است؟`))return;checkpoint();game.independentWins=Array.isArray(game.independentWins)?game.independentWins:[];if(!game.independentWins.includes(i))game.independentWins.push(i);log(`گرداننده برد مستقل ${p.name} (${p.role}) را تأیید کرد.`);render();};
$('hostButton').onclick=()=>{if(activeReveal)$('hideRole').click();$('hostPanel').classList.toggle('hidden');};
$('toggleRoster').onclick=()=>{const list=$('secretRoster'),btn=$('toggleRoster'),opening=list.classList.contains('hidden');list.classList.toggle('hidden');btn.textContent=opening?'▾':'☰';btn.setAttribute('aria-label',opening?'بستن فهرست نقش‌ها':'نمایش فهرست نقش‌ها');btn.title=opening?'بستن فهرست نقش‌ها':'نمایش فهرست نقش‌ها';};$('closeHost').onclick=()=>$('hostPanel').classList.add('hidden');
$('exportSave').onclick=()=>{const blob=new Blob([JSON.stringify(game,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='poshte-neghab-backup-v5.json';a.click();URL.revokeObjectURL(a.href);};
$('restoreBtn').onclick=()=>$('restoreFile').click();$('restoreFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());if(![4,5].includes(data.version)||!Array.isArray(data.players))throw Error('فایل پشتیبان معتبر نیست.');data.version=5;data.actions=data.actions||[];data.logs=data.logs||[];data.independentWins=data.independentWins||[];data.players.forEach(p=>{p.used=p.used||{};p.status=p.status||{};});game=data;undoStack=[];$('setup').classList.add('hidden');$('game').classList.remove('hidden');render();alert('بازی با موفقیت بازیابی شد.');}catch(err){alert(err.message);}e.target.value='';};
$('clearSaved').onclick=()=>{if(confirm('ذخیره بازی روی این دستگاه پاک شود؟')){localStorage.removeItem('poshteNeghabV5');localStorage.removeItem('poshteNeghabV4');alert('ذخیره پاک شد.');}};
$('endGame').onclick=()=>{if(confirm('به صفحه ساخت بازی برگردیم؟')){stopSpeechTimer();undoStack=[];$('game').classList.add('hidden');$('setup').classList.remove('hidden');game=null;activeReveal=false;}};
function renderLog(){$('eventLog').innerHTML=game.logs.slice(0,50).map(x=>`<div class="log">${new Date(x.at).toLocaleTimeString('fa-IR')} · ${esc(x.message)}</div>`).join('')||'<p class="hint">هنوز رویدادی ثبت نشده است.</p>';}
try{const raw=localStorage.getItem('poshteNeghabV5')||localStorage.getItem('poshteNeghabV4');if(raw){const data=JSON.parse(raw);if([4,5].includes(data.version)&&Array.isArray(data.players)){data.version=5;data.actions=data.actions||[];data.logs=data.logs||[];data.independentWins=data.independentWins||[];data.players.forEach(p=>{p.used=p.used||{};p.status=p.status||{};});game=data;$('setup').classList.add('hidden');$('game').classList.remove('hidden');render();}}}catch(e){console.warn('بازی ذخیره‌شده قابل بازیابی نیست',e);}
