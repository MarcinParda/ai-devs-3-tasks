import * as fs from 'fs';
import * as path from 'path';
import { chatCompletion } from '../../utils/chat_completion';
import { sendJsonAnswer } from '../../api/sendAnswer';

const weaponsTestsDir = path.join(__dirname, './weapons_tests/do-not-share');
const systemPromptFile = path.join(__dirname, 'systemPrompt.txt');
const userPromptFile = path.join(__dirname, 'userPrompt.txt');

async function addDateToRaport() {
  const files = await fs.promises.readdir(weaponsTestsDir);
  const txtFiles = files.filter((file) => file.endsWith('.txt'));
  const raportContent = await Promise.all(
    txtFiles.map(async (file) => {
      const content = await fs.promises.readFile(
        path.join(weaponsTestsDir, file),
        'utf-8'
      );
      const fileNameWithoutExtension = path.basename(file, path.extname(file));
      const fileNameWithMinusSigns = fileNameWithoutExtension.replace(
        /_/g,
        '-'
      );
      return `<raport>\nRAPORT from date ${fileNameWithMinusSigns}\n\n${content}\n\n</raport>\n`;
    })
  );

  const raport = raportContent.join('\n');
  return raport;
}
async function createPrompts() {
  try {
    const systemPrompt = await addDateToRaport();
    const userPrompt =
      'W raporcie, z którego dnia znajduje się wzmianka o kradzieży prototypu broni? Podaj datę raportu w formacie RRRR-MM-DD. Podaj datę raportu, w którym wzmianka się znajduje, a nie datę wydarzenia. Zwróć datę raportu w podanym formacie i nic więcej, żadnych dodatkowych komentarzy czy interpunkcji.';

    await fs.promises.writeFile(systemPromptFile, systemPrompt, 'utf-8');
    await fs.promises.writeFile(userPromptFile, userPrompt, 'utf-8');

    console.log('Prompts created successfully.');
  } catch (error) {
    console.error('Error creating prompts:', error);
  }
}

async function findAnswer() {
  try {
    const systemPrompt = await fs.promises.readFile(systemPromptFile, 'utf-8');
    const userPrompt = await fs.promises.readFile(userPromptFile, 'utf-8');

    const answer = await chatCompletion({
      systemPrompt,
      userPrompt,
    });

    console.log('Answer:', answer.message);
    return answer.message;
  } catch (error) {
    console.error('Error finding answer:', error);
  }
}

async function main() {
  const answer = await findAnswer();
  if (!answer) {
    console.log('Answer not found');
    return;
  }
  const response = await sendJsonAnswer('wektory', answer);
  console.log(response);
}

// addDataToRaport();
createPrompts();
findAnswer();
main();
