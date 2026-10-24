const STORAGE_KEY = "cixu-desktop-v1";
const STATE_API = "./__ielts_state";
const DAY = 86400000;
const IELTS_BOOK_ID = "ielts-zhenjing-local";
const DEFAULT_SETTINGS = {
  dailyNew: 20,
  groupSize: 20,
  globalFontSize: 0,
  vocabularyStart: 1,
  vocabularyCategory: "all",
  reviewChunk: 100,
  accent: "uk",
  autoPronounce: true,
  spellHint: true,
  splitMnemonic: true,
  confuseAnalyze: true,
  listeningQuiz: false,
  reminder: true,
  theme: "deep",
  fontStyle: "sans",
  followSystem: false,
  mnemonicOrder: ["phrase", "variant", "root", "derive", "note", "synonym"],
};
const TAB_LABELS = { phrase: "词组搭配", variant: "特殊变形", root: "词根", derive: "派生", note: "笔记", synonym: "近义" };
const NAV_TITLES = { home: "今日学习", review: "复习队列", listen: "随身听", listening: "听力 179", dict: "词典", words: "词书浏览", sentences: "例句库", materials: "资料", settings: "学习偏好", appearance: "外观" };
const sampleBook = {
  id: "starter-01", name: "入门示例词书", category: "示例", createdAt: Date.now(), words: [
    { word: "abundant", meaning: "大量的；充裕的", phonetic: "/əˈbʌndənt/", example: "The region has abundant natural resources.", translation: "这个地区自然资源丰富。" },
    { word: "accomplish", meaning: "完成；实现", phonetic: "/əˈkʌmplɪʃ/", example: "She accomplished everything she had planned.", translation: "她完成了计划中的所有事情。" },
    { word: "adapt", meaning: "适应；改编", phonetic: "/əˈdæpt/", example: "It takes time to adapt to a new environment.", translation: "适应新环境需要时间。" },
    { word: "adequate", meaning: "足够的；合格的", phonetic: "/ˈædɪkwət/", example: "The room was small but adequate.", translation: "房间虽小，但够用。" },
    { word: "advocate", meaning: "提倡；拥护；倡导者", phonetic: "/ˈædvəkeɪt/", example: "Many people advocate public transport.", translation: "许多人提倡公共交通。" },
    { word: "allocate", meaning: "分配；拨出", phonetic: "/ˈæləkeɪt/", example: "The school allocated funds for new books.", translation: "学校拨款购置新书。" },
    { word: "ambiguous", meaning: "模棱两可的；含糊的", phonetic: "/æmˈbɪɡjuəs/", example: "The instructions were deliberately ambiguous.", translation: "说明是故意写得含糊的。" },
    { word: "assess", meaning: "评估；评价", phonetic: "/əˈses/", example: "We need to assess the impact of the change.", translation: "我们需要评估这项变化的影响。" },
    { word: "capacity", meaning: "能力；容量", phonetic: "/kəˈpæsəti/", example: "The hall has a seating capacity of 500.", translation: "大厅可容纳 500 名观众。" },
    { word: "coherent", meaning: "连贯的；有条理的", phonetic: "/koʊˈhɪrənt/", example: "She gave a clear and coherent explanation.", translation: "她的解释清晰且有条理。" },
    { word: "consecutive", meaning: "连续的；连贯的", phonetic: "/kənˈsekjətɪv/", example: "It rained for three consecutive days.", translation: "雨连续下了三天。" },
    { word: "considerable", meaning: "相当大的；重要的", phonetic: "/kənˈsɪdərəbl/", example: "The project requires considerable effort.", translation: "这个项目需要相当大的努力。" },
    { word: "contribute", meaning: "贡献；促成；投稿", phonetic: "/kənˈtrɪbjuːt/", example: "Regular exercise contributes to good health.", translation: "经常锻炼有助于身体健康。" },
    { word: "decline", meaning: "下降；拒绝；衰退", phonetic: "/dɪˈklaɪn/", example: "The number of visitors declined last year.", translation: "去年访客数量有所下降。" },
    { word: "diverse", meaning: "多样的；不同的", phonetic: "/daɪˈvɜːrs/", example: "The city has a culturally diverse population.", translation: "这座城市的人口具有多元文化背景。" },
    { word: "emerge", meaning: "出现；显露；兴起", phonetic: "/ɪˈmɜːrdʒ/", example: "New evidence emerged during the investigation.", translation: "调查期间出现了新的证据。" },
    { word: "essential", meaning: "必不可少的；本质的", phonetic: "/ɪˈsenʃl/", example: "Water is essential for all forms of life.", translation: "水对所有生命形式都不可或缺。" },
    { word: "evaluate", meaning: "评估；评价", phonetic: "/ɪˈvæljueɪt/", example: "Teachers evaluate students throughout the course.", translation: "教师在整个课程期间评估学生。" },
    { word: "impact", meaning: "影响；冲击", phonetic: "/ˈɪmpækt/", example: "Technology has had a major impact on communication.", translation: "科技对沟通方式产生了重大影响。" },
    { word: "indicate", meaning: "表明；指出；暗示", phonetic: "/ˈɪndɪkeɪt/", example: "The results indicate a change in public opinion.", translation: "结果表明公众意见发生了变化。" },
    { word: "maintain", meaning: "维持；保养；坚持认为", phonetic: "/meɪnˈteɪn/", example: "It is important to maintain a balanced diet.", translation: "保持均衡饮食很重要。" },
    { word: "occur", meaning: "发生；出现；被想到", phonetic: "/əˈkɜːr/", example: "The accident occurred shortly after midnight.", translation: "事故发生在午夜刚过不久。" },
    { word: "significant", meaning: "显著的；重要的", phonetic: "/sɪɡˈnɪfɪkənt/", example: "There has been a significant improvement.", translation: "情况有了显著改善。" },
    { word: "vary", meaning: "变化；使多样化", phonetic: "/ˈveri/", example: "Prices vary according to the season.", translation: "价格随季节变化。" }
  ]
};

let session = null;
let state = loadState();
let currentView = "home";
let currentBookId = session?.sourceBookId || state.activeBookId || state.books[0]?.id || null;
let searchQuery = "";
let wordFilter = "all";
let dictQuery = "";
let dictTab = "collins";
let dictSelected = null;
let orderOpen = false;
let toastTimer;
let noteTimer;
let listen = { index: 0, playing: false, sleepMinutes: 0, sleepTimer: null, audio: null };
let listeningData = [];
let listeningState = { index: 0, revealed: false, result: null, typedWord: "", typedSyn: "", message: "" };
let readingGroups = [];
let writingSentences = [];
let readingSynonyms = new Map();
let materialManifest = { grammar: [] };
let materialTab = "writing";
let materialsMessage = "";
let phoneticsMap = {};
let sidebarCollapsed = localStorage.getItem("cixu-sidebar") === "1";
let databaseAvailable = false;
let databaseSaveTimer;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved = JSON.parse(raw);
    if (saved && Array.isArray(saved.books) && saved.reviews) {
      saved.records = saved.records || {};
      saved.daily = saved.daily || {};
      saved.settings = { ...DEFAULT_SETTINGS, ...(saved.settings || {}) };
      saved.notes = saved.notes || {};
      saved.favoriteWords = saved.favoriteWords || [];
      saved.favoriteSentences = saved.favoriteSentences || [];
      saved.likes = saved.likes || {};
      saved.known = saved.known || {};
      saved.checkins = saved.checkins || [];
      saved.listening = saved.listening || { index: 0, done: {} };
      saved.listening.done = saved.listening.done || {};
      if (saved.session?.queue?.length) session = saved.session;
      return saved;
    }
    if (raw != null) backupDamagedState(raw);
  } catch (error) {
    console.warn("Could not read saved study data", error);
    const damaged = localStorage.getItem(STORAGE_KEY);
    if (damaged) backupDamagedState(damaged);
  }
  return { books: [sampleBook], records: {}, reviews: {}, daily: {}, notes: {}, favoriteWords: [], favoriteSentences: [], likes: {}, known: {}, checkins: [], listening: { index: 0, done: {} }, activeBookId: sampleBook.id, settings: { ...DEFAULT_SETTINGS } };
}
function backupDamagedState(raw) {
  try {
    localStorage.setItem("cixu-desktop-backup", raw);
    setTimeout(() => toast("学习数据读取失败，原始数据已备份到本地；请勿清除浏览器数据"), 0);
  } catch (error) { console.warn("Could not back up damaged study data", error); }
}
async function loadIeltsBook(attempt = 0) {
  try {
    const module = await import("./ielts/src/pages/vocabulary/vocabulary.js");
    const words = Object.entries(module.default).flatMap(([category, chapter]) => chapter.words.flatMap((group, groupIndex) => group.map((item, wordIndex) => ({
      word: item.word.join(" / "),
      variants: item.word,
      meaning: item.meaning || "",
      partOfSpeech: item.pos || "",
      example: item.example || "",
      extra: item.extra && item.extra !== "-" ? item.extra : "",
      category,
      groupNumber: groupIndex + 1,
      groupPosition: wordIndex + 1,
      groupWords: group.map(entry => entry.word.join(" / ")),
      audio: `/ielts/public/vocabulary/audio/${encodeURIComponent(category)}/${encodeURIComponent(item.word[0])}.mp3`,
    }))));
    if (!words.length) return;
    const book = { id: IELTS_BOOK_ID, name: "雅思词汇真经", category: "22 个主题", createdAt: 0, words };
    const existingIndex = state.books.findIndex(item => item.id === IELTS_BOOK_ID);
    if (existingIndex < 0) state.books.unshift(book);
    else state.books[existingIndex] = book;
    if (!state.activeBookId || state.activeBookId === "starter-01") currentBookId = IELTS_BOOK_ID;
    syncVocabularyStart(book);
    persist(); renderShell();
  } catch (error) {
    if (attempt < 1) { setTimeout(() => loadIeltsBook(attempt + 1), 1200); return; }
    console.warn("IELTS vocabulary source is unavailable", error);
    toast("雅思词书加载失败：请通过本地服务器打开项目");
  }
}
function persist() {
  state.activeBookId = currentBookId;
  if (session?.queue?.length) state.session = session;
  else delete state.session;
  const serialized = JSON.stringify(state);
  try { localStorage.setItem(STORAGE_KEY, serialized); }
  catch (error) { toast("本地存储空间不足，请先导出备份"); }
  if (databaseAvailable) {
    clearTimeout(databaseSaveTimer);
    databaseSaveTimer = setTimeout(() => fetch(STATE_API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: serialized }).catch(() => { databaseAvailable = false; }), 80);
  }
}

async function loadDatabaseState() {
  try {
    const response = await fetch(STATE_API, { cache: "no-store" });
    if (!response.ok) return;
    databaseAvailable = true;
    if (response.status === 204) return;
    const saved = await response.json();
    if (!saved || !Array.isArray(saved.books) || !saved.reviews) return;
    state = normalizeState(saved);
    session = state.session?.queue?.length ? state.session : null;
    currentBookId = state.activeBookId || state.books[0]?.id || null;
    applyTheme();
    renderShell();
  } catch (error) { /* static browser hosting has no database API */ }
}

function normalizeState(saved) {
  saved.records = saved.records || {};
  saved.daily = saved.daily || {};
  saved.settings = { ...DEFAULT_SETTINGS, ...(saved.settings || {}) };
  saved.notes = saved.notes || {};
  saved.favoriteWords = saved.favoriteWords || [];
  saved.favoriteSentences = saved.favoriteSentences || [];
  saved.likes = saved.likes || {};
  saved.known = saved.known || {};
  saved.checkins = saved.checkins || [];
  saved.listening = saved.listening || { index: 0, done: {} };
  saved.listening.done = saved.listening.done || {};
  return saved;
}
function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function todayKey() { return dateKey(new Date()); }
function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function currentBook() { return state.books.find(book => book.id === currentBookId) || state.books[0]; }
function recordKey(bookId, word) { return `${bookId}:${word.word.toLowerCase()}`; }
function bookIdFor(word) { return word?._bookId || session?.bookId || currentBookId; }
function getRecord(bookId, word) {
  const key = recordKey(bookId, word);
  if (!state.records[key]) state.records[key] = { box: 0, dueAt: 0, seen: 0, correct: 0, wrong: 0, lastSeen: 0 };
  return state.records[key];
}
function isKnown(word, bookId = bookIdFor(word)) { return Boolean(state.known[recordKey(bookId, word)]); }
function likeCount(word, bookId = bookIdFor(word)) { return state.likes[recordKey(bookId, word)] || 0; }
function findWord(text, bookId = currentBookId) {
  return state.books.find(book => book.id === bookId)?.words.find(word => word.word.toLowerCase() === String(text).toLowerCase());
}
function dueWords(bookId = currentBookId) {
  const now = Date.now();
  return (state.reviews[bookId] || []).map(item => ({ item, word: state.books.find(book => book.id === bookId)?.words.find(word => word.word.toLowerCase() === item.word) })).filter(entry => entry.word && entry.item.dueAt <= now && !isKnown(entry.word, bookId)).sort((a, b) => a.item.dueAt - b.item.dueAt);
}
function bookStats(book) {
  const records = book.words.map(word => getRecord(book.id, word));
  const known = book.words.filter(word => isKnown(word, book.id)).length;
  const learned = records.filter(record => record.box > 0).length;
  const due = dueWords(book.id).length;
  const introducedToday = records.filter(record => record.introducedAt && new Date(record.introducedAt).toDateString() === new Date().toDateString()).length;
  return { learned, due, introducedToday, known, records };
}
function allDue() { return state.books.reduce((sum, book) => sum + dueWords(book.id).length, 0); }
function todayStats() { return state.daily[todayKey()] || { learned: 0, reviewed: 0, seconds: 0 }; }
function totalMinutes() { return Math.round(Object.values(state.daily).reduce((sum, day) => sum + (day.seconds || 0), 0) / 60); }
function masteredCount() { return Object.values(state.records).filter(record => record.box >= 3).length + Object.keys(state.known).length; }
function streakDays() {
  const set = new Set(state.checkins);
  const cursor = new Date();
  if (!set.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (set.has(dateKey(cursor))) { count++; cursor.setDate(cursor.getDate() - 1); }
  return count;
}
function addSeconds(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return;
  const today = state.daily[todayKey()] || (state.daily[todayKey()] = { learned: 0, reviewed: 0, seconds: 0 });
  today.seconds = (today.seconds || 0) + Math.min(seconds, 3600);
}
function escapeCsvRow(line, delimiter) {
  const result = []; let field = ""; let quoted = false;
  for (let index = 0; index < line.length; index++) {
    const char = line[index];
    if (char === '"' && quoted && line[index + 1] === '"') { field += '"'; index++; }
    else if (char === '"') quoted = !quoted;
    else if (char === delimiter && !quoted) { result.push(field.trim()); field = ""; }
    else field += char;
  }
  result.push(field.trim()); return result;
}
function parseImport(text, fileName) {
  if (fileName.toLowerCase().endsWith(".json") || /^[\s]*[\[{]/.test(text)) {
    const parsed = JSON.parse(text);
    const source = Array.isArray(parsed) ? parsed : parsed.words;
    if (!Array.isArray(source)) throw new Error("JSON 需要是词条数组，或含 words 数组的对象");
    return { name: parsed.name || fileName.replace(/\.[^.]+$/, ""), words: source.map(item => item && typeof item === "object" && !Array.isArray(item) ? normalizeWord(item) : null) };
  }
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim());
  if (!lines.length) throw new Error("文件中没有词条");
  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const rows = lines.map(line => escapeCsvRow(line, delimiter));
  const headerNames = ["word", "term", "headword", "meaning", "definition", "translation", "example", "sentence", "phonetic", "audio", "category"];
  const first = rows[0].map(value => value.toLowerCase());
  const hasHeader = first.some(value => headerNames.includes(value));
  const headers = hasHeader ? first : ["word", "meaning", "example", "translation", "phonetic", "audio", "category"];
  const records = rows.slice(hasHeader ? 1 : 0).map(row => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
  return { name: fileName.replace(/\.[^.]+$/, ""), words: records.map(normalizeWord) };
}
function normalizeWord(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;
  const get = (...keys) => { for (const key of keys) if (item[key] != null && String(item[key]).trim()) return String(item[key]).trim(); return ""; };
  return { word: get("word", "term", "headword", "单词", "词条", "英文"), meaning: get("meaning", "definition", "translation", "释义", "中文", "意思"), example: get("example", "sentence", "例句"), translation: get("exampleTranslation", "example_translation", "translationExample", "例句翻译"), phonetic: get("phonetic", "pronunciation", "音标"), audio: get("audio", "audioUrl", "audio_url", "发音"), category: get("category", "group", "unit", "分类", "单元") };
}
function applyTheme() {
  const theme = state.settings.followSystem ? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "deep" : "light") : state.settings.theme;
  document.body.dataset.theme = theme || "deep";
  document.body.dataset.font = state.settings.fontStyle || "sans";
  document.documentElement.style.setProperty("--global-font-size", `${state.settings.globalFontSize || 0}px`);
}
function applySidebar() {
  document.body.dataset.sidebar = sidebarCollapsed ? "collapsed" : "expanded";
  const button = document.getElementById("sidebar-toggle");
  if (button) {
    button.textContent = sidebarCollapsed ? "»" : "☰";
    button.title = sidebarCollapsed ? "展开侧栏" : "收起侧栏";
    button.setAttribute("aria-label", button.title);
  }
}
function renderShell() {
  document.querySelectorAll(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.view === currentView));
  document.getElementById("review-nav-count").textContent = allDue();
  renderSidebarBooks();
  if (currentView === "home") renderHome();
  if (currentView === "review") renderReview();
  if (currentView === "words") renderWords();
  if (currentView === "listen") renderListen();
  if (currentView === "listening") renderListening();
  if (currentView === "dict") renderDict();
  if (currentView === "sentences") renderSentences();
  if (currentView === "materials") renderMaterials();
  if (currentView === "settings") renderSettings();
  if (currentView === "appearance") renderAppearance();
  document.querySelectorAll(".view").forEach(view => view.classList.toggle("active-view", view.id === `view-${currentView}`));
}
function renderSidebarBooks() {
  const target = document.getElementById("book-list");
  if (!target) return;
  if (!state.books.length) { target.innerHTML = '<div class="empty-books">还没有词书</div>'; return; }
  target.innerHTML = state.books.map(book => {
    const stats = bookStats(book);
    return `<button class="book-row ${book.id === currentBookId ? "selected" : ""}" data-book="${escapeHtml(book.id)}"><span class="book-dot"></span><span>${escapeHtml(book.name)}</span><span class="book-remaining">${book.words.length - stats.learned - stats.known}</span></button>`;
  }).join("");
}
function renderHome() {
  const book = currentBook();
  if (!book) { document.getElementById("view-home").innerHTML = emptyHome(); return; }
  const stats = bookStats(book);
  const daily = todayStats();
  const settings = state.settings;
  const percent = book.words.length ? Math.round((stats.learned + stats.known) * 100 / book.words.length) : 0;
  const fresh = book.words.length - stats.learned - stats.known;
  const categories = [...new Set(book.words.map(word => word.category).filter(Boolean))];
  const scopedWords = wordsForScope(book, settings.vocabularyCategory);
  const scopeOptions = categories.map(category => `<option value="${escapeHtml(category)}" ${settings.vocabularyCategory === category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("");
  document.getElementById("view-home").innerHTML = `
    <div class="page-heading"><div><p class="eyebrow">${new Intl.DateTimeFormat("zh-CN", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</p><h1>今天，继续积累</h1></div><div class="date-label">本地学习记录</div></div>
    <div class="overview-grid"><div class="metric"><div class="metric-label">今日新学</div><div class="metric-value">${daily.learned}<span class="metric-unit">词</span></div><div class="metric-note">今天累计</div></div><div class="metric"><div class="metric-label">待复习</div><div class="metric-value">${allDue()}<span class="metric-unit">词</span></div><div class="metric-note">到期词条</div></div><div class="metric"><div class="metric-label">今日时长</div><div class="metric-value">${Math.round((daily.seconds || 0) / 60)}<span class="metric-unit">分</span></div><div class="metric-note">累计 ${totalMinutes()} 分钟</div></div><div class="metric"><div class="metric-label">累计掌握</div><div class="metric-value">${masteredCount()}<span class="metric-unit">词</span></div><div class="metric-note">含已标熟</div></div></div>
    <div class="section-heading"><h2>当前词书</h2><button class="quiet-link" data-view="words">管理词书 →</button></div>
    <div class="book-summary"><div class="book-cover">${escapeHtml(book.name.slice(0, 1))}</div><div class="book-summary-main"><div class="book-summary-title">${escapeHtml(book.name)}</div><div class="book-summary-sub">${book.words.length} 个词条 · ${escapeHtml(book.category || "自定义词书")}${stats.known ? ` · 已标熟 ${stats.known}` : ""}</div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div></div><div class="summary-progress">${stats.learned + stats.known} / ${book.words.length}</div><div class="summary-actions"><button class="primary-button" data-action="start-new" ${fresh === 0 && !session ? "disabled" : ""}>${session?.mode === "new" ? "继续学习" : "开始学习"}</button><button class="secondary-button" data-action="start-review" ${stats.due || session?.mode === "review" ? "" : "disabled"}>${session?.mode === "review" ? "继续复习" : `复习 ${stats.due || ""}`}</button><button class="secondary-button" data-view="settings">计划</button></div></div>
     <section class="study-panel scope-panel"><div class="study-panel-header"><span>新词范围</span><span class="pill">仅影响待学新词</span></div><div class="scope-controls"><label>从第几个词开始<span class="number-stepper"><input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="${String(scopedWords.length || 1).length}" value="${Math.min(settings.vocabularyStart || 1, scopedWords.length || 1)}" data-scope="vocabularyStart" aria-label="从第几个词开始"><span class="stepper-buttons"><button type="button" data-step="1" aria-label="增加起始词">+</button><button type="button" data-step="-1" aria-label="减少起始词">−</button></span></span><span class="scope-word-preview" id="scope-word-preview">${escapeHtml(scopedWords[Math.min(settings.vocabularyStart || 1, scopedWords.length || 1) - 1]?.word || "超出主题范围")}</span></label><label>主题<select class="setting-select scope-select" data-scope="vocabularyCategory"><option value="all" ${settings.vocabularyCategory === "all" ? "selected" : ""}>全部主题</option>${scopeOptions}</select></label><span class="scope-count">${settings.vocabularyCategory === "all" ? "共" : "主题内共"} ${scopedWords.length} 个词条</span></div></section>
    <div class="study-layout"><section class="study-panel"><div class="study-panel-header"><span>签到日历</span><span class="pill">连续 ${streakDays()} 天</span></div>${renderCalendar()}<button class="secondary-button full-button" data-action="checkin">${state.checkins.includes(todayKey()) ? "今日已签到" : "今日签到"}</button></section><section class="study-panel"><div class="study-panel-header"><span>快捷入口</span></div><div class="quick-actions"><button class="quick-action" data-view="listen"><span class="quick-action-icon">♫</span><span><strong>随身听</strong><small>${book.words.length} 个词条</small></span></button><button class="quick-action" data-view="dict"><span class="quick-action-icon">⌕</span><span><strong>词典</strong><small>查词与例句</small></span></button><button class="quick-action" data-view="sentences"><span class="quick-action-icon">¶</span><span><strong>句库</strong><small>${state.favoriteSentences.length} 条例句</small></span></button><button class="quick-action" data-action="open-favorites"><span class="quick-action-icon">☆</span><span><strong>生词本</strong><small>${state.favoriteWords.length} 个收藏</small></span></button><button class="quick-action" id="backup-button"><span class="quick-action-icon">⇩</span><span><strong>导出备份</strong><small>词书与进度 JSON</small></span></button></div></section></div>
    <section class="recent-section"><div class="section-heading"><h2>最近学习</h2><button class="quiet-link" data-view="words">查看全部 →</button></div><div class="table-wrap"><table><thead><tr><th>单词</th><th>释义</th><th>状态</th></tr></thead><tbody>${recentRows(book)}</tbody></table></div></section>`;
}
function renderCalendar() {
  const days = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - 6);
  for (let index = 0; index < 7; index++) {
    const key = dateKey(cursor);
    const checked = state.checkins.includes(key);
    const isToday = key === todayKey();
    days.push(`<div class="calendar-day ${checked ? "checked" : ""} ${isToday ? "today" : ""}"><span>${["日", "一", "二", "三", "四", "五", "六"][cursor.getDay()]}</span><strong>${cursor.getDate()}</strong><i>${checked ? "✓" : ""}</i></div>`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return `<div class="calendar">${days.join("")}</div>`;
}
function recentRows(book) {
  return book.words.map(word => ({ word, record: getRecord(book.id, word) })).filter(item => item.record.lastSeen).sort((a, b) => b.record.lastSeen - a.record.lastSeen).slice(0, 5).map(({ word, record }) => `<tr><td>${escapeHtml(word.word)}</td><td>${escapeHtml(word.meaning)}</td><td><span class="word-state">${isKnown(word, book.id) ? "已标熟" : record.box >= 3 ? "已掌握" : record.box ? "学习中" : "待学习"}</span></td></tr>`).join("") || '<tr><td colspan="3" class="word-state">还没有学习记录</td></tr>';
}
function emptyHome() { return `<div class="page-heading"><div><p class="eyebrow">本地学习</p><h1>先导入一本词书</h1></div></div><section class="study-panel"><div class="empty-state"><div class="empty-mark">＋</div><strong>选择 CSV、TSV 或 JSON 词书文件</strong><p>词书和进度会保存在当前浏览器中。</p><button class="primary-button" id="empty-import">导入词书</button></div></section>`; }

function shuffle(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function phoneticKey(word) {
  return String(word.word || "").split(" / ")[0].toLowerCase().replace(/\s+/g, " ").trim();
}
function accentLabel() { return state.settings.accent === "us" ? "美" : "英"; }
function phoneticOf(word) {
  const own = String(word.phonetic || "").trim();
  if (own) return own;
  const entry = phoneticsMap[phoneticKey(word)];
  if (!entry) return "";
  const accent = state.settings.accent === "us" ? "us" : "uk";
  const value = entry[accent] || entry.uk || entry.us || "";
  return value ? `/${value}/` : "";
}
async function loadPhonetics() {
  try {
    const response = await fetch("./ielts/phonetics.json");
    if (!response.ok) return;
    phoneticsMap = await response.json();
    if (session) renderSession(); else renderShell();
  } catch (error) { /* phonetics are optional */ }
}

function meaningOf(word) {
  const pos = String(word.partOfSpeech || "").trim();
  const meaning = String(word.meaning || "暂无释义").trim();
  if (!pos) return meaning;
  if (meaning.toLowerCase().startsWith(pos.toLowerCase())) return meaning;
  return `${pos}${pos.endsWith(".") ? "" : "."} ${meaning}`;
}
function wordsForScope(book, category = "all") {
  return book?.words.filter(word => category === "all" || word.category === category) || [];
}
function startSession(mode) {
  if (session?.queue?.length) {
    currentBookId = session.sourceBookId || session.bookId || currentBookId;
    currentView = session.mode === "review" ? "review" : "home";
    renderShell();
    if (session.wordStartedAt) renderSession();
    else { prepareWord(); renderSession(); }
    return;
  }
  const book = currentBook(); if (!book) return;
  const stats = bookStats(book);
  let words = [];
  if (mode === "review") words = dueWords(book.id).map(entry => entry.word).slice(0, state.settings.reviewChunk || 100);
  else {
    const start = Math.max(1, Number(state.settings.vocabularyStart) || 1);
    const category = state.settings.vocabularyCategory || "all";
    words = wordsForScope(book, category).filter((word, index) => {
      const record = getRecord(book.id, word);
      return index + 1 >= start && !isKnown(word, book.id) && !record.introducedAt && record.box === 0 && record.seen === 0;
    }).slice(0, state.settings.groupSize || 20);
  }
  if (mode === "review" && !words.length) words = state.books.flatMap(source => dueWords(source.id).map(entry => ({ ...entry.word, _bookId: source.id }))).slice(0, state.settings.reviewChunk || 100);
  if (!words.length) { toast(mode === "review" ? "目前没有到期的复习词条" : "今天的新词已完成"); return; }
  session = createSession(mode, words, words[0]._bookId || book.id, book.id);
  persist();
  currentView = mode === "review" ? "review" : "home";
  prepareWord();
  renderShell();
  renderSession();
}
function createSession(mode, words, bookId, sourceBookId) {
  return { mode, bookId, sourceBookId, words, queue: words.map(word => ({ word, streak: 0, passes: 0 })), total: words.length, completed: 0, required: mode === "new" ? 3 : 1, answered: false, revealed: false, material: false, spelling: false, choice: null, answerGrade: null, noteDraft: "", startedAt: Date.now(), wordStartedAt: Date.now() };
}
function syncVocabularyStart(book) {
  if (!book || book.id !== IELTS_BOOK_ID) return;
  const category = state.settings.vocabularyCategory || "all";
  const start = Math.max(1, Number(state.settings.vocabularyStart) || 1);
  const scopedWords = wordsForScope(book, category);
  const next = scopedWords.findIndex((word, index) => {
    const record = getRecord(book.id, word);
    return index + 1 >= start && !isKnown(word, book.id) && !record.introducedAt && record.box === 0 && record.seen === 0;
  });
  if (next >= 0) state.settings.vocabularyStart = next + 1;
  else state.settings.vocabularyStart = scopedWords.length || 1;
}
function currentSessionWord() { return session?.queue?.[0]?.word || null; }
function prepareWord() {
  if (!session) return;
  const entry = session.queue[0];
  if (!entry) return;
  persist();
  const word = entry.word;
  const bookId = bookIdFor(word);
  const record = getRecord(bookId, word);
  session.answered = false;
  session.revealed = false;
  session.material = false;
  session.materialPage = 0;
  session.spelling = false;
  session.answerGrade = null;
  session.answerSource = null;
  session.choiceInspect = null;
  session.noteDraft = state.notes[recordKey(bookId, word)] || "";
  session.wordStartedAt = Date.now();
  session.choice = record.box <= 1 ? buildChoice(word, bookId) : null;
  persist();
  activeStudyTab = tabOrder()[0] || "phrase";
  if (!entry.autoPlayed && (state.settings.autoPronounce || (state.settings.listeningQuiz && session.choice))) {
    entry.autoPlayed = true;
    setTimeout(() => playAudio(word), 120);
  }
}
let activeStudyTab = "phrase";
function tabOrder() {
  const order = (state.settings.mnemonicOrder || DEFAULT_SETTINGS.mnemonicOrder).filter(tab => TAB_LABELS[tab]);
  return order.length ? order : [...DEFAULT_SETTINGS.mnemonicOrder];
}
function buildChoice(word, bookId) {
  const pool = state.books.find(book => book.id === bookId)?.words || [];
  const correct = meaningOf(word);
  const groupWords = word.groupWords || [];
  const sameGroup = pool.filter(item => item !== word && item.meaning && groupWords.includes(item.word) && meaningOf(item) !== correct);
  const rest = pool.filter(item => item !== word && item.meaning && !sameGroup.includes(item) && meaningOf(item) !== correct);
  const chosen = [];
  const seen = new Set([correct]);
  const take = list => {
    for (const item of shuffle(list)) {
      const meaning = meaningOf(item);
      if (seen.has(meaning)) continue;
      seen.add(meaning);
      chosen.push({ word: item.word, meaning, correct: false, confusable: groupWords.includes(item.word) });
      if (chosen.length >= 3) break;
    }
  };
  take(sameGroup);
  if (chosen.length < 3) take(rest);
  const options = [{ word: word.word, meaning: correct, correct: true, confusable: false }].concat(chosen);
  return { options: shuffle(options), selected: null };
}function renderSession() {
  if (!session) return renderShell();
  const entry = session.queue[0];
  if (!entry) return renderShell();
  const word = entry.word;
  const bookId = bookIdFor(word);
  const root = document.getElementById(`view-${session.mode === "review" ? "review" : "home"}`);
  if (!root) return;
  const total = session.total;
  const progress = Math.round(session.completed * 100 / total);
  const variants = word.variants?.length > 1 ? word.variants : [];
  const revealed = session.answered;
  const listening = state.settings.listeningQuiz && session.choice && !revealed;
  const spellingResult = revealed && session.answerSource === "spelling";
  const tabs = tabOrder();
  const panels = revealed && !session.choice ? `<div class="study-tabs">${tabs.map(tab => `<button class="study-tab ${activeStudyTab === tab ? "selected" : ""}" data-study-tab="${tab}">${TAB_LABELS[tab]}</button>`).join("")}</div>${renderTabPanel(word, activeStudyTab)}${session.material ? renderMaterial(word) : ""}` : "";
  const actions = session.spelling
    ? `<div class="spell-box"><input id="spell-input" class="spell-input" autocomplete="off" autocapitalize="off" placeholder="输入拼写，回车检查"><div class="spell-actions"><button class="answer-button again" data-action="cancel-spell">取消</button><button class="answer-button known" data-action="check-spell">检查</button></div></div>`
    : revealed
      ? (session.choice
        ? `<button class="answer-button known" data-action="continue">继续</button>`
        : `<button class="answer-button known" data-action="continue">下一词</button>${session.answerGrade === "known" ? '<button class="answer-button again" data-action="undo">记错了</button>' : ""}`)
      : (session.choice
        ? `<button class="answer-button again" data-action="reveal">看答案</button>`
        : `<button class="answer-button again" data-grade="again">不认识</button><button class="answer-button unsure" data-grade="unsure">模糊</button><button class="answer-button known" data-grade="known">认识</button>`);
  root.innerHTML = `<div class="learn-layout"><div class="learn-toolbar"><button data-action="exit-session">← 返回</button><span>${session.mode === "review" ? "复习" : "新词学习"} · ${Math.min(session.completed + 1, total)} / ${total}${entry.streak ? ` · 连对 ${entry.streak}/${session.required}` : ""}</span><span>${total - session.completed} 剩余</span></div>
   <article class="learn-card ${revealed ? "answered" : "recalling"}"><div class="learn-progress"><span style="width:${progress}%"></span></div>
  <div class="learn-topline"><span class="word-phonetic">${phoneticOf(word) ? `<span class="accent-tag">${accentLabel()}</span>${escapeHtml(phoneticOf(word))}` : escapeHtml(word.partOfSpeech || "")}</span><div class="word-tools"><button class="word-tool" data-action="play-audio">▶ 发音</button><button class="word-tool ${state.favoriteWords.includes(recordKey(bookId, word)) ? "active" : ""}" data-action="fav-word">☆ ${state.favoriteWords.includes(recordKey(bookId, word)) ? "已收藏" : "收藏"}</button>${state.settings.spellHint ? '<button class="word-tool" data-action="spell">abc 拼写</button>' : ""}<button class="word-tool ${isKnown(word, bookId) ? "active" : ""}" data-action="known">${isKnown(word, bookId) ? "已标熟" : "标熟"}</button><button class="like-pill" data-action="like">👍 ${likeCount(word, bookId)}</button></div></div>
  <h1 class="learn-word">${session.spelling ? "拼写测试" : listening ? "🎧 听音选义" : escapeHtml(word.word.split(" / ")[0])}</h1>
  ${!session.spelling && !listening && variants.length ? `<div class="word-variants">${variants.map(variant => `<span>${escapeHtml(variant)}</span>`).join("")}</div>` : ""}
  ${session.spelling ? `<div class="word-meaning spell-hint">${escapeHtml(meaningOf(word))}</div>` : ""}
   ${session.choice && !session.spelling ? `<div class="choice-stage"><div class="choice-prompt" ${revealed ? 'aria-hidden="true"' : ""}>${revealed || !listening ? "" : "听发音，选择对应词义"}</div>${!spellingResult ? renderChoice(word) : ""}</div>` : ""}
   ${(!session.choice || spellingResult) && revealed ? `<div class="word-meaning">${escapeHtml(meaningOf(word))}</div>` : ""}
  ${panels}
  ${revealed && !session.choice ? `<div class="learn-audio-row"><button class="word-audio" data-action="material">学习材料</button></div>` : ""}
  <div class="answer-actions">${actions}</div>
  ${revealed && session.answerGrade === "unsure" ? '<div class="unsure-hint">模糊按“没记住”处理，这个词稍后会在本组再次出现。</div>' : ""}
  </article></div>`;
  if (session.spelling) setTimeout(() => document.getElementById("spell-input")?.focus(), 30);
}
function renderChoice() {
  if (!session?.choice) return "";
  const choice = session.choice;
  const locked = choice.selected != null;
  return `<div class="choice-list">${choice.options.map((option, index) => {
    let cls = `choice-option ${String(option.meaning || "").length > 22 ? "long-meaning" : ""}`;
    if (locked) {
      if (option.correct) cls += " correct";
      else if (choice.selected === index) cls += " wrong";
      else if (session.choiceInspect === index) cls += " inspect";
    }
    const showWord = locked && (option.correct || choice.selected === index || session.choiceInspect === index);
    return `<button class="${cls}" data-choice="${index}"><span class="choice-meaning">${escapeHtml(option.meaning)}</span><span class="choice-word">${showWord && option.word ? escapeHtml(option.word) : ""}</span></button>`;
  }).join("")}</div>`;
}
const MORPHEME_PREFIXES = [["contra", "相反"], ["trans", "跨越；转变"], ["inter", "之间"], ["super", "在上；超过"], ["under", "在下；不足"], ["over", "过度；在上"], ["multi", "多"], ["micro", "微小"], ["macro", "宏大"], ["auto", "自己"], ["anti", "反对"], ["extra", "额外；超出"], ["pre", "在前；预先"], ["post", "在后"], ["sub", "在下；次于"], ["de", "否定；向下"], ["dis", "否定；分开"], ["con", "共同；加强"], ["com", "共同；加强"], ["ex", "向外；出"], ["in", "进入；否定"], ["im", "进入；否定"], ["re", "再；向后"], ["pro", "向前；支持"], ["per", "贯穿；彻底"], ["un", "否定"], ["non", "非"], ["mis", "错误"], ["co", "共同"]];
const MORPHEME_ROOTS = [["struct", "建造"], ["spect", "看"], ["port", "携带"], ["duct", "引导"], ["ject", "投掷"], ["miss", "送；派"], ["script", "写"], ["scrib", "写"], ["graph", "写；画"], ["log", "言语；学科"], ["bio", "生命"], ["geo", "土地"], ["therm", "热"], ["chron", "时间"], ["phon", "声音"], ["photo", "光"], ["cred", "相信"], ["fer", "带来"], ["form", "形状"], ["gen", "产生"], ["gress", "行走"], ["grad", "步；级"], ["lect", "选择；读"], ["loc", "地方"], ["man", "手"], ["mar", "海"], ["meter", "测量"], ["min", "小"], ["mot", "移动"], ["mov", "移动"], ["nov", "新"], ["ped", "脚"], ["puls", "推； pulse"], ["pend", "悬挂"], ["pos", "放置"], ["prim", "第一"], ["rupt", "破裂"], ["sect", "切"], ["sens", "感觉"], ["sent", "感觉"], ["serv", "服务；保持"], ["sist", "站立"], ["sol", "太阳；单独"], ["spec", "看"], ["spir", "呼吸"], ["tact", "触摸"], ["tempor", "时间"], ["tend", "伸展"], ["terr", "土地"], ["tract", "拉；抽"], ["vac", "空"], ["vent", "来"], ["ver", "真实"], ["vis", "看"], ["vid", "看"], ["voc", "声音；召唤"], ["vol", "意愿"], ["fund", "基础"], ["dur", "持久"], ["cap", "拿；头"], ["tain", "握住"], ["fact", "做"], ["fect", "做"], ["dict", "说"], ["flu", "流动"], ["fluct", "波动"], ["mort", "死"], ["nat", "出生"], ["par", "准备；相等"], ["plic", "折叠"], ["press", "压"], ["sci", "知道"], ["sequ", "跟随"], ["sist", "站立"], ["sta", "站立"], ["uni", "一"], ["viv", "生命"]];
const MORPHEME_SUFFIXES = [["ability", "能力"], ["ibility", "能力"], ["ization", "化"], ["isation", "化"], ["ation", "名词后缀"], ["ition", "名词后缀"], ["sion", "名词后缀"], ["tion", "名词后缀"], ["ment", "名词后缀"], ["ness", "名词后缀"], ["ance", "名词后缀"], ["ence", "名词后缀"], ["ity", "名词后缀"], ["ism", "主义；状态"], ["ist", "人"], ["ship", "状态；关系"], ["hood", "状态"], ["dom", "领域；状态"], ["able", "能…的"], ["ible", "能…的"], ["ous", "充满…的"], ["ful", "充满…的"], ["less", "没有…的"], ["ive", "有…性质的"], ["ic", "…的"], ["al", "…的"], ["ary", "…的；场所"], ["ish", "略…的"], ["like", "像…的"], ["ly", "副词后缀"], ["ize", "使…化"], ["ise", "使…化"], ["ify", "使…"], ["en", "使…"], ["ward", "向…"], ["wise", "方式"], ["er", "人；比较级"], ["or", "人"], ["ant", "人；…的"], ["ent", "人；…的"]];
const MEANING_STOPWORDS = ["大量", "足够", "状态", "行为", "动作", "情况", "方面", "东西", "表示", "进行", "某种", "一个", "一种", "的人", "的事", "使", "或", "与", "和", "及", "等", "地", "得"];
function wordBase(word) { return (word.word || "").split(" / ")[0].split(" ")[0]; }
function posOf(word) { return (word.partOfSpeech || "").toLowerCase(); }
function completeExample(example) {
  const text = String(example || "").replace(/\s+/g, " ").trim();
  if (!text || text.length < 20 || /\.\.\.|…/.test(text)) return "";
  if (!/^["“‘'A-Z]/.test(text) || /[,;:，；：]$/.test(text)) return "";
  if (text.split(/\s+/).filter(Boolean).length < 5) return "";
  const brackets = [["(", ")"], ["[", "]"], ["（", "）"]];
  if (brackets.some(([left, right]) => (text.match(new RegExp(`\\${left}`, "g")) || []).length !== (text.match(new RegExp(`\\${right}`, "g")) || []).length)) return "";
  return text;
}
function meaningTokens(meaning) {
  return String(meaning || "").toLowerCase().replace(/^[a-z]+\.?\s*/, "").split(/[；;，,、/（）()\s]+/).map(token => token.replace(/[的地得]/g, "")).filter(token => token.length >= 2 && !MEANING_STOPWORDS.includes(token));
}
function collocationsOf(word) {
  const result = [];
  const example = completeExample(word.example);
  if (example) result.push({ text: example, kind: "例句" });
  (word.groupWords || []).slice(0, 5).forEach(item => { if (item.toLowerCase() !== word.word.toLowerCase()) result.push({ text: item, kind: "同组词" }); });
  return result;
}
function pluralOf(base) {
  if (/(s|x|ch|sh)$/i.test(base)) return base + "es";
  if (/[^aeiou]y$/i.test(base)) return base.slice(0, -1) + "ies";
  return base + "s";
}
function inflectionsOf(word) {
  const base = wordBase(word);
  const pos = posOf(word);
  const out = [];
  if (/^v/.test(pos) || /verb/.test(pos)) {
    out.push(base + "s");
    out.push(/e$/i.test(base) ? base + "d" : base + "ed");
    out.push(/e$/i.test(base) ? base.slice(0, -1) + "ing" : base + "ing");
  }
  if (/^n/.test(pos) || /noun/.test(pos)) out.push(pluralOf(base));
  if (/^adj/.test(pos) || /adjective/.test(pos)) {
    out.push(/y$/i.test(base) ? base.slice(0, -1) + "ier" : base.length <= 7 ? base + "er" : "more " + base);
    out.push(/y$/i.test(base) ? base.slice(0, -1) + "iest" : base.length <= 7 ? base + "est" : "most " + base);
    out.push(/y$/i.test(base) ? base.slice(0, -1) + "ily" : base + "ly");
  }
  if (!out.length) out.push(pluralOf(base));
  return [...new Set(out.filter(item => item.toLowerCase() !== base.toLowerCase() && item.length > 2))].slice(0, 5);
}
function derivativesOf(word) {
  const base = wordBase(word);
  const pos = posOf(word);
  const out = [];
  if (/^adj/.test(pos) || /adjective/.test(pos)) {
    if (/ant$/i.test(base)) out.push(base.slice(0, -3) + "ance");
    else if (/ent$/i.test(base)) out.push(base.slice(0, -3) + "ence");
    out.push(base + "ness");
    if (!/ly$/i.test(base)) out.push(/y$/i.test(base) ? base.slice(0, -1) + "ily" : base + "ly");
  }
  if (/^v/.test(pos) || /verb/.test(pos)) {
    out.push(/e$/i.test(base) ? base.slice(0, -1) + "tion" : base + "tion");
    out.push(base + "ment");
    out.push(base + "er");
  }
  if (/^n/.test(pos) || /noun/.test(pos)) {
    out.push(base + "al");
    out.push(base + "ous");
  }
  if (!out.length) out.push(base + "ness", base + "ly");
  return [...new Set(out.filter(item => item.toLowerCase() !== base.toLowerCase()))].slice(0, 6);
}
function morphAnalyze(word) {
  const raw = wordBase(word).toLowerCase().replace(/[^a-z]/g, "");
  if (raw.length < 5) return null;
  const parts = [];
  let rest = raw;
  const prefix = MORPHEME_PREFIXES.filter(([text]) => rest.startsWith(text) && rest.length > text.length + 3).sort((a, b) => b[0].length - a[0].length)[0];
  if (prefix) { parts.push({ type: "前缀", text: prefix[0] + "-", meaning: prefix[1] }); rest = rest.slice(prefix[0].length); }
  let stem = rest;
  const suffix = MORPHEME_SUFFIXES.filter(([text]) => stem.endsWith(text) && stem.length > text.length + 2).sort((a, b) => b[0].length - a[0].length)[0];
  if (suffix) stem = stem.slice(0, stem.length - suffix[0].length);
  const root = MORPHEME_ROOTS.filter(([text]) => stem.includes(text)).sort((a, b) => b[0].length - a[0].length)[0];
  if (root) {
    const index = stem.indexOf(root[0]);
    if (index > 0) parts.push({ type: "词干", text: stem.slice(0, index), meaning: "" });
    parts.push({ type: "词根", text: root[0], meaning: root[1] });
    if (index + root[0].length < stem.length) parts.push({ type: "词干", text: stem.slice(index + root[0].length), meaning: "" });
  } else if (stem) parts.push({ type: "词干", text: stem, meaning: "" });
  if (suffix) parts.push({ type: "后缀", text: "-" + suffix[0], meaning: suffix[1] });
  return parts.length >= 2 ? parts : null;
}
function spellingChunks(word) {
  const base = wordBase(word);
  if (base.length <= 6) return [base];
  const target = Math.ceil(base.length / 3);
  const chunks = [];
  let index = 0;
  while (index < base.length) {
    let end = Math.min(base.length, index + target);
    if (end < base.length) {
      const nextVowel = base.slice(end).search(/[aeiouy]/i);
      if (nextVowel >= 0 && nextVowel <= 2) end = end + nextVowel;
    }
    chunks.push(base.slice(index, end));
    index = end;
  }
  if (chunks.length > 1 && chunks[chunks.length - 1].length < 2) chunks[chunks.length - 2] += chunks.pop();
  return chunks;
}
function relatedWordsOf(word, bookId) {
  const book = state.books.find(item => item.id === bookId);
  const tokens = meaningTokens(word.meaning);
  if (!book || !tokens.length) return [];
  return book.words.filter(item => item !== word && item.meaning).map(item => ({ word: item, score: meaningTokens(item.meaning).filter(token => tokens.includes(token)).length })).filter(entry => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, 6);
}
function generatedNote(word, bookId) {
  const base = wordBase(word);
  const parts = morphAnalyze(word);
  const lines = [`拼写切分：${spellingChunks(word).join(" · ")}`];
  if (parts) lines.push(`构词：${parts.map(part => `${part.text}${part.meaning ? `（${part.meaning}）` : ""}`).join(" + ")}`);
  const collocations = collocationsOf(word).slice(0, 3).map(item => item.text);
  if (collocations.length) lines.push(`搭配/同组：${collocations.join("；")}`);
  if (word.example) lines.push(`例句：${word.example}${word.translation ? `（${word.translation}）` : ""}`);
  const related = relatedWordsOf(word, bookId).slice(0, 3).map(item => item.word.word);
  if (related.length) lines.push(`相关词：${related.join("、")}`);
  lines.push(`记忆点：把「${base}」和上面的例句场景绑在一起，先想画面再想中文。`);
  return lines.join("\n");
}
function renderTabPanel(word, tab) {
  const bookId = bookIdFor(word);
  if (tab === "phrase") {
    const items = collocationsOf(word);
    return `<div class="tab-panel"><h3>词组搭配</h3>${items.length ? `<div class="collocation-list">${items.map(item => `<div class="collocation-row"><span class="collocation-text">${escapeHtml(item.text)}</span><span class="tab-src">${item.kind}</span></div>`).join("")}</div>` : '<p class="tab-empty">没有可用的例句或同组词。</p>'}</div>`;
  }
  if (tab === "root") {
    const parts = morphAnalyze(word);
    if (parts) {
      return `<div class="tab-panel"><h3>词根词缀</h3><div class="root-parts">${parts.map(part => `<div class="root-part"><span class="root-type">${part.type}</span><strong>${escapeHtml(part.text)}</strong><span>${escapeHtml(part.meaning || "词干")}</span></div>`).join("")}</div><p class="tab-note">${escapeHtml(parts.map(part => part.text).join(" + "))} = ${escapeHtml(wordBase(word))}</p>${word.extra ? `<p class="tab-note">${escapeHtml(word.extra)}</p>` : ""}<p class="tab-src">按常见词根词缀表匹配，非词源考证</p></div>`;
    }
    if (!state.settings.splitMnemonic) return `<div class="tab-panel"><h3>词根词缀</h3><p class="tab-note">拆分助记已在学习偏好中关闭。</p>${word.extra ? `<p class="tab-note">${escapeHtml(word.extra)}</p>` : ""}</div>`;
    return `<div class="tab-panel"><h3>词根词缀</h3><div class="chip-row">${spellingChunks(word).map(chunk => `<span class="chip">${escapeHtml(chunk)}</span>`).join("")}</div><p class="tab-note">未匹配到常见词根，按拼写切分。</p>${word.extra ? `<p class="tab-note">${escapeHtml(word.extra)}</p>` : ""}</div>`;
  }
  if (tab === "variant") {
    const forms = inflectionsOf(word);
    return `<div class="tab-panel"><h3>特殊变形</h3><div class="chip-row">${forms.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div><p class="tab-src">按词性规则推导，实际拼写以词典为准</p></div>`;
  }
  if (tab === "derive") {
    const forms = derivativesOf(word);
    return `<div class="tab-panel"><h3>派生词</h3><div class="chip-row">${forms.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>${(word.variants || []).length > 1 ? `<p class="tab-note">词条变形：${escapeHtml(word.variants.join(" / "))}</p>` : ""}<p class="tab-src">按构词规则推导，仅供参考</p></div>`;
  }
  if (tab === "note") return `<div class="tab-panel"><h3>我的笔记</h3><textarea id="note-input" class="note-input" placeholder="记录词根、搭配或自己的记忆点">${escapeHtml(session?.noteDraft || state.notes[recordKey(bookId, word)] || "")}</textarea><div class="note-actions"><button class="quiet-link" data-action="gen-note">生成参考笔记</button><span class="tab-src">自动保存到本设备</span></div></div>`;
  if (tab === "synonym") {
    const related = relatedWordsOf(word, bookId);
    const groups = (word.groupWords || []).filter(item => item.toLowerCase() !== word.word.toLowerCase()).slice(0, 6);
    const reading = readingSynonyms.get(wordBase(word).toLowerCase());
    const readingSyns = reading?.synonyms || word.synonyms || [];
    return `<div class="tab-panel"><h3>近义与相关</h3>${readingSyns.length ? `<p class="tab-note">阅读 538 同义替换</p><div class="chip-row">${readingSyns.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>` : ""}${related.length ? `<div class="collocation-list">${related.map(item => `<div class="collocation-row"><span class="collocation-text"><strong>${escapeHtml(item.word.word)}</strong> ${escapeHtml(item.word.meaning || "")}</span><span class="tab-src">释义匹配</span></div>`).join("")}</div>` : ""}${groups.length ? `<p class="tab-note">同组词</p><div class="chip-row">${groups.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>` : ""}${!readingSyns.length && !related.length && !groups.length ? `<div class="chip-row">${derivativesOf(word).map(item => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div><p class="tab-note">没有语义匹配，展示同词族形式。</p>` : ""}<p class="tab-src">按阅读 538、释义关键词与同组词匹配</p></div>`;
  }
  return "";
}
function renderMaterial(word) {
  const page = session?.materialPage || 0;
  const groups = (word.groupWords || []).filter(item => item.toLowerCase() !== word.word.toLowerCase()).slice(0, 8);
  const body = page === 0
    ? `<p class="material-title">${escapeHtml(word.example || "此词条没有收录例句")}</p><p class="material-trans">${escapeHtml(word.translation || "")}</p><p class="material-source">${escapeHtml(word.category || "自定义词书")}${word.groupNumber ? ` · 第 ${word.groupNumber} 组` : ""}</p>`
    : `${groups.length ? `<p class="material-subtitle">同组词</p><div class="chip-row">${groups.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>` : ""}${word.extra ? `<p class="material-trans">${escapeHtml(word.extra)}</p>` : ""}<p class="material-subtitle">拼写</p><div class="chip-row">${spellingChunks(word).map(chunk => `<span class="chip">${escapeHtml(chunk)}</span>`).join("")}</div>`;
  return `<div class="material-sheet"><div class="material-head"><strong>学习材料</strong><button class="quiet-link" data-action="material">收起卡片</button></div><div class="material-body">${body}</div><div class="material-foot">${page === 0 ? '<button class="quiet-link" data-action="fav-sentence">☆ 收藏例句</button>' : "<span></span>"}<div class="material-nav"><button class="quiet-link" data-action="material-page" data-page="-1" ${page === 0 ? "disabled" : ""}>←</button><span class="material-page">${page + 1} / 2</span><button class="quiet-link" data-action="material-page" data-page="1" ${page === 1 ? "disabled" : ""}>→</button></div><button class="quiet-link" data-action="continue">下一词</button></div></div>`;
}
function markAnswer(grade) {
  const word = currentSessionWord();
  if (!word) return;
  const bookId = bookIdFor(word);
  const record = getRecord(bookId, word);
  const now = Date.now();
  record.seen++;
  record.lastSeen = now;
  if (session.mode === "new" && !record.introducedAt) record.introducedAt = now;
  if (grade === "again") record.wrong++; else record.correct++;
  session.answered = true;
  session.answerGrade = grade;
  session.answerSource = session.spelling ? "spelling" : session.choice ? "choice" : "self";
}
function gradeWord(grade) {
  if (!session || session.answered) return;
  markAnswer(grade);
  session.revealed = true;
  renderSession();
}
function chooseOption(index) {
  if (!session?.choice || session.answered) return;
  const option = session.choice.options[index];
  if (!option) return;
  session.choice.selected = index;
  markAnswer(option.correct ? "known" : "again");
  renderSession();
}
function inspectChoice(index) {
  if (!session?.choice || !session.answered) return;
  if (!session.choice.options[index]) return;
  session.choiceInspect = index;
  renderSession();
}
function revealAnswer() {
  if (!session?.choice || session.answered) return;
  session.choice.selected = -2;
  markAnswer("again");
  renderSession();
}
function continueWord() {
  if (!session?.answered) return;
  const entry = session.queue[0];
  if (!entry) return;
  const word = entry.word;
  const bookId = bookIdFor(word);
  const record = getRecord(bookId, word);
  const now = Date.now();
  const grade = session.answerGrade;
  if (grade === "known") record.box = Math.min(5, record.box + 1);
  else if (grade === "again") record.box = Math.max(0, record.box - 1);
  const intervals = [10 * 60000, DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];
  const dueDelay = grade === "unsure" ? 6 * 60 * 60 * 1000 : intervals[record.box];
  const queue = state.reviews[bookId] || (state.reviews[bookId] = []);
  const existing = queue.find(item => item.word === word.word.toLowerCase());
  if (session.mode === "review" || grade !== "known" || record.box < 3) {
    if (existing) existing.dueAt = now + dueDelay;
    else queue.push({ word: word.word.toLowerCase(), dueAt: now + dueDelay });
  } else if (existing) state.reviews[bookId] = queue.filter(item => item.word !== word.word.toLowerCase());
  const today = state.daily[todayKey()] || (state.daily[todayKey()] = { learned: 0, reviewed: 0, seconds: 0 });
  if (entry.passes === 0) { if (session.mode === "review") today.reviewed++; else today.learned++; }
  entry.passes++;
  addSeconds((Date.now() - session.wordStartedAt) / 1000);
  session.queue.shift();
  let mastered = false;
  if (grade === "known") { entry.streak += 1; mastered = entry.streak >= session.required; }
  else entry.streak = 0;
  if (mastered) session.completed++;
  else {
    const gap = grade === "again" ? Math.min(4, session.queue.length) : Math.min(3, session.queue.length);
    session.queue.splice(gap, 0, entry);
  }
  if (session.mode === "new") syncVocabularyStart(state.books.find(book => book.id === session.sourceBookId));
  persist();
  if (!session.queue.length) {
    const mode = session.mode;
    session = null;
    persist();
    renderShell();
    toast(mode === "review" ? "复习完成，进度已保存" : "本轮学习完成，进度已保存");
  } else {
    prepareWord();
    renderSession();
  }
}
function undoWord() {
  if (!session?.answered) return;
  const word = currentSessionWord();
  const record = getRecord(bookIdFor(word), word);
  record.seen = Math.max(0, record.seen - 1);
  if (session.answerGrade === "again") record.wrong = Math.max(0, record.wrong - 1);
  else record.correct = Math.max(0, record.correct - 1);
  session.answered = false;
  session.revealed = false;
  session.answerGrade = null;
  if (session.choice) session.choice.selected = null;
  renderSession();
}
function exitSession() {
  if (session) addSeconds((Date.now() - session.wordStartedAt) / 1000);
  persist();
  renderShell();
}
function renderReview() {
  const due = state.books.flatMap(book => dueWords(book.id).map(({ item, word }) => ({ book, item, word }))).sort((a, b) => a.item.dueAt - b.item.dueAt);
  document.getElementById("view-review").innerHTML = `<div class="page-heading"><div><p class="eyebrow">按到期时间排序 · 每小结 ${state.settings.reviewChunk} 词</p><h1>复习队列</h1></div><button class="primary-button" data-action="start-review" ${due.length ? "" : "disabled"}>开始复习 ${due.length ? `· ${Math.min(due.length, state.settings.reviewChunk)}` : ""}</button></div><div class="overview-grid"><div class="metric"><div class="metric-label">今天到期</div><div class="metric-value">${due.length}<span class="metric-unit">词</span></div></div><div class="metric"><div class="metric-label">已完成复习</div><div class="metric-value">${todayStats().reviewed || 0}<span class="metric-unit">词</span></div></div><div class="metric"><div class="metric-label">词书数量</div><div class="metric-value">${state.books.length}<span class="metric-unit">本</span></div></div></div><div class="section-heading"><h2>待复习词条</h2></div>${due.length ? `<div class="review-queue">${due.slice(0, 50).map(({ book, word }) => `<div class="queue-row"><span class="queue-priority"></span><div class="queue-row-copy"><div class="queue-word">${escapeHtml(word.word)}</div><div class="queue-meta">${escapeHtml(book.name)} · ${escapeHtml(word.meaning || "暂无释义")}</div></div><div class="queue-actions"><button data-action="review-single" data-book="${escapeHtml(book.id)}" data-word="${escapeHtml(word.word)}">复习</button></div></div>`).join("")}</div>` : `<section class="study-panel"><div class="empty-state"><div class="empty-mark">✓</div><strong>目前没有到期词条</strong><p>学习新词后，系统会根据掌握情况安排复习。</p><button class="secondary-button" data-view="home">去学习新词</button></div></section>`}`;
}
function renderWords() {
  const book = currentBook();
  if (!book) { document.getElementById("view-words").innerHTML = emptyHome(); return; }
  const filters = [["all", "全部"], ["new", "未学习"], ["learning", "复习中"], ["done", "复习完成"], ["known", "已标熟"], ["fav", "已收藏"]];
  const filtered = book.words.filter(word => {
    const record = getRecord(book.id, word);
    const known = isKnown(word, book.id);
    if (wordFilter === "fav") return state.favoriteWords.includes(recordKey(book.id, word));
    if (wordFilter === "known") return known;
    if (known) return false;
    if (wordFilter === "new") return record.box === 0;
    if (wordFilter === "learning") return record.box > 0 && record.box < 3;
    if (wordFilter === "done") return record.box >= 3;
    return true;
  }).filter(word => `${word.word} ${word.meaning} ${word.example}`.toLowerCase().includes(searchQuery.toLowerCase()));
  document.getElementById("view-words").innerHTML = `<div class="page-heading"><div><p class="eyebrow">本地词书与学习记录</p><h1>词书浏览</h1></div><div class="heading-actions"><button class="quiet-link" id="help-button">格式说明</button><button class="primary-button" id="words-import">＋ 导入词书</button></div></div><div class="book-selector">${state.books.map(item => `<button class="book-chip ${item.id === book.id ? "selected" : ""}" data-book="${escapeHtml(item.id)}">${escapeHtml(item.name)} · ${item.words.length}</button>`).join("")}<button class="book-chip" id="books-export">导出词书与进度</button></div><div class="filter-tabs">${filters.map(([value, label]) => `<button class="filter-tab ${wordFilter === value ? "selected" : ""}" data-filter-tab="${value}">${label}</button>`).join("")}</div><div class="filters"><input class="search-input" id="word-search" placeholder="搜索单词、释义或例句" value="${escapeHtml(searchQuery)}"><span class="date-label">显示 ${filtered.length} / ${book.words.length}</span></div><div class="word-table"><table><thead><tr><th>单词</th><th>释义</th><th>状态</th><th>操作</th></tr></thead><tbody>${filtered.slice(0, 300).map(word => {
    const record = getRecord(book.id, word);
    const known = isKnown(word, book.id);
    const label = known ? "已标熟" : record.box >= 3 ? "复习完成" : record.box ? "复习中" : "未学习";
    return `<tr><td><span class="table-word"><button class="audio-mini" data-action="play-word" data-word="${escapeHtml(word.word)}">♪</button>${escapeHtml(word.word)}</span></td><td>${escapeHtml(word.meaning || "")}</td><td><span class="word-state">${label}</span></td><td class="row-actions"><button data-action="fav-word" data-word="${escapeHtml(word.word)}">${state.favoriteWords.includes(recordKey(book.id, word)) ? "已收藏" : "收藏"}</button><button data-action="known-word" data-word="${escapeHtml(word.word)}">${known ? "取消标熟" : "标熟"}</button></td></tr>`;
  }).join("") || '<tr><td colspan="4">没有匹配的词条</td></tr>'}</tbody></table></div><div class="book-management">${state.books.map(item => `<div class="book-management-row"><strong>${escapeHtml(item.name)}</strong><span>${item.words.length} 词条</span><span>${bookStats(item).learned} 已学</span><button class="danger-link" data-action="delete-book" data-book="${escapeHtml(item.id)}">删除本地词书</button></div>`).join("")}</div>`;
}
function renderListen() {
  const book = currentBook();
  const root = document.getElementById("view-listen");
  if (!book || !book.words.length) { root.innerHTML = emptyHome(); return; }
  if (listen.index >= book.words.length) listen.index = 0;
  const word = book.words[listen.index];
  const upcoming = book.words.slice(listen.index, listen.index + 30);
  root.innerHTML = `<div class="page-heading"><div><p class="eyebrow">随身听 · 本地词表</p><h1>${escapeHtml(book.name)}</h1></div><div class="date-label">${listen.index + 1} / ${book.words.length}</div></div><div class="listen-layout"><section class="listen-main"><div class="listen-word">${escapeHtml(word.word.split(" / ")[0])}</div><div class="listen-phonetic">${phoneticOf(word) ? `<span class="accent-tag">${accentLabel()}</span>${escapeHtml(phoneticOf(word))}` : ""} ${word.partOfSpeech ? `· ${escapeHtml(word.partOfSpeech)}` : ""}</div><div class="listen-meaning">${escapeHtml(meaningOf(word))}</div><div class="listen-example"><p>${escapeHtml(word.example || "此词条没有收录例句")}</p><p class="muted">${escapeHtml(word.translation || "")}</p></div><div class="listen-controls"><button class="icon-toggle" data-action="listen-prev">◀</button><button class="listen-play" data-action="listen-play">${listen.playing ? "❚❚" : "▶"}</button><button class="icon-toggle" data-action="listen-next">▶</button><button class="icon-toggle" data-action="listen-sleep">${listen.sleepMinutes ? `⏱ ${listen.sleepMinutes}分` : "⏱ 定时"}</button></div></section><aside class="listen-list"><div class="listen-list-head">词表</div>${upcoming.map((item, offset) => `<button class="listen-row ${offset === 0 ? "current" : ""}" data-action="listen-jump" data-index="${listen.index + offset}"><span>${listen.index + offset + 1}</span><strong>${escapeHtml(item.word.split(" / ")[0])}</strong><small>${escapeHtml(item.meaning || "")}</small></button>`).join("")}</aside></div>`;
}
async function loadListeningData() {
  try {
    const response = await fetch("./ielts/listening/listening179.json");
    if (!response.ok) throw new Error("HTTP " + response.status);
    listeningData = await response.json();
    listeningState.index = Math.min(state.listening.index || 0, Math.max(0, listeningData.length - 1));
    if (currentView === "listening") renderListening();
  } catch (error) {
    listeningState.message = "听力数据加载失败。请通过本地服务器打开本项目（不要直接双击 index.html）。";
    if (currentView === "listening") renderListening();
  }
}
function listeningAudioUrl(word) { return `./ielts/listening/179_audios/${encodeURIComponent(word)}.mp3`; }
function playListeningAudio(word) {
  const item = word || listeningData[listeningState.index];
  if (!item) return;
  stopAudio();
  const audio = new Audio(listeningAudioUrl(item.word));
  listen.audio = audio;
  audio.play().catch(() => speak(item.word));
}
function normalizeListenText(value) { return String(value || "").trim().toLowerCase().replace(/\s+/g, " "); }
function checkListening() {
  const item = listeningData[listeningState.index];
  if (!item) return;
  const wordInput = document.getElementById("listening-word");
  const synInput = document.getElementById("listening-syn");
  listeningState.typedWord = wordInput ? wordInput.value : listeningState.typedWord;
  listeningState.typedSyn = synInput ? synInput.value : listeningState.typedSyn;
  const typedWord = normalizeListenText(listeningState.typedWord);
  const typedSyns = listeningState.typedSyn.split(/[,，]/).map(normalizeListenText).filter(Boolean);
  const wordOk = typedWord === normalizeListenText(item.word);
  const missing = (item.replace || []).filter(syn => !typedSyns.includes(normalizeListenText(syn)));
  listeningState.result = { wordOk, missing, typedSyns };
  listeningState.revealed = true;
  if (wordOk && !missing.length) { state.listening.done[item.index] = true; persist(); }
  else delete state.listening.done[item.index];
  persist();
  renderListening();
}
function nextListening(step) {
  if (!listeningData.length) return;
  listeningState.index = (listeningState.index + step + listeningData.length) % listeningData.length;
  state.listening.index = listeningState.index;
  listeningState.revealed = false;
  listeningState.result = null;
  listeningState.typedWord = "";
  listeningState.typedSyn = "";
  persist();
  renderListening();
  playListeningAudio();
}
function renderListening() {
  const root = document.getElementById("view-listening");
  const total = listeningData.length;
  const done = Object.keys(state.listening.done || {}).length;
  if (!total) {
    root.innerHTML = `<div class="page-heading"><div><p class="eyebrow">听力 179 考点词</p><h1>听力</h1></div><div class="date-label">本地材料</div></div><section class="study-panel"><div class="empty-state"><div class="empty-mark">♫</div><strong>${listeningState.message || "正在加载听力材料…"}</strong><p>文件位置：ielts/listening/listening179.json 与 179_audios/。</p><button class="secondary-button" data-action="load-listening">重新加载</button></div></section>`;
    return;
  }
  const item = listeningData[listeningState.index];
  const result = listeningState.result;
  const showAnswer = listeningState.revealed;
  root.innerHTML = `<div class="page-heading"><div><p class="eyebrow">听力 179 考点词</p><h1>听力听写</h1></div><div class="date-label">已完成 ${done} / ${total}</div></div><section class="listening-card"><div class="listening-top"><span class="pill">${listeningState.index + 1} / ${total}</span><button class="word-tool" data-action="listening-play">▶ 播放音频</button><button class="word-tool" data-action="listening-reveal">${showAnswer ? "隐藏答案" : "显示答案"}</button></div><div class="listening-inputs"><label>考点词<input id="listening-word" class="search-input" autocomplete="off" placeholder="听发音，输入单词或词组" value="${escapeHtml(listeningState.typedWord)}"></label><label>同义替换（英文逗号分隔）<input id="listening-syn" class="search-input" autocomplete="off" placeholder="例如：book, reserve" value="${escapeHtml(listeningState.typedSyn)}"></label></div>${result ? `<div class="listening-result ${result.wordOk && !result.missing.length ? "ok" : "bad"}">${result.wordOk ? "考点词正确" : `考点词错误：应为 <strong>${escapeHtml(item.word)}</strong>`}${result.missing.length ? `；还缺同义词：${result.missing.map(value => `<strong>${escapeHtml(value)}</strong>`).join("、")}` : "；同义替换完整"}</div>` : ""}${showAnswer ? `<div class="listening-answer"><div class="listening-answer-head"><strong>${escapeHtml(item.word)}</strong>${item.type ? `<span class="tab-src">${escapeHtml(item.type)}</span>` : ""}<span class="tab-src">${escapeHtml(item.meaning || "")}</span></div><div class="chip-row">${(item.replace || []).map(syn => `<span class="chip ${result && !result.missing.includes(syn) && result.typedSyns.includes(normalizeListenText(syn)) ? "hit" : ""}">${escapeHtml(syn)}</span>`).join("")}</div></div>` : ""}<div class="listening-actions"><button class="secondary-button" data-action="listening-prev">← 上一题</button><button class="primary-button" data-action="listening-check">检查</button><button class="secondary-button" data-action="listening-next">下一题 →</button></div><p class="kbd-hint">回车检查；Tab 从考点词切到同义替换；按 \` 播放音频。</p></section><section class="listening-list-section"><div class="section-heading"><h2>全部考点词</h2><span class="date-label">点击行切换</span></div><div class="listening-table">${listeningData.map((entry, index) => `<div class="listening-row ${index === listeningState.index ? "current" : ""} ${state.listening.done[entry.index] ? "done" : ""}" data-action="listening-jump" data-index="${index}"><span class="listening-index">${entry.index}</span><span class="listening-word">${escapeHtml(entry.word)}</span><span class="listening-type">${escapeHtml(entry.type || "")}</span><span class="listening-meaning">${escapeHtml(entry.meaning || "")}</span><span class="listening-syns">${escapeHtml((entry.replace || []).join(" / "))}</span><button class="audio-mini" data-action="listening-play-one" data-word="${escapeHtml(entry.word)}">▶</button></div>`).join("")}</div></section>`;
}
function renderDict() {
  const book = currentBook();
  const root = document.getElementById("view-dict");
  if (!book) { root.innerHTML = emptyHome(); return; }
  const query = dictQuery.trim().toLowerCase();
  const results = (query ? book.words.filter(word => `${word.word} ${word.meaning} ${word.example}`.toLowerCase().includes(query)) : book.words).slice(0, 30);
  const selected = (dictSelected && findWord(dictSelected, book.id)) || results[0] || null;
  const tabs = [["collins", "释义"], ["derive", "变形"], ["root", "词根"], ["synonym", "相关"], ["exam", "同组"], ["note", "笔记"]];
  let body = '<p class="tab-empty">没有匹配的词条。</p>';
  if (selected) {
    const key = recordKey(book.id, selected);
    if (dictTab === "collins") body = `<div class="dict-meaning">${escapeHtml(meaningOf(selected))}</div><p class="dict-example">${escapeHtml(selected.example || "此词条没有收录例句")}</p><p class="dict-trans">${escapeHtml(selected.translation || "")}</p>`;
    else if (dictTab === "derive") body = (selected.variants || []).length ? `<div class="chip-row">${selected.variants.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>` : '<p class="tab-empty">没有派生形式。</p>';
    else if (dictTab === "root") body = selected.extra ? `<p class="dict-example">${escapeHtml(selected.extra)}</p>` : '<p class="tab-empty">没有词根词缀数据。</p>';
    else if (dictTab === "synonym") { const related = relatedWordsOf(selected, book.id); const reading = readingSynonyms.get(wordBase(selected).toLowerCase()); const readingSyns = reading?.synonyms || selected.synonyms || []; body = `${readingSyns.length ? `<p class="tab-note">阅读 538 同义替换</p><div class="chip-row">${readingSyns.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>` : ""}${related.length ? `<div class="collocation-list">${related.map(item => `<div class="collocation-row"><span class="collocation-text"><strong>${escapeHtml(item.word.word)}</strong> ${escapeHtml(item.word.meaning || "")}</span><span class="tab-src">释义匹配</span></div>`).join("")}</div>` : ""}${!readingSyns.length && !related.length && (selected.groupWords || []).length ? `<div class="chip-row">${selected.groupWords.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div><p class="tab-note">没有语义匹配，展示同组词。</p>` : ""}${!readingSyns.length && !related.length && !(selected.groupWords || []).length ? '<p class="tab-empty">没有可匹配的相关词。</p>' : ""}`; }
    else if (dictTab === "exam") body = (selected.groupWords || []).length ? `<div class="chip-row">${selected.groupWords.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>` : '<p class="tab-empty">没有同组词数据。</p>';
    else if (dictTab === "note") body = state.notes[key] ? `<p class="dict-example">${escapeHtml(state.notes[key])}</p>` : '<p class="tab-empty">还没有笔记，可在学习卡片中记录。</p>';
  }
  root.innerHTML = `<div class="page-heading"><div><p class="eyebrow">本地词典 · 不联网</p><h1>词典</h1></div><div class="date-label">${book.name}</div></div><div class="dict-search"><input class="search-input" id="dict-search" placeholder="搜索单词、释义或例句" value="${escapeHtml(dictQuery)}"></div><div class="filter-tabs">${tabs.map(([value, label]) => `<button class="filter-tab ${dictTab === value ? "selected" : ""}" data-dict-tab="${value}">${label}</button>`).join("")}</div><div class="dict-layout"><div class="dict-results">${results.map(word => `<button class="dict-row ${selected === word ? "selected" : ""}" data-dict-word="${escapeHtml(word.word)}"><strong>${escapeHtml(word.word.split(" / ")[0])}</strong><small>${escapeHtml(word.meaning || "")}</small></button>`).join("") || '<p class="tab-empty">无结果</p>'}</div><section class="dict-detail">${selected ? `<div class="dict-head"><div><h2>${escapeHtml(selected.word)}</h2><p class="dict-phonetic">${phoneticOf(selected) ? `<span class="accent-tag">${accentLabel()}</span>${escapeHtml(phoneticOf(selected))}` : ""}</p></div><button class="word-audio" data-action="play-word" data-word="${escapeHtml(selected.word)}">▶ 发音</button></div><div class="dict-body">${body}</div>` : '<p class="tab-empty">搜索一个词开始。</p>'}</section></div>`;
}
function renderSentences() {
  const root = document.getElementById("view-sentences");
  const items = state.favoriteSentences;
  root.innerHTML = `<div class="page-heading"><div><p class="eyebrow">收藏的例句</p><h1>例句库</h1><p class="page-sub">收藏学习卡片中的例句，英文原句下方标注它是什么意思。</p></div><div class="date-label">${items.length} 条</div></div>${items.length ? `<div class="sentence-list">${items.map(item => `<article class="sentence-card"><p class="sentence-en">${escapeHtml(item.sentence)}</p><p class="sentence-cn"><span class="sentence-label">是什么意思</span>${escapeHtml(item.translation || "")}</p><div class="sentence-foot"><span>${escapeHtml(item.word)} · ${escapeHtml(item.source || "")}</span><button class="quiet-link" data-action="unfav-sentence" data-key="${escapeHtml(item.id)}">移除</button></div></article>`).join("")}</div>` : `<section class="study-panel"><div class="empty-state"><div class="empty-mark">¶</div><strong>还没有任何例句</strong><p>点击例句卡片的 ☆ 收藏例句，这里会显示英文原句和它是什么意思。</p><button class="secondary-button" data-view="home">去学习</button></div></section>`}`;
}
async function loadReferenceData() {
  try {
    const [readingModule, writingModule] = await Promise.all([
      import("./ielts/reading/reading538words.js"),
      import("./ielts/writing/100sentences.js")
    ]);
    readingGroups = readingModule.default || [];
    writingSentences = writingModule.default || [];
    readingSynonyms = new Map();
    readingGroups.forEach(group => (group.words || []).forEach(row => {
      const word = String(row[1] || "").toLowerCase().split(" / ")[0];
      if (!word) return;
      readingSynonyms.set(word, { synonyms: row[4] || [], meanings: row[3] || [], pos: row[2] || [], group: group.title || "" });
    }));
  } catch (error) {
    materialsMessage = "阅读/写作资料加载失败。请通过本地服务器打开本项目。";
  }
  try {
    const response = await fetch("./ielts/materials.json");
    if (response.ok) materialManifest = await response.json();
  } catch (error) { /* manifest is optional */ }
  if (currentView === "materials") renderMaterials();
}
function renderMaterials() {
  const root = document.getElementById("view-materials");
  const tabs = [["writing", "写作 100 句"], ["reading", "阅读 538 词"], ["grammar", "语法资料"]];
  const writing = writingSentences.filter(item => item && item.sentence);
  const readingCount = readingGroups.reduce((sum, group) => sum + (group.words || []).length, 0);
  let body = "";
  if (materialTab === "writing") {
    body = writing.length ? `<section class="materials-panel"><div class="materials-head"><strong>写作 100 句</strong><span class="tab-src">${writing.length} 句 · 中文原句 + 参考译文</span></div>${writingSentences.map(item => item && item.title ? `<div class="writing-section">${escapeHtml(item.title)}</div>` : (item && item.sentence ? `<article class="writing-card"><p class="writing-cn">${item.no ? `<span class="writing-no">${item.no}</span>` : ""}${escapeHtml(item.sentence)}</p><p class="writing-en">${escapeHtml(item.translationFromBook || "")}</p>${item.chatgpt && item.chatgpt !== item.translationFromBook ? `<p class="writing-en alt">${escapeHtml(item.chatgpt)}</p>` : ""}${item.remark ? `<p class="tab-src">${escapeHtml(item.remark)}</p>` : ""}</article>` : "")).join("")}</section>` : `<section class="materials-panel"><div class="empty-state"><strong>${materialsMessage || "写作资料未加载"}</strong><button class="secondary-button" data-action="load-references">重新加载</button></div></section>`;
  }
  if (materialTab === "reading") {
    body = readingGroups.length ? `<section class="materials-panel"><div class="materials-head"><strong>阅读 538 考点词</strong><span class="tab-src">${readingGroups.length} 组 · ${readingCount} 词</span><button class="primary-button" data-action="import-reading-book">导入为词书</button></div>${readingGroups.map(group => `<div class="reading-group"><div class="reading-group-head"><strong>${escapeHtml(group.title || "")}</strong><span class="tab-src">${escapeHtml(group.define || "")}${group.require ? ` · ${escapeHtml(group.require)}` : ""}</span></div>${(group.words || []).map(row => `<div class="reading-row"><span class="reading-word">${escapeHtml(row[1])}</span><span class="reading-pos">${escapeHtml((row[2] || []).join("."))}</span><span class="reading-meaning">${escapeHtml((row[3] || []).join("；"))}</span><span class="reading-syns">${escapeHtml((row[4] || []).join(" / "))}</span></div>`).join("")}</div>`).join("")}</section>` : `<section class="materials-panel"><div class="empty-state"><strong>${materialsMessage || "阅读资料未加载"}</strong><button class="secondary-button" data-action="load-references">重新加载</button></div></section>`;
  }
  if (materialTab === "grammar") {
    const files = materialManifest.grammar || [];
    body = `<section class="materials-panel"><div class="materials-head"><strong>语法资料</strong><span class="tab-src">本地 PDF / SVG</span></div>${files.length ? files.map(file => `<a class="material-link" href="./ielts/grammar/${encodeURIComponent(file.name)}" target="_blank" rel="noopener"><span class="material-link-name">${escapeHtml(file.name)}</span><span class="material-link-size">${Math.round(file.size / 1024)} KB</span><span class="material-link-open">打开 →</span></a>`).join("") : '<p class="tab-empty">没有找到语法资料文件。</p>'}</section>`;
  }
  root.innerHTML = `<div class="page-heading"><div><p class="eyebrow">本地资料库</p><h1>资料</h1></div><div class="date-label">不联网 · 随项目分发</div></div><div class="filter-tabs">${tabs.map(([value, label]) => `<button class="filter-tab ${materialTab === value ? "selected" : ""}" data-material-tab="${value}">${label}</button>`).join("")}</div>${body}`;
}
function importReadingBook() {
  if (!readingGroups.length) { toast("阅读资料未加载"); return; }
  const words = [];
  const seen = new Set();
  readingGroups.forEach(group => {
    const groupWords = (group.words || []).map(row => String(row[1]));
    (group.words || []).forEach(row => {
      const name = String(row[1] || "").trim();
      if (!name || seen.has(name.toLowerCase())) return;
      seen.add(name.toLowerCase());
      const pos = (row[2] || []).join(".");
      const meaning = (row[3] || []).join("；");
      words.push({ word: name, variants: [name], meaning: `${pos} ${meaning}`.trim(), partOfSpeech: pos, synonyms: row[4] || [], category: group.title || "阅读 538", groupNumber: group.title || "", groupWords, audio: "" });
    });
  });
  const book = { id: "ielts-reading-538", name: "阅读 538 考点词", category: "阅读", createdAt: Date.now(), words };
  const index = state.books.findIndex(item => item.id === book.id);
  if (index < 0) state.books.push(book); else state.books[index] = book;
  currentBookId = book.id;
  persist(); currentView = "home"; renderShell();
  toast(`已导入阅读 538 词书（${words.length} 词）`);
}
function renderSettings() {
  const s = state.settings;
  const row = (label, desc, control) => `<div class="settings-row"><div><strong>${label}</strong>${desc ? `<small>${desc}</small>` : ""}</div>${control}</div>`;
  const toggle = (key, on) => `<button class="switch ${on ? "on" : ""}" data-toggle="${key}" role="switch" aria-checked="${on}"></button>`;
  const options = (key, values, value) => `<select class="setting-select" data-setting="${key}">${values.map(([v, label]) => `<option value="${v}" ${String(v) === String(value) ? "selected" : ""}>${label}</option>`).join("")}</select>`;
  const fontStepper = `<span class="font-stepper"><button type="button" data-font-step="-1" aria-label="减小全局字号">−</button><output>${s.globalFontSize > 0 ? `+${s.globalFontSize}` : s.globalFontSize}px</output><button type="button" data-font-step="1" aria-label="增大全局字号">+</button></span>`;
  document.getElementById("view-settings").innerHTML = `<div class="page-heading"><div><p class="eyebrow">学习设置</p><h1>学习偏好</h1></div><div class="date-label">仅保存在本设备</div></div><section class="settings-card">${row("全局字号", "所有页面文字整体调整，每次改变 1px", fontStepper)}${row("单词发音类型", "", `<button class="segmented" data-action="toggle-accent"><span class="${s.accent === "uk" ? "on" : ""}">英式</span><span class="${s.accent === "us" ? "on" : ""}">美式</span></button>`)}${row("自动发音", "进入卡片时自动播放", toggle("autoPronounce", s.autoPronounce))}${row("拼写", "学习、复习时提供拼写提示", toggle("spellHint", s.spellHint))}${row("学习节奏", "每组新词数量", options("groupSize", [[10, "10 词/组"], [20, "20 词/组"], [30, "30 词/组"]], s.groupSize))}${row("复习节奏", "每次复习小结数量", options("reviewChunk", [[50, "50 词/小结"], [100, "100 词/小结"], [150, "150 词/小结"]], s.reviewChunk))}${row("听音选义题型", "听到发音后选择释义", toggle("listeningQuiz", s.listeningQuiz))}${row("拆分助记", "学习时自动拆分单词", toggle("splitMnemonic", s.splitMnemonic))}${row("混淆项辨析", "显示选择题错误选项词义", toggle("confuseAnalyze", s.confuseAnalyze))}${row("助记顺序", "调整学习卡片内容顺序", `<button class="quiet-link" data-action="order-open">${orderOpen ? "收起" : "调整"}</button>`)}</section>${orderOpen ? renderOrderEditor() : ""}<section class="settings-card">${row("外观与沉浸场景", "主题、字体与背景", '<button class="quiet-link" data-view="appearance">前往 →</button>')}</section>`;
}
function renderOrderEditor() {
  return `<section class="settings-card order-card"><div class="settings-row"><div><strong>助记顺序</strong><small>从上到下排列，使用箭头调整</small></div></div>${tabOrder().map((tab, index) => `<div class="order-row"><span>${TAB_LABELS[tab]}</span><div class="order-actions"><button data-action="order-move" data-index="${index}" data-dir="-1" ${index === 0 ? "disabled" : ""}>↑</button><button data-action="order-move" data-index="${index}" data-dir="1" ${index === tabOrder().length - 1 ? "disabled" : ""}>↓</button></div></div>`).join("")}</section>`;
}
function renderAppearance() {
  const s = state.settings;
  const themes = [["light", "明亮"], ["deep", "深邃"], ["night", "极夜"]];
  document.getElementById("view-appearance").innerHTML = `<div class="page-heading"><div><p class="eyebrow">外观</p><h1>主题与字体</h1></div><div class="date-label">跟随系统时可自动切换</div></div><div class="theme-grid">${themes.map(([value, label]) => `<button class="theme-card ${s.theme === value ? "selected" : ""}" data-theme-set="${value}"><span class="theme-preview ${value}"></span><strong>${label}</strong></button>`).join("")}</div><section class="settings-card"><div class="settings-row"><div><strong>跟随系统</strong><small>根据系统深浅色自动切换</small></div><button class="switch ${s.followSystem ? "on" : ""}" data-toggle="followSystem" role="switch" aria-checked="${s.followSystem}"></button></div><div class="settings-row"><div><strong>风格字体</strong><small>${s.fontStyle === "serif" ? "宋体风格" : "现代简约"}</small></div><button class="segmented" data-action="toggle-font"><span class="${s.fontStyle === "sans" ? "on" : ""}">现代</span><span class="${s.fontStyle === "serif" ? "on" : ""}">衬线</span></button></div></section>`;
}
function toast(message) { const node = document.getElementById("toast"); node.textContent = message; node.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove("show"), 2600); }
function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `cixu-backup-${todayKey()}.json`; link.click(); URL.revokeObjectURL(link.href); toast("已导出词书与学习进度");
}
async function importFile(file) {
  try {
    const text = await file.text();
    if (file.name.toLowerCase().endsWith(".json")) {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.books) && parsed.records && parsed.reviews) {
        state = { ...parsed, notes: parsed.notes || {}, favoriteWords: parsed.favoriteWords || [], favoriteSentences: parsed.favoriteSentences || [], likes: parsed.likes || {}, known: parsed.known || {}, checkins: parsed.checkins || [], settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) } };
        session = state.session?.queue?.length ? state.session : null;
        currentBookId = state.activeBookId || state.books[0]?.id;
        const importedIelts = state.books.find(book => book.id === IELTS_BOOK_ID);
        if (importedIelts) syncVocabularyStart(importedIelts);
        persist(); applyTheme(); currentView = "home"; renderShell(); toast("已恢复词书与学习进度"); return;
      }
    }
    const imported = parseImport(text, file.name);
    const unique = new Map();
    let skipped = 0;
    imported.words.forEach(word => {
      if (!word?.word || !word.meaning) { skipped++; return; }
      unique.set(word.word.toLowerCase(), word);
    });
    if (!unique.size) throw new Error("没有有效词条；每个词条必须包含单词和中文释义");
    const id = `book-${Date.now().toString(36)}`;
    state.books.push({ id, name: imported.name || "导入词书", category: "导入", createdAt: Date.now(), words: [...unique.values()] }); currentBookId = id; persist(); currentView = "home"; renderShell(); toast(`已导入 ${unique.size} 个词条${skipped ? `，跳过 ${skipped} 个无效词条` : ""}`);
  } catch (error) { showModal("导入失败", error.message || "无法读取该文件"); }
}
function showModal(title, message, confirmLabel = "关闭", onConfirm) {
  const backdrop = document.createElement("div"); backdrop.className = "modal-backdrop"; backdrop.innerHTML = `<div class="modal"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p><div class="modal-actions"><button class="secondary-button" data-modal-cancel>取消</button><button class="primary-button" data-modal-confirm>${escapeHtml(confirmLabel)}</button></div></div>`;
  document.body.append(backdrop); backdrop.addEventListener("click", event => { if (event.target === backdrop || event.target.closest("[data-modal-cancel]")) backdrop.remove(); if (event.target.closest("[data-modal-confirm]")) { backdrop.remove(); onConfirm?.(); } });
}
function speak(text) { if ("speechSynthesis" in window) { window.speechSynthesis.cancel(); const utter = new SpeechSynthesisUtterance(text); utter.lang = state.settings.accent === "us" ? "en-US" : "en-GB"; window.speechSynthesis.speak(utter); } else toast("此浏览器不支持系统语音"); }
function stopAudio() { if (listen.audio) { listen.audio.pause(); listen.audio = null; } }
function playAudio(word) {
  if (!word) return;
  stopAudio();
  if (word.audio) {
    const audio = new Audio(word.audio);
    listen.audio = audio;
    audio.onended = () => { if (listen.playing && currentView === "listen") listenNext(true); };
    audio.play().catch(() => speak(word.word.split(" / ")[0]));
  } else speak(word.word.split(" / ")[0]);
}
function playWord(wordText) { const word = findWord(wordText); if (word) playAudio(word); else speak(wordText); }
function listenNext(auto) {
  const book = currentBook(); if (!book) return;
  listen.index = (listen.index + 1) % book.words.length;
  persist(); renderListen();
  if (auto || listen.playing) playAudio(book.words[listen.index]);
}
function toggleListenPlay() {
  const book = currentBook(); if (!book) return;
  if (listen.playing) { listen.playing = false; stopAudio(); }
  else { listen.playing = true; playAudio(book.words[listen.index]); }
  renderListen();
}
function toggleFavWord(word, bookId = bookIdFor(word)) {
  const key = recordKey(bookId, word);
  const index = state.favoriteWords.indexOf(key);
  if (index >= 0) { state.favoriteWords.splice(index, 1); toast("已取消收藏"); }
  else { state.favoriteWords.push(key); toast("已收藏"); }
  persist();
  if (session) renderSession(); else renderShell();
}
function toggleKnown(word, bookId = bookIdFor(word)) {
  const key = recordKey(bookId, word);
  if (state.known[key]) { delete state.known[key]; toast("已取消标熟"); }
  else {
    state.known[key] = true;
    state.reviews[bookId] = (state.reviews[bookId] || []).filter(item => item.word !== word.word.toLowerCase());
    toast("已标熟，不再安排学习与复习");
  }
  persist();
  if (session) renderSession(); else renderShell();
}
function toggleLike(word, bookId = bookIdFor(word)) {
  const key = recordKey(bookId, word);
  if (state.likes[key]) { delete state.likes[key]; }
  else state.likes[key] = 1;
  persist();
  if (session) renderSession();
}
function toggleFavSentence(word, bookId = bookIdFor(word)) {
  if (!word.example) return toast("此词条没有例句");
  const id = `${recordKey(bookId, word)}|${word.example.slice(0, 24)}`;
  const index = state.favoriteSentences.findIndex(item => item.id === id);
  if (index >= 0) { state.favoriteSentences.splice(index, 1); toast("已取消收藏例句"); }
  else { state.favoriteSentences.push({ id, word: word.word, sentence: word.example, translation: word.translation || "", source: word.category || "" }); toast("已收藏例句"); }
  persist();
}
function toggleCheckin() {
  const key = todayKey();
  if (state.checkins.includes(key)) { toast("今天已经签到"); return; }
  state.checkins.push(key); persist(); renderHome(); toast("签到成功");
}

document.addEventListener("click", event => {
  const scopeField = event.target.closest("[data-scope]");
  if (scopeField && !event.target.closest("[data-step]")) return;
  if (event.target.closest("#sidebar-toggle")) {
    sidebarCollapsed = !sidebarCollapsed;
    localStorage.setItem("cixu-sidebar", sidebarCollapsed ? "1" : "0");
    applySidebar();
    return;
  }
  const nav = event.target.closest("[data-view]"); if (nav) { if (session) exitSession(); currentView = nav.dataset.view; renderShell(); return; }
  const bookButton = event.target.closest("[data-book]"); if (bookButton && !bookButton.dataset.action) { currentBookId = bookButton.dataset.book; if (session && session.sourceBookId !== currentBookId) { session = null; persist(); } else persist(); renderShell(); return; }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "start-new") startSession("new");
  if (event.target.closest("[data-step]")) {
    const input = document.querySelector('[data-scope="vocabularyStart"]');
    const step = Number(event.target.closest("[data-step]").dataset.step);
    const max = currentBook()?.words.length || 1;
    input.value = Math.max(1, Math.min(max, (Number(input.value) || 1) + step));
    updateScopeWordPreview(input);
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  if (action === "start-review") startSession("review");
  if (action === "continue") continueWord();
  if (action === "undo") undoWord();
  if (action === "reveal") revealAnswer();
  if (action === "spell") { if (session && !session.answered) { session.spelling = true; renderSession(); } }
  if (action === "cancel-spell") { if (session) { session.spelling = false; renderSession(); } }
  if (action === "check-spell") {
    const input = document.getElementById("spell-input");
    if (session && input && !session.answered) {
      const target = currentSessionWord().word.split(" / ")[0].split(" ")[0].toLowerCase();
      const value = input.value.trim().toLowerCase();
      session.spelling = false;
      markAnswer(value === target ? "known" : "again");
      session.answerSource = "spelling";
      session.revealed = true;
      renderSession();
      toast(value === target ? "拼写正确" : `拼写错误：${target}`);
    }
  }
  if (action === "exit-session") exitSession();
  if (action === "material") { if (session) { session.material = !session.material; renderSession(); } }
  if (action === "fav-word") { const word = action && event.target.closest("[data-word]") ? findWord(event.target.closest("[data-word]").dataset.word) : currentSessionWord(); if (word) toggleFavWord(word); }
  if (action === "like") { const word = currentSessionWord(); if (word) toggleLike(word); }
  if (action === "known") { const word = currentSessionWord(); if (word) toggleKnown(word); }
  if (action === "known-word") { const word = findWord(event.target.closest("[data-word]").dataset.word); if (word) toggleKnown(word); }
  if (action === "gen-note") { const word = currentSessionWord(); if (word) { const draft = generatedNote(word, bookIdFor(word)); session.noteDraft = draft; state.notes[recordKey(bookIdFor(word), word)] = draft; persist(); const input = document.getElementById("note-input"); if (input) input.value = draft; toast("已生成参考笔记，可继续编辑"); } }
  if (action === "fav-sentence") { const word = currentSessionWord(); if (word) toggleFavSentence(word); }
  if (action === "unfav-sentence") { const id = event.target.closest("[data-key]").dataset.key; state.favoriteSentences = state.favoriteSentences.filter(item => item.id !== id); persist(); renderSentences(); }
  if (action === "play-audio") { const word = currentSessionWord(); if (word) playAudio(word); }
  if (action === "play-word") playWord(event.target.closest("[data-word]").dataset.word);
  if (action === "checkin") toggleCheckin();
  if (action === "open-favorites") { wordFilter = "fav"; currentView = "words"; renderShell(); }
  if (action === "material-page") { if (session) { const delta = Number(event.target.closest("[data-page]").dataset.page); session.materialPage = Math.max(0, Math.min(1, (session.materialPage || 0) + delta)); renderSession(); } }
  if (action === "toggle-accent") { state.settings.accent = state.settings.accent === "uk" ? "us" : "uk"; persist(); if (session) renderSession(); else renderShell(); }
  if (action === "toggle-font") { state.settings.fontStyle = state.settings.fontStyle === "sans" ? "serif" : "sans"; persist(); applyTheme(); renderAppearance(); }
  if (action === "order-open") { orderOpen = !orderOpen; renderSettings(); }
  if (action === "order-move") {
    const index = Number(event.target.closest("[data-index]").dataset.index);
    const direction = Number(event.target.closest("[data-dir]").dataset.dir);
    const order = tabOrder();
    const swap = index + direction;
    if (swap >= 0 && swap < order.length) { [order[index], order[swap]] = [order[swap], order[index]]; state.settings.mnemonicOrder = order; persist(); }
    renderSettings();
  }
  if (action === "delete-book") { const bookId = event.target.closest("[data-book]").dataset.book; showModal("删除本地词书？", "该词书及其本设备上的学习进度都会删除。此操作无法撤销。", "删除", () => { state.books = state.books.filter(book => book.id !== bookId); delete state.reviews[bookId]; Object.keys(state.records).filter(key => key.startsWith(`${bookId}:`)).forEach(key => delete state.records[key]); currentBookId = state.books[0]?.id || null; persist(); renderShell(); }); }
  if (action === "review-single") { const book = state.books.find(item => item.id === event.target.closest("[data-book]").dataset.book); const word = book?.words.find(item => item.word === event.target.closest("[data-word]").dataset.word);     if (word) { session = createSession("review", [word], book.id, book.id); currentView = "review"; prepareWord(); renderShell(); renderSession(); } }
  if (action === "listen-prev") { const book = currentBook(); if (book) { listen.index = (listen.index - 1 + book.words.length) % book.words.length; renderListen(); if (listen.playing) playAudio(book.words[listen.index]); } }
  if (action === "listen-next") listenNext(false);
  if (action === "listen-play") toggleListenPlay();
  if (action === "listen-sleep") { const values = [0, 15, 30, 60]; listen.sleepMinutes = values[(values.indexOf(listen.sleepMinutes) + 1) % values.length]; clearTimeout(listen.sleepTimer); if (listen.sleepMinutes) listen.sleepTimer = setTimeout(() => { listen.playing = false; stopAudio(); renderListen(); }, listen.sleepMinutes * 60000); renderListen(); }
  if (action === "listen-jump") { const index = Number(event.target.closest("[data-index]").dataset.index); listen.index = index; renderListen(); if (listen.playing) playAudio(currentBook().words[index]); }
  if (action === "load-listening") loadListeningData();
  if (action === "listening-play") playListeningAudio();
  if (action === "listening-play-one") playListeningAudio({ word: event.target.closest("[data-word]").dataset.word });
  if (action === "listening-reveal") { listeningState.revealed = !listeningState.revealed; renderListening(); }
  if (action === "listening-check") checkListening();
  if (action === "listening-prev") nextListening(-1);
  if (action === "listening-next") nextListening(1);
  if (action === "listening-jump") { listeningState.index = Number(event.target.closest("[data-index]").dataset.index); state.listening.index = listeningState.index; listeningState.revealed = false; listeningState.result = null; listeningState.typedWord = ""; listeningState.typedSyn = ""; persist(); renderListening(); }
  const themeButton = event.target.closest("[data-theme-set]"); if (themeButton) { state.settings.theme = themeButton.dataset.themeSet; state.settings.followSystem = false; persist(); applyTheme(); renderAppearance(); }
  const filterTab = event.target.closest("[data-filter-tab]"); if (filterTab) { wordFilter = filterTab.dataset.filterTab; renderWords(); }
  const dictTabButton = event.target.closest("[data-dict-tab]"); if (dictTabButton) { dictTab = dictTabButton.dataset.dictTab; renderDict(); }
  const materialTabButton = event.target.closest("[data-material-tab]"); if (materialTabButton) { materialTab = materialTabButton.dataset.materialTab; renderMaterials(); }
  const fontButton = event.target.closest("[data-font-step]"); if (fontButton) {
    const step = Number(fontButton.dataset.fontStep);
    state.settings.globalFontSize = Math.max(-2, Math.min(6, (state.settings.globalFontSize || 0) + step));
    persist();
    applyTheme();
    renderSettings();
    return;
  }
  if (action === "import-reading-book") importReadingBook();
  if (action === "load-references") loadReferenceData();
  const dictRow = event.target.closest("[data-dict-word]"); if (dictRow) { dictSelected = dictRow.dataset.dictWord; renderDict(); }
  const toggleButton = event.target.closest("[data-toggle]"); if (toggleButton) { const key = toggleButton.dataset.toggle; state.settings[key] = !state.settings[key]; persist(); applyTheme(); if (currentView === "settings") renderSettings(); else renderAppearance(); }
  const choiceButton = event.target.closest("[data-choice]"); if (choiceButton) { const index = Number(choiceButton.dataset.choice); if (session?.answered) inspectChoice(index); else chooseOption(index); }
  const studyTab = event.target.closest("[data-study-tab]")?.dataset.studyTab; if (studyTab) { activeStudyTab = studyTab; renderSession(); }
  if (event.target.closest("#backup-button") || event.target.closest("#books-export")) exportBackup();
  if (event.target.closest("#import-button") || event.target.closest("#words-import") || event.target.closest("#empty-import")) document.getElementById("file-input").click();
  if (event.target.closest("#help-button")) document.getElementById("help-dialog").showModal();
  const grade = event.target.closest("[data-grade]")?.dataset.grade; if (grade && session) gradeWord(grade);
});
document.getElementById("file-input").addEventListener("change", event => { const file = event.target.files[0]; if (file) importFile(file); event.target.value = ""; });
document.addEventListener("input", event => {
  if (event.target.matches('[data-scope="vocabularyStart"]')) updateScopeWordPreview(event.target);
  if (event.target.id === "word-search") { searchQuery = event.target.value; const position = event.target.selectionStart; renderWords(); const input = document.getElementById("word-search"); input.focus(); input.setSelectionRange(position, position); }
  if (event.target.id === "dict-search") { dictQuery = event.target.value; dictSelected = null; const position = event.target.selectionStart; renderDict(); const input = document.getElementById("dict-search"); input.focus(); input.setSelectionRange(position, position); }
  if (event.target.id === "listening-word") listeningState.typedWord = event.target.value;
  if (event.target.id === "listening-syn") listeningState.typedSyn = event.target.value;
  if (event.target.id === "note-input" && session) { const word = currentSessionWord(); session.noteDraft = event.target.value; if (word) state.notes[recordKey(bookIdFor(word), word)] = event.target.value; clearTimeout(noteTimer); noteTimer = setTimeout(persist, 400); }
});
function updateScopeWordPreview(input) {
  const book = currentBook();
  if (!book) return;
  const value = String(input.value).replace(/\D/g, "");
  if (input.value !== value) input.value = value;
  const scopedWords = wordsForScope(book, state.settings.vocabularyCategory || "all");
  const index = Math.max(1, Math.min(scopedWords.length || 1, Number(value) || 1)) - 1;
  const word = scopedWords[index];
  const preview = document.getElementById("scope-word-preview");
  if (preview) preview.textContent = word ? `${word.word}${word.category ? ` · ${word.category}` : ""}` : "超出词书范围";
}
document.addEventListener("change", event => {
  const scope = event.target.closest("[data-scope]");
  if (scope) {
    const key = scope.dataset.scope;
    if (key === "vocabularyCategory") {
      state.settings.vocabularyCategory = scope.value;
      state.settings.vocabularyStart = 1;
      persist();
      renderHome();
      toast("主题已切换，起始词已回到该主题第 1 个词");
      event.stopPropagation();
      return;
    }
    const scopedWords = wordsForScope(currentBook(), state.settings.vocabularyCategory || "all");
    state.settings[key] = Math.max(1, Math.min(scopedWords.length || 1, Number(scope.value) || 1));
    persist();
    if (key === "vocabularyStart") {
      scope.value = state.settings[key];
      updateScopeWordPreview(scope);
    }
    toast("新词范围已保存");
    event.stopPropagation();
    return;
  }
  const select = event.target.closest("[data-setting]");
  if (select) {
    const key = select.dataset.setting;
    state.settings[key] = Number(select.value) || select.value;
    persist();
    toast("已保存设置");
  }
});
document.addEventListener("keydown", event => {
  if (event.target.matches('[data-scope="vocabularyStart"]') && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
    event.preventDefault();
    const input = event.target;
    const max = wordsForScope(currentBook(), state.settings.vocabularyCategory || "all").length || 1;
    const delta = event.key === "ArrowUp" ? 1 : -1;
    input.value = Math.max(1, Math.min(max, (Number(input.value) || 1) + delta));
    updateScopeWordPreview(input);
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }
  if (event.target.id === "listening-word" || event.target.id === "listening-syn") {
    if (event.key === "Enter") { event.preventDefault(); checkListening(); return; }
    if (event.key === "`") { event.preventDefault(); playListeningAudio(); return; }
  }
  if (event.target.id === "spell-input" && event.key === "Enter") { event.preventDefault(); document.querySelector('[data-action="check-spell"]')?.click(); return; }
  if (!session || document.querySelector("dialog[open]")) return;
  if (event.code === "Space") { event.preventDefault(); if (session.answered) continueWord(); else if (session.choice) revealAnswer(); else gradeWord("unsure"); }
  if (!session.answered && !session.choice) { if (event.key === "ArrowLeft") gradeWord("again"); if (event.key === "ArrowDown") gradeWord("unsure"); if (event.key === "ArrowRight") gradeWord("known"); }
  if (!session.answered && session.choice) { const index = Number(event.key) - 1; if (index >= 0 && index <= 3) chooseOption(index); }
  if (event.key === "Escape") exitSession();
});
applyTheme();
applySidebar();
renderShell();
loadDatabaseState().then(() => {
  loadIeltsBook();
  loadListeningData();
  loadReferenceData();
  loadPhonetics();
});
