/* =====================================================
   অ্যাডমিন: ট্যাব, সারাংশ, বাকি ফাইল, কাস্টমার
   ===================================================== */

let D = null;
let period = 'today';
let custFilter = 'all';
let payName = '';        // যার টাকা জমার ফর্ম খোলা
let payMode = 'add';     // add = যোগ, set = এডিট
let paySaving = false;
let viewName = '';       // যার হিসাব পেজ খোলা
let viewCache = null;    // {data: D, name, statement}

$('refreshBtn').addEventListener('click', async () => {
  const b = $('refreshBtn');
  b.disabled = true; b.textContent = '…';
  try{
    const r = await api({action: 'dashboard'});
    if (r.status === 'ok'){ D = r.data; renderAll(); }
    else alert(r.message || 'রিফ্রেশ করতে সমস্যা হয়েছে');
  }catch(e){ alert('সংযোগে সমস্যা হয়েছে'); }
  b.disabled = false; b.textContent = '↻ রিফ্রেশ';
});

/* ---------- Tabs ---------- */
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === t));
  ['summary','pending','customers'].forEach(k => $('tab-' + k).classList.toggle('hidden', k !== t.dataset.tab));
}));

/* ---------- Render ---------- */
function renderAll(){
  $('updTime').textContent = 'আপডেট: ' + D.updated;
  renderSummary();
  renderPending();
  renderCustomers();
}

function renderPeriod(){
  const p = D.periods[period];
  $('periodGrid').innerHTML = `
    <div class="mini"><div class="k">প্রিন্ট পেজ</div><div class="v c-gold">${n0(p.pages)}</div></div>
    <div class="mini"><div class="k">ফাইল</div><div class="v">${n0(p.files)}</div></div>
    <div class="mini"><div class="k">মোট বিল</div><div class="v">${tk(p.bill)}</div></div>
    <div class="mini"><div class="k">নগদ আদায়</div><div class="v c-ok">${tk(p.cash)}</div></div>`;
  document.querySelectorAll('#periodSeg button').forEach(b => b.classList.toggle('active', b.dataset.p === period));
}
document.querySelectorAll('#periodSeg button').forEach(b => b.addEventListener('click', () => {
  period = b.dataset.p; if (D) renderPeriod();
}));

function renderSummary(){
  renderPeriod();
  const pg = D.pages, m = D.money, c = D.counts;

  const pct = pg.total > 0 ? Math.min(100, Math.max(0, pg.printed / pg.total * 100)) : 0;
  $('paperBar').style.width = pct + '%';
  $('pgPrinted').textContent = n0(pg.printed);
  $('pgRemain').textContent  = n0(pg.remaining);
  $('pgTotal').textContent   = n0(pg.total);

  const stats = [
    ['মোট প্রিন্ট পেজ',  n0(pg.printed),   'c-gold',   'শুরু থেকে এখন পর্যন্ত'],
    ['বাকি পেজ (কাগজ)', n0(pg.remaining), pg.remaining < 500 ? 'c-danger' : 'c-hi', 'মোট ' + n0(pg.total) + ' পেজের মধ্যে'],
    ['Cash Received',    tk(m.cash),       'c-ok',     'কাস্টমারদের থেকে পাওয়া'],
    ['Due (মোট বাকি)',   tk(m.due),        'c-danger', c.dueCustomers + ' জনের কাছে'],
    ['Advance (অগ্রিম)', tk(m.advance),    'c-gold',   c.advCustomers + ' জনের জমা'],
    ['Hand Cash',        tk(m.hand),       'c-ok',     'Cash − খরচ − Given'],
    ['Expense (খরচ)',    tk(m.expense),    'c-hi',     'Business খরচ'],
    ['Profit',           tk(m.profit),     'c-ok',     'মোট বিল − খরচ']
  ];
  $('statGrid').innerHTML = stats.map(s =>
    `<div class="stat"><div class="k">${s[0]}</div><div class="v ${s[2]}">${s[1]}</div><div class="s">${s[3]}</div></div>`
  ).join('');

  $('expList').innerHTML = D.expenseByType.length
    ? D.expenseByType.map(e =>
        `<div class="row"><span>${esc(e.type || '—')}<span class="tag ${e.source.toLowerCase()==='business'?'biz':''}">${esc(e.source || '—')}</span></span><b>${tk(e.amount)}</b></div>`
      ).join('') +
      `<div class="row"><span>Business মোট</span><b class="c-hi">${tk(m.expense)}</b></div>` +
      `<div class="row"><span>Personal মোট</span><b class="c-hi">${tk(m.personalExpense)}</b></div>`
    : '<div class="empty" style="padding:10px;">কোনো খরচ পাওয়া যায়নি</div>';

  $('footNote').innerHTML =
    `Given: <b>${tk(m.given)}</b> (Summary ট্যাবের A8 থেকে) • নিট বাকি (বিল − নগদ): <b>${tk(m.netDue)}</b>`;
}

function renderPending(){
  const list = D.pending;
  $('pendBadge').textContent = list.length;
  $('pendBadge').classList.toggle('hidden', list.length === 0);
  $('pendSum').innerHTML = list.length
    ? `<span>মোট <b>${list.length}</b> ফাইল</span><span><b>${n0(D.counts.pendingPages)}</b> পেজ প্রিন্ট বাকি</span>`
    : '';

  if (!list.length){
    $('list-pending').innerHTML = '<div class="empty">🎉 সব ফাইল প্রিন্ট হয়ে গেছে</div>';
    return;
  }
  $('list-pending').innerHTML = list.map(p => `
    <div class="pcard" data-row="${p.row}">
      <div class="ph">
        <div class="pn">${esc(p.name)}</div>
        <div class="pt">${esc(p.time)}</div>
      </div>
      <div class="pm">
        ${p.later ? '<span class="chip later">পরে নিবে</span>' : ''}
        ${p.due > 0 ? `<span class="chip due">বাকি ${tk(p.due)}</span>` : ''}
        <br>${esc(p.type)} • ${n0(p.pages)} পেজ/কপি • ${tk(p.price)}
      </div>
      <div class="pa">
        ${p.url ? `<a class="btn-open" href="${esc(p.url)}" target="_blank" rel="noopener">ফাইল খুলুন</a>` : ''}
        <button class="btn-done" data-row="${p.row}">প্রিন্ট হয়েছে ✓</button>
      </div>
    </div>`).join('');
}

$('list-pending').addEventListener('click', async e => {
  const btn = e.target.closest('.btn-done');
  if (!btn) return;
  const row = parseInt(btn.dataset.row, 10);
  const item = D.pending.find(p => p.row === row);
  if (!item) return;
  btn.disabled = true; btn.textContent = 'হচ্ছে…';
  try{
    const r = await api({action: 'markPrinted', row: item.row, name: item.rawName});
    if (r.status === 'ok'){
      D.pending = D.pending.filter(p => p.row !== row);
      D.counts.pendingFiles = D.pending.length;
      D.counts.pendingPages = D.pending.reduce((s, p) => s + (p.pages || 0), 0);
      renderPending();
    } else {
      alert(r.message || 'সমস্যা হয়েছে');
      btn.disabled = false; btn.textContent = 'প্রিন্ট হয়েছে ✓';
    }
  }catch(err){
    alert('সংযোগে সমস্যা হয়েছে');
    btn.disabled = false; btn.textContent = 'প্রিন্ট হয়েছে ✓';
  }
});

function renderCustomers(){
  const viewed = viewName && D.customers.find(c => c.name === viewName);
  if (!viewed) viewName = '';
  $('custTools').classList.toggle('hidden', !!viewed);
  $('list-customers').classList.toggle('detail', !!viewed);
  if (viewed) return renderDetail(viewed);

  const q = $('custSearch').value.trim().toLowerCase();
  const sort = $('custSort').value;

  let list = D.customers.filter(c => {
    if (q && !c.name.toLowerCase().includes(q)) return false;
    if (custFilter === 'due') return c.balance > 0;
    if (custFilter === 'adv') return c.balance < 0;
    return true;
  });

  if (sort === 'amount') list = list.slice().sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

  const dueSum = list.reduce((s, c) => s + (c.balance > 0 ? c.balance : 0), 0);
  const advSum = list.reduce((s, c) => s - (c.balance < 0 ? c.balance : 0), 0);
  $('custSum').innerHTML = `<span><b>${list.length}</b> জন</span><span>বাকি <b class="c-danger">${tk(dueSum)}</b> • অগ্রিম <b class="c-gold">${tk(advSum)}</b></span>`;

  if (!list.length){
    $('list-customers').innerHTML = '<div class="empty">কোনো কাস্টমার পাওয়া যায়নি</div>';
    return;
  }
  $('list-customers').innerHTML = list.map(c => {
    let amt, lbl, cls;
    if (c.balance > 0){ amt = tk(c.balance); lbl = 'বাকি'; cls = 'c-danger'; }
    else if (c.balance < 0){ amt = tk(-c.balance); lbl = 'অগ্রিম'; cls = 'c-gold'; }
    else { amt = '৳0'; lbl = 'পরিশোধিত'; cls = 'c-ok'; }
    return `<div class="crow">
      <div class="open-st" data-view="${esc(c.name)}" role="button" tabindex="0"><div class="cn">${esc(c.name)} ›</div><div class="cs">বিল ${tk(c.bill)} • পরিশোধ ${tk(c.paid)} • ${c.files} ফাইল</div></div>
      <div class="cb"><div class="amt ${cls}">${amt}</div><div class="lbl ${cls}">${lbl}</div></div>
      ${c.name === payName ? payFormHTML(c) : `<button class="btn-pay" data-name="${esc(c.name)}">টাকা জমা / এডিট</button>`}
    </div>`;
  }).join('');
  updatePayPreview();
}

/* ---------- এক কাস্টমারের হিসাব পেজ ---------- */
function renderDetail(c){
  const cached = viewCache && viewCache.data === D && viewCache.name === c.name;
  $('list-customers').innerHTML = `
    <button class="btn-pay btn-back">← সব কাস্টমার</button>
    <div class="crow">
      ${c.name === payName ? `<div><div class="cn">${esc(c.name)}</div></div>${payFormHTML(c)}`
        : `<button class="btn-pay" data-name="${esc(c.name)}">টাকা জমা / এডিট</button>`}
    </div>
    <div id="custStatement">${cached ? statementHTML(viewCache.statement) : '<div class="st-empty">হিসাব আনা হচ্ছে…</div>'}</div>`;
  updatePayPreview();
  if (!cached) loadStatement(c.name);
}

async function loadStatement(name){
  const data = D;
  let error;
  try{
    const r = await api({action: 'statement', name});
    if (r.status === 'ok') viewCache = {data, name, statement: r.data};
    else error = r.message === 'Unknown action' ? 'আগে নতুন Code.js টি deploy করুন' : r.message;
  }catch(e){ error = 'সংযোগে সমস্যা হয়েছে। রিফ্রেশ করুন।'; }
  if (D !== data || viewName !== name) return;      // এর মধ্যে অন্য পেজে গেছে
  $('custStatement').innerHTML = error
    ? `<div class="st-empty">${esc(error)}</div>` : statementHTML(viewCache.statement);
}

/* ---------- টাকা জমা (শেষ প্রিন্টের row-তে) ---------- */
function payFormHTML(c){
  const l = c.last;
  if (!l) return '<div class="pay">এই সুবিধা চালু করতে নতুন Code.js টি Apps Script এ deploy করুন।</div>';
  return `<div class="pay">
    <div class="pay-info">
      শেষ প্রিন্ট: ${esc(l.time || '—')} • ${esc(l.type || '—')}<br>
      ওই row-তে বিল <b>${tk(l.bill)}</b> • আগে জমা <b>${tk(l.paid)}</b>
    </div>
    <div class="seg">
      <button data-m="add" class="${payMode === 'add' ? 'active' : ''}">টাকা যোগ করুন</button>
      <button data-m="set" class="${payMode === 'set' ? 'active' : ''}">জমা এডিট করুন</button>
    </div>
    <input type="text" id="payInput" inputmode="decimal" autocomplete="off"
      placeholder="${payMode === 'add' ? 'কত টাকা দিল' : 'মোট জমা কত হবে'}"
      value="${payMode === 'set' ? l.paid : ''}">
    <div class="pay-preview" id="payPreview"></div>
    <div class="pa">
      <button class="btn-open btn-cancel">বাতিল</button>
      <button class="btn-done btn-save" disabled>সেভ করুন</button>
    </div>
  </div>`;
}

// ইনপুট থেকে নতুন হিসাব; ভুল বা অপরিবর্তিত হলে null
function payCalc(){
  const c = D.customers.find(x => x.name === payName);
  const input = $('payInput');
  if (!c || !input) return null;
  const v = input.value.trim();
  if (!/^(\d+(\.\d{0,2})?|\.\d{1,2})$/.test(v)) return null;
  const round = n => Math.round(n * 100) / 100;
  const newPaid = round(payMode === 'add' ? c.last.paid + Number(v) : Number(v));
  if (newPaid === round(c.last.paid)) return null;
  return { c, newPaid, balance: round(c.balance - (newPaid - c.last.paid)) };
}

const balanceText = b => b > 0 ? 'বাকি ' + tk(b) : b < 0 ? 'অগ্রিম ' + tk(-b) : 'পরিশোধিত';

function updatePayPreview(){
  if (!$('payInput')) return;
  const r = payCalc();
  $('payPreview').innerHTML = r
    ? `ওই row-তে জমা হবে <b>${tk(r.newPaid)}</b> • হিসাব হবে <b>${balanceText(r.balance)}</b>`
    : '';
  document.querySelector('.btn-save').disabled = !r || paySaving;
}

async function savePay(){
  const r = payCalc();
  if (!r || paySaving) return;
  const l = r.c.last;
  if (!confirm(`${r.c.name}\nজমা: ${tk(l.paid)} → ${tk(r.newPaid)}\nহিসাব হবে: ${balanceText(r.balance)}\n\nসেভ করবেন?`)) return;
  paySaving = true;
  const btn = document.querySelector('.btn-save');
  btn.disabled = true; btn.textContent = 'হচ্ছে…';
  try{
    const res = await api({action: 'setPaid', row: l.row, name: r.c.name, oldPaid: l.paid, newPaid: r.newPaid});
    if (res.status === 'ok'){
      D = res.data; payName = '';
      renderAll();
      alert('টাকা সেভ হয়েছে ✓');
    } else {
      alert(res.message || 'সমস্যা হয়েছে');
    }
  }catch(err){
    alert('সংযোগে সমস্যা হয়েছে। রিফ্রেশ করে দেখুন টাকা সেভ হয়েছে কিনা।');
  }
  paySaving = false;
  if ($('payInput')){ btn.textContent = 'সেভ করুন'; updatePayPreview(); }
}

$('list-customers').addEventListener('click', e => {
  const open = e.target.closest('.btn-pay');
  const mode = e.target.closest('.pay .seg button');
  const view = e.target.closest('[data-view]');
  if (e.target.closest('.btn-save')) return savePay();
  if (paySaving) return;
  if (view){ viewName = view.dataset.view; payName = ''; viewCache = null; window.scrollTo(0, 0); }
  else if (e.target.closest('.btn-back')){ viewName = ''; payName = ''; }
  else if (open){ payName = open.dataset.name; payMode = 'add'; }
  else if (mode){ payMode = mode.dataset.m; }
  else if (e.target.closest('.btn-cancel')){ payName = ''; }
  else return;
  renderCustomers();
  if ($('payInput')) $('payInput').focus();
});
$('list-customers').addEventListener('input', e => { if (e.target.id === 'payInput') updatePayPreview(); });
$('list-customers').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (e.target.id === 'payInput') savePay();
  else if (e.target.dataset.view) e.target.click();
});

$('custSearch').addEventListener('input', () => D && renderCustomers());
$('custSort').addEventListener('change', () => D && renderCustomers());
document.querySelectorAll('#custChips button').forEach(b => b.addEventListener('click', () => {
  custFilter = b.dataset.f;
  document.querySelectorAll('#custChips button').forEach(x => x.classList.toggle('active', x === b));
  if (D) renderCustomers();
}));
