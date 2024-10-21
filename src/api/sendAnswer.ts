import { tasksApiKey } from '../utils/envs';

export interface AnswerResponse {
  code: number;
  message: string;
}

export async function sendJsonAnswer(
  taskId: string,
  answer: string | unknown[] | Record<string, unknown>
) {
  const apiAnswerUrl = `https://poligon.aidevs.pl/verify`;

  const response = await fetch(apiAnswerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answer, task: taskId, apikey: tasksApiKey }),
  });

  if (!response.ok) {
    console.log('Send json answer error:', await response.json());
    process.exit(1);
  }

  return (await response.json()) as AnswerResponse;
}
