/* =========================================================
   J & A – Abaya, Hijab & Ciput  |  script.js
   Cocok dengan index.html + style.css
   Data disimpan di localStorage (demo, tanpa server).
   ========================================================= */

/* ---------- PENGATURAN TOKO (ubah di sini) ---------- */
let WA = '6282189648269';
let WA_TAMPIL = '0821-8964-8269';
let ALAMAT = 'Jl. Anggrek 3 No. 5, Kel. Bontorannu, Kec. Mariso, Kota Makassar 90126';
const TOKO_LAT = -5.1626, TOKO_LNG = 119.4036;          // perkiraan, sesuaikan jika perlu
/* Kata sandi admin TIDAK lagi ditulis di sini. Yang disimpan hanya "sidik jari" (hash PBKDF2+SHA-256).
   Untuk mengganti: login admin > menu Keamanan > Ganti kata sandi admin. */
const ADMIN = { u: 'admin', name: 'Admin J & A', salt: 'ja-admin-salt-admin', hash: 'a5a8ce777187692a2e3e3269edf78956c1af90c265d82cc8edd499ad0966a1c0' };
const ADMIN_TTL = 30 * 60 * 1000; // sesi admin habis setelah 30 menit tanpa aktivitas
const JAM = { weekday: [8, 21], weekend: [10, 21] };     // Sen–Jum, Sab–Min

/* Daftar produk untuk harga, keranjang, dan statistik. `id` dan `name` harus sama
   dengan data-id dan nama produk di index.html. Harga asli bisa diatur lewat
   Dashboard Admin > Atur Produk. */
const PRODUCTS = [
  { id: 'a1', cat: 'Abaya', name: 'Abaya Hitam Polos', price: 185000, img: 'images/abaya-hitam.jpg', color: '#2b2420', desc: 'Potongan jatuh, elegan, nyaman untuk harian maupun acara.' },
  { id: 'a2', cat: 'Abaya', name: 'Abaya Dubai', price: 275000, img: 'images/abaya-dubai.jpg', color: '#5b4632', desc: 'Model Dubai dengan siluet mewah dan bahan adem.' },
  { id: 'h1', cat: 'Hijab', name: 'Pashmina Ceruty', price: 45000, img: 'images/pashmina.jpg', color: '#b79a7a', desc: 'Ringan, jatuh, dan mudah dibentuk.' },
  { id: 'h2', cat: 'Hijab', name: 'Segi Empat Voal', price: 55000, img: 'images/segi-empat.jpg', color: '#c9a15b', desc: 'Voal lembut, tidak licin, rapi seharian.' },
  { id: 'h3', cat: 'Hijab', name: 'Bergo Instan', price: 65000, img: 'images/bergo.jpg', color: '#8a6a4a', desc: 'Tinggal pakai, praktis untuk aktivitas padat.' },
  { id: 'h4', cat: 'Hijab', name: 'Hijab Paris Premium', price: 40000, img: 'images/paris.jpg', color: '#a88b6a', desc: 'Paris premium yang kaku di tempat yang tepat.' },
  { id: 'c1', cat: 'Ciput', name: 'Ciput Rajut', price: 15000, img: 'images/ciput-rajut.jpg', color: '#7b5b3a', desc: 'Hangat dan elastis, cocok untuk cuaca sejuk.' },
  { id: 'c2', cat: 'Ciput', name: 'Ciput Antem', price: 12000, img: 'images/ciput-antem.jpg', color: '#d8b27a', desc: 'Model antem dengan tali, hijab tidak melorot.' },
  { id: 'c3', cat: 'Ciput', name: 'Ciput Kaos', price: 12000, img: 'images/ciput-kaos.jpg', color: '#e7ddd0', desc: 'Bahan kaos adem untuk dipakai sehari-hari.' }
];
const STATUS = ['Menunggu Pembayaran', 'Dibayar', 'Dikirim', 'Selesai', 'Dibatalkan'];

/* ---------- UTILITAS ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rp = n => 'Rp' + Number(n).toLocaleString('id-ID');
const tgl = d => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const ld = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const say = (id, t) => { const e = $(id); if (e) e.textContent = t; };
async function hash(s) {
  try {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  } catch (e) { return btoa(unescape(encodeURIComponent(s))); }
}

/* ---------- FOTO PRODUK ----------
   Alamat foto (src) ditulis langsung di index.html. Foto yang diunggah admin
   (disimpan di browser) menggantikannya lewat applyPhotos(). */
let PHOTOS = ld('ja_photos', {});
const imgTag = p => `<img src="${PHOTOS[p.id] || p.img}" alt="${esc(p.name)}" loading="lazy">`;

/* ---------- RIWAYAT / PERKEMBANGAN TOKO (ubah sesuai kenyataan) ---------- */
const MILESTONES = [
  { t: '2026', d: 'J & A hadir dari Kota Makassar dengan abaya, hijab, dan ciput pilihan.' },
  { t: '12 Okt 2026', d: 'Pembayaran via QR dibuka untuk pelanggan.' },
  { t: '28 Okt 2026', d: 'Rating dan ulasan pelanggan diluncurkan.' }
];

/* ---------- SESI & PENGGUNA ---------- */
const users = () => { const v = ld('ja_users', []); return Array.isArray(v) ? v : []; };
const sess = () => ld('ja_sess', null);
/* Username dirapikan sama persis saat daftar dan saat masuk:
   spasi di awal/akhir dibuang, huruf jadi kecil, "@" di depan dibuang,
   spasi di tengah diganti garis bawah. */
const normU = s => String(s == null ? '' : s).trim().toLowerCase().replace(/^@+/, '').replace(/\s+/g, '_');
const RESERVED = ['admin', 'administrator', 'root', 'superadmin', 'owner', 'ja', 'j.a', 'jadmin', 'admin_ja', 'admin.ja'];
const U_OK = /^[a-z0-9_.\-]{3,30}$/;
function cur() {
  const s = sess(); if (!s) return null;
  if (s.r === 'a') {
    if (!adminSessOK(s)) { try { localStorage.removeItem('ja_sess'); } catch (e) { } return null; }
    return { username: ADMIN.u, name: ADMIN.name, role: 'a' };
  }
  const u = users().find(x => x.username === s.u);
  return u && !u.blocked ? Object.assign({ role: 'c' }, u) : null;
}
const isAdmin = () => { const c = cur(); return !!c && c.role === 'a'; };

/* ---------- KEAMANAN ADMIN ----------
   Hanya pemilik yang tahu kata sandi admin. Kata sandi tidak tersimpan, hanya hash PBKDF2.
   Percobaan salah dibatasi (5x -> terkunci 5 menit), sesi habis otomatis, semua aktivitas dicatat.
   CATATAN JUJUR: website ini berjalan sepenuhnya di browser (tanpa server). Pengunjung bisa membuka
   kode JavaScript dan mengutak-atiknya lewat DevTools, jadi perlindungan ini hanya menghalangi
   pengguna biasa. Untuk keamanan sungguhan, login admin harus diperiksa oleh server (backend). */
const adminCred = () => { const c = ld('ja_admin', null); return c && c.hash && c.salt ? c : { salt: ADMIN.salt, hash: ADMIN.hash }; };
async function adminDerive(p, salt) {
  if (!(window.crypto && crypto.subtle)) throw new Error('nocrypto');
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(p), 'PBKDF2', false, ['deriveBits']);
  const b = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 150000 }, k, 256);
  const hex = [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  return hash('ja-admin-v1:' + hex);
}
function adminSessOK(s) {
  return !!s && s.r === 'a' && s.u === ADMIN.u && s.v === adminCred().hash && Number(s.exp) > Date.now();
}
function touchAdmin() {
  const s = sess(); if (s && s.r === 'a' && adminSessOK(s)) { s.exp = Date.now() + ADMIN_TTL; sv('ja_sess', s); }
}
const actLog = () => { const v = ld('ja_log', []); return Array.isArray(v) ? v : []; };
function logAct(type, detail) {
  const l = actLog(); l.push({ id: uid(), t: Date.now(), type, detail: String(detail || '') });
  sv('ja_log', l.slice(-500));
}
async function adminLogin(u, p, form, m) {
  const lock = Number(ld('ja_lock', 0));
  if (Date.now() < lock) return m('Terlalu banyak percobaan. Coba lagi dalam ' + Math.ceil((lock - Date.now()) / 60000) + ' menit.');
  let ok = false;
  try { const c = adminCred(); ok = u === ADMIN.u && (await adminDerive(p, c.salt)) === c.hash; }
  catch (e) { return m('Browser ini tidak mendukung login admin yang aman. Buka website lewat https:// atau localhost.'); }
  if (!ok) {
    const n = Number(ld('ja_fail', 0)) + 1; sv('ja_fail', n);
    logAct('Login gagal', 'Percobaan login admin gagal (' + n + 'x)');
    if (n >= 5) { sv('ja_lock', Date.now() + 5 * 60000); sv('ja_fail', 0); return m('5 kali salah. Login admin dikunci 5 menit.'); }
    return m('Username atau kata sandi admin salah.');
  }
  sv('ja_fail', 0);
  sv('ja_sess', { u: ADMIN.u, r: 'a', v: adminCred().hash, exp: Date.now() + ADMIN_TTL });
  logAct('Login', 'Admin berhasil masuk');
  afterAuth(); form.reset(); go('admin');
}
// Sesi admin yang habis ditutup otomatis.
setInterval(() => { const s = sess(); if (s && s.r === 'a' && !adminSessOK(s)) { try { localStorage.removeItem('ja_sess'); } catch (e) { } afterAuth(); if (curSec === 'admin') go('masuk'); } }, 15000);

/* ---------- NAVIGASI ---------- */
const NAVS = [['home', 'Menu Utama'], ['statistik', 'Perkembangan'], ['tentang', 'Tentang'], ['berita', 'Berita'], ['masuk', 'Masuk']];
let curSec = 'home';

function buildNav() {
  const items = NAVS.slice(), c = cur();
  if (c && c.role === 'c') items.splice(1, 0, ['profil', 'Profil Saya']);
  if (isAdmin()) items.push(['admin', 'Admin']);
  const nb = isAdmin() ? unreadN() : 0;
  $('nav').innerHTML = items.map(([id, t]) =>
    `<button data-s="${id}" class="${id === curSec ? 'on' : ''}" onclick="go('${id}')">${t}${id === 'admin' && nb ? `<span class="nbadge" title="${nb} notifikasi belum dicek">${nb}</span>` : ''}</button>`).join('');
}

function go(id) {
  if (id === 'admin' && !isAdmin()) { id = 'masuk'; }
  if (isAdmin()) touchAdmin();
  curSec = id;
  document.querySelectorAll('main > section').forEach(s => s.classList.toggle('on', s.id === id));
  buildNav();
  if (id === 'profil') renderProfile();
  if (id === 'berita') renderRate();
  if (id === 'admin') renderAdmin();
  if (id === 'masuk') renderLogin();
  if (id === 'statistik') renderStats();
  window.scrollTo({ top: 0 });
}

/* ---------- HERO ---------- */
function silhouette(kind) {
  const f = '#fff';
  const body = kind === 'abaya'
    ? `<circle cx="50" cy="26" r="16" fill="${f}"/><path d="M50 40c-22 0-30 22-32 50l-8 66h80l-8-66c-2-28-10-50-32-50z" fill="${f}"/>`
    : kind === 'hijab'
      ? `<path d="M50 8c-20 0-32 16-32 38 0 14 6 24 6 36l-6 74h64l-6-74c0-12 6-22 6-36 0-22-12-38-32-38z" fill="${f}"/>`
      : `<path d="M16 70c0-34 14-56 34-56s34 22 34 56z" fill="${f}"/><rect x="14" y="68" width="72" height="12" rx="6" fill="${f}"/>`;
  return `<svg viewBox="0 0 100 160" aria-hidden="true">${body}<rect width="100" height="160" fill="url(#tx)"/></svg>`;
}
function buildHero() {
  $('heroArt').innerHTML = silhouette('hijab') + silhouette('abaya') + silhouette('ciput');
  const im = new Image();
  im.onload = () => $('hero').classList.add('photo');
  im.src = 'images/sampul.jpg';
}

/* ---------- PRODUK ---------- */
let filter = '';
function pickCat(c) { filt(c); const t = $('prod'); if (t) t.scrollIntoView({ behavior: 'smooth' }); }
function renderGrid() {
  const sold = computeStats().terlaris || {};
  const top = Object.entries(sold).sort((a, b) => b[1] - a[1])[0];
  document.querySelectorAll('#grid .card').forEach(card => {
    const p = PRODUCTS.find(x => x.id === card.dataset.id); if (!p) return;
    card.style.display = (!filter || card.dataset.cat === filter) ? '' : 'none';
    card.querySelector('[data-price]').textContent = rp(p.price);
    card.querySelector('.tag').textContent = p.cat + (sold[p.name] ? ' · Terjual ' + sold[p.name] : '');
    const pic = card.querySelector('.pic'), b = pic.querySelector('.badge');
    const isTop = top && top[1] > 0 && top[0] === p.name;
    if (isTop && !b) pic.insertAdjacentHTML('beforeend', '<span class="badge">★ Terlaris</span>');
    else if (!isTop && b) b.remove();
  });
  applyPhotos();
}
// Foto unggahan admin (jika ada) menggantikan src di HTML; kalau dihapus, kembali ke src HTML.
function applyPhotos() {
  document.querySelectorAll('[data-id] img').forEach(im => {
    if (!im.dataset.orig) im.dataset.orig = im.getAttribute('src');
    im.src = PHOTOS[im.closest('[data-id]').dataset.id] || im.dataset.orig;
  });
}
function filt(cat) {
  filter = cat || '';
  const names = ['', 'Abaya', 'Hijab', 'Ciput'];
  document.querySelectorAll('#home .tabs button').forEach((b, i) => b.classList.toggle('alt', names[i] !== filter));
  renderGrid();
}

/* ---------- KERANJANG ---------- */
let cart = ld('ja_cart', []);
function saveCart() { sv('ja_cart', cart); renderCart(); }
function addCart(id) {
  const it = cart.find(x => x.id === id);
  if (it) it.q++; else cart.push({ id, q: 1 });
  saveCart();
  const b = document.querySelector('.cartbtn[aria-label="Keranjang belanja"]');
  b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
}
function chgQty(id, d) {
  const it = cart.find(x => x.id === id); if (!it) return;
  it.q += d;
  if (it.q <= 0) cart = cart.filter(x => x.id !== id);
  saveCart();
}
const cartTotal = () => cart.reduce((s, x) => { const p = PRODUCTS.find(p => p.id === x.id); return s + (p ? p.price * x.q : 0); }, 0);
function renderCart() {
  cart = cart.filter(x => PRODUCTS.some(p => p.id === x.id));
  $('cCount').textContent = cart.reduce((s, x) => s + x.q, 0);
  if (!cart.length) { $('cart').innerHTML = '<p class="empty">Keranjang masih kosong 🛍️</p>'; return; }
  $('cart').innerHTML = cart.map(x => {
    const p = PRODUCTS.find(p => p.id === x.id);
    return `<div class="ci"><div><b>${esc(p.name)}</b><br><span class="tag">${rp(p.price)}</span></div>
      <div class="price">${rp(p.price * x.q)}</div>
      <div class="qty"><button onclick="chgQty('${p.id}',-1)" aria-label="Kurangi">−</button><span>${x.q}</span><button onclick="chgQty('${p.id}',1)" aria-label="Tambah">+</button></div>
      <div></div></div>`;
  }).join('') +
    `<div class="ctot"><span>Total</span><span>${rp(cartTotal())}</span></div>
     <div class="msg" id="cMsg"></div>
     <button class="btn" style="width:100%" onclick="checkout()">Bayar via QR</button>`;
}
function openCart() { renderCart(); $('drawer').classList.add('on'); }
function closeCart() { $('drawer').classList.remove('on'); }

/* ---------- CHECKOUT & PEMBAYARAN ---------- */
function checkout() {
  const m = t => say('cMsg', t);
  const c = cur();
  if (SET.tokoBuka === false) { m(SET.tutupPesan || 'Toko sedang tidak menerima pesanan baru. Silakan coba lagi nanti.'); return; }
  if (!c || c.role !== 'c') { m('Silakan masuk sebagai pelanggan dulu.'); setTimeout(() => { closeCart(); go('masuk'); }, 900); return; }
  if (!c.phone || !c.address) { m('Lengkapi no. HP & alamat di Profil Saya dulu.'); setTimeout(() => { closeCart(); go('profil'); }, 900); return; }
  if (!cart.length) return;
  const items = cart.map(x => { const p = PRODUCTS.find(p => p.id === x.id); return { name: p.name, price: p.price, q: x.q }; });
  const order = {
    id: 'JA' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 5).toUpperCase(),
    user: c.username, name: c.name, phone: c.phone, address: c.address, size: c.size || '-',
    items, total: cartTotal(), status: STATUS[0], date: Date.now()
  };
  const os = ld('ja_orders', []); os.push(order); sv('ja_orders', os);
  addNotif('order', order);
  cart = []; saveCart(); closeCart();
  showPay(order);
}
function showPay(o) {
  $('bInfo').innerHTML = `Pesanan <b>${esc(o.id)}</b><br>Total bayar: <b class="price">${rp(o.total)}</b>`;
  const text = `Halo admin J & A, saya sudah bayar pesanan ${o.id} sebesar ${rp(o.total)}. Atas nama ${o.name}.`;
  const link = `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const box = $('qr'); box.innerHTML = '';
  if (window.QRCode) { new QRCode(box, { text: link, width: 200, height: 200 }); }
  else box.innerHTML = `<a href="${link}" target="_blank" rel="noopener">Buka WhatsApp admin</a>`;
  go('bayar');
}

/* ---------- AKUN: DAFTAR, MASUK, KELUAR ---------- */
/* Pesan hasil daftar/masuk: merah untuk gagal, hijau untuk berhasil,
   dan otomatis digulir ke tengah layar supaya pasti terlihat. */
function authMsg(id, text, ok) {
  const el = $(id); if (!el) return;
  el.textContent = text;
  el.style.color = ok ? '#2e7d32' : '#b3261e';
  el.style.fontWeight = '600';
  try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { }
}

// Dipanggil langsung dari form; harus mengembalikan false secara sinkron.
function reg(e) { e.preventDefault(); doReg(e.target); return false; }
async function doReg(form) {
  const m = t => authMsg('rm', t, false);
  const name = $('rn').value.trim();
  const u = normU($('ru').value);
  const p = $('rp').value;

  if (!name) return m('Nama lengkap wajib diisi.');
  if (u.length < 3) return m('Username terlalu pendek. Minimal 3 karakter.');
  if (u.length > 30) return m('Username terlalu panjang. Maksimal 30 karakter.');
  if (!U_OK.test(u)) return m('Username hanya boleh berisi huruf, angka, titik (.), garis bawah (_), atau strip (-). Contoh: aulia_23');
  if (RESERVED.includes(u)) return m('Username "' + u + '" dipakai oleh sistem. Silakan pilih username lain.');
  if (p.length < 4) return m('Kata sandi minimal 4 karakter.');
  if (users().some(x => x.username === u)) {
    const saran = u + Math.floor(10 + Math.random() * 90);
    return m('Username "' + u + '" sudah dipakai. Kalau itu akunmu, buka menu Masuk. Atau coba username lain, misalnya "' + saran + '".');
  }

  const rg = $('rg').value.trim(), rt = $('rt').value.trim();
  if (rg && !GMAIL_OK.test(normEmail(rg))) return m('Email pemulihan harus akun Gmail, contoh: nama@gmail.com');
  if (rt && !PHONE_OK.test(normPhone(rt))) return m('No. HP pemulihan tidak valid. Contoh: 08xxxxxxxxxxx');

  const list = users();
  list.push({ username: u, name, pass: await hash(p), created: Date.now(), recMail: rg ? normEmail(rg) : '', recPhone: rt ? normPhone(rt) : '' });
  // Pastikan benar-benar tersimpan (bisa gagal di mode Private atau jika penyimpanan diblokir).
  if (!sv('ja_users', list) || !users().some(x => x.username === u)) {
    return m('Akun tidak bisa disimpan di browser ini. Matikan mode Private/Incognito atau izinkan penyimpanan situs, lalu coba lagi.');
  }
  sv('ja_sess', { u, r: 'c' });
  form.reset();
  afterAuth();
  go('profil');
}

let loginRole = 'c';
function setRole(r) {
  loginRole = r;
  $('tc').classList.toggle('alt', r !== 'c');
  $('ta').classList.toggle('alt', r !== 'a');
  say('lm', '');
}
// Dipanggil langsung dari form; harus mengembalikan false secara sinkron.
function login(e) { e.preventDefault(); doLogin(e.target); return false; }
async function doLogin(form) {
  const m = t => authMsg('lm', t, false);
  const u = normU($('lu').value), p = $('lp').value;
  if (!u) return m('Username wajib diisi.');
  if (loginRole === 'a') {
    await adminLogin(u, p, form, m);
    return;
  }
  const f = users().find(x => x.username === u);
  if (!f) return m('Username "' + u + '" belum terdaftar di browser ini. Daftar dulu lewat form Daftar, atau periksa penulisan username.');
  if (f.blocked) return m('Akun ini sedang diblokir. Hubungi admin lewat WhatsApp.');
  if (f.pass !== await hash(p)) return m('Kata sandi salah.');
  sv('ja_sess', { u, r: 'c' }); afterAuth(); form.reset(); go('home');
}
function logout() {
  if (isAdmin()) logAct('Logout', 'Admin keluar');
  try { localStorage.removeItem('ja_sess'); } catch (e) { }
  afterAuth(); go('home');
}
function afterAuth() {
  const c = cur();
  $('outBtn').hidden = !c;
  const pb = $('profBtn');
  if (pb) {
    pb.hidden = !c;
    if (c) { pb.textContent = (c.name || '?').charAt(0).toUpperCase(); pb.style.fontWeight = '700'; pb.title = c.role === 'a' ? 'Dashboard Admin' : 'Profil saya'; }
  }
  buildNav();
}
function openProfile() { go(isAdmin() ? 'admin' : 'profil'); }
function renderLogin() {
  const c = cur();
  $('outCard').style.display = c ? 'block' : 'none';
  $('loginCard').style.display = c ? 'none' : 'block';
  $('regCard').style.display = c ? 'none' : 'block';
  $('resetCard').style.display = 'none'; RST = null;
  if (c) $('outWho').textContent = c.name + (c.role === 'a' ? ' (Admin)' : '');
  say('lm', '');
}

/* ---------- UBAH / LUPA KATA SANDI (Gmail atau nomor HP pemulihan) ----------
   Pelanggan mengisi Gmail dan/atau no. HP pemulihan (boleh nomor orang lain
   yang dipercaya) saat daftar atau di menu Profil. Saat lupa kata sandi:
   username + Gmail/nomor harus cocok -> kode 6 digit -> kata sandi baru.

   PENTING: situs ini tidak punya server, jadi kode TIDAK bisa benar-benar
   dikirim ke Gmail/HP. Selama RESET_SHOW_CODE = true, kode ditampilkan di
   layar (hanya untuk demo/uji coba). Untuk dipakai sungguhan, kode harus
   dibuat dan dikirim oleh server (email / WhatsApp / SMS), lalu set false. */
const RESET_SHOW_CODE = true;
const GMAIL_OK = /^[a-z0-9._+\-]+@(gmail|googlemail)\.com$/;
const PHONE_OK = /^08\d{8,12}$/;
const normEmail = s => String(s == null ? '' : s).trim().toLowerCase();
// Gmail mengabaikan titik dan "+tag" di bagian depan, jadi dibandingkan dalam bentuk dasarnya.
const gKey = s => { const l = normEmail(s).split('@')[0]; return l.replace(/\./g, '').split('+')[0] + '@gmail.com'; };
// 0823..., +62 823..., 62823..., 823... -> 0823...
const normPhone = s => {
  let d = String(s == null ? '' : s).replace(/\D/g, '');
  if (d.startsWith('62')) d = '0' + d.slice(2); else if (d && !d.startsWith('0')) d = '0' + d;
  return d;
};
const maskMail = s => { const [l, d] = s.split('@'); return l.slice(0, 2) + '***@' + d; };
const maskPhone = s => s.slice(0, 4) + '****' + s.slice(-3);

let RST = null, rFail = 0, rLock = 0;
function showReset(on) {
  RST = null;
  $('resetCard').style.display = on ? 'block' : 'none';
  $('loginCard').style.display = on ? 'none' : 'block';
  $('regCard').style.display = on ? 'none' : 'block';
  $('rs1').style.display = 'block'; $('rs2').style.display = 'none';
  ['fu', 'fc', 'fk', 'fn', 'fn2'].forEach(id => { $(id).value = ''; });
  $('fm').value = 'g'; resetMethod(); say('fmsg', ''); say('lm', '');
}
function resetMethod() {
  const g = $('fm').value === 'g', i = $('fc');
  say('fcl', g ? 'Email Gmail pemulihan' : 'No. HP pemulihan (boleh nomor orang lain yang kamu percaya)');
  i.type = g ? 'email' : 'tel'; i.placeholder = g ? 'nama@gmail.com' : '08xxxxxxxxxxx'; i.value = '';
}
function resetStart(e) { e.preventDefault(); doResetStart(); return false; }
function doResetStart() {
  const m = t => authMsg('fmsg', t, false);
  if (Date.now() < rLock) return m('Terlalu banyak percobaan. Coba lagi dalam ' + Math.ceil((rLock - Date.now()) / 1000) + ' detik.');
  const u = normU($('fu').value), g = $('fm').value === 'g', raw = $('fc').value;
  if (!u) return m('Username wajib diisi.');
  if (g ? !GMAIL_OK.test(normEmail(raw)) : !PHONE_OK.test(normPhone(raw)))
    return m(g ? 'Isi dengan akun Gmail, contoh: nama@gmail.com' : 'No. HP tidak valid. Contoh: 08xxxxxxxxxxx');

  const f = users().find(x => x.username === u);
  const saved = f ? (g ? f.recMail : f.recPhone) : '';
  const ok = !!saved && (g ? gKey(saved) === gKey(raw) : saved === normPhone(raw));
  if (!ok) {
    if (++rFail >= 5) { rFail = 0; rLock = Date.now() + 60000; }
    return m('Username dan data pemulihan tidak cocok. Pastikan Gmail/nomor sudah diisi di Profil, atau hubungi admin lewat WhatsApp.');
  }
  rFail = 0;
  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
  RST = { u, code, exp: Date.now() + 5 * 60000, tries: 0 };
  const tujuan = g ? maskMail(saved) : maskPhone(saved);
  $('rcode').textContent = 'Kode dikirim ke ' + tujuan + ' (berlaku 5 menit).' +
    (RESET_SHOW_CODE ? ' MODE DEMO: situs ini belum punya server pengirim, jadi kodenya tampil di sini: ' + code : '');
  $('rs1').style.display = 'none'; $('rs2').style.display = 'block'; say('fmsg', '');
}
function resetConfirm(e) { e.preventDefault(); doResetConfirm(); return false; }
async function doResetConfirm() {
  const m = t => authMsg('fmsg', t, false);
  const back = () => { RST = null; $('rs1').style.display = 'block'; $('rs2').style.display = 'none'; $('rcode').textContent = ''; };
  if (!RST) { back(); return m('Sesi pemulihan berakhir. Mulai lagi.'); }
  if (Date.now() > RST.exp) { back(); return m('Kode sudah kedaluwarsa. Minta kode baru.'); }
  const k = $('fk').value.trim(), p = $('fn').value, p2 = $('fn2').value;
  if (k !== RST.code) {
    if (++RST.tries >= 5) { back(); return m('Terlalu banyak kode salah. Minta kode baru.'); }
    return m('Kode salah. Sisa percobaan: ' + (5 - RST.tries) + '.');
  }
  if (p.length < 4) return m('Kata sandi baru minimal 4 karakter.');
  if (p !== p2) return m('Pengulangan kata sandi tidak sama.');
  const list = users(), u = list.find(x => x.username === RST.u);
  if (!u) { back(); return m('Akun tidak ditemukan.'); }
  u.pass = await hash(p);
  if (!sv('ja_users', list)) return m('Gagal menyimpan. Periksa pengaturan penyimpanan browser.');
  showReset(false);
  authMsg('lm', 'Kata sandi berhasil diubah ✅ Silakan masuk dengan kata sandi baru.', true);
}
function saveRecovery(e) {
  e.preventDefault();
  const c = cur(); if (!c || c.role !== 'c') return false;
  const g = $('pg').value.trim(), t = $('pt').value.trim();
  if (g && !GMAIL_OK.test(normEmail(g))) { say('prm', 'Email harus akun Gmail, contoh: nama@gmail.com'); return false; }
  if (t && !PHONE_OK.test(normPhone(t))) { say('prm', 'No. HP tidak valid. Contoh: 08xxxxxxxxxxx'); return false; }
  const list = users(), u = list.find(x => x.username === c.username);
  u.recMail = g ? normEmail(g) : ''; u.recPhone = t ? normPhone(t) : '';
  sv('ja_users', list); say('prm', 'Data pemulihan tersimpan ✅');
  return false;
}

/* ---------- DATA PELANGGAN & PROFIL ---------- */
const stepper = st => {
  if (st === STATUS[4]) return '<span class="ostat bad">Dibatalkan</span>';
  const i = STATUS.indexOf(st);
  return `<div class="steps">${STATUS.slice(0, 4).map((x, k) => `<div class="st${k <= i ? ' on' : ''}"><i></i>${x}</div>`).join('')}</div>`;
};
// Tampilkan nilai profil; kalau kosong tampil "Belum diisi".
const nilai = v => v ? esc(v) : '<span class="none">Belum diisi</span>';
function renderProfile() {
  const c = cur(), b = $('profBox');
  if (!c) { b.innerHTML = `<div class="card empty-state"><div class="avatar">?</div><h3>Kamu belum masuk</h3><p>Masuk untuk melihat pesanan, mengubah data diri, dan memberi ulasan.</p><button class="btn" onclick="go('masuk')">Masuk</button> <button class="btn alt" onclick="go('masuk')">Daftar</button></div>`; return; }
  if (c.role === 'a') { b.innerHTML = `<div class="card empty-state"><div class="avatar">A</div><h3>Admin J &amp; A</h3><p>Kelola pelanggan, pesanan, harga, dan foto produk di dashboard.</p><button class="btn" onclick="go('admin')">Buka Dashboard</button></div>`; return; }
  const os = ld('ja_orders', []).filter(o => o.user === c.username).sort((a, b) => b.date - a.date);
  const spent = os.filter(o => PAID.includes(o.status)).reduce((t, o) => t + o.total, 0);
  const wait = os.filter(o => o.status === STATUS[0]).length, nrev = revs().filter(x => x.user === c.username).length;
  const tile = (n, l) => `<div><b>${n}</b><span>${l}</span></div>`;
  b.innerHTML = `
  <div class="card">
    <div class="phead"><div class="avatar">${esc((c.name || '?').charAt(0).toUpperCase())}</div>
      <div class="grow"><h3>${esc(c.name)}</h3><span class="tag">@${esc(c.username)} · Anggota sejak ${tgl(c.created)}</span></div>
      <button class="btn alt sm" onclick="logout()">Keluar</button></div>
    <div class="pstats">${tile(os.length, 'Total pesanan')}${tile(rp(spent), 'Total belanja')}${tile(wait, 'Menunggu bayar')}${tile(nrev, 'Ulasan saya')}</div>
    <div class="pinfo"><h4>Informasi Profil</h4>
      <div class="kv"><span>Nama lengkap</span><b>${nilai(c.name)}</b></div>
      <div class="kv"><span>Username</span><b>@${esc(c.username)}</b></div>
      <div class="kv"><span>No. HP / WhatsApp</span><b>${c.phone ? `<a href="tel:${esc(c.phone)}">${esc(c.phone)}</a>` : nilai('')}</b></div>
      <div class="kv"><span>Alamat pengiriman</span><b class="addr">${nilai(c.address)}</b></div>
      <div class="kv"><span>Ukuran abaya</span><b>${nilai(c.size)}</b></div>
    </div>
    ${(!c.phone || !c.address) ? '<div class="msg">Lengkapi no. HP dan alamat di bawah agar bisa checkout 💛</div>' : ''}
  </div>
  <div class="two" style="margin-top:14px">
    <div class="card"><h3>Data Diri</h3>
      <form onsubmit="return saveProfile(event)">
        <label for="pn">Nama lengkap</label><input id="pn" required value="${esc(c.name)}">
        <label for="ph">No. HP / WhatsApp</label><input id="ph" type="tel" required value="${esc(c.phone || '')}">
        <label for="pa">Alamat pengiriman</label><textarea id="pa" rows="3" required>${esc(c.address || '')}</textarea>
        <label for="ps">Ukuran abaya</label><select id="ps">${['S', 'M', 'L', 'XL', 'XXL'].map(z => `<option${z === (c.size || 'M') ? ' selected' : ''}>${z}</option>`).join('')}</select>
        <br><br><button class="btn">Simpan Perubahan</button></form><div class="msg" id="pm"></div></div>
    <div class="card"><h3>Ganti Kata Sandi</h3>
      <form onsubmit="return changePass(event)">
        <label for="po">Kata sandi lama</label><input id="po" type="password" required autocomplete="current-password">
        <label for="pw">Kata sandi baru</label><input id="pw" type="password" required minlength="4" autocomplete="new-password">
        <br><br><button class="btn alt">Ubah Kata Sandi</button></form><div class="msg" id="pwm"></div></div>
    <div class="card"><h3>Pemulihan Akun</h3>
      <p class="tag" style="text-transform:none;letter-spacing:0">Dipakai saat lupa kata sandi (menu Masuk &rarr; Lupa / ubah kata sandi). Nomor HP boleh milik orang lain yang kamu percaya.</p>
      <form onsubmit="return saveRecovery(event)">
        <label for="pg">Email Gmail pemulihan</label><input id="pg" type="email" placeholder="nama@gmail.com" autocomplete="off" value="${esc(c.recMail || '')}">
        <label for="pt">No. HP pemulihan</label><input id="pt" type="tel" placeholder="08xxxxxxxxxxx" autocomplete="off" value="${esc(c.recPhone || '')}">
        <br><br><button class="btn alt">Simpan Pemulihan</button></form><div class="msg" id="prm"></div></div>
  </div>
  <div class="card" style="margin-top:14px"><h3>Riwayat Pesanan</h3>
    ${os.length ? os.map(o => `
    <div class="order"><div class="oh"><b>${esc(o.id)}</b><span class="tag">${tgl(o.date)}</span></div>
      ${stepper(o.status)}
      <ul class="ol">${o.items.map(i => `<li><span>${esc(i.name)} ×${i.q}</span><span>${rp(i.price * i.q)}</span></li>`).join('')}</ul>
      <div class="of"><b class="price">Total ${rp(o.total)}</b><div class="acts">
        ${o.status === STATUS[0] ? `<button class="btn sm" onclick="payAgain('${o.id}')">Bayar</button><button class="btn sm alt" onclick="cancelOrder('${o.id}')">Batalkan</button>`
          : `<a class="btn sm alt" style="text-decoration:none" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent('Halo admin J & A, saya mau tanya pesanan ' + o.id)}">Tanya admin</a>`}
      </div></div></div>`).join('') : '<p class="empty">Belum ada pesanan. <a href="#" onclick="go(\'home\');return false">Mulai belanja</a></p>'}
  </div>`;
}
function saveProfile(e) {
  e.preventDefault();
  const c = cur(); if (!c || c.role !== 'c') return false;
  const list = users(), u = list.find(x => x.username === c.username);
  u.name = $('pn').value.trim(); u.phone = $('ph').value.trim(); u.address = $('pa').value.trim(); u.size = $('ps').value;
  sv('ja_users', list);
  renderProfile(); say('pm', 'Perubahan tersimpan ✅');
  return false;
}
async function changePass(e) {
  e.preventDefault();
  const c = cur(); if (!c || c.role !== 'c') return false;
  const list = users(), u = list.find(x => x.username === c.username);
  if (u.pass !== await hash($('po').value)) { say('pwm', 'Kata sandi lama salah.'); return false; }
  u.pass = await hash($('pw').value); sv('ja_users', list);
  e.target.reset(); say('pwm', 'Kata sandi berhasil diganti ✅');
  return false;
}
function cancelOrder(id) {
  if (!confirm('Batalkan pesanan ini?')) return;
  const os = ld('ja_orders', []), o = os.find(x => x.id === id);
  if (o && o.status === STATUS[0]) { o.status = STATUS[4]; sv('ja_orders', os); addNotif('cancel', o); }
  renderProfile();
}
function payAgain(id) { const o = ld('ja_orders', []).find(x => x.id === id); if (o) showPay(o); }

/* ---------- RATING & ULASAN ---------- */
let pick = 0;
const revs = () => ld('ja_reviews', []);
const starsHTML = v => `<span class="stars">★★★★★<i style="width:${Math.max(0, Math.min(100, v / 5 * 100))}%">★★★★★</i></span>`;
function renderRate() {
  const r = revs(), n = r.length, avg = n ? r.reduce((s, x) => s + x.stars, 0) / n : 0;
  const dist = [5, 4, 3, 2, 1].map(k => ({ k, c: r.filter(x => x.stars === k).length }));
  const c = cur();
  const form = c && c.role === 'c'
    ? `<div class="rform"><b>Beri rating kamu</b><div id="pks">${[1, 2, 3, 4, 5].map(i => `<button class="pk" data-v="${i}" onclick="setPick(${i})" aria-label="${i} bintang">★</button>`).join('')}</div>
       <textarea id="rTx" rows="3" placeholder="Tulis ulasanmu (opsional)"></textarea>
       <button class="btn" onclick="sendRev()">Kirim Ulasan</button><div class="msg" id="rvm"></div></div>`
    : `<div class="rform"><p class="tag">Masuk sebagai pelanggan untuk memberi rating. <a href="#" onclick="go('masuk');return false" style="color:var(--pr)">Masuk</a></p></div>`;
  $('rateBox').innerHTML = `
    <div class="rate">
      <div class="rbig"><b>${avg.toFixed(1)}</b>${starsHTML(avg)}<div class="tag">${n} ulasan</div></div>
      <div>${dist.map(d => `<div class="rrow"><span>${d.k} ★</span><div class="rtrack"><div class="rfill" style="width:${n ? d.c / n * 100 : 0}%"></div></div><b>${d.c} ulasan</b></div>`).join('')}</div>
    </div>${form}
    <div class="revs">${n ? r.slice().reverse().map(x => `<div class="rev">${starsHTML(x.stars)} <b>${esc(x.name)}</b> <span class="tag">· ${tgl(x.date)}</span>
      ${x.text ? `<p>${esc(x.text)}</p>` : ''}${x.reply ? `<div class="reply"><b>Admin J &amp; A:</b> ${esc(x.reply)}</div>` : ''}</div>`).join('') : '<p class="empty">Belum ada ulasan. Jadilah yang pertama! 💛</p>'}</div>`;
  pick = 0;
}
function setPick(v) {
  pick = v;
  document.querySelectorAll('#pks .pk').forEach(b => b.classList.toggle('on', +b.dataset.v <= v));
}
function sendRev() {
  const c = cur();
  if (!c || c.role !== 'c') return;
  if (!pick) { say('rvm', 'Pilih jumlah bintang dulu ya.'); return; }
  const r = revs();
  r.push({ id: uid(), user: c.username, name: c.name, stars: pick, text: $('rTx').value.trim(), date: Date.now(), reply: '' });
  sv('ja_reviews', r);
  renderRate();
}

/* ---------- HARGA PRODUK (bisa diubah admin) ---------- */
function applyPrices() {
  const sp = ld('ja_prices', {});
  PRODUCTS.forEach(p => {
    if (p.base == null) p.base = p.price;
    p.price = sp[p.id] != null ? sp[p.id] : p.base;
  });
}
function renderPrices() {
  let box = $('atP');
  if (!box) {
    box = document.createElement('div'); box.className = 'card'; box.id = 'atP';
    const r = $('atR'); r.parentNode.insertBefore(box, r);
    r.parentNode.insertBefore(document.createElement('br'), r);
  }
  const keep = {}; PRODUCTS.forEach(p => { const i = $('pr_' + p.id); if (i) keep[p.id] = i.value; });
  box.innerHTML = '<h3>Atur Produk (Harga &amp; Foto)</h3><div class="apl">' + PRODUCTS.map(p => `
    <div class="apr"><div class="apt">${imgTag(p)}</div><div>
      <b>${esc(p.name)}</b> <span class="tag">${p.cat}</span>
      <label>Harga (Rp)</label><input type="number" min="0" step="500" id="pr_${p.id}" value="${keep[p.id] != null ? keep[p.id] : p.price}">
      <label>Foto produk</label><input type="file" accept="image/*" onchange="setPhoto('${p.id}',this)">
      ${PHOTOS[p.id] ? `<button class="btn sm alt" style="margin-top:6px" onclick="delPhoto('${p.id}')">Hapus foto unggahan</button>` : ''}
    </div></div>`).join('') +
    '</div><br><button class="btn" onclick="savePrices()">Simpan Harga</button> <button class="btn alt" onclick="resetPrices()">Kembalikan Harga Awal</button><div class="msg" id="apm"></div>' +
    '<p class="note">Foto unggahan tersimpan di browser ini saja. Agar tampil untuk semua pengunjung, taruh file foto di folder images/ dengan nama sesuai daftar produk.</p>';
}
function refreshPhotos() { renderGrid(); renderPrices(); }
function setPhoto(id, inp) {
  const f = inp.files && inp.files[0]; if (!f || !isAdmin()) return;
  if (!/^image\//.test(f.type)) { say('apm', 'File harus berupa gambar.'); return; }
  const fr = new FileReader();
  fr.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 640 / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      try {
        const ph = Object.assign({}, PHOTOS, { [id]: c.toDataURL('image/jpeg', .82) });
        localStorage.setItem('ja_photos', JSON.stringify(ph)); PHOTOS = ph;
      } catch (e) { say('apm', 'Penyimpanan penuh. Hapus beberapa foto unggahan atau pakai foto lebih kecil.'); return; }
      refreshPhotos(); say('apm', 'Foto tersimpan ✅');
    };
    im.onerror = () => say('apm', 'Gambar tidak bisa dibaca.');
    im.src = fr.result;
  };
  fr.readAsDataURL(f);
}
function delPhoto(id) {
  if (!isAdmin()) return;
  const ph = Object.assign({}, PHOTOS); delete ph[id]; PHOTOS = ph; sv('ja_photos', ph); refreshPhotos();
}
function savePrices() {
  if (!isAdmin()) return;
  const sp = {};
  for (const p of PRODUCTS) {
    const v = Number($('pr_' + p.id).value);
    if (!isFinite(v) || v < 0) { say('apm', 'Harga ' + p.name + ' tidak valid.'); return; }
    sp[p.id] = Math.round(v);
  }
  sv('ja_prices', sp); applyPrices(); renderGrid(); renderCart(); renderPrices();
  say('apm', 'Harga tersimpan ✅');
}
function resetPrices() {
  if (!isAdmin() || !confirm('Kembalikan semua harga ke harga awal?')) return;
  try { localStorage.removeItem('ja_prices'); } catch (e) { }
  applyPrices(); renderGrid(); renderCart(); renderPrices();
  say('apm', 'Harga dikembalikan ke harga awal.');
}

/* ---------- STATISTIK / PERKEMBANGAN TOKO ----------
   Sumber data: pesanan, pelanggan, dan ulasan di browser ini. Jika file statistik.json
   ada di folder yang sama, angkanya dipakai untuk semua pengunjung (unduh dari Dashboard Admin). */
const PAID = [STATUS[1], STATUS[2], STATUS[3]];
let STAT_JSON = null;
async function loadStats() {
  try {
    const r = await fetch('statistik.json', { cache: 'no-store' });
    if (r.ok) { const j = await r.json(); if (j && typeof j === 'object') STAT_JSON = j; }
  } catch (e) { }
}
function localStats() {
  const os = ld('ja_orders', []).filter(o => PAID.includes(o.status)), rv = revs();
  const terlaris = {}, kategori = { Abaya: 0, Hijab: 0, Ciput: 0 }, bulanan = {};
  let terjual = 0, omzet = 0;
  os.forEach(o => {
    const d = new Date(o.date), k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    bulanan[k] = (bulanan[k] || 0) + 1; omzet += o.total;
    o.items.forEach(i => {
      terjual += i.q; terlaris[i.name] = (terlaris[i.name] || 0) + i.q;
      const p = PRODUCTS.find(p => p.name === i.name); if (p) kategori[p.cat] += i.q;
    });
  });
  return {
    updated: Date.now(), pelanggan: users().length, pesanan: os.length, selesai: os.filter(o => o.status === STATUS[3]).length,
    terjual, omzet, rating: rv.length ? rv.reduce((t, x) => t + x.stars, 0) / rv.length : 0, ulasan: rv.length, bulanan, terlaris, kategori
  };
}
const computeStats = () => Object.assign({}, localStats(), STAT_JSON || {});
const nf = n => Number(n || 0).toLocaleString('id-ID');
function renderMini() {
  const el = $('miniStat'); if (!el) return;
  const s = computeStats(), t = (n, l) => `<div><b>${n}</b><span>${l}</span></div>`;
  el.innerHTML = `<div class="mini-in">${t(nf(s.pelanggan), 'Pelanggan')}${t(nf(s.terjual), 'Produk terjual')}${t(s.rating ? Number(s.rating).toFixed(1) + ' ★' : '–', 'Rating toko')}<a href="#" onclick="go('statistik');return false">Lihat perkembangan toko →</a></div>`;
}
function renderStats() {
  const el = $('statBox'); if (!el) return;
  const s = computeStats(), now = new Date(), months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1), k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    months.push({ l: d.toLocaleDateString('id-ID', { month: 'short' }), v: (s.bulanan || {})[k] || 0 });
  }
  const max = Math.max(1, ...months.map(m => m.v)), any = months.some(m => m.v > 0);
  const bars = months.map((m, i) => {
    const h = Math.round(m.v / max * 100), x = 14 + i * 56;
    return `<rect class="bar" x="${x}" y="${120 - h}" width="34" height="${Math.max(h, 2)}" rx="6"/><text class="bv" x="${x + 17}" y="${114 - h}" text-anchor="middle">${m.v}</text><text class="bl" x="${x + 17}" y="140" text-anchor="middle">${m.l}</text>`;
  }).join('');
  const top = Object.entries(s.terlaris || {}).sort((a, b) => b[1] - a[1]).slice(0, 5), tmax = top.length ? top[0][1] : 1;
  const kat = s.kategori || {}, ktot = Object.values(kat).reduce((a, b) => a + b, 0);
  const cnt = (n, l) => `<div class="card"><b class="cnt" data-n="${Math.round(n || 0)}">0</b><span>${l}</span></div>`;
  el.innerHTML = `
    <div class="cnts">${cnt(s.pelanggan, 'Pelanggan terdaftar')}${cnt(s.pesanan, 'Pesanan berhasil')}${cnt(s.terjual, 'Produk terjual')}
      <div class="card"><b>${s.rating ? Number(s.rating).toFixed(1) : '–'}</b><span>Rating dari ${nf(s.ulasan)} ulasan</span></div></div>
    <div class="two">
      <div class="card"><h3>Pesanan 6 Bulan Terakhir</h3>
        ${any ? `<svg class="chart" viewBox="0 0 360 150" role="img" aria-label="Grafik pesanan per bulan"><line class="ax" x1="6" x2="354" y1="120" y2="120"/>${bars}</svg>` : '<p class="empty">Grafik akan terisi setelah pesanan pertama dibayar.</p>'}</div>
      <div class="card"><h3>Produk Terlaris</h3>
        ${top.length ? top.map(([n, q]) => `<div class="hb"><span>${esc(n)}</span><div class="rtrack"><div class="rfill" style="width:${q / tmax * 100}%"></div></div><b>${q}</b></div>`).join('') : '<p class="empty">Belum ada data penjualan.</p>'}
        ${ktot ? '<h3 style="margin-top:14px">Kategori Favorit</h3>' + Object.entries(kat).map(([n, q]) => `<div class="hb"><span>${n}</span><div class="rtrack"><div class="rfill" style="width:${q / ktot * 100}%"></div></div><b>${Math.round(q / ktot * 100)}%</b></div>`).join('') : ''}</div>
    </div>
    <div class="card" style="margin-top:14px"><h3>Perjalanan J &amp; A</h3><ul class="tl">${MILESTONES.map(m => `<li><b>${esc(m.t)}</b><br>${esc(m.d)}</li>`).join('')}</ul></div>
    <p class="note">Data diperbarui ${tgl(s.updated || Date.now())}.</p>`;
  el.querySelectorAll('.cnt').forEach(c => {
    const n = +c.dataset.n;
    if (!n || matchMedia('(prefers-reduced-motion:reduce)').matches) { c.textContent = nf(n); return; }
    const t0 = performance.now(), f = t => { const p = Math.min(1, (t - t0) / 900); c.textContent = nf(Math.round(n * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
}
function renderSummary() {
  const el = $('atS'); if (!el) return;
  const s = localStats(), os = ld('ja_orders', []), t = (n, l) => `<div><b>${n}</b><span>${l}</span></div>`;
  el.innerHTML = `<h3>Ringkasan</h3><div class="pstats">${t(nf(s.pelanggan), 'Pelanggan')}${t(nf(os.length), 'Total pesanan')}${t(nf(os.filter(o => o.status === STATUS[0]).length), 'Menunggu bayar')}${t(rp(s.omzet), 'Pendapatan (dibayar)')}${t(nf(s.terjual), 'Produk terjual')}</div>
    <button class="btn alt sm" onclick="exportStats()">⬇ Unduh statistik.json</button>
    <p class="note">Unggah file ini ke folder website agar halaman "Perkembangan" menampilkan angka yang sama untuk semua pengunjung. Hapus file tersebut jika ingin kembali memakai data browser.</p>`;
}
function exportStats() {
  const s = localStats(); delete s.omzet;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' }));
  a.download = 'statistik.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------- DASHBOARD ADMIN ---------- */
function renderAdmin() {
  if (!isAdmin()) { go('masuk'); return; }
  renderSummary();
  renderPrices();
  const us = users(), os = ld('ja_orders', []).slice().sort((a, b) => b.date - a.date);
  $('atU').innerHTML = us.length ? `<table><tr><th>Nama</th><th>Username</th><th>No. HP</th><th>Alamat</th><th>Ukuran</th><th>Daftar</th></tr>${us.map(u =>
    `<tr><td>${esc(u.name)}</td><td>${esc(u.username)}</td><td>${esc(u.phone || '-')}</td><td>${esc(u.address || '-')}</td><td>${esc(u.size || '-')}</td><td>${tgl(u.created)}</td></tr>`).join('')}</table>` : '<p class="empty">Belum ada pelanggan.</p>';
  $('atO').innerHTML = os.length ? `<table><tr><th>ID</th><th>Tanggal</th><th>Pelanggan</th><th>HP</th><th>Pesanan</th><th>Total</th><th>Status</th></tr>${os.map(o =>
    `<tr><td>${esc(o.id)}</td><td>${tgl(o.date)}</td><td>${esc(o.name)}</td><td>${esc(o.phone)}</td>
     <td>${o.items.map(i => esc(i.name) + ' ×' + i.q).join(', ')}</td><td>${rp(o.total)}</td>
     <td><select onchange="setStatus('${o.id}',this.value)">${STATUS.map(s => `<option${s === o.status ? ' selected' : ''}>${s}</option>`).join('')}</select></td></tr>`).join('')}</table>` : '<p class="empty">Belum ada pesanan.</p>';
  renderNotifs();
  renderSettings();
  renderReviews();
}
function renderReviews() {
  const r = revs();
  $('atR').innerHTML = `<h3>Ulasan Pelanggan</h3>` + (r.length ? r.slice().reverse().map(x => `
    <div class="rev" style="margin-bottom:8px">${starsHTML(x.stars)} <b>${esc(x.name)}</b> <span class="tag">· ${tgl(x.date)}</span>
      ${x.text ? `<p>${esc(x.text)}</p>` : ''}
      <textarea id="rep_${x.id}" rows="2" placeholder="Tulis balasan admin">${esc(x.reply || '')}</textarea>
      <button class="btn sm" onclick="replyRev('${x.id}')">Simpan Balasan</button>
      <button class="btn sm alt" onclick="delRev('${x.id}')">Hapus</button></div>`).join('') : '<p class="empty">Belum ada ulasan.</p>');
}
function setStatus(id, s) {
  if (!isAdmin()) return;
  const os = ld('ja_orders', []), o = os.find(x => x.id === id);
  if (o) { o.status = s; sv('ja_orders', os); }
  renderNotifs();
}
function replyRev(id) {
  if (!isAdmin()) return;
  const r = revs(), x = r.find(v => v.id === id);
  if (x) { x.reply = $('rep_' + id).value.trim(); sv('ja_reviews', r); renderReviews(); }
}
function delRev(id) {
  if (!isAdmin() || !confirm('Hapus ulasan ini?')) return;
  sv('ja_reviews', revs().filter(v => v.id !== id)); renderReviews();
}

/* ---------- NOTIFIKASI ADMIN (pesanan masuk & pembatalan) ----------
   Dibuat otomatis saat pelanggan checkout / membatalkan pesanan.
   Seperti data lain di situs ini, tersimpan di browser (localStorage). */
const notifs = () => { const v = ld('ja_notifs', []); return Array.isArray(v) ? v : []; };
const unreadN = () => notifs().filter(n => !n.read).length;
function addNotif(type, o) {
  const n = notifs();
  n.push({ id: uid(), type, orderId: o.id, name: o.name, total: o.total, date: Date.now(), read: false });
  sv('ja_notifs', n.slice(-200));
}
let nTab = 'order', nAll = false;
const tglJam = d => new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
function renderNotifs() {
  const el = $('atN'); if (!el) return;
  const all = notifs(), orders = ld('ja_orders', []);
  const cnt = t => all.filter(n => n.type === t && !n.read).length;
  const list = all.filter(n => n.type === nTab && (nAll || !n.read)).sort((a, b) => b.date - a.date);
  const tabBtn = (t, l) => `<button class="btn${nTab === t ? '' : ' alt'}" onclick="setNTab('${t}')">${l}${cnt(t) ? `<span class="nbadge">${cnt(t)}</span>` : ''}</button>`;
  const row = n => {
    const o = orders.find(x => x.id === n.orderId);
    const det = o ? `<div class="ndet"><div><b>Pelanggan:</b> ${esc(o.name)} (@${esc(o.user)})</div><div><b>No. HP:</b> ${esc(o.phone)}</div><div><b>Alamat:</b> ${esc(o.address)}</div><div><b>Ukuran abaya:</b> ${esc(o.size)}</div><div><b>Pesanan:</b> ${o.items.map(i => esc(i.name) + ' ×' + i.q).join(', ')}</div><div><b>Status sekarang:</b> ${esc(o.status)}</div></div>` : '<div class="ndet">Data pesanan tidak ditemukan.</div>';
    return `<div class="nit${n.read ? '' : ' unread'}"><div class="nh"><div><b>${n.type === 'order' ? '🛍️ Pesanan baru diterima' : '❌ Pesanan dibatalkan'}</b> <span class="tag">${esc(n.orderId)}</span><br><span class="nm">${esc(n.name)} · ${rp(n.total)} · ${tglJam(n.date)}</span></div>
      ${n.read ? '<span class="tag">✓ Sudah dicek</span>' : `<button class="btn sm" onclick="markN('${n.id}')">Tandai dicek</button>`}</div>
      <details><summary>Lihat detail pesanan</summary>${det}</details></div>`;
  };
  const kosong = nTab === 'order' ? 'Tidak ada pesanan masuk yang belum dicek 🎉' : 'Tidak ada pembatalan yang belum dicek 🎉';
  el.innerHTML = `<h3>Notifikasi ${unreadN() ? `<span class="nbadge">${unreadN()} baru</span>` : ''}</h3>
    <div class="ntabs">${tabBtn('order', 'Pesanan Masuk')}${tabBtn('cancel', 'Pembatalan')}</div>
    <div class="ntools"><button class="btn sm alt" onclick="toggleNAll()">${nAll ? 'Tampilkan yang belum dicek' : 'Tampilkan semua riwayat'}</button>
      <button class="btn sm alt" onclick="markAllN()">✓ Tandai semua dicek</button>
      <button class="btn sm alt" onclick="clearN()">Hapus yang sudah dicek</button></div>
    ${list.length ? list.map(row).join('') : `<p class="empty">${nAll ? 'Belum ada riwayat notifikasi.' : kosong}</p>`}`;
}
function setNTab(t) { nTab = t; renderNotifs(); }
function toggleNAll() { nAll = !nAll; renderNotifs(); }
function notifChanged() { renderNotifs(); buildNav(); }
function markN(id) {
  if (!isAdmin()) return;
  const n = notifs(), x = n.find(v => v.id === id);
  if (x) { x.read = true; sv('ja_notifs', n); }
  notifChanged();
}
function markAllN() {
  if (!isAdmin()) return;
  const n = notifs(); n.forEach(x => { if (x.type === nTab) x.read = true; });
  sv('ja_notifs', n); notifChanged();
}
function clearN() {
  if (!isAdmin() || !confirm('Hapus semua notifikasi yang sudah dicek?')) return;
  sv('ja_notifs', notifs().filter(x => !x.read)); notifChanged();
}

/* ---------- PENGATURAN WEBSITE (bisa diubah admin) ---------- */
const SET_DEF = { tokoBuka: true, tutupPesan: '', pengumumanOn: false, pengumuman: '', waTampil: WA_TAMPIL, alamat: ALAMAT, jamWeekday: JAM.weekday.slice(), jamWeekend: JAM.weekend.slice() };
let SET = Object.assign({}, SET_DEF, ld('ja_settings', {}));
const jamTxt = h => String(h).padStart(2, '0') + '.00';
function applySettings() {
  WA = '62' + normPhone(SET.waTampil).slice(1);
  WA_TAMPIL = SET.waTampil; ALAMAT = SET.alamat;
  JAM.weekday = SET.jamWeekday; JAM.weekend = SET.jamWeekend;
  document.querySelectorAll('.wa-txt').forEach(e => { e.textContent = WA_TAMPIL; });
  document.querySelectorAll('.addr-txt').forEach(e => { e.textContent = ALAMAT; });
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a => { a.href = a.getAttribute('href').replace(/wa\.me\/\d+/, 'wa.me/' + WA); });
  say('fJamWd', jamTxt(JAM.weekday[0]) + ' – ' + jamTxt(JAM.weekday[1]));
  say('fJamWe', jamTxt(JAM.weekend[0]) + ' – ' + jamTxt(JAM.weekend[1]));
  const an = $('announce');
  if (an) { an.textContent = SET.pengumuman; an.hidden = !(SET.pengumumanOn && SET.pengumuman); }
  footerInfo(); updateOpen();
}
function renderSettings() {
  const el = $('atCfg'); if (!el) return;
  const s = SET, hr = (id1, id2, a) => `<div class="hrs"><input type="number" min="0" max="23" id="${id1}" value="${a[0]}" aria-label="Jam buka"> <span>sampai</span> <input type="number" min="1" max="24" id="${id2}" value="${a[1]}" aria-label="Jam tutup"> <span>WITA</span></div>`;
  el.innerHTML = `<h3>Pengaturan Website</h3>
    <div class="cfg">
      <div><h4>Status Toko</h4>
        <label class="chk"><input type="checkbox" id="cf_buka"${s.tokoBuka ? ' checked' : ''}> Terima pesanan baru</label>
        <label for="cf_tutup">Pesan saat toko tutup <small>(opsional)</small></label><input id="cf_tutup" maxlength="160" value="${esc(s.tutupPesan)}" placeholder="Toko sedang libur, pesanan dibuka kembali besok."></div>
      <div><h4>Pengumuman di Atas Website</h4>
        <label class="chk"><input type="checkbox" id="cf_pon"${s.pengumumanOn ? ' checked' : ''}> Tampilkan pengumuman</label>
        <label for="cf_p">Teks pengumuman</label><input id="cf_p" maxlength="160" value="${esc(s.pengumuman)}" placeholder="Contoh: Diskon abaya 10% sampai akhir bulan!"></div>
      <div><h4>Info Toko</h4>
        <label for="cf_wa">No. WhatsApp admin</label><input id="cf_wa" type="tel" value="${esc(s.waTampil)}" placeholder="08xxxxxxxxxxx">
        <label for="cf_al">Alamat toko</label><textarea id="cf_al" rows="3">${esc(s.alamat)}</textarea></div>
      <div><h4>Jam Buka</h4>
        <label>Senin – Jumat</label>${hr('cf_w1', 'cf_w2', s.jamWeekday)}
        <label>Sabtu – Minggu</label>${hr('cf_e1', 'cf_e2', s.jamWeekend)}</div>
    </div>
    <button class="btn" onclick="saveSettings()">Simpan Pengaturan</button> <button class="btn alt" onclick="resetSettings()">Kembalikan Bawaan</button><div class="msg" id="cfm"></div>
    <p class="note">Pengaturan tersimpan di browser ini, sama seperti harga produk. Foto dan harga produk diatur di kartu "Atur Produk" di bawah.</p>`;
}
function saveSettings() {
  if (!isAdmin()) return;
  const m = t => say('cfm', t);
  const wa = $('cf_wa').value.trim(), al = $('cf_al').value.trim(), p = $('cf_p').value.trim();
  if (!PHONE_OK.test(normPhone(wa))) return m('No. WhatsApp tidak valid. Contoh: 08xxxxxxxxxxx');
  if (!al) return m('Alamat toko tidak boleh kosong.');
  const j = id => Number($(id).value), wd = [j('cf_w1'), j('cf_w2')], we = [j('cf_e1'), j('cf_e2')];
  for (const [a, b] of [wd, we]) if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b > 24 || a >= b) return m('Jam buka harus lebih awal dari jam tutup (0–24).');
  if ($('cf_pon').checked && !p) return m('Isi teks pengumuman, atau matikan centang "Tampilkan pengumuman".');
  SET = { tokoBuka: $('cf_buka').checked, tutupPesan: $('cf_tutup').value.trim(), pengumumanOn: $('cf_pon').checked, pengumuman: p, waTampil: wa, alamat: al, jamWeekday: wd, jamWeekend: we };
  if (!sv('ja_settings', SET)) return m('Pengaturan tidak bisa disimpan di browser ini.');
  applySettings(); m('Pengaturan tersimpan ✅');
}
function resetSettings() {
  if (!isAdmin() || !confirm('Kembalikan semua pengaturan ke bawaan?')) return;
  try { localStorage.removeItem('ja_settings'); } catch (e) { }
  SET = Object.assign({}, SET_DEF, { jamWeekday: SET_DEF.jamWeekday.slice(), jamWeekend: SET_DEF.jamWeekend.slice() });
  applySettings(); renderSettings(); say('cfm', 'Pengaturan dikembalikan ke bawaan.');
}

/* ---------- FOOTER: ALAMAT, PETA, JAM BUKA, LOKASI ---------- */
function footerInfo() {
  say('fAlamat', '📍 ' + ALAMAT);
  const src = 'https://www.google.com/maps?q=' + encodeURIComponent(ALAMAT) + '&output=embed';
  if ($('fMap').getAttribute('src') !== src) $('fMap').src = src;
  $('fRute').href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(ALAMAT);
}
function setupFooter() {
  footerInfo();
  say('fYr', new Date().getFullYear());
  updateOpen(); setInterval(updateOpen, 60000);
}
function updateOpen() {
  const p = {};
  new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Makassar', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false })
    .formatToParts(new Date()).forEach(x => p[x.type] = x.value);
  const h = (+p.hour % 24) + (+p.minute) / 60;
  const [o, c] = (p.weekday === 'Sat' || p.weekday === 'Sun') ? JAM.weekend : JAM.weekday;
  const el = $('fOpen'), open = h >= o && h < c;
  el.className = 'open ' + (open ? 'y' : 'n');
  el.textContent = open ? `● Buka sekarang (tutup ${c}.00 WITA)` : `● Tutup (buka ${o}.00 WITA)`;
}
function locate() {
  if (!navigator.geolocation) { say('fLoc', 'Browser tidak mendukung deteksi lokasi.'); return; }
  say('fLoc', 'Mendeteksi lokasi…');
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: la, longitude: lo } = pos.coords, R = 6371, rad = x => x * Math.PI / 180;
    const a = Math.sin(rad(TOKO_LAT - la) / 2) ** 2 + Math.cos(rad(la)) * Math.cos(rad(TOKO_LAT)) * Math.sin(rad(TOKO_LNG - lo) / 2) ** 2;
    const km = 2 * R * Math.asin(Math.sqrt(a));
    say('fLoc', `Koordinat: ${la.toFixed(4)}, ${lo.toFixed(4)} · jarak ke toko ± ${km.toFixed(1)} km`);
  }, () => say('fLoc', 'Lokasi tidak bisa diakses. Izinkan akses lokasi di browser.'), { timeout: 10000 });
}

/* ---------- PERBAIKAN KOLOM USERNAME & TAB MASUK ----------
   1) Di dalam atribut onclick, nama "role" bentrok dengan properti bawaan elemen
      (Element.role), sehingga tombol tab Pelanggan/Admin error. Dipasang ulang di sini.
   2) Matikan auto-kapital, auto-koreksi, dan isi otomatis pada kolom username
      agar tidak terisi nilai yang tidak diinginkan (misalnya "admin" atau email). */
function fixAuthFields() {
  const tc = $('tc'), ta = $('ta');
  if (tc) tc.onclick = () => setRole('c');
  if (ta) ta.onclick = () => setRole('a');
  ['ru', 'lu'].forEach(id => {
    const el = $(id); if (!el) return;
    el.setAttribute('autocapitalize', 'none');
    el.setAttribute('autocorrect', 'off');
    el.setAttribute('spellcheck', 'false');
    if (id === 'ru') el.setAttribute('autocomplete', 'off');
    el.setAttribute('placeholder', 'contoh: aulia_23');
  });
  const ru = $('ru');
  if (ru) ru.removeAttribute('minlength'); // validasi dilakukan di reg() dengan pesan yang jelas
}

/* ---------- MULAI ---------- */
applyPrices();
applySettings();
fixAuthFields();
buildHero();
renderMini();
filt('');
renderCart();
setupFooter();
afterAuth();
go('home');
loadStats().then(() => { renderMini(); renderGrid(); if (curSec === 'statistik') renderStats(); });