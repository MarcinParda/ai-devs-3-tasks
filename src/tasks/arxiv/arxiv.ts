import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import fs from 'fs';
import { generateDetailedSummary } from '../../utils/summary/app';

async function fetchArticleAsMarkdown() {
  async function fetchHtml(url: string): Promise<string> {
    const response = await fetch(url);
    const data = await response.text();
    return data;
  }

  function convertHtmlToMarkdown(html: string): string {
    const dom = new JSDOM(html);
    const turndownService = new TurndownService();
    return turndownService.turndown(dom.window.document.body.innerHTML);
  }

  async function main() {
    const url = 'https://centrala.ag3nts.org/dane/arxiv-draft.html';
    const html = await fetchHtml(url);
    const markdown = convertHtmlToMarkdown(html);
    console.log(markdown);
    fs.writeFileSync('./article.md', markdown);
  }

  main();
}

async function createSummary() {
  // load article from ./article.md
  generateDetailedSummary().catch((error) =>
    console.error('Error in summary generation:', error)
  );
}

createSummary();
