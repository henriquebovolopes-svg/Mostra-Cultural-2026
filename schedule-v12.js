const BLOCK_1='10h00–11h30';
const BLOCK_2='11h30–13h00';
const featuredCss=document.createElement('link');featuredCss.rel='stylesheet';featuredCss.href='featured-carousel-v1.css?v=26';document.head.appendChild(featuredCss);
const brandLogo=document.querySelector('.brandLogo');
if(brandLogo){brandLogo.src='logo-stagio.svg?v=26';brandLogo.style.background='transparent';brandLogo.style.border='0';brandLogo.style.boxShadow='none';brandLogo.style.objectFit='contain';brandLogo.style.filter='drop-shadow(0 3px 8px rgba(255,255,255,.28)) drop-shadow(0 7px 15px rgba(0,60,105,.12))';}
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

function cleanProjectLanguage(){
  const first=document.querySelector('#fClass option');if(first)first.textContent='Todos os projetos';
  const explore=document.querySelector('#explore');
  if(explore){const p=explore.querySelector('.top p'),ey=explore.querySelector('.sec .ey');if(p)p.textContent='Escolha um projeto e veja seus trabalhos.';if(ey)ey.textContent='Projetos';}
  const detail=document.querySelector('#classdetail .top p');if(detail)detail.textContent='Trabalhos e grupos vinculados ao projeto.';
}

const FEATURED_PROJECTS=[
  {name:'Soft Skills Quest',icon:'🎮',description:'Projeto desenvolvido na disciplina Comunicação Assertiva e Trabalho em Equipe, com uma jornada gamificada de comunicação, colaboração, liderança, criatividade, tomada de decisão e pensamento crítico.',timing:'Exposição permanente • 10h00–13h00',kind:'permanent'},
  {name:'TED-Ed Student Talks',icon:'🎤',description:'Projeto desenvolvido na disciplina Comunicação Efetiva, em que ideias autorais ganham forma por meio de pesquisa, escrita, narrativa, oralidade e apresentação pública.',timing:'Exposição permanente • 10h00–13h00',kind:'permanent'},
  {name:'Objetivos de Desenvolvimento Sustentável',icon:'🌎',description:'Investigação dos Objetivos de Desenvolvimento Sustentável por meio de uma abordagem STEAM, articulando Ciência, Tecnologia, Engenharia, Artes e Matemática.',timing:'Apresentações por blocos',kind:'blocks'},
  {name:'Terras Raras',icon:'⚛️',description:'Investigação sobre extração, aplicações tecnológicas, impactos e sustentabilidade das terras raras por meio de uma abordagem STEAM.',timing:'Apresentações por blocos',kind:'blocks'},
  {name:'Arquitetura da Distinção',icon:'🏛️',description:'Projeto do itinerário de Humanidades e Linguagens que investiga como gostos, hábitos, cultura e linguagem constroem identidades, pertencimentos e diferenças sociais.',timing:'Apresentações por blocos',kind:'blocks'},
  {name:'A Ciência da Felicidade',icon:'😊',description:'Projeto do itinerário de Ciências da Natureza e Matemática que investiga felicidade e bem-estar em experiências aplicadas de leitura, lazer, convivência e estímulos sensoriais.',timing:'Apresentações por blocos',kind:'blocks'}
];
let featuredIndex=0,featuredTimer=null;
function featuredProjectExists(name){return rows.some(r=>norm(r.turma)===norm(name))}
function availableFeaturedProjects(){const live=FEATURED_PROJECTS.filter(p=>featuredProjectExists(p.name));return live.length?live:FEATURED_PROJECTS}
function renderFeaturedProject(index=featuredIndex){
  const list=availableFeaturedProjects();if(!list.length)return;
  featuredIndex=((index%list.length)+list.length)%list.length;
  const p=list[featuredIndex],card=document.getElementById('featuredProjectCard');if(!card)return;
  card.classList.add('changing');
  setTimeout(()=>{
    card.dataset.kind=p.kind;
    card.innerHTML=`<div class="featuredProjectCopy"><span class="featuredTag">Projeto em destaque</span><div class="featuredIcon" aria-hidden="true">${p.icon}</div><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><span class="featuredTiming ${p.kind}">${esc(p.timing)}</span><button class="featuredOpen" onclick="openClass('${arg(p.name)}')">Explorar projeto →</button></div>`;
    const dots=document.getElementById('featuredDots');if(dots)dots.innerHTML=list.map((item,i)=>`<button aria-label="Ver ${esc(item.name)}" class="featuredDot${i===featuredIndex?' on':''}" onclick="setFeaturedProject(${i})"></button>`).join('');
    const counter=document.getElementById('featuredCounter');if(counter)counter.textContent=`${featuredIndex+1} de ${list.length}`;
    card.classList.remove('changing');
  },120);
}
function setFeaturedProject(index){renderFeaturedProject(index);restartFeaturedTimer()}
function nextFeaturedProject(){renderFeaturedProject(featuredIndex+1)}
function prevFeaturedProject(){renderFeaturedProject(featuredIndex-1);restartFeaturedTimer()}
function restartFeaturedTimer(){if(featuredTimer)clearInterval(featuredTimer);featuredTimer=setInterval(nextFeaturedProject,30000)}
function buildFeaturedCarousel(){
  const section=document.querySelector('.specialSpotlight');if(!section)return;
  section.innerHTML=`<div class="specialHead"><div><div class="ey">Experiências em destaque</div><h2>Projetos</h2></div></div><p class="specialLead">Conheça alguns dos projetos que compõem a Mostra. O destaque muda automaticamente a cada 30 segundos.</p><div class="featuredCarousel" aria-live="polite"><div id="featuredProjectCard" class="featuredProjectCard"></div><div class="featuredControls"><button class="featuredArrow" onclick="prevFeaturedProject()" aria-label="Projeto anterior">←</button><div id="featuredDots" class="featuredDots"></div><span id="featuredCounter" class="featuredCounter"></span><button class="featuredArrow" onclick="setFeaturedProject(featuredIndex+1)" aria-label="Próximo projeto">→</button></div></div><button class="featuredAll" onclick="show('explore')">Veja todos os projetos →</button>`;
  renderFeaturedProject(0);restartFeaturedTimer();
}
cleanProjectLanguage();
buildFeaturedCarousel();

const tedVideoModule=document.createElement('script');
tedVideoModule.src='ted-video-v1.js?v=25';
document.body.appendChild(tedVideoModule);
