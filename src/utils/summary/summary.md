# AI_devs 3, Lekcja 1, Moduł 1 — Generatywna AI w grafice dla programistów

![Okładka](https://cloud.overment.com/S02E03-1731372201.png)

W erze rozwoju technologii generatywnej AI otwierają się przed nami nowe możliwości w przetwarzaniu tekstu, audio oraz tworzeniu i manipulacji grafiką. W tym artykule skupimy się na potencjale, jaki oferują nowoczesne narzędzia do generowania i edycji obrazów.

## Możliwości generatywnej AI

Generatywna AI pozwala na tworzenie nowych treści na podstawie analizy dużych zbiorów danych. Obecnie możemy generować wysokiej jakości grafiki i zdjęcia, co znajduje zastosowanie w wielu dziedzinach, od marketingu po sztukę. Choć tworzenie grafiki nie jest tradycyjnie domeną programistów, generatywna AI otwiera nowe perspektywy w tej sferze.

## Narzędzia generatywnej AI

Narzędzia takie jak [Midjourney](tools/Midjourney.md) i [Stable Diffusion](glossary/Stable%20Diffusion.md) umożliwiają generowanie obrazów na podstawie prostych opisów tekstowych. Choć zyskały popularność głównie wśród projektantów, programiści również mogą je wykorzystać w swoich projektach.

Przykładem praktycznego zastosowania AI jest narzędzie [picthing](https://pic.ping.gg/), które efektywnie usuwa tła z obrazów z niespotykaną wcześniej jakością. Stworzone przez Theo z t3.gg, pokazuje, jak generatywna AI może ulepszać istniejące technologie.

![picthing](https://cloud.overment.com/2024-09-26/aidevs3_picthing-a5ce0e6a-b.png)

Innym przykładem są projekty [PhotoAI](https://photoai.com/) i [InteriorAI](https://interiorai.com) autorstwa [Pietera Levelsa](https://x.com/levelsio). Te narzędzia skutecznie rozwiązują konkretne problemy w przetwarzaniu obrazów, co potwierdzają statystyki ich wykorzystania.

![Pieter Levels](https://cloud.overment.com/2024-09-26/aidevs3_levelsio-55df5a6e-5.png)

Powstaje coraz więcej narzędzi generatywnej grafiki, które można zastosować nie tylko do tworzenia nowych produktów, ale także do wzbogacania istniejących aplikacji.

## Obecne możliwości generowania obrazu

W ciągu ostatnich dwóch lat nastąpił znaczący postęp w dziedzinie generatywnej grafiki. Porównując generacje obrazów z lat 2022 i 2024, widać wyraźne różnice w jakości i szczegółowości.

![Rozwój AI graficznego](https://cloud.overment.com/2024-09-26/aidevs3_midjourney-79dd9b18-9.png)

Mimo wysokiej jakości generowanych obrazów, modele nadal mają pewne ograniczenia. Trudności sprawia im generowanie tekstu, dłoni czy złożonych kształtów. Ponadto, modele nie zawsze precyzyjnie podążają za złożonymi instrukcjami – im bardziej skomplikowany prompt, tym mniejsze prawdopodobieństwo uzyskania oczekiwanego rezultatu.

Narzędzie [ComfyUI](ComfyUI) umożliwia zaawansowaną manipulację obrazami, taką jak zamiana twarzy na zdjęciach, co otwiera nowe możliwości w edycji grafiki.

![ComfyUI](https://cloud.overment.com/2024-09-26/aidevs3_swap-92e327ca-8.png)

## Zastosowania generatywnej grafiki w praktyce

Dla programistów istotne jest, że modele generatywne są dostępne przez API lub mogą być hostowane samodzielnie. Usługi takie jak [Replicate](tools/Replicate.md) czy [Leonardo.ai](https://leonardo.ai) umożliwiają integrację generatywnej grafiki w aplikacjach.

Dostępne są również platformy pozwalające na korzystanie z GPU w chmurze, np. [RunPod](https://blog.runpod.io/how-to-get-stable-diffusion-set-up-with-comfyui-on-runpod/), co jest szczególnie przydatne dla zaawansowanych zadań.

Automatyzacja procesów marketingowych dzięki generatywnej grafice staje się coraz bardziej powszechna. Wykorzystanie szablonów pozwala na automatyczne generowanie grafik, takich jak banery reklamowe czy grafiki do newsletterów.

![Przykład szablonu](https://cloud.overment.com/2024-09-26/aidevs3_eduweb-b678b9a8-5.png)

Generatywna grafika umożliwia:

- Tworzenie spójnych obrazów zgodnych z identyfikacją wizualną marki.
- Skalowanie obrazów i usuwanie niepożądanych elementów.
- Automatyzację tworzenia grafik na podstawie danych wejściowych.

## Techniki projektowania promptów dla modeli

Podobnie jak w przypadku dużych modeli językowych, efektywne generowanie grafiki wymaga odpowiedniego formułowania promptów. Kluczowe jest używanie konkretnych słów kluczowych i jasnych instrukcji.

Przykład promptu w [Midjourney](tools/Midjourney.md):

> "A futuristic cityscape at sunset, high detail, realistic lighting"

Eksperymentowanie z różnymi słowami kluczowymi i uproszczanie promptów często prowadzi do lepszych rezultatów niż zbyt szczegółowe opisy.

![Przykład promptu](https://cloud.overment.com/2024-09-26/aidevs3_mj-852d34e2-4.png)

## Generowanie grafik w oparciu o szablony

Kiedy potrzebujemy większej kontroli nad generowanymi obrazami, warto wykorzystać szablony. Narzędzie [htmlcsstoimage](https://htmlcsstoimage.com) pozwala na generowanie grafik na podstawie szablonów HTML, z możliwością dynamicznego podmiany tekstów i obrazów.

![htmlcsstoimage](https://cloud.overment.com/2024-09-27/aidevs3_htmlcsstoimage-c6f590af-a.png)

Takie podejście umożliwia:

- Definiowanie szablonów z użyciem własnych stylów CSS i czcionek.
- Automatyczne tworzenie grafik na podstawie danych, np. aktualności, ofert czy postów.
- Integrację z aplikacjami, które reagują na określone zdarzenia, usprawniając proces tworzenia treści.

Przykładem praktycznego zastosowania jest generowanie grafik dla kampanii marketingowych, gdzie szablony umożliwiają szybkie dostosowanie treści do konkretnych potrzeb.

![Przykład szablonów](https://cloud.overment.com/2024-09-27/aidevs3_templates-77a3823f-1.png)

## Podsumowanie

Narzędzia generatywnej grafiki rewolucjonizują proces tworzenia i edycji obrazów, oferując nowe możliwości automatyzacji i personalizacji. Dla programistów oznacza to szansę na integrację zaawansowanych funkcji graficznych w aplikacjach, usprawnienie procesów marketingowych oraz tworzenie innowacyjnych rozwiązań.

Praca z narzędziami takimi jak [ComfyUI](ComfyUI) i [htmlcsstoimage](https://htmlcsstoimage.com) otwiera drogę do tworzenia spersonalizowanych i dynamicznych treści graficznych.

**Ważna uwaga:** Jeśli nie dysponujesz odpowiednio wydajnym komputerem do pracy z ComfyUI, możesz pominąć poniższy materiał wideo.

<div style="padding:75% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1029104946?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="02_03_comfy"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>

Powodzenia w eksploracji generatywnej grafiki!