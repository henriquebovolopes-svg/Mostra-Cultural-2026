const BLOCK_1='10h00–11h30';
const BLOCK_2='11h30–13h00';
let workReturnScreen='explore';
function isPermanent(r){const h=(r.horario||'').replace('–','-');return norm(r.grupo)==='exposicao permanente'||h==='10h00-13h00'}
function isBlock(r){return r.horario===BLOCK_1||r.horario===BLOCK_2}
priority=r=>(isBlock(r)?220:0)+(r.titulo&&r.sala&&r.horario?100:0)+(r.sala&&r.horario?40:0)+(r.titulo?20:0)+(r.grupo?8:0)+(r.sala?5:0)+(r.horario?5:0)+(isPermanent(r)?2:0);
const baseOpenWork=openWork;
openWork=function(encoded){workReturnScreen=document.querySelector('.screen.on')?.id||'explore';baseOpenWork(encoded)};
function backFromWork(){show(workReturnScreen&&workReturnScreen!=='workdetail'?workReturnScreen:'explore')}
function scheduleCard(p){const r=p.ref;return `<button class="scheduleWork projectBtn" onclick="openWork('${arg(p.key)}')"><b>${esc(r.titulo||'Projeto em atualização')}</b>${r.descTrabalho?`<div class="scheduleDesc">${esc(r.descTrabalho)}</div>`:''}<div class="meta">${r.sala?`Sala ${esc(r.sala)} • `:''}${esc(r.turma||'')}${r.grupo?` • ${esc(r.grupo)}`:''}</div></button>`}
renderSchedule=function(){
  const permanentRows=rows.filter(isPermanent),permanentProjects=groupProjects(permanentRows).sort((a,b)=>String(a.ref.titulo).localeCompare(String(b.ref.titulo),'pt-BR')),permanentStudents=new Set(permanentRows.map(r=>norm(r.name))).size;
  const permanent=$('permanent');
  if(permanent)permanent.innerHTML=permanentProjects.length?`<div class="permanentHead"><div><div class="lbl">Durante toda a Mostra</div><h2>Exposições permanentes</h2><p>Disponíveis das 10h às 13h, independentemente do bloco de apresentação.</p></div><span class="permanentCount">${permanentStudents} alunos</span></div><div class="scheduleList">${permanentProjects.map(scheduleCard).join('')}</div>`:'';
  [[BLOCK_1,'b1',1],[BLOCK_2,'b2',2]].forEach(([time,id,i])=>{
    const blockRows=rows.filter(r=>r.horario===time),projects=groupProjects(blockRows).sort((a,b)=>String(a.ref.sala).localeCompare(String(b.ref.sala),'pt-BR',{numeric:true})||String(a.ref.titulo).localeCompare(String(b.ref.titulo),'pt-BR')),studentCount=new Set(blockRows.map(r=>norm(r.name))).size,el=$(id);
    el.innerHTML=`<div class="scheduleBlockHead"><div><div class="lbl">Bloco ${i}</div><h2>${time}</h2></div><div class="count blockCount">${studentCount} alunos</div></div><div class="scheduleList">${projects.length?projects.map(scheduleCard).join(''):'<div class="empty">Programação deste bloco em atualização.</div>'}</div>`;
  });
};
renderNow=function(){const d=new Date(),mins=d.getHours()*60+d.getMinutes();let title='Seu guia de visitação',text='No dia 14/11, esta área mostrará automaticamente qual bloco está acontecendo naquele momento.';if(d.getFullYear()===2026&&d.getMonth()+1===11&&d.getDate()===14){if(mins<600){title='A Mostra começa às 10h';text='Use a busca para encontrar um estudante ou explore os trabalhos por turma.'}else if(mins<690){title='Bloco 1 acontecendo agora';text='Apresentações das 10h00 às 11h30. As exposições permanentes também estão abertas até 13h.'}else if(mins<780){title='Bloco 2 acontecendo agora';text='Apresentações das 11h30 às 13h00. As exposições permanentes seguem abertas até o encerramento.'}else{title='Mostra encerrada';text='A programação de apresentações terminou às 13h.'}}const card=$('nowCard');card.querySelector('h2').textContent=title;card.querySelector('p').textContent=text};

function addHighlightSchedule(container,text,type='blocks'){
  if(!container||container.querySelector('.specialSchedule'))return;
  const badge=document.createElement('span');
  badge.className=`specialSchedule ${type}`;
  badge.textContent=text;
  const go=container.querySelector('.go,.specialCta');
  if(go)container.insertBefore(badge,go);else container.appendChild(badge);
}
function findHighlightTile(label){return [...document.querySelectorAll('.specialTile')].find(el=>norm(el.querySelector('b')?.textContent)===norm(label))}
function findProjectCard(label){return [...document.querySelectorAll('#projects .card.project')].find(el=>norm(el.querySelector('.workTitle')?.textContent).includes(norm(label)))}
function addProjectTiming(card,text,type='blocks'){
  if(!card||card.querySelector('.projectTiming'))return;
  const timing=document.createElement('div');
  timing.className=`projectTiming ${type}`;
  timing.textContent=text;
  const pt=card.querySelector('.pt');
  const link=pt?.querySelector('.plink');
  if(pt&&link)pt.insertBefore(timing,link);else pt?.appendChild(timing);
}
function decorateHighlights(){
  const section=document.querySelector('.specialSpotlight');
  if(section){
    const h2=section.querySelector('h2'); if(h2)h2.textContent='Projetos em destaque';
    const lead=section.querySelector('.specialLead'); if(lead)lead.textContent='Percursos que ganham destaque na Mostra por sua trajetória, linguagem ou forma de apresentação. Alguns ficam abertos durante todo o evento; outros acontecem nos blocos programados.';
    const hero=section.querySelector('.specialHero');
    if(hero){const tag=hero.querySelector('.specialTag');if(tag)tag.textContent='2º EM • em destaque';addHighlightSchedule(hero,'Exposição permanente • 10h00–13h00','permanent')}
    const ted=findHighlightTile('TED-Ed Student Talks');
    if(ted){const small=ted.querySelector('small');if(small)small.textContent='Ideias autorais do 1º ano transformadas em talks.';addHighlightSchedule(ted,'Exposição permanente • 10h00–13h00','permanent')}
    const steam=findHighlightTile('STEAM');
    if(steam){const small=steam.querySelector('small');if(small)small.textContent='6º–8º: ODS por uma abordagem STEAM • 9º: terras raras pelo viés do STEAM.';addHighlightSchedule(steam,'Apresentações por blocos • 10h00–11h30 / 11h30–13h00','blocks')}
    const hum=findHighlightTile('Humanidades e Linguagens');
    if(hum)addHighlightSchedule(hum,'Apresentações por blocos','blocks');
    const all=[...document.querySelectorAll('.specialTile')].find(el=>norm(el.querySelector('b')?.textContent)==='todos os especiais');
    if(all){const b=all.querySelector('b');if(b)b.textContent='Todos os destaques';const small=all.querySelector('small');if(small)small.textContent='Veja a seleção completa de projetos em destaque.'}
  }
  const projectScreen=document.querySelector('#projects');
  if(projectScreen){
    const heading=projectScreen.querySelector('.top h1');if(heading)heading.textContent='Projetos em destaque';
    const intro=projectScreen.querySelector('.top p');if(intro)intro.textContent='Percursos e produções que ganham destaque na Mostra Cultural.';
    const tedCard=findProjectCard('TED-Ed');
    if(tedCard){const small=tedCard.querySelector('.small');if(small)small.textContent='Talks autorais do 1º ano, desenvolvidos em um percurso de escrita, oralidade e apresentação pública.';addProjectTiming(tedCard,'Exposição permanente • 10h00–13h00','permanent')}
    const softCard=findProjectCard('Soft Skills Quest');
    if(softCard){const small=softCard.querySelector('.small');if(small)small.textContent='Jornada gamificada do 2º Ensino Médio por mundos, missões, personagens e desafios de competências.';addProjectTiming(softCard,'Exposição permanente • 10h00–13h00','permanent')}
    const steamCard=findProjectCard('STEAM');
    if(steamCard){
      const pt=steamCard.querySelector('.pt');
      let small=steamCard.querySelector('.small');if(!small&&pt){small=document.createElement('div');small.className='small';pt.insertBefore(small,pt.querySelector('.plink'))}if(small)small.textContent='Um mesmo eixo reúne dois grandes percursos investigativos.';
      if(pt&&!pt.querySelector('.steamPaths')){const paths=document.createElement('div');paths.className='steamPaths';paths.innerHTML='<span><b>6º ao 8º ano</b> Objetivos de Desenvolvimento Sustentável por uma abordagem STEAM</span><span><b>9º ano</b> Terras raras pelo viés do STEAM</span>';const link=pt.querySelector('.plink');pt.insertBefore(paths,link)}
      addProjectTiming(steamCard,'Apresentações por blocos • 10h00–11h30 e 11h30–13h00','blocks');
    }
    const humCard=findProjectCard('Humanidades e Linguagens');if(humCard)addProjectTiming(humCard,'Apresentações por blocos','blocks');
  }
}
decorateHighlights();