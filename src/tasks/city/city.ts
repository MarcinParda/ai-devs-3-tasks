import * as path from 'path';
import { recognizeImage as askAboutImage } from '../../utils/image_processing';
import { chatComplition } from '../../utils/chat_complition';

async function main() {
  let mapDescriptions = ``;
  const mapPicturesPaths = [
    path.join(__dirname, './map/city1.png'),
    path.join(__dirname, './map/city2.png'),
    path.join(__dirname, './map/city3.png'),
    path.join(__dirname, './map/city4.png'),
  ];

  for (const [index, mapPicturePath] of mapPicturesPaths.entries()) {
    const description = await askAboutImage(
      mapPicturePath,
      'List out the names of the streets, places and the buildings in this map.'
    );
    mapDescriptions += `Map nr ${index + 1} has on it: ${description}\n\n`;
  }
  console.log(mapDescriptions);
  const response = await chatComplition({
    systemPrompt: `You have been given 4 descriptions of what maps are containing. 3 of these descriptions are from the same polish city that has is famous from granaries and fortresses. One is about a different city, so ignore that one. Find the name of polish city described in this 3 correct maps.  Relax, you have time to think. Think out load and tell me what you see in the maps, but in the end guess the city name even if you are not 100% sure.`,
    userPrompt: mapDescriptions,
  });

  console.log(response.message);
}

main();
