/* =====================================================
   বাম পাশের মেনু (☰)
   ===================================================== */

(function(){
  // অ্যাডমিন লগইন পেজে আইডিগুলো site... দিয়ে শুরু (অ্যাডমিনের নিজের মেনু আলাদা)
  const site = !!$('siteDrawer');
  const drawer = $(site ? 'siteDrawer' : 'drawer');
  const shade = $(site ? 'siteDrawerShade' : 'drawerShade');
  const button = $(site ? 'siteMenuBtn' : 'menuBtn');

  function buildMenu(){
    const s = getSession();
    const path = location.pathname;
    const here = /account(\.html)?$/.test(path) ? 'account' + location.hash
               : /admin(\.html)?$/.test(path) ? 'admin' : './';
    const item = (href, icon, text, id) =>
      `<a href="${href}"${id ? ` id="${id}"` : ''}${href === here ? ' class="active"' : ''}><span>${icon}</span>${text}</a>`;
    const outside = (href, icon, text) =>
      `<a href="${href}" target="_blank" rel="noopener"><span>${icon}</span>${text}</a>`;

    drawer.innerHTML =
      `<div class="drawer-head">Hall Printing Service${s ? `<small>${esc(s.name)}</small>` : ''}</div>` +
      item('./', '🖨️', 'অর্ডার করুন') +
      (s
        ? item('account#account', '📒', 'আমার হিসাব') +
          item('account#password', '🔑', 'পাসওয়ার্ড বদলান') +
          item('#', '↩️', 'লগ আউট', 'menuLogout')
        : item('account#signup', '📝', 'সাইন আপ') +
          item('account#login', '👤', 'লগ ইন')) +
      '<hr><div class="drawer-label">যোগাযোগ</div>' +
      outside(`https://wa.me/${WHATSAPP_NUMBER}`, '💬', 'WhatsApp') +
      outside(FACEBOOK_URL, '✉️', 'Facebook মেসেজ') +
      '<hr>' +
      item('admin', '⚙️', 'অ্যাডমিন');
  }

  function setMenu(open){
    drawer.classList.toggle('open', open);
    shade.classList.toggle('open', open);
  }

  button.addEventListener('click', () => setMenu(true));
  shade.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  drawer.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    if (a.id === 'menuLogout'){
      e.preventDefault();
      clearSession();
      location.href = './';
      return;
    }
    setMenu(false);
  });

  // PC-তে মেনু সবসময় দেখা যায়, তাই শুরুতেই বানাতে হবে
  window.addEventListener('hashchange', buildMenu);
  window.buildMenu = buildMenu;       // লগইন বদলালে session.js এটা ডাকে
  buildMenu();
})();
