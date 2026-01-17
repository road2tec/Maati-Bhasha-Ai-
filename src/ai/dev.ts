'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/real-time-translation-flow.ts';
import '@/ai/flows/chatbot-flow.ts';
