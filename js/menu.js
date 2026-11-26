/* =====================================================
   বাম পাশের মেনু (⋮)
   ===================================================== */

function buildMenu(){
  const s = getSession();
  const item = (href, icon, text, id) =>
    `<a href="${href}"${id ? ` id="${id}"` : ''}><span>${icon}</span>${text}</a>`;

  $('drawer').innerHTML =
    `<div class="drawer-head">Hall Printing Service${s ? `<small>${esc(s.name)}</small>` : ''}</div>` +
    item('index.html', '🖨️', 'অর্ডার করুন') +
    (s
      ? item('account.html#account', '📒', 'আমার হিসাব') +
        item('account.html#password', '🔑', 'পাসওয়ার্ড বদলান') +
        item('#', '↩️', 'লগ আউট', 'menuLogout')
      : item('account.html#signup', '📝', 'সাইন আপ') +
        item('account.html#login', '👤', 'লগ ইন')) +
    '<hr>' +
    item('admin.html', '⚙️', 'অ্যাডমিন');
}

function setMenu(open){
  if (open) buildMenu();
  $('drawer').classList.toggle('open', open);
  $('drawerShade').classList.toggle('open', open);
}

$('menuBtn').addEventListener('click', () => setMenu(true));
$('drawerShade').addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
$('drawer').addEventListener('click', e => {
  const a = e.target.closest('a');
  if (!a) return;
  if (a.id === 'menuLogout'){
    e.preventDefault();
    clearSession();
    location.href = 'index.html';
    return;
  }
  setMenu(false);
});
