# SE 422 — Python & Veri Bilimi Çalışma Uygulaması

SE 422 Introduction to Data Science dersinin 15 slayt destesini (617 slayt) Duolingo tarzında,
dersi ilk kez alan birinin öğrenebileceği şekilde öğreten uygulama. Her bölüm bir slayt destesine,
her ders bir slayt aralığına karşılık gelir.

| # | Bölüm | Kaynak |
|---|-------|--------|
| 1 | Python Temelleri | Week2_1 |
| 2 | Karar ve Döngü Yapıları | week3_partI_Control |
| 3 | Fonksiyonlar | week3_part2_Functions |
| 4 | Dosyalar ve İstisnalar | week3_part3_Files_Exceptions |
| 5 | Listeler ve Demetler | week4_Lists_and_Tuples |
| 6 | String'ler | week4_MoreStrings |
| 7 | Sözlükler ve Kümeler | week4_Dictionaries_and_Sets |
| 8 | Sınıflar ve OOP | week4_Classes_OOP |
| 9 | Kalıtım ve Çok Biçimlilik | week4_Inheritance_Polymorph |
| 10 | Özyineleme | week5_Recursion |
| 11 | Veritabanı Programlama | week5_Database_Programming |
| 12 | Python Ortamları | Week5_Environments |
| 13 | NumPy Bölüm 1 | NumPy_part1 |
| 14 | NumPy Bölüm 2 | NumPy_part2 |
| 15 | Pandas | Pandas |

- 80 ders, 668 soru (çoktan seçmeli, doğru/yanlış, boşluk doldurma, sıralama, eşleştirme, çıktı yazma),
  39 otomatik kontrol edilen kod alıştırması
- **Benzer sorularla pekiştirme:** yanlış cevaplanan sorunun yerine aynı dersten yeni üretilmiş benzer bir soru gelir;
  Pekiştir bölümü de ezber yerine her seferinde yeni sorular sorar (hesaplama, hepsini seç, hatayı bul,
  kodu tamamla, satır sıralama, hangisi doğru/yanlış, doğru/yanlış). Her ders için sorular sunucuda üretilir
  ve gerçek kod çalıştırılarak doğrulanır.
- **Barem (ders takibi):** ders ve bölüm bazında ağırlıklı başarı puanı, Güçlü / Orta / Zayıf ölçeği,
  dikkat edilmesi gereken konular ve son hatalar, ilgili slayt notuna ve benzer soru pekiştirmesine tek tıkla geçiş
- **Final sınavı:** tüm dersler bitip zayıf soru kalmayınca açılır; 25 soru, her bölümden en az bir tane,
  her seferinde gerçek kodla yeniden üretilir, görülen sorular tekrar gelmez; geçme notu %80
- **Terminal:** gerçek Python + NumPy + pandas; satır numaralı ve renklendirmeli kod editörü, Ctrl/⌘ + Enter ile çalıştır,
  Durdur / Temizle / Kodu sıfırla / Kopyala, stdout ve stderr ayrı renkte, çalışma süresi, hata satırı vurgusu ve
  "Bu hata ne demek?" Türkçe açıklaması, sürüklenebilir ayırıcı ve tam ekran
- **Süre tahmini:** her bölüm için içerikten hesaplanan süre (`static/sure.js`), kalan süre ve aktif çalışma süresi;
  yeterli veri olunca "Senin hızına göre" kişiselleştirilir
- **Notlarım:** her slayta Markdown not, otomatik kayıt (`veri/notlar.json` + tarayıcı yedeği), seçili metni/kodu nota ekleme,
  JSON dışa/içe aktarma, bölüm notları PDF'i ve kapak + içindekiler + sayfa numaralı not kitapçığı
- **Bölüm özetleri:** her bölüm için slayt sırasını izleyen konu anlatımı PDF'i (`static/ozetler/`), tümü tek PDF'te de var

## Ara sınav (Module 1)

- **Kapsam haritası:** `static/sinav-kapsam.json` (tek kaynak) → `python3 kapsam_raporu.py` ile `SINAV_KAPSAM.md` üretilir.
  Bölüm başlıklarında, sağ panelde ve slaytlarda "Ara sınav" rozeti; kapsam dışı slaytlar soluk; "Sadece ara sınav konuları" filtresi
  (Öğren ve Notlar sayfasında; zayıf konu önerilerini de sınırlar). Sağ panelde "Ara sınav kapsamı için kalan" süre.
- **Slayt dışı içerik:** Bölüm 0 "Veri bilimi nedir?" (1.1) ve Pandas "Veri temizleme: tekrarlar ve tutarsızlıklar" (Ek bilgi, pandas dokümantasyonu).
  İkisi de isteğe bağlıdır; öğrenme yolunda sırayı bekletmez.
- **Ara sınav denemesi** (menü): çoktan seçmeli, boşluk doldurma (yazarak) ve tablo tamamlama; geri sayım, kalan soru başına süre,
  işaretle ve sonra dön, soru gezgini, süre bitince otomatik teslim; sonuçta tip ve konu bazında başarı, soru başına süre.
- Sorular `ara_sinav.py` ile üretilir; `.venv/bin/python ara_sinav_kontrol.py` her şablonun referans cevabını gerçek çalıştırmayla doğrular.
  Homework 1 gelince `content/README.md`'deki biçimle `content/odev1.sorular.json` eklenir; sorular havuza otomatik katılır.

## Kurulum (bir kez)

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Bölüm özetlerini (ozetler/*.md) değiştirince kod çıktılarını ve PDF'leri yeniden üretmek için:

```bash
python3 ozet_pdf_uret.py            # çıktıları gerçek çalıştırmayla yazar, static/ozetler/*.pdf üretir
python3 ozet_pdf_uret.py --kontrol  # yalnızca çıktılar güncel mi diye bakar
```

## Çalıştırma

```bash
python3 app.py
```

Tarayıcıda **http://127.0.0.1:8001** adresini aç.

> **Hep bu adresten aç; localhost ile 127.0.0.1 farklı sayılır.** Tarayıcı depolaması adrese bağlıdır:
> `http://localhost:8001` ile `http://127.0.0.1:8001` iki ayrı site gibi davranır ve her birinin ilerlemesi ayrı tutulur.
> Uygulama her açılışta bu tarayıcının kaydını sunucudaki kopyayla birleştirdiği için eski adreste kalan ilerleme
> kaybolmaz: localhost adresini bir kez açman, ilerlemenin 127.0.0.1'e taşınması için yeterli.

### İlerleme nerede saklanır?

| Veri | Yer |
| --- | --- |
| Tamamlanan dersler, XP/seri, soru ustalığı, barem, deneme/sınav sonuçları, kodlar, süreler, ayarlar | Tarayıcıda `localStorage["se422-ders-v1"]` + sunucu kopyası `veri/ilerleme.json` |
| Notlar | `veri/notlar.json` (+ tarayıcıda `localStorage["se422-notlar"]` yedeği) |
| Yedekler | `veri/yedekler/` — göç ve içe aktarma öncesi `yedek-<tarih>-<sebep>.json`, ayrıca son 14 günün `ilerleme-gunluk-<tarih>.json` dosyaları |

- `veri/` klasörü `.gitignore`'dadır; `git pull` kişisel verinin üzerine yazmaz. Klasör ve dosyalar ilk kullanımda kendiliğinden oluşur.
- Kayıtta bir şema sürümü (`schemaVersion`) bulunur. Uygulama açılırken eski sürümlü bir kayıt gelirse önce yedeği alınır,
  sonra göç çalışır: değişen id'ler yenilerine taşınır (`static/kayit.js` → `ID_ESLESME`), yeni bölümler boş ilerlemeyle eklenir, hiçbir kayıt silinmez.
- Sunucu, farklı tarayıcı ve adreslerden gelen kayıtları **birleştirir** (tamamlananlar birleşir, XP/süre için büyük olan, sınav ve deneme geçmişi birleşir).
- Başka klasöre, tarayıcıya ya da cihaza taşımak için: **Barem → 💾 İlerleme yedeği → İlerlemeyi dışa aktar (JSON)**,
  yeni yerde **İçe aktar**. Dosya notları da içerir. İçe aktarma mevcut ilerlemeyi silmez, birleştirir.

## Dosyalar

- `static/mufredat/*.js` — bölüm başına bir dosya (anlatım kartları ve sorular)
- `alistirmalar.py` — kod alıştırmaları ve kontrol kuralları
- `sinav.py`, `sinav_python.py` — final sınavı soru şablonları
- `varyant.py`, `kavramlar.py` — benzer soru üreticisi ve ders başına kavram bankası
- `static/sure.js` — süre tahmini formülü · `static/editor.js` — terminal kod editörü ve hata açıklamaları ·
  `static/notlar.js` — Notlarım paneli
- `pdf_uret.py` — not PDF'leri (reportlab + `fontlar/` altındaki DejaVu fontları) · `ozet_pdf_uret.py` — özet PDF'leri ·
  `ozetler/*.md` — bölüm özetlerinin kaynağı
- `veri/notlar.json`, `veri/ilerleme.json`, `veri/yedekler/` — notların, ilerlemenin sunucu kopyası ve yedekler (kişisel veri, git'e eklenmez)
- `static/kayit.js` — ilerleme kaydı: şema sürümü, göç, yedek, sunucuyla birleştirme, dışa/içe aktarma
- `testler_ozellikler.py` — süre formülü, terminal, not API'si, PDF'ler ve özetlerin testleri: `.venv/bin/python testler_ozellikler.py`
- `testler.py` — tüm slaytların kapsandığını, cevapların gerçek çıktıyla aynı olduğunu ve sınavların doğruluğunu test eder:
  `.venv/bin/python testler.py` (Node.js gerekir)
