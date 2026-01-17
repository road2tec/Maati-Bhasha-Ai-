'use client';

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatbotFabProps {
  onClick: () => void;
}

export default function ChatbotFab({ onClick }: ChatbotFabProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform hover:scale-110 active:scale-100"
      aria-label="Open Chat"
    >
      <MessageSquare className="h-8 w-8" />
    </Button>
  );
}
