/* =====================================================
   ফাইল আপলোড, কালার স্ক্যান ও ফাইল কার্ড
   ===================================================== */

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function analyzeColor(ctx, w, h){
  const data = ctx.getImageData(0, 0, w, h).data;
  let colorPixels = 0, totalPixels = 0;
  for (let i = 0; i < data.length; i += 4){
    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
    if (a < 10) continue;
    totalPixels++;
    if (Math.max(r,g,b) - Math.min(r,g,b) > 18) colorPixels++;
  }
  return totalPixels === 0 ? 0 : colorPixels / totalPixels;
}

function optionsHTML(selectedValue){
  let html = `<option value="" disabled ${!selectedValue ? 'selected' : ''}>বেছে নিন</option>`;
  PRINT_TYPES.forEach(pt => {
    html += `<option value="${esc(pt.value)}" ${pt.value === selectedValue ? 'selected' : ''}>${esc(pt.value)}</option>`;
  });
  return html;
}

function renderCard(entry){
  const div = document.createElement('div');
  div.className = 'file-card';
  div.dataset.id = entry.id;
  div.innerHTML = `
    <div class="file-head">
      <span class="fname">${esc(entry.file.name)}</span>
      <span class="fsize">${fmtSize(entry.file.size)}</span>
      <span class="rm" data-action="remove">✕</span>
    </div>
    <div class="file-body">
      <div class="field-mini" style="margin-top:14px;">
        <label>Pages</label>
        <input type="text" class="pageCount" value="—" readonly>
      </div>
      <div class="row2">
        <div class="field-mini">
          <label>Copies</label>
          <div class="stepper">
            <button type="button" data-action="dec">−</button>
            <input type="text" class="copySet" value="1" inputmode="numeric">
            <button type="button" data-action="inc">+</button>
          </div>
        </div>
        <div class="field-mini">
          <label>Print Mode</label>
          <select class="printType">${optionsHTML(entry.printType)}</select>
        </div>
      </div>
      <div class="coverage-badge">স্ক্যান হচ্ছে…</div>
    </div>
  `;
  filesList.appendChild(div);
}

function cardEl(entry){
  return filesList.querySelector(`.file-card[data-id="${entry.id}"]`);
}

function updateCardUI(entry){
  const card = cardEl(entry);
  if (!card) return;
  card.querySelector('.pageCount').value = entry.pageColorPercents.length || '—';
  card.querySelector('.coverage-badge').innerHTML = entry.badgeText || '…';
}

// ---- Scanning a single uploaded file (async, runs per file) ----
async function scanFile(entry){
  const file = entry.file;
  try{ entry.dataUrl = await readAsDataURL(file); }
  catch(err){ console.error('file read error', err); }

  try{
    if (file.type === 'application/pdf'){
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({data: buf}).promise;
      for (let i = 1; i <= pdf.numPages; i++){
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({scale: 1});
        const scale = 220 / Math.max(viewport.width, viewport.height);
        const vp = page.getViewport({scale});
        const canvas = document.createElement('canvas');
        canvas.width = vp.width; canvas.height = vp.height;
        const ctx = canvas.getContext('2d');
        await page.render({canvasContext: ctx, viewport: vp}).promise;
        entry.pageColorPercents.push(analyzeColor(ctx, canvas.width, canvas.height));
        entry.badgeText = `স্ক্যান হচ্ছে… (${i}/${pdf.numPages})`;
        updateCardUI(entry);
      }
    } else if (file.type.startsWith('image/')){
      const url = URL.createObjectURL(file);
      const img = await loadImage(url);
      const scale = 220 / Math.max(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale; canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      entry.pageColorPercents.push(analyzeColor(ctx, canvas.width, canvas.height));
      URL.revokeObjectURL(url);
    } else {
      throw new Error('unsupported type');
    }
    entry.status = 'ready';
  }catch(err){
    console.error(err);
    entry.status = 'error';
  }
  recalcAll();
}

async function addFiles(fileList){
  const arr = Array.from(fileList);
  for (const file of arr){
    if (!(file.type === 'application/pdf' || file.type.startsWith('image/'))){
      alert(`"${file.name}" সমর্থিত ফরম্যাট নয়। শুধু PDF অথবা Image দিন।`);
      continue;
    }
    if (file.size > 10 * 1024 * 1024){
      alert(`"${file.name}" এর সাইজ ১০MB এর বেশি।`);
      continue;
    }
    const entry = {
      id: 'f' + (++idSeq),
      file,
      dataUrl: null,
      pageColorPercents: [],
      copies: 1,
      printType: '',
      status: 'scanning',
      ready: false,
      total: 0, price: 0, pageCountUsed: 0,
      badgeText: 'স্ক্যান হচ্ছে…'
    };
    filesData.push(entry);
    renderCard(entry);
    await scanFile(entry);
  }
  recalcAll();
}
