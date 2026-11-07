"""PDF üretimi: not PDF'leri (bölüm ve kitapçık) ve bölüm özetleri.

reportlab ile, gömülü DejaVu fontlarıyla (Türkçe karakterler için) çalışır; sistem kütüphanesi gerektirmez.
app.py bunu .venv Python'uyla alt süreçte çağırır:

    python pdf_uret.py notlar  < istek.json  > notlar.pdf

Özet PDF'leri için bkz. ozet_pdf_uret.py.
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (CondPageBreak, Flowable, KeepTogether, ListFlowable, ListItem, NextPageTemplate,
                                PageBreak, Paragraph, Spacer, Table, TableStyle)
from reportlab.platypus.doctemplate import BaseDocTemplate, PageTemplate
from reportlab.platypus.frames import Frame
from reportlab.platypus.tableofcontents import TableOfContents

KLASOR = Path(__file__).resolve().parent
FONTLAR = KLASOR / "fontlar"

# ---------------------------------------------------------------- fontlar ve stiller

pdfmetrics.registerFont(TTFont("DejaVu", str(FONTLAR / "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("DejaVu-Bold", str(FONTLAR / "DejaVuSans-Bold.ttf")))
pdfmetrics.registerFont(TTFont("DejaVu-Oblique", str(FONTLAR / "DejaVuSans-Oblique.ttf")))
pdfmetrics.registerFont(TTFont("DejaVu-BoldOblique", str(FONTLAR / "DejaVuSans-BoldOblique.ttf")))
pdfmetrics.registerFont(TTFont("DejaVuMono", str(FONTLAR / "DejaVuSansMono.ttf")))
pdfmetrics.registerFont(TTFont("DejaVuMono-Bold", str(FONTLAR / "DejaVuSansMono-Bold.ttf")))
pdfmetrics.registerFontFamily("DejaVu", normal="DejaVu", bold="DejaVu-Bold", italic="DejaVu-Oblique", boldItalic="DejaVu-BoldOblique")
pdfmetrics.registerFontFamily("DejaVuMono", normal="DejaVuMono", bold="DejaVuMono-Bold", italic="DejaVuMono", boldItalic="DejaVuMono-Bold")

MAVI = colors.HexColor("#1899d6")
KOYU = colors.HexColor("#2b2b2b")
SOLUK = colors.HexColor("#6b7680")
KENAR = colors.HexColor("#d5dce1")
KOD_ZEMIN = colors.HexColor("#f4f7f9")
CIKTI_ZEMIN = colors.HexColor("#fbfaf3")
CIKTI_KENAR = colors.HexColor("#e2dcb8")
YESIL = colors.HexColor("#58a700")

GOVDE_PUNTO = 11.5  # iPad'de A4 sayfa genişliğe sığdırıldığında rahat okunur boyut

STIL = {
    "govde": ParagraphStyle("govde", fontName="DejaVu", fontSize=GOVDE_PUNTO, leading=GOVDE_PUNTO * 1.55, textColor=KOYU, spaceAfter=7),
    "h1": ParagraphStyle("h1", fontName="DejaVu-Bold", fontSize=21, leading=27, textColor=KOYU, spaceBefore=4, spaceAfter=12),
    "h2": ParagraphStyle("h2", fontName="DejaVu-Bold", fontSize=16, leading=21, textColor=MAVI, spaceBefore=14, spaceAfter=7),
    "h3": ParagraphStyle("h3", fontName="DejaVu-Bold", fontSize=13, leading=18, textColor=KOYU, spaceBefore=10, spaceAfter=5),
    "h4": ParagraphStyle("h4", fontName="DejaVu-Bold", fontSize=GOVDE_PUNTO, leading=GOVDE_PUNTO * 1.5, textColor=KOYU, spaceBefore=6, spaceAfter=3),
    "liste": ParagraphStyle("liste", fontName="DejaVu", fontSize=GOVDE_PUNTO, leading=GOVDE_PUNTO * 1.5, textColor=KOYU, spaceAfter=2),
    "alinti": ParagraphStyle("alinti", fontName="DejaVu-Oblique", fontSize=GOVDE_PUNTO, leading=GOVDE_PUNTO * 1.5, textColor=SOLUK,
                             leftIndent=12, borderPadding=(2, 0, 2, 8), spaceAfter=7),
    "kucuk": ParagraphStyle("kucuk", fontName="DejaVu", fontSize=9.5, leading=13, textColor=SOLUK),
    "kapak_baslik": ParagraphStyle("kapak_baslik", fontName="DejaVu-Bold", fontSize=30, leading=38, textColor=KOYU, alignment=TA_CENTER),
    "kapak_alt": ParagraphStyle("kapak_alt", fontName="DejaVu", fontSize=15, leading=22, textColor=SOLUK, alignment=TA_CENTER),
    "tablo": ParagraphStyle("tablo", fontName="DejaVu", fontSize=10, leading=14, textColor=KOYU),
    "tablo_b": ParagraphStyle("tablo_b", fontName="DejaVu-Bold", fontSize=10, leading=14, textColor=KOYU),
    "ek_bilgi": ParagraphStyle("ek_bilgi", fontName="DejaVu", fontSize=GOVDE_PUNTO - 0.5, leading=(GOVDE_PUNTO - 0.5) * 1.5, textColor=KOYU,
                               backColor=colors.HexColor("#eaf6fd"), borderColor=colors.HexColor("#84d8ff"), borderWidth=0.8,
                               borderPadding=(6, 8, 6, 8), spaceBefore=6, spaceAfter=12),
}
TOC_STILLERI = [
    ParagraphStyle("toc1", fontName="DejaVu-Bold", fontSize=12.5, leading=18, leftIndent=0, firstLineIndent=0, spaceBefore=6),
    ParagraphStyle("toc2", fontName="DejaVu", fontSize=11, leading=15, leftIndent=18, firstLineIndent=0),
    ParagraphStyle("toc3", fontName="DejaVu", fontSize=10, leading=13.5, leftIndent=34, firstLineIndent=0, textColor=SOLUK),
]

# ---------------------------------------------------------------- kod kutusu

PY_KELIMELER = set(("False None True and as assert async await break class continue def del elif else except finally for from "
                    "global if import in is lambda nonlocal not or pass raise return try while with yield").split())
PY_DESEN = re.compile(r"(\"(?:\\.|[^\"\\])*\"?|'(?:\\.|[^'\\])*'?)|(#.*)|\b(\d+(?:\.\d+)?)\b|([A-Za-z_]\w*)")
RENK = {"metin": colors.HexColor("#3f8f00"), "yorum": colors.HexColor("#7d8a93"), "sayi": colors.HexColor("#c56a00"),
        "kelime": colors.HexColor("#9b3fd6"), "duz": KOYU}


def satir_parcala(satir, python=True):
    """Bir kod satırını (renk, metin) parçalarına ayırır."""
    if not python:
        return [("duz", satir)]
    parcalar, son = [], 0
    for m in PY_DESEN.finditer(satir):
        if m.start() > son:
            parcalar.append(("duz", satir[son:m.start()]))
        tur = "metin" if m.group(1) else "yorum" if m.group(2) else "sayi" if m.group(3) else \
            ("kelime" if m.group(4) in PY_KELIMELER else "duz")
        parcalar.append((tur, m.group(0)))
        son = m.end()
    if son < len(satir):
        parcalar.append(("duz", satir[son:]))
    return parcalar


def satir_kaydir(satir, en_fazla):
    """Uzun satırı sayfadan taşmayacak şekilde böler; devam satırları '↪ ' ile başlar."""
    if len(satir) <= en_fazla:
        return [satir]
    parcalar, kalan, ilk = [], satir, True
    while kalan:
        sinir = en_fazla if ilk else en_fazla - 2
        if len(kalan) <= sinir:
            parcalar.append(kalan if ilk else "↪ " + kalan)
            break
        kesim = max(kalan.rfind(c, 0, sinir) for c in " ,(") + 1
        if kesim < sinir // 2:
            kesim = sinir
        parcalar.append(kalan[:kesim] if ilk else "↪ " + kalan[:kesim])
        kalan = kalan[kesim:]
        ilk = False
    return parcalar


class KodKutusu(Flowable):
    """Arka planlı, kenarlıklı, monospace kod bloğu. Uzun satırlar kaydırılır, sayfa sonunda bölünebilir."""

    PUNTO = 9.6
    SATIR = 9.6 * 1.45
    IC = 8

    def __init__(self, kod, etiket="Python", python=True, cikti=False):
        super().__init__()
        self.kod = kod.rstrip("\n")
        self.etiket = etiket
        self.python = python
        self.cikti = cikti
        self.satirlar = None
        self.etiket_var = bool(etiket)

    def wrap(self, gen, yuk):
        self.genislik = gen
        kar = pdfmetrics.stringWidth("M", "DejaVuMono", self.PUNTO)
        en_fazla = max(20, int((gen - 2 * self.IC) / kar))
        if self.satirlar is None:
            self.satirlar = []
            for s in self.kod.split("\n"):
                self.satirlar.extend(satir_kaydir(s.replace("\t", "    "), en_fazla))
        self.yukseklik = len(self.satirlar) * self.SATIR + 2 * self.IC + (11 if self.etiket_var else 0)
        return gen, self.yukseklik

    def split(self, gen, yuk):
        self.wrap(gen, yuk)
        ust = (11 if self.etiket_var else 0) + 2 * self.IC
        sigan = int((yuk - ust) // self.SATIR)
        if sigan < 3 or sigan >= len(self.satirlar):
            return []
        bas = KodKutusu("", self.etiket, self.python, self.cikti)
        bas.satirlar = self.satirlar[:sigan]
        son = KodKutusu("", self.etiket + " (devam)" if self.etiket else "", self.python, self.cikti)
        son.satirlar = self.satirlar[sigan:]
        return [bas, son]

    def draw(self):
        c = self.canv
        c.saveState()
        c.setFillColor(CIKTI_ZEMIN if self.cikti else KOD_ZEMIN)
        c.setStrokeColor(CIKTI_KENAR if self.cikti else KENAR)
        c.setLineWidth(0.8)
        c.roundRect(0, 0, self.genislik, self.yukseklik, 5, stroke=1, fill=1)
        y = self.yukseklik - self.IC
        if self.etiket_var:
            c.setFont("DejaVu-Bold", 7.5)
            c.setFillColor(SOLUK)
            c.drawString(self.IC, y - 7, self.etiket.upper())
            y -= 11
        kar = pdfmetrics.stringWidth("M", "DejaVuMono", self.PUNTO)
        for satir in self.satirlar:
            y -= self.SATIR
            x = self.IC
            if satir.startswith("↪ "):
                c.setFillColor(SOLUK)
                c.setFont("DejaVuMono", self.PUNTO)
                c.drawString(x, y + 3.5, "↪")
                x += 2 * kar
                satir = satir[2:]
            for tur, metin in satir_parcala(satir, self.python):
                c.setFont("DejaVuMono-Bold" if tur == "kelime" else "DejaVuMono", self.PUNTO)
                c.setFillColor(RENK[tur])
                c.drawString(x, y + 3.5, metin)
                x += len(metin) * kar
        c.restoreState()


# ---------------------------------------------------------------- Markdown → flowable

def satir_ici(metin):
    """**kalın**, *italik*, `kod` ve [bağlantı](url) işaretlerini reportlab mini-HTML'ine çevirir.

    Kod parçaları önce yer tutucuyla korunur; böylece **`kod` içeren kalın** ifadeler de doğru çevrilir.
    """
    kodlar = []

    def sakla(m):
        kodlar.append(f'<font name="DejaVuMono" size="{GOVDE_PUNTO - 1.5}" color="#9b3fd6">{escape(m.group(1))}</font>')
        return f"\x00{len(kodlar) - 1}\x00"

    p = escape(re.sub(r"`([^`]+)`", sakla, metin))
    p = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", p)
    p = re.sub(r"__(.+?)__", r"<b>\1</b>", p)
    p = re.sub(r"(^|[\s(])\*(?!\s)([^*]+?)\*(?=[\s).,!?:;]|$)", r"\1<i>\2</i>", p)
    p = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", r'<link href="\2" color="#1899d6">\1</link>', p)
    return re.sub("\x00(\\d+)\x00", lambda m: kodlar[int(m.group(1))], p)


class Baslik(Paragraph):
    """İçindekiler ve PDF yer imlerine (bookmark) giren başlık."""

    def __init__(self, metin, stil, seviye, anahtar=None, toc_metni=None):
        super().__init__(satir_ici(metin), stil)
        self.toc = (seviye, toc_metni or re.sub(r"[`*]", "", metin), anahtar)


def md_flowables(md, baslik_kaydir=0, toc_seviye_ust=2, anahtar_on_eki="b"):
    """Markdown'ı reportlab öğelerine çevirir: başlık, paragraf, liste, alıntı, kod/çıktı bloğu, tablo, yatay çizgi.

    baslik_kaydir: '#' sayısına eklenecek seviye (not içindeki başlıklar sayfa başlıklarından küçük olsun diye).
    toc_seviye_ust: bu seviyeye kadarki başlıklar içindekilere/yer imlerine girer.
    """
    satirlar = md.replace("\r", "").split("\n")
    ogeler, paragraf, i = [], [], 0
    sayac = [0]

    def paragrafi_bitir():
        if paragraf:
            ogeler.append(Paragraph("<br/>".join(satir_ici(s) for s in paragraf), STIL["govde"]))
            paragraf.clear()

    while i < len(satirlar):
        s = satirlar[i]
        cit = re.match(r"^\s*```(\S*)\s*(.*)$", s)
        if cit:
            paragrafi_bitir()
            dil = cit.group(1).lower()
            kod = []
            i += 1
            while i < len(satirlar) and not re.match(r"^\s*```\s*$", satirlar[i]):
                kod.append(satirlar[i])
                i += 1
            i += 1
            cikti = dil in ("cikti", "çıktı", "text", "output")
            etiket = "Çıktı" if cikti else ("Python" if dil.startswith("python") or not dil else dil.capitalize())
            ogeler.append(KodKutusu("\n".join(kod), etiket, python=not cikti and dil not in ("bash", "sh", "text"), cikti=cikti))
            ogeler.append(Spacer(1, 7))
            continue
        b = re.match(r"^(#{1,4})\s+(.*)$", s)
        if b:
            paragrafi_bitir()
            seviye = min(len(b.group(1)) + baslik_kaydir, 4)
            sayac[0] += 1
            if seviye <= toc_seviye_ust:
                ogeler.append(CondPageBreak(3 * cm))
                ogeler.append(Baslik(b.group(2), STIL[f"h{seviye}"], seviye - 1, f"{anahtar_on_eki}{sayac[0]}"))
            else:
                ogeler.append(Paragraph(satir_ici(b.group(2)), STIL[f"h{seviye}"]))
            i += 1
            continue
        if re.match(r"^\s*(---|\*\*\*)\s*$", s):
            paragrafi_bitir()
            ogeler.append(Cizgi())
            i += 1
            continue
        if re.match(r"^\s*([-*+]|\d+[.)])\s+", s):
            paragrafi_bitir()
            sirali = bool(re.match(r"^\s*\d", s))
            maddeler = []
            desen = r"^\s*\d+[.)]\s+" if sirali else r"^\s*[-*+]\s+"
            while i < len(satirlar) and (re.match(desen, satirlar[i]) or
                                         (satirlar[i].startswith("  ") and satirlar[i].strip() and maddeler
                                          and not re.match(r"^\s*([-*+]|\d+[.)])\s+", satirlar[i]))):
                if re.match(desen, satirlar[i]):
                    maddeler.append(re.sub(r"^\s*([-*+]|\d+[.)])\s+", "", satirlar[i]))
                else:
                    maddeler[-1] += " " + satirlar[i].strip()
                i += 1
            ogeler.append(ListFlowable([ListItem(Paragraph(satir_ici(m), STIL["liste"]), leftIndent=16) for m in maddeler],
                                       bulletType="1" if sirali else "bullet", start="1" if sirali else "•",
                                       bulletFontName="DejaVu", bulletFontSize=GOVDE_PUNTO - 1, leftIndent=16, spaceAfter=6))
            ogeler.append(Spacer(1, 4))
            continue
        if s.startswith(">"):
            paragrafi_bitir()
            alinti = []
            while i < len(satirlar) and satirlar[i].startswith(">"):
                alinti.append(re.sub(r"^>\s?", "", satirlar[i]))
                i += 1
            metin = "<br/>".join(satir_ici(a) for a in alinti)
            ek = alinti and alinti[0].lstrip().startswith(("**Ek bilgi", "**Dokümantasyondan"))
            ogeler.append(Paragraph(metin, STIL["ek_bilgi"] if ek else STIL["alinti"]))
            continue
        if s.strip().startswith("|") and i + 1 < len(satirlar) and re.match(r"^\s*\|?\s*:?-{2,}", satirlar[i + 1]):
            paragrafi_bitir()
            tablo = []
            while i < len(satirlar) and satirlar[i].strip().startswith("|"):
                if not re.match(r"^\s*\|?\s*:?-{2,}", satirlar[i]):
                    tablo.append([h.strip() for h in satirlar[i].strip().strip("|").split("|")])
                i += 1
            ogeler.append(tablo_olustur(tablo))
            ogeler.append(Spacer(1, 8))
            continue
        if not s.strip():
            paragrafi_bitir()
            i += 1
            continue
        paragraf.append(s)
        i += 1
    paragrafi_bitir()
    return ogeler


def tablo_olustur(satirlar):
    sutun = max(len(s) for s in satirlar)
    veri = [[Paragraph(satir_ici(h), STIL["tablo_b" if r == 0 else "tablo"]) for h in s + [""] * (sutun - len(s))]
            for r, s in enumerate(satirlar)]
    t = Table(veri, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.6, KENAR), ("BACKGROUND", (0, 0), (-1, 0), KOD_ZEMIN),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t


class Cizgi(Flowable):
    def wrap(self, gen, yuk):
        self.gen = gen
        return gen, 14

    def draw(self):
        self.canv.setStrokeColor(KENAR)
        self.canv.setLineWidth(0.8)
        self.canv.line(0, 7, self.gen, 7)


# ---------------------------------------------------------------- belge şablonu

class Belge(BaseDocTemplate):
    """A4 dikey; başlıklar içindekilere ve PDF yer imlerine girer; altta sayfa numarası."""

    def __init__(self, hedef, baslik, yazar="SE 422", kapak=False, **kw):
        super().__init__(hedef, pagesize=A4, leftMargin=2.1 * cm, rightMargin=2.1 * cm, topMargin=2.0 * cm, bottomMargin=2.0 * cm,
                         title=baslik, author=yazar, subject=baslik, creator="se422 · pdf_uret.py", **kw)
        self.belge_basligi = baslik
        cerceve = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="govde", leftPadding=0, rightPadding=0)
        sablonlar = [PageTemplate(id="normal", frames=[cerceve], onPage=self._sayfa_alti)]
        if kapak:
            sablonlar.insert(0, PageTemplate(id="kapak", frames=[cerceve]))
        self.addPageTemplates(sablonlar)

    def _sayfa_alti(self, c, belge):
        c.saveState()
        c.setFont("DejaVu", 8.5)
        c.setFillColor(SOLUK)
        c.drawString(self.leftMargin, 1.1 * cm, self.belge_basligi[:90])
        c.drawRightString(A4[0] - self.rightMargin, 1.1 * cm, f"Sayfa {c.getPageNumber()}")
        c.setStrokeColor(KENAR)
        c.setLineWidth(0.5)
        c.line(self.leftMargin, 1.45 * cm, A4[0] - self.rightMargin, 1.45 * cm)
        c.restoreState()

    def afterFlowable(self, f):
        toc = getattr(f, "toc", None)
        if not toc:
            return
        seviye, metin, anahtar = toc
        if anahtar:
            self.canv.bookmarkPage(anahtar)
            self.canv.addOutlineEntry(metin, anahtar, level=seviye, closed=seviye > 0)
        self.notify("TOCEntry", (seviye, escape(metin), self.page, anahtar))


def icindekiler():
    toc = TableOfContents()
    toc.levelStyles = TOC_STILLERI
    toc.dotsMinLevel = 0
    return toc


def belge_uret(hedef, baslik, ogeler, kapak=False):
    belge = Belge(hedef, baslik, kapak=kapak)
    if any(isinstance(o, TableOfContents) for o in ogeler):
        belge.multiBuild(ogeler)
    else:
        belge.build(ogeler)


def kapak_sayfasi(baslik, alt_baslik, satirlar):
    ogeler = [Spacer(1, 6 * cm), Paragraph(escape(baslik), STIL["kapak_baslik"]), Spacer(1, 0.6 * cm),
              Paragraph(escape(alt_baslik), STIL["kapak_alt"]), Spacer(1, 2.2 * cm)]
    ogeler += [Paragraph(satir, STIL["kapak_alt"]) for satir in satirlar]
    return ogeler + [NextPageTemplate("normal"), PageBreak()]


# ---------------------------------------------------------------- not PDF'leri

def tarih_yazisi():
    aylar = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
    d = datetime.now()
    return f"{d.day} {aylar[d.month - 1]} {d.year}"


def _unite_notlari(notlar, unite_id):
    return sorted((n for n in notlar.values() if n.get("unite") == unite_id and str(n.get("metin", "")).strip()),
                  key=lambda n: (n.get("slayt") or 0, n.get("baslik", "")))


def _not_ogeleri(n, seviye, anahtar):
    baslik = f"{n.get('slaytYazisi') or 'Slayt ' + str(n.get('slayt'))} · {n.get('baslik', '')}"
    stil = STIL["h2"] if seviye == 2 else STIL["h3"]
    ogeler = [CondPageBreak(2.5 * cm), Baslik(baslik, stil, seviye - 1, anahtar)]
    ogeler += md_flowables(n["metin"], baslik_kaydir=2, toc_seviye_ust=0)
    ogeler.append(Spacer(1, 6))
    return ogeler


def notlar_pdf(istek, hedef):
    """istek: {tur: 'bolum'|'kitapcik', unite, uniteler: [{id, no, baslik, kaynak}], notlar: {...}, bosBolumler, tamamlandi}"""
    notlar = istek.get("notlar") or {}
    uniteler = istek.get("uniteler") or []
    if istek.get("tur") == "bolum":
        u = next((x for x in uniteler if x["id"] == istek.get("unite")), None)
        if u is None:
            raise ValueError("Bölüm bulunamadı.")
        liste = _unite_notlari(notlar, u["id"])
        baslik = f"Notlarım · Bölüm {u['no']}: {u['baslik']}"
        ogeler = [Baslik(f"Bölüm {u['no']}: {u['baslik']}", STIL["h1"], 0, "u0", baslik),
                  Paragraph(escape(f"SE 422 · {u.get('kaynak', '')} · Notlarım · {tarih_yazisi()} · {len(liste)} not"), STIL["kucuk"]),
                  Spacer(1, 10), Cizgi()]
        if liste:
            for k, n in enumerate(liste):
                ogeler += _not_ogeleri(n, 2, f"n{k}")
        else:
            ogeler.append(Paragraph("Bu bölümde henüz not yok.", STIL["govde"]))
        belge_uret(hedef, baslik, ogeler)
        return

    # Kitapçık: kapak, içindekiler, bölüm bölüm notlar
    atla = istek.get("bosBolumler") == "atla"
    dolu = [u for u in uniteler if _unite_notlari(notlar, u["id"])]
    toplam = sum(len(_unite_notlari(notlar, u["id"])) for u in uniteler)
    tam = bool(istek.get("tamamlandi"))
    baslik = "Tüm Notlarım · Kitapçık" if tam else "Notlarım · Şimdiye kadarki notlar"
    ogeler = kapak_sayfasi("SE 422 · Notlarım", "Introduction to Data Science · " + ("Tüm notlarım" if tam else "Şimdiye kadarki notlar"),
                           [tarih_yazisi(), f"{toplam} not · {len(dolu)} bölüm"])
    ogeler += [Paragraph("İçindekiler", STIL["h1"]), icindekiler(), PageBreak()]
    yazilan = 0
    for u in uniteler:
        liste = _unite_notlari(notlar, u["id"])
        if not liste and atla:
            continue
        if yazilan:
            ogeler.append(PageBreak())
        yazilan += 1
        ogeler.append(Baslik(f"Bölüm {u['no']}: {u['baslik']}", STIL["h1"], 0, f"u{u['no']}"))
        ogeler.append(Paragraph(escape(f"{u.get('kaynak', '')} · {len(liste)} not"), STIL["kucuk"]))
        ogeler.append(Spacer(1, 8))
        if not liste:
            ogeler.append(Paragraph("Bu bölümde not yok.", STIL["govde"]))
        for k, n in enumerate(liste):
            ogeler += _not_ogeleri(n, 2, f"u{u['no']}n{k}")
    if not yazilan:
        ogeler.append(Paragraph("Henüz hiç not yok.", STIL["govde"]))
    belge_uret(hedef, baslik, ogeler, kapak=True)


if __name__ == "__main__":
    if sys.argv[1:] == ["notlar"]:
        import io

        tampon = io.BytesIO()
        notlar_pdf(json.loads(sys.stdin.read()), tampon)
        sys.stdout.buffer.write(tampon.getvalue())
    else:
        print(__doc__)
        sys.exit(2)
