"""Ara sınav sorularının referans cevaplarını programatik olarak doğrular.

Her şablondan (yeni şablonlar, mevcut üreticilerden uyarlananlar ve content/*.sorular.json) çok sayıda soru üretir:
  secmeli   → kodlu sorularda doğru şık gerçek çıktıyla aynı, başka hiçbir şık değil (testler.soru_testi)
  boslukyaz → kodlu sorularda HER kabul edilen cevap koda konunca kod hedef çıktıyı üretir
  tablo     → her boş hücrenin ifadesi kurulum koduyla yeniden hesaplanır ve kabul edilen ilk cevapla aynıdır
Ayrıca bütün sorular static/degerlendir.js ile (arayüzdeki değerlendirici) değerlendirilir: referans cevaplar
tam puan, boş/yanlış cevaplar sıfır puan almalıdır.

    .venv/bin/python ara_sinav_kontrol.py          # özet yazar, hata varsa çıkış kodu 1
"""

import json
import subprocess
import sys
import warnings
from collections import Counter
from pathlib import Path

KLASOR = Path(__file__).resolve().parent
sys.path.insert(0, str(KLASOR))
warnings.filterwarnings("ignore", category=SyntaxWarning)

import ara_sinav as A  # noqa: E402
import testler  # noqa: E402

TEKRAR = 40
hatalar = []


def kapsam_ici_dersler():
    """Müfredat (static/mufredat) + static/sinav-kapsam.json → {ders_id: başlık} (istemcideki hesapla aynı)."""
    betik = r"""
const fs = require('fs'); const h = fs.readFileSync(process.argv[1] + '/static/index.html', 'utf8');
const d = [...h.matchAll(/src="\/static\/mufredat\/([^"]+)"/g)].map(m => process.argv[1] + '/static/mufredat/' + m[1]);
eval(d.map(f => fs.readFileSync(f, 'utf8')).join('\n') + ';globalThis.U = UNITELER');
const K = JSON.parse(fs.readFileSync(process.argv[1] + '/static/sinav-kapsam.json', 'utf8')); const o = {};
for (const u of U) { const ku = K.uniteler[u.id]; if (!ku) continue;
  for (const x of u.dersler) { const k = (ku.dersler && ku.dersler[x.id] && ku.dersler[x.id].kapsam) || ku.kapsam; if (k === 'ici') o[x.id] = ku.baslik; } }
process.stdout.write(JSON.stringify(o));"""
    r = subprocess.run(["node", "-e", betik, str(KLASOR)], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def normal(m):
    return " ".join(str(m).split())


def bosluk_kontrol(q, yer):
    if q["metin"].count("___") != len(q["bosluklar"]) or not all(q["bosluklar"]):
        hatalar.append(f"{yer}: boşluk sayısı uyuşmuyor")
        return
    if not (q.get("kod") and "hedef" in q):
        return
    for i, kabul in enumerate(q["bosluklar"]):
        for cevap in kabul:
            secim = [b[0] for b in q["bosluklar"]]
            secim[i] = cevap
            kod = q["metin"]
            for c in secim:
                kod = kod.replace("___", c, 1)
            try:
                cikti, _ = A.calistir(kod)
            except Exception as e:  # noqa: BLE001
                hatalar.append(f"{yer}: '{cevap}' cevabıyla kod hata verdi: {e!r}")
                continue
            if normal(cikti) != normal(q["hedef"]):
                hatalar.append(f"{yer}: '{cevap}' cevabı hedefi vermiyor ({cikti!r} ≠ {q['hedef']!r})")


def tablo_kontrol(q, yer):
    n = len(q["basliklar"])
    bos = [h for satir in q["satirlar"] for h in satir if isinstance(h, dict)]
    if any(len(s) != n for s in q["satirlar"]) or not bos:
        hatalar.append(f"{yer}: tablo yapısı hatalı")
        return
    if q.get("dogrulama") != "kod":
        return
    for h in bos:
        if "ifade" not in h:
            hatalar.append(f"{yer}: kodla doğrulanan tabloda ifadesiz hücre {h}")
            continue
        try:
            v = A.deger(q.get("kurulum", ""), h["ifade"])
        except Exception as e:  # noqa: BLE001
            hatalar.append(f"{yer}: hücre ifadesi hata verdi {h['ifade']}: {e!r}")
            continue
        gosterimler = {normal(v), normal(repr(v))} | ({"NaN"} if A.pd.api.types.is_scalar(v) and A.pd.isna(v) else set())
        if normal(h["cevaplar"][0]) not in gosterimler:
            hatalar.append(f"{yer}: hücre {h['ifade']} = {v!r}, referans {h['cevaplar'][0]!r}")


def soru_kontrol(q, yer, konular):
    if q["tip"] not in A.TIPLER:
        hatalar.append(f"{yer}: bilinmeyen tip {q['tip']}")
    if q["konu"] not in konular:
        hatalar.append(f"{yer}: konu kapsam içinde değil: {q['konu']}")
    if q["tip"] == "secmeli":
        once = len(testler.hatalar)
        testler.soru_testi(q, set(konular))
        hatalar.extend(f"{yer}: {h}" for h in testler.hatalar[once:])
        if not 3 <= len(q["secenekler"]) <= 4:
            hatalar.append(f"{yer}: şık sayısı {len(q['secenekler'])}")
    elif q["tip"] == "boslukyaz":
        bosluk_kontrol(q, yer)
    else:
        tablo_kontrol(q, yer)


def js_degerlendir(sorular):
    """Arayüzdeki değerlendirici: referans cevaplar tam, boş ve uydurma cevaplar sıfır puan almalı."""
    betik = r"""
const D = require(process.argv[1]); const sorular = JSON.parse(require('fs').readFileSync(0, 'utf8')); const sonuc = [];
for (const q of sorular) {
  if (q.tip === 'secmeli') continue;
  const ref = q.tip === 'boslukyaz' ? q.bosluklar.map(b => b[0]) : D.bosHucreler(q).map(x => x.hucre.cevaplar[0]);
  const alt = q.tip === 'boslukyaz' ? q.bosluklar.map(b => b[b.length - 1]) : D.bosHucreler(q).map(x => x.hucre.cevaplar.at(-1));
  const f = q.tip === 'boslukyaz' ? D.bosluk : D.tablo;
  const a = f(q, ref), b = f(q, alt), c = f(q, ref.map(() => '')), d = f(q, ref.map(() => '@@yanlis@@'));
  if (!a.dogru || !b.dogru || c.puan !== 0 || d.puan !== 0) sonuc.push([q.parmak, a.puan, b.puan, c.puan, d.puan]);
}
process.stdout.write(JSON.stringify(sonuc));"""
    r = subprocess.run(["node", "-e", betik, str(KLASOR / "static" / "degerlendir.js")], input=json.dumps(sorular),
                       capture_output=True, text=True)
    if r.returncode:
        hatalar.append(f"JS değerlendirici çalışmadı: {r.stderr[-300:]}")
        return
    for parmak, *puanlar in json.loads(r.stdout):
        hatalar.append(f"{parmak}: değerlendirici referansı kabul etmiyor ya da yanlışı kabul ediyor {puanlar}")


def main():
    konular = kapsam_ici_dersler()
    tum = []
    sayac = Counter()
    for baslik, tip, konu, f in A.ureticiler(konular):
        for _ in range(TEKRAR if (baslik, tip, konu, f) in [(b, t, k, g) for b, t, k, g in A.SABLONLAR] else 6):
            try:
                q = f()
            except Exception as e:  # noqa: BLE001
                hatalar.append(f"{getattr(f, '__name__', konu)}: üretim hatası {e!r}")
                continue
            if not q:
                continue
            soru_kontrol(q, f"{baslik}/{tip}/{q['parmak'][:40]}", konular)
            tum.append(q)
            sayac[(baslik, tip)] += 1
    for q in A.ek_sorular():
        soru_kontrol(q, f"ek/{q.get('kaynakDosya')}", konular)
        tum.append(q)
    js_degerlendir(tum)
    # Deneme sınavı: istenen sayıda, tekrar etmeyen soru
    for adet in (10, 30, 50):
        s = A.deneme_olustur(adet, {"1.1": 5, "1.2": 40, "1.3": 10, "1.4": 20, "1.5": 25}, konular)
        if len(s) != adet or len({q["parmak"] for q in s}) != adet:
            hatalar.append(f"Deneme: {adet} soru istendi, {len(s)} üretildi")
    benzersiz = len({q["parmak"] for q in tum})
    print(f"Ara sınav kontrolü: {len(tum)} soru ({benzersiz} benzersiz) üretildi ve referans cevapları doğrulandı")
    for (b, t), n in sorted(sayac.items()):
        print(f"  {b} {t:10} {n}")
    if hatalar:
        print(f"\n{len(hatalar)} HATA:")
        for h in hatalar[:60]:
            print(" -", h)
        sys.exit(1)
    print("Tüm ara sınav soruları geçti ✓")


if __name__ == "__main__":
    main()
