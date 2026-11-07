"""Final sınavı üreticisi (15 slayt destesinin tamamı).

Her soru bir şablondan rastgele parametrelerle üretilir ve doğru cevap gerçek
NumPy ile hesaplanır. Her sorunun bir "parmak izi" vardır; daha önce görülen
parmak izleri tekrar üretilmez, böylece sınavlar hiçbir zaman aynı olmaz.
"""

import random

import numpy as np

import sinav_python

SORU_SAYISI = 25
KAVRAM_SORUSU_SAYISI = 7
DEGISKEN_ADLARI = ["a", "x", "veri", "dizi", "arr", "d", "sayilar", "v1"]
MATRIS_ADLARI = ["m", "M", "tablo", "mat", "A", "grid"]


def yazdir(deger):
    """print() ile ekranda görünecek metin."""
    return str(deger)


def secmeli(soru, dogru, yanlislar, aciklama, konu, parmak, kod=None):
    secenekler = [dogru]
    for y in yanlislar:
        if y not in secenekler:
            secenekler.append(y)
        if len(secenekler) == 4:
            break
    if len(secenekler) < 3:
        return None
    random.shuffle(secenekler)
    return {"tip": "secmeli", "soru": soru, "kod": kod, "secenekler": secenekler,
            "dogru": secenekler.index(dogru), "aciklama": aciklama, "konu": konu, "parmak": parmak}


def yaz(soru, cevap, aciklama, konu, parmak, kod=None):
    return {"tip": "yaz", "soru": soru, "kod": kod, "cevaplar": [cevap],
            "aciklama": aciklama, "konu": konu, "parmak": parmak}


def dogruyanlis(ifade, dogru, aciklama, konu, parmak, kod=None):
    return {"tip": "dogruyanlis", "ifade": ifade, "kod": kod, "dogru": dogru,
            "aciklama": aciklama, "konu": konu, "parmak": parmak}


def rastgele_matris(r, c, en_kucuk=1, en_buyuk=9):
    return np.array([[random.randint(en_kucuk, en_buyuk) for _ in range(c)] for _ in range(r)])


def liste_yazisi(m):
    return repr(m.tolist())


# ---------------------------------------------------------------- şablonlar

def arange_cikti():
    s = random.choice([1, 2, 3])
    a = random.randint(0, 6)
    b = a + s * random.randint(3, 5) + random.randint(0, s - 1)
    ad = random.choice(DEGISKEN_ADLARI)
    cagri = f"np.arange({a}, {b})" if s == 1 else f"np.arange({a}, {b}, {s})"
    kod = f"{ad} = {cagri}\nprint({ad})"
    dogru = yazdir(np.arange(a, b, s))
    yanlislar = [yazdir(np.arange(a, b + 1, s)) if (b - a) % s == 0 else yazdir(np.arange(a, b + s, s)),
                 yazdir(np.arange(a + s, b + 1, s)), yazdir(np.arange(a, b - s, s)),
                 yazdir(np.arange(a, b, s + 1)), yazdir(np.arange(a + 1, b, s))]
    return secmeli("Bu kod ne yazdırır?", dogru, yanlislar,
                   f"arange {a}'dan başlar, {s}'er artar ve stop değeri ({b}) dahil edilmez.",
                   "o-dizi", f"arange:{a}:{b}:{s}", kod)


def arange_uzunluk():
    s = random.choice([1, 2, 5])
    a = random.randint(0, 20)
    b = a + random.randint(4, 30)
    ad = random.choice(DEGISKEN_ADLARI)
    cagri = f"np.arange({a}, {b})" if s == 1 else f"np.arange({a}, {b}, {s})"
    return yaz(f"{ad} dizisinde kaç eleman var? (size)", str(np.arange(a, b, s).size),
               f"{a}'dan başlayıp {s}'er artarak {b}'ye gelmeden durur (stop dahil değil).",
               "o-dizi", f"arange-len:{a}:{b}:{s}", f"{ad} = {cagri}")


def linspace_cikti():
    bas, son = random.choice([(0, 1), (0, 2), (0, 3), (0, 4), (0, 5), (0, 6), (0, 8), (0, 10), (0, 20),
                              (1, 2), (1, 3), (1, 5), (2, 4), (2, 6), (-1, 1)])
    n = random.randint(3, 6)
    ad = random.choice(DEGISKEN_ADLARI)
    kod = f"{ad} = np.linspace({bas}, {son}, {n})\nprint({ad})"
    dogru = yazdir(np.linspace(bas, son, n))
    yanlislar = [yazdir(np.linspace(bas, son, n, endpoint=False)), yazdir(np.linspace(bas, son, n + 1)),
                 yazdir(np.linspace(bas, son, n - 1)), yazdir(np.arange(bas, son))]
    return secmeli("Bu kod ne yazdırır?", dogru, yanlislar,
                   f"linspace: [{bas}, {son}] aralığında, iki ucu da dahil {n} eşit aralıklı değer.",
                   "o-dizi", f"linspace:{bas}:{son}:{n}", kod)


def size_shape():
    sekil = tuple(random.randint(2, 6) for _ in range(random.choice([2, 2, 3])))
    ad = random.choice(DEGISKEN_ADLARI)
    return yaz(f"{ad}.shape == {sekil} ise {ad}.size kaçtır?", str(int(np.prod(sekil))),
               "size, shape elemanlarının çarpımına eşittir: " + " × ".join(map(str, sekil)) + ".",
               "d-boyut", f"size:{sekil}")


def ndim_shape():
    sekil = tuple(random.randint(2, 5) for _ in range(random.randint(1, 4)))
    ad = random.choice(DEGISKEN_ADLARI)
    dogru = str(len(sekil))
    yanlislar = [str(int(np.prod(sekil))), str(max(sekil)), str(len(sekil) + 1), str(sum(sekil))]
    return secmeli(f"{ad}.shape == {sekil} ise {ad}.ndim kaçtır?", dogru, yanlislar,
                   "shape tuple'ının uzunluğu ndim'e (eksen sayısına) eşittir.", "d-boyut", f"ndim:{sekil}")


def shape_literal():
    r, c = random.randint(2, 4), random.randint(2, 4)
    m = rastgele_matris(r, c)
    ad = random.choice(MATRIS_ADLARI)
    kod = f"{ad} = np.array({liste_yazisi(m)})\nprint({ad}.shape)"
    yanlislar = [str((c, r)), str((r * c,)), str(r * c), str((r, c + 1)), str((r + 1, c))]
    return secmeli("Bu kod ne yazdırır?", str((r, c)), yanlislar,
                   f"{r} iç liste (satır), her birinde {c} eleman (sütun) var → ({r}, {c}).",
                   "d-boyut", f"shape-lit:{m.tolist()}", kod)


def itemsize():
    tip, bayt = random.choice([("int32", 4), ("int64", 8), ("float32", 4), ("float64", 8)])
    degerler = [random.randint(1, 9) for _ in range(random.randint(2, 4))]
    ad = random.choice(DEGISKEN_ADLARI)
    kod = f"{ad} = np.array({degerler}, dtype=np.{tip})\nprint({ad}.itemsize)"
    bit = int(tip[-2:])
    return yaz("Bu kod ne yazdırır?", str(bayt), f"{tip} → {bit} bit = {bit // 8} bayt.",
               "d-dtype", f"itemsize:{tip}:{degerler}", kod)


def varsayilan_dtype():
    fonk = random.choice(["zeros", "ones"])
    sekil = (random.randint(1, 4), random.randint(2, 5))
    ad = random.choice(DEGISKEN_ADLARI)
    kod = f"{ad} = np.{fonk}({sekil})\nprint({ad}.dtype)"
    return secmeli("Bu kod ne yazdırır?", "float64", ["int64", "int32", "float32", "bool"],
                   f"np.{fonk} fonksiyonunun varsayılan dtype'ı float64'tür.",
                   "o-yertutucu", f"dtype-def:{fonk}:{sekil}", kod)


def cikarilan_dtype():
    degerler = [random.randint(1, 9) for _ in range(random.randint(3, 5))]
    ondalikli = random.random() < 0.5
    if ondalikli:
        i = random.randrange(len(degerler))
        degerler[i] = degerler[i] + 0.5
    ad = random.choice(DEGISKEN_ADLARI)
    kod = f"{ad} = np.array({degerler})\nprint({ad}.dtype)"
    dogru = str(np.array(degerler).dtype)
    aciklama = ("Bir eleman ondalıklı; dizi homojen olmak zorunda olduğu için hepsi float64 olur."
                if ondalikli else "Tüm elemanlar tam sayı; NumPy tipi int64 olarak çıkarır.")
    return secmeli("Bu kod ne yazdırır?", dogru, ["int64", "float64", "int32", "float32"], aciklama,
                   "o-array", f"dtype-inf:{degerler}", kod)


def indeks_1d():
    degerler = random.sample(range(1, 60), random.randint(5, 8))
    ad = random.choice(DEGISKEN_ADLARI)
    if random.random() < 0.5:
        i = random.randrange(len(degerler))
        ifade = f"{ad}[{i}]"
        aciklama = f"İndeks 0'dan başlar; {i}. indeksteki eleman {degerler[i]}."
        cevap = degerler[i]
    else:
        k = random.randint(1, 3)
        ifade = f"{ad}[-{k}]"
        aciklama = f"-{k}, sondan {k}. eleman demektir: {degerler[-k]}."
        cevap = degerler[-k]
    kod = f"{ad} = np.array({degerler})\nprint({ifade})"
    return yaz("Bu kod ne yazdırır?", str(cevap), aciklama, "i-1d", f"idx1:{degerler}:{ifade}", kod)


def dilim_1d():
    n = random.randint(6, 9)
    bas_deger = random.randint(0, 20)
    x = np.arange(bas_deger, bas_deger + n)
    i = random.randint(0, n - 4)
    j = random.randint(i + 2, n - 1)
    ad = random.choice(DEGISKEN_ADLARI)
    bicim = random.choice(["ij", "j", "i"])
    if bicim == "ij":
        ifade, dogru_d = f"{ad}[{i}:{j}]", x[i:j]
        yanlislar = [x[i:j + 1], x[i + 1:j + 1], x[i + 1:j], x[max(i - 1, 0):j - 1]]
        aciklama = f"{i}. indeksten başlar, {j}. indeks dahil değildir."
    elif bicim == "j":
        ifade, dogru_d = f"{ad}[:{j}]", x[:j]
        yanlislar = [x[:j + 1], x[1:j + 1], x[j:], x[:j - 1]]
        aciklama = f"Baştan başlar, {j}. indeks dahil değildir."
    else:
        ifade, dogru_d = f"{ad}[{i}:]", x[i:]
        yanlislar = [x[i + 1:], x[:i], x[:i + 1], x[max(i - 1, 0):]]
        aciklama = f"{i}. indeksten sona kadar."
    kod = f"{ad} = np.arange({bas_deger}, {bas_deger + n})\nprint({ifade})"
    return secmeli("Bu kod ne yazdırır?", yazdir(dogru_d), [yazdir(y) for y in yanlislar], aciklama,
                   "i-1d", f"slice1:{bas_deger}:{n}:{ifade}", kod)


def indeks_2d():
    r, c = random.randint(3, 4), random.randint(3, 4)
    m = rastgele_matris(r, c, 1, 30)
    i, j = random.randrange(r), random.randrange(c)
    ad = random.choice(MATRIS_ADLARI)
    kod = f"{ad} = np.array({liste_yazisi(m)})\nprint({ad}[{i}, {j}])"
    return yaz("Bu kod ne yazdırır?", str(m[i, j]),
               f"Önce satır ({i}), sonra sütun ({j}). İndeksler 0'dan başlar.",
               "i-2d", f"idx2:{m.tolist()}:{i}:{j}", kod)


def satir_sutun_2d():
    r, c = random.randint(3, 4), random.randint(3, 4)
    m = rastgele_matris(r, c, 1, 9)
    ad = random.choice(MATRIS_ADLARI)
    if random.random() < 0.5:
        i = random.randrange(r)
        ifade, dogru = f"{ad}[{i}, :]", m[i, :]
        yanlislar = [m[:, i] if i < c else m[:, 0], m[(i + 1) % r, :], m[i, 1:], m[:, -1]]
        aciklama = f"{ad}[{i}, :] → {i}. satırın tamamı."
    else:
        j = random.randrange(c)
        ifade, dogru = f"{ad}[:, {j}]", m[:, j]
        yanlislar = [m[j, :] if j < r else m[0, :], m[:, (j + 1) % c], m[1:, j], m[-1, :]]
        aciklama = f"{ad}[:, {j}] → tüm satırların {j}. sütunu."
    kod = f"{ad} = np.array({liste_yazisi(m)})\nprint({ifade})"
    return secmeli("Bu kod ne yazdırır?", yazdir(dogru), [yazdir(y) for y in yanlislar], aciklama,
                   "i-2d", f"rowcol:{m.tolist()}:{ifade}", kod)


def alt_matris():
    r = c = random.randint(3, 4)
    m = np.arange(1, r * c + 1).reshape(r, c)
    a = random.randint(0, r - 2)
    b = random.randint(a + 1, r)
    s1 = random.randint(0, c - 2)
    s2 = random.randint(s1 + 1, c)
    ad = random.choice(MATRIS_ADLARI)
    ifade = f"{ad}[{a}:{b}, {s1}:{s2}]"
    kod = f"{ad} = np.arange(1, {r * c + 1}).reshape({r}, {c})\nprint({ifade})"
    yanlislar = [m[s1:s2, a:b], m[a:b + 1, s1:s2], m[a:b, s1:s2 + 1], m[a + 1:b + 1, s1:s2], m[a:b, s1 + 1:s2 + 1]]
    return secmeli("Bu kod ne yazdırır?", yazdir(m[a:b, s1:s2]),
                   [yazdir(y) for y in yanlislar if y.size],
                   f"Satırlar {a}'dan {b}'ye (dahil değil), sütunlar {s1}'den {s2}'ye (dahil değil).",
                   "i-2d", f"sub:{r}:{ifade}", kod)


def reshape_gecerli():
    r, c = random.randint(2, 6), random.randint(2, 6)
    gecerli = random.random() < 0.5
    n = r * c if gecerli else r * c + random.choice([-2, -1, 1, 2, 3])
    ad = random.choice(DEGISKEN_ADLARI)
    kod = f"{ad} = np.arange({n}).reshape({r}, {c})"
    aciklama = (f"{n} eleman, {r} × {c} = {r * c} şekline tam sığar." if gecerli
                else f"{n} eleman, {r} × {c} = {r * c}'lik şekle sığmaz; eleman sayısı aynı olmalı.")
    return dogruyanlis("Bu kod hata vermeden çalışır.", gecerli, aciklama, "i-reshape", f"reshape-ok:{n}:{r}:{c}", kod)


def reshape_eleman():
    r, c = random.randint(2, 5), random.randint(3, 6)
    i, j = random.randrange(r), random.randrange(c)
    ad = random.choice(MATRIS_ADLARI)
    kod = f"{ad} = np.arange({r * c}).reshape({r}, {c})\nprint({ad}[{i}, {j}])"
    return yaz("Bu kod ne yazdırır?", str(i * c + j),
               f"Sayılar satır satır dizilir: her satırda {c} sayı var → {i} × {c} + {j} = {i * c + j}.",
               "i-reshape", f"reshape-el:{r}:{c}:{i}:{j}", kod)


def indeks_3d():
    a, b, c = random.randint(2, 3), random.randint(2, 4), random.randint(2, 4)
    i, j, k = random.randrange(a), random.randrange(b), random.randrange(c)
    kod = f"t = np.arange({a * b * c}).reshape({a}, {b}, {c})\nprint(t[{i}, {j}, {k}])"
    return yaz("Bu kod ne yazdırır?", str(i * b * c + j * c + k),
               f"Her blokta {b * c} sayı var: {i} × {b * c} + {j} × {c} + {k} = {i * b * c + j * c + k}.",
               "i-reshape", f"idx3:{a}:{b}:{c}:{i}:{j}:{k}", kod)


def dilim_3d_shape():
    a, b, c = random.randint(2, 4), random.randint(2, 5), random.randint(3, 5)
    i, k = random.randrange(a), random.randint(1, c - 1)
    kod = f"t = np.arange({a * b * c}).reshape({a}, {b}, {c})\nprint(t[{i}, :, :{k}].shape)"
    dogru = str((b, k))
    yanlislar = [str((k, b)), str((a, b, k)), str((b, c)), str((a, k)), str((b, k + 1))]
    return secmeli("Bu kod ne yazdırır?", dogru, yanlislar,
                   f"Blok sabit ({i}) → o eksen kalkar; tüm satırlar ({b}) ve ilk {k} sütun → ({b}, {k}).",
                   "i-reshape", f"slice3:{a}:{b}:{c}:{i}:{k}", kod)


def _degistir_sorusu(kopya):
    n = random.randint(5, 7)
    x = np.arange(n)
    i = random.randint(0, n - 3)
    j = random.randint(i + 2, n)
    k = random.randrange(j - i)
    yeni = random.randint(7, 9)
    ad, ad2 = random.choice(["a", "x", "veri", "dizi"]), random.choice(["v", "b", "parca", "p"])
    dilim = f"{ad}[{i}:{j}]" + (".copy()" if kopya else "")
    kod = f"{ad} = np.arange({n})\n{ad2} = {dilim}\n{ad2}[{k}] = {yeni}\nprint({ad})"
    degismis = x.copy()
    degismis[i + k] = yeni
    yanlis_yer = x.copy()
    yanlis_yer[k] = yeni
    yanlis_yer2 = x.copy()
    yanlis_yer2[min(i + k + 1, n - 1)] = yeni
    alt = x[i:j].copy()
    alt[k] = yeni
    if kopya:
        dogru = yazdir(x)
        yanlislar = [yazdir(degismis), yazdir(yanlis_yer), yazdir(alt), yazdir(yanlis_yer2)]
        aciklama = f".copy() bağımsız bir kopya oluşturur; {ad2} değişse de {ad} değişmez."
        konu = "v-copy"
    else:
        dogru = yazdir(degismis)
        yanlislar = [yazdir(x), yazdir(yanlis_yer), yazdir(alt), yazdir(yanlis_yer2)]
        aciklama = (f"{ad2} bir view: {ad2}[{k}], {ad}[{i + k}] ile aynı belleği gösterir, "
                    f"bu yüzden {ad} da değişir.")
        konu = "v-view"
    return secmeli("Bu kod ne yazdırır?", dogru, yanlislar, aciklama, konu,
                   f"{'copy' if kopya else 'view'}:{n}:{i}:{j}:{k}:{yeni}", kod)


def view_degistir():
    return _degistir_sorusu(kopya=False)


def copy_degistir():
    return _degistir_sorusu(kopya=True)


def liste_dilim():
    liste = random.sample(range(1, 10), random.randint(4, 6))
    i = random.randint(0, len(liste) - 3)
    j = random.randint(i + 2, len(liste))
    k = random.randrange(j - i)
    yeni = random.choice([0, 50, 99])
    kod = f"liste = {liste}\np = liste[{i}:{j}]\np[{k}] = {yeni}\nprint(liste)"
    degismis = list(liste)
    degismis[i + k] = yeni
    p = liste[i:j]
    p[k] = yeni
    yanlis2 = list(liste)
    yanlis2[k] = yeni
    return secmeli("Bu kod ne yazdırır?", repr(liste), [repr(degismis), repr(p), repr(yanlis2)],
                   "Python listesi dilimi bir kopyadır; p'yi değiştirmek orijinal listeyi etkilemez.",
                   "v-view", f"list:{liste}:{i}:{j}:{k}:{yeni}", kod)


def vektor_islem():
    n = random.randint(3, 4)
    a = [random.randint(1, 9) for _ in range(n)]
    b = [random.randint(1, 9) for _ in range(n)]
    A, B = np.array(a), np.array(b)
    if random.random() < 0.6:
        kod = f"a = np.array({a})\nb = np.array({b})\nprint(a + b)"
        dogru = yazdir(A + B)
        yanlislar = [yazdir(np.array(a + b)), str(int((A + B).sum())), yazdir(A * B), yazdir(A - B)]
        aciklama = "Vektörleştirme: elemanlar karşılıklı toplanır, döngü gerekmez."
    else:
        c = random.randint(2, 5)
        kod = f"a = np.array({a})\nprint(a * {c})"
        dogru = yazdir(A * c)
        yanlislar = [yazdir(np.array(a * c)), yazdir(A + c), str(int(A.sum() * c)), yazdir(A)]
        aciklama = f"Vektörleştirme: işlem tüm elemanlara uygulanır; her eleman {c} ile çarpılır."
    return secmeli("Bu kod ne yazdırır?", dogru, yanlislar, aciklama, "n-vektor", f"vec:{kod}", kod)


def eksen_sayisi():
    r, c = random.randint(2, 6), random.randint(2, 6)
    while c == r:
        c = random.randint(2, 6)
    ad = random.choice(MATRIS_ADLARI)
    eksen = random.choice([0, 1])
    cevap = r if eksen == 0 else c
    ne = "satır" if eksen == 0 else "sütun"
    return yaz(f"{ad}.shape == ({r}, {c}) ise axis {eksen} boyunca kaç eleman ({ne}) vardır?", str(cevap),
               f"2 boyutlu dizide axis 0 satırlar, axis 1 sütunlardır → {cevap}.",
               "d-eksen", f"axis:{r}:{c}:{eksen}")


def birim_matris():
    n = random.randint(2, 7)
    soru_tipi = random.choice(["toplam", "eleman", "shape"])
    if soru_tipi == "toplam":
        k = random.randint(1, 9)
        kod = f"I = np.eye({n}) * {k}\nprint(int(I.sum()))"
        return yaz("Bu kod ne yazdırır? (I.sum() tüm elemanları toplar)", str(n * k),
                   f"np.eye({n}) köşegende {n} tane 1 içerir; {k} ile çarpınca toplam {n} × {k} = {n * k}.",
                   "o-alistirma", f"eye-sum:{n}:{k}", kod)
    if soru_tipi == "eleman":
        i, j = random.randrange(n), random.randrange(n)
        if random.random() < 0.4:
            j = i
        kod = f"I = np.eye({n})\nprint(I[{i}, {j}])"
        return secmeli("Bu kod ne yazdırır?", yazdir(np.eye(n)[i, j]), ["1.0", "0.0", str(n), "1"],
                       "Birim matriste yalnızca ana köşegen (satır = sütun) 1'dir, diğer her yer 0'dır.",
                       "o-alistirma", f"eye-el:{n}:{i}:{j}", kod)
    kod = f"I = np.eye({n})\nprint(I.shape)"
    return secmeli("Bu kod ne yazdırır?", str((n, n)), [str((n,)), str((n, 1)), str((1, n)), str((n + 1, n + 1))],
                   f"np.eye({n}), {n}x{n}'lik birim matris oluşturur.", "o-alistirma", f"eye-shape:{n}", kod)


SABLONLAR = [arange_cikti, arange_uzunluk, linspace_cikti, size_shape, ndim_shape, shape_literal, itemsize,
             varsayilan_dtype, cikarilan_dtype, indeks_1d, dilim_1d, indeks_2d, satir_sutun_2d, alt_matris,
             reshape_gecerli, reshape_eleman, indeks_3d, dilim_3d_shape, view_degistir, copy_degistir,
             liste_dilim, vektor_islem, eksen_sayisi, birim_matris]

# Kavram soruları: her gerçek için doğru ve yanlış bir ifade var
KAVRAMLAR = [
    ("n-liste", "Python listesi, bellekte dağınık duran nesneleri gösteren pointer'lar saklar.",
     "Python listesi verinin kendisini tek, bitişik bir bellek bloğunda saklar."),
    ("n-liste", "Listede for döngüsü sırasında her eleman için pointer takip edilip tipi belirlenir.",
     "Listede for döngüsü sırasında tip kontrolü yalnızca ilk eleman için yapılır."),
    ("n-liste", "Python listesinin bellek mimarisi büyük ölçekli sayısal işlemler için optimize değildir.",
     "Python listesi büyük ölçekli sayısal işlemler için NumPy'dan daha verimlidir."),
    ("n-ndarray", "ndarray homojen bir veri kabıdır.", "ndarray farklı veri tiplerini bir arada tutabilir."),
    ("n-ndarray", "ndarray tek, bitişik bir bellek bloğunda saklanır.",
     "ndarray elemanları bellekte dağınık nesneler olarak saklanır."),
    ("n-ndarray", "Bitişik bellek, NumPy'ın hesaplamaları derlenmiş C veya Fortran koduna devretmesini sağlar.",
     "NumPy tüm hesaplamaları Python yorumlayıcısında satır satır yapar."),
    ("n-vektor", "SIMD, tek bir komutun birden çok veri elemanına aynı anda uygulanmasıdır.",
     "SIMD, her veri elemanı için ayrı bir komut çalıştırılmasıdır."),
    ("n-vektor", "Vektörleştirilmiş kod çoğu zaman matematiksel gösterime benzer.",
     "Vektörleştirilmiş kod genellikle döngülü koddan daha uzun ve okunaksızdır."),
    ("n-vektor", "Vektörleştirme NumPy'ın hızlı, derlenmiş altyapısını tetikler.",
     "Vektörleştirme yalnızca yazım kolaylığıdır, hıza etkisi yoktur."),
    ("n-performans", "Tek bir skaler değer üzerinde işlem yaparken NumPy saf Python'dan yavaş olabilir.",
     "NumPy, tek bir skaler değerde bile her zaman saf Python'dan hızlıdır."),
    ("n-performans", "Pandas ve Scikit-learn, NumPy'ı temel paket olarak kullanır.",
     "Pandas ve Scikit-learn, NumPy'dan bağımsız çalışır ve onu kullanmaz."),
    ("n-performans", "Büyük veri setlerinde açık döngüleri NumPy ile değiştirmek en iyi uygulamadır.",
     "Büyük veri setlerinde açık for döngüleri NumPy'dan daha hızlıdır."),
    ("d-eksen", "NumPy'da dizinin boyutlarına eksen (axis) denir.", "NumPy'da dizinin boyutlarına sütun denir."),
    ("d-eksen", "2 boyutlu dizide axis 0 satırları temsil eder.", "2 boyutlu dizide axis 0 sütunları temsil eder."),
    ("d-kisit", "ndarray'in boyutu oluşturulduğu anda sabitlenir.",
     "ndarray, Python listesi gibi append ile dinamik olarak büyür."),
    ("d-kisit", "Homojenlik, sabit boyut ve dikdörtgen şekil yüksek performans için bilinçli tasarım tercihleridir.",
     "ndarray'in kısıtlamaları performansa hiçbir katkısı olmayan tasarım hatalarıdır."),
    ("d-boyut", "size her zaman shape elemanlarının çarpımına eşittir.",
     "size her zaman shape elemanlarının toplamına eşittir."),
    ("d-boyut", "shape tuple'ının uzunluğu ndim'e eşittir.", "shape tuple'ının uzunluğu size'a eşittir."),
    ("d-dtype", "float64 tipindeki bir elemanın itemsize değeri 8 bayttır.",
     "float64 tipindeki bir elemanın itemsize değeri 64 bayttır."),
    ("d-dtype", "dtype, bellek ve hassasiyet üzerinde standart Python tiplerinden daha ince kontrol sağlar.",
     "dtype yalnızca metin verileri için kullanılır."),
    ("o-array", "np.array() veri tipini elemanlardan otomatik çıkarır.",
     "np.array() ile oluşturulan dizinin dtype'ı her zaman float64'tür."),
    ("o-array", "np.array() ile veri tipi dtype argümanıyla açıkça belirtilebilir.",
     "np.array() ile veri tipi hiçbir şekilde belirtilemez."),
    ("o-yertutucu", "np.zeros ve np.ones fonksiyonlarının varsayılan dtype'ı float64'tür.",
     "np.zeros ve np.ones fonksiyonlarının varsayılan dtype'ı int64'tür."),
    ("o-yertutucu", "np.empty elemanları başlatmadığı için zeros/ones'tan biraz daha hızlıdır.",
     "np.empty diziyi her zaman sıfırlarla doldurur."),
    ("o-yertutucu", "Boyut önceden biliniyorsa yer tutucu dizi oluşturmak, diziyi büyütmekten daha verimlidir.",
     "Boyut önceden biliniyorsa bile diziyi eleman ekleyerek büyütmek daha verimlidir."),
    ("o-dizi", "np.arange'de stop değeri diziye dahil edilmez.", "np.arange'de stop değeri diziye dahil edilir."),
    ("o-dizi", "np.linspace'te hem start hem stop değeri diziye dahildir.",
     "np.linspace'te stop değeri diziye dahil edilmez."),
    ("o-dizi", "Ondalıklı sayılarda linspace, kayan nokta hassasiyeti sorunlarını önlediği için tercih edilir.",
     "Ondalıklı sayılarda arange, linspace'ten her zaman daha güvenilirdir."),
    ("i-1d", "NumPy dizileri 0'dan başlayarak indekslenir.", "NumPy dizileri 1'den başlayarak indekslenir."),
    ("i-2d", "Çok boyutlu dizide indeksler tek köşeli parantez içinde virgülle ayrılarak yazılabilir: m[1, 2].",
     "Çok boyutlu dizide indeksler mutlaka normal parantezle yazılır: m(1, 2)."),
    ("i-reshape", "reshape ile yeni şeklin toplam eleman sayısı eski diziyle aynı olmalıdır.",
     "reshape ile toplam eleman sayısı istenildiği gibi değiştirilebilir."),
    ("v-view", "NumPy'da basit dilimleme bir view oluşturur.", "NumPy'da basit dilimleme bağımsız bir kopya oluşturur."),
    ("v-view", "View, orijinal diziyle aynı veri tamponuna bakar.", "View, orijinal verinin ayrı bir kopyasını saklar."),
    ("v-view", "Python listesini dilimlemek elemanların kopyasını içeren yeni bir liste oluşturur.",
     "Python listesini dilimlemek orijinal listeye bağlı bir view oluşturur."),
    ("v-neden", "View davranışı büyük dizilerde bellek ve performans için bir optimizasyondur.",
     "View davranışı, NumPy'ı listelerden daha güvenli yapmak için seçilmiştir."),
    ("v-copy", "Orijinalden bağımsız kopya için .copy() metodu açıkça kullanılmalıdır.",
     "b = a[:] yazmak orijinalden bağımsız bir kopya oluşturur."),
]


# Bölüm etiketli tüm şablonlar: NumPy Bölüm 1 + Python bölümleri ve NumPy Bölüm 2
TUM_SABLONLAR = [("np1", f) for f in SABLONLAR] + sinav_python.SABLONLAR
KAVRAMLAR = KAVRAMLAR + sinav_python.KAVRAMLAR


def kavram_sorusu(gorulen, haric, konu_on_eki=None):
    """Daha önce görülmemiş ve bu sınavda henüz sorulmamış bir kavram sorusu seçer."""
    tumu = [(i, dogru) for i in range(len(KAVRAMLAR)) for dogru in (True, False)
            if i not in haric and (konu_on_eki is None or KAVRAMLAR[i][0].startswith(konu_on_eki))]
    adaylar = [(i, dogru) for i, dogru in tumu if f"kavram:{KAVRAMLAR[i][1][:40]}:{dogru}" not in gorulen] or tumu
    i, dogru = random.choice(adaylar)
    konu, dogru_ifade, yanlis_ifade = KAVRAMLAR[i]
    ifade = dogru_ifade if dogru else yanlis_ifade
    aciklama = "Bu ifade doğru." if dogru else f"Doğrusu: {dogru_ifade}"
    return i, dogruyanlis(ifade, dogru, aciklama, konu, f"kavram:{dogru_ifade[:40]}:{dogru}")


def _uret(sablon, gorulen, kullanilan, kesin=True):
    """Görülmemiş bir soru üretmeye çalışır; kesin=False ise gerekirse görülmüş olanı da kabul eder."""
    for _ in range(60):
        soru = sablon()
        if soru and soru["parmak"] not in gorulen and soru["parmak"] not in kullanilan:
            return soru
    if kesin:
        return None
    for _ in range(20):
        soru = sablon()
        if soru and soru["parmak"] not in kullanilan:
            return soru
    return None


def sinav_olustur(gorulen=()):
    gorulen = set(gorulen)
    sorular, kullanilan, kullanilan_sablon = [], set(), set()

    def ekle(sablon, kesin=True):
        soru = _uret(sablon, gorulen, kullanilan, kesin)
        if soru:
            sorular.append(soru)
            kullanilan.add(soru["parmak"])
            kullanilan_sablon.add(sablon)
        return soru is not None

    import varyant  # döngüsel içe aktarmayı önlemek için burada

    # 1) Her bölümden en az bir kodlu soru (hesaplama, hata bulma, kod tamamlama veya satır sıralama)
    tum = TUM_SABLONLAR + varyant.yeni_tur_ureticileri()
    bolumler = {}
    for bolum, sablon in tum:
        bolumler.setdefault(bolum, []).append(sablon)
    for sablonlar in bolumler.values():
        sirali = random.sample(sablonlar, len(sablonlar))
        if not any(ekle(s) for s in sirali):
            ekle(sirali[0], kesin=False)

    # 2) Kalan kodlu sorular farklı üreticilerden rastgele
    kalanlar = [f for _, f in tum if f not in kullanilan_sablon]
    random.shuffle(kalanlar)
    for sablon in kalanlar:
        if len(sorular) >= SORU_SAYISI - KAVRAM_SORUSU_SAYISI:
            break
        ekle(sablon)

    # 3) Kavram soruları (doğru/yanlış, hangisi doğru/yanlış, hepsini seç); "Ortamlar" her sınavda en az bir kez
    konular = sorted(varyant.BANKA)
    ortamlar = [k for k in konular if k.startswith("ortam-")]
    hedefler = [random.choice(ortamlar)] + random.sample(konular, KAVRAM_SORUSU_SAYISI * 2)
    for konu in hedefler:
        if len(sorular) >= SORU_SAYISI:
            break
        for _ in range(30):
            soru = varyant.kavram_karisik(konu)
            if soru and soru["parmak"] not in kullanilan and (soru["parmak"] not in gorulen or _ > 20):
                sorular.append(soru)
                kullanilan.add(soru["parmak"])
                break

    random.shuffle(sorular)
    return sorular


if __name__ == "__main__":
    import json
    import sys

    istek = json.loads(sys.stdin.read() or "{}")
    json.dump(sinav_olustur(istek.get("gorulen", [])), sys.stdout, ensure_ascii=False)
