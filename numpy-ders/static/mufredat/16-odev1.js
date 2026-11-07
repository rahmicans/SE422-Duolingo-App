// Bölüm 16 — Ödev 1: sınav kavramları (content/odev1.md). Ders slaytı değil, Homework 1'in "Analysis" kısımları.
// Hoca: "This homework will be embedded in the Midterm exam." Bu bölüm ödevin TAM ÇÖZÜMÜ DEĞİLDİR;
// kavramları gösteren kısa örnekler içerir. Sürüme bağlı sonuçlar bu ortamda (CPython 3.9.6, NumPy 2.0.2) çalıştırılmıştır.
// Kapsam: static/sinav-kapsam.json (u-hw1 → HW1). Sınav formatındaki sorular: ara_sinav.py (kaynak: odev1-taskN)

const HW_ORTAM = "bu ortamda (CPython 3.9.6, NumPy 2.0.2) çalıştırıldı";
const hwBag = (...dersler) => `<p class="hw-bag">🔗 İlgili ders: ${dersler.map(([id, ad]) => `<button class="metin-btn" data-not-ac="${id}">${ad}</button>`).join(" · ")}</p>`;
const HW_UYARI = `<p class="uyari-kutu">📝 <b>Bu bölüm ödevin çözümü değildir.</b> Ödevin "Analysis" kısımlarındaki kavramları sınav için özetler;
  örnekler kavramı göstermeye yetecek kadar kısadır. Ödev metni: <code>content/odev1.md</code></p>`;

UNITELER.push({
  id: "u-hw1", istegeBagli: true, renk: "pembe", baslik: "Ödev 1 – Sınav kavramları", kaynak: "Homework 1", slaytSayisi: 0,
  altBaslik: "Özyineleme, operatör aşırı yükleme, küçük tamsayı önbelleği, kesme ve yuvarlama, broadcasting",
  dersler: [
    {
      id: "hw1-t1", baslik: "Task 1: Özyinelemeli ikili sayaç",
      adimlar: [
        O("Görev ve ikili gösterim", undefined, `${HW_UYARI}
          <p><b>Görev (özet):</b> <code>count_in_binary(n)</code> adlı <b>özyinelemeli</b> bir fonksiyon, 0'dan n'e kadar (n dahil) her sayının ikili gösterimini yazdırır.</p>
          <p>İkili gösterim için iki hazır araç vardır:</p>
          <ul><li><code>bin(n)</code> → başında <code>0b</code> önekiyle string: <code>bin(5)</code> → <code>'0b101'</code></li>
          <li><code>format(n, "b")</code> → öneksiz "temiz" string: <code>'101'</code> (ödevdeki beklenen çıktı biçimi)</li></ul>`,
          { etiket: "Homework 1 · Task 1", kod: "print(bin(5), format(5, 'b'))\nprint(bin(0), format(0, 'b'))\nprint([format(i, 'b') for i in range(4)])" }),
        O("Özyineleme ve çağrı yığını", undefined, `
          <p>Her özyinelemeli çağrı <b>çağrı yığınına (call stack) yeni bir çerçeve (frame)</b> ekler: parametreler, yerel değişkenler ve dönüş adresi. Bu yüzden derinlik d olan özyineleme <b>O(d) bellek</b> kullanır.</p>
          <p>Yinelemeli (döngülü) çözüm tek bir çerçevede çalışır: ek bellek <b>O(1)</b> (sonuçları bir listede toplamıyorsa).</p>
          <p>Aşağıdaki örnek tek bir sayıyı özyinelemeli olarak ikiliye çevirir (ödevin çözümü değil, aynı fikir): <code>n // 2</code> ile problem küçülür, <code>n &lt; 2</code> temel durumdur.</p>`,
          { etiket: "Homework 1 · Task 1", kod: "def ikili(n):\n    if n < 2:              # temel durum\n        return str(n)\n    return ikili(n // 2) + str(n % 2)   # özyinelemeli durum\n\nprint(ikili(13), format(13, 'b'))" }),
        O("Özyineleme sınırı ve RecursionError", undefined, `
          <p>Python sonsuz özyinelemenin belleği tüketmesini önlemek için bir <b>özyineleme sınırı</b> uygular: <code>sys.getrecursionlimit()</code>. Bu değer ${HW_ORTAM}: <b>1000</b>.</p>
          <p>Sınır aşılınca <b>RecursionError</b> fırlatılır. Sayı başına bir çağrı yapan bir sayaç, büyük n için (ör. n = 5000) bu sınıra takılır. <code>sys.setrecursionlimit()</code> ile artırılabilir ama asıl yığın taşmasını önlemez; büyük n için döngü tercih edilir.</p>`,
          { etiket: "Homework 1 · Task 1", kod: "import sys\nprint(sys.getrecursionlimit())\n\ndef derinlik(n):\n    return 0 if n == 0 else 1 + derinlik(n - 1)\n\nprint(derinlik(500))\ntry:\n    derinlik(5000)\nexcept RecursionError as e:\n    print('RecursionError:', e)" }),
        O("Alternatifler: döngü ve generator", undefined, `
          <p>Aynı iş özyineleme olmadan da yapılır:</p>
          <ul><li><b>Döngü:</b> <code>for i in range(n + 1): print(format(i, 'b'))</code> → okunaklı, sabit yığın.</li>
          <li><b>Generator ifadesi:</b> <code>(format(i, 'b') for i in range(n + 1))</code> → değerleri <b>tembel</b> (lazy) üretir; liste kurmaz, O(1) ek bellek.</li></ul>
          <table><tr><th></th><th>Özyineleme</th><th>Döngü / generator</th></tr>
          <tr><td>Zaman</td><td>O(n) çağrı + fonksiyon çağrısı yükü</td><td>O(n), daha az yük</td></tr>
          <tr><td>Yığın belleği</td><td>O(n) çerçeve</td><td>O(1)</td></tr>
          <tr><td>Büyük n</td><td>RecursionError riski</td><td>Sınır yok</td></tr></table>
          <p>${HW_ORTAM.charAt(0).toUpperCase() + HW_ORTAM.slice(1)}: 0–500 arası için özyinelemeli sürüm, liste üreteci sürümünden yaklaşık <b>2 kat</b> yavaş ölçüldü (timeit; makineye göre değişir).</p>
          ${hwBag(["ozyineleme-giris", "Özyinelemeye giriş"], ["ozyineleme-alg", "Özyinelemeli algoritmalar"], ["kontrol-for", "for ve range"])}`,
          { etiket: "Homework 1 · Task 1", kod: "uret = (format(i, 'b') for i in range(5))\nprint(type(uret).__name__)\nprint(list(uret))\nprint(list(uret))   # generator bir kez tüketilir" }),
        C("print(bin(6), format(6, 'b'))", ["0b110 110", "110 0b110", "0b110 0b110", "6 110"], "bin() 0b önekli, format(n, 'b') öneksiz string döndürür."),
        C("def ikili(n):\n    if n < 2:\n        return str(n)\n    return ikili(n // 2) + str(n % 2)\n\nprint(ikili(10))", ["1010", "0101", "0b1010", "10"], "10 → ikili(5) + '0' → ikili(2) + '1' + '0' → '1' + '0' + '1' + '0'."),
        Y("import sys\nprint(sys.getrecursionlimit())", "1000", "Varsayılan özyineleme sınırı (bu ortamda, CPython 3.9.6)."),
        C("def f(n):\n    return 0 if n == 0 else 1 + f(n - 1)\n\ntry:\n    print(f(5000))\nexcept RecursionError:\n    print('RecursionError')", ["RecursionError", "5000", "0", "4999"], "5000 iç içe çağrı varsayılan 1000 sınırını aşar."),
        S("Özyinelemeli bir fonksiyonun her çağrısı bellekte ne oluşturur?", ["Çağrı yığınında yeni bir çerçeve (frame)", "Yeni bir Python süreci", "Hiçbir şey; tek çerçeve paylaşılır", "Diskte geçici bir dosya"], "Her çağrı parametreler ve yerel değişkenler için yeni bir frame ekler: O(n) bellek."),
        DY("Generator ifadesi tüm değerleri önceden bir listede saklar.", false, "Generator değerleri istendikçe (tembel) üretir; liste kurmaz."),
        B("Öneksiz ikili gösterim", "print(___(13, '___'))", ["format", "b"], ["format", "b", "bin", "x"], "format(13, 'b') → '1101'."),
        E(["bin(5)", "'0b101'"], ["format(5, 'b')", "'101'"], ["RecursionError", "sınır aşıldı"], ["generator", "tembel üretim"]),
      ],
    },
    {
      id: "hw1-t2", baslik: "Task 2: Vector sınıfı ve operatör aşırı yükleme",
      adimlar: [
        O("Görev ve dunder metotlar", undefined, `
          <p><b>Görev (özet):</b> 2B bir <code>Vector</code> sınıfı; <code>v1 + v2</code> bileşen bileşen toplasın (<code>__add__</code>), <code>print(v)</code> <code>(x, y)</code> yazsın (<code>__str__</code>).</p>
          <p>Python operatörleri <b>özel (dunder) metotlara</b> çevirir: <code>a + b</code> → <code>a.__add__(b)</code>; <code>print(a)</code> / <code>str(a)</code> → <code>a.__str__()</code>; <code>Vector(1, 2)</code> → <code>__init__</code>.</p>
          <ul><li><code>__str__</code>: kullanıcıya yönelik, okunaklı gösterim (print, str).</li>
          <li><code>__repr__</code>: geliştiriciye yönelik, mümkünse nesneyi yeniden üretebilecek gösterim (konsol, listeler içinde). <code>__str__</code> yoksa print <code>__repr__</code>'ı kullanır.</li></ul>`,
          { etiket: "Homework 1 · Task 2", kod: "class Nokta:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __repr__(self):\n        return f'Nokta({self.x}, {self.y})'\n\np = Nokta(1, 2)\nprint(p)        # __str__ yok → __repr__\nprint([p, p])   # liste içinde her zaman __repr__" }),
        O("NotImplemented ve yansıtılmış metot (__radd__)", undefined, `
          <p><code>a + b</code> için Python önce <code>a.__add__(b)</code>'yi dener. Bu metot <b><code>NotImplemented</code></b> döndürürse ("bu tiple nasıl toplayacağımı bilmiyorum") Python <b>yansıtılmış</b> metodu dener: <code>b.__radd__(a)</code>. İkisi de başarısızsa <b>TypeError</b>.</p>
          <p><code>NotImplemented</code> bir hata değil, özel bir değerdir; <code>raise</code> edilmez, <code>return</code> edilir.</p>
          <p><b>sum() neden __radd__ ister?</b> <code>sum([v1, v2])</code> 0'dan başlar: önce <code>0 + v1</code> hesaplanır. <code>int.__add__</code> Vector'ü bilmez → <code>v1.__radd__(0)</code> denenir. <code>__radd__</code> yoksa TypeError olur.</p>`,
          { etiket: "Homework 1 · Task 2", kod: "class V:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __add__(self, other):\n        if isinstance(other, V):\n            return V(self.x + other.x, self.y + other.y)\n        return NotImplemented\n    def __str__(self):\n        return f'({self.x}, {self.y})'\n\ntry:\n    print(sum([V(1, 2), V(3, 4)]))\nexcept TypeError as e:\n    print('TypeError:', e)" }),
        O("Uç durumlar: skaler toplama ve uyumsuz boyut", undefined, `
          <ul><li><b>Skaler:</b> <code>v + 5</code> anlamlı mı? Tasarım kararıdır: her bileşene eklenebilir ya da <code>NotImplemented</code> ile TypeError'a bırakılır.</li>
          <li><b>0 ile toplama:</b> <code>__radd__</code> içinde <code>other == 0</code> ise <code>self</code> döndürmek <code>sum()</code>'ı çalıştırır.</li>
          <li><b>Uyumsuz boyut:</b> 2B ile 3B vektör toplanırsa sessizce yanlış sonuç vermek yerine açık bir hata (<code>ValueError</code>/<code>TypeError</code>) vermek gerekir.</li></ul>
          ${hwBag(["sinif-tanim", "Sınıf tanımları, __init__, __str__"], ["sinif-ornek", "Örneklerle çalışmak"], ["kalitim-poly", "Çok biçimlilik ve isinstance"])}`,
          { etiket: "Homework 1 · Task 2", kod: "class V:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __add__(self, other):\n        if isinstance(other, V):\n            return V(self.x + other.x, self.y + other.y)\n        if isinstance(other, (int, float)):\n            return V(self.x + other, self.y + other)\n        return NotImplemented\n    def __radd__(self, other):\n        return self + other   # 0 + v ve 5 + v için\n    def __str__(self):\n        return f'({self.x}, {self.y})'\n\nprint(sum([V(1, 2), V(3, 4)]), V(1, 2) + 5, 5 + V(1, 2))" }),
        C("class V:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __add__(self, o):\n        return V(self.x + o.x, self.y + o.y)\n    def __str__(self):\n        return f'({self.x}, {self.y})'\n\nprint(V(1, 2) + V(3, 4))", ["(4, 6)", "(1, 2, 3, 4)", "(3, 4)", "Hata verir"], "__add__ bileşen bileşen toplar, print __str__'ı kullanır."),
        C("class V:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __add__(self, o):\n        return V(self.x + o.x, self.y + o.y)\n\ntry:\n    sum([V(1, 2), V(3, 4)])\n    print('çalıştı')\nexcept TypeError:\n    print('TypeError')", ["TypeError", "çalıştı", "(4, 6)", "0"], "sum 0 + V(1, 2) ile başlar; __radd__ yok → TypeError."),
        C("class N:\n    def __repr__(self):\n        return 'N()'\n\nprint(N(), str(N()))", ["N() N()", "<N object> N()", "Hata verir", "N()"], "__str__ yoksa print ve str, __repr__'ı kullanır."),
        S("__add__ metodu NotImplemented döndürürse Python ne yapar?", ["Diğer operandın yansıtılmış metodunu (__radd__) dener", "Hemen sıfır döndürür", "Programı durdurmadan sonucu None yapar", "NotImplementedError hatasını fırlatır"], "NotImplemented bir sinyaldir; Python b.__radd__(a)'yı dener, o da olmazsa TypeError."),
        DY("sum([v1, v2]) ifadesinin çalışması için Vector sınıfında __radd__ gerekir.", true, "sum 0'dan başlar: 0 + v1 → int bilmez → v1.__radd__(0)."),
        B("Bileşen bileşen toplama", "def __add__(self, other):\n    return Vector(self.x + other.___, self.y + other.___)", ["x", "y"], ["x", "y", "self", "other"], "Her bileşen ayrı toplanır."),
        E(["__init__", "nesneyi başlatır"], ["__add__", "a + b"], ["__radd__", "b + a (yansıtılmış)"], ["__repr__", "geliştirici gösterimi"]),
      ],
    },
    {
      id: "hw1-t3", baslik: "Task 3: CPython küçük tamsayı önbelleği",
      adimlar: [
        O("CPython ve PyLongObject", undefined, `
          <p><b>CPython</b>, Python dilinin <b>C ile yazılmış referans uygulamasıdır</b> (python.org'dan indirilen yorumlayıcı). PyPy, Jython gibi başka uygulamalar da vardır.</p>
          <p>CPython'da her Python <code>int</code> değeri bellekte bir C yapısıdır: <b><code>PyLongObject</code></b> (referans sayacı, tip işaretçisi ve rakamları tutan alanlar). Yani <code>x = 5</code> bir isim ile bir <b>nesne</b> arasında bağ kurar.</p>
          <p><b>Küçük tamsayı önbelleği:</b> CPython başlangıçta <b>-5 ile 256 arası</b> tamsayı nesnelerini önceden oluşturur; bu aralıktaki her değer <b>aynı nesneyi</b> paylaşır. Bu bir uygulama ayrıntısıdır, dil kuralı değildir.</p>`,
          { etiket: "Homework 1 · Task 3", kod: "import sys, platform\nprint(platform.python_implementation(), sys.version.split()[0])\na = int('256'); b = int('256')\nprint(a is b)\na = int('257'); b = int('257')\nprint(a is b)" }),
        O("== ve is: değer eşitliği ve kimlik", undefined, `
          <ul><li><code>a == b</code> → <b>değerleri</b> eşit mi? (<code>__eq__</code>)</li>
          <li><code>a is b</code> → <b>aynı nesne</b> mi? (<code>id(a) == id(b)</code>)</li></ul>
          <p>Önbellek aralığı dışında eşit değerli iki int farklı nesneler olabilir: <code>==</code> True, <code>is</code> False. Bu yüzden <b>sayılar her zaman <code>==</code> ile karşılaştırılır</b>; <code>is</code> yalnızca <code>None</code>, <code>True</code>/<code>False</code> gibi tekil (singleton) nesneler için kullanılır. Sonuç sürüme ve uygulamaya bağlı olduğundan <code>is</code> ile yazılmış sayısal kod taşınabilir değildir.</p>`,
          { etiket: "Homework 1 · Task 3", kod: "a = int('1000')\nb = int('1000')\nprint(a == b, a is b)\nprint(id(a) == id(b))\nx = None\nprint(x is None)" }),
        O("Sabit katlama, kod blokları ve REPL", undefined, `
          <p>Derleyici <b>aynı kod bloğundaki</b> (bir betik/modül ya da tek seferde derlenen hücre) aynı sabitleri tek nesnede birleştirebilir (sabit katlama, constant folding / sabit paylaşımı). Bu yüzden betikte <code>a = 257; b = 257; a is b</code> <b>True</b> çıkabilir.</p>
          <p>Etkileşimli REPL'de her satır <b>ayrı derlenir</b>: <code>&gt;&gt;&gt; a = 257</code> ve <code>&gt;&gt;&gt; b = 257</code> farklı nesneler üretir → <b>False</b>.</p>
          <p>Önbelleği doğru test etmek için değerler <b>çalışma zamanında</b> üretilmelidir: <code>int("257")</code>, <code>int(str(i))</code> gibi. Aşağıdaki örnek iki durumu <code>compile()</code> ile taklit eder; ${HW_ORTAM}.</p>`,
          { etiket: "Homework 1 · Task 3", kod: "ns = {}\nexec(compile('a = 257\\nb = 257', '<betik>', 'exec'), ns)\nprint('tek blok (betik):', ns['a'] is ns['b'])\nns = {}\nexec(compile('a = 257', '<satır1>', 'single'), ns)\nexec(compile('b = 257', '<satır2>', 'single'), ns)\nprint('ayrı satırlar (REPL):', ns['a'] is ns['b'])" }),
        O("NumPy bu iş için uygun mu?", undefined, `
          <p>Hayır. NumPy dizisi Python <code>int</code> <b>nesneleri</b> değil, bitişik bellekte <b>ham değerler</b> (ör. int64) tutar. <code>a[0]</code> her erişimde <b>yeni bir NumPy skaler nesnesi</b> (<code>np.int64</code>) oluşturur; bu nesneler CPython'un küçük tamsayı önbelleğiyle ilgili değildir. Bu yüzden <code>is</code> ile yapılan bir önbellek taraması NumPy'da anlamlı sonuç vermez.</p>
          ${hwBag(["temel-degisken", "Değişkenler ve atama"], ["temel-mantik", "Karşılaştırma ve mantıksal operatörler"], ["n-ndarray", "ndarray'in farkı"])}`,
          { etiket: "Homework 1 · Task 3", kod: "a = np.array([5, 5])\nprint(type(a[0]).__name__, a.dtype)\nprint(a[0] == a[1], a[0] is a[1])\nprint(a[0] is a[0])   # her erişim yeni skaler nesne" }),
        C("a = int('257')\nb = int('257')\nprint(a == b, a is b)", ["True False", "True True", "False False", "False True"], "257 önbellek dışında: değerler eşit, nesneler farklı (bu ortamda CPython 3.9.6)."),
        C("a = int('-5')\nb = int('-5')\nprint(a is b, int('-6') is int('-6'))", ["True False", "True True", "False False", "False True"], "-5 önbellekte, -6 değil (bu ortamda CPython 3.9.6)."),
        C("a = np.array([7, 7])\nprint(a[0] == a[1], a[0] is a[1])", ["True False", "True True", "False False", "Hata verir"], "NumPy her erişimde yeni np.int64 nesnesi oluşturur."),
        S("CPython nedir?", ["Python dilinin C ile yazılmış referans uygulaması", "Python'un C++ ile yazılmış eklentisi", "NumPy'ın derleyicisi", "Python kodunu C koduna çeviren bir IDE"], "python.org'daki standart yorumlayıcı CPython'dur."),
        DY("Sayıları karşılaştırırken is yerine == kullanılmalıdır.", true, "is kimliği test eder; sonuç önbelleğe ve sürüme bağlıdır."),
        B("Çalışma zamanında üretilen değerle kimlik testi", "a = ___('300')\nb = int('300')\nprint(a ___ b)   # değer eşitliği", ["int", "=="], ["int", "==", "is", "str"], "int('300') çalışma zamanında üretilir; değer eşitliği == ile test edilir."),
        E(["CPython", "C ile yazılmış referans uygulama"], ["PyLongObject", "CPython'da int nesnesinin C yapısı"], ["is", "aynı nesne mi?"], ["==", "değerler eşit mi?"]),
      ],
    },
    {
      id: "hw1-t4", baslik: "Task 4: Kesme ve yuvarlama",
      adimlar: [
        O("int() ile kesme, round() ile yuvarlama", undefined, `
          <p><b>Görev (özet):</b> 1000 rastgele ondalıklı sayıyı tekrarlanabilir biçimde üret, <code>int()</code> ve <code>round()</code> ile işleyip karşılaştır.</p>
          <ul><li><code>int(x)</code> <b>sıfıra doğru keser</b> (truncation): <code>int(2.7)</code> → 2, <code>int(-2.7)</code> → <b>-2</b> (aşağı değil, sıfıra doğru).</li>
          <li><code>round(x)</code> <b>en yakın tamsayıya</b> yuvarlar: <code>round(2.7)</code> → 3, <code>round(-2.7)</code> → -3.</li>
          <li>Kesme her zaman sıfıra doğru hata yapar → pozitif verilerde sistematik olarak <b>küçültür</b> (bias).</li></ul>`,
          { etiket: "Homework 1 · Task 4", kod: "for x in [2.7, -2.7, 2.2, -2.2]:\n    print(x, int(x), round(x))" }),
        O("Banker's rounding: yarıyı çifte yuvarlama", undefined, `
          <p>Ondalık kısım tam <b>0.5</b> ise Python 3 <b>en yakın çift sayıya</b> yuvarlar (round half to even, "banker's rounding"):</p>
          <p><code>round(0.5)</code> → 0 · <code>round(1.5)</code> → 2 · <code>round(2.5)</code> → 2 · <code>round(-0.5)</code> → 0</p>
          <p><b>Neden?</b> "Yarıyı hep yukarı" kuralı, çok sayıda .5'li değerde toplamı sistematik olarak büyütür (yukarı yönlü <b>sapma/bias</b>). Çifte yuvarlamada yarılar yarı yarıya aşağı ve yukarı gider, ortalama sapma sıfıra yaklaşır; parasal sistemlerde bu yüzden tercih edilir.</p>
          <p><b>Kayan nokta tuzağı:</b> <code>round(2.675, 2)</code> → <b>2.67</b>; çünkü 2.675 ikili sistemde tam temsil edilemez, gerçekte 2.67499999… olarak saklanır.</p>`,
          { etiket: "Homework 1 · Task 4", kod: "print(round(0.5), round(1.5), round(2.5), round(-0.5))\nyarilar = [i + 0.5 for i in range(10)]\nprint(sum(yarilar), sum(round(x) for x in yarilar), sum(int(x + 0.5) for x in yarilar))\nprint(round(2.675, 2), f'{2.675:.20f}')" }),
        O("Tekrarlanabilirlik ve NumPy", undefined, `
          <p><code>random.seed(42)</code> aynı tohumla <b>aynı sözde rastgele diziyi</b> üretir; deney tekrarlanabilir olur.</p>
          <p>NumPy karşılıkları dizinin tamamında çalışır: <code>np.trunc</code> (sıfıra doğru kesme), <code>np.round</code> ve <code>np.rint</code> (en yakına; <b>NumPy da yarıyı çifte</b> yuvarlar). Sonuçlar float döner (<code>-0.0</code> görülebilir).</p>
          <p><b>Performans:</b> ${HW_ORTAM}, 10<sup>6</sup> değerde timeit ile ölçüldü: liste üzerinde <code>round()</code> ≈ <code>int()</code>'ten 1.1 kat yavaş; <code>np.trunc</code> liste + <code>int()</code>'ten ≈ 130 kat, <code>np.rint</code> liste + <code>round()</code>'tan ≈ 360 kat hızlı. Kesin sayılar makineye göre değişir; büyük farkın nedeni <b>vektörleştirme</b> (döngü C'de, Python nesnesi oluşturmadan).</p>
          ${hwBag(["temel-hesap", "Girdi, hesaplama, int() ile kesme"], ["fonk-global", "random modülü ve seed"], ["np2-ufunc", "Ufunc'lar"])}`,
          { etiket: "Homework 1 · Task 4", kod: "import random\nrandom.seed(42)\nilk = [round(random.uniform(0, 100), 2) for _ in range(3)]\nrandom.seed(42)\nprint(ilk == [round(random.uniform(0, 100), 2) for _ in range(3)])\nx = np.array([2.5, 3.5, -2.5, -2.7])\nprint(np.trunc(x), np.round(x), np.rint(x))" }),
        C("print(int(-2.7), round(-2.7))", ["-2 -3", "-3 -3", "-2 -2", "-3 -2"], "int sıfıra doğru keser, round en yakına yuvarlar."),
        C("print(round(0.5), round(1.5), round(2.5))", ["0 2 2", "1 2 3", "0 1 2", "1 1 3"], "Yarılar en yakın çift sayıya: 0, 2, 2."),
        C("print(round(2.675, 2))", ["2.67", "2.68", "2.7", "2.675"], "2.675 bellekte 2.67499999… olarak saklanır."),
        C("print(np.rint(np.array([0.5, 1.5, 2.5])))", ["[0. 2. 2.]", "[1. 2. 3.]", "[0 2 2]", "[0. 1. 2.]"], "NumPy da yarıyı çifte yuvarlar; sonuç float dizidir."),
        S("Banker's rounding (yarıyı çifte yuvarlama) neden tercih edilir?", ["Çok sayıda .5'li değerde toplamdaki sistematik yukarı sapmayı önlediği için", "Her zaman daha büyük sonuç verdiği için", "Daha hızlı hesaplandığı için", "Negatif sayıları yok saydığı için"], "Yarılar dengeli dağılır, ortalama sapma sıfıra yaklaşır."),
        DY("int(-2.7) ifadesinin sonucu -3'tür.", false, "int sıfıra doğru keser: -2."),
        B("Tekrarlanabilir rastgele sayılar", "import random\nrandom.___(42)", ["seed"], ["seed", "shuffle", "randint"], "Aynı tohum aynı diziyi üretir."),
        E(["int(x)", "sıfıra doğru kesme"], ["round(x)", "yarıyı çifte yuvarlama"], ["np.trunc", "vektörel kesme"], ["np.rint", "vektörel yuvarlama"]),
      ],
    },
    {
      id: "hw1-t5", baslik: "Task 5: NumPy broadcasting ve z-skoru",
      adimlar: [
        O("Broadcasting uyumluluğu", undefined, `
          <p>NumPy iki şekli <b>sağdan sola</b> karşılaştırır; her boyutta değerler <b>eşit</b> ya da biri <b>1</b> olmalıdır (eksik boyutlar soldan 1 sayılır).</p>
          <ul><li><b>(3, 4) + (4,)</b> → (4,) önce (1, 4) olur; 4 = 4, 1 → 3'e esnetilir → <b>(3, 4)</b>: her satıra aynı 4 değer eklenir.</li>
          <li><b>(3, 4) + (3, 1)</b> → 4 ile 1 uyumlu, 3 = 3 → <b>(3, 4)</b>: her sütuna aynı sütun vektörü eklenir.</li>
          <li><b>(3, 4) + (3,)</b> → (3,) = (1, 3); sondaki 4 ≠ 3 ve hiçbiri 1 değil → <b>ValueError</b>.</li></ul>
          <p>Sütun vektörü: <code>a.reshape(3, 1)</code> ya da <code>a[:, np.newaxis]</code>.</p>`,
          { etiket: "Homework 1 · Task 5", kod: "A = np.arange(1, 13).reshape(3, 4)\nprint(A + np.array([10, 20, 30, 40]))\nsutun = np.array([100, 200, 300])[:, np.newaxis]\nprint(sutun.shape, (A + sutun).shape)\ntry:\n    A + np.array([1, 2, 3])\nexcept ValueError as e:\n    print('ValueError')" }),
        O("Toplamalar ve z-skoru (sütun bazında)", undefined, `
          <p><code>X.min()</code> tüm dizinin en küçüğü; <code>X.max(axis=0)</code> her <b>sütunun</b> en büyüğü; <code>X.mean(axis=1)</code> her <b>satırın</b> ortalaması.</p>
          <p><b>Z-skoru (sütun bazında):</b> <code>Z = (X - X.mean(axis=0)) / X.std(axis=0)</code>. <code>X.mean(axis=0)</code> (n_sütun,) şeklindedir ve (n_satır, n_sütun) ile <b>sorunsuz</b> broadcast olur. Sonuçta her sütunun ortalaması 0, standart sapması 1 olur.</p>
          <p><code>np.std</code> varsayılan olarak <b><code>ddof=0</code></b> (popülasyon standart sapması) kullanır; örneklem standart sapması için <code>ddof=1</code> gerekir.</p>`,
          { etiket: "Homework 1 · Task 5", kod: "X = np.array([[1., 2.], [3., 6.], [5., 10.]])\nprint(X.min(), X.max(axis=0), X.mean(axis=1))\nZ = (X - X.mean(axis=0)) / X.std(axis=0)\nprint(Z.mean(axis=0).round(6), Z.std(axis=0))\nprint(np.std([1, 2, 3, 4]), np.std([1, 2, 3, 4], ddof=1))" }),
        O("keepdims=True ne zaman gerekir?", undefined, `
          <p>Satır bazında işlemde (<code>axis=1</code>) özet (n_satır,) şeklinde çıkar ve (n_satır, n_sütun) ile <b>sağdan</b> hizalanamaz → hata (ya da kare matriste sessizce yanlış sonuç!). <code>keepdims=True</code> eksenin yerinde 1 bırakır: (n_satır, 1) → doğru broadcast.</p>
          <p><b>Vektörleştirme</b> iç içe Python döngülerine göre çok hızlıdır (döngü C'de çalışır), kodu kısaltır ve hata riskini azaltır; makine öğrenmesi ön işleme hatlarında (ölçekleme, normalizasyon) standarttır.</p>
          ${hwBag(["np2-ufunc", "Ufunc'lar ve broadcasting"], ["np2-toplama", "Toplama fonksiyonları ve axis"], ["i-reshape", "reshape"])}`,
          { etiket: "Homework 1 · Task 5", kod: "X = np.array([[1., 2.], [3., 6.], [5., 10.]])\nprint(X.mean(axis=1).shape, X.mean(axis=1, keepdims=True).shape)\nsatir = (X - X.mean(axis=1, keepdims=True)) / X.std(axis=1, keepdims=True)\nprint(satir)" }),
        C("A = np.ones((3, 4))\nprint((A + np.arange(3).reshape(3, 1)).shape)", ["(3, 4)", "(3, 1)", "(4, 3)", "Hata verir"], "(3, 1) sütun vektörü 4 sütuna esnetilir."),
        C("A = np.ones((3, 4))\nprint((A + np.arange(3)).shape)", ["Hata verir", "(3, 4)", "(3, 3)", "(4, 3)"], "Sondaki boyutlar 4 ve 3: ikisi de 1 değil → ValueError."),
        C("print(np.std([1, 2, 3, 4]))", ["1.118033988749895", "1.2909944487358056", "1.25", "2.5"], "Varsayılan ddof=0 (popülasyon standart sapması)."),
        C("X = np.array([[1., 2.], [3., 6.], [5., 10.]])\nprint(X.mean(axis=1, keepdims=True).shape)", ["(3, 1)", "(3,)", "(1, 2)", "(2,)"], "keepdims eksenin yerinde 1 bırakır."),
        S("(5, 4) şekilli X için X - X.mean(axis=0) neden sorunsuz çalışır?", ["mean(axis=0) (4,) şeklindedir ve sondaki 4 boyutuyla eşleşir", "NumPy şekilleri soldan karşılaştırdığı için", "mean her zaman tek bir sayı döndürdüğü için", "Hata verir"], "(4,) → (1, 4) → 5 satıra esnetilir."),
        DY("np.std varsayılan olarak örneklem standart sapmasını (ddof=1) hesaplar.", false, "Varsayılan ddof=0'dır."),
        B("Sütun bazında z-skoru", "Z = (X - X.mean(axis=___)) / X.std(axis=___)", ["0", "0"], ["0", "0", "1", "None"], "Sütun bazında: axis=0."),
        E(["(3, 4) + (4,)", "(3, 4)"], ["(3, 4) + (3, 1)", "(3, 4) (iki yönlü)"], ["(3, 4) + (3,)", "ValueError"], ["keepdims=True", "eksende 1 bırakır"]),
      ],
    },
  ],
});
