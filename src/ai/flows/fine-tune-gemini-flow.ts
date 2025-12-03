'use server';

/**
 * @fileOverview A Genkit flow for fine-tuning a Gemini model using a JSONL dataset.
 *
 * - fineTuneGeminiModel - A function that handles the fine-tuning process.
 * - FineTuneGeminiModelInput - The input type for the fineTuneGeminiModel function.
 * - FineTuneGeminiModelOutput - The return type for the fineTuneGeminiModel function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const FineTuneGeminiModelInputSchema = z.object({
  dataset: z.string().describe('The training dataset in JSONL format.'),
});
export type FineTuneGeminiModelInput = z.infer<typeof FineTuneGeminiModelInputSchema>;

const FineTuneGeminiModelOutputSchema = z.object({
  modelId: z.string().describe('The ID of the fine-tuned model.'),
});
export type FineTuneGeminiModelOutput = z.infer<typeof FineTuneGeminiModelOutputSchema>;

export async function fineTuneGeminiModel(input: FineTuneGeminiModelInput): Promise<FineTuneGeminiModelOutput> {
  return fineTuneGeminiModelFlow(input);
}

const fineTuneGeminiModelFlow = ai.defineFlow(
  {
    name: 'fineTuneGeminiModelFlow',
    inputSchema: FineTuneGeminiModelInputSchema,
    outputSchema: FineTuneGeminiModelOutputSchema,
  },
  async input => {
    const trainingData = input.dataset;

    const parts = trainingData
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        try {
          const parsed = JSON.parse(line);
          return {
            text: `Convert the following Standard Marathi sentence to the selected dialect.\n\nSentence: ${parsed.input}\nDialect: ${parsed.dialect}\n\nReturn only JSON.`,
          };
        } catch (e) {
          console.error('Failed to parse line:', line);
          return null;
        }
      })
      .filter(part => part !== null);

    if (parts.length === 0) {
      throw new Error('No valid training data could be parsed from the dataset.');
    }

    const job = await googleAI.tuneModel({
      model: 'gemini-1.5-flash-latest',
      trainingData: {
        examples: {
          output: {
            text: '{"dialect": "kolhapuri", "translated": "काय बोल्लीस?", "confidence": 0.95}',
          },
          input: parts as any,
        },
      },
      hyperparameters: {
        epochCount: 5, // Example hyperparameter
      },
    });

    if (!job.name) {
      throw new Error('Failed to get job name from fine-tuning operation.');
    }

    return {modelId: job.name};
  }
);
