const BLOCK_1='10h00–11h30';
const BLOCK_2='11h30–13h00';
let workReturnScreen='explore';
function isPermanent(r){const h=(r.horario||'').replace('–','-');return norm(r.grupo)==='exposicao permanente'||h==='10h00-13h00'}
function isBlock(r){return r.horario===BLOCK_1||r.horario===BLOCK_2}
priority=r=>(isBlock(r)?220:0)+(r.titulo&&r.sala&&r.horario?100:0)+(r.sala&&r.horario?40:0)+(r.titulo?20:0)+(r.grupo?8:0)+(r.sala?5:0)+(r.horario?5:0)+(isPermanent(r)?2:0);
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
function backFromWork(){show(workReturnScreen&&workReturnScreen!=='workdetail'?workReturnScreen:'explore')}
function scheduleCard(p){const r=p.ref,context=r.expo||r.turma;return `<button class="scheduleWork projectBtn" onclick="openWork('${arg(p.key)}')"><b>${esc(r.titulo||'Projeto em atualização')}</b>${r.descTrabalho?`<div class="scheduleDesc">${esc(r.descTrabalho)}</div>`:''}<div class="meta">${r.sala?`Sala ${esc(r.sala)} • `:''}${esc(context||'')}${r.grupo?` • ${esc(r.grupo)}`:''}</div></button>`}
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
function decorateHighlights(){
  const section=document.querySelector('.specialSpotlight');
  if(section){
    const h2=section.querySelector('h2');if(h2)h2.textContent='Projetos em destaque';
    const hero=section.querySelector('.specialHero');if(hero)ensureHighlightTiming(hero,'Exposição permanente • 10h00–13h00','permanent');
    ensureHighlightTiming(findHighlightTile('TED-Ed Student Talks'),'Exposição permanente • 10h00–13h00','permanent');
    ensureHighlightTiming(findHighlightTile('Projeto STEAM — Objetivos de Desenvolvimento Sustentável'),'Apresentações por blocos','blocks');
    ensureHighlightTiming(findHighlightTile('Projeto STEAM — Terras Raras'),'Apresentações por blocos','blocks');

    const hum=findHighlightTile('Humanidades e Linguagens')||findHighlightTile('Arquitetura da Distinção');
    if(hum){
      const b=hum.querySelector('b'),small=hum.querySelector('small'),ico=hum.querySelector('.ico');
      if(b)b.textContent='Arquitetura da Distinção';
      if(small)small.textContent='Gostos, cultura, identidade e diferenças sociais pelo olhar de Humanidades e Linguagens.';
      if(ico)ico.textContent='🏛️';
      setButtonSearch(hum,'ITINERÁRIO CIÊNCIAS HUMANAS E LINGUAGENS');
      ensureHighlightTiming(hum,'Apresentações por blocos','blocks');
    }

    if(!findHighlightTile('A Ciência da Felicidade')){
      const grid=section.querySelector('.specialGrid'),all=findHighlightTile('Todos os destaques');
      const happiness=createHighlightTile({icon:'😊',title:'A Ciência da Felicidade',desc:'Leitura, lazer e experiências sensoriais investigando fatores associados ao bem-estar.',term:'A Ciência da Felicidade',cls:'green'});
      if(grid)grid.insertBefore(happiness,all||null);
    }
  }
  const projectScreen=document.querySelector('#projects');
  if(projectScreen){
    const heading=projectScreen.querySelector('.top h1');if(heading)heading.textContent='Projetos em destaque';
    ensureProjectTiming(findProjectCard('TED-Ed Student Talks | Colégio Stagio'),'Exposição permanente • 10h00–13h00','permanent');
    ensureProjectTiming(findProjectCard('Soft Skills Quest'),'Exposição permanente • 10h00–13h00','permanent');
    ensureProjectTiming(findProjectCard('Projeto STEAM — Objetivos de Desenvolvimento Sustentável'),'Apresentações por blocos • 10h00–11h30 e 11h30–13h00','blocks');
    ensureProjectTiming(findProjectCard('Projeto STEAM — Terras Raras'),'Apresentações por blocos • 10h00–11h30 e 11h30–13h00','blocks');

    const humCard=findProjectCard('Humanidades e Linguagens')||findProjectCard('Arquitetura da Distinção');
    if(humCard){
      const title=humCard.querySelector('.workTitle'),pt=humCard.querySelector('.pt'),link=humCard.querySelector('.plink'),ico=humCard.querySelector('.ico');
      if(title)title.textContent='Arquitetura da Distinção';
      let small=humCard.querySelector('.small');if(!small&&pt){small=document.createElement('div');small.className='small';pt.insertBefore(small,pt.querySelector('.projectTiming')||link)}
      if(small)small.textContent='Humanidades e Linguagens investiga como gostos, hábitos, consumo, linguagem e cultura constroem identidades, pertencimentos e diferenças sociais.';
      if(ico)ico.textContent='🏛️';
      if(link){link.textContent='Explorar trabalhos →';setButtonSearch(link,'ITINERÁRIO CIÊNCIAS HUMANAS E LINGUAGENS')}
      ensureProjectTiming(humCard,'Apresentações por blocos • 10h00–11h30 e 11h30–13h00','blocks');
    }

    if(!findProjectCard('A Ciência da Felicidade')){
      const sec=projectScreen.querySelector('.sec');
      const happiness=createProjectCard({icon:'😊',title:'A Ciência da Felicidade',desc:'Natureza e Matemática investiga a felicidade e o bem-estar em três experiências aplicadas: leitura com crianças, lazer na escola e ambiente sensorial.',term:'A Ciência da Felicidade',cls:'green'});
      if(sec&&humCard)sec.insertBefore(happiness,humCard);else sec?.appendChild(happiness);
    }
  }
}
decorateHighlights();