/* =====================================================
   অ্যাডমিন: কাস্টমারের পাসওয়ার্ড দেখা ও WhatsApp-এ পাঠানো
   ===================================================== */

let accounts = null;
let accountsSeq = 0;

function clearAccounts(){
  accounts = null;
  accountsSeq++;                      // চলমান অনুরোধের উত্তর আর দেখানো হবে না
  $('passSearch').value = '';
  $('passSum').innerHTML = '';
  $('list-passwords').innerHTML = '';
}

async function loadAccounts(){
  const seq = ++accountsSeq;
  accounts = null;
  $('passSum').innerHTML = '';
  $('list-passwords').innerHTML = loadingHTML('পাসওয়ার্ড আনা হচ্ছে…');
  let error;
  try{
    const r = await api({action: 'accounts'});
    if (seq !== accountsSeq) return;
    if (r.status === 'ok') accounts = r.data;
    else error = r.message === 'Unknown action' ? 'আগে নতুন Code.js টি deploy করুন' : r.message;
  }catch(e){
    if (seq !== accountsSeq) return;
    error = 'সংযোগে সমস্যা হয়েছে। রিফ্রেশ করুন।';
  }
  if (error) $('list-passwords').innerHTML = `<div class="empty">${esc(error)}</div>`;
  else renderAccounts();
}

// মেসেজ সবসময় Accounts ট্যাবে থাকা নম্বরেই যাবে
function passwordLink(a){
  const values = {
    name: a.name,
    phone: a.phone,
    password: a.password,
    link: new URL('account#password', location.href).href
  };
  const text = PASSWORD_MESSAGE.replace(/\{(name|phone|password|link)\}/g, (m, k) => values[k]);
  return `https://wa.me/88${a.phone}?text=${encodeURIComponent(text)}`;
}

function renderAccounts(){
  if (!accounts) return;
  const q = $('passSearch').value.trim().toLowerCase();
  const digits = normPhone(q) || q;
  const list = accounts.filter(a => !q || a.name.toLowerCase().includes(q) || a.phone.includes(digits));

  $('passSum').innerHTML = `<span><b>${list.length}</b> জন</span>`;
  $('list-passwords').innerHTML = list.length ? list.map(a => `
    <div class="acard">
      <div class="ai">
        <div class="an">${esc(a.name || '—')}</div>
        <div class="ap">${esc(a.phone || 'নম্বর ঠিক নয়')}</div>
        <div class="ap">পাসওয়ার্ড: <b>${esc(a.password || '—')}</b></div>
      </div>
      ${a.phone && a.password
        ? `<a class="btn-send" href="${esc(passwordLink(a))}" target="_blank" rel="noopener">Send</a>`
        : ''}
    </div>`).join('') : '<div class="empty">কোনো অ্যাকাউন্ট পাওয়া যায়নি</div>';
}

$('passSearch').addEventListener('input', renderAccounts);
$('refreshBtn').addEventListener('click', () => {
  if (!$('tab-passwords').classList.contains('hidden')) loadAccounts();
});
