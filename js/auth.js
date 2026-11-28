/* =====================================================
   অ্যাডমিন: PIN লগইন ও লগআউট
   ===================================================== */

let PIN = '';

/* ---------- Login ---------- */
function setLoginMsg(t, err){ const m = $('loginMsg'); m.textContent = t || ''; m.className = 'msg' + (err ? ' err' : ''); }

// কাস্টমার লগইন থাকলে অ্যাডমিনে ঢোকা যাবে না: আগে লগ আউট করতে হবে
function blockedByCustomer(){
  if (!getSession()) return false;
  try{ sessionStorage.removeItem('hp_pin'); }catch(e){}
  location.replace('account');
  return true;
}

async function login(pin){
  if (blockedByCustomer()) return;
  PIN = pin;
  $('loginBtn').disabled = true;
  setLoginMsg('চেক করা হচ্ছে…');
  try{
    const r = await api({action: 'dashboard'});
    if (r.status === 'ok'){
      try{ sessionStorage.setItem('hp_pin', pin); }catch(e){}
      D = r.data;
      $('loginView').classList.add('hidden');
      $('appView').classList.remove('hidden');
      renderAll();
    } else {
      PIN = '';
      try{ sessionStorage.removeItem('hp_pin'); }catch(e){}
      $('loginView').classList.remove('hidden');
      $('appView').classList.add('hidden');
      setLoginMsg(r.message || 'ভুল হয়েছে', true);
    }
  }catch(err){
    console.error(err);
    PIN = '';
    setLoginMsg('সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।', true);
  }
  $('loginBtn').disabled = false;
}

$('loginBtn').addEventListener('click', () => {
  const p = $('pinInput').value.trim();
  if (p) login(p);
});
$('pinInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('loginBtn').click(); });

$('logoutBtn').addEventListener('click', () => {
  try{ sessionStorage.removeItem('hp_pin'); }catch(e){}
  PIN = ''; D = null; payName = ''; viewName = ''; viewCache = null;
  closeAdd();
  clearAccounts();
  showTab('summary');
  $('pinInput').value = '';
  setLoginMsg('');
  $('appView').classList.add('hidden');
  $('loginView').classList.remove('hidden');
});

window.addEventListener('pageshow', e => { if (e.persisted) blockedByCustomer(); });
window.addEventListener('storage', e => { if (e.key === 'hp_session') blockedByCustomer(); });

/* ---------- Auto-login (একই ট্যাবে রিফ্রেশ দিলে আবার PIN লাগবে না) ---------- */
(function(){
  if (blockedByCustomer()) return;
  let saved = '';
  try{ saved = sessionStorage.getItem('hp_pin') || ''; }catch(e){}
  if (saved) login(saved);
})();
