/* =====================================================
   ছোট সাহায্যকারী ফাংশন
   ===================================================== */

const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n0  = v => Number(v || 0).toLocaleString('en-US', {maximumFractionDigits: 0});
const tk  = v => '৳' + Number(v || 0).toLocaleString('en-US', {maximumFractionDigits: 1});

function fmtSize(bytes){
  if (bytes < 1024*1024) return (bytes/1024).toFixed(0) + ' KB';
  return (bytes/(1024*1024)).toFixed(2) + ' MB';
}

function readAsDataURL(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ঠিকানা থেকে .html সরানো (GitHub Pages .html ছাড়াই পেজ খোলে)
if (location.hostname.endsWith('.github.io') && location.pathname.endsWith('.html')){
  history.replaceState(null, '', location.pathname.replace(/(index)?\.html$/, '') + location.search + location.hash);
}
