import fs from 'fs';
import path from 'path';
import { openai } from './openai';

export async function createTranscriptions({
  audioFiles,
  directory,
}: {
  audioFiles: string[];
  directory: string;
}) {
  for (const audioFile of audioFiles) {
    console.log(`Processing ${audioFile}...`);

    try {
      const audioStream = fs.createReadStream(audioFile);

      const transcription = await openai.audio.transcriptions.create({
        file: audioStream,
        model: 'whisper-1',
      });

      const txtFileName = path.basename(audioFile, '.m4a') + '.txt';
      const outputPath = path.join(directory, txtFileName);
      fs.writeFileSync(outputPath, transcription.text);

      console.log(`Transcription saved for ${audioFile}`);
    } catch (error) {
      console.error(`Error processing ${audioFile}:`, error);
    }
  }
}
