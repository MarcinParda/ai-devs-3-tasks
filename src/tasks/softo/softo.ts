import { tasksApiKey } from '../../utils/envs';
import TurndownService from 'turndown';
import { chatCompletion } from '../../utils/chat_completion';
import { sendJsonAnswer } from '../../api/sendAnswer';

const pages = new Map<string, string>();

const createFindingAnswerPrompt = () => {
  let context = '';
  pages.forEach((value, key) => {
    context = context.concat(`<page: ${key}>\n${value}\n</page: ${key}>\n\n`);
  });

  return `You are page analyzer.
  Your task is to answer to the question given by the user based on the content of the pages provided in markdown format.
  You should return the brief answer to the question without any additional comments, interpuntion or formatting.
  Important note: if you are not 100% sure about the answer, you should return: I don't know
  ${context}
  `;
};

const extractAllUrlsPrompt = `You are page analyzer.
  Your task is to extract all URLs from the provided text.
  You should return the list of all URLs found in the text provided by user.
  Base url for the pages is: https://softo.ag3nts.org/
  You should return the list of URLs in the following format:
  ["url1", "url2", "url3"]
  For example:
  ["https://example.com/page1", "https://example.com/page2"]
  `;

const urlPickerPrompt = `You are url picker.
Your task is to pick the most relevant URL based on the question provided by the user.
You should return the URL of the page that propably contains the most relevant information to the question.
You should return the URL without any additional comments.
For example:
USER: What is best programming language?
["https://example.com/programming-languages", "https://example.com/best-programming-language", "https://example.com/blog"]
ASSISTANT: https://example.com/best-programming-language
`;

async function fetchQuestions() {
  const url = `https://centrala.ag3nts.org/data/${tasksApiKey}/softo.json`;
  const questions = (await fetch(url).then((response) =>
    response.json()
  )) as Record<string, string>;
  const questionsMap = new Map(Object.entries(questions));
  return questionsMap;
}

async function fetchPageHTML(url: string) {
  const html = await fetch(url).then((response) => response.text());
  return html;
}

async function htmlToMarkdown(html: string) {
  const turndownService = new TurndownService();
  const markdown = turndownService.turndown(html);
  return markdown;
}

async function fetchUrlMarkdown(url: string) {
  const html = await fetchPageHTML(url);
  const markdown = await htmlToMarkdown(html);
  return markdown;
}

async function fetchMainPage() {
  const url = 'https://softo.ag3nts.org/';
  const content = await fetchUrlMarkdown(url);
  pages.set('https://softo.ag3nts.org/', content);
}

async function gettingAnswer(question: string) {
  if (pages.size === 0) {
    console.log('------------------------------');
    console.log('Fetching main page');
    await fetchMainPage();
  }
  let answer = `I don't know`;
  while (answer === `I don't know`) {
    const systemPrompt = createFindingAnswerPrompt();
    const completion = await chatCompletion({
      systemPrompt,
      userPrompt: question,
    });
    answer = completion.message;
    console.log('------------------------------');
    console.log(`Question: ${question}`);
    console.log(`Answer: ${answer}`);

    if (answer === `I don't know`) {
      let context = '';
      pages.forEach((value) => {
        context = context.concat(`${value}\n`);
      });
      const extractedURls = await chatCompletion({
        systemPrompt: extractAllUrlsPrompt,
        userPrompt: context,
        maxTokens: 2560,
      });
      console.log('------------------------------');
      console.log(`All URLs: ${extractedURls.message}`);
      const urls = JSON.parse(extractedURls.message);
      const unvisitedUrls = urls.filter((url: string) => !pages.has(url));
      console.log('------------------------------');
      console.log(`Unvisited URLs: ${unvisitedUrls.join(', ')}`);

      const questionWithUrls = `${question}\n${JSON.stringify(unvisitedUrls)}`;
      const pickedUrl = await chatCompletion({
        systemPrompt: urlPickerPrompt,
        userPrompt: questionWithUrls,
      });
      console.log('------------------------------');
      console.log(`Picked URL: ${pickedUrl.message}`);
      const pickedUrlContent = await fetchUrlMarkdown(pickedUrl.message);
      pages.set(pickedUrl.message, pickedUrlContent);
    }
  }
  return answer;
}

async function main() {
  const questions = await fetchQuestions();
  const answers = new Map<string, string>();

  for (const [questionNr, question] of questions.entries()) {
    const answer = await gettingAnswer(question);
    answers.set(questionNr, answer);
  }
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log(Object.fromEntries(answers));
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!');
  const answerResponse = await sendJsonAnswer(
    'softo',
    Object.fromEntries(answers)
  );
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log(answerResponse.message);
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!');
}

main();
