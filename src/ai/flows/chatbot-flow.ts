'use server';
/**
 * @fileOverview A context-aware chatbot flow for the MaatiBhasha AI application.
 *
 * - chatbot - A function that handles the chatbot conversation.
 * - ChatbotInput - The input type for the chatbot function.
 * - ChatbotOutput - The return type for the chatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotInputSchema = z.object({
  message: z.string().describe("The user's message to the chatbot."),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  response: z.string().describe("The chatbot's response to the user."),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function chatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: { schema: ChatbotInputSchema },
  output: { schema: ChatbotOutputSchema },
  prompt: `You are a helpful assistant for the MaatiBhasha AI application.
Your name is 'Maati Mitra'.
Your purpose is to answer questions about the MaatiBhasha AI application, its features, and how to use it.
The application is a Marathi dialect translation system. It can translate from Standard Marathi to various regional dialects.
The supported dialects include: Pune, Mumbai, Nagpur (Varhadi), Kolhapur, Ahirani, Malvani, Agri, Warli, Thanjavur, Koli, Solapuri, Marathwada, Belgaum, Dangii, Pawra, and Gondi.
Users can register, log in, and use the translator. There is also an admin panel for user management.

STRICT RULES:
- Only answer questions related to the MaatiBhasha AI application.
- If the user asks a question that is not about the application, politely decline and state that you can only answer questions about MaatiBhasha AI.
- Do not engage in general conversation.
- Keep your answers concise and helpful.

User's question: "{{message}}"
`,
});


const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Chatbot failed to produce an output.");
    }
    return output;
  }
);
