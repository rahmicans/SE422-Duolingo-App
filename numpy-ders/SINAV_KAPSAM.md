# Ara sınav kapsam haritası (Module 1)

> Bu dosya `python3 kapsam_raporu.py` ile **otomatik üretilir**. Kapsamın tek kaynağı `static/sinav-kapsam.json` dosyasıdır; arayüz (rozetler, filtre, kalan süre) ve deneme sınavı (`ara_sinav.py`) aynı dosyayı okur. Değişiklik için JSON'u düzenleyip betiği yeniden çalıştır.

**Duyuru:** çoktan seçmeli, boşluk doldurma ve tablo tamamlama soruları. Kapsam: 1.1 What is Data Science · 1.2 Python Basics · 1.3 Python for Data Science · 1.4 Introduction to NumPy · 1.5 Data Manipulation with Pandas (yalnızca Series/DataFrame'e giriş ve veri temizleme: eksik değerler, tekrarlı satırlar, tutarsızlıklar) · Homework 1 · Moodle materyalleri.

## Özet: sınav başlığı → uygulamadaki karşılığı

| Sınav başlığı | Kapsam içi dersler (bölüm · slaytlar) | Kapsam içi slayt |
|---|---|---|
| **1.1** What is Data Science | 0. Veri bilimi nedir? · Veri bilimi nedir? (slayt dışı)<br>0. Veri bilimi nedir? · Veri bilimi süreci (slayt dışı)<br>0. Veri bilimi nedir? · İstatistik, yazılım ve Python'un rolü (slayt dışı) | 0 |
| **1.2** Python Basics | 1. Python Temelleri · Python'u kullanmak (1–8)<br>1. Python Temelleri · String, yorum ve değişkenler (9–17)<br>1. Python Temelleri · Girdi ve hesaplamalar (18–26)<br>1. Python Temelleri · String birleştirme, print ve f-string (27–40)<br>1. Python Temelleri · Sabitler ve if yapısı (41–57)<br>1. Python Temelleri · String karşılaştırma ve mantıksal operatörler (58–71)<br>… ve 29 ders daha (ayrıntı tablosunda) | 383 |
| **1.3** Python for Data Science | 12. Python Ortamları · Anaconda Navigator (1–7)<br>12. Python Ortamları · Jupyter Notebook (8–13)<br>12. Python Ortamları · Google Colab (14–19) | 19 |
| **1.4** Introduction to NumPy | 13. NumPy Bölüm 1 · Python listesinin sorunu (1–3)<br>13. NumPy Bölüm 1 · ndarray'in farkı (4)<br>13. NumPy Bölüm 1 · Vektörleştirme ve SIMD (5–6)<br>13. NumPy Bölüm 1 · Ne kadar hızlı? Ne zaman değil? (7–8)<br>13. NumPy Bölüm 1 · N boyutlu dizi ve eksenler (9)<br>13. NumPy Bölüm 1 · ndarray'in kısıtlamaları (10)<br>… ve 17 ders daha (ayrıntı tablosunda) | 48 |
| **1.5** Data Manipulation with Pandas (Series, DataFrame, veri temizleme) | 15. Pandas · Pandas nedir, neden Pandas? (1–5)<br>15. Pandas · Series: oluşturma ve öznitelikler (6–8)<br>15. Pandas · DataFrame ve veri hizalama (9–12)<br>15. Pandas · Veriyi incelemek ve betimsel istatistik (13–18)<br>15. Pandas · Eksik veri: NaN, NaT, None ve tespit (36–39)<br>15. Pandas · Eksik veriyi silmek ve doldurmak (40–44)<br>15. Pandas · Veri temizleme: tekrarlar ve tutarsızlıklar (slayt dışı) | 27 |
| **HW1** Homework 1 (ödev kavramları) | 16. Ödev 1 – Sınav kavramları · Task 1: Özyinelemeli ikili sayaç (slayt dışı)<br>16. Ödev 1 – Sınav kavramları · Task 2: Vector sınıfı ve operatör aşırı yükleme (slayt dışı)<br>16. Ödev 1 – Sınav kavramları · Task 3: CPython küçük tamsayı önbelleği (slayt dışı)<br>16. Ödev 1 – Sınav kavramları · Task 4: Kesme ve yuvarlama (slayt dışı)<br>16. Ödev 1 – Sınav kavramları · Task 5: NumPy broadcasting ve z-skoru (slayt dışı) | 0 |

## Ayrıntı: bölüm ve ders bazında

| Bölüm | Ders | Slaytlar | Başlık | Kapsam | Not |
|---|---|---|---|---|---|
| 0. Veri bilimi nedir? | Veri bilimi nedir? (`vb-tanim`) | slayt dışı | 1.1 | içi | Ders slaytı yok; genel kabul gören içerik. Moodle materyaliyle karşılaştırılmalı. |
| 0. Veri bilimi nedir? | Veri bilimi süreci (`vb-surec`) | slayt dışı | 1.1 | içi | Ders slaytı yok; genel kabul gören içerik. Moodle materyaliyle karşılaştırılmalı. |
| 0. Veri bilimi nedir? | İstatistik, yazılım ve Python'un rolü (`vb-python`) | slayt dışı | 1.1 | içi | Ders slaytı yok; genel kabul gören içerik. Moodle materyaliyle karşılaştırılmalı. |
| 1. Python Temelleri | Python'u kullanmak (`temel-giris`) | 1–8 | 1.2 | içi |  |
| 1. Python Temelleri | String, yorum ve değişkenler (`temel-degisken`) | 9–17 | 1.2 | içi |  |
| 1. Python Temelleri | Girdi ve hesaplamalar (`temel-hesap`) | 18–26 | 1.2 | içi |  |
| 1. Python Temelleri | String birleştirme, print ve f-string (`temel-fstring`) | 27–40 | 1.2 | içi |  |
| 1. Python Temelleri | Sabitler ve if yapısı (`temel-if`) | 41–57 | 1.2 | içi |  |
| 1. Python Temelleri | String karşılaştırma ve mantıksal operatörler (`temel-mantik`) | 58–71 | 1.2 | içi |  |
| 2. Karar ve Döngü Yapıları | İç içe kararlar ve if-elif-else (`kontrol-elif`) | 1–15 | 1.2 | içi |  |
| 2. Karar ve Döngü Yapıları | while döngüsü (`kontrol-while`) | 16–21 | 1.2 | içi |  |
| 2. Karar ve Döngü Yapıları | for döngüsü ve range (`kontrol-for`) | 22–35 | 1.2 | içi |  |
| 2. Karar ve Döngü Yapıları | Toplam, sentinel ve doğrulama (`kontrol-toplam`) | 36–41 | 1.2 | içi |  |
| 2. Karar ve Döngü Yapıları | break, continue, pass ve iç içe döngüler (`kontrol-break`) | 42–56 | 1.2 | içi |  |
| 3. Fonksiyonlar | Fonksiyon tanımlama ve çağırma (`fonk-giris`) | 1–13 | 1.2 | içi |  |
| 3. Fonksiyonlar | Yerel değişkenler ve argümanlar (`fonk-arguman`) | 14–25 | 1.2 | içi |  |
| 3. Fonksiyonlar | Global değişkenler ve rastgele sayılar (`fonk-global`) | 26–38 | 1.2 | içi |  |
| 3. Fonksiyonlar | Değer döndüren fonksiyonlar ve modüller (`fonk-donus`) | 39–56 | 1.2 | içi |  |
| 4. Dosyalar ve İstisnalar | Dosya girişi ve çıkışı (`dosya-io`) | 1–16 | 1.2 | içi |  |
| 4. Dosyalar ve İstisnalar | Döngülerle dosya ve kayıtlar (`dosya-dongu`) | 17–21 | 1.2 | içi |  |
| 4. Dosyalar ve İstisnalar | İstisnalar (exceptions) (`dosya-istisna`) | 22–31 | 1.2 | içi |  |
| 5. Listeler ve Demetler | Listelere giriş (`liste-giris`) | 1–11 | 1.2 | içi |  |
| 5. Listeler ve Demetler | Dilimleme ve liste metotları (`liste-metot`) | 12–21 | 1.2 | içi |  |
| 5. Listeler ve Demetler | Liste üreteçleri, 2B listeler ve tuple (`liste-comp`) | 22–34 | 1.2 | içi |  |
| 5. Listeler ve Demetler | matplotlib ile grafik çizmek (`liste-grafik`) | 35–57 | 1.2 | **belirsiz** | matplotlib grafikleri (slayt 35–57): Python Basics mi, Python for Data Science mi, yoksa kapsam dışı mı belirsiz. |
| 6. String'ler | Karakterler, birleştirme, değişmezlik (`str-temel`) | 1–10 | 1.2 | içi |  |
| 6. String'ler | Dilimleme ve string metotları (`str-metot`) | 11–19 | 1.2 | içi |  |
| 6. String'ler | Tekrar, split ve token (`str-split`) | 20–27 | 1.2 | içi |  |
| 7. Sözlükler ve Kümeler | Sözlükler (`sozluk-giris`) | 1–8 | 1.2 | içi |  |
| 7. Sözlükler ve Kümeler | Sözlük metotları ve comprehension (`sozluk-metot`) | 9–19 | 1.2 | içi |  |
| 7. Sözlükler ve Kümeler | Kümeler (sets) (`sozluk-kume`) | 20–34 | 1.2 | içi |  |
| 7. Sözlükler ve Kümeler | Nesneleri serileştirme (pickle) (`sozluk-pickle`) | 35–39 | 1.2 | içi |  |
| 8. Sınıflar ve OOP | Prosedürel ve nesne yönelimli programlama (`sinif-oop`) | 1–8 | 1.2 | içi |  |
| 8. Sınıflar ve OOP | Sınıf tanımları (`sinif-tanim`) | 9–18 | 1.2 | içi |  |
| 8. Sınıflar ve OOP | Örneklerle çalışmak ve sınıf tasarımı (`sinif-ornek`) | 19–32 | 1.2 | içi |  |
| 9. Kalıtım ve Çok Biçimlilik | Kalıtım (`kalitim-giris`) | 1–10 | 1.2 | içi |  |
| 9. Kalıtım ve Çok Biçimlilik | Çok biçimlilik ve isinstance (`kalitim-poly`) | 11–14 | 1.2 | içi |  |
| 10. Özyineleme | Özyinelemeye giriş (`ozyineleme-giris`) | 1–12 | 1.2 | içi |  |
| 10. Özyineleme | Özyinelemeli algoritmalar (`ozyineleme-alg`) | 13–23 | 1.2 | içi |  |
| 11. Veritabanı Programlama | DBMS, SQL ve tablolar (`vt-giris`) | 1–14 | 1.2 | **belirsiz** | Veritabanı programlama (SQLite/SQL) duyurudaki 'Python Basics' başlığına girip girmediği belirsiz. |
| 11. Veritabanı Programlama | Bağlantı, tablo oluşturma ve veri ekleme (`vt-tablo`) | 15–27 | 1.2 | **belirsiz** | Veritabanı programlama (SQLite/SQL) duyurudaki 'Python Basics' başlığına girip girmediği belirsiz. |
| 11. Veritabanı Programlama | SELECT, WHERE, sıralama ve toplama (`vt-select`) | 28–42 | 1.2 | **belirsiz** | Veritabanı programlama (SQLite/SQL) duyurudaki 'Python Basics' başlığına girip girmediği belirsiz. |
| 11. Veritabanı Programlama | UPDATE, DELETE, anahtarlar ve hatalar (`vt-update`) | 43–60 | 1.2 | **belirsiz** | Veritabanı programlama (SQLite/SQL) duyurudaki 'Python Basics' başlığına girip girmediği belirsiz. |
| 11. Veritabanı Programlama | İlişkisel veri ve yabancı anahtarlar (`vt-iliski`) | 61–76 | 1.2 | **belirsiz** | Veritabanı programlama (SQLite/SQL) duyurudaki 'Python Basics' başlığına girip girmediği belirsiz. |
| 12. Python Ortamları | Anaconda Navigator (`ortam-anaconda`) | 1–7 | 1.3 | içi |  |
| 12. Python Ortamları | Jupyter Notebook (`ortam-jupyter`) | 8–13 | 1.3 | içi |  |
| 12. Python Ortamları | Google Colab (`ortam-colab`) | 14–19 | 1.3 | içi |  |
| 13. NumPy Bölüm 1 | Python listesinin sorunu (`n-liste`) | 1–3 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | ndarray'in farkı (`n-ndarray`) | 4 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | Vektörleştirme ve SIMD (`n-vektor`) | 5–6 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | Ne kadar hızlı? Ne zaman değil? (`n-performans`) | 7–8 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | N boyutlu dizi ve eksenler (`d-eksen`) | 9 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | ndarray'in kısıtlamaları (`d-kisit`) | 10 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | ndim, shape, size (`d-boyut`) | 11 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | dtype ve itemsize (`d-dtype`) | 12–13 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | np.array ile mevcut veriden (`o-array`) | 14 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | Yer tutucular: zeros, ones, empty (`o-yertutucu`) | 15 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | Sayı dizileri: arange, linspace (`o-dizi`) | 16–17 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | Slayt 18: kalan alıştırmalar (`o-alistirma`) | 18 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | 1 boyutlu indeksleme (`i-1d`) | 19–20 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | Çok boyutlu diziler (`i-2d`) | 21–22 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | reshape ve 3 boyut (`i-reshape`) | 23–24 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | View nedir? (`v-view`) | 25–26 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | View: mimari bir tercih (`v-neden`) | 27 | 1.4 | içi |  |
| 13. NumPy Bölüm 1 | Deep copy ve kaynaklar (`v-copy`) | 28–29 | 1.4 | içi |  |
| 14. NumPy Bölüm 2 | Boolean indeksleme (maskeleme) (`np2-maske`) | 1–4 | 1.4 | içi |  |
| 14. NumPy Bölüm 2 | reshape, ravel, flatten ve transpose (`np2-reshape`) | 5–8 | 1.4 | içi |  |
| 14. NumPy Bölüm 2 | Birleştirme ve bölme (`np2-birlestir`) | 9–10 | 1.4 | içi |  |
| 14. NumPy Bölüm 2 | Ufunc'lar ve broadcasting (`np2-ufunc`) | 11–16 | 1.4 | içi |  |
| 14. NumPy Bölüm 2 | Toplama fonksiyonları ve axis (`np2-toplama`) | 17–19 | 1.4 | içi |  |
| 15. Pandas | Pandas nedir, neden Pandas? (`pd-giris`) | 1–5 | 1.5 | içi |  |
| 15. Pandas | Series: oluşturma ve öznitelikler (`pd-series`) | 6–8 | 1.5 | içi |  |
| 15. Pandas | DataFrame ve veri hizalama (`pd-dataframe`) | 9–12 | 1.5 | içi |  |
| 15. Pandas | Veriyi incelemek ve betimsel istatistik (`pd-inceleme`) | 13–18 | 1.5 | içi |  |
| 15. Pandas | Pandas'ta I/O: okuma ve yazma (`pd-io`) | 19–24 | 1.5 | dışı |  |
| ↳ | slayt 21 | 21 | 1.5 | **belirsiz** | read_csv parametreleri (na_values, usecols...) slaytta 'veri temizliğinin ilk savunma hattı' olarak anlatılıyor; I/O kapsam dışı ama temizlikle ilişkili. |
| 15. Pandas | İndeksleme ve veri seçimi: [], loc, iloc (`pd-secim`) | 25–31 | 1.5 | dışı |  |
| 15. Pandas | Boolean indeksleme (filtreleme) (`pd-filtre`) | 32–35 | 1.5 | dışı |  |
| ↳ | slayt 32 | 32 | 1.5 | **belirsiz** | Boolean indeksleme kapsam dışı ama temizlikte (ör. hatalı satırları seçmek) kullanılıyor. |
| ↳ | slayt 33 | 33 | 1.5 | **belirsiz** | Boolean indeksleme: temizlik için gerektiği kadar. |
| ↳ | slayt 34 | 34 | 1.5 | **belirsiz** | & | ~ operatörleri: temizlik için gerektiği kadar. |
| 15. Pandas | Eksik veri: NaN, NaT, None ve tespit (`pd-eksik`) | 36–39 | 1.5 | içi |  |
| 15. Pandas | Eksik veriyi silmek ve doldurmak (`pd-doldur`) | 40–44 | 1.5 | içi |  |
| 15. Pandas | Veri temizleme: tekrarlar ve tutarsızlıklar (`pd-temizlik`) | slayt dışı | 1.5 | içi | Slayt dışı: Ek bilgi (pandas dokümantasyonu). |
| 15. Pandas | concat ve merge ile birleştirme (`pd-birlestir`) | 45–50 | 1.5 | dışı |  |
| 15. Pandas | groupby: böl, uygula, birleştir (`pd-groupby`) | 51–58 | 1.5 | dışı |  |
| 15. Pandas | Yeniden şekillendirme: melt ve pivot_table (`pd-reshape`) | 59–62 | 1.5 | dışı |  |
| 15. Pandas | Zaman serileriyle çalışmak (`pd-zaman`) | 63–68 | 1.5 | dışı |  |
| 16. Ödev 1 – Sınav kavramları | Task 1: Özyinelemeli ikili sayaç (`hw1-t1`) | slayt dışı | HW1 | içi | Homework 1 (content/odev1.md) Analysis kavramları; hoca: 'This homework will be embedded in the Midterm exam.' |
| 16. Ödev 1 – Sınav kavramları | Task 2: Vector sınıfı ve operatör aşırı yükleme (`hw1-t2`) | slayt dışı | HW1 | içi | Homework 1 (content/odev1.md) Analysis kavramları; hoca: 'This homework will be embedded in the Midterm exam.' |
| 16. Ödev 1 – Sınav kavramları | Task 3: CPython küçük tamsayı önbelleği (`hw1-t3`) | slayt dışı | HW1 | içi | Homework 1 (content/odev1.md) Analysis kavramları; hoca: 'This homework will be embedded in the Midterm exam.' |
| 16. Ödev 1 – Sınav kavramları | Task 4: Kesme ve yuvarlama (`hw1-t4`) | slayt dışı | HW1 | içi | Homework 1 (content/odev1.md) Analysis kavramları; hoca: 'This homework will be embedded in the Midterm exam.' |
| 16. Ödev 1 – Sınav kavramları | Task 5: NumPy broadcasting ve z-skoru (`hw1-t5`) | slayt dışı | HW1 | içi | Homework 1 (content/odev1.md) Analysis kavramları; hoca: 'This homework will be embedded in the Midterm exam.' |

## Belirsiz işaretlenenler (karar bekliyor)

Bunlar kendiliğinden kapsam dışı bırakılmadı: arayüzde "Ara sınav?" rozetiyle gösterilir, "Sadece ara sınav konuları" filtresinde görünür kalır, deneme sınavına ise alınmaz (yalnızca kapsam içi). Karar verilince `static/sinav-kapsam.json`'da `ici` ya da `disi` yapılmalı.

- **5. Listeler ve Demetler → matplotlib ile grafik çizmek** (slayt 35–57): matplotlib grafikleri (slayt 35–57): Python Basics mi, Python for Data Science mi, yoksa kapsam dışı mı belirsiz.
- **11. Veritabanı Programlama → DBMS, SQL ve tablolar** (slayt 1–14): Veritabanı programlama (SQLite/SQL) duyurudaki 'Python Basics' başlığına girip girmediği belirsiz.
- **11. Veritabanı Programlama → Bağlantı, tablo oluşturma ve veri ekleme** (slayt 15–27): Veritabanı programlama (SQLite/SQL) duyurudaki 'Python Basics' başlığına girip girmediği belirsiz.
- **11. Veritabanı Programlama → SELECT, WHERE, sıralama ve toplama** (slayt 28–42): Veritabanı programlama (SQLite/SQL) duyurudaki 'Python Basics' başlığına girip girmediği belirsiz.
- **11. Veritabanı Programlama → UPDATE, DELETE, anahtarlar ve hatalar** (slayt 43–60): Veritabanı programlama (SQLite/SQL) duyurudaki 'Python Basics' başlığına girip girmediği belirsiz.
- **11. Veritabanı Programlama → İlişkisel veri ve yabancı anahtarlar** (slayt 61–76): Veritabanı programlama (SQLite/SQL) duyurudaki 'Python Basics' başlığına girip girmediği belirsiz.
- **15. Pandas → slayt 21**: read_csv parametreleri (na_values, usecols...) slaytta 'veri temizliğinin ilk savunma hattı' olarak anlatılıyor; I/O kapsam dışı ama temizlikle ilişkili.
- **15. Pandas → slayt 32**: Boolean indeksleme kapsam dışı ama temizlikte (ör. hatalı satırları seçmek) kullanılıyor.
- **15. Pandas → slayt 33**: Boolean indeksleme: temizlik için gerektiği kadar.
- **15. Pandas → slayt 34**: & | ~ operatörleri: temizlik için gerektiği kadar.

## Eksik içerik (slaytta yok, sınavda var)

| İçerik | Durum | Nerede |
|---|---|---|
| 1.1 What is Data Science | Eklendi (slayt dışı, "Moodle'la karşılaştır" uyarılı) | `static/mufredat/00b-veri-bilimi.js` → Bölüm 0 (3 ders) |
| Pandas: tekrarlı satırlar ve tutarsızlıklar | Eklendi ("Ek bilgi (pandas dokümantasyonu)" etiketli) | Pandas bölümü → "Veri temizleme: tekrarlar ve tutarsızlıklar" (`pd-temizlik`) |
| Homework 1 | Eklendi (ödev metni `content/odev1.md`; kavrayış notları, çözüm notebook'u değil) | `static/mufredat/16-odev1.js` → Bölüm 16 (5 görev) · deneme soruları `ara_sinav.py` (başlık HW1, `kaynak: odev1-task1…5`) · Claude'un notları → "Ödev 1 – Kavrayış özeti" |
| Moodle zorunlu ve ek materyaller | **Bekleniyor** | `content/` · Gelince content/ klasörüne eklenecek. |
