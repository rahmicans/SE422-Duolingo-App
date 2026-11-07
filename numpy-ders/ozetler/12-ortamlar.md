---
unite: u-ortam
baslik: Python Ortamları
kaynak: Week5_Environments
---
# Bölüm 12 · Python Ortamları

## Bölümün amacı

Veri bilimi çalışmaları için Python'u, paketleri ve araçları yönetmeyi kolaylaştıran üç ortamı tanıtır: **Anaconda Navigator**, **Jupyter Notebook** ve **Google Colab**. Sonunda şunları yapabilmelisin:

- Anaconda, conda ve Navigator'ın ne olduğunu ve birbirleriyle ilişkisini açıklamak
- "Ortam" (environment) kavramını ve neden gerektiğini anlatmak
- Jupyter'da code ve Markdown hücreleriyle çalışmak
- Google Colab'ın avantajlarını, sınırlamalarını ve ne zaman tercih edileceğini bilmek

Bu bölüm araç tanıtımıdır. Kodlar ağırlıklı olarak komut satırı ve notebook komutlarıdır; bu yüzden bu özette çalıştırılan Python örneği azdır.

## Konu anlatımı

### Anaconda nedir? (Slayt 1–3)

**Anaconda**, Python ve R için ücretsiz, açık kaynaklı bir **dağıtımdır**; veri bilimi, makine öğrenmesi ve bilimsel hesaplama için tasarlanmıştır. **conda** paket yöneticisi, Python'u NumPy, Pandas, Matplotlib gibi önceden kurulu birçok bilimsel kütüphaneyle birlikte getirir.

**Anaconda Navigator** bu dağıtımla gelen **grafik arayüzdür** (GUI); kütüphaneleri yönetirken komut satırına bağımlılığı azaltır.

### Navigator'ın temel özellikleri (Slayt 4)

- **Uygulama başlatıcı:** Jupyter Notebook, JupyterLab, Spyder, VS Code, RStudio gibi araçları tek tıkla açar.
- **Ortam yönetimi:** ortamları görsel olarak oluşturur, kopyalar (clone) ve siler.
- **Paket yönetimi:** bir ortamda paket arar, kurar, günceller, kaldırır.

**Ortam**, belirli bir proje için belirli paket sürümlerinin kurulduğu **yalıtılmış alandır**. Örneğin Project_A Python 3.8, Project_B Python 3.10 kullanabilir. Ortamlar projeler arasındaki **paket çakışmalarını** önler.

```bash
conda create -n my-new-project python=3.10
conda activate my-new-project
conda install seaborn
```

> **Ek bilgi (resmi dokümantasyon):** Yukarıdaki komutlar Navigator'daki "Create" ve "Apply" adımlarının komut satırı karşılığıdır. Kaynak: docs.conda.io (Managing environments).

### Kurulum ve kısa demo (Slayt 5–7)

anaconda.com/download adresinden işletim sistemine uygun yükleyici indirilir; kurulum büyüktür çünkü çok paket içerir. Navigator **ayrıca kurulmaz**, dağıtıma dahildir.

- **Jupyter'ı açmak:** Home → Jupyter Notebook → Launch
- **Yeni ortam:** Environments → Create → ad ve Python sürümü → Create
- **Paket kurmak:** ortamı seç → filtreyi "Not Installed" yap → paketi ara (ör. seaborn) → işaretle → Apply

Özetle: **conda** çekirdekteki komut satırı paket yöneticisi, **Anaconda** hepsi bir arada dağıtım, **Navigator** bu araç kutusunun grafik arayüzüdür.

### Jupyter Notebook nedir? (Slayt 8–9)

Canlı kod, görselleştirme ve anlatımı tek bir belgede birleştiren, açık kaynaklı bir web uygulamasıdır. Notebook'lar çalıştırılabilir kod (Julia, Python, R), Markdown metni, denklemler ve grafikler içerebilir.

- **Code hücresi:** kod yazılır, **Shift + Enter** ile çalıştırılır; çıktı hemen altında görünür.
- **Markdown hücresi:** `# Başlık`, `**kalın**`, `*italik*`, listeler; çalıştırılınca biçimli metne dönüşür.

Notebook'ta code hücresinin son satırındaki ifadenin değeri, `print` yazmadan da gösterilir:

```python
sayilar = [3, 1, 2]
print('Hello, World!')
sorted(sayilar)   # notebook'ta bu değer hücrenin altında görünür
print(sorted(sayilar))
```
```cikti
Hello, World!
[1, 2, 3]
```

### Özellikler ve kurulum (Slayt 10–11)

- **Etkileşimli iş akışı:** küçük parçaları tek tek çalıştırıp sonucu görmek; keşifsel veri analizi (EDA) için idealdir.
- **Hikâyecilik ve paylaşım:** veriyi yüklemeden sonuca kadar tüm süreç tek belgede.
- **Tekrarlanabilirlik:** kod, çıktı ve açıklama bir arada.
- **Dilden bağımsız:** hesaplamayı yapan **kernel**'lar sayesinde 40'tan fazla dil.

Kurulum: önerilen yol Anaconda (Jupyter dahildir). Minimal yol: `pip install notebook`, ardından `jupyter notebook`.

### Kısa demo (Slayt 12–13)

Navigator'dan Launch → tarayıcıda **Jupyter Dashboard** açılır → **New → Python 3** → hücreye `print("Hello, World!")` yazıp Shift + Enter → hücre tipini **Markdown** yapıp `# My First Analysis` → Shift + Enter. Başlığa tıklayıp adlandır; dosya uzantısı **`.ipynb`**'dir, Ctrl + S ile kaydedilir.

### Google Colab nedir? (Slayt 14–15)

Google Colaboratory, **kurulum gerektirmeyen**, bulut tabanlı ve ücretsiz bir Jupyter ortamıdır.

- **Sıfır kurulum:** yalnızca tarayıcı ve Google hesabı gerekir.
- **Bulut tabanlı:** notebook'lar Google Drive'a kaydedilir.
- **Ücretsiz donanım:** derin öğrenme için **GPU** ve **TPU** erişimi.
- **Kolay iş birliği:** Google Doc gibi paylaşılır, aynı anda düzenlenir.
- **Önceden kurulu kütüphaneler:** TensorFlow, PyTorch, pandas…; diğerleri `!pip install paket` ile.

### Sınırlamalar (Slayt 16)

- **İnternet gerekir**; çevrimdışı çalışmaz.
- **Kaynak sınırları:** oturum kalıcı değildir; hareketsizlikten (ör. 90 dk) ya da azami süreden (ör. 12 saat) sonra kapanır. **Kurulan paketler ve Drive dışındaki dosyalar silinir.** En iyi GPU'lar garanti değildir.
- **Veri depolama:** veri Google Drive'a (mount ederek) kaydedilmeli ya da her oturumda yeniden yüklenmelidir.

### Başlamak ve ne zaman kullanmalı? (Slayt 17–19)

colab.research.google.com → **New notebook**. GPU için: **Runtime → Change runtime type → Hardware accelerator: GPU (veya TPU) → Save**. Arayüz Jupyter ile neredeyse aynıdır. Komut satırı komutları başa **`!`** konarak çalıştırılır:

```bash
!pip install scikit-learn
!nvidia-smi
```

Colab'ı şu durumlarda seç: ücretsiz güçlü donanım (GPU/TPU) gerektiğinde, kolay iş birliği istediğinde, sıfır kurulumla hızlı başlamak istediğinde; ama yalnızca oturum süre sınırları ve çevrimiçi olma şartı sorun değilse.

## Sık yapılan hatalar

- **Navigator'ı ayrı bir program sanmak:** Anaconda dağıtımına dahildir.
- **Tüm projeleri tek ortamda çalıştırmak:** farklı sürüm isteyen paketler çakışır; her projeye ortam aç.
- **Markdown hücresine Python kodu yazıp çalışmasını beklemek:** Markdown hücreleri kodu çalıştırmaz, metin olarak biçimlendirir.
- **Colab'da kurulan paketlerin kalıcı olduğunu sanmak:** oturum kapanınca silinir; her oturumda yeniden kurulur.
- **Colab'da veriyi yalnızca çalışma ortamına yüklemek:** oturum bitince kaybolur; Drive'a kaydet.

## Kısa tekrar soruları

1. conda, Anaconda ve Anaconda Navigator arasındaki ilişki nedir?
2. "Ortam" (environment) neden kullanılır?
3. Jupyter'da bir hücre nasıl çalıştırılır? Notebook dosyalarının uzantısı nedir?
4. Jupyter'daki kernel ne işe yarar?
5. Colab'ın iki avantajını ve iki sınırlamasını say.
6. Colab'da `pip install` komutunun başına ne konur?

## Cevaplar

1. conda komut satırı paket yöneticisidir; Anaconda conda'yı ve birçok bilimsel paketi içeren dağıtımdır; Navigator bu dağıtımın grafik arayüzüdür.
2. Her projeye kendi paket sürümlerini yalıtılmış biçimde vererek paket çakışmalarını önlemek için.
3. Shift + Enter; uzantı `.ipynb`.
4. Kodun perde arkasında çalıştığı hesaplama motorudur; farklı kernel'lar farklı dilleri destekler.
5. Avantaj: sıfır kurulum, ücretsiz GPU/TPU, kolay iş birliği. Sınırlama: internet gerekir, oturum süreli ve kalıcı değildir (paketler ve geçici dosyalar silinir).
6. Ünlem işareti: `!pip install paket`.
