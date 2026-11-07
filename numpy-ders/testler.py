"""İçerik, alıştırma ve sınav testleri.

Çalıştırmak için (node gerekir):
    .venv/bin/python testler.py
"""

import contextlib
import io
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import pandas as pd

KLASOR = Path(__file__).resolve().parent
sys.path.insert(0, str(KLASOR))

import alistirmalar  # noqa: E402
import sinav  # noqa: E402
import varyant  # noqa: E402

HATA = "Hata verir"
hatalar = []


def hata(mesaj):
    hatalar.append(mesaj)


def mufredati_yukle():
    """index.html'deki sırayla tüm müfredat dosyalarını node ile yükler."""
    html = (KLASOR / "static" / "index.html").read_text()
    dosyalar = [str(KLASOR / "static" / "mufredat" / d) for d in re.findall(r'src="/static/mufredat/([^"]+)"', html)]
    betik = ("const fs = require('fs');"
             "const kod = process.argv.slice(1).map(f => fs.readFileSync(f, 'utf8')).join('\\n');"
             "eval(kod + ';process.stdout.write(JSON.stringify(UNITELER))');")
    cikti = subprocess.run(["node", "-e", betik, *dosyalar], capture_output=True, text=True, check=True).stdout
    return json.loads(cikti)


def calistir(kod):
    """Kodu çalıştırır, (çıktı, hata) döndürür."""
    tampon = io.StringIO()
    try:
        with contextlib.redirect_stdout(tampon):
            exec(kod, {"np": np, "pd": pd, "__name__": "__main__"})
    except Exception as e:  # noqa: BLE001
        return tampon.getvalue(), e
    return tampon.getvalue(), None


def normalize(metin):
    """Arayüzdeki 'yaz' sorularıyla aynı normalleştirme."""
    metin = metin.strip().replace(",", " ")
    metin = re.sub(r"\s+", " ", metin)
    return metin.replace("[ ", "[").replace(" ]", "]")


def beklenen_cikti_testi(yer, kod, beklenen):
    cikti, e = calistir(kod)
    if beklenen == HATA:
        if e is None:
            hata(f"{yer}: hata bekleniyordu ama kod çalıştı: {cikti.strip()!r}")
    elif e:
        hata(f"{yer}: kod hata verdi: {e!r}")
    elif cikti.strip() != beklenen.strip():
        hata(f"{yer}: beklenen {beklenen!r}, gerçek çıktı {cikti.strip()!r}")


def aralik(s):
    return set(range(min(s), max(s) + 1)) if s else set()


def mufredat_testleri(uniteler):
    ders_idleri, kullanilan_alistirmalar = set(), []
    alistirma_idleri = {a["id"] for a in alistirmalar.ALISTIRMALAR}
    adim_sayisi = soru_sayisi = toplam_slayt = 0

    for unite in uniteler:
        kapsanan = set()
        toplam_slayt += unite["slaytSayisi"]
        for ders in unite["dersler"]:
            if ders["id"] in ders_idleri:
                hata(f"Tekrarlanan ders id: {ders['id']}")
            ders_idleri.add(ders["id"])
            kapsanan |= aralik(ders.get("slayt"))
            if not any(a["tip"] == "ogren" for a in ders["adimlar"]):
                hata(f"{ders['id']}: anlatım kartı yok")
            for n, adim in enumerate(ders["adimlar"]):
                yer = f"{ders['id']}#{n} ({adim['tip']})"
                adim_sayisi += 1
                kapsanan |= aralik(adim.get("slayt"))
                tip = adim["tip"]
                if tip != "ogren":
                    soru_sayisi += 1

                if tip == "ogren" and adim.get("kod"):
                    _, e = calistir(adim["kod"])
                    if e and not adim.get("hataBeklenir"):
                        hata(f"{yer}: anlatım kodu hata verdi: {e!r}")
                elif tip == "secmeli":
                    if not 0 <= adim["dogru"] < len(adim["secenekler"]):
                        hata(f"{yer}: geçersiz doğru indeksi")
                    if len(set(adim["secenekler"])) != len(adim["secenekler"]):
                        hata(f"{yer}: tekrarlanan seçenek")
                elif tip == "bosluk":
                    if adim["metin"].count("___") != len(adim["bosluklar"]):
                        hata(f"{yer}: boşluk sayısı uyuşmuyor")
                    kelimeler = list(adim["kelimeler"])
                    for b in adim["bosluklar"]:
                        if b in kelimeler:
                            kelimeler.remove(b)
                        else:
                            hata(f"{yer}: '{b}' kelime kutularında yok")
                elif tip == "sirala":
                    tum = adim["parcalar"] + adim.get("ekstra", [])
                    if len(set(tum)) != len(tum):
                        hata(f"{yer}: tekrarlanan parça")
                elif tip == "eslestir":
                    sol = [c[0] for c in adim["ciftler"]]
                    sag = [c[1] for c in adim["ciftler"]]
                    if len(set(sol)) != len(sol) or len(set(sag)) != len(sag):
                        hata(f"{yer}: tekrarlanan eşleştirme")
                elif tip == "kod":
                    if adim["alistirma"] not in alistirma_idleri:
                        hata(f"{yer}: alıştırma bulunamadı: {adim['alistirma']}")
                    kullanilan_alistirmalar.append(adim["alistirma"])

                if adim.get("cikti"):
                    beklenen = adim["secenekler"][adim["dogru"]] if tip == "secmeli" else adim["cevaplar"][0]
                    beklenen_cikti_testi(yer, adim["kod"], beklenen)

        eksik = set(range(1, unite["slaytSayisi"] + 1)) - kapsanan
        if eksik:
            hata(f"{unite['kaynak']}: kapsanmayan slaytlar {sorted(eksik)}")
        fazla = {s for s in kapsanan if s > unite["slaytSayisi"]}
        if fazla:
            hata(f"{unite['kaynak']}: destede olmayan slayt numaraları {sorted(fazla)}")

    kullanilmayan = alistirma_idleri - set(kullanilan_alistirmalar)
    if kullanilmayan:
        hata(f"Derslerde kullanılmayan alıştırmalar: {sorted(kullanilmayan)}")
    if len(kullanilan_alistirmalar) != len(set(kullanilan_alistirmalar)):
        hata("Bir alıştırma birden fazla derste kullanılmış")

    print(f"Müfredat: {len(uniteler)} bölüm ({toplam_slayt} slayt, hepsi kapsandı), {len(ders_idleri)} ders, "
          f"{adim_sayisi} adım ({soru_sayisi} soru)")
    return ders_idleri


def alistirma_testleri():
    calistirici = str(KLASOR / "calistirici.py")
    for a in alistirmalar.ALISTIRMALAR:
        for kod, beklenen in ((a["cozum"], True), (a["baslangic"], False)):
            istek = json.dumps({"kod": kod, "cozum": a["cozum"], "kontroller": a["kontroller"]})
            r = subprocess.run([sys.executable, calistirici, "kontrol"], input=istek, capture_output=True, text=True)
            if not r.stdout.strip():
                hata(f"Alıştırma {a['id']}: kontrol çalışmadı: {r.stderr.strip()[-300:]}")
                continue
            s = json.loads(r.stdout)
            if s["basarili"] != beklenen:
                kalan = [k["aciklama"] for k in s["kontroller"] if not k["gecti"]]
                hata(f"Alıştırma {a['id']}: {'çözüm geçmedi' if beklenen else 'başlangıç kodu geçti'} {kalan} {s['hata'] or ''}")
    print(f"Alıştırmalar: {len(alistirmalar.ALISTIRMALAR)} alıştırmanın çözümü geçiyor, başlangıç kodu geçmiyor")


def soru_testi(soru, ders_idleri):
    yer = f"soru[{soru['parmak'][:60]}]"
    if soru["konu"] not in ders_idleri:
        hata(f"{yer}: bilinmeyen konu {soru['konu']}")
    tip = soru["tip"]
    if tip == "coklu":
        if len(soru["secenekler"]) < 3 or len(set(soru["secenekler"])) != len(soru["secenekler"]) or not soru["dogrular"]:
            hata(f"{yer}: çoklu seçim hatalı")
        return
    if tip == "hatabul":
        _, e, satir = varyant.calistir("\n".join(soru["satirlar"]))
        if e is None or satir != soru["dogru"]:
            hata(f"{yer}: hatalı satır yanlış (beklenen {soru['dogru']}, gerçek {satir}, {e!r})")
        return
    if tip == "tamamla":
        for c in soru["cevaplar"]:
            cikti, e = calistir(soru["kod"].replace("___", c, 1))
            if e or cikti.strip() != soru["hedef"]:
                hata(f"{yer}: '{c}' cevabı hedef çıktıyı vermiyor")
        return
    if tip == "sirala" and soru.get("satirlar"):
        cikti, e = calistir("\n".join(soru["parcalar"]))
        if e or cikti.strip() != soru["hedef"]:
            hata(f"{yer}: doğru sıra hedef çıktıyı vermiyor")
        return
    if tip == "secmeli":
        if len(soru["secenekler"]) < 3 or len(set(soru["secenekler"])) != len(soru["secenekler"]):
            hata(f"{yer}: seçenekler hatalı: {soru['secenekler']}")
        beklenen = soru["secenekler"][soru["dogru"]]
    elif tip == "yaz":
        beklenen = soru["cevaplar"][0]
    else:
        beklenen = None

    if not soru.get("kod"):
        return
    cikti, e = calistir(soru["kod"])
    if tip != "dogruyanlis" and "print(" not in soru["kod"]:
        return
    if tip == "dogruyanlis":
        if (e is None) != soru["dogru"]:
            hata(f"{yer}: 'çalışır' cevabı yanlış (hata: {e!r})")
        return
    if beklenen == HATA:
        if e is None:
            hata(f"{yer}: hata bekleniyordu")
        return
    if e:
        hata(f"{yer}: kod hata verdi: {e!r}")
    elif normalize(cikti) != normalize(beklenen):
        hata(f"{yer}: beklenen {beklenen!r}, gerçek {cikti.strip()!r}")
    if tip == "secmeli":
        for i, s in enumerate(soru["secenekler"]):
            if i != soru["dogru"] and normalize(s) == normalize(cikti):
                hata(f"{yer}: bir yanlış seçenek de gerçek çıktıyla aynı")


def sinav_testleri(ders_idleri):
    bolum_on_ekleri = {"temel", "kontrol", "fonk", "dosya", "liste", "str", "sozluk", "sinif",
                       "kalitim", "ozyineleme", "vt", "ortam", "np2", "pd"}
    for _ in range(300):
        sorular = sinav.sinav_olustur()
        if len(sorular) != sinav.SORU_SAYISI:
            hata(f"Sınav {len(sorular)} soru içeriyor")
        parmaklar = [s["parmak"] for s in sorular]
        if len(parmaklar) != len(set(parmaklar)):
            hata("Aynı sınavda tekrarlanan soru")
        eksik = bolum_on_ekleri - {s["konu"].split("-")[0] for s in sorular}
        if eksik:
            hata(f"Sınavda eksik bölüm: {sorted(eksik)}")
        for s in sorular:
            soru_testi(s, ders_idleri)
        json.dumps(sorular)

    gorulen, sinavlar, tekrar = set(), set(), 0
    for _ in range(40):
        sorular = sinav.sinav_olustur(gorulen)
        for s in sorular:
            if s["parmak"] in gorulen and not s["parmak"].startswith("kavram:"):
                tekrar += 1
        gorulen.update(s["parmak"] for s in sorular)
        sinavlar.add(tuple(sorted(s["parmak"] for s in sorular)))
    if tekrar:
        hata(f"Art arda 40 sınavda {tekrar} hesaplama sorusu tekrar etti")
    if len(sinavlar) != 40:
        hata("Birbirinin aynısı olan sınavlar üretildi")
    print(f"Sınav: 300 sınav × {sinav.SORU_SAYISI} soru gerçek kodla doğrulandı, her sınavda tüm bölümler var; "
          f"art arda 40 sınavda {tekrar} tekrar")


def varyant_testleri(ders_idleri):
    toplam = 0
    turler = set()
    for konu in sorted(ders_idleri):
        sorular = varyant.varyant_uret([konu], 30)
        if len({q["parmak"] for q in sorular}) < 12:
            hata(f"Varyant: {konu} için yeterince farklı soru üretilmiyor ({len(sorular)})")
        for q in sorular:
            if q["konu"] != konu:
                hata(f"Varyant: {konu} istendi, {q['konu']} üretildi")
            soru_testi(q, ders_idleri)
            turler.add(q["tip"])
        toplam += len(sorular)
    print(f"Varyantlar: {len(ders_idleri)} dersin her biri için 30 benzer soru üretildi ve doğrulandı "
          f"({toplam} soru, türler: {', '.join(sorted(turler))})")


if __name__ == "__main__":
    calisma = Path(tempfile.gettempdir()) / "se422-calisma"
    calisma.mkdir(exist_ok=True)
    os.chdir(calisma)  # dosya örnekleri proje klasörüne yazılmasın
    dersler = mufredat_testleri(mufredati_yukle())
    alistirma_testleri()
    varyant_testleri(dersler)
    sinav_testleri(dersler)
    if hatalar:
        print(f"\n{len(hatalar)} HATA:")
        for h in hatalar[:80]:
            print(" -", h)
        sys.exit(1)
    print("\nTüm testler geçti ✓")
