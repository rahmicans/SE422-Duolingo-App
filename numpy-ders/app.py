"""SE 422 Python & Veri Bilimi ders uygulaması — sunucu

Sadece Python standart kütüphanesi ile çalışır. Kodlar ise NumPy kurulu olan
.venv içindeki Python ile ayrı bir süreçte çalıştırılır.

Çalıştırmak için:
    python3 app.py
Sonra tarayıcıda http://localhost:8001 adresini açın.
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

PORT = 8001
ZAMAN_ASIMI = 10  # saniye
KLASOR = Path(__file__).resolve().parent
STATIC = KLASOR / "static"
CALISTIRICI = str(KLASOR / "calistirici.py")
SINAV = str(KLASOR / "sinav.py")
VARYANT = str(KLASOR / "varyant.py")
PDF_URET = str(KLASOR / "pdf_uret.py")

# Kullanıcı kodu (dosya örnekleri dahil) proje klasörünü kirletmesin diye geçici klasörde çalışır
CALISMA = Path(tempfile.gettempdir()) / "se422-calisma"
CALISMA.mkdir(exist_ok=True)

# Kişisel veriler (notlar). .gitignore'da; testler SE422_VERI ile geçici klasör verebilir
VERI = Path(os.environ.get("SE422_VERI", KLASOR / "veri"))
NOTLAR_DOSYASI = VERI / "notlar.json"
NOT_KILIDI = threading.Lock()
EN_UZUN_NOT = 200_000

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
    """Önce geçici dosyaya yazar, sonra atomik olarak yeniden adlandırır: yazma yarıda kesilse de eski dosya bozulmaz."""
    VERI.mkdir(parents=True, exist_ok=True)
    gecici = VERI / f".notlar-{os.getpid()}-{threading.get_ident()}.tmp"
    with open(gecici, "w", encoding="utf-8") as f:
        json.dump(veri, f, ensure_ascii=False, indent=1)
        f.flush()
        os.fsync(f.fileno())
    os.replace(gecici, NOTLAR_DOSYASI)


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
    print(f"SE 422 ders uygulaması çalışıyor: http://localhost:{PORT}")
    print(f"Kodlar şu Python ile çalıştırılıyor: {PYTHON}")
    print("Durdurmak için Ctrl+C")
    try:
        sunucu.serve_forever()
    except KeyboardInterrupt:
        print("\nSunucu durduruldu.")
    finally:
        TERMINAL._durdur()
