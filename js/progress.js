/* =====================================================
   অর্ডার পাঠানোর অগ্রগতি
   (Apps Script আসল শতাংশ জানায় না, তাই বারটা সাইজ ও সময় দেখে আনুমানিক)
   ===================================================== */

const SEND_TIMEOUT = 5 * 60 * 1000;     // ৫ মিনিটে উত্তর না এলে ব্যর্থ ধরা হবে

let sending = false;
let progressTimer = null;

function startProgress(fileCount, bytes){
  sending = true;
  document.querySelector('.col-left .card').inert = true;   // পাঠানোর সময় কিছু বদলানো যাবে না
  clearBtn.disabled = true;

  const mb = bytes / (1024 * 1024);
  const expected = 6 + mb * 8;           // আনুমানিক সেকেন্ড
  const started = Date.now();

  statusBox.className = 'status-box show sending';
  statusBox.innerHTML = `
    <div class="pg-title"><i class="pg-spin"></i><span id="pgText">অর্ডার পাঠানো হচ্ছে…</span></div>
    <div class="pg-bar"><i id="pgFill"></i></div>
    <div class="pg-info"><span>${fileCount}টি ফাইল • ${fmtSize(bytes)}</span><span id="pgTime">০ সেকেন্ড</span></div>
    <div class="pg-warn">শেষ না হওয়া পর্যন্ত পেজ বন্ধ করবেন না</div>`;

  const tick = () => {
    const sec = Math.floor((Date.now() - started) / 1000);
    const percent = 95 * (1 - Math.exp(-1.6 * sec / expected));     // উত্তর না আসা পর্যন্ত ৯৫% এর নিচে
    document.getElementById('pgFill').style.width = Math.max(4, percent) + '%';
    document.getElementById('pgTime').textContent = sec.toLocaleString('bn-BD') + ' সেকেন্ড';
    if (sec > Math.max(45, expected * 2)){
      document.getElementById('pgText').textContent = 'ইন্টারনেট ধীর, আরেকটু অপেক্ষা করুন…';
    }
  };
  tick();
  progressTimer = setInterval(tick, 500);
  statusBox.scrollIntoView({behavior: 'smooth', block: 'nearest'});
}

function stopProgress(){
  sending = false;
  clearInterval(progressTimer);
  document.querySelector('.col-left .card').inert = false;
  clearBtn.disabled = false;
}

// ব্যর্থ হলে লাল বার্তা ও আবার চেষ্টার বাটন
function showFailure(){
  setStatus('error', 'অর্ডার জমা হয়েছে কিনা নিশ্চিত হওয়া যায়নি। ইন্টারনেট দেখে, কিছু না বদলে আবার চেষ্টা করুন। অর্ডার দুইবার জমা হবে না।');
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'btn-retry';
  retry.textContent = '↻ আবার চেষ্টা করুন';
  retry.addEventListener('click', () => submitBtn.click());
  statusBox.appendChild(retry);
}

window.addEventListener('beforeunload', e => {
  if (!sending) return;
  e.preventDefault();
  e.returnValue = '';
});
