const BLOCK_1='10h00–11h30';
const BLOCK_2='11h30–13h00';
let workReturnScreen='explore';
function isPermanent(r){const h=(r.horario||'').replace('–','-');return norm(r.grupo)==='exposicao permanente'||h==='10h00-13h00'}
function isBlock(r){return r.horario===BLOCK_1||r.horario===BLOCK_2}
priority=r=>(isBlock(r)?220:0)+(r.titulo&&r.sala&&r.horario?100:0)+(r.sala&&r.horario?40:0)+(r.titulo?20:0)+(r.grupo?8:0)+(r.sala?5:0)+(r.horario?5:0)+(isPermanent(r)?2:0);
function publicContext(r){return r?.expo||r?.turma||''}
const baseOpenWork=openWork;
openWork=function(encoded){
  workReturnScreen=document.querySelector('.screen.on')?.id||'explore';
  baseOpenWork(encoded);
  const project=findProject(decodeURIComponent(encoded)),r=project?.ref;
  if(r?.expo){
    const meta=document.querySelector('#workBody .workHero .meta');if(meta)meta.textContent=r.expo;
    const axis=document.querySelector('#workBody .axisContext strong');if(axis)axis.textContent=r.expo;
  }
};
const baseOpenStudent=openStudent;
openStudent=function(encoded,push=true){
  baseOpenStudent(encoded,push);
  const name=decodeURIComponent(encoded),s=students.find(x=>norm(x.name)===norm(name));if(!s)return;
  const ws=works(s),primary=ws[0];
  if(primary?.expo){const meta=document.querySelector('#profileBody .profileHero .meta');if(meta)meta.textContent=primary.expo}
  document.querySelectorAll('#profileBody .workProfile').forEach((card,i)=>{
    const w=ws[i];if(!w?.expo||card.querySelector('.projectContext'))return;
    const context=document.createElement('div');context.className='meta projectContext';context.style.margin='6px 0 10px';context.textContent=`Projeto: ${w.expo}`;
    const chips=card.querySelector('.chips');if(chips)card.insertBefore(context,chips);else card.prepend(context);
  });
};
const baseOpenClass=openClass;
openClass=function(encoded){
  baseOpenClass(encoded);
  const ey=document.querySelector('#classBody .profileHero .ey');if(ey)ey.textContent='Projeto';
  const section=document.querySelector('#classBody .sectionLabel b');if(section)section.textContent='Trabalhos do projeto';
};
function backFromWork(){show(workReturnScreen&&workReturnScreen!=='workdetail'?workReturnScreen:'explore')}
function scheduleCard(p){const r=p.ref,context=publicContext(r);return `<button class="scheduleWork projectBtn" onclick="openWork('${arg(p.key)}')"><b>${esc(r.titulo||'Projeto em atualização')}</b>${r.descTrabalho?`<div class="scheduleDesc">${esc(r.descTrabalho)}</div>`:''}<div class="meta">${r.sala?`Sala ${esc(r.sala)} • `:''}${esc(context)}${r.grupo?` • ${esc(r.grupo)}`:''}</div></button>`}
renderSchedule=function(){
  const permanentRows=rows.filter(isPermanent),permanentProjects=groupProjects(permanentRows).sort((a,b)=>String(a.ref.titulo).localeCompare(String(b.ref.titulo),'pt-BR')),permanentStudents=new Set(permanentRows.map(r=>norm(r.name))).size;
  const permanent=$('permanent');
  if(permanent)permanent.innerHTML=permanentProjects.length?`<div class="permanentHead"><div><div class="lbl">Durante toda a Mostra</div><h2>Exposições permanentes</h2><p>Disponíveis das 10h às 13h, independentemente do bloco de apresentação.</p></div><span class="permanentCount">${permanentStudents} alunos</span></div><div class="scheduleList">${permanentProjects.map(scheduleCard).join('')}</div>`:'';
  [[BLOCK_1,'b1',1],[BLOCK_2,'b2',2]].forEach(([time,id,i])=>{
    const blockRows=rows.filter(r=>r.horario===time),projects=groupProjects(blockRows).sort((a,b)=>String(a.ref.sala).localeCompare(String(b.ref.sala),'pt-BR',{numeric:true})||String(a.ref.titulo).localeCompare(String(b.ref.titulo),'pt-BR')),studentCount=new Set(blockRows.map(r=>norm(r.name))).size,el=$(id);
    el.innerHTML=`<div class="scheduleBlockHead"><div><div class="lbl">Bloco ${i}</div><h2>${time}</h2></div><div class="count blockCount">${studentCount} alunos</div></div><div class="scheduleList">${projects.length?projects.map(scheduleCard).join(''):'<div class="empty">Programação deste bloco em atualização.</div>'}</div>`;
  });
};
renderNow=function(){const d=new Date(),mins=d.getHours()*60+d.getMinutes();let title='Seu guia de visitação',text='No dia 14/11, esta área mostrará automaticamente qual bloco está acontecendo naquele momento.';if(d.getFullYear()===2026&&d.getMonth()+1===11&&d.getDate()===14){if(mins<600){title='A Mostra começa às 10h';text='Use a busca para encontrar um estudante ou explore os projetos e trabalhos.'}else if(mins<690){title='Bloco 1 acontecendo agora';text='Apresentações das 10h00 às 11h30. As exposições permanentes também estão abertas até 13h.'}else if(mins<780){title='Bloco 2 acontecendo agora';text='Apresentações das 11h30 às 13h00. As exposições permanentes seguem abertas até o encerramento.'}else{title='Mostra encerrada';text='A programação de apresentações terminou às 13h.'}}const card=$('nowCard');if(card){card.querySelector('h2').textContent=title;card.querySelector('p').textContent=text}};

function ensureHighlightTiming(container,text,type='blocks'){
  if(!container||container.querySelector('.specialSchedule'))return;
  const badge=document.createElement('span');badge.className=`specialSchedule ${type}`;badge.textContent=text;
  const go=container.querySelector('.go,.specialCta');if(go)container.insertBefore(badge,go);else container.appendChild(badge);
}
function findHighlightTile(label){return [...document.querySelectorAll('.specialTile')].find(el=>norm(el.querySelector('b')?.textContent)===norm(label))}
function findProjectCard(label){return [...document.querySelectorAll('#projects .card.project')].find(el=>norm(el.querySelector('.workTitle')?.textContent)===norm(label))}
function ensureProjectTiming(card,text,type='blocks'){
  if(!card||card.querySelector('.projectTiming'))return;
  const timing=document.createElement('div');timing.className=`projectTiming ${type}`;timing.textContent=text;
  const pt=card.querySelector('.pt'),link=pt?.querySelector('.plink');if(pt&&link)pt.insertBefore(timing,link);else pt?.appendChild(timing);
}
function setButtonSearch(button,term){if(button)button.onclick=()=>searchTerm(term)}
function retitleHighlight(tile,{title,desc,term,icon}){
  if(!tile)return;
  const b=tile.querySelector('b'),small=tile.querySelector('small'),ico=tile.querySelector('.ico');
  if(b)b.textContent=title;if(small)small.textContent=desc;if(ico&&icon)ico.textContent=icon;setButtonSearch(tile,term);
}
function retitleProjectCard(card,{title,desc,term,icon}){
  if(!card)return;
  const t=card.querySelector('.workTitle'),pt=card.querySelector('.pt'),link=card.querySelector('.plink'),ico=card.querySelector('.ico');
  if(t)t.textContent=title;
  let small=card.querySelector('.small');if(!small&&pt){small=document.createElement('div');small.className='small';pt.insertBefore(small,pt.querySelector('.projectTiming')||link)}
  if(small)small.textContent=desc;if(ico&&icon)ico.textContent=icon;
  if(link){link.textContent='Explorar trabalhos →';setButtonSearch(link,term)}
}
function createHighlightTile({icon,title,desc,term,cls='green'}){
  const b=document.createElement('button');b.className='specialTile';setButtonSearch(b,term);
  b.innerHTML=`<span class="ico ${cls}">${icon}</span><b>${esc(title)}</b><small>${esc(desc)}</small><span class="specialSchedule blocks">Apresentações por blocos</span><span class="go">Explorar →</span>`;
  return b;
}
function createProjectCard({icon,title,desc,term,cls='green'}){
  const card=document.createElement('div');card.className='card project';
  card.innerHTML=`<span class="ico ${cls}">${icon}</span><div class="pt"><div class="workTitle">${esc(title)}</div><div class="small">${esc(desc)}</div><div class="projectTiming blocks">Apresentações por blocos • 10h00–11h30 e 11h30–13h00</div><button class="plink" style="border:0;background:none;padding:8px 0 0">Explorar trabalhos →</button></div>`;
  setButtonSearch(card.querySelector('.plink'),term);return card;
}
function cleanProjectLanguage(){
  const first=document.querySelector('#fClass option');if(first)first.textContent='Todos os projetos';
  const explore=document.querySelector('#explore');
  if(explore){const p=explore.querySelector('.top p'),ey=explore.querySelector('.sec .ey');if(p)p.textContent='Escolha um projeto e veja seus trabalhos.';if(ey)ey.textContent='Projetos';}
  const detail=document.querySelector('#classdetail .top p');if(detail)detail.textContent='Trabalhos e grupos vinculados ao projeto.';
}
function decorateHighlights(){
  cleanProjectLanguage();
  const section=document.querySelector('.specialSpotlight');
  if(section){
    const h2=section.querySelector('h2');if(h2)h2.textContent='Projetos em destaque';
    const hero=section.querySelector('.specialHero');if(hero)ensureHighlightTiming(hero,'Exposição permanente • 10h00–13h00','permanent');
    ensureHighlightTiming(findHighlightTile('TED-Ed Student Talks'),'Exposição permanente • 10h00–13h00','permanent');

    const ods=findHighlightTile('Projeto STEAM — Objetivos de Desenvolvimento Sustentável')||findHighlightTile('Objetivos de Desenvolvimento Sustentável');
    retitleHighlight(ods,{title:'Objetivos de Desenvolvimento Sustentável',desc:'Investigação dos ODS por meio de uma abordagem STEAM, articulando ciência, tecnologia, engenharia, artes e matemática.',term:'Objetivos de Desenvolvimento Sustentável',icon:'🌎'});
    ensureHighlightTiming(ods,'Apresentações por blocos','blocks');

    const terras=findHighlightTile('Projeto STEAM — Terras Raras')||findHighlightTile('Terras Raras');
    retitleHighlight(terras,{title:'Terras Raras',desc:'Investigação sobre extração, aplicações, tecnologia e sustentabilidade por meio de uma abordagem STEAM.',term:'Terras Raras',icon:'⚛️'});
    ensureHighlightTiming(terras,'Apresentações por blocos','blocks');

    const hum=findHighlightTile('Humanidades e Linguagens')||findHighlightTile('Arquitetura da Distinção');
    retitleHighlight(hum,{title:'Arquitetura da Distinção',desc:'Projeto do itinerário de Humanidades e Linguagens sobre gostos, cultura, identidade, pertencimento e diferenças sociais.',term:'Arquitetura da Distinção',icon:'🏛️'});
    ensureHighlightTiming(hum,'Apresentações por blocos','blocks');

    if(!findHighlightTile('A Ciência da Felicidade')){
      const grid=section.querySelector('.specialGrid'),all=findHighlightTile('Todos os destaques');
      const happiness=createHighlightTile({icon:'😊',title:'A Ciência da Felicidade',desc:'Projeto do itinerário de Ciências da Natureza e Matemática que investiga felicidade e bem-estar por meio de experiências aplicadas.',term:'A Ciência da Felicidade',cls:'green'});
      if(grid)grid.insertBefore(happiness,all||null);
    }
  }
  const projectScreen=document.querySelector('#projects');
  if(projectScreen){
    const heading=projectScreen.querySelector('.top h1');if(heading)heading.textContent='Projetos em destaque';
    ensureProjectTiming(findProjectCard('TED-Ed Student Talks | Colégio Stagio'),'Exposição permanente • 10h00–13h00','permanent');
    ensureProjectTiming(findProjectCard('Soft Skills Quest'),'Exposição permanente • 10h00–13h00','permanent');

    const odsCard=findProjectCard('Projeto STEAM — Objetivos de Desenvolvimento Sustentável')||findProjectCard('Objetivos de Desenvolvimento Sustentável');
    retitleProjectCard(odsCard,{title:'Objetivos de Desenvolvimento Sustentável',desc:'Projeto desenvolvido por meio de uma abordagem STEAM, integrando Ciência, Tecnologia, Engenharia, Artes e Matemática na investigação dos ODS.',term:'Objetivos de Desenvolvimento Sustentável',icon:'🌎'});
    ensureProjectTiming(odsCard,'Apresentações por blocos • 10h00–11h30 e 11h30–13h00','blocks');

    const terrasCard=findProjectCard('Projeto STEAM — Terras Raras')||findProjectCard('Terras Raras');
    retitleProjectCard(terrasCard,{title:'Terras Raras',desc:'Projeto desenvolvido por meio de uma abordagem STEAM para investigar extração, aplicações tecnológicas, impactos e sustentabilidade das terras raras.',term:'Terras Raras',icon:'⚛️'});
    ensureProjectTiming(terrasCard,'Apresentações por blocos • 10h00–11h30 e 11h30–13h00','blocks');

    const humCard=findProjectCard('Humanidades e Linguagens')||findProjectCard('Arquitetura da Distinção');
    retitleProjectCard(humCard,{title:'Arquitetura da Distinção',desc:'Projeto do itinerário de Humanidades e Linguagens inspirado na ideia de distinção de Pierre Bourdieu, investigando gosto, identidade, cultura e diferenças sociais.',term:'Arquitetura da Distinção',icon:'🏛️'});
    ensureProjectTiming(humCard,'Apresentações por blocos • 10h00–11h30 e 11h30–13h00','blocks');

    if(!findProjectCard('A Ciência da Felicidade')){
      const sec=projectScreen.querySelector('.sec');
      const happiness=createProjectCard({icon:'😊',title:'A Ciência da Felicidade',desc:'Projeto do itinerário de Ciências da Natureza e Matemática que investiga felicidade e bem-estar em três experiências aplicadas: leitura com crianças, lazer na escola e ambiente sensorial.',term:'A Ciência da Felicidade',cls:'green'});
      if(sec&&humCard)sec.insertBefore(happiness,humCard);else sec?.appendChild(happiness);
    }
  }
}
decorateHighlights();