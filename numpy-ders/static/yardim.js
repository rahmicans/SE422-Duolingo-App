"use strict";
// "Nasıl ilerleme korunur?" yardım sayfası (menü: 🛟 İlerleme nasıl korunur, adres: #ilerleme-yardim).
// Yeni başlayanlar için yazıldı: teknik terim yok, kısa cümleler. Metin uygulamanın gerçek davranışını anlatır
// (static/kayit.js, app.py, README). Davranış değişirse buradaki metni de güncelle.
// uygulama.js'den sonra yüklenir ($, kacis, git, sayfa, yenile).

const YARDIM_ADRES = "http://127.0.0.1:8001";

// Kopyalama butonlu kod kutusu
const yKomut = (komut) => `<div class="kod-kutu y-komut"><div class="kod-kutu-ust"><span>Komut</span>
  <button class="dbtn beyaz kucuk" data-kopyala="${kacis(komut)}" aria-label="${kacis(komut)} komutunu kopyala">⧉ Kopyala</button></div>
  <pre class="kod-blok">${kacis(komut)}</pre></div>`;
const yButon = (ad) => `<span class="y-buton">${ad}</span>`;

const YARDIM_BOLUMLER = [
  ["y-kisaca", "Kısaca"], ["y-kurallar", "3 altın kural"], ["y-guncelleme", "Güncelleme"],
  ["y-cihaz", "Başka cihaza geçiş"], ["y-yapma", "Asla yapma"], ["y-ne-oluyor", "Güncellemede ne olur?"], ["y-sss", "Sorun mu var?"],
];

function yardimCiz() {
  const icindekiler = YARDIM_BOLUMLER.map(([id, ad]) => `<button class="y-icindekiler-ogesi" data-yardim-bolum="${id}">${ad}</button>`).join("");

  const kurallar = [
    ["📁", "Güncellemeyi hep <b>aynı klasörde</b> çek.",
      "Yeni bir klasöre baştan indirme. Notların ve yedeklerin bu klasörün içindeki <b>veri</b> klasöründe durur."],
    ["🌐", `Uygulamayı hep <b>aynı adresten</b> aç: <code>${YARDIM_ADRES}</code>`,
      "<code>localhost:8001</code> aynı uygulama gibi görünür ama tarayıcı onu başka bir yer sayar. Yanlış adresten açarsan uygulama seni doğru adrese çağıran bir uyarı gösterir."],
    ["💾", "Bilgisayar ya da tarayıcı değiştireceksen <b>önce ilerlemeni dışa aktar</b>.",
      `Barem sayfasının en altındaki ${yButon("⬇ İlerlemeyi dışa aktar (JSON)")} butonuyla. Nasıl yapılacağı aşağıda.`],
  ].map(([ikon, baslik, aciklama], i) => `<div class="kart y-kural">
      <div class="y-kural-no" aria-hidden="true">${i + 1}</div>
      <div><h3>${ikon} ${baslik}</h3><p>${aciklama}</p></div></div>`).join("");

  const adimlar = [
    ["Uygulama açıksa durdur.", `Uygulamanın çalıştığı terminal penceresinde <kbd>Ctrl</kbd> + <kbd>C</kbd> tuşlarına bas.`, "",
      "Eski hâli kapanır, böylece güncellemeden sonra yeni hâliyle açabilirsin."],
    ["Uygulamanın klasörüne geç.", "Klasörünün adı farklıysa komuttaki son kısmı ona göre değiştir.", yKomut("cd ~/Desktop/Projeler/numpy-ders"),
      "Terminal, bundan sonraki komutları bu klasörde çalıştırır."],
    ["Güncellemeyi indir.", "", yKomut("git pull"),
      "Yeni bölümleri ve düzeltmeleri indirir. İlerlemene ve notlarına dokunmaz."],
    ["Gerekenleri kur ve uygulamayı başlat.", "İlk komut yalnızca gerekirse lazım; çalıştırmanın zararı yok.",
      yKomut(".venv/bin/python -m pip install -r requirements.txt") + yKomut("python3 app.py"),
      "İlki uygulamaya yeni eklenen parçaları kurar, ikincisi uygulamayı açar. Terminal penceresini kapatma; uygulama o açıkken çalışır."],
    ["Tarayıcıda uygulamayı aç.", "İlerlemen yerinde olmalı.", yKomut(YARDIM_ADRES),
      "Hep aynı adresi kullandığın için tarayıcı kaydını bulur."],
  ].map(([baslik, not, kutu, neden], i) => `<li class="y-adim"><div class="y-adim-no" aria-hidden="true">${i + 1}</div><div class="y-adim-ic">
      <h3>${baslik}</h3>${not ? `<p>${not}</p>` : ""}${kutu}
      <p class="y-neden"><b>Bu ne işe yarar?</b> ${neden}</p></div></li>`).join("");

  const sss = [
    ["İlerlemem sıfırlanmış görünüyor!", `<ol>
      <li>Adres çubuğuna bak. <code>${YARDIM_ADRES}</code> mi yazıyor?</li>
      <li>Uygulamayı doğru klasörden mi başlattın?</li>
      <li>Hâlâ boşsa Barem sayfasının en altındaki ${yButon("⬆ İçe aktar")} butonuna bas ve daha önce dışa aktardığın dosyayı seç.
        O dosya yoksa uygulama klasöründeki <b>veri → yedekler</b> klasöründen en yeni dosyayı seçebilirsin.</li></ol>`],
    ["“git pull” hata verdi.", `<p>Panik yapma, ilerlemen yerinde. Kendi kendine dosya silme, klasörü de baştan indirme.
      Bir şey denemeden önce Barem sayfasından ilerlemeni dışa aktar.</p>`],
    ["“Address already in use” hatası çıktı.", `<p>Bu, uygulamanın zaten açık olduğu anlamına gelir. Açık kalan terminal penceresini bul ve orada <kbd>Ctrl</kbd> + <kbd>C</kbd> tuşlarına bas.</p>
      <p>Pencereyi bulamazsan uygulamayı şu komutla bul:</p>${yKomut("lsof -i :8001")}
      <p>Çıkan listede <b>PID</b> sütunundaki sayıyı al. Aşağıdaki komutta 12345 yerine o sayıyı yaz:</p>${yKomut("kill 12345")}
      <p>Sonra uygulamayı yeniden başlat.</p>`],
  ].map(([soru, cevap]) => `<details class="kart y-soru"><summary>${soru}</summary><div class="y-cevap">${cevap}</div></details>`).join("");

  $("#sayfa").innerHTML = `<div class="sayfa genis-sayfa yardim-sayfa">
    <div class="kahraman">${maskot("mutlu", 100)}
      <div><h1 class="sayfa-baslik">Nasıl ilerleme korunur?</h1>
      <p class="sayfa-aciklama">Güncelleme alırken ya da bilgisayar değiştirirken ilerlemeni kaybetmemen için bilmen gerekenler.</p></div></div>
    <nav class="y-icindekiler" aria-label="Bu sayfadaki bölümler">${icindekiler}</nav>

    <section id="y-kisaca" class="y-kisaca">
      <div class="y-kisaca-ikon" aria-hidden="true">🛟</div>
      <p>İlerlemen (bitirdiğin dersler, XP ve serin, notların, deneme sonuçların) <b>GitHub'a gitmez</b>.
      Sadece senin bilgisayarında durur: hem tarayıcında hem de uygulama klasöründeki <b>veri</b> klasöründe.
      Güncelleme çekmek onu silmez. Yeter ki aşağıdaki 3 kurala uy.</p>
    </section>

    <h2 class="bolum-baslik" id="y-kurallar">⭐ 3 altın kural</h2>
    <div class="y-kurallar">${kurallar}</div>

    <h2 class="bolum-baslik" id="y-guncelleme">🔄 Güncelleme nasıl alınır?</h2>
    <p class="sayfa-aciklama">Mac'te <b>Terminal</b> uygulamasını aç ve sırayla şunları yap.</p>
    <ol class="y-adimlar">${adimlar}</ol>

    <h2 class="bolum-baslik" id="y-cihaz">💻 Başka bilgisayara ya da tarayıcıya geçerken</h2>
    <div class="y-iki-sutun">
      <div class="kart"><h3>📤 Eski cihazda</h3><ol>
        <li>Uygulamada <b>Barem</b> sayfasını aç ve en alttaki <b>💾 İlerleme yedeği</b> kutusuna in.</li>
        <li>${yButon("⬇ İlerlemeyi dışa aktar (JSON)")} butonuna bas.</li>
        <li><code>se422-ilerleme-…json</code> adlı bir dosya iner. Notların da içinde.</li>
        <li>Bu dosyayı kendine e-postayla gönder ya da Drive'a koy.</li></ol></div>
      <div class="kart"><h3>📥 Yeni cihazda</h3><ol>
        <li>Uygulamayı kur ve aç.</li>
        <li><b>Barem</b> sayfasının en altındaki <b>💾 İlerleme yedeği</b> kutusuna in.</li>
        <li>${yButon("⬆ İçe aktar")} butonuna bas ve dosyayı seç.</li>
        <li>Bitti! Orada zaten bir ilerlemen varsa silinmez, ikisi birleşir.</li></ol></div>
    </div>

    <h2 class="bolum-baslik" id="y-yapma">🚫 Asla yapma</h2>
    <div class="y-yapma">
      <p>❌ Uygulama klasöründeki <b>veri</b> klasörünü silme ya da başka yere taşıma. Notların ve yedeklerin orada.</p>
      <p>❌ Tarayıcı geçmişini temizlerken <b>“Çerezler ve diğer site verileri”</b> kutusunu işaretleme. İlerlemenin bir kopyası tarayıcında durur.</p>
      <p>❌ “Bir şey bozuldu” diye klasörü silip baştan indirme. Önce ilerlemeni dışa aktar.</p>
    </div>

    <h2 class="bolum-baslik" id="y-ne-oluyor">😌 Güncellemede ne olur?</h2>
    <div class="kart y-ne-oluyor">
      <p>Uygulamaya yeni bir bölüm eklendiğinde (ör. Pandas, Ödev 1) bu bölüm senin kaydına boş olarak eklenir.
      Eski kaydının biçimi değiştiyse uygulama onu açılışta kendiliğinden yeni hâline uyarlar.
      Bunu yapmadan önce bir yedek alır ve <b>hiçbir kaydı silmez</b>.</p>
      <p>Yedekler uygulama klasöründe <b>veri → yedekler</b> klasöründe durur. Uygulama ayrıca her gün bir yedek alır ve son 14 günü saklar.</p>
    </div>

    <h2 class="bolum-baslik" id="y-sss">🙋 Sorun mu var?</h2>
    <div class="y-sss">${sss}</div>
  </div>`;
}

document.addEventListener("click", async (e) => {
  const bolum = e.target.closest("[data-yardim-bolum]");
  if (bolum) { document.getElementById(bolum.dataset.yardimBolum)?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
  const kopya = e.target.closest("[data-kopyala]");
  if (!kopya) return;
  const eski = kopya.textContent;
  try { await navigator.clipboard.writeText(kopya.dataset.kopyala); kopya.textContent = "✓ Kopyalandı"; }
  catch { kopya.textContent = "Kopyalanamadı"; }
  setTimeout(() => { kopya.textContent = eski; }, 1500);
});

// Sayfa #ilerleme-yardim adresiyle açıldıysa (uygulama.js bu dosyadan önce çizdi) şimdi çiz
if (sayfa === "ilerleme-yardim" && !oturum) yenile();
