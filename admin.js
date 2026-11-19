/* =========================================================
   J & A – Dashboard Admin  |  admin.js
   Dimuat SESUDAH script.js. Hanya admin yang sudah login (sesi valid)
   yang dapat membuka dashboard ini (lihat isAdmin() / adminSessOK()).
   ========================================================= */

/* ---------- IKON ---------- */
const ICO = {
  home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  news: 'M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2 M18 14h-8 M15 18h-5 M10 6h8v4h-8z',
  tag: 'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z M7 7h.01',
  image: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  usercheck: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M17 11l2 2 4-4',
  form: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6v4H9z M9 12h6 M9 16h6',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.7 21a2 2 0 0 1-3.4 0',
  chart: 'M18 20V10 M12 20V4 M6 20v-6',
  settings: 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
  lock: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z M7 11V7a5 5 0 0 1 10 0v4',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9'
};
const ico = n => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[n].split(' M').map((d, i) => `<path d="${i ? 'M' : ''}${d}"/>`).join('')}</svg>`;

/* ---------- DATA TAMBAHAN ---------- */
const DEF_NEWS = [
  { id: 'n1', cat: 'Promo', title: 'Diskon Abaya Koleksi Terbaru', body: 'Dapatkan potongan harga untuk abaya koleksi musim ini selama persediaan masih ada.', date: '2026-10-28', pub: true },
  { id: 'n2', cat: 'Tips', title: 'Hijab Apa yang Cocok untuk Bentuk Wajahmu?', body: 'Wajah bulat cocok dengan lipatan yang memanjang ke bawah, wajah oval lebih bebas bereksperimen. Kenali bentuk wajahmu, lalu pilih jenis hijab yang membuatmu paling percaya diri.', date: '2026-10-25', pub: true },
  { id: 'n3', cat: 'Tips', title: 'Memilih Ciput yang Nyaman', body: 'Ciput rajut cocok untuk cuaca sejuk, sedangkan ciput kaos lebih adem untuk dipakai sehari-hari.', date: '2026-10-20', pub: true },
  { id: 'n4', cat: 'Perawatan', title: 'Cara Merawat Abaya agar Awet', body: 'Cuci dengan air dingin, balik bagian dalam kain, dan jemur di tempat teduh. Dengan begitu warna tetap pekat dan bahan tidak mudah rusak.', date: '2026-10-17', pub: true },
  { id: 'n5', cat: 'Gaya', title: 'Padu Padan Warna yang Tak Pernah Salah', body: 'Abaya hitam dipadukan hijab warna lembut memberi kesan elegan, sedangkan abaya cream cantik dengan hijab earth tone untuk tampilan hangat dan tenang.', date: '2026-10-14', pub: true },
  { id: 'n6', cat: 'Info', title: 'Ceritakan Pengalaman Belanjamu', body: 'Pernah belanja di J & A? Beri rating di halaman ini atau kirim ulasan lewat WhatsApp. Ulasan jujurmu membantu pelanggan lain memilih dengan yakin.', date: '2026-10-28', pub: true },
  { id: 'n7', cat: 'Info', title: 'Pembayaran Kini Via QR', body: 'Pelanggan dapat membayar lewat QR langsung ke admin J & A saat checkout.', date: '2026-10-12', pub: true }
];
const DEF_CATS = ['Promo', 'Tips', 'Perawatan', 'Gaya', 'Info'];
const DEF_FORM = { on: true, subjects: ['Tanya produk', 'Tanya pesanan', 'Saran / kritik', 'Lainnya'], okMsg: 'Terima kasih! Pesanmu sudah kami terima dan akan dibalas secepatnya 💛' };
const DEF_PAGES = {
  heroTitle: 'Anggun Itu Bukan Soal Mahal,\nTapi Soal Pilihan yang Tepat.',
  heroText: 'Abaya yang jatuhnya cantik, hijab yang lembut seperti pelukan, dan ciput yang tak bikin gerah. Semua ada di sini, siap menemani harimu.',
  storyTitle: 'Berawal dari Satu Keinginan Sederhana',
  storyP1: 'J & A lahir dari keinginan sederhana: membantu setiap muslimah tampil anggun tanpa harus bingung mencari busana yang pas. Berawal dari kecintaan pada fashion muslimah, kami mulai memilih satu per satu abaya, hijab, dan ciput yang kami sendiri akan senang memakainya.',
  storyP2: 'Dari Kota Makassar, kami ingin menghadirkan pilihan busana yang rapi, nyaman dipakai seharian, dan terjangkau. Bagi kami, berhijab bukan sekadar gaya, tetapi bagian dari identitas yang layak dirayakan dengan percaya diri.',
  showStat: true, showBerita: true
};
const arr = k => { const v = ld(k, []); return Array.isArray(v) ? v : []; };
const news = () => { const v = ld('ja_news', null); return Array.isArray(v) ? v : DEF_NEWS.map(x => Object.assign({}, x)); };
const cats = () => { const v = ld('ja_cats', null); return Array.isArray(v) && v.length ? v : DEF_CATS.slice(); };
const msgs = () => arr('ja_msgs');
const gallery = () => arr('ja_gallery');
const formCfg = () => Object.assign({}, DEF_FORM, ld('ja_form', {}));
const pages = () => Object.assign({}, DEF_PAGES, ld('ja_pages', {}));
const unreadMsgs = () => msgs().filter(m => !m.read).length;
const nl2br = t => esc(t).replace(/\n/g, '<br>');
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---------- UTILITAS ---------- */
function readImage(file, max) {
  return new Promise((ok, no) => {
    if (!file || !/^image\//.test(file.type)) return no(new Error('File harus berupa gambar.'));
    const fr = new FileReader();
    fr.onerror = () => no(new Error('File tidak bisa dibaca.'));
    fr.onload = () => {
      const im = new Image();
      im.onerror = () => no(new Error('Gambar tidak bisa dibaca.'));
      im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        ok(c.toDataURL('image/jpeg', .8));
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}
function csvCell(v) {
  let s = String(v == null ? '' : v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // cegah formula injection di Excel
  return '"' + s.replace(/"/g, '""') + '"';
}
function downloadFile(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: type || 'text/csv;charset=utf-8' }));
  a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const guard = () => { if (!isAdmin()) { go('masuk'); return false; } touchAdmin(); return true; };
const ok = (id, t) => { const e = $(id); if (e) { e.textContent = t; e.style.color = ''; } };
const bad = (id, t) => { const e = $(id); if (e) { e.textContent = t; e.style.color = '#b3261e'; } };

/* ---------- MENU ---------- */
let admTab = 'dash';
const MENU = [
  { g: 'Pengelolaan Website', i: [['dash', 'Dashboard', 'home'], ['profil', 'Profil Website', 'globe'], ['halaman', 'Manajemen Halaman', 'file'], ['berita', 'Berita', 'news'], ['kategori', 'Kategori', 'tag'], ['galeri', 'Galeri', 'image']] },
  { g: 'Pengelolaan Pengguna', i: [['pengguna', 'Manajemen Pengguna', 'users'], ['admin', 'Manajemen Admin', 'usercheck']] },
  { g: 'Pengelolaan Komunikasi', i: [['formulir', 'Formulir', 'form'], ['pesan', 'Pesan', 'mail'], ['notif', 'Notifikasi', 'bell']] },
  { g: 'Pengelolaan Sistem', i: [['laporan', 'Laporan', 'chart'], ['pengaturan', 'Pengaturan', 'settings'], ['keamanan', 'Keamanan', 'lock'], ['riwayat', 'Riwayat Aktivitas', 'clock'], ['logout', 'Logout', 'logout']] }
];
const TITLES = {}; MENU.forEach(g => g.i.forEach(([k, t]) => { TITLES[k] = t; }));

function drawSide() {
  const badge = k => { const n = k === 'notif' ? unreadN() : k === 'pesan' ? unreadMsgs() : 0; return n ? `<span class="nbadge">${n}</span>` : ''; };
  $('admSide').innerHTML = `<div class="adm-who"><div class="avatar" style="width:44px;height:44px;font-size:1.2rem">A</div><div><b>${esc(ADMIN.name)}</b><span class="tag">Pemilik</span></div></div>` +
    MENU.map(g => `<div class="adm-grp"><h4>${g.g}</h4>${g.i.map(([k, t, ic]) =>
      `<button class="${k === admTab ? 'on' : ''}${k === 'logout' ? ' out' : ''}" onclick="admGo('${k}')">${ico(ic)}<span>${t}</span>${badge(k)}</button>`).join('')}</div>`).join('');
}
function admGo(k) {
  if (!guard()) return;
  if (k === 'logout') { logout(); return; }
  admTab = k; $('admSide').classList.remove('open'); renderAdmin(); window.scrollTo({ top: 0 });
}
function admMenu() { $('admSide').classList.toggle('open'); }

function renderAdmin() {
  if (!isAdmin()) { go('masuk'); return; }
  touchAdmin(); drawSide();
  const fn = PANELS[admTab] || PANELS.dash;
  $('admMain').innerHTML = `<div class="adm-top"><button class="btn alt sm adm-burger" onclick="admMenu()">☰ Menu</button><h2>${esc(TITLES[admTab] || 'Dashboard')}</h2></div>` + fn();
  const after = AFTER[admTab]; if (after) after();
}

/* ---------- PANEL: DASHBOARD ---------- */
const PANELS = {}, AFTER = {};
PANELS.dash = () => `
  <div class="card" id="atS"></div>
  <div class="cnts" style="margin-top:14px">
    <div class="card"><b>${unreadN()}</b><span>Notifikasi baru</span></div>
    <div class="card"><b>${unreadMsgs()}</b><span>Pesan belum dibaca</span></div>
    <div class="card"><b>${news().filter(n => n.pub).length}</b><span>Berita tayang</span></div>
    <div class="card"><b>${gallery().length}</b><span>Foto galeri</span></div></div>
  <div class="card"><h3>Pesanan &amp; Pembayaran</h3><div class="tw" id="atO"></div></div>`;
AFTER.dash = () => {
  renderSummary();
  const os = ld('ja_orders', []).slice().sort((a, b) => b.date - a.date);
  $('atO').innerHTML = os.length ? `<table><tr><th>ID</th><th>Tanggal</th><th>Pelanggan</th><th>HP</th><th>Pesanan</th><th>Total</th><th>Status</th></tr>${os.map(o =>
    `<tr><td>${esc(o.id)}</td><td>${tgl(o.date)}</td><td>${esc(o.name)}</td><td>${esc(o.phone)}</td>
     <td>${o.items.map(i => esc(i.name) + ' ×' + i.q).join(', ')}</td><td>${rp(o.total)}</td>
     <td><select onchange="setStatus('${esc(o.id)}',this.value)">${STATUS.map(s => `<option${s === o.status ? ' selected' : ''}>${s}</option>`).join('')}</select></td></tr>`).join('')}</table>` : '<p class="empty">Belum ada pesanan.</p>';
};

/* ---------- PANEL: PROFIL WEBSITE ---------- */
PANELS.profil = () => {
  const s = SET, hr = (a, b, v) => `<div class="hrs"><input type="number" min="0" max="23" id="${a}" value="${v[0]}" aria-label="Jam buka"> <span>sampai</span> <input type="number" min="1" max="24" id="${b}" value="${v[1]}" aria-label="Jam tutup"> <span>WITA</span></div>`;
  return `<div class="card"><h3>Profil Website</h3><p class="note" style="margin-top:0">Info ini tampil di footer, halaman Tentang, dan tombol WhatsApp.</p>
  <div class="cfg">
    <div><label for="pf_wa">No. WhatsApp admin</label><input id="pf_wa" type="tel" value="${esc(s.waTampil)}" placeholder="08xxxxxxxxxxx">
      <label for="pf_ig">Link Instagram</label><input id="pf_ig" type="url" value="${esc(s.ig || 'https://www.instagram.com/xyradumb_/')}" placeholder="https://www.instagram.com/akunmu/"></div>
    <div><label for="pf_al">Alamat toko</label><textarea id="pf_al" rows="4">${esc(s.alamat)}</textarea></div>
    <div><label>Jam buka Senin – Jumat</label>${hr('pf_w1', 'pf_w2', s.jamWeekday)}<label>Jam buka Sabtu – Minggu</label>${hr('pf_e1', 'pf_e2', s.jamWeekend)}</div>
  </div>
  <button class="btn" onclick="saveProfil()">Simpan Profil</button><div class="msg" id="pfm"></div></div>`;
};
function saveProfil() {
  if (!guard()) return;
  const wa = $('pf_wa').value.trim(), al = $('pf_al').value.trim(), ig = $('pf_ig').value.trim();
  if (!PHONE_OK.test(normPhone(wa))) return bad('pfm', 'No. WhatsApp tidak valid. Contoh: 08xxxxxxxxxxx');
  if (!al) return bad('pfm', 'Alamat toko tidak boleh kosong.');
  if (ig && !/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._\-\/?=&]+$/.test(ig)) return bad('pfm', 'Link Instagram harus berbentuk https://www.instagram.com/namaakun');
  const j = id => Number($(id).value), wd = [j('pf_w1'), j('pf_w2')], we = [j('pf_e1'), j('pf_e2')];
  for (const [a, b] of [wd, we]) if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b > 24 || a >= b) return bad('pfm', 'Jam buka harus lebih awal dari jam tutup (0–24).');
  SET = Object.assign({}, SET, { waTampil: wa, alamat: al, ig, jamWeekday: wd, jamWeekend: we });
  if (!sv('ja_settings', SET)) return bad('pfm', 'Tidak bisa disimpan di browser ini.');
  applySettings(); ok('pfm', 'Profil website tersimpan ✅'); logAct('Profil Website', 'Info toko diperbarui');
}
const _applySettings = applySettings;
applySettings = function () {
  _applySettings();
  const a = document.querySelector('.soc a[href*="instagram.com"]');
  if (a && SET.ig && /^https:\/\/(www\.)?instagram\.com\//.test(SET.ig)) a.href = SET.ig;
};

/* ---------- PANEL: MANAJEMEN HALAMAN ---------- */
PANELS.halaman = () => {
  const p = pages();
  return `<div class="card"><h3>Manajemen Halaman</h3>
  <form onsubmit="return savePages(event)">
    <h4 class="sec">Beranda</h4>
    <label for="pg_ht">Judul utama <small>(Enter = baris baru)</small></label><textarea id="pg_ht" rows="2" maxlength="140">${esc(p.heroTitle)}</textarea>
    <label for="pg_hx">Deskripsi</label><textarea id="pg_hx" rows="3" maxlength="300">${esc(p.heroText)}</textarea>
    <h4 class="sec">Tentang J &amp; A</h4>
    <label for="pg_st">Judul cerita</label><input id="pg_st" maxlength="100" value="${esc(p.storyTitle)}">
    <label for="pg_s1">Paragraf 1</label><textarea id="pg_s1" rows="4" maxlength="800">${esc(p.storyP1)}</textarea>
    <label for="pg_s2">Paragraf 2</label><textarea id="pg_s2" rows="4" maxlength="800">${esc(p.storyP2)}</textarea>
    <h4 class="sec">Tampilkan halaman di menu</h4>
    <label class="chk"><input type="checkbox" id="pg_vs"${p.showStat !== false ? ' checked' : ''}> Perkembangan Toko</label>
    <label class="chk"><input type="checkbox" id="pg_vb"${p.showBerita !== false ? ' checked' : ''}> Berita &amp; Ulasan</label>
    <br><button class="btn">Simpan Halaman</button> <button type="button" class="btn alt" onclick="resetPages()">Kembalikan Bawaan</button></form>
  <div class="msg" id="pgm"></div></div>`;
};
function savePages(e) {
  e.preventDefault(); if (!guard()) return false;
  const v = Object.assign({}, pages(), {
    heroTitle: $('pg_ht').value.trim(), heroText: $('pg_hx').value.trim(), storyTitle: $('pg_st').value.trim(),
    storyP1: $('pg_s1').value.trim(), storyP2: $('pg_s2').value.trim(), showStat: $('pg_vs').checked, showBerita: $('pg_vb').checked
  });
  if (!v.heroTitle || !v.heroText || !v.storyTitle || !v.storyP1) { bad('pgm', 'Judul, deskripsi, dan paragraf 1 wajib diisi.'); return false; }
  if (!sv('ja_pages', v)) { bad('pgm', 'Tidak bisa disimpan di browser ini.'); return false; }
  applyPages(); buildNav(); ok('pgm', 'Halaman tersimpan ✅'); logAct('Manajemen Halaman', 'Konten halaman diperbarui');
  return false;
}
function resetPages() {
  if (!guard() || !confirm('Kembalikan semua teks halaman ke bawaan?')) return;
  try { localStorage.removeItem('ja_pages'); } catch (e) { }
  applyPages(); buildNav(); renderAdmin(); logAct('Manajemen Halaman', 'Dikembalikan ke bawaan');
}
function applyPages() {
  const p = pages();
  const h1 = document.querySelector('#hero h1'), hp = document.querySelector('#hero p');
  if (h1) h1.innerHTML = nl2br(p.heroTitle);
  if (hp) hp.textContent = p.heroText;
  const st = document.querySelector('.story h3'), ps = document.querySelectorAll('.story p');
  if (st) st.textContent = p.storyTitle;
  if (ps[0]) ps[0].textContent = p.storyP1;
  if (ps[1]) { ps[1].textContent = p.storyP2; ps[1].style.display = p.storyP2 ? '' : 'none'; }
}

/* ---------- PANEL: BERITA ---------- */
let newsEdit = null;
PANELS.berita = () => {
  const n = newsEdit ? news().find(x => x.id === newsEdit) : null, list = news().slice().sort((a, b) => b.date.localeCompare(a.date));
  return `<div class="card"><h3>${n ? 'Ubah Berita' : 'Tulis Berita Baru'}</h3>
  <form onsubmit="return saveNews(event)">
    <label for="nw_t">Judul</label><input id="nw_t" required maxlength="120" value="${esc(n ? n.title : '')}">
    <div class="two"><div><label for="nw_c">Kategori</label><select id="nw_c">${cats().map(c => `<option${n && n.cat === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
    <div><label for="nw_d">Tanggal</label><input id="nw_d" type="date" required value="${esc(n ? n.date : todayISO())}"></div></div>
    <label for="nw_b">Isi berita</label><textarea id="nw_b" rows="4" required maxlength="1200">${esc(n ? n.body : '')}</textarea>
    <label class="chk"><input type="checkbox" id="nw_p"${!n || n.pub ? ' checked' : ''}> Tayangkan di website</label>
    <button class="btn">${n ? 'Simpan Perubahan' : 'Terbitkan'}</button>${n ? ' <button type="button" class="btn alt" onclick="cancelNews()">Batal</button>' : ''}</form>
  <div class="msg" id="nwm"></div></div>
  <div class="card" style="margin-top:14px"><h3>Daftar Berita (${list.length})</h3>
  ${list.length ? list.map(x => `<div class="nit"><div class="nh"><div><b>${esc(x.title)}</b><br><span class="tag">${esc(x.cat)} · ${tgl(x.date)} · ${x.pub ? 'Tayang' : 'Draf'}</span></div>
    <div class="acts"><button class="btn sm alt" onclick="editNews('${x.id}')">Ubah</button><button class="btn sm alt" onclick="toggleNews('${x.id}')">${x.pub ? 'Sembunyikan' : 'Tayangkan'}</button><button class="btn sm alt" onclick="delNews('${x.id}')">Hapus</button></div></div></div>`).join('') : '<p class="empty">Belum ada berita.</p>'}</div>`;
};
function saveNews(e) {
  e.preventDefault(); if (!guard()) return false;
  const list = news(), v = { title: $('nw_t').value.trim(), cat: $('nw_c').value, date: $('nw_d').value, body: $('nw_b').value.trim(), pub: $('nw_p').checked };
  if (!v.title || !v.body || !/^\d{4}-\d{2}-\d{2}$/.test(v.date)) { bad('nwm', 'Judul, tanggal, dan isi wajib diisi.'); return false; }
  if (newsEdit) { const x = list.find(n => n.id === newsEdit); if (x) Object.assign(x, v); logAct('Berita', 'Mengubah: ' + v.title); }
  else { list.push(Object.assign({ id: uid() }, v)); logAct('Berita', 'Menerbitkan: ' + v.title); }
  if (!sv('ja_news', list)) { bad('nwm', 'Tidak bisa disimpan di browser ini.'); return false; }
  newsEdit = null; renderAdmin(); return false;
}
function editNews(id) { if (!guard()) return; newsEdit = id; renderAdmin(); window.scrollTo({ top: 0 }); }
function cancelNews() { newsEdit = null; renderAdmin(); }
function toggleNews(id) { if (!guard()) return; const l = news(), x = l.find(n => n.id === id); if (x) { x.pub = !x.pub; sv('ja_news', l); logAct('Berita', (x.pub ? 'Menayangkan: ' : 'Menyembunyikan: ') + x.title); } renderAdmin(); }
function delNews(id) { if (!guard()) return; const x = news().find(n => n.id === id); if (!x || !confirm('Hapus berita "' + x.title + '"?')) return; sv('ja_news', news().filter(n => n.id !== id)); logAct('Berita', 'Menghapus: ' + x.title); renderAdmin(); }
function renderNews() {
  const el = $('newsList'); if (!el) return;
  const l = news().filter(n => n.pub).sort((a, b) => b.date.localeCompare(a.date));
  el.innerHTML = l.length ? l.map(n => `<div class="card"><span class="tag">${esc(n.cat)} · ${tgl(n.date)}</span><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p></div>`).join('') : '<p class="empty">Belum ada kabar terbaru.</p>';
}

/* ---------- PANEL: KATEGORI ---------- */
PANELS.kategori = () => {
  const ns = news();
  return `<div class="card"><h3>Kategori Berita</h3>
  <form onsubmit="return addCat(event)" class="inl"><input id="ct_n" required maxlength="30" placeholder="Nama kategori baru"><button class="btn">Tambah</button></form><div class="msg" id="ctm"></div>
  ${cats().map(c => { const n = ns.filter(x => x.cat === c).length; return `<div class="nit"><div class="nh"><div><b>${esc(c)}</b> <span class="tag">${n} berita</span></div>
    <div class="acts"><button class="btn sm alt" onclick="renCat('${esc(c).replace(/'/g, '&#39;')}')">Ganti nama</button><button class="btn sm alt" onclick="delCat('${esc(c).replace(/'/g, '&#39;')}')">Hapus</button></div></div></div>`; }).join('')}</div>
  <div class="card" style="margin-top:14px"><h3>Kategori Produk</h3><p class="note" style="margin-top:0">Kategori produk tetap (terhubung ke keranjang dan statistik penjualan).</p>
  ${['Abaya', 'Hijab', 'Ciput'].map(c => `<div class="nit"><b>${c}</b> <span class="tag">${PRODUCTS.filter(p => p.cat === c).length} produk</span></div>`).join('')}</div>`;
};
function addCat(e) {
  e.preventDefault(); if (!guard()) return false;
  const n = $('ct_n').value.trim().replace(/\s+/g, ' '), l = cats();
  if (!n) return false;
  if (l.some(c => c.toLowerCase() === n.toLowerCase())) { bad('ctm', 'Kategori itu sudah ada.'); return false; }
  l.push(n); sv('ja_cats', l); logAct('Kategori', 'Menambah: ' + n); renderAdmin(); return false;
}
function renCat(c) {
  if (!guard()) return;
  const n = (prompt('Nama baru untuk kategori "' + c + '":', c) || '').trim().replace(/\s+/g, ' ');
  if (!n || n === c) return;
  const l = cats();
  if (l.some(x => x.toLowerCase() === n.toLowerCase() && x !== c)) { alert('Kategori itu sudah ada.'); return; }
  l[l.indexOf(c)] = n; sv('ja_cats', l);
  const ns = news(); ns.forEach(x => { if (x.cat === c) x.cat = n; }); sv('ja_news', ns);
  logAct('Kategori', 'Mengganti nama: ' + c + ' → ' + n); renderAdmin();
}
function delCat(c) {
  if (!guard()) return;
  if (news().some(x => x.cat === c)) { alert('Kategori "' + c + '" masih dipakai berita. Pindahkan atau hapus beritanya dulu.'); return; }
  if (cats().length <= 1) { alert('Minimal harus ada satu kategori.'); return; }
  if (!confirm('Hapus kategori "' + c + '"?')) return;
  sv('ja_cats', cats().filter(x => x !== c)); logAct('Kategori', 'Menghapus: ' + c); renderAdmin();
}

/* ---------- PANEL: GALERI ---------- */
PANELS.galeri = () => {
  const g = gallery();
  return `<div class="card"><h3>Galeri Foto</h3><p class="note" style="margin-top:0">Foto tampil di halaman Tentang. Disimpan di browser ini dan otomatis diperkecil.</p>
  <label for="gl_c">Keterangan <small>(opsional)</small></label><input id="gl_c" maxlength="80">
  <label for="gl_f">Pilih foto (boleh banyak)</label><input id="gl_f" type="file" accept="image/*" multiple onchange="addPhotos(this)">
  <div class="msg" id="glm"></div></div>
  <div class="card" style="margin-top:14px"><h3>Foto (${g.length})</h3>
  ${g.length ? `<div class="gal">${g.map(x => `<figure><img src="${x.src}" alt="${esc(x.cap || 'Foto galeri')}"><figcaption>${esc(x.cap || '')}</figcaption><button class="btn sm alt" onclick="delPhotoG('${x.id}')">Hapus</button></figure>`).join('')}</div>` : '<p class="empty">Belum ada foto.</p>'}</div>`;
};
async function addPhotos(inp) {
  if (!guard()) return;
  const files = [...(inp.files || [])].slice(0, 12), cap = ($('gl_c').value || '').trim();
  if (!files.length) return;
  const g = gallery(); let n = 0;
  for (const f of files) {
    try {
      const src = await readImage(f, 800);
      g.push({ id: uid(), src, cap, date: Date.now() });
      if (!sv('ja_gallery', g)) { g.pop(); bad('glm', 'Penyimpanan penuh. Hapus beberapa foto dulu.'); break; }
      n++;
    } catch (e) { bad('glm', e.message); }
  }
  if (n) { logAct('Galeri', 'Menambah ' + n + ' foto'); renderAdmin(); ok('glm', n + ' foto ditambahkan ✅'); }
}
function delPhotoG(id) { if (!guard() || !confirm('Hapus foto ini?')) return; sv('ja_gallery', gallery().filter(x => x.id !== id)); logAct('Galeri', 'Menghapus 1 foto'); renderAdmin(); }
function renderGalPub() {
  const el = $('galPub'); if (!el) return;
  const g = gallery();
  el.innerHTML = g.length ? `<div class="card" style="margin-top:14px"><h3>Galeri</h3><div class="gal">${g.map(x => `<figure><img src="${x.src}" alt="${esc(x.cap || 'Foto galeri J & A')}" loading="lazy">${x.cap ? `<figcaption>${esc(x.cap)}</figcaption>` : ''}</figure>`).join('')}</div></div>` : '';
}

/* ---------- PANEL: MANAJEMEN PENGGUNA ---------- */
let userQ = '';
PANELS.pengguna = () => {
  const os = ld('ja_orders', []), us = users().filter(u => !userQ || (u.name + ' ' + u.username + ' ' + (u.phone || '')).toLowerCase().includes(userQ.toLowerCase()));
  return `<div class="card"><h3>Pelanggan (${users().length})</h3>
  <input id="us_q" placeholder="Cari nama / username / HP" value="${esc(userQ)}" oninput="userQ=this.value;drawUsers()" style="max-width:340px">
  <div class="msg" id="usm"></div><div class="tw" id="usT"></div></div>`;
};
AFTER.pengguna = () => drawUsers();
function drawUsers() {
  const os = ld('ja_orders', []), us = users().filter(u => !userQ || (u.name + ' ' + u.username + ' ' + (u.phone || '')).toLowerCase().includes(userQ.toLowerCase()));
  $('usT').innerHTML = us.length ? `<table><tr><th>Nama</th><th>Username</th><th>No. HP</th><th>Alamat</th><th>Daftar</th><th>Pesanan</th><th>Status</th><th>Aksi</th></tr>${us.map(u =>
    `<tr><td>${esc(u.name)}</td><td>${esc(u.username)}</td><td>${esc(u.phone || '-')}</td><td style="white-space:normal;min-width:160px">${esc(u.address || '-')}</td><td>${tgl(u.created)}</td><td>${os.filter(o => o.user === u.username).length}</td>
     <td>${u.blocked ? '<span class="ostat bad">Diblokir</span>' : '<span class="ostat">Aktif</span>'}</td>
     <td><button class="btn sm alt" onclick="blockUser('${esc(u.username)}')">${u.blocked ? 'Aktifkan' : 'Blokir'}</button> <button class="btn sm alt" onclick="resetUserPass('${esc(u.username)}')">Reset sandi</button> <button class="btn sm alt" onclick="delUser('${esc(u.username)}')">Hapus</button></td></tr>`).join('')}</table>` : '<p class="empty">Tidak ada pelanggan.</p>';
}
function blockUser(u) {
  if (!guard()) return; const l = users(), x = l.find(v => v.username === u); if (!x) return;
  x.blocked = !x.blocked; sv('ja_users', l); logAct('Pengguna', (x.blocked ? 'Memblokir @' : 'Mengaktifkan @') + u); drawUsers();
}
async function resetUserPass(u) {
  if (!guard() || !confirm('Buat kata sandi sementara untuk @' + u + '?')) return;
  const l = users(), x = l.find(v => v.username === u); if (!x) return;
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789', r = crypto.getRandomValues(new Uint32Array(8));
  const tmp = [...r].map(n => chars[n % chars.length]).join('');
  x.pass = await hash(tmp); sv('ja_users', l); logAct('Pengguna', 'Reset kata sandi @' + u);
  ok('usm', 'Kata sandi sementara @' + u + ': ' + tmp + ' (kirimkan ke pelanggan, minta segera diganti di Profil)');
}
function delUser(u) {
  if (!guard() || !confirm('Hapus akun @' + u + '? Riwayat pesanannya tetap tersimpan.')) return;
  sv('ja_users', users().filter(v => v.username !== u)); logAct('Pengguna', 'Menghapus akun @' + u); drawUsers();
}

/* ---------- PANEL: MANAJEMEN ADMIN ---------- */
PANELS.admin = () => {
  const s = sess(), ev = actLog().filter(l => /^Login|^Logout/.test(l.type)).slice(-8).reverse();
  return `<div class="card"><h3>Akun Admin</h3>
  <div class="pinfo"><div class="kv"><span>Nama</span><b>${esc(ADMIN.name)}</b></div><div class="kv"><span>Username</span><b>${esc(ADMIN.u)}</b></div><div class="kv"><span>Peran</span><b>Pemilik (akses penuh)</b></div>
  <div class="kv"><span>Sesi berakhir</span><b>${s && s.exp ? tglJam(s.exp) + ' (otomatis diperpanjang saat aktif)' : '-'}</b></div></div>
  <p class="note">Website ini sengaja hanya memiliki <b>satu akun admin</b>, yaitu pemilik. Tidak ada fitur menambah admin lain, dan pelanggan tidak bisa mendaftar dengan username admin.</p>
  <button class="btn" onclick="admGo('keamanan')">Ganti Kata Sandi Admin</button></div>
  <div class="card" style="margin-top:14px"><h3>Aktivitas Masuk Terakhir</h3>
  ${ev.length ? `<div class="tw"><table><tr><th>Waktu</th><th>Jenis</th><th>Keterangan</th></tr>${ev.map(l => `<tr><td>${tglJam(l.t)}</td><td>${esc(l.type)}</td><td>${esc(l.detail)}</td></tr>`).join('')}</table></div>` : '<p class="empty">Belum ada catatan.</p>'}</div>`;
};

/* ---------- PANEL: FORMULIR ---------- */
PANELS.formulir = () => {
  const f = formCfg(), m = msgs();
  return `<div class="card"><h3>Formulir "Hubungi Kami"</h3><p class="note" style="margin-top:0">Formulir ini tampil di halaman Tentang. Pesan yang masuk dikelola di menu Pesan.</p>
  <form onsubmit="return saveForm(event)">
    <label class="chk"><input type="checkbox" id="fm_on"${f.on ? ' checked' : ''}> Aktifkan formulir</label>
    <label for="fm_s">Pilihan subjek <small>(satu per baris)</small></label><textarea id="fm_s" rows="5">${esc(f.subjects.join('\n'))}</textarea>
    <label for="fm_m">Pesan setelah terkirim</label><input id="fm_m" maxlength="160" value="${esc(f.okMsg)}">
    <br><button class="btn">Simpan Formulir</button></form><div class="msg" id="fmm"></div>
    <div class="pstats"><div><b>${m.length}</b><span>Total pesan masuk</span></div><div><b>${m.filter(x => !x.read).length}</b><span>Belum dibaca</span></div></div></div>`;
};
function saveForm(e) {
  e.preventDefault(); if (!guard()) return false;
  const subj = $('fm_s').value.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 10);
  if (!subj.length) { bad('fmm', 'Isi minimal satu pilihan subjek.'); return false; }
  sv('ja_form', { on: $('fm_on').checked, subjects: subj, okMsg: $('fm_m').value.trim() || DEF_FORM.okMsg });
  renderContact(); ok('fmm', 'Pengaturan formulir tersimpan ✅'); logAct('Formulir', 'Pengaturan formulir diperbarui'); return false;
}
function renderContact() {
  const el = $('contactCard'); if (!el) return;
  const f = formCfg();
  if (!f.on) { el.style.display = 'none'; return; }
  el.style.display = '';
  el.innerHTML = `<h3>Hubungi Kami</h3><p class="sub" style="margin-top:-4px">Ada pertanyaan? Tulis di sini, kami balas secepatnya.</p>
  <form onsubmit="return sendContact(event)">
    <label for="ck_n">Nama</label><input id="ck_n" required maxlength="60" autocomplete="name">
    <label for="ck_c">No. HP / email</label><input id="ck_c" required maxlength="80" autocomplete="off">
    <label for="ck_s">Subjek</label><select id="ck_s">${f.subjects.map(s => `<option>${esc(s)}</option>`).join('')}</select>
    <label for="ck_t">Pesan</label><textarea id="ck_t" rows="4" required maxlength="1000"></textarea>
    <br><button class="btn">Kirim Pesan</button></form><div class="msg" id="ckm"></div>`;
}
let lastMsgAt = 0;
function sendContact(e) {
  e.preventDefault();
  if (Date.now() - lastMsgAt < 30000) { $('ckm').textContent = 'Tunggu sebentar sebelum mengirim pesan lagi.'; return false; }
  const f = formCfg(), v = { name: $('ck_n').value.trim(), contact: $('ck_c').value.trim(), subject: $('ck_s').value, text: $('ck_t').value.trim() };
  if (!v.name || !v.contact || !v.text) { $('ckm').textContent = 'Semua kolom wajib diisi.'; return false; }
  const l = msgs(); l.push(Object.assign({ id: uid(), date: Date.now(), read: false }, v));
  if (!sv('ja_msgs', l.slice(-300))) { $('ckm').textContent = 'Pesan tidak bisa disimpan di browser ini.'; return false; }
  lastMsgAt = Date.now(); e.target.reset(); $('ckm').textContent = f.okMsg; buildNav();
  return false;
}

/* ---------- PANEL: PESAN ---------- */
let msgFilter = 'all';
PANELS.pesan = () => {
  const l = msgs().slice().reverse().filter(m => msgFilter === 'all' || !m.read);
  return `<div class="card"><h3>Pesan Masuk ${unreadMsgs() ? `<span class="nbadge">${unreadMsgs()} baru</span>` : ''}</h3>
  <div class="ntools"><button class="btn sm${msgFilter === 'all' ? '' : ' alt'}" onclick="msgFilter='all';renderAdmin()">Semua</button><button class="btn sm${msgFilter === 'new' ? '' : ' alt'}" onclick="msgFilter='new';renderAdmin()">Belum dibaca</button><button class="btn sm alt" onclick="readAllMsgs()">✓ Tandai semua dibaca</button></div>
  ${l.length ? l.map(m => {
    const ph = normPhone(m.contact), wa = PHONE_OK.test(ph) ? `https://wa.me/62${ph.slice(1)}?text=${encodeURIComponent('Halo ' + m.name + ', kami dari J & A. Terkait pesanmu "' + m.subject + '": ')}` : '';
    return `<div class="nit${m.read ? '' : ' unread'}"><div class="nh"><div><b>${esc(m.subject)}</b> <span class="tag">${tglJam(m.date)}</span><br><span class="nm">${esc(m.name)} · ${esc(m.contact)}</span></div>
      <div class="acts">${m.read ? '<span class="tag">✓ Dibaca</span>' : `<button class="btn sm" onclick="readMsg('${m.id}')">Tandai dibaca</button>`}${wa ? `<a class="btn sm alt" style="text-decoration:none" target="_blank" rel="noopener" href="${wa}">Balas WhatsApp</a>` : ''}<button class="btn sm alt" onclick="delMsg('${m.id}')">Hapus</button></div></div>
      <p style="margin:8px 0 0;white-space:pre-line">${esc(m.text)}</p></div>`;
  }).join('') : '<p class="empty">Tidak ada pesan.</p>'}</div>
  <div class="card" id="atR" style="margin-top:14px"></div>`;
};
AFTER.pesan = () => renderReviews();
function readMsg(id) { if (!guard()) return; const l = msgs(), x = l.find(m => m.id === id); if (x) { x.read = true; sv('ja_msgs', l); } buildNav(); renderAdmin(); }
function readAllMsgs() { if (!guard()) return; const l = msgs(); l.forEach(m => { m.read = true; }); sv('ja_msgs', l); buildNav(); renderAdmin(); }
function delMsg(id) { if (!guard() || !confirm('Hapus pesan ini?')) return; sv('ja_msgs', msgs().filter(m => m.id !== id)); logAct('Pesan', 'Menghapus 1 pesan'); buildNav(); renderAdmin(); }

/* ---------- PANEL: NOTIFIKASI ---------- */
PANELS.notif = () => '<div class="card" id="atN"></div>';
AFTER.notif = () => renderNotifs();
const _notifChanged = notifChanged;
notifChanged = function () { renderNotifs(); buildNav(); if ($('admSide')) drawSide(); };

/* ---------- PANEL: LAPORAN ---------- */
let repDays = 30;
function repData() {
  const since = repDays ? Date.now() - repDays * 86400000 : 0;
  const all = ld('ja_orders', []).filter(o => o.date >= since).sort((a, b) => b.date - a.date);
  const paid = all.filter(o => PAID.includes(o.status)), prod = {}, byStatus = {};
  STATUS.forEach(s => { byStatus[s] = 0; });
  all.forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
  paid.forEach(o => o.items.forEach(i => { prod[i.name] = prod[i.name] || { q: 0, v: 0 }; prod[i.name].q += i.q; prod[i.name].v += i.price * i.q; }));
  const omzet = paid.reduce((t, o) => t + o.total, 0);
  return { all, paid, prod, byStatus, omzet, avg: paid.length ? omzet / paid.length : 0, terjual: Object.values(prod).reduce((t, x) => t + x.q, 0) };
}
PANELS.laporan = () => {
  const r = repData(), top = Object.entries(r.prod).sort((a, b) => b[1].v - a[1].v);
  const t = (n, l) => `<div><b>${n}</b><span>${l}</span></div>`;
  return `<div class="card" id="repArea"><h3>Laporan Penjualan</h3>
  <div class="ntools"><label for="rp_d" style="margin:0;align-self:center">Periode</label><select id="rp_d" style="width:auto" onchange="repDays=+this.value;renderAdmin()">${[[7, '7 hari'], [30, '30 hari'], [90, '90 hari'], [0, 'Semua']].map(([v, l]) => `<option value="${v}"${v === repDays ? ' selected' : ''}>${l}</option>`).join('')}</select>
    <button class="btn sm alt" onclick="exportReport()">⬇ Unduh CSV</button><button class="btn sm alt" onclick="window.print()">🖨 Cetak</button></div>
  <div class="pstats">${t(nf(r.all.length), 'Total pesanan')}${t(nf(r.paid.length), 'Pesanan dibayar')}${t(rp(r.omzet), 'Pendapatan')}${t(rp(Math.round(r.avg)), 'Rata-rata / pesanan')}${t(nf(r.terjual), 'Produk terjual')}</div>
  <h4 class="sec">Status pesanan</h4><div class="pstats">${STATUS.map(s => t(r.byStatus[s] || 0, s)).join('')}</div>
  <h4 class="sec">Penjualan per produk</h4>
  ${top.length ? `<div class="tw"><table><tr><th>Produk</th><th>Terjual</th><th>Pendapatan</th></tr>${top.map(([n, x]) => `<tr><td>${esc(n)}</td><td>${x.q}</td><td>${rp(x.v)}</td></tr>`).join('')}</table></div>` : '<p class="empty">Belum ada penjualan pada periode ini.</p>'}
  <p class="note">Pendapatan dihitung dari pesanan berstatus Dibayar, Dikirim, dan Selesai.</p></div>`;
};
function exportReport() {
  if (!guard()) return;
  const r = repData(), rows = [['ID', 'Tanggal', 'Pelanggan', 'No. HP', 'Pesanan', 'Total', 'Status']];
  r.all.forEach(o => rows.push([o.id, new Date(o.date).toISOString().slice(0, 10), o.name, o.phone, o.items.map(i => i.name + ' x' + i.q).join('; '), o.total, o.status]));
  downloadFile('laporan-ja-' + todayISO() + '.csv', rows.map(x => x.map(csvCell).join(',')).join('\r\n'));
  logAct('Laporan', 'Mengunduh laporan CSV (' + (repDays ? repDays + ' hari' : 'semua') + ')');
}

/* ---------- PANEL: PENGATURAN ---------- */
PANELS.pengaturan = () => {
  const s = SET;
  return `<div class="card"><h3>Status Toko &amp; Pengumuman</h3>
  <div class="cfg">
    <div><h4>Status Toko</h4><label class="chk"><input type="checkbox" id="st_buka"${s.tokoBuka ? ' checked' : ''}> Terima pesanan baru</label>
      <label for="st_tutup">Pesan saat toko tutup <small>(opsional)</small></label><input id="st_tutup" maxlength="160" value="${esc(s.tutupPesan)}" placeholder="Toko sedang libur, pesanan dibuka kembali besok."></div>
    <div><h4>Pengumuman di Atas Website</h4><label class="chk"><input type="checkbox" id="st_pon"${s.pengumumanOn ? ' checked' : ''}> Tampilkan pengumuman</label>
      <label for="st_p">Teks pengumuman</label><input id="st_p" maxlength="160" value="${esc(s.pengumuman)}" placeholder="Contoh: Diskon abaya 10% sampai akhir bulan!"></div>
  </div><button class="btn" onclick="saveStatus()">Simpan Pengaturan</button><div class="msg" id="stm"></div></div>
  <div class="card" id="atP" style="margin-top:14px"></div>`;
};
AFTER.pengaturan = () => renderPrices();
function saveStatus() {
  if (!guard()) return;
  const p = $('st_p').value.trim();
  if ($('st_pon').checked && !p) return bad('stm', 'Isi teks pengumuman, atau matikan centang "Tampilkan pengumuman".');
  SET = Object.assign({}, SET, { tokoBuka: $('st_buka').checked, tutupPesan: $('st_tutup').value.trim(), pengumumanOn: $('st_pon').checked, pengumuman: p });
  if (!sv('ja_settings', SET)) return bad('stm', 'Tidak bisa disimpan di browser ini.');
  applySettings(); ok('stm', 'Pengaturan tersimpan ✅'); logAct('Pengaturan', 'Status toko ' + (SET.tokoBuka ? 'buka' : 'tutup') + (SET.pengumumanOn ? ', pengumuman aktif' : ''));
}

/* ---------- PANEL: KEAMANAN ---------- */
PANELS.keamanan = () => {
  const lock = Number(ld('ja_lock', 0)), fails = actLog().filter(l => l.type === 'Login gagal' && l.t > Date.now() - 86400000).length;
  return `<div class="card"><h3>Ganti Kata Sandi Admin</h3>
  <form onsubmit="return changeAdminPass(event)">
    <label for="kp_o">Kata sandi lama</label><input id="kp_o" type="password" required autocomplete="current-password">
    <label for="kp_n">Kata sandi baru <small>(minimal 8 karakter, campur huruf &amp; angka)</small></label><input id="kp_n" type="password" required minlength="8" autocomplete="new-password">
    <label for="kp_n2">Ulangi kata sandi baru</label><input id="kp_n2" type="password" required autocomplete="new-password">
    <br><button class="btn">Ubah Kata Sandi</button></form><div class="msg" id="kpm"></div></div>
  <div class="card" style="margin-top:14px"><h3>Status Keamanan</h3>
  <div class="pinfo"><div class="kv"><span>Login admin</span><b>${Date.now() < lock ? 'Terkunci sampai ' + tglJam(lock) : 'Normal'}</b></div>
  <div class="kv"><span>Gagal login (24 jam)</span><b>${fails}×</b></div>
  <div class="kv"><span>Batas percobaan</span><b>5× salah → kunci 5 menit</b></div>
  <div class="kv"><span>Sesi admin</span><b>Habis otomatis setelah 30 menit tanpa aktivitas</b></div>
  <div class="kv"><span>Penyimpanan sandi</span><b>Hash PBKDF2-SHA256 (sandi asli tidak tersimpan)</b></div></div>
  <button class="btn alt" onclick="unlockLogin()">Buka kunci login</button> <button class="btn alt" onclick="logout()">Keluar sekarang</button></div>
  <div class="card" style="margin-top:14px"><h3>Penting: batas keamanan website ini</h3>
  <p class="note" style="margin-top:0;font-size:.88rem">Website ini berjalan sepenuhnya di browser dan data tersimpan di <code>localStorage</code> tanpa server. Artinya, pengunjung yang paham teknis masih bisa membuka kode atau mengutak-atik penyimpanan lewat DevTools. Kunci di atas efektif untuk menghalangi pengunjung biasa, tetapi <b>bukan keamanan penuh</b>. Untuk perlindungan sungguhan, pasang pemeriksaan login di server (backend) atau gunakan proteksi dari hosting (misalnya Cloudflare Access / kata sandi direktori) untuk halaman admin.</p></div>`;
};
async function changeAdminPass(e) {
  e.preventDefault(); if (!guard()) return false;
  const o = $('kp_o').value, n = $('kp_n').value, n2 = $('kp_n2').value, c = adminCred();
  let okOld = false;
  try { okOld = (await adminDerive(o, c.salt)) === c.hash; } catch (x) { bad('kpm', 'Browser ini tidak mendukung fitur keamanan (butuh https:// atau localhost).'); return false; }
  if (!okOld) { logAct('Keamanan', 'Gagal ganti sandi: sandi lama salah'); bad('kpm', 'Kata sandi lama salah.'); return false; }
  if (n.length < 8 || !/[A-Za-z]/.test(n) || !/\d/.test(n)) { bad('kpm', 'Kata sandi baru minimal 8 karakter dan harus berisi huruf serta angka.'); return false; }
  if (n === o) { bad('kpm', 'Kata sandi baru harus berbeda dari yang lama.'); return false; }
  if (n !== n2) { bad('kpm', 'Pengulangan kata sandi tidak sama.'); return false; }
  const salt = 'ja-admin-' + uid() + uid(), hs = await adminDerive(n, salt);
  if (!sv('ja_admin', { salt, hash: hs })) { bad('kpm', 'Tidak bisa disimpan di browser ini.'); return false; }
  sv('ja_sess', { u: ADMIN.u, r: 'a', v: hs, exp: Date.now() + ADMIN_TTL });
  logAct('Keamanan', 'Kata sandi admin diganti'); e.target.reset(); ok('kpm', 'Kata sandi admin berhasil diganti ✅ (disimpan di browser ini)');
  return false;
}
function unlockLogin() { if (!guard()) return; sv('ja_lock', 0); sv('ja_fail', 0); logAct('Keamanan', 'Kunci login dibuka manual'); renderAdmin(); }

/* ---------- PANEL: RIWAYAT AKTIVITAS ---------- */
let logType = '';
PANELS.riwayat = () => {
  const all = actLog(), types = [...new Set(all.map(l => l.type))].sort(), l = all.slice().reverse().filter(x => !logType || x.type === logType).slice(0, 200);
  return `<div class="card"><h3>Riwayat Aktivitas</h3>
  <div class="ntools"><select style="width:auto" onchange="logType=this.value;renderAdmin()"><option value="">Semua jenis</option>${types.map(t => `<option${t === logType ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>
  <button class="btn sm alt" onclick="exportLog()">⬇ Unduh CSV</button><button class="btn sm alt" onclick="clearLog()">Hapus riwayat</button></div>
  ${l.length ? `<div class="tw"><table><tr><th>Waktu</th><th>Jenis</th><th>Keterangan</th></tr>${l.map(x => `<tr><td>${tglJam(x.t)}</td><td>${esc(x.type)}</td><td style="white-space:normal">${esc(x.detail)}</td></tr>`).join('')}</table></div>` : '<p class="empty">Belum ada aktivitas tercatat.</p>'}
  <p class="note">Menampilkan maksimal 200 catatan terbaru. Riwayat tersimpan di browser ini.</p></div>`;
};
function exportLog() {
  if (!guard()) return;
  downloadFile('riwayat-aktivitas-' + todayISO() + '.csv', [['Waktu', 'Jenis', 'Keterangan']].concat(actLog().map(l => [new Date(l.t).toISOString(), l.type, l.detail])).map(x => x.map(csvCell).join(',')).join('\r\n'));
}
function clearLog() { if (!guard() || !confirm('Hapus seluruh riwayat aktivitas?')) return; sv('ja_log', []); logAct('Riwayat', 'Riwayat aktivitas dibersihkan'); renderAdmin(); }

/* ---------- PEMBUNGKUS: catat aktivitas & jaga fungsi lama ---------- */
function wrapLog(name, text) {
  const f = window[name]; if (typeof f !== 'function') return;
  window[name] = function () { if (!isAdmin()) return; touchAdmin(); const r = f.apply(this, arguments); logAct(text, Array.prototype.slice.call(arguments).filter(a => typeof a === 'string').join(' → ')); return r; };
}
['setStatus', 'savePrices', 'resetPrices', 'delPhoto', 'replyRev', 'delRev'].forEach(n => wrapLog(n, { setStatus: 'Pesanan', savePrices: 'Harga produk', resetPrices: 'Harga produk', delPhoto: 'Foto produk', replyRev: 'Ulasan', delRev: 'Ulasan' }[n]));
['renderPrices', 'renderReviews'].forEach(n => { const f = window[n], id = n === 'renderPrices' ? 'atP' : 'atR'; window[n] = function () { if ($(id)) return f.apply(this, arguments); }; });

/* ---------- NAVIGASI (menu publik mengikuti pengaturan halaman) ---------- */
buildNav = function () {
  const P = pages(), c = cur();
  let items = NAVS.filter(([id]) => !(id === 'statistik' && P.showStat === false) && !(id === 'berita' && P.showBerita === false));
  if (c && c.role === 'c') items.splice(1, 0, ['profil', 'Profil Saya']);
  if (isAdmin()) items.push(['admin', 'Admin']);
  const nb = isAdmin() ? unreadN() + unreadMsgs() : 0;
  $('nav').innerHTML = items.map(([id, t]) =>
    `<button data-s="${id}" class="${id === curSec ? 'on' : ''}" onclick="go('${id}')">${t}${id === 'admin' && nb ? `<span class="nbadge" title="${nb} notifikasi/pesan belum dicek">${nb}</span>` : ''}</button>`).join('');
};
const _go = go;
go = function (id) {
  const P = pages();
  if ((id === 'statistik' && P.showStat === false) || (id === 'berita' && P.showBerita === false)) id = 'home';
  _go(id);
  if (id === 'berita') renderNews();
  if (id === 'tentang') { renderGalPub(); renderContact(); }
};

/* ---------- MULAI ---------- */
applyPages(); applySettings(); renderNews(); renderGalPub(); renderContact(); buildNav();