/* =====================================================
   কাস্টমার পেজ চালু করা: বাটন, ইনপুট ও অর্ডার সাবমিট
   ===================================================== */

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const filesList = document.getElementById('filesList');
const custNameInput = document.getElementById('custName');
const amountPaidInput = document.getElementById('amountPaid');
const collectLater = document.getElementById('collectLater');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const statusBox = document.getElementById('statusBox');
const rTotal = document.getElementById('rTotal');
const waOrderBox = document.getElementById('waOrderBox');
const accountBox = document.getElementById('accountBox');
const waOrderBtn = document.getElementById('waOrderBtn');

let filesData = [];      // array of file "entry" objects — one per uploaded file
let idSeq = 0;
let currentTotal = 0;

function setStatus(kind, msg){
  statusBox.className = 'status-box show ' + kind;
  statusBox.textContent = msg;
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

custNameInput.addEventListener('input', () => {
  accountLocked = false;
  recalcAll();
  lookupBalance();
});

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
  renderLiveAccount();
});

amountPaidInput.addEventListener('blur', () => {
  amountPaidInput.value = getAmountPaid();
});

function resetForm(){
  custNameInput.value = '';
  amountPaidInput.value = '0';
  collectLater.checked = false;
  filesData = [];
  filesList.innerHTML = '';
  recalcAll();
}

clearBtn.addEventListener('click', () => {
  accountLocked = false; prevDue = 0; prevFound = false;
  resetForm();
  statusBox.classList.remove('show');
  waOrderBox.classList.remove('show'); accountBox.classList.remove('show');
});

submitBtn.addEventListener('click', async () => {
  if (submitBtn.disabled) return;

  let name = custNameInput.value.trim();
  if (collectLater.checked) name = '[পরে নিবে] ' + name;

  const payload = {
    name: name,
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

  // reset এর আগে অর্ডারের কপি রাখা হচ্ছে (WhatsApp মেসেজের জন্য)
  const orderSnapshot = {
    name: custNameInput.value.trim(),
    collectLater: collectLater.checked,
    amountPaid: getAmountPaid(),
    total: currentTotal,
    items: filesData.map(e => ({
      fileName: e.file.name,
      printType: e.printType,
      copies: e.copies,
      total: e.total || 0
    }))
  };
  waOrderBox.classList.remove('show'); accountBox.classList.remove('show');

  submitBtn.disabled = true;
  submitBtn.textContent = 'পাঠানো হচ্ছে…';
  setStatus('sending', 'অর্ডার পাঠানো হচ্ছে…');

  try {
    const result = await sendOrder(payload);

    if (result.status === 'ok') {
      setStatus('success', `অর্ডার সফলভাবে জমা হয়েছে!`);
      submitBtn.textContent = 'Submit Order →';
      showAccount(orderSnapshot, result.previousDue || 0);
      showWhatsAppOrder(orderSnapshot, result.fileUrls || [], result.previousDue || 0);
      accountLocked = true;   // submit-এর পর final হিসাব দেখানো থাকবে
      prevDue = 0; prevFound = false;
      resetForm();
    } else {
      throw new Error(result.message || 'unknown error');
    }
  } catch (err) {
    console.error(err);
    setStatus('error', 'সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    submitBtn.textContent = 'Submit Order →';
    submitBtn.disabled = false;
  }
});

recalcAll();
