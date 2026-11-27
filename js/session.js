/* =====================================================
   কাস্টমার লগইন (এই ফোন/ব্রাউজারে মনে রাখা)
   ===================================================== */

function getSession(){
  try{ return JSON.parse(localStorage.getItem('hp_session')) || null; }catch(e){ return null; }
}

function saveSession(r){
  try{
    localStorage.setItem('hp_session', JSON.stringify({ token: r.token, name: r.name, phone: r.phone }));
    localStorage.setItem('hp_last_name', r.name);
  }catch(e){}
  if (typeof buildMenu === 'function') buildMenu();
}

function clearSession(){
  try{ localStorage.removeItem('hp_session'); }catch(e){}
  if (typeof buildMenu === 'function') buildMenu();
}

// বাংলা/ইংরেজি সংখ্যা ও +880 মিলিয়ে 01XXXXXXXXX; ভুল হলে ''
function normPhone(v){
  let p = String(v || '')
    .replace(/[০-৯]/g, c => '০১২৩৪৫৬৭৮৯'.indexOf(c))
    .replace(/\D/g, '')
    .replace(/^(00)?880/, '0');
  if (/^1\d{9}$/.test(p)) p = '0' + p;
  return /^01\d{9}$/.test(p) ? p : '';
}
