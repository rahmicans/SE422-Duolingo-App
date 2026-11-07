// Tahmini çalışma süresi: formülün TEK kaynağı.
// Tarayıcıda global `SURE` nesnesi olarak, Node'da (testler) require("./sure.js") ile kullanılır.
// Formül ve katsayılar uygulamadaki "Bu süre nasıl hesaplandı?" penceresinde de bu nesneden okunur.

const SURE = (() => {
  // Dakika cinsinden katsayılar
  const K = {
    slayt: 0.6,          // her slaytı okumak
    kart: 0.5,           // her anlatım kartı
    kodOrnegi: 1.0,      // anlatım kartındaki kodu terminalde denemek
    ekSoru: 1.2,         // dersin sonuna eklenen 2 yeni tarz soru
    tekrar: 12 * 0.7,    // bölüm tekrarı: ~12 karışık soru
    sinav: 25 * 1.0,     // final sınavı: 25 soru
  };
  // Soru türüne göre zorluk ağırlıkları (dakika)
  const SORU = { dogruyanlis: 0.4, secmeli: 0.6, cikti: 1.0, yaz: 1.0, bosluk: 0.8, sirala: 0.8, eslestir: 0.8, kod: 8 };
  const HIZ = { enAzDers: 3, enAzSaniye: 600, enAzDersSaniye: 30, alt: 0.4, ust: 3 };

  const slaytAdedi = (s) => (!s || !s.length ? 0 : s[s.length - 1] - s[0] + 1);

  function adimSuresi(a) {
    if (a.tip === "ogren") return K.kart + (a.kod ? K.kodOrnegi : 0);
    if (a.tip === "secmeli" && a.cikti) return SORU.cikti;
    return SORU[a.tip] ?? 0.6;
  }

  // Bir dersin tahmini süresi (dakika)
  function ders(d) {
    return slaytAdedi(d.slayt) * K.slayt + d.adimlar.reduce((t, a) => t + adimSuresi(a), 0) + K.ekSoru;
  }

  // Bir bölümün tahmini: { dersler: {id: dk}, tekrar: dk, toplam: dk }
  function unite(u) {
    const dersler = {};
    let toplam = 0;
    for (const d of u.dersler) { dersler[d.id] = ders(d); toplam += dersler[d.id]; }
    return { dersler, tekrar: K.tekrar, toplam: toplam + K.tekrar };
  }

  // Kişisel hız katsayısı: tamamlanmış ve süresi ölçülmüş derslerde gerçek / tahmin.
  // ornekler: [{ tahminDk, gercekSn }] → katsayı ya da yeterli veri yoksa null
  function hizKatsayisi(ornekler) {
    const gecerli = ornekler.filter((o) => o.gercekSn >= HIZ.enAzDersSaniye && o.tahminDk > 0);
    const sn = gecerli.reduce((t, o) => t + o.gercekSn, 0);
    if (gecerli.length < HIZ.enAzDers || sn < HIZ.enAzSaniye) return null;
    const oran = sn / 60 / gecerli.reduce((t, o) => t + o.tahminDk, 0);
    return Math.min(HIZ.ust, Math.max(HIZ.alt, oran));
  }

  // Kalan süre (dakika). tamamlanan: {dugumId: true}; sinavGecti: bool; katsayi: hız katsayısı veya null
  function kalan(uniteler, tamamlanan, sinavGecti, katsayi) {
    const c = katsayi || 1;
    const bolumler = {};
    let toplam = 0;
    for (const u of uniteler) {
      const t = unite(u);
      let k = 0;
      for (const d of u.dersler) if (!tamamlanan[d.id]) k += t.dersler[d.id];
      if (!tamamlanan[`${u.id}-tekrar`]) k += t.tekrar;
      bolumler[u.id] = k * c;
      toplam += k * c;
    }
    if (!sinavGecti) toplam += K.sinav * c;
    return { toplam, bolumler, sinav: sinavGecti ? 0 : K.sinav * c };
  }

  // 47 → "47 dk", 380 → "6 sa 20 dk"; 30 dk üstü 5 dakikaya yuvarlanır
  function yazi(dk) {
    let m = Math.max(0, Math.round(dk));
    if (m > 30) m = Math.round(m / 5) * 5;
    if (m < 60) return `${m} dk`;
    const sa = Math.floor(m / 60), kalanDk = m % 60;
    return kalanDk ? `${sa} sa ${kalanDk} dk` : `${sa} sa`;
  }
  const saniyeYazisi = (sn) => (sn < 60 ? `${Math.round(sn)} sn` : yazi(sn / 60));

  return { K, SORU, HIZ, adimSuresi, ders, unite, hizKatsayisi, kalan, yazi, saniyeYazisi, slaytAdedi };
})();

if (typeof module !== "undefined") module.exports = SURE;
