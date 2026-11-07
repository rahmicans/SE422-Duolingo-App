"""UI özelliklerinin testleri: süre formülü, notlar API'si, PDF üretimi, özetler.

Çalıştırmak için (node gerekir):
    .venv/bin/python testler_ozellikler.py
"""

import json
import os
import subprocess
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

KLASOR = Path(__file__).resolve().parent
sys.path.insert(0, str(KLASOR))

hatalar = []


def hata(mesaj):
    hatalar.append(mesaj)


def kontrol(kosul, mesaj):
    if not kosul:
        hata(mesaj)


# ============================ Faz 1: süre formülü ============================

SURE_BETIGI = r"""
const S = require(process.argv[1] + "/static/sure.js");
const fs = require("fs");
const html = fs.readFileSync(process.argv[1] + "/static/index.html", "utf8");
const dosyalar = [...html.matchAll(/src="\/static\/mufredat\/([^"]+)"/g)].map((m) => process.argv[1] + "/static/mufredat/" + m[1]);
eval(dosyalar.map((f) => fs.readFileSync(f, "utf8")).join("\n") + ";globalThis.U = UNITELER;");
const tumTamam = {};
for (const u of U) { for (const d of u.dersler) tumTamam[d.id] = true; tumTamam[u.id + "-tekrar"] = true; }
const yarim = {};
U[0].dersler.forEach((d, i) => { if (i < 2) yarim[d.id] = true; });
const ilk = U[0];
const sonuc = {
  uniteler: U.map((u) => { const t = S.unite(u); return { id: u.id, toplam: t.toplam, dersToplami: Object.values(t.dersler).reduce((a, b) => a + b, 0), tekrar: t.tekrar,
    dersler: u.dersler.map((d) => S.ders(d)) }; }),
  sinav: S.K.sinav,
  bos: S.kalan(U, {}, false, null),
  hepsi: S.kalan(U, tumTamam, true, null),
  hepsiSinavYok: S.kalan(U, tumTamam, false, null),
  yarim: S.kalan(U, yarim, false, null).bolumler[ilk.id],
  ilkToplam: S.unite(ilk).toplam, ilkIkiDers: S.ders(ilk.dersler[0]) + S.ders(ilk.dersler[1]),
  katsayi: S.kalan(U, {}, false, 2).toplam,
  hiz: [
    S.hizKatsayisi([{ tahminDk: 10, gercekSn: 1200 }, { tahminDk: 10, gercekSn: 1200 }]),
    S.hizKatsayisi([{ tahminDk: 10, gercekSn: 900 }, { tahminDk: 10, gercekSn: 900 }, { tahminDk: 10, gercekSn: 900 }]),
    S.hizKatsayisi([{ tahminDk: 10, gercekSn: 10 }, { tahminDk: 10, gercekSn: 10 }, { tahminDk: 10, gercekSn: 10 }]),
    S.hizKatsayisi([{ tahminDk: 1, gercekSn: 6000 }, { tahminDk: 1, gercekSn: 6000 }, { tahminDk: 1, gercekSn: 6000 }]),
  ],
  adim: [S.adimSuresi({ tip: "kod" }), S.adimSuresi({ tip: "dogruyanlis" }), S.adimSuresi({ tip: "secmeli", cikti: true }),
         S.adimSuresi({ tip: "secmeli" }), S.adimSuresi({ tip: "ogren" }), S.adimSuresi({ tip: "ogren", kod: "x" })],
  yazi: [S.yazi(27), S.yazi(47), S.yazi(380), S.yazi(60), S.yazi(0), S.yazi(33), S.saniyeYazisi(45)],
};
process.stdout.write(JSON.stringify(sonuc));
"""


def sure_testleri():
    r = subprocess.run(["node", "-e", SURE_BETIGI, str(KLASOR)], capture_output=True, text=True)
    if r.returncode:
        hata(f"Süre: node hatası {r.stderr[-400:]}")
        return
    s = json.loads(r.stdout)
    for u in s["uniteler"]:
        kontrol(u["toplam"] > 0 and all(d > 0 for d in u["dersler"]), f"Süre: {u['id']} için sıfır tahmin")
        kontrol(abs(u["toplam"] - (u["dersToplami"] + u["tekrar"])) < 1e-9, f"Süre: {u['id']} toplamı ders + tekrar değil")
    genel = sum(u["toplam"] for u in s["uniteler"]) + s["sinav"]
    kontrol(abs(s["bos"]["toplam"] - genel) < 1e-6, "Süre: hiçbir şey bitmemişken kalan = tüm bölümler + sınav olmalı")
    kontrol(s["hepsi"]["toplam"] == 0, "Süre: her şey bitince kalan 0 olmalı")
    kontrol(abs(s["hepsiSinavYok"]["toplam"] - s["sinav"]) < 1e-9, "Süre: yalnızca sınav kalınca kalan = sınav süresi")
    kontrol(abs(s["yarim"] - (s["ilkToplam"] - s["ilkIkiDers"])) < 1e-9, "Süre: yarım bölümün kalanı, bitmemiş derslerin toplamı olmalı")
    kontrol(abs(s["katsayi"] - 2 * genel) < 1e-6, "Süre: hız katsayısı kalan süreyi ölçeklemeli")
    kontrol(s["hiz"][0] is None, "Süre: 3'ten az derste kişisel katsayı hesaplanmamalı")
    kontrol(abs((s["hiz"][1] or 0) - 1.5) < 1e-9, f"Süre: 3 × 15 dk / 3 × 10 dk → 1.5 olmalı, {s['hiz'][1]}")
    kontrol(s["hiz"][2] is None, "Süre: 30 sn altı ölçümler sayılmamalı")
    kontrol(s["hiz"][3] == 3, "Süre: katsayı üst sınırla (3) kırpılmalı")
    kontrol(s["adim"] == [8, 0.4, 1.0, 0.6, 0.5, 1.5], f"Süre: adım ağırlıkları beklenmedik {s['adim']}")
    kontrol(s["yazi"] == ["27 dk", "45 dk", "6 sa 20 dk", "1 sa", "0 dk", "35 dk", "45 sn"], f"Süre: biçimlendirme {s['yazi']}")
    print(f"Süre: {len(s['uniteler'])} bölümün tahmini, kalan süre, kişisel katsayı ve biçimlendirme test edildi "
          f"(toplam ≈ {round(genel)} dk)")


# ============================ Faz 2: terminal ============================

def terminal_testleri():
    calistirici = str(KLASOR / "calistirici.py")
    istekler = [{"kod": "x = 5\nprint(x)\nimport sys\nprint('uyari', file=sys.stderr)\nx * 2"},
                {"kod": "def f(n):\n    return 1 / n\nf(0)"},
                {"kod": "if x > 3\n    print(x)"},
                {"kod": "print(pd.Series([1, 2]).sum(), np.arange(3).sum())"}]
    r = subprocess.run([sys.executable, calistirici, "repl"], input="\n".join(json.dumps(i) for i in istekler) + "\n",
                       capture_output=True, text=True, timeout=60)
    s = [json.loads(l) for l in r.stdout.splitlines()]
    kontrol(s[0]["cikti"] == "5\n10\n" and s[0]["stderr"] == "uyari\n" and s[0]["hata"] is None, f"Terminal: stdout/stderr ayrımı {s[0]}")
    kontrol(s[1]["hata_tipi"] == "ZeroDivisionError" and s[1]["satir"] == 2, f"Terminal: hata satırı fonksiyon içindeki satır olmalı {s[1].get('satir')}")
    kontrol(s[2]["hata_tipi"] == "SyntaxError" and s[2]["satir"] == 1, "Terminal: SyntaxError satırı")
    kontrol(s[3]["cikti"] == "3 3\n", "Terminal: np ve pd hazır yüklü olmalı")
    kontrol(all(isinstance(x.get("sure"), float) for x in s), "Terminal: çalışma süresi alanı")

    # Durdur: sonsuz döngü kilit beklenmeden kesilir, ardından oturum yeniden çalışır
    import app
    term = app.Terminal()
    sonuc = {}
    is_parcacigi = threading.Thread(target=lambda: sonuc.update(term.gonder({"kod": "while True:\n    pass"})))
    is_parcacigi.start()
    time.sleep(1.5)
    d = term.durdur()
    is_parcacigi.join(5)
    kontrol(d == {"durduruldu": True} and sonuc.get("durduruldu"), f"Terminal: durdur çalışmadı {d} {sonuc}")
    kontrol(term.gonder({"kod": "print('yeniden')"})["cikti"] == "yeniden\n", "Terminal: durdurduktan sonra yeniden çalışmalı")
    kontrol(term.durdur() == {"durduruldu": False}, "Terminal: boştayken durdur bir şey yapmamalı")
    term._durdur()

    # Hata açıklamaları: istenen tüm yaygın hata türleri için Türkçe açıklama
    betik = ("const { hataAciklamasi } = require(process.argv[1]);"
             "const t = ['SyntaxError','NameError','TypeError','IndexError','KeyError','IndentationError','ZeroDivisionError','ModuleNotFoundError','ValueError','AttributeError'];"
             "process.stdout.write(JSON.stringify(t.map((x) => [x, hataAciklamasi(x, x === 'NameError' ? \"name 'math' is not defined\" : '')])));")
    r = subprocess.run(["node", "-e", betik, str(KLASOR / "static" / "editor.js")], capture_output=True, text=True)
    aciklamalar = json.loads(r.stdout) if r.returncode == 0 else []
    eksik = [t for t, a in aciklamalar if not a]
    kontrol(aciklamalar and not eksik, f"Terminal: açıklaması olmayan hata türleri {eksik or r.stderr[-200:]}")
    kontrol(any("import math" in (a or "") for t, a in aciklamalar if t == "NameError"), "Terminal: modül adı için import önerisi")
    print(f"Terminal: stdout/stderr, hata satırı, süre, durdurma ve {len(aciklamalar)} hata türünün Türkçe açıklaması test edildi")


# ============================ Faz 3: notlar API'si ============================

def _sunucu_baslat():
    """app.Handler'ı geçici not klasörüyle rastgele bir portta başlatır."""
    import app
    from http.server import ThreadingHTTPServer
    sunucu = ThreadingHTTPServer(("127.0.0.1", 0), app.Handler)
    threading.Thread(target=sunucu.serve_forever, daemon=True).start()
    return sunucu, f"http://127.0.0.1:{sunucu.server_address[1]}"


def _istek(url, veri=None):
    govde = None if veri is None else json.dumps(veri).encode()
    r = urllib.request.urlopen(urllib.request.Request(url, govde, {"Content-Type": "application/json"}), timeout=60)
    icerik = r.read()
    return (json.loads(icerik) if r.headers.get("Content-Type", "").startswith("application/json") else icerik), r.headers


def not_testleri():
    import app
    sunucu, url = _sunucu_baslat()
    try:
        bos, _ = _istek(url + "/api/notlar")
        kontrol(bos == {"surum": 1, "notlar": {}}, f"Notlar: başlangıçta boş olmalı {bos}")
        not1 = {"anahtar": "u-pd|13", "unite": "u-pd", "slayt": 13, "slaytYazisi": "Slayt 13", "baslik": "info()",
                "metin": "# Başlık\n**çğıİöşü** notu", "guncellendi": 1000}
        r, _ = _istek(url + "/api/notlar", not1)
        kontrol(r.get("tamam"), f"Notlar: kaydedilemedi {r}")
        okunan, _ = _istek(url + "/api/notlar")
        kontrol(okunan["notlar"]["u-pd|13"]["metin"] == not1["metin"], "Notlar: kaydedilen not geri okunamadı (Türkçe karakter)")
        kontrol(json.loads(app.NOTLAR_DOSYASI.read_text(encoding="utf-8"))["notlar"]["u-pd|13"]["baslik"] == "info()",
                "Notlar: veri/notlar.json dosyasına yazılmadı")
        kontrol(not list(app.VERI.glob("*.tmp")), "Notlar: geçici dosya artığı kaldı (atomik yazma)")
        eski, _ = _istek(url + "/api/notlar", {**not1, "metin": "eski sürüm", "guncellendi": 500})
        kontrol(eski.get("eski") and eski["not"]["metin"] == not1["metin"], "Notlar: eski zaman damgalı kayıt yeniyi ezmemeli")
        _istek(url + "/api/notlar", {**not1, "metin": "", "guncellendi": 2000})
        kontrol("u-pd|13" not in _istek(url + "/api/notlar")[0]["notlar"], "Notlar: boş metin notu silmeli")
        ice, _ = _istek(url + "/api/notlar/ice-aktar", {"notlar": {
            "u-np1|4": {"unite": "u-np1", "slayt": 4, "baslik": "ndarray", "metin": "içe aktarılan", "guncellendi": 10},
            "bozuk": "metin değil"}})
        kontrol(ice.get("eklenen") == 1 and ice.get("atlanan") == 1, f"Notlar: içe aktarma sayıları {ice}")
        kontrol(not _istek(url + "/api/notlar", {"anahtar": "", "metin": "x"})[0].get("tamam"), "Notlar: geçersiz anahtar reddedilmeli")
        # Sunucu yeniden başlasa da (yeni süreç) not dosyadan okunur
        r = subprocess.run([sys.executable, "-c", "import app, json; print(json.dumps(app.notlari_oku()))"], cwd=KLASOR,
                           capture_output=True, text=True, env={**os.environ})
        kontrol("u-np1|4" in r.stdout, "Notlar: yeni süreçte dosyadan okunamadı")
        # Bozuk dosya: kenara alınır, sunucu çökmez
        app.NOTLAR_DOSYASI.write_text("{bozuk", encoding="utf-8")
        kontrol(_istek(url + "/api/notlar")[0]["notlar"] == {} and list(app.VERI.glob("notlar.bozuk-*.json")),
                "Notlar: bozuk dosya kenara alınmalı")
    finally:
        sunucu.shutdown()
    print("Notlar API: kaydet, oku, eski sürüm koruması, silme, içe aktarma, atomik yazma, yeniden başlatma ve bozuk dosya test edildi")


# ============================ Faz 4: not PDF'leri ============================

TURKCE = "çğıİöşüÇĞÖŞÜ"


def pdf_metni(veri):
    import io
    import pypdf
    r = pypdf.PdfReader(io.BytesIO(veri))
    return r, "\n".join(s.extract_text() for s in r.pages)


def pdf_testleri():
    import pdf_uret
    uniteler = [{"id": "u-a", "no": 1, "baslik": "Python Temelleri", "kaynak": "Week2_1"},
                {"id": "u-b", "no": 2, "baslik": "Karar ve Döngü Yapıları", "kaynak": "week3"},
                {"id": "u-c", "no": 3, "baslik": "Pandas", "kaynak": "Pandas"}]
    uzun = "print(" + ", ".join(f"'değer{i}'" for i in range(40)) + ")"
    notlar = {
        "u-a|9": {"unite": "u-a", "slayt": 9, "slaytYazisi": "Slayt 9–10", "baslik": "String'ler", "guncellendi": 1,
                  "metin": f"# Özet\n**Kalın** ve *italik* ve `kod`. {TURKCE}\n- madde bir\n- madde iki\n```python\n{uzun}\n```"},
        "u-c|13": {"unite": "u-c", "slayt": 13, "slaytYazisi": "Slayt 13", "baslik": "info()", "metin": "Şimdi ığüşöç", "guncellendi": 2},
    }
    sunucu, url = _sunucu_baslat()
    try:
        veri, basliklar = _istek(url + "/api/pdf/notlar", {"tur": "bolum", "unite": "u-a", "uniteler": uniteler, "notlar": notlar})
        kontrol(basliklar["Content-Type"] == "application/pdf" and veri.startswith(b"%PDF"), "PDF: bölüm PDF'i dönmedi")
        r, metin = pdf_metni(veri)
        kontrol(TURKCE in metin and "Slayt 9–10 · String'ler" in metin and "Bölüm 1: Python Temelleri" in metin,
                "PDF: bölüm PDF'inde Türkçe karakterler/başlıklar metinde yok")
        kontrol("madde bir" in metin and "Kalın" in metin, "PDF: Markdown içeriği eksik")
        kontrol("'değer39'" in metin.replace("\n", "").replace("↪ ", ""), "PDF: uzun kod satırı kaydırılırken içerik kayboldu")
        kontrol(r.metadata.title == "Notlarım · Bölüm 1: Python Temelleri", f"PDF: başlık üst verisi {r.metadata.title}")
        kontrol(r.pages[0]["/Resources"]["/Font"], "PDF: font yok")

        tam, _ = _istek(url + "/api/pdf/notlar", {"tur": "kitapcik", "uniteler": uniteler, "notlar": notlar, "bosBolumler": "goster", "tamamlandi": True})
        atla, _ = _istek(url + "/api/pdf/notlar", {"tur": "kitapcik", "uniteler": uniteler, "notlar": notlar, "bosBolumler": "atla"})
        rt, mt = pdf_metni(tam)
        ra, ma = pdf_metni(atla)
        kontrol("İçindekiler" in mt and "Tüm notlarım" in mt and "Sayfa 3" in mt, "PDF: kitapçıkta kapak/içindekiler/sayfa numarası yok")
        kontrol("Bu bölümde not yok" in mt and "Karar ve Döngü" in mt, "PDF: 'goster' ayarında notsuz bölüm yazılmalı")
        kontrol("Bu bölümde not yok" not in ma and "Şimdiye kadarki notlar" in ma, "PDF: 'atla' ayarında notsuz bölüm atlanmalı")
        kontrol(len(rt.pages) > len(ra.pages), "PDF: atla ayarı sayfa sayısını azaltmalı")
        yer_imleri = [o.title for o in rt.outline if not isinstance(o, list)]
        kontrol(yer_imleri == ["Bölüm 1: Python Temelleri", "Bölüm 2: Karar ve Döngü Yapıları", "Bölüm 3: Pandas"],
                f"PDF: yer imleri (bookmark) {yer_imleri}")
        try:
            _istek(url + "/api/pdf/notlar", {"tur": "yok"})
            hata("PDF: geçersiz tür hata vermeli")
        except urllib.error.HTTPError as e:
            kontrol(e.code == 500, "PDF: geçersiz tür 500 dönmeli")
    finally:
        sunucu.shutdown()
    # Kod satırı kaydırma: hiçbir parça sınırı aşmamalı, birleşince orijinal satır geri gelmeli
    parcalar = pdf_uret.satir_kaydir(uzun, 60)
    kontrol(all(len(x) <= 60 for x in parcalar) and "".join(x.replace("↪ ", "", 1) if i else x for i, x in enumerate(parcalar)) == uzun,
            "PDF: satir_kaydir hatalı")
    print(f"PDF: bölüm notu ve kitapçık (kapak, içindekiler, yer imleri, sayfa no, atla/göster) üretildi, pypdf ile açıldı, "
          f"Türkçe metin doğrulandı ({len(rt.pages)} sayfa)")


# ============================ Faz 5: bölüm özetleri ============================

BOLUMLER = ["## Bölümün amacı", "## Konu anlatımı", "## Sık yapılan hatalar", "## Kısa tekrar soruları", "## Cevaplar"]


def ozet_testleri():
    import re
    import pypdf
    import ozet_pdf_uret as O
    r = subprocess.run(["node", "-e", "const fs=require('fs');const h=fs.readFileSync(process.argv[1]+'/static/index.html','utf8');"
                        "const d=[...h.matchAll(/src=\"\\/static\\/mufredat\\/([^\"]+)\"/g)].map(m=>process.argv[1]+'/static/mufredat/'+m[1]);"
                        "eval(d.map(f=>fs.readFileSync(f,'utf8')).join('\\n')+';process.stdout.write(JSON.stringify(UNITELER.filter(u=>u.no===undefined).map(u=>u.id)))')", str(KLASOR)],
                       capture_output=True, text=True)
    unite_idleri = json.loads(r.stdout)
    dosyalar = O.ozet_dosyalari()
    kontrol(len(dosyalar) == len(unite_idleri), f"Özet: {len(unite_idleri)} bölüm var ama {len(dosyalar)} özet dosyası")
    liste = json.loads((O.HEDEF / "liste.json").read_text(encoding="utf-8"))
    kod_sayisi = 0
    for no, dosya in enumerate(dosyalar, 1):
        md = dosya.read_text(encoding="utf-8")
        bilgi, govde = O.on_bolum(md)
        kontrol(int(dosya.name[:2]) == no and bilgi.get("unite") == unite_idleri[no - 1],
                f"Özet: {dosya.name} sırası/ünitesi müfredatla uyuşmuyor ({bilgi.get('unite')})")
        eksik = [b for b in BOLUMLER if b not in govde]
        kontrol(not eksik, f"Özet: {dosya.name} eksik bölümler {eksik}")
        kontrol(re.search(r"\((Slayt|Task) \d", govde), f"Özet: {dosya.name} slayt numarası içermiyor")
        for ek in re.findall(r"^> \*\*Ek bilgi.*$", govde, re.M):
            kontrol("Kaynak:" in ek, f"Özet: {dosya.name} kaynaksız ek bilgi: {ek[:60]}")
        # Kod çıktıları gerçek çalıştırmayla aynı mı (dosyaya yazmadan)
        kontrol(O.ciktilari_yaz(md) == md, f"Özet: {dosya.name} kod çıktıları güncel değil (python3 ozet_pdf_uret.py çalıştır)")
        kod_sayisi += len(re.findall(r"^```python(?! calistirma)", md, re.M))
        pdf = O.HEDEF / (dosya.stem + ".pdf")
        kontrol(pdf.exists() and pdf.stat().st_mtime >= dosya.stat().st_mtime - 1, f"Özet: {pdf.name} yok ya da .md'den eski")
        if pdf.exists():
            okuyucu = pypdf.PdfReader(str(pdf))
            metin = "".join(s.extract_text() for s in okuyucu.pages[:4])
            kontrol("İçindekiler" in metin and bilgi["baslik"] in metin, f"Özet: {pdf.name} kapak/içindekiler eksik")
            kontrol(any(c in metin for c in "çğıöşü"), f"Özet: {pdf.name} Türkçe karakterler metinde yok")
            kontrol(okuyucu.outline and okuyucu.metadata.title.startswith(f"Bölüm {no}"), f"Özet: {pdf.name} yer imi/başlık eksik")
        kontrol(liste["uniteler"].get(bilgi["unite"], {}).get("dosya") == pdf.name, f"Özet: liste.json'da {bilgi['unite']} yok")
    birlesik = pypdf.PdfReader(str(O.HEDEF / liste["birlesik"]))
    ust = [o for o in birlesik.outline if not isinstance(o, list)]
    kontrol(len(ust) == len(dosyalar), f"Özet: birleşik PDF'te {len(ust)} bölüm yer imi var")
    print(f"Özetler: {len(dosyalar)} bölüm özeti (bölümleri, slayt atıfları, kaynaklı ek bilgiler), {kod_sayisi} kod bloğunun çıktısı "
          f"yeniden çalıştırılıp doğrulandı; {len(dosyalar)} PDF + birleşik PDF ({len(birlesik.pages)} sayfa) açıldı")


def claude_sekmesi_testleri():
    """Claude'un notları sekmesinin API'si ve ortak Markdown render'ı (static/md.js)."""
    sunucu, url = _sunucu_baslat()
    try:
        liste, _ = _istek(url + "/api/ozetler")
        beklenen = len(list((KLASOR / "ozetler").glob("*.md")))
        kontrol(len(liste["ozetler"]) == beklenen and liste["birlesik"], f"Claude: özet listesi eksik {len(liste['ozetler'])}")
        kontrol(all(o["pdf"] and o["unite"] for o in liste["ozetler"]), "Claude: her özetin PDF'i ve ünitesi olmalı")
        ozet, _ = _istek(url + "/api/ozetler/" + liste["ozetler"][-1]["ad"])
        kontrol(ozet["md"].startswith("# Bölüm ") and "unite:" not in ozet["md"][:200], "Claude: özet ön bölümsüz Markdown dönmeli")
        for kotu in ["../app", "%2e%2e%2fapp", "yok"]:
            try:
                _istek(url + "/api/ozetler/" + kotu)
                hata(f"Claude: '{kotu}' için 404 bekleniyordu")
            except urllib.error.HTTPError as e:
                kontrol(e.code == 404, f"Claude: '{kotu}' için {e.code}")
    finally:
        sunucu.shutdown()
    betik = ("global.pythonHtml = (k) => k; const { mdHtml } = require(process.argv[1]);"
             "process.stdout.write(mdHtml('# Başlık\\n| a | b |\\n|---|---|\\n| `x` | **y** |\\n```cikti\\n5\\n```\\n> **Ek bilgi:** z', { baslikKaydir: 0 }));")
    r = subprocess.run(["node", "-e", betik, str(KLASOR / "static" / "md.js")], capture_output=True, text=True)
    h = r.stdout
    kontrol("<h1>Başlık</h1>" in h and "<table" in h and "<code>x</code>" in h and "<b>y</b>" in h
            and 'md-blok cikti' in h and "md-ek-bilgi" in h, f"Claude: Markdown render'ı eksik {h[:200]} {r.stderr[-200:]}")
    print("Claude'un notları: özet listesi/içerik API'si, yol dışı ad koruması ve Markdown render'ı (tablo, kod, çıktı, ek bilgi) test edildi")


# ============================ Ara sınav ============================

def kapsam_testleri():
    """static/sinav-kapsam.json müfredatla tutarlı mı; SINAV_KAPSAM.md güncel mi?"""
    betik = r"""
const fs = require('fs'); const h = fs.readFileSync(process.argv[1] + '/static/index.html', 'utf8');
const d = [...h.matchAll(/src="\/static\/mufredat\/([^"]+)"/g)].map(m => process.argv[1] + '/static/mufredat/' + m[1]);
eval(d.map(f => fs.readFileSync(f, 'utf8')).join('\n') + ';globalThis.U = UNITELER');
process.stdout.write(JSON.stringify(U.map(u => ({ id: u.id, no: u.no, dersler: u.dersler.map(x => ({ id: x.id, slayt: x.slayt || null })) }))));"""
    r = subprocess.run(["node", "-e", betik, str(KLASOR)], capture_output=True, text=True, check=True)
    uniteler = json.loads(r.stdout)
    K = json.loads((KLASOR / "static" / "sinav-kapsam.json").read_text(encoding="utf-8"))
    gecerli = {"ici", "disi", "belirsiz"}
    for u in uniteler:
        ku = K["uniteler"].get(u["id"])
        kontrol(ku is not None, f"Kapsam: {u['id']} eşlenmemiş")
        if not ku:
            continue
        kontrol(ku["kapsam"] in gecerli and ku["baslik"] in K["basliklar"], f"Kapsam: {u['id']} geçersiz kapsam/başlık")
        dersler = {d["id"]: d for d in u["dersler"]}
        for did, kd in (ku.get("dersler") or {}).items():
            kontrol(did in dersler, f"Kapsam: {u['id']} içinde olmayan ders {did}")
            kontrol(kd.get("kapsam", "ici") in gecerli, f"Kapsam: {did} geçersiz kapsam")
            s = dersler.get(did, {}).get("slayt") or []
            for n, ks in (kd.get("slaytlar") or {}).items():
                kontrol(s and s[0] <= int(n) <= s[-1] and ks["kapsam"] in gecerli, f"Kapsam: {did} slayt {n} ders aralığında değil")
    kontrol(len({u["id"] for u in uniteler}) == len(K["uniteler"]), "Kapsam: JSON'da müfredatta olmayan bölüm var")
    sifir = [u["id"] for u in uniteler if u.get("no") == 0]
    kontrol(sifir == ["u-vb"], f"Kapsam: slayt dışı 'Veri bilimi' bölümü 0 numaralı olmalı {sifir}")
    r = subprocess.run([sys.executable, str(KLASOR / "kapsam_raporu.py"), "--kontrol"], capture_output=True, text=True)
    kontrol(r.returncode == 0, "Kapsam: SINAV_KAPSAM.md güncel değil (python3 kapsam_raporu.py)")
    print(f"Kapsam haritası: {len(uniteler)} bölüm eşlendi, ders/slayt istisnaları müfredatla tutarlı, SINAV_KAPSAM.md güncel")


def degerlendirme_testleri():
    """Boşluk doldurma toleransları ve tablo hücre puanlaması (static/degerlendir.js)."""
    betik = r"""
const D = require(process.argv[1]);
const kodB = { kod: true, metin: 'df.___(subset=[___])', bosluklar: [['drop_duplicates'], ["'ad'"]] };
const cumle = { kod: false, metin: 'input() her zaman ___ döndürür; ___ hatası', bosluklar: [['str', 'string'], ['KeyError']] };
const tablo = { satirlar: [['a', { cevaplar: ['3.0'], sayisal: true }, { cevaplar: ["'VERI'", 'VERI'], kod: true }], ['b', { cevaplar: ['Evet'] }, 'x']] };
const sonuc = {
  kodBosluk: D.bosluk(kodB, [' drop_duplicates ', '"ad"']).dogru,
  kodBoslukParantez: D.esit('df.dropna( )', ['df.dropna()'], { kod: true }),
  kodHarfDuyarli: D.bosluk(kodB, ['Drop_Duplicates', "'ad'"]).puan,
  cumleHarfsiz: D.bosluk(cumle, ['STR.', 'keyerror']).dogru,
  cumleAlternatif: D.bosluk(cumle, ['string', 'KeyError']).dogru,
  cumleKismi: D.bosluk(cumle, ['str', 'IndexError']).puan,
  bos: D.bosluk(cumle, ['', '  ']).puan,
  tabloTam: D.tablo(tablo, ['3', 'VERI', 'evet']).puan,
  tabloKismi: D.tablo(tablo, ['3', "'veri'", 'Evet']),
  tabloBosSayisi: D.bosHucreler(tablo).length,
  sayisalDegil: D.esit('3', ['3.0']),
  tekKarakter: D.esit('!', ['!']),
};
process.stdout.write(JSON.stringify(sonuc));"""
    r = subprocess.run(["node", "-e", betik, str(KLASOR / "static" / "degerlendir.js")], capture_output=True, text=True)
    if r.returncode:
        hata(f"Değerlendirme: node hatası {r.stderr[-300:]}")
        return
    s = json.loads(r.stdout)
    kontrol(s["kodBosluk"] and s["kodBoslukParantez"], "Değerlendirme: kodda boşluk/tırnak toleransı çalışmıyor")
    kontrol(s["kodHarfDuyarli"] == 0.5, "Değerlendirme: kod boşluğu büyük/küçük harfe duyarlı olmalı (Drop_Duplicates yanlış)")
    kontrol(s["cumleHarfsiz"] and s["cumleAlternatif"], "Değerlendirme: cümle boşluğunda harf/nokta toleransı ya da alternatif cevap çalışmıyor")
    kontrol(s["cumleKismi"] == 0.5 and s["bos"] == 0, "Değerlendirme: kısmi/boş puan hatalı")
    kontrol(s["tabloTam"] == 1 and s["tabloBosSayisi"] == 3, "Değerlendirme: tablo tam puan/boş hücre sayısı hatalı")
    kontrol(abs(s["tabloKismi"]["puan"] - 2 / 3) < 1e-9 and s["tabloKismi"]["dogrular"] == [True, False, True] and not s["tabloKismi"]["dogru"],
            f"Değerlendirme: tablo hücre puanlaması hatalı {s['tabloKismi']}")
    kontrol(not s["sayisalDegil"] and s["tekKarakter"], "Değerlendirme: sayısal olmayan hücrede 3 ≠ 3.0, '!' cevabı kabul edilmeli")
    print("Değerlendirme: boşlukta harf/boşluk/tırnak/nokta toleransları, kodda harf duyarlılığı, tabloda hücre bazında kısmi puan test edildi")


def ara_sinav_testleri():
    """Her soru üreticisinin referans cevabı gerçek çalıştırmayla doğrulanır; API istenen sayıda soru döndürür."""
    r = subprocess.run([sys.executable, str(KLASOR / "ara_sinav_kontrol.py")], capture_output=True, text=True, timeout=600)
    kontrol(r.returncode == 0, "Ara sınav: kontrol betiği başarısız:\n" + r.stdout[-1500:] + r.stderr[-500:])
    ozet = next((l for l in r.stdout.splitlines() if l.startswith("Ara sınav kontrolü")), "")
    import ara_sinav_kontrol
    konular = ara_sinav_kontrol.kapsam_ici_dersler()
    sunucu, url = _sunucu_baslat()
    try:
        y, _ = _istek(url + "/api/ara-sinav", {"adet": 12, "agirliklar": {"1.1": 1, "1.2": 1, "1.3": 1, "1.4": 1, "1.5": 1}, "konular": konular})
    finally:
        sunucu.shutdown()
    s = y.get("sorular", [])
    kontrol(len(s) == 12 and {q["tip"] for q in s} == {"secmeli", "boslukyaz", "tablo"}, f"Ara sınav API: {len(s)} soru, tipler {[q['tip'] for q in s]}")
    kontrol({q["baslik"] for q in s} == {"1.1", "1.2", "1.3", "1.4", "1.5"}, "Ara sınav API: her başlıktan soru olmalı")
    kontrol(all(q["konu"] in konular for q in s), "Ara sınav API: kapsam dışı ders sorusu geldi")
    print(f"Ara sınav: {ozet.replace('Ara sınav kontrolü: ', '')}; API 12 soruluk deneme üretti (3 tip, 5 başlık)")


# ============================ İlerleme kaydı: göç ve birleştirme ============================

GOC_BETIGI = r"""
const fs = require("fs");
const kok = process.argv[1];
const html = fs.readFileSync(kok + "/static/index.html", "utf8");
const dosyalar = [...html.matchAll(/src="\/static\/mufredat\/([^"]+)"/g)].map((m) => kok + "/static/mufredat/" + m[1]);
eval(dosyalar.map((f) => fs.readFileSync(f, "utf8")).join("\n") + ";globalThis.UNITELER = UNITELER;");
const KAYIT = require(kok + "/static/kayit.js");
const U = globalThis.UNITELER;
const ders = U.flatMap((u) => u.dersler).find((d) => d.adimlar.filter((a) => a.tip !== "ogren").length >= 2);
const sorular = ders.adimlar.map((a, i) => [a, i]).filter(([a]) => a.tip !== "ogren").map(([, i]) => `${ders.id}#${i}`);
// v1 kaydı: sürüm alanı ve yeni alanlar yok
const v1 = { tamamlanan: { [ders.id]: true, "u-temel-tekrar": true, "eski-ders": true }, xp: 120, gunluk: { "2026-11-01": 40 },
  ogeler: { [sorular[0]]: { kutu: 2, gorulme: 3, son: 5 } }, sinavlar: [{ tarih: 1, puan: 8, toplam: 10, gecti: true }],
  konular: { [ders.id]: { d: 4, y: 1, son: [true], hatalar: [] } }, kodlar: { "dizi-olustur": "x = 1" }, tema: "koyu" };
const g1 = KAYIT.gocEt(v1);
// İkinci açılış: aynı kayıt tekrar göç etmemeli
const g2 = KAYIT.gocEt(g1.veri);
// ID eşlemesi: ders id'si değişirse tamamlanan, süre, barem ve soru kayıtları taşınır
KAYIT.ID_ESLESME["eski-ders"] = ders.id + "-yeni";
const g3 = KAYIT.gocEt({ schemaVersion: 2, tamamlanan: { "eski-ders": true }, ogeler: { "eski-ders#3": { kutu: 1, gorulme: 1, son: 1 } } });
delete KAYIT.ID_ESLESME["eski-ders"];
// Soru sırası kayması: kayıttaki imza başka bir sıradaki soruya aitse ustalık oraya taşınır
const imzalar = KAYIT.soruImzalari(U);
const kayan = KAYIT.gocEt({ schemaVersion: 2, ogeler: { [sorular[0]]: { kutu: 4, gorulme: 9, son: 9 }, [sorular[1]]: { kutu: 1, gorulme: 1, son: 1 } },
  ogeImza: { [sorular[0]]: imzalar[sorular[1]], [sorular[1]]: imzalar[sorular[0]] } });
// Yeni bölüm: bilinen listesinde olmayan bölüm boş ilerlemeyle eklenir
const yeni = KAYIT.gocEt({ ...g1.veri, bilinenBolumler: g1.veri.bilinenBolumler.slice(0, -1) });
console.log(JSON.stringify({ g1: g1.veri, g1degisti: g1.degisti, g1rapor: g1.rapor, g2degisti: g2.degisti, g3: g3.veri, ders: ders.id,
  sorular, kayan: kayan.veri.ogeler, yeniBolumler: yeni.yeniBolumler, sonBolum: U.at(-1).id, bolumSayisi: U.length }));
"""


def ilerleme_testleri():
    r = subprocess.run(["node", "-e", GOC_BETIGI, str(KLASOR)], capture_output=True, text=True)
    if r.returncode != 0:
        hata(f"İlerleme göçü: betik çalışmadı {r.stderr[-400:]}")
        return
    s = json.loads(r.stdout)
    v, d, q = s["g1"], s["ders"], s["sorular"]
    kontrol(v["schemaVersion"] == 2 and s["g1degisti"], "Göç: v1 kaydı v2'ye yükseltilmeli")
    kontrol(v["tamamlanan"] == {d: True, "u-temel-tekrar": True, "eski-ders": True}, f"Göç: tamamlananlar korunmalı {v['tamamlanan']}")
    kontrol(v["xp"] == 120 and v["gunluk"] == {"2026-11-01": 40} and len(v["sinavlar"]) == 1 and v["tema"] == "koyu",
            "Göç: XP, seri, sınavlar ve ayarlar korunmalı")
    kontrol(v["ogeler"][q[0]]["kutu"] == 2 and v["ogeImza"].get(q[0]), "Göç: soru ustalığı korunmalı ve imza eklenmeli")
    kontrol(v["konular"][d]["d"] == 4 and v["kodlar"] == {"dizi-olustur": "x = 1"}, "Göç: barem ve kodlar korunmalı")
    kontrol(v["araSinavlar"] == [] and len(v["bilinenBolumler"]) == s["bolumSayisi"], "Göç: yeni alanlar ve bölüm listesi eklenmeli")
    kontrol(not s["g2degisti"], "Göç: güncel kayıt ikinci açılışta tekrar göç etmemeli")
    kontrol(s["g3"]["tamamlanan"] == {d + "-yeni": True} and d + "-yeni#3" in s["g3"]["ogeler"], f"Göç: ID eşlemesi {s['g3']}")
    kontrol(s["kayan"][q[1]]["kutu"] == 4 and s["kayan"][q[0]]["kutu"] == 1, f"Göç: kayan soru sırası imzayla eşlenmeli {s['kayan']}")
    kontrol(s["yeniBolumler"] == [s["sonBolum"]], f"Göç: yeni bölüm algılanmalı {s['yeniBolumler']}")

    import app
    sunucu, url = _sunucu_baslat()
    try:
        kontrol(_istek(url + "/api/ilerleme")[0] == {"var": False, "ilerleme": None}, "İlerleme: başlangıçta sunucu kopyası boş olmalı")
        a = {"schemaVersion": 2, "tamamlanan": {"x": True}, "xp": 50, "gunluk": {"g1": 10}, "ogeler": {"q": {"kutu": 2, "son": 10}},
             "sinavlar": [{"tarih": 1, "puan": 5}], "oturumlar": [{"t": 1, "tur": "ders"}], "kodlar": {"k": "a"}, "tema": "acik",
             "konular": {"x": {"d": 5, "y": 0, "t": 1}}}
        b = {"schemaVersion": 2, "tamamlanan": {"y": True}, "xp": 30, "gunluk": {"g1": 4, "g2": 7}, "ogeler": {"q": {"kutu": 0, "son": 20}},
             "sinavlar": [{"tarih": 2, "puan": 7}], "oturumlar": [{"t": 1, "tur": "ders"}, {"t": 2, "tur": "sinav"}], "tema": "koyu",
             "konular": {"x": {"d": 1, "y": 0, "t": 9}}, "araSinavlar": [{"tarih": 3, "yuzde": 80}]}
        _istek(url + "/api/ilerleme", {"ilerleme": a})
        m = _istek(url + "/api/ilerleme", {"ilerleme": b, "geriDon": True})[0]["ilerleme"]
        kontrol(m["tamamlanan"] == {"x": True, "y": True} and m["xp"] == 50 and m["gunluk"] == {"g1": 10, "g2": 7},
                f"İlerleme: birleştirme tamamlananları/XP'yi kaybetmemeli {m}")
        kontrol(m["ogeler"]["q"]["son"] == 20 and m["konular"]["x"]["d"] == 5 and m["tema"] == "koyu" and m["kodlar"] == {"k": "a"},
                f"İlerleme: alan kuralları {m}")
        kontrol(len(m["sinavlar"]) == 2 and len(m["oturumlar"]) == 2 and m["araSinavlar"] == [{"tarih": 3, "yuzde": 80}],
                "İlerleme: sınav/deneme geçmişi birleşmeli")
        kontrol(json.loads(app.ILERLEME_DOSYASI.read_text(encoding="utf-8"))["tamamlanan"] == {"x": True, "y": True},
                "İlerleme: veri/ilerleme.json'a yazılmalı")
        kontrol(list(app.YEDEKLER.glob("ilerleme-gunluk-*.json")), "İlerleme: günlük yedek alınmalı")
        y = _istek(url + "/api/ilerleme/yedek", {"sebep": "goc-v1-v2", "tarih": "t", "ilerleme": {"xp": 1}})[0]
        kontrol(y.get("tamam") and (app.VERI / y["dosya"]).exists() and "goc-v1-v2" in y["dosya"], f"İlerleme: göç yedeği yazılmalı {y}")
        kontrol(not _istek(url + "/api/ilerleme", {"ilerleme": "bozuk"})[0]["tamam"], "İlerleme: geçersiz kayıt reddedilmeli")
        kontrol(not list(app.VERI.rglob("*.tmp")), "İlerleme: geçici dosya artığı kaldı")
    finally:
        sunucu.shutdown()
    print("İlerleme: v1→v2 göçü, ID eşlemesi, kayan soru sırası, yeni bölüm, sunucu birleştirmesi ve yedekler test edildi")


TESTLER = [sure_testleri, terminal_testleri, not_testleri, pdf_testleri, ozet_testleri, claude_sekmesi_testleri,
           kapsam_testleri, degerlendirme_testleri, ara_sinav_testleri, ilerleme_testleri]

if __name__ == "__main__":
    # Notlar gerçek veri/ klasörüne değil geçici klasöre yazılsın (app import edilmeden önce)
    os.environ["SE422_VERI"] = tempfile.mkdtemp(prefix="se422-veri-")
    for test in TESTLER:
        test()
    if hatalar:
        print(f"\n{len(hatalar)} HATA:")
        for h in hatalar:
            print(" -", h)
        sys.exit(1)
    print("\nTüm özellik testleri geçti ✓")
