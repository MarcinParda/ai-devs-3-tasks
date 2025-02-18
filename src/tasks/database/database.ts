import { tasksApiKey } from '../../utils/envs';
import { chatCompletion } from '../../utils/chat_completion';
import { sendJsonAnswer } from '../../api/sendAnswer';

const databaseUrl = 'https://centrala.ag3nts.org/apidb';

// create function that will make post request to the database

interface QueryData {
  task: string;
  apikey: string;
  query: string;
}

export async function postToDatabase(data: QueryData) {
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

const getTableQuery = `show tables`;
const tablesInDatabase = [
  'connections',
  'correct_order',
  'datacenters',
  'users',
];

// post the query to the database

async function getTables() {
  const data = {
    task: 'database',
    apikey: tasksApiKey,
    query: getTableQuery,
  };
  const response = await postToDatabase(data);
  console.log(response);
}
// getTables();

async function getTableStructure(table: string) {
  const data = {
    task: 'database',
    apikey: tasksApiKey,
    query: `show create table ${table}`,
  };
  const response = await postToDatabase(data);
  return response.reply[0]['Create Table'];
}

async function createSystemPrompt() {
  let systemPrompt = `You are an SQL query generator. Your task is to create a precise SQL query based on the provided database structure and question. Follow these guidelines:

    1. Analyze the given database schema carefully.
    2. Interpret the question to determine the required data.
    3. Construct a syntactically correct SQL query that answers the question.
    4. Use only the tables and columns specified in the schema.
    5. Optimize the query for efficiency when possible.
    6. Return ONLY the SQL query without any additional comments, explanations or additional markup, only sql query text.
    Database tables schemas:\n`;
  for (const table of tablesInDatabase) {
    const tableStructure = await getTableStructure(table);
    const singleTable = `<${table} table structure>\n${tableStructure}\n</${table}>\n`;
    systemPrompt += singleTable;
  }
  systemPrompt += `Question: `;
  return systemPrompt;
}

const userPrompt = `which active data centers (DC_ID) are managed by employees who are on vacation (is_active=0)
Generate the SQL query:`;

async function generateSQLQuery() {
  const systemPrompt = await createSystemPrompt();
  const chatResponse = await chatCompletion({
    systemPrompt,
    userPrompt,
  });
  return chatResponse.message;
}

async function getAnswer() {
  const sqlQuery = await generateSQLQuery();
  console.log(sqlQuery);
  const data = {
    task: 'database',
    apikey: tasksApiKey,
    query: sqlQuery,
  };
  const response = await postToDatabase(data);
  const answer = response.reply.map((row: any) => row['dc_id']);
  return answer;
}

async function main() {
  const answer = await getAnswer();
  const response = await sendJsonAnswer('database', answer);
  console.log(response);
}

// main();
