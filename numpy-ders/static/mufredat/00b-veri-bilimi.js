// Bölüm 0 — What is Data Science (ara sınav 1.1). DERS SLAYTI YOK.
// İçerik genel kabul gören tanım ve süreçlerle sınırlıdır; Moodle materyaliyle karşılaştırılmalıdır.
// Kapsam: static/sinav-kapsam.json (u-vb → 1.1)

const VB_UYARI = `<p class="uyari-kutu">⚠️ <b>Bu bölüm ders slaytına dayanmıyor; Moodle materyaliyle karşılaştır.</b>
  Ara sınav kapsamındaki "1.1 What is Data Science" başlığı için genel kabul gören içerikle hazırlandı.</p>`;

UNITELER.push({
  id: "u-vb", no: 0, renk: "turuncu", baslik: "Veri bilimi nedir?", kaynak: "Slayt dışı (Module 1.1)", slaytSayisi: 0,
  altBaslik: "Tanım, veri bilimi süreci, istatistik ve yazılımla ilişkisi, Python'un rolü",
  uyari: "Bu bölüm ders slaytına dayanmıyor; Moodle materyaliyle karşılaştır.",
  dersler: [
    {
      id: "vb-tanim", baslik: "Veri bilimi nedir?",
      adimlar: [
        O("Veri bilimi: tanım", undefined, `${VB_UYARI}
          <p><b>Veri bilimi</b> (data science), veriden <b>bilgi ve içgörü</b> çıkarmak için <b>istatistik</b>, <b>programlama / bilgisayar bilimi</b> ve <b>alan bilgisini</b> (domain knowledge) birleştiren disiplinler arası bir alandır.</p>
          <ul><li><b>İstatistik ve matematik:</b> veriyi özetlemek, belirsizliği ölçmek, model kurmak.</li>
          <li><b>Programlama:</b> veriyi toplamak, temizlemek, dönüştürmek ve analizi otomatikleştirmek (bu derste Python).</li>
          <li><b>Alan bilgisi:</b> doğru soruyu sormak ve sonucu bağlamında yorumlamak (sağlık, finans, mühendislik...).</li></ul>
          <p>Bu üç alanın kesişimi sık sık bir Venn şemasıyla gösterilir (Drew Conway'in yaygın "Data Science Venn Diagram"ı).</p>`,
          { etiket: "Slayt dışı" }),
        O("Veri türleri", undefined, `
          <ul><li><b>Yapılandırılmış veri:</b> satır ve sütunlardan oluşan tablolar (Excel, SQL tabloları, CSV). pandas DataFrame bu tür veri içindir.</li>
          <li><b>Yarı yapılandırılmış veri:</b> belirli bir düzeni olan ama tablo olmayan veri (JSON, XML).</li>
          <li><b>Yapılandırılmamış veri:</b> metin, görüntü, ses, video.</li></ul>
          <p>Değişkenler de <b>sayısal</b> (yaş, fiyat) ve <b>kategorik</b> (şehir, cinsiyet) olarak ayrılır.</p>`,
          { etiket: "Slayt dışı" }),
        S("Veri biliminin birleştirdiği üç alan hangileridir?", ["İstatistik, programlama ve alan bilgisi", "Donanım, ağ ve güvenlik", "Muhasebe, hukuk ve pazarlama", "Grafik tasarım, animasyon ve ses"], "Veri bilimi disiplinler arasıdır: istatistik/matematik, programlama ve alan bilgisi."),
        S("Bir CSV dosyasındaki satır-sütun tablosu hangi veri türüdür?", ["Yapılandırılmış veri", "Yapılandırılmamış veri", "Yarı yapılandırılmış veri", "İkili (binary) veri"], "Satır ve sütunlardan oluşan tablolar yapılandırılmış veridir."),
        DY("Görüntü ve serbest metin yapılandırılmamış veriye örnektir.", true, "Tablo düzeni olmayan metin, görüntü, ses yapılandırılmamış veridir."),
        DY("Veri biliminde alan bilgisi gereksizdir; yalnızca programlama yeterlidir.", false, "Doğru soruyu sormak ve sonucu yorumlamak için alan bilgisi gerekir."),
        E(["İstatistik", "belirsizliği ölçmek"], ["Programlama", "analizi otomatikleştirmek"], ["Alan bilgisi", "sonucu bağlamında yorumlamak"], ["JSON", "yarı yapılandırılmış veri"]),
      ],
    },
    {
      id: "vb-surec", baslik: "Veri bilimi süreci",
      adimlar: [
        O("Veri bilimi süreci", undefined, `
          <p>Bir veri bilimi projesi genellikle şu adımlarla ilerler:</p>
          <ol><li><b>Soruyu tanımla:</b> hangi problemi çözüyoruz, başarı neye göre ölçülecek?</li>
          <li><b>Veriyi topla:</b> dosyalar, veritabanları, API'ler, anketler...</li>
          <li><b>Temizle ve hazırla:</b> eksik değerler, tekrarlı kayıtlar, tutarsız yazımlar, yanlış tipler.</li>
          <li><b>Keşfet ve analiz et (EDA):</b> betimsel istatistik, grafikler, örüntüler.</li>
          <li><b>Modelle:</b> istatistiksel ya da makine öğrenmesi modeli kur ve değerlendir.</li>
          <li><b>İlet ve uygula:</b> sonuçları rapor/grafikle anlat, kararı destekle.</li></ol>
          <p>Süreç <b>döngüseldir</b> (iteratif): analizde fark edilen bir sorun genellikle temizlik ya da veri toplama adımına geri dönmeyi gerektirir. CRISP-DM gibi standart süreç modelleri de aynı mantığı izler (iş anlayışı, veri anlayışı, veri hazırlama, modelleme, değerlendirme, yayına alma).</p>`,
          { etiket: "Slayt dışı" }),
        O("Temizlik neden bu kadar önemli?", undefined, `
          <p>Gerçek veri neredeyse hiçbir zaman temiz gelmez. Kötü veriyle kurulan analiz kötü sonuç verir: <b>GIGO</b> (garbage in, garbage out; 2. bölümde de geçti).</p>
          <p>Bu derste temizlik araçları: eksik veri (<code>isna</code>, <code>dropna</code>, <code>fillna</code>), tekrarlı satırlar (<code>duplicated</code>, <code>drop_duplicates</code>), tutarsızlıklar (<code>str.strip</code>, <code>str.lower</code>, <code>replace</code>, <code>to_numeric</code>). Aşağıdaki küçük örnek süreci baştan sona gösterir.</p>`,
          { etiket: "Slayt dışı", kod: "import pandas as pd\n# 2) veri topla\nveri = pd.DataFrame({'sehir': ['Ankara', 'ankara ', 'İzmir', None], 'satis': ['10', '20', 'x', '5']})\n# 3) temizle\nveri['sehir'] = veri['sehir'].str.strip().str.lower()\nveri['satis'] = pd.to_numeric(veri['satis'], errors='coerce')\nveri = veri.dropna()\n# 4) analiz et\nprint(veri.groupby('sehir')['satis'].sum().to_dict())" }),
        SR("Veri bilimi sürecinin adımlarını sırala", ["Soruyu tanımla", "Veriyi topla", "Temizle ve hazırla", "Keşfet ve analiz et", "Modelle", "İlet"], ["Veriyi sil"], " → ", "Soru → veri → temizlik → keşif/analiz → model → iletişim."),
        S("Analiz sırasında verideki bir hata fark edilirse ne yapılır?", ["Süreç döngüsel olduğu için temizlik/veri adımına geri dönülür", "Hata görmezden gelinip modele geçilir", "Proje baştan iptal edilir", "Sonuç değişmeden raporlanır"], "Veri bilimi süreci iteratiftir."),
        DY("Keşifsel veri analizi (EDA), modellemeden önce veriyi tanımak için yapılır.", true, "EDA betimsel istatistik ve grafiklerle veriyi tanıma adımıdır."),
        B("GIGO", "garbage ___, garbage ___", ["in", "out"], ["in", "out", "up", "down"], "Kötü girdi kötü çıktı üretir."),
        E(["dropna", "eksik değer"], ["drop_duplicates", "tekrarlı satır"], ["str.lower", "tutarsız yazım"], ["to_numeric", "yanlış tip"]),
      ],
    },
    {
      id: "vb-python", baslik: "İstatistik, yazılım ve Python'un rolü",
      adimlar: [
        O("Veri bilimi, istatistik ve yazılım", undefined, `
          <ul><li><b>İstatistik</b> veri bilimine yöntemleri verir (örnekleme, betimsel istatistik, çıkarım, regresyon). Veri bilimi bunları büyük ve dağınık veriye, programlama ile uygular.</li>
          <li><b>Yazılım mühendisliği</b> tekrarlanabilir, test edilebilir ve bakımı kolay kod yazmayı sağlar; analizlerin betik olarak yazılması (Pandas bölümündeki "reproducible" vurgusu) buradan gelir.</li>
          <li><b>Makine öğrenmesi</b> veriden öğrenen modelleri kapsar; veri biliminin modelleme adımında kullanılır.</li></ul>`,
          { etiket: "Slayt dışı" }),
        O("Python'un veri bilimindeki rolü", undefined, `
          <p>Python okunabilir sözdizimi, geniş kütüphane ekosistemi ve büyük topluluğu sayesinde veri biliminde en yaygın dillerden biridir. Bu dersteki araçlar:</p>
          <ul><li><b>NumPy:</b> hızlı, çok boyutlu sayısal diziler (ndarray) ve vektörleştirme (13–14. bölümler).</li>
          <li><b>pandas:</b> tablo verisi (Series, DataFrame), okuma, temizleme, analiz (15. bölüm).</li>
          <li><b>Matplotlib:</b> grafikler (5. bölümün sonu).</li>
          <li><b>Jupyter / Colab:</b> kod, çıktı ve açıklamayı bir arada tutan etkileşimli ortamlar (12. bölüm).</li>
          <li><b>scikit-learn:</b> makine öğrenmesi modelleri (dersin ilerleyen konuları).</li></ul>`,
          { etiket: "Slayt dışı", kod: "import numpy as np\nimport pandas as pd\nnotlar = np.array([70, 85, 90])\ntablo = pd.DataFrame({'ad': ['Ada', 'Can', 'Ece'], 'not': notlar})\nprint(notlar.mean(), tablo['not'].max())" }),
        S("Tablo verisini (satır/sütun) temizlemek ve analiz etmek için hangi Python kütüphanesi kullanılır?", ["pandas", "Matplotlib", "Jupyter", "sqlite3"], "pandas Series ve DataFrame yapılarını sunar."),
        S("Hızlı çok boyutlu sayısal diziler sunan kütüphane hangisidir?", ["NumPy", "pandas", "Matplotlib", "scikit-learn"], "NumPy ndarray'i sunar; pandas da onun üzerine kuruludur."),
        DY("Analizi betik (kod) olarak yazmak, onu tekrarlanabilir yapar.", true, "Kod tekrar çalıştırılabilir ve test edilebilir."),
        E(["NumPy", "sayısal diziler"], ["pandas", "tablo verisi"], ["Matplotlib", "grafikler"], ["Jupyter", "etkileşimli notebook"]),
      ],
    },
  ],
});
