import { sendJsonAnswer } from '../../api/sendAnswer';
import { chatComplition } from '../../utils/chat_complition';
import { tasksApiKey } from '../../utils/envs';
import { generateImages } from '../../utils/images_generation';

async function main() {
  const robotDescriptionUrl = `https://centrala.ag3nts.org/data/${tasksApiKey}/robotid.json`;
  // fetch the image description
  const robotDescriptionResponse = await fetch(robotDescriptionUrl);
  const robotDescription = (await robotDescriptionResponse.json()) as {
    description: string;
  };

  const dalleUserPrompt = await chatComplition({
    systemPrompt: `Your will be given a testimony about a robot. You have to write a prompt for AI graphic models so they can draw described robot.`,
    userPrompt: robotDescription.description,
  });

  console.log(dalleUserPrompt.message);
  const images = await generateImages(dalleUserPrompt.message);
  console.log(images);
  const response = await sendJsonAnswer('robotid', images[0]);
  console.log(response);
}

main();
