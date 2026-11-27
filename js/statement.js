/* =====================================================
   কাস্টমারের হিসাবের টেবিল (অ্যাকাউন্ট পেজ ও অ্যাডমিন দুই জায়গায়)
   balance: ঋণাত্মক = বাকি (লাল), ধনাত্মক = অগ্রিম (সবুজ)
   ===================================================== */

function loadingHTML(text){
  return `<div class="loading"><i class="spinner"></i>${esc(text)}</div>`;
}

function statementHTML(s){
  const money = v => Number(v || 0).toLocaleString('en-US', {maximumFractionDigits: 2});
  const cls = v => v < 0 ? 'neg' : v > 0 ? 'pos' : '';
  const t = s.totals;
  const status = t.balance < 0 ? 'Due ' + money(-t.balance)
               : t.balance > 0 ? 'Advance ' + money(t.balance)
               : 'Paid';
  const box = (k, v, c) => `<div><small>${k}</small><b class="${c || ''}">${v}</b></div>`;

  const body = s.rows.map(r => `<tr>
      <td>${esc(r.time)}</td>
      <td>${esc(r.type.replace(/\s*\(.*?\)/g, '') || '—')}</td>
      <td>${money(r.price)}</td>
      <td>${money(r.pages)}</td>
      <td>${money(r.bill)}</td>
      <td>${money(r.paid)}</td>
      <td class="${cls(r.balance)}">${money(r.balance)}</td>
    </tr>`).join('');

  return `<div class="st-head">
      <div class="st-name">${esc(s.name)}</div>
      <div class="st-phone">${esc(s.phone || '')}</div>
    </div>
    <div class="st-totals">
      ${box('Total Pages', money(t.pages))}
      ${box('Total Orders', money(t.orders))}
      ${box('Total Bill', money(t.bill))}
      ${box('Total Paid', money(t.paid))}
      ${box('Balance', money(t.balance), cls(t.balance))}
      ${box('Status', status, cls(t.balance))}
    </div>
    ${s.rows.length ? `<div class="st-scroll"><table class="st-table">
      <thead><tr><th>Date &amp; Time</th><th>Print Type</th><th>Price</th><th>Pages</th><th>Total Bill</th><th>Paid</th><th>Balance</th></tr></thead>
      <tbody>${body}</tbody>
    </table></div>` : '<div class="st-empty">এখনো কোনো হিসাব নেই।</div>'}`;
}
