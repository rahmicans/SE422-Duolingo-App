// Gökçen Tombul Sınav (eski adı "Ara sınav denemesi"; route/id/anahtarlar "arasinav" olarak kaldı) — Module 1: süreli, üç soru tipi (çoktan seçmeli, boşluk doldurma, tablo tamamlama).
// Sorular sunucuda üretilir (ara_sinav.py, /api/ara-sinav); kapsam static/sinav-kapsam.json'dan gelir.
// Soru ekranları uygulama.js'teki OLUSTURUCULAR ile (sınav modunda: doğru/yanlış gösterilmeden) çizilir.

// Başlıklar tek kaynaktan: sinav-kapsam.json ("1.1" … "1.5", "HW1")
const asBasliklar = () => Object.keys(KAPSAM?.basliklar || {});
const AS_TIP_ADI = { secmeli: "Çoktan seçmeli", boslukyaz: "Boşluk doldurma", tablo: "Tablo tamamlama" };
let deneme = null; // çalışan deneme sınavı

const sureMetni = (sn) => {
  const s = Math.max(0, Math.round(sn));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
const asBaslikAdi = (b) => KAPSAM?.basliklar?.[b] || b;
// Kısa etiket: "1.4 Introduction to NumPy", ödev başlıkları için yalnızca "Homework 1"
const asBaslikEtiketi = (b) => (/^\d/.test(b) ? `${b} ${asBaslikAdi(b).split(" (")[0]}` : asBaslikAdi(b).split(" (")[0]);

// Kapsam içi dersler → başlık (sunucuya gönderilir; kapsamın tek kaynağı sinav-kapsam.json)
function asKonular() {
  const o = {};
  DERSLER.forEach(({ ders, unite }) => {
    if (kapsamDers(unite, ders) === "ici") o[ders.id] = KAPSAM.uniteler[unite.id].baslik;
  });
  return o;
}

// Varsayılan ağırlık: başlıktaki kapsam içi slayt sayısı (slaytı olmayan 1.1 için en az %5;
// slaytı olmayan ödev başlıkları için sinav-kapsam.json → varsayilanAgirlik, ör. HW1 %15)
function asVarsayilanAgirliklar() {
  const AS_BASLIKLAR = asBasliklar();
  const say = Object.fromEntries(AS_BASLIKLAR.map((b) => [b, 0]));
  UNITELER.forEach((u) => {
    const ku = KAPSAM?.uniteler?.[u.id];
    if (!ku) return;
    u.dersler.forEach((d) => {
      const s = d.slayt;
      if (!s || !s.length) return;
      for (let n = s[0]; n <= s[s.length - 1]; n++) {
        const k = ku.dersler?.[d.id]?.slaytlar?.[n]?.kapsam || kapsamDers(u, d);
        if (k === "ici") say[ku.baslik] += 1;
      }
    });
  });
  const sabit = Object.fromEntries(AS_BASLIKLAR.filter((b) => !say[b] && KAPSAM?.varsayilanAgirlik?.[b] !== undefined).map((b) => [b, KAPSAM.varsayilanAgirlik[b]]));
  const kalan = 100 - Object.values(sabit).reduce((a, b) => a + b, 0);
  const toplam = Object.values(say).reduce((a, b) => a + b, 0) || 1;
  const yuzde = Object.fromEntries(AS_BASLIKLAR.map((b) => [b, sabit[b] ?? Math.max(say[b] ? 1 : 5, Math.round((kalan * say[b]) / toplam))]));
  // Toplamı 100'e tamamla (en büyük başlıktan düş/ekle)
  const fark = 100 - Object.values(yuzde).reduce((a, b) => a + b, 0);
  const enBuyuk = AS_BASLIKLAR.reduce((a, b) => (yuzde[a] >= yuzde[b] ? a : b));
  yuzde[enBuyuk] += fark;
  return { yuzde, slayt: say };
}

function asAyar() {
  const v = asVarsayilanAgirliklar().yuzde;
  const a = durum.araSinavAyar || {};
  return { adet: a.adet || 30, sure: a.sure || 60, agirliklar: { ...v, ...(a.agirliklar || {}) } };
}

// ============================================================ geri sayım (yalnızca görsel)
// Sınav: 13 Kasım 2026 16:30 Türkiye saati; saat dilimi açıkça yazılı, cihazın saat diliminden bağımsız.
const EXAM_AT = new Date("2026-11-13T16:30:00+03:00");
const EXAM_SURE_MS = 2 * 3600 * 1000; // 18:30'dan sonra "Sınav tamamlandı"
let asGeriSayimZamanlayici = null;

function asSinavTarihMetni() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", weekday: "long",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(EXAM_AT).map((x) => [x.type, x.value]));
  return `${p.day} ${p.month} ${p.weekday}, ${p.hour}:${p.minute}`;
}

// Kalan süre her çağrıda Date.now()'dan baştan hesaplanır (sayaç azaltılmaz → kayma olmaz)
function asGeriSayimDurumu(simdi = Date.now()) {
  const kalan = EXAM_AT.getTime() - simdi;
  if (kalan <= -EXAM_SURE_MS) return { evre: "bitti", kalan };
  if (kalan <= 0) return { evre: "basladi", kalan };
  return { evre: kalan < 864e5 ? "kirmizi" : kalan <= 2 * 864e5 ? "turuncu" : "normal", kalan };
}

function asGeriSayimHtml() {
  const kutu = (ad, k) => `<div class="as-gs-kutu"><b data-as-gs="${k}">00</b><span>${ad}</span></div>`;
  return `<div class="kart as-gs" id="as-geri-sayim" aria-live="off">
    <div class="as-gs-ust"><span class="as-gs-baslik">Sınava kalan</span><span class="as-gs-tarih">📅 ${asSinavTarihMetni()}</span></div>
    <div class="as-gs-kutular">${kutu("GÜN", "g")}${kutu("SAAT", "s")}${kutu("DK", "d")}${kutu("SN", "sn")}</div>
    <p class="as-gs-mesaj" id="as-gs-mesaj" hidden></p></div>`;
}

function asGeriSayimGuncelle() {
  const kart = document.getElementById("as-geri-sayim");
  if (!kart) { asGeriSayimDurdur(); return; }
  const { evre, kalan } = asGeriSayimDurumu();
  kart.dataset.evre = evre;
  const mesaj = { kirmizi: "Son gün! Bir deneme daha çöz, sonra dinlen.", basladi: "Sınav başladı — başarılar! 🍀", bitti: "Sınav tamamlandı" }[evre];
  const m = document.getElementById("as-gs-mesaj");
  m.textContent = mesaj || "";
  m.hidden = !mesaj;
  const s = Math.max(0, Math.floor(kalan / 1000));
  const iki = (n) => String(n).padStart(2, "0");
  const deger = { g: Math.floor(s / 86400), s: Math.floor(s / 3600) % 24, d: Math.floor(s / 60) % 60, sn: s % 60 };
  kart.querySelectorAll("[data-as-gs]").forEach((b) => { b.textContent = iki(deger[b.dataset.asGs]); });
  // "Önerilen kullanım" 3. adımı: 2 gün ve altı kaldıysa öne çıkar
  document.querySelector(".as-oneri-3")?.classList.toggle("vurgu", evre === "turuncu" || evre === "kirmizi");
  if (evre === "basladi" || evre === "bitti") asGeriSayimDurdur();
}

function asGeriSayimBaslat() {
  asGeriSayimDurdur();
  asGeriSayimGuncelle();
  if (asGeriSayimDurumu().evre !== "basladi" && asGeriSayimDurumu().evre !== "bitti") asGeriSayimZamanlayici = setInterval(asGeriSayimGuncelle, 1000);
}
function asGeriSayimDurdur() { clearInterval(asGeriSayimZamanlayici); asGeriSayimZamanlayici = null; }
// Sekme arka plandan dönünce hemen yeniden hesapla
document.addEventListener("visibilitychange", () => { if (!document.hidden && document.getElementById("as-geri-sayim")) asGeriSayimBaslat(); });

const AS_ACIKLAMA = `
  <details class="kart as-aciklama" id="as-aciklama">
    <summary>Bu sınav ne işe yarar?</summary>
    <ul class="as-maddeler">
      <li><span class="ikon">📝</span><span><b>Formata alışırsın:</b> Sınavdaki gibi çoktan seçmeli, boşluk doldurma ve tablo tamamlama soruları gelir; soru tipini sınavda ilk kez görmezsin.</span></li>
      <li><span class="ikon">⏱</span><span><b>Zamanını yönetmeyi çalışırsın:</b> Deneme süreli; sonunda soru başına ne kadar harcadığını ve hangi soru tipinde vakit kaybettiğini görürsün.</span></li>
      <li><span class="ikon">🎯</span><span><b>Zayıf konunu bulursun:</b> Sonuçlar konu (1.1–1.5, HW1) ve soru tipine göre ayrılır, ilerleme paneline işlenir; neye dönmen gerektiği netleşir.</span></li>
      <li><span class="ikon">⚖️</span><span><b>Ağırlıkları sen ayarlarsın:</b> Varsayılanlar slayt yoğunluğuna göre hesaplanır. Hocanın vurguladığı konu varsa (ör. sınava gömüleceği söylenen Homework 1) ağırlığını artır.</span></li>
    </ul>
    <p class="as-sinir">⚠️ Bu bir tahmin, gerçek sınav soruları değil. Sorular slaytlardan üretilir; slaytı olmayan 1.1 What is Data Science ve Pandas'taki duplicates/inconsistencies kısmı için Moodle ek materyallerine de bak.</p>
    <div class="as-oneri"><b>Önerilen kullanım</b>
      <ol>
        <li>Şimdi bir deneme çöz, başlangıç seviyeni gör.</li>
        <li>En zayıf konulara dön.</li>
        <li class="as-oneri-3">Sınavdan 1–2 gün önce tekrar çöz, farkı karşılaştır. <span class="as-simdi">Şimdi tam zamanı</span></li>
      </ol></div>
  </details>`;

// ============================================================ ayarlar sayfası
function araSinavSayfasiCiz() {
  document.title = `${MOD_ADI} · SE 422`;
  if (!KAPSAM) {
    $("#sayfa").innerHTML = `<div class="sayfa"><h1 class="sayfa-baslik">⏱️ ${MOD_ADI}</h1><div class="kart"><p>Kapsam haritası yükleniyor…</p></div></div>`;
    return;
  }
  const ayar = asAyar();
  const { slayt } = asVarsayilanAgirliklar();
  const gecmis = (durum.araSinavlar || []).slice().reverse().slice(0, 8).map((s) => `
    <div class="liste-satir"><div class="ad">%${s.yuzde} · ${s.puan}/${s.toplam} puan<small>${new Date(s.tarih).toLocaleString("tr-TR")} · ${sureMetni(s.kullanilan)} / ${s.sureDk} dk${s.otomatik ? " · süre doldu" : ""}</small></div>
      ${durumRozeti(puanDurumu(s.yuzde))}</div>`).join("");
  $("#sayfa").innerHTML = `<div class="sayfa">
    <div class="kahraman">${maskot("normal", 110)}
      <div><h1 class="sayfa-baslik">⏱️ ${MOD_ADI}</h1>
      <p class="sayfa-aciklama">Hocanın ara sınavının provası: Module 1 konularından, gerçek sınavdaki soru tipleriyle, süreli bir deneme.</p></div></div>
    ${asGeriSayimHtml()}
    ${AS_ACIKLAMA}
    <div class="kart as-ayar">
      <div class="as-ayar-satir">
        <label>Soru sayısı <input type="number" id="as-adet" min="5" max="80" value="${ayar.adet}"></label>
        <label>Süre (dk) <input type="number" id="as-sure" min="5" max="240" value="${ayar.sure}"></label>
        <span class="as-tempo" id="as-tempo-on"></span>
      </div>
      <h3 class="as-agirlik-baslik">Konu ağırlıkları</h3>
      <div class="as-agirliklar">${asBasliklar().map((b) => `<label class="as-agirlik" title="${kacis(b + " " + asBaslikAdi(b))}">
        <span class="as-agirlik-ad"><span class="as-kod">${b}</span><span>${kacis(asKisaAd(b))}<small>${slayt[b] ? `${slayt[b]} slayt kapsam içi` : /^\d/.test(b) ? "slayt yok" : "ödev"}</small></span></span>
        <span class="as-agirlik-girdi"><input type="number" min="0" max="100" data-agirlik="${b}" value="${ayar.agirliklar[b]}" aria-label="${kacis(b)} ağırlığı (%)">%</span></label>`).join("")}</div>
      <div class="as-toplam-satir">
        <span><b id="as-toplam"></b> <span class="as-toplam-uyari" id="as-toplam-uyari" hidden>Ağırlıklar başlatırken %100'e ölçeklenecek.</span></span>
        <button class="metin-btn" data-as-varsayilan>Varsayılana dön</button>
      </div>
      <p class="as-not">Varsayılan ağırlıklar kapsam haritasındaki slayt yoğunluğundan hesaplanır (slaytı olmayan 1.1 için en az %5; ödevler için kapsam haritasındaki sabit değer).</p>
      <button class="dbtn yesil genis" data-as-basla>Denemeyi başlat</button>
    </div>
    ${gecmis ? `<div class="kart"><h3>Önceki ${MOD_ADI} denemeleri</h3>${gecmis}</div>` : ""}
  </div>`;
  const tempo = () => {
    const adet = +$("#as-adet").value || 1, sure = +$("#as-sure").value || 1;
    $("#as-tempo-on").textContent = `≈ ${sureMetni((sure * 60) / adet)} / soru`;
  };
  const aciklama = $("#as-aciklama");
  aciklama.open = !durum.asAciklamaKapali;
  aciklama.addEventListener("toggle", () => { durum.asAciklamaKapali = !aciklama.open; kaydet(); });
  asGeriSayimBaslat();
  $("#as-adet").addEventListener("input", tempo);
  $("#as-sure").addEventListener("input", tempo);
  tempo();
  $$("[data-agirlik]").forEach((g) => g.addEventListener("input", asToplamGuncelle));
  asToplamGuncelle();
}

// Ayar kartı: uzun başlık adlarının kısası (tam ad title'da kalır)
function asKisaAd(b) {
  const ad = asBaslikAdi(b);
  if (b === "1.5") return ad.replace(/^Data Manipulation with /, "");
  return /^\d/.test(b) ? ad : ad.split(" (")[0];
}

// Ağırlık toplamı; 100 değilse uyarı (sunucu dagit() ağırlıkları toplamına bölerek ölçekler)
function asToplamGuncelle() {
  const t = $$("[data-agirlik]").reduce((a, g) => a + Math.max(0, +g.value || 0), 0);
  $("#as-toplam").textContent = `Toplam: %${t}`;
  $("#as-toplam-uyari").hidden = t === 100;
}

function asAyarlariOku() {
  const agirliklar = {};
  $$("[data-agirlik]").forEach((g) => { agirliklar[g.dataset.agirlik] = Math.max(0, +g.value || 0); });
  const ayar = {
    adet: Math.min(80, Math.max(5, Math.round(+$("#as-adet").value || 30))),
    sure: Math.min(240, Math.max(5, Math.round(+$("#as-sure").value || 60))),
    agirliklar,
  };
  durum.araSinavAyar = ayar;
  kaydet();
  return ayar;
}

// ============================================================ deneme ekranı
async function araSinavBaslat() {
  const ayar = asAyarlariOku();
  if (!Object.values(ayar.agirliklar).some((v) => v > 0)) { alert("En az bir konu başlığının ağırlığı 0'dan büyük olmalı."); return; }
  const btn = $("[data-as-basla]");
  btn.disabled = true;
  btn.textContent = "Sorular hazırlanıyor…";
  let yanit;
  try {
    yanit = await api("/api/ara-sinav", { adet: ayar.adet, agirliklar: ayar.agirliklar, konular: asKonular(), gorulen: durum.gorulenAraSinav || [] });
  } catch (e) {
    yanit = { hata: e.message };
  }
  btn.disabled = false;
  btn.textContent = "Denemeyi başlat";
  if (yanit.hata || !yanit.sorular?.length) { alert("Deneme oluşturulamadı: " + (yanit.hata || "soru yok")); return; }
  durum.gorulenAraSinav = [...(durum.gorulenAraSinav || []), ...yanit.sorular.map((s) => s.parmak)].slice(-4000);
  kaydet();
  denemeAc(yanit.sorular, ayar.sure);
}

function asSoruEtiketi(q) {
  const ders = dersBul(q.konu)?.ders;
  const slayt = q.slayt ? slaytYazisi(q.slayt) : ders?.slayt ? slaytYazisi(ders.slayt) : "Slayt dışı";
  const odev = /^odev(\d+)-task(\d+)$/.exec(q.kaynak || "");
  if (odev) return `Homework ${odev[1]} · Task ${odev[2]}${ders ? " · " + kacis(ders.baslik.replace(/^Task \d+:\s*/, "")) : ""}`;
  return `${kacis(asBaslikEtiketi(q.baslik))} · ${ders ? kacis(ders.baslik) + " · " : ""}${slayt}`;
}

function denemeAc(sorular, sureDk) {
  // Soru oluşturucuları global "oturum"un durumuna bakar; deneme kendi küçük oturumunu kurar
  oturum = { tur: "arasinav", hedefId: "arasinav", durum: "cevap", bitti: false, kuyruk: [], bitenler: new Set(), ilk: new Map(),
    cevaplar: [], konuHatalari: {}, yedekler: {}, ctl: null, baslangic: Date.now() };
  deneme = { sorular, sureSn: sureDk * 60, sureDk, baslangic: Date.now(), aktif: 0, girisZamani: Date.now(),
    harcanan: sorular.map(() => 0), isaretli: new Set(), ctller: [], bitti: false };
  $("#ders-katman").innerHTML = `
    <div class="ders-ekran deneme-ekran" style="${renkStil("mavi")}">
      <div class="deneme-ust">
        <button class="kapat" data-as-cik aria-label="Denemeden çık">✕</button>
        <div class="deneme-sayac" id="as-sayac" role="timer" aria-live="off">${sureMetni(deneme.sureSn)}</div>
        <div class="deneme-bilgi"><span id="as-tempo"></span><span id="as-durum"></span></div>
        <button class="dbtn yesil kucuk" data-as-teslim>Teslim et</button>
      </div>
      <div class="deneme-govde">
        <nav class="deneme-gezgin" id="as-gezgin" aria-label="Soru gezgini">${sorular.map((_, i) => `<button data-as-git="${i}">${i + 1}</button>`).join("")}</nav>
        <div class="deneme-sorular" id="as-sorular">${sorular.map((q, i) => `<section class="as-soru" data-as-soru="${i}" hidden>
          <div class="as-meta">Soru ${i + 1}/${sorular.length} · ${AS_TIP_ADI[q.tip] || q.tip} · ${asSoruEtiketi(q)}</div><div class="adim"></div></section>`).join("")}</div>
      </div>
      <div class="deneme-alt">
        <button class="dbtn beyaz kucuk" data-as-onceki>← Önceki</button>
        <button class="dbtn beyaz kucuk" data-as-isaretle>⚑ İşaretle</button>
        <button class="dbtn mavi kucuk" data-as-sonraki>Sonraki →</button>
      </div>
    </div>`;
  document.body.style.overflow = "hidden";
  // Her soru bir kez çizilir; gezinirken cevaplar korunur
  sorular.forEach((q, i) => {
    const ctl = OLUSTURUCULAR[q.tip](q, true);
    const kap = $(`[data-as-soru="${i}"] .adim`);
    kap.innerHTML = ctl.html;
    ctl.baglan?.(kap, asDurumGuncelle);
    deneme.ctller.push(ctl);
  });
  asGoster(0);
  deneme.zamanlayici = setInterval(asTik, 1000);
  asTik();
}

const asCevaplandi = (i) => {
  const ctl = deneme.ctller[i];
  return ctl.bosMu ? !ctl.bosMu() : ctl.hazir();
};

function asGoster(i) {
  if (!deneme || deneme.bitti) return;
  const simdi = Date.now();
  deneme.harcanan[deneme.aktif] += (simdi - deneme.girisZamani) / 1000;
  deneme.girisZamani = simdi;
  deneme.aktif = Math.max(0, Math.min(deneme.sorular.length - 1, i));
  $$(".as-soru").forEach((s) => { s.hidden = +s.dataset.asSoru !== deneme.aktif; });
  oturum.ctl = deneme.ctller[deneme.aktif];
  $(".deneme-sorular").scrollTop = 0;
  asDurumGuncelle();
}

function asDurumGuncelle() {
  if (!deneme) return;
  const cevapli = deneme.sorular.filter((_, i) => asCevaplandi(i)).length;
  $$("#as-gezgin button").forEach((b, i) => {
    b.classList.toggle("aktif", i === deneme.aktif);
    b.classList.toggle("cevapli", asCevaplandi(i));
    b.classList.toggle("isaretli", deneme.isaretli.has(i));
  });
  $("#as-durum").textContent = `${cevapli}/${deneme.sorular.length} cevaplandı${deneme.isaretli.size ? ` · ${deneme.isaretli.size} işaretli` : ""}`;
  $("[data-as-isaretle]").textContent = deneme.isaretli.has(deneme.aktif) ? "⚑ İşareti kaldır" : "⚑ İşaretle";
  $("[data-as-onceki]").disabled = deneme.aktif === 0;
  $("[data-as-sonraki]").textContent = deneme.aktif === deneme.sorular.length - 1 ? "Teslim et ✓" : "Sonraki →";
}

function asTik() {
  if (!deneme || deneme.bitti) return;
  const gecen = (Date.now() - deneme.baslangic) / 1000;
  const kalan = deneme.sureSn - gecen;
  const sayac = $("#as-sayac");
  sayac.textContent = sureMetni(kalan);
  sayac.classList.toggle("az", kalan <= 300);
  // Zaman yönetimi: kalan süre / cevaplanmamış soru
  const bos = deneme.sorular.filter((_, i) => !asCevaplandi(i)).length;
  $("#as-tempo").textContent = bos ? `Kalan soru başına ≈ ${sureMetni(kalan / bos)}` : "Tüm sorular cevaplandı";
  if (kalan <= 0) araSinavTeslim(true);
}

async function araSinavTeslim(otomatik = false) {
  if (!deneme || deneme.bitti) return;
  const bos = deneme.sorular.filter((_, i) => !asCevaplandi(i)).length;
  if (!otomatik && !confirm(bos ? `${bos} soru boş. Yine de teslim etmek istiyor musun?` : "Denemeyi teslim etmek istiyor musun?")) return;
  deneme.bitti = true;
  clearInterval(deneme.zamanlayici);
  deneme.harcanan[deneme.aktif] += (Date.now() - deneme.girisZamani) / 1000;
  deneme.kullanilan = Math.min(deneme.sureSn, (Date.now() - deneme.baslangic) / 1000);
  deneme.otomatik = otomatik;
  sureTik();
  oturum.bitti = true;
  const sonuclar = [];
  for (let i = 0; i < deneme.sorular.length; i++) {
    const q = deneme.sorular[i], ctl = deneme.ctller[i];
    const cevapli = asCevaplandi(i);
    const s = cevapli ? await ctl.kontrol() : { dogru: false, puan: 0 };
    const puan = s.puan ?? (s.dogru ? 1 : 0);
    sonuclar.push({ q, ctl, cevapli, puan, dogru: !!s.dogru, verilen: ctl.verilen?.() || "", dogruCevap: ctl.dogruCevap?.() || "", sure: deneme.harcanan[i], detay: ctl.sonuc });
    // Ders başarısına (barem) işle: tam doğruysa doğru
    konuKaydet(q.konu, !!s.dogru, q, ctl.dogruCevap?.());
  }
  const toplamPuan = sonuclar.reduce((t, x) => t + x.puan, 0);
  const yuzde = Math.round((100 * toplamPuan) / sonuclar.length);
  durum.araSinavlar = [...(durum.araSinavlar || []), {
    tarih: Date.now(), puan: Math.round(toplamPuan * 10) / 10, toplam: sonuclar.length, yuzde,
    kullanilan: Math.round(deneme.kullanilan), sureDk: deneme.sureDk, otomatik,
  }].slice(-30);
  durum.oturumlar = [...durum.oturumlar, { t: Date.now(), tur: "arasinav", d: Math.round(toplamPuan), n: sonuclar.length, b: MOD_ADI }].slice(-60);
  xpEkle(Math.round(toplamPuan));
  kaydet();
  ses(yuzde >= 70 ? "bitti" : "yanlis");
  asSonucCiz(sonuclar, toplamPuan, yuzde);
}

function asGrup(sonuclar, anahtar, siralama) {
  const g = {};
  sonuclar.forEach((x) => { const k = anahtar(x); (g[k] = g[k] || []).push(x); });
  return siralama.filter((k) => g[k]).map((k) => {
    const liste = g[k];
    return { k, n: liste.length, yuzde: Math.round((100 * liste.reduce((t, x) => t + x.puan, 0)) / liste.length) };
  });
}

function asSonucCiz(sonuclar, toplamPuan, yuzde) {
  const satir = (etiket, y, n) => `<div class="as-oran"><span>${etiket}<small>${n} soru</small></span>
    <span class="barem-cubuk"><span class="${puanDurumu(y)}" style="width:${y}%"></span></span><b>%${y}</b></div>`;
  const tipler = asGrup(sonuclar, (x) => x.q.tip, ["secmeli", "boslukyaz", "tablo"]);
  const basliklar = asGrup(sonuclar, (x) => x.q.baslik, asBasliklar());
  const yavaslar = sonuclar.map((x, i) => ({ ...x, i })).sort((a, b) => b.sure - a.sure).slice(0, 5);
  const ortalama = deneme.kullanilan / sonuclar.length;
  const durumIkon = (x) => (x.puan === 1 ? "✓" : x.puan > 0 ? "◐" : x.cevapli ? "✗" : "—");
  const detay = (x) => {
    if (x.q.tip === "tablo" && x.detay) {
      const bos = DEGERLENDIR.bosHucreler(x.q);
      return `<ul class="as-hucreler">${bos.map((b, k) => `<li class="${x.detay.dogrular[k] ? "dogru" : "yanlis"}">${kacis(String(x.q.satirlar[b.r][0] || `satır ${b.r + 1}`))} · ${kacis(x.q.basliklar[b.c])}:
        <code>${kacis(x.ctl.girdiler[k].value.trim() || "—")}</code>${x.detay.dogrular[k] ? "" : ` → <code>${kacis(b.hucre.cevaplar[0])}</code>`}</li>`).join("")}</ul>`;
    }
    return `<div class="as-cevap">Senin cevabın: <code>${kacis(x.verilen || "—")}</code>${x.puan === 1 ? "" : ` · Doğrusu: <code>${kacis(x.dogruCevap)}</code>`}</div>`;
  };
  const sorular = sonuclar.map((x, i) => `<div class="inceleme-ogesi ${x.puan === 1 ? "dogru" : "yanlis"}">
      <div class="as-satir-ust"><b>${durumIkon(x)} Soru ${i + 1}</b> · ${AS_TIP_ADI[x.q.tip]} · ${asSoruEtiketi(x.q)} <span class="as-sure">⏱ ${sureMetni(x.sure)}</span></div>
      <div class="s">${kacis(soruMetni(x.q))}</div>
      ${x.puan < 1 ? `${detay(x)}<div class="a">${kacis(x.q.aciklama || "")}</div>
        <button class="metin-btn" data-as-calis="${kacis(x.q.konu)}">📖 Tekrar çalış: ${kacis(dersAdi(x.q.konu))}</button>` : ""}
    </div>`).join("");
  $(".deneme-ekran").innerHTML = `
    <div class="deneme-ust"><button class="kapat" data-as-kapat aria-label="Kapat">✕</button><b>${MOD_ADI} · sonuç</b><span></span>
      <button class="dbtn beyaz kucuk" data-as-yeni>Yeni deneme</button></div>
    <div class="deneme-sonuc">
      <div class="bitis">${maskot(yuzde >= 70 ? "mutlu" : "normal", 110)}
        <h1>%${yuzde} · ${Math.round(toplamPuan * 10) / 10}/${sonuclar.length} puan</h1>
        <p>${deneme.otomatik ? "⏰ Süre doldu, deneme otomatik teslim edildi. " : ""}Kullanılan süre <b>${sureMetni(deneme.kullanilan)}</b> / ${deneme.sureDk} dk ·
          soru başına ortalama <b>${sureMetni(ortalama)}</b> (planlanan ${sureMetni((deneme.sureDk * 60) / sonuclar.length)})</p>
        <p class="sure-alt">Tablo ve çok boşluklu sorular kısmi puan alır (doğru hücre / toplam hücre).</p></div>
      <div class="as-sonuc-izgara">
        <div class="kart"><h3>Soru tipine göre</h3>${tipler.map((x) => satir(AS_TIP_ADI[x.k], x.yuzde, x.n)).join("")}</div>
        <div class="kart"><h3>Konu başlığına göre</h3>${basliklar.map((x) => satir(kacis(asBaslikEtiketi(x.k)), x.yuzde, x.n)).join("")}</div>
      </div>
      <div class="kart"><h3>En çok zaman alan sorular</h3>${yavaslar.map((x) => `<div class="liste-satir"><div class="ad">Soru ${x.i + 1} · ${AS_TIP_ADI[x.q.tip]}
        <small>${asSoruEtiketi(x.q)}</small></div><span class="sayi">${sureMetni(x.sure)}</span><span>${durumIkon(x)}</span></div>`).join("")}</div>
      <h2>Sorular</h2><div class="inceleme">${sorular}</div>
    </div>`;
}

function denemeKapat() {
  if (deneme && !deneme.bitti && !confirm("Denemeden çıkarsan cevapların kaydedilmez. Çıkmak istiyor musun?")) return;
  if (deneme) clearInterval(deneme.zamanlayici);
  deneme = null;
  oturum = null;
  $("#ders-katman").innerHTML = "";
  document.body.style.overflow = "";
  yenile();
}

// ============================================================ olaylar
document.addEventListener("click", (e) => {
  const el = (s) => e.target.closest(s);
  if (el("[data-as-basla]")) { araSinavBaslat(); return; }
  if (el("[data-as-varsayilan]")) {
    const v = asVarsayilanAgirliklar().yuzde;
    $$("[data-agirlik]").forEach((g) => { g.value = v[g.dataset.agirlik]; });
    asToplamGuncelle();
    return;
  }
  if (!deneme) return;
  if (el("[data-as-git]")) { asGoster(+el("[data-as-git]").dataset.asGit); return; }
  if (el("[data-as-onceki]")) { asGoster(deneme.aktif - 1); return; }
  if (el("[data-as-sonraki]")) {
    if (deneme.aktif === deneme.sorular.length - 1) araSinavTeslim(false); else asGoster(deneme.aktif + 1);
    return;
  }
  if (el("[data-as-isaretle]")) {
    if (deneme.isaretli.has(deneme.aktif)) deneme.isaretli.delete(deneme.aktif); else deneme.isaretli.add(deneme.aktif);
    asDurumGuncelle();
    return;
  }
  if (el("[data-as-teslim]")) { araSinavTeslim(false); return; }
  if (el("[data-as-cik]") || el("[data-as-kapat]")) { denemeKapat(); return; }
  if (el("[data-as-yeni]")) { denemeKapat(); git("arasinav"); return; }
  if (el("[data-as-calis]")) { notModal(el("[data-as-calis]").dataset.asCalis); }
});
// Deneme sırasında uygulamanın ders kısayolları (Enter = Kontrol et) çalışmasın; ←/→ ile gezin
addEventListener("keydown", (e) => {
  if (!deneme || deneme.bitti || document.querySelector(".modal")) return;
  const yazilabilir = ["INPUT", "TEXTAREA"].includes(e.target.tagName);
  if (e.key === "Enter") { e.stopPropagation(); if (!yazilabilir) e.preventDefault(); return; }
  if (yazilabilir) return;
  if (e.key === "ArrowRight") { e.stopPropagation(); asGoster(deneme.aktif + 1); }
  if (e.key === "ArrowLeft") { e.stopPropagation(); asGoster(deneme.aktif - 1); }
}, true);

if (sayfa === "arasinav") yenile();
