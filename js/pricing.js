/* =====================================================
   দাম হিসাব ও মোট বিল
   ===================================================== */

// ---- Per-file cost calculation (mirrors the original single-file logic) ----
function recalcOne(entry){
  const copies = Math.max(1, parseInt(entry.copies) || 1);
  entry.copies = copies;

  if (entry.status === 'scanning'){
    entry.badgeText = 'স্ক্যান হচ্ছে…';
    entry.total = 0; entry.price = 0; entry.pageCountUsed = 0; entry.ready = false;
    return;
  }
  if (entry.status === 'error'){
    entry.badgeText = 'ফাইল স্ক্যান করতে সমস্যা হয়েছে।';
    entry.total = 0; entry.price = 0; entry.pageCountUsed = 0; entry.ready = false;
    return;
  }

  const pt = PRINT_TYPES.find(p => p.value === entry.printType);
  if (!pt){
    entry.badgeText = entry.pageColorPercents.length ? 'Print Type বেছে নিন' : 'ফাইল আপলোড হচ্ছে…';
    entry.total = 0; entry.price = 0; entry.pageCountUsed = 0; entry.ready = false;
    return;
  }

  if (pt.mode === 'flat'){
    entry.total = pt.min * copies;
    entry.price = pt.min;
    entry.pageCountUsed = copies;
    entry.badgeText = `Flat rate <b>৳${pt.min.toFixed(1)}/copy</b> — কোনো color scan লাগবে না`;
    entry.ready = true;
    return;
  }

  if (!entry.pageColorPercents.length){
    entry.badgeText = 'ফাইল আপলোড করুন…';
    entry.total = 0; entry.price = 0; entry.pageCountUsed = 0; entry.ready = false;
    return;
  }

  const percents = entry.pageColorPercents.slice();

  let units = [];
  if (pt.mode === 'single'){
    percents.forEach(p => units.push(p));
  } else {
    for (let i = 0; i < percents.length; i += 2){
      const a = percents[i];
      const b = (i+1 < percents.length) ? percents[i+1] : a;
      units.push((a+b)/2);
    }
  }

  let subtotal = 0;
  units.forEach(p => { subtotal += pt.min + (pt.max - pt.min) * p; });
  const avgPercent = units.reduce((s,p) => s+p, 0) / units.length;
  const avgPrice = subtotal / units.length;

  entry.badgeText = `Color Coverage: <b>${Math.round(avgPercent*100)}%</b> • <b>৳${avgPrice.toFixed(2)}</b>/${pt.unit} avg — ${units.length} ${pt.unit}${units.length>1?'s':''}`;
  entry.total = subtotal * copies;
  entry.price = subtotal;
  entry.pageCountUsed = units.length * copies;
  entry.ready = true;
}

function recalcAll(){
  let grandTotal = 0;
  let allReady = filesData.length > 0;
  filesData.forEach(entry => {
    recalcOne(entry);
    updateCardUI(entry);
    if (entry.ready) grandTotal += entry.total;
    else allReady = false;
  });
  currentTotal = grandTotal;
  rTotal.textContent = `৳${grandTotal.toFixed(2)}`;
  updateSubmitState(allReady, grandTotal);
}

function updateSubmitState(allReady, total){
  const hasName = custNameInput.value.trim().length > 0;
  const hasFiles = filesData.length > 0;
  submitBtn.disabled = !(allReady && hasName && hasFiles && total > 0);
}
