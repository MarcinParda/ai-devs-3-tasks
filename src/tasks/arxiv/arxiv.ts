import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import fs from 'fs';
import { join } from 'path';
import { generateDetailedSummary } from './generateDetailedSummary';
import { sendJsonAnswer } from '../../api/sendAnswer';

// async function fetchArticleAsMarkdown() {
//   async function fetchHtml(url: string): Promise<string> {
//     const response = await fetch(url);
//     const data = await response.text();
//     return data;
//   }

//   function convertHtmlToMarkdown(html: string): string {
//     const dom = new JSDOM(html);
//     const turndownService = new TurndownService();
//     return turndownService.turndown(dom.window.document.body.innerHTML);
//   }

//   async function main() {
//     const url = 'https://centrala.ag3nts.org/dane/arxiv-draft.html';
//     const html = await fetchHtml(url);
//     const markdown = convertHtmlToMarkdown(html);
//     console.log(markdown);
//     fs.writeFileSync('./article.md', markdown);
//   }

//   main();
// }

// async function createSummary() {
//   generateDetailedSummary('arvix').catch((error) =>
//     console.error('Error in summary generation:', error)
//   );
// }

// createSummary();

async function main() {
  const answer = {
    '01': 'Truskawki były używane podczas badań.',
    '02': 'Fotografia jest z Krakowa',
    '03': 'Bomba chciał znaleźć hotel.',
    '04': 'Pizzy',
    '05': 'Od książki o tytule Brave new world',
  };
  const response = await sendJsonAnswer('arxiv', answer);
  console.log(response);
}
main();
