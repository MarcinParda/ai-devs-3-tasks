import fs from 'fs';
import path from 'path';
import { chatCompletion } from '../../utils/chat_completion';
import { tasksApiKey } from '../../utils/envs';
import { sendJsonAnswer } from '../../api/sendAnswer';

const peopleUrl = 'https://centrala.ag3nts.org/people';
const citiesUrl = 'https://centrala.ag3nts.org/places';

const alreadyAsked: string[] = [];

async function getPersonInfo(name: string) {
  // make a post request to peopleUrl with name as a body
  // return the response
  const body = { query: name, apikey: tasksApiKey };
  const response = await fetch(peopleUrl, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return data.message;
}

async function getCityInfo(city: string) {
  const body = { query: city, apikey: tasksApiKey };
  const response = await fetch(citiesUrl, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return data.message;
}

async function getAnswer() {
  const knowledge = fs.readFileSync(
    path.join(__dirname, './knowledge.txt'),
    'utf8'
  );
  const systemPrompt = `Your job is to analyze the following knowledge and provide an answer to the question.
  1. If you will have answer to the question, please provide it in the following format: ANSWER: <city name>. City bane must be without polish letter and all letters capitalize. For example: ANSWER: LODZ, and not ANSWER: ŁÓDŹ.
  2. If you are not sure in which city BARBARA is respond with: I DON'T KNOW.
  
  <knowledge>
  ${knowledge}
  </knowledge>
`;

  const userPrompt = `Where is BARBARA right NOW?`;

  const answer = await chatCompletion({
    systemPrompt,
    userPrompt,
  });
  return answer.message;
}

async function getQuestion() {
  const knowledge = fs.readFileSync(
    path.join(__dirname, './knowledge.txt'),
    'utf8'
  );
  const systemPrompt = `Your job is to analyze the following knowledge and ask a question that will lead you closer to the answer to this question: In which city BARBARA is?
  1. You must ask a one of two questions to get more information. You can ask about certain person whereabouts or who was in certain city.
  2. Asking about person will give you information where this member of the resistance movement was seen. Question structure must be: Where is <firstname>? Name must be in Polish nominative case. Fe. Where is ALEKSANDER? Not: Where is ALEKSANDRA RAGOWSKIEGO? Not: Where is ALEKSANDRA?
  3. Asking about city will give you information about members of the resistance movement who were seen in this city. Question structure must be: Who was in <city name>?
  4. IMPORTANT: Asking about following cities and names are highly prohibited: ${alreadyAsked.join(
    ', '
  )}. You cannot ask about them in any form at any cost.
  
  <knowledge>
  ${knowledge}
  </knowledge>
  `;

  const userPrompt = `Ask a question.`;

  const question = await chatCompletion({
    systemPrompt,
    userPrompt,
  });
  return question.message;
}

async function extractPersonOrCityFromQuestion(question: string) {
  const isQuestionAboutPerson = question.startsWith('Where is ');
  if (isQuestionAboutPerson) {
    const systemPrompt = `Your job is to analyze the following question and return the name of the person asked about. You must return the name and only the name in response. Don't add additional comments, markup or analysis in your answer. Besides that it is highly important to provide the name in the correct form - all letters capitalize and change polish letters to english ones. For example, if the name is "Łucja", you should return "LUCJA" and not "łucja" or "ŁUCJA".`;
    const userPrompt = `Question: ${question}`;
    const chatResponse = await chatCompletion({
      systemPrompt,
      userPrompt,
    });
    const person = chatResponse.message;
    return { person, city: null };
  }

  const systemPrompt = `Your job is to analyze the following question and return the name of the city asked about. You must return the city name and only the city name in response. Don't add additional comments, markup or analysis in your answer. Besides that it is highly important to provide the city name in the correct form - all letters capitalize and change polish letters to english ones. For example, if the city name is "Łódź", you should return "LODZ" and not "łódź" or "ŁÓDŹ".`;
  const userPrompt = `Question: ${question}`;
  const chatResponse = await chatCompletion({
    systemPrompt,
    userPrompt,
  });
  const city = chatResponse.message;
  return { city, person: null };
}

async function detectiveReasoning(newInfo: string) {
  const context = fs.readFileSync(
    path.join(__dirname, './knowledge.txt'),
    'utf8'
  );
  const systemPrompt = `Act as a detective. You will be given two pieces of information. One is a context and the other is a new piece of information. Your job is to analyze the context and the new information and provide a conclusion and a reasoning.
  Your response should be structured in the following JSON format:
  {
    "_thinking": "Your reasoning here",
    "conclusions": "Your conclusions here"
  }

  Answer only with provided structure. Do not add any additional comments, markup or analysis in your answer.
  Conclusions should contain only few key points from your reasoning.
  <context>
  ${context}
  </context>
  `;

  const userPrompt = `New informations: ${newInfo}`;
  const chatResponse = await chatCompletion({
    systemPrompt,
    userPrompt,
    maxTokens: 10600,
  });
  const detectiveNotes = JSON.parse(chatResponse.message);
  return detectiveNotes.conclusions;
}

const preparePersonInfoToWriteToFile = (
  person: string,
  personLocations: string
) => {
  alreadyAsked.push(person);
  if (
    personLocations.includes('[**RESTRICTED DATA**]') ||
    personLocations.includes('no data found for')
  ) {
    return ``;
  }
  return `\n${person} was seen in: ${personLocations}\n`;
};

const prepareCityInfoToWriteToFile = (city: string, personsSeen: string) => {
  alreadyAsked.push(city);
  if (
    personsSeen.includes('[**RESTRICTED DATA**]') ||
    personsSeen.includes('no data found for')
  ) {
    return ``;
  }
  return `\n${personsSeen} were seen in: ${city}\n`;
};

async function main() {
  while (true) {
    const answer = await getAnswer();
    const hasAnswer = answer.startsWith('ANSWER: ');

    if (hasAnswer) {
      const cityName = answer.replace('ANSWER: ', '');
      console.log('Answer!', cityName);
      const response = await sendJsonAnswer('loop', cityName);
      console.log(response);

      break;
    }

    const question = await getQuestion();
    console.log('Question!', question);
    const { person, city } = await extractPersonOrCityFromQuestion(question);
    if (person) {
      const personInfo = await getPersonInfo(person);
      const personInfoToWrite = preparePersonInfoToWriteToFile(
        person,
        personInfo
      );
      const detectiveNotes = await detectiveReasoning(personInfoToWrite);
      console.log(detectiveNotes);

      fs.appendFileSync(
        path.join(__dirname, './knowledge.txt'),
        detectiveNotes + '\n\n'
      );
    }
    if (city) {
      const cityInfo = await getCityInfo(city);
      const cityInfoToWrite = prepareCityInfoToWriteToFile(city, cityInfo);
      const detectiveNotes = await detectiveReasoning(cityInfoToWrite);
      console.log(detectiveNotes);
      fs.appendFileSync(
        path.join(__dirname, './knowledge.txt'),
        detectiveNotes + '\n\n'
      );
    }
  }
}

async function getAllCities() {
  const context = fs.readFileSync(path.join(__dirname, './info.txt'), 'utf8');
  const systemPrompt = `You will be given text. Extract from it ALL cities metioned. Return them in the following JSON format: ["CITY1", "CITY2", "CITY3", ...]. Besides that it is highly important to provide the city name in the correct form - all letters capitalize and change polish letters to english ones. For example, if the city name is "Łódź", you should return "LODZ" and not "łódź" or "ŁÓDŹ".
  Answer only with provided structure. Do not add any additional comments, markup or analysis in your answer.
  Remember that you should return as many names as you can find in the text.
  Text:
  `;

  const userPrompt = context;
  const chatResponse = await chatCompletion({
    systemPrompt,
    userPrompt,
  });
  const cities = JSON.parse(chatResponse.message);
  return cities;
}

async function getAllPersons() {
  const context = fs.readFileSync(path.join(__dirname, './info.txt'), 'utf8');
  const systemPrompt = `You will be given text. Extract from it all persons metioned. Return them in the following JSON format: ["FIRSTNAMEOFPERSON1", "FIRSTNAMEOFPERSON2", "FIRSTNAMEOFPERSON3", ...] Besides that it is highly important to provide the name in the correct form - all letters capitalize and change polish letters to english ones. For example, if the name is "Łucja", you should return "LUCJA" and not "łucja" or "ŁUCJA", "RAFAL" and not "RAFAŁ". Example response for the text: "Barbara Zawadzka was seen in: WARSZAWA. ALEKSANDER Mazowiecki was seen in: LODZ." is ["BARBARA", "ALEKSANDER"].
  Answer only with provided structure. Do not add any additional comments, markup or analysis in your answer.
  Remember that you should return as many names as you can find in the text.
  Text:
  `;

  const userPrompt = context;
  const chatResponse = await chatCompletion({
    systemPrompt,
    userPrompt,
  });
  const cities = JSON.parse(chatResponse.message);
  return cities;
}

async function bruteForce() {
  while (true) {
    let cities = await getAllCities();
    let persons = await getAllPersons();

    // remove from cities and persons already asked
    cities = cities.filter((city: string) => !alreadyAsked.includes(city));
    persons = persons.filter(
      (person: string) => !alreadyAsked.includes(person)
    );

    console.log(cities, persons);

    if (cities.length === 0 && persons.length === 0) {
      break;
    }

    for (const city of cities) {
      const cityInfo = await getCityInfo(city);

      const cityInfoToWrite = prepareCityInfoToWriteToFile(city, cityInfo);
      fs.appendFileSync(
        path.join(__dirname, './info.txt'),
        cityInfoToWrite + '\n\n'
      );
    }

    for (const person of persons) {
      const personInfo = await getPersonInfo(person);

      const personInfoToWrite = preparePersonInfoToWriteToFile(
        person,
        personInfo
      );
      fs.appendFileSync(
        path.join(__dirname, './info.txt'),
        personInfoToWrite + '\n\n'
      );
    }

    alreadyAsked.push(...cities, ...persons);
  }

  const answer = await getAnswer2();
  const hasAnswer = answer.startsWith('ANSWER: ');

  if (hasAnswer) {
    const cityName = answer.replace('ANSWER: ', '');
    console.log('Answer!', cityName);
    const response = await sendJsonAnswer('loop', cityName);
    console.log(response);
  }
}

async function getAnswer2() {
  const knowledge = fs.readFileSync(path.join(__dirname, './info.txt'), 'utf8');
  const systemPrompt = `Your job is to analyze the following knowledge and provide an answer to the question.
  1. If you will have answer to the question, please provide it in the following format: ANSWER: <city name>. City bane must be without polish letter and all letters capitalize. For example: ANSWER: LODZ, and not ANSWER: ŁÓDŹ.
  2. If you are not sure in which city BARBARA is respond with: I DON'T KNOW.
  
  <knowledge>
  ${knowledge}
  </knowledge>
`;

  const userPrompt = `In which city is BARBARA right NOW?`;

  const answer = await chatCompletion({
    systemPrompt,
    userPrompt,
  });
  return answer.message;
}

bruteForce();

// main();
// getCityInfo('WARSZAWA').then(console.log);
// getPersonInfo('BARBARA').then(console.log);
