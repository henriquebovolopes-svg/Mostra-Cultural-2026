/* Mostra Cultural 2026 — sessões do Ensino Médio
   Origem única: aba SESSÕES EM da planilha matriz oficial. */
(function () {
  'use strict';

  var sessionRows = [];
  var specialGroups = new Set(['Grupo 2','Grupo 4','Grupo 5','Grupo 6','Grupo 7','Grupo 10']);
  var sheetError = false;

  function isSpecialWork(r) {
    return !!r && norm(r.turma) === norm('Arquitetura da Distinção') && specialGroups.has(r.grupo);
  }
  function sessionTime(s) {
    return s.start + (s.end ? '–' + s.end : ' (término a confirmar)');
  }
  function sessionProject(s) {
    return groupProjects().find(function (p) {
      return isSpecialWork(p.ref) && norm(p.ref.grupo) === norm(s.group);
    });
  }
  function projectSessions(group) {
    return sessionRows.filter(function (s) { return norm(s.group) === norm(group); });
  }
  function sessionLink(s) {
    if (!/^https:\/\/\S+$/i.test(s.link || '')) return '';
    return '<a class="emFileLink" href="' + esc(s.link) + '" target="_blank" rel="noopener noreferrer">Consultar material digital ↗</a>';
  }
  function sessionCard(s, compact) {
    var label = sessionTime(s);
    var status = s.status && s.status !== 'Confirmado' ? '<span class="emStatus">' + esc(s.status) + '</span>' : '';
    var title = '<strong>' + esc(s.title) + '</strong>';
    var found = sessionProject(s);
    var titleBlock = found
      ? '<button type="button" class="emWorkLink" onclick="openSessionWork(\'' + arg(s.group) + '\')">' + title + ' <span>Ver trabalho ›</span></button>'
      : '<div class="emWorkLink">' + title + '</div>';
    return '<article class="emSession' + (compact ? ' compact' : '') + '">' +
      '<div class="emTime">' + esc(label) + '</div>' +
      '<div class="emSessionBody">' + titleBlock +
      '<div class="emMeta">' + esc(s.location) + ' · ' + esc(s.group) + ' · ' + esc(s.kind) + '</div>' +
      (compact ? '' : '<p>' + esc(s.description) + '</p>') +
      (s.presenters ? '<div class="emPresenters"><b>Apresentação:</b> ' + esc(s.presenters.replace(/; /g, ', ')) + '</div>' : '') +
      status + sessionLink(s) +
      '</div></article>';
  }

  window.openSessionWork = function (encodedGroup) {
    var group = decodeURIComponent(encodedGroup);
    var project = groupProjects().find(function (p) { return isSpecialWork(p.ref) && norm(p.ref.grupo) === norm(group); });
    if (project) openWork(arg(project.key));
  };

  var oldPermanent = isPermanent;
  isPermanent = function (r) { return !isSpecialWork(r) && oldPermanent(r); };

  var oldEnsureTabs = ensureScheduleTabs;
  ensureScheduleTabs = function () {
    oldEnsureTabs();
    var nav = document.querySelector('#schedule .scheduleTabs');
    if (nav && !nav.querySelector('[data-tab="sessions"]')) {
      var button = document.createElement('button');
      button.className = 'scheduleTab';
      button.type = 'button';
      button.dataset.tab = 'sessions';
      button.setAttribute('role', 'tab');
      button.innerHTML = '<strong>Sessões do EM</strong><small>Horários específicos</small>';
      button.addEventListener('click', function () { setScheduleTab('sessions'); });
      nav.appendChild(button);
    }
    var sec = document.querySelector('#schedule .sec');
    if (sec && !document.getElementById('emSessionsPane')) {
      var pane = document.createElement('div');
      pane.id = 'emSessionsPane';
      pane.className = 'schedulePane';
      pane.setAttribute('aria-hidden','true');
      var first = document.getElementById('permanent');
      sec.insertBefore(pane, first || null);
    }
  };

  var oldSelectTab = setScheduleTab;
  setScheduleTab = function (tab) {
    if (tab !== 'sessions') {
      oldSelectTab(tab);
      var sp = document.getElementById('emSessionsPane');
      if (sp) { sp.classList.remove('on'); sp.setAttribute('aria-hidden','true'); }
      return;
    }
    oldSelectTab('b1');
    activeScheduleTab = 'sessions';
    ['permanent','b1','b2'].forEach(function (id) {
      var pane = document.getElementById(id);
      if (pane) { pane.classList.remove('on'); pane.setAttribute('aria-hidden','true'); }
    });
    var special = document.getElementById('emSessionsPane');
    if (special) { special.classList.add('on'); special.setAttribute('aria-hidden','false'); }
    document.querySelectorAll('#schedule .scheduleTab').forEach(function (btn) {
      var current = btn.dataset.tab === 'sessions';
      btn.classList.toggle('on',current);
      btn.setAttribute('aria-selected',current ? 'true' : 'false');
    });
    var summary = document.getElementById('scheduleTabSummary');
    if (summary) summary.innerHTML = '<b>Sessões do Ensino Médio</b><span>14/11 · 10h às 13h</span>';
    renderEmSessions();
  };

  function renderEmSessions() {
    var host = document.getElementById('emSessionsPane');
    if (!host) return;
    if (!sessionRows.length) {
      host.innerHTML = '<div class="empty">' + (sheetError ? 'Sessões indisponíveis neste momento. Consulte a planilha oficial.' : 'Carregando sessões do Ensino Médio…') + '</div>';
      return;
    }
    var all = sessionRows.slice().sort(function (a,b) { return a.start.localeCompare(b.start,'pt-BR') || a.title.localeCompare(b.title,'pt-BR'); });
    var html = '<div class="emIntro"><h2>Apresentações com horários marcados</h2><p>Documentários, debates, revista, exposição e demonstrações do projeto Arquitetura da Distinção. Nos intervalos, as equipes podem visitar outros trabalhos. Horários propostos e durações pendentes estão sinalizados.</p></div>';
    html += all.map(function (s) { return sessionCard(s,false); }).join('');
    host.innerHTML = html;
  }

  var oldRenderSchedule = renderSchedule;
  renderSchedule = function () {
    oldRenderSchedule();
    ensureScheduleTabs();
    renderEmSessions();
    if (activeScheduleTab === 'sessions') setScheduleTab('sessions');
  };

  var oldOpenWork = openWork;
  openWork = function (encoded) {
    oldOpenWork(encoded);
    var group = groupProjects().find(function (p) { return p.key === decodeURIComponent(encoded); });
    if (!group || !isSpecialWork(group.ref)) return;
    var relevant = projectSessions(group.ref.grupo);
    if (!relevant.length) return;
    var host = document.getElementById('workBody');
    if (!host) return;
    var section = document.createElement('section');
    section.className = 'emWorkSchedule';
    section.innerHTML = '<h2>Horários de apresentação</h2><p>As apresentações acontecem em sessões específicas. Consulte os participantes escalados e o horário de cada uma.</p>' +
      relevant.map(function (s) { return sessionCard(s,true); }).join('') +
      (group.ref.grupo === 'Grupo 2' || group.ref.grupo === 'Grupo 4'
        ? '<div class="emFilePending">Espaço para consulta da produção digital: o link será disponibilizado quando o material for enviado.</div>'
        : '');
    var members = host.querySelector('.members');
    if (members) host.insertBefore(section,members);
    else host.appendChild(section);
  };

  var oldOpenStudent = openStudent;
  openStudent = function (encoded,push) {
    oldOpenStudent(encoded,push);
    var name = decodeURIComponent(encoded);
    var st = students.find(function (s) { return norm(s.name) === norm(name); });
    if (!st) return;
    var mine = sessionRows.filter(function (s) {
      return st.works.some(function (w) { return isSpecialWork(w) && norm(w.grupo) === norm(s.group); }) &&
        s.presenters.split(/;\s*/).some(function (x) { return norm(x) === norm(name); });
    });
    if (!mine.length) return;
    var profile = document.getElementById('profileBody');
    if (!profile) return;
    var panel = document.createElement('section');
    panel.className = 'emStudentSchedule';
    panel.innerHTML = '<h2>Suas sessões de apresentação</h2>' +
      mine.map(function (s) { return '<div class="emStudentSlot"><b>' + esc(sessionTime(s)) + '</b><span>' + esc(s.title) + ' · ' + esc(s.location) + '</span></div>'; }).join('');
    profile.appendChild(panel);
  };

  window.emRoomDecorator = function (loc) {
    var relevant = sessionRows.filter(function (s) {
      var room = s.location.replace(/^Sala\s+/i,'');
      return norm(room) === norm(loc) || norm(s.location) === norm(loc);
    });
    var host = document.getElementById('roomProgramPanel');
    if (!host || !relevant.length || host.querySelector('.emRoomSchedule')) return;
    var other = host.querySelector('.roomTimeSection:last-of-type');
    if (other && other.textContent.includes('Programação em atualização')) {
      var heading = other.querySelector('.roomTimeHead .lbl');
      if (heading) heading.textContent = 'Trabalhos com sessões marcadas';
    }
    var section = document.createElement('section');
    section.className = 'emRoomSchedule';
    section.innerHTML = '<h2>Sessões com horários específicos</h2>' + relevant.map(function (s) { return sessionCard(s,true); }).join('');
    host.appendChild(section);
  };

  var oldOpenRoom = openRoom;
  openRoom = function (encoded,push) {
    oldOpenRoom(encoded,push);
    window.emRoomDecorator(decodeURIComponent(encoded));
  };

  window.mostraSessionsCB = function (data) {
    try {
      if (!data || !data.table || !Array.isArray(data.table.rows)) throw new Error('Resposta sem dados');
      sessionRows = data.table.rows.map(function (row) {
        var c = row.c || [];
        var v = function (i) { return c[i] && c[i].v != null ? String(c[i].v) : ''; };
        return { project:v(0),group:v(1),title:v(2),location:v(3),start:v(4),end:v(5),kind:v(6),
          presenters:v(7),description:v(8),resources:v(9),link:v(10),notes:v(11),status:v(12) };
      }).filter(function (s) { return s.group && s.start; });
      sheetError = false;
      renderEmSessions();
    } catch (err) {
      console.error('Erro ao ler sessões da Mostra:',err);
      sheetError = true;
      renderEmSessions();
    }
  };

  var baseCallback = window.mostraCB;
  window.mostraCB = function (data) { baseCallback(data); renderEmSessions(); };

  function loadEmSessions() {
    var s = document.createElement('script');
    s.src = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID +
      '/gviz/tq?sheet=' + encodeURIComponent('SESSÕES EM') +
      '&tqx=responseHandler:mostraSessionsCB&headers=1&tq=' +
      encodeURIComponent('select A,B,C,D,E,F,G,H,I,J,K,L,M') + '&_=' + Date.now();
    s.onerror = function () { sheetError = true; renderEmSessions(); };
    document.body.appendChild(s);
  }

  var css = document.createElement('style');
  css.textContent =
    '#schedule .scheduleTabs{grid-template-columns:repeat(2,minmax(0,1fr))}' +
    '#emSessionsPane .emIntro{margin:5px 0 15px}' +
    '.emIntro h2,.emWorkSchedule h2,.emStudentSchedule h2,.emRoomSchedule h2{font-size:20px;color:var(--blue);margin:0 0 7px}' +
    '.emIntro p,.emWorkSchedule>p{color:var(--muted);font-size:12.5px;line-height:1.55;margin:0 0 12px}' +
    '.emSession{display:flex;gap:13px;padding:14px 12px;background:#fff;border:1px solid var(--line);border-radius:14px;margin:8px 0;align-items:flex-start}' +
    '.emSession.compact{padding:11px 10px;gap:10px}' +
    '.emTime{color:var(--blue);font-size:12px;font-weight:900;min-width:105px;max-width:105px;line-height:1.35}' +
    '.emSessionBody{min-width:0;flex:1}' +
    '.emWorkLink{border:0;padding:0;background:none;text-align:left;color:var(--blue);font:inherit;cursor:pointer;width:100%}' +
    '.emWorkLink strong{font-size:13.5px;line-height:1.3}' +
    '.emWorkLink span{font-size:10px;white-space:nowrap;color:#24724c}' +
    '.emMeta,.emPresenters{font-size:11.5px;color:var(--muted);line-height:1.45;margin-top:5px}' +
    '.emSessionBody p{font-size:12px;color:var(--text);line-height:1.5;margin:9px 0 5px}' +
    '.emStatus{display:inline-block;margin-top:6px;font-size:10px;color:#79531e;background:#fcf3e0;border-radius:8px;padding:4px 7px}' +
    '.emFileLink{display:inline-block;margin-top:8px;color:var(--blue);font-size:11.5px;font-weight:850}' +
    '.emWorkSchedule,.emStudentSchedule,.emRoomSchedule{margin:18px 0;padding:15px;border-radius:16px;border:1px solid var(--line);background:#f7fafb}' +
    '.emFilePending{font-size:11.5px;margin-top:12px;padding:10px 12px;background:#fff;border:1px dashed #b7cbd6;border-radius:10px;color:var(--muted)}' +
    '.emStudentSlot{display:flex;gap:10px;font-size:11.5px;padding:8px 0;border-bottom:1px solid var(--line)}' +
    '.emStudentSlot b{min-width:96px;color:var(--blue)}.emStudentSlot span{color:var(--muted)}' +
    '@media(max-width:430px){.emSession{gap:8px;padding:11px 9px}.emTime{min-width:83px;max-width:83px;font-size:11px}.emWorkLink strong{font-size:12.5px}}' +
    '@media(min-width:750px){#schedule .scheduleTabs{grid-template-columns:repeat(4,1fr)}}';
  document.head.appendChild(css);

  ensureScheduleTabs();
  setScheduleTab('sessions');
  loadEmSessions();
})();
