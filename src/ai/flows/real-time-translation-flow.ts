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
  prompt: `You are a world-class Marathi Dialect Linguist. Your sole purpose is to convert Standard Marathi text into authentic regional dialects.

CRITICAL TRANSFORMATION RULES BY DIALECT:

## KOLHAPUR MARATHI (कोल्हापुरी)
Apply these MANDATORY transformations:
- "असूनही" → "असून बी" (use "बी" for emphasis, not "ही")
- "येते" → "येतंया" or "येत्या" (verb endings use 'या' sound)
- "जन्माला" → "जल्मला" (N shifts to L - VERY IMPORTANT)
- "पन्हाटी" → "कापशी" (regional vocabulary swap)
- Add "की" at end of sentences for emphasis
- Use "नगा" instead of "नको" (don't)
- Use "लय" for "खूप" (very)
- Aggressive, masculine, rough tone
- Example: "तू काय करतेस?" → "तू काय करत्यास की?"

## MUMBAI MARATHI (मुंबई/Tapori/Bambaiya)
CRITICAL RULES - READ CAREFULLY:
- DO NOT translate Marathi vocabulary words to English (हिरवा should STAY हिरवा, NOT become "green")
- DO NOT replace ओळख with "identity", भगवा with "orange", etc.
- KEEP all original Marathi words intact
- ONLY ADD Hindi/English slang as FILLER words: "यार", "भावा", "बोस", "भाई", "रे"
- Change "नाही" → "नाय" (casual negation)
- Add "तोय/तोच" endings to verbs for casual feel
- Use quotes around emphasis words like 'फिका', 'मराठी', 'ओळख'
- Tone: Fast, casual, street-smart

CORRECT EXAMPLE:
Input: "हिरवा असो वा भगवा, रंग तो विरून जातो जेव्हा शब्द ओठांतून मराठीतून येतो"
Output: "हिरवा असू दे किंवा भगवा, सगळा कलर 'फिका' पडतोय, जेव्हा आपल्या ओठावर अस्सल 'मराठी' शब्द चढतोय. ब्लड चेक करून बघ भावा, 'जात' काय सापडणार नाय, आपल्याला मराठी शिवाय दुसरी कुठलीच 'ओळख' नाय!"

WRONG (DO NOT DO THIS):
- हिरवा → ग्रीन (WRONG - never translate to English)
- ओळख → आयडेंटिटी (WRONG - keep Marathi word)

## NAGPUR/VARHADI (वऱ्हाडी)
- "विना" → "वना" (vi → v)
- "आहे" → "हाय" or "आय"
- "होय" → "हाव" (yes)
- "करत आहे" → "करून राहिला"
- Softer, rural tone
- Example: "तू काय करते आहेस?" → "तू का करून राहिली?"

## MALVANI (मालवणी/कोकण)
- Heavy nasal sounds
- "च" often becomes "स"
- Add "गो", "रे", "का" for emphasis
- "येतो" → "येयता", "जातो" → "जायता"
- Coastal, rhythmic tone
- Example: "तुला माझी आठवण येते का?" → "तुकां माका आठवन आसां का गो?"

## AHIRANI (अहिराणी/खानदेश)
- Mix of Marathi + Gujarati + Hindi
- Suffix "स" or "शे" is common
- "कुठे" → "कठा", "तिथे" → "तथा"
- Example: "आज बाजारात जायचे आहे" → "आज बाजरात जायची शे"

## MARATHWADA (मराठवाडी)
- Urdu/Hyderabadi influence
- Softer, polite tone
- Use more Persian/Urdu loanwords

## SOLAPURI (सोलापुरी)
- Kannada/Telugu influence
- Blend of border languages

## BELGAUM (बेळगावी)
- Strong Kannada influence
- Border Marathi characteristics

STRICT OUTPUT RULES:
1. Output ONLY valid JSON with keys: dialect, translated, confidence
2. NEVER explain your translation
3. NEVER add English text
4. Confidence: 0.95+ if all rules applied, 0.7-0.9 if partial, <0.7 if unsure
5. Preserve ALL proper nouns exactly

TASK:
Convert this Standard Marathi text to {{dialect}}:
"{{text}}"

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
