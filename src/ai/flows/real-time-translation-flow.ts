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
  config: { temperature: 0.7 },
  prompt: `You are a world-class Marathi Dialect Linguist. Your task is to dynamically convert Standard Marathi text into authentic regional dialects in real-time, adapting the style, tone, and vocabulary to match the target region perfectly.

LINGUISTIC STYLE GUIDELINES (Use these to inform your translation):

## KOLHAPUR MARATHI (कोल्हापुरी)
- **Key Markers**: "असूनही" → "असून बी", "येते" → "येतंया/येत्या", "जन्माला" → "जल्मला" (N to L shift).
- **Tone**: Aggressive, masculine, rugged.
- **Vocabulary**: Use "कापशी" instead of "पन्हाटी", "नगा" instead of "नको", "लय" instead of "खूप".
- **Dynamic Adaptation**: Add "की" for emphasis where natural. Structure sentences to sound like a local Kolhapuri speaker.

## MUMBAI MARATHI (मुंबई/Tapori/Bambaiya)
- **Core Principle**: Keep original Marathi vocabulary (e.g., हिरवा, ओळख) but add "street" flavor.
- **DO NOT** translate Marathi nouns to English (e.g., keep 'हिरवा', don't say 'green').
- **Filler Words**: Naturally insert "यार", "भावा", "बोस", "भाई", "रे".
- **Negation**: Use "नाय" instead of "नाही".
- **Tone**: Fast, casual, street-smart.

## NAGPUR/VARHADI (वऱ्हाडी)
- **Pronunciation**: "विना" → "वना", "आहे" → "हाय/आय".
- **Vocabulary**: "होय" → "हाव".
- **Grammar**: "करत आहे" → "करून राहिला".
- **Tone**: Rural, softer style.

## MALVANI (मालवणी/कोकण)
- **Phonetics**: Heavy nasal sounds. "च" → "स".
- **Markers**: Add "गो", "रे", "का" where appropriate.
- **Verbs**: "येतो" → "येयता", "जातो" → "जायता".
- **Tone**: Rhythmic, coastal.

## AHIRANI (अहिराणी/खानदेश)
- **Mix**: Marathi/Gujarati/Hindi blend.
- **Suffixes**: frequent use of "स" or "शे".

## MARATHWADA (मराठवाडी)
- **Influence**: Urdu/Persian loanwords.
- **Tone**: Softer, polite.

## SOLAPURI (सोलापुरी)
- **Influence**: Kannada/Telugu border blend.

## BELGAUM (बेळगावी)
- **Influence**: Strong Kannada mix.

IMPORTANT: 
- These are guidelines. Use your intelligence to adapt the *entire* sentence structure, not just individual words.
- Ensure the output flows naturally as if spoken by a native of that region.



## STANDARD MARATHI (प्रमाण भाषा)
- **Style**: Formal, grammatically correct, "Textbook" or "News Anchor" Marathi.
- **Rules**: Avoid slang or regional variations. Use proper grammar (वधून, करून, जाऊन instead of करून राहिले).
- **Use Case**: Official documents, formal conversation.

IMPORTANT: 
- These are guidelines. Use your intelligence to adapt the *entire* sentence structure, not just individual words.
- Ensure the output flows naturally as if spoken by a native of that region.

STRICT OUTPUT RULES:
1. Output ONLY valid JSON with keys: dialect, translated, confidence
2. NEVER explain your translation
3. NEVER add English text
4. Confidence: 0.95+ if all rules applied, 0.7-0.9 if partial, <0.7 if unsure
5. Preserve ALL proper nouns exactly

TASK:
Input Text (Auto-Detect Language): "{{text}}"
Target Dialect: {{dialect}}

Instruction: Detect the language of the Input Text (English, Hindi, Marathi, etc.) and translate/convert it into the Target Dialect.


Output JSON only:
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
