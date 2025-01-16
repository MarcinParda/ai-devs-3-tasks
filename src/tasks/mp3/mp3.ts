import * as path from 'path';
import { glob } from 'glob';
import { createTranscriptions } from '../../utils/create_transcriptions';
import * as fs from 'fs';
import { chatComplition } from '../../utils/chat_complition';
import { sendJsonAnswer } from '../../api/sendAnswer';

async function transcriptPrzesluchania() {
  const audioFiles = glob.sync(
    path.resolve(__dirname, './przesluchania/*.m4a')
  );

  const directory = path.resolve(__dirname, './przesluchania');
  await createTranscriptions({ audioFiles, directory });
}

async function main() {
  // transcriptPrzesluchania();
  const txtFiles = glob.sync(path.resolve(__dirname, './przesluchania/*.txt'));
  let combinedText = '';

  for (const file of txtFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const fileName = path.basename(file, '.txt');
    combinedText += `${fileName}: ${content}\n\n`;
  }

  const prompt = `
  Remember that witness testimonies may be contradictory, some of them may be mistaken, and others may respond in a rather bizarre manner. The street name is not mentioned in the content of the transcription. You must use the model's internal knowledge to obtain the answer.

  <testimonies of people>
  ${combinedText}
  </testimonies of people>

  <example response>
  {
    _thinking: "Based on the testimonies provided, color of the car was blue.",
    answer: "blue"
  };
  </example response>

  Remember that you can use the model's internal knowledge to answer the question.
  Find the answer to the question and return only JSON with two properties: _thinking, where you explain your thought process, and answer, where you provide the answer to the question:
  `;

  const response = await chatComplition({
    systemPrompt: prompt,
    userPrompt: 'On which street is the institute where Andrzej Maj lectures?',
  });
  console.log('chat completion response', response.message);

  const answer = JSON.parse(response.message);
  console.log(answer);

  const centralaResponse = await sendJsonAnswer('mp3', answer.answer);
  console.log(centralaResponse);
}

main();
