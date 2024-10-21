export async function fetchTextFromURL(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
  }
  const text = await response.text();
  return text;
}
