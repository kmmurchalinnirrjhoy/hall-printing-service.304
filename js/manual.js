/* =====================================================
   অ্যাডমিন: ফাইল ছাড়া নতুন এন্ট্রি (＋ এড বাটন)
   ===================================================== */

let addRequestId = '';   // একই এন্ট্রি দুইবার সেভ হওয়া আটকায়
let addSaving = false;

const cleanName = s => String(s || '').replace(/\s+/g, ' ').trim();
const findCustomer = name => D.customers.find(c => c.name.toLowerCase() === cleanName(name).toLowerCase());

function setAddMsg(t, err){ const m = $('addMsg'); m.textContent = t || ''; m.className = 'msg' + (err ? ' err' : ''); }

function openAdd(){
  if (!D) return;
  $('addForm').reset();
  addRequestId = '';
  setAddMsg('');
  $('addSuggest').classList.add('hidden');
  $('addNameHint').textContent = '';
  $('addModal').classList.remove('hidden');
  $('addName').focus();
}

function closeAdd(){ $('addModal').classList.add('hidden'); }

// নাম লিখলে আগের কাস্টমারদের থেকে মিল দেখানো (শুরুতে মিল আগে)
function showSuggestions(){
  const q = cleanName($('addName').value).toLowerCase();
  const list = !q ? [] : D.customers
    .filter(c => c.name.toLowerCase().includes(q) && c.name.toLowerCase() !== q)
    .sort((a, b) => b.name.toLowerCase().startsWith(q) - a.name.toLowerCase().startsWith(q))
    .slice(0, 6);
  $('addSuggest').innerHTML = list.map(c =>
    `<button type="button" data-name="${esc(c.name)}"><span>${esc(c.name)}</span><small>${balanceText(c.balance)}</small></button>`
  ).join('');
  $('addSuggest').classList.toggle('hidden', list.length === 0);
}

function showNameHint(){
  const name = cleanName($('addName').value);
  const c = name && findCustomer(name);
  $('addNameHint').textContent = !name ? ''
    : c ? 'পুরনো কাস্টমার • আগের হিসাব: ' + balanceText(c.balance)
        : $('addSuggest').children.length ? 'তালিকা থেকে বেছে নিন, না হলে নতুন কাস্টমার হিসেবে যোগ হবে'
        : 'নতুন কাস্টমার হিসেবে যোগ হবে';
}

// ফাঁকা ঘর = 0, ভুল লেখা = NaN
function readNumber(id, wholeOnly){
  const v = $(id).value.trim();
  if (v === '') return 0;
  const ok = wholeOnly ? /^\d+$/ : /^(\d+(\.\d{0,2})?|\.\d{1,2})$/;
  return ok.test(v) ? Number(v) : NaN;
}

async function saveAdd(){
  if (addSaving) return;
  const typed = cleanName($('addName').value);
  const old = typed && findCustomer(typed);
  const name = old ? old.name : typed;     // পুরনো নাম হলে আগের বানানেই সেভ হবে
  const pages = readNumber('addPages', true);
  const bill = readNumber('addBill');
  const paid = readNumber('addPaid');

  if (!name) return setAddMsg('নাম লিখুন', true);
  if (name.startsWith('=')) return setAddMsg('নাম = দিয়ে শুরু হতে পারবে না', true);
  if ([pages, bill, paid].some(Number.isNaN)) return setAddMsg('পেপার ও টাকার ঘরে ঠিকমতো সংখ্যা লিখুন', true);
  if (!pages && !bill && !paid) return setAddMsg('পেপার, বিল বা টাকা অন্তত একটা দিন', true);
  if (!confirm(`${name}${old ? '' : ' (নতুন)'}\nপেপার: ${n0(pages)}\nবিল: ${tk(bill)}\nদিল: ${tk(paid)}\n\nসেভ করবেন?`)) return;

  addRequestId = addRequestId || Date.now().toString(36) + Math.random().toString(36).slice(2);
  addSaving = true;
  $('addSave').disabled = $('addCancel').disabled = true;
  setAddMsg('সেভ হচ্ছে…');
  try{
    const r = await api({action: 'addEntry', requestId: addRequestId, name, pages, bill, paid});
    if (r.status === 'ok'){
      D = r.data;
      renderAll();
      closeAdd();
      alert('নতুন এন্ট্রি সেভ হয়েছে ✓');
    } else {
      setAddMsg(r.message === 'Unknown action'
        ? 'আগে নতুন Code.js টি Apps Script এ deploy করুন'
        : (r.message || 'সমস্যা হয়েছে'), true);
    }
  }catch(err){
    console.error(err);
    setAddMsg('সংযোগে সমস্যা হয়েছে। আবার "সেভ করুন" চাপুন।', true);
  }
  addSaving = false;
  $('addSave').disabled = $('addCancel').disabled = false;
}

$('addBtn').addEventListener('click', openAdd);
$('addCancel').addEventListener('click', closeAdd);
$('addForm').addEventListener('submit', e => { e.preventDefault(); saveAdd(); });
$('addForm').addEventListener('input', e => {
  addRequestId = '';       // লেখা বদলালে এটা নতুন এন্ট্রি
  setAddMsg('');
  if (e.target.id === 'addName'){ showSuggestions(); showNameHint(); }
});
$('addSuggest').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  $('addName').value = b.dataset.name;
  addRequestId = '';
  $('addSuggest').classList.add('hidden');
  showNameHint();
  $('addPages').focus();
});
