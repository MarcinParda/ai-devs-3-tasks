import * as fs from 'fs';
import * as path from 'path';
import { createTranscriptions } from '../../utils/create_transcriptions';
import { glob } from 'glob';
import { recognizeImage } from '../../utils/image_processing';
import { chatCompletion } from '../../utils/chat_completion';
import { sendJsonAnswer } from '../../api/sendAnswer';

async function transcriptMP3() {
  const audioFiles = glob.sync(
    path.resolve(__dirname, './pliki_z_fabryki/*.mp3')
  );

  const directory = path.resolve(__dirname, './pliki_z_fabryki');
  await createTranscriptions({ audioFiles, directory });
}

// transcriptMP3();

async function transcriptPng() {
  const pngPaths = [
    path.join(__dirname, './pliki_z_fabryki/2024-11-12_report-13.png'),
    path.join(__dirname, './pliki_z_fabryki/2024-11-12_report-14.png'),
    path.join(__dirname, './pliki_z_fabryki/2024-11-12_report-15.png'),
    path.join(__dirname, './pliki_z_fabryki/2024-11-12_report-16.png'),
    path.join(__dirname, './pliki_z_fabryki/2024-11-12_report-17.png'),
  ];

  for (const [index, mapPicturePath] of pngPaths.entries()) {
    const text = await recognizeImage(
      mapPicturePath,
      'Extract for me the text written on this png image.'
    );
    fs.writeFileSync(pngPaths[index] + '.txt', text);
  }
}

// transcriptPng();

async function moveTxtFiles() {
  const directoryPath = path.join(__dirname, './pliki_z_fabryki');
  const files = await fs.promises.readdir(directoryPath);

  const txtFiles = files.filter((file) => file.endsWith('.txt'));

  for (const txtFile of txtFiles) {
    const oldPath = path.join(directoryPath, txtFile);
    const newPath = path.join(directoryPath, 'text', txtFile);
    await fs.promises.rename(oldPath, newPath);
  }
}

// moveTxtFiles();

async function main() {
  // load all images from the directory ./pliki_z_fabryki using fs and path module
  const directoryPath = path.join(__dirname, './pliki_z_fabryki/text');
  const files = await fs.promises.readdir(directoryPath);

  // create an array of objects with the file name and the file content
  const filesContent = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(directoryPath, file);
      const content = await fs.promises
        .readFile(filePath, { encoding: 'utf-8' })
        .catch((err) => {
          console.error(err);
          return '';
        });
      return { name: file, content };
    })
  );

  const answer: {
    people: string[];
    hardware: string[];
    others: string[];
  } = {
    people: [],
    hardware: [],
    others: [],
  };

  for (const file of filesContent) {
    const response = await chatCompletion({
      systemPrompt: `You are the raporter categorizator. You will be given a raport. Categorize the raport into one of the following categories:

          1. 'people': If raport is about spotting people, their actions, interegation, etc. 
          2. 'hardware': If the raport is about fixing or maintaining hardware, but not fixing software.
          3. 'others': If the content doesn't clearly fit into either 'people' or 'hardware' categories.

          Return an one of these three words: people, hardware, others.

          Example input:
          Boss, we found one guy hanging around the gate.

          Example output:
          people

          Example input:
          Przeprowadzono procedurę wymiany przestarzałych ogniw w jednostkach mobilnych.

          Example output:
          hardware

          Example input:
          Wstępny alarm wykrycia - ruch organiczny. Analiza wizualna i sensoryczna wykazała obecność lokalnej zwierzyny leśnej. Fałszywy alarm.

          Example output:
          others

          Dont add any additional comments to your response. Just return the one word and no more than one category. Don't use '' or "" around the category.
        `,
      userPrompt: file.content,
    });

    const fileExtension = file.name.split('.')[1];
    const fileName = file.name.split('.')[0] + '.' + fileExtension;
    console.log('[DUBUG] File name:', fileName, 'Category:', response.message);

    answer[response.message].push(fileName);

    answer.people.sort();
    answer.hardware.sort();
    answer.others.sort();
  }

  console.log('[DUBUG] Answer:', answer);
  const answerResponse = await sendJsonAnswer('kategorie', answer);
  console.log('[DUBUG] Answer response:', answerResponse);
}

main();

