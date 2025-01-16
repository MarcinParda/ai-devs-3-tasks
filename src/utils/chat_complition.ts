import { ChatCompletionMessageParam } from 'openai/src/resources/index.js';
import { openai } from './openai';

export async function chatComplition({
  systemPrompt,
  userPrompt,
  model = 'gpt-4',
  maxTokens = 256,
}: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
}) {
  const messages: Array<ChatCompletionMessageParam> = [];
  if (systemPrompt) messages.push({ content: systemPrompt, role: 'system' });
  if (userPrompt) messages.push({ content: userPrompt, role: 'user' });

  const response = await openai.chat.completions.create({
    messages,
    model,
    max_tokens: maxTokens,
  });

  return {
    conversationId: response.id,
    message: response.choices[0].message.content || '',
  };
}
