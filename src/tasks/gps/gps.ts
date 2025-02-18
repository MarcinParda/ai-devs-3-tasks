import { sendJsonAnswer } from 'api/sendAnswer';
import { postToDatabase } from 'tasks/database/database';
import { getCityInfo } from 'tasks/loop/loop';
import { chatCompletion } from 'utils/chat_completion';
import { tasksApiKey } from 'utils/envs';

async function fetchQuestion() {
  const response = await fetch(
    `https://centrala.ag3nts.org/data/${tasksApiKey}/gps_question.json`
  );
  const data = await response.json();
  return data.question;
}

const gpsUrl = 'https://centrala.ag3nts.org/gps';

// https://centrala.ag3nts.org/apidb
// {
//     "task": "database",
//     "apikey": "Twój klucz API",
//     "query": "select * from users limit 1"
// }

// https://centrala.ag3nts.org/places
// {
//  "apikey":"TWÓJ KLUCZ",
//  "query": "IMIE lub MIASTO"
// }

const selectToolPrompt = `
You will be given a question. You need to use provided tools to find the answer.
Your tools are: GPSTool, UserTool and CityTool.
You need to decide which tool to use to find the answer.
UserTool when given a username will return the id of the user.
CityTool when given a city will return the people that were in this city.
GPSTool when given a userId will return the GPS coordinates for that person. GPSTool can only be used with userIds, not their usernames!

IMPORTANT: user id is not the same as the username.

Results of your actions will be stored in context so analyze the context and see what is left to do.

As a response please return JSON object. Don't add any additional text, comments. Just the JSON object without wrapping it with some tags or interpuntion marks.
For CityTool it will be JSON with the city, tool and _thoughts parameters.
FE. { "_thoughts": "To find the user that were in WARSZAWA city CityTool is needed.", "tool": "CityTool" "city": "WARSZAWA"  }
For UserTool it will be JSON with the users, tool and _thoughts parameters.
FE. { "_thoughts": "To find the JAKUB, TOMASZ, RADOSLAW ids I need now use UserTool.", "tool": "UserTool" "users": ["JAKUB", "TOMASZ", "RADOSLAW"]
For GPSTool it will be JSON with the userIds, tool and _thoughts parameters.
FE. { "_thoughts": "To find the JAKUB, TOMASZ, RADOSLAW location I need now use their ids in GPSTool.", "tool": "GPSTool" "userIds": ["666", "667", "668"]
`;

const isTaskFinishedPrompt = `
You will be given a question and process of resolving it.

If you think that the process is finished and the answer was found please return answer to this question in natural language.
If you think that the process is not finished yet please return ANSWER_NOT_FOUND string. Don't add any additional text, comments. Just the string without wrapping it with some tags or interpuntion marks.
`;

const prepareDataForCentralaPrompt = `
You will be given coordinates assigned to users names and you need to prepare JSON object with the data from them.
JSON object should have the following structure:
{
    "imie": {
        "lat": number,
        "lon": number
    },
    "kolejne-imie": {
        "lat": number,
        "lon": number
    }
}
As a response please return JSON object. Don't add any additional text, comments. Just the JSON object without wrapping it with some tags or interpuntion marks.
<example-response>
{
    "KACPER": {
        "lat": 12.345,
        "lon": 65.431
    },
    "JAKUB": {
        "lat": 19.433,
        "lon": 12.123
    }
}
</example-response>

`;

async function userTool(username: string) {
  const data = {
    task: 'database',
    apikey: tasksApiKey,
    query: `select id from users where username = '${username}'`,
  };
  const response = await postToDatabase(data);
  return response.reply[0].id;
}

async function gpsTool(userID: number) {
  const body = { userID };

  const response = await fetch(gpsUrl, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return `lat: ${data.message.lat}, lon: ${data.message.lon}`;
}

async function main() {
  let context = await fetchQuestion();

  // const id = await userTool('Barbara');
  // console.log(id);

  // const city = await getCityInfo('WARSZAWA');
  // console.log(city);

  // const gps = await gpsTool(28);
  // console.log(gps);
  while (true) {
    console.log('--------------------');
    console.log('Context:');
    console.log(context);
    const toolCompletion = await chatCompletion({
      systemPrompt: selectToolPrompt,
      userPrompt: context,
      maxTokens: 10000,
    });
    console.log('--------------------');
    console.log('Tool selection:');
    console.log(toolCompletion.message);

    const toolJson = JSON.parse(toolCompletion.message);
    const tool = toolJson.tool;
    console.log(tool);

    const isTaskFinishedCompletion = await chatCompletion({
      systemPrompt: isTaskFinishedPrompt,
      userPrompt: context,
    });
    console.log('--------------------');
    console.log('Task status:');
    console.log(isTaskFinishedCompletion.message);

    if (isTaskFinishedCompletion.message !== 'ANSWER_NOT_FOUND') {
      const answerCompletion = await chatCompletion({
        systemPrompt: prepareDataForCentralaPrompt,
        userPrompt: isTaskFinishedCompletion.message,
      });
      const answer = JSON.parse(answerCompletion.message);
      const centralaResponse = await sendJsonAnswer('gps', answer);
      console.log('--------------------');
      console.log('Centrala response:');
      console.log(centralaResponse);

      break;
    }

    switch (tool) {
      case 'UserTool':
        const people = toolJson.users as string[];
        const ids = await Promise.all(people.map((person) => userTool(person)));
        const userIdPairs = people
          .map((person, index) => `${person}'s id: ${ids[index]}`)
          .join(', ');
        context += `
        UserTool was used to find the ids of the people: ${people}.
        Found ids:
        ${userIdPairs}
        `;
        break;
      case 'CityTool':
        const persons = await getCityInfo(toolJson.city);
        context += `
        CityTool was used to find the people that were in ${toolJson.city}.
        Found people: ${persons}
        `;
        break;
      case 'GPSTool':
        const userIds = toolJson.userIds as number[];
        const gps = await Promise.all(userIds.map((id) => gpsTool(id)));
        const gpsPairs = userIds
          .map((id, index) => `User ${id} GPS: ${gps[index]}`)
          .join(', ');
        context += `
        GPSTool was used to find the GPS coordinates for the users: ${userIds}.
        Found GPS coordinates:
        ${gpsPairs}
        `;
        break;
      default:
        console.log('!!!!!!!!!!!!!!!!!!!!!');
        console.log('Invalid tool');
        console.log('!!!!!!!!!!!!!!!!!!!!!');
        break;
    }
  }
}

main();
