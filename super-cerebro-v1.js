/* Super Cérebro — exposição parceira | Sala 11, Lab Maker.
   Registro de parceiro externo, sem criar um estudante fictício na base. */
const scStyle=document.createElement('link');
scStyle.rel='stylesheet';
scStyle.href='super-cerebro-v1.css?v=1';
document.head.appendChild(scStyle);

const SC_ROOM='11';
const SC_LOGO='assets/super-cerebro-logo.webp';
const SC_BRIEF='O Super Cérebro apresenta uma proposta de aprendizagem que desenvolve habilidades cognitivas e socioemocionais por meio de jogos de estratégia, desafios de raciocínio lógico e do Soroban (ábaco japonês).';
const SC_DESCRIPTION='A exposição convida as famílias a conhecer atividades que estimulam a concentração, a memória, a cooperação, o planejamento e a resolução de problemas.';

function scRoomMarkup(){
  return `<article class="scRoomCard">
    <div class="scCardHeader">
      <div class="scCardIdentity">
        <span class="scEyebrow">Sala 11 · Lab Maker</span>
        <h2>Super Cérebro</h2>
        <span class="scPartner">Parceiro educacional do Colégio Stagio</span>
      </div>
      <div class="scLogoBox"><img src="${SC_LOGO}" alt="Logotipo do Super Cérebro" width="150" height="211" loading="eager"></div>
    </div>
    <div class="scVisit"><span aria-hidden="true">◷</span> Exposição permanente · 14/11 · 10h às 13h</div>
    <div class="scCardBody">
      <h3>Aprender é desenvolver novas maneiras de pensar</h3>
      <p>${SC_BRIEF}</p>
      <p>${SC_DESCRIPTION}</p>
      <div class="scTags" aria-label="Habilidades e atividades"><span>Jogos de estratégia</span><span>Soroban</span><span>Raciocínio lógico</span><span>Memória e concentração</span><span>Cooperação</span></div>
      <a class="scOfficial" href="https://supercerebro.com.br/quem-somos/" target="_blank" rel="noopener noreferrer">Conheça o método Super Cérebro ↗</a>
    </div>
  </article>`;
}

function scAddRoomButton(){
  const host=document.getElementById('roomButtons');
  if(!host||host.querySelector('[data-sc-room="11"]'))return;
  const button=document.createElement('button');
  button.type='button';
  button.className='room scRoomButton';
  button.dataset.scRoom='11';
  button.textContent='Sala 11 · Lab Maker';
  button.setAttribute('aria-label','Ver a exposição Super Cérebro na Sala 11, Lab Maker');
  button.addEventListener('click',()=>scGoRoom());
  const existing=[...host.querySelectorAll('.room')];
  const next=existing.find(b=>{const m=b.textContent.match(/\d+/);return m&&Number(m[0])>11});
  if(next)host.insertBefore(button,next);else host.appendChild(button);
}
function scGoRoom(){
  show('rooms');
  openRoom('11');
  const url=new URL(location.href);
  url.searchParams.delete('aluno');
  url.searchParams.set('sala','11');
  history.pushState({sala:'11'},'',url.pathname+url.search+url.hash);
}

const scBaseRenderRooms=renderRooms;
renderRooms=function(){
  scBaseRenderRooms();
  scAddRoomButton();
};

const scBaseOpenRoom=openRoom;
openRoom=function(encoded,push){
  scBaseOpenRoom(encoded,push);
  const room=decodeURIComponent(encoded).trim();
  if(room!=='11')return;
  scAddRoomButton();
  const host=document.getElementById('roomResults');
  if(host)host.innerHTML=scRoomMarkup();
  document.querySelectorAll('#roomButtons .room').forEach(b=>b.classList.toggle('on',b.dataset.scRoom==='11'));
};

const scBaseRenderSchedule=renderSchedule;
renderSchedule=function(){
  scBaseRenderSchedule();
  const host=document.getElementById('permanent');
  if(!host||host.querySelector('.scScheduleItem'))return;
  let list=host.querySelector('.scheduleList');
  if(!list){
    host.innerHTML='<div class="permanentHead"><div><div class="lbl">Durante toda a Mostra</div><h2>Exposições permanentes</h2><p>Disponíveis das 10h às 13h.</p></div></div><div class="scheduleList"></div>';
    list=host.querySelector('.scheduleList');
  }
  const item=document.createElement('button');
  item.type='button';
  item.className='scheduleWork projectBtn scScheduleItem';
  item.innerHTML='<b>Super Cérebro · Sala 11 — Lab Maker</b><div class="scheduleDesc">Exposição de parceiro educacional: Soroban, jogos de estratégia, raciocínio lógico e habilidades socioemocionais.</div><div class="meta">Sala 11 · Exposição permanente · 10h às 13h</div>';
  item.addEventListener('click',scGoRoom);
  list.appendChild(item);
};

function scAddHighlights(){
  const grid=document.querySelector('#home .specialGrid');
  if(grid&&!grid.querySelector('.scFeatureTile')){
    const feature=document.createElement('button');
    feature.type='button';
    feature.className='specialTile scFeatureTile';
    feature.innerHTML=`<img src="${SC_LOGO}" alt="" class="scFeatureLogo" loading="lazy"><span class="scFeatureTag">Parceiro do Colégio Stagio</span><b>Super Cérebro</b><small>Conheça jogos, Soroban e desafios que estimulam o raciocínio e as habilidades socioemocionais.</small><span class="specialSchedule permanent">Sala 11 · 10h às 13h</span><span class="go">Visitar a exposição →</span>`;
    feature.addEventListener('click',scGoRoom);
    grid.appendChild(feature);
  }
  const projectGrid=document.querySelector('#projects .sec');
  if(projectGrid&&!projectGrid.querySelector('.scProjectTile')){
    const card=document.createElement('div');
    card.className='card project scProjectTile';
    card.innerHTML=`<img src="${SC_LOGO}" alt="Super Cérebro" class="scProjectLogo" loading="lazy"><div class="pt"><div class="workTitle">Super Cérebro · Lab Maker</div><div class="small">Parceiro educacional do Colégio Stagio. Exposição de jogos de estratégia, Soroban e atividades de desenvolvimento cognitivo e socioemocional.</div><div class="projectTiming permanent">Sala 11 · Exposição permanente · 10h às 13h</div><button class="plink scProjectOpen" type="button">Conhecer a exposição →</button></div>`;
    card.querySelector('.scProjectOpen').addEventListener('click',scGoRoom);
    projectGrid.appendChild(card);
  }
}

const scBasePrepare=prepare;
prepare=function(){
  scBasePrepare();
  scAddRoomButton();
  scAddHighlights();
  const params=new URLSearchParams(location.search);
  if(params.get('sala')==='11'&&!params.get('aluno')){
    show('rooms');
    openRoom('11',false);
  }
};
scAddHighlights();
scAddRoomButton();
