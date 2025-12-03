'use server';
/**
 * @fileOverview This file defines a Genkit flow to monitor the status of a Gemini model fine-tuning job.
 *
 * - monitorFineTuningStatus - A function that initiates the monitoring flow.
 * - MonitorFineTuningStatusInput - The input type for the monitorFineTuningStatus function.
 * - MonitorFineTuningStatusOutput - The return type for the monitorFineTuningStatus function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const MonitorFineTuningStatusInputSchema = z.object({
  modelId: z.string().describe('The ID of the fine-tuning job (operation name).'),
});
export type MonitorFineTuningStatusInput = z.infer<typeof MonitorFineTuningStatusInputSchema>;

const MonitorFineTuningStatusOutputSchema = z.object({
  status: z.string().describe('The status of the fine-tuning job.'),
  tunedModelName: z.string().optional().describe('The name of the tuned model if completed.'),
});
export type MonitorFineTuningStatusOutput = z.infer<typeof MonitorFineTuningStatusOutputSchema>;

export async function monitorFineTuningStatus(input: MonitorFineTuningStatusInput): Promise<MonitorFineTuningStatusOutput> {
  return monitorFineTuningStatusFlow(input);
}

const monitorFineTuningStatusFlow = ai.defineFlow(
  {
    name: 'monitorFineTuningStatusFlow',
    inputSchema: MonitorFineTuningStatusInputSchema,
    outputSchema: MonitorFineTuningStatusOutputSchema,
  },
  async input => {
    const operation = await googleAI.client().getOperation(input.modelId);

    if (operation.error) {
      return {status: `FAILED: ${operation.error.message}`};
    }
    if (operation.done) {
       // @ts-ignore - response is not strongly typed in the SDK yet
       const tunedModelName = operation.response?.tunedModel;
      return {
        status: `SUCCEEDED`,
        tunedModelName: tunedModelName,
      };
    }
    
    // @ts-ignore - metadata is not strongly typed in the SDK yet
    const state = operation.metadata?.state || 'STATE_UNSPECIFIED';

    return {status: state};
  }
);
