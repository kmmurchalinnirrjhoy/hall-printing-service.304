/* =====================================================
   সার্ভার (Google Sheet) এর সাথে সব যোগাযোগ
   ===================================================== */

// নাম অনুযায়ী আগের হিসাব
async function fetchBalance(name){
  const res = await fetch(APPS_SCRIPT_URL + '?action=balance&name=' + encodeURIComponent(name));
  return res.json();
}

// নতুন অর্ডার জমা
async function sendOrder(payload){
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {'Content-Type': 'text/plain;charset=utf-8'},
    body: JSON.stringify(payload)
  });
  return res.json();
}

// অ্যাডমিন action (PIN সহ)
async function api(payload){
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {'Content-Type': 'text/plain;charset=utf-8'},
    body: JSON.stringify(Object.assign({pin: PIN}, payload))
  });
  return res.json();
}
