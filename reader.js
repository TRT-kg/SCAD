const PDF_URL = new URL('./assets/paper.pdf', import.meta.url);
const PDFJS_ROOT = new URL('./vendor/pdfjs/', import.meta.url);
const CSS_UNITS = 96 / 72;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const MAX_CANVAS_PIXELS = 12_000_000;
const ui = Object.fromEntries([
  'previousPage', 'nextPage', 'pageForm', 'pageNumber', 'pageCount', 'goToPage',
  'zoomOut', 'zoomIn', 'zoomValue', 'fitWidth', 'readerStatus', 'readerError',
  'errorMessage', 'retryReader', 'documentViewport', 'documentStage',
  'startupFallback', 'selectionNote', 'reader-toolbar', 'zoomControls', 'paperLinks',
].map(id => [id, document.getElementById(id)]));

const messages = {
  en: {
    skip: 'Skip to reader controls', back: '← Project overview', heading: 'Read the paper',
    previous: 'Previous', next: 'Next', page: 'Page', go: 'Go', fit: 'Fit width',
    open: 'Open PDF', download: 'Download PDF', loading: 'Loading paper…',
    keyboard: '← / → change page · + / − zoom · F fit width',
    errorTitle: 'The page preview is unavailable',
    errorMessage: 'Try again, or open the original PDF using the links above.', retry: 'Try again',
    startup: 'The paper will appear here. You can also open or download the PDF above.',
    selectionNote: 'Text selection is unavailable for this page. Open the PDF to read it in your browser’s PDF viewer.',
    controls: 'PDF controls', jump: 'Jump to page', zoomControls: 'Zoom controls', files: 'Paper files',
    viewport: 'PDF page. Use left and right arrow keys to change pages.',
    pageInput: 'Page number', previousLabel: 'Previous page', nextLabel: 'Next page',
    zoomOut: 'Zoom out', zoomIn: 'Zoom in', zoomLevel: 'Zoom level',
    count: count => `of ${count}`, rendering: page => `Rendering page ${page}…`,
    ready: (page, count) => `Page ${page} of ${count}`,
    progress: value => `Loading paper… ${value}%`,
    invalid: count => `Enter a whole page number from 1 to ${count}.`,
    failure: 'Paper preview unavailable. The original PDF is still available above.',
  },
  'zh-CN': {
    skip: '跳至阅读控制栏', back: '← 返回项目页', heading: '论文全文',
    previous: '上一页', next: '下一页', page: '页码', go: '跳转', fit: '适应宽度',
    open: '打开 PDF', download: '下载 PDF', loading: '正在加载论文…',
    keyboard: '← / → 翻页 · + / − 缩放 · F 适应宽度',
    errorTitle: '暂时无法显示页面预览', errorMessage: '请重试，或使用上方链接打开原始 PDF。', retry: '重试',
    startup: '论文将在此显示。你也可以使用上方链接打开或下载原始 PDF。',
    selectionNote: '当前页面暂不支持选择文字。可打开 PDF，在浏览器的 PDF 阅读器中阅读。',
    controls: 'PDF 阅读控制栏', jump: '跳至指定页', zoomControls: '缩放控制', files: '论文文件',
    viewport: 'PDF 页面，可使用左右方向键翻页。', pageInput: '页码',
    previousLabel: '上一页', nextLabel: '下一页', zoomOut: '缩小', zoomIn: '放大', zoomLevel: '缩放比例',
    count: count => `/ ${count}`, rendering: page => `正在显示第 ${page} 页…`,
    ready: (page, count) => `第 ${page} 页，共 ${count} 页`,
    progress: value => `正在加载论文… ${value}%`,
    invalid: count => `请输入 1 到 ${count} 之间的整数页码。`,
    failure: '论文预览暂不可用，仍可通过上方链接打开原始 PDF。',
  },
};
let language = 'en';
try { if (localStorage.getItem('scad-language') === 'zh-CN') language = 'zh-CN'; } catch { /* Storage is optional. */ }
const t = messages[language];
document.documentElement.lang = language;
document.title = language === 'zh-CN' ? 'S-CAD · 论文全文' : 'S-CAD · Paper reader';
document.querySelectorAll('[data-i18n]').forEach(element => {
  const value = t[element.dataset.i18n];
  if (typeof value === 'string') element.textContent = value;
});
[
  ['reader-toolbar', 'controls'], ['pageForm', 'jump'], ['zoomControls', 'zoomControls'], ['paperLinks', 'files'],
  ['documentViewport', 'viewport'], ['pageNumber', 'pageInput'],
  ['previousPage', 'previousLabel'], ['nextPage', 'nextLabel'],
  ['zoomOut', 'zoomOut'], ['zoomIn', 'zoomIn'], ['zoomValue', 'zoomLevel'],
].forEach(([id, key]) => ui[id].setAttribute('aria-label', t[key]));

const state = {
  pdf: null,
  pdfjs: null,
  loadingTask: null,
  loading: false,
  page: 1,
  mode: 'fit',
  zoom: 1,
  renderedScale: CSS_UNITS,
  renderId: 0,
  renderTask: null,
  textLayer: null,
};

function pageFromHash() {
  const raw = new URLSearchParams(location.hash.slice(1)).get('page');
  return raw && /^\d+$/.test(raw) ? Number(raw) : 1;
}

function updatePageHash() {
  const url = new URL(location.href);
  url.hash = `page=${state.page}`;
  // Replace avoids filling browser history when reading or zooming.
  history.replaceState(null, '', url);
}

function updateControls() {
  const ready = Boolean(state.pdf);
  const count = state.pdf?.numPages ?? 0;
  ui.previousPage.disabled = !ready || state.page <= 1;
  ui.nextPage.disabled = !ready || state.page >= count;
  ui.pageNumber.disabled = ui.goToPage.disabled = !ready;
  ui.pageNumber.max = count || 1;
  ui.pageNumber.value = state.page;
  ui.pageCount.textContent = count ? t.count(count) : t.count('—');
  const effectiveZoom = state.renderedScale / CSS_UNITS;
  ui.zoomOut.disabled = !ready || effectiveZoom <= MIN_ZOOM + 0.001;
  ui.zoomIn.disabled = !ready || effectiveZoom >= MAX_ZOOM - 0.001;
  ui.fitWidth.disabled = !ready;
  ui.fitWidth.setAttribute('aria-pressed', String(state.mode === 'fit'));
  ui.zoomValue.textContent = ready ? `${Math.round(effectiveZoom * 100)}%` : '—';
}

function hideError() { ui.readerError.hidden = true; }
function showError(error) {
  console.error('S-CAD PDF reader:', error);
  ui.readerError.hidden = false;
  ui.errorMessage.textContent = t.errorMessage;
  ui.readerStatus.textContent = t.failure;
  ui.documentViewport.setAttribute('aria-busy', 'false');
}

function cancelActiveRender() {
  state.renderTask?.cancel();
  state.textLayer?.cancel();
  state.renderTask = null;
  state.textLayer = null;
}

function availableWidth() {
  const style = getComputedStyle(ui.documentStage);
  return Math.max(180, ui.documentViewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
}

async function renderPage({ resetScroll = false } = {}) {
  if (!state.pdf) return;
  const id = ++state.renderId;
  const pageNumber = state.page;
  cancelActiveRender();
  hideError();
  ui.selectionNote.hidden = true;
  ui.documentViewport.setAttribute('aria-busy', 'true');
  ui.readerStatus.textContent = t.rendering(pageNumber);
  updateControls();

  try {
    const page = await state.pdf.getPage(pageNumber);
    if (id !== state.renderId) return;
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = state.mode === 'fit' ? availableWidth() / baseViewport.width : state.zoom * CSS_UNITS;
    const viewport = page.getViewport({ scale });
    state.renderedScale = scale;
    updateControls();

    // A fresh canvas per request prevents an old cancelled render from painting
    // into the next page. A generation ID also discards late getPage results.
    const surface = document.createElement('div');
    surface.className = 'page-surface';
    surface.style.width = `${viewport.width}px`;
    surface.style.height = `${viewport.height}px`;
    surface.style.setProperty('--total-scale-factor', String(viewport.scale * page.userUnit));
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    const outputScale = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(MAX_CANVAS_PIXELS / (viewport.width * viewport.height)));
    canvas.width = Math.max(1, Math.floor(viewport.width * outputScale));
    canvas.height = Math.max(1, Math.floor(viewport.height * outputScale));
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('A 2D canvas is unavailable.');
    surface.append(canvas);
    ui.documentStage.replaceChildren(surface);
    if (resetScroll) ui.documentViewport.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const task = page.render({
      canvasContext: context,
      viewport,
      transform: [outputScale, 0, 0, outputScale, 0, 0],
      background: '#ffffff',
    });
    state.renderTask = task;
    await task.promise;
    if (id !== state.renderId) return;
    state.renderTask = null;

    const layerElement = document.createElement('div');
    layerElement.className = 'textLayer';
    layerElement.setAttribute('role', 'document');
    layerElement.setAttribute('aria-label', t.ready(pageNumber, state.pdf.numPages));
    surface.append(layerElement);
    const layer = new state.pdfjs.TextLayer({
      textContentSource: page.streamTextContent(),
      container: layerElement,
      viewport,
    });
    state.textLayer = layer;
    try {
      await layer.render();
    } catch (error) {
      if (id !== state.renderId) return;
      // Text extraction is supplementary; retain the successfully drawn page.
      console.warn('PDF text selection unavailable:', error);
      layerElement.remove();
      canvas.removeAttribute('aria-hidden');
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', t.ready(pageNumber, state.pdf.numPages));
      ui.selectionNote.hidden = false;
    }
    if (id !== state.renderId) return;
    state.textLayer = null;
    ui.readerStatus.textContent = t.ready(pageNumber, state.pdf.numPages);
  } catch (error) {
    if (id !== state.renderId || error?.name === 'RenderingCancelledException' || error?.name === 'AbortException') return;
    showError(error);
  } finally {
    if (id === state.renderId) ui.documentViewport.setAttribute('aria-busy', 'false');
  }
}

function goToPage(value, { fromHash = false } = {}) {
  if (!state.pdf) return;
  const requested = Number(value);
  if (!Number.isInteger(requested)) return;
  const next = Math.max(1, Math.min(state.pdf.numPages, requested));
  if (next === state.page && !fromHash) {
    updateControls();
    return;
  }
  state.page = next;
  updatePageHash();
  void renderPage({ resetScroll: true });
}

function zoomBy(factor) {
  if (!state.pdf) return;
  const baseZoom = state.mode === 'custom' ? state.zoom : state.renderedScale / CSS_UNITS;
  state.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, baseZoom * factor));
  state.mode = 'custom';
  void renderPage();
}

async function initialize() {
  if (state.loading) return;
  state.loading = true;
  hideError();
  ui.readerStatus.textContent = t.loading;
  ui.documentViewport.setAttribute('aria-busy', 'true');
  try {
    state.pdfjs ??= await import('./vendor/pdfjs/pdf.min.mjs');
    state.pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.mjs', PDFJS_ROOT).href;
    state.loadingTask = state.pdfjs.getDocument({
      url: PDF_URL.href,
      cMapUrl: new URL('cmaps/', PDFJS_ROOT).href,
      cMapPacked: true,
      standardFontDataUrl: new URL('standard_fonts/', PDFJS_ROOT).href,
      wasmUrl: new URL('wasm/', PDFJS_ROOT).href,
      iccUrl: new URL('iccs/', PDFJS_ROOT).href,
      isEvalSupported: false,
    });
    state.loadingTask.onProgress = ({ loaded, total }) => {
      if (total > 0 && !state.pdf) ui.readerStatus.textContent = t.progress(Math.min(100, Math.round(loaded / total * 100)));
    };
    state.pdf = await state.loadingTask.promise;
    state.page = Math.max(1, Math.min(state.pdf.numPages, pageFromHash()));
    updatePageHash();
    updateControls();
    await renderPage();
  } catch (error) {
    state.pdf = null;
    updateControls();
    showError(error);
  } finally {
    state.loading = false;
  }
}

ui.previousPage.addEventListener('click', () => goToPage(state.page - 1));
ui.nextPage.addEventListener('click', () => goToPage(state.page + 1));
ui.pageForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!state.pdf) return;
  const value = Number(ui.pageNumber.value);
  if (!Number.isInteger(value) || value < 1 || value > state.pdf.numPages) {
    ui.pageNumber.setCustomValidity(t.invalid(state.pdf.numPages));
    ui.pageNumber.reportValidity();
    return;
  }
  ui.pageNumber.setCustomValidity('');
  goToPage(value);
});
ui.pageNumber.addEventListener('input', () => ui.pageNumber.setCustomValidity(''));
ui.zoomOut.addEventListener('click', () => zoomBy(1 / 1.2));
ui.zoomIn.addEventListener('click', () => zoomBy(1.2));
ui.fitWidth.addEventListener('click', () => { state.mode = 'fit'; void renderPage(); });
ui.retryReader.addEventListener('click', () => state.pdf ? void renderPage() : void initialize());
document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  ui['reader-toolbar'].focus();
  ui['reader-toolbar'].scrollIntoView({ block: 'start', behavior: 'instant' });
});
window.addEventListener('hashchange', () => {
  if (new URLSearchParams(location.hash.slice(1)).has('page')) {
    goToPage(pageFromHash(), { fromHash: true });
  }
});
window.addEventListener('keydown', event => {
  if (!state.pdf || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target;
  if (target instanceof Element && (target.closest('input, textarea, select, [contenteditable="true"]'))) return;
  if (window.getSelection()?.type === 'Range') return;
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); goToPage(state.page - 1); }
  else if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); goToPage(state.page + 1); }
  else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoomBy(1.2); }
  else if (event.key === '-') { event.preventDefault(); zoomBy(1 / 1.2); }
  else if (event.key.toLowerCase() === 'f') { event.preventDefault(); state.mode = 'fit'; void renderPage(); }
});

let resizeTimer;
let lastWidth = ui.documentViewport.clientWidth;
let lastDpr = window.devicePixelRatio || 1;
const resizeObserver = new ResizeObserver(() => {
  const width = ui.documentViewport.clientWidth;
  if (Math.abs(width - lastWidth) < 1) return;
  lastWidth = width;
  if (!state.pdf || state.mode !== 'fit') return;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => void renderPage(), 140);
});
resizeObserver.observe(ui.documentViewport);
window.addEventListener('resize', () => {
  const ratio = window.devicePixelRatio || 1;
  if (ratio !== lastDpr) { lastDpr = ratio; if (state.pdf) void renderPage(); }
});

updateControls();
void initialize();
