// Müfredat ortak tanımları — SE 422 Introduction to Data Science (15 slayt destesi)
//
// Her ünite bir slayt destesine, her ders bir slayt aralığına karşılık gelir.
// "slayt: [a, b]" a'dan b'ye kadar olan slaytları kapsar (testler.py tüm slaytların kapsandığını doğrular).
//
// Adım tipleri ve kısa yardımcıları (ilk seçenek her zaman doğru cevaptır, arayüz karıştırır):
//   O  → ogren       anlatım kartı
//   S  → secmeli     çoktan seçmeli
//   C  → secmeli     "Bu kod ne yazdırır?" (cikti: true → doğru seçenek gerçek çıktıyla test edilir)
//   Y  → yaz         çıktıyı yazma (gerçek çıktıyla test edilir)
//   DY → dogruyanlis doğru/yanlış
//   B  → bosluk      kelime kutucuklarıyla boşluk doldurma ("___" boşluk)
//   SR → sirala      parçaları sıraya dizme
//   E  → eslestir    eşleri bulma
//   K  → kod         gerçek kod yazma, sunucuda otomatik kontrol (alistirmalar.py)

const UNITELER = [];

const O = (baslik, slayt, metin, ek = {}) => ({ tip: "ogren", baslik, slayt, metin, ...ek });
const S = (soru, secenekler, aciklama, ek = {}) => ({ tip: "secmeli", soru, secenekler, dogru: 0, aciklama, ...ek });
const C = (kod, secenekler, aciklama) => ({ tip: "secmeli", soru: "Bu kod ne yazdırır?", kod, secenekler, dogru: 0, aciklama, cikti: true });
const Y = (kod, cevap, aciklama) => ({ tip: "yaz", soru: "Bu kod ne yazdırır?", kod, cevaplar: [cevap], aciklama, cikti: true });
const DY = (ifade, dogru, aciklama) => ({ tip: "dogruyanlis", ifade, dogru, aciklama });
const B = (soru, metin, bosluklar, kelimeler, aciklama, kodDegil = false) => ({ tip: "bosluk", soru, metin, bosluklar, kelimeler, aciklama, kodDegil });
const SR = (soru, parcalar, ekstra, ayrac, aciklama) => ({ tip: "sirala", soru, parcalar, ekstra, ayrac, aciklama });
const E = (...ciftler) => ({ tip: "eslestir", ciftler });
const K = (alistirma, slayt) => ({ tip: "kod", alistirma, slayt });

const CIZIM = {
  listePointer: `
    <svg class="cizim-svg" viewBox="0 0 380 190" role="img" aria-label="Python listesi bellekte dağınık nesnelere işaret eder">
      <text x="10" y="18" class="c-baslik">Python listesi (pointer dizisi)</text>
      <rect x="10" y="30" width="54" height="44" rx="8" class="c-kutu"/><circle cx="37" cy="52" r="5" class="c-nokta"/>
      <rect x="64" y="30" width="54" height="44" rx="8" class="c-kutu"/><circle cx="91" cy="52" r="5" class="c-nokta"/>
      <rect x="118" y="30" width="54" height="44" rx="8" class="c-kutu"/><circle cx="145" cy="52" r="5" class="c-nokta"/>
      <path d="M37 57 C 40 120, 70 140, 95 150" class="c-ok"/>
      <path d="M91 57 C 140 70, 220 40, 262 48" class="c-ok"/>
      <path d="M145 57 C 180 110, 220 120, 250 128" class="c-ok"/>
      <rect x="95" y="136" width="64" height="34" rx="8" class="c-nesne"/><text x="127" y="158" class="c-yazi">5</text>
      <rect x="262" y="30" width="96" height="34" rx="8" class="c-nesne"/><text x="310" y="52" class="c-yazi">"elma"</text>
      <rect x="250" y="112" width="70" height="34" rx="8" class="c-nesne"/><text x="285" y="134" class="c-yazi">2.5</text>
      <text x="190" y="184" class="c-not">bellekte dağınık duran nesneler</text>
    </svg>`,
  bitisik: `
    <div class="bellek">
      <div class="bellek-etiket">ndarray: tek, bitişik bellek bloğu</div>
      <div class="bellek-satir"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
      <div class="bellek-alt">her eleman aynı tip → aynı boyut (ör. 8 bayt)</div>
    </div>`,
  eksenler: `
    <div class="eksen-cizim">
      <div class="eksen-ok yatay">axis 1 → sütunlar</div>
      <div class="eksen-govde">
        <div class="eksen-ok dikey">axis 0<br>↓<br>satırlar</div>
        <div class="izgara" style="--sutun:3"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
      </div>
    </div>`,
  indeks2d: `
    <div class="eksen-cizim">
      <div class="izgara-etiketli">
        <span></span><b>0</b><b>1</b><b>2</b>
        <b>0</b><span>1</span><span>2</span><span>3</span>
        <b>1</b><span>4</span><span>5</span><span class="vurgulu">6</span>
        <b>2</b><span>7</span><span>8</span><span>9</span>
      </div>
      <div class="bellek-alt">m[1, 2] → 1. satır, 2. sütun → <b>6</b></div>
    </div>`,
  view: `
    <div class="bellek">
      <div class="bellek-etiket">a = np.arange(6) → veri tamponu (data buffer)</div>
      <div class="bellek-satir"><span>0</span><span class="pencere">1</span><span class="pencere">2</span><span class="pencere">3</span><span>4</span><span>5</span></div>
      <div class="bellek-alt">v = a[1:4] kendi verisi olmayan bir <b>pencere</b>dir. v değişirse a da değişir.</div>
    </div>`,
  birim: `
    <div class="eksen-cizim">
      <div class="izgara" style="--sutun:3"><span class="vurgulu">1</span><span>0</span><span>0</span><span>0</span><span class="vurgulu">1</span><span>0</span><span>0</span><span>0</span><span class="vurgulu">1</span></div>
      <div class="bellek-alt">Birim matris: ana köşegende 1, diğer her yerde 0</div>
    </div>`,
  maske: `
    <div class="bellek">
      <div class="bellek-etiket">data = [3 8 2 7 1 6 0 4] · mask = data &gt; 4</div>
      <div class="bellek-satir"><span>3</span><span class="pencere">8</span><span>2</span><span class="pencere">7</span><span>1</span><span class="pencere">6</span><span>0</span><span>4</span></div>
      <div class="bellek-alt">True olan yerler seçilir → data[mask] = <b>[8 7 6]</b></div>
    </div>`,
  yayilim: `
    <div class="eksen-cizim">
      <div class="bellek-etiket">(3, 4) matris + (4,) vektör → vektör 3 satıra "esnetilir"</div>
      <div class="izgara" style="--sutun:4"><span>0</span><span>1</span><span>2</span><span>3</span><span class="soluk">0</span><span class="soluk">1</span><span class="soluk">2</span><span class="soluk">3</span><span class="soluk">0</span><span class="soluk">1</span><span class="soluk">2</span><span class="soluk">3</span></div>
      <div class="bellek-alt">Soluk satırlar bellekte kopyalanmaz; işlem sırasında sanki varmış gibi kullanılır.</div>
    </div>`,
  eksenToplam: `
    <div class="eksen-cizim">
      <div class="izgara" style="--sutun:3"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
      <div class="bellek-alt">sum(axis=0) → sütun sütun: <b>[5 7 9]</b> · sum(axis=1) → satır satır: <b>[6 15]</b></div>
    </div>`,
};
