"""Ara sınav (Module 1) deneme sınavı üreticisi.

Soru tipleri (hocanın duyurusundaki sınav formatı):
  secmeli    → çoktan seçmeli, 4 şık, tek doğru
  boslukyaz  → kod ya da cümle içinde 1–3 boşluk; cevap yazılarak verilir (kabul edilen cevaplar listesi)
  tablo      → bazı hücreleri boş bir tablo; hücre bazında puanlanır

Kaynaklar: sinav.py / sinav_python.py hesaplama şablonları (yalnızca kapsam içi dersler, çoktan seçmeli),
varyant.py kavram ("Hangisi doğru/yanlış?") ve kod tamamlama (→ boşluk doldurma), ayrıca bu dosyadaki yeni
boşluk ve tablo şablonları. Kod ve tablo içeren her sorunun cevabı kod gerçekten çalıştırılarak üretilir;
ara_sinav_kontrol.py hepsini yeniden çalıştırarak doğrular.

Kapsam: istemci, static/sinav-kapsam.json + müfredattan kapsam içi dersleri {ders_id: "1.x"} olarak gönderir.

    python ara_sinav.py <<< '{"adet": 30, "agirliklar": {"1.2": 40, ...}, "konular": {"temel-if": "1.2", ...}, "gorulen": []}'
"""

import contextlib
import hashlib
import io
import json
import platform
import random
import sys
import warnings
from pathlib import Path

import numpy as np
import pandas as pd

import sinav
import varyant

KLASOR = Path(__file__).resolve().parent
# Tablo hücreleri bilerek hatalı kod da dener (ör. kümeyi indekslemek); derleme uyarıları çıktıyı kirletmesin
warnings.filterwarnings("ignore", category=SyntaxWarning)
KAPSAM = json.loads((Path(__file__).resolve().parent / "static" / "sinav-kapsam.json").read_text(encoding="utf-8"))
BASLIKLAR = list(KAPSAM["basliklar"])  # "1.1" … "1.5", "HW1"
TIPLER = ["secmeli", "boslukyaz", "tablo"]


def iz(*parcalar):
    return hashlib.md5("|".join(map(str, parcalar)).encode()).hexdigest()[:12]


def calistir(kod, ad_alani=None):
    """Kodu np/pd hazır bir ad alanında çalıştırır; (çıktı, ad_alanı) döndürür. Hata olursa fırlatır."""
    ad = {"np": np, "pd": pd, "__name__": "__main__"} if ad_alani is None else ad_alani
    tampon = io.StringIO()
    with contextlib.redirect_stdout(tampon):
        exec(compile(kod, "<ara>", "exec"), ad)
    return tampon.getvalue().strip(), ad


def deger(kurulum, ifade):
    """Kurulum kodundan sonra ifadenin değerini hesaplar (tablo hücreleri için)."""
    _, ad = calistir(kurulum)
    return eval(ifade, ad)


# Şablon kaydı: (başlık, tip, konu, fonksiyon)
SABLONLAR = []


def sablon(baslik, tip, konu):
    def kaydet(f):
        SABLONLAR.append((baslik, tip, konu, f))
        return f
    return kaydet


def bos(cevaplar, sayisal=False, ifade=None, kod=False):
    """Tablodaki boş hücre: kabul edilen cevaplar; ifade varsa kontrol betiği onu kurulumla yeniden hesaplar.
    sayisal: 3 ile 3.0 eşit sayılır · kod: büyük/küçük harf duyarlı (ör. 'VERI' ile 'veri' farklı değerlerdir)."""
    h = {"cevaplar": [str(c) for c in cevaplar]}
    if sayisal:
        h["sayisal"] = True
    if kod:
        h["kod"] = True
    if ifade is not None:
        h["ifade"] = ifade
    return h


def tablo_sorusu(soru, basliklar, satirlar, aciklama, konu, parmak, kod=None, kurulum=None, girdi=None, slayt=None, dogrulama="kod"):
    s = {"tip": "tablo", "soru": soru, "basliklar": basliklar, "satirlar": satirlar, "aciklama": aciklama,
         "konu": konu, "parmak": parmak, "dogrulama": dogrulama}
    if kod:
        s["kod"] = kod
    if kurulum:
        s["kurulum"] = kurulum
    if girdi:
        s["girdi"] = girdi
    if slayt:
        s["slayt"] = slayt
    return s


def bosluk_sorusu(soru, metin, bosluklar, aciklama, konu, parmak, kod=True, hedef=None, slayt=None):
    s = {"tip": "boslukyaz", "soru": soru, "metin": metin, "bosluklar": bosluklar, "kod": kod,
         "aciklama": aciklama, "konu": konu, "parmak": parmak}
    if hedef is not None:
        s["hedef"] = hedef
    if slayt:
        s["slayt"] = slayt
    return s


def gosterim(v):
    """Hücrede beklenen yazım + kabul edilebilir alternatifler."""
    if isinstance(v, str):
        return [repr(v), v]
    if isinstance(v, np.ndarray):
        return [str(v), str(v.tolist())]
    if isinstance(v, (np.integer,)):
        return [str(int(v))]
    if isinstance(v, (np.floating,)):
        return [str(float(v))]
    return [repr(v)]


def tablo_gizle(satirlar, sutunlar, adet):
    """Verilen (satır, sütun) adaylarından `adet` tanesini rastgele boş bırakılacak olarak seçer."""
    adaylar = [(r, c) for r in range(len(satirlar)) for c in sutunlar]
    return set(random.sample(adaylar, min(adet, len(adaylar))))


# ============================ 1.2 Python Basics ============================

KELIMELER = ["python", "veri", "pandas", "Ankara", "numpy"]


def _python_ifadeleri():
    a, b = random.randint(7, 30), random.randint(2, 6)
    w = random.choice(KELIMELER)
    i = random.randint(0, len(w) - 1)
    havuz = [f"{a} // {b}", f"{a} % {b}", f"{a} / {b}", f"{b} ** {random.randint(2, 3)}", f"'{w}'.upper()", f"len('{w}')",
             f"'{w}'[{i}]", f"'{w}'[{-1}]", f"bool({random.choice([0, 1, 5])})", "bool('')", f"int({a}.{random.randint(1, 9)})",
             f"str({a}) + '{b}'", f"{a} > {b} and {b} > {a}", f"'{w[:2]}' in '{w}'", f"float({a})", f"{a} == {a}.0"]
    return random.sample(havuz, 5)


@sablon("1.2", "tablo", "temel-hesap")
def py_deger_tip():
    ifadeler = _python_ifadeleri()
    satirlar = []
    for ifade in ifadeler:
        v = eval(ifade)
        satirlar.append([ifade, bos(gosterim(v), ifade=ifade, kod=True), bos([type(v).__name__], ifade=f"type({ifade}).__name__")])
    # Her satırda en az bir hücre boş kalsın; bazı satırlarda değer ya da tip verilsin
    for r in random.sample(range(len(satirlar)), 2):
        c = random.choice([1, 2])
        satirlar[r][c] = satirlar[r][c]["cevaplar"][0]
    return tablo_sorusu("Tabloyu tamamla: her ifadenin değeri ve tipi (type(...).__name__)", ["İfade", "Değer", "Tip"], satirlar,
                        "// tam sayı bölmesi, % kalan, / her zaman float; bool('') ve bool(0) False'tur; string metotları yeni string döndürür.",
                        "temel-hesap", f"ar-pyt:{iz(*ifadeler)}", kurulum="", slayt=[18, 26])


@sablon("1.2", "tablo", "liste-comp")
def py_koleksiyon_tablosu():
    tipler = [("list", "[1, 2]"), ("tuple", "(1, 2)"), ("set", "{1, 2}"), ("dict", "{'a': 1}")]
    kurulum = """def _dene(kod):
    try:
        exec(kod, {})
        return 'Evet'
    except Exception:
        return 'Hayır'
"""
    degistir = {"list": "x.append(3)", "tuple": "x[0] = 9", "set": "x.add(3)", "dict": "x['b'] = 2"}
    satirlar = []
    for ad, yazim in tipler:
        mut = f"_dene({('x = ' + yazim + '; ' + degistir[ad])!r})"
        indeks = f"_dene({('(' + yazim + ')[0]')!r})"
        tekrar = f"'Evet' if len({ad}([1, 1])) == 2 else 'Hayır'" if ad != "dict" else "'Hayır'"
        satirlar.append([f"{ad}  {yazim}", bos([deger(kurulum, mut)], ifade=mut), bos([deger(kurulum, indeks)], ifade=indeks),
                         bos([deger(kurulum, tekrar)], ifade=tekrar)])
    gizli = tablo_gizle(satirlar, [1, 2, 3], random.randint(5, 7))
    for r, satir in enumerate(satirlar):
        for c in (1, 2, 3):
            if (r, c) not in gizli:
                satir[c] = satir[c]["cevaplar"][0]
    return tablo_sorusu("Tabloyu tamamla (Evet / Hayır)", ["Tip", "Değiştirilebilir mi? (mutable)", "x[0] ile konumla erişilir mi?",
                        "Tekrar eden öğe tutar mı? (tip([1, 1]))"], satirlar,
                        "list ve dict değiştirilebilir, tuple değiştirilemez; set ve dict konumla indekslenemez; set tekrarları atar. "
                        "(dict için tekrar sütunu anahtarlar içindir: anahtarlar benzersizdir.)",
                        "liste-comp", f"ar-kol:{iz(sorted(gizli))}", kurulum=kurulum, slayt=[32, 34])


@sablon("1.2", "boslukyaz", "temel-hesap")
def py_cumle_bosluk():
    havuz = [
        ("input() fonksiyonu klavyeden okuduğu değeri her zaman ___ olarak döndürür.", [["str", "string", "metin"]], "temel-hesap", [18, 19]),
        ("Tam sayı bölmesi için ___ operatörü, bölümden kalan için ___ operatörü kullanılır.", [["//"], ["%"]], "temel-hesap", [20, 23]),
        ("Değiştirilemeyen (immutable) dizi tipi ___, değiştirilebilen dizi tipi ___ tipidir.", [["tuple"], ["list", "liste"]], "liste-giris", [1, 4]),
        ("Bir sözlükte olmayan anahtar d[anahtar] ile istenirse ___ hatası oluşur; hata vermeden okumak için ___ metodu kullanılır.",
         [["KeyError"], ["get", "get()", "d.get"]], "sozluk-giris", [4, 10]),
        ("Fonksiyon içinde global bir değişkene atama yapmak için ___ anahtar kelimesi kullanılır.", [["global"]], "fonk-global", [26, 28]),
        ("Özyinelemeli fonksiyonda özyinelemeyi durduran duruma ___ durum (base case) denir.", [["temel"]], "ozyineleme-giris", [6, 11]),
        ("Bir örnek oluşturulduğunda otomatik çalışan başlatıcı metodun adı ___ 'dir.", [["__init__"]], "sinif-tanim", [12, 15]),
        ("try bloğunda oluşan istisnayı yakalayan blok ___, her durumda çalışan blok ___ bloğudur.", [["except"], ["finally"]], "dosya-istisna", [24, 31]),
    ]
    metin, bosluklar, konu, slayt = random.choice(havuz)
    return bosluk_sorusu("Boşlukları doldur", metin, bosluklar, "Cevap: " + " · ".join(b[0] for b in bosluklar), konu,
                         f"ar-pyc:{iz(metin)}", kod=False, slayt=slayt)


# ============================ 1.4 Introduction to NumPy ============================

@sablon("1.4", "tablo", "d-boyut")
def np_ozellik_tablosu():
    r, c = random.choice([(2, 3), (3, 4), (2, 4), (3, 3), (4, 2)])
    veri = np.random.randint(1, 10, size=(r, c)).tolist()
    dtype = random.choice(["", ", dtype=float"])
    kurulum = f"a = np.array({veri}{dtype})"
    ifadeler = random.sample(["a.shape", "a.ndim", "a.size", "a.dtype", "a.sum(axis=0)", "a.sum(axis=1)", "a[1, :]", "a[:, 0]",
                              "a.T.shape", "a[0, -1]", "a.max(axis=1)", "a[a > 5]"], 6)
    satirlar = []
    for ifade in ifadeler:
        v = deger(kurulum, ifade)
        cevaplar = [str(v)] + ([str(v.tolist())] if isinstance(v, np.ndarray) else [])
        satirlar.append([ifade, bos(cevaplar, sayisal=not isinstance(v, (np.ndarray, tuple, np.dtype)), ifade=ifade, kod=True)])
    for r_ in random.sample(range(len(satirlar)), 2):
        satirlar[r_][1] = satirlar[r_][1]["cevaplar"][0]
    return tablo_sorusu("Kodu çalıştırınca her ifadenin değeri ne olur? Boş hücreleri doldur.", ["İfade", "Değer"], satirlar,
                        "shape (satır, sütun); ndim eksen sayısı; size eleman sayısı; axis=0 her sütun, axis=1 her satır için sonuç verir.",
                        "d-boyut", f"ar-npt:{iz(veri, dtype, ifadeler)}", kod=kurulum, kurulum=kurulum, slayt=[11, 22])


@sablon("1.4", "boslukyaz", "i-reshape")
def np_kod_bosluk():
    n = random.choice([12, 24])
    sat = random.choice([2, 3, 4])
    kod = f"a = np.___({n}).___({sat}, -1)\nprint(a.shape)"
    hedef, _ = calistir(kod.replace("___", "arange", 1).replace("___", "reshape", 1))
    return bosluk_sorusu("Boşlukları doldur: kod hedef çıktıyı yazdırsın", kod, [["arange"], ["reshape"]],
                         "np.arange sayı dizisi üretir; reshape şekli değiştirir, -1 boyutu otomatik hesaplanır.", "i-reshape",
                         f"ar-npb:{n}:{sat}", hedef=hedef, slayt=[23, 24])


@sablon("1.4", "boslukyaz", "np2-toplama")
def np_axis_bosluk():
    m = np.random.randint(1, 9, size=(2, 3)).tolist()
    eksen = random.choice([0, 1])
    fn = random.choice(["sum", "max", "min"])
    kod = f"m = np.array({m})\nprint(m.___(axis=___))"
    hedef, _ = calistir(kod.replace("___", fn, 1).replace("___", str(eksen), 1))
    # Aynı çıktıyı veren başka bir fonksiyon/eksen varsa kabul edilenlere ekle
    kabul_fn = [f for f in ["sum", "max", "min"] if calistir(kod.replace("___", f, 1).replace("___", str(eksen), 1))[0] == hedef]
    return bosluk_sorusu("Boşlukları doldur: kod hedef çıktıyı yazdırsın", kod, [kabul_fn, [str(eksen)]],
                         "axis=0 her sütun için, axis=1 her satır için sonuç üretir.", "np2-toplama", f"ar-npa:{m}:{fn}:{eksen}",
                         hedef=hedef, slayt=[17, 19])


@sablon("1.4", "boslukyaz", "v-view")
def np_cumle_bosluk():
    havuz = [
        ("NumPy dizisindeki tüm elemanlar aynı tiptedir; bu özelliğe ___ denir.", [["homojenlik", "homojen"]], "n-ndarray", [4, 4]),
        ("NumPy'da basit dilimleme kopya değil ___ döndürür; bağımsız kopya için ___ metodu kullanılır.", [["view"], ["copy", "copy()", ".copy()"]], "v-view", [25, 28]),
        ("np.arange(start, stop) ifadesinde ___ değeri diziye dahil edilmez.", [["stop"]], "o-dizi", [16, 16]),
        ("Elemanları tek tek dolaşmak yerine işlemi dizinin tamamına uygulamaya ___ denir.", [["vektörleştirme", "vectorization"]], "n-vektor", [5, 6]),
        ("NumPy dizilerinde 've' koşulu için ___, 'veya' için ___ operatörü kullanılır.", [["&"], ["|"]], "np2-maske", [3, 3]),
    ]
    metin, bosluklar, konu, slayt = random.choice(havuz)
    return bosluk_sorusu("Boşlukları doldur", metin, bosluklar, "Cevap: " + " · ".join(b[0] for b in bosluklar), konu,
                         f"ar-npc:{iz(metin)}", kod=False, slayt=slayt)


# ============================ 1.5 Pandas (Series, DataFrame, veri temizleme) ============================

def _df_eksik():
    """İçinde NaN ve bazen tekrarlı satır olan küçük bir DataFrame (kod olarak)."""
    adlar = random.sample(["Ada", "Can", "Ece", "Mert", "Selin"], 4)
    yas = [random.choice([None, random.randint(18, 40)]) for _ in range(4)]
    puan = [random.choice([None, random.randint(50, 99)]) for _ in range(4)]
    if all(v is not None for v in yas + puan):
        yas[random.randrange(4)] = None
    return _sayi_garanti({"ad": adlar, "yas": yas, "puan": puan})


def _sayi_garanti(veri, korunan=()):
    """Her sayısal sütunda en az bir sayı olsun (tamamı None olan sütun object tipine düşer); korunan satırlara dokunma."""
    for sutun, alt, ust in (("yas", 18, 40), ("puan", 50, 99)):
        if all(v is None for v in veri[sutun]):
            i = random.choice([j for j in range(len(veri[sutun])) if j not in korunan])
            veri[sutun][i] = random.randint(alt, ust)
    return veri


def _df_tablosu(df):
    """DataFrame'i (index dahil) tablo satırlarına çevirir."""
    def h(v):
        return "NaN" if pd.isna(v) else str(v)
    return {"basliklar": [""] + [str(c) for c in df.columns], "satirlar": [[str(i)] + [h(v) for v in r] for i, r in zip(df.index, df.values.tolist())]}


@sablon("1.5", "tablo", "pd-doldur")
def pd_islem_tablosu():
    veri = _df_eksik()
    islem = random.choice(["dropna()", "fillna(0)", "dropna(how='all')", "dropna(subset=['yas'])"])
    if islem == "dropna(how='all')":
        veri["yas"][1] = None
        veri["puan"][1] = None
        _sayi_garanti(veri, korunan=(1,))
    kurulum = f"df = pd.DataFrame({veri})\nsonuc = df.{islem}"
    _, ad = calistir(kurulum)
    sonuc = ad["sonuc"]
    if sonuc.empty:
        return None
    satirlar = []
    for i in sonuc.index:
        satir = [bos([str(i)], sayisal=True, ifade=f"list(sonuc.index)[{len(satirlar)}]")]
        for c in sonuc.columns:
            v = sonuc.loc[i, c]
            cevap = ["NaN", "nan"] if pd.isna(v) else [str(v)]
            satir.append(bos(cevap, sayisal=not isinstance(v, str), ifade=f"sonuc.loc[{i}, '{c}']"))
        satirlar.append(satir)
    # Index sütununu ve birkaç değer hücresini boş bırak, gerisini ver
    gizli = {(r, 0) for r in range(len(satirlar))} | tablo_gizle(satirlar, list(range(1, len(sonuc.columns) + 1)), 3)
    for r, satir in enumerate(satirlar):
        for c in range(len(satir)):
            if (r, c) not in gizli:
                satir[c] = satir[c]["cevaplar"][0]
    return tablo_sorusu(f"df.{islem} sonucunu tamamla (index dahil)", ["index"] + list(sonuc.columns), satirlar,
                        "dropna() NaN içeren satırları siler (how='all' yalnızca tamamı NaN olanları, subset yalnızca o sütunlara bakar); "
                        "fillna(0) NaN'ları 0 yapar. Silinen satırların index etiketleri atlanır.",
                        "pd-doldur", f"ar-pdi:{veri}:{islem}", kod=kurulum.split("\n")[0] + f"\nsonuc = df.{islem}", kurulum=kurulum,
                        girdi=_df_tablosu(pd.DataFrame(veri)), slayt=[40, 43])


@sablon("1.5", "tablo", "pd-eksik")
def pd_eksik_tablosu():
    veri = _df_eksik()
    kurulum = f"df = pd.DataFrame({veri})"
    _, ad = calistir(kurulum)
    df = ad["df"]
    satirlar = []
    for c in df.columns:
        say = f"int(df['{c}'].isnull().sum())"
        kalir = f"'Evet' if '{c}' in df.dropna(axis=1).columns else 'Hayır'"
        satirlar.append([c, bos([deger(kurulum, say)], sayisal=True, ifade=say), bos([deger(kurulum, kalir)], ifade=kalir)])
    return tablo_sorusu("df.isnull().sum() ve df.dropna(axis=1) sonucuna göre tabloyu tamamla", ["Sütun", "Eksik değer sayısı",
                        "dropna(axis=1) sonrası sütun kalır mı?"], satirlar,
                        "isnull().sum() sütun başına eksik sayısını verir; dropna(axis=1) en az bir NaN içeren sütunları siler.",
                        "pd-eksik", f"ar-pde:{veri}", kod=kurulum, kurulum=kurulum, girdi=_df_tablosu(df), slayt=[38, 41])


@sablon("1.5", "tablo", "pd-temizlik")
def pd_tekrar_tablosu():
    adlar = random.choices(["Ada", "Can", "Ece"], k=5)
    sehir = random.choices(["Ankara", "Bursa"], k=5)
    keep = random.choice(["first", "last"])
    kurulum = f"df = pd.DataFrame({{'ad': {adlar}, 'sehir': {sehir}}})\ndup = df.duplicated(subset=['ad'], keep='{keep}')"
    satirlar = []
    for i in range(5):
        ifade = f"'True' if dup[{i}] else 'False'"
        satirlar.append([str(i), adlar[i], sehir[i], bos([deger(kurulum, ifade)], ifade=ifade)])
    kalan = f"int((~dup).sum())"
    satirlar.append(["", "", "drop_duplicates(subset=['ad'], keep='" + keep + "') sonrası satır sayısı", bos([deger(kurulum, kalan)], sayisal=True, ifade=kalan)])
    return tablo_sorusu(f"df.duplicated(subset=['ad'], keep='{keep}') sonucunu tamamla (True / False)", ["index", "ad", "sehir", "duplicated"], satirlar,
                        "keep='first' her değerin ilk görülenini, keep='last' sonuncusunu tekrar saymaz; diğerleri True olur.",
                        "pd-temizlik", f"ar-pdt:{adlar}:{sehir}:{keep}", kurulum=kurulum, dogrulama="kod")


@sablon("1.5", "tablo", "pd-dataframe")
def pd_series_df_tablosu():
    kurulum = "df = pd.DataFrame({'a': [1, 2, 3], 'b': [4.0, 5.0, 6.0]})\ns = df['a']"
    satirlar = [
        ["Boyut sayısı (ndim)", bos([deger(kurulum, "s.ndim")], True, "s.ndim"), bos([deger(kurulum, "df.ndim")], True, "df.ndim")],
        [".shape", bos([deger(kurulum, "s.shape")], ifade="s.shape"), bos([deger(kurulum, "df.shape")], ifade="df.shape")],
        ["Etiketler (index) var mı?", bos(["Evet"], ifade="'Evet' if hasattr(s, 'index') else 'Hayır'"),
         bos(["Evet"], ifade="'Evet' if hasattr(df, 'index') else 'Hayır'")],
        ["columns özniteliği var mı?", bos(["Hayır"], ifade="'Evet' if hasattr(s, 'columns') else 'Hayır'"),
         bos(["Evet"], ifade="'Evet' if hasattr(df, 'columns') else 'Hayır'")],
        ["df['a'] / df[['a']] tipi", bos(["Series"], ifade="type(df['a']).__name__"), bos(["DataFrame"], ifade="type(df[['a']]).__name__")],
    ]
    gizli = tablo_gizle(satirlar, [1, 2], random.randint(5, 7))
    for r, satir in enumerate(satirlar):
        for c in (1, 2):
            if (r, c) not in gizli:
                satir[c] = satir[c]["cevaplar"][0]
    return tablo_sorusu("Series ve DataFrame'i karşılaştır: tabloyu tamamla", ["Özellik", "Series (s = df['a'])", "DataFrame (df)"], satirlar,
                        "Series tek boyutlu (ndim 1, shape (n,)), DataFrame iki boyutludur (ndim 2, shape (satır, sütun)); "
                        "ikisinin de index'i vardır, columns yalnızca DataFrame'de bulunur.",
                        "pd-dataframe", f"ar-psd:{iz(sorted(gizli))}", kod=kurulum, kurulum=kurulum, slayt=[6, 12])


@sablon("1.5", "boslukyaz", "pd-temizlik")
def pd_temizlik_bosluk():
    veri = {"ad": ["Ada", "Can", "Ada", "Ece", "Can"], "puan": ["10", "x", "10", "7", "5"]}
    secim = random.choice(["dup", "num", "eksik"])
    if secim == "dup":
        keep = random.choice(["first", "last"])
        kod = f"df = pd.DataFrame({veri})\ntemiz = df.___(subset=['ad'], keep='___')\nprint(temiz.index.tolist())"
        hedef, _ = calistir(kod.replace("___", "drop_duplicates", 1).replace("___", keep, 1))
        return bosluk_sorusu("Boşlukları doldur: kod hedef çıktıyı yazdırsın", kod, [["drop_duplicates"], [keep]],
                             "drop_duplicates tekrarları siler; keep='first' ilkini, 'last' sonuncuyu tutar.", "pd-temizlik",
                             f"ar-pdb:dup:{keep}", hedef=hedef)
    if secim == "num":
        kod = f"df = pd.DataFrame({veri})\ndf['puan'] = pd.___(df['puan'], errors='___')\nprint(df['puan'].isna().sum())"
        hedef, _ = calistir(kod.replace("___", "to_numeric", 1).replace("___", "coerce", 1))
        return bosluk_sorusu("Boşlukları doldur: kod hedef çıktıyı yazdırsın", kod, [["to_numeric"], ["coerce"]],
                             "pd.to_numeric(..., errors='coerce') sayıya çevrilemeyen değerleri NaN yapar.", "pd-temizlik",
                             "ar-pdb:num", hedef=hedef)
    kod = "df = pd.DataFrame({'a': [1, None, 3], 'b': [None, None, 6]})\nprint(df.___().___().tolist())"
    hedef, _ = calistir(kod.replace("___", "isnull", 1).replace("___", "sum", 1))
    return bosluk_sorusu("Boşlukları doldur: kod hedef çıktıyı yazdırsın", kod, [["isnull", "isna"], ["sum"]],
                         "isnull()/isna() eksikleri True yapar; sum() sütun başına sayar.", "pd-eksik", "ar-pdb:eksik", hedef=hedef,
                         slayt=[38, 39])


@sablon("1.5", "boslukyaz", "pd-eksik")
def pd_cumle_bosluk():
    havuz = [
        ("Tek boyutlu, etiketli pandas yapısına ___, iki boyutlu tablo yapısına ___ denir.", [["Series"], ["DataFrame"]], "pd-giris", [2, 2]),
        ("np.nan ___ tipindedir; bu yüzden NaN içeren tam sayı sütunu float64'e yükseltilir.", [["float"]], "pd-eksik", [37, 37]),
        ("Eksik değerleri bulmak için df.isna() ya da onun takma adı df.___() kullanılır.", [["isnull"]], "pd-eksik", [38, 38]),
        ("Satır sayısı ve sütun sayısını veren öznitelik ___, özet yazdıran metot ___ 'dur.", [["shape", "df.shape"], ["info", "info()", "df.info()"]], "pd-inceleme", [13, 13]),
        ("Kategorik bir sütundaki eksik değerler genellikle sütunun ___ (en sık değeri) ile doldurulur.", [["mod", "mode"]], "pd-doldur", [44, 44]),
        ("Tekrarlı satırları silen metot ___ 'dir; keep=___ verilirse tekrar eden tüm satırlar silinir.", [["drop_duplicates", "drop_duplicates()"], ["False"]], "pd-temizlik", None),
    ]
    metin, bosluklar, konu, slayt = random.choice(havuz)
    return bosluk_sorusu("Boşlukları doldur", metin, bosluklar, "Cevap: " + " · ".join(b[0] for b in bosluklar), konu,
                         f"ar-pdc:{iz(metin)}", kod=False, slayt=slayt)


@sablon("1.5", "secmeli", "pd-temizlik")
def pd_temizlik_secmeli():
    adlar = random.choices(["Ada", "Can", "Ece"], k=5)
    ifade = random.choice(["df.duplicated().sum()", "len(df.drop_duplicates())", "len(df.drop_duplicates(keep=False))",
                           "df['ad'].nunique()", "df['ad'].value_counts().max()"])
    kod = f"df = pd.DataFrame({{'ad': {adlar}}})\nprint({ifade})"
    dogru, _ = calistir(kod)
    yanlislar = []
    for alt in ["df.duplicated().sum()", "len(df.drop_duplicates())", "len(df.drop_duplicates(keep=False))", "len(df)", "df['ad'].nunique() + 1"]:
        y, _ = calistir(f"df = pd.DataFrame({{'ad': {adlar}}})\nprint({alt})")
        if y != dogru and y not in yanlislar:
            yanlislar.append(y)
    for ek in range(0, 7):
        if len(yanlislar) >= 3:
            break
        if str(ek) != dogru and str(ek) not in yanlislar:
            yanlislar.append(str(ek))
    return sinav.secmeli("Bu kod ne yazdırır?", dogru, yanlislar[:3],
                         "duplicated ilk görüleni False sayar; drop_duplicates(keep=False) tekrar eden tüm satırları siler.",
                         "pd-temizlik", f"ar-pds:{adlar}:{ifade}", kod)


# ============================ 1.1 What is Data Science (slayt dışı) ============================

@sablon("1.1", "tablo", "vb-surec")
def vb_surec_tablosu():
    adimlar = ["Soruyu tanımla", "Veriyi topla", "Temizle ve hazırla", "Keşfet ve analiz et (EDA)", "Modelle", "Sonucu ilet"]
    satirlar = [[str(i + 1), adim] for i, adim in enumerate(adimlar)]
    for r in random.sample(range(len(adimlar)), 3):
        satirlar[r][1] = bos([adimlar[r], adimlar[r].split(" (")[0]])
    return tablo_sorusu("Veri bilimi sürecinin adımlarını sırasıyla tamamla", ["Sıra", "Adım"], satirlar,
                        "Soru → veri toplama → temizleme → keşif/analiz → modelleme → iletişim (süreç döngüseldir).",
                        "vb-surec", f"ar-vbs:{iz([isinstance(s[1], dict) for s in satirlar])}", dogrulama="kavram")


@sablon("1.1", "boslukyaz", "vb-tanim")
def vb_bosluk():
    havuz = [
        ("Veri bilimi istatistik, ___ ve alan bilgisini birleştiren disiplinler arası bir alandır.", [["programlama", "bilgisayar bilimi", "yazılım"]], "vb-tanim"),
        ("Satır ve sütunlardan oluşan tablo verisine ___ veri denir.", [["yapılandırılmış", "yapisal", "structured"]], "vb-tanim"),
        ("Kötü girdinin kötü sonuç üretmesine garbage in, garbage ___ denir.", [["out"]], "vb-surec"),
        ("Modellemeden önce veriyi betimsel istatistik ve grafiklerle tanıma adımına keşifsel veri analizi ya da kısaca ___ denir.", [["EDA"]], "vb-surec"),
    ]
    metin, bosluklar, konu = random.choice(havuz)
    return bosluk_sorusu("Boşlukları doldur", metin, bosluklar, "Cevap: " + " · ".join(b[0] for b in bosluklar), konu,
                         f"ar-vbb:{iz(metin)}", kod=False)


# ============================ 1.3 Python for Data Science ============================

@sablon("1.3", "tablo", "ortam-colab")
def ortam_tablosu():
    satirlar = [
        ["Kurulum gerekir mi?", "Evet", "Hayır"],
        ["İnternet bağlantısı olmadan çalışır mı?", "Evet", "Hayır"],
        ["Ücretsiz GPU/TPU erişimi sunar mı?", "Hayır", "Evet"],
        ["Hücre çalıştırma kısayolu", "Shift + Enter", "Shift + Enter"],
        ["Notebook dosya uzantısı", ".ipynb", ".ipynb"],
    ]
    gizli = tablo_gizle(satirlar, [1, 2], random.randint(4, 6))
    for r, c in gizli:
        dogru = satirlar[r][c]
        satirlar[r][c] = bos([dogru] + ([dogru.replace(" ", "")] if " " in dogru else []) + ([dogru.lstrip(".")] if dogru.startswith(".") else []))
    return tablo_sorusu("Jupyter (Anaconda ile yerel) ve Google Colab'ı karşılaştır", ["Özellik", "Jupyter (yerel, Anaconda)", "Google Colab"],
                        satirlar, "Colab bulutta, kurulumsuz çalışır ve ücretsiz GPU/TPU sunar ama internet gerektirir; yerel Jupyter kurulum ister, çevrimdışı çalışır.",
                        "ortam-colab", f"ar-ort:{iz(sorted(gizli))}", slayt=[8, 19], dogrulama="kavram")


@sablon("1.3", "boslukyaz", "ortam-jupyter")
def ortam_bosluk():
    havuz = [
        ("Jupyter'da bir hücre ___ + Enter ile çalıştırılır.", [["Shift"]], "ortam-jupyter", [8, 9]),
        ("Jupyter notebook dosyalarının uzantısı ___ 'dir.", [[".ipynb", "ipynb"]], "ortam-jupyter", [12, 13]),
        ("Anaconda'nın komut satırı paket yöneticisinin adı ___ 'dır.", [["conda"]], "ortam-anaconda", [1, 7]),
        ("Colab'da komut satırı komutları başına ___ işareti konarak çalıştırılır.", [["!"]], "ortam-colab", [17, 19]),
        ("Projeler arasındaki paket çakışmalarını önlemek için ayrı ___ (environment) oluşturulur.", [["ortam", "ortamlar", "environment"]], "ortam-anaconda", [4, 4]),
    ]
    metin, bosluklar, konu, slayt = random.choice(havuz)
    return bosluk_sorusu("Boşlukları doldur", metin, bosluklar, "Cevap: " + " · ".join(b[0] for b in bosluklar), konu,
                         f"ar-orb:{iz(metin)}", kod=False, slayt=slayt)



# ============================ Homework 1 (content/odev1.md) — kaynak: odev1-taskN ============================
# Sınav, ödevin "Analysis" kısımlarındaki kavramları sorar. Cevaplar kod çalıştırılarak üretilir; sürüme/uygulamaya bağlı
# sonuçların (ör. is, önbellek, özyineleme sınırı) açıklamasına üretildiği Python sürümü yazılır.

ORTAM = f"Bu ortamda ({platform.python_implementation()} {platform.python_version()}, NumPy {np.__version__}) çalıştırıldı."


def hw(q, gorev):
    """Soruyu Homework 1 görevine etiketler."""
    if q:
        q["kaynak"] = f"odev1-task{gorev}"
    return q


def hw_secmeli(kod, yanlis_kodlar, aciklama, konu, parmak, gorev, soru="Bu kod ne yazdırır?", ortam=False, gosterilen=None):
    """Doğru şık kodun gerçek çıktısıdır; yanlışlar çalıştırılan alternatif kodlar ya da hazır metinlerdir."""
    dogru, _ = calistir(kod)
    yanlislar = []
    for y in yanlis_kodlar:
        metin = calistir(y[1])[0] if isinstance(y, tuple) else y
        if metin != dogru and metin not in yanlislar:
            yanlislar.append(metin)
    q = sinav.secmeli(soru, dogru, yanlislar[:3], aciklama + (" " + ORTAM if ortam else ""), konu, parmak, gosterilen or kod)
    return hw(q, gorev)


def kavram_secmeli(soru, dogru, yanlislar, aciklama, konu, parmak, gorev):
    return hw(sinav.secmeli(soru, dogru, yanlislar, aciklama, konu, parmak), gorev)


def _dene_kurulum():
    return """def _dene(f):
    try:
        return f()
    except Exception as e:
        return type(e).__name__
"""


# ---------------- Task 1: özyineleme, ikili gösterim ----------------

@sablon("HW1", "secmeli", "hw1-t1")
def hw1_ikili_cikti():
    n = random.randint(2, 40)
    ifade = random.choice([f"bin({n}), format({n}, 'b')", f"format({n}, 'b').zfill(8)", f"len(format({n}, 'b'))", f"int(format({n}, 'b'), 2)"])
    kod = f"print({ifade})"
    yanlis = [("kod", f"print(bin({n}))"), ("kod", f"print(format({n}, 'b'))"), ("kod", f"print(format({n}, 'o'))"), ("kod", f"print({n})"),
              ("kod", f"print(format({n}, 'x'))"), ("kod", f"print(len(bin({n})))")]
    return hw_secmeli(kod, yanlis, "bin() 0b önekli, format(n, 'b') öneksiz string döndürür; int(s, 2) ikiliden geri çevirir.",
                      "hw1-t1", f"hw1-ik:{n}:{ifade}", 1)


@sablon("HW1", "secmeli", "hw1-t1")
def hw1_ozyineleme_cikti():
    secim = random.choice(["derin", "ikili", "say"])
    if secim == "derin":
        n = random.choice([50, 400, 900, 2000, 5000])
        kod = f"def f(n):\n    return 0 if n == 0 else 1 + f(n - 1)\n\ntry:\n    print(f({n}))\nexcept RecursionError:\n    print('RecursionError')"
        yanlis = ["RecursionError", str(n), str(n - 1), "0", str(n + 1)]
        return hw_secmeli(kod, yanlis, "Her çağrı yeni bir frame ekler; derinlik varsayılan özyineleme sınırını (sys.getrecursionlimit()) aşarsa RecursionError.",
                          "hw1-t1", f"hw1-oz:{n}", 1, ortam=True)
    n = random.randint(5, 30)
    if secim == "ikili":
        kod = f"def ikili(n):\n    if n < 2:\n        return str(n)\n    return ikili(n // 2) + str(n % 2)\n\nprint(ikili({n}))"
        yanlis = [format(n, "b")[::-1], "0b" + format(n, "b"), str(n), format(n + 1, "b")]
        return hw_secmeli(kod, yanlis, "n // 2 ile küçülür; rakamlar en anlamlıdan başlayarak birleşir.", "hw1-t1", f"hw1-ib:{n}", 1)
    k = random.randint(3, 6)
    kod = f"def say(i, n):\n    if i > n:\n        return\n    print(format(i, 'b'), end=' ')\n    say(i + 1, n)\n\nsay(0, {k})"
    yanlis = [("kod", f"print(*[bin(i) for i in range({k + 1})])"), ("kod", f"print(*[format(i, 'b') for i in range({k})])"),
              ("kod", f"print(*[format(i, 'b') for i in range(1, {k + 1})])"), ("kod", f"print(*[str(i) for i in range({k + 1})])")]
    return hw_secmeli(kod, yanlis, "Temel durum i > n; her çağrı bir sayıyı yazar ve i + 1 ile kendini çağırır.", "hw1-t1", f"hw1-say:{k}", 1)


@sablon("HW1", "secmeli", "hw1-t1")
def hw1_kavram_secmeli():
    havuz = [
        ("n derinlikli özyinelemenin yığın (stack) bellek karmaşıklığı nedir?", "O(n)", ["O(1)", "O(log n)", "O(n²)"],
         "Her çağrı yığına bir frame ekler: n çerçeve."),
        ("0..n arasını yazdıran döngülü çözümün ek yığın belleği nedir?", "O(1)", ["O(n)", "O(n²)", "O(log n)"], "Tek frame, sabit bellek."),
        ("Özyineleme sınırı aşılınca hangi istisna fırlatılır?", "RecursionError", ["StackOverflowError", "MemoryError", "IndexError"], "Python RecursionError fırlatır."),
        ("Hangisi değerleri tembel (lazy) üreten alternatiftir?", "(format(i, 'b') for i in range(n + 1))", ["[format(i, 'b') for i in range(n + 1)]",
         "list(range(n + 1))", "tuple(bin(i) for i in range(n + 1))"], "Parantezli ifade bir generator'dür; köşeli parantez listedir."),
    ]
    soru, dogru, yanlis, aciklama = random.choice(havuz)
    return kavram_secmeli(soru, dogru, yanlis, aciklama, "hw1-t1", f"hw1-k1:{iz(soru)}", 1)


@sablon("HW1", "boslukyaz", "hw1-t1")
def hw1_bosluk():
    n = random.randint(3, 40)
    secim = random.choice(["bin", "format", "sys", "gen"])
    if secim == "bin":
        kod = f"print(___({n}))"
        cevap = [["bin"]]
    elif secim == "format":
        kod = f"print(format({n}, '___'))"
        cevap = [["b"]]
    elif secim == "sys":
        kod = "import sys\nprint(sys.___())"
        cevap = [["getrecursionlimit"]]
    else:
        k = random.randint(2, 5)
        kod = f"print(list(format(i, 'b') for i in ___({k} + 1)))"
        cevap = [["range"]]
    dolu = kod
    for c in cevap:
        dolu = dolu.replace("___", c[0], 1)
    hedef, _ = calistir(dolu)
    return hw(bosluk_sorusu("Boşluğu doldur: kod hedef çıktıyı yazdırsın", kod, cevap,
                            "bin → 0b önekli, format(n, 'b') → öneksiz; sys.getrecursionlimit() özyineleme sınırı. " + (ORTAM if secim == "sys" else ""),
                            "hw1-t1", f"hw1-b1:{secim}:{n if secim in ('bin', 'format') else kod}", hedef=hedef), 1)


@sablon("HW1", "tablo", "hw1-t1")
def hw1_ikili_tablosu():
    kurulum = """_cagri = [0]
def ikili(n):
    _cagri[0] += 1
    if n < 2:
        return str(n)
    return ikili(n // 2) + str(n % 2)
def derinlik(n):
    _cagri[0] = 0
    ikili(n)
    return _cagri[0]
"""
    sayilar = sorted(random.sample(range(0, 70), 5))
    satirlar = []
    for n in sayilar:
        satirlar.append([str(n), bos([deger(kurulum, f"bin({n})")], ifade=f"bin({n})", kod=True),
                         bos([deger(kurulum, f"format({n}, 'b')")], ifade=f"format({n}, 'b')", kod=True),
                         bos([deger(kurulum, f"derinlik({n})")], sayisal=True, ifade=f"derinlik({n})")])
    gizli = tablo_gizle(satirlar, [1, 2, 3], random.randint(7, 10))
    for r, satir in enumerate(satirlar):
        for c in (1, 2, 3):
            if (r, c) not in gizli:
                satir[c] = satir[c]["cevaplar"][0]
    kod = "def ikili(n):\n    if n < 2:\n        return str(n)\n    return ikili(n // 2) + str(n % 2)"
    return hw(tablo_sorusu("Tabloyu tamamla (bin ve format string döndürür; derinlik: ikili(n) için yapılan toplam çağrı sayısı)",
                           ["n", "bin(n)", "format(n, 'b')", "ikili(n) çağrı sayısı"], satirlar,
                           "bin 0b önekli, format(n, 'b') öneksiz; ikili(n) her adımda n'i ikiye böler, çağrı sayısı ikili basamak sayısı kadardır.",
                           "hw1-t1", f"hw1-t1t:{sayilar}:{iz(sorted(gizli))}", kod=kod, kurulum=kurulum), 1)


# ---------------- Task 2: Vector, dunder metotlar ----------------

VEKTOR_TEMEL = """class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __add__(self, other):
        if isinstance(other, Vector):
            return Vector(self.x + other.x, self.y + other.y)
        return NotImplemented
    def __str__(self):
        return f'({self.x}, {self.y})'
"""
VEKTOR_RADD = VEKTOR_TEMEL + """    def __radd__(self, other):
        if other == 0:
            return self
        return NotImplemented
"""


@sablon("HW1", "secmeli", "hw1-t2")
def hw1_vector_secmeli():
    a, b, c, d = (random.randint(1, 9) for _ in range(4))
    radd = random.random() < 0.5
    sinif = VEKTOR_RADD if radd else VEKTOR_TEMEL
    ifade = random.choice([f"Vector({a}, {b}) + Vector({c}, {d})", f"sum([Vector({a}, {b}), Vector({c}, {d})])", f"Vector({a}, {b}) + 5",
                           f"0 + Vector({a}, {b})"])
    kod = sinif + f"\ntry:\n    print({ifade})\nexcept TypeError:\n    print('TypeError')"
    yanlis = ["TypeError", f"({a + c}, {b + d})", f"({a}, {b})", f"({a + 5}, {b + 5})", "0", f"({a}, {b}, {c}, {d})"]
    return hw_secmeli(kod, yanlis, "a + b önce a.__add__(b); NotImplemented dönerse b.__radd__(a) denenir; ikisi de yoksa TypeError. "
                                   "sum() 0'dan başladığı için 0 + v → __radd__ gerekir.", "hw1-t2", f"hw1-v:{radd}:{ifade}", 2)


@sablon("HW1", "secmeli", "hw1-t2")
def hw1_dunder_kavram():
    havuz = [
        ("__add__ NotImplemented döndürürse Python ne yapar?", "Diğer operandın __radd__ metodunu dener", ["Sonucu None yapar",
         "NotImplementedError fırlatır", "Toplamı 0 kabul eder"], "NotImplemented bir sinyaldir; yansıtılmış metot denenir, o da yoksa TypeError."),
        ("sum([v1, v2]) neden __radd__ gerektirir?", "sum 0'dan başlar ve önce 0 + v1 hesaplanır", ["sum yalnızca string'leri toplar",
         "sum __str__ metodunu çağırır", "sum listeyi önce sıralar"], "int.__add__ Vector'ü bilmez → v1.__radd__(0)."),
        ("__str__ tanımlı değil ama __repr__ tanımlıysa print(v) ne kullanır?", "__repr__", ["Hiçbir şey yazmaz", "__add__", "Hata verir"],
         "print önce __str__'a bakar; yoksa __repr__'a düşer."),
        ("Hangisi __repr__ için doğrudur?", "Geliştiriciye yönelik, mümkünse nesneyi yeniden üretebilecek gösterimdir", ["Yalnızca toplama sırasında çağrılır",
         "Kullanıcıya yönelik süslü gösterimdir ve print onu hiç kullanmaz", "Nesneyi başlatan metottur"], "__str__ kullanıcıya, __repr__ geliştiriciye yöneliktir."),
    ]
    soru, dogru, yanlis, aciklama = random.choice(havuz)
    return kavram_secmeli(soru, dogru, yanlis, aciklama, "hw1-t2", f"hw1-k2:{iz(soru)}", 2)


@sablon("HW1", "boslukyaz", "hw1-t2")
def hw1_vector_bosluk():
    a, b, c, d = (random.randint(1, 9) for _ in range(4))
    secim = random.choice(["add", "radd", "str"])
    if secim == "add":
        kod = ("class Vector:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __add__(self, other):\n"
               "        return Vector(self.x + other.___, self.y + other.___)\n\nv = Vector(%d, %d) + Vector(%d, %d)\nprint(v.x, v.y)") % (a, b, c, d)
        cevap = [["x"], ["y"]]
    elif secim == "radd":
        kod = (VEKTOR_TEMEL + "    def ___(self, other):\n        return self if other == 0 else NotImplemented\n\n"
               f"print(sum([Vector({a}, {b}), Vector({c}, {d})]))")
        cevap = [["__radd__"]]
    else:
        kod = ("class Vector:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def ___(self):\n"
               f"        return f'({{self.x}}, {{self.y}})'\n\nprint(Vector({a}, {b}))")
        cevap = [["__str__", "__repr__"]]
    dolu = kod
    for c_ in cevap:
        dolu = dolu.replace("___", c_[0], 1)
    hedef, _ = calistir(dolu)
    return hw(bosluk_sorusu("Boşluğu doldur: kod hedef çıktıyı yazdırsın", kod, cevap,
                            "__add__ bileşen bileşen toplar; sum için __radd__; print __str__'ı (yoksa __repr__'ı) kullanır.", "hw1-t2",
                            f"hw1-b2:{secim}:{a}{b}{c}{d}", hedef=hedef), 2)


@sablon("HW1", "tablo", "hw1-t2")
def hw1_vector_tablosu():
    a, b, c, d = (random.randint(1, 9) for _ in range(4))
    kurulum = VEKTOR_RADD + _dene_kurulum() + f"v1 = Vector({a}, {b})\nv2 = Vector({c}, {d})\n"
    ifadeler = ["v1 + v2", "v2 + v1", "sum([v1, v2])", "0 + v1", "v1 + 5", "5 + v1", "str(v1)"]
    satirlar = []
    for ifade in random.sample(ifadeler, 5):
        hucre = f"_dene(lambda: str({ifade}))"
        satirlar.append([ifade, bos([deger(kurulum, hucre)], ifade=hucre, kod=True)])
    return hw(tablo_sorusu("Sonucu yaz (str() ile gösterim); hata veriyorsa hata türünü yaz (ör. TypeError)", ["İfade", "Sonuç"], satirlar,
                           "__add__ yalnızca Vector ile toplar, diğerlerinde NotImplemented → __radd__ denenir; __radd__ yalnızca 0'ı kabul eder.",
                           "hw1-t2", f"hw1-t2t:{a}{b}{c}{d}:{iz([s[0] for s in satirlar])}",
                           kod=VEKTOR_RADD + f"\nv1 = Vector({a}, {b})\nv2 = Vector({c}, {d})", kurulum=kurulum), 2)


# ---------------- Task 3: is / ==, küçük tamsayı önbelleği ----------------

@sablon("HW1", "tablo", "hw1-t3")
def hw1_is_tablosu():
    degerler = random.sample([-6, -5, 0, 1, 100, 255, 256, 257, 300, 1000], 5)
    kurulum = ""
    satirlar = []
    for v in degerler:
        es, ki = f"int('{v}') == int('{v}')", f"int('{v}') is int('{v}')"
        satirlar.append([f"a = int('{v}'); b = int('{v}')", bos([deger(kurulum, es)], ifade=es, kod=False),
                         bos([deger(kurulum, ki)], ifade=ki, kod=False)])
    return tablo_sorusu(f"a == b ve a is b sonuçlarını yaz (True / False). Değerler çalışma zamanında int('...') ile üretiliyor; "
                        f"sonuçlar Python sürümüne ve uygulamasına bağlıdır.", ["Atama", "a == b", "a is b"], satirlar,
                        "== değeri, is nesne kimliğini test eder; CPython -5…256 arasını önbellekte tek nesne tutar. " + ORTAM,
                        "hw1-t3", f"hw1-t3t:{degerler}", kurulum=kurulum) | {"kaynak": "odev1-task3"}


@sablon("HW1", "secmeli", "hw1-t3")
def hw1_is_secmeli():
    secim = random.choice(["runtime", "betik", "repl", "numpy"])
    if secim == "runtime":
        v = random.choice([256, 257, -5, -6, 1000, 0])
        kod = f"a = int('{v}')\nb = int('{v}')\nprint(a == b, a is b)"
        return hw_secmeli(kod, ["True True", "True False", "False False", "False True"], "== değeri, is kimliği test eder; önbellek -5…256.",
                          "hw1-t3", f"hw1-is:{v}", 3, ortam=True)
    if secim == "numpy":
        kod = "a = np.array([5, 5])\nprint(a[0] == a[1], a[0] is a[1])"
        return hw_secmeli(kod, ["True True", "True False", "False False", "Hata verir"],
                          "NumPy ham değer tutar; her erişim yeni np.int64 nesnesi üretir, CPython önbelleğiyle ilgisi yoktur.", "hw1-t3", "hw1-np", 3, ortam=True)
    v = random.choice([257, 300, 1000])
    if secim == "betik":
        ns = {}
        exec(compile(f"a = {v}\nb = {v}", "<betik>", "exec"), ns)
        dogru = str(ns["a"] is ns["b"])
        soru = f"Aşağıdaki iki satır AYNI betikte (tek kod bloğu) çalıştırılırsa a is b ne olur? (a = {v}; b = {v})"
    else:
        ns = {}
        exec(compile(f"a = {v}", "<satır1>", "single"), ns)
        exec(compile(f"b = {v}", "<satır2>", "single"), ns)
        dogru = str(ns["a"] is ns["b"])
        soru = f"Etkileşimli REPL'de a = {v} ve b = {v} AYRI satırlarda girilirse a is b ne olur?"
    return kavram_secmeli(soru, dogru, [x for x in ["True", "False", "Hata verir", "None"] if x != dogru],
                          ("Aynı kod bloğundaki aynı sabitler derleyicide tek nesnede birleşebilir (sabit katlama/paylaşımı); REPL'de her satır ayrı derlenir. "
                           "compile() ile taklit edilerek hesaplandı. " + ORTAM), "hw1-t3", f"hw1-blk:{secim}:{v}", 3)


@sablon("HW1", "secmeli", "hw1-t3")
def hw1_cpython_kavram():
    havuz = [
        ("CPython nedir?", "Python'un C ile yazılmış referans uygulaması", ["Python'u C'ye çeviren bir IDE", "NumPy'ın C eklentisi",
         "Python'un yalnızca Windows sürümü"], "python.org yorumlayıcısı CPython'dur."),
        ("PyLongObject nedir?", "CPython'da Python int değerini temsil eden C yapısı", ["NumPy'daki int64 dizisi",
         "Python'da uzun string tipi", "Bir tamsayının ikili gösterimi"], "Her int bir PyLongObject nesnesidir."),
        ("Sayısal karşılaştırmada neden is kullanılmamalıdır?", "is değer değil nesne kimliği test eder; sonuç önbelleğe ve sürüme bağlıdır",
         ["is her zaman == ile aynı sonucu verdiği için gereksizdir", "is yalnızca string'lerde çalışır", "is sayıları otomatik yuvarlar"],
         "Sayılar == ile karşılaştırılır; is yalnızca None gibi tekil nesneler içindir."),
        ("NumPy, CPython'un küçük tamsayı önbelleğini incelemek için neden uygun değildir?", "NumPy dizileri Python int nesneleri değil ham değerler tutar",
         ["NumPy -5 ile 256 arasını desteklemez", "NumPy'da is operatörü yoktur", "NumPy yalnızca float tutar"],
         "Her erişim yeni bir np.int64 skaleri oluşturur."),
    ]
    soru, dogru, yanlis, aciklama = random.choice(havuz)
    return kavram_secmeli(soru, dogru, yanlis, aciklama, "hw1-t3", f"hw1-k3:{iz(soru)}", 3)


@sablon("HW1", "boslukyaz", "hw1-t3")
def hw1_is_bosluk():
    v = random.choice([257, 300, 500, 1000])
    secim = random.choice(["esit", "kimlik", "int", "surum"])
    if secim == "surum":
        kod = "import sys\nprint(sys.___.split()[0])"
        cevap = [["version"]]
    elif secim == "int":
        kod = f"a = ___('{v}')\nb = int('{v}')\nprint(a == b)"
        cevap = [["int"]]
    else:
        kod = f"a = int('{v}')\nb = int('{v}')\nprint(a ___ b)"
        cevap = [["=="]] if secim == "esit" else [["is"]]
    dolu = kod
    for c in cevap:
        dolu = dolu.replace("___", c[0], 1)
    hedef, _ = calistir(dolu)
    # Aynı hedefi veren diğer operatör de kabul edilsin (ör. 'is' ile '==' aynı çıktıyı veriyorsa)
    if secim in ("esit", "kimlik"):
        cevap = [[op for op in ["==", "is"] if calistir(kod.replace("___", op, 1))[0] == hedef]]
    return hw(bosluk_sorusu("Boşluğu doldur: kod hedef çıktıyı yazdırsın", kod, cevap,
                            "Değer eşitliği ==, nesne kimliği is ile test edilir; sys.version sürümü verir. " + ORTAM, "hw1-t3",
                            f"hw1-b3:{secim}:{v}", hedef=hedef), 3)


# ---------------- Task 4: kesme ve yuvarlama ----------------

@sablon("HW1", "tablo", "hw1-t4")
def hw1_yuvarlama_tablosu():
    degerler = random.sample([2.5, 3.5, -2.5, 2.7, -2.7, 0.5, 1.5, -0.5, 4.5, -3.5, 2.2], 5)
    kurulum = ""
    satirlar = []
    for x in degerler:
        satirlar.append([str(x),
                         bos([deger(kurulum, f"int({x})")], sayisal=True, ifade=f"int({x})"),
                         bos([deger(kurulum, f"round({x})")], sayisal=True, ifade=f"round({x})"),
                         bos([deger(kurulum, f"np.trunc({x})")], sayisal=True, ifade=f"np.trunc({x})"),
                         bos([deger(kurulum, f"np.rint({x})")], sayisal=True, ifade=f"np.rint({x})")])
    gizli = tablo_gizle(satirlar, [1, 2, 3, 4], random.randint(9, 13))
    for r, satir in enumerate(satirlar):
        for c in (1, 2, 3, 4):
            if (r, c) not in gizli:
                satir[c] = satir[c]["cevaplar"][0]
    return hw(tablo_sorusu("Tabloyu tamamla (NumPy sonuçları float'tır; 2.0 yerine 2 yazabilirsin)", ["x", "int(x)", "round(x)", "np.trunc(x)", "np.rint(x)"],
                           satirlar, "int ve np.trunc sıfıra doğru keser; round ve np.rint en yakına, tam .5'te en yakın ÇİFT sayıya yuvarlar.",
                           "hw1-t4", f"hw1-t4t:{degerler}:{iz(sorted(gizli))}", kurulum=kurulum), 4)


@sablon("HW1", "secmeli", "hw1-t4")
def hw1_yuvarlama_secmeli():
    secim = random.choice(["round", "int", "iki", "np", "seed"])
    if secim == "round":
        x = random.choice([0.5, 1.5, 2.5, 3.5, -0.5, -1.5, 4.5])
        kod = f"print(round({x}))"
        yanlis = [str(int(x)), str(int(x) + (1 if x > 0 else -1)), str(x), str(abs(int(x)) + 1)]
    elif secim == "int":
        x = random.choice([-2.7, -0.9, 2.7, -3.1, 3.9])
        kod = f"print(int({x}), round({x}))"
        yanlis = [("kod", f"import math\nprint(math.floor({x}), round({x}))"), ("kod", f"print(round({x}), int({x}))"), f"{x} {x}", ("kod", f"import math\nprint(math.ceil({x}), math.floor({x}))")]
    elif secim == "iki":
        x = random.choice([2.675, 1.005, 0.125, 2.345])
        kod = f"print(round({x}, 2))"
        yanlis = [f"{x + 0.005:.2f}", f"{x:.3f}", f"{x - 0.005:.2f}", str(round(x, 1))]
    elif secim == "np":
        kod = "print(np.rint(np.array([0.5, 1.5, 2.5, -0.5])))"
        yanlis = ["[1. 2. 3. -1.]", "[0. 1. 2. -0.]", "[1. 2. 3. 0.]", ("kod", "print(np.trunc(np.array([0.5, 1.5, 2.5, -0.5])))")]
    else:
        kod = "import random\nrandom.seed(7)\na = [random.random() for _ in range(3)]\nrandom.seed(7)\nb = [random.random() for _ in range(3)]\nprint(a == b)"
        yanlis = ["False", "Hata verir", "None"]
    return hw_secmeli(kod, yanlis, "int sıfıra doğru keser; round/np.rint tam .5'i en yakın çifte yuvarlar; 2.675 gibi değerler ikili sistemde tam temsil edilemez; "
                                   "aynı seed aynı diziyi üretir.", "hw1-t4", f"hw1-yv:{secim}:{kod[-30:]}", 4, ortam=secim == "iki")


@sablon("HW1", "secmeli", "hw1-t4")
def hw1_yuvarlama_kavram():
    havuz = [
        ("Python'da round() tam .5 durumunda hangi kuralı kullanır?", "En yakın çift sayıya yuvarlar (banker's rounding)", ["Her zaman yukarı yuvarlar",
         "Her zaman aşağı yuvarlar", "Sıfıra doğru keser"], "round(0.5) = 0, round(1.5) = 2, round(2.5) = 2."),
        ("Banker's rounding'in faydası nedir?", "Çok sayıda .5'li değerde toplamdaki sistematik yukarı sapmayı (bias) önler", ["Her zaman daha hızlıdır",
         "Negatif sayıları pozitife çevirir", "Sonucu her zaman tam sayı yapar"], "Yarılar yarı yarıya aşağı ve yukarı gider."),
        ("10⁶ elemanlı bir dizide hangisi genellikle en hızlıdır?", "np.rint(dizi)", ["[round(x) for x in liste]", "[int(x) for x in liste]",
         "for döngüsüyle tek tek round"], "Vektörleştirilmiş NumPy işlemi döngüyü C'de, Python nesnesi oluşturmadan yapar."),
        ("int(-2.7) neden -2 verir?", "int() sıfıra doğru keser", ["int() aşağı yuvarlar", "int() en yakın çifte yuvarlar", "int() mutlak değer alır"],
         "Kesme (truncation) ondalık kısmı atar."),
    ]
    soru, dogru, yanlis, aciklama = random.choice(havuz)
    return kavram_secmeli(soru, dogru, yanlis, aciklama, "hw1-t4", f"hw1-k4:{iz(soru)}", 4)


@sablon("HW1", "boslukyaz", "hw1-t4")
def hw1_yuvarlama_bosluk():
    secim = random.choice(["seed", "trunc", "rint", "round"])
    if secim == "seed":
        t = random.randint(1, 99)
        kod = f"import random\nrandom.___({t})\na = random.random()\nrandom.seed({t})\nprint(a == random.random())"
        cevap = [["seed"]]
    elif secim == "trunc":
        kod = "print(np.___(np.array([-2.7, 2.7, -0.5])))"
        cevap = [["trunc", "fix"]]
    elif secim == "rint":
        kod = "print(np.___(np.array([0.5, 1.5, 2.5])))"
        cevap = [["rint", "round"]]
    else:
        x = random.choice([2.5, 3.5, -2.7, 0.5])
        kod = f"print(___({x}))"
        cevap = [["round"]]
    dolu = kod.replace("___", cevap[0][0], 1)
    hedef, _ = calistir(dolu)
    cevap = [[c for c in cevap[0] if calistir(kod.replace("___", c, 1))[0] == hedef]]
    return hw(bosluk_sorusu("Boşluğu doldur: kod hedef çıktıyı yazdırsın", kod, cevap,
                            "np.trunc sıfıra doğru keser; np.rint/np.round yarıyı çifte yuvarlar; random.seed tekrarlanabilirlik sağlar.", "hw1-t4",
                            f"hw1-b4:{secim}:{kod[-25:]}", hedef=hedef), 4)


# ---------------- Task 5: broadcasting, toplamalar, z-skoru ----------------

@sablon("HW1", "tablo", "hw1-t5")
def hw1_sekil_tablosu():
    havuz = [((3, 4), (4,)), ((3, 4), (3, 1)), ((3, 4), (3,)), ((5, 4), (4,)), ((5, 4), (5,)), ((5, 4), (5, 1)), ((3, 4), (1, 4)),
             ((2, 3, 4), (3, 1)), ((3, 1), (1, 4)), ((4,), (3, 1)), ((3, 4), (4, 3))]
    secilen = random.sample(havuz, 5)
    kurulum = """def _sekil(a, b):
    try:
        return str((np.zeros(a) + np.zeros(b)).shape)
    except ValueError:
        return 'hata'
"""
    satirlar = [[str(a), str(b), bos([deger(kurulum, f"_sekil({a}, {b})")] + (["ValueError"] if deger(kurulum, f"_sekil({a}, {b})") == "hata" else []),
                                      ifade=f"_sekil({a}, {b})", kod=True)] for a, b in secilen]
    return hw(tablo_sorusu("A + B işleminin sonuç şeklini yaz; uyumsuzsa 'hata' yaz", ["A.shape", "B.shape", "(A + B).shape"], satirlar,
                           "Şekiller sağdan karşılaştırılır; eksik boyutlar soldan 1 sayılır; her boyutta eşit ya da biri 1 olmalı, aksi halde ValueError.",
                           "hw1-t5", f"hw1-t5s:{iz(secilen)}", kurulum=kurulum), 5)


@sablon("HW1", "tablo", "hw1-t5")
def hw1_toplama_tablosu():
    veri = np.random.randint(0, 20, size=(3, 4)).tolist()
    kurulum = f"X = np.array({veri})"
    ifadeler = ["X.min()", "X.max(axis=0)", "X.mean(axis=1)", "X.sum(axis=0)", "X.mean(axis=1, keepdims=True).shape", "X.max(axis=0).shape",
                "(X - X.mean(axis=0)).shape"]
    satirlar = []
    for ifade in random.sample(ifadeler, 5):
        v = deger(kurulum, ifade)
        cevaplar = [str(v)] + ([str(v.tolist())] if isinstance(v, np.ndarray) else [])
        satirlar.append([ifade, bos(cevaplar, sayisal=not isinstance(v, (np.ndarray, tuple)), ifade=ifade, kod=True)])
    return hw(tablo_sorusu("X için her ifadenin değerini yaz", ["İfade", "Değer"], satirlar,
                           "axis=0 her sütun, axis=1 her satır için sonuç verir; keepdims=True eksenin yerinde 1 bırakır.", "hw1-t5",
                           f"hw1-t5a:{veri}:{iz([s[0] for s in satirlar])}", kod=kurulum, kurulum=kurulum), 5)


@sablon("HW1", "secmeli", "hw1-t5")
def hw1_broadcast_secmeli():
    secim = random.choice(["sekil", "deger", "std", "keep"])
    if secim == "sekil":
        a, b = random.choice([((3, 4), (4,)), ((3, 4), (3, 1)), ((3, 4), (3,)), ((5, 4), (5,)), ((5, 4), (5, 1))])
        kod = f"try:\n    print((np.ones({a}) + np.ones({b})).shape)\nexcept ValueError:\n    print('ValueError')"
        yanlis = ["ValueError", str(a), str(b), str(a[::-1]), str((max(a[0], b[0]), a[-1]))]
    elif secim == "deger":
        r, c = random.randint(0, 2), random.randint(0, 3)
        kod = f"A = np.arange(1, 13).reshape(3, 4)\nB = A + np.array([10, 20, 30, 40])\nprint(B[{r}, {c}])"
        yanlis = [("kod", f"A = np.arange(1, 13).reshape(3, 4)\nprint(A[{r}, {c}] + {10 * (r + 1)})"), ("kod", f"A = np.arange(1, 13).reshape(3, 4)\nprint(A[{r}, {c}])"),
                  ("kod", f"A = np.arange(1, 13).reshape(3, 4)\nprint(A[{r}, {c}] + 10)")]
    elif secim == "std":
        v = random.sample(range(1, 10), 4)
        kod = f"print(round(np.std({v}), 3))"
        yanlis = [("kod", f"print(round(np.std({v}, ddof=1), 3))"), ("kod", f"print(round(np.var({v}), 3))"), ("kod", f"print(round(np.mean({v}), 3))")]
    else:
        kod = "X = np.ones((4, 3))\nprint(X.mean(axis=1, keepdims=True).shape, X.mean(axis=1).shape)"
        yanlis = ["(4,) (4, 1)", "(1, 3) (3,)", "(4, 1) (4, 1)", "(3, 1) (3,)"]
    return hw_secmeli(kod, yanlis, "Broadcasting sağdan karşılaştırır; np.std varsayılan ddof=0; keepdims=True eksende 1 bırakır.",
                      "hw1-t5", f"hw1-bc:{secim}:{kod[-40:]}", 5)


@sablon("HW1", "boslukyaz", "hw1-t5")
def hw1_broadcast_bosluk():
    secim = random.choice(["z", "keep", "reshape", "newaxis"])
    if secim == "z":
        kod = "X = np.array([[1., 2.], [3., 6.], [5., 10.]])\nZ = (X - X.mean(axis=___)) / X.std(axis=___)\nprint(Z.mean(axis=0).round(6), Z.std(axis=0))"
        cevap = [["0"], ["0"]]
    elif secim == "keep":
        kod = "X = np.ones((3, 2))\nprint(X.mean(axis=1, ___=True).shape)"
        cevap = [["keepdims"]]
    elif secim == "reshape":
        kod = "c = np.array([1, 2, 3]).___(3, 1)\nprint((np.zeros((3, 4)) + c).shape)"
        cevap = [["reshape"]]
    else:
        kod = "c = np.array([1, 2, 3])[:, np.___]\nprint(c.shape)"
        cevap = [["newaxis"]]
    dolu = kod
    for c_ in cevap:
        dolu = dolu.replace("___", c_[0], 1)
    hedef, _ = calistir(dolu)
    return hw(bosluk_sorusu("Boşluğu doldur: kod hedef çıktıyı yazdırsın", kod, cevap,
                            "Sütun bazında z-skoru axis=0; keepdims=True eksende 1 bırakır; reshape(3, 1) ya da [:, np.newaxis] sütun vektörü yapar.",
                            "hw1-t5", f"hw1-b5:{secim}", hedef=hedef), 5)

# ============================ Ödev ve ek materyal soruları (content/*.sorular.json) ============================

def ek_sorular():
    """content/ altındaki *.sorular.json dosyalarından hazır sorular (Homework 1 vb. gelince). Biçim: soru nesneleri listesi
    (yukarıdaki tiplerle aynı alanlar + "baslik": "1.x"). ara_sinav_kontrol.py bunları da doğrular."""
    sorular = []
    for dosya in sorted((KLASOR / "content").glob("*.sorular.json")):
        for s in json.loads(dosya.read_text(encoding="utf-8")):
            s.setdefault("parmak", f"ek:{dosya.stem}:{iz(json.dumps(s, sort_keys=True))}")
            s["kaynakDosya"] = dosya.name
            sorular.append(s)
    return sorular


# ============================ Mevcut üreticilerden uyarlananlar ============================

def _secmeli_mi(q):
    return q and q["tip"] == "secmeli" and len(q.get("secenekler", [])) >= 3


def mevcut_ureticiler(konular):
    """Kapsam içi dersler için mevcut üreticiler: (başlık, tip, konu, fonksiyon)."""
    sonuc = []
    harita = varyant._sablon_konulari()
    for konu, baslik in konular.items():
        for s in harita.get(konu, []):
            sonuc.append((baslik, "secmeli", konu, lambda s=s, k=konu: (lambda q: q if _secmeli_mi(q) and q["konu"] == k else None)(s())))
        if len(varyant.BANKA.get(konu, [])) >= 4:
            sonuc.append((baslik, "secmeli", konu, lambda k=konu: varyant.kavram_hangisi(k, random.random() < 0.5)))
        if konu in varyant.TAMAMLAMALAR:
            sonuc.append((baslik, "boslukyaz", konu, lambda k=konu: tamamla_bosluga(varyant.kod_tamamla(k))))
    return sonuc


def tamamla_bosluga(q):
    """Kod tamamlama sorusunu tek boşluklu, yazmalı boşluk sorusuna çevirir."""
    if not q:
        return None
    return bosluk_sorusu("Boşluğu doldur: kod hedef çıktıyı yazdırsın", q["kod"], [q["cevaplar"]], q["aciklama"], q["konu"],
                         "ar-" + q["parmak"], hedef=q["hedef"])


def ureticiler(konular):
    tum = [(b, t, k, f) for b, t, k, f in SABLONLAR if k in konular] + mevcut_ureticiler(konular)
    return tum


# ============================ Deneme sınavı ============================

def dagit(adet, agirliklar, mevcut):
    """Soru sayısını başlıklara ağırlığa göre (en büyük kalan yöntemi) dağıtır; üreticisi olmayan başlık atlanır."""
    ag = {b: max(0.0, float(agirliklar.get(b, 0))) for b in BASLIKLAR if b in mevcut}
    toplam = sum(ag.values()) or 1.0
    ham = {b: adet * w / toplam for b, w in ag.items()}
    sayi = {b: int(v) for b, v in ham.items()}
    for b in sorted(ham, key=lambda x: ham[x] - sayi[x], reverse=True)[: adet - sum(sayi.values())]:
        sayi[b] += 1
    return sayi


def deneme_olustur(adet=30, agirliklar=None, konular=None, gorulen=()):
    konular = konular or {}
    gorulen = set(gorulen)
    tum = ureticiler(konular)
    for s in ek_sorular():
        if s.get("baslik") in BASLIKLAR and s.get("konu") in konular:
            tum.append((s["baslik"], s["tip"], s["konu"], lambda s=s: dict(s)))
    mevcut = {b for b, *_ in tum}
    sayi = dagit(adet, agirliklar or {b: 1 for b in BASLIKLAR}, mevcut)
    sorular, kullanilan = [], set()
    sira = random.randrange(len(TIPLER))  # tip sırası başlıklar arasında sürer: az sorulu denemede de üç tip karışır
    for baslik, n in sayi.items():
        havuz = [(t, k, f) for b, t, k, f in tum if b == baslik]
        tipler = [t for t in TIPLER if any(x[0] == t for x in havuz)]
        for i in range(n):
            tip = TIPLER[sira % len(TIPLER)] if TIPLER[sira % len(TIPLER)] in tipler else tipler[sira % len(tipler)]
            sira += 1
            adaylar = [x for x in havuz if x[0] == tip]
            soru = None
            for deneme in range(80):
                _, konu, f = random.choice(adaylar)
                try:
                    q = f()
                except Exception:  # noqa: BLE001 - bir şablon başarısız olursa başkası denenir
                    q = None
                if not q or q["parmak"] in kullanilan or (q["parmak"] in gorulen and deneme < 60):
                    continue
                soru = q
                break
            if soru is None:  # bu tipte üretilemezse başlıktaki herhangi bir tip
                for _ in range(80):
                    _, konu, f = random.choice(havuz)
                    q = f()
                    if q and q["parmak"] not in kullanilan:
                        soru = q
                        break
            if soru is None:
                continue
            soru["baslik"] = baslik
            kullanilan.add(soru["parmak"])
            sorular.append(soru)
    random.shuffle(sorular)
    return sorular


if __name__ == "__main__":
    istek = json.loads(sys.stdin.read() or "{}")
    adet = max(1, min(int(istek.get("adet", 30)), 80))
    json.dump(deneme_olustur(adet, istek.get("agirliklar"), istek.get("konular"), istek.get("gorulen", [])),
              sys.stdout, ensure_ascii=False)
