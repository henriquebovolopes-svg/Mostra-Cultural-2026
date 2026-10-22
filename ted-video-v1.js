const tedVideoCss=document.createElement('link');
tedVideoCss.rel='stylesheet';
tedVideoCss.href='ted-video-v1.css?v=30';
document.head.appendChild(tedVideoCss);

const TED_CHANNEL_URL='https://www.youtube.com/channel/UCL_DflJA5SMCueBaJXql2nA';

function isTedPresentation(r){
  return norm(r?.turma)==='ted-ed student talks'||norm(r?.expo)==='ted-ed student talks';
}

function tedVideoPlaceholder(){
  const area=document.createElement('section');
  area.className='tedVideoArea';
  area.innerHTML=`<div class="tedVideoFrame" aria-label="Vídeo da apresentação em breve"><div class="tedVideoPlay" aria-hidden="true">▶</div></div><div class="tedVideoInfo"><div class="ey">TED-Ed Student Talks</div><h3>Vídeo da apresentação</h3><p>O vídeo desta apresentação será disponibilizado aqui diretamente do canal oficial no YouTube.</p><span class="tedVideoSoon">Em breve</span></div>`;
  return area;
}

function tedChannelLink(){
  const link=document.createElement('a');
  link.className='tedChannelLink';
  link.href=TED_CHANNEL_URL;
  link.target='_blank';
  link.rel='noopener noreferrer';
  link.setAttribute('aria-label','Acessar canal oficial do TED-Ed Student Talks no YouTube');
  link.innerHTML=`<span class="tedChannelPlay" aria-hidden="true">▶</span><span class="tedChannelCopy"><span class="tedChannelEy">Canal oficial no YouTube</span><strong>TEDEd Student Talks | Colégio Stagio</strong><small>Assista às apresentações publicadas pelos estudantes.</small></span><span class="tedChannelArrow" aria-hidden="true">↗</span>`;
  return link;
}

const tedBaseOpenClass=openClass;
openClass=function(encoded){
  tedBaseOpenClass(encoded);
  const projectName=decodeURIComponent(encoded);
  if(norm(projectName)!=='ted-ed student talks')return;
  const hero=document.querySelector('#classBody .profileHero');
  if(!hero||hero.querySelector('.tedChannelLink'))return;
  const channel=tedChannelLink();
  const description=hero.querySelector('.axisIntro');
  if(description)description.insertAdjacentElement('afterend',channel);else hero.appendChild(channel);
};

const tedBaseOpenWork=openWork;
openWork=function(encoded){
  tedBaseOpenWork(encoded);
  const project=findProject(decodeURIComponent(encoded)),r=project?.ref;
  if(!isTedPresentation(r))return;
  const body=document.getElementById('workBody');
  if(!body||body.querySelector('.tedVideoArea'))return;
  const area=tedVideoPlaceholder();
  const members=body.querySelector('.card.members');
  if(members)body.insertBefore(area,members);else body.appendChild(area);
};
