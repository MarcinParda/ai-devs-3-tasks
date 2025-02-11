import { tasksApiKey } from '../../utils/envs';
import { chatCompletion } from '../../utils/chat_completion';
import { sendJsonAnswer } from '../../api/sendAnswer';
import fs from 'fs';
import { join } from 'path';

const databaseUrl = 'https://centrala.ag3nts.org/apidb';

// create function that will make post request to the database

interface QueryData {
  task: string;
  apikey: string;
  query: string;
}

async function postToDatabase(data: QueryData) {
  try {
    const response = await fetch(databaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error posting data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
}

const tablesInDatabase = ['connections', 'users'];

async function getUsers() {
  const data = {
    task: 'database',
    apikey: tasksApiKey,
    query: `select * from users`,
  };
  const response = await postToDatabase(data);
  return response.reply;
}

async function saveUsersToJSON() {
  const users = await getUsers();

  fs.writeFileSync(join(__dirname, './users.json'), JSON.stringify(users));
}

async function getConnections() {
  const data = {
    task: 'database',
    apikey: tasksApiKey,
    query: `select * from connections`,
  };
  const response = await postToDatabase(data);
  return response.reply;
}

async function saveConnectionsToJSON() {
  const connections = await getConnections();

  fs.writeFileSync(
    join(__dirname, './connections.json'),
    JSON.stringify(connections)
  );
}

async function askForShortestPath() {
  const users = fs.readFileSync(join(__dirname, './users.json'), {
    encoding: 'utf-8',
  });
  const connections = fs.readFileSync(join(__dirname, './connections.json'), {
    encoding: 'utf-8',
  });

  const systemPrompt = `<users>\n${users}\n</users>\n\n<connections>\n${connections}\n</connections>`;
  const userPrompt = `Prepare a neo4j query that will create graph for the given users and connections. The graph should contain all users and connections.`;

  const chatResponse = await chatCompletion({
    systemPrompt,
    userPrompt,
    model: 'gpt-4o',
    maxTokens: 16000,
  });

  return chatResponse.message;
}

async function main() {
  // await saveUsersToJSON();
  // await saveConnectionsToJSON();
  // const answer = await askForShortestPath();
  // console.log(answer);
  const response = await sendJsonAnswer(
    'connections',
    'Rafał, Azazel, Aleksander, Barbara'
  );
  console.log(response);
}

main();
