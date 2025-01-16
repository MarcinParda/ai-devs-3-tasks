import { fetchTextFromURL } from '../../api/fetchTextFromUrl';
import { sendJsonAnswer } from '../../api/sendAnswer';
import { chatComplition } from '../../utils/chat_complition';
import { tasksApiKey } from '../../utils/envs';

const url = `https://centrala.ag3nts.org/data/${tasksApiKey}/cenzura.txt`;

async function main() {
  const text = await fetchTextFromURL(url);
  console.log(text);

  const censoredText = await chatComplition({
    systemPrompt: `Twoim zadaniem jest zamienienie następujące informacji słowem CENZURA:
      1. Imię i nazwisko
      2. Nazwę ulicy i numer
      3. Miasto
      4. Wiek osoby

      Instrukcje:
      1. Zachowaj oryginalną interpunkcję, spacje i formatowanie tekstu.
      2. Nie zmieniaj ani nie przeredagowuj tekstu poza cenzurą.
      3. Zwróć tylko ocenzurowany tekst, bez żadnych dodatkowych komentarzy.

      Przykłady:

      Wejście: "Cześć, nazywam się Jan Kowalski. Mieszkam na ulicy Kwiatowej 15 w Warszawie. Mam 35 lat."
      Wyjście: "Cześć, nazywam się CENZURA. Mieszkam na ulicy CENZURA w CENZURA. Mam CENZURA lat."

      Wejście: "Anna Nowak (lat 28) przeprowadziła się z Krakowa na Aleję Róż 7/12 w Gdańsku."
      Wyjście: "CENZURA (lat CENZURA) przeprowadziła się z CENZURA na CENZURA w CENZURA."

      Wejście: "Piotr Wiśniewski, ur. 15.03.1990, zameldowany: ul. Słoneczna 3, 00-123 Wrocław."
      Wyjście: "CENZURA, CENZURA, zameldowany: ul. CENZURA CENZURA."

      Wejście: "Firma "XYZ" zatrudniła nowego pracownika: Magdalena Zielińska, 42 lata, z Poznania."
      Wyjście: "Firma CENZURA zatrudniła nowego pracownika: CENZURA, CENZURA lata, z CENZURA."

      Wejście: "Ogłoszenie: Sprzedam mieszkanie, kontakt: Adam Adamski, tel. 123-456-789, adres: Cicha 9/3, Łódź."
      Wyjście: "Ogłoszenie: Sprzedam mieszkanie, kontakt: CENZURA, tel. CENZURA, adres: CENZURA, CENZURA."

      Teraz ocenzuruj poniższy tekst:
    `,
    userPrompt: text,
  });

  const response = await sendJsonAnswer('CENZURA', censoredText.message);
  console.log(response);
}

main();
