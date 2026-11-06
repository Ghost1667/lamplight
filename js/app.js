/* Lamplight — revision app. Plain JavaScript + Supabase. */
'use strict';
(() => {

/* ---------------------------------------------------------------- setup -- */
const cfg = window.LAMPLIGHT_CONFIG || {};
const configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey &&
  !/YOUR-/.test(cfg.supabaseUrl) && !/YOUR-/.test(cfg.supabaseAnonKey));
// Read any sign-in result Supabase put in the address before the app's own router runs.
const AUTH_HASH = /(^|[#&])(access_token|error|error_code)=/.test(location.hash) ? location.hash : '';
const authError = (() => {
  if (!/error/.test(AUTH_HASH)) return null;
  const p = new URLSearchParams(AUTH_HASH.replace(/^#\/?/, ''));
  const code = p.get('error_code') || p.get('error') || '';
  if (/expired|otp/.test(code)) return 'That link has expired or was already used. Sign in, or request a new link below.';
  return (p.get('error_description') || 'That sign-in link didn\u2019t work.').replace(/\+/g, ' ');
})();
const sb = configured && window.supabase && window.supabase.createClient
  ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      // 'implicit' lets a link sent by email work on a different device from the one that asked for it.
      auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
    })
  : null;
// Where email links should send people: the live site, so they work on any device.
function siteUrl() {
  const u = (cfg.siteUrl || '').trim();
  return u && !/YOUR-/.test(u) ? u : location.origin + location.pathname;
}

const $ = s => document.querySelector(s);
const main = $('#main');
const DAY = 86400000;
const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];          // days before a card in box N comes back
const BANDS = { primary: 'Primary', jss: 'Junior Secondary', sss: 'Senior Secondary' };
const CLASSES = ['Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6','JSS 1','JSS 2','JSS 3','SS 1','SS 2','SS 3'];
const HUES = [['Blue',222],['Green',150],['Orange',26],['Purple',272],['Teal',186],['Red',352],['Gold',44]];
const LETTERS = 'ABCD';
const GUEST = 'lamplight.guest', ACTIVE = 'lamplight.active';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const bandOf = c => c.startsWith('Primary') ? 'primary' : c.startsWith('JSS') ? 'jss' : 'sss';

const S = {
  ready: false, user: null, isAdmin: false, store: 'local',
  lib: 'loading', subjects: [], topics: [], lessons: {},
  learners: {}, learnersLoaded: false, active: null, cards: {}, cardsLoading: false,
  view: 'today', param: null, quiz: null, menu: false, reset: new Set(),
  authMode: 'signin', authMsg: null, recovery: false,
  manage: { subjectId: null, topicId: null, edit: null, questions: null },
};

/* -------------------------------------------------------------- helpers -- */
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
function inline(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/==(.+?)==/g, '<mark>$1</mark>'); }
function lessonHTML(t) {
  t = String(t || '').replace(/^(##\s.*)$/gm, '\n$1\n');
  return t.split(/\n\s*\n/).map(b => {
    b = b.trim(); if (!b) return '';
    if (b.startsWith('## ')) return `<h3>${inline(b.slice(3))}</h3>`;
    const L = b.split('\n');
    if (L.every(l => /^\s*-\s+/.test(l))) return `<ul>${L.map(l => `<li>${inline(l.replace(/^\s*-\s+/, ''))}</li>`).join('')}</ul>`;
    if (L.every(l => /^\s*\d+[.)]\s+/.test(l))) return `<ol>${L.map(l => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`;
    return `<p>${L.map(inline).join('<br>')}</p>`;
  }).join('');
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'x'; }
function dayStr(t = Date.now()) { return new Date(t).toLocaleDateString('en-CA'); }
function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
let toastT; function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 3500); }
function waecGrade(p) { return p >= 75 ? 'A1' : p >= 70 ? 'B2' : p >= 65 ? 'B3' : p >= 60 ? 'C4' : p >= 55 ? 'C5' : p >= 50 ? 'C6' : p >= 45 ? 'D7' : p >= 40 ? 'E8' : 'F9'; }
function initials(n) { return String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(); }
const learner = () => S.learners[S.active];
const band = () => learner()?.band;
const subj = id => S.subjects.find(s => s.id === id);
const myTopics = sid => topicsFor(sid, band(), learner()?.cls);
const audience = t => t.class || ('All ' + (BANDS[t.band] || t.band));
const topic = id => S.topics.find(t => t.id === id);
const subjectsFor = b => S.subjects.filter(s => !b || (s.bands || []).includes(b));
const CLASSES_IN = b => CLASSES.filter(c => bandOf(c) === b);
// A topic with no class is for every class in its level; otherwise only that class sees it.
const topicsFor = (sid, b, cls) => S.topics.filter(t => t.subject_id === sid && (!b || t.band === b) && (!cls || !t.class || t.class === cls))
  .sort((x, y) => (x.sort ?? 99) - (y.sort ?? 99) || String(x.title).localeCompare(y.title));
function topicStats(t) {
  const cs = Object.values(S.cards).filter(c => c.topicId === t.id);
  const n = t.qCount || 0, strong = cs.filter(c => c.box >= 3).length;
  const pct = n ? Math.min(100, Math.round(strong / n * 100)) : 0;
  return { seen: cs.length, n, pct, status: !cs.length ? 'new' : pct >= 70 ? 'strong' : 'learning' };
}
function subjectPct(sid) { const ts = myTopics(sid); if (!ts.length) return 0; return Math.round(ts.reduce((a, t) => a + topicStats(t).pct, 0) / ts.length); }
function dueList() { const now = Date.now(); return Object.entries(S.cards).filter(([, c]) => c.due <= now).sort((a, b) => a[1].due - b[1].due); }
function nextDueAt() { return Object.values(S.cards).map(c => c.due).filter(d => d > Date.now()).sort((a, b) => a - b)[0]; }

/* --------------------------------------------------------------- routing -- */
const VIEWS = ['today','subjects','subject','topic','quiz','progress','manage','account','add-learner'];
function go(path) { if (location.hash === '#/' + path) route(); else location.hash = '#/' + path; }
function route() {
  if (/(^|[#&])(access_token|error|error_code)=/.test(location.hash)) return;   // a sign-in link, handled in boot()
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [v, p] = h.split('/');
  if (S.view === 'quiz' && v !== 'quiz') { clearInterval(timerId); S.quiz = null; }
  if (v === 'quiz' && !S.quiz) { go('today'); return; }
  S.view = VIEWS.includes(v) ? v : 'today';
  S.param = p || null; S.menu = false;
  if (S.view === 'topic' && S.param) ensureLesson(S.param);
  render(); window.scrollTo(0, 0);
}

/* --------------------------------------------------------------- library -- */
async function loadLibrary(quiet) {
  if (!quiet) { S.lib = 'loading'; render(); }
  const cols = 'id,subject_id,band,title,summary,sort,questions(count)';
  let [s, t] = await Promise.all([
    sb.from('subjects').select('*').order('sort'),
    sb.from('topics').select(cols + ',class').order('sort'),
  ]);
  // If the database hasn't had the Class update yet, keep working without it.
  S.needsClassUpdate = !!(t.error && /class/i.test(t.error.message || ''));
  if (S.needsClassUpdate) t = await sb.from('topics').select(cols).order('sort');
  if (s.error || t.error) { if (!quiet) { S.lib = 'error'; render(); } return; }
  S.subjects = s.data;
  S.topics = t.data.map(x => ({ ...x, qCount: x.questions?.[0]?.count || 0 }));
  S.lib = 'ready'; render();
}
async function ensureLesson(id) {
  if (typeof S.lessons[id] === 'string' || !sb) return S.lessons[id];
  if (S.lessons[id] === null) return;              // already loading
  S.lessons[id] = null;
  const { data, error } = await sb.from('topics').select('lesson').eq('id', id).maybeSingle();
  S.lessons[id] = error ? undefined : (data?.lesson || '');
  if (error) toast('The lesson could not be loaded. Check your connection.');
  render();
  return S.lessons[id];
}

/* ------------------------------------------------- learners & progress -- */
function fromRow(r) { return { id: r.id, name: r.name, cls: r.class, band: r.band, streak: r.streak || 0, lastDay: r.last_day || '', created: Date.parse(r.created_at) || 0 }; }
function guestData() { const d = lsGet(GUEST, { learners: {}, cards: {} }); d.learners = d.learners || {}; d.cards = d.cards || {}; return d; }
function saveGuest() { if (S.store !== 'local') return; const d = guestData(); d.learners = S.learners; if (S.active) d.cards[S.active] = S.cards; lsSet(GUEST, d); }

let wq = Promise.resolve();
function queue(fn) { wq = wq.then(fn).catch(e => console.error(e)); return wq; }
let warned = false;
function warnSave(error) { if (error && !warned) { warned = true; toast('Progress couldn’t be saved. Check your connection.'); setTimeout(() => warned = false, 15000); } }

async function loadLearners() {
  if (S.store === 'local') S.learners = guestData().learners;
  else {
    const { data, error } = await sb.from('learners').select('*').order('created_at');
    if (error) { toast('Your learners could not be loaded. Check your connection.'); S.learners = {}; }
    else S.learners = Object.fromEntries(data.map(r => [r.id, fromRow(r)]));
  }
  S.learnersLoaded = true;
  await setActive(lsGet(ACTIVE, null));
}
async function setActive(lid) {
  const ids = Object.keys(S.learners);
  if (!ids.includes(lid)) lid = ids.sort((a, b) => (S.learners[a].created || 0) - (S.learners[b].created || 0))[0] || null;
  S.active = lid; lsSet(ACTIVE, lid); S.cards = {};
  if (!lid) { render(); return; }
  if (S.store === 'local') { S.cards = { ...(guestData().cards[lid] || {}) }; render(); return; }
  S.cardsLoading = true; render();
  const cards = await fetchCards(lid);
  if (S.active !== lid) return;
  S.cards = cards; S.cardsLoading = false; render();
}
async function fetchCards(lid) {
  const out = {}, PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb.from('cards')
      .select('question_id,box,due,seen,correct,last_seen,questions(topic_id)')
      .eq('learner_id', lid).range(from, from + PAGE - 1);
    if (error) { toast('Progress could not be loaded. Check your connection.'); break; }
    data.forEach(r => out[r.question_id] = { box: r.box, due: Date.parse(r.due), topicId: r.questions?.topic_id || '', seen: r.seen, right: r.correct, last: r.last_seen ? Date.parse(r.last_seen) : 0 });
    if (data.length < PAGE) break;
  }
  return out;
}
async function addLearner(name, cls) {
  const band = bandOf(cls);
  if (S.store === 'local') {
    const id = 'g-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    S.learners[id] = { id, name, cls, band, streak: 0, lastDay: '', created: Date.now() };
    saveGuest(); return id;
  }
  const { data, error } = await sb.from('learners').insert({ name, class: cls, band }).select().single();
  if (error) { toast('That learner couldn’t be added. Try again.'); return null; }
  S.learners[data.id] = fromRow(data); return data.id;
}
async function removeLearner(id) {
  if (S.store === 'local') { const d = guestData(); delete d.learners[id]; delete d.cards[id]; lsSet(GUEST, d); delete S.learners[id]; }
  else { const { error } = await sb.from('learners').delete().eq('id', id); if (error) { toast('That learner couldn’t be removed.'); return; } delete S.learners[id]; }
  if (S.active === id) await setActive(null); else render();
}
function updateLearner(l) {
  S.learners[l.id] = l;
  if (S.store === 'local') return saveGuest();
  queue(async () => { const { error } = await sb.from('learners').update({ streak: l.streak, last_day: l.lastDay || null }).eq('id', l.id); warnSave(error); });
}
function saveCard(qid, c) {
  S.cards[qid] = c;
  if (S.store === 'local') return saveGuest();
  const lid = S.active;
  queue(async () => {
    const { error } = await sb.from('cards').upsert({
      learner_id: lid, question_id: qid, box: c.box, due: new Date(c.due).toISOString(),
      seen: c.seen, correct: c.right, last_seen: new Date(c.last || Date.now()).toISOString(),
    }, { onConflict: 'learner_id,question_id' });
    warnSave(error);
  });
}
// When a guest signs in, move the learners kept on this device into the account.
async function importGuest() {
  const d = guestData(), ls = Object.values(d.learners);
  if (!ls.length) return;
  let moved = 0;
  for (const l of ls) {
    const { data, error } = await sb.from('learners')
      .insert({ name: l.name, class: l.cls, band: l.band, streak: l.streak || 0, last_day: l.lastDay || null }).select().single();
    if (error) { toast('Progress on this device couldn’t be moved yet. It is still saved here.'); return; }
    const rows = Object.entries(d.cards[l.id] || {}).filter(([q]) => UUID.test(q)).map(([q, c]) => ({
      learner_id: data.id, question_id: q, box: c.box, due: new Date(c.due).toISOString(),
      seen: c.seen || 0, correct: c.right || 0, last_seen: c.last ? new Date(c.last).toISOString() : null,
    }));
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const { error: e } = await sb.from('cards').upsert(chunk, { onConflict: 'learner_id,question_id' });
      if (e) for (const r of chunk) await sb.from('cards').upsert(r, { onConflict: 'learner_id,question_id' }); // skip questions that no longer exist
    }
    if (lsGet(ACTIVE, null) === l.id) lsSet(ACTIVE, data.id);
    delete d.learners[l.id]; delete d.cards[l.id]; lsSet(GUEST, d); moved++;
  }
  if (moved) toast(`Moved ${moved} learner${moved > 1 ? 's' : ''} from this device into your account`);
}

/* ------------------------------------------------------------- accounts -- */
let sessionUid;
async function handleSession(session) {
  const uid = session?.user?.id || null;
  S.user = session?.user || null;
  if (uid === sessionUid) { render(); return; }
  sessionUid = uid; S.learnersLoaded = false; render();
  if (uid) {
    S.store = 'cloud';
    try {
      const { data } = await sb.from('profiles').select('is_admin').eq('id', uid).maybeSingle();
      S.isAdmin = !!data?.is_admin;
      await importGuest();
    } catch (e) { console.error(e); }
  } else { S.store = 'local'; S.isAdmin = false; }
  try { await loadLearners(); }
  catch (e) { console.error(e); S.learnersLoaded = true; toast('Your learners could not be loaded. Check your connection.'); }
  if (uid && S.view === 'account' && !S.recovery) go('today');
  render();
}

/* ---------------------------------------------------------------- render -- */
function curTab() { if (['subject','topic'].includes(S.view)) return 'subjects'; if (S.view === 'quiz') return S.quiz?.origin || 'today'; return S.view; }
function render() {
  const keep = {};
  main.querySelectorAll('input[id],textarea[id],select[id]').forEach(el => { if (!S.reset.has(el.id) && el.type !== 'password') keep[el.id] = el.type === 'checkbox' ? el.checked : el.value; });
  S.reset.clear();
  const fid = document.activeElement && main.contains(document.activeElement) ? document.activeElement.id : null;
  renderHeader();
  main.innerHTML = `<div class="view">${viewHTML()}</div>`;
  for (const [id, v] of Object.entries(keep)) {
    const el = document.getElementById(id); if (!el) continue;
    if (el.type === 'checkbox') el.checked = v;
    else if (el.tagName !== 'SELECT' || [...el.options].some(o => o.value === v)) el.value = v;
  }
  if (fid) document.getElementById(fid)?.focus({ preventScroll: true });
}
function renderHeader() {
  const tabs = [['today','Today'],['subjects','Subjects'],['progress','Progress']];
  if (S.isAdmin) tabs.push(['manage','Manage']);
  const show = S.ready && (!!learner() || S.isAdmin);
  $('#tabs').innerHTML = show ? tabs.map(([k, l]) => `<a class="tab" href="#/${k}"${curTab() === k ? ' aria-current="page"' : ''}>${l}</a>`).join('') : '';
  const l = learner();
  $('#who').innerHTML = l && S.ready ? `<button class="who" data-action="menu" aria-expanded="${S.menu}" aria-haspopup="true"><span class="av">${esc(initials(l.name))}</span><span><b>${esc(l.name)}</b><small>${esc(l.cls)}</small></span></button>${S.menu ? menuHTML() : ''}` : '';
  $('#acct').innerHTML = !sb || !S.ready ? '' : S.user
    ? `<a class="acct-btn signed" href="#/account" title="Your account" aria-label="Your account"><span class="av">${esc((S.user.email || '?')[0].toUpperCase())}</span></a>`
    : `<a class="acct-btn" href="#/account">Sign in</a>`;
}
function menuHTML() {
  const ls = Object.values(S.learners).sort((a, b) => (a.created || 0) - (b.created || 0));
  return `<div class="menu" role="menu">${ls.map(x => `<button role="menuitem" data-action="switch" data-id="${esc(x.id)}"><span class="av">${esc(initials(x.name))}</span><span><b>${esc(x.name)}</b> <small class="muted">${esc(x.cls)}</small>${x.id === S.active ? ' <small class="muted">· studying</small>' : ''}</span></button>`).join('')}
  <button role="menuitem" data-action="add-learner"><span class="av" style="background:var(--rule);color:var(--ink)">+</span><span><b>Add a learner</b></span></button>
  <div class="note">${S.store === 'local' ? 'Progress is saved on this device only.' : 'Progress is saved to your account and works on any device.'}</div></div>`;
}
function loadingHTML(m) { return `<div class="loading"><span class="dot"></span>${esc(m)}</div>`; }
function libraryNotice() {
  if (S.lib === 'ready') return S.subjects.length ? '' : `<div class="panel empty"><h2>The library has no subjects yet</h2><p class="muted">${S.isAdmin ? 'Open Manage to add the first subject, or run supabase/seed.sql to load the starter lessons.' : 'Lessons will appear here once they are added.'}</p>${S.isAdmin ? '<a class="btn" href="#/manage">Open Manage</a>' : ''}</div>`;
  if (S.lib === 'loading') return loadingHTML('Opening the lesson library…');
  return `<div class="panel empty"><h2>The lesson library could not be opened</h2><p class="muted">Check your internet connection, then try again.</p><button class="btn ghost" data-action="reload-lib">Try again</button></div>`;
}
function viewHTML() {
  if (!configured) return setupHTML();
  if (!sb) return `<div class="panel empty"><h2>Lamplight couldn’t start</h2><p class="muted">Part of the site didn’t download. Check your internet connection and reload the page.</p></div>`;
  if (!S.ready || !S.learnersLoaded) return loadingHTML('Opening your study space…');
  if (S.view === 'account') return accountHTML();
  if (S.view === 'manage' && S.isAdmin) return manageHTML();
  if (!learner() || S.view === 'add-learner') return onboardHTML();
  switch (S.view) {
    case 'subjects': return subjectsHTML();
    case 'subject': return subjectHTML();
    case 'topic': return topicHTML();
    case 'quiz': return quizHTML();
    case 'progress': return progressHTML();
    default: return todayHTML();
  }
}
function setupHTML() {
  return `<section class="sheet stack setup"><p class="eyebrow">Almost there</p><h1>Connect your database</h1>
  <p class="muted">Lamplight keeps its lessons, questions and progress in Supabase. Add your project keys to finish setup.</p>
  <ol><li>Create a free project at supabase.com.</li>
  <li>Open <b>SQL Editor</b>, paste <code>supabase/schema.sql</code> and press Run. Then do the same with <code>supabase/seed.sql</code>.</li>
  <li>Open <b>Project Settings → API</b>. Copy the Project URL and the <b>anon public</b> key.</li>
  <li>Paste them into <code>js/config.js</code> and reload this page.</li></ol>
  <p class="hint">Full steps are in README.md.</p></section>`;
}

/* ----------------------------------------------------------- onboarding -- */
function onboardHTML() {
  const first = !Object.keys(S.learners).length;
  return `<div class="ob">
  <section class="sheet stack">
    <p class="eyebrow">${first ? 'Welcome' : 'New learner'}</p>
    <h1>${first ? 'Study the way memory works.' : 'Who else is studying?'}</h1>
    <p class="muted">Add a first name and class. Each child gets their own progress, so brothers and sisters can share one phone.</p>
    <form data-form="learner" class="stack" autocomplete="off">
      <div class="field"><label for="ob-name">First name</label><input type="text" id="ob-name" required maxlength="30" placeholder="e.g. Chidera"></div>
      <div class="field"><label for="ob-class">Class</label><select id="ob-class">${CLASSES.map(c => `<option${c === 'JSS 1' ? ' selected' : ''}>${c}</option>`).join('')}</select></div>
      <div class="row"><button class="btn" type="submit">Start studying</button>${!first ? '<a class="btn ghost" href="#/today">Cancel</a>' : ''}</div>
      ${first && !S.user ? '<p class="hint">Already have an account? <a class="link" href="#/account">Sign in</a> to load your learners.</p>' : ''}
    </form>
  </section>
  <aside class="panel techs">
    <p class="eyebrow">How Lamplight teaches</p>
    <div class="tech"><span class="pen">1</span><b>Test yourself, don’t just re-read</b><p>Pulling an answer out of memory makes it stick far better than reading notes again.</p></div>
    <div class="tech"><span class="pen">2</span><b>Space it out</b><p>Questions you get right come back after 1, 2, 4, 8, then 16 days. Ones you miss come back soon.</p></div>
    <div class="tech"><span class="pen">3</span><b>Mix it up</b><p>Daily review mixes subjects and topics, the way exam papers do.</p></div>
    <div class="tech"><span class="pen">4</span><b>Practise under exam conditions</b><p>Timed CBT drills with a WAEC-style grade at the end.</p></div>
  </aside></div>`;
}

/* ---------------------------------------------------------------- today -- */
function todayHTML() {
  const l = learner(), h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const due = dueList(), lib = libraryNotice(), b = l.band;
  const streak = l.lastDay === dayStr() || l.lastDay === dayStr(Date.now() - DAY) ? (l.streak || 0) : 0;
  const nd = nextDueAt();
  const ndText = nd ? (dayStr(nd) === dayStr() ? 'later today' : 'on ' + new Date(nd).toLocaleDateString(undefined, { weekday: 'long' })) : '';
  const next = S.lib === 'ready' ? subjectsFor(b).flatMap(s => myTopics(s.id).map(t => ({ t, s, st: topicStats(t) })))
    .filter(x => x.st.n > 0 && x.st.status !== 'strong')
    .sort((x, y) => (x.st.seen ? 0 : 1) - (y.st.seen ? 0 : 1) || x.st.pct - y.st.pct).slice(0, 4) : [];
  return `<div class="hello"><p class="eyebrow">${esc(l.cls)} · ${BANDS[b]}</p><h1>${greet}, ${esc(l.name)}.</h1></div>
  ${S.store === 'local' ? `<div class="banner"><p><b>Progress is saved on this device only.</b> Create a free account to keep it safe and use it on any phone or computer.</p><a class="btn small" href="#/account">Create account</a></div>` : ''}
  ${lib}
  <section class="sheet due">
    <div class="big">${S.cardsLoading ? '–' : due.length}</div>
    <div class="txt">
      <h2>${due.length ? `question${due.length === 1 ? '' : 's'} due for review` : 'Nothing due right now'}</h2>
      <p class="muted">${due.length ? 'A short mixed set from everything you’ve studied. Missed ones come back sooner.' : nd ? `Your next review opens ${ndText}. Learn a new topic in the meantime.` : 'Read a lesson and answer its questions. They’ll come back here to review.'}</p>
      <div class="row">${due.length ? `<button class="btn" data-action="start-review">Start review · ${Math.min(15, due.length)} questions</button>` : ''}
      ${streak ? `<span class="streak"><span class="pen">${streak}-day streak</span></span>` : ''}</div>
    </div>
  </section>
  ${next.length ? `<section class="stack"><div class="section-head"><h2>Up next</h2><a class="link" href="#/subjects">All subjects</a></div>
    <div class="grid2">${next.map(({ t, s, st }) => `<a class="card subj" style="--h:${s.hue ?? 222}" href="#/topic/${encodeURIComponent(t.id)}">
      <div class="head"><span class="swatch">${esc(initials(s.name))}</span><div><h3>${esc(t.title)}</h3><small>${esc(s.name)} · ${st.seen ? st.pct + '% strong' : 'not started'}</small></div></div>
      <div class="bar"><i style="width:${st.pct}%"></i></div></a>`).join('')}</div></section>` : ''}
  ${S.lib === 'ready' && subjectsFor(b).length ? `<section class="panel stack"><div><h2>Exam drill</h2><p class="muted">10 mixed questions, 10 minutes, no hints until you submit. Like the real CBT.</p></div>
    <div class="row">${subjectsFor(b).map(s => `<button class="btn ghost small" data-action="start-drill" data-id="${esc(s.id)}">${esc(s.name)}</button>`).join('')}</div></section>` : ''}`;
}

/* ------------------------------------------------------------- subjects -- */
function subjectsHTML() {
  const b = band(), lib = libraryNotice(), list = S.lib === 'ready' ? subjectsFor(b) : [];
  return `<div class="stack"><p class="eyebrow">${BANDS[b]}</p><h1>Subjects</h1></div>${lib}
  ${S.lib === 'ready' && S.subjects.length && !list.length ? `<div class="panel empty"><h2>No ${BANDS[b]} subjects yet</h2><p class="muted">Lessons for ${esc(learner().cls)} will appear here once they are added.</p></div>` : ''}
  <div class="grid2">${list.map(s => { const ts = myTopics(s.id), p = subjectPct(s.id);
    return `<a class="card subj" style="--h:${s.hue ?? 222}" href="#/subject/${encodeURIComponent(s.id)}">
    <div class="head"><span class="swatch">${esc(initials(s.name))}</span><div><h3>${esc(s.name)}</h3><small>${ts.length} topic${ts.length === 1 ? '' : 's'} · ${p}% strong</small></div></div>
    <div class="bar"><i style="width:${p}%"></i></div></a>`; }).join('')}</div>`;
}
function subjectHTML() {
  if (S.lib !== 'ready') return libraryNotice();
  const s = subj(S.param); if (!s) return subjectsHTML();
  const ts = myTopics(s.id);
  return `<div class="crumbs"><a class="link" href="#/subjects">Subjects</a><span>/</span><span>${esc(s.name)}</span></div>
  <div class="section-head subj" style="--h:${s.hue ?? 222}"><div class="row"><span class="swatch">${esc(initials(s.name))}</span><h1>${esc(s.name)}</h1></div>
  ${ts.some(t => t.qCount) ? `<button class="btn" data-action="start-drill" data-id="${esc(s.id)}">Timed drill · 10 min</button>` : ''}</div>
  ${ts.length ? `<div class="topics">${ts.map(t => { const st = topicStats(t); return `<a class="trow" href="#/topic/${encodeURIComponent(t.id)}">
    <span class="t"><b>${esc(t.title)}</b><small class="muted">${esc(t.summary || '')}</small></span>
    <span class="meta"><span class="bar"><i style="width:${st.pct}%"></i></span><span class="pill ${st.status}">${st.status === 'new' ? 'New' : st.status === 'strong' ? 'Strong' : st.pct + '%'}</span></span></a>`; }).join('')}</div>`
  : `<div class="panel empty"><h2>No topics for ${esc(learner().cls)} yet</h2><p class="muted">Topics in this subject will appear here once they are added.</p></div>`}`;
}
function topicHTML() {
  if (S.lib !== 'ready') return libraryNotice();
  const t = topic(S.param); if (!t) return subjectsHTML();
  const s = subj(t.subject_id) || { name: 'Subject' }, st = topicStats(t), lesson = S.lessons[t.id];
  return `<div class="crumbs"><a class="link" href="#/subjects">Subjects</a><span>/</span><a class="link" href="#/subject/${encodeURIComponent(t.subject_id)}">${esc(s.name)}</a></div>
  <article class="sheet stack">
    <p class="eyebrow">${esc(s.name)} · ${esc(t.class || BANDS[t.band] || '')}</p>
    <h1>${esc(t.title)}</h1>
    ${t.summary ? `<p class="muted" style="font-size:1.05rem">${esc(t.summary)}</p>` : ''}
    <div class="lesson">${typeof lesson === 'string' ? (lessonHTML(lesson) || '<p class="muted">No notes for this topic yet. You can still practise its questions.</p>') : lesson === null ? loadingHTML('Loading the lesson…') : '<p class="muted">The lesson could not be loaded.</p>'}</div>
  </article>
  <div class="tip"><b>Tip</b><span>Read once, then close the notes and answer from memory. Recalling it is what makes it stick.</span></div>
  <div class="row">${st.n ? `<button class="btn" data-action="start-topic" data-id="${esc(t.id)}">Test yourself · ${st.n} question${st.n === 1 ? '' : 's'}</button>` : '<span class="muted">No questions for this topic yet.</span>'}
  ${st.seen ? `<span class="muted">${st.pct}% strong</span>` : ''}</div>`;
}

/* ----------------------------------------------------------------- quiz -- */
function toItem(r) {
  return { id: r.id, q: r.question, explain: r.explanation || '', topicId: r.topic_id, subjectId: topic(r.topic_id)?.subject_id || '',
    options: shuffle((r.options || []).map((text, i) => ({ text, correct: i === r.answer }))) };
}
async function startQuiz(kind, id) {
  const origin = curTab(), back = location.hash || '#/today';
  S.menu = false; S.quiz = { loading: true, origin, back };
  go('quiz');
  try {
    let items = [], title = '', mode = 'practice', res;
    if (kind === 'topic') {
      title = topic(id)?.title || 'Practice';
      res = await sb.from('questions').select('*').eq('topic_id', id);
      if (res.error) throw res.error;
      items = shuffle(res.data.map(toItem)).slice(0, 12);
    } else if (kind === 'review') {
      title = 'Daily review';
      const ids = dueList().slice(0, 15).map(x => x[0]).filter(q => UUID.test(q));
      res = await sb.from('questions').select('*').in('id', ids);
      if (res.error) throw res.error;
      items = shuffle(res.data.map(toItem));
      const found = new Set(res.data.map(r => r.id));   // park cards whose question was deleted
      dueList().slice(0, 15).forEach(([qid, c]) => { if (!found.has(qid)) saveCard(qid, { ...c, due: Date.now() + 365 * DAY }); });
    } else {
      title = (subj(id)?.name || 'Subject') + ' drill'; mode = 'drill';
      const ids = myTopics(id).map(t => t.id);
      res = ids.length ? await sb.from('questions').select('*').in('topic_id', ids).limit(400) : { data: [], error: null };
      if (res.error) throw res.error;
      items = shuffle(res.data.map(toItem)).slice(0, 10);
    }
    if (S.view !== 'quiz') return;   // left while loading
    if (!items.length) { S.quiz = { error: 'There are no questions here yet.', origin, back }; render(); return; }
    S.quiz = { mode, title, items, i: 0, picks: [], revealed: false, missed: [], done: false, origin, back, kind,
      endsAt: mode === 'drill' ? Date.now() + items.length * 60000 : null };
    if (mode === 'drill') startTimer();
    render();
  } catch (e) {
    if (S.view === 'quiz') { S.quiz = { error: 'Questions could not be loaded. Check your connection and try again.', origin, back }; render(); }
  }
}
function retryMissed() {
  const q = S.quiz, items = q.missed.map(it => ({ ...it, options: shuffle(it.options) }));
  S.quiz = { mode: 'practice', title: 'Missed questions', items, i: 0, picks: [], revealed: false, missed: [], done: false, origin: q.origin, back: q.back, retry: true };
  render(); window.scrollTo(0, 0);
}
let timerId = null;
function fmt(ms) { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    const q = S.quiz; if (!q || q.mode !== 'drill' || q.done) { clearInterval(timerId); return; }
    const left = q.endsAt - Date.now(), el = document.getElementById('timer');
    if (left <= 0) { clearInterval(timerId); finishDrill(); return; }
    if (el) { el.textContent = fmt(left); el.classList.toggle('low', left < 60000); }
  }, 1000);
}
function grade(it, ok) {
  const c = S.cards[it.id] || { box: 0, seen: 0, right: 0 };
  const box = ok ? Math.min(5, (c.box || 0) + 1) : 1;
  const due = ok ? Date.now() + INTERVAL_DAYS[box] * DAY - 3600000 : Date.now() + 10 * 60000;
  saveCard(it.id, { box, due, topicId: it.topicId || '', seen: (c.seen || 0) + 1, right: (c.right || 0) + (ok ? 1 : 0), last: Date.now() });
  touchStreak();
}
function touchStreak() {
  const l = learner(); if (!l) return;
  const today = dayStr(); if (l.lastDay === today) return;
  const streak = l.lastDay === dayStr(Date.now() - DAY) ? (l.streak || 0) + 1 : 1;
  updateLearner({ ...l, streak, lastDay: today });
}
function finishDrill() {
  const q = S.quiz; if (!q || q.done) return; clearInterval(timerId);
  q.items.forEach((it, i) => { const p = q.picks[i]; const ok = p != null && it.options[p].correct; grade(it, ok); if (!ok) q.missed.push(it); });
  q.done = true; render(); window.scrollTo(0, 0);
}
function quizHTML() {
  const q = S.quiz; if (!q) return todayHTML();
  if (q.loading) return loadingHTML('Getting your questions…');
  if (q.error) return `<div class="panel empty"><h2>Can’t start this set</h2><p class="muted">${esc(q.error)}</p><button class="btn ghost" data-action="quit">Go back</button></div>`;
  if (q.done) return resultsHTML();
  const it = q.items[q.i], n = q.items.length, pick = q.picks[q.i];
  const head = `<div class="qhead"><div><p class="eyebrow">${esc(q.title)}</p><b class="num">Question ${q.i + 1} of ${n}</b></div>
    <div class="row">${q.mode === 'drill' ? `<span id="timer" class="timer">${fmt(q.endsAt - Date.now())}</span>` : ''}<button class="btn ghost small" data-action="quit">${q.mode === 'drill' ? 'Leave drill' : 'Stop'}</button></div>
    <div class="bar"><i style="width:${Math.round((q.i + (q.revealed ? 1 : 0)) / n * 100)}%"></i></div></div>`;
  let body;
  if (q.mode === 'practice') {
    const ok = q.revealed && it.options[pick]?.correct;
    body = `<div class="opts">${it.options.map((o, i) => { let cls = ''; if (q.revealed) { if (o.correct) cls = 'right'; else if (i === pick) cls = 'wrong'; }
      return `<button class="opt ${cls}" data-action="pick" data-i="${i}" aria-pressed="${pick === i}" ${q.revealed ? 'disabled' : ''}><span class="bub">${LETTERS[i]}</span><span>${inline(o.text)}</span></button>`; }).join('')}</div>
      ${q.revealed ? `<div class="feedback"><span class="pen">${ok ? '✓ Correct' : '✗ Not quite'}</span>${it.explain ? `<p>${inline(it.explain)}</p>` : ''}
      ${!ok ? '<p class="muted" style="font-size:.88rem">This one will come back in your review soon.</p>' : ''}
      <div class="row" style="margin-top:6px"><button class="btn" data-action="next" id="next-btn">${q.i + 1 < n ? 'Next question' : 'See my score'}</button></div></div>` : ''}`;
  } else {
    const blank = q.items.filter((_, i) => q.picks[i] == null).length;
    body = `<div class="opts">${it.options.map((o, i) => `<button class="opt" data-action="pick" data-i="${i}" aria-pressed="${pick === i}"><span class="bub">${LETTERS[i]}</span><span>${inline(o.text)}</span></button>`).join('')}</div>
      <div class="row"><button class="btn ghost" data-action="prev" ${q.i === 0 ? 'disabled' : ''}>Previous</button>${q.i + 1 < n ? '<button class="btn ghost" data-action="next">Next</button>' : ''}
      <button class="btn" data-action="submit-drill" style="margin-left:auto">Submit${blank ? ` (${blank} blank)` : ''}</button></div>
      <div class="palette" aria-label="Jump to question">${q.items.map((_, i) => `<button data-action="jump" data-i="${i}" class="${q.picks[i] != null ? 'done' : ''}" aria-current="${i === q.i}">${i + 1}</button>`).join('')}</div>`;
  }
  return `${head}<section class="sheet stack"><p class="qtext">${inline(it.q)}</p>${body}</section>`;
}
function resultsHTML() {
  const q = S.quiz, n = q.items.length, right = n - q.missed.length, pct = Math.round(right / n * 100);
  const msg = pct >= 80 ? 'Excellent work.' : pct >= 60 ? 'Good effort. Review the ones you missed.' : pct >= 40 ? 'Getting there. Go over the notes, then try again.' : 'Read the lesson again, then retry the missed questions.';
  return `<section class="sheet stack">
    <p class="eyebrow">${esc(q.title)} · finished</p>
    <div class="score"><span class="pen num">${right}/${n}</span>${q.mode === 'drill' ? `<span class="grade" title="WAEC-style grade">${waecGrade(pct)}</span>` : ''}<div><h2>${msg}</h2><p class="muted">${pct}% correct${q.retry ? ' on your retry' : ''}${q.mode === 'drill' ? ' · WAEC-style grade' : ''}</p></div></div>
    <div class="row">${q.missed.length ? `<button class="btn" data-action="retry">Retry the ${q.missed.length} you missed</button>` : ''}<button class="btn ghost" data-action="quit">Done</button></div>
  </section>
  ${q.missed.length ? `<section class="panel stack"><h2>Go over these</h2><div class="review">${q.missed.map(it => { const i = q.items.indexOf(it), p = i >= 0 ? q.picks[i] : null, c = it.options.findIndex(o => o.correct);
    return `<div class="item"><b>${inline(it.q)}</b>
    <p class="ans">${p != null ? `<span class="no">Your answer: ${LETTERS[p]}. ${inline(it.options[p].text)}</span> · ` : '<span class="no">Left blank</span> · '}<span class="ok">Correct: ${LETTERS[c]}. ${inline(it.options[c]?.text)}</span></p>
    ${it.explain ? `<p class="muted">${inline(it.explain)}</p>` : ''}</div>`; }).join('')}</div></section>` : ''}`;
}

/* ------------------------------------------------------------- progress -- */
function progressHTML() {
  const l = learner(), cs = Object.values(S.cards);
  const seen = cs.reduce((a, c) => a + (c.seen || 0), 0), right = cs.reduce((a, c) => a + (c.right || 0), 0);
  const strong = cs.filter(c => c.box >= 3).length;
  const streak = l.lastDay === dayStr() || l.lastDay === dayStr(Date.now() - DAY) ? (l.streak || 0) : 0;
  const boxes = [1, 2, 3, 4, 5].map(b => cs.filter(c => c.box === b).length), mx = Math.max(1, ...boxes);
  const b = l.band;
  return `<div class="stack"><p class="eyebrow">${esc(l.name)} · ${esc(l.cls)}</p><h1>Progress</h1></div>
  <div class="stats">
    <div class="stat"><b>${seen}</b><span>answers given</span></div>
    <div class="stat"><b>${seen ? Math.round(right / seen * 100) : 0}%</b><span>correct overall</span></div>
    <div class="stat"><b>${strong}</b><span>questions known well</span></div>
    <div class="stat"><b>${streak}</b><span>day streak</span></div>
  </div>
  <section class="panel stack"><div><h2>Memory boxes</h2><p class="muted">Every question lives in a box. Get it right and it moves up a box and waits longer before coming back. Miss it and it drops to Box 1.</p></div>
    <div class="boxes">${boxes.map((v, i) => `<div class="box"><b>${v}</b><div class="col"><i style="height:${Math.round(v / mx * 100)}%"></i></div><small>Box ${i + 1}<br>every ${INTERVAL_DAYS[i + 1]} day${i ? 's' : ''}</small></div>`).join('')}</div>
  </section>
  ${S.lib === 'ready' ? `<section class="panel"><h2 style="margin-bottom:8px">By subject</h2>${subjectsFor(b).map(s => { const p = subjectPct(s.id);
    return `<div class="srow subj" style="--h:${s.hue ?? 222}"><b>${esc(s.name)}</b><span class="bar"><i style="width:${p}%"></i></span><span class="num">${p}%</span></div>`; }).join('') || '<p class="muted">No subjects for this class yet.</p>'}</section>` : libraryNotice()}
  <p class="hint">${S.store === 'local' ? 'Progress for this learner is saved on this device. <a class="link" href="#/account">Create an account</a> to keep it safe.' : 'Progress is saved to your account and is private to you.'}</p>`;
}

/* -------------------------------------------------------------- account -- */
function accountHTML() {
  const msg = S.authMsg ? `<p class="form-msg ${S.authMsg.ok ? 'ok' : 'err'}" role="alert">${esc(S.authMsg.text)}</p>` : '';
  if (S.recovery) return `<section class="sheet stack auth"><p class="eyebrow">Your account</p><h1>Choose a new password</h1>${msg}
    <form data-form="newpass" class="stack"><div class="field"><label for="np-pass">New password</label><input type="password" id="np-pass" required minlength="6" autocomplete="new-password"></div>
    <div><button class="btn" type="submit">Save password</button></div></form></section>`;
  if (S.user) {
    const ls = Object.values(S.learners).sort((a, b) => (a.created || 0) - (b.created || 0));
    return `<section class="sheet stack auth"><p class="eyebrow">Your account</p><h1>Signed in</h1>
      <p class="muted">${esc(S.user.email || '')}${S.isAdmin ? ' · library editor' : ''}</p>${msg}
      <p>Every learner’s progress is saved to this account and works on any device you sign in on.</p>
      <div class="row"><a class="btn" href="#/today">Back to studying</a><button class="btn ghost" data-action="sign-out">Sign out</button></div></section>
      ${ls.length ? `<section class="panel"><h2 style="margin-bottom:6px">Learners</h2>${ls.map(x => `<div class="lrow"><span><b>${esc(x.name)}</b> <small class="muted">${esc(x.cls)}</small></span><button class="btn danger small" data-action="remove-learner" data-id="${esc(x.id)}">Remove</button></div>`).join('')}</section>` : ''}`;
  }
  const m = S.authMode;
  return `<section class="sheet stack auth"><p class="eyebrow">Your account</p>
    <h1>${m === 'signup' ? 'Create a free account' : m === 'forgot' ? 'Reset your password' : 'Sign in'}</h1>
    <p class="muted">${m === 'forgot' ? 'We’ll email you a link to choose a new password.' : 'Save every learner’s progress and pick up on any phone or computer.'}</p>
    ${m !== 'forgot' ? `<div class="seg" role="group" aria-label="Account"><button data-action="auth-mode" data-mode="signin" aria-pressed="${m === 'signin'}">Sign in</button><button data-action="auth-mode" data-mode="signup" aria-pressed="${m === 'signup'}">Create account</button></div>` : ''}
    ${msg}
    <form data-form="auth" class="stack">
      <div class="field"><label for="au-email">Email</label><input type="email" id="au-email" required autocomplete="email"></div>
      ${m !== 'forgot' ? `<div class="field"><label for="au-pass">Password</label><input type="password" id="au-pass" required minlength="6" autocomplete="${m === 'signup' ? 'new-password' : 'current-password'}">${m === 'signup' ? '<span class="hint">At least 6 characters.</span>' : ''}</div>` : ''}
      <div class="row"><button class="btn" type="submit" id="au-submit">${m === 'signup' ? 'Create account' : m === 'forgot' ? 'Send reset link' : 'Sign in'}</button>
      ${m === 'signin' ? '<button class="link" type="button" data-action="auth-mode" data-mode="forgot">Forgot password?</button>' : ''}
      ${m === 'forgot' ? '<button class="link" type="button" data-action="auth-mode" data-mode="signin">Back to sign in</button>' : ''}</div>
    </form>
    ${Object.keys(S.learners).length ? '<p class="hint">Learners you added on this device will move into your account when you sign in.</p>' : ''}
  </section>`;
}

/* --------------------------------------------------------------- manage -- */
function manageHTML() {
  if (S.lib !== 'ready') return `<h1>Manage the library</h1>${libraryNotice()}`;
  const M = S.manage;
  if (!M.subjectId || !subj(M.subjectId)) M.subjectId = S.subjects[0]?.id || null;
  const ts = M.subjectId ? topicsFor(M.subjectId) : [];
  if (M.topicId && !topic(M.topicId)) M.topicId = null;
  const editing = M.edit ? topic(M.edit) : null;
  return `<div class="stack"><p class="eyebrow">Editors only</p><h1>Manage the library</h1><p class="muted">Students see every change straight away. Write lessons in plain text: start a line with <code>## </code> for a heading, <code>- </code> for a bullet, and wrap words in <code>**bold**</code> or <code>==highlight==</code>.</p></div>

  ${S.needsClassUpdate ? `<div class="form-msg err" role="alert"><b>One database step is missing.</b> Topics can\u2019t be given a class until you run <code>supabase/migrations/001_topic_class.sql</code> in Supabase (SQL Editor \u2192 New query \u2192 paste \u2192 Run). Until then, new topics go to every class in their level.</div>` : ''}
  <section class="panel stack"><h2>Subjects</h2>
    <div class="topics">${S.subjects.map(s => { const n = S.topics.filter(t => t.subject_id === s.id).length;
      return `<div class="qline subj" style="--h:${s.hue ?? 222}"><span class="row" style="gap:10px;flex-wrap:nowrap"><span class="swatch" style="width:30px;height:30px;font-size:.75rem">${esc(initials(s.name))}</span><span><b>${esc(s.name)}</b> <small class="muted">· ${(s.bands || []).map(b => BANDS[b]?.split(' ')[0]).join(', ')} · ${n} topic${n === 1 ? '' : 's'}</small></span></span>
      <span class="row"><button class="btn danger small" data-action="del-subject" data-id="${esc(s.id)}">Delete</button></span></div>`; }).join('') || '<p class="muted">No subjects yet.</p>'}</div>
    <form data-form="subject" class="stack" autocomplete="off">
      <div class="fields2"><div class="field"><label for="ms-name">New subject</label><input type="text" id="ms-name" required maxlength="40" placeholder="e.g. Civic Education"></div>
      <div class="field"><label for="ms-hue">Colour</label><select id="ms-hue">${HUES.map(([n, h]) => `<option value="${h}">${n}</option>`).join('')}</select></div></div>
      <div class="field"><span class="hint">Taught in</span><div class="checks">${Object.entries(BANDS).map(([k, v]) => `<label><input type="checkbox" id="ms-b-${k}" ${k === 'jss' ? 'checked' : ''}> ${v}</label>`).join('')}</div></div>
      <div><button class="btn small" type="submit">Add subject</button></div>
    </form>
  </section>

  ${S.subjects.length ? `<section class="panel stack"><div class="section-head"><h2>Topics &amp; lessons</h2>
      <div class="field" style="min-width:200px"><label for="m-subject" class="hint">Subject</label><select id="m-subject" data-change="m-subject">${S.subjects.map(s => `<option value="${esc(s.id)}"${s.id === M.subjectId ? ' selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div></div>
    <div class="topics">${ts.map(t => `<div class="qline"><span><b>${esc(t.title)}</b> <small class="muted">· ${esc(audience(t))} · ${t.qCount || 0} question${t.qCount === 1 ? '' : 's'}</small></span>
      <span class="row"><button class="btn ghost small" data-action="m-questions" data-id="${esc(t.id)}">Questions</button><button class="btn ghost small" data-action="m-edit" data-id="${esc(t.id)}">Edit</button><button class="btn danger small" data-action="del-topic" data-id="${esc(t.id)}">Delete</button></span></div>`).join('') || '<p class="muted">No topics in this subject yet.</p>'}</div>
    <form data-form="topic" class="stack" autocomplete="off">
      <h3 style="font-size:1.05rem">${editing ? `Edit “${esc(editing.title)}”` : 'New topic'}</h3>
      <div class="fields2"><div class="field"><label for="mt-title">Title</label><input type="text" id="mt-title" required maxlength="80" value="${editing ? esc(editing.title) : ''}"></div>
      <div class="field"><label for="mt-for">Class</label><select id="mt-for" required>${forOptions(subj(M.subjectId)?.bands, editing)}</select></div></div>
      <div class="field"><label for="mt-summary">One-line summary</label><input type="text" id="mt-summary" maxlength="140" value="${editing ? esc(editing.summary || '') : ''}"></div>
      <div class="field"><label for="mt-lesson">Lesson notes</label><textarea id="mt-lesson" rows="10">${editing ? esc(S.lessons[editing.id] || '') : ''}</textarea></div>
      <div class="row"><button class="btn small" type="submit">${editing ? 'Save changes' : 'Add topic'}</button>${editing ? '<button class="btn ghost small" type="button" data-action="m-cancel">Cancel</button>' : ''}</div>
    </form></section>` : ''}

  ${M.topicId ? questionsPanel() : ''}`;
}
// The "Class" choices: each specific class, plus "All classes" for each level the subject is taught in.
function forOptions(bands, editing) {
  const cur = editing ? (editing.class || editing.band) : null;
  return (editing ? '' : '<option value="" selected disabled>Choose a class</option>') + Object.entries(BANDS).filter(([k]) => (bands?.length ? bands : Object.keys(BANDS)).includes(k)).map(([k, v]) =>
    `<optgroup label="${v}">${CLASSES_IN(k).map(c => `<option value="${esc(c)}"${cur === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}
     <option value="${k}"${cur === k ? ' selected' : ''}>All ${v} classes</option></optgroup>`).join('');
}
function questionsPanel() {
  const M = S.manage, t = topic(M.topicId);
  const list = M.questions == null ? loadingHTML('Loading questions…') : M.questions.length
    ? `<div class="qlist">${M.questions.map(q => `<div class="qline"><span>${inline(q.question)}<br><small class="muted">Answer: ${LETTERS[q.answer]}. ${inline((q.options || [])[q.answer])}</small></span><button class="btn danger small" data-action="del-q" data-id="${esc(q.id)}">Delete</button></div>`).join('')}</div>`
    : '<p class="muted">No questions yet.</p>';
  return `<section class="panel stack" id="q-panel"><div class="section-head"><h2>Questions · ${esc(t.title)}</h2><span class="muted">${BANDS[t.band]}</span></div>
    ${list}
    <form data-form="question" class="stack" autocomplete="off">
      <h3 style="font-size:1.05rem">Add a question</h3>
      <div class="field"><label for="mq-q">Question</label><textarea id="mq-q" rows="2" required style="min-height:60px"></textarea></div>
      <div class="fields2">${[0, 1, 2, 3].map(i => `<div class="field"><label for="mq-o${i}">Option ${LETTERS[i]}</label><input type="text" id="mq-o${i}" required></div>`).join('')}</div>
      <div class="fields2"><div class="field"><label for="mq-ans">Correct option</label><select id="mq-ans">${[0, 1, 2, 3].map(i => `<option value="${i}">${LETTERS[i]}</option>`).join('')}</select></div></div>
      <div class="field"><label for="mq-exp">Explanation (shown after answering)</label><textarea id="mq-exp" rows="2" style="min-height:60px"></textarea></div>
      <div><button class="btn small" type="submit">Add question</button></div>
    </form>
    <form data-form="bulk" class="stack" autocomplete="off">
      <h3 style="font-size:1.05rem">Paste many at once</h3>
      <p class="hint">One question per line: <code>Question | A | B | C | D | correct letter | explanation</code>. Avoid “all of the above”, since options are shuffled.</p>
      <textarea id="mq-bulk" rows="6" placeholder="What is 7 × 8? | 54 | 56 | 63 | 48 | B | 7 × 8 = 56"></textarea>
      <div><button class="btn small" type="submit">Import questions</button></div>
    </form></section>`;
}
async function loadManageQuestions() {
  const M = S.manage, tid = M.topicId; M.questions = null; render();
  const { data, error } = await sb.from('questions').select('*').eq('topic_id', tid).order('created_at');
  if (M.topicId !== tid) return;
  M.questions = error ? [] : data; if (error) toast('Questions could not be loaded.');
  render();
}
function failMsg(e) { return e && (e.code === '42501' || /row-level security|permission/i.test(e.message || '')) ? 'Only library editors can make that change.' : 'That didn’t save. Check your connection and try again.'; }
async function afterQuestionChange() { await Promise.all([loadManageQuestions(), loadLibrary(true)]); }

/* ---------------------------------------------------------------- events -- */
const A = {
  menu: () => { S.menu = !S.menu; renderHeader(); },
  switch: b => { S.menu = false; setActive(b.dataset.id); go('today'); },
  'add-learner': () => { S.menu = false; go('add-learner'); },
  'reload-lib': () => loadLibrary(),
  'start-topic': b => startQuiz('topic', b.dataset.id),
  'start-review': () => startQuiz('review'),
  'start-drill': b => startQuiz('drill', b.dataset.id),
  pick: b => {
    const q = S.quiz, i = +b.dataset.i;
    if (q.mode === 'practice') {
      if (q.revealed) return;
      q.picks[q.i] = i; q.revealed = true;
      const it = q.items[q.i], ok = it.options[i].correct;
      if (!q.retry) grade(it, ok);
      if (!ok) q.missed.push(it);
      render(); document.getElementById('next-btn')?.focus({ preventScroll: true });
    } else { q.picks[q.i] = i; render(); }
  },
  next: () => { const q = S.quiz; if (q.mode === 'practice') { q.i++; q.revealed = false; if (q.i >= q.items.length) q.done = true; } else q.i = Math.min(q.items.length - 1, q.i + 1); render(); window.scrollTo(0, 0); },
  prev: () => { const q = S.quiz; q.i = Math.max(0, q.i - 1); render(); },
  jump: b => { S.quiz.i = +b.dataset.i; render(); },
  'submit-drill': b => { const q = S.quiz, blank = q.items.filter((_, i) => q.picks[i] == null).length;
    if (blank && b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = `${blank} left blank. Tap again to submit`; return; }
    finishDrill(); },
  retry: () => retryMissed(),
  quit: () => { const back = S.quiz?.back || '#/today'; clearInterval(timerId); S.quiz = null; location.hash = back.startsWith('#/quiz') ? '#/today' : back; },
  'auth-mode': b => { S.authMode = b.dataset.mode; S.authMsg = null; render(); document.getElementById('au-email')?.focus(); },
  'sign-out': async () => { await sb.auth.signOut(); S.authMsg = null; go('today'); },
  'remove-learner': async b => {
    if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = 'Tap again to remove'; setTimeout(() => { if (b.isConnected) { b.dataset.armed = ''; b.textContent = 'Remove'; } }, 3500); return; }
    b.disabled = true; await removeLearner(b.dataset.id); toast('Learner removed');
  },
  'm-edit': async b => { const id = b.dataset.id; await ensureLesson(id); S.manage.edit = id; S.reset = new Set(['mt-title','mt-summary','mt-lesson','mt-for']); render(); document.getElementById('mt-title')?.scrollIntoView({ block: 'center' }); },
  'm-cancel': () => { S.manage.edit = null; S.reset = new Set(['mt-title','mt-summary','mt-lesson','mt-for']); render(); },
  'm-questions': async b => { S.manage.topicId = b.dataset.id; await loadManageQuestions(); document.getElementById('q-panel')?.scrollIntoView({ block: 'start' }); },
  'del-subject': async b => {
    const s = subj(b.dataset.id); if (!s) return;
    const ts = S.topics.filter(t => t.subject_id === s.id), nq = ts.reduce((a, t) => a + (t.qCount || 0), 0);
    if (b.dataset.armed !== '1') {
      b.dataset.armed = '1';
      b.textContent = ts.length ? `Delete with ${ts.length} topic${ts.length === 1 ? '' : 's'} & ${nq} question${nq === 1 ? '' : 's'}?` : 'Tap again to delete';
      setTimeout(() => { if (b.isConnected) { b.dataset.armed = ''; b.textContent = 'Delete'; } }, 4000);
      return;
    }
    b.disabled = true;
    const { error } = await sb.from('subjects').delete().eq('id', s.id);
    if (error) { toast(failMsg(error)); b.disabled = false; return; }
    const M = S.manage;
    if (ts.some(t => t.id === M.edit)) { M.edit = null; S.reset = new Set(['mt-title','mt-summary','mt-lesson','mt-for']); }
    if (ts.some(t => t.id === M.topicId)) { M.topicId = null; M.questions = null; }
    if (M.subjectId === s.id) M.subjectId = null;
    ts.forEach(t => delete S.lessons[t.id]);
    await loadLibrary(true); toast(`Deleted ${s.name}`);
  },
  'del-topic': async b => {
    const t = topic(b.dataset.id); if (!t) return;
    if (b.dataset.armed !== '1') {
      b.dataset.armed = '1';
      b.textContent = t.qCount ? `Delete with ${t.qCount} question${t.qCount === 1 ? '' : 's'}?` : 'Tap again to delete';
      setTimeout(() => { if (b.isConnected) { b.dataset.armed = ''; b.textContent = 'Delete'; } }, 4000);
      return;
    }
    b.disabled = true;
    const { error } = await sb.from('topics').delete().eq('id', t.id);
    if (error) { toast(failMsg(error)); b.disabled = false; return; }
    const M = S.manage;
    if (M.edit === t.id) { M.edit = null; S.reset = new Set(['mt-title','mt-summary','mt-lesson','mt-for']); }
    if (M.topicId === t.id) { M.topicId = null; M.questions = null; }
    delete S.lessons[t.id];
    await loadLibrary(true); toast(`Deleted \u201c${t.title}\u201d`);
  },
  'del-q': async b => {
    if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = 'Tap again to delete'; setTimeout(() => { if (b.isConnected) { b.dataset.armed = ''; b.textContent = 'Delete'; } }, 3500); return; }
    b.disabled = true;
    const { error } = await sb.from('questions').delete().eq('id', b.dataset.id);
    if (error) { toast(failMsg(error)); b.disabled = false; return; }
    toast('Question deleted'); afterQuestionChange();
  },
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-action]');
  if (!b) { if (S.menu && !e.target.closest('#who')) { S.menu = false; renderHeader(); } return; }
  if (b.disabled) return;
  A[b.dataset.action]?.(b, e);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && S.menu) { S.menu = false; renderHeader(); }
  const q = S.quiz;
  if (S.view !== 'quiz' || !q || q.done || q.loading || q.error || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const i = 'abcd'.indexOf(e.key.toLowerCase());
  if (i >= 0 && i < q.items[q.i].options.length) { const btn = main.querySelector(`.opt[data-i="${i}"]`); if (btn && !btn.disabled) A.pick(btn); }
  else if (e.key === 'Enter' && q.mode === 'practice' && q.revealed && e.target.tagName !== 'BUTTON') A.next();
});
document.addEventListener('change', e => {
  if (e.target.dataset.change === 'm-subject') { S.manage.subjectId = e.target.value; S.manage.edit = null; S.manage.topicId = null; S.reset = new Set(['mt-for']); render(); }
});

const F = {
  learner: async () => {
    const name = $('#ob-name').value.trim(); if (!name) return;
    const cls = $('#ob-class').value;
    const id = await addLearner(name, cls); if (!id) return;
    await setActive(id); S.reset = new Set(['ob-name']); go('today'); toast(`Welcome, ${name}`);
  },
  auth: async () => {
    const email = $('#au-email').value.trim(), pass = $('#au-pass')?.value || '', m = S.authMode;
    const btn = $('#au-submit'); btn.disabled = true;
    const redirectTo = siteUrl();
    let res;
    if (m === 'signin') res = await sb.auth.signInWithPassword({ email, password: pass });
    else if (m === 'signup') res = await sb.auth.signUp({ email, password: pass, options: { emailRedirectTo: redirectTo } });
    else res = await sb.auth.resetPasswordForEmail(email, { redirectTo });
    if (res.error) { S.authMsg = { ok: false, text: res.error.message }; render(); return; }
    if (m === 'signup' && !res.data.session) S.authMsg = { ok: true, text: `We sent a confirmation link to ${email}. Open it, then sign in here.` };
    else if (m === 'forgot') S.authMsg = { ok: true, text: `If ${email} has an account, a reset link is on its way.` };
    else S.authMsg = null;
    if (m !== 'signin') render();
  },
  newpass: async () => {
    const { error } = await sb.auth.updateUser({ password: $('#np-pass').value });
    if (error) { S.authMsg = { ok: false, text: error.message }; render(); return; }
    S.recovery = false; S.authMsg = { ok: true, text: 'Password saved.' }; render();
  },
  subject: async () => {
    const name = $('#ms-name').value.trim(); if (!name) return;
    const bands = Object.keys(BANDS).filter(k => $('#ms-b-' + k).checked);
    if (!bands.length) { toast('Pick at least one level.'); return; }
    let id = slug(name); if (subj(id)) id += '-' + Date.now().toString(36).slice(-3);
    const { error } = await sb.from('subjects').insert({ id, name, hue: +$('#ms-hue').value, bands, sort: S.subjects.length + 1 });
    if (error) { toast(failMsg(error)); return; }
    S.manage.subjectId = id; S.reset = new Set(['ms-name']); await loadLibrary(true); toast(`Added ${name}`);
  },
  topic: async () => {
    const M = S.manage, sid = M.subjectId, title = $('#mt-title').value.trim(); if (!title || !sid) return;
    const ex = M.edit ? topic(M.edit) : null, pick = $('#mt-for').value;
    const cls = CLASSES.includes(pick) ? pick : null, b = cls ? bandOf(cls) : pick;
    let id = ex ? ex.id : `${sid}-${slug(cls || b)}-${slug(title)}`;
    if (!ex && topic(id)) id += '-' + Date.now().toString(36).slice(-3);
    const lesson = $('#mt-lesson').value;
    const row = { id, subject_id: sid, band: b, ...(S.needsClassUpdate ? {} : { class: cls }), title, summary: $('#mt-summary').value.trim(), lesson, sort: ex?.sort ?? (topicsFor(sid, b).length + 1) };
    const { error } = await sb.from('topics').upsert(row);
    if (error) { toast(failMsg(error)); return; }
    S.lessons[id] = lesson; M.edit = null; S.reset = new Set(['mt-title','mt-summary','mt-lesson']);
    await loadLibrary(true); toast(ex ? 'Topic saved' : `Added “${title}”`);
  },
  question: async () => {
    const t = topic(S.manage.topicId); if (!t) return;
    const row = { topic_id: t.id, question: $('#mq-q').value.trim(), options: [0, 1, 2, 3].map(i => $('#mq-o' + i).value.trim()), answer: +$('#mq-ans').value, explanation: $('#mq-exp').value.trim() };
    if (!row.question || row.options.some(o => !o)) return;
    const { error } = await sb.from('questions').insert(row);
    if (error) { toast(failMsg(error)); return; }
    S.reset = new Set(['mq-q','mq-o0','mq-o1','mq-o2','mq-o3','mq-exp']);
    await afterQuestionChange(); toast('Question added'); $('#mq-q')?.focus();
  },
  bulk: async () => {
    const t = topic(S.manage.topicId); if (!t) return;
    const lines = $('#mq-bulk').value.split('\n').map(l => l.trim()).filter(Boolean);
    const rows = [], bad = [];
    lines.forEach((l, n) => {
      const p = l.split('|').map(x => x.trim()), a = LETTERS.indexOf((p[5] || '').toUpperCase());
      if (p.length < 6 || a < 0 || p.slice(0, 5).some(x => !x)) bad.push(n + 1);
      else rows.push({ topic_id: t.id, question: p[0], options: p.slice(1, 5), answer: a, explanation: p.slice(6).join(' | ') });
    });
    if (!rows.length) { toast(bad.length ? `No questions imported. Check line${bad.length > 1 ? 's' : ''} ${bad.join(', ')}.` : 'Paste at least one question.'); return; }
    const { error } = await sb.from('questions').insert(rows);
    if (error) { toast(failMsg(error)); return; }
    if (!bad.length) S.reset = new Set(['mq-bulk']);
    await afterQuestionChange();
    toast(`Imported ${rows.length} question${rows.length === 1 ? '' : 's'}${bad.length ? `. Skipped line${bad.length > 1 ? 's' : ''} ${bad.join(', ')}` : ''}`);
  },
};
document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-form]'); if (!f) return;
  e.preventDefault(); F[f.dataset.form]?.(f);
});

/* ----------------------------------------------------------------- boot -- */
async function boot() {
  window.addEventListener('hashchange', route);
  route();
  if (!sb) { S.ready = true; render(); return; }
  loadLibrary();
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') { S.recovery = true; S.authMsg = null; go('account'); }
    setTimeout(() => handleSession(session), 0);   // don't call Supabase inside this callback
  });
  const { data } = await sb.auth.getSession();
  await handleSession(data.session);
  S.ready = true;
  if (AUTH_HASH) {
    // Tidy the address bar so the token isn't left in it, then show the right screen.
    history.replaceState(null, '', location.pathname + location.search + (authError ? '#/account' : '#/today'));
    if (authError) { S.authMsg = { ok: false, text: authError }; S.authMode = 'signin'; }
    else if (data.session && !S.recovery) toast('You\u2019re signed in. Your email is confirmed.');
    route();
  }
  render();
}
boot();
})();
