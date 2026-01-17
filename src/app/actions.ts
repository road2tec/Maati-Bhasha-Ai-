
'use server';

import { z } from 'zod';
import { realTimeTranslation } from '@/ai/flows/real-time-translation-flow';
import { applyRules } from '@/lib/rules';
import { dialects } from '@/lib/languages';
import { chatbot } from '@/ai/flows/chatbot-flow';

const dialectValues = dialects.map(d => d.value) as [string, ...string[]];

const translateSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty.'),
  dialect: z.enum(dialectValues),
});

export async function translateAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = translateSchema.safeParse({
      text: formData.get('text'),
      dialect: formData.get('dialect'),
    });

    if (!validatedFields.success) {
      return {
        type: 'error' as const,
        message: 'Invalid input.',
        errors: validatedFields.error.flatten().fieldErrors,
        translatedText: '',
        appliedRules: [],
        confidence: 0,
      };
    }

    const { text, dialect } = validatedFields.data;

    // if (dialect === 'standard') block removed to allow AI translation for Standard Marathi


    // 1. Apply rule-based transformations
    const { transformedText: ruleBasedText, appliedRules } = applyRules(text, dialect);

    // 2. Refine with Gemini using the real-time flow
    const result = await realTimeTranslation({
      text: ruleBasedText,
      dialect: dialect,
    });

    return {
      type: 'success' as const,
      message: 'Translation successful.',
      translatedText: result.translated,
      appliedRules: appliedRules,
      confidence: result.confidence,
    };
  } catch (error) {
    console.error('Translation error:', error);
    return {
      type: 'error' as const,
      message: 'An unexpected error occurred during translation.',
      translatedText: '',
      appliedRules: [],
      confidence: 0,
    };
  }
}

const chatbotSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

export async function chatbotAction(message: string) {
  try {
    const validatedFields = chatbotSchema.safeParse({ message });

    if (!validatedFields.success) {
      return {
        type: 'error' as const,
        message: 'Invalid input.',
      };
    }

    const { message: userMessage } = validatedFields.data;
    const result = await chatbot({ message: userMessage });

    return {
      type: 'success' as const,
      message: result.response,
    };

  } catch (error) {
    console.error('Chatbot error:', error);
    return {
      type: 'error' as const,
      message: 'An unexpected error occurred.',
    };
  }
}
