# AI_devs 3, Lekcja 1, Moduł 1 — Interakcja z dużym modelem językowym

![Cover](https://cloud.overment.com/S02E03-1731372201.png)

W dobie rozwoju technologii generatywnej AI, mamy szeroki wachlarz możliwości związanych zarówno z przetwarzaniem tekstu, audio, jak i tworzeniem oraz manipulowaniem grafiką. W tym artykule przyjrzymy się możliwościom, które oferują nowoczesne narzędzia do generacji grafiki.

## Możliwości generatywnego AI

Generatywne AI odnosi się do zdolności technologii do tworzenia nowych treści na podstawie analizy wcześniej dostarczonych danych. Mamy do czynienia z szerokim zakresem zastosowań, takich jak generowanie grafiki i zdjęć, które mogą być użyteczne w różnych dziedzinach, od marketingu po twórczość artystyczną. Choć projektowanie grafiki może nie wydawać się oczywistym obszarem dla programistów, to generatywne AI otwiera nową erę w tej dziedzinie.

## Narzędzia generatywnej AI

W ostatnich latach pojawiły się narzędzia takie jak [Midjourney](tools/Midjourney.md) oraz [Stable Diffusion](glossary/Stable%20Diffusion.md), które umożliwiają tworzenie wysokiej jakości obrazów na podstawie prostych komend. Pomimo że te narzędzia głównie zyskały popularność wśród projektantów, programiści również mogą wykorzystać je w swoich projektach.

Jednym z ciekawych przykładów wykorzystania AI w codziennej pracy jest narzędzie [picthing](https://pic.ping.gg/), które efektywnie usuwa tła z obrazów, co odbywa się z niespotykaną dotąd jakością. Stworzone przez Theo z t3.gg, picthing ilustruje, jak generatywne AI może szeregować istniejące technologie w sposób użyteczny.

![picthing](https://cloud.overment.com/2024-09-26/aidevs3_picthing-a5ce0e6a-b.png)

Innym interesującym przypadkiem jest działalność [Pietera Levels](https://x.com/levelsio), który stworzył projekty [PhotoAI](https://photoai.com/) oraz [InteriorAI](https://interiorai.com), rozwiązujące konkretne problemy w obszarze przetwarzania obrazów z potwierdzonymi wynikami ich skuteczności. Statystyki jego projektów potwierdzają, że generatywne AI ma potencjał do rozwiązywania rzeczywistych problemów.

![Pieter Levels](https://cloud.overment.com/2024-09-26/aidevs3_levelsio-55df5a6e-5.png)

Powyższe projekty ilustrują potencjalne obszary, w których narzędzia generatywnej grafiki mogą być zastosowane, co może zachęcić nas do ich wykorzystania nawet w istniejących aplikacjach.

## Obecne możliwości generowania obrazu

W ciągu ostatnich dwóch lat nastąpił znaczny postęp w dziedzinie generatywnej grafiki. Zmiany te można zobaczyć na poniższym przykładzie, który porównuje generacje obrazów z 2022 i 2024 roku. Widać wyraźne różnice w jakości i możliwościach generacyjnych obecnie dostępnych modeli.

![Rozwój AI graficznego](https://cloud.overment.com/2024-09-26/aidevs3_midjourney-79dd9b18-9.png)

Mimo że jakość pracy generatywnych modeli bardzo wzrosła, występują nadal ograniczenia, takie jak trudności w generowaniu pewnych szczególnych elementów, jak tekst czy złożone kształty, a także problemy związane z podążaniem za złożonymi instrukcjami. Im bardziej skomplikowany prompt, tym mniejsze prawdopodobieństwo uzyskania oczekiwanego rezultatu.

Przykład narzędzia [ComfyUI](ComfyUI) pokazuje, jak łatwo można manipulować obrazami, zmieniając poszczególne elementy, takie jak twarze na zdjęciach.

![ComfyUI](https://cloud.overment.com/2024-09-26/aidevs3_swap-92e327ca-8.png)

Z programistycznego punktu widzenia interesuje nas dostępność modeli poprzez API lub samodzielny hosting. W przypadku hostingu warto zwrócić uwagę na platformy takie jak [RunPod](https://blog.runpod.io/how-to-get-stable-diffusion-set-up-with-comfyui-on-runpod/), która oferuje dostęp do GPU, co umożliwia bardziej zaawansowane przetwarzanie.

Przydatne jest również korzystanie z szablonów do generowania grafik dla marketingu, co pozwala na automatyczne tworzenie różnorodnych materiałów, takich jak reklamy, okładki bloga czy newslettery.

![Przykład szablonu](https://cloud.overment.com/2024-09-26/aidevs3_eduweb-b678b9a8-5.png)

Dzięki modelom generatywnej grafiki możliwe jest nie tylko tworzenie spójnych obrazów zgodnych z wymaganiami marki, ale także zwiększanie ich skali i usuwanie niepożądanych elementów.

## Techniki projektowania promptów dla modeli

Generowanie grafiki w narzędziach generatywnych, jak w przypadku modeli dużych języków (LLM), wymaga precyzyjnego pisania promptów. Kluczowe jest korzystanie ze słów kluczowych oraz skondensowanych instrukcji, które dokładnie opisują oczekiwany obraz.

Na przykładzie promptu dla [Midjourney](tools/Midjourney.md) widać, jak konkretne słowa kluczowe mogą wpływać na ostateczny rezultat. Należy jednak pamiętać, że nie każdy szczegół musi być zawarty w opisie; czasem lepsze efekty osiąga się poprzez prostotę.

![Przykład promptu](https://cloud.overment.com/2024-09-26/aidevs3_mj-852d34e2-4.png)

Na dobrą sprawę, efektywność promtów można zwiększać poprzez ich odpowiednią kombinację oraz eksperymentowanie z różnymi technikami. Kluczowe jest jednak, aby pozostawać otwartym na różnorodne podejścia.

## Generowanie grafik w oparciu o szablony

[ComfyUI](ComfyUI) zapewnia doskonałą kontrolę nad kierunkiem generowanych grafik. Jednak gdy wyspecjalizowane szablony są niezbędne, warto skorzystać z narzędzi takich jak [htmlcsstoimage](https://htmlcsstoimage.com), które umożliwiają dynamiczne generowanie grafik z szablonów HTML.

![htmlcsstoimage](https://cloud.overment.com/2024-09-27/aidevs3_htmlcsstoimage-c6f590af-a.png)

Możliwości, które daje użycie tych narzędzi, obejmują:

- Definiowanie szablonów HTML zawierających odpowiednią kolorystykę i czcionki.
- Budowanie workflow w [ComfyUI](ComfyUI) oraz dostosowywanie promptów dla innych narzędzi generujących grafikę.
- Tworzenie aplikacji reagujących na określone zdarzenia, co automatyzuje proces produkcji grafik.

Używając takich rozwiązań, firma eduweb.pl przez jakiś czas z powodzeniem generowała materiały promocyjne, zapewniając odpowiednie dopasowanie do treści newsletterów.

![Przykład szablonów](https://cloud.overment.com/2024-09-27/aidevs3_templates-77a3823f-1.png)

## Podsumowanie

Podsumowując, narzędzia generatywnej grafiki przynoszą nową jakość w automatyzacji i specjalizacji procesów tworzenia obrazów. Praca z [ComfyUI](ComfyUI) oraz [HTMLCSStoImage](https://htmlcsstoimage.com) otwiera nowe możliwości, które są szczególnie interesujące w kontekście programowania. Wiedza na temat integracji generatywnej grafiki może być kluczowa dla tworzenia rozwiązań, które usprawnią procesy marketingowe, projektowe oraz edycyjne.

**Ważna uwaga:** Jeśli nie dysponujesz odpowiednim komputerem do pracy z ComfyUI, warto rozważyć pominięcie poniższego materiału wideo.

<div style="padding:75% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1029104946?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="02_03_comfy"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>

Powodzenia na drodze do eksploracji generatywnej grafiki!