"use strict";
// İlerleme kaydı: şema sürümü (schemaVersion), açılışta göç (migration), göç öncesi yedek,
// sunucu kopyası (veri/ilerleme.json) ile birleştirme ve JSON dışa / içe aktarma.
//
// Asıl kayıt tarayıcıda: localStorage["se422-ders-v1"] (anahtar adı geriye uyum için değişmez; sürüm kaydın içinde).
// Tarayıcı depolaması adrese bağlıdır (localhost:8001 ≠ 127.0.0.1:8001), bu yüzden her açılışta kayıt sunucuya
// gönderilir, sunucu iki kopyayı hiçbir kaydı silmeden birleştirir ve birleşik hali geri döner.
// Müfredattan sonra, uygulama.js'den ÖNCE yüklenir (durum'u KAYIT.yukle() kurar).

const KAYIT = (() => {
  const ANAHTAR = "se422-ders-v1";
  const YEDEK_ANAHTAR = "se422-ders-yedekler"; // sunucuya henüz ulaşmamış göç öncesi yedekler
  const SURUM = 2;

  // Bir ders/bölüm/alıştırma id'si değişirse eşlemeyi buraya ekle: { "eski-id": "yeni-id" }.
  // Soru id'leri ("<ders-id>#<adım sırası>") ders id'siyle birlikte çevrilir; adım sırası kayarsa
  // soru içeriğinin imzasıyla (ogeImza) otomatik bulunur, burada yazmaya gerek yok.
  const ID_ESLESME = {};

  const varsayilan = () => ({
    schemaVersion: SURUM, tamamlanan: {}, ogeler: {}, ogeImza: {}, xp: 0, gunluk: {}, ses: true, sinavlar: [], araSinavlar: [],
    gorulenSinav: [], gorulenUretilen: [], gorulenAraSinav: [], kodlar: {}, konular: {}, oturumlar: [], tema: "sistem",
    sureler: {}, notAyar: { bosBolumler: "goster" }, bilinenBolumler: [],
  });

  // ---------------------------------------------------------------- müfredattan soru imzaları
  function fnv(metin) {
    let h = 0x811c9dc5;
    for (let i = 0; i < metin.length; i++) { h ^= metin.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36);
  }
  function soruImzalari(uniteler) {
    const imza = {};
    uniteler.forEach((u) => u.dersler.forEach((d) => d.adimlar.forEach((a, i) => {
      if (a.tip !== "ogren") imza[`${d.id}#${i}`] = fnv(JSON.stringify(a));
    })));
    return imza;
  }

  // ---------------------------------------------------------------- göç (migration)
  const nesne = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
  const dizi = (x) => (Array.isArray(x) ? x : []);

  function idCevir(id) {
    if (ID_ESLESME[id]) return ID_ESLESME[id];
    let m = /^(.*)#(\d+)$/.exec(id);
    if (m && ID_ESLESME[m[1]]) return `${ID_ESLESME[m[1]]}#${m[2]}`;
    m = /^(.*)-tekrar$/.exec(id);
    if (m && ID_ESLESME[m[1]]) return `${ID_ESLESME[m[1]]}-tekrar`;
    return id;
  }
  // Anahtarları yeni id'lere taşır; hedef zaten doluysa eski anahtar da yerinde kalır (hiçbir kayıt silinmez)
  function anahtarCevir(obj, rapor, alan) {
    const sonuc = {};
    for (const [k, v] of Object.entries(obj)) {
      const y = idCevir(k);
      if (y !== k && !(y in obj) && !(y in sonuc)) { sonuc[y] = v; rapor.push(`${alan}: ${k} → ${y}`); } else sonuc[k] = v;
    }
    return sonuc;
  }

  // Sürüm adımları: ADIMLAR[n] kaydı n'den n+1'e taşır
  const ADIMLAR = {
    1: (v) => {
      // v1: sürüm alanı yoktu; yeni alanlar (ara sınav, soru imzaları, bilinen bölümler) eksik olabilir
      v.araSinavlar = dizi(v.araSinavlar);
      v.gorulenAraSinav = dizi(v.gorulenAraSinav);
      v.ogeImza = nesne(v.ogeImza);
      v.bilinenBolumler = dizi(v.bilinenBolumler);
      return v;
    },
  };

  // ham: localStorage'dan / dosyadan okunan kayıt. Döndürür: { veri, degisti, rapor[], eskiSurum, yeniBolumler[] }
  let IMZA_ONBELLEK = null; // müfredatın yüklendiği andaki imzalar
  function gocEt(ham, uniteler = UNITELER) {
    const rapor = [];
    const v = { ...varsayilan(), ...nesne(JSON.parse(JSON.stringify(ham ?? {}))) };
    const eskiSurum = Number.isInteger(ham?.schemaVersion) ? ham.schemaVersion : 1;
    if (eskiSurum > SURUM) rapor.push(`Kayıt daha yeni bir sürümden (v${eskiSurum}); dokunulmadan kullanılıyor`);
    for (let s = eskiSurum; s < SURUM; s++) { ADIMLAR[s]?.(v); rapor.push(`Şema v${s} → v${s + 1}`); }
    v.schemaVersion = Math.max(SURUM, eskiSurum);

    // Tip onarımı: bozuk alan varsa varsayılana dön (eski değer yedekte kalır)
    const vs = varsayilan();
    for (const [k, d] of Object.entries(vs)) {
      if (Array.isArray(d) ? !Array.isArray(v[k]) : typeof d === "object" ? typeof v[k] !== "object" || v[k] === null || Array.isArray(v[k]) : typeof v[k] !== typeof d) {
        if (v[k] !== undefined) rapor.push(`Bozuk alan onarıldı: ${k}`);
        v[k] = d;
      }
    }

    // 1) Değişen ders/bölüm/alıştırma id'leri
    for (const alan of ["tamamlanan", "sureler", "konular", "ogeler", "ogeImza", "kodlar"]) v[alan] = anahtarCevir(v[alan], rapor, alan);

    // 2) Soru sırası kaydıysa: kayıtlı imzayı bugünkü müfredatta bul, ustalığı oraya taşı
    const guncel = typeof UNITELER !== "undefined" && uniteler === UNITELER
      ? (IMZA_ONBELLEK ||= soruImzalari(uniteler)) : soruImzalari(uniteler);
    const imzadanId = new Map();
    for (const [id, im] of Object.entries(guncel)) imzadanId.set(im, imzadanId.has(im) ? null : id); // çift imza: belirsiz
    const yeniOgeler = {}, yeniImza = {}, kalanlar = [];
    for (const [id, o] of Object.entries(v.ogeler)) {
      const eski = v.ogeImza[id];
      const hedef = eski && guncel[id] !== eski ? imzadanId.get(eski) : null;
      if (hedef && hedef !== id && !(hedef in yeniOgeler)) {
        yeniOgeler[hedef] = o; yeniImza[hedef] = eski; rapor.push(`soru taşındı: ${id} → ${hedef}`);
      } else kalanlar.push([id, o]);
    }
    for (const [id, o] of kalanlar) {
      if (id in yeniOgeler) {
        // Yerine başka soru taşındı: bu kaydı silme, ayrı anahtarda sakla
        const k = `${id}@${v.ogeImza[id] || "eski"}`;
        yeniOgeler[k] = o;
        if (v.ogeImza[id]) yeniImza[k] = v.ogeImza[id];
        rapor.push(`soru kaydı korundu: ${id} → ${k}`);
      } else {
        yeniOgeler[id] = o;
        // Yerinde kalan soru: imzası yoksa (v1) ya da içeriği düzeltildiyse bugünkü imzayı alır; müfredatta yoksa eski imza kalır
        const im = guncel[id] || v.ogeImza[id];
        if (im) yeniImza[id] = im;
      }
    }
    v.ogeler = yeniOgeler;
    v.ogeImza = yeniImza;

    // 3) Yeni bölümler (ör. Pandas, Homework 1): boş ilerlemeyle eklenir; mevcut kayıtlara dokunulmaz
    const bilinen = new Set(v.bilinenBolumler);
    const yeniBolumler = uniteler.map((u) => u.id).filter((id) => !bilinen.has(id));
    // v1'de bölüm listesi tutulmuyordu: o kayıtta her bölüm "yeni" görünür, raporlanmaz
    if (yeniBolumler.length && eskiSurum >= 2) rapor.push(`Yeni bölüm(ler) boş ilerlemeyle eklendi: ${yeniBolumler.join(", ")}`);
    v.bilinenBolumler = [...v.bilinenBolumler, ...yeniBolumler];

    const degisti = eskiSurum !== v.schemaVersion || rapor.some((r) => !r.startsWith("Yeni bölüm"));
    return { veri: v, degisti, rapor, eskiSurum, yeniBolumler };
  }

  // ---------------------------------------------------------------- yedekler
  function yerelYedekler() { try { return JSON.parse(localStorage.getItem(YEDEK_ANAHTAR) || "[]"); } catch { return []; } }
  function yerelYedekYaz(l) { try { localStorage.setItem(YEDEK_ANAHTAR, JSON.stringify(l.slice(-3))); return true; } catch { return false; } }
  // Ham kaydı önce bu tarayıcıda saklar, sonra sunucuya (veri/yedekler/yedek-<tarih>-<sebep>.json) gönderir
  function yedekAl(ham, sebep) {
    const y = { tarih: new Date().toISOString(), sebep, ilerleme: ham, sunucuda: false };
    yerelYedekYaz([...yerelYedekler(), y]);
    return yedekleriGonder();
  }
  async function yedekleriGonder() {
    const l = yerelYedekler();
    let sonDosya = null;
    for (const y of l.filter((x) => !x.sunucuda)) {
      try {
        const r = await (await fetch("/api/ilerleme/yedek", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(y) })).json();
        if (r.tamam) { y.sunucuda = true; sonDosya = r.dosya; }
      } catch { break; }
    }
    yerelYedekYaz(l);
    return sonDosya;
  }

  // ---------------------------------------------------------------- yükleme (açılışta, eşzamanlı)
  let GOC = null; // son göçün raporu (konsol + ilerleme kartı)
  function yukle() {
    let hamMetin = null, ham = {};
    try { hamMetin = localStorage.getItem(ANAHTAR); ham = JSON.parse(hamMetin || "{}"); } catch { ham = {}; }
    const g = gocEt(ham);
    GOC = { ...g, tarih: Date.now(), bos: !hamMetin };
    if (hamMetin && g.degisti) {
      yedekAl(ham, `goc-v${g.eskiSurum}-v${g.veri.schemaVersion}`); // yerel kopya hemen, sunucu kopyası arka planda
      try { localStorage.setItem(ANAHTAR, JSON.stringify(g.veri)); } catch { /* depolama kapalı */ }
    }
    if (g.rapor.length) console.info("[se422] İlerleme göçü:", g.rapor.join(" · "));
    return g.veri;
  }

  // ---------------------------------------------------------------- sunucu kopyası (birleştirme)
  const SK = { hazir: false, zamanlayici: null, son: null, hata: false };
  // durum nesnesinin içeriğini (aynı nesne kalsın diye) yenisiyle değiştirir
  function durumuDegistir(durum, yeni) {
    for (const k of Object.keys(durum)) delete durum[k];
    Object.assign(durum, yeni);
  }
  async function gonder(durum, geriDon = false) {
    const r = await fetch("/api/ilerleme", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ilerleme: durum, geriDon }) });
    if (!r.ok) throw new Error(`Sunucu hatası (${r.status})`);
    const j = await r.json();
    if (!j.tamam) throw new Error(j.hata || "kaydedilemedi");
    SK.son = Date.now(); SK.hata = false;
    return j;
  }
  // Açılışta: bu tarayıcının kaydını sunucudakiyle birleştir, birleşik hali benimse
  async function esitle(durum, yerelKaydet, yenile) {
    try {
      const j = await gonder(durum, true);
      const birlesik = gocEt(j.ilerleme).veri;
      if (JSON.stringify(birlesik) !== JSON.stringify(durum)) {
        durumuDegistir(durum, birlesik);
        yerelKaydet();
        yenile();
      }
    } catch { SK.hata = true; }
    SK.hazir = true;
    yedekleriGonder();
  }
  // Her kaydette çağrılır: 3 sn sessizlikten sonra sunucuya gönderir
  function planla(durum) {
    if (!SK.hazir) return;
    clearTimeout(SK.zamanlayici);
    SK.zamanlayici = setTimeout(() => gonder(durum).catch(() => { SK.hata = true; }), 3000);
  }
  function hemenGonder(durum) {
    if (!SK.hazir || !SK.zamanlayici) return;
    clearTimeout(SK.zamanlayici); SK.zamanlayici = null;
    navigator.sendBeacon?.("/api/ilerleme", new Blob([JSON.stringify({ ilerleme: durum })], { type: "application/json" }));
  }

  // ---------------------------------------------------------------- dışa / içe aktarma
  function disaAktarVeri(durum, notlar) {
    return { uygulama: "se422", tur: "ilerleme-yedegi", schemaVersion: SURUM, disaAktarim: new Date().toISOString(), ilerleme: durum, notlar };
  }
  // Dosyadaki ilerlemeyi bulur: dışa aktarım dosyası, yedek dosyası (veri/yedekler) ya da ham localStorage kaydı
  function dosyadanIlerleme(j) {
    if (!j || typeof j !== "object") return null;
    if (j.ilerleme && typeof j.ilerleme === "object") return j.ilerleme;
    if ("tamamlanan" in j || "ogeler" in j || "xp" in j) return j;
    return null;
  }

  return { ANAHTAR, SURUM, ID_ESLESME, gocEt, soruImzalari, yukle, yedekAl, yedekleriGonder, esitle, planla, hemenGonder, gonder,
    durumuDegistir, disaAktarVeri, dosyadanIlerleme, imza: (id) => (IMZA_ONBELLEK ||= soruImzalari(UNITELER))[id], goc: () => GOC, sunucu: SK };
})();
if (typeof module !== "undefined") module.exports = KAYIT;
