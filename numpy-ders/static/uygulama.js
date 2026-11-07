"use strict";

// ============================================================
// Yardımcılar
// ============================================================
const $ = (s, kok = document) => kok.querySelector(s);
const $$ = (s, kok = document) => [...kok.querySelectorAll(s)];
const kacis = (m) => String(m ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const karistir = (dizi) => {
  const a = [...dizi];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const yerelTarih = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const renkStil = (renk) => `--u:var(--${renk});--ug:var(--${renk}-g)`;
const slaytYazisi = (s) => (!s || !s.length ? "" : s[0] === s[s.length - 1] ? `Slayt ${s[0]}` : `Slayt ${s[0]}–${s[s.length - 1]}`);
// "yaz" sorularında virgül ve boşluk farklarını yok say (testler.py ile aynı kural)
const normalize = (m) => String(m).trim().replace(/,/g, " ").replace(/\s+/g, " ").replace(/\[ /g, "[").replace(/ \]/g, "]");

async function api(yol, govde) {
  const yanit = await fetch(yol, govde === undefined ? {} : {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(govde),
  });
  if (!yanit.ok) throw new Error(`Sunucu hatası (${yanit.status})`);
  return yanit.json();
}

// Basit Python renklendirme
function renklendir(kod) {
  const desen = /("[^"\n]*"|'[^'\n]*')|(#[^\n]*)|\b(import|as|for|in|print|True|False|None|and|or|not|if|else)\b|\b(\d+(?:\.\d+)?)\b|([A-Za-z_]\w*)(?=\()/g;
  let html = "", son = 0, m;
  while ((m = desen.exec(kod))) {
    html += kacis(kod.slice(son, m.index));
    const sinif = m[1] ? "k-metin" : m[2] ? "k-yorum" : m[3] ? "k-kelime" : m[4] ? "k-sayi" : "k-fonk";
    html += `<span class="${sinif}">${kacis(m[0])}</span>`;
    son = m.index + m[0].length;
  }
  return html + kacis(kod.slice(son));
}

const DENE_KODLARI = [];
function kodKutusu(kod, dene = true) {
  if (!dene) return `<pre class="kod-blok soru-kod">${renklendir(kod)}</pre>`;
  DENE_KODLARI.push(kod);
  return `<div class="kod-kutu"><div class="kod-kutu-ust"><span>Python</span>
    <span class="kod-kutu-btn"><button class="dbtn beyaz kucuk" data-nota-ekle="${DENE_KODLARI.length - 1}" title="Bu kodu slaytın notuna ekle">📝 Nota ekle</button>
    <button class="dbtn mavi kucuk" data-dene="${DENE_KODLARI.length - 1}">▶ Terminalde dene</button></span></div>
    <pre class="kod-blok">${renklendir(kod)}</pre></div>`;
}

// ============================================================
// Maskot: "Dizi" — bir NumPy dizisi hücresi
// ============================================================
function maskot(ruh = "normal", boy = 96) {
  const agiz = {
    normal: `<path d="M40 67 Q50 74 60 67" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    mutlu: `<path d="M36 63 Q50 82 64 63 Z" fill="#fff"/><path d="M42 72 Q50 77 58 72" fill="#ff7a8a"/>`,
    uzgun: `<path d="M40 72 Q50 64 60 72" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  }[ruh];
  const kas = ruh === "uzgun"
    ? `<path d="M28 36 L41 31 M72 36 L59 31" stroke="#0f6fa0" stroke-width="3" stroke-linecap="round"/>`
    : "";
  return `<span class="maskot" aria-hidden="true"><svg width="${boy}" height="${boy}" viewBox="0 0 100 100">
    <rect x="26" y="3" width="15" height="13" rx="3" fill="#ffc800"/><rect x="43" y="3" width="15" height="13" rx="3" fill="#58cc02"/><rect x="60" y="3" width="15" height="13" rx="3" fill="#ff4b4b"/>
    <rect x="12" y="18" width="76" height="72" rx="22" fill="#1cb0f6"/>
    <path d="M12 66 h76 v2 a22 22 0 0 1 -22 22 h-32 a22 22 0 0 1 -22 -22z" fill="#1899d6"/>
    <path d="M7 44 v22 M7 44 h5 M7 66 h5 M93 44 v22 M93 44 h-5 M93 66 h-5" stroke="#1899d6" stroke-width="4" stroke-linecap="round" fill="none"/>
    <circle cx="36" cy="46" r="11" fill="#fff"/><circle cx="64" cy="46" r="11" fill="#fff"/>
    <circle cx="38" cy="48" r="5.5" fill="#3c3c3c"/><circle cx="66" cy="48" r="5.5" fill="#3c3c3c"/>
    <circle cx="40" cy="46" r="1.8" fill="#fff"/><circle cx="68" cy="46" r="1.8" fill="#fff"/>
    <circle cx="25" cy="60" r="4" fill="#ff8fa3" opacity=".6"/><circle cx="75" cy="60" r="4" fill="#ff8fa3" opacity=".6"/>
    ${kas}${agiz}
  </svg></span>`;
}

// ============================================================
// Sesler (Web Audio ile üretilir)
// ============================================================
let sesBaglam = null;
function ses(tur) {
  if (!durum.ses) return;
  try {
    sesBaglam = sesBaglam || new (window.AudioContext || window.webkitAudioContext)();
    const notalar = {
      dogru: [[784, 0], [1175, 0.09]],
      yanlis: [[220, 0], [165, 0.13]],
      bitti: [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36]],
      tik: [[600, 0]],
    }[tur];
    for (const [frekans, t] of notalar) {
      const o = sesBaglam.createOscillator();
      const g = sesBaglam.createGain();
      o.type = tur === "yanlis" ? "triangle" : "sine";
      o.frequency.value = frekans;
      const bas = sesBaglam.currentTime + t;
      const sure = tur === "tik" ? 0.05 : 0.2;
      g.gain.setValueAtTime(0.0001, bas);
      g.gain.exponentialRampToValueAtTime(tur === "tik" ? 0.05 : 0.16, bas + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, bas + sure);
      o.connect(g).connect(sesBaglam.destination);
      o.start(bas);
      o.stop(bas + sure + 0.02);
    }
  } catch { /* ses desteklenmiyor olabilir */ }
}

// ============================================================
// Kalıcı durum (bu tarayıcıda saklanır)
// ============================================================
const ANAHTAR = "se422-ders-v1";
const durum = (() => {
  const varsayilan = { tamamlanan: {}, ogeler: {}, xp: 0, gunluk: {}, ses: true, sinavlar: [], gorulenSinav: [], kodlar: {},
    konular: {}, oturumlar: [], gorulenUretilen: [], tema: "sistem", sureler: {}, notAyar: { bosBolumler: "goster" } };
  try {
    return { ...varsayilan, ...JSON.parse(localStorage.getItem(ANAHTAR) || "{}") };
  } catch {
    return varsayilan;
  }
})();
const TEMALAR = {
  acik: { ad: "Açık", ikon: "☀️", sonraki: "koyu" },
  koyu: { ad: "Koyu", ikon: "🌙", sonraki: "sistem" },
  sistem: { ad: "Sistem", ikon: "💻", sonraki: "acik" },
};
if (!TEMALAR[durum.tema]) durum.tema = "sistem";
function temaUygula() {
  const kok = document.documentElement;
  if (durum.tema === "sistem") delete kok.dataset.theme;
  else kok.dataset.theme = durum.tema === "koyu" ? "dark" : "light";
}
function temaSec(tema) {
  durum.tema = tema;
  kaydet();
  temaUygula();
  menuCiz();
  sagPanelCiz();
}
function kaydet() {
  try { localStorage.setItem(ANAHTAR, JSON.stringify(durum)); } catch { /* depolama kapalı olabilir */ }
}

// ============================================================
// Müfredattan türetilen yapılar
// ============================================================
const OGELER = {};           // soru id → { adim, ders, unite }
const DERSLER = [];          // { ders, unite }
const DUGUMLER = [];         // öğrenme yolundaki sıralı düğümler
UNITELER.forEach((unite) => {
  unite.dersler.forEach((ders, k) => {
    ders.ogeIdleri = [];
    ders.adimlar.forEach((adim, i) => {
      if (adim.tip !== "ogren") {
        const id = `${ders.id}#${i}`;
        OGELER[id] = { adim, ders, unite };
        ders.ogeIdleri.push(id);
      }
    });
    DERSLER.push({ ders, unite });
    DUGUMLER.push({ tip: "ders", id: ders.id, ders, unite, sira: k + 1 });
  });
  DUGUMLER.push({ tip: "tekrar", id: `${unite.id}-tekrar`, unite });
});
DUGUMLER.push({ tip: "sinav", id: "final" });
const dersBul = (id) => DERSLER.find((d) => d.ders.id === id);

// Not bağlamı: her anlatım kartı bir bölüm + slayta bağlanır (static/notlar.js kullanır)
const ADIM_BAGLAM = new WeakMap();
UNITELER.forEach((u, ui) => u.dersler.forEach((d) => d.adimlar.forEach((a) => {
  if (a.tip === "ogren") {
    ADIM_BAGLAM.set(a, { unite: u.id, uniteNo: ui + 1, uniteBaslik: u.baslik, slayt: a.slayt?.[0] ?? 0, slaytYazisi: slaytYazisi(a.slayt), baslik: a.baslik });
  }
})));
const baglamAttr = (adim) => (ADIM_BAGLAM.has(adim) ? ` data-not-baglam="${kacis(JSON.stringify(ADIM_BAGLAM.get(adim)))}"` : "");
// Bir derste soru ekranındayken not paneli, dersin o ana kadarki son anlatım kartına bağlanır
function dersBaglami(dersId, adimSirasi) {
  const ders = dersBul(dersId)?.ders;
  if (!ders) return null;
  const kartlar = ders.adimlar.filter((a) => a.tip === "ogren");
  const once = ders.adimlar.slice(0, adimSirasi + 1).filter((a) => a.tip === "ogren");
  return ADIM_BAGLAM.get(once.at(-1) || kartlar[0]) || null;
}

const GUNLUK_HEDEF = 30;
const USTA_KUTU = 2;

function oge(id) { return durum.ogeler[id] || { kutu: 0, gorulme: 0, son: 0 }; }
function ogeGuncelle(id, dogru) {
  const o = { ...oge(id) };
  o.kutu = dogru ? Math.min(o.kutu + 1, 5) : 0;
  o.gorulme += 1;
  o.son = Date.now();
  durum.ogeler[id] = o;
  kaydet();
}
const zayifMi = (id) => { const o = oge(id); return o.gorulme > 0 && o.kutu === 0; };
const zayifIdler = () => Object.keys(OGELER).filter(zayifMi);
function ustalik(ders) {
  const ids = ders.ogeIdleri;
  return ids.reduce((t, id) => t + Math.min(oge(id).kutu, USTA_KUTU) / USTA_KUTU, 0) / Math.max(ids.length, 1);
}
const dersUstaMi = (ders) => ders.ogeIdleri.length > 0 && ders.ogeIdleri.every((id) => oge(id).kutu >= USTA_KUTU);
const aktifDugumIndeksi = () => DUGUMLER.findIndex((d) => d.tip !== "sinav" && !durum.tamamlanan[d.id]);
const sinavAcik = () => aktifDugumIndeksi() === -1 && zayifIdler().length === 0;
function seri() {
  let n = 0;
  const d = new Date();
  if (!(durum.gunluk[yerelTarih(d)] > 0)) d.setDate(d.getDate() - 1);
  while (durum.gunluk[yerelTarih(d)] > 0) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function xpEkle(miktar) {
  durum.xp += miktar;
  const g = yerelTarih();
  durum.gunluk[g] = (durum.gunluk[g] || 0) + miktar;
  kaydet();
}

let ALISTIRMALAR = {};

// ============================================================
// Süre: tahmin (static/sure.js), harcanan süre ve kişisel hız
// ============================================================
const sinavGectiMi = () => durum.sinavlar.some((s) => s.gecti);
function hizKatsayisi() {
  const ornekler = DERSLER.filter(({ ders }) => durum.tamamlanan[ders.id])
    .map(({ ders }) => ({ tahminDk: SURE.ders(ders), gercekSn: durum.sureler[ders.id] || 0 }));
  return SURE.hizKatsayisi(ornekler);
}
function kalanSure() {
  const katsayi = hizKatsayisi();
  return { ...SURE.kalan(UNITELER, durum.tamamlanan, sinavGectiMi(), katsayi), katsayi, kisisel: katsayi !== null };
}
const harcananSn = (u) => u.dersler.reduce((t, d) => t + (durum.sureler[d.id] || 0), 0) + (durum.sureler[`${u.id}-tekrar`] || 0);
// "Bu süre nasıl hesaplandı?": süre etiketinin üzerine gelince ya da tıklanınca açılan küçük ipucu
function sureIpucuMetni() {
  const { K, SORU, HIZ } = SURE;
  const k = kalanSure();
  return `<b>Bu süre nasıl hesaplandı?</b> Slayt başına ${K.slayt} dk, anlatım kartı ${K.kart} dk, kod örneği +${K.kodOrnegi} dk; `
    + `sorular türüne göre ${SORU.dogruyanlis}–${SORU.cikti} dk, kod alıştırması ${SORU.kod} dk; bölüm tekrarı ≈ ${SURE.yazi(K.tekrar)}. `
    + `Derste geçirdiğin aktif süre (sekme açık, son 60 sn'de etkinlik) kaydedilir. `
    + (k.kisisel ? `<b>Senin hızına göre</b> ayarlandı (×${k.katsayi.toFixed(2)}).`
      : `${HIZ.enAzDers} ders ölçülünce tahmin senin hızına göre ayarlanır.`);
}
// Bölüm başlığındaki süre etiketi: "⏱ ≈ 45 dk" ya da başladıysa "⏱ 20 / 45 dk" (harcanan / tahmini)
function sureEtiketiHtml(u) {
  const tahmin = SURE.unite(u).toplam * (hizKatsayisi() || 1);
  const sn = harcananSn(u);
  const harcananDk = Math.round(sn / 60);
  const t = SURE.yazi(tahmin);
  const yazi = harcananDk >= 1 ? `${harcananDk < 60 && /^\d+ dk$/.test(t) ? harcananDk : SURE.yazi(harcananDk)} / ${t}` : `≈ ${t}`;
  return `<span class="sure-ipucu" tabindex="0" role="button" data-sure-ipucu aria-label="Tahmini süre ${t}">⏱ ${yazi}`
    + `<span class="ipucu-balon" role="tooltip">${sureIpucuMetni()}</span></span>`;
}

// ============================================================
// Ders takibi (barem): konu (ders) bazında başarı, hatalar ve durum
// ============================================================
const dersAdi = (konu) => dersBul(konu)?.ders.baslik || konu || "";
const zayifSayisi = (konu) => dersBul(konu)?.ders.ogeIdleri.filter(zayifMi).length || 0;

function soruMetni(adim) {
  const ilk = (adim.kod || (Array.isArray(adim.satirlar) ? adim.satirlar.join("\n") : "")).split("\n")[0];
  const metin = (adim.soru || adim.ifade || "") + (ilk ? ` — ${ilk}` : "");
  return metin.length > 150 ? metin.slice(0, 147) + "…" : metin;
}

function konuKaydet(konu, dogru, adim, dogruCevap) {
  if (!konu) return;
  const k = durum.konular[konu] || (durum.konular[konu] = { d: 0, y: 0, son: [], hatalar: [] });
  if (dogru) k.d += 1;
  else {
    k.y += 1;
    k.hatalar.push({ s: soruMetni(adim), c: String(dogruCevap ?? "").slice(0, 200), t: Date.now() });
    k.hatalar = k.hatalar.slice(-5);
  }
  k.son = [...k.son, dogru].slice(-12);
  k.t = Date.now();
  kaydet();
}

// Son 12 ilk denemenin ağırlıklı başarısı (yeni cevaplar daha ağır), zayıf soru başına ceza
function konuPuani(konu) {
  const k = durum.konular[konu];
  if (!k || !k.son.length) return null;
  let pay = 0, payda = 0;
  k.son.forEach((b, i) => { pay += (i + 1) * (b ? 1 : 0); payda += i + 1; });
  return Math.max(0, Math.round((100 * pay) / payda) - zayifSayisi(konu) * 8);
}

const DURUMLAR = {
  iyi: { ad: "Güçlü", ikon: "✓", aralik: "85–100" },
  orta: { ad: "Orta", ikon: "!", aralik: "60–84" },
  zayif: { ad: "Zayıf", ikon: "✕", aralik: "0–59 veya zayıf soru var" },
  bos: { ad: "Başlanmadı", ikon: "○", aralik: "veri yok" },
};
function puanDurumu(puan, zayif = 0) {
  if (puan === null) return "bos";
  if (zayif > 0 || puan < 60) return "zayif";
  return puan < 85 ? "orta" : "iyi";
}
const konuDurumu = (konu) => puanDurumu(konuPuani(konu), zayifSayisi(konu));

function dikkatKonulari() {
  return DERSLER.map(({ ders }) => ({ konu: ders.id, puan: konuPuani(ders.id), zayif: zayifSayisi(ders.id) }))
    .filter((x) => x.puan !== null && ["zayif", "orta"].includes(puanDurumu(x.puan, x.zayif)))
    .sort((a, b) => a.puan - b.puan || b.zayif - a.zayif);
}

function zayifKapat(konu) {
  const id = dersBul(konu)?.ders.ogeIdleri.filter(zayifMi).sort((a, b) => oge(a).son - oge(b).son)[0];
  if (!id) return;
  durum.ogeler[id] = { ...oge(id), kutu: 1 };
  kaydet();
}

function oturumKaydet(tur, dogru, toplam) {
  const baslik = oturum?.hedefId ? (dersAdi(oturum.hedefId) || oturum.hedefId) : "";
  durum.oturumlar = [...durum.oturumlar, { t: Date.now(), tur, d: dogru, n: toplam, b: baslik }].slice(-60);
  kaydet();
}

function uniteOzeti(u) {
  const puanlar = u.dersler.map((d) => konuPuani(d.id)).filter((p) => p !== null);
  const puan = puanlar.length ? Math.round(puanlar.reduce((a, b) => a + b, 0) / puanlar.length) : null;
  const zayif = u.dersler.reduce((t, d) => t + zayifSayisi(d.id), 0);
  const tamam = u.dersler.filter((d) => durum.tamamlanan[d.id]).length;
  const d = u.dersler.reduce((t, x) => t + (durum.konular[x.id]?.d || 0), 0);
  const y = u.dersler.reduce((t, x) => t + (durum.konular[x.id]?.y || 0), 0);
  return { puan, zayif, tamam, d, y, durum: puanDurumu(puan, zayif) };
}

function durumRozeti(anahtar) {
  const s = DURUMLAR[anahtar];
  return `<span class="durum-rozet ${anahtar}"><span class="ikon">${s.ikon}</span>${s.ad}</span>`;
}

function baremCiz() {
  const tumKonular = Object.values(durum.konular);
  const d = tumKonular.reduce((t, k) => t + k.d, 0);
  const y = tumKonular.reduce((t, k) => t + k.y, 0);
  const genel = d + y ? Math.round((100 * d) / (d + y)) : null;
  const tamamDers = DERSLER.filter(({ ders }) => durum.tamamlanan[ders.id]).length;
  const enIyi = durum.sinavlar.length ? Math.max(...durum.sinavlar.map((s) => Math.round((100 * s.puan) / s.toplam))) : null;
  const dikkat = dikkatKonulari();

  const kutular = [
    ["Genel başarı", genel === null ? "—" : `%${genel}`, "ilk denemede doğru"],
    ["Cevaplanan", d + y, `${d} doğru · ${y} yanlış`],
    ["Tamamlanan ders", `${tamamDers}/${DERSLER.length}`, "öğrenme yolu"],
    ["Zayıf soru", zayifIdler().length, "pekiştirilmeli"],
    ["En iyi sınav", enIyi === null ? "—" : `%${enIyi}`, `${durum.sinavlar.length} deneme`],
  ].map(([b, v, a]) => `<div class="stat-kutu"><div class="stat-b">${b}</div><div class="stat-v">${v}</div><div class="stat-a">${a}</div></div>`).join("");

  const olcek = Object.entries(DURUMLAR).map(([k, s]) =>
    `<div class="olcek-ogesi">${durumRozeti(k)}<span>${s.aralik}</span></div>`).join("");

  const dikkatHtml = dikkat.length ? dikkat.slice(0, 8).map(({ konu, puan, zayif }) => {
    const { ders, unite } = dersBul(konu);
    const k = durum.konular[konu];
    const hatalar = k.hatalar.slice(-3).reverse().map((h) => `<li><span class="h-s">${kacis(h.s)}</span>
      ${h.c ? `<span class="h-c">Doğru cevap: <code>${kacis(h.c)}</code></span>` : ""}</li>`).join("");
    return `<div class="dikkat-kart" style="${renkStil(unite.renk)}">
      <div class="dikkat-ust"><div><div class="dk-bolum">${kacis(unite.baslik)} · ${slaytYazisi(ders.slayt)}</div>
        <h3>${kacis(ders.baslik)}</h3></div>${durumRozeti(puanDurumu(puan, zayif))}</div>
      <div class="barem-cubuk"><div class="${puanDurumu(puan, zayif)}" style="width:${puan}%"></div></div>
      <div class="dk-bilgi">Başarı <b>%${puan}</b> · ${k.d} doğru, ${k.y} yanlış${zayif ? ` · <b>${zayif} zayıf soru</b>` : ""}</div>
      ${hatalar ? `<div class="dk-hatalar"><div class="dk-baslik">Son hataların</div><ul>${hatalar}</ul></div>` : ""}
      <div class="btn-satir"><button class="dbtn beyaz kucuk" data-not-ac="${konu}">📖 Notu oku</button>
        <button class="dbtn mavi kucuk" data-calis="${konu}">💪 Benzer sorularla pekiştir</button></div></div>`;
  }).join("") : `<div class="kart"><p>${d + y ? "🎉 Şu an dikkat gerektiren bir konu yok. Böyle devam!" : "Henüz veri yok. İlk dersini tamamlayınca burada konu konu başarın görünecek."}</p></div>`;

  // Bölüm başarı grafiği: tek seri, yatay çubuk; durum rengi her zaman ikon + etiket + değerle birlikte
  const satirlar = UNITELER.map((u, ui) => {
    const o = uniteOzeti(u);
    const ipucu = `${u.baslik}: ${o.puan === null ? "henüz veri yok" : `başarı %${o.puan}`} · ${o.d} doğru, ${o.y} yanlış · ${o.tamam}/${u.dersler.length} ders · ${o.zayif} zayıf soru`;
    const dersSatirlari = u.dersler.map((ders) => {
      const p = konuPuani(ders.id);
      const k = durum.konular[ders.id];
      const z = zayifSayisi(ders.id);
      return `<tr><td>${kacis(ders.baslik)}<small>${slaytYazisi(ders.slayt)}</small></td>
        <td class="sayi">${p === null ? "—" : `%${p}`}</td><td class="sayi">${k ? `${k.d} / ${k.y}` : "—"}</td>
        <td class="sayi">${z || "—"}</td><td>${durumRozeti(puanDurumu(p, z))}</td>
        <td>${k ? `<button class="metin-btn" data-calis="${ders.id}">Pekiştir</button>` : ""}</td></tr>`;
    }).join("");
    return `<details class="bolum-satir">
      <summary data-ipucu="${kacis(ipucu)}">
        <span class="bs-ad">${ui + 1}. ${kacis(u.baslik)}</span>
        <span class="barem-cubuk"><span class="${o.durum}" style="width:${o.puan ?? 0}%"></span></span>
        <span class="bs-deger">${o.puan === null ? "—" : `%${o.puan}`}</span>
        ${durumRozeti(o.durum)}
      </summary>
      <table class="ders-tablo"><thead><tr><th>Ders</th><th class="sayi">Başarı</th><th class="sayi">D / Y</th><th class="sayi">Zayıf</th><th>Durum</th><th></th></tr></thead>
        <tbody>${dersSatirlari}</tbody></table></details>`;
  }).join("");

  const TUR = { ders: "Ders", tekrar: "Bölüm tekrarı", pekistir: "Pekiştirme", sinav: "Sınav" };
  const gecmis = durum.oturumlar.slice(-10).reverse().map((o) => {
    const yuzde = o.n ? Math.round((100 * o.d) / o.n) : 100;
    return `<div class="liste-satir"><div class="ad">${TUR[o.tur] || o.tur}${o.b ? ` · ${kacis(o.b)}` : ""}
      <small>${new Date(o.t).toLocaleString("tr-TR")}</small></div>
      <span class="sayi">${o.d}/${o.n}</span>${durumRozeti(puanDurumu(yuzde))}</div>`;
  }).join("");

  $("#sayfa").innerHTML = `<div class="sayfa genis-sayfa">
    <div class="kahraman">${maskot(dikkat.length ? "normal" : "mutlu", 110)}
      <div><h1 class="sayfa-baslik">Barem · Ders takibi</h1>
      <p class="sayfa-aciklama">Her ders için son 12 cevabının ağırlıklı başarısı (yeni cevaplar daha önemli). Zayıf soru her dersin puanından 8 puan düşer. Zorlandığın konular aşağıda; onları <b>benzer, yeni sorularla</b> pekiştir.</p></div></div>
    <div class="stat-izgara">${kutular}</div>
    <div class="olcek">${olcek}</div>
    <h2 class="bolum-baslik">⚠️ Dikkat etmen gereken konular</h2>
    <div class="dikkat-izgara">${dikkat.length ? dikkatHtml : ""}</div>${dikkat.length ? "" : dikkatHtml}
    <h2 class="bolum-baslik">Bölümlere göre başarı</h2>
    <p class="sayfa-aciklama">Bir bölüme tıkla, ders ders ayrıntısını gör.</p>
    <div class="bolum-grafik">${satirlar}</div>
    ${gecmis ? `<h2 class="bolum-baslik">Son oturumlar</h2><div class="kart">${gecmis}</div>` : ""}
  </div>`;
}

function dikkatBandi() {
  const dikkat = dikkatKonulari();
  if (!dikkat.length) return "";
  const adlar = dikkat.slice(0, 3).map((x) => `<b>${kacis(dersAdi(x.konu))}</b>`).join(", ");
  return `<div class="dikkat-bandi">${maskot("normal", 56)}
    <div><div class="db-baslik">⚠️ Zorlandığın konular var</div><div>${adlar}${dikkat.length > 3 ? ` ve ${dikkat.length - 3} konu daha` : ""}</div></div>
    <div class="btn-satir"><button class="dbtn mavi kucuk" data-pekistir>💪 Pekiştir</button><button class="dbtn beyaz kucuk" data-git="barem">📊 Barem</button></div></div>`;
}

function notModal(konu) {
  const bilgi = dersBul(konu);
  if (!bilgi) return;
  const { ders, unite } = bilgi;
  const kartlar = ders.adimlar.filter((a) => a.tip === "ogren").map((a) => `<div class="kart not-kart">${anlatimHtml(a, unite.renk)}</div>`).join("");
  const kap = document.createElement("div");
  kap.className = "modal";
  kap.innerHTML = `<div class="modal-ic" style="${renkStil(unite.renk)}">
    <div class="modal-ust"><div><div class="dk-bolum">${kacis(unite.baslik)} · ${slaytYazisi(ders.slayt)}</div><h2>${kacis(ders.baslik)}</h2></div>
    <button class="kapat" aria-label="Kapat">✕</button></div>${kartlar}</div>`;
  document.body.appendChild(kap);
  const kapat = () => kap.remove();
  kap.addEventListener("click", (e) => { if (e.target === kap || e.target.closest(".kapat")) kapat(); });
  kap.addEventListener("keydown", (e) => { if (e.key === "Escape") kapat(); });
  kap.querySelector(".kapat").focus();
}

// Grafik ipucu: data-ipucu taşıyan öğelerin üzerine gelince
const ipucuKutusu = document.createElement("div");
ipucuKutusu.className = "ipucu-kutusu";
document.body.appendChild(ipucuKutusu);
document.addEventListener("mousemove", (e) => {
  const hedef = e.target.closest?.("[data-ipucu]");
  if (!hedef) { ipucuKutusu.style.display = "none"; return; }
  ipucuKutusu.textContent = hedef.dataset.ipucu;
  ipucuKutusu.style.display = "block";
  ipucuKutusu.style.left = Math.min(e.clientX + 14, innerWidth - ipucuKutusu.offsetWidth - 8) + "px";
  ipucuKutusu.style.top = e.clientY + 16 + "px";
});

// ============================================================
// Sayfa iskeleti: menü, sağ panel
// ============================================================
let sayfa = ["ogren", "pekistir", "barem", "notlar", "claude", "sinav"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "ogren";
let acikDugum = null;

function menuCiz() {
  const zayif = zayifIdler().length;
  const ogeler = [
    { id: "ogren", ikon: "🏠", yazi: "Öğren" },
    { id: "pekistir", ikon: "💪", yazi: "Pekiştir", rozet: zayif || "" },
    { id: "barem", ikon: "📊", yazi: "Barem" },
    { id: "notlar", ikon: "📖", yazi: "Notlar" },
    { id: "claude", ikon: "✳️", yazi: "Claude'un notları" },
    { id: "sinav", ikon: "🏆", yazi: "Sınav" },
    { id: "terminal", ikon: "💻", yazi: "Terminal" },
  ];
  const html = ogeler.map((o) => `<button class="menu-ogesi ${sayfa === o.id ? "aktif" : ""}" data-git="${o.id}">
      <span class="ikon">${o.ikon}</span><span class="yazi">${o.yazi}</span>${o.rozet ? `<span class="menu-rozet">${o.rozet}</span>` : ""}</button>`).join("");
  $("#yan-menu").innerHTML = `<div class="marka">${maskot("normal", 44)}<span class="marka-yazi">se422</span></div>${html}
    <button class="menu-ogesi" data-tema style="margin-top:auto" title="Tema: Açık → Koyu → Sistem"><span class="ikon">${TEMALAR[durum.tema].ikon}</span><span class="yazi">Tema: ${TEMALAR[durum.tema].ad}</span></button>
    <button class="menu-ogesi" data-ses><span class="ikon">${durum.ses ? "🔊" : "🔇"}</span><span class="yazi">Ses ${durum.ses ? "açık" : "kapalı"}</span></button>`;
  $("#alt-menu").innerHTML = html;
}

function istatistikHtml() {
  const s = seri(), z = zayifIdler().length;
  return `<div class="istatistik-satir">
    <span class="istatistik seri ${s ? "" : "sifir"}" title="Günlük seri"><span class="ikon">🔥</span>${s}</span>
    <span class="istatistik xp ${durum.xp ? "" : "sifir"}" title="Toplam XP"><span class="ikon">⚡</span>${durum.xp}</span>
    <span class="istatistik zayif ${z ? "" : "sifir"}" title="Pekiştirilmesi gereken soru"><span class="ikon">💪</span>${z}</span>
  </div>`;
}

function sagPanelCiz() {
  const bugunXp = durum.gunluk[yerelTarih()] || 0;
  const k = kalanSure();
  const uniteler = UNITELER.map((u) => {
    const tamam = u.dersler.filter((d) => durum.tamamlanan[d.id]).length;
    return `<div class="unite-ilerleme-satir" style="${renkStil(u.renk)}"><span>${kacis(u.baslik)}</span>
      <div class="cubuk"><div style="width:${(tamam / u.dersler.length) * 100}%"></div></div>
      ${k.bolumler[u.id] < 0.5 ? `<small class="sure-kucuk">✓</small>` : sureEtiketiHtml(u)}</div>`;
  }).join("");
  $("#sag-panel").innerHTML = `
    ${istatistikHtml()}
    <div class="kart"><h3>Günlük hedef</h3>
      <div class="hedef-satir"><div class="cubuk sari"><div style="width:${Math.min(bugunXp / GUNLUK_HEDEF, 1) * 100}%"></div></div>
      <span>${bugunXp}/${GUNLUK_HEDEF} XP</span></div></div>
    <div class="kart"><h3>Bölüm ilerlemesi</h3>
      <p class="kalan-sure">${k.toplam < 0.5 ? "🎉 Platformu bitirdin" : `Toplam kalan: <b>≈ ${SURE.yazi(k.toplam)}</b>${k.kisisel ? " · senin hızına göre" : ""}`}</p>
      <div class="unite-ilerleme">${uniteler}</div></div>
    <div class="kart"><h3>SE 422 · Introduction to Data Science</h3>
      <p>${UNITELER.length} slayt destesi · ${UNITELER.reduce((t, u) => t + u.slaytSayisi, 0)} slayt</p>
      <p>${DERSLER.length} ders · ${Object.keys(OGELER).length} soru · ${Object.keys(OGELER).filter((id) => OGELER[id].adim.tip === "kod").length} kod alıştırması + final sınavı</p>
      <button class="dbtn beyaz genis" data-git="terminal">💻 Terminali aç</button></div>`;
  $("#mobil-ust").innerHTML = `${istatistikHtml()}<button class="dbtn beyaz kucuk" data-tema title="Tema: ${TEMALAR[durum.tema].ad}">${TEMALAR[durum.tema].ikon}</button><button class="dbtn beyaz kucuk" data-git="terminal">&gt;_</button>`;
}

function yenile() {
  menuCiz();
  sagPanelCiz();
  ({ ogren: yolCiz, pekistir: pekistirCiz, barem: baremCiz, notlar: notlarCiz, claude: claudeCiz, sinav: sinavSayfasiCiz })[sayfa]();
}

function git(hedef) {
  if (hedef === "terminal") { terminaliAc(); return; }
  sayfa = hedef;
  acikDugum = null;
  history.replaceState(null, "", "#" + hedef);
  window.scrollTo(0, 0);
  yenile();
}

// ============================================================
// Öğrenme yolu
// ============================================================
const KAYMA = [0, -56, -84, -56, 0, 56, 84, 56];

function yolCiz() {
  const aktif = aktifDugumIndeksi();
  const k = kalanSure();
  let html = "";
  let sira = 0;
  UNITELER.forEach((u, ui) => {
    const bitti = k.bolumler[u.id] < 0.5;
    html += `<section style="${renkStil(u.renk)}">
      <div class="unite-baslik">
        <div><div class="ust-yazi">Bölüm ${ui + 1} · ${u.slaytSayisi} slayt ${bitti ? `<span class="sure-ipucu">✓ tamamlandı</span>` : sureEtiketiHtml(u)}</div>
          <h2>${kacis(u.baslik)}</h2><div class="alt-yazi">${kacis(u.altBaslik)}</div>
          ${OZETLER[u.id] ? `<button class="claude-baglanti" data-claude="${u.id}">Bu bölümün Claude özeti →</button>` : ""}</div>
        <div class="unite-btnlar"><button class="dbtn" data-notlar="${u.id}">📖 Notlar</button>${uniteBelgeBtnlari(u)}</div>
      </div><div class="dugumler">`;
    sira = 0;
    DUGUMLER.forEach((d, i) => {
      if (d.unite !== u) return;
      html += dugumHtml(d, i, aktif, KAYMA[sira++ % KAYMA.length]);
    });
    html += `</div></section>`;
  });
  const sinavIndeksi = DUGUMLER.length - 1;
  html += `<section style="${renkStil("altin")}"><div class="dugumler">${dugumHtml(DUGUMLER[sinavIndeksi], sinavIndeksi, aktif, 0)}</div></section>`;
  // Tam kitapçık bandı yalnızca tüm bölümler bitince (öncesinde not PDF'leri Notlarım panelinde ve Notlar sayfasında)
  const kitapcik = aktif === -1
    ? `<div class="kitapcik-bandi tam"><span class="ikon">📘</span><div><b>Tüm bölümleri tamamladın! Notlarını kitapçık olarak indir.</b>
        <div class="sure-alt">Kapak, içindekiler, bölüm bölüm notların ve sayfa numaralarıyla tek PDF.</div></div>
        <button class="dbtn yesil" data-kitapcik>📘 Tüm notlarım – kitapçık</button></div>`
    : "";
  $("#sayfa").innerHTML = `<div class="yol">${kitapcik}${dikkatBandi()}${html}</div>`;
  const aktifEl = $(".dugum.aktif");
  if (aktifEl && !yolCiz.kaydirildi) {
    yolCiz.kaydirildi = true;
    aktifEl.scrollIntoView({ block: "center" });
  }
}

function dugumHtml(d, i, aktif, kayma) {
  const tamam = d.tip === "sinav" ? durum.sinavlar.some((s) => s.gecti) : !!durum.tamamlanan[d.id];
  const buAktif = d.tip === "sinav" ? aktif === -1 && !tamam : i === aktif;
  const kilitli = d.tip === "sinav" ? aktif !== -1 : aktif !== -1 && i > aktif;
  const usta = d.tip === "ders" && tamam && dersUstaMi(d.ders);
  let ikon = "⭐";
  if (d.tip === "tekrar") ikon = "🏆";
  if (d.tip === "sinav") ikon = "🎓";
  if (kilitli) ikon = d.tip === "ders" ? "🔒" : ikon;
  else if (usta) ikon = "👑";
  else if (tamam && d.tip === "ders") ikon = "✓";
  const etiket = d.tip === "ders" ? d.ders.baslik : d.tip === "tekrar" ? "Bölüm tekrarı" : "Final sınavı";
  const sinif = ["dugum", kilitli ? "kilitli" : "", usta ? "usta" : "", buAktif ? "aktif" : "", d.tip !== "ders" ? "buyuk" : ""].join(" ");
  // Açılır kart, kaydırılmış düğüm kabının dışında ve sayfa akışında durur; alttaki düğümleri aşağı iter, üstlerine binmez
  return `<div class="dugum-kap" style="transform:translateX(${kayma}px)">
    ${buAktif && acikDugum !== d.id ? `<div class="basla-balon">${tamam ? "Tekrar" : d.tip === "sinav" ? "Sınav" : "Başla"}</div>` : ""}
    <button class="${sinif}" data-dugum="${d.id}" aria-label="${kacis(etiket)}">${ikon}</button>
    <div class="dugum-etiket">${kacis(etiket)}</div>
  </div>
  ${acikDugum === d.id ? `<div class="acilir-kap" style="--ok-x:${kayma}px">${acilirHtml(d, tamam, kilitli)}</div>` : ""}`;
}

function acilirHtml(d, tamam, kilitli) {
  if (kilitli) {
    const mesaj = d.tip === "sinav" ? "Tüm dersleri ve bölüm tekrarlarını tamamlayınca açılır." : "Önce yukarıdaki dersleri tamamla.";
    return `<div class="acilir kilitli-acilir"><h3>${d.tip === "ders" ? kacis(d.ders.baslik) : d.tip === "tekrar" ? "Bölüm tekrarı" : "Final sınavı"}</h3><p>${mesaj}</p>
      <button class="dbtn gri" disabled>Kilitli</button></div>`;
  }
  if (d.tip === "ders") {
    const yuzde = Math.round(ustalik(d.ders) * 100);
    return `<div class="acilir"><h3>${kacis(d.ders.baslik)}</h3>
      <p>Ders ${d.sira}/${d.unite.dersler.length} · ${slaytYazisi(d.ders.slayt)}</p>
      ${tamam ? `<div class="cubuk"><div style="width:${yuzde}%"></div></div><p>Ustalık: %${yuzde}${yuzde === 100 ? " 👑" : ""}${konuPuani(d.id) !== null ? ` · Başarı %${konuPuani(d.id)} (${DURUMLAR[konuDurumu(d.id)].ad})` : ""}</p>` : ""}
      <button class="dbtn" data-basla="${d.id}">${tamam ? "Tekrar et +5 XP" : "Başla +10 XP"}</button></div>`;
  }
  if (d.tip === "tekrar") {
    return `<div class="acilir"><h3>Bölüm tekrarı</h3><p>"${kacis(d.unite.baslik)}" bölümündeki derslerden karışık sorular. Zayıf olduğun sorular önce gelir.</p>
      <button class="dbtn" data-tekrar="${d.unite.id}">${tamam ? "Tekrar et +10 XP" : "Başla +10 XP"}</button></div>`;
  }
  return `<div class="acilir"><h3>Final sınavı</h3><p>Tüm bölümlerden karışık, her seferinde yeni 25 soru.</p>
    <button class="dbtn" data-git="sinav">Sınava git</button></div>`;
}

// ============================================================
// Pekiştir, Notlar, Sınav sayfaları
// ============================================================
function pekistirCiz() {
  const zayif = zayifIdler().length;
  const tamamlanan = DERSLER.filter(({ ders }) => durum.tamamlanan[ders.id]);
  const dersListesi = tamamlanan.map(({ ders, unite }) => {
    const yuzde = Math.round(ustalik(ders) * 100);
    const z = ders.ogeIdleri.filter(zayifMi).length;
    return `<div class="liste-satir" style="${renkStil(dersUstaMi(ders) ? "altin" : unite.renk)}">
      <div class="ad">${dersUstaMi(ders) ? "👑 " : ""}${kacis(ders.baslik)}<small>${z ? `${z} zayıf soru · ` : ""}Ustalık %${yuzde}</small></div>
      <div class="cubuk"><div style="width:${yuzde}%;background:var(--u)"></div></div>
      <button class="dbtn beyaz kucuk" data-calis="${ders.id}">Çalış</button></div>`;
  }).join("");

  $("#sayfa").innerHTML = `<div class="sayfa">
    <div class="kahraman">${maskot(zayif ? "normal" : "mutlu", 120)}
      <div><h1 class="sayfa-baslik">Pekiştir</h1>
      <p class="sayfa-aciklama">İlk denemede bilemediğin her soru <b>zayıf</b> olarak işaretlenir. Burada aynı soruyu ezberletmek yerine, o dersten <b>yeni üretilmiş benzer sorular</b> gelir: farklı sayılar, farklı kodlar, farklı soru tarzları. Benzer bir soruyu ilk denemede bildikçe zayıf sorular kapanır.</p></div></div>
    <div class="kart" style="margin-bottom:20px">
      ${!tamamlanan.length
        ? `<h3>Henüz pekiştirilecek bir şey yok</h3><p>Önce Öğren sekmesinden ilk dersini tamamla.</p>`
        : zayif
          ? `<h3>💪 ${zayif} zayıf soru var</h3><p>Final sınavı, zayıf sorun kalmayınca açılır. Hadi bunları sağlamlaştıralım!</p>
             <button class="dbtn yesil genis" data-pekistir>Pekiştirmeye başla</button>`
          : `<h3>🎉 Zayıf sorun yok!</h3><p>Ustalık seviyeni artırmak için yine de alıştırma yapabilirsin.</p>
             <button class="dbtn yesil genis" data-pekistir>Alıştırma yap</button>`}
    </div>
    ${tamamlanan.length ? `<div class="kart"><h3>Derslere göre ustalık</h3>
      <p>Bir soruyu farklı oturumlarda ilk denemede doğru bildikçe seviyesi artar. Bir dersin bütün sorularını en az iki kez bildiğinde ders altın olur 👑.</p>
      ${dersListesi}</div>` : ""}
  </div>`;
}

// Kullanıcının kendi notlarının PDF'i (Claude'un özetleri yalnızca "Claude'un notları" sekmesinde)
function uniteBelgeBtnlari(u, acik = false) {
  return `<button class="${acik ? "dbtn beyaz kucuk" : "dbtn"}" data-not-pdf="${u.id}" title="Bu bölümdeki kendi notlarını PDF olarak indir">📄 Notlarım (PDF)</button>`;
}

function anlatimHtml(adim, dersRenk) {
  const cizim = adim.cizim ? CIZIM[adim.cizim] : "";
  return `<div class="anlatim" style="${dersRenk ? renkStil(dersRenk) : ""}"${baglamAttr(adim)}>
    <div class="anlatim-ust"><span class="etiket">${slaytYazisi(adim.slayt)}</span><button class="not-al-btn" data-not-al title="Bu slayta not al">📝 Not al</button></div>
    <h2>${kacis(adim.baslik)}</h2>${adim.metin}${cizim}${adim.kod ? kodKutusu(adim.kod) : ""}</div>`;
}

function notlarCiz() {
  const html = UNITELER.map((u, ui) => `
    <section class="not-unite" id="not-${u.id}" style="${renkStil(u.renk)}">
      <h2><span class="renk"></span>Bölüm ${ui + 1}: ${kacis(u.baslik)}</h2><p class="sayfa-aciklama">${kacis(u.kaynak)} · ${u.slaytSayisi} slayt · ${kacis(u.altBaslik)}</p>
      <div class="btn-satir not-unite-btn">${uniteBelgeBtnlari(u, true)}</div>
      ${u.dersler.map((d) => `<div class="not-ders"><h3>${kacis(d.baslik)}</h3>
        ${d.adimlar.filter((a) => a.tip === "ogren").map((a) => `<div class="kart not-kart">${anlatimHtml(a, u.renk)}</div>`).join("")}
      </div>`).join("")}
    </section>`).join("");
  $("#sayfa").innerHTML = `<div class="sayfa"><h1 class="sayfa-baslik">Ders notları</h1>
    <p class="sayfa-aciklama">Derslerdeki tüm anlatım kartları, slayt sırasıyla. Takıldığın yere dönüp tekrar okuyabilirsin. Kartlardaki "📝 Not al" ile kendi notlarını ekle.</p>
    <div class="btn-satir not-unite-btn"><button class="dbtn beyaz kucuk" data-not-panel>📝 Notlarım</button><button class="dbtn beyaz kucuk" data-kitapcik>📘 Notlarım – kitapçık (PDF)</button></div>${html}</div>`;
  if (notlarCiz.hedef) {
    $(`#not-${notlarCiz.hedef}`)?.scrollIntoView();
    notlarCiz.hedef = null;
  }
}

// ============================================================
// Claude'un notları: yapay zekâ ile üretilmiş bölüm özetleri (ozetler/*.md, API: /api/ozetler)
// ============================================================
let OZETLER = {};          // unite id → { ad, no, baslik, pdf }
let OZET_LISTESI = null;   // /api/ozetler yanıtı
const OZET_ONBELLEK = {};  // ad → markdown
let claudeSecili = null;   // seçili bölümün unite id'si

function claudeCiz() {
  const liste = OZET_LISTESI?.ozetler || [];
  if (!claudeSecili || !OZETLER[claudeSecili]) claudeSecili = liste[0]?.unite || null;
  const secili = OZETLER[claudeSecili];
  const bolumler = liste.map((o) => {
    const u = UNITELER.find((x) => x.id === o.unite);
    return `<div class="claude-bolum ${o.unite === claudeSecili ? "aktif" : ""}" style="${renkStil(u?.renk || "mavi")}">
      <button class="claude-sec" data-claude="${o.unite}" aria-current="${o.unite === claudeSecili}"><span class="no">${o.no}</span>${kacis(o.baslik)}</button>
      ${o.pdf ? `<a class="metin-btn" href="${o.pdf}" download title="${kacis(o.baslik)} özetini PDF olarak indir">PDF indir</a>` : ""}</div>`;
  }).join("");
  $("#sayfa").innerHTML = `<div class="sayfa genis-sayfa claude-sayfa">
    <div class="claude-ust"><div><h1 class="sayfa-baslik">✳️ Claude'un notları</h1>
      <p class="claude-uyari">⚠️ Bu notlar slaytlardan yapay zekâ ile üretildi. Sınav öncesi slaytla karşılaştır.</p></div>
      ${OZET_LISTESI?.birlesik ? `<a class="dbtn beyaz kucuk" href="${OZET_LISTESI.birlesik}" download>📚 Tüm özetler (tek PDF)</a>` : ""}</div>
    ${!OZET_LISTESI ? `<div class="kart"><p>Özetler yükleniyor…</p></div>` : !liste.length
      ? `<div class="kart"><p>Henüz özet yok. Proje klasöründe <code>python3 ozet_pdf_uret.py</code> çalıştır.</p></div>`
      : `<div class="claude-izgara">
          <nav class="claude-liste" aria-label="Bölümler">${bolumler}</nav>
          <article class="kart claude-icerik md" id="claude-icerik" style="${renkStil(UNITELER.find((x) => x.id === claudeSecili)?.renk || "mavi")}">
            ${OZET_ONBELLEK[secili.ad] !== undefined ? mdHtml(OZET_ONBELLEK[secili.ad], { baslikKaydir: 0 }) : "<p>Özet yükleniyor…</p>"}</article>
        </div>`}
  </div>`;
  if (secili && OZET_ONBELLEK[secili.ad] === undefined) {
    api(`/api/ozetler/${encodeURIComponent(secili.ad)}`)
      .then((r) => { OZET_ONBELLEK[secili.ad] = r.md || ""; if (sayfa === "claude") claudeCiz(); })
      .catch(() => { const el = $("#claude-icerik"); if (el) el.innerHTML = "<p>Özet yüklenemedi. Sunucunun çalıştığından emin ol.</p>"; });
  }
}

function sinavSayfasiCiz() {
  const toplam = DUGUMLER.length - 1;
  const biten = DUGUMLER.filter((d) => d.tip !== "sinav" && durum.tamamlanan[d.id]).length;
  const zayif = zayifIdler().length;
  const acik = sinavAcik();
  const gecmis = durum.sinavlar.slice().reverse().map((s) => `
    <div class="liste-satir"><div class="ad">${s.gecti ? "✅" : "❌"} ${s.puan}/${s.toplam} doğru<small>${new Date(s.tarih).toLocaleString("tr-TR")}</small></div>
    <span style="font-weight:800;color:var(--${s.gecti ? "yesil" : "kirmizi"})">%${Math.round((s.puan / s.toplam) * 100)}</span></div>`).join("");
  $("#sayfa").innerHTML = `<div class="sayfa">
    <div class="kahraman">${maskot(acik ? "mutlu" : "normal", 120)}
      <div><h1 class="sayfa-baslik">Final sınavı 🎓</h1>
      <p class="sayfa-aciklama">${UNITELER.length} slayt destesinin hepsinden karışık 25 soru. Sorular her seferinde gerçek Python/NumPy/pandas ile <b>yeniden üretilir</b>, daha önce gördüklerin tekrar gelmez. Sınav sırasında doğru/yanlış gösterilmez. Geçmek için <b>%80</b> gerekir.</p></div></div>
    <div class="kart" style="margin-bottom:20px"><h3>Sınava girme koşulları</h3>
      <div class="kosul ${biten === toplam ? "tamam" : ""}"><span class="i">${biten === toplam ? "✓" : ""}</span>Tüm dersler ve bölüm tekrarları bitti (${biten}/${toplam})</div>
      <div class="kosul ${zayif === 0 && biten > 0 ? "tamam" : ""}"><span class="i">${zayif === 0 && biten > 0 ? "✓" : ""}</span>Zayıf soru kalmadı ${zayif ? `(${zayif} soru pekiştirilmeli)` : ""}</div>
      <div style="margin-top:14px">${acik
        ? `<button class="dbtn yesil genis" data-sinav-basla>Sınava başla</button>`
        : zayif && biten === toplam
          ? `<button class="dbtn mavi genis" data-git="pekistir">Önce pekiştir (${zayif})</button>`
          : `<button class="dbtn gri genis" disabled>Kilitli</button>`}</div>
    </div>
    ${gecmis ? `<div class="kart"><h3>Önceki sınavlar</h3>${gecmis}</div>` : ""}
  </div>`;
}

// ============================================================
// Oturum (ders / tekrar / pekiştirme / sınav) motoru
// ============================================================
let oturum = null;

// Aktif süre: oturum açık, sekme görünür ve son 60 sn'de etkinlik varsa 5 sn'lik dilimlerle sayılır
const BOSTA_SINIRI = 60000;
let sonEtkinlik = Date.now();
let sonTik = Date.now();
["keydown", "pointerdown", "pointermove", "wheel", "touchstart", "scroll"].forEach((olay) =>
  addEventListener(olay, () => { sonEtkinlik = Date.now(); }, { passive: true, capture: true }));
function sureAnahtari(o) {
  if (o.tur === "sinav") return "final";
  if (o.tur === "pekistir") return "pekistir";
  return o.hedefId;
}
function sureTik() {
  const simdi = Date.now();
  const gecen = Math.min(simdi - sonTik, 5000);
  sonTik = simdi;
  if (!oturum || oturum.bitti || document.visibilityState !== "visible" || simdi - sonEtkinlik > BOSTA_SINIRI) return;
  const anahtar = sureAnahtari(oturum);
  if (!anahtar) return;
  durum.sureler[anahtar] = Math.round(((durum.sureler[anahtar] || 0) + gecen / 1000) * 10) / 10;
  kaydet();
}
setInterval(sureTik, 5000);
document.addEventListener("visibilitychange", () => { sonTik = Date.now(); });
const OVGULER = ["Harika!", "Mükemmel!", "Süper!", "Doğru!", "Çok iyi!", "Aferin!"];

// ---------- Benzer (varyant) soru üretimi: aynı dersten, sunucuda yeni üretilen sorular ----------
async function varyantGetir(konular, adet) {
  if (!konular.length) return [];
  try {
    const yanit = await api("/api/varyant", { konular, adet, gorulen: durum.gorulenUretilen.slice(-3000) });
    if (yanit.hata || !yanit.sorular) return [];
    durum.gorulenUretilen = [...durum.gorulenUretilen, ...yanit.sorular.map((s) => s.parmak)].slice(-4000);
    kaydet();
    return yanit.sorular;
  } catch {
    return [];
  }
}
const varyantGirisi = (s, ek = {}) => ({ adim: s, id: "v:" + s.parmak, konu: s.konu, ...ek });

// Oturuma yedek benzer sorular ekler: yanlış cevapta aynı soru yerine bunlardan biri gelir
async function yedekDoldur(konular, adet = 4) {
  const yeni = await varyantGetir(konular, adet);
  if (!oturum) return;
  for (const s of yeni) (oturum.yedekler[s.konu] = oturum.yedekler[s.konu] || []).push(s);
}

function dersBaslat(dersId) {
  const { ders, unite } = dersBul(dersId);
  oturumBaslat({
    tur: "ders", hedefId: ders.id, renk: unite.renk,
    adimlar: ders.adimlar.map((adim, i) => ({ adim, id: `${ders.id}#${i}`, konu: ders.id, unite })),
  });
  // Dersin sonuna iki farklı tarzda yeni soru ekle; kalanlar yanlış cevaplarda "benzer soru" olarak kullanılır
  const bu = oturum;
  varyantGetir([ders.id], 8).then((sorular) => {
    if (oturum !== bu || bu.bitti) return;
    const tarzlar = sorular.filter((s) => ["coklu", "hatabul", "tamamla", "sirala"].includes(s.tip));
    const ekler = (tarzlar.length >= 2 ? tarzlar : sorular).slice(0, 2);
    for (const s of ekler) bu.kuyruk.push(varyantGirisi(s, { yeniTarz: true }));
    bu.toplam += ekler.length;
    for (const s of sorular.filter((x) => !ekler.includes(x))) (bu.yedekler[s.konu] = bu.yedekler[s.konu] || []).push(s);
    cubukGuncelle();
  });
}

function onceZayiflar(idler, adet) {
  // Zayıflar önce, sonra seviyesi düşük ve uzun süredir görülmeyenler
  return idler
    .map((id) => ({ id, o: oge(id), r: Math.random() }))
    .sort((a, b) => (zayifMi(b.id) - zayifMi(a.id)) || (a.o.kutu - b.o.kutu) || (a.o.son - b.o.son) || (a.r - b.r))
    .slice(0, adet)
    .map((x) => x.id);
}

async function uniteTekrariBaslat(uniteId) {
  const unite = UNITELER.find((u) => u.id === uniteId);
  const idler = unite.dersler.flatMap((d) => d.ogeIdleri).filter((id) => OGELER[id].adim.tip !== "kod");
  // Zayıf konular önce gelecek şekilde, bölümün derslerinden benzer sorular + birkaç derste görülmüş soru
  const konular = unite.dersler.map((d) => d.id).sort((a, b) => (konuPuani(a) ?? 100) - (konuPuani(b) ?? 100));
  const varyantlar = await varyantGetir(konular, 8);
  const statik = onceZayiflar(idler, 12 - varyantlar.length).map((id) => ({ adim: OGELER[id].adim, id, konu: OGELER[id].ders.id }));
  oturumBaslat({
    tur: "tekrar", hedefId: `${unite.id}-tekrar`, renk: unite.renk,
    adimlar: karistir([...statik, ...varyantlar.map((s) => varyantGirisi(s))]),
  });
  yedekDoldur(konular.slice(0, 4), 6);
}

// Pekiştirme: aynı soruları değil, zorlanılan derslerden yeni üretilmiş BENZER soruları sorar
async function pekistirBaslat(dersIdler) {
  let konular = dersIdler && dersIdler.length ? dersIdler : dikkatKonulari().map((k) => k.konu).slice(0, 6);
  if (!konular.length) {
    konular = DERSLER.filter(({ ders }) => durum.tamamlanan[ders.id]).map(({ ders }) => ders.id)
      .sort((a, b) => (konuPuani(a) ?? 100) - (konuPuani(b) ?? 100)).slice(0, 6);
  }
  if (!konular.length) { alert("Pekiştirilecek konu yok. Önce bir ders tamamla."); return; }
  // Zayıf soru sayısı fazla olan derse daha çok soru düşsün
  const agirlikli = konular.flatMap((k) => Array(Math.min(3, 1 + zayifSayisi(k))).fill(k));
  const sorular = await varyantGetir(agirlikli, 12);
  let adimlar = sorular.map((s) => varyantGirisi(s));
  if (!adimlar.length) {
    // Sunucuya ulaşılamazsa: dersteki sorulardan zayıf olanlar
    const idler = konular.flatMap((k) => dersBul(k).ders.ogeIdleri).filter((id) => OGELER[id].adim.tip !== "kod" || zayifMi(id));
    adimlar = karistir(onceZayiflar(idler, 12)).map((id) => ({ adim: OGELER[id].adim, id, konu: OGELER[id].ders.id }));
  }
  oturumBaslat({ tur: "pekistir", renk: "mavi", adimlar: karistir(adimlar), konular });
  yedekDoldur(konular, 8);
}

async function sinavBaslat() {
  let yanit;
  try {
    yanit = await api("/api/sinav", { gorulen: durum.gorulenSinav });
  } catch (e) {
    alert("Sınav oluşturulamadı: " + e.message);
    return;
  }
  if (yanit.hata) { alert(yanit.hata); return; }
  durum.gorulenSinav = [...durum.gorulenSinav, ...yanit.sorular.map((s) => s.parmak)].slice(-4000);
  kaydet();
  oturumBaslat({ tur: "sinav", renk: "altin", adimlar: yanit.sorular.map((s) => ({ adim: s, id: s.parmak, konu: s.konu })) });
}

function oturumBaslat({ tur, hedefId, renk, adimlar, konular }) {
  oturum = {
    tur, hedefId, renk, konular, kuyruk: adimlar.slice(), toplam: adimlar.length, bitenler: new Set(), ilk: new Map(),
    seri: 0, baslangic: Date.now(), cevaplar: [], tekrarSayisi: 0, durum: "cevap", ctl: null, sonuc: null, bitti: false,
    yedekler: {}, konuHatalari: {},
  };
  $("#ders-katman").innerHTML = `
    <div class="ders-ekran" style="${renkStil(renk)}">
      <div class="ders-ust">
        <button class="kapat" id="ders-kapat" aria-label="Kapat">✕</button>
        <div class="cubuk"><div id="ders-cubuk" style="width:0%"></div></div>
        ${tur === "sinav" ? `<span class="seri-sayac" id="sinav-sayac">1/${adimlar.length}</span>` : `<span class="seri-sayac sonuk" id="seri-sayac">🔥 0</span>`}
        ${tur === "sinav" ? "" : `<button class="term-ac" data-not-panel title="Notlarım">📝</button>`}
        <button class="term-ac" data-git="terminal" title="Terminal">&gt;_</button>
      </div>
      <div class="ders-govde"><div class="ders-ic" id="ders-ic"></div></div>
      <div class="ders-alt" id="ders-alt"><div class="ders-alt-ic" id="ders-alt-ic"></div></div>
    </div>`;
  document.body.style.overflow = "hidden";
  $("#ders-kapat").addEventListener("click", oturumKapat);
  adimGoster();
}

function oturumKapat() {
  if (oturum && !oturum.bitti && oturum.bitenler.size > 0 &&
      !confirm("Çıkarsan bu oturum tamamlanmış sayılmaz. Çıkmak istiyor musun?")) return;
  oturum = null;
  $("#ders-katman").innerHTML = "";
  document.body.style.overflow = "";
  yenile();
}

const TUR_ADLARI = { secmeli: "Çoktan seçmeli", dogruyanlis: "Doğru / yanlış", bosluk: "Boşluk doldur", sirala: "Sırala",
  eslestir: "Eşleştir", yaz: "Çıktıyı yaz", kod: "Kod yaz", coklu: "Hepsini seç", hatabul: "Hatayı bul", tamamla: "Kodu tamamla" };

function adimGoster() {
  if (!oturum.kuyruk.length) { oturumBitir(); return; }
  const giris = oturum.kuyruk[0];
  const ctl = OLUSTURUCULAR[giris.adim.tip](giris.adim, oturum.tur === "sinav");
  oturum.ctl = ctl;
  oturum.durum = "cevap";
  oturum.sonuc = null;
  const ic = $("#ders-ic");
  ic.className = "ders-ic" + (ctl.genis ? " genis" : "");
  ic.style.animation = "none";
  void ic.offsetWidth;
  ic.style.animation = "";
  let rozet = "";
  if (giris.benzer) rozet = `<div class="tekrar-rozet">🔁 Benzer soru · ${kacis(dersAdi(giris.konu))}</div>`;
  else if (giris.tekrar) rozet = `<div class="tekrar-rozet">🔁 Tekrar soru</div>`;
  else if (giris.yeniTarz) rozet = `<div class="tekrar-rozet mavi">🎲 Farklı tarz · ${TUR_ADLARI[giris.adim.tip] || ""}</div>`;
  else if (giris.adim.varyant && oturum.tur !== "sinav") {
    const z = zayifSayisi(giris.konu);
    rozet = `<div class="tekrar-rozet ${z ? "" : "mavi"}">${z ? "💪 Zorlandığın konu" : "🧩 Benzer soru"} · ${kacis(dersAdi(giris.konu))}</div>`;
  }
  ic.innerHTML = rozet + `<div class="adim">${ctl.html}</div>`;
  // Her adım kendi taze kapsayıcısını alır; böylece önceki adımların dinleyicileri karışmaz
  ctl.baglan?.($(".adim", ic), altCiz);
  if (oturum.tur !== "sinav" && typeof notBaglamAyarla === "function") {
    const b = ADIM_BAGLAM.get(giris.adim) || (giris.konu && dersBaglami(giris.konu, dersBul(giris.konu)?.ders.adimlar.indexOf(giris.adim) ?? 0));
    if (b) notBaglamAyarla(b, { kendiliginden: true });
  }
  altCiz();
  cubukGuncelle();
  $(".ders-govde").scrollTop = 0;
  ic.querySelector("input, textarea")?.focus();
}

function cubukGuncelle() {
  if (!oturum) return;
  const oran = oturum.tur === "sinav" ? oturum.cevaplar.length / oturum.toplam : oturum.bitenler.size / oturum.toplam;
  $("#ders-cubuk").style.width = `${Math.min(oran, 1) * 100}%`;
  const seriEl = $("#seri-sayac");
  if (seriEl) {
    seriEl.textContent = `🔥 ${oturum.seri}`;
    seriEl.classList.toggle("sonuk", oturum.seri < 2);
  }
  const sayac = $("#sinav-sayac");
  if (sayac) sayac.textContent = `${Math.min(oturum.cevaplar.length + 1, oturum.toplam)}/${oturum.toplam}`;
}

function altCiz() {
  const alt = $("#ders-alt");
  const ic = $("#ders-alt-ic");
  const { durum: d, ctl, sonuc } = oturum;
  alt.className = "ders-alt" + (d === "dogru" ? " dogru" : d === "yanlis" ? " yanlis" : "");

  if (d === "cevap" || d === "bekle") {
    const ogren = oturum.kuyruk[0]?.adim.tip === "ogren";
    const sonSoru = oturum.tur === "sinav" && oturum.kuyruk.length === 1;
    const etiket = ogren ? "Devam" : oturum.tur === "sinav" ? (sonSoru ? "Bitir" : "Sonraki") : "Kontrol et";
    const hazir = d === "cevap" && (ogren || ctl.hazir());
    const atla = !ogren && oturum.tur !== "sinav" && ctl.tip !== "eslestir";
    ic.innerHTML = `<div class="atla-yeri">${atla ? `<button class="dbtn beyaz" id="atla-btn" style="color:var(--cok-soluk)">Atla</button>` : ""}</div>
      <button class="dbtn ${hazir ? "yesil" : "gri"}" id="ana-btn" ${hazir ? "" : "disabled"}>${d === "bekle" ? "Kontrol ediliyor…" : etiket}</button>`;
    $("#atla-btn")?.addEventListener("click", () => sonucIsle({ dogru: false, cevap: ctl.dogruCevap?.(), aciklama: ctl.adim.aciklama, atlandi: true }));
  } else {
    const dogru = d === "dogru";
    const kodHatasi = !dogru && ctl.tip === "kod" && !sonuc.atlandi;
    const konu = oturum.kuyruk[0].konu;
    const dersBilgi = dersBul(konu);
    const notDugmesi = dersBilgi
      ? `<button class="not-ac" data-not-ac="${konu}">📖 ${kacis(dersBilgi.ders.baslik)} · ${slaytYazisi(dersBilgi.ders.slayt)} notunu oku</button>` : "";
    let baslik, detay = "";
    if (dogru) {
      baslik = [3, 5, 10, 15, 20].includes(oturum.seri) ? `${oturum.seri} doğru üst üste! 🔥` : OVGULER[Math.floor(Math.random() * OVGULER.length)];
      detay = sonuc.aciklama ? kacis(sonuc.aciklama) : "";
    } else if (kodHatasi) {
      baslik = "Henüz olmadı";
      detay = sonuc.ozet + " Yukarıdaki listeye bakıp tekrar dene.";
    } else {
      baslik = ctl.tip === "eslestir" ? "Bazı eşleri karıştırdın" : "Doğru cevap:";
      detay = (sonuc.cevap && ctl.tip !== "eslestir" ? `<span class="cevap">${kacis(sonuc.cevap)}</span><br>` : "") +
        (sonuc.aciklama ? kacis(sonuc.aciklama) : "") +
        `<span class="tekrar-not">🔁 Bu konudan benzer bir soru birazdan gelecek.</span>` + notDugmesi;
    }
    ic.innerHTML = `<div class="geri-bildirim"><div class="geri-ikon">${dogru ? "✓" : "✕"}</div>
        <div><h3>${baslik}</h3><div class="geri-detay">${detay}</div></div></div>
      <button class="dbtn ${dogru ? "yesil" : "kirmizi"}" id="ana-btn">${dogru ? "Devam" : kodHatasi ? "Tekrar dene" : "Anladım"}</button>`;
  }
  $("#ana-btn").addEventListener("click", anaButon);
}

function anaButon() {
  if (!oturum) return;
  if (oturum.bitti) { oturumKapat(); return; }
  const d = oturum.durum;
  if (d === "bekle") return;
  if (d === "cevap") {
    const giris = oturum.kuyruk[0];
    if (giris.adim.tip === "ogren") {
      oturum.bitenler.add(giris.id);
      oturum.kuyruk.shift();
      adimGoster();
    } else if (oturum.ctl.hazir()) {
      kontrolEt();
    }
    return;
  }
  devam();
}

async function kontrolEt() {
  oturum.durum = "bekle";
  altCiz();
  let sonuc;
  try {
    sonuc = await oturum.ctl.kontrol();
  } catch (e) {
    oturum.durum = "cevap";
    altCiz();
    alert("Kontrol edilemedi: " + e.message + "\nSunucunun çalıştığından emin ol.");
    return;
  }
  sonucIsle(sonuc);
}

function sonucIsle(sonuc) {
  const giris = oturum.kuyruk[0];
  const ctl = oturum.ctl;

  if (oturum.tur === "sinav") {
    oturum.cevaplar.push({ soru: giris.adim, dogru: sonuc.dogru, verilen: ctl.verilen?.() ?? "" });
    konuKaydet(giris.konu, sonuc.dogru, giris.adim, ctl.dogruCevap?.());
    oturum.kuyruk.shift();
    ses("tik");
    adimGoster();
    return;
  }

  if (!oturum.ilk.has(giris.id)) {
    oturum.ilk.set(giris.id, sonuc.dogru);
    if (OGELER[giris.id]) ogeGuncelle(giris.id, sonuc.dogru);
    konuKaydet(giris.konu, sonuc.dogru, giris.adim, sonuc.cevap ?? ctl.dogruCevap?.());
    if (!sonuc.dogru) oturum.konuHatalari[giris.konu] = (oturum.konuHatalari[giris.konu] || 0) + 1;
    // Pekiştirme ve bölüm tekrarında benzer soruyu ilk denemede bilmek, o dersteki bir zayıf soruyu kapatır
    if (sonuc.dogru && giris.adim.varyant && (oturum.tur === "pekistir" || oturum.tur === "tekrar")) zayifKapat(giris.konu);
  }
  if (sonuc.dogru) {
    oturum.seri += 1;
    oturum.bitenler.add(giris.id);
    if (giris.asilId) oturum.bitenler.add(giris.asilId);
    ses("dogru");
  } else {
    oturum.seri = 0;
    ses("yanlis");
  }
  ctl.kilitle?.(sonuc);
  oturum.sonuc = sonuc;
  oturum.durum = sonuc.dogru ? "dogru" : "yanlis";
  altCiz();
  cubukGuncelle();
  $("#ana-btn").focus({ preventScroll: true });
}

function devam() {
  const giris = oturum.kuyruk[0];
  if (oturum.durum === "yanlis" && oturum.ctl.tip === "kod" && !oturum.sonuc.atlandi) {
    // Kod alıştırmasında aynı soruda kalınır: kullanıcı düzeltip tekrar dener
    oturum.durum = "cevap";
    oturum.ctl.tekrarDene();
    altCiz();
    return;
  }
  oturum.kuyruk.shift();
  if (oturum.durum === "yanlis") {
    // Pekiştirme döngüsü: aynı soru yerine aynı konudan BENZER bir soru gelir; doğru bilinene kadar sürer
    const yedekler = oturum.yedekler[giris.konu] || [];
    const asilId = giris.asilId || giris.id;
    const yeni = yedekler.length
      ? varyantGirisi(yedekler.shift(), { benzer: true, asilId })
      : { ...giris, tekrar: true, asilId };
    oturum.kuyruk.splice(Math.min(2, oturum.kuyruk.length), 0, yeni);
    oturum.tekrarSayisi += 1;
    if (yedekler.length < 2 && dersBul(giris.konu)) yedekDoldur([giris.konu], 4);
  }
  adimGoster();
}

function sureYazisi(ms) {
  const sn = Math.round(ms / 1000);
  return `${Math.floor(sn / 60)}:${String(sn % 60).padStart(2, "0")}`;
}

function dikkatListesiHtml(konuHatalari) {
  const konular = Object.entries(konuHatalari).filter(([k]) => dersBul(k)).sort((a, b) => b[1] - a[1]);
  if (!konular.length) return "";
  return `<div class="dikkat-kutu"><h3>⚠️ Dikkat etmen gereken konular</h3>
    ${konular.map(([k, n]) => {
      const { ders } = dersBul(k);
      return `<div class="dikkat-satir"><div><b>${kacis(ders.baslik)}</b><small>${n} hata · ${slaytYazisi(ders.slayt)}</small></div>
        <button class="dbtn beyaz kucuk" data-not-ac="${k}">📖 Oku</button></div>`;
    }).join("")}
    <p>Bu konulardan benzer sorular <b>Pekiştir</b>'de karşına çıkacak. Gelişimini <b>Barem</b> sayfasından izleyebilirsin.</p></div>`;
}

function bolumSonuHtml() {
  const unite = oturum.tur === "tekrar" ? UNITELER.find((u) => `${u.id}-tekrar` === oturum.hedefId)
    : oturum.tur === "ders" ? (() => { const b = dersBul(oturum.hedefId); return b && b.unite.dersler.at(-1) === b.ders ? b.unite : null; })() : null;
  if (!unite) return "";
  return `<div class="bolum-sonu"><h3>📚 "${kacis(unite.baslik)}" bölümünün sonu</h3>
    <p>Bu bölümde aldığın notları PDF olarak indirebilirsin.</p><div class="btn-satir">${uniteBelgeBtnlari(unite, true)}</div></div>`;
}

function oturumBitir() {
  sureTik();
  oturum.bitti = true;
  if (oturum.tur === "sinav") { sinavBitir(); return; }

  const sorular = [...oturum.ilk.values()];
  const ilkDogru = sorular.filter(Boolean).length;
  const dogruluk = sorular.length ? Math.round((ilkDogru / sorular.length) * 100) : 100;
  const hatasiz = ilkDogru === sorular.length;
  const dahaOnceBitti = oturum.hedefId && durum.tamamlanan[oturum.hedefId];
  let xp = oturum.tur === "ders" ? (dahaOnceBitti ? 5 : 10) : oturum.tur === "tekrar" ? 10 : 5;
  if (hatasiz) xp += 5;
  if (oturum.hedefId) durum.tamamlanan[oturum.hedefId] = true;
  oturumKaydet(oturum.tur, ilkDogru, sorular.length);
  xpEkle(xp);
  ses("bitti");
  konfeti();

  const baslik = { ders: "Ders tamamlandı!", tekrar: "Bölüm tekrarı tamamlandı!", pekistir: "Pekiştirme tamamlandı!" }[oturum.tur];
  const yanlisSayisi = sorular.length - ilkDogru;
  const mesaj = hatasiz
    ? "Hepsini ilk denemede bildin, kusursuz! 🎉"
    : `${yanlisSayisi} soruyu ilk denemede bilemedin; döngüde benzer sorularla tekrar edip doğruladın.`;
  $("#ders-ic").className = "ders-ic";
  $("#ders-ic").innerHTML = `<div class="bitis">${maskot("mutlu", 140)}
    <h1>${baslik}</h1><p>${mesaj}</p>
    <div class="bitis-kartlar">
      <div class="bitis-kart" style="--r:var(--sari)"><div class="ust">Toplam XP</div><div class="alt">⚡ ${xp}</div></div>
      <div class="bitis-kart" style="--r:var(--yesil)"><div class="ust">Doğruluk</div><div class="alt">🎯 %${dogruluk}</div></div>
      <div class="bitis-kart" style="--r:var(--mavi)"><div class="ust">Süre</div><div class="alt">⏱ ${sureYazisi(Date.now() - oturum.baslangic)}</div></div>
    </div>${bolumSonuHtml()}${dikkatListesiHtml(oturum.konuHatalari)}</div>`;
  $("#ders-cubuk").style.width = "100%";
  $("#ders-alt").className = "ders-alt";
  const hataliKonular = Object.keys(oturum.konuHatalari).filter(dersBul);
  $("#ders-alt-ic").innerHTML = `<div class="atla-yeri">${hataliKonular.length ? `<button class="dbtn beyaz" id="hemen-pekistir">💪 Hemen pekiştir</button>` : ""}</div>
    <button class="dbtn yesil" id="ana-btn">Devam</button>`;
  $("#ana-btn").addEventListener("click", oturumKapat);
  $("#hemen-pekistir")?.addEventListener("click", () => { oturumKapat(); pekistirBaslat(hataliKonular); });
}

function dogruCevapMetni(s) {
  if (s.tip === "secmeli") return s.secenekler[s.dogru];
  if (s.tip === "yaz") return s.cevaplar[0];
  if (s.tip === "tamamla") return s.cevaplar[0];
  if (s.tip === "coklu") return s.dogrular.map((i) => "• " + s.secenekler[i]).join("\n");
  if (s.tip === "hatabul") return `Satır ${s.dogru + 1}: ${s.satirlar[s.dogru].trim()}`;
  if (s.tip === "sirala") return s.parcalar.join(s.ayrac);
  return s.dogru ? "Doğru" : "Yanlış";
}

function sinavBitir() {
  const puan = oturum.cevaplar.filter((c) => c.dogru).length;
  const toplam = oturum.cevaplar.length;
  const yuzde = Math.round((puan / toplam) * 100);
  const gecti = yuzde >= 80;
  durum.sinavlar.push({ tarih: Date.now(), puan, toplam, gecti });
  oturumKaydet("sinav", puan, toplam);
  xpEkle(puan + (gecti ? 20 : 0));
  if (gecti) { ses("bitti"); konfeti(); } else ses("yanlis");

  const hatalar = {};
  for (const c of oturum.cevaplar) if (!c.dogru && dersBul(c.soru.konu)) hatalar[c.soru.konu] = (hatalar[c.soru.konu] || 0) + 1;
  const zayifKonular = Object.keys(hatalar);
  const inceleme = oturum.cevaplar.map((c, i) => {
    const s = c.soru;
    const kod = s.kod || (Array.isArray(s.satirlar) ? s.satirlar.map((l, n) => `${n + 1}  ${l}`).join("\n") : "");
    return `<div class="inceleme-ogesi ${c.dogru ? "dogru" : "yanlis"}">
      <div class="s">${i + 1}. ${kacis(s.soru || s.ifade)} <span class="tur-etiket">${TUR_ADLARI[s.tip] || ""}</span></div>
      ${s.tip === "dogruyanlis" && s.soru ? `<div class="c">${kacis(s.ifade)}</div>` : ""}
      ${kod ? `<pre class="kod-blok">${renklendir(kod)}</pre>` : ""}
      <div class="c">Senin cevabın: <span>${kacis(c.verilen || "—")}</span> ${c.dogru ? "✅" : "❌"}</div>
      ${c.dogru ? "" : `<div class="c">Doğru cevap: <span>${kacis(dogruCevapMetni(s))}</span></div>`}
      <div class="a">${kacis(s.aciklama)} · <i>${kacis(dersAdi(s.konu))}</i></div></div>`;
  }).join("");

  $("#ders-ic").className = "ders-ic genis";
  $("#ders-ic").innerHTML = `<div class="bitis">${maskot(gecti ? "mutlu" : "uzgun", 140)}
    <h1 style="color:var(--${gecti ? "sari-g" : "kirmizi"})">${gecti ? "Sınavı geçtin! 🎓" : "Biraz daha pekiştirme lazım"}</h1>
    <p>${gecti ? "Tebrikler, SE 422 dersinin tüm bölümlerini başarıyla tamamladın!" : "Yanlış yaptığın konuları benzer sorularla pekiştirip yeni bir sınava gir. Yeni sınavda sorular tamamen farklı olacak."}</p>
    <div class="bitis-kartlar">
      <div class="bitis-kart" style="--r:var(--sari)"><div class="ust">Puan</div><div class="alt">${puan}/${toplam}</div></div>
      <div class="bitis-kart" style="--r:var(--${gecti ? "yesil" : "kirmizi"})"><div class="ust">Başarı</div><div class="alt">%${yuzde}</div></div>
      <div class="bitis-kart" style="--r:var(--mavi)"><div class="ust">Süre</div><div class="alt">${sureYazisi(Date.now() - oturum.baslangic)}</div></div>
    </div>
    ${dikkatListesiHtml(hatalar)}
    <h2 style="text-align:left">Cevapların</h2>
    <div class="inceleme">${inceleme}</div></div>`;
  $("#ders-cubuk").style.width = "100%";
  $("#ders-alt").className = "ders-alt";
  $("#ders-alt-ic").innerHTML = `<div class="atla-yeri">${zayifKonular.length ? `<button class="dbtn beyaz" id="konulari-pekistir">💪 Bu konuları pekiştir</button>` : ""}</div>
    <button class="dbtn yesil" id="ana-btn">Devam</button>`;
  $("#ana-btn").addEventListener("click", oturumKapat);
  $("#konulari-pekistir")?.addEventListener("click", () => {
    oturumKapat();
    pekistirBaslat(zayifKonular);
  });
}

function konfeti() {
  const tuval = document.createElement("canvas");
  tuval.className = "konfeti";
  tuval.width = innerWidth;
  tuval.height = innerHeight;
  document.body.appendChild(tuval);
  const c = tuval.getContext("2d");
  const renkler = ["#58cc02", "#1cb0f6", "#ffc800", "#ff4b4b", "#ce82ff", "#ff9600"];
  const parcalar = Array.from({ length: 140 }, () => ({
    x: innerWidth / 2, y: innerHeight / 3, vx: (Math.random() - 0.5) * 16, vy: Math.random() * -14 - 4,
    r: Math.random() * 6 + 4, renk: renkler[Math.floor(Math.random() * renkler.length)], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3,
  }));
  const bas = performance.now();
  (function kare(t) {
    c.clearRect(0, 0, tuval.width, tuval.height);
    for (const p of parcalar) {
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.a += p.va;
      c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.fillStyle = p.renk; c.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); c.restore();
    }
    if (t - bas < 2600) requestAnimationFrame(kare); else tuval.remove();
  })(bas);
}

// ============================================================
// Adım türleri
// Her oluşturucu şunları içeren bir nesne döndürür:
//   html, baglan(kok, degisti), hazir(), kontrol() → {dogru, cevap, aciklama}
//   kilitle(sonuc), dogruCevap(), verilen(), tus(n)
// ============================================================
// Alıştırma metinlerindeki `x` işaretlerini kod olarak göster
const kodlu = (m) => kacis(m).replace(/`([^`]+)`/g, "<code>$1</code>");
const kodGibi = (m) => /np\.|^[\[\(]|\n|\w\[|\w\.\w+\(/.test(m);

const OLUSTURUCULAR = {
  ogren(adim) {
    return {
      tip: "ogren", adim,
      html: `<div class="konusma">${maskot("normal", 84)}<div class="balon">${kacis(adim.baslik)}</div></div>
        <div class="anlatim"${baglamAttr(adim)}><div class="anlatim-ust"><span class="etiket">${slaytYazisi(adim.slayt)}</span><button class="not-al-btn" data-not-al title="Bu slayta not al">📝 Not al</button></div>${adim.metin}${adim.cizim ? CIZIM[adim.cizim] : ""}${adim.kod ? kodKutusu(adim.kod) : ""}</div>`,
      hazir: () => true,
    };
  },

  secmeli(adim, sinavModu) {
    const sira = karistir(adim.secenekler.map((_, i) => i));
    let secili = null;
    const mono = (m) => !!adim.kod || kodGibi(m);
    const ctl = {
      tip: "secmeli", adim,
      html: `<h1 class="soru-baslik">${kacis(adim.soru)}</h1>${adim.kod ? kodKutusu(adim.kod, false) : ""}
        <div class="secenekler">${sira.map((i, n) => `<button class="secenek" data-i="${i}"><span class="no">${n + 1}</span>
          <span class="${mono(adim.secenekler[i]) ? "kodlu" : ""}">${kacis(adim.secenekler[i])}</span></button>`).join("")}</div>`,
      baglan(kok, degisti) {
        $$(".secenek", kok).forEach((b) => b.addEventListener("click", () => {
          if (oturum.durum !== "cevap") return;
          secili = +b.dataset.i;
          $$(".secenek", kok).forEach((x) => x.classList.toggle("secili", x === b));
          ses("tik");
          degisti();
        }));
        ctl.kok = kok;
      },
      tus(n) { $$(".secenek", ctl.kok)[n - 1]?.click(); },
      hazir: () => secili !== null,
      kontrol: async () => ({ dogru: secili === adim.dogru, cevap: adim.secenekler[adim.dogru], aciklama: adim.aciklama }),
      kilitle() {
        $$(".secenek", ctl.kok).forEach((b) => {
          b.disabled = true;
          if (sinavModu) return;
          const i = +b.dataset.i;
          if (i === adim.dogru) { b.classList.remove("secili"); b.classList.add("dogru"); } else if (i === secili) { b.classList.remove("secili"); b.classList.add("yanlis"); }
        });
      },
      dogruCevap: () => adim.secenekler[adim.dogru],
      verilen: () => (secili === null ? "" : adim.secenekler[secili]),
    };
    return ctl;
  },

  dogruyanlis(adim) {
    let secim = null;
    const ctl = {
      tip: "dogruyanlis", adim,
      html: `<h1 class="soru-baslik">Doğru mu, yanlış mı?</h1>
        <div class="konusma">${maskot("normal", 84)}<div class="balon">${kacis(adim.ifade)}</div></div>
        ${adim.kod ? kodKutusu(adim.kod, false) : ""}
        <div class="dy-secenekler">
          <button class="secenek" data-d="1"><span class="no">1</span>✓ Doğru</button>
          <button class="secenek" data-d="0"><span class="no">2</span>✕ Yanlış</button></div>`,
      baglan(kok, degisti) {
        ctl.kok = kok;
        $$(".secenek", kok).forEach((b) => b.addEventListener("click", () => {
          if (oturum.durum !== "cevap") return;
          secim = b.dataset.d === "1";
          $$(".secenek", kok).forEach((x) => x.classList.toggle("secili", x === b));
          ses("tik");
          degisti();
        }));
      },
      tus(n) { $$(".secenek", ctl.kok)[n - 1]?.click(); },
      hazir: () => secim !== null,
      kontrol: async () => ({ dogru: secim === adim.dogru, cevap: adim.dogru ? "Doğru" : "Yanlış", aciklama: adim.aciklama }),
      kilitle() { $$(".secenek", ctl.kok).forEach((b) => { b.disabled = true; }); },
      dogruCevap: () => (adim.dogru ? "Doğru" : "Yanlış"),
      verilen: () => (secim === null ? "" : secim ? "Doğru" : "Yanlış"),
    };
    return ctl;
  },

  bosluk(adim) {
    const kelimeler = karistir(adim.kelimeler.map((k, i) => ({ k, i })));
    const dolu = adim.bosluklar.map(() => null);
    const parcalar = adim.metin.split("___");
    const metinsel = !!adim.kodDegil;
    let yuvaNo = 0;
    const metinHtml = parcalar.map((p, i) => kacis(p) + (i < parcalar.length - 1 ? `<span class="yuva" data-y="${yuvaNo++}"></span>` : "")).join("");
    const ctl = {
      tip: "bosluk", adim,
      html: `<h1 class="soru-baslik">${kacis(adim.soru)}</h1>
        <div class="bosluk-metin ${metinsel ? "" : "kodlu"}">${metinHtml}</div>
        <div class="kelime-havuzu">${kelimeler.map((w) => `<button class="kutucuk ${metinsel ? "metinsel" : ""}" data-k="${w.i}">${kacis(w.k)}</button>`).join("")}</div>`,
      baglan(kok, degisti) {
        ctl.kok = kok;
        const guncelle = () => {
          $$(".yuva", kok).forEach((y) => {
            const k = dolu[+y.dataset.y];
            y.innerHTML = k === null ? "" : `<button class="kutucuk ${metinsel ? "metinsel" : ""}" data-geri="${y.dataset.y}">${kacis(adim.kelimeler[k])}</button>`;
          });
          $$(".kelime-havuzu .kutucuk", kok).forEach((b) => b.classList.toggle("bos", dolu.includes(+b.dataset.k)));
          degisti();
        };
        kok.addEventListener("click", (e) => {
          if (oturum.durum !== "cevap") return;
          const havuz = e.target.closest("[data-k]");
          const geri = e.target.closest("[data-geri]");
          if (havuz && !dolu.includes(+havuz.dataset.k)) {
            const bos = dolu.indexOf(null);
            if (bos !== -1) { dolu[bos] = +havuz.dataset.k; ses("tik"); guncelle(); }
          } else if (geri) {
            dolu[+geri.dataset.geri] = null;
            guncelle();
          }
        });
      },
      tus(n) { $$(".kelime-havuzu .kutucuk", ctl.kok)[n - 1]?.click(); },
      hazir: () => !dolu.includes(null),
      kontrol: async () => ({
        dogru: dolu.every((k, i) => adim.kelimeler[k] === adim.bosluklar[i]),
        cevap: ctl.dogruCevap(), aciklama: adim.aciklama,
      }),
      dogruCevap: () => { let i = 0; return adim.metin.replace(/___/g, () => adim.bosluklar[i++]); },
      verilen: () => dolu.map((k) => adim.kelimeler[k]).join(", "),
    };
    return ctl;
  },

  sirala(adim) {
    const tumu = karistir([...adim.parcalar, ...(adim.ekstra || [])]);
    const secim = [];
    const metinsel = adim.ayrac === " → ";
    const satirli = !!adim.satirlar;
    const sinif = `kutucuk ${metinsel ? "metinsel" : ""} ${satirli ? "satir-kutucuk" : ""}`;
    const ctl = {
      tip: "sirala", adim,
      genis: satirli,
      html: `<h1 class="soru-baslik">${kacis(adim.soru)}</h1>
        ${adim.hedef ? `<div class="hedef"><div class="hedef-b">Hedef çıktı</div><pre>${kacis(adim.hedef)}</pre></div>` : ""}
        <div class="cevap-alani ${satirli ? "satirli" : ""}" id="cevap-alani"></div>
        <div class="kelime-havuzu ${satirli ? "satirli" : ""}">${tumu.map((p, i) => `<button class="${sinif}" data-k="${i}">${kacis(p)}</button>`).join("")}</div>`,
      baglan(kok, degisti) {
        ctl.kok = kok;
        const guncelle = () => {
          $("#cevap-alani", kok).innerHTML = secim.map((i, n) => `<button class="${sinif}" data-geri="${n}">${kacis(tumu[i])}</button>`).join("");
          $$(".kelime-havuzu .kutucuk", kok).forEach((b) => b.classList.toggle("bos", secim.includes(+b.dataset.k)));
          degisti();
        };
        kok.addEventListener("click", (e) => {
          if (oturum.durum !== "cevap") return;
          const havuz = e.target.closest("[data-k]");
          const geri = e.target.closest("[data-geri]");
          if (havuz && !secim.includes(+havuz.dataset.k)) { secim.push(+havuz.dataset.k); ses("tik"); guncelle(); }
          else if (geri) { secim.splice(+geri.dataset.geri, 1); guncelle(); }
        });
      },
      tus(n) { $$(".kelime-havuzu .kutucuk", ctl.kok)[n - 1]?.click(); },
      hazir: () => secim.length > 0,
      kontrol: async () => ({
        dogru: secim.map((i) => tumu[i]).join("\u0000") === adim.parcalar.join("\u0000"),
        cevap: adim.parcalar.join(adim.ayrac), aciklama: adim.aciklama,
      }),
      dogruCevap: () => adim.parcalar.join(adim.ayrac),
      verilen: () => secim.map((i) => tumu[i]).join(adim.ayrac),
    };
    return ctl;
  },

  eslestir(adim) {
    const n = adim.ciftler.length;
    const sol = karistir(adim.ciftler.map((_, i) => i));
    const sag = karistir(adim.ciftler.map((_, i) => i));
    const eslesen = new Set();
    let secSol = null, secSag = null, hata = false;
    const ctl = {
      tip: "eslestir", adim,
      html: `<h1 class="soru-baslik">Eşleri bul</h1>
        <div class="eslestir">
          <div class="kolon">${sol.map((i, k) => `<button class="es-kutu" data-sol="${i}"><span class="no">${k + 1}</span>${kacis(adim.ciftler[i][0])}</button>`).join("")}</div>
          <div class="kolon">${sag.map((i, k) => `<button class="es-kutu" data-sag="${i}"><span class="no">${n + k + 1}</span>${kacis(adim.ciftler[i][1])}</button>`).join("")}</div>
        </div>`,
      baglan(kok, degisti) {
        ctl.kok = kok;
        const dene = () => {
          if (secSol === null || secSag === null) return;
          const a = $(`[data-sol="${secSol}"]`, kok), b = $(`[data-sag="${secSag}"]`, kok);
          if (secSol === secSag) {
            eslesen.add(secSol);
            a.className = b.className = "es-kutu eslesti";
            ses("tik");
            setTimeout(() => { a.className = b.className = "es-kutu bitti"; }, 350);
            if (eslesen.size === n) setTimeout(() => { if (oturum && oturum.ctl === ctl) { degisti(); kontrolEt(); } }, 450);
          } else {
            hata = true;
            a.className = b.className = "es-kutu hatali";
            ses("yanlis");
            setTimeout(() => { if (!eslesen.has(+a.dataset.sol)) a.className = "es-kutu"; if (!eslesen.has(+b.dataset.sag)) b.className = "es-kutu"; }, 500);
          }
          secSol = secSag = null;
        };
        $$("[data-sol]", kok).forEach((b) => b.addEventListener("click", () => {
          if (eslesen.has(+b.dataset.sol)) return;
          secSol = +b.dataset.sol;
          $$("[data-sol]", kok).forEach((x) => x.classList.toggle("secili", x === b));
          dene();
        }));
        $$("[data-sag]", kok).forEach((b) => b.addEventListener("click", () => {
          if (eslesen.has(+b.dataset.sag)) return;
          secSag = +b.dataset.sag;
          $$("[data-sag]", kok).forEach((x) => x.classList.toggle("secili", x === b));
          dene();
        }));
      },
      tus(k) { (k <= n ? $$("[data-sol]", ctl.kok)[k - 1] : $$("[data-sag]", ctl.kok)[k - n - 1])?.click(); },
      hazir: () => eslesen.size === n,
      kontrol: async () => ({ dogru: !hata, cevap: "", aciklama: hata ? "Hepsini eşleştirdin ama ilk denemede karıştırdığın eşler vardı." : "" }),
      dogruCevap: () => adim.ciftler.map((c) => `${c[0]} → ${c[1]}`).join("\n"),
    };
    return ctl;
  },

  yaz(adim) {
    const ctl = {
      tip: "yaz", adim,
      html: `<h1 class="soru-baslik">${kacis(adim.soru)}</h1>${adim.kod ? kodKutusu(adim.kod, false) : ""}
        <input class="yaz-girdi" id="yaz-girdi" autocomplete="off" spellcheck="false" autocapitalize="off" placeholder="Cevabını buraya yaz">`,
      baglan(kok, degisti) {
        ctl.girdi = $("#yaz-girdi", kok);
        ctl.girdi.addEventListener("input", degisti);
      },
      hazir: () => ctl.girdi.value.trim() !== "",
      kontrol: async () => ({
        dogru: adim.cevaplar.map(normalize).includes(normalize(ctl.girdi.value)),
        cevap: adim.cevaplar[0], aciklama: adim.aciklama,
      }),
      kilitle() { ctl.girdi.disabled = true; },
      dogruCevap: () => adim.cevaplar[0],
      verilen: () => ctl.girdi.value.trim(),
    };
    return ctl;
  },

  coklu(adim, sinavModu) {
    const sira = karistir(adim.secenekler.map((_, i) => i));
    const secili = new Set();
    const ctl = {
      tip: "coklu", adim,
      html: `<h1 class="soru-baslik">${kacis(adim.soru)}</h1><p class="ipucu-satir">Birden fazla doğru olabilir. Doğru olanların hepsini işaretle.</p>
        <div class="secenekler">${sira.map((i, n) => `<button class="secenek coklu" data-i="${i}"><span class="kutu-isaret"></span><span class="no">${n + 1}</span>
          <span>${kacis(adim.secenekler[i])}</span></button>`).join("")}</div>`,
      baglan(kok, degisti) {
        ctl.kok = kok;
        $$(".secenek", kok).forEach((b) => b.addEventListener("click", () => {
          if (oturum.durum !== "cevap") return;
          const i = +b.dataset.i;
          if (secili.has(i)) secili.delete(i); else secili.add(i);
          b.classList.toggle("secili", secili.has(i));
          ses("tik");
          degisti();
        }));
      },
      tus(n) { $$(".secenek", ctl.kok)[n - 1]?.click(); },
      hazir: () => secili.size > 0,
      kontrol: async () => ({
        dogru: secili.size === adim.dogrular.length && adim.dogrular.every((i) => secili.has(i)),
        cevap: ctl.dogruCevap(), aciklama: adim.aciklama,
      }),
      kilitle() {
        $$(".secenek", ctl.kok).forEach((b) => {
          b.disabled = true;
          if (sinavModu) return;
          const i = +b.dataset.i;
          b.classList.remove("secili");
          if (adim.dogrular.includes(i)) b.classList.add("dogru");
          else if (secili.has(i)) b.classList.add("yanlis");
        });
      },
      dogruCevap: () => adim.dogrular.map((i) => "• " + adim.secenekler[i]).join("\n"),
      verilen: () => [...secili].map((i) => adim.secenekler[i]).join(" · "),
    };
    return ctl;
  },

  hatabul(adim, sinavModu) {
    let secili = null;
    const ctl = {
      tip: "hatabul", adim, genis: true,
      html: `<h1 class="soru-baslik">${kacis(adim.soru)}</h1><p class="ipucu-satir">Kod çalıştırılınca hata veren satıra dokun.</p>
        <div class="hatabul">${adim.satirlar.map((s, i) => `<button class="kod-satir" data-i="${i}"><span class="no">${i + 1}</span><code>${renklendir(s) || " "}</code></button>`).join("")}</div>`,
      baglan(kok, degisti) {
        ctl.kok = kok;
        $$(".kod-satir", kok).forEach((b) => b.addEventListener("click", () => {
          if (oturum.durum !== "cevap") return;
          secili = +b.dataset.i;
          $$(".kod-satir", kok).forEach((x) => x.classList.toggle("secili", x === b));
          ses("tik");
          degisti();
        }));
      },
      tus(n) { $$(".kod-satir", ctl.kok)[n - 1]?.click(); },
      hazir: () => secili !== null,
      kontrol: async () => ({ dogru: secili === adim.dogru, cevap: ctl.dogruCevap(), aciklama: adim.aciklama }),
      kilitle() {
        $$(".kod-satir", ctl.kok).forEach((b) => {
          b.disabled = true;
          if (sinavModu) return;
          const i = +b.dataset.i;
          b.classList.remove("secili");
          if (i === adim.dogru) b.classList.add("dogru"); else if (i === secili) b.classList.add("yanlis");
        });
      },
      dogruCevap: () => `Satır ${adim.dogru + 1}: ${adim.satirlar[adim.dogru].trim()}`,
      verilen: () => (secili === null ? "" : `Satır ${secili + 1}: ${adim.satirlar[secili].trim()}`),
    };
    return ctl;
  },

  tamamla(adim) {
    const [once, sonra] = adim.kod.split("___");
    const genislik = Math.max(4, ...adim.cevaplar.map((c) => c.length)) + 2;
    const ctl = {
      tip: "tamamla", adim,
      html: `<h1 class="soru-baslik">${kacis(adim.soru)}</h1>
        <div class="hedef"><div class="hedef-b">Hedef çıktı</div><pre>${kacis(adim.hedef)}</pre></div>
        <pre class="kod-blok soru-kod tamamla-kod">${renklendir(once)}<input class="bosluk-girdi" id="tamamla-girdi" autocomplete="off" spellcheck="false" autocapitalize="off" style="width:${genislik}ch" aria-label="Boşluk">${renklendir(sonra)}</pre>`,
      baglan(kok, degisti) {
        ctl.girdi = $("#tamamla-girdi", kok);
        ctl.girdi.addEventListener("input", degisti);
      },
      hazir: () => ctl.girdi.value.trim() !== "",
      kontrol: async () => {
        const bosluksuz = (m) => m.replace(/\s+/g, "");
        return { dogru: adim.cevaplar.some((c) => bosluksuz(c) === bosluksuz(ctl.girdi.value)), cevap: adim.cevaplar[0], aciklama: adim.aciklama };
      },
      kilitle() { ctl.girdi.disabled = true; },
      dogruCevap: () => adim.cevaplar[0],
      verilen: () => ctl.girdi.value.trim(),
    };
    return ctl;
  },

  kod(adim) {
    const a = ALISTIRMALAR[adim.alistirma];
    if (!a) {
      return {
        tip: "kod", adim, genis: true,
        html: `<h1 class="soru-baslik">Kod alıştırması yüklenemedi</h1><p>Sunucunun çalıştığından emin ol, sonra sayfayı yenile. Şimdilik "Atla" ile geçebilirsin.</p>`,
        hazir: () => false, tekrarDene() {}, dogruCevap: () => "",
      };
    }
    let basarisiz = 0;
    const ctl = {
      tip: "kod", adim, genis: true,
      html: `<h1 class="soru-baslik">Kodu yaz: ${kacis(a.baslik.replace(/^\d+\.\s*/, ""))}</h1>
        <p class="gorev">${kodlu(a.soru)}</p>
        <details class="ipucu"><summary>💡 İpucu</summary><div>${kodlu(a.ipucu)}</div></details>
        <textarea class="editor" id="editor" spellcheck="false" autocapitalize="off">${kacis(durum.kodlar[a.id] ?? a.baslangic)}</textarea>
        <div class="arac-satir">
          <button class="dbtn beyaz kucuk" id="calistir">▶ Çalıştır</button>
          <button class="dbtn beyaz kucuk" id="cozum" style="display:none;color:var(--turuncu)">Çözümü göster</button>
          <button class="dbtn beyaz kucuk" id="sifirla" style="color:var(--cok-soluk)">↺ Baştan yaz</button>
          <span class="not">⌘/Ctrl + Enter: kontrol et</span>
        </div>
        <div class="sonuc-kutu" id="sonuc-kutu"></div>`,
      baglan(kok, degisti) {
        const ed = $("#editor", kok);
        ctl.ed = ed;
        ed.addEventListener("input", () => { durum.kodlar[a.id] = ed.value; kaydet(); degisti(); });
        ed.addEventListener("keydown", (e) => editorTusu(e, ed));
        $("#calistir", kok).addEventListener("click", async () => {
          $("#sonuc-kutu", kok).innerHTML = `<p>Çalışıyor…</p>`;
          const s = await api("/api/calistir", { kod: ed.value });
          $("#sonuc-kutu", kok).innerHTML = `${s.hata ? `<pre class="cikti-kutu hata">${kacis(s.hata)}</pre>` : ""}
            <div class="kiyas" style="grid-template-columns:1fr"><div><h5>Çıktı</h5><pre class="cikti-kutu">${kacis(s.cikti) || "(çıktı yok)"}</pre></div></div>`;
        });
        $("#sifirla", kok).addEventListener("click", () => { ed.value = a.baslangic; delete durum.kodlar[a.id]; kaydet(); ed.focus(); });
        $("#cozum", kok).addEventListener("click", () => { ed.value = a.cozum; ed.dispatchEvent(new Event("input")); ed.focus(); });
      },
      hazir: () => ctl.ed.value.trim() !== "",
      async kontrol() {
        const s = await api("/api/kontrol", { id: a.id, kod: ctl.ed.value });
        const gecen = s.kontroller.filter((k) => k.gecti).length;
        $("#sonuc-kutu").innerHTML = `
          ${s.hata ? `<pre class="cikti-kutu hata">${kacis(s.hata)}</pre>` : ""}
          <ul class="kontrol-listesi">${s.kontroller.map((k) => `<li class="${k.gecti ? "gecti" : "kaldi"}"><span class="i">${k.gecti ? "✓" : "✕"}</span><span>${kodlu(k.aciklama)}</span></li>`).join("")}</ul>
          <div class="kiyas">
            <div><h5>Senin çıktın</h5><pre class="cikti-kutu">${kacis(s.cikti) || "(çıktı yok)"}</pre></div>
            <div><h5>Beklenen çıktı</h5><pre class="cikti-kutu">${kacis(s.beklenen_cikti) || "(çıktı yok)"}</pre></div>
          </div>`;
        return {
          dogru: s.basarili, aciklama: "Kodun tüm kontrollerden geçti.",
          ozet: s.hata ? "Kodun hata verdi." : `${gecen}/${s.kontroller.length} kontrol geçti.`,
        };
      },
      tekrarDene() {
        basarisiz += 1;
        if (basarisiz >= 2) $("#cozum").style.display = "";
        ctl.ed.focus();
      },
      kilitle(sonuc) { if (sonuc.dogru) ctl.ed.readOnly = true; },
      dogruCevap: () => a.cozum,
    };
    return ctl;
  },
};

function editorTusu(e, ed) {
  const { selectionStart: bas, selectionEnd: son, value } = ed;
  if (e.key === "Tab") {
    e.preventDefault();
    ed.setRangeText("    ", bas, son, "end");
  } else if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
    const satir = value.slice(value.lastIndexOf("\n", bas - 1) + 1, bas);
    let girinti = satir.match(/^\s*/)[0];
    if (satir.trimEnd().endsWith(":")) girinti += "    ";
    e.preventDefault();
    ed.setRangeText("\n" + girinti, bas, son, "end");
  } else {
    return;
  }
  ed.dispatchEvent(new Event("input"));
}

// ============================================================
// Terminal: kod editörü (static/editor.js) + çıktı paneli
// ============================================================
const ekran = $("#terminal-ekran");
const TERMINAL_ANAHTAR = "se422-terminal";
const tAyar = (() => {
  try { return { kod: "", orijinal: "", editorYuzde: 45, tam: false, ...JSON.parse(localStorage.getItem(TERMINAL_ANAHTAR) || "{}") }; }
  catch { return { kod: "", orijinal: "", editorYuzde: 45, tam: false }; }
})();
const tKaydet = () => { try { localStorage.setItem(TERMINAL_ANAHTAR, JSON.stringify(tAyar)); } catch { /* yok say */ } };
const ORNEK_KOD = "import numpy as np\nimport pandas as pd\n\ndf = pd.DataFrame({'ad': ['Ada', 'Can'], 'yas': [30, 25]})\nprint(df)\ndf['yas'].mean()";
const editor = kodEditoru($("#t-editor"), {
  deger: tAyar.kod || ORNEK_KOD,
  onCalistir: () => terminalKodu(editor.deger()),
  onDegis: (kod) => { tAyar.kod = kod; tKaydet(); },
});
let tCalisiyor = false;
let tZamanlayici = null;

function terminaliAc() {
  $("#terminal").classList.add("acik");
  setTimeout(() => editor.odak(), 250);
}
function terminaliKapat() {
  $("#terminal").classList.remove("acik");
}
function ekranaYaz(metin, sinif) {
  if (!metin) return null;
  const satir = document.createElement("div");
  if (sinif) satir.className = sinif;
  satir.textContent = metin.replace(/\n$/, "");
  ekran.appendChild(satir);
  ekran.scrollTop = ekran.scrollHeight;
  return satir;
}
// Traceback'i yazar: kullanıcı kodundaki satırlar ve son hata satırı vurgulanır, altına Türkçe açıklama eklenir
function hatayiYaz(s) {
  const kutu = document.createElement("div");
  kutu.className = "t-hata";
  const satirlar = s.hata.replace(/\n$/, "").split("\n");
  satirlar.forEach((sat, i) => {
    const el = document.createElement("div");
    el.textContent = sat;
    if (/File "<girdi>", line \d+/.test(sat)) {
      el.className = "t-iz-ilgili";
      const kod = satirlar[i + 1];
      if (kod && !/^\s*File /.test(kod) && !/^\w+(Error|Exception|Interrupt)/.test(kod)) el.title = "Kodundaki ilgili satır";
    } else if (i === satirlar.length - 1) {
      el.className = "t-hata-son";
    }
    kutu.appendChild(el);
  });
  ekran.appendChild(kutu);
  const aciklama = s.hata_tipi && hataAciklamasi(s.hata_tipi, s.hata_mesaji || "");
  if (aciklama) {
    const a = document.createElement("div");
    a.className = "t-aciklama";
    a.innerHTML = `<b>Bu hata ne demek?${s.satir ? ` (satır ${s.satir})` : ""}</b>`;
    const p = document.createElement("div");
    p.textContent = aciklama;
    a.appendChild(p);
    ekran.appendChild(a);
  }
  ekran.scrollTop = ekran.scrollHeight;
}
function tDurum(metin, sinif = "") {
  const el = $("#t-durum");
  el.textContent = metin;
  el.className = "t-durum " + sinif;
}
async function terminalKodu(kod) {
  if (tCalisiyor || !kod.trim()) return;
  tCalisiyor = true;
  $("#t-calistir").disabled = true;
  $("#t-durdur").disabled = false;
  $("#t-nokta").classList.add("calisiyor");
  editor.hataGoster(null);
  const ozet = kod.split("\n");
  ekranaYaz(ozet.map((s, i) => (i ? "... " : ">>> ") + s).slice(0, 6).join("\n") + (ozet.length > 6 ? `\n... (${ozet.length - 6} satır daha)` : ""), "t-girdi");
  const baslangic = performance.now();
  tDurum("Çalışıyor…", "calisiyor");
  $("#t-sure").textContent = "";
  tZamanlayici = setInterval(() => { $("#t-sure").textContent = `${((performance.now() - baslangic) / 1000).toFixed(1)} sn`; }, 100);
  let s;
  try {
    s = await api("/api/terminal", { kod });
  } catch (e) {
    s = { cikti: "", hata: "Sunucuya ulaşılamadı: " + e.message, hata_tipi: null };
  }
  clearInterval(tZamanlayici);
  const sure = s.sure ?? (performance.now() - baslangic) / 1000;
  ekranaYaz(s.cikti, "t-cikti");
  ekranaYaz(s.stderr, "t-stderr");
  if (s.hata) {
    hatayiYaz(s);
    if (s.satir) editor.hataGoster(s.satir);
    tDurum(s.durduruldu ? "■ Durduruldu" : `✗ ${s.hata_tipi || "Hata"}`, "hata");
  } else {
    tDurum(s.cikti || s.stderr ? "✓ Tamamlandı" : "✓ Tamamlandı (çıktı yok)", "tamam");
  }
  $("#t-sure").textContent = `${sure < 0.01 ? "<0.01" : sure.toFixed(2)} sn`;
  $("#t-nokta").classList.remove("calisiyor");
  $("#t-calistir").disabled = false;
  $("#t-durdur").disabled = true;
  tCalisiyor = false;
}
// Slayttaki "Terminalde dene": kodu editöre yükler (orijinal olarak saklar) ve çalıştırır
function terminaldeCalistir(kod) {
  terminaliAc();
  tAyar.orijinal = kod;
  editor.ayarla(kod);
  return terminalKodu(kod);
}
function tTamEkran(acik) {
  tAyar.tam = acik;
  tKaydet();
  $("#terminal").classList.toggle("tam", acik);
  $("#t-tam").setAttribute("aria-pressed", String(acik));
  $("#t-tam").title = acik ? "Tam ekrandan çık" : "Tam ekran";
}
function tBolmeAyarla(yuzde) {
  tAyar.editorYuzde = Math.min(85, Math.max(15, yuzde));
  $("#t-govde").style.setProperty("--editor-yuzde", tAyar.editorYuzde + "%");
  tKaydet();
}
tBolmeAyarla(tAyar.editorYuzde);
tTamEkran(tAyar.tam);

$("#t-calistir").addEventListener("click", () => terminalKodu(editor.deger()));
$("#t-durdur").addEventListener("click", async () => {
  tDurum("Durduruluyor…", "calisiyor");
  try { await api("/api/terminal/durdur", {}); } catch { /* yanıt terminalKodu'ndan gelir */ }
});
$("#t-temizle").addEventListener("click", () => {
  $$(":scope > :not(.t-bilgi)", ekran).forEach((d) => d.remove());
  tDurum("Hazır");
  $("#t-sure").textContent = "";
  editor.hataGoster(null);
  editor.odak();
});
$("#t-kod-sifirla").addEventListener("click", () => {
  editor.ayarla(tAyar.orijinal || ORNEK_KOD);
  tDurum(tAyar.orijinal ? "Kod slayttaki orijinal haline döndü" : "Kod örnek koda döndü");
  editor.odak();
});
$("#t-kopyala").addEventListener("click", async () => {
  const metin = $$(":scope > :not(.t-bilgi)", ekran).map((d) => d.innerText).join("\n");
  try {
    await navigator.clipboard.writeText(metin);
    tDurum("⧉ Çıktı kopyalandı", "tamam");
  } catch {
    tDurum("Kopyalanamadı (tarayıcı izin vermedi)", "hata");
  }
});
$("#terminal-sifirla").addEventListener("click", async () => {
  await api("/api/terminal/sifirla", {});
  ekranaYaz("Oturum sıfırlandı: tüm değişkenler silindi.", "t-sistem");
});
$("#t-tam").addEventListener("click", () => tTamEkran(!tAyar.tam));
$("#terminal-kapat").addEventListener("click", terminaliKapat);
$("#terminal").addEventListener("ed-kacis", terminaliKapat);
$("#terminal").addEventListener("keydown", (e) => {
  e.stopPropagation();
  if (e.key === "Escape") terminaliKapat();
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); terminalKodu(editor.deger()); }
});
// Editör ile çıktı arasındaki sürüklenebilir ayırıcı (fare, dokunma ve ok tuşları)
(() => {
  const ayirici = $("#t-ayirici");
  const govde = $("#t-govde");
  ayirici.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    ayirici.setPointerCapture(e.pointerId);
    govde.classList.add("surukleniyor");
    const tasi = (ev) => {
      const r = govde.getBoundingClientRect();
      tBolmeAyarla(((ev.clientY - r.top) / r.height) * 100);
    };
    const birak = () => {
      govde.classList.remove("surukleniyor");
      ayirici.removeEventListener("pointermove", tasi);
      ayirici.removeEventListener("pointerup", birak);
    };
    ayirici.addEventListener("pointermove", tasi);
    ayirici.addEventListener("pointerup", birak);
  });
  ayirici.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); tBolmeAyarla(tAyar.editorYuzde - 5); }
    if (e.key === "ArrowDown") { e.preventDefault(); tBolmeAyarla(tAyar.editorYuzde + 5); }
  });
})();

// ============================================================
// Genel olaylar
// ============================================================
document.addEventListener("click", (e) => {
  const t = e.target;
  const el = (s) => t.closest(s);
  if (el("[data-sure-ipucu]")) {
    // Dokunmatik ekranda ipucu tıklamayla açılıp kapanır
    const ip = el("[data-sure-ipucu]");
    const acik = ip.classList.contains("acik");
    $$(".sure-ipucu.acik").forEach((x) => x.classList.remove("acik"));
    if (!acik) ip.classList.add("acik");
    return;
  }
  $$(".sure-ipucu.acik").forEach((x) => x.classList.remove("acik"));
  if (el("[data-claude]")) {
    claudeSecili = el("[data-claude]").dataset.claude;
    if (sayfa === "claude") { claudeCiz(); $("#claude-icerik")?.scrollIntoView({ block: "start" }); } else git("claude");
    return;
  }
  if (el("[data-dene]")) { terminaldeCalistir(DENE_KODLARI[+el("[data-dene]").dataset.dene]); return; }
  if (el("[data-git]")) { git(el("[data-git]").dataset.git); return; }
  if (el("[data-tema]")) { temaSec(el("[data-tema]").dataset.tema || TEMALAR[durum.tema].sonraki); return; }
  if (el("[data-ses]")) { durum.ses = !durum.ses; kaydet(); menuCiz(); return; }
  if (el("[data-notlar]")) { notlarCiz.hedef = el("[data-notlar]").dataset.notlar; git("notlar"); return; }
  if (el("[data-basla]")) { const id = el("[data-basla]").dataset.basla; acikDugum = null; dersBaslat(id); return; }
  if (el("[data-tekrar]")) { const id = el("[data-tekrar]").dataset.tekrar; acikDugum = null; uniteTekrariBaslat(id); return; }
  if (el("[data-pekistir]")) { pekistirBaslat(); return; }
  if (el("[data-calis]")) { pekistirBaslat([el("[data-calis]").dataset.calis]); return; }
  if (el("[data-not-ac]")) { notModal(el("[data-not-ac]").dataset.notAc); return; }
  if (el("[data-sinav-basla]")) { sinavBaslat(); return; }
  if (el("[data-dugum]")) {
    const id = el("[data-dugum]").dataset.dugum;
    acikDugum = acikDugum === id ? null : id;
    yolCiz();
    $(".acilir")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    return;
  }
  if (acikDugum && !el(".acilir")) { acikDugum = null; yolCiz(); }
});

document.addEventListener("keydown", (e) => {
  if (!oturum || document.querySelector(".modal")) return;
  const hedef = e.target;
  if (e.key === "Enter") {
    if (hedef.tagName === "TEXTAREA") {
      if (e.metaKey || e.ctrlKey) { e.preventDefault(); anaButon(); }
      return;
    }
    e.preventDefault();
    anaButon();
    return;
  }
  if (hedef.tagName === "INPUT" || hedef.tagName === "TEXTAREA") return;
  if (/^[1-9]$/.test(e.key) && oturum.durum === "cevap") oturum.ctl.tus?.(+e.key);
});

// ============================================================
// Başlat
// ============================================================
temaUygula();
yenile();
// Claude'un özetleri listesi (bölüm başlıklarındaki "Bu bölümün Claude özeti →" bağlantısı ve sekme için)
api("/api/ozetler")
  .then((j) => {
    OZET_LISTESI = j;
    OZETLER = Object.fromEntries((j.ozetler || []).map((o) => [o.unite, o]));
    if (!oturum) yenile();
  })
  .catch(() => { OZET_LISTESI = { ozetler: [], birlesik: null }; if (sayfa === "claude") claudeCiz(); });
api("/api/alistirmalar")
  .then((liste) => { ALISTIRMALAR = Object.fromEntries(liste.map((a) => [a.id, a])); })
  .catch(() => { /* sunucu yoksa kod adımları uyarı gösterir */ });
