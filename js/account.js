/* =====================================================
   কাস্টমারের হিসাব ও WhatsApp মেসেজ
   ===================================================== */

// ---- WhatsApp order message builder ----
// previousDue = null মানে লগইন ছাড়া অর্ডার: শুধু এই অর্ডারের হিসাব
function buildWhatsAppMessage(snap, fileUrls, previousDue){
  const guest = previousDue === null;
  const paid = parseFloat(snap.amountPaid) || 0;
  const prev = Number(previousDue) || 0;
  const grand = Math.round((prev + snap.total - paid) * 10) / 10;   // সর্বমোট বাকি
  const dueLabel = guest ? 'এই অর্ডারের বাকি' : 'সর্বমোট বাকি';

  let msg = `*নতুন প্রিন্ট অর্ডার*\n`;
  msg += `নাম: ${snap.name}\n`;
  msg += `━━━━━━━━━━━━━━\n`;
  snap.items.forEach((it, i) => {
    msg += `${i+1}) `;
    if (fileUrls[i]) msg += `${fileUrls[i]}\n`;
  });

  msg += `━━━━━━━━━━━━━━\n`;
  msg += `আজকের বিল: ৳${snap.total.toFixed(1)}\n`;
  msg += `আজ পরিশোধ: ৳${paid.toFixed(1)}\n`;
  if (prev > 0)      msg += `আগের বাকি: ৳${prev.toFixed(1)}\n`;
  else if (prev < 0) msg += `আগের অগ্রিম জমা: ৳${Math.abs(prev).toFixed(1)}\n`;
  msg += `━━━━━━━━━━━━━━\n`;
  if (grand > 0)      msg += `*${dueLabel}: ৳${grand.toFixed(1)}*\n`;
  else if (grand < 0) msg += `*অগ্রিম জমা: ৳${Math.abs(grand).toFixed(1)}*\n`;
  else                msg += `*${dueLabel}: ৳0 (পরিশোধিত)*\n`;
  if (snap.collectLater) msg += `\nপ্রিন্ট এখন সংগ্রহ করবো না, পরে এসে নিবো।`;
  return msg;
}

// ---- অর্ডার সাবমিট শেষ হলে হিসাব দেখানো ----
function showAccount(snap, previousDue, note){
  const guest = previousDue === null;
  const paid  = parseFloat(snap.amountPaid) || 0;
  const prev  = Number(previousDue) || 0;
  const grand = Math.round((prev + snap.total - paid) * 10) / 10;
  const tk = v => '৳' + Math.abs(v).toFixed(1);

  document.getElementById('accName').textContent = snap.name ? '— ' + snap.name : '';
  document.getElementById('accPrevRow').classList.toggle('hidden', guest);
  document.getElementById('accPrevLabel').textContent = prev < 0 ? 'আগের অগ্রিম জমা' : 'আগের বাকি';
  document.getElementById('accPrev').textContent  = tk(prev);
  document.getElementById('accToday').textContent = tk(snap.total);
  document.getElementById('accPaid').textContent  = tk(paid);

  const g = document.getElementById('accGrand');
  document.getElementById('accGrandLabel').textContent = grand < 0 ? 'অগ্রিম জমা' : guest ? 'এই অর্ডারের বাকি' : 'সর্বমোট বাকি';
  g.textContent = tk(grand);
  g.className = grand > 0 ? 'due' : 'clear';

  document.getElementById('accNote').textContent = note || '';
  accountBox.classList.add('show');
  accountBox.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function showWhatsAppOrder(snap, fileUrls, previousDue){
  const msg = buildWhatsAppMessage(snap, fileUrls, previousDue);
  waOrderBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  waOrderBox.classList.add('show');
}

