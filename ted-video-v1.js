/* TED-Ed Student Talks | Mostra Cultural 2026
   Vídeos confirmados diretamente por quem organizou o projeto.
   Os seis estudantes que não apresentaram não recebem player. */
const tedVideoCss=document.createElement('link');
tedVideoCss.rel='stylesheet';
tedVideoCss.href='ted-video-v1.css?v=62';
document.head.appendChild(tedVideoCss);
const TED_CHANNEL_URL='https://www.youtube.com/@TEDEdStudentTalksCol%C3%A9gioStagio';

const TED_VIDEO_IDS={
  'arthur da costa baglioto':'WLaFqOOb3tY',
  'brenda costa perrucci':'16ii58FrKYE',
  'elizabeth morales pal':'WSamMWGkJBE',
  'elize lopes dos santos':'tIjBtUW9zXA',
  'isabella fernandes da costa':'LYtufrmOW-k',
  'laura cristina soares exposto':'o-ABmd_rAuw',
  'laura oriente mendes':'WJwATXUP9cs',
  'maria beatriz yura santos':'8BMV89oI-KU',
  'rafael illa de manchon cunha':'H0bfvBLMc2Q',
  'tarsilla cormanique freitas':'FTBjNibelRc'
};
const TED_NO_TALK = new Set([
  'ana luisa fernandes pereira',
  'guilherme eduardo leme',
  'jhony stojevic righi filho',
  'julia dos santos',
  'maria eduarda xavier sabariego alves',
  'nicolas toret souza'
]);

function isTedPresentation(r){
  return norm(r?.turma)==='ted-ed student talks'||norm(r?.expo)==='ted-ed student talks';
}
function tedVideoIdFromText(value){
  const urls=String(value||'').match(/(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)\/[^\s<>"']+/gi)||[];
  for (const raw of urls) {
    try {
      const cleaned=raw.replace(/&amp;/gi,'&').replace(/[),.;]+$/g,'');
      const url=new URL(/^https?:\/\//i.test(cleaned)?cleaned:'https://'+cleaned);
      const host=url.hostname.toLowerCase().replace(/^(www\.|m\.)/,'');
      let id='';
      if(host==='youtu.be')id=url.pathname.split('/').filter(Boolean)[0]||'';
      if(host==='youtube.com'||host==='youtube-nocookie.com'){
        id=url.searchParams.get('v')||'';
        if(!id){
          const parts=url.pathname.split('/').filter(Boolean);
          if(['embed','shorts','live','v'].includes(parts[0]))id=parts[1]||'';
        }
      }
      if(/^[A-Za-z0-9_-]{11}$/.test(id))return id;
    } catch(error){ /* URL inválida */ }
  }
  return null;
}
function tedVideoIdForStudent(student){
  if(!student || TED_NO_TALK.has(norm(student.name)))return null;
  const tedRows=student.works.filter(isTedPresentation);
  if(!tedRows.length)return null;
  const manual=TED_VIDEO_IDS[norm(student.name)];
  if(manual)return manual;
  // Para futuros vídeos, a descrição na planilha continua funcionando como fonte.
  for(const r of tedRows){
    const id=tedVideoIdFromText([r.videoUrl,r.videoLink,r.descTrabalho,r.descEixo].filter(Boolean).join(' '));
    if(id)return id;
  }
  return null;
}
function tedPlayer(id,name){
  if(!/^[A-Za-z0-9_-]{11}$/.test(id))return null;
  const area=document.createElement('section');
  area.className='tedVideoArea';
  area.setAttribute('aria-label','Vídeo TED-Ed de '+name);
  const url='https://www.youtube.com/watch?v='+encodeURIComponent(id);
  area.innerHTML=`<div class="tedVideoFrame"><iframe class="tedVideoIframe" src="https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0&playsinline=1" title="Apresentação TED-Ed de ${esc(name)}" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><div class="tedVideoInfo"><div class="ey">TED-Ed Student Talks</div><h3>Assista à apresentação de ${esc(name)}</h3><a class="tedWatchLink" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Abrir vídeo no YouTube ↗</a></div>`;
  return area;
}
function tedChannelLink(){
  const link=document.createElement('a');
  link.className='tedChannelLink';
  link.href=TED_CHANNEL_URL;link.target='_blank';link.rel='noopener noreferrer';
  link.setAttribute('aria-label','Acessar o canal TED-Ed Student Talks no YouTube');
  link.innerHTML='<span class="tedChannelPlay" aria-hidden="true">▶</span><span class="tedChannelCopy"><span class="tedChannelEy">Canal oficial no YouTube</span><strong>TED-Ed Student Talks | Colégio Stagio</strong><small>Assista às apresentações publicadas pelos estudantes.</small></span><span class="tedChannelArrow" aria-hidden="true">↗</span>';
  return link;
}
const tedBaseOpenClass=openClass;
openClass=function(encoded){
  tedBaseOpenClass(encoded);
  if(norm(decodeURIComponent(encoded))!=='ted-ed student talks')return;
  const hero=document.querySelector('#classBody .profileHero');
  if(hero&&!hero.querySelector('.tedChannelLink'))hero.appendChild(tedChannelLink());
};
const tedBaseOpenStudent=openStudent;
openStudent=function(encoded,push=true){
  tedBaseOpenStudent(encoded,push);
  const name=decodeURIComponent(encoded);
  const student=students.find(s=>norm(s.name)===norm(name));
  const id=tedVideoIdForStudent(student);
  if(!id)return; // Nenhum placeholder para estudantes que não apresentaram.
  const profile=document.getElementById('profileBody');
  const video=tedPlayer(id,student.name);
  if(!video||!profile)return;
  const hero=profile.querySelector('.profileHero');
  if(hero)hero.insertAdjacentElement('afterend',video);
  else profile.prepend(video);
};
const tedBaseOpenWork=openWork;
openWork=function(encoded){
  tedBaseOpenWork(encoded);
  const p=findProject(decodeURIComponent(encoded));
  if(!p||!isTedPresentation(p.ref)||p.members.length!==1)return;
  const student=students.find(s=>norm(s.name)===norm(p.members[0]));
  const id=tedVideoIdForStudent(student);
  if(!id)return;
  const area=document.getElementById('workBody'),player=tedPlayer(id,student.name);
  if(!area||!player)return;
  const members=area.querySelector('.card.members');
  if(members)area.insertBefore(player,members);
  else area.appendChild(player);
};
