import { openai } from './openai';

export async function generateImages(userPrompt: string): Promise<string[]> {
  // Create a new image using the user prompt with the DALL-E model
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: userPrompt,
  });

  const imageUrls = response.data
    .map((image) => image.url)
    .filter(Boolean) as string[];
  return imageUrls;
}
