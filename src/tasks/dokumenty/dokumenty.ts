import fs from 'fs';
import path, { join } from 'path';
import { chatCompletion } from '../../utils/chat_completion';
import { sendJsonAnswer } from '../../api/sendAnswer';
import { glob } from 'glob';

async function dokumenty() {
  // createKeywordsFromFacts();
  const answer = await prepareAnswer();
  const resonse = await sendJsonAnswer('dokumenty', answer);
  console.log(resonse);
}

async function createKeywordsFromFacts() {
  const factsDirectory = join(__dirname, './pliki_z_fabryki/facts');

  const files = fs.readdirSync(factsDirectory);

  const factsKeywords: string[] = [];
  for (const file of files) {
    const filePath = join(factsDirectory, file);
    const content =
      '<raport>\n' +
      fs.readFileSync(filePath, { encoding: 'utf-8' }) +
      '\n</raport>';
    const chatResponse = await chatCompletion({
      maxTokens: 2560,
      systemPrompt: content,
      userPrompt: `Na podstawie podanego raportu wyodrębnij najważniejsze słowa kluczowe i zwróć je w formacie tabeli JSON. Postępuj zgodnie z poniższymi wytycznymi:

1. Przeanalizuj raport pod kątem kluczowych terminów, fraz i pojęć, które najlepiej reprezentują jego główne idee.
2. Zidentyfikuj maksymalnie 10 słów kluczowych lub fraz kluczowych.
3. Dla każdego słowa kluczowego lub frazy kluczowej:
   - Określ jego ocenę trafności (0-100) na podstawie jego znaczenia dla treści raportu.
   - Zidentyfikuj częstotliwość występowania w raporcie.
4. Zwróć wyniki w następującym formacie JSON:

{
  "slowa_kluczowe": [
    {
      "termin": "string",
      "trafnosc": number,
      "czestotliwosc": number
    },
    ...
  ]
}

Upewnij się, że:
- Pole "termin" zawiera słowo kluczowe lub frazę kluczową jako ciąg znaków.
- Pole "trafnosc" jest liczbą między 0 a 100.
- Pole "czestotliwosc" jest dodatnią liczbą całkowitą reprezentującą liczbę wystąpień.
- Słowa kluczowe są posortowane w kolejności malejącej według trafności.

Nie dołączaj żadnych wyjaśnień ani dodatkowego tekstu w swojej odpowiedzi. Zwróć tylko obiekt JSON.`,
    });
    const jsonResponse: string[] = JSON.parse(chatResponse.message);
    const keywordsFromFile: string[] = jsonResponse['slowa_kluczowe'].map(
      (keyword: string) => keyword['termin']
    );
    factsKeywords.push(...keywordsFromFile);
  }

  console.log(factsKeywords);
  // save factsKeywords to a file
  fs.writeFileSync(
    join(__dirname, './factsKeywords.json'),
    JSON.stringify(factsKeywords)
  );
}

async function prepareAnswer() {
  const factsKeywords = fs.readFileSync(
    join(__dirname, './factsKeywords.json'),
    {
      encoding: 'utf-8',
    }
  );
  // get all files from the directory that has *.txt extension
  const txtFiles = glob.sync(
    path.resolve(__dirname, './pliki_z_fabryki/*.txt')
  );

  const answer: Record<string, string> = {};
  for (const file of txtFiles) {
    const fileName = path.basename(file, '.txt') + '.txt';
    const raport = fs.readFileSync(file, { encoding: 'utf-8' });
    console.log('fileName', fileName);

    const userPrompt = `Słowa kluczowe:
${factsKeywords}

Raport:
${raport}`;

    const systemPrompt = `Mając podaną tablicę słów kluczowych i raport, przeanalizuj raport i zwróć odpowiedź w podanym formacie zawierającą conajmniej 15 słów kluczowych, wymienionych po przecinku, które pojawiają się w artykule.
Odpowiedź powinna zawierać tylko słowa kluczowe po przecinku, bez żadnych dodatkowych komentarzy czy wyjaśnień.

<przykładowe zapytanie>
Słowa kluczowe:
["szpieg", "człowiek", "usterka", "kamera", "monitor", "magazyn", "ai", "software", "hardware", "fabryka"] 

Raport:
O godzinie 12:00 w dniu 12.12.2022 w fabryce zauważono usterkę w monitorze. Pracownicy zauważyli, że kamera zarejestrowała człowieka, który wszedł na teren fabryki. Wszystko zostało zarejestrowane na taśmie.
</przykładowe zapytanie> 

<przykładowa odpowiedź>
człowiek, usterka, kamera, monitor, fabryka
</przykładowa odpowiedź>`;

    const chatResponse = await chatCompletion({
      systemPrompt,
      userPrompt,
    });
    answer[fileName] = chatResponse.message;
  }

  console.log('answer', answer);

  return answer;
}
dokumenty();
