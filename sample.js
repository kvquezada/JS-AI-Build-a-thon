import dotenv from 'dotenv';
dotenv.config();

import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';
import { readFileSync } from 'fs';

const token = process.env['GITHUB_TOKEN'];
const endpoint = 'https://models.github.ai/inference';
const model = 'openai/gpt-4.1-mini';

export async function main() {
  const client = ModelClient(endpoint, new AzureKeyCredential(token));

  const imageBuffer = readFileSync('contoso_layout_sketch.jpg');
  const base64Image = imageBuffer.toString('base64');

  const response = await client.path('/chat/completions').post({
    body: {
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Write HTML and CSS code for a web page based on the following hand-drawn sketch.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      temperature: 1.0,
      top_p: 1.0,
      model: model,
    },
  });

  if (isUnexpected(response)) {
    throw response.body.error;
  }

  console.log(response.body.choices[0].message.content);
}

main().catch((err) => {
  console.error('The sample encountered an error:', err);
});
