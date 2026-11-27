/* =====================================================
   অ্যাকাউন্ট পেজ: কোন অংশ দেখাবে, ফর্ম সাবমিট
   ===================================================== */

const VIEWS = ['signup', 'login', 'password', 'account'];
let loadSeq = 0;

function setMsg(el, text, kind){ el.textContent = text || ''; el.className = 'msg' + (kind ? ' ' + kind : ''); }

// URL-এর # অনুযায়ী অংশ দেখানো; লগইন না থাকলে হিসাব দেখা যাবে না
function route(){
  let view = location.hash.slice(1);
  const s = getSession();
  if (!VIEWS.includes(view)) view = s ? 'account' : 'login';
  if (s && (view === 'login' || view === 'signup')) view = 'account';
  if (!s && (view === 'account' || view === 'password')) view = 'login';

  VIEWS.forEach(v => $(v + 'View').classList.toggle('hidden', v !== view));
  document.querySelector('.wrap').classList.toggle('wide', view === 'account');
  document.querySelectorAll('.msg').forEach(m => setMsg(m, ''));
  document.querySelectorAll('form').forEach(f => f.reset());
  if (view === 'account') loadAccount();
}

function sessionExpired(){
  clearSession();
  location.hash = 'login';
  route();
  setMsg($('loginView').querySelector('.msg'), 'আবার লগ ইন করুন', 'err');
}

async function loadAccount(){
  const seq = ++loadSeq;
  const msg = $('accountMsg');
  $('statement').innerHTML = loadingHTML('হিসাব আনা হচ্ছে…');
  $('defaultNote').classList.add('hidden');
  setMsg(msg, '');
  try{
    const token = getSession().token;
    const r = await customerApi({action: 'myAccount', token});
    if (seq !== loadSeq || !getSession() || getSession().token !== token) return;
    if (r.status === 'ok'){
      saveSession(r);          // Sheet-এ নাম বদলালে এখানেও বদলাবে
      setMsg(msg, '');
      $('statement').innerHTML = statementHTML(r.data);
      $('defaultNote').classList.toggle('hidden', !r.isDefault);
    } else if (r.code === 'BAD_SESSION') sessionExpired();
    else { $('statement').innerHTML = ''; setMsg(msg, r.message || 'সমস্যা হয়েছে', 'err'); }
  }catch(err){
    console.error(err);
    if (seq === loadSeq){ $('statement').innerHTML = ''; setMsg(msg, 'সংযোগে সমস্যা হয়েছে। রিফ্রেশ করুন।', 'err'); }
  }
}

// ফর্ম পাঠানো: build() ভুল পেলে লেখা ফেরত দেয়, ঠিক থাকলে payload
function onSubmit(formId, build, done){
  const form = $(formId);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = form.querySelector('.msg'), btn = form.querySelector('.btn-main');
    if (btn.disabled) return;
    const payload = build();
    if (typeof payload === 'string') return setMsg(msg, payload, 'err');
    btn.disabled = true;
    setMsg(msg, 'অপেক্ষা করুন…');
    try{
      const r = await customerApi(payload);
      if (r.status === 'ok'){ saveSession(r); done(msg); }
      else if (r.code === 'BAD_SESSION') sessionExpired();
      else setMsg(msg, r.message === 'Unknown action' ? 'সার্ভার আপডেট হয়নি' : (r.message || 'সমস্যা হয়েছে'), 'err');
    }catch(err){
      console.error(err);
      setMsg(msg, 'সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'err');
    }
    btn.disabled = false;
  });
}

const goAccount = () => { location.hash = 'account'; };

onSubmit('signupView', () => {
  const name = $('suName').value.trim(), phone = normPhone($('suPhone').value);
  if (!name) return 'নাম লিখুন';
  if (!phone) return 'সঠিক ফোন নম্বর দিন (01XXXXXXXXX)';
  return {action: 'signup', name, phone};
}, goAccount);

onSubmit('loginView', () => {
  const phone = normPhone($('liPhone').value), password = $('liPass').value.trim();
  if (!phone) return 'সঠিক ফোন নম্বর দিন (01XXXXXXXXX)';
  if (!password) return 'পাসওয়ার্ড দিন';
  return {action: 'login', phone, password};
}, goAccount);

onSubmit('passwordView', () => {
  const oldPassword = $('pwOld').value.trim(), newPassword = $('pwNew').value.trim();
  if (!oldPassword) return 'এখনকার পাসওয়ার্ড দিন';
  if (newPassword.length < 4) return 'নতুন পাসওয়ার্ড অন্তত ৪ অক্ষরের দিন';
  if (newPassword !== $('pwAgain').value.trim()) return 'নতুন পাসওয়ার্ড দুই ঘরে মিলছে না';
  return {action: 'changePassword', token: getSession().token, oldPassword, newPassword};
}, msg => { $('passwordView').reset(); setMsg(msg, 'পাসওয়ার্ড বদলানো হয়েছে ✓', 'ok'); });

// পাসওয়ার্ড ভুলে গেলে WhatsApp মেসেজ (নাম ও নম্বরসহ)
$('forgotLink').addEventListener('click', () => {
  let name = '';
  try{ name = localStorage.getItem('hp_last_name') || ''; }catch(e){}
  const msg = `আমি আমার পাসওয়ার্ড ভুলে গেছি।\nনাম: ${name}\nফোন নম্বর: ${$('liPhone').value.trim()}`;
  $('forgotLink').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
});

$('reloadBtn').addEventListener('click', loadAccount);
window.addEventListener('hashchange', route);
route();
