"""Kullanıcı kodunu ayrı bir süreçte çalıştıran yardımcı.

İki modu vardır:
    python calistirici.py repl     -> Kalıcı terminal oturumu (satır satır JSON alır/verir)
    python calistirici.py kontrol  -> Bir alıştırmayı tek seferde çalıştırıp kontrol eder

Kod sunucudan ayrı bir süreçte çalıştığı için sonsuz döngü gibi durumlarda
sunucu bu süreci öldürüp yeniden başlatabilir.
"""

import ast
import builtins
import contextlib
import io
import json
import sys
import time
import traceback

import numpy as np
import pandas as pd

DOSYA_ADI = "<girdi>"


def _input_yok(*_):
    raise RuntimeError("Bu ortamda input() kullanılamaz.")


def hata_metni(hata):
    tb = hata.__traceback__
    # Bu dosyaya ait çerçeveleri atla, sadece kullanıcı kodundan itibaren göster
    while tb is not None and tb.tb_frame.f_code.co_filename != DOSYA_ADI:
        tb = tb.tb_next
    return "".join(traceback.format_exception(type(hata), hata, tb))


def hata_satiri(hata):
    """Hatanın kullanıcı kodundaki satır numarası (1'den başlar) ya da None."""
    if isinstance(hata, SyntaxError) and hata.filename == DOSYA_ADI:
        return hata.lineno
    satir = None
    tb = hata.__traceback__
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == DOSYA_ADI:
            satir = tb.tb_lineno
        tb = tb.tb_next
    return satir


def calistir_ayrintili(kod, ad_alani, yankila=False, stderr_ayri=True):
    """Kodu çalıştırır; cikti, stderr, hata (traceback metni), hata_tipi, hata_mesaji, satir ve sure döndürür.

    yankila=True ise Python terminali gibi son ifadenin değerini de yazdırır.
    stderr_ayri=False ise stderr de cikti'ya yazılır (eski davranış).
    """
    cikti = io.StringIO()
    hata_akisi = io.StringIO() if stderr_ayri else cikti
    sonuc = {"hata": None, "hata_tipi": None, "hata_mesaji": None, "satir": None}
    baslangic = time.perf_counter()
    with contextlib.redirect_stdout(cikti), contextlib.redirect_stderr(hata_akisi):
        try:
            agac = ast.parse(kod, DOSYA_ADI, "exec")
            son_ifade = None
            if yankila and agac.body and isinstance(agac.body[-1], ast.Expr):
                son_ifade = ast.Expression(agac.body.pop().value)
            exec(compile(agac, DOSYA_ADI, "exec"), ad_alani)
            if son_ifade is not None:
                deger = eval(compile(son_ifade, DOSYA_ADI, "eval"), ad_alani)
                if deger is not None:
                    print(repr(deger))
        except BaseException as h:  # noqa: B036 - kullanıcı kodu her şeyi fırlatabilir
            sonuc.update(hata=hata_metni(h), hata_tipi=type(h).__name__, hata_mesaji=str(h), satir=hata_satiri(h))
    sonuc.update(cikti=cikti.getvalue(), stderr=hata_akisi.getvalue() if stderr_ayri else "",
                 sure=round(time.perf_counter() - baslangic, 4))
    return sonuc


def calistir(kod, ad_alani, yankila=False):
    """Kodu çalıştırır, (çıktı, hata) döndürür; stderr çıktıya karışır (alıştırma kontrolü için eski davranış)."""
    s = calistir_ayrintili(kod, ad_alani, yankila, stderr_ayri=False)
    return s["cikti"], s["hata"]


def yeni_ad_alani():
    return {"__name__": "__main__", "np": np, "pd": pd}


def repl_modu():
    kanal = sys.stdout
    ad_alani = yeni_ad_alani()
    for satir in sys.stdin:
        istek = json.loads(satir)
        if istek.get("sifirla"):
            ad_alani = yeni_ad_alani()
            sonuc = {"cikti": "", "hata": None}
        else:
            sonuc = calistir_ayrintili(istek["kod"], ad_alani, yankila=True)
        kanal.write(json.dumps(sonuc) + "\n")
        kanal.flush()


def kontrol_modu():
    istek = json.loads(sys.stdin.read())

    kullanici = yeni_ad_alani()
    cikti, hata = calistir(istek["kod"], kullanici)

    cozum = yeni_ad_alani()
    beklenen_cikti, _ = calistir(istek["cozum"], cozum)

    kapsam = {"np": np, "pd": pd, "u": kullanici, "r": cozum,
              "cikti": cikti, "beklenen_cikti": beklenen_cikti}
    sonuclar = []
    for ifade, aciklama in istek["kontroller"]:
        # Kontroller kullanıcı fonksiyonlarını çağırabilir; yazdırdıkları JSON çıktısına karışmasın
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                gecti = bool(eval(ifade, kapsam))
        except Exception:
            gecti = False
        sonuclar.append({"aciklama": aciklama, "gecti": gecti})

    json.dump({
        "cikti": cikti,
        "hata": hata,
        "beklenen_cikti": beklenen_cikti,
        "kontroller": sonuclar,
        "basarili": hata is None and all(s["gecti"] for s in sonuclar),
    }, sys.__stdout__)


if __name__ == "__main__":
    builtins.input = _input_yok
    if sys.argv[1:] == ["repl"]:
        repl_modu()
    else:
        kontrol_modu()
