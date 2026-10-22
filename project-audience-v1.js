// Project audience labels for Explore cards
const audienceStyle=document.createElement('style');audienceStyle.textContent=`
.projectAudience{color:var(--green);font-weight:850}
.map.fairMap{margin:18px 0 20px;padding:0;border:1px solid var(--line);border-radius:22px;background:#fff;overflow:hidden;box-shadow:0 8px 24px rgba(0,60,105,.07)}
.fairMapHead{padding:18px 18px 10px}.fairMapHead .ey{margin-bottom:4px}.fairMapHead h2{margin:0 0 5px;color:var(--blue);font-size:20px}.fairMapHead p{margin:0;color:var(--muted);font-size:12.5px;line-height:1.45}
.fairMapTabs{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:4px 14px 12px}.fairMapTab{border:1px solid #cfdde4;background:#f6f9fa;color:var(--blue);border-radius:12px;padding:10px 6px;font-weight:850;font-size:12px}.fairMapTab.on{background:var(--blue);border-color:var(--blue);color:#fff;box-shadow:0 5px 13px rgba(0,60,105,.15)}
.fairMapCanvas{position:relative;display:block;width:100%;padding:0;border:0;border-top:1px solid #e5ecef;border-bottom:1px solid #e5ecef;background:linear-gradient(180deg,#f9fbfc,#f3f7f9);cursor:zoom-in}.fairMapCanvas img{display:block;width:100%;height:auto;max-height:600px;object-fit:contain;margin:auto}.fairMapZoom{position:absolute;right:12px;bottom:12px;background:rgba(0,60,105,.9);color:#fff;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:850;box-shadow:0 4px 12px rgba(0,0,0,.16)}
.fairMapFoot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px 15px}.fairMapCaption{color:var(--muted);font-size:11.5px;line-height:1.4}.fairMapEnlarge{flex:none;border:0;background:#e7f3ea;color:#24724c;border-radius:10px;padding:8px 10px;font-size:11px;font-weight:850}
.fairMapModal{position:fixed;inset:0;z-index:2000;background:rgba(7,24,38,.93);display:none;align-items:center;justify-content:center;padding:18px}.fairMapModal.on{display:flex}.fairMapModalInner{position:relative;width:min(960px,100%);max-height:94vh;display:flex;flex-direction:column;align-items:center}.fairMapModal img{display:block;max-width:100%;max-height:86vh;width:auto;height:auto;border-radius:16px;background:#fff;box-shadow:0 18px 60px rgba(0,0,0,.35)}.fairMapClose{position:absolute;right:8px;top:8px;z-index:2;border:0;width:42px;height:42px;border-radius:50%;background:rgba(0,0,0,.7);color:#fff;font-size:24px;line-height:1}.fairMapModalLabel{margin-top:10px;color:#fff;font-size:13px;font-weight:850}
@media(min-width:640px){.map.fairMap{margin-left:auto;margin-right:auto;max-width:680px}.fairMapHead{padding:22px 22px 12px}.fairMapTabs{padding-left:18px;padding-right:18px}.fairMapCanvas img{max-height:720px}}
`;document.head.appendChild(audienceStyle);

const PROJECT_AUDIENCE_MAP={
  'objetivos de desenvolvimento sustentavel':'6º ao 8º ano',
  'terras raras':'9º ano',
  'soft skills quest':'2º ano do Ensino Médio',
  'ted-ed student talks':'1º ano do Ensino Médio',
  'hard skills':'Ensino Médio',
  'arquitetura da distincao':'Ensino Médio • Itinerário',
  'a ciencia da felicidade':'Ensino Médio • Itinerário'
};
function projectAudience(name){return PROJECT_AUDIENCE_MAP[norm(name)]||''}
renderExplore=function(){
  const list=classData();
  $('classList').innerHTML=list.length?list.map(c=>{
    const audience=projectAudience(c.turma);
    return `<div class="classCard"><button class="classBtn" onclick="openClass('${arg(c.turma)}')"><div class="className">${esc(c.turma)}</div><div class="classMeta"><span>👤 ${c.students} alunos</span><span>📚 ${c.projects} trabalhos</span>${audience?`<span class="projectAudience">🎓 ${esc(audience)}</span>`:''}</div></button></div>`;
  }).join(''):'<div class="empty">Turmas ainda não disponíveis.</div>';
};

const FAIR_MAPS={
  1:{label:'1º Andar',src:'assets/maps/mapa-1-andar.webp?v=35',rooms:'Salas 12, 14, 15 e 16 • Maker • Coordenação • Laboratório de Química',alt:'Mapa do 1º andar da Mostra Cultural com Salas 12, 14, 15 e 16, Maker, Coordenação e Laboratório de Química'},
  2:{label:'2º Andar',src:'assets/maps/mapa-2-andar.webp?v=35',rooms:'Salas 21, 22, 23, 24, 25 e 27',alt:'Mapa do 2º andar da Mostra Cultural com Salas 21, 22, 23, 24, 25 e 27'},
  3:{label:'3º Andar',src:'assets/maps/mapa-3-andar.webp?v=35',rooms:'Salas 31, 32, 33, 34, 35 e 37 • Coordenação • Banheiro',alt:'Mapa do 3º andar da Mostra Cultural com Salas 31, 32, 33, 34, 35 e 37, Coordenação e Banheiro'}
};
let fairMapFloor=1;
function selectFairMapFloor(floor){
  floor=Number(floor)||1;fairMapFloor=floor;
  const m=FAIR_MAPS[floor]||FAIR_MAPS[1],img=document.getElementById('fairMapImage'),caption=document.getElementById('fairMapCaption'),canvas=document.getElementById('fairMapCanvas');
  if(img){img.src=m.src;img.alt=m.alt}
  if(caption)caption.innerHTML=`<strong>${m.label}</strong><br>${m.rooms}`;
  if(canvas)canvas.setAttribute('aria-label',`Ampliar mapa do ${m.label}`);
  document.querySelectorAll('.fairMapTab').forEach(btn=>{const on=Number(btn.dataset.floor)===floor;btn.classList.toggle('on',on);btn.setAttribute('aria-pressed',on?'true':'false')});
}
function openFairMap(){
  const m=FAIR_MAPS[fairMapFloor]||FAIR_MAPS[1],modal=document.getElementById('fairMapModal'),img=document.getElementById('fairMapModalImage'),label=document.getElementById('fairMapModalLabel');
  if(!modal||!img)return;img.src=m.src;img.alt=m.alt;if(label)label.textContent=m.label;modal.classList.add('on');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
}
function closeFairMap(){const modal=document.getElementById('fairMapModal');if(!modal)return;modal.classList.remove('on');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}
function buildFairMap(){
  const host=document.querySelector('#rooms .map');if(!host||document.getElementById('fairMapImage'))return;
  host.className='map fairMap';
  host.innerHTML=`<div class="fairMapHead"><div class="ey">Mapa da feira</div><h2>Encontre sua sala</h2><p>Selecione o andar e consulte a planta. Toque no mapa para ampliar.</p></div><div class="fairMapTabs" role="group" aria-label="Selecionar andar"><button type="button" class="fairMapTab" data-floor="1" onclick="selectFairMapFloor(1)">1º Andar</button><button type="button" class="fairMapTab" data-floor="2" onclick="selectFairMapFloor(2)">2º Andar</button><button type="button" class="fairMapTab" data-floor="3" onclick="selectFairMapFloor(3)">3º Andar</button></div><button id="fairMapCanvas" type="button" class="fairMapCanvas" onclick="openFairMap()"><img id="fairMapImage" src="" alt=""><span class="fairMapZoom">⛶ Ampliar</span></button><div class="fairMapFoot"><div id="fairMapCaption" class="fairMapCaption"></div><button type="button" class="fairMapEnlarge" onclick="openFairMap()">Ver maior</button></div>`;
  if(!document.getElementById('fairMapModal')){
    const modal=document.createElement('div');modal.id='fairMapModal';modal.className='fairMapModal';modal.setAttribute('aria-hidden','true');modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Mapa ampliado da Mostra');modal.innerHTML=`<div class="fairMapModalInner"><button type="button" class="fairMapClose" onclick="closeFairMap()" aria-label="Fechar mapa ampliado">×</button><img id="fairMapModalImage" src="" alt=""><div id="fairMapModalLabel" class="fairMapModalLabel"></div></div>`;modal.addEventListener('click',e=>{if(e.target===modal)closeFairMap()});document.body.appendChild(modal);
  }
  selectFairMapFloor(1);
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeFairMap()});
buildFairMap();
