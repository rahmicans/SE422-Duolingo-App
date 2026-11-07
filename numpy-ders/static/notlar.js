// Notlarım paneli: slayta bağlı notlar, Markdown önizleme, otomatik kayıt, yerel yedek, JSON ve PDF dışa aktarma.
// Notlar sunucuda veri/notlar.json'da (API: /api/notlar) ve tarayıcıda localStorage["se422-notlar"] yedeğinde durur.
// Anahtar: "<unite-id>|<slayt no>". uygulama.js'den sonra yüklenir (ADIM_BAGLAM, kacis, durum, UNITELER...).

const NOT_ANAHTAR = "se422-notlar";
const NOT_GECIKME = 800; // yazmayı bırakınca kaydetme gecikmesi (ms)
const NOT = {
  notlar: {},        // anahtar → { unite, slayt, slaytYazisi, baslik, metin, guncellendi }
  bekleyen: new Set(), // sunucuya henüz gönderilmemiş anahtarlar
  baglam: null,      // { unite, uniteNo, uniteBaslik, slayt, slaytYazisi, baslik }
  sekme: "slayt",
  mod: "yaz",
  zamanlayici: null,
  sonSecim: null,
  sunucuVar: true,
};
const notAnahtari = (b) => `${b.unite}|${b.slayt}`;

// ---------------------------------------------------------------- yerel yedek
function notYerelOku() {
  try {
    const v = JSON.parse(localStorage.getItem(NOT_ANAHTAR) || "{}");
    NOT.notlar = v.notlar || {};
    NOT.bekleyen = new Set(v.bekleyen || []);
  } catch { /* bozuk yedek: boş başla */ }
}
function notYerelYaz() {
  try { localStorage.setItem(NOT_ANAHTAR, JSON.stringify({ notlar: NOT.notlar, bekleyen: [...NOT.bekleyen] })); } catch { /* depolama dolu/kapalı */ }
}

// ---------------------------------------------------------------- sunucu senkronizasyonu
async function notGonder(anahtar) {
  const n = NOT.notlar[anahtar];
  if (!n) { NOT.bekleyen.delete(anahtar); notYerelYaz(); return true; }
  try {
    const r = await api("/api/notlar", { anahtar, ...n });
    if (r.eski && r.not) { NOT.notlar[anahtar] = r.not; notDurum("Sunucudaki daha yeni sürüm yüklendi", "uyari"); notPaneliCiz(); }
    else if (!r.tamam) throw new Error(r.hata || "kaydedilemedi");
    if (!n.metin.trim() && NOT.notlar[anahtar] === n) delete NOT.notlar[anahtar];
    NOT.bekleyen.delete(anahtar);
    NOT.sunucuVar = true;
    notYerelYaz();
    return true;
  } catch {
    NOT.sunucuVar = false;
    return false;
  }
}
async function bekleyenleriGonder() {
  let hepsi = true;
  for (const a of [...NOT.bekleyen]) hepsi = (await notGonder(a)) && hepsi;
  return hepsi;
}
async function notSenkronize() {
  notYerelOku();
  try {
    const sunucu = (await api("/api/notlar")).notlar || {};
    for (const [a, n] of Object.entries(sunucu)) {
      const yerel = NOT.notlar[a];
      if (!yerel || (yerel.guncellendi || 0) < n.guncellendi) { NOT.notlar[a] = n; NOT.bekleyen.delete(a); }
      else if ((yerel.guncellendi || 0) > n.guncellendi) NOT.bekleyen.add(a);
    }
    // Yalnızca yerelde olan (sunucu kapalıyken yazılmış) notlar
    for (const a of Object.keys(NOT.notlar)) if (!sunucu[a]) NOT.bekleyen.add(a);
    NOT.sunucuVar = true;
    notYerelYaz();
    await bekleyenleriGonder();
  } catch {
    NOT.sunucuVar = false;
  }
  notDugmeleriniIsaretle();
  notPaneliCiz();
  notAgaciTazele();
}
setInterval(() => { if (NOT.bekleyen.size) bekleyenleriGonder().then((tamam) => tamam && notDurum("Kaydedildi ✓ (sunucuyla eşitlendi)", "tamam")); }, 15000);
addEventListener("online", () => bekleyenleriGonder());

// ---------------------------------------------------------------- not düzenleme
function notMetni(b) { return NOT.notlar[notAnahtari(b)]?.metin || ""; }
function notYaz(b, metin) {
  const anahtar = notAnahtari(b);
  NOT.notlar[anahtar] = { unite: b.unite, slayt: b.slayt, slaytYazisi: b.slaytYazisi, baslik: b.baslik, metin, guncellendi: Date.now() };
  NOT.bekleyen.add(anahtar);
  notYerelYaz(); // her tuşta yerel yedek: sunucu kapalı olsa da kaybolmaz
  notDurum("Kaydediliyor…", "bekliyor");
  clearTimeout(NOT.zamanlayici);
  NOT.zamanlayici = setTimeout(() => notSimdiKaydet(), NOT_GECIKME);
  notDugmeleriniIsaretle();
}
async function notSimdiKaydet() {
  clearTimeout(NOT.zamanlayici);
  NOT.zamanlayici = null;
  const tamam = await bekleyenleriGonder();
  const saat = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  notAgaciTazele();
  if (tamam) notDurum(`Kaydedildi ✓ ${saat}`, "tamam");
  else notDurum("Sunucuya ulaşılamadı · not bu tarayıcıda yedeklendi, bağlantı gelince gönderilecek", "uyari");
}
function notaEkle(b, eklenecek) {
  const mevcut = notMetni(b);
  notYaz(b, (mevcut.trim() ? mevcut.replace(/\s*$/, "") + "\n\n" : "") + eklenecek + "\n");
  notBaglamAyarla(b);
  notPaneliAc();
  notPaneliCiz();
}

// Markdown render'ı static/md.js'tedir (mdHtml); Claude'un notları sekmesiyle ortaktır.

// ---------------------------------------------------------------- panel
const notPaneli = document.createElement("aside");
notPaneli.className = "not-paneli";
notPaneli.id = "not-paneli";
notPaneli.setAttribute("aria-label", "Notlarım");
notPaneli.hidden = true;
notPaneli.innerHTML = `
  <div class="np-ust"><h2>📝 Notlarım</h2><button class="kapat" data-np-kapat aria-label="Notları kapat">✕</button></div>
  <div class="np-baglam" id="np-baglam"></div>
  <div class="np-sekmeler" role="tablist">
    <button role="tab" data-np-sekme="slayt">Bu slayt</button>
    <button role="tab" data-np-sekme="bolum">Bölümdeki tüm notlarım</button>
  </div>
  <div class="np-icerik" id="np-icerik"></div>
  <div class="np-durum" id="np-durum" aria-live="polite"></div>
  <div class="np-alt">
    <div class="np-alt-satir">
      <button class="dbtn beyaz kucuk" data-np-pdf="bolum">📄 Bölüm notları (PDF)</button>
      <button class="dbtn beyaz kucuk" data-np-pdf="kitapcik">📘 Tüm notlar (PDF)</button>
    </div>
    <div class="np-alt-satir">
      <button class="metin-btn" data-np-disa>⬇ JSON dışa aktar</button>
      <button class="metin-btn" data-np-ice>⬆ JSON içe aktar</button>
      <input type="file" id="np-dosya" accept=".json,application/json" hidden>
    </div>
    <label class="np-ayar">Kitapçıkta notu olmayan bölümler:
      <select id="np-bos"><option value="goster">"Bu bölümde not yok" yazılsın</option><option value="atla">atlansın</option></select></label>
  </div>`;
document.body.appendChild(notPaneli);

function notDurum(metin, sinif = "") {
  const el = $("#np-durum");
  el.textContent = metin;
  el.className = "np-durum " + sinif;
}
function notPaneliAc() {
  notPaneli.hidden = false;
  document.body.classList.add("np-acik");
  notPaneliCiz();
  if (NOT.sekme === "slayt" && NOT.mod === "yaz") setTimeout(() => $("#np-metin")?.focus(), 50);
}
function notPaneliKapat() {
  if (NOT.zamanlayici) notSimdiKaydet();
  notPaneli.hidden = true;
  document.body.classList.remove("np-acik");
}
function notBaglamAyarla(b, { kendiliginden = false } = {}) {
  if (!b) return;
  if (NOT.baglam && notAnahtari(NOT.baglam) === notAnahtari(b)) return;
  if (NOT.zamanlayici) notSimdiKaydet();
  NOT.baglam = b;
  if (!kendiliginden) NOT.sekme = "slayt";
  if (!notPaneli.hidden) notPaneliCiz();
}

const uniteNotlari = (uniteId) => Object.entries(NOT.notlar)
  .filter(([, n]) => n.unite === uniteId && n.metin.trim())
  .sort(([, a], [, b]) => a.slayt - b.slayt);

function notPaneliCiz() {
  if (notPaneli.hidden) return;
  const b = NOT.baglam;
  $("#np-baglam").innerHTML = b
    ? `<div class="np-bolum">Bölüm ${b.uniteNo} · ${kacis(b.uniteBaslik)}</div><div class="np-slayt"><span class="etiket">${kacis(b.slaytYazisi)}</span> ${kacis(b.baslik)}</div>`
    : `<div class="np-bolum">Bir slayt seçilmedi</div><div class="np-slayt">Bir anlatım kartındaki "📝 Not al" düğmesine bas ya da bir derse başla.</div>`;
  $$("[data-np-sekme]", notPaneli).forEach((x) => {
    const aktif = x.dataset.npSekme === (b ? NOT.sekme : "bolum");
    x.classList.toggle("aktif", aktif);
    x.setAttribute("aria-selected", String(aktif));
  });
  $("[data-np-sekme='slayt']", notPaneli).disabled = !b;
  $("[data-np-pdf='bolum']", notPaneli).disabled = !b;
  const icerik = $("#np-icerik");
  if (b && NOT.sekme === "slayt") {
    const metin = notMetni(b);
    icerik.innerHTML = `<div class="np-arac">
        <div class="np-mod" role="group" aria-label="Görünüm">
          <button data-np-mod="yaz" class="${NOT.mod === "yaz" ? "aktif" : ""}">✏️ Yaz</button>
          <button data-np-mod="onizle" class="${NOT.mod === "onizle" ? "aktif" : ""}">👁 Önizle</button>
        </div>
        <button class="metin-btn" data-np-secim title="Slayttan seçtiğin metni nota ekler">＋ Seçili metni ekle</button>
      </div>
      <textarea id="np-metin" class="np-metin" ${NOT.mod === "yaz" ? "" : "hidden"} spellcheck="true"
        placeholder="Bu slayt için notun…  (Markdown: # başlık, **kalın**, *italik*, - liste, \`kod\`, \`\`\` kod bloğu \`\`\`)">${kacis(metin)}</textarea>
      <div class="np-onizleme md" ${NOT.mod === "onizle" ? "" : "hidden"}>${metin.trim() ? mdHtml(metin) : "<p class='soluk'>Henüz not yok.</p>"}</div>
      <details class="np-yardim"><summary>Markdown kısa rehberi</summary>
        <pre># Başlık
**kalın**, *italik*, \`kod\`
- madde
1. sıralı madde
\`\`\`python
print("kod bloğu")
\`\`\`</pre></details>`;
    const ta = $("#np-metin");
    ta.addEventListener("input", () => notYaz(b, ta.value));
    ta.addEventListener("keydown", (e) => {
      e.stopPropagation(); // ders ekranının Enter kısayolu çalışmasın
      if (e.key === "Tab") { e.preventDefault(); document.execCommand("insertText", false, "    "); }
      if (e.key === "Escape") notPaneliKapat();
    });
  } else {
    const uniteId = b?.unite;
    const gruplar = uniteId ? [[uniteId, uniteNotlari(uniteId)]]
      : UNITELER.map((u) => [u.id, uniteNotlari(u.id)]).filter(([, n]) => n.length);
    icerik.innerHTML = gruplar.length && gruplar.some(([, n]) => n.length) ? gruplar.map(([uid, notlar]) => {
      const ui = UNITELER.findIndex((u) => u.id === uid);
      return `<h3 class="np-grup">Bölüm ${uniteNo(UNITELER[ui])} · ${kacis(UNITELER[ui].baslik)} <small>${notlar.length} not</small></h3>` + (notlar.length ? notlar.map(([a, n]) => `
        <div class="np-kart"><div class="np-kart-ust"><span class="etiket">${kacis(n.slaytYazisi)}</span><b>${kacis(n.baslik)}</b>
          <button class="metin-btn" data-np-duzenle="${kacis(a)}">Düzenle</button></div>
          <div class="md">${mdHtml(n.metin)}</div></div>`).join("") : `<p class="soluk">Bu bölümde henüz not yok.</p>`);
    }).join("") : `<p class="soluk">Henüz hiç not almadın. Anlatım kartlarındaki "📝 Not al" düğmesiyle başlayabilirsin.</p>`;
  }
}

// Notu olan kartların düğmesini işaretle
function notDugmeleriniIsaretle() {
  $$("[data-not-baglam]").forEach((kart) => {
    const btn = kart.querySelector("[data-not-al]");
    if (!btn) return;
    try {
      const dolu = !!notMetni(JSON.parse(kart.dataset.notBaglam)).trim();
      btn.classList.toggle("dolu", dolu);
      btn.textContent = dolu ? "📝 Notun var" : "📝 Not al";
    } catch { /* yok say */ }
  });
}
let isaretZamanlayici = null;
new MutationObserver(() => { clearTimeout(isaretZamanlayici); isaretZamanlayici = setTimeout(notDugmeleriniIsaretle, 60); })
  .observe(document.body, { childList: true, subtree: true });

// ---------------------------------------------------------------- seçili metni nota ekle
const secimBalonu = document.createElement("button");
secimBalonu.className = "secim-balonu";
secimBalonu.textContent = "📝 Nota ekle";
secimBalonu.hidden = true;
document.body.appendChild(secimBalonu);
function secimiYakala() {
  const sec = getSelection();
  const metin = sec && !sec.isCollapsed ? sec.toString().trim() : "";
  const kart = metin && sec.anchorNode && (sec.anchorNode.nodeType === 1 ? sec.anchorNode : sec.anchorNode.parentElement)?.closest("[data-not-baglam]");
  if (!kart || notPaneli.contains(sec.anchorNode)) { secimBalonu.hidden = true; return; }
  NOT.sonSecim = { metin, baglam: JSON.parse(kart.dataset.notBaglam) };
  const r = sec.getRangeAt(0).getBoundingClientRect();
  secimBalonu.hidden = false;
  secimBalonu.style.left = `${Math.max(8, Math.min(innerWidth - 130, r.left + r.width / 2 - 60))}px`;
  secimBalonu.style.top = `${Math.max(8, r.top - 44)}px`;
}
document.addEventListener("mouseup", () => setTimeout(secimiYakala, 0));
document.addEventListener("keyup", (e) => { if (e.shiftKey) secimiYakala(); });
document.addEventListener("touchend", () => setTimeout(secimiYakala, 250));
document.addEventListener("scroll", () => { secimBalonu.hidden = true; }, true);
const alintiYap = (m) => m.split("\n").map((s) => "> " + s).join("\n");
secimBalonu.addEventListener("mousedown", (e) => e.preventDefault());
secimBalonu.addEventListener("click", () => {
  secimBalonu.hidden = true;
  if (NOT.sonSecim) notaEkle(NOT.sonSecim.baglam, alintiYap(NOT.sonSecim.metin));
  getSelection().removeAllRanges();
});

// ---------------------------------------------------------------- JSON dışa / içe aktarma
function dosyaIndir(blob, ad) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: ad });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function notlariDisaAktar() {
  const notlar = Object.fromEntries(Object.entries(NOT.notlar).filter(([, n]) => n.metin.trim()));
  const veri = { uygulama: "se422", surum: 1, disaAktarim: new Date().toISOString(), notlar };
  dosyaIndir(new Blob([JSON.stringify(veri, null, 1)], { type: "application/json" }), `se422-notlarim-${yerelTarih()}.json`);
  notDurum(`${Object.keys(notlar).length} not dışa aktarıldı`, "tamam");
}
async function notlariIceAktar(dosya) {
  let veri;
  try { veri = JSON.parse(await dosya.text()); } catch { notDurum("Dosya okunamadı: geçerli bir JSON değil", "uyari"); return; }
  const gelen = veri.notlar;
  if (!gelen || typeof gelen !== "object") { notDurum("Dosyada 'notlar' bulunamadı", "uyari"); return; }
  await notlariIceAktarVeri(gelen);
}
// Not sözlüğünü birleştirir (Notlar paneli ve Barem'deki "İlerleme yedeği" kullanır); sonuç mesajını döndürür
async function notlariIceAktarVeri(gelen) {
  let mesaj;
  try {
    const r = await api("/api/notlar/ice-aktar", { notlar: gelen });
    if (!r.tamam) throw new Error(r.hata);
    for (const [a, n] of Object.entries(r.notlar)) if (!NOT.notlar[a] || NOT.notlar[a].guncellendi <= n.guncellendi) NOT.notlar[a] = n;
    mesaj = `${r.eklenen} not içe aktarıldı${r.atlanan ? `, ${r.atlanan} not atlandı (aynısı ya da daha yenisi zaten var)` : ""}`;
    notDurum(mesaj, "tamam");
  } catch {
    // Sunucu yoksa yerelde birleştir, sonra gönder
    let eklenen = 0;
    for (const [a, n] of Object.entries(gelen)) {
      if (n && typeof n.metin === "string" && (!NOT.notlar[a] || (NOT.notlar[a].guncellendi || 0) < (n.guncellendi || 0))) {
        NOT.notlar[a] = n; NOT.bekleyen.add(a); eklenen++;
      }
    }
    mesaj = `${eklenen} not yerelde içe aktarıldı; sunucuya bağlanınca gönderilecek`;
    notDurum(mesaj, "uyari");
  }
  notYerelYaz();
  notDugmeleriniIsaretle();
  notPaneliCiz();
  return mesaj;
}

// ---------------------------------------------------------------- PDF indirme (sunucuda üretilir)
async function notPdfIndir(tur, uniteId) {
  notDurum("PDF hazırlanıyor…", "bekliyor");
  await bekleyenleriGonder();
  const uniteler = UNITELER.map((u) => ({ id: u.id, no: uniteNo(u), baslik: u.baslik, kaynak: u.kaynak, altBaslik: u.altBaslik }));
  const notlar = Object.fromEntries(Object.entries(NOT.notlar).filter(([, n]) => n.metin.trim()));
  const tamamlandi = aktifDugumIndeksi() === -1;
  try {
    const r = await fetch("/api/pdf/notlar", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tur, unite: uniteId, uniteler, notlar, bosBolumler: durum.notAyar?.bosBolumler || "goster", tamamlandi }),
    });
    if (!r.ok || r.headers.get("Content-Type") !== "application/pdf") throw new Error((await r.text()).slice(0, 200));
    const u = UNITELER.find((x) => x.id === uniteId);
    const ad = tur === "bolum" ? `notlarim-${String(uniteNo(u)).padStart(2, "0")}-${u.kaynak.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.pdf`
      : `notlarim-kitapcik-${yerelTarih()}.pdf`;
    dosyaIndir(await r.blob(), ad);
    notDurum("PDF indirildi ✓", "tamam");
    return true;
  } catch (e) {
    notDurum("PDF oluşturulamadı: " + e.message, "uyari");
    if (notPaneli.hidden) alert("PDF oluşturulamadı: " + e.message);
    return false;
  }
}

// ---------------------------------------------------------------- NOTLAR sayfası: not ağacı (yalnızca görünüm)
// Bölüm → slayt → not. Veri NOT.notlar'dan okunur; kayıt biçimi ve anahtarlar değişmez.
// Görünüm durumu (açık dallar, sıralama, boş bölümler, görünüm) ayrı bir anahtarda: localStorage["se422-not-agaci"].
const AGAC_ANAHTAR = "se422-not-agaci";
const AGAC = { arama: "", odak: null };
function notAgaciDurum(degis) {
  let d;
  try { d = JSON.parse(localStorage.getItem(AGAC_ANAHTAR) || "null"); } catch { d = null; }
  d = { gorunum: "agac", sira: "mufredat", bos: false, acik: null, ...(d || {}) };
  if (degis) { d = { ...d, ...degis }; try { localStorage.setItem(AGAC_ANAHTAR, JSON.stringify(d)); } catch { /* yok say */ } }
  return d;
}
const agacNotlari = () => Object.entries(NOT.notlar).filter(([, n]) => n.metin?.trim());
const slaytNotuMu = (n) => /^Slayt \d/.test(n.slaytYazisi || "") && n.slayt < 900;
const kisaTarih = (ms) => new Date(ms).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
// Arama: I/İ/ı farkı yok sayılır (Türkçe metin + İngilizce terimler; "SLICING" = "slicing"), uzunluk korunur
const trKucuk = (s) => String(s || "").replace(/[İIı]/g, "i").toLowerCase();

// Varsayılan: en son not alınan bölüm açık, diğerleri kapalı
function agacAcikKume() {
  const d = notAgaciDurum();
  if (Array.isArray(d.acik)) return new Set(d.acik);
  const son = agacNotlari().sort(([, a], [, b]) => b.guncellendi - a.guncellendi)[0];
  return new Set(son ? [`b:${son[1].unite}`] : []);
}

function agacVeri() {
  const d = notAgaciDurum();
  const q = trKucuk(AGAC.arama.trim());
  const notlar = agacNotlari();
  let bolumler = UNITELER.map((u, ui) => {
    const bAd = `Bölüm ${uniteNo(u)} · ${u.baslik}`;
    const bEsles = q && trKucuk(bAd).includes(q);
    const kendi = notlar.filter(([, n]) => n.unite === u.id);
    const yapraklar = kendi.map(([a, n]) => {
      const sAd = `${n.slaytYazisi} · ${n.baslik}`;
      const sEsles = q && trKucuk(sAd).includes(q);
      const mEsles = q && trKucuk(n.metin).includes(q);
      return { a, n, sAd, sEsles, mEsles, gorunur: !q || bEsles || sEsles || mEsles };
    }).filter((x) => x.gorunur);
    const sirala = d.sira === "son" ? (x, y) => y.n.guncellendi - x.n.guncellendi : (x, y) => x.n.slayt - y.n.slayt;
    const slaytlar = yapraklar.filter((x) => slaytNotuMu(x.n)).sort(sirala);
    const genel = yapraklar.filter((x) => !slaytNotuMu(x.n)).sort(sirala);
    const son = Math.max(0, ...kendi.map(([, n]) => n.guncellendi || 0));
    return { u, ui, bAd, slaytlar, genel, sayi: kendi.length, son, gorunur: q ? yapraklar.length > 0 : kendi.length > 0 || d.bos };
  }).filter((b) => b.gorunur);
  if (d.sira === "son") bolumler = bolumler.sort((x, y) => y.son - x.son || x.ui - y.ui);
  return bolumler;
}

function notAgaciCiz() {
  const d = notAgaciDurum();
  const toplam = agacNotlari().length;
  $("#sayfa").innerHTML = `<div class="sayfa nagac-sayfa">${notlarGorunumSecici("agac")}
    <h1 class="sayfa-baslik">Notlarım</h1>
    <p class="sayfa-aciklama">Derslerde "📝 Not al" ile yazdığın notlar, bölüm ve slayta göre. ${toplam ? `Toplam <b>${toplam}</b> not.` : ""}</p>
    <div class="btn-satir not-unite-btn"><button class="dbtn beyaz kucuk" data-not-panel>📝 Not panelini aç</button>
      <button class="dbtn beyaz kucuk" data-kitapcik>📘 Tüm notları kitapçık olarak indir (PDF)</button></div>
    <div class="kart nagac-kart">
      <div class="nagac-arac">
        <input type="search" id="nagac-ara" placeholder="Notlarda, slayt ve bölüm adlarında ara…" aria-label="Notlarda ara" value="${kacis(AGAC.arama)}">
        <div class="nagac-arac-sag">
          <button class="metin-btn" data-agac="hepsini-ac">Tümünü aç</button>
          <button class="metin-btn" data-agac="hepsini-kapat">Tümünü kapat</button>
          <label class="nagac-sira">Sırala <select id="nagac-sira" aria-label="Sıralama">
            <option value="mufredat" ${d.sira === "mufredat" ? "selected" : ""}>Müfredat sırası</option>
            <option value="son" ${d.sira === "son" ? "selected" : ""}>Son düzenlenen</option></select></label>
          <label class="nagac-bos"><input type="checkbox" id="nagac-bos" ${d.bos ? "checked" : ""}> Boş bölümleri de göster</label>
        </div>
      </div>
      <div id="nagac-govde"></div>
    </div></div>`;
  $("#nagac-ara").addEventListener("input", (e) => { AGAC.arama = e.target.value; agacGovdeCiz(); });
  $("#nagac-sira").addEventListener("change", (e) => { notAgaciDurum({ sira: e.target.value }); agacGovdeCiz(); });
  $("#nagac-bos").addEventListener("change", (e) => { notAgaciDurum({ bos: e.target.checked }); agacGovdeCiz(); });
  agacGovdeCiz();
}

function agacGovdeCiz() {
  const govde = $("#nagac-govde");
  if (!govde) return;
  const q = AGAC.arama.trim();
  const acik = agacAcikKume();
  const bolumler = agacVeri();
  const ac = (id, zorla) => (zorla || acik.has(id) ? "true" : "false");
  const notOgesi = (x, seviye) => {
    const id = `n:${x.a}`;
    const ilk = x.n.metin.trim().split("\n").find((s) => s.trim()) || "";
    const onizleme = ilk.replace(/^[#>\-*\s`]+/, "").replace(/\*\*|__|`|\*/g, "").slice(0, 80) + (ilk.length > 80 || x.n.metin.trim().includes("\n") ? "…" : "");
    return `<li role="treeitem" aria-level="${seviye}" aria-expanded="${ac(id, q && x.mEsles)}" data-nd="${kacis(id)}" tabindex="-1" class="nd nd-not">
      <div class="nd-satir"><span class="nd-ok" aria-hidden="true"></span><span class="nd-onizleme" data-vurgula>${kacis(onizleme)}</span>
        <span class="nd-tarih">${kisaTarih(x.n.guncellendi)}</span></div>
      <div class="nd-grup"><div class="nd-ic"><div class="nd-not-govde">
        <div class="md" data-vurgula>${mdHtml(x.n.metin)}</div>
        <div class="nd-not-btn"><button class="metin-btn" data-agac-duzenle="${kacis(x.a)}">Düzenle</button>
          <button class="metin-btn sil" data-agac-sil="${kacis(x.a)}">Sil</button></div></div></div></div></li>`;
  };
  const slaytOgesi = (x) => {
    const id = `s:${x.a}`;
    return `<li role="treeitem" aria-level="2" aria-expanded="${ac(id, q && (x.sEsles || x.mEsles))}" data-nd="${kacis(id)}" tabindex="-1" class="nd nd-slayt">
      <div class="nd-satir"><span class="nd-ok" aria-hidden="true"></span><span class="nd-ad" data-vurgula>${kacis(x.sAd)}</span>
        <span class="nd-rozet">1 not</span>
        <button class="metin-btn nd-git" data-agac-git="${kacis(x.a)}" title="ÖĞREN'de bu slaytı aç">Slayta git →</button></div>
      <div class="nd-grup"><div class="nd-ic"><ul role="group">${notOgesi(x, 3)}</ul></div></div></li>`;
  };
  const html = bolumler.map((b) => {
    const id = `b:${b.u.id}`;
    const genelId = `g:${b.u.id}`;
    const genel = b.genel.length ? `<li role="treeitem" aria-level="2" aria-expanded="${ac(genelId, q)}" data-nd="${genelId}" tabindex="-1" class="nd nd-slayt">
        <div class="nd-satir"><span class="nd-ok" aria-hidden="true"></span><span class="nd-ad">Genel notlar</span><span class="nd-rozet">${b.genel.length} not</span></div>
        <div class="nd-grup"><div class="nd-ic"><ul role="group">${b.genel.map((x) => notOgesi(x, 3).replace('<span class="nd-onizleme" data-vurgula>', `<span class="nd-onizleme" data-vurgula><b>${kacis(x.sAd)}</b> · `)).join("")}</ul></div></div></li>` : "";
    const ic = b.slaytlar.map(slaytOgesi).join("") + genel || `<li class="nd-bos">Bu bölümde henüz not yok.</li>`;
    return `<li role="treeitem" aria-level="1" aria-expanded="${ac(id, q)}" data-nd="${id}" tabindex="-1" class="nd nd-bolum" style="${renkStil(b.u.renk)}">
      <div class="nd-satir"><span class="nd-ok" aria-hidden="true"></span><span class="nd-renk" aria-hidden="true"></span><span class="nd-ad" data-vurgula>${kacis(b.bAd)}</span>
        <span class="nd-rozet">${b.sayi} not</span>${b.son ? `<span class="nd-tarih">son: ${kisaTarih(b.son)}</span>` : ""}
        ${b.sayi ? `<button class="metin-btn nd-pdf" data-not-pdf="${b.u.id}" title="Bu bölümün notlarını PDF olarak indir">PDF</button>` : ""}</div>
      <div class="nd-grup"><div class="nd-ic"><ul role="group">${ic}</ul></div></div></li>`;
  }).join("");
  govde.innerHTML = html
    ? `<ul class="nagac" role="tree" aria-label="Notlar ağacı">${html}</ul>`
    : `<p class="soluk nagac-yok">${q ? `"${kacis(q)}" için eşleşen not yok.` : `Henüz hiç not almadın. Anlatım kartlarındaki "📝 Not al" düğmesiyle başlayabilirsin.`}</p>`;
  if (q) agacVurgula(govde, q);
  const ogeler = agacGorunurOgeler();
  const odak = ogeler.find((o) => o.dataset.nd === AGAC.odak) || ogeler[0];
  if (odak) odak.tabIndex = 0;
}

function agacVurgula(kok, q) {
  const kq = trKucuk(q);
  kok.querySelectorAll("[data-vurgula]").forEach((alan) => {
    const yuru = document.createTreeWalker(alan, NodeFilter.SHOW_TEXT);
    const dugumler = [];
    while (yuru.nextNode()) dugumler.push(yuru.currentNode);
    dugumler.forEach((tn) => {
      const metin = tn.nodeValue, km = trKucuk(metin);
      if (km.length !== metin.length || !km.includes(kq)) return; // büyük/küçük harf uzunluğu değişiyorsa atla
      const parca = document.createDocumentFragment();
      let i = 0, j;
      while ((j = km.indexOf(kq, i)) !== -1) {
        parca.append(metin.slice(i, j));
        const m = document.createElement("mark"); m.textContent = metin.slice(j, j + kq.length); parca.append(m);
        i = j + kq.length;
      }
      parca.append(metin.slice(i));
      tn.replaceWith(parca);
    });
  });
}

// Görünür (atası kapalı olmayan) ağaç öğeleri, yukarıdan aşağı
function agacGorunurOgeler() {
  return $$("#nagac-govde [role=treeitem]").filter((o) => {
    for (let p = o.parentElement.closest("[role=treeitem]"); p; p = p.parentElement.closest("[role=treeitem]")) if (p.getAttribute("aria-expanded") !== "true") return false;
    return true;
  });
}
function agacAcKapat(oge, acilsin) {
  const id = oge.dataset.nd;
  oge.setAttribute("aria-expanded", String(acilsin));
  if (AGAC.arama.trim()) return; // arama sırasında açılanlar kalıcı duruma yazılmaz
  const k = agacAcikKume();
  acilsin ? k.add(id) : k.delete(id);
  notAgaciDurum({ acik: [...k] });
}
function agacOdakla(oge) {
  if (!oge) return;
  $$("#nagac-govde [role=treeitem]").forEach((o) => { o.tabIndex = -1; });
  oge.tabIndex = 0;
  AGAC.odak = oge.dataset.nd;
  oge.focus({ preventScroll: false });
}
function agacAnahtarBaglami(a) {
  const n = NOT.notlar[a];
  const u = UNITELER.find((x) => x.id === n.unite);
  return { unite: n.unite, uniteNo: uniteNo(u), uniteBaslik: u.baslik, slayt: n.slayt, slaytYazisi: n.slaytYazisi, baslik: n.baslik };
}
// Not paneli dışından da çağrılır (NOTLAR ağacındaki "Düzenle")
function notDuzenle(a) {
  if (!NOT.notlar[a]) return;
  notBaglamAyarla(agacAnahtarBaglami(a));
  NOT.sekme = "slayt"; NOT.mod = "yaz";
  notPaneliAc();
  notPaneliCiz();
}
// Not değişince (kayıt, silme, senkron) açık NOTLAR ağacını tazele
function notAgaciTazele() {
  if (typeof sayfa !== "undefined" && sayfa === "notlar" && $("#nagac-govde")) {
    const aktif = document.activeElement?.closest?.("#nagac-govde [role=treeitem]")?.dataset.nd;
    agacGovdeCiz();
    if (aktif) $$("#nagac-govde [role=treeitem]").find((o) => o.dataset.nd === aktif)?.focus({ preventScroll: true });
  }
}

document.addEventListener("keydown", (e) => {
  const oge = e.target.closest?.("#nagac-govde [role=treeitem]");
  if (!oge || e.target !== oge) return;
  const ogeler = agacGorunurOgeler();
  const i = ogeler.indexOf(oge);
  const acik = oge.getAttribute("aria-expanded") === "true";
  const ust = oge.parentElement.closest("[role=treeitem]");
  const ilkCocuk = oge.querySelector("[role=treeitem]");
  const tus = { ArrowDown: () => agacOdakla(ogeler[i + 1]), ArrowUp: () => agacOdakla(ogeler[i - 1]),
    Home: () => agacOdakla(ogeler[0]), End: () => agacOdakla(ogeler.at(-1)),
    ArrowRight: () => (acik ? agacOdakla(ilkCocuk) : agacAcKapat(oge, true)),
    ArrowLeft: () => (acik ? agacAcKapat(oge, false) : agacOdakla(ust)),
    Enter: () => agacAcKapat(oge, !acik), " ": () => agacAcKapat(oge, !acik) }[e.key];
  if (tus) { e.preventDefault(); tus(); }
});

// ---------------------------------------------------------------- olaylar
document.addEventListener("click", (e) => {
  const el = (s) => e.target.closest(s);
  if (el("[data-not-panel]")) { notPaneli.hidden ? notPaneliAc() : notPaneliKapat(); return; }
  if (el("[data-not-al]")) {
    const kart = el("[data-not-baglam]");
    if (kart) { notBaglamAyarla(JSON.parse(kart.dataset.notBaglam)); NOT.sekme = "slayt"; NOT.mod = "yaz"; notPaneliAc(); }
    return;
  }
  if (el("[data-nota-ekle]")) {
    const kart = el("[data-not-baglam]");
    const kod = DENE_KODLARI[+el("[data-nota-ekle]").dataset.notaEkle];
    if (kart && kod) notaEkle(JSON.parse(kart.dataset.notBaglam), "```python\n" + kod + "\n```");
    return;
  }
  if (el("[data-not-pdf]")) { notPdfIndir("bolum", el("[data-not-pdf]").dataset.notPdf); return; }
  if (el("[data-kitapcik]")) { notPdfIndir("kitapcik"); return; }
  if (el("[data-not-gorunum]")) { notAgaciDurum({ gorunum: el("[data-not-gorunum]").dataset.notGorunum }); notlarCiz(); return; }
  if (el("[data-agac]")) {
    const ac = el("[data-agac]").dataset.agac === "hepsini-ac";
    const idler = $$("#nagac-govde [role=treeitem]").filter((o) => !o.classList.contains("nd-not")).map((o) => o.dataset.nd);
    $$("#nagac-govde [role=treeitem]").forEach((o) => { if (!o.classList.contains("nd-not") || !ac) o.setAttribute("aria-expanded", String(ac)); });
    if (!AGAC.arama.trim()) notAgaciDurum({ acik: ac ? idler : [] });
    return;
  }
  if (el("[data-agac-duzenle]")) { notDuzenle(el("[data-agac-duzenle]").dataset.agacDuzenle); return; }
  if (el("[data-agac-sil]")) {
    const a = el("[data-agac-sil]").dataset.agacSil;
    const n = NOT.notlar[a];
    if (n && confirm(`"${n.slaytYazisi} · ${n.baslik}" notu silinsin mi?`)) {
      notYaz(agacAnahtarBaglami(a), ""); // mevcut silme biçimi: boş metin kaydedilir, sunucu ve yerel kayıt notu kaldırır
      notSimdiKaydet().then(notAgaciTazele);
      notAgaciTazele();
    }
    return;
  }
  if (el("[data-agac-git]")) {
    const n = NOT.notlar[el("[data-agac-git]").dataset.agacGit];
    const ders = n && UNITELER.find((u) => u.id === n.unite)?.dersler.find((d) => d.adimlar.some((a) => a.tip === "ogren" && ADIM_BAGLAM.get(a)?.slayt === n.slayt));
    if (ders) {
      git("ogren");
      acikDugum = ders.id; yolCiz();
      document.querySelector(`[data-dugum="${ders.id}"]`)?.scrollIntoView({ block: "center" });
      notModal(ders.id, n.slayt);
    }
    return;
  }
  if (e.target.closest("#nagac-govde .nd-satir") && !el("button, a, input, select")) {
    const oge = e.target.closest("[role=treeitem]");
    agacOdakla(oge);
    agacAcKapat(oge, oge.getAttribute("aria-expanded") !== "true");
    return;
  }
  if (!notPaneli.contains(e.target)) return;
  if (el("[data-np-kapat]")) { notPaneliKapat(); return; }
  if (el("[data-np-sekme]")) { NOT.sekme = el("[data-np-sekme]").dataset.npSekme; notPaneliCiz(); return; }
  if (el("[data-np-mod]")) { NOT.mod = el("[data-np-mod]").dataset.npMod; notPaneliCiz(); if (NOT.mod === "yaz") $("#np-metin")?.focus(); return; }
  if (el("[data-np-secim]")) {
    if (NOT.sonSecim && NOT.baglam) notaEkle(NOT.baglam, alintiYap(NOT.sonSecim.metin));
    else notDurum("Önce slayttan bir metin seç (fareyle sürükleyerek)", "uyari");
    return;
  }
  if (el("[data-np-duzenle]")) {
    const n = NOT.notlar[el("[data-np-duzenle]").dataset.npDuzenle];
    const u = UNITELER.findIndex((x) => x.id === n.unite);
    notBaglamAyarla({ unite: n.unite, uniteNo: uniteNo(UNITELER[u]), uniteBaslik: UNITELER[u].baslik, slayt: n.slayt, slaytYazisi: n.slaytYazisi, baslik: n.baslik });
    NOT.sekme = "slayt"; NOT.mod = "yaz"; notPaneliCiz();
    return;
  }
  if (el("[data-np-pdf]")) { notPdfIndir(el("[data-np-pdf]").dataset.npPdf, NOT.baglam?.unite); return; }
  if (el("[data-np-disa]")) { notlariDisaAktar(); return; }
  if (el("[data-np-ice]")) { $("#np-dosya").click(); }
});
$("#np-bos").value = durum.notAyar?.bosBolumler || "goster";
$("#np-bos").addEventListener("change", (e) => { durum.notAyar = { ...durum.notAyar, bosBolumler: e.target.value }; kaydet(); });
$("#np-dosya").addEventListener("change", (e) => { const f = e.target.files[0]; if (f) notlariIceAktar(f); e.target.value = ""; });
notPaneli.addEventListener("keydown", (e) => { if (e.key === "Escape") notPaneliKapat(); });
addEventListener("beforeunload", () => { if (NOT.zamanlayici) { notYerelYaz(); navigator.sendBeacon?.("/api/notlar", new Blob([JSON.stringify({ anahtar: notAnahtari(NOT.baglam), ...NOT.notlar[notAnahtari(NOT.baglam)] })], { type: "application/json" })); } });

if (sayfa === "notlar") notlarCiz(); // ilk çizim notlar.js yüklenmeden yapıldıysa ağaçla yeniden çiz
notSenkronize();
