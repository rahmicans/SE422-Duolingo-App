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

Tarayıcıda http://localhost:8001 adresini aç. İlerleme tarayıcıda saklanır.

## Dosyalar

- `static/mufredat/*.js` — bölüm başına bir dosya (anlatım kartları ve sorular)
- `alistirmalar.py` — kod alıştırmaları ve kontrol kuralları
- `sinav.py`, `sinav_python.py` — final sınavı soru şablonları
- `varyant.py`, `kavramlar.py` — benzer soru üreticisi ve ders başına kavram bankası
- `static/sure.js` — süre tahmini formülü · `static/editor.js` — terminal kod editörü ve hata açıklamaları ·
  `static/notlar.js` — Notlarım paneli
- `pdf_uret.py` — not PDF'leri (reportlab + `fontlar/` altındaki DejaVu fontları) · `ozet_pdf_uret.py` — özet PDF'leri ·
  `ozetler/*.md` — bölüm özetlerinin kaynağı
- `veri/notlar.json` — notların (kişisel veri, git'e eklenmez)
- `testler_ozellikler.py` — süre formülü, terminal, not API'si, PDF'ler ve özetlerin testleri: `.venv/bin/python testler_ozellikler.py`
- `testler.py` — tüm slaytların kapsandığını, cevapların gerçek çıktıyla aynı olduğunu ve sınavların doğruluğunu test eder:
  `.venv/bin/python testler.py` (Node.js gerekir)
