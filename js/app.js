/* =====================================================
   কাস্টমার পেজ চালু করা: বাটন, ইনপুট ও অর্ডার সাবমিট
   ===================================================== */

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const filesList = document.getElementById('filesList');
const custNameInput = document.getElementById('custName');
const custPhoneInput = document.getElementById('custPhone');
const amountPaidInput = document.getElementById('amountPaid');
const collectLater = document.getElementById('collectLater');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const statusBox = document.getElementById('statusBox');
const rTotal = document.getElementById('rTotal');

let filesData = [];      // array of file "entry" objects — one per uploaded file
let idSeq = 0;
let currentTotal = 0;

function setStatus(kind, msg){
  statusBox.className = 'status-box show ' + kind;
  statusBox.textContent = msg;
}

// অর্ডার জমা হলে শুধু এই বার্তা। হিসাব দেখতে লগ ইন (লগইন থাকলে সরাসরি "আমার হিসাব")
function showSuccess(loggedIn, accountCreated){
  const link = (href, text) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    a.style.cssText = 'color:inherit; text-decoration:underline; font-weight:700;';
    return a;
  };

  const sub = document.createElement('div');
  sub.style.cssText = 'font-weight:500; font-size:12.5px; margin-top:2px;';
  if (loggedIn){
    sub.append('সকল হিসাব দেখতে ', link('account#account', 'আমার হিসাব'), ' এ যান।');
  } else if (accountCreated){
    sub.append('আপনার অ্যাকাউন্ট খোলা হয়েছে। ফোন নম্বর ও পাসওয়ার্ড 01234 দিয়ে ',
               link('account#login', 'লগ ইন'), ' করে সব হিসাব দেখুন।');
  } else {
    sub.append('সকল হিসাব দেখতে ', link('account#login', 'লগ ইন করুন'), '।');
  }

  statusBox.className = 'status-box show success';
  statusBox.textContent = '✓ অর্ডার সফলভাবে জমা হয়েছে!';
  statusBox.appendChild(sub);
  statusBox.scrollIntoView({behavior:'smooth', block:'nearest'});
}

dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag'));
dropzone.addEventListener('drop', e => {
  e.preventDefault(); dropzone.classList.remove('drag');
  if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', e => {
  if (e.target.files.length) addFiles(e.target.files);
  fileInput.value = '';
});

// ---- Event delegation for per-card controls (remove / copies / range / print type) ----
filesList.addEventListener('click', e => {
  const card = e.target.closest('.file-card');
  if (!card) return;
  const entry = filesData.find(f => f.id === card.dataset.id);
  if (!entry) return;
  const action = e.target.dataset.action;
  if (action === 'remove'){
    filesData = filesData.filter(f => f.id !== entry.id);
    card.remove();
    recalcAll();
  } else if (action === 'inc'){
    entry.copies = (parseInt(entry.copies) || 1) + 1;
    card.querySelector('.copySet').value = entry.copies;
    recalcAll();
  } else if (action === 'dec'){
    entry.copies = Math.max(1, (parseInt(entry.copies) || 1) - 1);
    card.querySelector('.copySet').value = entry.copies;
    recalcAll();
  }
});

filesList.addEventListener('input', e => {
  const card = e.target.closest('.file-card');
  if (!card) return;
  const entry = filesData.find(f => f.id === card.dataset.id);
  if (!entry) return;
  if (e.target.classList.contains('copySet')){
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    entry.copies = parseInt(e.target.value) || 1;
    recalcAll();
  }
});

filesList.addEventListener('change', e => {
  const card = e.target.closest('.file-card');
  if (!card) return;
  const entry = filesData.find(f => f.id === card.dataset.id);
  if (!entry) return;
  if (e.target.classList.contains('printType')){
    entry.printType = e.target.value;
    recalcAll();
  }
});

custNameInput.addEventListener('input', () => recalcAll());

// লগইন করা থাকলে নাম অ্যাকাউন্ট থেকে আসবে, ফোন নম্বর লাগবে না
function applySession(){
  const s = getSession();
  custNameInput.readOnly = !!s;
  if (s) custNameInput.value = s.name;
  document.getElementById('phoneField').classList.toggle('hidden', !!s);
  recalcAll();
}

// Sheet-এ নাম বা পাসওয়ার্ড বদলেছে কিনা দেখা
async function refreshSession(){
  const s = getSession();
  if (!s) return;
  try{
    const r = await customerApi({action: 'myAccount', token: s.token});
    if (!getSession() || getSession().token !== s.token) return;
    if (r.status === 'ok') saveSession(r);
    else if (r.code === 'BAD_SESSION'){ clearSession(); custNameInput.value = ''; }
    applySession();
  }catch(err){ console.error(err); }
}

// Amount Paid: ডিফল্ট 0, শুধু সংখ্যা (ও একটি দশমিক বিন্দু) লেখা যাবে
function getAmountPaid(){
  const v = amountPaidInput.value.trim();
  return (v === '' || v === '.') ? '0' : v;
}

amountPaidInput.addEventListener('focus', () => amountPaidInput.select());

amountPaidInput.addEventListener('input', () => {
  let v = amountPaidInput.value.replace(/[^0-9.]/g, '');
  const firstDot = v.indexOf('.');
  if (firstDot !== -1) v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
  v = v.replace(/^0+(?=\d)/, '');          // 05 → 5
  amountPaidInput.value = v;
  updateSubmitState(filesData.length > 0 && filesData.every(f => f.ready), currentTotal);
});

amountPaidInput.addEventListener('blur', () => {
  amountPaidInput.value = getAmountPaid();
});

function resetForm(){
  custNameInput.value = '';
  custPhoneInput.value = '';
  amountPaidInput.value = '0';
  collectLater.checked = false;
  filesData = [];
  filesList.innerHTML = '';
  applySession();
}

clearBtn.addEventListener('click', () => {
  lastOrder = { body: '', id: '' };
  resetForm();
  statusBox.classList.remove('show');
});

let lastOrder = { body: '', id: '' };

submitBtn.addEventListener('click', async () => {
  if (submitBtn.disabled) return;

  const session = getSession();
  const phoneText = session ? '' : custPhoneInput.value.trim();
  if (phoneText && !normPhone(phoneText)){
    setStatus('error', 'ফোন নম্বর ঠিক নয় (01XXXXXXXXX)। ঠিক করুন বা ঘরটা ফাঁকা রাখুন।');
    return;
  }

  let name = custNameInput.value.trim();
  if (collectLater.checked) name = '[পরে নিবে] ' + name;

  const payload = {
    name: name,
    token: session ? session.token : '',
    phone: normPhone(phoneText),
    amountPaid: getAmountPaid(),
    totalBill: currentTotal.toFixed(1),
    files: filesData.map(e => ({
      printType: e.printType,
      copies: e.copies,
      pagesUsed: e.pageCountUsed,
      price: (e.price || 0).toFixed(1),
      fileName: e.file.name,
      fileMimeType: e.file.type,
      fileBase64: e.dataUrl ? e.dataUrl.slice(e.dataUrl.indexOf(',') + 1) : ''
    }))
  };

  submitBtn.disabled = true;

  // একই অর্ডার আবার পাঠালে একই আইডি যাবে, তাই সার্ভারে দুইবার জমা হবে না
  const body = JSON.stringify(payload);
  if (body !== lastOrder.body) lastOrder = { body, id: Date.now().toString(36) + Math.random().toString(36).slice(2) };
  payload.requestId = lastOrder.id;

  startProgress(filesData.reduce((s, e) => s + e.file.size, 0));
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), SEND_TIMEOUT);

  try {
    const result = await sendOrder(payload, abort.signal);
    stopProgress();

    if (result.status === 'ok') {
      lastOrder = { body: '', id: '' };
      submitBtn.textContent = 'Submit Order →';
      resetForm();
      showSuccess(!!session, !!result.accountCreated);
    } else if (result.code === 'BAD_SESSION') {
      clearSession(); custNameInput.value = '';
      applySession();
      submitBtn.textContent = 'Submit Order →';
      setStatus('error', 'লগইনের মেয়াদ শেষ। আবার লগ ইন করে সাবমিট করুন, অথবা নাম লিখে সাবমিট করুন।');
    } else {
      throw new Error(result.message || 'unknown error');
    }
  } catch (err) {
    console.error(err);
    stopProgress();
    showFailure();
    submitBtn.textContent = 'Submit Order →';
    submitBtn.disabled = false;
  } finally {
    clearTimeout(timeout);
  }
});

applySession();
refreshSession();
