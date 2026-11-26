/* =====================================================
   অ্যাডমিন: ট্যাব, সারাংশ, বাকি ফাইল, কাস্টমার
   ===================================================== */

let D = null;
let period = 'today';
let custFilter = 'all';

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
      <div><div class="cn">${esc(c.name)}</div><div class="cs">বিল ${tk(c.bill)} • পরিশোধ ${tk(c.paid)} • ${c.files} ফাইল</div></div>
      <div class="cb"><div class="amt ${cls}">${amt}</div><div class="lbl ${cls}">${lbl}</div></div>
    </div>`;
  }).join('');
}

$('custSearch').addEventListener('input', () => D && renderCustomers());
$('custSort').addEventListener('change', () => D && renderCustomers());
document.querySelectorAll('#custChips button').forEach(b => b.addEventListener('click', () => {
  custFilter = b.dataset.f;
  document.querySelectorAll('#custChips button').forEach(x => x.classList.toggle('active', x === b));
  if (D) renderCustomers();
}));
