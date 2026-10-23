// Programação em abas por tipo de horário
const scheduleTabsStyle=document.createElement('style');
scheduleTabsStyle.textContent=`
.scheduleTabsWrap{margin:0 0 16px}
.scheduleTabsIntro{margin:0 0 11px;color:var(--muted);font-size:12.5px;line-height:1.45}
.scheduleTabs{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:5px;background:#eef3f5;border:1px solid #dfe7ec;border-radius:16px}
.scheduleTab{min-width:0;border:0;background:transparent;color:#557080;border-radius:12px;padding:10px 6px 9px;text-align:center;font:inherit;cursor:pointer;transition:background .16s ease,color .16s ease,box-shadow .16s ease}
.scheduleTab strong{display:block;font-size:11.5px;line-height:1.15;font-weight:900}
.scheduleTab small{display:block;margin-top:4px;font-size:9.5px;line-height:1.2;font-weight:750;opacity:.82}
.scheduleTab.on{background:#fff;color:var(--blue);box-shadow:0 4px 14px rgba(0,60,105,.11)}
.scheduleTab.on[data-tab="permanent"]{color:#24724c}
.schedulePane{display:none!important}
.schedulePane.on{display:block!important;animation:schedulePaneIn .18s ease both}
@keyframes schedulePaneIn{from{opacity:.35;transform:translateY(4px)}to{opacity:1;transform:none}}
#schedule #permanent.schedulePane{margin-bottom:0}
#schedule .scheduleBlock.schedulePane{margin-top:0}
.scheduleTabSummary{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 12px;padding:11px 13px;border-radius:14px;background:#f7fafb;border:1px solid #e2eaee}
.scheduleTabSummary b{color:var(--blue);font-size:13px}
.scheduleTabSummary span{color:var(--muted);font-size:11.5px;text-align:right}
@media(max-width:390px){.scheduleTabs{gap:5px}.scheduleTab{padding:9px 3px 8px}.scheduleTab strong{font-size:10.5px}.scheduleTab small{font-size:8.8px}}
`;
document.head.appendChild(scheduleTabsStyle);

let activeScheduleTab='b1';

function scheduleTabMeta(tab){
  if(tab==='b1')return{title:'Bloco 1',time:'10h00–11h30'};
  if(tab==='b2')return{title:'Bloco 2',time:'11h30–13h00'};
  return{title:'Exposições permanentes',time:'10h00–13h00'};
}

function ensureScheduleTabs(){
  const sec=document.querySelector('#schedule .sec');
  if(!sec)return;
  const topText=document.querySelector('#schedule .top p');
  if(topText)topText.textContent='Escolha o tipo de programação e veja as atividades de cada horário.';
  let wrap=document.getElementById('scheduleTabsWrap');
  if(!wrap){
    wrap=document.createElement('div');
    wrap.id='scheduleTabsWrap';
    wrap.className='scheduleTabsWrap';
    wrap.innerHTML=`<p class="scheduleTabsIntro">A programação está organizada por modalidade e horário.</p><div class="scheduleTabs" role="tablist" aria-label="Tipo de programação"><button class="scheduleTab" data-tab="b1" role="tab" onclick="setScheduleTab('b1')"><strong>Bloco 1</strong><small>10h00–11h30</small></button><button class="scheduleTab" data-tab="b2" role="tab" onclick="setScheduleTab('b2')"><strong>Bloco 2</strong><small>11h30–13h00</small></button><button class="scheduleTab" data-tab="permanent" role="tab" onclick="setScheduleTab('permanent')"><strong>Exposições permanentes</strong><small>10h00–13h00</small></button></div><div id="scheduleTabSummary" class="scheduleTabSummary"></div>`;
    const permanent=document.getElementById('permanent');
    sec.insertBefore(wrap,permanent||sec.firstChild);
  }
  ['permanent','b1','b2'].forEach(id=>document.getElementById(id)?.classList.add('schedulePane'));
}

function setScheduleTab(tab){
  if(!['permanent','b1','b2'].includes(tab))tab='b1';
  activeScheduleTab=tab;
  ensureScheduleTabs();
  ['permanent','b1','b2'].forEach(id=>{
    const pane=document.getElementById(id),on=id===tab;
    if(pane){pane.classList.toggle('on',on);pane.setAttribute('aria-hidden',on?'false':'true')}
  });
  document.querySelectorAll('.scheduleTab').forEach(btn=>{
    const on=btn.dataset.tab===tab;
    btn.classList.toggle('on',on);
    btn.setAttribute('aria-selected',on?'true':'false');
  });
  const meta=scheduleTabMeta(tab),summary=document.getElementById('scheduleTabSummary');
  if(summary)summary.innerHTML=`<b>${meta.title}</b><span>${meta.time}</span>`;
}

const renderScheduleWithTabs=renderSchedule;
renderSchedule=function(){
  renderScheduleWithTabs();
  ensureScheduleTabs();
  setScheduleTab(activeScheduleTab);
};

// Caso a base já tenha carregado antes deste módulo.
if(Array.isArray(rows)&&rows.length){renderSchedule()}
else{ensureScheduleTabs();setScheduleTab(activeScheduleTab)}
