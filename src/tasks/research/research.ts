import fs from 'fs';
import { join } from 'path';
import { sendJsonAnswer } from '../../api/sendAnswer';

function readLabData() {
  // Read the correct.txt, incorrect.txt, verify.txt files from /lab_data folder
  const correctTxtPath = join(__dirname, 'lab_data', 'correct.txt');
  const incorrectTxtPath = join(__dirname, 'lab_data', 'correct.txt');
  const verifyTxtPath = join(__dirname, 'lab_data', 'correct.txt');
  const correct = fs.readFileSync(correctTxtPath, 'utf8');
  const incorrect = fs.readFileSync(incorrectTxtPath, 'utf8');
  const verify = fs.readFileSync(verifyTxtPath, 'utf8');
  return { correct, incorrect, verify };
}

async function prepareShuffledData() {
  const { correct, incorrect, verify } = readLabData();
  console.log('correct', correct);
  console.log('incorrect', incorrect);
  console.log('verify', verify);
  // add to each line of correct string at the end the phrase ";1"
  // add to each line of incorrect string at the end the phrase ";0"
  const correctLines = correct.split('\n');
  const incorrectLines = incorrect.split('\n');
  const correctWithLabel = correctLines
    .map((line) => `${line};1`)
    .slice(0, -1)
    .join('\n');
  const incorrectWithLabel = incorrectLines
    .map((line) => `${line};0`)
    .slice(0, -1)
    .join('\n');

  // mix the lines from the previous step and write them to bruteforce.txt
  const mixedLines = correctWithLabel
    .split('\n')
    .concat(incorrectWithLabel.split('\n'));
  const shuffledLines = mixedLines.sort(() => Math.random() - 0.5);
  const shuffledLinesString = shuffledLines.join('\n');

  const shuffledLinesTxtPath = join(__dirname, 'shuffledData.txt');
  fs.writeFileSync(shuffledLinesTxtPath, shuffledLinesString);
}

async function sendAnswerMain() {
  const answer = ['01', '02', '10'];
  const responseAnswer = await sendJsonAnswer('research', answer);
  console.log(responseAnswer);
}

function createTrainingData() {
  const shuffledDataPath = join(__dirname, 'shuffledData.txt');
  const shuffledData = fs.readFileSync(shuffledDataPath, 'utf8');
  const shuffledLines = shuffledData.split('\n');
  const trainingData = shuffledLines.slice(0, -30).map((line) => {
    const [data, label] = line.split(';');
    return { data, label };
  });
  trainingData.forEach((data) => {
    const trainingDataRecord = {
      messages: [
        {
          role: 'system',
          content: 'Tell me if the following vector is correct or incorrect',
        },
        {
          role: 'user',
          content: data.data,
        },
        {
          role: 'assistant',
          content: data.label === '1' ? 'Correct' : 'Incorrect',
        },
      ],
    };
    const trainingDataRecordJson = JSON.stringify(trainingDataRecord);
    // add trainingDataRecordJson to trainingData.jsonl at the end of the file
    const trainingDataJsonPath = join(__dirname, 'trainingData.jsonl');
    fs.appendFileSync(trainingDataJsonPath, trainingDataRecordJson + '\n');
  });
}

function createValidationData() {
  const shuffledDataPath = join(__dirname, 'shuffledData.txt');
  const shuffledData = fs.readFileSync(shuffledDataPath, 'utf8');
  const shuffledLines = shuffledData.split('\n');
  const validationData = shuffledLines.slice(-30).map((line) => {
    const [data, label] = line.split(';');
    return { data, label };
  });
  validationData.forEach((data) => {
    const validationDataRecord = {
      messages: [
        {
          role: 'system',
          content: 'Tell me if the following vector is correct or incorrect',
        },
        {
          role: 'user',
          content: data.data,
        },
        {
          role: 'assistant',
          content: data.label === '1' ? 'Correct' : 'Incorrect',
        },
      ],
    };
    const validationDataRecordJson = JSON.stringify(validationDataRecord);
    // add validationDataRecordJson to validationData.jsonl at the end of the file
    const validationDataJsonPath = join(__dirname, 'validationData.jsonl');
    fs.appendFileSync(validationDataJsonPath, validationDataRecordJson + '\n');
  });
}

async function main() {
  // prepareShuffledData();
  // sendAnswerMain();
  createTrainingData();
  createValidationData();
}

main();
