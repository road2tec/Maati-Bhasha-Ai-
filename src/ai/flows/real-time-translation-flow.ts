'use server';
/**
 * @fileOverview Implements real-time Marathi dialect translation using a combination of rule-based transformations and Gemini API for refinement.
 *
 * - realTimeTranslation - Main function to translate standard Marathi to a selected dialect in real-time.
 * - RealTimeTranslationInput - Input type for the realTimeTranslation function.
 * - RealTimeTranslationOutput - Return type for the realTimeTranslation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { dialects } from '@/lib/languages';

const dialectValues = dialects.map(d => d.value) as [string, ...string[]];

const RealTimeTranslationInputSchema = z.object({
  text: z.string().describe('The standard Marathi text to translate.'),
  dialect: z
    .enum(dialectValues)
    .describe('The target Marathi dialect.'),
});
export type RealTimeTranslationInput = z.infer<typeof RealTimeTranslationInputSchema>;

const RealTimeTranslationOutputSchema = z.object({
  dialect: z.string().describe('The target dialect.'),
  translated: z.string().describe('The translated sentence in the specified dialect.'),
  confidence: z.number().describe('A confidence score from 0.00 to 1.00.'),
});
export type RealTimeTranslationOutput = z.infer<typeof RealTimeTranslationOutputSchema>;

export async function realTimeTranslation(input: RealTimeTranslationInput): Promise<RealTimeTranslationOutput> {
  return realTimeTranslationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'realTimeTranslationPrompt',
  input: {schema: RealTimeTranslationInputSchema},
  output: {schema: RealTimeTranslationOutputSchema},
  prompt: `You are a Marathi Dialect Conversion Engine trained for:
1. Standard Marathi (Praman Bhasha)
2. Pune Marathi
3. Mumbai Marathi
4. Nagpur Marathi (Varhadi)
5. Kolhapur Marathi
6. Ahirani (Khandesh)
7. Malvani (Konkan)
8. Agri (Raigad/Thane)
9. Warli (Tribal)
10. Thanjavur Marathi
11. Koli (Fisherfolk Dialect)
12. Solapuri
13. Marathwada Marathi
14. Belgaum Marathi
15. Dangii
16. Pawra
17. Gondi

PRIMARY OBJECTIVE: Convert Standard Marathi to the target dialect with 100% meaning retention.

STRICT RULES:
- Never change named entities.
- Never invent words.
- Always follow dialect grammar.
- Tone must match dialect.

FEW-SHOT EXAMPLES:
INPUT: "तू काय करते आहेस?" (TARGET: Nagpur) → OUTPUT: "तू का करून राहिली?"
INPUT: "तुला माझी आठवण येते का?" (TARGET: Malvani) → OUTPUT: "तुकां माका आठवन आसां का गो?"
INPUT: "आज बाजारात जायचे आहे." (TARGET: Ahirani) → OUTPUT: "आज बाजरात जायची शे."
INPUT: "तू काय बोलतेस?" (TARGET: Kolhapur) → OUTPUT: "काय बोल्लीस?"

Convert the following Standard Marathi sentence to the selected dialect.

Sentence: {{text}}
Dialect: {{dialect}}

Return only JSON.
`,
});


const realTimeTranslationFlow = ai.defineFlow(
  {
    name: 'realTimeTranslationFlow',
    inputSchema: RealTimeTranslationInputSchema,
    outputSchema: RealTimeTranslationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Translation failed to produce an output.");
    }
    return output;
  }
);
