"""Final sınavı: Python bölümleri (Week 2–5), NumPy Bölüm 2 ve Pandas için soru şablonları.

Her şablon rastgele parametrelerle bir kod üretir; doğru cevap kodun gerçekten
çalıştırılmasıyla bulunur. Şablonlar @sablon(bolum) ile hangi bölüme ait olduklarını bildirir.
"""

import contextlib
import io
import random
import sqlite3

import numpy as np
import pandas as pd

SABLONLAR = []      # (bolum, fonksiyon)
HATA = "Hata verir"


def sablon(bolum):
    def kaydet(f):
        SABLONLAR.append((bolum, f))
        return f
    return kaydet


def calistir(kod):
    """Kodu çalıştırır; (çıktı, hata_oldu_mu) döndürür."""
    tampon = io.StringIO()
    try:
        with contextlib.redirect_stdout(tampon):
            exec(kod, {"np": np, "pd": pd, "__name__": "__main__"})
    except Exception:  # noqa: BLE001
        return tampon.getvalue().strip(), True
    return tampon.getvalue().strip(), False


def sonuc(kod):
    cikti, hata = calistir(kod)
    return HATA if hata else cikti


def secmeli(kod, yanlis_kodlar_veya_metinler, aciklama, konu, parmak, soru="Bu kod ne yazdırır?"):
    """Doğru cevap kodun çıktısıdır. Yanlışlar ya hazır metin ya da çalıştırılacak alternatif koddur."""
    dogru = sonuc(kod)
    secenekler = [dogru]
    for y in yanlis_kodlar_veya_metinler:
        metin = y[1] if isinstance(y, tuple) else y
        if isinstance(y, tuple) and y[0] == "kod":
            metin = sonuc(y[1])
        if metin and metin not in secenekler:
            secenekler.append(metin)
        if len(secenekler) == 4:
            break
    if len(secenekler) < 3:
        return None
    random.shuffle(secenekler)
    return {"tip": "secmeli", "soru": soru, "kod": kod, "secenekler": secenekler,
            "dogru": secenekler.index(dogru), "aciklama": aciklama, "konu": konu, "parmak": parmak}


def yaz(kod, aciklama, konu, parmak, soru="Bu kod ne yazdırır?"):
    cikti, hata = calistir(kod)
    if hata or not cikti or "\n" in cikti:
        return None
    return {"tip": "yaz", "soru": soru, "kod": kod, "cevaplar": [cikti],
            "aciklama": aciklama, "konu": konu, "parmak": parmak}


def kod_alt(kod):
    return ("kod", kod)


ADLAR = ["x", "a", "sayi", "deger", "n", "veri"]
KELIMELER = ["sebastian", "python", "istanbul", "veribilimi", "ankara", "notebook", "pandas", "matrix"]


# ============================ Python Temelleri ============================

@sablon("temel")
def aritmetik():
    a, b = random.randint(7, 60), random.randint(2, 9)
    op = random.choice(["//", "%", "**", "/"])
    if op == "**":
        a, b = random.randint(2, 6), random.randint(2, 4)
    kod = f"print({a} {op} {b})"
    acik = {"//": "// tam sayı bölmesidir (ondalık kısım kesilir).", "%": "% bölümden kalanı verir.",
            "**": "** üs alır.", "/": "/ her zaman ondalıklı (float) sonuç verir."}[op]
    return yaz(kod, acik, "temel-hesap", f"arit:{a}{op}{b}")


@sablon("temel")
def oncelik():
    a, b, c = random.randint(1, 9), random.randint(2, 9), random.randint(2, 5)
    ifade = random.choice([f"{a} + {b} * {c}", f"({a} + {b}) * {c}", f"{a} * {b} - {c} ** 2", f"{a} + {b} ** 2 // {c}",
                           f"{a * b} // {c} + {a}", f"-{a * b} // {c}"])
    return yaz(f"print({ifade})", "Öncelik: parantez → ** → * / // % → + -; aynı öncelik soldan sağa. "
               "Negatif sonuçlu // sıfırdan uzağa yuvarlanır.", "temel-hesap", f"oncelik:{ifade}")


@sablon("temel")
def fstring():
    num = round(random.uniform(1000, 999999), 4)
    spec = random.choice([".2f", ",.2f", ".1f", ".2e", ",.0f"])
    kod = f"num = {num}\nprint(f'{{num:{spec}}}')"
    diger = [s for s in [".2f", ",.2f", ".1f", ".2e", ",.0f", ".3f"] if s != spec]
    yanlis = [format(num, s) for s in diger]
    return secmeli(kod, yanlis, f"{spec} belirteci: virgül binlik ayırıcı, .nf n ondalık, e bilimsel gösterim.",
                   "temel-fstring", f"fstr:{num}:{spec}")


@sablon("temel")
def yuzde():
    oran = random.choice([0.05, 0.125, 0.25, 0.333, 0.5, 0.75, 0.875, 0.9])
    spec = random.choice([".0%", ".1%"])
    kod = f"oran = {oran}\nprint(f'{{oran:{spec}}}')"
    yanlis = [format(oran, s) for s in [".0%", ".1%", ".2%"] if s != spec] + [f"{oran}%", f"{oran:.2f}"]
    return secmeli(kod, yanlis, "% belirteci değeri 100 ile çarpıp yüzde olarak gösterir.", "temel-fstring", f"yuzde:{oran}:{spec}")


@sablon("temel")
def mantik():
    x, y, z = random.randint(1, 20), random.randint(1, 20), random.randint(1, 20)
    ifade = random.choice(["x > y and y != z", "x < y or z == y", "not (x >= z)", "x <= y < z",
                           "x % 2 == 0 and z > 10", "not x > y or z < 5"])
    kod = f"x, y, z = {x}, {y}, {z}\nprint({ifade})"
    return secmeli(kod, ["True", "False", HATA], "and: ikisi de doğru; or: biri doğru; not: tersi. "
                   "Zincirleme karşılaştırma her parçanın doğru olmasını ister.", "temel-mantik", f"mantik:{x},{y},{z}:{ifade}")


@sablon("temel")
def in_operatoru():
    kelime = random.choice(KELIMELER)
    if random.random() < 0.5:
        i = random.randint(0, len(kelime) - 3)
        alt = kelime[i:i + random.randint(2, 3)]
    else:
        alt = random.choice(["xyz", "aaa", "Py", "ss", "ba", "ist", "ni"])
    op = random.choice(["in", "not in"])
    kod = f"print('{alt}' {op} '{kelime}')"
    return secmeli(kod, ["True", "False", HATA], "in alt string'in içinde geçip geçmediğini test eder; büyük/küçük harf duyarlıdır.",
                   "temel-mantik", f"in:{alt}:{op}:{kelime}")


@sablon("temel")
def string_karsilastir():
    a, b = random.sample(["Mary", "Mark", "mary", "Ali", "Alice", "Zeynep", "apple", "Apple", "banana"], 2)
    op = random.choice([">", "<", "=="])
    kod = f"print('{a}' {op} '{b}')"
    return secmeli(kod, ["True", "False", HATA], "String'ler karakter karakter ASCII değerlerine göre karşılaştırılır; "
                   "büyük harfler küçüklerden önce gelir.", "temel-mantik", f"strcmp:{a}{op}{b}")


# ============================ Karar ve döngüler ============================

@sablon("kontrol")
def range_listesi():
    adim = random.choice([1, 2, 3, -1, -2])
    if adim > 0:
        a = random.randint(0, 6)
        b = a + random.randint(4, 12)
    else:
        a = random.randint(8, 20)
        b = a - random.randint(4, 9)
    kod = f"print(list(range({a}, {b}, {adim})))"
    yanlis = [kod_alt(f"print(list(range({a}, {b + (1 if adim > 0 else -1)}, {adim})))"),
              kod_alt(f"print(list(range({a + adim}, {b}, {adim})))"),
              kod_alt(f"print(list(range({a}, {b}, {adim * 2 if abs(adim) == 1 else adim // abs(adim)})))"), "[]"]
    return secmeli(kod, yanlis, "range(start, stop, step): start dahil, stop dahil değil; negatif adım geriye sayar.",
                   "kontrol-for", f"range:{a}:{b}:{adim}")


@sablon("kontrol")
def while_sayac():
    a, b, s = random.randint(0, 5), random.randint(12, 40), random.randint(2, 5)
    kod = f"i = {a}\nsayac = 0\nwhile i < {b}:\n    i += {s}\n    sayac += 1\nprint(sayac)"
    return yaz(kod, "while koşul doğru oldukça döner; i her iterasyonda artar.", "kontrol-while", f"while:{a}:{b}:{s}")


@sablon("kontrol")
def elif_secimi():
    temp = random.randint(-15, 130)
    kod = (f"temp = {temp}\nif temp > 99:\n    print('boiling')\nelif temp >= 1 and temp <= 99:\n    print('normal')\n"
           "else:\n    print('freezing')")
    return secmeli(kod, ["boiling", "normal", "freezing", "normal\nfreezing"], "Koşullar yukarıdan aşağı denenir; ilk doğru olanın bloğu çalışır.",
                   "kontrol-elif", f"elif:{temp}")


@sablon("kontrol")
def break_continue():
    n, k = random.randint(6, 15), random.randint(2, 4)
    ifade = random.choice(["continue", "break"])
    kosul = random.choice([f"i % {k} == 0", f"i > {random.randint(2, n - 2)}"])
    kod = f"toplam = 0\nfor i in range({n}):\n    if {kosul}:\n        {ifade}\n    toplam += i\nprint(toplam)"
    return yaz(kod, "continue o iterasyonun kalanını atlar; break döngüyü tamamen bitirir.", "kontrol-break",
               f"brk:{n}:{kosul}:{ifade}")


@sablon("kontrol")
def ic_ice_dongu():
    a, b = random.randint(2, 6), random.randint(2, 7)
    kod = f"sayac = 0\nfor i in range({a}):\n    for j in range({b}):\n        sayac += 1\nprint(sayac)"
    return yaz(kod, "Toplam iterasyon = dış döngü × iç döngü.", "kontrol-break", f"icice:{a}:{b}")


@sablon("kontrol")
def artirilmis_atama():
    a, b, c, d = random.randint(2, 9), random.randint(1, 9), random.randint(2, 4), random.randint(2, 5)
    kod = f"x = {a}\nx += {b}\nx *= {c}\nx //= {d}\nprint(x)"
    return yaz(kod, "x += b → x = x + b; x *= c → x = x * c; x //= d → x = x // d.", "kontrol-toplam", f"aug:{a}:{b}:{c}:{d}")


# ============================ Fonksiyonlar ============================

@sablon("fonk")
def fonksiyon_donus():
    k, a, b = random.randint(2, 5), random.randint(1, 9), random.randint(1, 9)
    cagri = random.choice([f"f({a}, {b})", f"f(y={b}, x={a})", f"f({a}, y={b})"])
    kod = f"def f(x, y):\n    return x * {k} + y\n\nprint({cagri})"
    return yaz(kod, "return değeri çağrıya döner; anahtar kelimeli argümanlarda sıra önemsizdir.", "fonk-donus", f"fdon:{k}:{cagri}")


@sablon("fonk")
def deger_ile_aktarim():
    a, k = random.randint(1, 50), random.randint(1, 9)
    kod = f"def degistir(v):\n    v = v + {k}\n\nx = {a}\ndegistir(x)\nprint(x)"
    return secmeli(kod, [str(a + k), "None", HATA], "Pass by value: parametreye yapılan değişiklik argümanı etkilemez.",
                   "fonk-arguman", f"pbv:{a}:{k}")


@sablon("fonk")
def global_degisken():
    a, n = random.randint(1, 6), random.randint(1, 3)
    kod = f"x = {a}\n\ndef ikiye_katla():\n    global x\n    x = x * 2\n\n" + "ikiye_katla()\n" * n + "print(x)"
    return yaz(kod, "global bildirimiyle fonksiyon global değişkeni değiştirebilir.", "fonk-global", f"glob:{a}:{n}")


@sablon("fonk")
def coklu_donus():
    a, b = random.randint(2, 9), random.randint(2, 9)
    hangi = random.choice(["toplam", "carpim"])
    kod = f"def hesapla(a, b):\n    return a + b, a * b\n\ntoplam, carpim = hesapla({a}, {b})\nprint({hangi})"
    return yaz(kod, "Fonksiyon birden çok değer döndürebilir; soldaki değişkenlere sırayla atanır.", "fonk-donus", f"coklu:{a}:{b}:{hangi}")


@sablon("fonk")
def none_donus():
    a, k = random.randint(1, 20), random.randint(2, 5)
    ad = random.choice(["goster", "yazdir", "hesapla", "f"])
    kod = f"def {ad}(x):\n    print(x * {k})\n\nsonuc = {ad}({a})\nprint(sonuc)"
    return secmeli(kod, [f"{a * k}\n{a * k}", str(a * k), "None", HATA], "return'ü olmayan fonksiyon None döndürür.",
                   "fonk-donus", f"none:{ad}:{a}:{k}")


# ============================ Dosyalar ve istisnalar ============================

@sablon("dosya")
def try_except():
    pay = random.randint(10, 99)
    v = repr(random.choice([str(random.randint(0, 9)), "0", random.choice(["abc", "x1", "on", "3.5", "iki"])]))
    kod = (f"try:\n    n = int({v})\n    print({pay} // n)\nexcept ValueError:\n    print('sayı değil')\n"
           "except ZeroDivisionError:\n    print('sıfıra bölme')\nelse:\n    print('tamam')\nfinally:\n    print('bitti')")
    yanlis = ["sayı değil\nbitti", "sıfıra bölme\nbitti", "tamam\nbitti", "bitti", f"{pay}\ntamam\nbitti"]
    return secmeli(kod, yanlis, "İstisna olursa uygun except çalışır, else atlanır; istisna yoksa else çalışır; finally her durumda çalışır.",
                   "dosya-istisna", f"try:{pay}:{v}")


@sablon("dosya")
def dosya_modu():
    a, b = random.sample(["Ada", "Ali", "Can", "Ece", "Veli"], 2)
    mod = random.choice(["w", "a"])
    kod = (f"f = open('sinav.txt', 'w')\nf.write('{a}\\n')\nf.close()\nf = open('sinav.txt', '{mod}')\nf.write('{b}\\n')\n"
           "f.close()\nf = open('sinav.txt', 'r')\nprint(f.read().rstrip('\\n'))\nf.close()")
    return secmeli(kod, [f"{a}\n{b}", b, a, f"{b}\n{a}"], "'w' var olan dosyanın üzerine yazar; 'a' sonuna ekler.",
                   "dosya-io", f"mod:{a}:{b}:{mod}")


# ============================ Listeler ============================

@sablon("liste")
def liste_metot():
    l = random.sample(range(1, 10), 4)
    islemler = random.sample([f"l.append({random.randint(10, 20)})", f"l.insert({random.randint(0, 3)}, 0)", "l.sort()",
                              "l.reverse()", f"l.remove({l[random.randint(0, 3)]})", f"del l[{random.randint(0, 3)}]"], 2)
    kod = f"l = {l}\n" + "\n".join(islemler) + "\nprint(l)"
    yanlis = [kod_alt(f"l = {l}\n" + "\n".join(reversed(islemler)) + "\nprint(l)"), kod_alt(f"l = {l}\n{islemler[0]}\nprint(l)"),
              kod_alt(f"l = {l}\n{islemler[1]}\nprint(l)"), str(l)]
    return secmeli(kod, yanlis, "append sona ekler, insert indekse koyar, sort sıralar, reverse ters çevirir, remove ilk geçtiği yeri, del indeksi siler.",
                   "liste-metot", f"lmet:{l}:{islemler}")


@sablon("liste")
def liste_dilim():
    l = random.sample(range(10, 99), random.randint(6, 8))
    i, j = sorted(random.sample(range(0, len(l)), 2))
    ifade = random.choice([f"l[{i}:{j}]", f"l[-{random.randint(2, 4)}:]", "l[::2]", f"l[:{j}]", "l[1::3]"])
    kod = f"l = {l}\nprint({ifade})"
    yanlis = [kod_alt(f"l = {l}\nprint(l[{i}:{j + 1}])"), kod_alt(f"l = {l}\nprint(l[{i + 1}:{j}])"),
              kod_alt(f"l = {l}\nprint(l[1::2])"), kod_alt(f"l = {l}\nprint(l[:{max(j - 1, 1)}])")]
    return secmeli(kod, yanlis, "Dilim [start:end:step]; end dahil değil, negatif indeks sondan sayar.", "liste-metot", f"ldil:{l}:{ifade}")


@sablon("liste")
def liste_uretec():
    l = random.sample(range(1, 20), 6)
    k, m = random.randint(2, 4), random.randint(5, 15)
    kod = f"l = {l}\nprint([x * {k} for x in l if x < {m}])"
    yanlis = [kod_alt(f"l = {l}\nprint([x * {k} for x in l if x > {m}])"), kod_alt(f"l = {l}\nprint([x for x in l if x < {m}])"),
              kod_alt(f"l = {l}\nprint([x * {k} for x in l])")]
    return secmeli(kod, yanlis, "Sonuç ifadesi yalnızca if koşulunu sağlayan elemanlar için hesaplanır.", "liste-comp", f"lcomp:{l}:{k}:{m}")


@sablon("liste")
def tuple_islem():
    t = tuple(random.sample(range(1, 30), 5))
    op = random.choice(["t.append(7)", "t.sort()", f"t.remove({t[0]})", "t.insert(0, 9)", "len(t)", f"t.index({t[2]})", "t[1:3]", "max(t)"])
    kod = f"t = {t}\nsonuc = {op}"
    hata = calistir(kod)[1]
    return {"tip": "dogruyanlis", "ifade": "Bu kod hata vermeden çalışır.", "kod": kod, "dogru": not hata,
            "aciklama": "Tuple değiştirilemez: append, remove, insert, reverse, sort desteklenmez; indeksleme, dilim, len, max, index desteklenir.",
            "konu": "liste-comp", "parmak": f"tuple:{t}:{op}"}


# ============================ String'ler ============================

@sablon("str")
def string_dilim():
    s = random.choice(KELIMELER)
    i = random.randint(0, len(s) - 3)
    ifade = random.choice([f"s[{i}:{i + random.randint(2, 4)}]", f"s[-{random.randint(2, 4)}:]", "s[::2]", f"s[{i}]", "len(s)"])
    return yaz(f"s = '{s}'\nprint({ifade})", "İndeks 0'dan başlar; dilimde bitiş dahil değil; negatif indeks sondan sayar.",
               "str-metot", f"sdil:{s}:{ifade}")


@sablon("str")
def string_metot():
    s = random.choice(KELIMELER)
    harf = random.choice(sorted(set(s)))
    ifade = random.choice([f"s.find('{harf}')", "s.upper()", f"s.replace('{harf}', '*')", f"s.startswith('{s[:2]}')",
                           f"s.find('{harf}{harf}z')", "s.isalpha()", f"('  ' + s + '  ').strip()"])
    return yaz(f"s = '{s}'\nprint({ifade})", "find ilk indeksi veya -1, replace her geçtiği yeri değiştirir, upper büyük harfe çevirir.",
               "str-metot", f"smet:{s}:{ifade}")


@sablon("str")
def split_token():
    sayilar = random.sample(range(10, 99), random.randint(3, 6))
    ayrac = random.choice([";", "/", ",", "-"])
    metin = ayrac.join(map(str, sayilar))
    ifade = random.choice(["len(parcalar)", f"parcalar[{random.randint(0, len(sayilar) - 1)}]", "int(parcalar[0]) + int(parcalar[-1])"])
    kod = f"parcalar = '{metin}'.split('{ayrac}')\nprint({ifade})"
    return yaz(kod, "split sınırlayıcıya göre string'i token listesine ayırır; token'lar string'dir.", "str-split", f"split:{metin}:{ifade}")


# ============================ Sözlükler ve kümeler ============================

@sablon("sozluk")
def sozluk_get():
    anahtarlar = random.sample(["elma", "armut", "kiraz", "erik", "muz", "incir"], 3)
    d = {k: random.randint(1, 20) for k in anahtarlar}
    k = random.choice(anahtarlar + ["ayva", "nar"])
    ifade = random.choice([f"d.get('{k}', 0)", "len(d)", f"d.pop('{anahtarlar[0]}')", f"'{k}' in d"])
    kod = f"d = {d}\nprint({ifade})"
    return yaz(kod, "get anahtar yoksa varsayılanı döndürür; pop değeri döndürüp siler; in anahtarı test eder.",
               "sozluk-metot", f"dget:{d}:{ifade}")


@sablon("sozluk")
def sozluk_guncelle():
    d = {"a": random.randint(1, 9), "b": random.randint(1, 9)}
    k, v = random.choice(["a", "c"]), random.randint(10, 20)
    kod = f"d = {d}\nd['{k}'] = {v}\nprint(len(d), d['{k}'])"
    return yaz(kod, "Var olan anahtara atama değeri değiştirir; yeni anahtar yeni çift ekler.", "sozluk-giris", f"dupd:{d}:{k}:{v}")


@sablon("sozluk")
def kume_islem():
    a = set(random.sample(range(1, 10), 4))
    b = set(random.sample(range(1, 10), 4))
    op = random.choice(["|", "&", "-", "^"])
    kod = f"a = {sorted(a)}\nb = {sorted(b)}\nprint(sorted(set(a) {op} set(b)))"
    yanlis = [kod_alt(kod.replace(f" {op} ", f" {o} ")) for o in ["|", "&", "-", "^"] if o != op]
    return secmeli(kod, yanlis, "| birleşim, & kesişim, - fark, ^ simetrik fark.", "sozluk-kume", f"set:{sorted(a)}:{sorted(b)}:{op}")


@sablon("sozluk")
def sozluk_uretec():
    l = random.sample(range(1, 10), 4)
    k = random.randint(2, 5)
    x = random.choice(l)
    kod = f"d = {{n: n * {k} for n in {l}}}\nprint(d[{x}])"
    return yaz(kod, "Sözlük üreteci: anahtar n, değer n * k.", "sozluk-metot", f"dcomp:{l}:{k}:{x}")


# ============================ Sınıflar ============================

@sablon("sinif")
def sinif_metot():
    bas, adimlar = random.randint(0, 10), [random.randint(1, 9) for _ in range(random.randint(2, 3))]
    kod = (f"class Sayac:\n    def __init__(self, baslangic):\n        self.deger = baslangic\n\n    def artir(self, n):\n"
           f"        self.deger += n\n\ns = Sayac({bas})\n" + "".join(f"s.artir({a})\n" for a in adimlar) + "print(s.deger)")
    return yaz(kod, "__init__ özniteliği başlatır; her metot çağrısı aynı örneğin özniteliğini günceller.", "sinif-tanim", f"cls:{bas}:{adimlar}")


@sablon("sinif")
def ornek_bagimsiz():
    a, b = random.randint(1, 9), random.randint(10, 20)
    hangi = random.choice(["k1", "k2"])
    kod = (f"class Kutu:\n    def __init__(self):\n        self.deger = {a}\n\nk1 = Kutu()\nk2 = Kutu()\nk1.deger = {b}\nprint({hangi}.deger)")
    return yaz(kod, "Her örneğin kendi öznitelikleri vardır.", "sinif-ornek", f"inst:{a}:{b}:{hangi}")


@sablon("sinif")
def str_metodu():
    ad, bakiye = random.choice(["Ada", "Can", "Ece"]), random.randint(100, 99999)
    kod = (f"class Hesap:\n    def __init__(self, ad, bakiye):\n        self.__ad = ad\n        self.__bakiye = bakiye\n\n"
           f"    def __str__(self):\n        return f'{{self.__ad}}: {{self.__bakiye:,}} TL'\n\nprint(Hesap('{ad}', {bakiye}))")
    return secmeli(kod, [f"{ad}: {bakiye} TL", "<__main__.Hesap object>", HATA], "print nesneye uygulanınca __str__ otomatik çağrılır.",
                   "sinif-tanim", f"str:{ad}:{bakiye}")


# ============================ Kalıtım ============================

SESLER = [("Dog", "Woof"), ("Cat", "Meow"), ("Cow", "Moo"), ("Duck", "Quack")]


@sablon("kalitim")
def override():
    (alt1, ses1), (alt2, _) = random.sample(SESLER, 2)
    hangi = random.choice([alt1, alt2, "Mammal"])
    kod = (f"class Mammal:\n    def sound(self):\n        return 'Grrrrr'\n\nclass {alt1}(Mammal):\n    def sound(self):\n"
           f"        return '{ses1}'\n\nclass {alt2}(Mammal):\n    pass\n\nprint({hangi}().sound())")
    return secmeli(kod, ["Grrrrr", ses1, HATA, "None"], "Override eden alt sınıf kendi sürümünü kullanır; override etmeyen üst sınıftan miras alır.",
                   "kalitim-poly", f"ovr:{alt1}:{alt2}:{hangi}")


@sablon("kalitim")
def isinstance_soru():
    ust = random.choice(["Mammal", "Animal", "Vehicle", "Shape", "Account"])
    a1, a2, a3 = random.sample(["Dog", "Cat", "Car", "Truck", "Circle", "Square", "Savings", "Puppy", "Kitten"], 3)
    siniflar = [ust, a1, a2, a3]
    nesne, sinif = random.choice(siniflar), random.choice(siniflar)
    kod = (f"class {ust}:\n    pass\n\nclass {a1}({ust}):\n    pass\n\nclass {a2}({ust}):\n    pass\n\n"
           f"class {a3}({a1}):\n    pass\n\nprint(isinstance({nesne}(), {sinif}))")
    return secmeli(kod, ["True", "False", HATA], "Bir sınıfın örneği, kendi sınıfının ve tüm üst sınıflarının örneğidir; tersi doğru değildir.",
                   "kalitim-poly", f"isin:{ust}:{a1}:{a2}:{a3}:{nesne}:{sinif}")


@sablon("kalitim")
def ust_init():
    x, y = random.randint(1, 9), random.randint(1, 9)
    kod = (f"class A:\n    def __init__(self):\n        self.x = {x}\n\nclass B(A):\n    def __init__(self):\n        A.__init__(self)\n"
           f"        self.y = {y}\n\nb = B()\nprint(b.x * 10 + b.y)")
    return yaz(kod, "Alt sınıfın __init__'i önce üst sınıfın başlatıcısını çağırır, sonra kendi özniteliklerini ekler.",
               "kalitim-giris", f"init:{x}:{y}")


# ============================ Özyineleme ============================

@sablon("ozyineleme")
def faktoriyel():
    a, b = random.randint(3, 9), random.randint(1, 6)
    ifade = random.choice([f"factorial({a})", f"factorial({a}) // factorial({a - 2})", f"factorial({a}) + factorial({b})",
                           f"factorial({b}) * {a}"])
    kod = f"def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nprint({ifade})"
    return yaz(kod, "n! = n × (n-1)!; temel durum 0! = 1.", "ozyineleme-giris", f"fact:{ifade}")


@sablon("ozyineleme")
def fibonacci():
    a, b = random.randint(3, 15), random.randint(0, 10)
    ifade = random.choice([f"fib({a})", f"fib({a}) + fib({b})", f"fib({a}) - fib({b})" if a > b else f"fib({b}) - fib({a})"])
    kod = f"def fib(n):\n    if n == 0:\n        return 0\n    elif n == 1:\n        return 1\n    return fib(n - 1) + fib(n - 2)\n\nprint({ifade})"
    return yaz(kod, "Seri: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, ...", "ozyineleme-alg", f"fib:{ifade}")


@sablon("ozyineleme")
def ebob():
    g = random.randint(2, 12)
    x, y = g * random.randint(2, 9), g * random.randint(2, 9)
    kod = f"def gcd(x, y):\n    if x % y == 0:\n        return y\n    return gcd(y, x % y)\n\nprint(gcd({x}, {y}))"
    return yaz(kod, "gcd(x, y) = y, eğer x % y == 0; değilse gcd(y, x % y).", "ozyineleme-alg", f"gcd:{x}:{y}")


@sablon("ozyineleme")
def aralik_toplami():
    l = random.sample(range(1, 20), 7)
    i, j = sorted(random.sample(range(7), 2))
    kod = (f"def range_sum(lst, start, end):\n    if start > end:\n        return 0\n    return lst[start] + range_sum(lst, start + 1, end)\n\n"
           f"print(range_sum({l}, {i}, {j}))")
    return yaz(kod, "start'tan end'e (ikisi dahil) elemanlar toplanır; start > end temel durumdur.", "ozyineleme-alg", f"rsum:{l}:{i}:{j}")


@sablon("ozyineleme")
def ozyineleme_derinlik():
    n, k = random.randint(2, 12), random.randint(1, 3)
    soz = random.choice(["Hi", "Merhaba", "Tekrar", "Python"])
    kod = f"def message(times):\n    if times > 0:\n        print('{soz}')\n        message(times - {k})\n\nmessage({n})"
    adet = -(-n // k)
    secenekler = ["\n".join([soz] * m) for m in sorted({max(adet - 1, 1), adet + 1, n, n + 1} - {adet})] + ["Sonsuz döngü"]
    return secmeli(kod, secenekler, f"times her çağrıda {k} azalır; times 0 veya altına inince durur.", "ozyineleme-giris",
                   f"depth:{n}:{k}:{soz}")


# ============================ Veritabanı ============================

URUNLER = ["Hammer", "Wrench", "Screwdriver", "Pliers", "Saw", "Drill", "Tape", "Vice Grips"]


def _urun_tablosu():
    satirlar = [(ad, round(random.uniform(2, 30), 2)) for ad in random.sample(URUNLER, random.randint(4, 6))]
    degerler = ", ".join(f"('{a}', {f})" for a, f in satirlar)
    return satirlar, ("import sqlite3\ncur = sqlite3.connect(':memory:').cursor()\n"
                      "cur.execute('CREATE TABLE Products (Name TEXT, Price REAL)')\n"
                      f"cur.execute(\"INSERT INTO Products VALUES {degerler}\")\n")


@sablon("vt")
def sql_count():
    satirlar, kod = _urun_tablosu()
    p = random.choice([5, 10, 15, 20])
    kod += f"cur.execute('SELECT COUNT(*) FROM Products WHERE Price > {p}')\nprint(cur.fetchone()[0])"
    return yaz(kod, "COUNT(*) WHERE koşulunu sağlayan satır sayısını verir.", "vt-select", f"sqlc:{satirlar}:{p}")


@sablon("vt")
def sql_order():
    satirlar, kod = _urun_tablosu()
    kod += "cur.execute('SELECT Name FROM Products ORDER BY Price')\nprint(cur.fetchone()[0])"
    return yaz(kod, "ORDER BY varsayılan olarak artan sıralar; fetchone ilk satırı (en ucuzu) döndürür.", "vt-select", f"sqlo:{satirlar}")


@sablon("vt")
def sql_update():
    satirlar, kod = _urun_tablosu()
    p = random.choice([8, 12, 16])
    islem = random.choice([f"UPDATE Products SET Price = 0 WHERE Price < {p}", f"DELETE FROM Products WHERE Price >= {p}"])
    kod += f"cur.execute('{islem}')\nprint(cur.rowcount)"
    return yaz(kod, "rowcount UPDATE/DELETE'in etkilediği satır sayısını verir.", "vt-update", f"sqlu:{satirlar}:{islem}")


@sablon("vt")
def sql_agg():
    satirlar, kod = _urun_tablosu()
    fn = random.choice(["MIN", "MAX", "COUNT"])
    sutun = "*" if fn == "COUNT" else "Price"
    kod += f"cur.execute('SELECT {fn}({sutun}) FROM Products')\nprint(cur.fetchone()[0])"
    return yaz(kod, "MIN/MAX en küçük/en büyük değeri, COUNT satır sayısını verir.", "vt-select", f"sqla:{satirlar}:{fn}")


# ============================ NumPy Bölüm 2 ============================

@sablon("np2")
def maske():
    data = random.sample(range(0, 20), 8)
    a, b = sorted(random.sample(range(2, 18), 2))
    kosul = random.choice([f"data > {a}", f"(data > {a}) & (data < {b})", f"(data < {a}) | (data > {b})", f"~(data > {a})", "data % 2 == 0"])
    kod = f"data = np.array({data})\nprint(data[{kosul}])"
    yanlis = [kod_alt(f"data = np.array({data})\nprint(data[~({kosul})])"), kod_alt(f"data = np.array({data})\nprint(np.sort(data[{kosul}]))"),
              kod_alt(f"data = np.array({data})\nprint({kosul})"), kod_alt(f"data = np.array({data})\nprint(data[data > {b}])")]
    return secmeli(kod, yanlis, "Maske True olan konumları, dizideki sırasıyla seçer; & ve, | veya, ~ değil.",
                   "np2-maske", f"mask:{data}:{kosul}")


@sablon("np2")
def maske_say():
    data = random.sample(range(-10, 20), 10)
    kosul = random.choice(["data < 0", "data % 2 == 0", "data > 5", "(data > 0) & (data < 10)"])
    return yaz(f"data = np.array({data})\nprint(np.sum({kosul}))", "np.sum(maske) True'ları 1 sayarak koşulu sağlayan eleman sayısını verir.",
               "np2-maske", f"msay:{data}:{kosul}")


@sablon("np2")
def reshape_eksi_bir():
    r, c = random.randint(2, 6), random.randint(2, 6)
    n = r * c
    ifade = random.choice([f"reshape({r}, -1)", f"reshape(-1, {c})", f"reshape({r}, {c}, -1)"])
    kod = f"print(np.arange({n}).{ifade}.shape)"
    return secmeli(kod, [str((r, c + 1)), str((c, r)), str((n,)), str((r, c, 1)), str((r, c)), str((r, -1))],
                   "-1 olan boyut toplam eleman sayısından otomatik hesaplanır.", "np2-reshape", f"rs1:{n}:{ifade}")


@sablon("np2")
def ravel_flatten():
    fn = random.choice(["ravel", "flatten"])
    v = random.randint(50, 99)
    kod = f"m = np.array([[1, 2], [3, 4]])\nd = m.{fn}()\nd[0] = {v}\nprint(m[0, 0])"
    return secmeli(kod, [str(v), "1", HATA], "ravel mümkünse view döndürür (orijinal değişir); flatten her zaman kopya döndürür.",
                   "np2-reshape", f"rvl:{fn}:{v}")


@sablon("np2")
def transpoz():
    a, b, c = random.randint(2, 5), random.randint(2, 5), random.randint(2, 5)
    eksen = random.choice([(2, 0, 1), (1, 0, 2), (0, 2, 1), (2, 1, 0)])
    kod = f"t = np.zeros(({a}, {b}, {c}))\nprint(np.transpose(t, axes={eksen}).shape)"
    sekil = (a, b, c)
    yanlis = [str(tuple(sekil[i] for i in p)) for p in [(0, 1, 2), (1, 2, 0), (2, 1, 0), (2, 0, 1), (1, 0, 2)] if p != eksen]
    return secmeli(kod, yanlis, "axes tuple'ı eksenlerin yeni sırasını verir: yeni şekil[i] = eski şekil[axes[i]].", "np2-reshape", f"tr:{sekil}:{eksen}")


@sablon("np2")
def yigma():
    fn = random.choice(["vstack", "hstack"])
    r1, c1 = random.randint(1, 4), random.randint(1, 4)
    uyumlu = random.random() < 0.75
    if fn == "vstack":
        r2, c2 = random.randint(1, 4), (c1 if uyumlu else c1 + 1)
    else:
        r2, c2 = (r1 if uyumlu else r1 + 1), random.randint(1, 4)
    kod = f"a = np.zeros(({r1}, {c1}))\nb = np.ones(({r2}, {c2}))\nprint(np.{fn}((a, b)).shape)"
    yanlis = [str((r1 + r2, c1)), str((r1, c1 + c2)), str((r1 + r2, c1 + c2)), HATA, str((max(r1, r2), c1))]
    return secmeli(kod, yanlis, "vstack axis=0 (satır ekler), hstack axis=1 (sütun ekler); diğer boyutlar eşit olmalı.",
                   "np2-birlestir", f"stk:{fn}:{r1},{c1}:{r2},{c2}")


@sablon("np2")
def bolme():
    n = random.randint(6, 12)
    k = random.choice([2, 3, 4])
    kod = f"x = np.arange({n})\nparcalar = np.split(x, {k})\nprint(len(parcalar[0]))"
    return secmeli(kod, [str(k), str(n), HATA, str(n // k + 1)], "split(x, N) diziyi N eşit parçaya böler; eşit bölünemezse ValueError.",
                   "np2-birlestir", f"split:{n}:{k}")


@sablon("np2")
def broadcasting():
    r, c = random.randint(2, 5), random.randint(2, 5)
    ikinci = random.choice([f"({c},)", f"({r}, 1)", f"(1, {c})", f"({c + 1},)", f"({r + 1}, 1)"])
    kod = f"a = np.ones(({r}, {c}))\nb = np.zeros({ikinci})\nprint((a + b).shape)"
    return secmeli(kod, [str((r, c)), HATA, str((c, r)), str((r, c + 1)), str((1, c))],
                   "Sondan karşılaştır; eksik boyutlar soldan 1 ile doldurulur; 1 olan boyut esnetilir; ikisi de 1 değil ve farklıysa ValueError.",
                   "np2-ufunc", f"bc:{r},{c}:{ikinci}")


@sablon("np2")
def eksen_toplama():
    m = np.array([[random.randint(1, 9) for _ in range(3)] for _ in range(2)]).tolist()
    fn = random.choice(["sum", "max", "min"])
    eksen = random.choice([0, 1])
    kod = f"m = np.array({m})\nprint(m.{fn}(axis={eksen}))"
    yanlis = [kod_alt(f"m = np.array({m})\nprint(m.{fn}(axis={1 - eksen}))"), kod_alt(f"m = np.array({m})\nprint(m.{fn}())"),
              kod_alt(f"m = np.array({m})\nprint(m.{'max' if fn != 'max' else 'min'}(axis={eksen}))")]
    return secmeli(kod, yanlis, "axis=0 her sütun için, axis=1 her satır için sonuç üretir; axis yoksa tek skaler.",
                   "np2-toplama", f"ax:{m}:{fn}:{eksen}")


@sablon("np2")
def ufunc_soru():
    a = random.sample(range(1, 10), 3)
    fn = random.choice(["np.sqrt(np.array(a) ** 2)", "np.greater(np.array(a), 4)", "np.multiply(np.array(a), 2)",
                        "np.power(np.array(a), 2)", "np.abs(np.array(a) - 5)"])
    kod = f"a = {a}\nprint({fn})"
    yanlis = [kod_alt(f"a = {a}\nprint(np.array(a))"), kod_alt(f"a = {a}\nprint(np.array(a) + 2)"), kod_alt(f"a = {a}\nprint(np.array(a) > 5)")]
    return secmeli(kod, yanlis, "Ufunc'lar eleman eleman çalışır; karşılaştırma ufunc'ları boolean dizi döndürür.", "np2-ufunc", f"uf:{a}:{fn}")


# ============================ Pandas ============================

ISIMLER = ["Ada", "Can", "Ece", "Mert", "Zeynep", "Deniz", "Selin", "Emre"]


@sablon("pd")
def pd_series_etiket():
    etiketler = random.sample(list("abcdefgh"), 4)
    degerler = random.sample(range(1, 50), 4)
    hedef = random.choice(etiketler)
    erisim = random.choice([f"s['{hedef}']", f"s.loc['{hedef}']"])
    kod = f"s = pd.Series({degerler}, index={etiketler})\nprint({erisim})"
    yanlis = [str(v) for v in degerler if v != degerler[etiketler.index(hedef)]] + [HATA]
    return secmeli(kod, yanlis, "Series'te değerlere index etiketiyle erişilir.", "pd-series", f"pdse:{degerler}:{etiketler}:{erisim}")


@sablon("pd")
def pd_series_sozluk():
    adlar = random.sample(ISIMLER, random.randint(3, 6))
    notlar = {ad: random.randint(40, 100) for ad in adlar}
    oz = random.choice(["s.size", "s.index[0]", "s.index[-1]", "s.shape", "s.max()"])
    return yaz(f"s = pd.Series({notlar})\nprint({oz})", "Sözlükten Series: anahtarlar index, değerler veri olur.",
               "pd-series", f"pdsd:{notlar}:{oz}")


@sablon("pd")
def pd_hizalama():
    a_etiket = sorted(random.sample(list("abcdef"), 3))
    b_etiket = sorted(random.sample(list("abcdef"), 3))
    a_deger, b_deger = random.sample(range(1, 10), 3), random.sample(range(10, 90, 10), 3)
    on = f"a = pd.Series({a_deger}, index={a_etiket})\nb = pd.Series({b_deger}, index={b_etiket})\n"
    kod = on + "print((a + b).tolist())"
    yanlis = [kod_alt(f"print([float(x + y) for x, y in zip({a_deger}, {b_deger})])"), kod_alt(on + "print((a + b).dropna().tolist())"),
              kod_alt(on + "print(a.add(b, fill_value=0).tolist())")]
    return secmeli(kod, yanlis, "İşlemler etiketlere göre hizalanır; index birleşimdir ve yalnızca bir tarafta olan etiket NaN olur.",
                   "pd-dataframe", f"pdal:{a_etiket}:{b_etiket}:{a_deger}:{b_deger}")


@sablon("pd")
def pd_shape():
    r, c = random.randint(2, 7), random.randint(1, 5)
    sutunlar = {f"c{i}": list(range(i, i + r)) for i in range(c)}
    kod = f"df = pd.DataFrame({sutunlar})\nprint(df.shape)"
    return secmeli(kod, [str((c, r)), str(r * c), str((r,)), str((r, c + 1))], "shape (satır, sütun) tuple'ıdır.",
                   "pd-inceleme", f"pdsh:{r}:{c}")


@sablon("pd")
def pd_betimsel():
    yaslar = random.sample(range(18, 70), random.choice([4, 5, 6]))
    fn = random.choice(["mean()", "median()", "max()", "min()", "count()", "quantile(0.5)"])
    return yaz(f"df = pd.DataFrame({{'Age': {yaslar}}})\nprint(df['Age'].{fn})",
               "mean ortalama, median/50% ortadaki değer, count eksik olmayan değer sayısıdır.", "pd-inceleme", f"pdbt:{yaslar}:{fn}")


@sablon("pd")
def pd_loc_iloc():
    n = random.randint(5, 8)
    a = random.randint(0, n - 3)
    b = random.randint(a + 1, n - 1)
    fn = random.choice(["loc", "iloc"])
    on = f"df = pd.DataFrame({{'x': {list(range(10, 10 * (n + 1), 10))}}})\n"
    kod = on + f"print(df.{fn}[{a}:{b}, {'0' if fn == 'iloc' else repr('x')}].tolist())"
    diger = "iloc" if fn == "loc" else "loc"
    yanlis = [kod_alt(on + f"print(df.{diger}[{a}:{b}, {'0' if diger == 'iloc' else repr('x')}].tolist())"),
              kod_alt(on + f"print(df.iloc[{a + 1}:{b + 1}, 0].tolist())"), kod_alt(on + f"print(df.iloc[{a}:{b + 2}, 0].tolist())")]
    return secmeli(kod, yanlis, "loc etiket temellidir ve bitiş dahildir; iloc konum temellidir ve bitiş hariçtir.",
                   "pd-secim", f"pdli:{n}:{a}:{b}:{fn}")


@sablon("pd")
def pd_filtre():
    yaslar = [random.randint(1, 70) for _ in range(6)]
    cinsiyet = [random.choice(["male", "female"]) for _ in range(6)]
    esik = random.choice([18, 30, 40])
    kosul = random.choice([f"df['Age'] > {esik}", f"(df['Age'] > {esik}) & (df['Sex'] == 'male')",
                           f"(df['Age'] < {esik}) | (df['Sex'] == 'female')", f"~(df['Age'] > {esik})"])
    return yaz(f"df = pd.DataFrame({{'Age': {yaslar}, 'Sex': {cinsiyet}}})\nprint(len(df[{kosul}]))",
               "Maske True olan satırlar seçilir; & ve, | veya, ~ değil.", "pd-filtre", f"pdfl:{yaslar}:{cinsiyet}:{kosul}")


@sablon("pd")
def pd_eksik_say():
    a = [random.choice([None, random.randint(1, 9)]) for _ in range(5)]
    b = [random.choice([None, random.randint(1, 9)]) for _ in range(5)]
    ifade = random.choice(["df.isna().sum().sum()", "df['a'].isna().sum()", "df['b'].isnull().sum()", "df['a'].count()"])
    return yaz(f"df = pd.DataFrame({{'a': {a}, 'b': {b}}})\nprint({ifade})",
               "isna()/isnull() eksikleri True yapar; sum() True'ları sayar. count() eksik olmayanları sayar.", "pd-eksik", f"pdes:{a}:{b}:{ifade}")


@sablon("pd")
def pd_dropna():
    a = [1, None, 3, None, 5]
    b = [random.choice([None, 7]) for _ in range(5)]
    c = [random.choice([None, 9]) for _ in range(5)]
    cagri = random.choice(["dropna()", "dropna(how='all')", "dropna(axis=1)", "dropna(thresh=2)"])
    on = f"df = pd.DataFrame({{'a': {a}, 'b': {b}, 'c': {c}}})\n"
    yanlis = [kod_alt(on + f"print(df.{x}.shape)") for x in ["dropna()", "dropna(how='all')", "dropna(axis=1)", "dropna(thresh=2)"] if x != cagri]
    return secmeli(on + f"print(df.{cagri}.shape)", yanlis + [str((5, 3))],
                   "how='any' (varsayılan) herhangi bir NaN, how='all' tamamı NaN olan satırı siler; axis=1 sütun siler; thresh en az o kadar geçerli değeri olanı tutar.",
                   "pd-doldur", f"pddr:{b}:{c}:{cagri}")


@sablon("pd")
def pd_fillna():
    s = [float(random.randint(1, 9)), None, float(random.randint(1, 9)), None, float(random.randint(1, 9))]
    cagri = random.choice(["fillna(0)", "ffill()", "bfill()", "fillna(s.max())"])
    on = f"s = pd.Series({s})\n"
    yanlis = [kod_alt(on + f"print(s.{x}.tolist())") for x in ["fillna(0)", "ffill()", "bfill()", "fillna(s.max())", "dropna()"] if x != cagri]
    return secmeli(on + f"print(s.{cagri}.tolist())", yanlis,
                   "fillna sabit değerle, ffill son bilinen değerle, bfill sonraki değerle doldurur.", "pd-doldur", f"pdfn:{s}:{cagri}")


@sablon("pd")
def pd_merge_how():
    sol = sorted(random.sample(["s1", "s2", "s3", "s4", "s5"], 3))
    sag = sorted(random.sample(["s1", "s2", "s3", "s4", "s5"], 3))
    how = random.choice(["inner", "outer", "left", "right"])
    on = f"df1 = pd.DataFrame({{'id': {sol}, 'ad': {random.sample(ISIMLER, 3)}}})\ndf2 = pd.DataFrame({{'id': {sag}, 'ders': ['Math', 'Econ', 'Physics']}})\n"
    kod = on + f"print(len(pd.merge(df1, df2, on='id', how='{how}')))"
    yanlis = [kod_alt(on + f"print(len(pd.merge(df1, df2, on='id', how='{h}')))") for h in ["inner", "outer", "left", "right"] if h != how]
    yanlis += ["0", "6", "5"]
    return secmeli(kod, yanlis, "inner kesişim, outer birleşim, left soldaki tüm anahtarlar, right sağdaki tüm anahtarlar.",
                   "pd-birlestir", f"pdmg:{sol}:{sag}:{how}")


@sablon("pd")
def pd_concat():
    n1, n2 = random.randint(1, 3), random.randint(1, 3)
    ignore = random.choice([True, False])
    on = f"a = pd.DataFrame({{'x': {list(range(n1))}}})\nb = pd.DataFrame({{'x': {list(range(n2))}}})\n"
    kod = on + f"print(pd.concat([a, b]{', ignore_index=True' if ignore else ''}).index.tolist())"
    yanlis = [kod_alt(on + f"print(pd.concat([a, b]{'' if ignore else ', ignore_index=True'}).index.tolist())"),
              str(list(range(1, n1 + n2 + 1))), str(list(range(max(n1, n2))))]
    return secmeli(kod, yanlis, "concat varsayılan olarak orijinal index'leri korur; ignore_index=True yeni RangeIndex oluşturur.",
                   "pd-birlestir", f"pdcc:{n1}:{n2}:{ignore}")


@sablon("pd")
def pd_groupby():
    gruplar = [random.choice("ab") for _ in range(5)]
    if len(set(gruplar)) == 1:
        gruplar[0] = "b" if gruplar[0] == "a" else "a"
    degerler = [random.randint(1, 9) for _ in range(5)]
    fn = random.choice(["sum", "max", "min", "count"])
    on = f"df = pd.DataFrame({{'g': {gruplar}, 'v': {degerler}}})\n"
    kod = on + f"print(df.groupby('g')['v'].{fn}().to_dict())"
    yanlis = [kod_alt(on + f"print(df.groupby('g')['v'].{x}().to_dict())") for x in ["sum", "max", "min", "count"] if x != fn]
    return secmeli(kod, yanlis, "groupby veriyi gruplara böler, her gruba fonksiyonu uygular, sonucu grup anahtarlarıyla birleştirir.",
                   "pd-groupby", f"pdgb:{gruplar}:{degerler}:{fn}")


@sablon("pd")
def pd_transform():
    gruplar = random.sample(["a", "a", "b", "b", "c"], 5)
    degerler = [random.randint(1, 9) for _ in range(5)]
    fn = random.choice(["sum", "max", "min"])
    on = f"df = pd.DataFrame({{'g': {gruplar}, 'v': {degerler}}})\n"
    kod = on + f"print(df.groupby('g')['v'].transform('{fn}').tolist())"
    yanlis = [kod_alt(on + f"print(df.groupby('g')['v'].{fn}().tolist())"), kod_alt(on + "print(df['v'].tolist())"),
              kod_alt(on + f"print([df['v'].{fn}()] * 5)")]
    return secmeli(kod, yanlis, "transform grup sonucunu orijinal satırlara yayar; sonuç orijinalle aynı uzunluktadır.",
                   "pd-groupby", f"pdtf:{gruplar}:{degerler}:{fn}")


@sablon("pd")
def pd_pivot():
    satir = random.choice(["['m', 'f', 'm', 'f']", "['m', 'm', 'f', 'f']", "['f', 'm', 'm', 'm']"])
    degerler = [random.randint(1, 9) * 10 for _ in range(4)]
    aggfunc = random.choice([None, "sum", "max", "count"])
    on = f"df = pd.DataFrame({{'s': {satir}, 'c': [1, 1, 1, 1], 'v': {degerler}}})\n"
    ek = f", aggfunc='{aggfunc}'" if aggfunc else ""
    kod = on + f"print(df.pivot_table(values='v', index='s', columns='c'{ek}).loc['m', 1])"
    yanlis = [kod_alt(on + f"print(df.pivot_table(values='v', index='s', columns='c', aggfunc='{a}').loc['m', 1])")
              for a in ["mean", "sum", "max", "count"] if a != (aggfunc or "mean")]
    return secmeli(kod, yanlis, "pivot_table: index satırlar, columns sütunlar, values hücreler; aggfunc varsayılan olarak ortalamadır.",
                   "pd-reshape", f"pdpv:{satir}:{degerler}:{aggfunc}")


@sablon("pd")
def pd_melt():
    n, k = random.randint(2, 4), random.randint(2, 4)
    yillar = {str(2020 + i): list(range(i, i + n)) for i in range(k)}
    kod = f"genis = pd.DataFrame({{'id': {list(range(n))}, **{yillar}}})\nprint(pd.melt(genis, id_vars=['id']).shape)"
    return secmeli(kod, [str((n, k + 1)), str((n * k, k)), str((n + k, 3)), str((n * (k + 1), 3))],
                   "melt: her (id, eski sütun) çifti bir satır olur; sütunlar id, variable, value.", "pd-reshape", f"pdml:{n}:{k}")


@sablon("pd")
def pd_zaman():
    ay, gun = random.randint(1, 11), random.randint(1, 28)
    fark = random.randint(2, 60)
    bas = pd.Timestamp(2024, ay, gun)
    son = bas + pd.Timedelta(days=fark)
    ifade = random.choice(["(t2 - t1).days", "t2.month", "t2.day", "len(pd.date_range(t1, t2, freq='D'))"])
    return yaz(f"t1 = pd.Timestamp('{bas.date()}')\nt2 = pd.Timestamp('{son.date()}')\nprint({ifade})",
               "Timestamp farkı bir Timedelta'dır; date_range iki ucu da dahil eder.", "pd-zaman", f"pdzm:{bas.date()}:{fark}:{ifade}")


@sablon("pd")
def pd_resample():
    n = random.randint(5, 12)
    bas = random.choice(["2024-01-29", "2024-02-26", "2024-03-28", "2024-04-27"])
    fn = random.choice(["sum", "count", "max"])
    kod = (f"ts = pd.Series(range(1, {n + 1}), index=pd.date_range('{bas}', periods={n}, freq='D'))\n"
           f"print(ts.resample('MS').{fn}().tolist())")
    yanlis = [kod_alt(kod.replace(f".{fn}()", f".{x}()")) for x in ["sum", "count", "max", "min"] if x != fn]
    return secmeli(kod, yanlis, "resample('MS') günlük veriyi aylara böler (ay başı etiketli) ve her aya toplama fonksiyonu uygular.",
                   "pd-zaman", f"pdrs:{n}:{bas}:{fn}")


# ============================ Kavram soruları ============================
# (ders id, doğru ifade, yanlış ifade)

KAVRAMLAR = [
    ("temel-giris", "Etkileşimli modda yazılan komutlar program olarak kaydedilmez.", "Etkileşimli modda yazılan komutlar otomatik olarak .py dosyasına kaydedilir."),
    ("temel-giris", "IDLE, Python kurulunca otomatik kurulan ve metin editörü içeren bir geliştirme ortamıdır.", "IDLE, Python'dan ayrı satın alınması gereken bir programdır."),
    ("temel-degisken", "Değişken adı rakamla başlayamaz.", "Değişken adı boşluk içerebilir."),
    ("temel-degisken", "Artık referans edilmeyen değerlerin bellekten silinmesine çöp toplama denir.", "Çöp toplama, programcının değişkenleri elle silmesidir."),
    ("temel-hesap", "input fonksiyonu her zaman string döndürür.", "input fonksiyonu girilen sayıyı otomatik olarak int'e çevirir."),
    ("temel-hesap", "int ve float içeren karışık ifadenin sonucu float'tır.", "int ve float içeren karışık ifadenin sonucu her zaman int'tir."),
    ("temel-fstring", "f-string içindeki yer tutucuya bir ifade yazılırsa hesaplanır.", "f-string yer tutucularına yalnızca değişken adı yazılabilir."),
    ("temel-if", "İsimli sabitler kodu kendini açıklar hale getirir ve bakımı kolaylaştırır.", "Sihirli sayılar kodu isimli sabitlerden daha anlaşılır yapar."),
    ("temel-mantik", "or operatöründe sol taraf True ise sağ taraf değerlendirilmez.", "and operatörü her zaman iki tarafı da değerlendirir."),
    ("kontrol-elif", "if-elif-else yapısında yalnızca ilk doğru koşulun bloğu çalışır.", "if-elif-else yapısında doğru olan tüm koşulların blokları çalışır."),
    ("kontrol-while", "while döngüsü koşulu iterasyondan önce test eder.", "while döngüsü gövdesini en az bir kez mutlaka çalıştırır."),
    ("kontrol-for", "range(start, stop) ifadesinde stop değeri üretilen sayılara dahil değildir.", "range(5) 1'den 5'e kadar sayı üretir."),
    ("kontrol-toplam", "Sentinel, bir öğe dizisinin sonunu işaretleyen özel bir değerdir.", "Sentinel, döngünün ilk iterasyonudur."),
    ("kontrol-break", "İç içe döngülerde toplam iterasyon, iç ve dış döngü iterasyonlarının çarpımıdır.", "İç içe döngülerde iç döngü yalnızca bir kez çalışır."),
    ("fonk-giris", "Değer döndüren fonksiyon, bitince çağıran ifadeye bir değer gönderir.", "Void fonksiyonlar her zaman bir değer döndürür."),
    ("fonk-arguman", "Bir fonksiyonun yerel değişkenine başka bir fonksiyondan erişilemez.", "Yerel değişkenlere programın her yerinden erişilebilir."),
    ("fonk-global", "Fonksiyon içinde global değişkene atama yapmak için global bildirimi gerekir.", "Global değişkenler hata ayıklamayı kolaylaştırdığı için önerilir."),
    ("fonk-donus", "Bir dosya ana program olarak çalıştırılınca __name__ değişkeni '__main__' olur.", "Bir modül import edilince __name__ değişkeni '__main__' olur."),
    ("dosya-io", "'w' moduyla açılan var olan dosyanın içeriği silinir.", "'a' moduyla açılan dosyanın eski içeriği silinir."),
    ("dosya-io", "Dosyaya sayı yazmadan önce str() ile string'e çevirmek gerekir.", "Dosyadan okunan sayılar doğrudan int olarak gelir."),
    ("dosya-istisna", "finally bloğu istisna olsa da olmasa da çalışır.", "else bloğu yalnızca istisna oluştuğunda çalışır."),
    ("liste-giris", "Listeler değiştirilebilir (mutable), tuple'lar değiştirilemez (immutable).", "Tuple'lara append ile eleman eklenebilir."),
    ("liste-metot", "list2 = list1 yazmak listenin kopyasını oluşturmaz; ikisi aynı listeyi gösterir.", "list2 = list1 yazmak listenin bağımsız bir kopyasını oluşturur."),
    ("liste-grafik", "matplotlib standart kütüphaneye dahil değildir ve ayrıca kurulmalıdır.", "matplotlib Python ile birlikte otomatik kurulur."),
    ("str-temel", "String'ler değiştirilemez; s[0] = 'X' hata verir.", "String'in bir karakteri indeksle değiştirilebilir."),
    ("str-metot", "find metodu alt string bulunamazsa -1 döndürür.", "find metodu alt string bulunamazsa hata fırlatır."),
    ("sozluk-giris", "Sözlük anahtarları değiştirilemez (immutable) nesneler olmalıdır.", "Listeler sözlük anahtarı olarak kullanılabilir."),
    ("sozluk-metot", "get metodu anahtar yoksa KeyError fırlatmaz, varsayılan değeri döndürür.", "popitem sözlükten rastgele bir çift siler."),
    ("sozluk-kume", "Kümedeki tüm öğeler benzersizdir.", "remove ve discard, öğe yoksa ikisi de hata fırlatır."),
    ("sozluk-pickle", "Nesneyi bayt akışına dönüştürüp dosyada saklamaya pickling denir.", "pickle.dump dosyadan nesne okur."),
    ("sinif-oop", "Veri ve kodu tek bir nesnede birleştirmeye kapsülleme denir.", "Prosedürel programlama nesneler oluşturmaya odaklanır."),
    ("sinif-tanim", "__init__ metodu bir örnek oluşturulduğunda otomatik çalışır.", "self parametresi yalnızca __init__ metodunda kullanılır."),
    ("sinif-ornek", "Accessor metot özniteliğin değerini değiştirmeden döndürür.", "Mutator metot özniteliği yalnızca okur, değiştirmez."),
    ("kalitim-giris", "Alt sınıf, üst sınıfın öznitelik ve metotlarını miras alır.", "UML'de kalıtım oku üst sınıftan alt sınıfa çizilir."),
    ("kalitim-poly", "Alt sınıfın örneği için isinstance(nesne, UstSinif) True döner.", "Bir metodu override etmek için alt sınıfta farklı adlı bir metot yazılır."),
    ("ozyineleme-giris", "Özyinelemeyle çözülebilen her problem döngüyle de çözülebilir.", "Özyinelemeli algoritmalar genellikle döngülü olanlardan daha verimlidir."),
    ("ozyineleme-alg", "Fibonacci fonksiyonunun iki temel durumu vardır.", "Hanoi kulelerinde aynı anda iki disk taşınabilir."),
    ("vt-giris", "SQL genel amaçlı bir programlama dili değildir.", "Birincil anahtar sütunu NULL değer içerebilir."),
    ("vt-tablo", "SQLite'ta INTEGER PRIMARY KEY sütunu otomatik artan kimlik sütunu olur.", "sqlite3.connect veritabanı yoksa hata fırlatır."),
    ("vt-select", "fetchone() satır kalmayınca None döndürür.", "ORDER BY varsayılan olarak azalan sıralar."),
    ("vt-update", "WHERE olmadan yazılan DELETE FROM tablodaki tüm satırları siler.", "Bir tablonun birden çok birincil anahtarı olabilir."),
    ("vt-iliski", "Yabancı anahtar başka bir tablonun birincil anahtarını referans eder.", "SQLite yabancı anahtar bütünlüğünü varsayılan olarak zorlar."),
    ("ortam-anaconda", "conda, Anaconda'nın komut satırı paket yöneticisidir.", "Anaconda Navigator ayrıca kurulması gereken bir programdır."),
    ("ortam-anaconda", "Ortamlar (environments) projeler arasındaki paket çakışmalarını önler.", "Bir Anaconda ortamında yalnızca tek bir paket kurulabilir."),
    ("ortam-jupyter", "Jupyter'da bir hücre Shift + Enter ile çalıştırılır.", "Jupyter notebook dosyalarının uzantısı .py'dir."),
    ("ortam-jupyter", "Jupyter kernel'lar aracılığıyla birçok dili destekler.", "Markdown hücreleri Python kodu çalıştırır."),
    ("ortam-colab", "Google Colab ücretsiz GPU/TPU erişimi sunar.", "Google Colab internet bağlantısı olmadan çalışır."),
    ("ortam-colab", "Colab'da komut satırı komutları başına ! konarak çalıştırılır.", "Colab oturumu kapandığında kurulan paketler korunur."),
    ("np2-maske", "NumPy dizilerinde and/or/not yerine &, |, ~ kullanılır.", "Boolean indeksleme orijinal diziyle aynı şekilde bir dizi döndürür."),
    ("np2-reshape", "flatten her zaman kopya döndürür; ravel mümkünse view döndürür.", "ravel her zaman kopya döndürür."),
    ("np2-birlestir", "vstack, axis=0 boyunca concatenate ile eşdeğerdir.", "np.split eşit bölünemeyen dizileri otomatik dengeler."),
    ("np2-ufunc", "Broadcasting esnetme sırasında bellekte gerçekten kopya oluşturmaz.", "Broadcasting'de şekiller en soldaki boyuttan karşılaştırılmaya başlanır."),
    ("np2-toplama", "axis=0 ile toplama her sütun için bir sonuç üretir.", "Toplama fonksiyonları axis verilmezse her satır için ayrı sonuç döndürür."),
    ("pd-giris", "Pandas'ın iki temel veri yapısı Series ve DataFrame'dir.", "Pandas'ın tek veri yapısı ndarray'dir."),
    ("pd-series", "Series'i basit bir diziden ayıran, ona bağlı etiket dizisi (index) dir.", "Series etiket içermeyen tek boyutlu bir listedir."),
    ("pd-dataframe", "DataFrame kavramsal olarak aynı index'i paylaşan Series'lerden oluşan bir sözlüktür.", "DataFrame her sütunu farklı index'e sahip bağımsız listelerden oluşur."),
    ("pd-inceleme", "df.shape ve df.dtypes öznitelik, df.info() metottur.", "df.shape parantezle çağrılması gereken bir metottur."),
    ("pd-io", "CSV yazarken index=False kullanılmazsa okuma sırasında 'Unnamed: 0' sütunu oluşur.", "to_csv varsayılan olarak index'i yazmaz."),
    ("pd-secim", "loc dilimlerinde bitiş etiketi dahildir.", "loc dilimlerinde bitiş etiketi hariçtir."),
    ("pd-filtre", "if df['Age'] > 30: ifadesi 'truth value of a Series is ambiguous' hatası verir.", "if df['Age'] > 30: ifadesi tüm satırları tek tek kontrol eder."),
    ("pd-eksik", "Bir int sütununa tek bir NaN eklenirse sütun float64'e yükseltilir.", "np.nan int sütunlarında tip değişmeden saklanabilir."),
    ("pd-doldur", "dropna(thresh=n) en az n eksik olmayan değeri olan satırları tutar.", "dropna(thresh=n) en az n eksik değeri olan satırları tutar."),
    ("pd-birlestir", "merge'in varsayılan join türü inner'dır.", "merge'in varsayılan join türü outer'dır."),
    ("pd-groupby", "df.groupby() çağrısı tek başına hesaplama yapmaz; tembel bir nesne döndürür.", "df.groupby() çağrısı tüm grupların ortalamasını hemen hesaplar."),
    ("pd-reshape", "pivot_table'da aggfunc verilmezse ortalama kullanılır.", "pivot_table'da aggfunc verilmezse toplam kullanılır."),
    ("pd-zaman", "pd.to_datetime string'leri Timestamp nesnelerine çevirir.", "pd.to_datetime tarihleri string'e çevirir."),
]
