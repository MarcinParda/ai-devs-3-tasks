import fetch from 'node-fetch';
import fs from 'fs/promises';
import { chatComplition } from '../../utils/chat_complition';

const verifyUrl = 'https://xyz.ag3nts.org/verify';

interface Message {
  text: string;
  msgID: string;
}

const readRoboISO2230File = async (): Promise<string> => {
  try {
    const data = await fs.readFile(
      './src/tasks/verify/RoboISO2230.txt',
      'utf-8'
    );
    return data;
  } catch (error) {
    console.error('Error reading RoboISO2230.txt file:', error);
    throw error;
  }
};

const conversation = async () => {
  const roboISO2230Content = await readRoboISO2230File();

  // Initial message from ENTITY
  const entityMessage: Message = {
    text: 'READY',
    msgID: '0',
  };

  // Send initial message to the robot
  let initialResponse = await fetch(verifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entityMessage),
  });

  const robotMessage: Message = await initialResponse.json();

  // Use chatCompletion to get the answer from AI
  const systemPrompt = `${roboISO2230Content}`;
  const userPrompt = robotMessage.text;
  const aiAnswer = await chatComplition({ systemPrompt, userPrompt });

  // Respond with the AI's answer
  const answerMessage: Message = {
    text: aiAnswer.message,
    msgID: robotMessage.msgID,
  };

  // Send the answer to the robot
  const answerResponse = await fetch(verifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(answerMessage),
  });

  const answer = await answerResponse.json();

  console.log({ answer, aiAnswer: aiAnswer.message, userPrompt });
};

conversation().catch((error) => {
  console.error('Error during the conversation:', error);
});
