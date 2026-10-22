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
renderNow=function(){const d=new Date(),mins=d.getHours()*60+d.getMinutes();let title='Seu guia de visitação',text='No dia 14/11, esta área mostrará automaticamente qual bloco está acontecendo naquele momento.';if(d.getFullYear()===2026&&d.getMonth()+1===11&&d.getDate()===14){if(mins<600){title='A Mostra começa às 10h';text='Use a busca para encontrar um estudante ou explore os trabalhos por projeto.'}else if(mins<690){title='Bloco 1 acontecendo agora';text='Apresentações das 10h00 às 11h30. As exposições permanentes também estão abertas até 13h.'}else if(mins<780){title='Bloco 2 acontecendo agora';text='Apresentações das 11h30 às 13h00. As exposições permanentes seguem abertas até o encerramento.'}else{title='Mostra encerrada';text='A programação de apresentações terminou às 13h.'}}const card=$('nowCard');card.querySelector('h2').textContent=title;card.querySelector('p').textContent=text};

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
function splitSteamHighlights(){
  const steam=findHighlightTile('STEAM');
  if(steam){
    const make=(title,desc,term,icon)=>{const el=steam.cloneNode(true);el.setAttribute('onclick',`searchTerm('${term}')`);const i=el.querySelector('.ico');if(i)i.textContent=icon;const b=el.querySelector('b');if(b)b.textContent=title;const s=el.querySelector('small');if(s)s.textContent=desc;const g=el.querySelector('.go');if(g)g.textContent='Explorar →';return el};
    const ods=make('Projeto STEAM — Objetivos de Desenvolvimento Sustentável','Investigações sobre sustentabilidade, sociedade e futuro por uma abordagem STEAM.','Projeto STEAM — Objetivos de Desenvolvimento Sustentável','🌍');
    const raras=make('Projeto STEAM — Terras Raras','Ciência, tecnologia e sustentabilidade em jogos, maquetes, experimentos e protótipos.','Projeto STEAM — Terras Raras','⚛️');
    steam.replaceWith(ods,raras);
  }
  const steamCard=findProjectCard('STEAM');
  if(steamCard&&norm(steamCard.querySelector('.workTitle')?.textContent)==='steam'){
    const makeCard=(title,desc,term,icon)=>{const card=steamCard.cloneNode(true);const ico=card.querySelector('.ico');if(ico)ico.textContent=icon;const wt=card.querySelector('.workTitle');if(wt)wt.textContent=title;let small=card.querySelector('.small');if(!small){small=document.createElement('div');small.className='small';card.querySelector('.pt')?.insertBefore(small,card.querySelector('.plink'))}small.textContent=desc;const link=card.querySelector('.plink');if(link){link.textContent='Explorar trabalhos →';link.setAttribute('onclick',`searchTerm('${term}')`)}return card};
    const ods=makeCard('Projeto STEAM — Objetivos de Desenvolvimento Sustentável','Projetos que articulam Ciência, Tecnologia, Engenharia, Artes e Matemática para investigar os ODS.','Projeto STEAM — Objetivos de Desenvolvimento Sustentável','🌍');
    const raras=makeCard('Projeto STEAM — Terras Raras','Investigações sobre extração, aplicações, tecnologia, reciclagem e impactos das terras raras.','Projeto STEAM — Terras Raras','⚛️');
    steamCard.replaceWith(ods,raras);
  }
}
function decorateHighlights(){
  splitSteamHighlights();
  const section=document.querySelector('.specialSpotlight');
  if(section){
    const h2=section.querySelector('h2');if(h2)h2.textContent='Projetos em destaque';
    const lead=section.querySelector('.specialLead');if(lead)lead.textContent='Percursos que ganham destaque na Mostra por sua trajetória, linguagem ou forma de apresentação. Alguns ficam abertos durante todo o evento; outros acontecem nos blocos programados.';
    const hero=section.querySelector('.specialHero');if(hero){const tag=hero.querySelector('.specialTag');if(tag)tag.textContent='Projeto em destaque';addHighlightSchedule(hero,'Exposição permanente • 10h00–13h00','permanent')}
    const ted=findHighlightTile('TED-Ed Student Talks');if(ted)addHighlightSchedule(ted,'Exposição permanente • 10h00–13h00','permanent');
    const ods=findHighlightTile('Projeto STEAM — Objetivos de Desenvolvimento Sustentável');if(ods)addHighlightSchedule(ods,'Apresentações por blocos','blocks');
    const raras=findHighlightTile('Projeto STEAM — Terras Raras');if(raras)addHighlightSchedule(raras,'Apresentações por blocos','blocks');
    const hum=findHighlightTile('Humanidades e Linguagens');if(hum)addHighlightSchedule(hum,'Apresentações por blocos','blocks');
    const all=[...document.querySelectorAll('.specialTile')].find(el=>norm(el.querySelector('b')?.textContent)==='todos os especiais');if(all){const b=all.querySelector('b');if(b)b.textContent='Todos os destaques';const small=all.querySelector('small');if(small)small.textContent='Veja a seleção completa de projetos em destaque.'}
  }
  const projectScreen=document.querySelector('#projects');
  if(projectScreen){
    const heading=projectScreen.querySelector('.top h1');if(heading)heading.textContent='Projetos em destaque';
    const intro=projectScreen.querySelector('.top p');if(intro)intro.textContent='Percursos e produções que ganham destaque na Mostra Cultural.';
    const tedCard=findProjectCard('TED-Ed');if(tedCard)addProjectTiming(tedCard,'Exposição permanente • 10h00–13h00','permanent');
    const softCard=findProjectCard('Soft Skills Quest');if(softCard)addProjectTiming(softCard,'Exposição permanente • 10h00–13h00','permanent');
    const odsCard=findProjectCard('Projeto STEAM — Objetivos de Desenvolvimento Sustentável');if(odsCard)addProjectTiming(odsCard,'Apresentações por blocos • 10h00–11h30 e 11h30–13h00','blocks');
    const rarasCard=findProjectCard('Projeto STEAM — Terras Raras');if(rarasCard)addProjectTiming(rarasCard,'Apresentações por blocos • 10h00–11h30 e 11h30–13h00','blocks');
    const humCard=findProjectCard('Humanidades e Linguagens');if(humCard)addProjectTiming(humCard,'Apresentações por blocos','blocks');
  }
}
decorateHighlights();