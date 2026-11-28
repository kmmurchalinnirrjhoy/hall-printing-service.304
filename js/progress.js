/* =====================================================
   অর্ডার পাঠানোর অগ্রগতি
   (Apps Script আসল শতাংশ জানায় না, তাই বারটা সাইজ ও সময় দেখে আনুমানিক)
   ===================================================== */

const SEND_TIMEOUT = 5 * 60 * 1000;     // ৫ মিনিটে উত্তর না এলে ব্যর্থ ধরা হবে

let sending = false;
let progressTimer = null;

// বাটনটাই প্রগ্রেস বার: ভেতরে ঘুরন্ত বৃত্ত, সোনালি রং বাম থেকে ডানে ভরে
function startProgress(bytes){
  sending = true;
  document.querySelector('.col-left .card').inert = true;   // পাঠানোর সময় কিছু বদলানো যাবে না
  clearBtn.disabled = true;
  statusBox.classList.remove('show');

  const expected = 6 + bytes / (1024 * 1024) * 8;           // আনুমানিক সেকেন্ড
  const started = Date.now();

  submitBtn.classList.add('busy');
  submitBtn.innerHTML = '<i class="btn-spin"></i>পাঠানো হচ্ছে…';

  const tick = () => {
    const sec = (Date.now() - started) / 1000;
    const percent = 95 * (1 - Math.exp(-1.6 * sec / expected));     // উত্তর না আসা পর্যন্ত ৯৫% এর নিচে
    submitBtn.style.setProperty('--fill', Math.max(4, percent) + '%');
  };
  tick();
  progressTimer = setInterval(tick, 400);
}

function stopProgress(){
  sending = false;
  clearInterval(progressTimer);
  submitBtn.classList.remove('busy');
  submitBtn.style.removeProperty('--fill');
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
