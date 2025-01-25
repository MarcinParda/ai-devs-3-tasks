import { chatCompletion } from '../utils/chat_completion';

function extractQuestion(text: string) {
  // Define the regex pattern to match the question
  const regex = /(?<=<p id="human-question">Question:<br \/>)(.*?)(?=<\/p>)/;

  // Use the regex to search for the question in the HTML content
  const match = text.match(regex);

  // Return the extracted question or a message if not found
  return match ? match[0] : 'Question not found.';
}

function extractFlag(text: string) {
  const regex = /{{FLG:(.*?)}}/;
  const match = text.match(regex);
  return match ? match[1] : 'Flag not found.';
}

const fetchData = async (endpoint: string) => {
  try {
    const response = await fetch(`https://xyz.ag3nts.org${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/html',
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

const sendData = async (endpoint: string, data: Record<string, string>) => {
  try {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    const response = await fetch(`https://xyz.ag3nts.org${endpoint}`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Error sending data: ${response.statusText}`);
    }
    return response.text();
  } catch (error) {
    console.error('Error sending data:', error);
    throw error;
  }
};

const pageContent = await fetchData('');
const question = extractQuestion(pageContent);
const answer = await chatCompletion({
  systemPrompt:
    'Answer the following question with number and number only, dont add any additional characters or dot at the end:',
  userPrompt: question,
});

const response = await sendData('', {
  username: 'tester',
  password: '574e112a',
  answer: answer.message,
});
console.log(extractFlag(response));

export {};
