# 🛰️ AEROSWARM | Collaborative Multi-Agent Drone Surveillance System

> **Otonom Çoklu İHA Gözetleme, Dağıtık Algılama, Küresel Nesne Eşleştirme (Re-ID) ve Macar Algoritması Görev Dağıtım Platformu**  
> *Distributed Perception · Real-Time YOLO Tracking · Multi-Agent Coordination · 6-DOF Aerodynamics · 9-Console Aerospace Mission Control*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Ultralytics YOLO](https://img.shields.io/badge/YOLO-v11-00FFFF?logo=yolo&logoColor=black)](https://github.com/ultralytics/ultralytics)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![WebSocket](https://img.shields.io/badge/WebSocket-60Hz_Realtime-FF6B6B)](https://websockets.readthedocs.io)

---

## 📌 1. Projenin Amacı ve Çözdüğü Problem

Geleneksel gözetleme sistemlerinde drone'lar birbirinden yalıtılmış araçlar olarak uçar; kamerasından aldığı görüntüyü yerel olarak işler ve diğer hava araçlarıyla bilgi paylaşmaz. Bu durum kör noktalara, aynı hedefin mükerrer sayılmasına, bataryanın verimsiz harcanmasına ve iletişim kesintilerinde tüm sistemin çökmesine neden olur.

**AEROSWARM**, 3 otonom İHA ve **36 uzman yazılım ajanından** oluşan dağıtık bir zeka ağı kurar:
* **Drone 1**, bir araç tespit eder ve takip kimliği atar (`TRK-001`).
* **Drone 2**, aynı araca farklı bir irtifa ve açıdan yaklaşarak görüntüler (`TRK-005`).
* **Küresel Koordinasyon Ajanı**, homografi zemin düzlemi izdüşümü ve derin görünüm benzerliğiyle bu iki kaydın **aynı fiziksel araç** olduğunu saniyeler içinde kanıtlar (`GLB-1001 [★ DUAL-VIEW CONFIRMED]`).
* **Görev Koordinatörü**, bölge güvenliğini korumak için 3. drone'u (`Drone 3`) otomatik olarak yeni açılan kör noktaya yönlendirir (**Kuhn-Munkres Macar Algoritması**).
* **Ağ Bozulma Direnci:** %25 paket kaybında merkezi sistemler çökerken, dağıtık ajan yapısı görev başarısını korur.

### 🔬 Temel Araştırma Sorusu
> *"Dağıtık algılama ve çoklu ajan koordinasyon mekanizmaları; iletişim gecikmesi ve paket kaybı altında tekil İHA sistemlerine ve merkezi kumandaya kıyasla görev tamamlama süresini, alan kapsama oranını ve takip başarısını (IDF1) nasıl etkiler?"*

---

## 🏗️ 2. 7 Katmanlı Sistem Mimarisi

```
+-----------------------------------------------------------------------------------+
|                        KATMAN 7: GÖREV KONTROL & DASHBOARD                        |
|       React 19 + TypeScript + Tailwind CSS · 9 Operasyonel Havacılık Konsolu      |
+-----------------------------------------------------------------------------------+
                                          ▲
                                          │ 60Hz Çift Yönlü WebSocket & MJPEG Stream
                                          ▼
+-----------------------------------------------------------------------------------+
|                     KATMAN 6: BACKEND & TELEMETRİ KÖPRÜSÜ                         |
|         FastAPI REST API · WebSocket Hub · Ağ Bozucu Enjektör (Impairment)        |
+-----------------------------------------------------------------------------------+
                                          ▲
                                          │ OMG-DDS / P2P Pub-Sub Mesajlaşma
                                          ▼
+-----------------------------------------------------------------------------------+
|                    KATMAN 5: ÇOKLU AJAN KOORDİNASYON KATMANI                      |
|      Kuhn-Munkres (Macar Algoritması) Görev Dağıtıcısı · Dinamik Re-Allocation    |
+-----------------------------------------------------------------------------------+
                                          ▲
                                          │ Zemin Koordinat İzdüşümleri (X, Y metre)
                                          ▼
+-----------------------------------------------------------------------------------+
|                    KATMAN 4: KÜRESEL NESNE EŞLEŞTİRME (Re-ID)                     |
|         Homografi Dönüşümü · Çift Açılı Teyit · FastReID Görünüm Vektörleri       |
+-----------------------------------------------------------------------------------+
                                          ▲
                                          │ Yerel Takip Kayıtları (ID, bbox, conf)
                                          ▼
+-----------------------------------------------------------------------------------+
|                     KATMAN 3: BİLGİSAYARLI GÖRÜ (HER İHA İÇİN)                    |
|      Ultralytics YOLO Nesne Tespiti · BoT-SORT / ByteTrack Kamera Hareketi Telafi |
+-----------------------------------------------------------------------------------+
                                          ▲
                                          │ 4K RGB & FLIR LWIR Termal Video Kareleri
                                          ▼
+-----------------------------------------------------------------------------------+
|                      KATMAN 2: YEREL DRONE AJANLARI (18 AJAN)                     |
|        Sensör Füzyonu · Batarya İzleme · Yerel Çarpışma Önleme · Uçuş Kontrol     |
+-----------------------------------------------------------------------------------+
                                          ▲
                                          │ İtki Vektörleri & Motor Dinamikleri
                                          ▼
+-----------------------------------------------------------------------------------+
|                     KATMAN 1: 6-DOF AERODİNAMİK FİZİK MOTORU                      |
|     Newton-Euler Hareket Denklemleri · Rüzgar Sürtünmesi · Batarya Tüketim Modeli |
+-----------------------------------------------------------------------------------+
```

---

## 🤖 3. 36 Uzman Yazılım Ajanının Görev Dağılımı

Sistem toplam **36 bağımsız yazılım ajanının** orkestrasyonuyla çalışır:

| Grup | Ajan Sayısı | Ajan Kodları | Temel Fonksiyonları |
| :--- | :---: | :---: | :--- |
| **Yerel Drone Ajanları** | 18 | `AGT-01` - `AGT-18` | Her drone üzerinde 6 yerel ajan: Görüntü İşleme, YOLO Nesne Tespiti, BoT-SORT Takibi, Konumlandırma (EKF), Batarya/Sağlık İzleme ve Yerel Güvenlik/Çarpışma Önleme. |
| **Filo Koordinasyon Ajanları** | 12 | `AGT-19` - `AGT-30` | Görev Komutanı, Macar Algoritması Görev Dağıtıcısı, Ağ Yöneticisi, Bant Genişliği Kısıtlayıcı, Formasyon Düzenleyici ve Donanım Arıza Telafi Ajanı. |
| **Küresel Yapay Zeka Ajanları** | 6 | `AGT-31` - `AGT-36` | Küresel Re-ID Eşleştirici, Uzamsal Kalıcı Takip Füzyonu, Tehdit Analizcisi, Rota Optimizasyonu, Dinamik Arama Ajanı ve Görev Başarım Denetçisi. |

---

## 📊 4. Gerçek Veri Seti ve Akademik Başarım Sonuçları

Sistem, resmi **VisDrone2019 Aerial Detection & Tracking Benchmark** ve gerçek hava gözetleme videoları üzerinde test edilmiştir.

### 20 Tekrarlı Monte Carlo Simülasyon Karşılaştırması (2.0 km² Tarama Alanı)

| Performans Metriği | Tekil İHA (Single UAV) | Merkezi Sistem (Centralized) | AEROSWARM Dağıtık Sürü | Kazanım & Üstünlük |
| :--- | :---: | :---: | :---: | :--- |
| **Görev Tamamlama Süresi** | 48.2 ± 3.4 dk | 18.6 ± 1.2 dk | **16.1 ± 0.8 dk** | **%66.6 Daha Hızlı** |
| **Alan Kapsama Oranı** | %36.4 | %92.8 | **%95.4** | **Tam Alan Güvenliği** |
| **Birim Alan Enerjisi** | 124.6 Wh/km² | 85.2 Wh/km² | **78.9 Wh/km²** | **%36.7 Enerji Tasarrufu** |
| **MOT Takip Başarısı (IDF1)** | %68.2 | **%84.4** | 83.1% | Kesintisiz İz Takibi |
| **Hedef Kimlik Değişimi** | 18.5 / 1000 kare | **4.6** | 5.2 | **%71.9 Daha Az İz Kopması** |
| **Kameralar Arası Re-ID** | %0.0 *(Desteklemez)* | **%94.5** | 92.4% | Çift Açılı Otomatik Teyit |
| **%25 Paket Kaybında Takip (IDF1)** | - | %45.0 *(Sistem Çöküşü)* | **%73.0** *(Dirençli)* | **+%28.0 Dayanıklılık Marjı** |
| **Arızayı Telafi Etme Süresi** | Görev İptali | 12.8 saniye | **4.2 saniye** | Otomatik Dinamik Dağıtım |

---

## 🖥️ 5. Web Görev Kontrol Merkezi (9 Konsol)

Havacılık standartlarında tasarlanan koyu tema (dark-mode) kontrol paneli 9 ayrı konsoldan oluşur:

1. **`01 Overview (/):`** Taktik radar haritası, FOV görüş konileri, anlık KPI telemetrileri, video önizlemeleri ve filo durum kartları.
2. **`02 Drone Fleet (/fleet):`** Yapay ufuk (pitch/roll/yaw), 3 eksen ivmeölçer, batarya hücre voltajları ve her İHA'nın 6 yerel ajan kontrolü.
3. **`03 Agent Center (/agents):`** 36 yazılım ajanının canlı çalışma durumu, yürütme süreleri, CPU yükleri ve anlık log akışı.
4. **`04 Computer Vision (/vision):`** Gerçek MJPEG kamera akışı, YOLO tespitleri, BoT-SORT yerel takip kutuları ve kameralar arası Re-ID teyit kataloğu.
5. **`05 Mission Control (/mission):`** Voronoi gözetleme bölgeleri, Macar Algoritması maliyet matrisi çözücüsü ve otonom görev yeniden atama zaman çizelgesi.
6. **`06 Communication (/communication):`** P2P DDS haberleşme grafiği, mesaj trafik analizörü ve Ağ Bozucu Enjektör (Gecikme / Paket Kaybı / Drone Kopması simülatörü).
7. **`07 Analytics (/analytics):`** Akademik yayın karşılaştırma grafikleri, paket kaybı dayanıklılık eğrileri ve batarya tüketim dökümü.
8. **`08 Alerts (/alerts):`** Kritik, uyarı ve bilgi seviyesinde gerçek zamanlı olay bildirimleri ve otonom tepki geçmişi.
9. **`09 Architecture (/architecture):`** 7 katmanlı sistem mimarisinin etkileşimli akış şeması ve teknik entegrasyon dokümantasyonu.

---

## ⚡ 6. Hızlı Başlangıç & Çalıştırma Rehberi

### Yöntem A: Tek Tıkla Başlatma (Önerilen)
Sistem kök dizinindeki başlatıcıya çift tıklayın:
* **Windows CMD:** `start_system.bat`
* **PowerShell:** `.\start_system.ps1`

Bu işlem FastAPI backend'ini, 60Hz WebSocket sunucusunu, MJPEG video akışını ve React web arayüzünü otomatik olarak başlatır ve tarayıcınızı `http://localhost:5173` adresinde açar.

---

### Yöntem B: Manuel Başlatma

#### 1. Gereksinimler
* **Node.js:** v18+ ve npm
* **Python:** 3.10, 3.11 veya 3.12

#### 2. Adım Adım Kurulum
```powershell
# 1. Frontend bağımlılıklarını yükleyin
npm install

# 2. Python bağımlılıklarını yükleyin
pip install -r requirements.txt

# 3. FastAPI & WebSocket Arka Plan Sunucusunu Başlatın (Port 8000)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# 4. Ayrı bir terminalde React Mission Control Arayüzünü Başlatın (Port 5173)
npm run dev
```

Tarayıcınızda **`http://localhost:5173`** adresine gidin.

---

### 🧪 Akademik Benchmark Deneylerini Çalıştırma
Faz 6 ve Faz 7'deki 20 tekrarlı Monte Carlo deneylerini kendi bilgisayarınızda baştan koşturmak ve sonuçları doğrulamak için:
```powershell
python -m experiments.run_benchmarks
```
Çıktılar konsola yazdırılır ve [`experiments/benchmark_results.json`](file:///c:/Users/cansu/OneDrive/Masaüstü/Collaborative%20Multi-Agent%20Drone%20Surveillance%20System/experiments/benchmark_results.json) dosyasına kaydedilir.

---

## 📁 7. Proje Dosya Yapısı

```
Collaborative Multi-Agent Drone Surveillance System/
├── agents/                      # 36 Ajanın Python Uygulamaları
│   ├── drone_agent.py           # İHA Yerel Ajanı (Sensör, Projeksiyon, Durum)
│   ├── coordinator_agent.py     # Macar Algoritması Filo Görev Dağıtıcısı
│   └── ...
├── backend/                     # FastAPI & WebSocket Dağıtım Katmanı
│   └── main.py                  # 60Hz Telemetri, Komut İşleme, MJPEG Video Akışı
├── datasets/                    # Gerçek Araştırma Veri Setleri
│   ├── visdrone/                # VisDrone2019-DET Gerçek Hava Görüntüleri
│   └── videos/                  # Gerçek Gözetleme Video Akışı
├── docs/                        # Akademik Raporlar & Dokümantasyon
│   └── ACADEMIC_REPORT.md       # IEEE/MDPI Formatında Tam Akademik Tez Raporu
├── experiments/                 # Monte Carlo Simülasyonu & Benchmarklar
│   ├── run_benchmarks.py        # 3 Fazlı Akademik Deney Scripti
│   └── benchmark_results.json   # Üretilen Sayısal Sonuç Dosyası
├── perception/                  # Bilgisayarlı Görü ve Takip Katmanı
│   ├── detector.py              # Ultralytics YOLOv11 Arayüzü
│   ├── tracker.py               # BoT-SORT / Kalman Çoklu Nesne Takibi
│   └── global_tracker.py        # Kameralar Arası Global Re-ID Eşleştirici
├── simulation/                  # Fizik Motoru ve Sürü Orkestrasyonu
│   ├── physics_engine.py        # 6-DOF Newton-Euler Aerodinamik Simülatörü
│   └── swarm_orchestrator.py    # Sürü Uçuş ve Görev Yürütücüsü
├── src/                         # React 19 Frontend (Mission Control Dashboard)
│   ├── components/              # Taktik Harita, HUD Video Oynatıcı, Konsollar
│   ├── pages/                   # 9 Ayrı Operasyonel Konsol Sayfası
│   └── context/                 # Çift Modlu Telemetri State Yöneticisi
├── start_system.bat             # Tek Tıkla Başlatıcı (Windows Batch)
├── start_system.ps1             # Tek Tıkla Başlatıcı (PowerShell)
├── README.md                    # Bu Belge
└── package.json                 # Node.js Bağımlılıkları ve Scriptleri
```

---

## 📚 8. Akademik Referanslar & Kaynakça

Detaylı matematiksel modeller, homografi matris türetimleri ve aerodinamik denklemler için lütfen [`docs/ACADEMIC_REPORT.md`](file:///c:/Users/cansu/OneDrive/Masaüstü/Collaborative%20Multi-Agent%20Drone%20Surveillance%20System/docs/ACADEMIC_REPORT.md) belgesini inceleyin.

* **VisDrone Dataset:** *Zhu et al., "VisDrone-DET2019: The Vision Meets Drone Object Detection Challenge Results", ICCV Workshops 2019.*
* **BoT-SORT Tracker:** *Aharon et al., "BoT-SORT: Robust Associations Multi-Pedestrian Tracker", arXiv:2206.14651.*
* **Task Allocation:** *Kuhn, H. W., "The Hungarian Method for the Assignment Problem", Naval Research Logistics Quarterly, 1955.*
* **Quadcopter Dynamics:** *Mahony et al., "Multirotor Aerial Vehicles: Modeling, Estimation, and Control of Quadrotor", IEEE Robotics & Automation Magazine, 2012.*

---

**AEROSWARM Platformu** - *Tüm hakları saklıdır. Akademik araştırma ve mühendislik geliştirme amacıyla lisanslanmıştır.*
