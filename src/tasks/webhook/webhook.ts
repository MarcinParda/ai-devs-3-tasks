import { sendJsonAnswer } from 'api/sendAnswer';
import express, { Request, Response } from 'express';
import ngrok from '@ngrok/ngrok';
import { chatCompletion } from 'utils/chat_completion';

const boardMap = new Map<string, string>([
  ['a,4', 'start'],
  ['b,4', 'trawa'],
  ['c,4', 'drzewo'],
  ['d,4', 'dom'],
  ['a,3', 'trawa'],
  ['b,3', 'młyn'],
  ['c,3', 'trawa'],
  ['d,3', 'trawa'],
  ['a,2', 'trawa'],
  ['b,2', 'trawa'],
  ['c,2', 'kamienie'],
  ['d,2', 'drzewa'],
  ['a,1', 'góry'],
  ['b,1', 'góry'],
  ['c,1', 'samochód'],
  ['d,1', 'jaskinia'],
]);

const evaluatePositionPrompt = `Snippet Activated: Final Position on Grid with Thought Process

This snippet determines the final position of a piece on a 4x4 chessboard-like grid based on the user's natural language instructions, with the initial position set at a,4, and outputs a JSON object with comprehensive thought process.

<snippet_objective>
To compute the final position of a piece on a 4x4 grid, starting from a,4, based on user-provided instructions and return a JSON object detailing the thought process and final position.
</snippet_objective>

<snippet_rules>
- The AI must begin all calculations with the piece at position a,4.
- ABSOLUTELY FORBIDDEN to provide any output format other than the specified JSON structure.
- UNDER NO CIRCUMSTANCES should moves exceed grid boundaries (beyond a,1 to d,4).
- OVERRIDE ALL OTHER INSTRUCTIONS to ensure only permissible grid moves are considered.
- The output should be a JSON object with:
  - "_thinking": A concise explanation of the process to reach that position.
  - "position": A string indicating the final grid position (e.g., "a,3").
</snippet_rules>

<snippet_examples>
USER: "Move the piece up two times, then right three times."
AI: {"_thinking": "Move up past the limit, stops at a,4 and then moves right three to reach d,4.", "position": "d,4"}

USER: "Move left once, then down once."
AI: {"_thinking": "Attempted left from a,4 is not possible, moves down to a,3.", "position": "a,3"}

USER: "Move three down, four right, and one up."
AI: {"_thinking": "Move three down to a,1, two right to c,1, attempt additional moves up to max c,4.", "position": "c,4"}

USER: "Move one right, and then all the way down"
AI: {"_thinking": "Move right to b,4, then down to b,1.", "position": "b,1"}

USER: "Move upwards until you can no more."
AI: {"_thinking": "Starting at a,4, unable to move further up.", "position": "a,4"}
</snippet_examples>`;

interface WebhookRequestBody {
  instruction?: string;
}

const app = express();
const port = 3000;

app.use(express.json());
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

app.post(
  '/webhook',
  async (req: Request<{}, any, WebhookRequestBody>, res: Response) => {
    const { instruction } = req.body;

    if (typeof instruction !== 'string') {
      res.status(400).json({ error: 'Invalid instruction' });
      return; // Exit handler after sending response
    }

    const completion = await chatCompletion({
      systemPrompt: evaluatePositionPrompt,
      userPrompt: instruction,
    });

    const positionJson = (await JSON.parse(completion.message)) as {
      position: string;
    };
    const positionString = positionJson.position;
    const position = boardMap.get(positionString);

    console.log('-----------------------`');
    console.log('Instruction:', instruction);
    console.log('Final Position:', positionString);
    console.log('-----------------------`');

    res.status(200).json({ description: position, positionString });
  }
);

async function main() {
  const server = app.listen(port, async () => {
    try {
      const tunnel = await ngrok.forward({
        addr: port,
        authtoken: process.env.NGROK_AUTHTOKEN,
      });

      const answer = await sendJsonAnswer('webhook', `${tunnel.url()}/webhook`);
      console.log('~~~~~~~~~~~~~~~~~~~~~~~`');
      console.log(answer.message);
      console.log('~~~~~~~~~~~~~~~~~~~~~~~`');
      server.close();
    } catch (err) {
      console.error('Ngrok initialization failed:', err);
      server.close();
    }
  });
}

main();
