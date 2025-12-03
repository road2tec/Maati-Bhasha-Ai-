'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, LoaderCircle, Send, X, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import ChatbotFab from './chatbot-fab';
import { chatbotAction } from '@/app/actions';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await chatbotAction(inputValue);
      let botMessageText = 'Sorry, something went wrong.';
      if (result.type === 'success') {
        botMessageText = result.message;
      } else if (result.message) {
        botMessageText = result.message;
      }
      
      const botMessage: Message = { sender: 'bot', text: botMessageText };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { sender: 'bot', text: 'Failed to get a response. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ChatbotFab onClick={toggleChat} />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-28 right-8 z-50 w-full max-w-sm"
          >
            <Card className="flex h-[600px] flex-col rounded-2xl shadow-2xl border-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-xl">Maati Mitra</CardTitle>
                        <CardDescription>Your AI Assistant</CardDescription>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleChat}>
                  <X className="h-6 w-6" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-6">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                        {message.sender === 'bot' && (
                           <Avatar>
                                <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                           </Avatar>
                        )}
                         <div className={`rounded-2xl p-3 max-w-xs ${ message.sender === 'user'
                              ? 'rounded-br-none bg-primary text-primary-foreground'
                              : 'rounded-bl-none bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                        {message.sender === 'user' && (
                             <Avatar>
                                <AvatarFallback><User /></AvatarFallback>
                           </Avatar>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                             <Avatar>
                                <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                           </Avatar>
                           <div className="rounded-2xl p-3 max-w-xs bg-muted">
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                           </div>
                        </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Ask a question..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={isLoading}>
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
