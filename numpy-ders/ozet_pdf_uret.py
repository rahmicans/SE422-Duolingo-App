"""Bölüm özetleri: kod çıktılarını gerçek çalıştırmayla yazar ve PDF'leri üretir.

Kaynaklar: ozetler/NN-ad.md (en başta unite/baslik/kaynak bilgisi olan bir ön bölüm).
Çıktılar:  static/ozetler/NN-ad.pdf, static/ozetler/tum-ozetler.pdf, static/ozetler/liste.json

Kullanım (proje klasöründe):
    python3 ozet_pdf_uret.py            # çıktıları güncelle + tüm PDF'leri üret
    python3 ozet_pdf_uret.py --kontrol  # yalnızca: .md'deki çıktılar gerçek çalıştırmayla aynı mı? (dosyaya yazmaz)

Kod blokları:
    ```python            → çalıştırılır; hemen arkasına ```cikti bloğu (gerçek çıktı) yazılır/güncellenir
    ```python hata       → hata vermesi beklenir; çıktı bloğuna son satırı ("TipError: mesaj") yazılır
    ```python calistirma → çalıştırılmaz (ör. dosya/ağ gerektiren, yalnızca gösterim amaçlı kod)
Her blok kendi başına, temiz bir ad alanında (np ve pd hazır) ve geçici bir klasörde çalışır.
"""

import contextlib
import io
import json
import os
import re
import sys
import tempfile
import traceback
from pathlib import Path

KLASOR = Path(__file__).resolve().parent
VENV_PYTHON = KLASOR / ".venv" / "bin" / "python"

# Sistem python3'üyle çağrılırsa (reportlab/numpy/pandas yok) .venv Python'uyla yeniden başlat
if __name__ == "__main__" and not os.environ.get("SE422_VENV"):
    try:
        import numpy  # noqa: F401
        import pandas  # noqa: F401
        import reportlab  # noqa: F401
    except ImportError:
        if VENV_PYTHON.exists():
            os.environ["SE422_VENV"] = "1"
            os.execv(str(VENV_PYTHON), [str(VENV_PYTHON), __file__, *sys.argv[1:]])
        raise

import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402

KAYNAK = KLASOR / "ozetler"
HEDEF = KLASOR / "static" / "ozetler"
BLOK = re.compile(r"```python([^\n]*)\n(.*?)```\n(?:\n?```cikti\n.*?```\n)?", re.S)


def on_bolum(md):
    """'---\\nanahtar: değer\\n---' ön bölümünü ayırır."""
    m = re.match(r"^---\n(.*?)\n---\n", md, re.S)
    if not m:
        raise ValueError("Ön bölüm (unite/baslik/kaynak) yok")
    bilgi = dict(re.findall(r"^(\w+):\s*(.*)$", m.group(1), re.M))
    return bilgi, md[m.end():]


def calistir(kod, hata_beklenir=False):
    """Kodu temiz ad alanında, geçici klasörde çalıştırır; çıktı metni döndürür."""
    tampon = io.StringIO()
    eski = os.getcwd()
    with tempfile.TemporaryDirectory() as gecici:
        os.chdir(gecici)
        try:
            with contextlib.redirect_stdout(tampon), contextlib.redirect_stderr(tampon):
                exec(compile(kod, "<ozet>", "exec"), {"__name__": "__main__", "np": np, "pd": pd})
        except Exception as e:  # noqa: BLE001
            if not hata_beklenir:
                raise RuntimeError(f"Özet kodu hata verdi:\n{kod}\n\n{traceback.format_exc(limit=1)}") from e
            son = traceback.format_exception_only(type(e), e)[-1].strip()
            return (tampon.getvalue() + son).strip("\n")
        finally:
            os.chdir(eski)
    if hata_beklenir:
        raise RuntimeError(f"Bu kodun hata vermesi bekleniyordu ama çalıştı:\n{kod}")
    return tampon.getvalue().rstrip("\n")


def ciktilari_yaz(md):
    """Her ```python bloğunu çalıştırıp arkasındaki ```cikti bloğunu gerçek çıktıyla yeniden yazar."""
    def degistir(m):
        bayrak, kod = m.group(1).strip(), m.group(2)
        blok = f"```python{(' ' + bayrak) if bayrak else ''}\n{kod}```\n"
        if bayrak == "calistirma":
            return blok
        cikti = calistir(kod, hata_beklenir=bayrak == "hata")
        return blok + (f"```cikti\n{cikti}\n```\n" if cikti.strip() else "")
    return BLOK.sub(degistir, md)


def ozet_dosyalari():
    return sorted(KAYNAK.glob("[0-9][0-9]-*.md"))


def pdf_uret(dosyalar):
    import pdf_uret as P
    from reportlab.platypus import PageBreak, Paragraph, Spacer

    HEDEF.mkdir(parents=True, exist_ok=True)
    liste, birlesik = {}, []
    for dosya in dosyalar:
        bilgi, govde = on_bolum(dosya.read_text(encoding="utf-8"))
        no = int(dosya.name[:2])
        baslik = f"Bölüm {no} · {bilgi['baslik']} — Konu özeti"
        ogeler = P.kapak_sayfasi(f"Bölüm {no}: {bilgi['baslik']}", "SE 422 · Introduction to Data Science · Konu özeti",
                                 [f"Kaynak slayt destesi: {bilgi.get('kaynak', '')}", P.tarih_yazisi()])
        ogeler += [Paragraph("İçindekiler", P.STIL["h1"]), P.icindekiler(), PageBreak()]
        # "# Bölüm başlığı" seviye 0, "##" seviye 1, "###" seviye 2 olarak içindekilere/yer imlerine girer
        ogeler += P.md_flowables(govde, toc_seviye_ust=3, anahtar_on_eki=f"o{no}-")
        hedef = HEDEF / (dosya.stem + ".pdf")
        P.belge_uret(str(hedef), baslik, ogeler, kapak=True)
        liste[bilgi["unite"]] = {"no": no, "baslik": bilgi["baslik"], "dosya": hedef.name}
        birlesik += [PageBreak()] if birlesik else []
        birlesik += P.md_flowables(govde, toc_seviye_ust=2, anahtar_on_eki=f"t{no}-")
        print(f"  {hedef.relative_to(KLASOR)}")

    if dosyalar:
        ogeler = P.kapak_sayfasi("SE 422 · Bölüm Özetleri", "Introduction to Data Science · Tüm bölümlerin konu anlatımı",
                                 [f"{len(dosyalar)} bölüm", P.tarih_yazisi()])
        ogeler += [Paragraph("İçindekiler", P.STIL["h1"]), P.icindekiler(), PageBreak()] + birlesik
        P.belge_uret(str(HEDEF / "tum-ozetler.pdf"), "SE 422 · Bölüm Özetleri", ogeler, kapak=True)
        print(f"  {(HEDEF / 'tum-ozetler.pdf').relative_to(KLASOR)}")
    (HEDEF / "liste.json").write_text(json.dumps({"uniteler": liste, "birlesik": "tum-ozetler.pdf"}, ensure_ascii=False, indent=1),
                                      encoding="utf-8")


def main():
    kontrol = "--kontrol" in sys.argv
    dosyalar = ozet_dosyalari()
    farkli = []
    for dosya in dosyalar:
        eski = dosya.read_text(encoding="utf-8")
        yeni = ciktilari_yaz(eski)
        if yeni != eski:
            farkli.append(dosya.name)
            if not kontrol:
                dosya.write_text(yeni, encoding="utf-8")
    if kontrol:
        print("Çıktıları güncel olmayan özetler: " + (", ".join(farkli) if farkli else "yok"))
        sys.exit(1 if farkli else 0)
    print(f"{len(dosyalar)} özetin kod çıktıları gerçek çalıştırmayla yazıldı ({len(farkli)} dosya güncellendi). PDF'ler:")
    pdf_uret(dosyalar)


if __name__ == "__main__":
    sys.path.insert(0, str(KLASOR))
    main()
