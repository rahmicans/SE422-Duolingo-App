// Ara sınav soru tiplerinin değerlendirmesi (boşluk doldurma ve tablo tamamlama).
// Tarayıcıda global DEGERLENDIR; Node'da (testler, ara_sinav_kontrol.py) require ile kullanılır.
//
// Toleranslar:
//   • baştaki/sondaki ve tekrarlanan boşluklar; parantez, virgül, nokta, operatör çevresindeki boşluklar: df.dropna( ) = df.dropna()
//   • tırnak türü: 'a' = "a"
//   • cümle boşluklarında büyük/küçük harf (Türkçe kurallarıyla) ve sondaki nokta; KOD boşluklarında büyük/küçük harf DUYARLIDIR
//     (Python'da True ile true, DataFrame ile dataframe farklıdır)
//   • sayısal hücrelerde 3 = 3.0

const DEGERLENDIR = (() => {
  function cevapNormal(m, kod = false) {
    let s = String(m ?? "").normalize("NFC").trim();
    s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/"/g, "'");
    s = s.replace(/\s+/g, " ");
    s = s.replace(/\s*([()[\]{},:;=+\-*/%<>!&|.])\s*/g, "$1");
    if (!kod) s = s.toLocaleLowerCase("tr-TR").replace(/(.)[.!?]+$/, "$1"); // "!" gibi tek karakterlik cevap korunur
    return s;
  }
  const SAYI = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;
  function esit(verilen, cevaplar, { kod = false, sayisal = false } = {}) {
    const v = cevapNormal(verilen, kod);
    if (!v) return false;
    return cevaplar.some((c) => {
      const n = cevapNormal(c, kod);
      if (n === v) return true;
      if (sayisal && SAYI.test(n) && SAYI.test(v)) return Math.abs(parseFloat(n) - parseFloat(v)) < 1e-9;
      if (sayisal && /^nan$/i.test(n) && /^nan$/i.test(v)) return true;
      return false;
    });
  }
  // girdiler: her boşluk için yazılan metin
  function bosluk(adim, girdiler) {
    const dogrular = adim.bosluklar.map((kabul, i) => esit(girdiler[i], kabul, { kod: !!adim.kod }));
    const d = dogrular.filter(Boolean).length;
    return { dogrular, puan: d / dogrular.length, dogru: d === dogrular.length };
  }
  // Tablodaki boş hücreler: [{r, c, hucre}] sırasıyla; girdiler aynı sırada
  function bosHucreler(adim) {
    const sonuc = [];
    adim.satirlar.forEach((satir, r) => satir.forEach((h, c) => { if (h && typeof h === "object") sonuc.push({ r, c, hucre: h }); }));
    return sonuc;
  }
  function tablo(adim, girdiler) {
    const bos = bosHucreler(adim);
    const dogrular = bos.map(({ hucre }, i) => esit(girdiler[i], hucre.cevaplar, { kod: !!hucre.kod, sayisal: !!hucre.sayisal }));
    const d = dogrular.filter(Boolean).length;
    return { dogrular, puan: bos.length ? d / bos.length : 0, dogru: d === bos.length && bos.length > 0, toplam: bos.length };
  }
  return { cevapNormal, esit, bosluk, bosHucreler, tablo };
})();

if (typeof module !== "undefined") module.exports = DEGERLENDIR;
