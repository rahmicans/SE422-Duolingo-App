"""Derslere göre ek kavram bankası: (doğru ifade, yanlış ifade) çiftleri.

sinav.KAVRAMLAR ile birleştirilir; her dersin en az 5 çifti olur. Bu çiftlerden
doğru/yanlış, "hangisi doğru/yanlış" ve "doğru olanların hepsini seç" soruları üretilir.
"""

EK_KAVRAMLAR = {
    # ---------------- Bölüm 1: Python Temelleri ----------------
    "temel-giris": [
        ("Python kullanılmadan önce bilgisayara kurulmalı ve yapılandırılmalıdır.", "Python bilgisayara kurulmadan doğrudan çalıştırılabilir."),
        ("Etkileşimli modda >>> istemi yorumlayıcının komut beklediğini gösterir.", "Etkileşimli modda >>> istemi programın bittiğini gösterir."),
        ("Betik dosyası komut satırında python dosyaadi yazılarak çalıştırılır.", "Betik dosyası yalnızca IDLE içinden çalıştırılabilir."),
        ("Etkileşimli mod Python'un yeni özelliklerini öğrenmek için iyi bir yoldur.", "Etkileşimli modda hatalı bir komut yazılınca hata mesajı gösterilmez."),
    ],
    "temel-degisken": [
        ("String literal tek veya çift tırnak içine yazılmalıdır.", "String literal tırnaksız yazılabilir."),
        ("Üç tırnakla yazılan string birden çok satıra yayılabilir.", "Üç tırnakla yazılan string yalnızca tek satır olabilir."),
        ("Atama ifadesinde değeri alan değişken = işaretinin solunda olmalıdır.", "Atama ifadesinde değişken = işaretinin sağına yazılır: 29 = age."),
        ("print birden çok öğeyi virgülle alır ve aralarına boşluk koyar.", "print birden çok öğeyi aralarında boşluk olmadan yazar."),
        ("Ondalık noktası olmayan sayısal literal int kabul edilir.", "Ondalık noktası olmayan sayısal literal float kabul edilir."),
    ],
    "temel-hesap": [
        ("/ operatörü ondalıklı bölme yapar.", "/ operatörü her zaman tam sayı sonuç verir."),
        ("Üs operatörü ** çarpma ve bölmeden önce hesaplanır.", "Toplama işlemi çarpmadan önce hesaplanır."),
        ("% operatörü bölümden kalanı verir ve tek/çift sayı bulmada kullanılır.", "% operatörü yüzde hesaplar."),
        ("Parantez içindeki işlemler önce yapılır.", "Parantezler işlem önceliğini etkilemez."),
    ],
    "temel-fstring": [
        ("{num:.2f} değeri iki ondalığa yuvarlar.", "{num:.2f} değeri iki basamaklı tam sayıya çevirir."),
        ("{num:,.2f} binlik ayırıcı olarak virgül ekler.", "{num:,.2f} ondalık ayırıcı olarak virgül kullanır."),
        ("print fonksiyonunda sep argümanı öğeler arasındaki ayırıcıyı değiştirir.", "print fonksiyonunda sep argümanı satır sonunu değiştirir."),
        ("Yan yana yazılan string literal'ler örtük olarak birleştirilir.", "Yan yana yazılan string literal'ler hata verir."),
        ("\\n yeni satır, \\t yatay sekme karakteridir.", "\\t yeni satır karakteridir."),
    ],
    "temel-if": [
        ("if bloğu koşul True olduğunda çalışır, değilse atlanır.", "if bloğu koşul False olduğunda çalışır."),
        ("== eşitlik testidir, = ise atama operatörüdür.", "== ve = aynı anlamdadır."),
        ("if ve else cümleleri aynı hizada yazılmalıdır.", "else cümlesi if'ten daha içeride yazılmalıdır."),
        ("Sihirli sayı, kodda açıklaması olmadan geçen sayısal değerdir.", "Sihirli sayı, isimli sabitlerin diğer adıdır."),
    ],
    "temel-mantik": [
        ("String karşılaştırması büyük/küçük harfe duyarlıdır.", "'a' == 'A' ifadesi True'dur."),
        ("not operatörü tek bir Boolean ifadenin değerini tersine çevirir.", "not operatörü iki ifadeyi birleştirir."),
        ("Boolean değişken True veya False değerini tutar.", "Boolean değişken yalnızca 0 veya 1 metnini tutar."),
        ("Bir değerin aralık dışında olduğu or ile kontrol edilir: x < 10 or x > 20.", "Bir değerin aralık dışında olduğu and ile kontrol edilir: x < 10 and x > 20."),
    ],
    # ---------------- Bölüm 2: Kontrol ----------------
    "kontrol-elif": [
        ("Bir karar yapısı başka bir karar yapısının içine yerleştirilebilir.", "Karar yapıları iç içe yazılamaz."),
        ("if-elif-else yapısında istenildiği kadar elif kullanılabilir.", "if-elif-else yapısında en fazla bir elif kullanılabilir."),
        ("Hiçbir koşul doğru değilse else bloğu çalışır.", "Hiçbir koşul doğru değilse ilk elif bloğu çalışır."),
        ("if-elif-else iç içe if-else'e göre mantığı izlemeyi kolaylaştırır.", "if-elif-else iç içe if-else'den her zaman daha hızlıdır."),
    ],
    "kontrol-while": [
        ("while döngüsü koşul doğru olduğu sürece tekrar eder.", "while döngüsü sabit sayıda tekrar eder."),
        ("Döngü gövdesinin bir kez çalışmasına iterasyon denir.", "Döngü koşuluna iterasyon denir."),
        ("Sonsuz döngü, durma yolu olmayan döngüdür.", "Sonsuz döngü, Python'un otomatik olarak durdurduğu döngüdür."),
        ("Kod kopyalamak programı büyütür ve düzeltmeyi zorlaştırır.", "Kod kopyalamak tekrar yapılarından daha iyi bir yöntemdir."),
    ],
    "kontrol-for": [
        ("for döngüsü dizideki her öğe için bir kez döner.", "for döngüsü yalnızca ilk öğe için çalışır."),
        ("for döngüsü string'in karakterleri üzerinde dolaşabilir.", "for döngüsü string üzerinde dolaşamaz."),
        ("range(10, 0, -1) geriye doğru sayan bir dizi üretir.", "range negatif adım değeri kabul etmez."),
        ("range üç argümanla çağrılırsa üçüncüsü adım değeridir.", "range üç argümanla çağrılırsa üçüncüsü bitiş değeridir."),
    ],
    "kontrol-toplam": [
        ("Birikimli toplam için genellikle 0 ile başlayan bir biriktirici değişken kullanılır.", "Biriktirici değişken her iterasyonda sıfırlanmalıdır."),
        ("x += 5 ifadesi x = x + 5 ile aynıdır.", "x += 5 ifadesi x = 5 ile aynıdır."),
        ("GIGO, kötü girdinin kötü çıktı ürettiğini ifade eder.", "GIGO bir döngü türüdür."),
        ("Girdi doğrulama, girdiyi işlemeden önce incelemektir.", "Girdi doğrulama, çıktıyı ekrana yazdırmaktır."),
    ],
    "kontrol-break": [
        ("break içinde bulunduğu döngüyü sonlandırır.", "break yalnızca o iterasyonu atlar."),
        ("continue sonrasındaki kod o iterasyon için atlanır.", "continue döngüyü tamamen bitirir."),
        ("pass söz dizimi gereği ifade gereken yerde hiçbir şey yapmaz.", "pass programı duraklatır."),
        ("İç döngü, dış döngünün her iterasyonunda tüm iterasyonlarını tamamlar.", "Dış döngü, iç döngünün her iterasyonunda tamamen çalışır."),
    ],
    # ---------------- Bölüm 3: Fonksiyonlar ----------------
    "fonk-giris": [
        ("Fonksiyon belirli bir görevi yapan ifadeler grubudur.", "Fonksiyon yalnızca bir değişkendir."),
        ("Fonksiyon tanımı def anahtar kelimesiyle başlar.", "Fonksiyon tanımı function anahtar kelimesiyle başlar."),
        ("Büyük görevi küçük fonksiyonlara bölmeye böl ve yönet denir.", "Böl ve yönet, tüm kodu tek fonksiyona yazmaktır."),
        ("pass anahtar kelimesiyle boş fonksiyon oluşturulabilir.", "Boş fonksiyon oluşturmak mümkün değildir."),
    ],
    "fonk-arguman": [
        ("Argüman fonksiyona gönderilen veridir.", "Argüman fonksiyonun döndürdüğü değerdir."),
        ("Pozisyonel argümanlar parametrelerle sırayla eşleşir.", "Pozisyonel argümanlar alfabetik sırayla eşleşir."),
        ("Parametreye yapılan değişiklik argümanı etkilemez (pass by value).", "Parametreye yapılan değişiklik her zaman argümanı da değiştirir."),
        ("Anahtar kelimeli argümanlarda çağrıdaki sıra önemsizdir.", "Anahtar kelimeli argümanlar parametre sırasıyla yazılmak zorundadır."),
    ],
    "fonk-global": [
        ("Global değişken tüm fonksiyonların dışında oluşturulur.", "Global değişken bir fonksiyonun içinde oluşturulur."),
        ("random.randint(1, 10) 1 ve 10 dahil bir tam sayı döndürür.", "random.randint(1, 10) yalnızca 1 ile 9 arasında değer döndürür."),
        ("Modüldeki fonksiyon nokta gösterimiyle çağrılır: random.randint().", "Modüldeki fonksiyon nokta olmadan çağrılır: randint() (import random ile)."),
        ("random modülünün ürettiği sayılar sözde rastgeledir.", "random modülü gerçek fiziksel rastgelelik kullanır."),
    ],
    "fonk-donus": [
        ("Fonksiyon birden çok değeri virgülle ayırarak döndürebilir.", "Bir fonksiyon yalnızca tek bir değer döndürebilir."),
        ("return'ü olmayan fonksiyon None döndürür.", "return'ü olmayan fonksiyon 0 döndürür."),
        ("math.sqrt kullanmak için import math gerekir.", "math modülü import edilmeden kullanılabilir."),
        ("Modül, fonksiyon tanımları içeren .py dosyasıdır.", "Modül dosyalarının uzantısı .mod'dur."),
    ],
    # ---------------- Bölüm 4: Dosyalar ----------------
    "dosya-io": [
        ("Dosya kullanırken adımlar: aç, işle, kapat.", "Dosya kullanırken kapatmaya gerek yoktur."),
        ("read() dosyanın tüm içeriğini string olarak okur.", "read() yalnızca ilk satırı okur."),
        ("readline() bir satırı sonundaki '\\n' dahil okur.", "readline() satır sonundaki '\\n' karakterini otomatik siler."),
        ("Sıralı erişimde dosya baştan sona okunur.", "Sıralı erişimde istenen veriye doğrudan atlanır."),
    ],
    "dosya-dongu": [
        ("readline dosyanın sonunda boş string döndürür.", "readline dosyanın sonunda None döndürür."),
        ("for line in dosya: dosyanın her satırı için bir kez döner.", "for line in dosya: dosyanın her karakteri için bir kez döner."),
        ("Kayıt, tek bir öğeyi tanımlayan veri kümesidir.", "Kayıt, tek bir veri parçasıdır."),
        ("Alan (field), kayıttaki tek bir veri parçasıdır.", "Alan (field), dosyanın tamamıdır."),
        ("Dosyadaki öğe sayısı bilinmediğinde döngü kullanılır.", "Dosya okumak için döngü kullanılamaz."),
    ],
    "dosya-istisna": [
        ("İstisna, program çalışırken oluşan hatadır.", "İstisna, yalnızca yazım hatasıdır."),
        ("Traceback, istisnaya yol açan satır hakkında bilgi verir.", "Traceback, programın çıktısıdır."),
        ("except ValueError as err ile istisna nesnesine erişilir.", "İstisna nesnesine hiçbir şekilde erişilemez."),
        ("Belirtilmeyen türde istisna olursa program traceback ile durur.", "Belirtilmeyen türdeki istisnalar otomatik yok sayılır."),
    ],
    # ---------------- Bölüm 5: Listeler ----------------
    "liste-giris": [
        ("Listenin ilk elemanının indeksi 0'dır.", "Listenin ilk elemanının indeksi 1'dir."),
        ("Negatif indeks -1 son elemanı verir.", "Negatif indeks kullanmak her zaman hata verir."),
        ("Geçersiz indeks IndexError istisnasına yol açar.", "Geçersiz indeks None döndürür."),
        ("[0] * 3 ifadesi [0, 0, 0] listesini üretir.", "[0] * 3 ifadesi [0] listesini üretir."),
    ],
    "liste-metot": [
        ("append öğeyi listenin sonuna ekler.", "append öğeyi listenin başına ekler."),
        ("sort listeyi artan sıraya dizer.", "sort listeyi rastgele karıştırır."),
        ("remove öğenin ilk geçtiği yeri siler.", "remove öğenin tüm geçtiği yerleri siler."),
        ("Dilim liste[start:end] end indeksini içermez.", "Dilim liste[start:end] end indeksini içerir."),
    ],
    "liste-comp": [
        ("Liste üreteci mevcut bir listeden yeni liste oluşturan kısa ifadedir.", "Liste üreteci yalnızca boş liste üretir."),
        ("Liste üretecinde if ile yalnızca bazı elemanlar seçilebilir.", "Liste üretecinde if kullanılamaz."),
        ("İki boyutlu listede elemana iki indeksle erişilir.", "İki boyutlu listede elemana tek indeksle erişilir."),
        ("Tuple işlemek listeden daha hızlıdır.", "Tuple'lar listelerden daha yavaş işlenir."),
        ("tuple() fonksiyonu listeyi tuple'a çevirir.", "list() fonksiyonu listeyi tuple'a çevirir."),
    ],
    "liste-grafik": [
        ("plt.plot çizgi grafiği oluşturur.", "plt.plot pasta grafiği oluşturur."),
        ("plt.bar çubuk grafiği oluşturur.", "plt.bar çizgi grafiği oluşturur."),
        ("Pasta grafiğinde değerlerin toplamı bütünü oluşturur.", "Pasta grafiğinde her dilim eşit büyüklüktedir."),
        ("plt.show() grafiği ekranda gösterir.", "Grafik plt.print() ile gösterilir."),
    ],
    # ---------------- Bölüm 6: String'ler ----------------
    "str-temel": [
        ("String'ler dizidir; indeksleme ve for ile dolaşma kullanılabilir.", "String'ler üzerinde for döngüsü kurulamaz."),
        ("len(s) string'in karakter sayısını verir.", "len(s) string'deki kelime sayısını verir."),
        ("Birleştirme yeni bir string oluşturur.", "Birleştirme var olan string'i yerinde değiştirir."),
        ("String'in ilk karakterinin indeksi 0'dır.", "String'in ilk karakterinin indeksi 1'dir."),
    ],
    "str-metot": [
        ("upper() harfleri büyük harfe çeviren bir kopya döndürür.", "upper() string'in kendisini değiştirir."),
        ("strip() baştaki ve sondaki boşlukları siler.", "strip() string'deki tüm boşlukları siler."),
        ("isdigit() yalnızca rakam içeren string için True döndürür.", "isdigit() harf içeren string için True döndürür."),
        ("replace(eski, yeni) eskinin her geçtiği yeri değiştirir.", "replace(eski, yeni) yalnızca ilk geçtiği yeri değiştirir."),
    ],
    "str-split": [
        ("split() string'i parçalara ayırıp liste döndürür.", "split() string döndürür."),
        ("split varsayılan olarak boşluğa göre ayırır.", "split varsayılan olarak virgüle göre ayırır."),
        ("Token'ları ayıran karaktere sınırlayıcı (delimiter) denir.", "Token'ları ayıran karaktere indeks denir."),
        ("'Ha' * 3 ifadesi 'HaHaHa' üretir.", "'Ha' * 3 ifadesi hata verir."),
        ("split ile üretilen token'lar string'dir.", "split ile üretilen sayısal token'lar otomatik int olur."),
    ],
    # ---------------- Bölüm 7: Sözlükler ve kümeler ----------------
    "sozluk-giris": [
        ("Sözlükteki her eleman bir anahtar ve bir değerden oluşur.", "Sözlükteki elemanlar yalnızca değerlerden oluşur."),
        ("Olmayan anahtar d[k] ile istenirse KeyError oluşur.", "Olmayan anahtar d[k] ile istenirse 0 döner."),
        ("del d[k] anahtar-değer çiftini siler.", "del d[k] tüm sözlüğü siler."),
        ("Boş sözlük {} veya dict() ile oluşturulur.", "Boş sözlük [] ile oluşturulur."),
    ],
    "sozluk-metot": [
        ("items() (anahtar, değer) tuple'larını verir.", "items() yalnızca anahtarları verir."),
        ("pop(anahtar) değeri döndürür ve çifti siler.", "pop(anahtar) çifti silmeden değeri döndürür."),
        ("clear() sözlüğü boşaltır.", "clear() sözlüğü siler ve değişkeni kaldırır."),
        ("Sözlük üreteci {k: v for ...} biçiminde yazılır.", "Sözlük üreteci [k: v for ...] biçiminde yazılır."),
    ],
    "sozluk-kume": [
        ("Kümeler sırasızdır.", "Kümelerde elemanlar eklenme sırasıyla indekslenir."),
        ("& operatörü iki kümenin kesişimini verir.", "& operatörü iki kümenin birleşimini verir."),
        ("set('banana') kümesi 3 elemanlıdır.", "set('banana') kümesi 6 elemanlıdır."),
        ("A <= B ifadesi A'nın B'nin alt kümesi olup olmadığını test eder.", "A <= B ifadesi kümelerin eleman sayısını karşılaştırır."),
    ],
    "sozluk-pickle": [
        ("Pickle'lamak için dosya ikili yazma ('wb') modunda açılır.", "Pickle'lamak için dosya metin okuma ('r') modunda açılır."),
        ("pickle.load dosyadan nesneyi geri yükler.", "pickle.load nesneyi dosyaya yazar."),
        ("Bir dosyaya birden çok nesne pickle'lanabilir.", "Bir dosyaya yalnızca tek nesne pickle'lanabilir."),
        ("Unpickling, pickle'lanmış nesneyi geri almaktır.", "Unpickling, nesneyi silmektir."),
    ],
    # ---------------- Bölüm 8: Sınıflar ----------------
    "sinif-oop": [
        ("Nesne hem veri hem prosedür içerir.", "Nesne yalnızca veri içerir."),
        ("Veri gizleme, nesnenin verisinin dışarıdaki koddan gizlenmesidir.", "Veri gizleme, verinin silinmesidir."),
        ("Aynı nesne farklı programlarda yeniden kullanılabilir.", "Bir nesne yalnızca tek bir programda kullanılabilir."),
        ("Public metotlar dışarıdaki kodun nesneyi yönetmesini sağlar.", "Private metotlar dışarıdaki kodun kullanımı içindir."),
    ],
    "sinif-tanim": [
        ("Sınıf, nesnenin öznitelik ve metotlarını belirten plandır.", "Sınıf, programın çalışan bir kopyasıdır."),
        ("Örnek oluşturmak için sınıf adı parantezle çağrılır: Coin().", "Örnek oluşturmak için new Coin yazılır."),
        ("__str__ nesne print'e verildiğinde otomatik çağrılır.", "__str__ yalnızca elle çağrılabilir."),
        ("Öznitelik adının başına iki alt çizgi konarak gizlenir.", "Öznitelik adının sonuna iki alt çizgi konarak gizlenir."),
    ],
    "sinif-ornek": [
        ("Her örneğin kendi öznitelik kümesi vardır.", "Bir sınıfın tüm örnekleri aynı öznitelik değerlerini paylaşır."),
        ("Nesne argüman verildiğinde nesneye referans aktarılır.", "Nesne argüman verildiğinde bağımsız kopyası aktarılır."),
        ("UML sınıf diyagramında üst bölmede sınıf adı yazar.", "UML sınıf diyagramında üst bölmede metotlar yazar."),
        ("Problem açıklamasındaki isimler potansiyel sınıflardır.", "Problem açıklamasındaki fiiller potansiyel sınıflardır."),
    ],
    # ---------------- Bölüm 9: Kalıtım ----------------
    "kalitim-giris": [
        ("Kalıtım sınıflar arasında \"is a\" ilişkisi kurar.", "Kalıtım iki sınıfı tek sınıfta birleştirir."),
        ("Alt sınıf tanımında üst sınıf adı parantez içinde yazılır: class Car(Automobile).", "Alt sınıf tanımında üst sınıf adı köşeli parantez içinde yazılır."),
        ("Alt sınıfın başlatıcısı genellikle önce üst sınıfın başlatıcısını çağırır.", "Alt sınıf üst sınıfın başlatıcısını asla çağıramaz."),
        ("Üst sınıfa base class, alt sınıfa derived class da denir.", "Alt sınıfa base class denir."),
    ],
    "kalitim-poly": [
        ("Çok biçimlilik nesnenin farklı biçimler alabilmesidir.", "Çok biçimlilik bir sınıfın tek örneği olmasıdır."),
        ("Override edilmeyen metot üst sınıftan miras alınır.", "Override edilmeyen metot alt sınıfta kullanılamaz."),
        ("Override eden metot üst sınıftaki sürümü çağırıp üzerine ekleyebilir.", "Override eden metot üst sınıftaki sürümü çağıramaz."),
        ("Üst sınıfın örneği için isinstance(nesne, AltSinif) False döner.", "Üst sınıfın örneği alt sınıfın da örneğidir."),
    ],
    # ---------------- Bölüm 10: Özyineleme ----------------
    "ozyineleme-giris": [
        ("Özyinelemeli fonksiyon kendini çağırır.", "Özyinelemeli fonksiyon kendini asla çağırmaz."),
        ("Temel durum özyineleme olmadan çözülebilen durumdur.", "Temel durum fonksiyonun kendini çağırdığı durumdur."),
        ("Özyineleme derinliği fonksiyonun kendini kaç kez çağırdığıdır.", "Özyineleme derinliği fonksiyonun satır sayısıdır."),
        ("Dolaylı özyinelemede A fonksiyonu B'yi, B de A'yı çağırır.", "Dolaylı özyinelemede fonksiyon kendini doğrudan çağırır."),
    ],
    "ozyineleme-alg": [
        ("fib(n) = fib(n-1) + fib(n-2) özyinelemeli durumdur.", "fib(n) = fib(n-1) * fib(n-2) özyinelemeli durumdur."),
        ("x, y'ye tam bölünüyorsa gcd(x, y) = y'dir.", "x, y'ye tam bölünüyorsa gcd(x, y) = x'tir."),
        ("Hanoi'de bir disk daha küçük bir diskin üstüne konamaz.", "Hanoi'de büyük disk küçük diskin üstüne konabilir."),
        ("range_sum'da start > end olduğunda 0 döndürülür.", "range_sum'da start > end olduğunda sonsuz döngü oluşur."),
    ],
    # ---------------- Bölüm 11: Veritabanı ----------------
    "vt-giris": [
        ("DBMS büyük miktarda veriyle verimli çalışmak için tasarlanmış yazılımdır.", "DBMS yalnızca küçük veriler için uygundur."),
        ("SQLite Python ile birlikte sqlite3 modülünde gelir.", "SQLite kullanmak için ayrı bir sunucu kurmak gerekir."),
        ("Tablo satır ve sütunlardan oluşur.", "Tablo yalnızca sütunlardan oluşur."),
        ("SQLite'taki TEXT tipi Python'da str'ye karşılık gelir.", "SQLite'taki TEXT tipi Python'da int'e karşılık gelir."),
    ],
    "vt-tablo": [
        ("CREATE TABLE yeni bir tablo oluşturur.", "CREATE TABLE tabloya satır ekler."),
        ("conn.commit() değişiklikleri veritabanına kaydeder.", "conn.close() değişiklikleri otomatik geri alır ve commit gerekmez."),
        ("NOT NULL kısıtı sütunun boş bırakılamayacağını belirtir.", "NOT NULL kısıtı sütunun her zaman boş olacağını belirtir."),
        ("? yer tutucuları değişken değerlerini SQL'e güvenle eklemek için kullanılır.", "SQL'e değişken eklemek için yalnızca string birleştirme kullanılabilir."),
    ],
    "vt-select": [
        ("SELECT * tablonun tüm sütunlarını getirir.", "SELECT * tablonun tüm satırlarını siler."),
        ("WHERE yalnızca kriteri sağlayan satırları döndürür.", "WHERE tüm satırları sıralar."),
        ("LIKE '%Bar%' içinde Bar geçen değerleri bulur.", "LIKE '%Bar%' yalnızca tam olarak 'Bar' olan değerleri bulur."),
        ("fetchall() tüm sonuç satırlarını liste olarak döndürür.", "fetchall() yalnızca ilk satırı döndürür."),
    ],
    "vt-update": [
        ("UPDATE var olan satırların içeriğini değiştirir.", "UPDATE tabloya yeni satır ekler."),
        ("rowcount etkilenen satır sayısını verir.", "rowcount tablodaki sütun sayısını verir."),
        ("CRUD: Create, Read, Update, Delete.", "CRUD: Copy, Run, Upload, Download."),
        ("Bileşik anahtar birden çok sütunun birleşiminden oluşur.", "Bileşik anahtar tek bir metin sütunudur."),
    ],
    "vt-iliski": [
        ("İlişkisel tasarım veri tekrarını azaltır.", "İlişkisel tasarım veri tekrarını artırır."),
        ("Bire-çok ilişkide bir departmanda çok çalışan olabilir.", "Bire-çok ilişkide her çalışan birden çok departmandadır ve her departmanda tek çalışan vardır."),
        ("Birden çok tablodan sütun alırken TabloAdi.SutunAdi kullanılır.", "Birden çok tablodan sütun almak mümkün değildir."),
        ("FOREIGN KEY kısıtı referans bütünlüğü sağlar.", "FOREIGN KEY kısıtı sütunu otomatik artan yapar."),
    ],
    # ---------------- Bölüm 12: Ortamlar ----------------
    "ortam-anaconda": [
        ("Anaconda veri bilimi ve makine öğrenmesi için tasarlanmış ücretsiz bir dağıtımdır.", "Anaconda ücretli bir Python sürümüdür."),
        ("Navigator'dan Jupyter Notebook tek tıkla başlatılabilir.", "Navigator'dan hiçbir uygulama başlatılamaz."),
        ("Anaconda NumPy ve Pandas gibi kütüphaneleri önceden kurulu getirir.", "Anaconda yalnızca Python yorumlayıcısını içerir."),
    ],
    "ortam-jupyter": [
        ("Jupyter canlı kod, görselleştirme ve anlatımı tek belgede birleştirir.", "Jupyter yalnızca kod yazmak için bir metin editörüdür."),
        ("Jupyter, keşifsel veri analizi (EDA) için idealdir.", "Jupyter'da kod tek seferde, bütün olarak çalıştırılmak zorundadır."),
        ("Anaconda olmadan Jupyter pip install notebook ile kurulabilir.", "Jupyter yalnızca Anaconda ile kurulabilir."),
    ],
    "ortam-colab": [
        ("Colab notebook'ları Google Drive'a kaydedilir.", "Colab notebook'ları yalnızca yerel diske kaydedilir."),
        ("Colab'da GPU, Runtime → Change runtime type ile seçilir.", "Colab'da GPU kullanmak için ayrı donanım satın alınır."),
        ("Colab ücretsiz katmanda oturumlar belirli süre sonra kapanır.", "Colab ücretsiz katmanda oturumlar sınırsız sürer."),
    ],
    # ---------------- Bölüm 13: NumPy 1 ----------------
    "n-liste": [
        ("Python listesi heterojen veri tutabilir.", "Python listesi yalnızca tek tip veri tutabilir."),
        ("Liste döngüsünde her eleman için tip kontrolü yapılır.", "Liste döngüsünde tip kontrolü hiç yapılmaz."),
    ],
    "n-ndarray": [
        ("ndarray'de pointer takibi ve tip kontrolü yükü yoktur.", "ndarray her eleman için pointer takip eder."),
        ("Bitişik bellek düzeni NumPy performansının anahtarıdır.", "NumPy performansı dağınık bellek düzeninden gelir."),
    ],
    "n-vektor": [
        ("İki NumPy dizisi + ile eleman eleman toplanır.", "İki NumPy dizisini toplamak için mutlaka for döngüsü gerekir."),
        ("Vektörleştirilmiş kod daha az hata ihtimali taşır.", "Vektörleştirilmiş kod daha fazla satır gerektirir."),
    ],
    "n-performans": [
        ("NumPy büyük veride kat kat (orders of magnitude) hızlıdır.", "NumPy büyük veride Python listesinden yalnızca biraz hızlıdır."),
        ("Çok küçük listelerde NumPy dizisi oluşturma yükü işlemi yavaşlatabilir.", "Çok küçük listelerde NumPy her zaman en hızlı çözümdür."),
    ],
    "d-eksen": [
        ("ndarray'in temel nesnesi N boyutlu dizidir.", "ndarray yalnızca 1 boyutlu olabilir."),
        ("2 boyutlu dizide axis 1 sütunları temsil eder.", "2 boyutlu dizide axis 1 satırları temsil eder."),
        ("ndarray genellikle sayılardan oluşan bir eleman tablosudur.", "ndarray yalnızca metinlerden oluşur."),
    ],
    "d-kisit": [
        ("ndarray'in üç kısıtı homojenlik, sabit boyut ve dikdörtgen şekildir.", "ndarray'in kısıtları dinamik boyut ve heterojenliktir."),
        ("Bitişik blok için her elemanın boyutu bilinmeli ve aynı olmalıdır.", "ndarray'de her eleman farklı boyutta olabilir."),
        ("Dinamik büyütme yeni bellek ayırma gerektirirdi.", "ndarray append ile bellek ayırmadan büyür."),
    ],
    "d-boyut": [
        ("Vektörün ndim değeri 1'dir.", "Vektörün ndim değeri 2'dir."),
        ("n satır, m sütunlu matrisin shape'i (n, m)'dir.", "n satır, m sütunlu matrisin shape'i (m, n)'dir."),
        ("size toplam eleman sayısıdır.", "size her elemanın bayt boyutudur."),
    ],
    "d-dtype": [
        ("int32 tipindeki bir elemanın itemsize değeri 4'tür.", "int32 tipindeki bir elemanın itemsize değeri 32'dir."),
        ("itemsize her elemanın bayt cinsinden boyutudur.", "itemsize dizideki eleman sayısıdır."),
        ("NumPy int32, int64, float32, float64 gibi tipleri destekler.", "NumPy yalnızca float64 tipini destekler."),
    ],
    "o-array": [
        ("np.array() liste veya tuple'dan dizi oluşturur.", "np.array() yalnızca boş dizi oluşturur."),
        ("np.array([1, 2.5]) dizisinin elemanları float olur.", "np.array([1, 2.5]) dizisinde 1 int, 2.5 float kalır."),
        ("Dizi oluşturmanın üç yolu: mevcut veri, yer tutucu, sayı dizisi.", "NumPy dizisi yalnızca listeden oluşturulabilir."),
    ],
    "o-yertutucu": [
        ("np.ones birlerle dolu dizi oluşturur.", "np.ones tek elemanlı dizi oluşturur."),
        ("np.empty kullanılırsa her elemana sonradan değer atanmalıdır.", "np.empty değerleri güvenle sıfırlar."),
    ],
    "o-dizi": [
        ("np.arange ondalıklı argüman da alabilir.", "np.arange yalnızca tam sayı argüman alır."),
        ("np.linspace(0, 1, 5) beş değer üretir.", "np.linspace(0, 1, 5) dört değer üretir."),
    ],
    "o-alistirma": [
        ("np.eye(n) n×n birim matris oluşturur.", "np.eye(n) n×n sıfır matrisi oluşturur."),
        ("Birim matriste ana köşegende 1, diğer yerlerde 0 vardır.", "Birim matrisin tüm elemanları 1'dir."),
        ("np.random.rand(4, 4) 0 ile 1 arasında rastgele değerler üretir.", "np.random.rand(4, 4) 1 ile 4 arasında tam sayılar üretir."),
        ("10'dan 50'ye (50 dahil) sayılar için np.arange(10, 51) yazılır.", "10'dan 50'ye (50 dahil) sayılar için np.arange(10, 50) yazılır."),
        ("np.linspace(0, 1, 10) 0 ile 1 arasında 10 eşit aralıklı değer üretir.", "np.linspace(0, 1, 10) 0,1 aralıklarla 11 değer üretir."),
    ],
    "i-1d": [
        ("1 boyutlu NumPy dizisinde dilimleme listelerle aynı sözdizimini kullanır.", "NumPy dizileri dilimlenemez."),
        ("a[-1] dizinin son elemanını verir.", "a[-1] dizinin ilk elemanını verir."),
        ("a[2:5] 2, 3 ve 4. indeksleri verir.", "a[2:5] 2, 3, 4 ve 5. indeksleri verir."),
        ("İndeksleme ve dilimleme veri filtreleme için temeldir.", "İndeksleme yalnızca diziyi yazdırmak için kullanılır."),
    ],
    "i-2d": [
        ("m[0, :] 0. satırın tamamını verir.", "m[0, :] 0. sütunun tamamını verir."),
        ("m[:, 1] 1. sütunun tamamını verir.", "m[:, 1] 1. satırın tamamını verir."),
        ("Tek başına : o eksenin tamamı demektir.", "Tek başına : o eksenin ilk elemanı demektir."),
        ("m[:2, 1:] ilk iki satırın 1. sütundan sonrasını verir.", "m[:2, 1:] yalnızca tek bir eleman verir."),
    ],
    "i-reshape": [
        ("reshape elemanları değiştirmeden şekli değiştirir.", "reshape elemanların değerlerini değiştirir."),
        ("np.arange(24).reshape(2, 3, 4) 2 blok, 3 satır, 4 sütundur.", "np.arange(24).reshape(2, 3, 4) 4 blok, 3 satır, 2 sütundur."),
        ("3 boyutlu dizide indeks sırası t[blok, satır, sütun]'dur.", "3 boyutlu dizide indeks sırası t[sütun, satır, blok]'tur."),
    ],
    "v-view": [
        ("View değiştirilirse değişiklik orijinal diziye yansır.", "View değiştirilirse orijinal dizi etkilenmez."),
        ("a[:] basit dilimleme olduğu için view döndürür.", "a[:] her zaman bağımsız kopya döndürür."),
    ],
    "v-neden": [
        ("Veri bilimi dizileri gigabaytlarca büyüklükte olabilir.", "Veri bilimi dizileri her zaman küçüktür."),
        ("View, veriyi çoğaltmadan alt parçalara erişim sağlar.", "View, verinin tam kopyasını oluşturur."),
        ("NumPy, performansı listelerin güvenli kopyalama davranışına tercih eder.", "NumPy, güvenliği performansa her zaman tercih eder."),
        ("Her dilim kopya olsaydı bellek ayırma ve kopyalama yükü oluşurdu.", "Her dilimin kopya olması belleği azaltırdı."),
    ],
    "v-copy": [
        (".copy() ile oluşturulan dizi orijinalle bellek paylaşmaz.", ".copy() ile oluşturulan dizi orijinalle aynı belleği paylaşır."),
        ("Kopyayı değiştirmek orijinali etkilemez.", "Kopyayı değiştirmek orijinali de değiştirir."),
        ("Deep copy, orijinalden tamamen bağımsız kopyadır.", "Deep copy, orijinale bağlı bir view'dır."),
    ],
    # ---------------- Bölüm 14: NumPy 2 ----------------
    "np2-maske": [
        ("Maske, bir koşula göre True/False değerlerinden oluşan dizidir.", "Maske, dizideki tüm değerleri silen bir fonksiyondur."),
        ("data[mask] yalnızca maskenin True olduğu elemanları seçer.", "data[mask] yalnızca maskenin False olduğu elemanları seçer."),
        ("Maskeyle seçilen elemanlara değer atanabilir: a[a < 0] = 0.", "Maskeyle seçilen elemanlara değer atanamaz."),
        ("Bileşik maskede her koşul parantez içine alınmalıdır.", "Bileşik maskede parantez kullanılması hata verir."),
    ],
    "np2-reshape": [
        ("reshape'te -1 verilen boyut otomatik hesaplanır.", "reshape'te -1 verilen boyut silinir."),
        ("reshape uyumsuz şekilde ValueError fırlatır.", "reshape uyumsuz şekilde eksik elemanları sıfırla doldurur."),
        (".T satırlar ile sütunların yerini değiştirir.", ".T diziyi düzleştirir."),
        ("ravel ve flatten çok boyutlu diziyi tek boyuta indirger.", "ravel diziyi üç boyuta çıkarır."),
    ],
    "np2-birlestir": [
        ("hstack, axis=1 boyunca concatenate ile eşdeğerdir.", "hstack, axis=0 boyunca concatenate ile eşdeğerdir."),
        ("concatenate birleştirilecek dizileri tuple olarak alır.", "concatenate yalnızca tek dizi alır."),
        ("split, birleştirmenin ters işlemidir.", "split dizileri birleştirir."),
        ("split'e indeks dizisi verilirse bu indeksler bölme noktalarıdır.", "split'e indeks dizisi verilemez."),
    ],
    "np2-ufunc": [
        ("Ufunc, ndarray üzerinde eleman eleman çalışan fonksiyondur.", "Ufunc yalnızca tek bir sayı üzerinde çalışır."),
        ("a + b ifadesi içeride np.add(a, b)'yi tetikler.", "a + b ifadesi dizileri uç uca ekler."),
        ("Karşılaştırma ufunc'ları boolean dizi döndürür.", "Karşılaştırma ufunc'ları tek bir True/False döndürür."),
        ("Broadcasting'de daha az boyutlu dizinin şekli soldan 1'lerle doldurulur.", "Broadcasting'de daha az boyutlu dizinin şekli sağdan 1'lerle doldurulur."),
    ],
    "np2-toplama": [
        ("np.mean ortalamayı, np.std standart sapmayı verir.", "np.std ortalamayı verir."),
        ("axis=1 ile toplama her satır için bir sonuç üretir.", "axis=1 ile toplama her sütun için bir sonuç üretir."),
        ("np.prod elemanların çarpımını verir.", "np.prod elemanların toplamını verir."),
        ("np.amin ve np.min en küçük değeri verir.", "np.amin en büyük değeri verir."),
    ],
    # ---------------- Bölüm 15: Pandas ----------------
    "pd-giris": [
        ("Pandas, Python için açık kaynaklı bir veri işleme ve analiz kütüphanesidir.", "Pandas, Python için bir web geliştirme çatısıdır."),
        ("Pandas adı ekonometrideki \"panel data\" teriminden gelir.", "Pandas adı Python'un ilk sürümünün kod adından gelir."),
        ("Pandas işlemleri betiklere yazıldığı için analiz tekrarlanabilir ve otomatik olur.", "Pandas analizleri yalnızca elle, fareyle tekrarlanabilir."),
        ("Elektronik tablolar 1 milyondan fazla satırlı veride yavaşlar ve kullanışsızlaşır.", "Elektronik tablolar büyük veri setlerinde Pandas'tan daha hızlıdır."),
        ("Pandas DataFrame, R'ın data.frame kolaylığını Python'a getirmek için geliştirildi.", "Pandas DataFrame, SQL veritabanlarının yerini almak için geliştirildi."),
    ],
    "pd-series": [
        ("Series tek boyutlu, etiketli bir dizidir.", "Series iki boyutlu bir tablodur."),
        ("Index verilmezse Series'in index'i 0'dan başlayan tam sayılardır.", "Index verilmezse Series'in index'i 1'den başlar."),
        ("Sözlükten oluşturulan Series'te değerler veri, anahtarlar index olur.", "Sözlükten oluşturulan Series'te anahtarlar veri, değerler index olur."),
        ("s.values verileri NumPy dizisi olarak döndürür.", "s.values Series'in etiketlerini döndürür."),
        ("Series, DataFrame'in kavramsal yapı taşıdır.", "Series ile DataFrame arasında hiçbir ilişki yoktur."),
    ],
    "pd-dataframe": [
        ("DataFrame'in sütunları farklı veri tiplerinde olabilir.", "DataFrame'in tüm sütunları aynı veri tipinde olmak zorundadır."),
        ("Listelerden oluşan sözlükle DataFrame oluştururken tüm listeler aynı uzunlukta olmalıdır.", "Listelerden oluşan sözlükte kısa listeler otomatik olarak 0 ile doldurulur."),
        ("Series'lerden oluşan sözlükten DataFrame oluşturulunca index, Series index'lerinin birleşimi olur.", "Series'lerden oluşan sözlükten DataFrame oluşturulunca yalnızca ortak etiketler kalır."),
        ("Pandas'ta veri ile etiketleri arasındaki bağ, açıkça koparılmadıkça kopmaz.", "Pandas işlemlerde etiketleri yok sayıp verileri konumlarına göre eşler."),
        ("İki Series toplanırken yalnızca birinde olan etiketin sonucu NaN olur.", "İki Series toplanırken yalnızca birinde olan etiketin sonucu 0 olur."),
    ],
    "pd-inceleme": [
        ("df.shape bir (satır, sütun) tuple'ı döndürür.", "df.shape bir (sütun, satır) tuple'ı döndürür."),
        ("head() n verilmezse ilk 5 satırı döndürür.", "head() n verilmezse ilk 10 satırı döndürür."),
        ("describe() yalnızca sayısal sütunları özetler.", "describe() varsayılan olarak tüm string sütunlarının ortalamasını da hesaplar."),
        ("info() çıktısındaki Non-Null Count satır sayısından azsa sütunda eksik veri vardır.", "info() eksik veriler hakkında hiçbir bilgi vermez."),
        ("Medyan, describe() çıktısındaki 50% satırıdır.", "Medyan, describe() çıktısındaki mean satırıdır."),
        ("Standart sapma ve aralık, dağılımın yayılımını ölçer.", "Standart sapma, verinin merkezi eğilim ölçüsüdür."),
    ],
    "pd-io": [
        ("Okuyucu fonksiyonlar pd.read_* biçimindedir ve Pandas nesnesi döndürür.", "Okuyucu fonksiyonlar df.to_* biçimindedir."),
        ("to_csv varsayılan olarak index'i dosyanın ilk sütunu olarak yazar.", "to_csv varsayılan olarak index'i hiçbir zaman yazmaz."),
        ("Başlık satırı olmayan CSV için header=None kullanılır.", "Başlık satırı olmayan CSV için index_col=None kullanılır."),
        ("usecols yalnızca gereken sütunları yükleyerek bellek tasarrufu sağlar.", "usecols dosyadaki tüm sütunları iki kez yükler."),
        ("pd.read_excel openpyxl gibi ek bir kütüphane gerektirir.", "pd.read_excel hiçbir ek kütüphane olmadan .xlsx okuyabilir."),
    ],
    "pd-secim": [
        ("loc etikete, iloc tam sayı konuma dayalıdır.", "loc konuma, iloc etikete dayalıdır."),
        ("iloc dilimlerinde bitiş konumu dahil değildir.", "iloc dilimlerinde bitiş konumu dahildir."),
        ("df[['Age', 'Name']] bir DataFrame döndürür.", "df[['Age', 'Name']] bir Series döndürür."),
        ("Index'i string olan verilerde satırları adıyla seçmek için loc kullanılır.", "Index'i string olan verilerde satırları adıyla seçmek için iloc kullanılır."),
        ("Üretim kodunda açıklık için loc ve iloc erişimcileri önerilir.", "Üretim kodunda loc ve iloc kullanmaktan kaçınılmalıdır."),
    ],
    "pd-filtre": [
        ("Boolean indeksleme if-then ifadesinin vektörleştirilmiş karşılığıdır.", "Boolean indeksleme her satır için ayrı bir if çalıştırır."),
        ("df[mask] maskenin True olduğu satırları seçer.", "df[mask] maskenin False olduğu satırları seçer."),
        ("Pandas filtrelemede değil işlemi için ~ kullanılır.", "Pandas filtrelemede değil işlemi için ! kullanılır."),
        ("Filtrelenen satırlar orijinal index etiketlerini korur.", "Filtreleme sonrası index her zaman 0'dan yeniden numaralanır."),
    ],
    "pd-eksik": [
        ("np.nan float tipindedir.", "np.nan int tipindedir."),
        ("pd.NaT datetime ve timedelta sütunlarında eksik değeri gösterir.", "pd.NaT string sütunlarında eksik değeri gösterir."),
        ("isna().sum() sütun başına eksik değer sayısını verir.", "isna().sum() sütunlardaki değerlerin toplamını verir."),
        ("dtype='Int64' olan Series float'a yükseltilmeden pd.NA tutabilir.", "dtype='Int64' olan Series NaN görünce float64'e dönüşür."),
        ("None, object sütunlarında eksik veri işareti olarak kullanılır.", "None yalnızca sayısal sütunlarda kullanılabilir."),
    ],
    "pd-doldur": [
        ("dropna(axis=1) eksik değer içeren sütunları siler.", "dropna(axis=1) eksik değer içeren satırları siler."),
        ("dropna(how='all') yalnızca tüm değerleri eksik olan satırları siler.", "dropna(how='all') en az bir eksik değeri olan tüm satırları siler."),
        ("İleri doldurma (ffill) son bilinen değeri kullanır.", "İleri doldurma (ffill) sonraki bilinen değeri kullanır."),
        ("fillna eksik değerleri sabit veya hesaplanmış bir değerle doldurur.", "fillna eksik değer içeren satırları siler."),
        ("Kategorik sütunlarda eksik değerler genellikle mod ile doldurulur.", "Kategorik sütunlarda eksik değerler ortalamayla doldurulmalıdır."),
    ],
    "pd-birlestir": [
        ("pd.concat aynı yapıdaki DataFrame'leri yığmak için kullanılır.", "pd.concat iki tabloyu anahtar sütuna göre eşleştirir."),
        ("ignore_index=True yeni bir RangeIndex oluşturur.", "ignore_index=True sütun adlarını siler."),
        ("how='outer' anahtarların birleşimini tutar.", "how='outer' yalnızca ortak anahtarları tutar."),
        ("how='left' soldaki tüm anahtarları tutar.", "how='left' yalnızca sağdaki anahtarları tutar."),
        ("validate='m:1' anahtarların sağ tabloda benzersiz olduğunu doğrular.", "validate='m:1' anahtarların sol tabloda benzersiz olduğunu doğrular."),
    ],
    "pd-groupby": [
        ("groupby süreci böl, uygula, birleştir adımlarından oluşur.", "groupby süreci sırala, sil, yaz adımlarından oluşur."),
        ("transform sonucu orijinalle aynı index ve şekle sahiptir.", "transform her grup için tek bir satır döndürür."),
        ("Toplama sonucu grup anahtarlarıyla indekslenir.", "Toplama sonucu her zaman orijinal index'i korur."),
        ("İsimli toplamada anahtar kelimeler yeni sütun adları olur.", "İsimli toplamada sütun adları değiştirilemez."),
        ("filter, grup bazındaki bir koşula göre grupları tamamen atar.", "filter her gruptan yalnızca ilk satırı tutar."),
    ],
    "pd-reshape": [
        ("pd.melt geniş formatı uzun formata çevirir.", "pd.melt uzun formatı geniş formata çevirir."),
        ("pivot_table melt'in tersidir.", "pivot_table concat'in diğer adıdır."),
        ("pivot_table'da values hücreleri dolduracak sütundur.", "pivot_table'da values satırlara konacak sütundur."),
        ("Tidy veride her değişken bir sütun, her gözlem bir satırdır.", "Tidy veride her değişken bir satır, her gözlem bir sütundur."),
    ],
    "pd-zaman": [
        ("Timestamp zamanda tek bir anı temsil eder.", "Timestamp bir zaman aralığını temsil eder."),
        ("DatetimeIndex Timestamp'lerden oluşan bir Index'tir.", "DatetimeIndex yalnızca tam sayılardan oluşan bir Index'tir."),
        ("İki Timestamp'in farkı bir Timedelta'dır.", "İki Timestamp'in farkı bir Period'dur."),
        ("resample zaman serisinin örnekleme sıklığını değiştirir.", "resample zaman serisindeki tarihleri siler."),
        ("Pandas başlangıçta finansal analiz için geliştirildi.", "Pandas başlangıçta oyun geliştirme için tasarlandı."),
    ],
    # ---------------- Bölüm 0: Veri bilimi nedir? (slayt dışı, ara sınav 1.1) ----------------
    "vb-tanim": [
        ("Veri bilimi istatistik, programlama ve alan bilgisini birleştiren disiplinler arası bir alandır.", "Veri bilimi yalnızca programlamadan oluşan bir alandır."),
        ("CSV dosyasındaki satır-sütun tablosu yapılandırılmış veridir.", "CSV dosyasındaki satır-sütun tablosu yapılandırılmamış veridir."),
        ("JSON yarı yapılandırılmış veriye örnektir.", "JSON yapılandırılmamış görüntü verisidir."),
        ("Serbest metin ve görüntüler yapılandırılmamış veridir.", "Serbest metin her zaman yapılandırılmış veridir."),
        ("Alan bilgisi doğru soruyu sormak ve sonucu yorumlamak için gereklidir.", "Alan bilgisi veri biliminde gereksizdir."),
    ],
    "vb-surec": [
        ("Veri bilimi süreci soruyu tanımlamakla başlar.", "Veri bilimi süreci modellemeyle başlar."),
        ("Veri temizleme, keşifsel analizden ve modellemeden önce yapılır.", "Veri temizleme modelleme bittikten sonra yapılır."),
        ("Veri bilimi süreci döngüseldir; gerektiğinde önceki adımlara dönülür.", "Veri bilimi sürecinde önceki adımlara asla geri dönülmez."),
        ("EDA, veriyi betimsel istatistik ve grafiklerle tanıma adımıdır.", "EDA, verinin silinmesi adımıdır."),
        ("GIGO, kötü girdinin kötü sonuç üreteceğini anlatır.", "GIGO, iyi girdinin kötü sonuç üreteceğini anlatır."),
    ],
    "vb-python": [
        ("pandas tablo verisi (Series, DataFrame) ile çalışmak için kullanılır.", "pandas yalnızca grafik çizmek için kullanılır."),
        ("NumPy hızlı çok boyutlu sayısal diziler sunar.", "NumPy bir veritabanı yönetim sistemidir."),
        ("Jupyter kod, çıktı ve açıklamayı tek belgede birleştirir.", "Jupyter yalnızca kodu derleyen bir derleyicidir."),
        ("Analizi betik olarak yazmak onu tekrarlanabilir yapar.", "Betik olarak yazılan analiz tekrar çalıştırılamaz."),
        ("Matplotlib grafik çizmek için kullanılan bir kütüphanedir.", "Matplotlib tablo verisini temizleyen kütüphanedir."),
    ],
    "pd-temizlik": [
        ("df.duplicated() ilk görülen satır için False döndürür.", "df.duplicated() ilk görülen satır için de True döndürür."),
        ("drop_duplicates(keep=False) tekrar eden tüm satırları siler.", "drop_duplicates(keep=False) hiçbir satırı silmez."),
        ("subset parametresi tekrarın hangi sütunlara göre aranacağını belirler.", "subset parametresi silinecek satır sayısını belirler."),
        ("pd.to_numeric(s, errors='coerce') çevrilemeyen değerleri NaN yapar.", "pd.to_numeric(s, errors='coerce') çevrilemeyen değerlerde hata fırlatır."),
        ("str.strip() baştaki ve sondaki boşlukları siler.", "str.strip() tüm harfleri küçültür."),
        ("value_counts() tutarsız kategori yazımlarını bulmaya yardımcı olur.", "value_counts() eksik değerleri doldurur."),
    ],
    # ---------------- Bölüm 16: Ödev 1 – sınav kavramları (content/odev1.md) ----------------
    "hw1-t1": [
        ("bin(5) '0b101', format(5, 'b') '101' döndürür.", "format(5, 'b') '0b101' döndürür."),
        ("Her özyinelemeli çağrı çağrı yığınına yeni bir çerçeve (frame) ekler.", "Özyinelemeli çağrılar tek bir çerçeveyi paylaşır."),
        ("Özyineleme sınırı aşılınca RecursionError fırlatılır.", "Özyineleme sınırı aşılınca Python döngüye geçer."),
        ("Döngülü çözümün yığın belleği O(1), n derinlikli özyinelemenin O(n)'dir.", "Özyineleme her zaman döngüden daha az bellek kullanır."),
        ("Generator ifadesi değerleri istendikçe (tembel) üretir.", "Generator ifadesi tüm değerleri önceden listeye koyar."),
    ],
    "hw1-t2": [
        ("a + b ifadesi a.__add__(b) çağrısına dönüşür.", "a + b ifadesi a.__str__(b) çağrısına dönüşür."),
        ("__add__ NotImplemented döndürürse Python b.__radd__(a)'yı dener.", "__add__ NotImplemented döndürürse sonuç None olur."),
        ("sum() 0'dan başladığı için Vector toplamında __radd__ gerekir.", "sum() yalnızca __str__ metoduyla çalışır."),
        ("__str__ yoksa print __repr__'ı kullanır.", "__str__ yoksa print hata verir."),
        ("NotImplemented raise edilmez, return edilir.", "NotImplemented bir istisna olarak raise edilmelidir."),
    ],
    "hw1-t3": [
        ("CPython, Python'un C ile yazılmış referans uygulamasıdır.", "CPython, Python'un Java ile yazılmış uygulamasıdır."),
        ("CPython'da -5 ile 256 arası tamsayılar önbellekte tek nesnedir.", "CPython'da 0 ile 1000 arası tamsayılar önbelleklenir."),
        ("is aynı nesneyi, == eşit değeri test eder.", "is ve == her zaman aynı sonucu verir."),
        ("REPL'de her satır ayrı derlendiği için 257 is 257 testi betikten farklı sonuç verebilir.", "REPL ve betik her zaman aynı nesne kimliği sonuçlarını verir."),
        ("NumPy dizisi Python int nesneleri değil ham değerler tutar.", "NumPy dizisi CPython'un küçük tamsayı önbelleğini kullanır."),
    ],
    "hw1-t4": [
        ("int(-2.7) sıfıra doğru keser ve -2 verir.", "int(-2.7) aşağı yuvarlar ve -3 verir."),
        ("round(2.5) en yakın çift sayıya yuvarlar ve 2 verir.", "round(2.5) her zaman yukarı yuvarlar ve 3 verir."),
        ("round(2.675, 2) kayan nokta temsili yüzünden 2.67 verir.", "round(2.675, 2) her zaman 2.68 verir."),
        ("np.rint ve np.round da yarıyı çifte yuvarlar.", "np.rint yarıyı her zaman yukarı yuvarlar."),
        ("random.seed ile aynı tohum aynı sözde rastgele diziyi üretir.", "random.seed her çağrıda farklı dizi üretir."),
    ],
    "hw1-t5": [
        ("Broadcasting'de şekiller sağdan karşılaştırılır; boyutlar eşit ya da biri 1 olmalıdır.", "Broadcasting'de şekiller soldan karşılaştırılır."),
        ("(3, 4) + (3, 1) sonucu (3, 4) şeklindedir.", "(3, 4) + (3, 1) ValueError verir."),
        ("(3, 4) + (3,) ValueError verir.", "(3, 4) + (3,) sonucu (3, 4) şeklindedir."),
        ("np.std varsayılan olarak ddof=0 kullanır.", "np.std varsayılan olarak ddof=1 kullanır."),
        ("Satır bazında normalizasyonda keepdims=True gerekir.", "keepdims=True diziyi düzleştirir."),
    ],
}
