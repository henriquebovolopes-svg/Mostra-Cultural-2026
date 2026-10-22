const tedVideoCss=document.createElement('link');
tedVideoCss.rel='stylesheet';
tedVideoCss.href='ted-video-v1.css?v=25';
document.head.appendChild(tedVideoCss);

function isTedPresentation(r){
  return norm(r?.turma)==='ted-ed student talks'||norm(r?.expo)==='ted-ed student talks';
}

function tedVideoPlaceholder(){
  const area=document.createElement('section');
  area.className='tedVideoArea';
  area.innerHTML=`<div class="tedVideoFrame" aria-label="Vídeo da apresentação em breve"><div class="tedVideoPlay" aria-hidden="true">▶</div></div><div class="tedVideoInfo"><div class="ey">TED-Ed Student Talks</div><h3>Vídeo da apresentação</h3><p>O vídeo desta apresentação será disponibilizado aqui diretamente do canal oficial no YouTube.</p><span class="tedVideoSoon">Em breve</span></div>`;
  return area;
}

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
