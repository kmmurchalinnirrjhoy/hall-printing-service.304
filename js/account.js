/* =====================================================
   সফল বার্তা ও WhatsApp মেসেজ
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

// ---- অর্ডার সাবমিট শেষ হলে সফল বার্তা ও হিসাবের লিংক ----
function showSuccess(loggedIn, accountCreated){
  setStatus('success', '✓ অর্ডার সফলভাবে জমা হয়েছে!');
  const link = loggedIn
    ? '<a href="account#account">আমার হিসাব দেখুন</a>'
    : 'সকল হিসাব দেখতে <a href="account#login">লগ ইন করুন</a>';
  statusBox.insertAdjacentHTML('beforeend', `<div class="ok-link">${link}</div>` +
    (accountCreated ? '<div class="ok-note">আপনার অ্যাকাউন্ট খোলা হয়েছে। ফোন নম্বর ও পাসওয়ার্ড 01234 দিয়ে লগ ইন করুন।</div>' : ''));
  statusBox.scrollIntoView({behavior: 'smooth', block: 'nearest'});
}

function showWhatsAppOrder(snap, fileUrls, previousDue){
  const msg = buildWhatsAppMessage(snap, fileUrls, previousDue);
  waOrderBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  waOrderBox.classList.add('show');
}

