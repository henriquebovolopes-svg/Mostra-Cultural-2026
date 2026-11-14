/* Mostra Cultural 2026 — programação em andamento, com prévia antes do evento.
   Origem: BASE OFICIAL já filtrada pelo guia + sessões do EM confirmadas na matriz.
   Atualização do cartão: 15 segundos; troca automática entre blocos em horário de Brasília. */
const SHOWCASE_INTERVAL=15000;
const SHOWCASE_DAY='2026-11-14';
const SHOWCASE_ZONE='America/Sao_Paulo';
let showcasePreviewBlock='b1';
let showcaseCards=[];
let showcasePosition=0;
let showcaseCurrentKey='';
let showcasePoolSignature='';
let showcaseTimer=null;

const showcaseStyle=document.createElement('link');
showcaseStyle.rel='stylesheet';
showcaseStyle.href='showcase-now-v1.css?v=1';
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
    return {mode:'live',minutes:n.minutes,clock:n.clock,preview:false,
      status:'Acontecendo agora',caption:'Programação deste momento • 14 de novembro'};
  }
  if(n.date===SHOWCASE_DAY&&n.minutes<600){
    return {mode:'before',minutes:showcasePreviewBlock==='b1'?615:720,preview:true,
      status:'A Mostra começa às 10h',caption:'Prévia da programação de hoje'};
  }
  if(n.date>SHOWCASE_DAY){
    return {mode:'after',minutes:showcasePreviewBlock==='b1'?615:720,preview:true,
      status:'Mostra Cultural 2026',caption:'Reveja a programação do evento'};
  }
  return {mode:'preview',minutes:showcasePreviewBlock==='b1'?615:720,preview:true,
    status:'Prévia da Mostra',caption:'Veja como será a programação em tempo real'};
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
  items.sort((a,b)=>numberOfRoom(a.room)-numberOfRoom(b.room)||
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
  const signature=list.map(c=>c.key).join('::')+'|'+context.mode+'|'+Math.floor(context.minutes/90);
  if(reset||signature!==showcasePoolSignature){
    const prior=showcaseCurrentKey;
    const found=list.findIndex(item=>item.key===prior);
    showcasePosition=found>=0?found:(step>0?-1:0);
  }
  showcasePoolSignature=signature;
  showcaseCards=list;
  if(list.length)showcasePosition=(showcasePosition+step+list.length)%list.length;
  else showcasePosition=0;
  const item=list[showcasePosition];
  showcaseCurrentKey=item?.key||'';
  const stamp=context.preview
    ?'Simulação de '+(showcasePreviewBlock==='b1'?'10h15':'12h00')
    :'Agora, '+context.clock;
  const buttons=context.preview?'<div class="sNowPreviewControls" role="group" aria-label="Simular horário da Mostra"><button type="button" class="'+(showcasePreviewBlock==='b1'?'selected':'')+'" aria-pressed="'+(showcasePreviewBlock==='b1')+'" onclick="showcaseChooseBlock(\'b1\')">10h15 · Bloco 1</button><button type="button" class="'+(showcasePreviewBlock==='b2'?'selected':'')+'" aria-pressed="'+(showcasePreviewBlock==='b2')+'" onclick="showcaseChooseBlock(\'b2\')">12h · Bloco 2</button></div>':'';
  const card=item?'<article class="sNowItem" aria-label="Trabalho em destaque">'+
    '<div class="sNowMeta"><span class="sNowSubject">'+esc(item.category)+'</span><span class="sNowCounter">'+(showcasePosition+1)+' de '+list.length+'</span></div>'+
    '<h3>'+esc(item.title)+'</h3>'+
    '<div class="sNowGroup">'+esc(showcaseContextLabel(item))+'</div>'+
    '<div class="sNowPeople"><span class="sNowLabel">'+(item.people.length===1?'Estudante':item.people.length?'Integrantes':'Participação')+'</span><div>'+showcaseShortPeople(item.people)+'</div></div>'+
    '<div class="sNowPills"><span>📍 '+esc(showcaseRoomName(item.room))+'</span><span>◷ '+esc(item.time)+'</span></div>'+
    (item.proposed?'<p class="sNowProposed">Horário previsto, sujeito a confirmação.</p>':'')+
    '<button type="button" class="sNowDetails" onclick="showcaseOpenCurrent()">Ver trabalho e localização <span aria-hidden="true">→</span></button>'+
    '</article>'
    :'<div class="sNowEmpty">A programação para este horário ainda não foi disponibilizada. Consulte a aba de horários.</div>';
  root.classList.add('showcaseNow');
  root.innerHTML='<div class="sNowHeader"><div><div class="sNowEy">Guia de visitação • 14 de novembro</div><h2>'+esc(context.status)+'</h2><p>'+esc(context.caption)+'</p></div><span class="sNowMode '+(context.preview?'preview':'live')+'">'+(context.preview?'PRÉVIA':'AO VIVO')+'</span></div>'+
    '<div class="sNowTime"><span class="sNowDot" aria-hidden="true"></span><strong>'+esc(stamp)+'</strong><span>'+(context.preview?'Navegue pelos trabalhos previstos':'Atualização automática da programação')+'</span></div>'+
    buttons+card+
    '<div class="sNowNav"><button type="button" onclick="showcaseMove(-1)" aria-label="Mostrar trabalho anterior" '+(!list.length?'disabled':'')+'>←</button>'+
    '<span>Um novo trabalho a cada 15 segundos</span>'+
    '<button type="button" onclick="showcaseMove(1)" aria-label="Mostrar próximo trabalho" '+(!list.length?'disabled':'')+'>→</button></div>'+
    '<div class="sNowProgress" aria-hidden="true"><span></span></div>';
}
function showcaseMove(delta){showcaseRefresh(false,delta);showcaseRestart()}
function showcaseChooseBlock(block){
  if(!['b1','b2'].includes(block))return;
  showcasePreviewBlock=block;showcasePosition=0;showcaseCurrentKey='';showcaseRefresh(true,0);showcaseRestart();
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
