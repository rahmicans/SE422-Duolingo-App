# content/ — ders dışı kaynaklar (Homework 1, Moodle materyalleri)

Bu klasör, ara sınav kapsamında olan ama ders slaytlarında bulunmayan materyaller içindir.
Durumları `SINAV_KAPSAM.md` ("Eksik içerik") ve `static/sinav-kapsam.json` ("bekleyen") dosyalarında izlenir.

## Homework 1 (bekleniyor)

1. Ödev metnini `content/odev1.md` olarak buraya koy.
2. Ödevden üretilen sorular `content/odev1.sorular.json` dosyasına yazılır (her `*.sorular.json` dosyası otomatik okunur).
   Dosya varsa sorular **ara sınav denemesi havuzuna kendiliğinden katılır** (`ara_sinav.py` → `ek_sorular()`),
   ve `ara_sinav_kontrol.py` her birinin referans cevabını doğrular. Geçmeyen soru varsa kontrol başarısız olur.

### `*.sorular.json` biçimi

Soru nesnelerinden oluşan bir liste. Ortak alanlar: `tip`, `baslik` ("1.1"–"1.5"), `konu` (ilgili dersin id'si, ör. `pd-eksik`),
`soru`, `aciklama`. Tipe göre ek alanlar:

```json
[
  {"tip": "secmeli", "baslik": "1.5", "konu": "pd-eksik", "soru": "Bu kod ne yazdırır?",
   "kod": "s = pd.Series([1, None, 3])\nprint(s.isna().sum())", "secenekler": ["1", "0", "3", "Hata verir"], "dogru": 0,
   "aciklama": "Yalnızca bir eksik değer var."},
  {"tip": "boslukyaz", "baslik": "1.5", "konu": "pd-temizlik", "soru": "Boşlukları doldur: kod hedef çıktıyı yazdırsın",
   "metin": "s = pd.Series(['a', 'a', 'b'])\nprint(s.___().tolist())", "bosluklar": [["unique"]], "kod": true,
   "hedef": "['a', 'b']", "aciklama": "unique() farklı değerleri verir."},
  {"tip": "tablo", "baslik": "1.4", "konu": "d-boyut", "soru": "Tabloyu tamamla", "dogrulama": "kod",
   "kurulum": "a = np.zeros((2, 3))", "basliklar": ["İfade", "Değer"],
   "satirlar": [["a.shape", {"cevaplar": ["(2, 3)"], "ifade": "a.shape", "kod": true}],
                ["a.ndim", {"cevaplar": ["2"], "ifade": "a.ndim", "sayisal": true}]],
   "aciklama": "shape (satır, sütun), ndim eksen sayısıdır."}
]
```

Tablo hücrelerinde `ifade` verilirse kontrol betiği değeri `kurulum` koduyla yeniden hesaplar; kavram tablolarında
(`"dogrulama": "kavram"`) yalnızca yapı denetlenir.

## Moodle zorunlu ve ek materyaller (bekleniyor)

Gelince bu klasöre eklenir; kapsamları `static/sinav-kapsam.json`'a işlenir ve `python3 kapsam_raporu.py` ile rapor yenilenir.
