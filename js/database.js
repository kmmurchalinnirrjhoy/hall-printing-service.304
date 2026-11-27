/* =====================================================
   সার্ভার (Google Sheet) এর সাথে সব যোগাযোগ
   ===================================================== */

// নতুন অর্ডার জমা
async function sendOrder(payload, signal){
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {'Content-Type': 'text/plain;charset=utf-8'},
    body: JSON.stringify(payload),
    signal
  });
  return res.json();
}

// কাস্টমার action (সাইন আপ, লগ ইন, হিসাব, পাসওয়ার্ড)
const customerApi = payload => sendOrder(payload);

// অ্যাডমিন action (PIN সহ)
async function api(payload){
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {'Content-Type': 'text/plain;charset=utf-8'},
    body: JSON.stringify(Object.assign({pin: PIN}, payload))
  });
  return res.json();
}
