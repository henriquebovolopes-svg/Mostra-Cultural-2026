const tedVideoCss=document.createElement('link');
tedVideoCss.rel='stylesheet';
tedVideoCss.href='ted-video-v1.css?v=61';
document.head.appendChild(tedVideoCss);

const TED_CHANNEL_URL='https://www.youtube.com/@TEDEdStudentTalksCol%C3%A9gioStagio';

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


/* TED-Ed: vinculação segura por URL individual presente na descrição pública.
   Não tenta inferir vídeos pelo nome, título, canal ou ordem de publicação. */
function tedYouTubeFromText(value) {
  const matches=String(value||'').match(/(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)\/[^\s<>"']+/gi)||[];
  for (const raw of matches) {
    try {
      const cleaned=raw.replace(/&amp;/gi,'&').replace(/[),.;]+$/g,'');
      const url=new URL(/^https?:\/\//i.test(cleaned)?cleaned:'https://'+cleaned);
      const host=url.hostname.toLowerCase().replace(/^(www\.|m\.)/,'');
      let id='';
      if (host==='youtu.be') id=url.pathname.split('/').filter(Boolean)[0]||'';
      else if (host==='youtube.com'||host==='youtube-nocookie.com') {
        id=url.searchParams.get('v')||'';
        if(!id) {
          const p=url.pathname.split('/').filter(Boolean);
          if(['embed','shorts','live','v'].includes(p[0])) id=p[1]||'';
        }
      }
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return {id:id,url:'https://www.youtube.com/watch?v='+id};
    } catch(e) { /* ignorar URL inválida */ }
  }
  return null;
}
function tedYouTubeForRow(r) {
  if (!r || !isTedPresentation(r)) return null;
  return tedYouTubeFromText([r.videoUrl,r.videoLink,r.descTrabalho,r.descEixo,r.titulo].filter(Boolean).join(' '));
}
function tedPlayerArea(video, studentName) {
  const area=document.createElement('section');
  area.className='tedVideoArea';
  const title=studentName ? 'Apresentação de '+studentName : 'Vídeo da apresentação';
  area.innerHTML=`<div class="tedVideoFrame"><iframe class="tedVideoIframe" src="https://www.youtube-nocookie.com/embed/${video.id}?rel=0" title="${esc(title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><div class="tedVideoInfo"><div class="ey">TED-Ed Student Talks</div><h3>Assista à apresentação</h3><p>Talk produzida pelo estudante no projeto TED-Ed Student Talks.</p><a class="tedWatchLink" href="${esc(video.url)}" target="_blank" rel="noopener noreferrer">Abrir no YouTube ↗</a></div>`;
  return area;
}
const tedOriginalOpenStudent=openStudent;
openStudent=function(encoded,push=true) {
  tedOriginalOpenStudent(encoded,push);
  const name=decodeURIComponent(encoded);
  const s=students.find(item=>norm(item.name)===norm(name));
  if (!s) return;
  const tedRows=s.works.filter(isTedPresentation);
  if (!tedRows.length) return;
  const video=tedRows.map(tedYouTubeForRow).find(Boolean);
  const section=video?tedPlayerArea(video,s.name):tedVideoPlaceholder();
  const profile=document.getElementById('profileBody');
  const hero=profile?.querySelector('.profileHero');
  if (hero) hero.insertAdjacentElement('afterend',section);
  else profile?.appendChild(section);
};
const tedOriginalOpenWorkWithPlaceholder=openWork;
openWork=function(encoded) {
  tedOriginalOpenWorkWithPlaceholder(encoded);
  const project=findProject(decodeURIComponent(encoded));
  if (!project || !isTedPresentation(project.ref)) return;
  // Cada vídeo precisa corresponder a um trabalho individual, não a grupo agregado.
  if (project.members.length!==1) return;
  const member=students.find(s=>norm(s.name)===norm(project.members[0]));
  const record=member?.works.find(r=>workKey(r)===project.key);
  const video=tedYouTubeForRow(record);
  if (!video) return;
  const body=document.getElementById('workBody');
  const placeholder=body?.querySelector('.tedVideoArea');
  if(placeholder) placeholder.replaceWith(tedPlayerArea(video,project.members[0]));
};
