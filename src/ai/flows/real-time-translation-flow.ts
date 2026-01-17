'use server';
/**
 * @fileOverview Implements real-time Marathi dialect translation using a combination of rule-based transformations and Gemini API for refinement.
 *
 * - realTimeTranslation - Main function to translate standard Marathi to a selected dialect in real-time.
 * - RealTimeTranslationInput - Input type for the realTimeTranslation function.
 * - RealTimeTranslationOutput - Return type for the realTimeTranslation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
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
  input: { schema: RealTimeTranslationInputSchema },
  output: { schema: RealTimeTranslationOutputSchema },
  prompt: `You are a Marathi Dialect Conversion Engine trained for 17 specific dialects.

ROLE:
You are an expert linguist specializing in Maharashtrian dialects. Your task is to convert "Standard Marathi" (Praman Bhasha) text into a specific target dialect while preserving 100% of the original meaning.

DIALECT DEFINITIONS & RULES:
1. Pune Marathi: Standard, formal, "Puneri" style. Often sarcastic or direct.
2. Mumbai Marathi: Cosmopolitan, mixes Hindi/English slang (Bambaiya), fast-paced.
3. Nagpur Marathi (Varhadi): Uses "v" instead of "vi", "n" instead of "ṇ". Words like "hau" (yes), "karon rahila".
4. Kolhapur Marathi: Aggressive, masculine tone. Uses "lay" (very), "navha" (isn't it). Verbs end in 's' often dropped or changed.
5. Ahirani (Khandesh): Mix of Marathi, Gujarati, Hindi. Suffix "s" or "she" is common. "Katha" (where), "tatha" (there).
6. Malvani (Konkan): Uses "ka", "go", "re". "Ch" often becomes "s". Nasal sounds. "Yeyta" (coming), "jayta" (going).
7. Agri (Raigad/Thane): Rough, coastal dialect. "L" becomes "L" (hard).
8. Warli (Tribal): Simple grammar, specific vocabulary found in Palghar district.
9. Thanjavur Marathi: Old Marathi mixed with Tamil influence. Archaic grammar.
10. Koli (Fisherfolk): Similar to Agri/Malvani but distinct.
11. Solapuri: Mix of Marathi and Kannada/Telugu influence.
12. Marathwada: Influence of Urdu/Hyderabadi. Softer tone.
13. Belgaum: Strong Kannada influence (border Marathi).
14. Dangii: Tribal dialect near Gujarat border.
15. Pawra: Tribal dialect.
16. Gondi: Tribal language influence (Vidarbha).

STRICT OUTPUT RULES:
- Never change proper nouns (Names, Places, Brands).
- Do not add explanations.
- Output valid JSON only.
- Confidence score must reflect how "pure" the dialect conversion is.

FEW-SHOT EXAMPLES:

INPUT: "तू काय करते आहेस?"
- Target: Nagpur -> "तू का करून राहिली?"
- Target: Malvani -> "तू काय करतास?"
- Target: Kolhapur -> "तू काय कराल्लीस?"
- Target: Solapuri -> "तू काय करायलायस?"

INPUT: "मला हे आवडले नाही."
- Target: Ahirani -> "मले हाई नी आवडं."
- Target: Agri -> "मला यो नाय आवडला."
- Target: Mumbai -> "मला हे नाय आवडलं."

INPUT: "इकडे या."
- Target: Pune -> "इकडे या."
- Target: Kolhapur -> "हिकडं ये की."
- Target: Malvani -> "हय ये."

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
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Translation failed to produce an output.");
    }
    return output;
  }
);
