import * as fs from 'fs';
import * as path from 'path';
import { chatComplition } from '../../utils/chat_complition';
import { sendJsonAnswer } from '../../api/sendAnswer';
import { tasksApiKey } from '../../utils/envs';

interface JSONData {
  'test-data': TestData[];
  apikey: string;
  description: string;
  copyright: string;
}

interface Test {
  q: string;
  a: string;
}

interface TestData {
  question: string;
  answer: number;
  test?: Test;
}

async function loadJsonData(): Promise<JSONData | null> {
  const filePath = path.join(__dirname, './data.json');
  let jsonData: JSONData | null = null;

  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    jsonData = JSON.parse(data);
  } catch (err) {
    console.error('Error reading or parsing file:', err);
  }

  return jsonData;
}

function correctAddition(questionObj: TestData): TestData {
  const parts = questionObj.question.split(' ');

  if (parts.length !== 3 || parts[1] !== '+') {
    throw new Error('Invalid question format. Expected: number + number');
  }

  const num1 = parseFloat(parts[0]);
  const num2 = parseFloat(parts[2]);

  if (isNaN(num1) || isNaN(num2)) {
    throw new Error('Invalid numbers in the question');
  }

  const correctAnswer = num1 + num2;

  return {
    ...questionObj,
    answer: correctAnswer,
  };
}

const answerQuestionsSystemPrompt = `You are given a question. Your task is to provide the correct answer and only correct answer.

Example:
Input: What is the capital city of Poland?
Output: Warsaw
`;

const jsonData = await loadJsonData();

if (!jsonData) {
  console.error('No data found');
  process.exit(1);
}

const testData = jsonData['test-data'];
const testDataWithCorrectedAdditions = testData.map((data) =>
  correctAddition(data)
);

const correctedTestDataWithTests = testDataWithCorrectedAdditions.filter(
  (data) => data.test
);
const correctedTestDataWithoutTests = testDataWithCorrectedAdditions.filter(
  (data) => !data.test
);

const correctedTestDataQuestions: TestData[] = await Promise.all(
  correctedTestDataWithTests.map(async (data) => {
    const systemPrompt = `${answerQuestionsSystemPrompt}`;
    const userPrompt = data.test!.q;

    const aiAnswer = await chatComplition({ systemPrompt, userPrompt });
    console.log({ message: aiAnswer.message });

    return {
      ...data,
      test: {
        q: data.test!.q,
        a: aiAnswer.message,
      },
    };
  })
);

// join correctedTestDataQuestions with correctedTestDataWithoutTests
const correctedTestData: TestData[] = correctedTestDataQuestions.concat(
  correctedTestDataWithoutTests
);

const correctedJson: JSONData = {
  ...jsonData,
  apikey: tasksApiKey,
  'test-data': correctedTestData,
};

const response = await sendJsonAnswer(
  'JSON',
  correctedJson,
  'https://centrala.ag3nts.org/report '
);

console.log(response);
