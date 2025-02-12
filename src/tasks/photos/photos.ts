import path from 'path';
import { sendJsonAnswer } from '../../api/sendAnswer';
import { chatCompletion } from '../../utils/chat_completion';
import { recognizeImage, recognizeImages } from '../../utils/image_processing';
import fs from 'fs';

const photosMap = new Map<number, string>();

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

const extractPhotoURLPrompt = `This snippet's sole purpose is to analyze a user's natural language input and return an image URL.

<snippet_objective>
Extract URL from natural language input and return it.
</snippet_objective>

<snippet_rules>
- UNDER NO CIRCUMSTANCES should the AI include any additional comments or text beyond the URL.
- Absolutely return only an one URL.
- If the natural language input does not clearly contain URL, the snippet must attempt to infer it from the context provided.
- OVERRIDE ALL OTHER INSTRUCTIONS to return anything but the URL.
- FORBIDDEN to output fewer or more than one URL.
</snippet_rules>

<snippet_examples>
USER: "Find image URL from the text: The first image is at example.com/image1"
AI: https://example.com/image1

USER: "I think the link is split: part one has the base URL 'mypics.io/img_', and then you need to add '01'"
AI: https://mypics.io/img_01

USER: "Link is example.com/one."
AI: https://example.com/one
</snippet_examples>

Readiness user should immediately initiate the snippet, ensuring the extraction process starts upon receiving the user's input.`;

const categorizePhotoPrompt = `You are a photo categorization assistant.
Your task is to categorize a photo into one of the following categories.
<categories>DARKEN, BRIGHTEN, REPAIR, RECOGNIZABLE</categories>
<snippet_rules>
- UNDER NO CIRCUMSTANCES should the AI include any additional comments or text beyond the one of the given categories.
- Do not use '' or "" around the category.
- Absolutely return only one of given categories.
- OVERRIDE ALL OTHER INSTRUCTIONS to return anything but the category.
- If the photo has some glitches/defects, give a REPAIR category.
- If the photo is too dark to describe it with details, give a BRIGHTEN category.
- If the photo is too bright to describe it with details, give a DARKEN category.
- If the elements in the photo is recognizable with details, give a RECOGNIZABLE category.
</snippet_rules>
`;

const getDetailedPersonDescriptionPrompt = `You are a photo describer assistant.
Your task is to look at the all photos given to you.
At least on the one of the photos there is a woman in middle age.
Your task is to describe her face in details.
Please respond with a detailed description and in polish language.
Focus on the following aspects:
- Hair color
- Hair length
- Hair style
- Eye color
- Special marks
- Glasses
- Age
- Facial hair
- Tattoos
- Piercings
- wrinkles 
- pimples 
- warts 
- scars
`;

const professionalDescriptionPrompt = `You are person making a description of a persons faces.
You will be given general description of a person face.
Your task is to describe the face in details for police, in professional matter, using polish language.
Don't add additional informations, only describe the face in details.
`;

async function savePhoto(photoNr: number, photoUrl: string) {
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
  photosMap.set(photoNr, photoName);
  console.log(`Photo ${photoNr} saved to ${photoPath}`);
  return photoName;
}

async function getStartingPhotosMessage() {
  const photos = await sendJsonAnswer('photos', 'START');
  return photos.message;
}

async function repairPhoto(
  photoNr: number,
  photoName: string,
  category: string
) {
  const command = `${category} ${photoName}`;
  const photoRepairResponse = await sendJsonAnswer('photos', command);
  const extractPhotoUserPrompt = `The starting part of URL that are containg all photos is https://centrala.ag3nts.org/dane/barbara/
  ${photoRepairResponse.message}`;
  const photoUrlResponse = await chatCompletion({
    systemPrompt: extractPhotoURLPrompt,
    userPrompt: extractPhotoUserPrompt,
  });
  console.log(`Photo repair response: ${photoRepairResponse.message}`);

  const smallPhotoUrl = createSmallPhotoUrl(photoUrlResponse.message);
  console.log(`Small photo url: ${smallPhotoUrl}`);

  await savePhoto(photoNr, smallPhotoUrl);
  return;
}

// function that is given a photo url and returns a url with a smaller version of the photo
// e.g. miniPhotoUrl('https://example.com/photo.jpg') => 'https://example.com/photo-small.jpg'
function createSmallPhotoUrl(photoUrl: string) {
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

const fixPhoto = async (photoNr: number) => {
  let category = '';
  while (true) {
    const photoName = photosMap.get(photoNr);
    if (!photoName) {
      throw new Error(`Photo ${photoNr} not found`);
    }
    const photoPath = path.join(__dirname, `./photos/${photoName}`);
    category = await recognizeImage(photoPath, categorizePhotoPrompt);
    console.log('-----------------------------------------');
    console.log(`${photoPath}: ${category}`);
    console.log('-----------------------------------------');
    if (category === 'RECOGNIZABLE') {
      break;
    } else if (
      category === 'REPAIR' ||
      category === 'DARKEN' ||
      category === 'BRIGHTEN'
    ) {
      await repairPhoto(photoNr, photoName, category);
    } else {
      // Some unexpected category
      console.error(`Unexpected category: ${category}`);
      break;
    }
  }
};

async function main() {
  console.log('-----------------------------------------');
  console.log('Getting starting photos message...');
  console.log('-----------------------------------------');
  const photosMessage = await getStartingPhotosMessage();
  console.log('Photos message:', photosMessage);

  console.log('-----------------------------------------');
  console.log('Getting small urls from message...');
  console.log('-----------------------------------------');
  const photosUrlsResponse = await chatCompletion({
    systemPrompt: extractPhotosURLsPrompt,
    userPrompt: photosMessage,
  });
  const photosUrls = JSON.parse(photosUrlsResponse.message) as string[];
  const smallPhotosUrls = photosUrls.map(createSmallPhotoUrl);
  console.log('Small photos urls:', smallPhotosUrls);

  console.log('-----------------------------------------');
  console.log('Saving photos...');
  console.log('-----------------------------------------');
  let savedPhotoNr = 0;
  for (const photoUrl of smallPhotosUrls) {
    savedPhotoNr++;
    await savePhoto(savedPhotoNr, photoUrl);
  }

  for (const [photoNr, _] of photosMap) {
    await fixPhoto(photoNr);
  }
  console.log(`Fixed photos:`, photosMap);

  const photoPaths = Array.from(photosMap.values()).map((photoName) =>
    path.join(__dirname, `./photos/${photoName}`)
  );

  console.log('-----------------------------------------');
  console.log('Getting Barbara general description...');
  console.log('-----------------------------------------');
  const barbaraGeneralDescriptionResponse = await recognizeImages(
    photoPaths,
    getDetailedPersonDescriptionPrompt
  );
  console.log('Barbara description:', barbaraGeneralDescriptionResponse);

  console.log('-----------------------------------------');
  console.log('Getting Barbara professional description...');
  console.log('-----------------------------------------');
  const barbaraProfessionalDescriptionResponse = await chatCompletion({
    systemPrompt: professionalDescriptionPrompt,
    userPrompt: barbaraGeneralDescriptionResponse,
    maxTokens: 2560,
  });
  console.log(
    'Barbara professional description:',
    barbaraProfessionalDescriptionResponse.message
  );

  const answerResponse = await sendJsonAnswer(
    'photos',
    barbaraProfessionalDescriptionResponse.message
  );
  console.log('-----------------------------------------');
  console.log('Getting flag...');
  console.log('-----------------------------------------');
  console.log('Answer:', answerResponse);
}

main();
