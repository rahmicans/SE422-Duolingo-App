// Küçük Markdown render'ı: başlık, kalın, italik, satır içi kod, liste, alıntı, kod/çıktı bloğu, tablo, yatay çizgi.
// Notlarım paneli (notlar.js) ve "Claude'un notları" sekmesi (uygulama.js) ortak kullanır. pythonHtml için editor.js gerekir.

const mdKacis = (m) => String(m ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function mdSatirIci(s) {
  // Kod parçaları önce korunur; böylece **`kod` içeren kalın** ifadeler de doğru çevrilir
  const kodlar = [];
  const korunan = String(s).replace(/`([^`]+)`/g, (_, k) => { kodlar.push(`<code>${mdKacis(k)}</code>`); return `\u0000${kodlar.length - 1}\u0000`; });
  return mdKacis(korunan).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/__(.+?)__/g, "<b>$1</b>")
    .replace(/(^|[\s(])\*(?!\s)([^*]+?)\*(?=[\s).,!?:;]|$)/g, "$1<i>$2</i>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\u0000(\d+)\u0000/g, (_, i) => kodlar[+i]);
}

// baslikKaydir: "#" başlığı h(1 + kaydir) olur (not panelinde küçük başlıklar için 2)
function mdHtml(md, { baslikKaydir = 2 } = {}) {
  const satirlar = String(md).replace(/\r/g, "").split("\n");
  let html = "", i = 0, paragraf = [];
  const paragrafiBitir = () => { if (paragraf.length) html += `<p>${paragraf.map(mdSatirIci).join("<br>")}</p>`; paragraf = []; };
  const LISTE = /^\s*([-*+]|\d+[.)])\s+/;
  while (i < satirlar.length) {
    const s = satirlar[i];
    const cit = s.match(/^\s*```(\S*)/);
    if (cit) {
      paragrafiBitir();
      const dil = cit[1].toLowerCase();
      const kod = [];
      i++;
      while (i < satirlar.length && !/^\s*```\s*$/.test(satirlar[i])) kod.push(satirlar[i++]);
      i++;
      const cikti = ["cikti", "çıktı", "text", "output"].includes(dil);
      const govde = cikti || ["bash", "sh"].includes(dil) ? mdKacis(kod.join("\n")) : pythonHtml(kod.join("\n"));
      html += `<div class="md-blok${cikti ? " cikti" : ""}"><span class="md-blok-etiket">${cikti ? "Çıktı" : dil === "bash" ? "Komut" : "Python"}</span>`
        + `<pre class="kod-blok md-kod">${govde}</pre></div>`;
      continue;
    }
    const baslik = s.match(/^(#{1,4})\s+(.*)$/);
    if (baslik) {
      paragrafiBitir();
      const h = Math.min(baslik[1].length + baslikKaydir, 6);
      html += `<h${h}>${mdSatirIci(baslik[2])}</h${h}>`;
      i++;
      continue;
    }
    if (/^\s*(---|\*\*\*)\s*$/.test(s)) { paragrafiBitir(); html += "<hr>"; i++; continue; }
    if (LISTE.test(s)) {
      paragrafiBitir();
      const sirali = /^\s*\d/.test(s);
      html += sirali ? "<ol>" : "<ul>";
      const desen = sirali ? /^\s*\d+[.)]\s+/ : /^\s*[-*+]\s+/;
      while (i < satirlar.length && desen.test(satirlar[i])) {
        let madde = satirlar[i].replace(LISTE, "");
        i++;
        while (i < satirlar.length && /^\s{2,}\S/.test(satirlar[i]) && !LISTE.test(satirlar[i])) madde += " " + satirlar[i++].trim();
        html += `<li>${mdSatirIci(madde)}</li>`;
      }
      html += sirali ? "</ol>" : "</ul>";
      continue;
    }
    if (/^>\s?/.test(s)) {
      paragrafiBitir();
      const alinti = [];
      while (i < satirlar.length && /^>\s?/.test(satirlar[i])) alinti.push(satirlar[i++].replace(/^>\s?/, ""));
      const ek = /^\*\*(Ek bilgi|Dokümantasyondan)/.test(alinti[0] || "");
      html += `<blockquote class="${ek ? "md-ek-bilgi" : ""}">${alinti.map(mdSatirIci).join("<br>")}</blockquote>`;
      continue;
    }
    if (s.trim().startsWith("|") && i + 1 < satirlar.length && /^\s*\|?\s*:?-{2,}/.test(satirlar[i + 1])) {
      paragrafiBitir();
      const hucreler = (x) => x.trim().replace(/^\||\|$/g, "").split("|").map((h) => h.trim());
      const ust = hucreler(s);
      i += 2;
      let govde = "";
      while (i < satirlar.length && satirlar[i].trim().startsWith("|")) {
        govde += `<tr>${hucreler(satirlar[i]).map((h) => `<td>${mdSatirIci(h)}</td>`).join("")}</tr>`;
        i++;
      }
      html += `<div class="md-tablo-kap"><table class="md-tablo"><thead><tr>${ust.map((h) => `<th>${mdSatirIci(h)}</th>`).join("")}</tr></thead><tbody>${govde}</tbody></table></div>`;
      continue;
    }
    if (!s.trim()) { paragrafiBitir(); i++; continue; }
    paragraf.push(s);
    i++;
  }
  paragrafiBitir();
  return html;
}

if (typeof module !== "undefined") module.exports = { mdHtml, mdSatirIci };
