// Küçük Python kod editörü (harici kütüphane yok, internetsiz çalışır)
// textarea + arkasında renklendirilmiş <pre> katmanı + satır numaraları.
// Özellikler: Python renklendirme, otomatik girinti, Tab/Shift+Tab (4 boşluk), Ctrl/Cmd+Enter ile çalıştır,
// hata satırını vurgulama. Ayrıca Python traceback'leri için sade Türkçe açıklamalar (hataAciklamasi).

const PY_KELIMELER = new Set(("False None True and as assert async await break class continue def del elif else except finally for from " +
  "global if import in is lambda nonlocal not or pass raise return try while with yield match case").split(" "));
const PY_YERLESIK = new Set(("print len range int float str list dict set tuple bool type input open sum min max abs round sorted " +
  "enumerate zip map filter isinstance super self object reversed any all repr format hasattr getattr id").split(" "));

// Python kodunu [sınıf, metin] parçalarına ayırır
function pythonParcala(kod) {
  const desen = /([rRbBfFuU]{0,2}"""[\s\S]*?(?:"""|$)|[rRbBfFuU]{0,2}'''[\s\S]*?(?:'''|$)|[rRbBfFuU]{0,2}"(?:\\.|[^"\\\n])*"?|[rRbBfFuU]{0,2}'(?:\\.|[^'\\\n])*'?)|(#[^\n]*)|(@[A-Za-z_][\w.]*)|\b(\d+(?:\.\d*)?(?:[eE][+-]?\d+)?j?|0[xX][0-9a-fA-F]+)\b|([A-Za-z_]\w*)/g;
  const parcalar = [];
  let son = 0, m;
  while ((m = desen.exec(kod))) {
    if (m.index > son) parcalar.push(["", kod.slice(son, m.index)]);
    let sinif = "";
    if (m[1]) sinif = "k-metin";
    else if (m[2]) sinif = "k-yorum";
    else if (m[3]) sinif = "k-dekorator";
    else if (m[4]) sinif = "k-sayi";
    else if (m[5]) {
      const ad = m[5];
      const sonraki = kod.slice(desen.lastIndex).match(/^\s*\(/);
      const onceki = kod.slice(0, m.index).match(/(def|class)\s+$/);
      if (PY_KELIMELER.has(ad)) sinif = "k-kelime";
      else if (onceki) sinif = "k-tanim";
      else if (PY_YERLESIK.has(ad)) sinif = "k-yerlesik";
      else if (sonraki) sinif = "k-fonk";
    }
    parcalar.push([sinif, m[0]]);
    son = desen.lastIndex;
  }
  if (son < kod.length) parcalar.push(["", kod.slice(son)]);
  return parcalar;
}

function pythonHtml(kod) {
  const kacisE = (m) => m.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  return pythonParcala(kod).map(([s, m]) => (s ? `<span class="${s}">${kacisE(m)}</span>` : kacisE(m))).join("");
}

function kodEditoru(kap, { deger = "", onCalistir, onDegis, etiket = "Python kodu" } = {}) {
  kap.classList.add("ed");
  kap.innerHTML = `<div class="ed-satirlar" aria-hidden="true"></div>
    <div class="ed-alan">
      <div class="ed-hata-cizgi" hidden></div>
      <pre class="ed-renk" aria-hidden="true"></pre>
      <textarea class="ed-girdi" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="${etiket}"></textarea>
    </div>`;
  const ta = kap.querySelector(".ed-girdi");
  const renk = kap.querySelector(".ed-renk");
  const satirlar = kap.querySelector(".ed-satirlar");
  const cizgi = kap.querySelector(".ed-hata-cizgi");
  let hataSatiri = null;

  function ciz() {
    // Sondaki satır sonunun görünmesi için bir boşluk eklenir
    renk.innerHTML = pythonHtml(ta.value) + "\n ";
    const n = ta.value.split("\n").length;
    let html = "";
    for (let i = 1; i <= n; i++) html += `<div class="${i === hataSatiri ? "hata" : ""}">${i}</div>`;
    satirlar.innerHTML = html;
    kaydir();
  }
  function kaydir() {
    renk.scrollTop = ta.scrollTop;
    renk.scrollLeft = ta.scrollLeft;
    satirlar.scrollTop = ta.scrollTop;
    if (hataSatiri) {
      const stil = getComputedStyle(ta);
      const sy = parseFloat(stil.lineHeight);
      cizgi.style.top = `${parseFloat(stil.paddingTop) + (hataSatiri - 1) * sy - ta.scrollTop}px`;
      cizgi.style.height = `${sy}px`;
    }
  }
  function ekle(metin) {
    // execCommand geri al (Ctrl+Z) geçmişini korur; desteklenmezse setRangeText
    ta.focus();
    if (!document.execCommand || !document.execCommand("insertText", false, metin)) {
      ta.setRangeText(metin, ta.selectionStart, ta.selectionEnd, "end");
    }
  }
  function satirBasi(i) { return ta.value.lastIndexOf("\n", i - 1) + 1; }

  ta.addEventListener("input", () => { hataSatiri = null; cizgi.hidden = true; ciz(); onDegis?.(ta.value); });
  ta.addEventListener("scroll", kaydir);
  ta.addEventListener("keydown", (e) => {
    e.stopPropagation(); // ders ekranının Enter kısayolları tetiklenmesin
    const { selectionStart: bas, selectionEnd: son, value } = ta;
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onCalistir?.(); return; }
    if (e.key === "Escape") { kap.dispatchEvent(new CustomEvent("ed-kacis", { bubbles: true })); return; }
    if (e.key === "Tab") {
      e.preventDefault();
      const ilk = satirBasi(bas);
      if (bas === son && !e.shiftKey) { ekle("    "); return; }
      // Seçili satırları girintile / girintiyi azalt
      const blokSon = son > bas && value[son - 1] === "\n" ? son - 1 : son;
      const parca = value.slice(ilk, blokSon);
      const yeni = parca.split("\n").map((s) => (e.shiftKey ? s.replace(/^ {1,4}/, "") : "    " + s)).join("\n");
      ta.setSelectionRange(ilk, blokSon);
      ekle(yeni);
      ta.setSelectionRange(ilk, ilk + yeni.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const satir = value.slice(satirBasi(bas), bas);
      let girinti = satir.match(/^[ \t]*/)[0];
      const temiz = satir.replace(/#.*$/, "").trimEnd();
      if (temiz.endsWith(":")) girinti += "    ";
      else if (/^\s*(return|pass|break|continue|raise)\b/.test(satir)) girinti = girinti.slice(0, Math.max(0, girinti.length - 4));
      ekle("\n" + girinti);
      return;
    }
    if (e.key === "Backspace" && bas === son && bas > 0) {
      const once = value.slice(satirBasi(bas), bas);
      if (once.length && /^ +$/.test(once) && once.length % 4 === 0) {
        e.preventDefault();
        ta.setSelectionRange(bas - 4, bas);
        ekle("");
      }
    }
  });

  const editor = {
    deger: () => ta.value,
    ayarla(kod) {
      ta.value = kod;
      hataSatiri = null;
      cizgi.hidden = true;
      ciz();
      onDegis?.(kod);
    },
    odak() { ta.focus(); },
    hataGoster(n) {
      hataSatiri = n && n >= 1 && n <= ta.value.split("\n").length ? n : null;
      cizgi.hidden = !hataSatiri;
      ciz();
      if (hataSatiri) {
        const sy = parseFloat(getComputedStyle(ta).lineHeight);
        const hedef = (hataSatiri - 1) * sy;
        if (hedef < ta.scrollTop || hedef > ta.scrollTop + ta.clientHeight - sy * 2) ta.scrollTop = Math.max(0, hedef - ta.clientHeight / 3);
        kaydir();
      }
    },
    textarea: ta,
  };
  ta.value = deger;
  ciz();
  new ResizeObserver(kaydir).observe(ta);
  return editor;
}

// ============================================================
// Hata açıklamaları: traceback'in son satırından sade Türkçe açıklama
// ============================================================
function hataAciklamasi(tip, mesaj = "") {
  const ad = (m) => (mesaj.match(m) || [])[1];
  const kurallar = {
    SyntaxError: () => {
      if (/unterminated string|EOL while scanning|EOF while scanning triple/.test(mesaj)) return "Bir string'in tırnağı kapatılmamış. Açtığın tırnağı (' veya \") aynı satırda kapat.";
      if (/was never closed|unexpected EOF/.test(mesaj)) return "Açılan bir parantez, köşeli parantez veya süslü parantez kapatılmamış.";
      if (/expected ':'/.test(mesaj)) return "if, for, while, def, class gibi satırların sonuna iki nokta (:) konmalı.";
      if (/cannot assign|can't assign/.test(mesaj)) return "Atamanın solunda bir değişken adı olmalı. Karşılaştırma yapıyorsan = yerine == kullan.";
      return "Python kodun yazımını anlayamadı: eksik iki nokta (:), kapanmamış parantez/tırnak, = yerine == veya yanlış yazılmış bir anahtar kelime olabilir. İşaretli satıra ve bir öncekine bak.";
    },
    IndentationError: () => {
      if (/expected an indented block/.test(mesaj)) return "İki nokta (:) ile biten satırdan sonra gelen blok içeri girintilenmeli (genellikle 4 boşluk).";
      if (/unexpected indent/.test(mesaj)) return "Bu satır gereksiz yere içeri girintilenmiş. Aynı bloktaki satırlar aynı hizada başlamalı.";
      if (/unindent does not match/.test(mesaj)) return "Girinti önceki satırların hiçbiriyle hizalı değil. Aynı bloktaki satırlar aynı sayıda boşlukla başlamalı.";
      return "Girinti hatası: Python blokları girintiyle belirler; aynı bloktaki satırlar aynı hizada olmalı.";
    },
    TabError: () => "Girintide sekme (Tab) ve boşluk karışık kullanılmış. Hep 4 boşluk kullan.",
    NameError: () => {
      const n = ad(/name '([^']+)' is not defined/);
      if (n && ["math", "random", "os", "sys", "time", "sqlite3", "pickle", "io", "json"].includes(n)) return `${n} modülü içe aktarılmadan kullanılmış. Başa "import ${n}" ekle.`;
      return `${n ? `"${n}"` : "Bu ad"} tanımlı değil. Değişkene kullanmadan önce değer ata, adını büyük/küçük harf dahil doğru yaz; fonksiyonsa çağırmadan önce tanımla.`;
    },
    UnboundLocalError: () => "Fonksiyon içinde bir değişken, değer atanmadan önce kullanılmış. Global değişkeni değiştireceksen fonksiyonda \"global ad\" yaz.",
    TypeError: () => {
      if (/can only concatenate str|must be str, not|unsupported operand type/.test(mesaj)) return "Uyumsuz tipler arasında işlem yapılmış (ör. string + sayı). str(), int() veya float() ile dönüştür ya da f-string kullan.";
      if (/positional argument|required positional|unexpected keyword/.test(mesaj)) return "Fonksiyon tanımındaki parametre sayısıyla çağrıdaki argüman sayısı uyuşmuyor. Metotlarda ilk parametrenin self olduğunu unutma.";
      if (/not subscriptable/.test(mesaj)) return "Bu nesne köşeli parantezle ([ ]) indekslenemez (ör. sayı, None veya fonksiyon).";
      if (/not callable/.test(mesaj)) return "Fonksiyon olmayan bir şey parantezle çağrılmış. Değişken adın bir fonksiyon adını ezmiş olabilir.";
      if (/not iterable/.test(mesaj)) return "Bu nesne üzerinde döngü kurulamaz. Tam sayı üzerinde dönmek için range(n) kullan.";
      if (/does not support item assignment/.test(mesaj)) return "Bu nesne değiştirilemez (ör. string veya tuple); elemanına atama yapılamaz.";
      if (/unhashable/.test(mesaj)) return "Liste gibi değiştirilebilir nesneler sözlük anahtarı veya küme elemanı olamaz.";
      if (/Cannot index by location index with a non-integer key/.test(mesaj)) return "iloc yalnızca tam sayı konum kabul eder; etiketle seçmek için loc kullan.";
      return "Bir işleme veya fonksiyona yanlış tipte değer verilmiş. İşaretli satırdaki değişkenlerin tiplerini (type()) kontrol et.";
    },
    IndexError: () => "Var olmayan bir konuma erişilmiş: n elemanlı bir dizide geçerli indeksler 0 ile n−1 arasıdır.",
    KeyError: () => `Sözlükte/DataFrame'de ${mesaj ? mesaj.trim() : "bu"} anahtarı (veya sütunu) yok. Adı kontrol et; sözlükte d.get(anahtar, varsayılan) kullanabilirsin.`,
    ZeroDivisionError: () => "Bir sayı sıfıra bölünmüş. Bölmeden önce bölenin 0 olup olmadığını kontrol et.",
    ModuleNotFoundError: () => `${ad(/No module named '([^']+)'/) || "Bu modül"} bu ortamda kurulu değil. Bu terminalde Python standart kütüphanesi, numpy (np) ve pandas (pd) kullanılabilir.`,
    ImportError: () => "İçe aktarılmak istenen ad modülde bulunamadı; adını kontrol et.",
    ValueError: () => {
      if (/invalid literal for int|could not convert string to float/.test(mesaj)) return "Metin sayıya çevrilemiyor (ör. int('abc')). Girdinin gerçekten sayı olduğundan emin ol.";
      if (/truth value of an? (array|Series|DataFrame)/.test(mesaj)) return "Bir dizi/Series tek bir True/False'a indirgenemez. Koşulları birleştirmek için and/or yerine & ve | kullan, her koşulu paranteze al.";
      if (/cannot reshape|could not be broadcast|operands could not be broadcast/.test(mesaj)) return "Dizilerin şekilleri uyumsuz. reshape'te eleman sayısı korunmalı; broadcasting'de boyutlar eşit ya da 1 olmalı.";
      if (/All arrays must be of the same length/.test(mesaj)) return "DataFrame oluştururken tüm sütun listeleri aynı uzunlukta olmalı.";
      if (/too many values to unpack|not enough values to unpack/.test(mesaj)) return "Eşitliğin solundaki değişken sayısı, sağdaki değer sayısıyla uyuşmuyor.";
      return "Doğru tipte ama uygun olmayan bir değer verilmiş. Mesajdaki ayrıntıya bak.";
    },
    AttributeError: () => {
      const n = ad(/has no attribute '([^']+)'/);
      return `Bu nesnenin ${n ? `"${n}" adında bir` : "bu"} özniteliği/metodu yok. Yazımı kontrol et; nesnenin tipini type() ile, metotlarını dir() ile görebilirsin.`;
    },
    FileNotFoundError: () => "Açılmak istenen dosya yok. Dosya adını ve klasörü kontrol et; okuma ('r') modunda dosya önceden var olmalı.",
    RecursionError: () => "Fonksiyon kendini çok fazla çağırdı. Temel durum (durma koşulu) eksik ya da hiç sağlanmıyor olabilir.",
    RuntimeError: () => (/input\(\)/.test(mesaj) ? "Bu terminal girdi beklemeyen bir ortamda çalışır; input() yerine değeri doğrudan bir değişkene ata (ör. ad = 'Ada')." : "Çalışma sırasında bir hata oluştu. Mesajdaki ayrıntıya bak."),
    KeyboardInterrupt: () => "Kod durduruldu.",
    MergeError: () => "merge'in validate kontrolü başarısız: anahtarlar beklenen biçimde benzersiz değil.",
  };
  const kural = kurallar[tip] || (/Error$/.test(tip) && kurallar[tip.replace(/^.*\./, "")]);
  return kural ? kural() : null;
}

if (typeof module !== "undefined") module.exports = { pythonParcala, hataAciklamasi };
