// Project audience labels for Explore cards
const audienceStyle=document.createElement('style');audienceStyle.textContent='.projectAudience{color:var(--green);font-weight:850}';document.head.appendChild(audienceStyle);
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
