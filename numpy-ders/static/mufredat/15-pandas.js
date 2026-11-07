// Bölüm 15 — Pandas.md: A Comprehensive Guide to Pandas for Data Science (68 slayt)
//
// Slaytlardaki görseller (PictureN.jpg) Markdown'a aktarılmadı. Görsel olarak gelen örnekler
// slayt başlığı ve metnine göre yeniden yazıldı; çıktılar gerçekten çalıştırılarak doğrulanır.
// Kodlarda pd (pandas) ve np (numpy) terminalde olduğu gibi hazır yüklüdür.

// Titanic veri setinin (datasciencedojo/datasets titanic.csv) ilk 10 satırından seçilmiş sütunlar
const TITANIC_KOD = "df = pd.DataFrame({\n" +
  "    'PassengerId': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],\n" +
  "    'Survived': [0, 1, 1, 1, 0, 0, 0, 0, 1, 1],\n" +
  "    'Pclass': [3, 1, 3, 1, 3, 3, 1, 3, 3, 2],\n" +
  "    'Sex': ['male', 'female', 'female', 'female', 'male', 'male', 'male', 'male', 'female', 'female'],\n" +
  "    'Age': [22, 38, 26, 35, 35, None, 54, 2, 27, 14],\n" +
  "    'Fare': [7.25, 71.2833, 7.925, 53.1, 8.05, 8.4583, 51.8625, 21.075, 11.1333, 30.0708],\n" +
  "    'Embarked': ['S', 'C', 'S', 'S', 'S', 'Q', 'S', 'S', 'S', 'C'],\n" +
  "})\n";

const OGRENCI_KOD = "data = {\n    'Name': ['Alice', 'Bob', 'Charlie', 'David'],\n    'Age': [24, 27, 22, 32],\n    'Major': ['CS', 'Math', 'Physics', 'CS'],\n}\ndf = pd.DataFrame(data)\n";

const EK_BILGI = (metin) => `<p class="ek-bilgi"><b>Dokümantasyondan ek bilgi</b> (pandas.pydata.org/docs): ${metin}</p>`;

UNITELER.push({
  id: "u-pd", renk: "mavi", baslik: "Pandas", kaynak: "Pandas", slaytSayisi: 68,
  altBaslik: "Series, DataFrame, I/O, loc/iloc, filtreleme, eksik veri, merge, groupby, pivot, zaman serileri",
  dersler: [
    {
      id: "pd-giris", baslik: "Pandas nedir, neden Pandas?", slayt: [1, 5],
      adimlar: [
        O("Pandas nedir?", [1, 2], `
          <p>Bu bölüm <b>Dr. Gökçen Tonbul</b>'un "A Comprehensive Guide to Pandas for Data Science" sunumunu (68 slayt) işler.</p>
          <p><b>Pandas</b>, Python için açık kaynaklı, yüksek performanslı bir <b>veri işleme ve analiz</b> kütüphanesidir.</p>
          <p>Adı, ekonometride çok boyutlu yapılandırılmış veri setleri için kullanılan <b>"panel data"</b> teriminden gelir.</p>
          <p>Pandas'ın merkezinde iki temel veri yapısı vardır:</p>
          <ol><li><b>Series:</b> tek boyutlu, etiketli bir dizi.</li>
          <li><b>DataFrame:</b> iki boyutlu, etiketli, boyutu değiştirilebilir ve sütunları farklı tiplerde olabilen (heterojen) tablo yapısı.</li></ol>
          <p><b>Basitçe:</b> Series tek bir sütun, DataFrame ise bu sütunlardan oluşan bir Excel tablosu gibidir; ama her satırın ve sütunun bir <b>etiketi</b> vardır.</p>`),
        O("Neden Pandas? Elektronik tablolarla karşılaştırma", [3, 3], `
          <p>Pandas, standart Python'da veya başka araçlarda zahmetli olan işler için <b>üst düzey, ifade gücü yüksek ve verimli</b> bir arayüz sunar.</p>
          <p><b>Pandas ve Excel gibi elektronik tablolar:</b></p>
          <ul><li>Elektronik tablolar görsel veri girişi ve basit hesaplamalar için mükemmeldir, ama <b>büyük veri setlerinde</b> (ör. 1 milyondan fazla satır) yavaşlar ve kullanışsızlaşır.</li>
          <li>Pandas çok daha büyük veri setlerini rahatça işleyebilir ("Scaling to large datasets").</li>
          <li>Daha önemlisi Pandas işlemleri <b>betiklere yazılır</b>; bu da analizi <b>tekrarlanabilir, test edilebilir ve otomatik</b> yapar. Bu, veri biliminin temel ilkelerinden biridir.</li></ul>`),
        O("Pandas, SQL ve R karşılaştırması", [4, 4], `
          <p><b>Pandas ve SQL:</b> SQL, ilişkisel veritabanlarından veri çekmenin ve sorgulamanın standardıdır. Pandas ise veri çekildikten <b>sonra</b> gelen karmaşık, yinelemeli <b>analiz ve modelleme</b> süreci için tasarlanmıştır. Birçok SQL işleminin (<code>GROUP BY</code>, <code>JOIN</code>) Pandas'ta doğrudan karşılığı vardır, ama Pandas <b>görselleştirme ve makine öğrenmesi</b> kütüphaneleriyle daha akıcı bütünleşir.</p>
          <p><b>Pandas ve R'ın data.frame'i:</b> R'ın <code>data.frame</code> yapısı istatistikte ana itici güçtü. Pandas DataFrame, aynı veri işleme kolaylığını <b>Python ekosistemine</b> getirmek için geliştirildi ve Python'u veri bilimi için uçtan uca kullanılabilir bir dil yaptı.</p>`),
        O("Kurulum ve içe aktarma", [5, 5], `
          <p>Kurulum: <code>pip install pandas</code></p>
          <p>Pandas'ı içe aktarıp sürümünü kontrol etmek için:</p>
          <p>Kural olarak Pandas <code>pd</code> kısaltmasıyla içe aktarılır (NumPy'daki <code>np</code> gibi). Bu uygulamanın terminalinde <code>pd</code> zaten yüklüdür.</p>`,
          { kod: "import pandas as pd\nprint(f\"Pandas version: {pd.__version__}\")" }),
        S("\"Pandas\" adı nereden gelir?", ["Ekonometrideki \"panel data\" teriminden", "Panda hayvanından", "\"Python data analysis\" kısaltmasından", "Bir veritabanı ürününden"], "Slayt 2: panel data, çok boyutlu yapılandırılmış veri setleri için ekonometri terimi."),
        S("Pandas'ın iki temel veri yapısı hangileridir?", ["Series ve DataFrame", "List ve Dict", "ndarray ve matrix", "Table ve Row"], "Slayt 2."),
        S("Pandas'ın elektronik tablolara göre en önemli avantajı slayta göre nedir?", ["İşlemlerin betiklere yazılması sayesinde analizin tekrarlanabilir ve otomatik olması", "Görsel veri girişinin daha kolay olması", "Hiç kod yazmadan çalışması", "Yalnızca küçük veri setleriyle çalışması"], "Slayt 3: reproducible, testable, automated."),
        DY("Pandas, SQL'in yerine veritabanından veri çekmek için tasarlanmıştır.", false, "Slayt 4: Pandas, veri çekildikten SONRAKİ analiz ve modelleme süreci için tasarlanmıştır."),
        DY("SQL'deki GROUP BY ve JOIN işlemlerinin Pandas'ta doğrudan karşılıkları vardır.", true, "Slayt 4."),
        B("Pandas'ı içe aktar", "import ___ as ___", ["pandas", "pd"], ["pandas", "pd", "np", "numpy"], "Kural: import pandas as pd."),
        E(["Series", "tek boyutlu etiketli dizi"], ["DataFrame", "iki boyutlu etiketli tablo"], ["SQL", "veritabanından veri çekme"], ["R data.frame", "Pandas'a ilham veren yapı"]),
      ],
    },
    {
      id: "pd-series", baslik: "Series: oluşturma ve öznitelikler", slayt: [6, 8],
      adimlar: [
        O("Pandas veri modeli: Series", [6, 6], `
          <p><b>Series</b>, tek boyutlu, dizi benzeri bir nesnedir ve <b>DataFrame'in kavramsal yapı taşıdır</b>.</p>
          <p>Onu basit bir diziden ayıran şey, kendisine bağlı bir <b>veri etiketleri dizisi</b>dir; buna <b>index</b> denir.</p>
          <p>Series çeşitli girdilerden oluşturulabilir:</p>
          <ul><li>Python <b>listesinden</b></li><li><b>Sözlükten</b> (dictionary)</li><li><b>Belirtilmiş bir index</b> ile</li></ul>
          <p><b>Basitçe:</b> Series, NumPy dizisi + her elemana bir isim etiketi demektir.</p>`),
        O("Series oluşturmak", [7, 7], `
          <ul><li><b>Listeden:</b> index verilmezse Pandas <b>0, 1, 2, ...</b> şeklinde varsayılan bir index oluşturur.</li>
          <li><b>Sözlükten:</b> sözlüğün <b>anahtarları index</b>, <b>değerleri veri</b> olur.</li>
          <li><b>Belirtilmiş index ile:</b> <code>index=</code> parametresiyle etiketleri kendin verirsin.</li></ul>
          <p>Etiketle erişim: <code>s['b']</code>. Yazdırınca son satırda Series'in <b>dtype</b>'ı görünür.</p>`,
          { kod: "s1 = pd.Series([10, 20, 30])\nprint(s1)\n\ns2 = pd.Series({'Alice': 85, 'Bob': 92})\nprint(s2)\n\ns3 = pd.Series([1.5, 2.5, 3.5], index=['a', 'b', 'c'])\nprint(s3['b'])" }),
        O("Series'in öznitelikleri", [8, 8], `
          <p>Bir Series'i tanımaya yarayan öznitelikler (parantez yok):</p>
          <ul><li><code>s.index</code> → etiketler (Index nesnesi)</li>
          <li><code>s.values</code> → veriler (NumPy dizisi) · <code>s.array</code> → verilerin Pandas dizisi (Alıştırma 1.2'de kullanılır)</li>
          <li><code>s.dtype</code> → veri tipi · <code>s.name</code> → Series'in adı</li>
          <li><code>s.size</code> → eleman sayısı · <code>s.shape</code> → şekil, ör. <code>(3,)</code></li></ul>`,
          { kod: "s = pd.Series([1.5, 2.5, 3.5], index=['a', 'b', 'c'], name='olcum')\nprint(s.index)\nprint(s.values)\nprint(s.dtype, s.name, s.size, s.shape)" }),
        C("s = pd.Series([10, 20, 30])\nprint(s.index.tolist())", ["[0, 1, 2]", "[1, 2, 3]", "[10, 20, 30]", "['10', '20', '30']"], "Index verilmezse varsayılan index 0'dan başlar."),
        C("s = pd.Series({'Alice': 85, 'Bob': 92, 'Charlie': 78})\nprint(s['Bob'])", ["92", "85", "1", "Hata verir"], "Sözlükten oluşturulan Series'te anahtarlar index olur."),
        C("s = pd.Series([4, 7, 1], index=['x', 'y', 'z'])\nprint(s.index.tolist())", ["['x', 'y', 'z']", "[0, 1, 2]", "[4, 7, 1]", "['4', '7', '1']"], "index= ile verilen etiketler kullanılır."),
        Y("s = pd.Series({'a': 1, 'b': 2, 'c': 3, 'd': 4})\nprint(s.size)", "4", "size eleman sayısıdır."),
        C("s = pd.Series([1.5, 2.5])\nprint(s.dtype)", ["float64", "int64", "object", "float32"], "Ondalıklı sayılar float64 olur."),
        Y("s = pd.Series([5, 6, 7], index=['a', 'b', 'c'])\nprint(s.shape)", "(3,)", "Series tek boyutludur: (eleman sayısı,)."),
        S("Series'i basit bir diziden ayıran nedir?", ["Ona bağlı etiket dizisi, yani index", "Yalnızca sayı tutabilmesi", "İki boyutlu olması", "Değiştirilemez olması"], "Slayt 6."),
        DY("Sözlükten Series oluşturulurken sözlüğün anahtarları index olur.", true, "Slayt 7."),
        B("Belirtilmiş index ile Series", "s = pd.___([1, 2, 3], ___=['a', 'b', 'c'])", ["Series", "index"], ["Series", "index", "DataFrame", "columns"], "pd.Series(veri, index=etiketler)."),
        E(["s.index", "etiketler"], ["s.values", "veriler (NumPy dizisi)"], ["s.dtype", "veri tipi"], ["s.size", "eleman sayısı"]),
      ],
    },
    {
      id: "pd-dataframe", baslik: "DataFrame ve veri hizalama", slayt: [9, 12],
      adimlar: [
        O("Pandas veri modeli: DataFrame", [9, 9], `
          <p><b>DataFrame</b>, iki boyutlu, boyutu değiştirilebilir ve sütunları farklı tiplerde olabilen (heterojen) bir <b>tablo yapısıdır</b>. Pandas'ın <b>birincil nesnesidir</b>.</p>
          <p>Kavramsal olarak bir DataFrame, <b>tüm elemanları aynı index'i paylaşan Series nesnelerinden oluşan bir sözlüktür</b>.</p>
          <p><b>Basitçe:</b> her sütun bir Series'tir; sütun adları sözlüğün anahtarları gibidir.</p>`),
        O("DataFrame oluşturmak: listelerden oluşan sözlük", [10, 10], `
          <p>Sıfırdan DataFrame oluşturmanın en yaygın yolu <b>liste veya dizilerden oluşan bir sözlüktür</b>.</p>
          <ul><li>Sözlüğün <b>anahtarları sütun adları</b> olur.</li>
          <li>Tüm listelerin <b>uzunluğu aynı olmalıdır</b> (değilse ValueError).</li></ul>`,
          { kod: OGRENCI_KOD + "print(df)" }),
        O("Series'lerden oluşan sözlükten DataFrame", [11, 11], `
          <p>Bu yöntem <b>hizalama (alignment)</b> özelliğini gösterir: DataFrame'in index'i, tüm Series index'lerinin <b>birleşimi (union)</b> olur.</p>
          <p>Aşağıdaki örnekte <code>'one'</code> Series'inde <code>'d'</code> etiketi olmadığı için <b>'d' satırında 'one' sütunu NaN</b> (Not a Number) olur. Bu bizi Pandas'ın en önemli kavramına getirir.</p>`,
          { kod: "d = {\n    'one': pd.Series([1.0, 2.0, 3.0], index=['a', 'b', 'c']),\n    'two': pd.Series([1.0, 2.0, 3.0, 4.0], index=['a', 'b', 'c', 'd']),\n}\nprint(pd.DataFrame(d))" }),
        O("Temel kavram: içsel veri hizalama", [12, 12], `
          <p>Pandas'ın temel felsefesi: <b>veri hizalama içseldir</b>. Veri etiketleri (index ve sütunlar) ile verinin kendisi arasındaki bağ, sen açıkça koparmadıkça <b>kopmaz</b>.</p>
          <p>Pandas veriyi hem index hem sütun etiketlerine göre otomatik hizalar. Bu tasarım <b>bilgi kaybını önlemek</b> için seçilmiştir. Ör. <code>df1 + df2</code> gibi işlemlerde:</p>
          <ul><li>Sonucun index'i varsayılan olarak iki nesnenin index'lerinin <b>birleşimidir</b>.</li>
          <li>Bir etiket bir nesnede var, diğerinde yoksa sonuç <b>NaN</b> olur.</li></ul>
          <p><b>Neden hizalama?</b> Bu bilinçli ve otomatik NaN üretimi, Excel gibi <b>konuma dayalı</b> araçlarda sık görülen yanlış hesaplamaları önler. Bu "önce hizala" ilkesi <b>birleştirme, aritmetik ve eksik veri</b> işlemlerinin temelidir.</p>`,
          { kod: "a = pd.Series([1, 2, 3], index=['a', 'b', 'c'])\nb = pd.Series([10, 20, 30], index=['b', 'c', 'd'])\nprint(a + b)" }),
        C(OGRENCI_KOD + "print(df.columns.tolist())", ["['Name', 'Age', 'Major']", "[0, 1, 2]", "['Alice', 'Bob', 'Charlie', 'David']", "['data']"], "Sözlüğün anahtarları sütun adları olur."),
        C("d = {\n    'one': pd.Series([1.0, 2.0, 3.0], index=['a', 'b', 'c']),\n    'two': pd.Series([1.0, 2.0, 3.0, 4.0], index=['a', 'b', 'c', 'd']),\n}\ndf = pd.DataFrame(d)\nprint(df.index.tolist())", ["['a', 'b', 'c', 'd']", "['a', 'b', 'c']", "[0, 1, 2, 3]", "['one', 'two']"], "Index, Series index'lerinin birleşimidir."),
        C("a = pd.Series([1, 2, 3], index=['a', 'b', 'c'])\nb = pd.Series([10, 20, 30], index=['b', 'c', 'd'])\nprint((a + b).tolist())", ["[nan, 12.0, 23.0, nan]", "[11, 22, 33]", "[12, 23]", "[11.0, 22.0, 33.0, nan]"], "Etiketlere göre hizalanır: yalnızca b ve c iki Series'te de var; a ve d NaN."),
        Y("a = pd.Series([1, 2, 3], index=['x', 'y', 'z'])\nb = pd.Series([5, 5], index=['y', 'w'])\nprint((a + b).isna().sum())", "3", "Birleşim: w, x, y, z. Yalnızca y iki tarafta da var; diğer 3 etiket NaN."),
        C("df = pd.DataFrame({'a': [1, 2, 3], 'b': [4, 5]})\nprint(df)", ["Hata verir", "   a    b\n0  1  4.0\n1  2  5.0\n2  3  NaN", "   a  b\n0  1  4\n1  2  5", "[1, 2, 3]"], "Listelerden oluşan sözlükte tüm listeler aynı uzunlukta olmalı; değilse ValueError."),
        S("Kavramsal olarak bir DataFrame nedir?", ["Aynı index'i paylaşan Series'lerden oluşan bir sözlük", "Listelerden oluşan bir liste", "Tek boyutlu etiketli dizi", "Bir SQL tablosunun kopyası"], "Slayt 9."),
        S("İki Series toplanırken bir etiket yalnızca birinde varsa sonuçta o etiketin değeri ne olur?", ["NaN", "0", "Var olan değer", "Hata fırlatılır"], "Slayt 12: union of indexes; eksik etiket → NaN."),
        DY("Pandas'ta otomatik hizalama, Excel gibi konuma dayalı araçlarda olabilecek yanlış hesaplamaları önlemek için tasarlanmıştır.", true, "Slayt 12."),
        E(["Sözlük anahtarları", "sütun adları"], ["Index birleşimi", "union"], ["Eksik etiket", "NaN"], ["DataFrame sütunu", "Series"]),
      ],
    },
    {
      id: "pd-inceleme", baslik: "Veriyi incelemek ve betimsel istatistik", slayt: [13, 18],
      adimlar: [
        O("Meta veriyi incelemek: shape, dtypes, info()", [13, 13], `
          <p>Bir DataFrame'i teşhis etmek için üç temel yapı vardır: ikisi <b>öznitelik</b> (parantez yok), biri <b>metot</b> (parantez gerekir).</p>
          <ul><li><code>df.shape</code>: <b>(satır, sütun)</b> tuple'ı döndüren öznitelik. Boyutları kontrol etmenin en hızlı yolu.</li>
          <li><code>df.dtypes</code>: her sütunun veri tipini (float64, int64, object, datetime64[ns] gibi) gösteren bir <b>Series</b> döndüren öznitelik.</li>
          <li><code>df.info()</code>: DataFrame'in kısa özetini <b>yazdıran</b> metot. Hızlı teşhis için tartışmasız en önemli araçtır; çıktısı veri temizliği için bir <b>yapılacaklar listesi</b> sunar.</li></ul>
          <p><b>Veriyi görmek:</b> <code>df.head(n)</code> ilk n satırı, <code>df.tail(n)</code> son n satırı döndürür (n verilmezse <b>5</b>).</p>`,
          { kod: OGRENCI_KOD + "print(df.shape)\nprint(df.dtypes)\nprint(df.head(2))\nprint(df.tail(1))" }),
        O(".info() çıktısını okumak", [14, 14], `
          <p>Aşağıdaki kodu çalıştırınca bu çıktıdan şunlar hemen anlaşılır:</p>
          <ul><li><b>Index tipi:</b> <code>RangeIndex: 4 entries, 0 to 3</code> → 4 satır.</li>
          <li><b>Sütun sayısı:</b> toplam 3 sütun.</li>
          <li><b>Eksik değerler:</b> her sütunun <b>Non-Null Count</b> değeri toplam satır sayısıyla karşılaştırılır. Burada her sütunda 4 non-null var, yani eksik veri yok. Ör. 'Age' sütununda 3 non-null görseydik bu hemen incelenmesi gereken bir işaret olurdu.</li>
          <li><b>Veri tipleri:</b> Name ve Major <code>object</code> (string'lerin varsayılanı), Age <code>int64</code>. Bir 'Price' sütunu object görünseydi, sayısal olmayan karakterler ('$' veya ',' gibi) içerdiği ve temizlenmesi gerektiği anlaşılırdı.</li></ul>
          <p>(Slayttaki çıktı görsel olarak geldiği için örnek yeniden oluşturuldu; slayt metni 4 satırlık tabloda bir yerde "3" der, gerçek çıktıda her sütun 4 non-null'dır.)</p>`,
          { kod: OGRENCI_KOD + "df.info()" }),
        O("Betimsel istatistik: describe()", [15, 15], `
          <p><code>df.describe()</code>, tüm <b>sayısal sütunlar</b> için betimsel istatistiklerden oluşan bir DataFrame döndürür: <b>count, mean, std, min, 25%, 50% (medyan), 75%, max</b>. Örnekte yalnızca 'Age' sütunu görünür.</p>
          <ul><li><b>Merkezi eğilim (central tendency):</b> veri setinin "merkezi" veya tipik değeri. Ortalama (mean), medyan (sıralanmış verinin ortası) ve mod (en sık değer). describe() çıktısında <b>mean ve 50%</b> buraya girer.</li>
          <li><b>Dağılım/yayılım (dispersion):</b> veri noktalarının ne kadar yayıldığı. Standart sapma (ortalamaya ortalama uzaklık), varyans (standart sapmanın karesi) ve aralık (max − min). Çıktıda <b>std, min ve max</b> bilgi verir.</li></ul>`,
          { kod: OGRENCI_KOD + "print(df.describe())" }),
        O("Dağılımın şekli ve yüzdelikler", [16, 16], `
          <p><b>Dağılımın şekli:</b> veri histogramla çizildiğinde nasıl dağıldığı: simetri (ör. normal dağılım), <b>çarpıklık</b> (skewness, sola/sağa yatma) ve <b>basıklık</b> (kurtosis, ne kadar sivri/düz olduğu). describe() bunları doğrudan vermez ama ortalama, medyan ve yüzdeliklerin konumları ipucu verir.</p>
          <p><b>Yüzdelikler</b> (veri küçükten büyüğe sıralandığında):</p>
          <ul><li><b>25. yüzdelik (Q1, birinci çeyrek):</b> verinin %25'i bu değere eşit veya küçüktür.</li>
          <li><b>50. yüzdelik (Q2) = medyan:</b> verinin %50'si bu değere eşit veya küçüktür.</li>
          <li><b>75. yüzdelik (Q3):</b> verinin %75'i bu değere eşit veya küçüktür.</li>
          <li><b>Q3 − Q1 = Çeyrekler Açıklığı (IQR)</b>, başka bir yayılım ölçüsüdür.</li></ul>`,
          { kod: "yas = pd.Series([24, 27, 22, 32])\nq1 = yas.quantile(0.25)\nq3 = yas.quantile(0.75)\nprint(q1, yas.median(), q3)\nprint('IQR:', q3 - q1)" }),
        O("Öznitelikler ve metotlar tablosu", [17, 17], `
          <table><tr><th>Yapı</th><th>Tür</th><th>Ne yapar?</th><th>Örnek çıktı (Titanic)</th></tr>
          <tr><td>df.shape</td><td>Öznitelik</td><td>(satır, sütun) tuple'ı</td><td>(891, 12)</td></tr>
          <tr><td>df.dtypes</td><td>Öznitelik</td><td>Sütun tiplerinden oluşan Series</td><td>Age float64</td></tr>
          <tr><td>df.index</td><td>Öznitelik</td><td>Index nesnesi</td><td>RangeIndex(start=0, stop=891, step=1)</td></tr>
          <tr><td>df.columns</td><td>Öznitelik</td><td>Sütunların Index nesnesi</td><td>Index([...])</td></tr>
          <tr><td>df.head()</td><td>Metot</td><td>İlk 5 satır (DataFrame)</td><td></td></tr>
          <tr><td>df.info()</td><td>Metot</td><td>Özeti yazdırır</td><td></td></tr>
          <tr><td>df.describe()</td><td>Metot</td><td>Sayısal sütunlar için betimsel istatistik</td><td></td></tr></table>`,
          { kod: OGRENCI_KOD + "print(df.index)\nprint(df.columns)" }),
        C(OGRENCI_KOD + "print(df.shape)", ["(4, 3)", "(3, 4)", "12", "(4,)"], "shape (satır, sütun) tuple'ıdır."),
        Y("df = pd.DataFrame({'x': range(12)})\nprint(len(df.head()))", "5", "n verilmezse head() ilk 5 satırı döndürür."),
        C(OGRENCI_KOD + "print(df.tail(2)['Name'].tolist())", ["['Charlie', 'David']", "['Alice', 'Bob']", "['David', 'Charlie']", "['Bob', 'Charlie']"], "tail(2) son iki satırı, sırasını koruyarak döndürür."),
        C(OGRENCI_KOD + "print(df.describe().columns.tolist())", ["['Age']", "['Name', 'Age', 'Major']", "['Name', 'Major']", "[]"], "describe() yalnızca sayısal sütunları özetler (Alıştırma 1.7)."),
        Y("yas = pd.Series([24, 27, 22, 32])\nprint(yas.median())", "25.5", "Sıralı: 22, 24, 27, 32 → ortadaki ikisinin ortalaması (24 + 27) / 2."),
        C(OGRENCI_KOD + "print(df.dtypes['Name'])", ["object", "string", "str", "int64"], "Pandas string sütunlarının varsayılan tipi object'tir."),
        S("Aşağıdakilerden hangisi parantezle çağrılan bir METOTtur?", ["df.info()", "df.shape", "df.dtypes", "df.columns"], "Slayt 13: shape ve dtypes özniteliktir; info() metottur."),
        S("Q3 − Q1 farkına ne ad verilir?", ["Çeyrekler açıklığı (IQR)", "Standart sapma", "Medyan", "Varyans"], "Slayt 16."),
        S("describe() çıktısında merkezi eğilimi gösteren satırlar hangileridir?", ["mean ve 50%", "std ve max", "min ve max", "count ve std"], "Slayt 15."),
        DY("info() çıktısında bir 'Price' sütununun object görünmesi, sütunda '$' veya ',' gibi sayısal olmayan karakterler olabileceğine işaret eder.", true, "Slayt 14."),
        E(["df.shape", "(satır, sütun)"], ["df.dtypes", "sütun tipleri"], ["df.info()", "özet yazdırır"], ["df.describe()", "betimsel istatistik"]),
        K("pandas-temeller", [18, 18]),
      ],
    },
    {
      id: "pd-io", baslik: "Pandas'ta I/O: okuma ve yazma", slayt: [19, 24],
      adimlar: [
        O("Pandas I/O API'si", [19, 20], `
          <p>Dış kaynaklardan DataFrame'e veri yüklemek ve sonuçları dışa aktarmak için Pandas'ın <b>I/O API</b>'si kullanılır. API ikiye ayrılır:</p>
          <ul><li><b>Okuyucu fonksiyonlar:</b> <code>pd.read_csv()</code> gibi Pandas nesnesi döndüren <b>üst düzey fonksiyonlar</b>.</li>
          <li><b>Yazıcı metotlar:</b> <code>df.to_csv()</code> gibi nesnenin içeriğini dosyaya yazan <b>nesne metotları</b>.</li></ul>
          <table><tr><th>Format</th><th>Veri</th><th>Okuyucu</th><th>Yazıcı</th></tr>
          <tr><td>text</td><td>CSV</td><td>pd.read_csv</td><td>df.to_csv</td></tr>
          <tr><td>text</td><td>JSON</td><td>pd.read_json</td><td>df.to_json</td></tr>
          <tr><td>text</td><td>HTML</td><td>pd.read_html</td><td>df.to_html</td></tr>
          <tr><td>binary</td><td>MS Excel</td><td>pd.read_excel</td><td>df.to_excel</td></tr>
          <tr><td>binary</td><td>Parquet</td><td>pd.read_parquet</td><td>df.to_parquet</td></tr>
          <tr><td>SQL</td><td>SQL</td><td>pd.read_sql</td><td>df.to_sql</td></tr></table>`),
        O("CSV ve metin dosyalarını okumak", [21, 21], `
          <p>Düz dosyaları okumak için önemli fonksiyon <code>pd.read_csv()</code>'dir. İlk argümanı <code>filepath_or_buffer</code> esnektir:</p>
          <ul><li><b>Yol:</b> yerel dosya, ör. <code>pd.read_csv('data/my_file.csv')</code></li>
          <li><b>URL:</b> Pandas veriyi doğrudan internetten okuyabilir: <code>pd.read_csv('http://example.com/data.csv')</code></li>
          <li><b>Dosya benzeri nesne:</b> <code>.read()</code> metodu olan herhangi bir nesne, ör. açık dosya veya <code>io.StringIO</code> tamponu. Bu "tampon" yeteneği Pandas'ı web API'lerinden, zip dosyalarından ve bellekteki metinden okuyabilen güçlü bir entegrasyon aracı yapar.</li></ul>
          <p><b>Parametreler bir veri temizleme aracıdır:</b> veriyi okurken temizlemek, dağınık veriyi yükleyip bellekte temizlemekten çok daha verimlidir.</p>
          <ul><li><code>sep</code>: ayırıcı (varsayılan <code>,</code>; TSV için <code>sep='\\t'</code>)</li>
          <li><code>header</code>: sütun adı olarak kullanılacak satır (ör. <code>header=0</code>); başlık satırı yoksa <code>header=None</code></li>
          <li><code>index_col</code>: satır index'i olacak sütun, ör. <code>index_col='PassengerId'</code></li>
          <li><code>usecols</code>: yalnızca istenen sütunları yükler; <b>bellek tasarrufu</b> sağlar</li>
          <li><code>parse_dates</code>: datetime'a çevrilecek sütunlar; zaman serisi analizi için gerekli</li>
          <li><code>na_values</code>: NaN olarak tanınacak string'ler</li></ul>
          <p>Aşağıdaki örnek, dosya yerine <code>io.StringIO</code> tamponundan okur (bu ortamda internet erişimi gerekmesin diye).</p>`,
          { kod: "import io\nmetin = '''PassengerId,Survived,Pclass,Age,Date\n1,0,3,22,2024-01-05\n2,1,1,?,2024-01-06\n3,1,3,26,2024-01-07'''\ndf = pd.read_csv(io.StringIO(metin), index_col='PassengerId',\n                 usecols=['PassengerId', 'Survived', 'Age', 'Date'],\n                 na_values=['?'], parse_dates=['Date'])\nprint(df)\nprint(df.dtypes)" }),
        O("Excel dosyalarını okumak", [22, 22], `
          <p><code>pd.read_excel()</code> Microsoft Excel (.xls ve .xlsx) dosyalarını okur. Bu fonksiyon <b>openpyxl</b> gibi ek bir kütüphane gerektirir.</p>
          <ul><li><code>io</code>: yol, URL veya dosya benzeri nesne.</li>
          <li><code>sheet_name</code>: hangi sayfanın okunacağı:
            <ul><li><code>sheet_name=0</code>: ilk sayfa (varsayılan)</li>
            <li><code>sheet_name='Sheet1'</code>: sayfayı adıyla okur</li>
            <li><code>sheet_name=None</code>: <b>tüm sayfaları</b> bir <b>sözlüğe</b> okur; anahtarlar sayfa adları, değerler DataFrame'lerdir.</li></ul></li></ul>
          <p>Örnek: <code>pd.read_excel('dosya.xlsx', sheet_name='Data')</code></p>
          <p>(Bu uygulamanın ortamında openpyxl kurulu olmadığı için Excel örneği terminalde çalıştırılamaz.)</p>`),
        O("Veri yazmak: index=False", [23, 23], `
          <p>Veri <code>df.to_*</code> metotlarıyla dışa aktarılır; en yaygını <code>df.to_csv()</code>.</p>
          <p><b>En önemli parametre: index=False.</b> Varsayılan olarak <code>to_csv()</code> DataFrame'in index'ini (0, 1, 2...) dosyaya <b>ilk sütun</b> olarak yazar. Dosya tekrar <code>pd.read_csv()</code> ile okununca bu adsız index sütunu genellikle <b>"Unnamed: 0"</b> adında yeni bir sütun olarak yüklenir.</p>
          <p>Bu nadiren istenen davranıştır. Bunu önlemek için CSV'ye yazarken <b>neredeyse her zaman index=False</b> kullan:</p>
          <p><code>df.to_csv('output/my_clean_data.csv', index=False)</code></p>`,
          { kod: "df = pd.DataFrame({'Name': ['Ada', 'Can'], 'Age': [30, 25]})\ndf.to_csv('my_clean_data.csv')\nprint(pd.read_csv('my_clean_data.csv').columns.tolist())\ndf.to_csv('my_clean_data.csv', index=False)\nprint(pd.read_csv('my_clean_data.csv').columns.tolist())" }),
        C("df = pd.DataFrame({'a': [1, 2]})\ndf.to_csv('t.csv')\nprint(pd.read_csv('t.csv').columns.tolist())", ["['Unnamed: 0', 'a']", "['a']", "['index', 'a']", "[0, 'a']"], "index=False verilmezse index adsız bir sütun olarak yazılır ve 'Unnamed: 0' olarak geri gelir."),
        C("df = pd.DataFrame({'a': [1, 2]})\ndf.to_csv('t.csv', index=False)\nprint(pd.read_csv('t.csv').shape)", ["(2, 1)", "(2, 2)", "(1, 2)", "(3, 1)"], "index=False ile yalnızca 'a' sütunu yazılır."),
        C("import io\nmetin = 'id,ad,yas\\n7,Ada,30\\n9,Can,25'\ndf = pd.read_csv(io.StringIO(metin), index_col='id')\nprint(df.index.tolist())", ["[7, 9]", "[0, 1]", "['ad', 'yas']", "[1, 2]"], "index_col='id' bu sütunu satır index'i yapar."),
        C("import io\nmetin = 'a,b,c\\n1,2,3\\n4,5,6'\ndf = pd.read_csv(io.StringIO(metin), usecols=['a', 'c'])\nprint(df.columns.tolist())", ["['a', 'c']", "['a', 'b', 'c']", "['b']", "['c', 'a']"], "usecols yalnızca istenen sütunları yükler."),
        Y("import io\nmetin = 'x\\n5\\n?\\n7'\ndf = pd.read_csv(io.StringIO(metin), na_values=['?'])\nprint(df['x'].isna().sum())", "1", "na_values içindeki '?' NaN olarak okunur."),
        S("Sekmeyle ayrılmış (TSV) bir dosya okunurken hangi parametre kullanılır?", ["sep='\\t'", "header='\\t'", "na_values='\\t'", "index_col='\\t'"], "Slayt 21."),
        S("pd.read_excel(..., sheet_name=None) ne döndürür?", ["Anahtarları sayfa adları olan, DataFrame'lerden oluşan bir sözlük", "Yalnızca ilk sayfa", "Boş bir DataFrame", "Hata"], "Slayt 22."),
        S("JSON dosyasını okumak için hangi okuyucu fonksiyon kullanılır?", ["pd.read_json", "df.to_json", "pd.read_html", "pd.json"], "Slayt 20: okuyucular pd.read_*, yazıcılar df.to_*."),
        DY("read_csv parametreleriyle veriyi okurken temizlemek, dağınık veriyi yükleyip bellekte temizlemekten daha verimlidir.", true, "Slayt 21."),
        DY("pd.read_csv() yalnızca yerel dosya yolu kabul eder; URL veya tampon okuyamaz.", false, "Slayt 21: yol, URL veya .read() metodu olan dosya benzeri nesne."),
        E(["usecols", "yalnızca bazı sütunlar"], ["index_col", "satır index'i olacak sütun"], ["parse_dates", "datetime'a çevir"], ["na_values", "NaN sayılacak string'ler"]),
        K("pandas-io", [24, 24]),
      ],
    },
    {
      id: "pd-secim", baslik: "İndeksleme ve veri seçimi: [], loc, iloc", slayt: [25, 31],
      adimlar: [
        O("Pandas neden etiket kullanır?", [25, 25], `
          <p>Pandas nesnelerindeki <b>index ve sütun etiketleri</b> yalnızca meta veri değildir. Üç ayrı ve kritik amaca hizmet ederler:</p>
          <ol><li><b>Tanımlama (meta veri):</b> analiz ve görselleştirme için insan tarafından okunabilir etiketler sağlar.</li>
          <li><b>Hizalama:</b> işlemler sırasında otomatik veri hizalamayı mümkün kılar.</li>
          <li><b>Seçim:</b> verinin alt kümelerini etiketle sezgisel biçimde almayı ve değiştirmeyi (getting and setting) sağlar.</li></ol>`),
        O("Sütun seçmek", [26, 26], `
          <ul><li><b>Tek sütun:</b> <code>df['Age']</code> → bir <b>Series</b> döner.</li>
          <li><b>Birden çok sütun:</b> <code>df[['Age', 'Name']]</code> (çift köşeli parantez, içteki bir liste) → bir <b>DataFrame</b> döner.</li></ul>
          <p>Köşeli parantez seçimi satır dilimleme (<code>df[0:5]</code>) ve boolean filtreleme (<code>df[df['Age'] &gt; 30]</code>) için de kullanılabilir. Bu belirsizlik güçlüdür ama kafa karıştırabilir. Açıklık ve üretim kodu için <b>açık erişim metotları</b> (loc, iloc) tercih edilir.</p>`,
          { kod: OGRENCI_KOD + "age_series = df['Age']\nprint(type(age_series))\nage_name_df = df[['Age', 'Name']]\nprint(type(age_name_df))" }),
        O(".loc (etikete dayalı) ve .iloc (konuma dayalı)", [27, 27], `
          <p><code>.loc</code> ve <code>.iloc</code> erişimcileri Pandas'a <b>daha açık, konum temelli indeksleme</b> getirir. Üretim kodu için bu optimize metotlar önerilir.</p>
          <p>Söz dizimi: <code>df.loc[satir_etiketleri, sutun_etiketleri]</code> · <code>df.iloc[satir_konumlari, sutun_konumlari]</code></p>
          <p><b>Basitçe:</b> <b>loc</b> "adıyla çağır", <b>iloc</b> "sırasıyla (integer location) çağır" demektir.</p>`,
          { kod: "df = pd.DataFrame({'Age': [24, 27, 22], 'Major': ['CS', 'Math', 'Physics']},\n                  index=['Alice', 'Bob', 'Charlie'])\nprint(df.loc['Bob', 'Age'])\nprint(df.iloc[1, 0])" }),
        O(".loc kullanımı", [28, 28], `
          <ul><li>Tek satır: <code>df.loc['Bob']</code> → Series</li>
          <li>Satır ve sütun: <code>df.loc['Bob', 'Age']</code> → tek değer</li>
          <li>Etiket listesi: <code>df.loc[['Alice', 'Charlie'], ['Age']]</code></li>
          <li>Dilim: <code>df.loc['Alice':'Bob', 'Age']</code> → <b>bitiş etiketi dahildir</b>.</li>
          <li>Boolean maske: <code>df.loc[df['Age'] &gt; 23, 'Major']</code></li></ul>`,
          { kod: "df = pd.DataFrame({'Age': [24, 27, 22], 'Major': ['CS', 'Math', 'Physics']},\n                  index=['Alice', 'Bob', 'Charlie'])\nprint(df.loc['Bob'])\nprint(df.loc['Alice':'Bob', 'Age'])\nprint(df.loc[df['Age'] > 23, 'Major'])" }),
        O(".iloc kullanımı", [29, 29], `
          <ul><li>İlk satır: <code>df.iloc[0]</code> · son satır: <code>df.iloc[-1]</code></li>
          <li>Satır ve sütun konumu: <code>df.iloc[0, 1]</code></li>
          <li>Dilim: <code>df.iloc[0:2]</code> → 0 ve 1. satırlar; <b>bitiş konumu hariçtir</b> (Python dilimleme gibi).</li>
          <li>Konum listeleri: <code>df.iloc[[0, 2], [1]]</code></li>
          <li>Tüm satırlar, ilk sütun: <code>df.iloc[:, 0]</code></li></ul>`,
          { kod: "df = pd.DataFrame({'Age': [24, 27, 22], 'Major': ['CS', 'Math', 'Physics']},\n                  index=['Alice', 'Bob', 'Charlie'])\nprint(df.iloc[0, 1])\nprint(df.iloc[0:2])\nprint(df.iloc[:, 0].tolist())" }),
        O("loc ve iloc karşılaştırması; ne zaman hangisi?", [30, 31], `
          <table><tr><th>Özellik</th><th>loc</th><th>iloc</th></tr>
          <tr><td>İndeksleme temeli</td><td>Etiket (satır/sütun etiketleri)</td><td>Konum (tam sayı konumlar)</td></tr>
          <tr><td>Kapsayıcılık</td><td>Dilimde başlangıç <b>ve bitiş dahil</b></td><td>Dilimde bitiş <b>hariç</b></td></tr>
          <tr><td>Satır seçimi</td><td>Index etiketleri (string olabilir)</td><td>Tam sayı konumlar (0, 1, 2, ...)</td></tr>
          <tr><td>Sütun seçimi</td><td>Sütun etiketleri</td><td>Tam sayı konumlar</td></tr></table>
          <p><b>loc kullan:</b> satır/sütunların belirli etiketleri varsa ve onlarla doğrudan çalışmak istiyorsan; veri setinin index'i sayısal değilse (string, datetime).</p>
          <p><b>iloc kullan:</b> sayısal konumlarla çalışıyorsan ve satır/sütun adlarına ihtiyacın yoksa; veriyi yapı içindeki konumuna göre seçmek istiyorsan.</p>`,
          { kod: "df = pd.DataFrame({'x': [10, 20, 30, 40, 50]})\nprint(len(df.loc[1:3]))\nprint(len(df.iloc[1:3]))" }),
        C(OGRENCI_KOD + "print(type(df['Age']).__name__)", ["Series", "DataFrame", "list", "ndarray"], "Tek sütun seçimi Series döndürür."),
        C(OGRENCI_KOD + "print(type(df[['Age', 'Name']]).__name__)", ["DataFrame", "Series", "list", "tuple"], "Sütun listesi (çift köşeli parantez) DataFrame döndürür."),
        C("df = pd.DataFrame({'x': [10, 20, 30, 40, 50]})\nprint(df.loc[1:3, 'x'].tolist())", ["[20, 30, 40]", "[20, 30]", "[10, 20, 30]", "[10, 20, 30, 40]"], "loc'ta bitiş etiketi dahildir."),
        C("df = pd.DataFrame({'x': [10, 20, 30, 40, 50]})\nprint(df.iloc[1:3, 0].tolist())", ["[20, 30]", "[20, 30, 40]", "[10, 20, 30]", "[30, 40]"], "iloc'ta bitiş konumu hariçtir."),
        Y("df = pd.DataFrame({'Age': [24, 27, 22], 'Major': ['CS', 'Math', 'Physics']},\n                  index=['Alice', 'Bob', 'Charlie'])\nprint(df.loc['Charlie', 'Major'])", "Physics", "loc[satır etiketi, sütun etiketi]."),
        Y("df = pd.DataFrame({'Age': [24, 27, 22], 'Major': ['CS', 'Math', 'Physics']},\n                  index=['Alice', 'Bob', 'Charlie'])\nprint(df.iloc[-1, 0])", "22", "Son satır, ilk sütun."),
        C("df = pd.DataFrame({'Age': [24, 27]}, index=['Alice', 'Bob'])\nprint(df.iloc['Bob'])", ["Hata verir", "Age    27\nName: Bob, dtype: int64", "27", "1"], "iloc yalnızca tam sayı konum kabul eder; etiket için loc gerekir (TypeError)."),
        S("Index'i string etiketlerden oluşan bir veri setinde satırları adlarıyla seçmek için hangisi uygundur?", ["loc", "iloc", "df[0]", "head"], "Slayt 31."),
        S("Pandas'ta index ve sütun etiketlerinin üç amacı hangileridir?", ["Tanımlama, hizalama, seçim", "Sıralama, silme, kopyalama", "Şifreleme, sıkıştırma, yazma", "Çizim, kaydetme, okuma"], "Slayt 25."),
        DY("df.loc['a':'c'] dilimi 'c' etiketli satırı da içerir.", true, "loc dilimlerinde bitiş dahildir."),
        B("Konuma göre ilk iki satır ve ilk sütun", "df.___[0:2, ___]", ["iloc", "0"], ["iloc", "0", "loc", "'Age'"], "iloc tam sayı konumlarla çalışır."),
        E(["loc", "etiket temelli, bitiş dahil"], ["iloc", "konum temelli, bitiş hariç"], ["df['Age']", "Series"], ["df[['Age']]", "DataFrame"]),
      ],
    },
    {
      id: "pd-filtre", baslik: "Boolean indeksleme (filtreleme)", slayt: [32, 35],
      adimlar: [
        O("Boolean indeksleme ve sık yapılan hata", [32, 32], `
          <p>Boolean indeksleme (koşullu seçim), veri filtrelemede <b>if-then ifadesinin vektörleştirilmiş karşılığıdır</b>.</p>
          <p>Yeni başlayanların sık yaptığı hata, bir Series üzerinde standart <code>if</code> kullanmaktır: <code>if df['Age'] &gt; 30: ...</code></p>
          <p>Bu, <b>ValueError: The truth value of a Series is ambiguous</b> hatasıyla başarısız olur. Çünkü bütün bir Series'in tek başına True mu False mu olduğunu değerlendirmek imkânsızdır.</p>
          <p>Aşağıdaki kod bu hatayı bilerek üretir:</p>`,
          { hataBeklenir: true, kod: "df = pd.DataFrame({'Age': [22, 38, 26]})\nif df['Age'] > 30:\n    print('yaşlı')" }),
        O("Doğru yol: maske + uygulama", [33, 33], `
          <p>Doğru, vektörleştirilmiş yaklaşım iki adımlıdır:</p>
          <ol><li><b>Koşul (maske):</b> koşulu bir <b>boolean Series</b> olarak oluştur; her satır için True veya False içerir.</li>
          <li>Maskeyi DataFrame'e <code>df[mask]</code> veya <code>df.loc[mask]</code> ile uygula.</li></ol>
          <p>NumPy'daki maskelemeyle aynı fikirdir, ama sonuç satır etiketlerini (index) korur.</p>`,
          { kod: TITANIC_KOD + "mask = df['Age'] > 30\nprint(mask.tolist())\nprint(df[mask])\nprint(df.loc[mask, 'Sex'].tolist())" }),
        O("Bit düzeyinde operatörler: &, |, ~", [34, 34], `
          <p>Birden çok koşulu birleştirmek için Python'un <code>and</code>, <code>or</code>, <code>not</code> anahtar kelimeleri değil, bit düzeyinde operatörler kullanılır:</p>
          <ul><li><code>&amp;</code> → ve (and)</li><li><code>|</code> → veya (or)</li><li><code>~</code> → değil (not)</li></ul>
          <p>Operatör önceliği nedeniyle <b>her koşul parantez içine alınmalıdır</b>: <code>df[(df['Age'] &gt; 30) &amp; (df['Sex'] == 'male')]</code></p>`,
          { kod: TITANIC_KOD + "print(df[(df['Age'] > 30) & (df['Sex'] == 'male')])\nprint(len(df[(df['Pclass'] == 1) | (df['Fare'] > 25)]))\nprint(df[~(df['Survived'] == 1)]['PassengerId'].tolist())" }),
        C("df = pd.DataFrame({'Age': [22, 38, 26, 35]})\nprint(df[df['Age'] > 30]['Age'].tolist())", ["[38, 35]", "[22, 26]", "[False, True, False, True]", "[35, 38]"], "Maske True olan satırlar, sırası korunarak seçilir."),
        C("df = pd.DataFrame({'Age': [22, 38, 26, 35]})\nprint((df['Age'] > 30).tolist())", ["[False, True, False, True]", "[38, 35]", "[True, False, True, False]", "2"], "Koşul her satır için True/False içeren bir boolean Series'tir."),
        C("df = pd.DataFrame({'Age': [22, 38, 26, 35]})\nprint(df[df['Age'] > 30].index.tolist())", ["[1, 3]", "[0, 1]", "[38, 35]", "[0, 2]"], "Filtreleme orijinal index etiketlerini korur."),
        Y(TITANIC_KOD + "print(len(df[(df['Sex'] == 'female') & (df['Survived'] == 1)]))", "5", "Kadın VE hayatta kalan: 2, 3, 4, 9, 10 numaralı yolcular."),
        Y(TITANIC_KOD + "print(len(df[~(df['Pclass'] == 3)]))", "4", "3. sınıf olmayanlar: 1. sınıf (3 kişi) + 2. sınıf (1 kişi)."),
        C("df = pd.DataFrame({'Age': [22, 38]})\nprint(df[df['Age'] > 20 and df['Age'] < 30])", ["Hata verir", "   Age\n0   22", "Empty DataFrame\nColumns: [Age]\nIndex: []", "[22]"], "and bir Series'i tek bir True/False'a indirgemeye çalışır → ValueError (ambiguous). & kullanılmalı."),
        S("if df['Age'] > 30: neden hata verir?", ["Bütün bir Series'in tek bir True/False olarak değerlendirilmesi belirsiz olduğu için", "if Pandas'ta yasak olduğu için", "> operatörü Series'te çalışmadığı için", "Age sütunu string olduğu için"], "Slayt 32: The truth value of a Series is ambiguous."),
        S("Pandas filtrelemede 'veya' için hangi operatör kullanılır?", ["|", "or", "||", "+"], "Slayt 34."),
        DY("Bileşik koşullarda her koşul parantez içine alınmalıdır.", true, "& ve | karşılaştırma operatörlerinden önce işlenir; parantez gerekir."),
        B("30 yaşından büyük erkekleri seç", "df[(df['Age'] > 30) ___ (df['Sex'] ___ 'male')]", ["&", "=="], ["&", "==", "and", "="], "Ve için &, eşitlik için ==."),
        SR("Boolean filtrelemenin adımlarını sırala", ["Koşulu yaz: df['Age'] > 30", "Boolean Series (maske) oluşur", "Maskeyi uygula: df[mask]"], ["if df['Age'] > 30:"], " → ", "Slayt 33: önce maske, sonra uygulama."),
        K("pandas-secim", [35, 35]),
      ],
    },
    {
      id: "pd-eksik", baslik: "Eksik veri: NaN, NaT, None ve tespit", slayt: [36, 39],
      adimlar: [
        O("Pandas'ta eksik veri gösterimleri", [36, 36], `
          <p>Pandas, sütunun <b>dtype</b>'ına göre eksik veriyi temsil etmek için farklı "nöbetçi" (sentinel) değerler kullanır:</p>
          <ul><li><code>np.nan</code>: birincil nöbetçi. <b>"Not a Number"</b> anlamına gelir ve <b>float</b> tipindedir.</li>
          <li><code>pd.NaT</code>: <b>"Not a Time"</b>; datetime ve timedelta sütunlarında eksik değerdir.</li>
          <li><code>None</code>: Python'un None nesnesi; <b>object</b> dtype'lı sütunlarda eksik veri işaretidir.</li></ul>`,
          { kod: "print(type(np.nan))\nprint(pd.to_datetime(['2024-01-01', None]))\nprint(pd.Series(['a', None]))" }),
        O("NaN bir float'tır: upcast ve nullable tipler", [37, 37], `
          <p><code>np.nan</code>'ın temel (ve çoğu zaman kafa karıştıran) özelliği <b>float olmasıdır</b>.</p>
          <p>Bu yüzden bir tam sayı sütununda <b>tek bir eksik değer</b> bile olsa Pandas (ve NumPy) np.nan'ı tam sayı dizisinde saklayamaz; NaN'a yer açmak için tüm sütun <b>float64'e yükseltilir (upcast)</b>.</p>
          <p><b>Modern çözüm: nullable dtype'lar.</b> Pandas'ın yeni sürümleri tam sayı, boolean veya string'i yerel eksik değer işareti <code>pd.NA</code> ile birlikte saklayabilen tipler sunar. Bunları açıkça, genellikle <b>büyük harfli</b> takma adla istemelisin:</p>
          <ul><li><code>dtype='Int64'</code> (büyük 'I'ye dikkat)</li><li><code>dtype='boolean'</code> (slaytta 'Boolean' yazılmış; pandas her iki yazımı da kabul eder)</li><li><code>dtype='string'</code></li></ul>
          <p><code>dtype='Int64'</code> olan bir Series, float'a yükseltilmeden tam sayılar ve <code>pd.NA</code> tutabilir.</p>`,
          { kod: "s = pd.Series([1, 2, None])\nprint(s.dtype)\nprint(s.tolist())\nt = pd.Series([1, 2, None], dtype='Int64')\nprint(t)" }),
        O("Eksik veriyi bulmak: isna() ve sum()", [38, 39], `
          <p>Eksik veriyi tespit etmenin iki anahtar metodu vardır; <b>ikisi aynıdır</b>:</p>
          <ul><li><code>df.isna()</code>: boolean'lardan oluşan bir DataFrame döndürür (değer eksikse True).</li>
          <li><code>df.isnull()</code>: <code>df.isna()</code>'nın takma adıdır (alias).</li></ul>
          <p>En yaygın ve pratik kalıp bunu <code>.sum()</code> ile zincirlemektir. True değerler 1, False değerler 0 sayıldığı için sonuç <b>sütun başına eksik veri sayısı</b> olur.</p>`,
          { kod: TITANIC_KOD + "print(df.isna().head(7))\nprint(df.isna().sum())" }),
        C("s = pd.Series([1, 2, None])\nprint(s.dtype)", ["float64", "int64", "object", "Int64"], "Tek bir NaN bile int sütununu float64'e yükseltir."),
        C("s = pd.Series([1, 2, None], dtype='Int64')\nprint(s.dtype)", ["Int64", "float64", "int64", "object"], "Nullable Int64 tipi pd.NA ile tam sayıları korur."),
        C("print(type(np.nan).__name__)", ["float", "NoneType", "int", "str"], "np.nan float tipindedir."),
        Y("df = pd.DataFrame({'a': [1, None, 3], 'b': [None, None, 6]})\nprint(df.isna().sum().tolist())", "[1, 2]", "isna().sum() sütun başına eksik değer sayısıdır."),
        Y("df = pd.DataFrame({'a': [1, None, 3], 'b': [None, None, 6]})\nprint(df.isnull().sum().sum())", "3", "isnull, isna ile aynıdır; ikinci sum toplam eksik sayısını verir."),
        C("print(pd.isna(pd.NaT))", ["True", "False", "NaT", "Hata verir"], "NaT, datetime sütunlarının eksik değeridir."),
        S("datetime sütunlarında eksik değer nasıl gösterilir?", ["pd.NaT", "np.nan", "None", "pd.NA"], "Slayt 36."),
        S("df.isnull() ile df.isna() arasındaki fark nedir?", ["Fark yoktur; isnull, isna'nın takma adıdır", "isnull yalnızca None'ları bulur", "isna yalnızca NaN'ları bulur", "isnull sayıları, isna string'leri kontrol eder"], "Slayt 38."),
        DY("Bir int64 sütununa tek bir NaN eklenirse sütun float64 olur.", true, "Slayt 37: upcast."),
        DY("Nullable tam sayı tipi küçük harfle dtype='int64' diye istenir.", false, "Nullable tip büyük harfli 'Int64'tür; 'int64' NumPy'ın normal tam sayı tipidir."),
        E(["np.nan", "float tipi eksik değer"], ["pd.NaT", "eksik zaman"], ["None", "object sütunlarında eksik"], ["pd.NA", "nullable tiplerin eksik değeri"]),
      ],
    },
    {
      id: "pd-doldur", baslik: "Eksik veriyi silmek ve doldurmak", slayt: [40, 44],
      adimlar: [
        O("Eksik değerleri silmek: dropna()", [40, 41], `
          <p><code>df.dropna()</code> eksik veri içeren <b>satırları veya sütunları</b> silmek için kullanılır. Anahtar parametreler:</p>
          <ul><li><code>axis=0</code> (varsayılan): en az bir NaN içeren <b>satırları</b> siler.</li>
          <li><code>axis=1</code>: en az bir NaN içeren <b>sütunları</b> siler.</li>
          <li><code>how='any'</code> (varsayılan): herhangi bir değer NaN ise siler.</li>
          <li><code>how='all'</code>: yalnızca <b>tüm</b> değerleri NaN ise siler.</li>
          <li><code>thresh</code>: tam sayı; en az <code>thresh</code> tane eksik olmayan değeri olan satır/sütunları <b>tutar</b> (ör. <code>thresh=5</code> en az 5 geçerli değeri olanları tutar).</li></ul>`,
          { kod: "df = pd.DataFrame({'A': [1, None, 3, None],\n                   'B': [4, None, None, 8],\n                   'C': [7, None, 9, 10]})\nprint(df.dropna())\nprint(df.dropna(how='all'))\nprint(df.dropna(axis=1, thresh=3))" }),
        O("Eksik veriyi doldurmak: fillna()", [42, 43], `
          <p>Veri silmek çoğu zaman ideal değildir, çünkü o satırdaki diğer faydalı bilgiler de atılır. <code>df.fillna()</code> eksik veriyi <b>doldurmak (impute)</b> için kullanılır:</p>
          <ul><li><b>Sabit değerle doldurma:</b> tüm NaN'ları tek bir değerle doldurur: <code>df.fillna(0)</code></li>
          <li><b>Sıralı (zaman serisi) doldurma:</b> zaman serilerinde yaygındır.
            <ul><li><code>method='ffill'</code> / <code>'pad'</code>: <b>ileri doldurma</b>; son bilinen değeri kullanır.</li>
            <li><code>method='bfill'</code> / <code>'backfill'</code>: <b>geri doldurma</b>; sonraki bilinen değeri kullanır.</li></ul></li>
          <li><b>Dinamik/gruplu doldurma:</b> NaN'ları hesaplanmış bir değerle doldurur, ör. sütun ortalaması. Çok yaygın ve güçlü bir kalıptır.</li></ul>
          ${EK_BILGI("pandas 2.1'den itibaren <code>fillna(method='ffill')</code> kullanımdan kaldırılma uyarısı (FutureWarning) verir; yerine <code>df.ffill()</code> ve <code>df.bfill()</code> metotları önerilir. Aşağıdaki örnek bu metotları kullanır.")}`,
          { kod: "s = pd.Series([1.0, None, None, 4.0])\nprint(s.fillna(0).tolist())\nprint(s.ffill().tolist())\nprint(s.bfill().tolist())\nprint(s.fillna(s.mean()).tolist())" }),
        C("df = pd.DataFrame({'A': [1, None, 3], 'B': [4, 5, None]})\nprint(df.dropna().shape)", ["(1, 2)", "(3, 2)", "(2, 2)", "(0, 2)"], "how='any': yalnızca hiç NaN içermeyen 0. satır kalır."),
        C("df = pd.DataFrame({'A': [1, None, 3], 'B': [4, None, None]})\nprint(df.dropna(how='all').index.tolist())", ["[0, 2]", "[0]", "[1]", "[0, 1, 2]"], "how='all': yalnızca tamamı NaN olan 1. satır silinir."),
        C("df = pd.DataFrame({'A': [1, None, 3], 'B': [None, None, 6], 'C': [7, 8, 9]})\nprint(df.dropna(axis=1).columns.tolist())", ["['C']", "['A', 'B']", "['A', 'C']", "[]"], "axis=1: NaN içeren sütunlar silinir."),
        Y("df = pd.DataFrame({'A': [1, None, 3], 'B': [None, None, 6], 'C': [7, None, 9]})\nprint(len(df.dropna(thresh=2)))", "2", "En az 2 geçerli değeri olan satırlar: 0 (A, C) ve 2 (A, B, C)."),
        C("s = pd.Series([1.0, None, 3.0])\nprint(s.fillna(0).tolist())", ["[1.0, 0.0, 3.0]", "[1.0, 3.0]", "[1.0, 1.0, 3.0]", "[1.0, 2.0, 3.0]"], "Sabit değerle doldurma."),
        C("s = pd.Series([5.0, None, None, 8.0])\nprint(s.ffill().tolist())", ["[5.0, 5.0, 5.0, 8.0]", "[5.0, 8.0, 8.0, 8.0]", "[5.0, 0.0, 0.0, 8.0]", "[5.0, 6.5, 6.5, 8.0]"], "İleri doldurma son bilinen değeri taşır."),
        C("s = pd.Series([5.0, None, None, 8.0])\nprint(s.bfill().tolist())", ["[5.0, 8.0, 8.0, 8.0]", "[5.0, 5.0, 5.0, 8.0]", "[5.0, 0.0, 0.0, 8.0]", "[8.0, 8.0, 8.0, 8.0]"], "Geri doldurma sonraki bilinen değeri kullanır."),
        Y("s = pd.Series([2.0, None, 4.0])\nprint(s.fillna(s.mean()).tolist())", "[2.0, 3.0, 4.0]", "mean() NaN'ları yok sayar: (2 + 4) / 2 = 3."),
        S("dropna(thresh=5) ne yapar?", ["En az 5 eksik olmayan değeri olan satırları tutar", "En fazla 5 satırı siler", "5'ten fazla NaN içeren sütunları tutar", "İlk 5 satırı siler"], "Slayt 40."),
        S("Kategorik bir sütundaki eksik değerleri doldurmak için slayttaki öneri nedir?", ["En sık değer (mod) ile doldurmak", "Ortalamayla doldurmak", "0 ile doldurmak", "Sütunu silmek"], "Slayt 44, Alıştırma 4.6."),
        DY("dropna() varsayılan olarak en az bir NaN içeren satırları siler.", true, "axis=0, how='any'."),
        DY("Eksik veriyi silmek her zaman doldurmaktan daha iyidir.", false, "Slayt 42: silme, satırdaki diğer faydalı bilgileri de atar."),
        E(["how='all'", "tamamı NaN ise sil"], ["axis=1", "sütunları sil"], ["ffill", "son bilinen değerle doldur"], ["bfill", "sonraki değerle doldur"]),
        K("pandas-eksik", [44, 44]),
      ],
    },
    {
      // Slayt dışı: ara sınav kapsamındaki "veri temizleme" için (duplicates, inconsistencies). Kaynak: pandas.pydata.org/docs
      id: "pd-temizlik", baslik: "Veri temizleme: tekrarlar ve tutarsızlıklar", ekBilgi: true,
      adimlar: [
        O("Tekrarlı satırları bulmak: duplicated()", undefined, `
          ${EK_BILGI("Bu ders ders slaytlarında yok; ara sınav kapsamındaki <b>veri temizleme</b> (tekrarlı satırlar, tutarsızlıklar) için pandas dokümantasyonundan eklendi. Moodle materyaliyle karşılaştır.")}
          <p><code>df.duplicated()</code> her satır için, <b>kendisinden önce aynısı geçmişse True</b> olan bir boolean Series döndürür. İlk görülen satır False'tur.</p>
          <ul><li><code>df.duplicated().sum()</code> → tekrarlı satır sayısı (True'lar 1 sayılır).</li>
          <li><code>subset=['ad']</code> → yalnızca verilen sütunlara bakarak karşılaştırır.</li></ul>`,
          { etiket: "Ek bilgi · pandas docs", kod: "df = pd.DataFrame({'ad': ['Ada', 'Can', 'Ada', 'Ece', 'Can'],\n                   'sehir': ['Ankara', 'İzmir', 'Ankara', 'Bursa', 'Bursa']})\nprint(df.duplicated().tolist())\nprint(df.duplicated().sum())\nprint(df.duplicated(subset=['ad']).tolist())" }),
        O("Tekrarları silmek: drop_duplicates()", undefined, `
          <p><code>df.drop_duplicates()</code> tekrarlı satırları siler ve <b>yeni bir DataFrame</b> döndürür (orijinal index etiketleri korunur).</p>
          <ul><li><code>subset</code>: hangi sütunlara göre tekrar sayılacağı.</li>
          <li><code>keep='first'</code> (varsayılan) ilk görüleni, <code>keep='last'</code> sonuncuyu tutar; <code>keep=False</code> tekrar eden <b>tüm</b> satırları siler.</li></ul>
          <p>Kaynak: pandas.pydata.org/docs (DataFrame.duplicated, DataFrame.drop_duplicates)</p>`,
          { etiket: "Ek bilgi · pandas docs", kod: "df = pd.DataFrame({'ad': ['Ada', 'Can', 'Ada', 'Ece', 'Can'],\n                   'sehir': ['Ankara', 'İzmir', 'Ankara', 'Bursa', 'Bursa']})\nprint(df.drop_duplicates())\nprint(df.drop_duplicates(subset=['ad'], keep='last'))\nprint(df.drop_duplicates(subset=['ad'], keep=False))" }),
        O("Tutarsız kategorileri bulmak ve düzeltmek", undefined, `
          <p>Aynı değer farklı yazılmış olabilir: <code>' Ankara'</code>, <code>'ankara'</code>, <code>'ANKARA '</code>. Önce <b>bul</b>, sonra <b>düzelt</b>:</p>
          <ul><li><code>s.unique()</code> farklı değerleri, <code>s.value_counts()</code> her değerin kaç kez geçtiğini gösterir; tutarsızlıklar burada görünür.</li>
          <li><code>s.str.strip()</code> baştaki/sondaki boşlukları, <code>s.str.lower()</code> büyük/küçük harf farkını giderir.</li>
          <li><code>s.replace({'ist': 'istanbul'})</code> kısaltma ve yazım farklarını tek bir değere eşler.</li></ul>
          <p><b>Dikkat (Türkçe veri):</b> Python'da <code>'İ'.lower()</code> sonucu <code>'i̇'</code> (i + birleşik nokta) olur; bu yüzden <code>'İzmir'.lower()</code>, <code>'izmir'</code> ile eşleşmez. Böyle durumlarda <code>replace</code> ile açıkça eşle.</p>`,
          { etiket: "Ek bilgi · pandas docs", kod: "s = pd.Series([' Ankara', 'ankara', 'ANKARA ', 'Bursa', 'bursa', 'Ist'])\nprint(s.unique())\ntemiz = s.str.strip().str.lower().replace({'ist': 'istanbul'})\nprint(temiz.value_counts().to_dict())\nprint('İzmir'.lower() == 'izmir')" }),
        O("Tip tutarsızlıkları: astype ve to_numeric", undefined, `
          <p>Sayı olması gereken bir sütun string (<code>object</code>) olarak gelebilir; içinde <code>'yirmi'</code> gibi sayıya çevrilemeyen değerler de olabilir.</p>
          <ul><li><code>s.astype(int)</code> tipi dönüştürür; çevrilemeyen bir değer varsa <b>hata verir</b>.</li>
          <li><code>pd.to_numeric(s, errors='coerce')</code> çevrilemeyen değerleri <b>NaN</b> yapar; sonra eksik veri yöntemleriyle (dropna, fillna) ele alınır.</li>
          <li>String sütunda <code>sum()</code> sayıları toplamaz, metinleri <b>birleştirir</b>: tip kontrolü (<code>df.dtypes</code>, <code>info()</code>) temizliğin ilk adımıdır.</li></ul>
          <p>Kaynak: pandas.pydata.org/docs (pandas.to_numeric, DataFrame.astype)</p>`,
          { etiket: "Ek bilgi · pandas docs", kod: "y = pd.Series(['25', '30', 'yirmi', '41', ''])\nsayi = pd.to_numeric(y, errors='coerce')\nprint(sayi.tolist())\nprint(sayi.isna().sum())\nprint(pd.Series(['1', '2', '3']).sum(), pd.Series(['1', '2', '3']).astype(int).sum())" }),
        C("df = pd.DataFrame({'a': [1, 1, 2, 2], 'b': ['x', 'x', 'y', 'z']})\nprint(df.duplicated().sum())", ["1", "2", "0", "4"], "Yalnızca 1. satır, 0. satırın tamamen aynısıdır."),
        C("df = pd.DataFrame({'a': [1, 1, 2, 2], 'b': ['x', 'x', 'y', 'z']})\nprint(df.duplicated(subset=['a']).sum())", ["2", "1", "0", "4"], "Yalnızca 'a' sütununa bakılır: 1. ve 3. satırlar tekrar."),
        C("df = pd.DataFrame({'a': [1, 1, 2, 2], 'b': ['x', 'x', 'y', 'z']})\nprint(df.drop_duplicates(subset=['a'], keep='last').index.tolist())", ["[1, 3]", "[0, 2]", "[0, 1, 2, 3]", "[]"], "keep='last' her gruptaki son satırı tutar."),
        C("df = pd.DataFrame({'a': [1, 1, 2]})\nprint(len(df.drop_duplicates(keep=False)))", ["1", "2", "3", "0"], "keep=False tekrar eden tüm satırları siler; yalnızca 2 kalır."),
        C("s = pd.Series(['A ', 'a', ' a'])\nprint(s.str.strip().str.lower().nunique())", ["1", "3", "2", "0"], "strip + lower sonrası hepsi 'a' olur."),
        Y("s = pd.Series(['10', 'on', '20'])\nprint(pd.to_numeric(s, errors='coerce').isna().sum())", "1", "'on' sayıya çevrilemez → NaN."),
        C("print(pd.Series(['1', '2']).sum())", ["12", "3", "Hata verir", "['1', '2']"], "String sütunda sum metinleri birleştirir."),
        C("print(pd.Series(['1', 'x']).astype(int).sum())", ["Hata verir", "1", "NaN", "0"], "astype çevrilemeyen değerde ValueError verir; to_numeric(errors='coerce') NaN yapar."),
        S("Bir sütundaki tutarsız kategori yazımlarını görmenin en hızlı yolu hangisidir?", ["s.value_counts()", "s.sum()", "s.dropna()", "s.astype(int)"], "value_counts her farklı yazımı ve sayısını listeler."),
        DY("df.duplicated() ilk görülen satır için de True döndürür.", false, "İlk görülen satır False'tur; yalnızca sonraki tekrarları True'dur."),
        B("Çevrilemeyen değerleri NaN yap", "sayi = pd.___(s, errors='___')", ["to_numeric", "coerce"], ["to_numeric", "coerce", "astype", "ignore"], "errors='coerce' hatalı değerleri NaN yapar."),
        E(["duplicated()", "tekrar mı? (boolean)"], ["drop_duplicates()", "tekrarları siler"], ["str.strip()", "uçtaki boşlukları siler"], ["value_counts()", "değer sıklıkları"]),
      ],
    },
    {
      id: "pd-birlestir", baslik: "concat ve merge ile birleştirme", slayt: [45, 50],
      adimlar: [
        O("İki temel fonksiyon: concat ve merge", [45, 45], `
          <ul><li><code>pd.concat()</code>: veriler <b>aynı yapıya</b> (aynı sütunlar veya aynı index) sahipse ve onları <b>"yapıştırmak" ya da "yığmak"</b> istiyorsan. Klasik örnek: aylık satış raporlarını (jan_sales.csv, feb_sales.csv) yıllık rapora birleştirmek.</li>
          <li><code>pd.merge()</code>: veriler <b>aynı varlıklar hakkında farklı bilgiler</b> içeriyorsa ve onları bir <b>anahtarla</b> bağlamak istiyorsan. Klasik örnek: users tablosunu purchases tablosuyla user_id üzerinden birleştirmek.</li></ul>`),
        O("pd.concat() ile yığmak", [46, 46], `
          <p><code>pd.concat()</code> bir DataFrame <b>listesi</b> alır ve onları bir eksen boyunca birleştirir.</p>
          <ul><li><b>Varsayılan, satırları yığmak (axis=0):</b> DataFrame'leri dikey olarak üst üste yapıştırır: <code>pd.concat([df1, df2, df3])</code></li>
          <li><code>ignore_index=True</code>: concat orijinal index'leri korur, bu da <b>tekrarlanan index etiketlerine</b> yol açar (ör. üç tane 0 etiketli satır). ignore_index=True eski index'leri atar ve yeni, temiz bir <b>RangeIndex (0, 1, 2...)</b> oluşturur. Neredeyse her zaman istenen budur.</li>
          <li><b>Sütunları yığmak (axis=1):</b> DataFrame'leri yan yana yapıştırır; veriyi <b>index'e göre hizalar</b>.</li></ul>`,
          { kod: "jan = pd.DataFrame({'urun': ['A', 'B'], 'satis': [10, 20]})\nfeb = pd.DataFrame({'urun': ['A', 'C'], 'satis': [15, 5]})\nprint(pd.concat([jan, feb]))\nprint(pd.concat([jan, feb], ignore_index=True))\nprint(pd.concat([jan, feb], axis=1))" }),
        O("Veritabanı tarzı birleştirme: pd.merge()", [47, 47], `
          <p>SQL'deki JOIN'in Pandas karşılığı <code>pd.merge()</code>'dür. İki DataFrame'i (left ve right) bir veya daha fazla ortak <b>anahtar</b> sütuna göre birleştirir: <code>pd.merge(left_df, right_df, on='key')</code></p>
          <ul><li><code>left, right</code>: birleştirilecek iki DataFrame.</li>
          <li><code>on</code>: birleştirme yapılacak sütun adı/adları; bu sütun <b>iki DataFrame'de de</b> bulunmalıdır.</li>
          <li><code>left_on, right_on</code>: anahtar sütun iki tarafta <b>farklı adlara</b> sahipse (ör. <code>left_on='user_id', right_on='customer_id'</code>).</li>
          <li><code>left_index=True, right_index=True</code>: sütun yerine <b>index'in kendisi</b> üzerinden birleştirmek için.</li></ul>`,
          { kod: "users = pd.DataFrame({'user_id': [1, 2, 3], 'name': ['Ada', 'Can', 'Ece']})\npurchases = pd.DataFrame({'customer_id': [1, 1, 3], 'item': ['kitap', 'kalem', 'defter']})\nprint(pd.merge(users, purchases, left_on='user_id', right_on='customer_id'))" }),
        O("how parametresi: join türleri", [48, 48], `
          <ul><li><code>how='inner'</code> (varsayılan) → SQL INNER JOIN: yalnızca <b>iki tarafta da</b> bulunan anahtarları tutar (kesişim).</li>
          <li><code>how='outer'</code> → SQL FULL OUTER JOIN: <b>herhangi bir tarafta</b> bulunan tüm anahtarları tutar (birleşim). Eksik veri NaN olur.</li>
          <li><code>how='left'</code> → SQL LEFT OUTER JOIN: soldaki <b>tüm</b> anahtarları, sağdan yalnızca eşleşenleri tutar. Sağ taraftaki eksik veri NaN olur.</li>
          <li><code>how='right'</code> → SQL RIGHT OUTER JOIN: sağdaki tüm anahtarları, soldan yalnızca eşleşenleri tutar. Sol taraftaki eksik veri NaN olur.</li></ul>`,
          { kod: "df1 = pd.DataFrame({'student_id': ['s1', 's2', 's3'], 'name': ['Ada', 'Can', 'Ece']})\ndf2 = pd.DataFrame({'student_id': ['s1', 's2', 's4'], 'course': ['Math', 'Econ', 'Physics']})\nfor how in ['inner', 'outer', 'left', 'right']:\n    print(how)\n    print(pd.merge(df1, df2, on='student_id', how=how))" }),
        O("validate parametresi", [49, 49], `
          <p>Bu parametre çıktıyı <b>değiştirmez</b>; verinin yapısı üzerinde bir <b>doğrulama (assertion) veya birim testi</b> gibi davranır. Koşul sağlanmazsa <b>MergeError</b> fırlatılır.</p>
          <ul><li><code>validate='one_to_one'</code> (<code>'1:1'</code>): anahtarlar <b>iki tarafta da</b> benzersiz.</li>
          <li><code>validate='one_to_many'</code> (<code>'1:m'</code>): anahtarlar <b>solda</b> benzersiz.</li>
          <li><code>validate='many_to_one'</code> (<code>'m:1'</code>): anahtarlar <b>sağda</b> benzersiz.</li></ul>
          <p>Örnek: <code>pd.merge(purchases, users, on='user_id', validate='m:1')</code></p>`,
          { kod: "users = pd.DataFrame({'user_id': [1, 2], 'name': ['Ada', 'Can']})\npurchases = pd.DataFrame({'user_id': [1, 1, 2], 'item': ['kitap', 'kalem', 'defter']})\nprint(pd.merge(purchases, users, on='user_id', validate='m:1'))\ntry:\n    pd.merge(purchases, users, on='user_id', validate='1:1')\nexcept Exception as e:\n    print(type(e).__name__)" }),
        C("a = pd.DataFrame({'x': [1, 2]})\nb = pd.DataFrame({'x': [3, 4]})\nprint(pd.concat([a, b]).index.tolist())", ["[0, 1, 0, 1]", "[0, 1, 2, 3]", "[1, 2, 3, 4]", "[0, 1]"], "concat varsayılan olarak orijinal index'leri korur."),
        C("a = pd.DataFrame({'x': [1, 2]})\nb = pd.DataFrame({'x': [3, 4]})\nprint(pd.concat([a, b], ignore_index=True).index.tolist())", ["[0, 1, 2, 3]", "[0, 1, 0, 1]", "[1, 2, 3, 4]", "[3, 4]"], "ignore_index=True yeni bir RangeIndex oluşturur."),
        C("a = pd.DataFrame({'x': [1, 2]})\nb = pd.DataFrame({'y': [3, 4]})\nprint(pd.concat([a, b], axis=1).shape)", ["(2, 2)", "(4, 2)", "(4, 1)", "(2, 1)"], "axis=1 yan yana yapıştırır."),
        Y("df1 = pd.DataFrame({'id': ['s1', 's2', 's3']})\ndf2 = pd.DataFrame({'id': ['s1', 's2', 's4']})\nprint(len(pd.merge(df1, df2, on='id')))", "2", "Varsayılan inner: yalnızca s1 ve s2."),
        Y("df1 = pd.DataFrame({'id': ['s1', 's2', 's3']})\ndf2 = pd.DataFrame({'id': ['s1', 's2', 's4']})\nprint(len(pd.merge(df1, df2, on='id', how='outer')))", "4", "outer: anahtarların birleşimi s1, s2, s3, s4."),
        C("df1 = pd.DataFrame({'id': ['s1', 's2', 's3'], 'name': ['Ada', 'Can', 'Ece']})\ndf2 = pd.DataFrame({'id': ['s1', 's2', 's4'], 'course': ['Math', 'Econ', 'Physics']})\nprint(pd.merge(df1, df2, on='id', how='left')['course'].tolist())", ["['Math', 'Econ', nan]", "['Math', 'Econ', 'Physics']", "['Math', 'Econ']", "[nan, 'Math', 'Econ']"], "left: soldaki tüm anahtarlar kalır; s3'ün sağda eşi yok → NaN."),
        C("a = pd.DataFrame({'k': [1, 1], 'v': [5, 6]})\nb = pd.DataFrame({'k': [1], 'w': [7]})\nprint(len(pd.merge(a, b, on='k', validate='one_to_one')))", ["Hata verir", "2", "1", "0"], "Soldaki anahtar benzersiz değil; 1:1 doğrulaması MergeError fırlatır."),
        S("Aylık satış raporlarını alt alta tek bir yıllık rapora birleştirmek için hangisi uygundur?", ["pd.concat()", "pd.merge()", "df.groupby()", "pd.melt()"], "Slayt 45: aynı yapıdaki veriler yığılır."),
        S("Anahtar sütun iki tabloda farklı adlara sahipse merge'de ne kullanılır?", ["left_on ve right_on", "on", "ignore_index", "validate"], "Slayt 47."),
        DY("merge'in varsayılan how değeri 'inner'dır.", true, "Slayt 48."),
        DY("validate parametresi birleştirmenin çıktısını değiştirir.", false, "Slayt 49: çıktıyı değiştirmez, doğrulama yapar."),
        E(["inner", "kesişim"], ["outer", "birleşim"], ["left", "soldaki tüm anahtarlar"], ["right", "sağdaki tüm anahtarlar"]),
        K("pandas-birlestir", [50, 50]),
      ],
    },
    {
      id: "pd-groupby", baslik: "groupby: böl, uygula, birleştir", slayt: [51, 58],
      adimlar: [
        O("Veri toplama: Split-Apply-Combine", [51, 51], `
          <p><b>"group by"</b> süreci Pandas ile veri analizinin temel bileşenlerinden biridir. Zihinsel model üç adımlıdır:</p>
          <ol><li><b>Böl (Split):</b> veri bir ölçüte göre gruplara ayrılır.</li>
          <li><b>Uygula (Apply):</b> her gruba bağımsız olarak bir fonksiyon uygulanır.</li>
          <li><b>Birleştir (Combine):</b> fonksiyonun sonuçları yeni bir veri yapısında birleştirilir.</li></ol>`),
        O("SPLIT: df.groupby()", [52, 52], `
          <p>Bölme adımı <code>df.groupby()</code> çağrısıyla başlar. Ör. <code>df.groupby('Sex')</code> veriyi iki gruba ('male' ve 'female') ayırır.</p>
          <p>Bu komut <b>henüz hiçbir şey hesaplamaz</b>. "Tembel" (lazy) bir <b>DataFrameGroupBy</b> nesnesi döndürür. Bu nesne aslında bir <b>plandır</b>: grup adlarını o gruba ait satırların index'lerine eşleyen bir sözlük.</p>`,
          { kod: TITANIC_KOD + "g = df.groupby('Sex')\nprint(type(g).__name__)\nprint(g.groups)" }),
        O("APPLY: toplama (aggregation)", [53, 53], `
          <p>Her alt gruba bir fonksiyon uygulanır. Üç ana "uygula" işlemi vardır; ilki <b>toplama (aggregation)</b>: her grup için tek bir değer.</p>
          <ul><li>Cinsiyete göre ortalama yaş: <code>df.groupby('Sex')['Age'].mean()</code></li>
          <li>Her sınıfta kaç kişi hayatta kaldı (toplam): <code>df.groupby('Pclass')['Survived'].sum()</code></li>
          <li>Her sınıfta kaç yolcu var: <code>df.groupby('Pclass').count()</code></li></ul>
          ${EK_BILGI("slayttaki <code>df.groupby('Pclass').sum()</code> tüm sütunları toplar; pandas 2.x'te string sütunlar da (ör. Sex) birleştirilerek toplanır. Yalnızca sayısal sütunlar için <code>sum(numeric_only=True)</code> veya önce sütun seçimi kullanılır.")}`,
          { kod: TITANIC_KOD + "print(df.groupby('Sex')['Age'].mean())\nprint(df.groupby('Pclass')['Survived'].sum())\nprint(df.groupby('Pclass').count()['PassengerId'])" }),
        O("APPLY: .agg() ve isimli toplama", [54, 54], `
          <p><code>.agg()</code> ile tek seferde <b>birden çok istatistik</b> alınır:</p>
          <p><code>df.groupby('Pclass')['Age'].agg(['mean', 'median', 'std', 'max'])</code></p>
          <p><b>İsimli toplama (named aggregation):</b> anahtar kelimeler (ör. avg_age) <b>yeni sütun adları</b> olur; değer <code>(sütun, fonksiyon)</code> tuple'ıdır:</p>
          <p><code>df.groupby('Pclass').agg(avg_age=('Age', 'mean'), max_fare=('Fare', 'max'), num_survived=('Survived', 'sum'))</code></p>`,
          { kod: TITANIC_KOD + "print(df.groupby('Pclass')['Age'].agg(['mean', 'median', 'max']))\nsummary = df.groupby('Pclass').agg(\n    avg_age=('Age', 'mean'),\n    max_fare=('Fare', 'max'),\n    num_survived=('Survived', 'sum'),\n)\nprint(summary)" }),
        O("APPLY: dönüştürme (transform)", [55, 55], `
          <p><b>Dönüştürme</b> her gruba bir fonksiyon uygular ama orijinalle <b>aynı index'e</b> sahip bir DataFrame veya Series döndürür. Sonuç orijinalle <b>aynı şekildedir</b>.</p>
          <p>Grup düzeyindeki bir hesaplamayı orijinal satırlara geri <b>"yaymak"</b> (broadcast) için kullanılır.</p>
          <p><b>Problem:</b> eksik 'Age' değerlerini genel ortalamayla değil, yolcunun kendi <b>'Pclass'</b> grubunun ortalamasıyla doldurmak istiyorum.</p>`,
          { kod: TITANIC_KOD + "sinif_ort = df.groupby('Pclass')['Age'].transform('mean')\nprint(sinif_ort.round(2).tolist())\ndf['Age'] = df['Age'].fillna(sinif_ort)\nprint(df['Age'].round(2).tolist())" }),
        O("APPLY: filtreleme (filter)", [56, 56], `
          <p><b>Filtreleme</b>, grup bazında hesaplanan ve True/False döndüren bir koşula göre bazı grupları <b>tamamen atar</b>. Sonuç orijinal DataFrame'in bir alt kümesidir.</p>
          <p><b>Problem:</b> istatistiksel anlamlılık için yalnızca en az 100 üyesi olan gruplar için analiz yapmak istiyorum: <code>df.groupby('Pclass').filter(lambda g: len(g) &gt;= 100)</code></p>
          <p>Aşağıdaki küçük örnekte eşik 100 yerine 3'tür.</p>`,
          { kod: TITANIC_KOD + "buyuk = df.groupby('Pclass').filter(lambda g: len(g) >= 3)\nprint(buyuk['Pclass'].unique())\nprint(len(buyuk))" }),
        O("COMBINE: sonuçların birleştirilmesi", [57, 57], `
          <ul><li><b>Toplama</b> durumunda Pandas her gruptan gelen tek değerli sonuçları, <b>grup anahtarlarıyla indekslenmiş</b> (ör. Pclass 1, 2, 3) yeni bir DataFrame'de otomatik birleştirir.</li>
          <li><b>Dönüştürme ve filtreleme</b> durumlarında sonuçlar <b>orijinal index'le</b> bir DataFrame'e geri birleştirilir.</li></ul>`,
          { kod: TITANIC_KOD + "print(df.groupby('Pclass')['Fare'].max().index.tolist())\nprint(df.groupby('Pclass')['Fare'].transform('max').index.tolist())" }),
        C("df = pd.DataFrame({'g': ['a', 'b', 'a', 'b'], 'v': [1, 2, 3, 4]})\nprint(df.groupby('g')['v'].sum().tolist())", ["[4, 6]", "[3, 7]", "[10]", "[1, 2, 3, 4]"], "a: 1 + 3, b: 2 + 4."),
        C("df = pd.DataFrame({'g': ['a', 'b', 'a', 'b'], 'v': [1, 2, 3, 4]})\nprint(df.groupby('g')['v'].mean().to_dict())", ["{'a': 2.0, 'b': 3.0}", "{'a': 4, 'b': 6}", "{'a': 1.0, 'b': 2.0}", "{'a': 2.5, 'b': 2.5}"], "a: (1 + 3) / 2, b: (2 + 4) / 2."),
        C("df = pd.DataFrame({'g': ['a', 'b', 'a', 'b'], 'v': [1, 2, 3, 4]})\nprint(df.groupby('g')['v'].transform('sum').tolist())", ["[4, 6, 4, 6]", "[4, 6]", "[1, 2, 3, 4]", "[10, 10, 10, 10]"], "transform grup sonucunu orijinal satırlara yayar; şekil korunur."),
        Y("df = pd.DataFrame({'g': ['a', 'a', 'a', 'b'], 'v': [1, 2, 3, 4]})\nprint(len(df.groupby('g').filter(lambda x: len(x) >= 2)))", "3", "Yalnızca 3 üyeli 'a' grubu kalır."),
        C("df = pd.DataFrame({'g': ['a', 'b', 'a'], 'v': [5, 1, 9]})\nr = df.groupby('g').agg(en_buyuk=('v', 'max'))\nprint(r.columns.tolist())", ["['en_buyuk']", "['v']", "['max']", "['g', 'v']"], "İsimli toplamada anahtar kelime yeni sütun adı olur."),
        Y(TITANIC_KOD + "print(df.groupby('Pclass')['Survived'].mean()[1])", "0.6666666666666666", "1. sınıftaki 3 yolcunun 2'si hayatta kaldı; Survived ortalaması hayatta kalma oranıdır (Alıştırma 6.3)."),
        S("df.groupby('Sex') tek başına ne döndürür?", ["Henüz hesaplama yapmamış tembel bir DataFrameGroupBy nesnesi", "Her grubun ortalamasını", "Sıralanmış bir DataFrame", "İki ayrı CSV dosyası"], "Slayt 52."),
        S("Gruba göre hesaplanan değeri orijinal satırlara geri yaymak (aynı şekil) için hangisi kullanılır?", ["transform", "agg", "filter", "count"], "Slayt 55."),
        DY("Filtreleme (filter) işlemi bazı grupları tamamen atar ve orijinal DataFrame'in bir alt kümesini döndürür.", true, "Slayt 56."),
        SR("group by sürecinin adımlarını sırala", ["Split", "Apply", "Combine"], ["Sort"], " → ", "Slayt 51: Böl → Uygula → Birleştir."),
        E(["Aggregation", "grup başına tek değer"], ["Transformation", "aynı şekil, yayılmış değer"], ["Filtration", "grupları at/tut"], ["groupby()", "tembel plan nesnesi"]),
        K("pandas-groupby", [58, 58]),
      ],
    },
    {
      id: "pd-reshape", baslik: "Yeniden şekillendirme: melt ve pivot_table", slayt: [59, 62],
      adimlar: [
        O("Uzun ve geniş formatlar", [59, 59], `
          <p>Yeniden şekillendirme, veri düzenini <b>"uzun" (long)</b> ve <b>"geniş" (wide)</b> formatlar arasında dönüştürmektir. Verinin makine tarafından okunabilir (tidy) olması için:</p>
          <ul><li>Her <b>değişken</b> bir sütundur.</li><li>Her <b>gözlem</b> bir satırdır.</li><li>Her gözlem birimi <b>türü</b> bir tablodur.</li></ul>
          <p>Pandas bunun için iki anahtar fonksiyon sunar: <code>pd.melt()</code> (genişten uzuna) ve <code>pd.pivot_table()</code> (uzundan genişe).</p>`),
        O("Genişten uzuna: pd.melt()", [60, 60], `
          <p>Veri seti <b>genişse</b>, yani sütun başlıkları değişken adı değil de <b>değerse</b> (ör. yıl sütunları 2022, 2023), <code>pd.melt()</code> kullanılır.</p>
          <ul><li><code>id_vars</code>: olduğu gibi kalacak tanımlayıcı sütun(lar)</li>
          <li><code>var_name</code>: eski sütun başlıklarını tutacak yeni sütunun adı</li>
          <li><code>value_name</code>: değerleri tutacak yeni sütunun adı</li></ul>
          <p>(Slayttaki örnek görsel olarak geldiği için aşağıda yeniden oluşturuldu.)</p>`,
          { kod: "genis = pd.DataFrame({'ulke': ['TR', 'DE'], '2022': [85, 83], '2023': [86, 84]})\nprint(genis)\nuzun = pd.melt(genis, id_vars=['ulke'], var_name='yil', value_name='nufus')\nprint(uzun)" }),
        O("Uzundan genişe: pivot_table()", [61, 61], `
          <p><code>pivot_table()</code>, melt()'in tersidir. Elektronik tablo tarzı bir <b>pivot tablo</b> oluşturur ve Pandas'ın en güçlü fonksiyonlarından biridir.</p>
          <p>pivot_table(), groupby ile bir yeniden şekillendirme işleminin (özellikle <code>unstack()</code>) birleşimidir.</p>
          <ul><li><code>index</code>: satırlara konacak sütun(lar)</li>
          <li><code>columns</code>: sütunlara konacak sütun(lar)</li>
          <li><code>values</code>: hücreleri dolduracak sütun</li>
          <li><code>aggfunc</code>: bir (index, column) çifti için birden çok değer varsa kullanılacak toplama fonksiyonu ('mean', 'sum', 'count' gibi). <b>Varsayılan ortalamadır</b> (mean).</li></ul>`,
          { kod: TITANIC_KOD + "print(df.pivot_table(values='Age', index='Sex', columns='Pclass'))\nprint(df.pivot_table(values='Survived', index='Sex', columns='Pclass', aggfunc='sum'))" }),
        C("genis = pd.DataFrame({'ulke': ['TR', 'DE'], '2022': [85, 83], '2023': [86, 84]})\nprint(pd.melt(genis, id_vars=['ulke']).shape)", ["(4, 3)", "(2, 3)", "(2, 4)", "(6, 2)"], "2 ülke × 2 yıl = 4 satır; sütunlar ulke, variable, value."),
        C("genis = pd.DataFrame({'id': [1], 'a': [5], 'b': [6]})\nprint(pd.melt(genis, id_vars=['id']).columns.tolist())", ["['id', 'variable', 'value']", "['id', 'a', 'b']", "['variable', 'value']", "['id', 'var', 'val']"], "var_name/value_name verilmezse varsayılan adlar variable ve value'dur."),
        Y("df = pd.DataFrame({'s': ['m', 'f', 'm'], 'c': [1, 1, 1], 'v': [10, 20, 30]})\nprint(df.pivot_table(values='v', index='s', columns='c').loc['m', 1])", "20.0", "Varsayılan aggfunc ortalamadır: (10 + 30) / 2."),
        Y("df = pd.DataFrame({'s': ['m', 'f', 'm'], 'c': [1, 1, 1], 'v': [10, 20, 30]})\nprint(df.pivot_table(values='v', index='s', columns='c', aggfunc='sum').loc['m', 1])", "40", "aggfunc='sum': 10 + 30."),
        C("df = pd.DataFrame({'s': ['m', 'f', 'm', 'f'], 'c': [1, 2, 2, 3], 'v': [1, 2, 3, 4]})\nprint(df.pivot_table(values='v', index='s', columns='c').shape)", ["(2, 3)", "(3, 2)", "(4, 3)", "(2, 2)"], "Satırlarda s'nin 2 değeri, sütunlarda c'nin 3 değeri."),
        S("pivot_table'da aggfunc verilmezse hangi toplama kullanılır?", ["Ortalama (mean)", "Toplam (sum)", "Sayım (count)", "En büyük (max)"], "Slayt 61."),
        S("Sütun başlıkları değer olan (ör. yıllar) geniş bir tabloyu uzun formata çevirmek için hangisi kullanılır?", ["pd.melt()", "pivot_table()", "pd.concat()", "df.groupby()"], "Slayt 60."),
        DY("pivot_table(), groupby ile unstack() yeniden şekillendirmesinin birleşimidir.", true, "Slayt 61."),
        DY("Tidy veride her gözlem bir sütundur.", false, "Her değişken bir sütun, her gözlem bir satırdır."),
        E(["melt", "genişten uzuna"], ["pivot_table", "uzundan genişe"], ["id_vars", "sabit kalan sütunlar"], ["aggfunc", "toplama fonksiyonu"]),
        K("pandas-pivot", [62, 62]),
      ],
    },
    {
      id: "pd-zaman", baslik: "Zaman serileriyle çalışmak", slayt: [63, 68],
      adimlar: [
        O("Zaman serisi veri tipleri ve pd.to_datetime()", [63, 63], `
          <p>Pandas başlangıçta <b>finansal analiz</b> için geliştirildi; tarih ve saatlerle çalışmada son derece güçlüdür.</p>
          <ul><li><b>Timestamp:</b> zamanda tek bir an. Python'daki <code>datetime.datetime</code>'ın Pandas karşılığı.</li>
          <li><b>DatetimeIndex:</b> Timestamp'lerden oluşan bir Index.</li>
          <li><b>Timedelta:</b> bir süre (mutlak zaman farkı).</li>
          <li><b>Period:</b> bir zaman aralığı, ör. bir ay veya bir çeyrek.</li></ul>
          <p><b>Anahtar fonksiyon: pd.to_datetime().</b> Çoğu veri object (string) olarak yüklenir; <code>pd.to_datetime()</code> string'leri Timestamp nesnelerine çevirmenin temel aracıdır.</p>`,
          { kod: "t = pd.Timestamp('2024-03-15 10:30')\nprint(t, t.year, t.month)\nprint(pd.Timestamp('2024-03-20') - t)\nprint(pd.Period('2024-03', freq='M'))\ns = pd.Series(['2024-01-05', '2024-02-10'])\nprint(s.dtype)\nprint(pd.to_datetime(s).dtype)" }),
        O("Tarih sütunlarını dönüştürmek ve kullanmak", [64, 64], `
          <p>Bir tarih sütunu <code>pd.to_datetime()</code> ile dönüştürüldükten sonra <code>.dt</code> erişimcisiyle parçalarına (yıl, ay, gün, haftanın günü) ulaşılabilir ve tarihler arasında aritmetik yapılabilir.</p>
          <p>(Slayttaki örnekler görsel olarak geldiği için başlık ve slayt 63'teki açıklamaya göre yeniden oluşturuldu.)</p>`,
          { kod: "df = pd.DataFrame({'tarih': ['2024-01-05', '2024-02-10', '2024-02-29'], 'satis': [100, 150, 120]})\ndf['tarih'] = pd.to_datetime(df['tarih'])\nprint(df.dtypes)\nprint(df['tarih'].dt.month.tolist())\nprint(df['tarih'].dt.day_name().tolist())\nprint((df['tarih'].max() - df['tarih'].min()).days)" }),
        O("DatetimeIndex ve tarih aralıkları", [65, 65], `
          <p>Tarihler index olarak kullanılınca (<b>DatetimeIndex</b>), satırlar tarih string'leriyle seçilebilir: tek bir gün, bir ay (<code>ts.loc['2024-02']</code>) veya bir aralık (<code>ts.loc['2024-01-03':'2024-01-05']</code>, loc olduğu için bitiş dahil).</p>
          <p><code>pd.date_range()</code> düzenli aralıklı tarihlerden bir DatetimeIndex üretir: <code>pd.date_range('2024-01-01', periods=10, freq='D')</code>.</p>
          <p>(Bu slayttaki örnekler görsel olarak geldiği için başlıktaki "DatetimeIndex" tanımına göre yeniden oluşturuldu.)</p>`,
          { kod: "idx = pd.date_range('2024-01-01', periods=6, freq='D')\nprint(idx)\nts = pd.Series([3, 5, 2, 8, 6, 4], index=idx)\nprint(ts.loc['2024-01-03':'2024-01-05'])\nprint(ts.loc['2024-01'].sum())" }),
        O("Yeniden örnekleme (resampling)", [66, 66], `
          <p>Zaman serisinde <b>örnekleme sıklığını değiştirmek</b> için <code>resample()</code> kullanılır. groupby'a benzer: zamanı aralıklara böler, her aralığa bir toplama fonksiyonu uygular.</p>
          <ul><li><b>Downsampling</b> (seyrekleştirme): ör. günlük → haftalık: <code>ts.resample('W').sum()</code></li>
          <li><b>Upsampling</b> (sıklaştırma): ör. günlük → 12 saatlik; ortaya çıkan boşluklar ffill gibi yöntemlerle doldurulur.</li></ul>
          <p>(Slayt yalnızca "Sampling" başlığı ve bir görselden oluşuyor; örnek pandas dokümantasyonundaki resample kullanımına göre oluşturuldu.)</p>`,
          { kod: "idx = pd.date_range('2024-01-01', periods=14, freq='D')\nts = pd.Series(range(1, 15), index=idx)\nprint(ts.resample('W').sum())\nprint(ts.resample('MS').mean())" }),
        O("Özet ve kaynaklar", [67, 68], `
          <p>Bu ders Pandas'ın temel işlevlerini, resmi dokümantasyonun yapısını izleyerek ele aldı: önce temel veri yapıları <b>Series ve DataFrame</b>, sonra <b>içsel veri hizalamanın</b> kritik önemi. Ardından tipik veri analizi iş akışı:</p>
          <ol><li><b>Veri alma:</b> I/O araçları (read_csv)</li><li><b>İnceleme:</b> info, describe</li><li><b>Seçme ve filtreleme:</b> loc, iloc, boolean indeksleme</li>
          <li><b>Temizleme:</b> eksik veri (dropna, fillna)</li><li><b>Birleştirme:</b> concat, merge</li><li><b>Analiz:</b> Split-Apply-Combine (groupby, agg, transform)</li>
          <li><b>Yeniden şekillendirme:</b> melt, pivot_table</li><li><b>Zaman serileri</b></li></ol>
          <p><b>Kaynaklar:</b> [1] 10 Minutes to pandas (0.22.0 dokümantasyonu) · [2] User Guide (pandas 2.3.3) · [3] Intro to data structures (pandas 2.3.3) · [4] Getting started (pandas 2.3.3) — pandas.pydata.org</p>`),
        C("print(pd.Timestamp('2024-03-20') - pd.Timestamp('2024-03-15'))", ["5 days 00:00:00", "5", "-5 days", "2024-03-05"], "İki Timestamp'in farkı bir Timedelta'dır."),
        Y("print((pd.Timestamp('2024-03-01') - pd.Timestamp('2024-02-01')).days)", "29", "2024 artık yıl: şubat 29 gün."),
        C("s = pd.Series(['2024-01-05', '2024-02-10'])\nprint(s.dtype, pd.to_datetime(s).dtype)", ["object datetime64[ns]", "datetime64[ns] datetime64[ns]", "object object", "str datetime"], "String'ler object olarak gelir; to_datetime datetime64'e çevirir."),
        Y("print(len(pd.date_range('2024-01-01', '2024-01-10', freq='D')))", "10", "Başlangıç ve bitiş dahil 10 gün."),
        C("idx = pd.date_range('2024-01-01', periods=4, freq='D')\nts = pd.Series([1, 2, 3, 4], index=idx)\nprint(ts.loc['2024-01-02':'2024-01-03'].tolist())", ["[2, 3]", "[2]", "[1, 2, 3]", "[3, 4]"], "DatetimeIndex'te loc dilimi bitiş tarihini de içerir."),
        Y("idx = pd.date_range('2024-01-30', periods=4, freq='D')\nts = pd.Series([1, 2, 3, 4], index=idx)\nprint(ts.resample('MS').sum().tolist())", "[3, 7]", "30–31 Ocak: 1 + 2; 1–2 Şubat: 3 + 4."),
        C("print(pd.to_datetime('2024-07-14').day_name())", ["Sunday", "Monday", "Saturday", "14"], "14 Temmuz 2024 pazar gününe denk gelir."),
        S("Bir süreyi (zaman farkını) temsil eden Pandas tipi hangisidir?", ["Timedelta", "Timestamp", "Period", "DatetimeIndex"], "Slayt 63."),
        S("String olarak yüklenen tarihleri Timestamp'e çevirmek için temel fonksiyon hangisidir?", ["pd.to_datetime()", "pd.date_range()", "pd.Period()", "df.resample()"], "Slayt 63."),
        DY("Period, bir ay veya çeyrek gibi bir zaman aralığını temsil eder.", true, "Slayt 63."),
        DY("Pandas başlangıçta görüntü işleme için geliştirilmiştir.", false, "Slayt 63: finansal analiz için geliştirildi."),
        E(["Timestamp", "zamanda tek an"], ["Timedelta", "süre"], ["Period", "zaman aralığı (ay, çeyrek)"], ["DatetimeIndex", "Timestamp'lerden oluşan index"]),
      ],
    },
  ],
});
