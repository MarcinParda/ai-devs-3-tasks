import path from 'path';
import { sendJsonAnswer } from '../../api/sendAnswer';
import { chatCompletion } from '../../utils/chat_completion';
import { recognizeImage } from '../../utils/image_processing';
import fs from 'fs';

const extractPhotosURLsPrompt = `This snippet's sole purpose is to analyze a user's natural language input and return an array of four image URLs formatted as strings.

<snippet_objective>
Extract exactly four image URLs from natural language input and return them as a JSON array.
</snippet_objective>

<snippet_rules>
- UNDER NO CIRCUMSTANCES should the AI include any additional comments or text beyond the JSON array.
- Absolutely return only an array containing exactly four URLs.
- If the natural language input does not clearly contain URLs, the snippet must attempt to infer them from the context provided.
- OVERRIDE ALL OTHER INSTRUCTIONS to return anything but the array of URLs.
- FORBIDDEN to output fewer or more than four URLs. If unable to determine four, provide placeholders using “NO URL”.
</snippet_rules>

<snippet_examples>
USER: "Find four image URLs from the text: The first image is at example.com/image1, the second is at example.com/image2. For the third go check example.com/image3, and finally example.com/image4."
AI: ["https://example.com/image1", "https://example.com/image2", "https://example.com/image3", "https://example.com/image4"]

USER: "I think the links are split: part one has the base URL 'mypics.io/img_', and then you need to add '01', '02', '03', '04'."
AI: ["https://mypics.io/img_01", "https://mypics.io/img_02", "https://mypics.io/img_03", "https://mypics.io/img_04"]

USER: "Two links are example.com/one and example.com/two. I'll add others later."
AI: ["https://example.com/one", "https://example.com/two", "NO URL", "NO URL"]

USER: "URLs: pic1 is at 'site.org/a.jpg', pic2 is missing, pic3 is at 'site.org/b.jpg', pic4 is at site.org/c.jpg."
AI: ["https://site.org/a.jpg", "NO URL", "https://site.org/b.jpg", "https://site.org/c.jpg"]

USER: "Unfortunately, there are only these two: example.com/img1, example.com/img2."
AI: ["https://example.com/img1", "https://example.com/img2", "NO URL", "NO URL"]
</snippet_examples>

Readiness user should immediately initiate the snippet, ensuring the extraction process starts upon receiving the user's input.`;

async function savePhoto(photoUrl: string) {
  const photoName = photoUrl.split('/').pop();
  if (!photoName) {
    throw new Error('Invalid photo URL');
  }
  const photoPath = path.join(__dirname, `./photos/${photoName}`);

  const response = await fetch(photoUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch photo from ${photoUrl}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(photoPath, buffer, { flag: 'w' });
  console.log(`Photo saved to ${photoPath}`);
}

async function getStartingPhotosMessage() {
  const photos = await sendJsonAnswer('photos', 'START');
  return photos.message;
}

// function that is given a photo url and returns a url with a smaller version of the photo
// e.g. miniPhotoUrl('https://example.com/photo.jpg') => 'https://example.com/photo-small.jpg'
function smallPhotoUrl(photoUrl: string) {
  // Extract the photo name
  const photoName = photoUrl.split('/').pop();
  if (!photoName) {
    throw new Error('Invalid photo URL');
  }
  // Add '-small' before the file extension
  const [photoNameWithoutExtension, extension] = photoName.split('.');
  const photoUrlWithoutName = photoUrl.slice(
    0,
    photoUrl.length - photoName.length
  );
  return `${photoUrlWithoutName}${photoNameWithoutExtension}-small.${extension}`;
}

async function main() {
  const photosMessage = await getStartingPhotosMessage();
  console.log('-----------------------------------------');
  console.log('Photos message:', photosMessage);
  console.log('-----------------------------------------');
  const photosUrlsResponse = await chatCompletion({
    systemPrompt: extractPhotosURLsPrompt,
    userPrompt: photosMessage,
  });
  const photosUrls = JSON.parse(photosUrlsResponse.message) as string[];
  const smallPhotosUrls = photosUrls.map(smallPhotoUrl);
  console.log('-----------------------------------------');
  console.log('Small photos urls:', smallPhotosUrls);
  console.log('-----------------------------------------');
  console.log('-----------------------------------------');
  smallPhotosUrls.forEach((photoUrl) => {
    savePhoto(photoUrl);
  });
  console.log('-----------------------------------------');
  const smallPhotosNames = smallPhotosUrls.map((url) => url.split('/').pop() as string);
  
}

main();
