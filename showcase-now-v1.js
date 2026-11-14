/* Mostra Cultural 2026 — programação em andamento, com prévia antes do evento.
   Origem: BASE OFICIAL já filtrada pelo guia + sessões do EM confirmadas na matriz.
   Atualização do cartão: 15 segundos; troca automática entre blocos em horário de Brasília. */
const SHOWCASE_INTERVAL=15000;
const SHOWCASE_DAY='2026-11-14';
const SHOWCASE_ZONE='America/Sao_Paulo';
let showcaseCards=[];
let showcasePosition=0;
let showcaseCurrentKey='';
let showcasePoolSignature='';
let showcaseTimer=null;

const showcaseStyle=document.createElement('link');
showcaseStyle.rel='stylesheet';
showcaseStyle.href='showcase-now-v1.css?v=2';
document.head.appendChild(showcaseStyle);

function showcaseClock(){
  const parts=new Intl.DateTimeFormat('en-US',{
    timeZone:SHOWCASE_ZONE,year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',hourCycle:'h23'
  }).formatToParts(new Date());
  const part=t=>parts.find(p=>p.type===t)?.value||'00';
  const hour=Number(part('hour')),minute=Number(part('minute'));
  return {date:part('year')+'-'+part('month')+'-'+part('day'),
    minutes:hour*60+minute,clock:part('hour')+'h'+part('minute')};
}
function showcaseContext(){
  const n=showcaseClock();
  if(n.date===SHOWCASE_DAY && n.minutes>=600 && n.minutes<780){
    return {mode:'live',minutes:n.minutes,clock:n.clock,preview:false};
  }
  // Antes do evento, mostre uma simulação única às 10h15, sem botões de bloco.
  if(n.date<=SHOWCASE_DAY && (n.date!==SHOWCASE_DAY||n.minutes<600)){
    return {mode:'preview',minutes:615,clock:'10h15',preview:true};
  }
  return {mode:'after',minutes:615,clock:'10h15',preview:true};
}
function showcaseMin(h){
  const m=/^(\d{1,2})h(\d{2})$/.exec(String(h||'').trim());
  return m?Number(m[1])*60+Number(m[2]):null;
}
function showcaseRange(h){
  const m=/^(\d{1,2})h(\d{2})-(\d{1,2})h(\d{2})$/.exec(String(h||'').replace(/[–—−]/g,'-').replace(/\s/g,''));
  return m?[Number(m[1])*60+Number(m[2]),Number(m[3])*60+Number(m[4])]:null;
}
function showcaseIsSessionGroup(r){
  return norm(r.turma)==='arquitetura da distincao' &&
    new Set(['grupo 2','grupo 4','grupo 5','grupo 6','grupo 7','grupo 10']).has(norm(r.grupo));
}
function showcaseFromBase(minutes){
  const active=rows.filter(r=>{
    if(!r.sala||!r.titulo||norm(r.sala)==='14'||showcaseIsSessionGroup(r))return false;
    const time=showcaseRange(r.horario);
    return time&&minutes>=time[0]&&minutes<time[1];
  });
  return groupProjects(active).map(p=>({
    key:'work:'+p.key,kind:'work',workKey:p.key,title:p.ref.titulo,
    category:p.ref.expo||p.ref.turma,room:p.ref.sala,
    time:p.ref.horario,group:norm(p.ref.grupo)==='exposicao permanente'?'Exposição permanente':p.ref.grupo||'',
    people:p.members,roomOnly:false,preview: false
  }));
}
function showcaseFromSessions(minutes){
  const source=Array.isArray(window.mostraEmLiveSessions)?window.mostraEmLiveSessions:[];
  return source.flatMap(s=>{
    if(!s.start||!s.end||!s.title||!s.location||norm(s.location)==='sala 14')return[];
    const start=showcaseMin(s.start),end=showcaseMin(s.end);
    if(start===null||end===null||minutes<start||minutes>=end)return[];
    return [{
      key:'session:'+norm(s.group)+'|'+norm(s.title)+'|'+s.start,
      kind:'session',title:s.title,group:s.group,
      category:s.project||'Sessão do Ensino Médio',room:s.location,
      time:s.start+'–'+s.end,
      people:String(s.presenters||'').split(/;\s*/).filter(Boolean),
      proposed:/propost|rodizio/i.test(norm(s.status||'')),
      roomOnly:false
    }];
  });
}
function showcaseSpecialExhibit(minutes){
  return minutes>=600&&minutes<780?[{
    key:'partner-super-cerebro',kind:'partner',title:'Super Cérebro: jogos e desafios para aprender',
    category:'Parceiro educacional do Colégio Stagio',room:'11 · Lab Maker',
    group:'Exposição permanente',time:'10h00–13h00',people:[],roomOnly:true
  }]:[];
}
function showcaseGetCards(minutes){
  const items=[...showcaseFromBase(minutes),...showcaseFromSessions(minutes),...showcaseSpecialExhibit(minutes)];
  const numberOfRoom=room=>{
    const match=String(room).match(/^(?:Sala\s+)?(\d{1,2})(?=\s|$)/i);
    return match?Number(match[1]):999; // O corredor aparece depois das salas numeradas.
  };
  items.sort((a,b)=>Number(a.kind==='partner')-Number(b.kind==='partner')||numberOfRoom(a.room)-numberOfRoom(b.room)||
    String(a.category).localeCompare(String(b.category),'pt-BR')||
    String(a.title).localeCompare(String(b.title),'pt-BR'));
  return items;
}
function showcaseShortPeople(names){
  if(!names.length)return 'Exposição oferecida por parceiro educacional';
  const first=names.slice(0,4).join(' • ');
  return esc(first)+(names.length>4?'<span class="sNowExtra"> +'+(names.length-4)+' integrantes</span>':'');
}
function showcaseContextLabel(item){
  return item.group&&norm(item.group)!=='exposicao permanente'
    ?'Grupo '+(item.group.toLowerCase().startsWith('grupo ')?item.group.replace(/^grupo\s*/i,''):item.group)
    :item.group||'Apresentação';
}
function showcaseRoomName(room){
  const s=String(room||'');
  return /^\d/.test(s)?'Sala '+s:s;
}
function showcaseRefresh(reset=false,step=0){
  const root=$('nowCard');if(!root)return;
  const context=showcaseContext();
  const list=showcaseGetCards(context.minutes);
  const signature=list.map(item=>item.key).join('::')+'|'+context.mode;
  if(reset||signature!==showcasePoolSignature){
    const found=list.findIndex(item=>item.key===showcaseCurrentKey);
    showcasePosition=found>=0?found:(step>0?-1:0);
  }
  showcasePoolSignature=signature;
  showcaseCards=list;
  showcasePosition=list.length?(showcasePosition+step+list.length)%list.length:0;
  const item=list[showcasePosition];
  showcaseCurrentKey=item?.key||'';
  const status=context.mode==='live'?'AO VIVO':context.mode==='after'?'PROGRAMAÇÃO':'PRÉVIA';
  const label=context.mode==='after'?'Na Mostra, ':'Agora, ';
  const studentSummary=item?.people.length
    ?'<span class="sNowPeopleLabel">Alunos:</span> '+showcaseShortPeople(item.people)
    :'<span class="sNowPeopleLabel">Parceiro:</span> Super Cérebro';
  const group=item?.group
    ?'<span class="sNowGroup">'+esc(showcaseContextLabel(item))+'</span>':'';
  const content=item?'<button type="button" class="sNowEntry" onclick="showcaseOpenCurrent()" aria-label="Abrir detalhes de '+esc(item.title)+'">'+
    '<div class="sNowWhere"><span class="sNowClock">'+esc(label)+'<strong>'+esc(context.clock)+'</strong></span><span class="sNowRoom">📍 '+esc(showcaseRoomName(item.room))+'</span></div>'+
    '<h3>'+esc(item.title)+'</h3>'+
    group+
    '<p class="sNowPeople">'+studentSummary+'</p>'+
    '<span class="sNowGo">Ver trabalho <span aria-hidden="true">→</span></span>'+
    '</button>'
    :'<div class="sNowEmpty">Consulte a programação completa da Mostra Cultural.</div>';
  root.classList.add('showcaseNow');
  root.innerHTML='<div class="sNowTop"><span>Guia de visitação</span><span class="sNowMode">'+status+'</span></div>'+
    content+
    '<div class="sNowFooter"><span>Próximo trabalho em 15 segundos</span><span>'+(list.length?(showcasePosition+1)+' / '+list.length:'')+'</span></div>'+
    '<div class="sNowProgress" aria-hidden="true"><span></span></div>';
}
function showcaseOpenCurrent(){
  const item=showcaseCards[showcasePosition];if(!item)return;
  if(item.kind==='partner'){if(typeof scGoRoom==='function')scGoRoom();else show('rooms');return;}
  if(item.kind==='session'){
    if(typeof window.openSessionWork==='function')window.openSessionWork(arg(item.group));
    else{show('schedule');if(typeof setScheduleTab==='function')setScheduleTab('sessions');}
    return;
  }
  openWork(arg(item.workKey));
}
function showcaseRestart(){
  if(showcaseTimer)clearInterval(showcaseTimer);
  showcaseTimer=setInterval(()=>{if(!document.hidden)showcaseRefresh(false,1)},SHOWCASE_INTERVAL);
}
const showcasePreviousRenderNow=renderNow;
renderNow=function(){showcaseRefresh(true,0)};
window.refreshShowcaseNow=()=>showcaseRefresh(true,0);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)showcaseRefresh(true,0)});
showcaseRefresh(true,0);
showcaseRestart();
