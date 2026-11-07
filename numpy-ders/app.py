"""SE 422 Python & Veri Bilimi ders uygulaması — sunucu

Sadece Python standart kütüphanesi ile çalışır. Kodlar ise NumPy kurulu olan
.venv içindeki Python ile ayrı bir süreçte çalıştırılır.

Çalıştırmak için:
    python3 app.py
Sonra tarayıcıda http://127.0.0.1:8001 adresini açın (hep bu adresi kullanın).
"""

import json
import mimetypes
import os
import select
import subprocess
import sys
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import alistirmalar

PORT = int(os.environ.get("SE422_PORT", 8001))  # testler başka port verebilir
ADRES = f"http://127.0.0.1:{PORT}"  # tek standart adres (tarayıcı depolaması adrese bağlıdır)
ZAMAN_ASIMI = 10  # saniye
KLASOR = Path(__file__).resolve().parent
STATIC = KLASOR / "static"
CALISTIRICI = str(KLASOR / "calistirici.py")
SINAV = str(KLASOR / "sinav.py")
VARYANT = str(KLASOR / "varyant.py")
PDF_URET = str(KLASOR / "pdf_uret.py")
ARA_SINAV = str(KLASOR / "ara_sinav.py")

# Kullanıcı kodu (dosya örnekleri dahil) proje klasörünü kirletmesin diye geçici klasörde çalışır
CALISMA = Path(tempfile.gettempdir()) / "se422-calisma"
CALISMA.mkdir(exist_ok=True)

# Kişisel veriler (notlar). .gitignore'da; testler SE422_VERI ile geçici klasör verebilir
VERI = Path(os.environ.get("SE422_VERI", KLASOR / "veri"))
NOTLAR_DOSYASI = VERI / "notlar.json"
NOT_KILIDI = threading.Lock()
EN_UZUN_NOT = 200_000
# İlerlemenin sunucu kopyası ve yedekleri (asıl kayıt tarayıcıda; bkz. static/kayit.js)
ILERLEME_DOSYASI = VERI / "ilerleme.json"
YEDEKLER = VERI / "yedekler"
ILERLEME_KILIDI = threading.Lock()
GUNLUK_YEDEK_SAYISI = 14
EN_BUYUK_ISTEK = 20 * 1024 * 1024

# Claude'un bölüm özetleri: kaynak ozetler/NN-ad.md, PDF'ler static/ozetler/ (ozet_pdf_uret.py üretir)
OZETLER = KLASOR / "ozetler"
OZET_PDF = STATIC / "ozetler"

VENV_PYTHON = KLASOR / ".venv" / "bin" / "python"
PYTHON = str(VENV_PYTHON) if VENV_PYTHON.exists() else sys.executable


class Terminal:
    """Değişkenleri komutlar arasında koruyan kalıcı Python oturumu."""

    def __init__(self):
        self.kilit = threading.Lock()
        self.surec = None
        self.calisiyor = False
        self.durduruldu = False

    def _baslat(self):
        self.surec = subprocess.Popen(
            [PYTHON, CALISTIRICI, "repl"],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, bufsize=1, cwd=CALISMA,
        )

    def _durdur(self):
        if self.surec is not None:
            self.surec.kill()
            self.surec.wait()
            self.surec = None

    def gonder(self, istek):
        with self.kilit:
            if self.surec is None or self.surec.poll() is not None:
                self._baslat()
            self.durduruldu = False
            self.calisiyor = True
            try:
                self.surec.stdin.write(json.dumps(istek) + "\n")
                self.surec.stdin.flush()
                hazir, _, _ = select.select([self.surec.stdout], [], [], ZAMAN_ASIMI)
                satir = self.surec.stdout.readline() if hazir else ""
            finally:
                self.calisiyor = False
            if not satir:
                self._durdur()
                if self.durduruldu:
                    return {"cikti": "", "hata": "Çalıştırma durduruldu. Terminal yeniden başlatıldı, değişkenler silindi.",
                            "hata_tipi": "KeyboardInterrupt", "durduruldu": True}
                return {"cikti": "", "hata": f"Kod {ZAMAN_ASIMI} saniyede bitmedi (sonsuz döngü olabilir). "
                                             "Terminal yeniden başlatıldı, değişkenler silindi.", "hata_tipi": "Zaman aşımı"}
            return json.loads(satir)

    def durdur(self):
        """Çalışan kodu keser (kilidi beklemez; bekleyen gonder() çağrısı boş satır alıp döner)."""
        surec = self.surec
        if not self.calisiyor or surec is None:
            return {"durduruldu": False}
        self.durduruldu = True
        surec.kill()
        return {"durduruldu": True}


TERMINAL = Terminal()


def kontrol_et(kod, cozum, kontroller):
    istek = json.dumps({"kod": kod, "cozum": cozum, "kontroller": kontroller})
    try:
        sonuc = subprocess.run([PYTHON, CALISTIRICI, "kontrol"], input=istek,
                               capture_output=True, text=True, timeout=ZAMAN_ASIMI, cwd=CALISMA)
    except subprocess.TimeoutExpired:
        return {"hata": f"Kod {ZAMAN_ASIMI} saniyede bitmedi (sonsuz döngü olabilir).",
                "cikti": "", "beklenen_cikti": "", "kontroller": [], "basarili": False}
    if sonuc.returncode != 0:
        return {"hata": sonuc.stderr or "Kod çalıştırılamadı.",
                "cikti": "", "beklenen_cikti": "", "kontroller": [], "basarili": False}
    return json.loads(sonuc.stdout)


def sinav_uret(gorulen):
    sonuc = subprocess.run([PYTHON, SINAV], input=json.dumps({"gorulen": gorulen}),
                           capture_output=True, text=True, timeout=30, cwd=CALISMA)
    if sonuc.returncode != 0:
        return {"hata": sonuc.stderr or "Sınav oluşturulamadı."}
    return {"sorular": json.loads(sonuc.stdout)}


def ara_sinav_uret(istek):
    """Ara sınav denemesi (ara_sinav.py, .venv'de). konular: istemcinin kapsam haritasından hesapladığı {ders_id: "1.x"}."""
    konular = {k: v for k, v in (istek.get("konular") or {}).items() if isinstance(k, str) and isinstance(v, str)}
    girdi = {"adet": max(1, min(int(istek.get("adet", 30)), 80)), "agirliklar": istek.get("agirliklar") or {},
             "konular": konular, "gorulen": [g for g in istek.get("gorulen", []) if isinstance(g, str)][-4000:]}
    sonuc = subprocess.run([PYTHON, ARA_SINAV], input=json.dumps(girdi), capture_output=True, text=True, timeout=60, cwd=CALISMA)
    if sonuc.returncode != 0:
        return {"hata": sonuc.stderr[-800:] or "Deneme oluşturulamadı."}
    return {"sorular": json.loads(sonuc.stdout)}


def varyant_uret(konular, adet, gorulen):
    """Pekiştirme için aynı derslerden yeni (benzer) sorular üretir."""
    istek = json.dumps({"konular": konular, "adet": adet, "gorulen": gorulen})
    sonuc = subprocess.run([PYTHON, VARYANT], input=istek, capture_output=True, text=True, timeout=30, cwd=CALISMA)
    if sonuc.returncode != 0:
        return {"hata": sonuc.stderr or "Sorular üretilemedi."}
    return {"sorular": json.loads(sonuc.stdout)}


def not_pdf_uret(istek):
    """Not PDF'ini (.venv'deki reportlab ile) alt süreçte üretir; (pdf baytları, hata) döndürür."""
    if istek.get("tur") not in ("bolum", "kitapcik"):
        return None, "Geçersiz PDF türü."
    if not isinstance(istek.get("notlar"), dict):  # istemci göndermediyse sunucudaki notlar
        with NOT_KILIDI:
            istek["notlar"] = notlari_oku()["notlar"]
    try:
        sonuc = subprocess.run([PYTHON, PDF_URET, "notlar"], input=json.dumps(istek).encode(), capture_output=True, timeout=120)
    except subprocess.TimeoutExpired:
        return None, "PDF üretimi zaman aşımına uğradı."
    if sonuc.returncode != 0 or not sonuc.stdout.startswith(b"%PDF"):
        return None, sonuc.stderr.decode("utf-8", "replace")[-800:] or "PDF üretilemedi."
    return sonuc.stdout, None


# ---------------------------------------------------------------- Claude'un özetleri

def ozet_oku(dosya):
    """Ön bölümü (unite/baslik/kaynak) ve gövdeyi ayırır."""
    metin = dosya.read_text(encoding="utf-8")
    bilgi, govde = {}, metin
    if metin.startswith("---\n") and "\n---\n" in metin[4:]:
        on, govde = metin[4:].split("\n---\n", 1)
        for satir in on.splitlines():
            if ":" in satir:
                k, v = satir.split(":", 1)
                bilgi[k.strip()] = v.strip()
    return bilgi, govde.lstrip("\n")


def ozet_listesi():
    liste = []
    for dosya in sorted(OZETLER.glob("[0-9][0-9]-*.md")):
        bilgi, _ = ozet_oku(dosya)
        pdf = OZET_PDF / (dosya.stem + ".pdf")
        liste.append({"ad": dosya.stem, "no": int(dosya.name[:2]), "unite": bilgi.get("unite", ""),
                      "baslik": bilgi.get("baslik", dosya.stem), "kaynak": bilgi.get("kaynak", ""),
                      "pdf": f"/static/ozetler/{pdf.name}" if pdf.exists() else None})
    birlesik = OZET_PDF / "tum-ozetler.pdf"
    return {"ozetler": liste, "birlesik": "/static/ozetler/tum-ozetler.pdf" if birlesik.exists() else None}


# ---------------------------------------------------------------- notlar

def notlari_oku():
    try:
        veri = json.loads(NOTLAR_DOSYASI.read_text(encoding="utf-8"))
        if isinstance(veri, dict) and isinstance(veri.get("notlar"), dict):
            return veri
        raise ValueError("beklenmeyen biçim")
    except FileNotFoundError:
        return {"surum": 1, "notlar": {}}
    except ValueError:
        # Bozuk dosyayı silme; kenara al ve boş başla (kullanıcı yedekten geri yükleyebilir)
        NOTLAR_DOSYASI.replace(NOTLAR_DOSYASI.with_name(f"notlar.bozuk-{int(time.time())}.json"))
        return {"surum": 1, "notlar": {}}


def notlari_yaz(veri):
    _atomik_yaz(NOTLAR_DOSYASI, veri)


def not_temizle(anahtar, n):
    """İstemciden gelen notu doğrular; geçersizse None."""
    if not isinstance(anahtar, str) or not anahtar or len(anahtar) > 200 or not isinstance(n, dict):
        return None
    metin = n.get("metin", "")
    if not isinstance(metin, str) or len(metin) > EN_UZUN_NOT:
        return None
    slayt = n.get("slayt")
    return {"unite": str(n.get("unite", ""))[:100], "slayt": slayt if isinstance(slayt, int) else 0,
            "slaytYazisi": str(n.get("slaytYazisi", ""))[:60], "baslik": str(n.get("baslik", ""))[:300],
            "metin": metin, "guncellendi": int(n.get("guncellendi") or time.time() * 1000)}


def not_kaydet(istek):
    anahtar = istek.get("anahtar")
    yeni = not_temizle(anahtar, istek)
    if yeni is None:
        return {"tamam": False, "hata": "Geçersiz not."}
    with NOT_KILIDI:
        veri = notlari_oku()
        mevcut = veri["notlar"].get(anahtar)
        if mevcut and mevcut.get("guncellendi", 0) > yeni["guncellendi"]:
            return {"tamam": False, "eski": True, "not": mevcut}   # sunucudaki daha yeni
        if yeni["metin"].strip():
            veri["notlar"][anahtar] = yeni
        else:
            veri["notlar"].pop(anahtar, None)
        notlari_yaz(veri)
    return {"tamam": True, "guncellendi": yeni["guncellendi"]}


def notlari_ice_aktar(notlar):
    if not isinstance(notlar, dict):
        return {"tamam": False, "hata": "Dosyada 'notlar' sözlüğü yok."}
    eklenen = atlanan = 0
    with NOT_KILIDI:
        veri = notlari_oku()
        for anahtar, n in notlar.items():
            yeni = not_temizle(anahtar, n)
            mevcut = veri["notlar"].get(anahtar)
            if yeni is None or not yeni["metin"].strip() or (mevcut and mevcut.get("guncellendi", 0) >= yeni["guncellendi"]):
                atlanan += 1
                continue
            veri["notlar"][anahtar] = yeni
            eklenen += 1
        notlari_yaz(veri)
    return {"tamam": True, "eklenen": eklenen, "atlanan": atlanan, "notlar": veri["notlar"]}


# ---------------------------------------------------------------- ilerleme (sunucu kopyası + yedekler)
# Asıl kayıt tarayıcıda (localStorage["se422-ders-v1"]); her tarayıcı/adres kendi kopyasını buraya gönderir ve
# kayıtlar BİRLEŞTİRİLİR (hiçbir kayıt silinmez). Böylece localhost ↔ 127.0.0.1 ya da başka tarayıcı ilerlemeyi kaybettirmez.

def _liste_birlestir(a, b, anahtar):
    """İki kayıt listesini anahtar(kayıt)'a göre tekilleştirip zamana göre sıralar (b, aynı anahtarda a'yı ezer)."""
    sozluk = {}
    for x in a + b:
        if isinstance(x, dict):
            sozluk[anahtar(x)] = x
    return sorted(sozluk.values(), key=lambda x: x.get("tarih") or x.get("t") or 0)


def _sira_birlestir(a, b, sinir=4000):
    """Sıralı tekil birleşim (görülen soru parmak izleri gibi listeler)."""
    gorulen, sonuc = set(), []
    for x in a + b:
        k = json.dumps(x, sort_keys=True) if not isinstance(x, (str, int, float)) else x
        if k not in gorulen:
            gorulen.add(k)
            sonuc.append(x)
    return sonuc[-sinir:]


def ilerleme_birlestir(eski, yeni):
    """eski: sunucudaki kayıt, yeni: gelen kayıt. Biriken veriler birleşir, ayarlarda gelen kazanır, hiçbir kayıt silinmez."""
    if not isinstance(eski, dict) or not eski:
        return yeni
    s = {**eski, **yeni}

    def sozluk(ad):
        a, b = eski.get(ad), yeni.get(ad)
        return (a if isinstance(a, dict) else {}), (b if isinstance(b, dict) else {})

    def liste(ad):
        a, b = eski.get(ad), yeni.get(ad)
        return (a if isinstance(a, list) else []), (b if isinstance(b, list) else [])

    def sayi(x):
        return x if isinstance(x, (int, float)) and not isinstance(x, bool) else 0

    a, b = sozluk("tamamlanan")
    s["tamamlanan"] = {k: True for k in {**a, **b} if a.get(k) or b.get(k)}
    for ad in ("gunluk", "sureler"):  # gün başına XP, ders başına süre: büyük olan
        a, b = sozluk(ad)
        s[ad] = {k: max(sayi(a.get(k)), sayi(b.get(k))) for k in {**a, **b}}
    a, b = sozluk("ogeler")  # soru ustalığı: en son cevaplanan (eşitlikte gelen)
    s["ogeler"] = {k: b[k] if k in b and (k not in a or sayi(b[k].get("son")) >= sayi(a[k].get("son"))) else a[k]
                   for k in {**a, **b} if isinstance((b.get(k) or a.get(k)), dict)}
    a, b = sozluk("konular")  # barem: daha çok cevap içeren (eşitlikte daha yeni)

    def konu_agirlik(k):
        return (sayi(k.get("d")) + sayi(k.get("y")), sayi(k.get("t"))) if isinstance(k, dict) else (-1, 0)
    s["konular"] = {k: b[k] if konu_agirlik(b.get(k)) >= konu_agirlik(a.get(k)) else a[k] for k in {**a, **b}}
    for ad in ("kodlar", "ogeImza"):
        a, b = sozluk(ad)
        s[ad] = {**a, **b}
    s["xp"] = max(sayi(eski.get("xp")), sayi(yeni.get("xp")))
    s["schemaVersion"] = max(sayi(eski.get("schemaVersion")), sayi(yeni.get("schemaVersion")))
    a, b = liste("sinavlar")
    s["sinavlar"] = _liste_birlestir(a, b, lambda x: x.get("tarih"))
    a, b = liste("araSinavlar")
    s["araSinavlar"] = _liste_birlestir(a, b, lambda x: x.get("tarih"))
    a, b = liste("oturumlar")
    s["oturumlar"] = _liste_birlestir(a, b, lambda x: (x.get("t"), x.get("tur")))
    for ad in ("gorulenSinav", "gorulenUretilen", "gorulenAraSinav", "bilinenBolumler"):
        a, b = liste(ad)
        s[ad] = _sira_birlestir(a, b)
    return s


def _atomik_yaz(dosya, veri):
    """Önce geçici dosyaya yazar, sonra atomik olarak yeniden adlandırır: yazma yarıda kesilse de eski dosya bozulmaz."""
    dosya.parent.mkdir(parents=True, exist_ok=True)
    gecici = dosya.parent / f".{dosya.stem}-{os.getpid()}-{threading.get_ident()}.tmp"
    with open(gecici, "w", encoding="utf-8") as f:
        json.dump(veri, f, ensure_ascii=False, indent=1)
        f.flush()
        os.fsync(f.fileno())
    os.replace(gecici, dosya)


def ilerleme_oku():
    try:
        veri = json.loads(ILERLEME_DOSYASI.read_text(encoding="utf-8"))
        return veri if isinstance(veri, dict) else {}
    except FileNotFoundError:
        return {}
    except ValueError:
        # Bozuk dosyayı silme; kenara al (tarayıcılardaki kopyalar bir sonraki eşitlemede dosyayı yeniden kurar)
        YEDEKLER.mkdir(parents=True, exist_ok=True)
        ILERLEME_DOSYASI.replace(YEDEKLER / f"ilerleme.bozuk-{int(time.time())}.json")
        return {}


def _gunluk_yedek():
    """Gün içindeki ilk yazmadan önce mevcut dosyanın kopyası (son GUNLUK_YEDEK_SAYISI gün tutulur)."""
    if not ILERLEME_DOSYASI.exists():
        return
    YEDEKLER.mkdir(parents=True, exist_ok=True)
    hedef = YEDEKLER / f"ilerleme-gunluk-{time.strftime('%Y-%m-%d')}.json"
    if not hedef.exists():
        hedef.write_bytes(ILERLEME_DOSYASI.read_bytes())
        for eski in sorted(YEDEKLER.glob("ilerleme-gunluk-*.json"))[:-GUNLUK_YEDEK_SAYISI]:
            eski.unlink()


def ilerleme_kaydet(istek):
    gelen = istek.get("ilerleme")
    if not isinstance(gelen, dict):
        return {"tamam": False, "hata": "Geçersiz ilerleme."}
    with ILERLEME_KILIDI:
        birlesik = ilerleme_birlestir(ilerleme_oku(), gelen)
        _gunluk_yedek()
        _atomik_yaz(ILERLEME_DOSYASI, {**birlesik, "sunucuGuncelleme": int(time.time() * 1000)})
    return {"tamam": True, "ilerleme": birlesik} if istek.get("geriDon") else {"tamam": True}


def ilerleme_yedekle(istek):
    """Migration / içe aktarma öncesi tarayıcıdaki ham kaydı veri/yedekler/ altına yazar."""
    veri = istek.get("ilerleme")
    if not isinstance(veri, dict):
        return {"tamam": False, "hata": "Geçersiz yedek."}
    sebep = "".join(c for c in str(istek.get("sebep", "yedek")) if c.isalnum() or c in "-_")[:40] or "yedek"
    with ILERLEME_KILIDI:
        dosya = YEDEKLER / f"yedek-{time.strftime('%Y-%m-%d-%H%M%S')}-{sebep}.json"
        n = 1
        while dosya.exists():
            n += 1
            dosya = dosya.with_name(f"yedek-{time.strftime('%Y-%m-%d-%H%M%S')}-{sebep}-{n}.json")
        _atomik_yaz(dosya, {"sebep": sebep, "tarih": istek.get("tarih"), "ilerleme": veri})
    return {"tamam": True, "dosya": str(dosya.relative_to(VERI)) if dosya.is_relative_to(VERI) else dosya.name}


class Handler(BaseHTTPRequestHandler):
    def _json(self, veri, kod=200):
        govde = json.dumps(veri, ensure_ascii=False).encode("utf-8")
        self.send_response(kod)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(govde)))
        self.end_headers()
        self.wfile.write(govde)

    def _pdf(self, veri, dosya_adi):
        self.send_response(200)
        self.send_header("Content-Type", "application/pdf")
        self.send_header("Content-Disposition", f'attachment; filename="{dosya_adi}"')
        self.send_header("Content-Length", str(len(veri)))
        self.end_headers()
        self.wfile.write(veri)

    def _istek_govdesi(self):
        uzunluk = int(self.headers.get("Content-Length", 0))
        if uzunluk > EN_BUYUK_ISTEK:
            return {}
        try:
            veri = json.loads(self.rfile.read(uzunluk) or b"{}")
        except ValueError:
            return {}
        return veri if isinstance(veri, dict) else {}

    def do_GET(self):
        if self.path == "/api/alistirmalar":
            self._json(alistirmalar.istemci_icin())
            return
        if self.path == "/api/ozetler":
            self._json(ozet_listesi())
            return
        if self.path.startswith("/api/ozetler/"):
            ad = self.path.rsplit("/", 1)[1]
            dosya = next((f for f in OZETLER.glob("[0-9][0-9]-*.md") if f.stem == ad), None)  # yalnızca listedeki adlar
            if dosya is None:
                self._json({"hata": "Özet bulunamadı."}, 404)
                return
            bilgi, govde = ozet_oku(dosya)
            self._json({"ad": dosya.stem, "baslik": bilgi.get("baslik", ""), "unite": bilgi.get("unite", ""), "md": govde})
            return
        if self.path == "/api/notlar":
            with NOT_KILIDI:
                self._json(notlari_oku())
            return
        if self.path == "/api/ilerleme":
            with ILERLEME_KILIDI:
                veri = ilerleme_oku()
            self._json({"var": bool(veri), "ilerleme": veri or None})
            return

        ad = "index.html" if self.path == "/" else self.path.lstrip("/").removeprefix("static/")
        dosya = (STATIC / ad).resolve()
        if STATIC not in dosya.parents or not dosya.is_file():
            self.send_error(404)
            return
        govde = dosya.read_bytes()
        tur = mimetypes.guess_type(dosya.name)[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", f"{tur}; charset=utf-8")
        self.send_header("Content-Length", str(len(govde)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(govde)

    def do_POST(self):
        istek = self._istek_govdesi()

        if self.path == "/api/terminal":
            self._json(TERMINAL.gonder({"kod": istek.get("kod", "")}))
        elif self.path == "/api/notlar":
            self._json(not_kaydet(istek))
        elif self.path == "/api/pdf/notlar":
            pdf, hata = not_pdf_uret(istek)
            if hata:
                self._json({"hata": hata}, 500)
            else:
                self._pdf(pdf, "notlarim.pdf")
        elif self.path == "/api/ilerleme":
            self._json(ilerleme_kaydet(istek))
        elif self.path == "/api/ilerleme/yedek":
            self._json(ilerleme_yedekle(istek))
        elif self.path == "/api/notlar/ice-aktar":
            self._json(notlari_ice_aktar(istek.get("notlar")))
        elif self.path == "/api/terminal/durdur":
            self._json(TERMINAL.durdur())
        elif self.path == "/api/terminal/sifirla":
            self._json(TERMINAL.gonder({"sifirla": True}))
        elif self.path == "/api/calistir":
            self._json(kontrol_et(istek.get("kod", ""), "", []))
        elif self.path == "/api/varyant":
            konular = [k for k in istek.get("konular", []) if isinstance(k, str)][:40]
            adet = max(1, min(int(istek.get("adet", 6)), 40))
            self._json(varyant_uret(konular, adet, istek.get("gorulen", [])[-4000:]))
        elif self.path == "/api/ara-sinav":
            self._json(ara_sinav_uret(istek))
        elif self.path == "/api/sinav":
            self._json(sinav_uret(istek.get("gorulen", [])))
        elif self.path == "/api/kontrol":
            alistirma = alistirmalar.bul(istek.get("id"))
            if alistirma is None:
                self._json({"hata": "Alıştırma bulunamadı."}, 404)
                return
            self._json(kontrol_et(istek.get("kod", ""), alistirma["cozum"], alistirma["kontroller"]))
        else:
            self.send_error(404)

    def log_message(self, *_):
        pass


if __name__ == "__main__":
    # Sadece bu bilgisayardan erişilebilir: kullanıcı kodu çalıştırdığı için dışarı açılmamalı
    sunucu = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"SE 422 ders uygulaması çalışıyor: {ADRES}")
    print("  Hep bu adresten aç (localhost ile 127.0.0.1 tarayıcı için farklı adreslerdir, ilerleme ayrı tutulur).")
    print(f"Kodlar şu Python ile çalıştırılıyor: {PYTHON}")
    print("Durdurmak için Ctrl+C")
    try:
        sunucu.serve_forever()
    except KeyboardInterrupt:
        print("\nSunucu durduruldu.")
    finally:
        TERMINAL._durdur()
