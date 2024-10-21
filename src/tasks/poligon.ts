import { fetchTextFromURL } from '../api/fetchTextFromUrl';
import { sendJsonAnswer } from '../api/sendAnswer';

const url = 'https://poligon.aidevs.pl/dane.txt';

async function main() {
  const text = await fetchTextFromURL(url);
  const lines = text.split('\n');
  const nonEmptyLines = lines.filter((line) => line.trim() !== '');
  const response = await sendJsonAnswer('POLIGON', nonEmptyLines);
  console.log(response);
}

main();
