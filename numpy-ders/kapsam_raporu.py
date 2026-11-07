"""SINAV_KAPSAM.md'yi müfredattan (static/mufredat) ve kapsam haritasından (static/sinav-kapsam.json) üretir.

    python3 kapsam_raporu.py            # SINAV_KAPSAM.md'yi yazar
    python3 kapsam_raporu.py --kontrol  # dosya güncel mi? (testler kullanır)
"""

import json
import subprocess
import sys
from pathlib import Path

KLASOR = Path(__file__).resolve().parent
HEDEF = KLASOR / "SINAV_KAPSAM.md"
AD = {"ici": "içi", "disi": "dışı", "belirsiz": "**belirsiz**"}


def mufredat():
    betik = r"""
const fs = require('fs'); const h = fs.readFileSync(process.argv[1] + '/static/index.html', 'utf8');
const d = [...h.matchAll(/src="\/static\/mufredat\/([^"]+)"/g)].map(m => process.argv[1] + '/static/mufredat/' + m[1]);
eval(d.map(f => fs.readFileSync(f, 'utf8')).join('\n') + ';globalThis.U = UNITELER');
process.stdout.write(JSON.stringify(U.map(u => ({ id: u.id, no: u.no, baslik: u.baslik, kaynak: u.kaynak, slaytSayisi: u.slaytSayisi,
  dersler: u.dersler.map(x => ({ id: x.id, baslik: x.baslik, slayt: x.slayt || null, ekBilgi: !!x.ekBilgi })) }))));"""
    return json.loads(subprocess.run(["node", "-e", betik, str(KLASOR)], capture_output=True, text=True, check=True).stdout)


def slayt_yazisi(s):
    if not s:
        return "slayt dışı"
    return f"{s[0]}" if s[0] == s[-1] else f"{s[0]}–{s[-1]}"


def rapor():
    kapsam = json.loads((KLASOR / "static" / "sinav-kapsam.json").read_text(encoding="utf-8"))
    uniteler = mufredat()
    sayac = 0
    for u in uniteler:
        if u.get("no") is None:
            sayac += 1
            u["no"] = sayac
    satir = ["# Ara sınav kapsam haritası (Module 1)", "",
             "> Bu dosya `python3 kapsam_raporu.py` ile **otomatik üretilir**. Kapsamın tek kaynağı `static/sinav-kapsam.json` dosyasıdır; "
             "arayüz (rozetler, filtre, kalan süre) ve deneme sınavı (`ara_sinav.py`) aynı dosyayı okur. Değişiklik için JSON'u düzenleyip betiği yeniden çalıştır.",
             "", "**Duyuru:** çoktan seçmeli, boşluk doldurma ve tablo tamamlama soruları. Kapsam: 1.1 What is Data Science · 1.2 Python Basics · "
             "1.3 Python for Data Science · 1.4 Introduction to NumPy · 1.5 Data Manipulation with Pandas (yalnızca Series/DataFrame'e giriş ve "
             "veri temizleme: eksik değerler, tekrarlı satırlar, tutarsızlıklar) · Homework 1 · Moodle materyalleri.", "",
             "## Özet: sınav başlığı → uygulamadaki karşılığı", "",
             "| Sınav başlığı | Kapsam içi dersler (bölüm · slaytlar) | Kapsam içi slayt |", "|---|---|---|"]
    belirsizler = []
    ayrinti = ["", "## Ayrıntı: bölüm ve ders bazında", "", "| Bölüm | Ders | Slaytlar | Başlık | Kapsam | Not |", "|---|---|---|---|---|---|"]
    ozet = {b: {"dersler": [], "slayt": 0} for b in kapsam["basliklar"]}
    for u in uniteler:
        ku = kapsam["uniteler"].get(u["id"])
        if not ku:
            ayrinti.append(f"| {u['no']}. {u['baslik']} | — | — | — | **eşlenmemiş** | |")
            continue
        for d in u["dersler"]:
            kd = (ku.get("dersler") or {}).get(d["id"], {})
            k = kd.get("kapsam") or ku["kapsam"]
            notu = kd.get("not") or (ku.get("not") if k != "ici" or not ku.get("dersler") else "") or ""
            if d["ekBilgi"]:
                notu = (notu + " " if notu else "") + "Slayt dışı: Ek bilgi (pandas dokümantasyonu)."
            ayrinti.append(f"| {u['no']}. {u['baslik']} | {d['baslik']} (`{d['id']}`) | {slayt_yazisi(d['slayt'])} | {ku['baslik']} | {AD[k]} | {notu} |")
            if k == "belirsiz":
                belirsizler.append(f"- **{u['no']}. {u['baslik']} → {d['baslik']}** (slayt {slayt_yazisi(d['slayt'])}): {notu}")
            slaytlar = range(d["slayt"][0], d["slayt"][-1] + 1) if d["slayt"] else []
            ici_slayt = 0
            for n in slaytlar:
                ks = (kd.get("slaytlar") or {}).get(str(n))
                kk = ks["kapsam"] if ks else k
                if ks and ks["kapsam"] != k:
                    ayrinti.append(f"| ↳ | slayt {n} | {n} | {ku['baslik']} | {AD[ks['kapsam']]} | {ks.get('not', '')} |")
                    if ks["kapsam"] == "belirsiz":
                        belirsizler.append(f"- **{u['no']}. {u['baslik']} → slayt {n}**: {ks.get('not', '')}")
                ici_slayt += kk == "ici"
            if k == "ici":
                ozet[ku["baslik"]]["dersler"].append(f"{u['no']}. {u['baslik']} · {d['baslik']} ({slayt_yazisi(d['slayt'])})")
            ozet[ku["baslik"]]["slayt"] += ici_slayt
    for b, adi in kapsam["basliklar"].items():
        ders = ozet[b]["dersler"]
        kisa = "<br>".join(ders) if len(ders) <= 8 else "<br>".join(ders[:6]) + f"<br>… ve {len(ders) - 6} ders daha (ayrıntı tablosunda)"
        satir.append(f"| **{b}** {adi} | {kisa or '—'} | {ozet[b]['slayt']} |")
    satir += ayrinti
    satir += ["", "## Belirsiz işaretlenenler (karar bekliyor)", "",
              "Bunlar kendiliğinden kapsam dışı bırakılmadı: arayüzde \"Ara sınav?\" rozetiyle gösterilir, \"Sadece ara sınav konuları\" filtresinde görünür kalır, "
              "deneme sınavına ise alınmaz (yalnızca kapsam içi). Karar verilince `static/sinav-kapsam.json`'da `ici` ya da `disi` yapılmalı.", ""] + belirsizler
    satir += ["", "## Eksik içerik (slaytta yok, sınavda var)", "",
              "| İçerik | Durum | Nerede |", "|---|---|---|",
              "| 1.1 What is Data Science | Eklendi (slayt dışı, \"Moodle'la karşılaştır\" uyarılı) | `static/mufredat/00b-veri-bilimi.js` → Bölüm 0 (3 ders) |",
              "| Pandas: tekrarlı satırlar ve tutarsızlıklar | Eklendi (\"Ek bilgi (pandas dokümantasyonu)\" etiketli) | Pandas bölümü → \"Veri temizleme: tekrarlar ve tutarsızlıklar\" (`pd-temizlik`) |",
              "| Homework 1 | Eklendi (ödev metni `content/odev1.md`; kavrayış notları, çözüm notebook'u değil) | `static/mufredat/16-odev1.js` → Bölüm 16 (5 görev) · "
              "deneme soruları `ara_sinav.py` (başlık HW1, `kaynak: odev1-task1…5`) · Claude'un notları → \"Ödev 1 – Kavrayış özeti\" |"]
    for b in kapsam.get("bekleyen", []):
        satir.append(f"| {b['ad']} | **Bekleniyor** | `{b['dosya']}` · {b['not']} |")
    return "\n".join(satir) + "\n"


if __name__ == "__main__":
    metin = rapor()
    if "--kontrol" in sys.argv:
        guncel = HEDEF.exists() and HEDEF.read_text(encoding="utf-8") == metin
        print("SINAV_KAPSAM.md " + ("güncel" if guncel else "GÜNCEL DEĞİL (python3 kapsam_raporu.py çalıştır)"))
        sys.exit(0 if guncel else 1)
    HEDEF.write_text(metin, encoding="utf-8")
    print(f"{HEDEF.name} yazıldı")
