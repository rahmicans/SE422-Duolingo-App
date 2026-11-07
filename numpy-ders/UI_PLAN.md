# UI geliştirme planı: süre, terminal, notlar, PDF'ler

## Mevcut durum (inceleme)

- **Veri yapısı:** `static/mufredat/*.js` dosyaları `UNITELER` dizisine birer bölüm (ünite) ekler.
  Ünite: `{id, renk, baslik, kaynak, slaytSayisi, altBaslik, dersler[]}`.
  Ders: `{id, baslik, slayt:[a,b], adimlar[]}`. Adım tipleri: `ogren` (anlatım kartı; `slayt`, `baslik`, `metin`, isteğe bağlı `kod`) ve soru tipleri (`secmeli`, `yaz`, `dogruyanlis`, `bosluk`, `sirala`, `eslestir`, `kod`).
- **İlerleme ve puan:** tamamen tarayıcıda, `localStorage["se422-ders-v1"]` içindeki `durum` nesnesinde. Alanlar: `tamamlanan`, `ogeler`, `konular`, `sinavlar`, `oturumlar`, `kodlar` vb. Sunucuda kullanıcı verisi yok.
- **Sunucu:** `app.py` yalnızca standart kütüphaneyle çalışır (`python3 app.py`). Venv'deki paketlere (NumPy, pandas) ihtiyaç duyan işler ayrı süreçte `.venv/bin/python` ile yürür: `calistirici.py`, `sinav.py`, `varyant.py`.
- **API uçları:**
  - `GET /api/alistirmalar`
  - `POST /api/terminal`, `/api/terminal/sifirla`, `/api/calistir`, `/api/kontrol`, `/api/varyant`, `/api/sinav`
- **Terminal:** sağdan açılan panel; tek satırlık `>>>` girdisi. `:` ile biten satır blok başlatır. Değişkenler kalıcı bir REPL sürecinde (`calistirici.py repl`) korunur.

### Terminalin eksikleri
- Çok satırlı kod için gerçek bir editör yok: satır numarası, renklendirme, otomatik girinti ve Tab yok.
- Durdur düğmesi yok. Sonsuz döngü ancak 10 sn zaman aşımıyla kesiliyor.
- stdout ve stderr aynı akışta, aynı renkte. Çalışıyor göstergesi ve süre bilgisi yok.
- Hatada ilgili satır vurgulanmıyor, Türkçe açıklama yok.
- Çıktıyı kopyalama, kodu slayttaki orijinale döndürme, tam ekran ve boyutlandırma yok.
- `input()` desteği yok: `calistirici.py`, `input()` çağrısını bilinçli olarak hata ile durduruyor. Korunacak mevcut bir destek olmadığı için bu davranış aynen kalır.

## Mimari kararlar

| Konu | Karar | Neden |
|---|---|---|
| Süre formülü | `static/sure.js`: tek dosya, saf fonksiyonlar. Tarayıcıda global, Node'da `module.exports` | Formül tek yerde. Testler Node ile aynı kodu çalıştırır. |
| Harcanan süre | `durum.sureler` (localStorage) | İlerleme zaten tarayıcıda. Süre de ilerlemenin parçası. |
| Kod editörü | `static/editor.js`: kendi küçük editörümüz (textarea + renklendirilmiş `<pre>` katmanı + satır numarası) | CodeMirror gibi bir paket indirmeye gerek yok. Lisans ve CDN sorunu yok. Mevcut `renklendir` ve `editorTusu` mantığı genişletildi. |
| Notlar | Sunucuda `veri/notlar.json` (geçici dosyaya yaz + `os.replace`), tarayıcıda `localStorage["se422-notlar"]` yedeği | İstenen kalıcılık. Sunucu kapalıyken bile not kaybolmaz. |
| PDF | `pdf_uret.py` (reportlab + gömülü DejaVu fontları). `app.py` bunu `.venv` Python'uyla alt süreçte çağırır. | `app.py` standart kütüphaneyle çalışmaya devam eder. Sistem bağımlılığı (Cairo, wkhtmltopdf) yok. |
| Özetler | `ozetler/NN-ad.md` kaynak. `ozet_pdf_uret.py` önce her ```python bloğunu çalıştırıp çıktı bloğunu yazar, sonra `static/ozetler/*.pdf` üretir. | Kod çıktıları her zaman gerçek çalıştırmadan gelir. Tek komutla yeniden üretilir. |

## Yeni paketler ve dosyalar

- **reportlab** (BSD): PDF üretimi; Python 3.9 uyumlu, saf Python + C hızlandırıcı. Sistem kütüphanesi istemez.
- **pypdf** (BSD): yalnızca testlerde. Üretilen PDF'in açıldığını ve Türkçe metnin çıkarılabildiğini doğrular.
- **DejaVu Sans / DejaVu Sans Mono** (Bitstream Vera türevi, serbestçe dağıtılabilir; lisans `fontlar/LICENSE`): Türkçe karakterli gömülü fontlar.
- JS kütüphanesi eklenmedi.

## Veri şemaları

`durum.sureler` (localStorage): `{ "<ders-id>" | "<unite-id>-tekrar" | "final": saniye }`

`veri/notlar.json`:
```json
{ "surum": 1,
  "notlar": { "u-pd|13": { "unite": "u-pd", "slayt": 13, "slaytYazisi": "Slayt 13", "baslik": "Meta veriyi incelemek",
                           "metin": "markdown", "guncellendi": 1730990000000 } } }
```
Anahtar: `"<unite-id>|<kartın ilk slayt no>"`. Aynı slayttan başlayan kartlar aynı notu paylaşır (not slayta bağlıdır).

## Yeni API uçları

| Uç | Ne yapar |
|---|---|
| `POST /api/terminal/durdur` | Çalışan terminal kodunu durdurur (REPL süreci öldürülür, değişkenler silinir). |
| `GET /api/notlar` | Tüm notlar. |
| `POST /api/notlar` | Tek not kaydet: `{anahtar, unite, slayt, slaytYazisi, baslik, metin, guncellendi}`. Boş metin notu siler. Daha eski `guncellendi` değeri yeni kaydın üzerine yazmaz. |
| `POST /api/notlar/ice-aktar` | JSON içe aktarma. Not başına daha yeni olan kazanır. |
| `POST /api/pdf/notlar` | `{tur: "bolum" \| "kitapcik", unite, uniteler[], bosBolumler: "atla" \| "goster"}` → `application/pdf` |
| `GET /static/ozetler/<dosya>.pdf`, `liste.json` | Önceden üretilmiş özet PDF'leri (mevcut statik sunucu). |

`/api/terminal` yanıtına `stderr`, `hata_tipi`, `satir` ve `sure` alanları eklenir. Eski alanlar (`cikti`, `hata`) aynen kalır.

## Süre formülü (Faz 1)

Ders başına dakika:
- `1.0 × slayt` (okuma)
- `+ 0.5 × anlatım kartı`, `+ 1.0 × kod örneği` (terminalde deneme)
- `+ soru ağırlıkları`: doğru/yanlış 0.4; çoktan seçmeli 0.6; çıktı soruları 1.0; boşluk, sıralama ve eşleştirme 0.8; çıktı yazma 1.0; kod alıştırması 8
- `+ 1.2` (dersin sonuna eklenen 2 yeni tarz soru)

Bölüm tahmini = derslerin toplamı + bölüm tekrarı (12 soru × 0.7). Toplam = bölümler + final sınavı (25 × 1.0).

Kalan süre, tamamlanmamış ders, tekrar ve sınav düğümlerinin toplamıdır.

**Kişiselleştirme:** süresi ölçülmüş (en az 30 sn) ve tamamlanmış en az 3 ders ile toplam en az 10 dk veri olunca hız katsayısı hesaplanır: `Σ gerçek / Σ tahmin`, [0.4, 3] aralığına sınırlı. Kalan tahminler bu katsayıyla çarpılır ve "Senin hızına göre" etiketiyle gösterilir.

Aktif süre: oturum açıkken, sekme görünürken ve son 60 sn içinde klavye/fare/dokunma etkinliği varken 5 sn'lik dilimlerle sayılır.

## Fazlar
1. Süre hesabı, takip ve gösterimi (yol, sağ panel, barem, "nasıl hesaplandı?").
2. Terminal: editör, çalıştır/durdur/temizle/sıfırla/kopyala, stdout/stderr ayrımı, hata vurgusu ve Türkçe açıklama, ayırıcı, tam ekran.
3. Notlar paneli, Markdown önizleme, "Nota ekle", otomatik kayıt, JSON dışa/içe aktarma, sunucu API'si.
4. Not PDF'leri: bölüm ve kitapçık (kapak, içindekiler, sayfa numarası, yer imleri).
5. Bölüm özetleri (15 `.md`), çıktıları gerçek çalıştırmadan, özet PDF'leri ve birleşik PDF.

Her faz sonunda `testler.py` + `testler_ozellikler.py` çalıştırılır ve arayüz headless Chrome ile denenir.

## Uygulama notları (tamamlandı)

- **Faz 1:** `static/sure.js`, `uygulama.js` (yol, sağ panel, barem, açılır kart, "nasıl hesaplandı?" penceresi, aktif süre sayacı).
- **Faz 2:** `static/editor.js` (editör + `hataAciklamasi`); `calistirici.py` REPL yanıtına `stderr`, `hata_tipi`, `hata_mesaji`, `satir`, `sure` alanları eklendi.
  Alıştırma kontrol modu (`calistir`) eskisi gibi stderr'i çıktıya karıştırıyor, böylece alıştırma davranışı değişmedi.
  `app.py`'ye `Terminal.durdur()` ve `/api/terminal/durdur` eklendi.
  **Davranış değişikliği:** eski tek satırlık `>>>` girdisi ve ↑/↓ komut geçmişi kaldırıldı. Yerine çok satırlı editör geldi; Ctrl/⌘ + Enter ile çalışır,
  değişkenler yine çalıştırmalar arasında korunur, son ifadenin değeri yine yazdırılır. "Terminalde dene" kodu editöre yükleyip çalıştırır.
- **Faz 3:** `static/notlar.js`, `app.py` (`/api/notlar`, `/api/notlar/ice-aktar`, atomik yazma, bozuk dosya koruması), `.gitignore`'a `veri/`.
  Anlatım kartlarına "📝 Not al", kod kutularına "📝 Nota ekle" düğmesi ve slayt metni seçilince "Nota ekle" balonu eklendi.
- **Faz 4:** `pdf_uret.py`, `/api/pdf/notlar`; bölüm başlığında, notlar sayfasında, panelde ve bölüm sonu ekranında not PDF'i;
  ana ekranda kitapçık bandı (her şey bitince vurgulu "Tüm notlarım – kitapçık").
- **Faz 5:** `ozetler/01…15-*.md`, `ozet_pdf_uret.py`, `static/ozetler/*.pdf` + `tum-ozetler.pdf` + `liste.json`.

### Bilinen sınırlamalar
- `input()` terminalde hâlâ desteklenmiyor (önceden de yoktu).
- matplotlib kurulu olmadığı için 5. bölüm özetindeki grafik kodları çalıştırılmadı (`python calistirma` olarak işaretli).
- Süre ve ilerleme tarayıcıda saklanır; farklı tarayıcı/cihazda sıfırdan başlar (notlar ise sunucuda saklanır).

## UI sadeleştirme

### Mevcut durum: ne nerede gösteriliyor?

| Bilgi | Gösterildiği yerler (önce) |
|---|---|
| Bölüm tahmini süresi | Öğren yolu bölüm başlığı ("Bu bölüm ≈ … · kalan ≈ …"), sağ panel bölüm listesi, Barem bölüm satırı (harcanan/tahmini), Barem ders tablosu "Süre" sütunu, ders açılır kartı (≈ dk · harcanan) |
| Toplam kalan süre | Öğren yolunun üstündeki ⏱ bandı, sağ panel "Kalan süre" kartı, Barem "Kalan süre" kutusu (+ "Çalışılan süre" kutusu) |
| "Nasıl hesaplandı?" | Ayrı modal pencere; 3 yerden açılıyor (bant, sağ kart, Barem açıklaması) |
| Claude özetleri (PDF) | Öğren yolu bölüm başlığı, Notlar sayfası (bölüm başı + üst), sağ panel, bölüm sonu ekranı |
| Kullanıcı notları | Notlarım paneli; not PDF'i: bölüm başlığı, Notlar sayfası, panel, bölüm sonu; kitapçık: ana ekran bandı (her zaman), Notlar sayfası, panel |
| Tema | Sol menü (döngülü düğme), sağ panel "Görünüm" kartı, dar ekranda üst çubuk (sol menü yokken) |
| İlerleme baremleri | Sağ panel (istatistikler, günlük hedef, bölüm ilerlemesi), Barem sayfası |

### Plan
1. **"✳️ Claude'un notları" sekmesi:** solda bölüm listesi (her birinde PDF indir), sağda seçilen özetin Markdown render'ı; üstte uyarı ve "Tüm özetler (tek PDF)". Özetler `ozetler/*.md`'den `GET /api/ozetler` ve `GET /api/ozetler/<ad>` ile okunur (tek kaynak). Markdown render'ı `static/md.js`'e taşınır; Notlarım paneli ve bu sekme aynı render'ı kullanır.
2. **Özet düğmeleri** bölüm başlığından, Notlar sayfasından, sağ panelden ve bölüm sonu ekranından kaldırılır. Bölüm başlığında yalnızca tek satır "Bu bölümün Claude özeti →" bağlantısı kalır.
3. **Süre** yalnızca bölüm başlıklarında: Öğren yolundaki bölüm başlığı ve sağ paneldeki bölüm listesi satırı; biçim `⏱ ≈ 45 dk`, başladıysa `⏱ 20 / 45 dk` (harcanan / tahmini). Etiket üzerine gelince ya da tıklanınca açılan ipucu "nasıl hesaplandı?"yı anlatır; modal kaldırılır. Ana ekran bandı, Barem süre kutuları, Barem süre sütunu ve satırı, ders kartındaki süre kaldırılır.
4. **Toplam kalan süre** yalnızca sağ paneldeki "Bölüm ilerlemesi" kartının başında tek satır olur; ayrı "Kalan süre" kartı kaldırılır.
5. **Tema:** sağ paneldeki "Görünüm" kartı kaldırılır; sol menüdeki düğme aynı `durum.tema` ayarını kullanmaya devam eder. Telefonda sol menü olmadığı için üst çubuktaki tema düğmesi kalır.
6. **Dar ekran:** sağ panel eskiden 1160 px altında tamamen gizleniyordu; bu durumda kalan süre ve ilerleme hiç görünmezdi. Artık içeriğin altında kartlar halinde görünür.
7. **Kullanıcı notları:** ana ekrandaki "Şimdiye kadarki notlar" bandı kaldırılır. Bu düğmeler Notlarım panelinde ve Notlar sayfasında zaten var. Tüm bölümler bitince çıkan tam kitapçık bandı, önceki istek gereği kalır.
