import fs from 'fs';
import { openai } from './openai';
import { ChatCompletionContentPart } from 'openai/resources/index.mjs';

export async function recognizeImage(
  imagePath: string,
  userPrompt: string
): Promise<string> {
  // Read the image file and convert it to base64
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    return response.choices[0].message.content || 'No description available.';
  } catch (error) {
    console.error('Error recognizing image:', error);
    throw new Error('Failed to recognize image');
  }
}

export async function recognizeImages(
  imagePaths: string[],
  userPrompt: string
): Promise<string> {
  // Read the image file and convert it to base64
  const imageBuffers = imagePaths.map((imagePath) =>
    fs.readFileSync(imagePath)
  );
  const base64Images = imageBuffers.map((imageBuffer) =>
    imageBuffer.toString('base64')
  );
  const imagesContent: ChatCompletionContentPart[] = base64Images.map(
    (base64Image) => ({
      type: 'image_url',
      image_url: {
        url: `data:image/png;base64,${base64Image}`,
      },
    })
  );

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: userPrompt }, ...imagesContent],
        },
      ],
      max_tokens: 300,
    });

    return response.choices[0].message.content || 'No description available.';
  } catch (error) {
    console.error('Error recognizing image:', error);
    throw new Error('Failed to recognize image');
  }
}
