
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { ArrowRightLeft, LoaderCircle, Sparkles, Mic, MicOff, Copy, Check } from 'lucide-react';

import { translateAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTypewriter } from '@/hooks/use-typewriter';
import { dialects, type Dialect } from '@/lib/languages';
import DebugView from '@/components/debug-view';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

const initialState = {
  type: 'initial' as const,
  message: '',
  translatedText: '',
  appliedRules: [],
  confidence: 0,
};

export default function TranslationUI() {
  const [formState, formAction, isPending] = useActionState(translateAction, initialState);
  const { toast } = useToast();

  const [inputText, setInputText] = useState('');
  const [dialect, setDialect] = useState<Dialect>('pune');
  const formRef = useRef<HTMLFormElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'mr-IN'; // Marathi language
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('Speech recognition result:', transcript);
            
            // Update the input text with the recognized speech
            setInputText((prevText) => {
                // If there's existing text, append with a space, otherwise just set the transcript
                return prevText.trim() ? prevText + ' ' + transcript : transcript;
            });
            
            toast({
                title: 'Speech Recognized',
                description: 'Your speech has been converted to text!',
            });
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            
            let errorMessage = 'Could not recognize speech.';
            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'No speech was detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage = 'No microphone was found. Please check your device.';
                    break;
                case 'not-allowed':
                    errorMessage = 'Microphone permission denied. Please allow microphone access.';
                    break;
                case 'network':
                    errorMessage = 'Network error occurred. Please check your connection.';
                    break;
                default:
                    errorMessage = `Error: ${event.error}`;
            }
            
            toast({
                variant: 'destructive',
                title: 'Voice Recognition Error',
                description: errorMessage,
            });
        };
        
        recognition.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
        };
        
        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
    } else {
        console.warn("Speech recognition not supported in this browser.");
    }
  }, [toast]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
        toast({
            variant: 'destructive',
            title: 'Not Supported',
            description: 'Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.',
        });
        return;
    }

    if (isListening) {
        // Stop the recognition
        try {
            recognitionRef.current.stop();
            console.log('Stopping speech recognition');
        } catch (error) {
            console.error("Failed to stop speech recognition:", error);
            setIsListening(false);
        }
    } else {
        // Start the recognition
        try {
            console.log('Starting speech recognition');
            recognitionRef.current.start();
        } catch (error) {
            console.error("Failed to start speech recognition:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to start voice recognition. Please try again.',
            });
            setIsListening(false);
        }
    }
  };

  const typewriterOutput = useTypewriter(formState.type === 'success' ? formState.translatedText : '');

  useEffect(() => {
    if (formState.type === 'error' && formState.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: formState.message,
      });
    }
    if (formState.type === 'success') {
      setCopied(false);
    }
  }, [formState, toast]);

  const handleTranslateClick = () => {
    if (!inputText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please enter text to translate.',
      });
      return;
    }
    // Programmatically submit the form
    formRef.current?.requestSubmit();
  };

  const handleCopy = () => {
    if (typewriterOutput) {
      navigator.clipboard.writeText(typewriterOutput);
      toast({ title: 'Success', description: 'Translated text copied to clipboard.' });
      setCopied(true);
    }
  };
  
  const confidencePercent = Math.round((formState.confidence || 0) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <Card className="shadow-2xl rounded-2xl border-2 border-border/50 overflow-hidden">
        <CardHeader className="text-center bg-card/50 pt-8">
          <CardTitle className="text-3xl font-bold tracking-tight">Marathi Dialect Translator</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">From Standard Marathi to Regional Dialects</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form ref={formRef} action={formAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Input Section */}
              <div className="relative">
                <Label htmlFor="input-text" className="text-sm font-semibold text-primary absolute top-2 left-4 bg-background px-1">Standard Marathi</Label>
                <Textarea
                  id="input-text"
                  name="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter Standard Marathi text..."
                  className="min-h-[250px] text-lg border-2 border-border/70 rounded-xl focus:ring-primary focus:border-primary transition pt-8"
                />
              </div>
              {/* Output Section */}
              <div className="relative">
                <Label className="text-sm font-semibold text-primary absolute top-2 left-4 bg-background px-1 z-10">Translated Dialect</Label>
                <div className="relative min-h-[250px] w-full rounded-xl border-2 border-border/70 bg-muted p-4 text-lg pt-8">
                  {isPending ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
                      <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap">
                        {typewriterOutput}
                        {!typewriterOutput && <span className="text-muted-foreground/70">Translation will appear here...</span>}
                      </p>
                      {typewriterOutput && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleCopy}
                          className="absolute top-2 right-2 text-muted-foreground hover:bg-accent"
                        >
                          {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 rounded-xl bg-muted p-4 border-2 border-dashed">
                <Select name="dialect" value={dialect} onValueChange={(value: Dialect) => setDialect(value)}>
                    <SelectTrigger className="w-full md:w-[240px] h-12 text-md font-semibold border-2 bg-background">
                    <SelectValue placeholder="Select Dialect" />
                    </SelectTrigger>
                    <SelectContent>
                    {dialects.filter(d => d.value !== 'standard').map(d => (
                        <SelectItem key={d.value} value={d.value} className="text-md">
                        {d.label}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>

                <Button type="button" onClick={handleTranslateClick} disabled={isPending} size="lg" className="w-full md:w-auto h-12 text-lg font-bold">
                    {isPending ? <LoaderCircle className="animate-spin" /> : <ArrowRightLeft />}
                    <span className="ml-2">Translate</span>
                </Button>

                <Button 
                    type="button" 
                    variant={isListening ? "destructive" : "outline"} 
                    size="lg" 
                    onClick={handleMicClick}
                    className="w-full md:w-auto h-12 text-lg font-bold border-2 bg-background"
                >
                    {isListening ? <MicOff /> : <Mic />}
                    <span className="ml-2">{isListening ? 'Listening...' : 'Use Mic'}</span>
                </Button>
            </div>
            
            {/* Confidence and Debug */}
            <div className="space-y-4 pt-4">
              {formState.type === 'success' && formState.translatedText && (
                <div className="flex items-center gap-4 rounded-lg bg-green-50/50 p-3 border border-green-200">
                  <div className="flex-shrink-0">
                    <Badge variant={confidencePercent > 85 ? 'default' : 'secondary'} className="text-md">
                        {confidencePercent}% Confidence
                    </Badge>
                  </div>
                  <Progress value={confidencePercent} className="h-3 flex-grow" />
                </div>
              )}
              <DebugView appliedRules={formState.appliedRules || []} />
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
