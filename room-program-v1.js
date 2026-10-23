// Programação específica por sala
const roomProgramStyle=document.createElement('style');
roomProgramStyle.textContent=`
#roomButtons .room{cursor:pointer}
#roomButtons .room.on{background:var(--blue);color:#fff;border-color:var(--blue);box-shadow:0 5px 14px rgba(0,60,105,.16)}
.roomProgram{margin:22px 0 8px;scroll-margin-top:16px}
.roomProgramHero{padding:18px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(145deg,#f7fafb,#fff);box-shadow:0 8px 24px rgba(0,60,105,.06)}
.roomProgramHero h2{margin:4px 0 5px;color:var(--blue);font-size:24px;line-height:1.1}
.roomProgramHero p{margin:0;color:var(--muted);font-size:12.5px;line-height:1.45}
.roomProgramMeta{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.roomProgramMeta span{padding:6px 9px;border-radius:999px;background:#edf4f6;color:#466676;font-size:10.5px;font-weight:850}
.roomTimeSection{margin-top:16px;padding:15px;border:1px solid var(--line);border-radius:18px;background:#fff}
.roomTimeHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}.roomTimeHead .lbl{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--green);font-weight:900}.roomTimeHead h3{margin:3px 0 0;color:var(--blue);font-size:18px}.roomTimeHead span{font-size:11px;color:var(--muted);font-weight:800;text-align:right}
.roomTimeSection.permanent .roomTimeHead .lbl{color:#24724c}
.roomTimeSection .scheduleList{margin-top:0}
.roomEmpty{padding:12px;border-radius:12px;background:#f7f9fa;color:var(--muted);font-size:11.5px;line-height:1.4}
.roomDirectLink{display:inline-flex;margin-top:12px;border:0;background:none;color:var(--blue);font-size:11px;font-weight:900;padding:0;cursor:pointer}
.roomProgramCard .meta{margin-top:6px}
@media(min-width:640px){.roomProgram{max-width:680px;margin-left:auto;margin-right:auto}.roomProgramHero{padding:22px}.roomTimeSection{padding:18px}}
`;
document.head.appendChild(roomProgramStyle);

let activeRoomProgram='';
let roomDeepLinkApplied=false;

function roomDisplayName(room){
  const s=String(room||'').trim();
  if(!s)return'Sala';
  if(/^sala\s*/i.test(s))return s.replace(/^sala\s*/i,'Sala ');
  if(/^\d+$/.test(s))return `Sala ${s}`;
  return s;
}
function roomScheduleProjects(room,filterFn){
  return groupProjects(rows.filter(r=>norm(r.sala)===norm(room)&&filterFn(r))).sort((a,b)=>String(a.ref.titulo||'').localeCompare(String(b.ref.titulo||''),'pt-BR'));
}
function roomProgramCard(p){
  const r=p.ref,context=publicContext(r);
  return `<button class="scheduleWork projectBtn roomProgramCard" onclick="openWork('${arg(p.key)}')"><b>${esc(r.titulo||'Projeto em atualização')}</b>${r.descTrabalho?`<div class="scheduleDesc">${esc(r.descTrabalho)}</div>`:''}<div class="meta">${esc(context)}${r.grupo?`${context?' • ':''}${esc(r.grupo)}`:''}</div></button>`;
}
function roomScheduleList(projects){
  return projects.length?`<div class="scheduleList">${projects.map(roomProgramCard).join('')}</div>`:'<div class="roomEmpty">Nenhuma atividade cadastrada neste horário para esta sala.</div>';
}
function roomTimeSection(label,time,projects,kind=''){
  return `<section class="roomTimeSection ${kind}"><div class="roomTimeHead"><div><div class="lbl">${esc(label)}</div><h3>${esc(time)}</h3></div><span>${projects.length} trabalho${projects.length===1?'':'s'}</span></div>${roomScheduleList(projects)}</section>`;
}
function roomDirectUrl(room){
  const u=new URL(location.href);u.search='';u.searchParams.set('sala',room);return u.pathname+u.search;
}
async function copyRoomLink(encoded){
  const room=decodeURIComponent(encoded);
  const url=`${location.origin}${location.pathname}?sala=${encodeURIComponent(room)}`;
  try{await navigator.clipboard.writeText(url);alert('Link da programação da sala copiado!')}catch(e){}
}

renderRooms=function(){
  const rooms=uniqueValues('sala');
  $('roomButtons').innerHTML=rooms.length?rooms.map(r=>`<button class="room${norm(r)===norm(activeRoomProgram)?' on':''}" data-room="${esc(r)}" onclick="openRoom('${arg(r)}')" aria-label="Ver programação de ${esc(roomDisplayName(r))}">${esc(roomDisplayName(r))}</button>`).join(''):'<div class="empty">Salas ainda em definição.</div>';
  if(!roomDeepLinkApplied){
    const q=new URLSearchParams(location.search).get('sala');
    if(q){roomDeepLinkApplied=true;setTimeout(()=>openRoom(encodeURIComponent(q),false),0)}
  }
};

openRoom=function(encoded,push=true){
  const room=decodeURIComponent(encoded);
  activeRoomProgram=room;
  const roomRows=rows.filter(r=>norm(r.sala)===norm(room));
  const b1=roomScheduleProjects(room,r=>r.horario===BLOCK_1);
  const b2=roomScheduleProjects(room,r=>r.horario===BLOCK_2);
  const permanent=roomScheduleProjects(room,isPermanent);
  const scheduledKeys=new Set([...b1,...b2,...permanent].map(p=>p.key));
  const other=groupProjects(roomRows).filter(p=>!scheduledKeys.has(p.key));
  const total=new Set([...b1,...b2,...permanent,...other].map(p=>p.key)).size;
  const label=roomDisplayName(room);
  const result=$('roomResults');
  if(!result)return;
  result.innerHTML=`<div id="roomProgramPanel" class="roomProgram"><div class="roomProgramHero"><div class="ey">Programação da sala</div><h2>${esc(label)}</h2><p>Veja tudo o que acontece neste espaço ao longo da Mostra.</p><div class="roomProgramMeta"><span>${total} trabalho${total===1?'':'s'}</span><span>14 de novembro</span><span>10h00–13h00</span></div><button class="roomDirectLink" onclick="copyRoomLink('${arg(room)}')">🔗 Copiar link direto desta sala</button></div>${roomTimeSection('Bloco 1',BLOCK_1,b1)}${roomTimeSection('Bloco 2',BLOCK_2,b2)}${roomTimeSection('Exposições permanentes','10h00–13h00',permanent,'permanent')}${other.length?roomTimeSection('Programação em atualização','Horário a confirmar',other):''}</div>`;
  document.querySelectorAll('#roomButtons .room').forEach(btn=>btn.classList.toggle('on',norm(btn.dataset.room)===norm(room)));
  if(push){history.pushState({room},'',roomDirectUrl(room))}
  show('rooms');
  setTimeout(()=>document.getElementById('roomProgramPanel')?.scrollIntoView({behavior:'smooth',block:'start'}),60);
};

// Reaplica os botões caso a base já esteja carregada quando este módulo entrar.
if(Array.isArray(rows)&&rows.length)renderRooms();
