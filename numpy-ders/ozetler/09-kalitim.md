---
unite: u-kalitim
baslik: Kalıtım ve Çok Biçimlilik
kaynak: week4_Inheritance_Polymorph
---
# Bölüm 9 · Kalıtım ve Çok Biçimlilik

## Bölümün amacı

Bu bölüm, genel bir sınıftan özelleşmiş sınıflar türetmeyi ve aynı metot çağrısının nesnenin tipine göre farklı davranmasını öğretir. Sonunda şunları yapabilmelisin:

- "Is a" ilişkisini, üst sınıf (superclass) ve alt sınıf (subclass) kavramlarını açıklamak
- Python'da alt sınıf tanımlamak ve alt sınıfın başlatıcısından üst sınıfın başlatıcısını çağırmak
- UML'de kalıtımı okumak
- Metotları geçersiz kılarak (override) çok biçimlilik kurmak ve `isinstance` kullanmak

## Konu anlatımı

### Genel ve özel nesneler (Slayt 1–4)

Gerçek dünyada birçok nesne daha genel bir nesnenin **özelleşmiş** halidir. Çekirge ve arı birer böcektir: böceklerin genel özelliklerine sahiptirler, ayrıca çekirge zıplar, arı sokar ve bal yapar.

### "Is a" ilişkisi, üst sınıf ve alt sınıf (Slayt 5–7)

Bir nesne diğerinin özel haliyse aralarında **"is a"** (bir … türüdür) ilişkisi vardır: dikdörtgen bir şekildir, papatya bir çiçektir. **Kalıtım** bu ilişkiyi sınıflar arasında kurar:

- **Üst sınıf** (superclass / base class): genel sınıf
- **Alt sınıf** (subclass / derived class): üst sınıfın öznitelik ve metotlarını **miras alır**, kendi yenilerini ekler

Örnek: araba, kamyonet ve SUV birer otomobildir. Marka, model yılı, kilometre ve fiyat **Automobile**'da; kapı sayısı (Car), çekiş tipi (Truck), yolcu kapasitesi (SUV) alt sınıflardadır.

### Python'da alt sınıf ve UML (Slayt 8–10)

- Üst sınıf, alt sınıfın adından sonra parantez içinde yazılır: `class Car(Automobile):`
- Alt sınıfın `__init__`'i önce **üst sınıfın `__init__`'ini çağırır**, sonra kendi özniteliklerini başlatır.
- UML'de kalıtım, **alt sınıftan üst sınıfa** doğru içi boş üçgen uçlu bir okla gösterilir.

```python
class Automobile:
    def __init__(self, make, model, mileage, price):
        self.__make = make
        self.__model = model
        self.__mileage = mileage
        self.__price = price

    def get_make(self):
        return self.__make

    def get_price(self):
        return self.__price

class Car(Automobile):
    def __init__(self, make, model, mileage, price, doors):
        Automobile.__init__(self, make, model, mileage, price)
        self.__doors = doors

    def get_doors(self):
        return self.__doors

car = Car('BMW', 2001, 70000, 15000.0, 4)
print(car.get_make(), car.get_price(), car.get_doors())
```
```cikti
BMW 15000.0 4
```

`get_make` ve `get_price` Car'da yazılmadı; Automobile'dan **miras** geldi.

> **Ek bilgi (resmi dokümantasyon):** `Automobile.__init__(self, ...)` yerine `super().__init__(...)` da yazılabilir; `super()` üst sınıfı otomatik bulur ve `self`'i kendisi aktarır. Kaynak: docs.python.org/3/library/functions.html#super

### Çok biçimlilik (Slayt 11–12)

**Çok biçimlilik** (polymorphism), bir nesnenin farklı biçimler alabilmesidir. İki parçası vardır:

1. Üst sınıftaki bir metodu alt sınıfta **aynı adla yeniden tanımlamak** (override).
2. Metot çağrıldığında, **nesnenin tipine göre** doğru sürümün çalışması.

Alt sınıftaki metot, üst sınıftakini çağırıp ekleme yapabilir ya da tamamen farklı bir şey yapabilir.

```python
class Mammal:
    def __init__(self, species):
        self.__species = species

    def show_species(self):
        print('I am a', self.__species)

    def make_sound(self):
        print('Grrrrr')

class Dog(Mammal):
    def __init__(self):
        Mammal.__init__(self, 'Dog')

    def make_sound(self):
        print('Woof! Woof!')

class Cat(Mammal):
    def __init__(self):
        Mammal.__init__(self, 'Cat')

    def make_sound(self):
        print('Meow')

for animal in [Mammal('regular mammal'), Dog(), Cat()]:
    animal.show_species()
    animal.make_sound()
```
```cikti
I am a regular mammal
Grrrrr
I am a Dog
Woof! Woof!
I am a Cat
Meow
```

Döngü her nesne için **aynı** `make_sound()` çağrısını yapar ama her nesne kendi sürümünü çalıştırır.

### isinstance (Slayt 13–14)

Bir metot beklediği sınıftan olmayan bir nesne alırsa `AttributeError` oluşabilir. `isinstance(nesne, Sinif)` nesnenin o sınıfın (ya da alt sınıfının) örneği olup olmadığını söyler. **Alt sınıfın örneği, üst sınıfın da örneği sayılır.**

```python
class Mammal:
    def make_sound(self):
        print('Grrrrr')

class Dog(Mammal):
    pass

def sesini_goster(nesne):
    if isinstance(nesne, Mammal):
        nesne.make_sound()
    else:
        print('Bu bir memeli değil!')

d = Dog()
print(isinstance(d, Dog), isinstance(d, Mammal), isinstance(Mammal(), Dog))
sesini_goster(d)
sesini_goster('köpek')
```
```cikti
True True False
Grrrrr
Bu bir memeli değil!
```

## Sık yapılan hatalar

- **Alt sınıfın `__init__`'inde üst sınıfın `__init__`'ini çağırmamak:** üst sınıfın öznitelikleri hiç oluşmaz.

```python hata
class A:
    def __init__(self):
        self.x = 1

class B(A):
    def __init__(self):
        self.y = 2

print(B().x)
```
```cikti
AttributeError: 'B' object has no attribute 'x'
```

- **Override için farklı bir ad kullanmak:** alt sınıftaki metot **aynı adı** taşımalıdır; yoksa yeni bir metot olur.
- **Kalıtım okunu ters çizmek:** UML'de ok alt sınıftan üst sınıfa doğrudur.
- **`isinstance`'ın yönünü karıştırmak:** üst sınıfın örneği alt sınıfın örneği **değildir**.

## Kısa tekrar soruları

1. "Is a" ilişkisine iki örnek ver.
2. Alt sınıf üst sınıftan neyi miras alır?
3. `class Truck(Automobile):` satırında hangisi üst sınıftır?
4. Override nedir? Çok biçimlilikle ilişkisi nedir?
5. `Dog`, `Mammal`'ın alt sınıfıysa `isinstance(Dog(), Mammal)` ve `isinstance(Mammal(), Dog)` ne döndürür?

## Cevaplar

1. Örneğin: araba bir otomobildir; papatya bir çiçektir (ya da arı bir böcektir).
2. Üst sınıfın öznitelik ve metotlarını.
3. `Automobile`.
4. Alt sınıfta üst sınıftaki metotla aynı adlı bir metot tanımlamaktır. Çok biçimlilikte aynı çağrı, nesnenin tipine göre bu farklı sürümlerden doğru olanı çalıştırır.
5. `True` ve `False`.
