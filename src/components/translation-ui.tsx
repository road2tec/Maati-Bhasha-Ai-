
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
  maxAlternatives: number;
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
  const [micStatus, setMicStatus] = useState<'idle' | 'starting' | 'listening' | 'processing'>('idle');
  const micStatusRef = useRef<'idle' | 'starting' | 'listening' | 'processing'>('idle');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecognitionActiveRef = useRef(false);
  const startTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const lastClickTimeRef = useRef(0);
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        // Configure recognition settings
        recognition.continuous = false;
        // Use English (India) which has best support, user can speak Hindi/Marathi and it will still work
        recognition.lang = 'en-IN';
        recognition.interimResults = true; // Show interim results for better UX
        
        try {
            recognition.maxAlternatives = 1;
        } catch (e) {
            console.log('maxAlternatives not supported, ignoring');
        }

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('Speech recognition result:', transcript);
            setMicStatus('processing');
            micStatusRef.current = 'processing';
            
            // Update the input text with the recognized speech
            setInputText((prevText) => {
                // If there's existing text, append with a space, otherwise just set the transcript
                return prevText.trim() ? prevText + ' ' + transcript : transcript;
            });
            
            toast({
                title: '✅ Speech Recognized',
                description: `"${transcript}"`,
            });
            
            setMicStatus('idle');
            micStatusRef.current = 'idle';
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            // Clear any pending start timeout
            if (startTimeoutRef.current) {
                clearTimeout(startTimeoutRef.current);
                startTimeoutRef.current = null;
            }
            
            // Reset all states on error - NO auto retry (it causes rapid on/off)
            retryCountRef.current = 0;
            isRecognitionActiveRef.current = false;
            setIsListening(false);
            setMicStatus('idle');
            micStatusRef.current = 'idle';
            
            let errorMessage = 'Could not recognize speech.';
            let shouldShowToast = true;
            
            // Detect Brave browser
            const isBrave = (navigator as any).brave !== undefined;
            
            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'No speech was detected. Please speak louder or closer to the mic.';
                    break;
                case 'audio-capture':
                    errorMessage = 'No microphone was found. Please check your device.';
                    break;
                case 'not-allowed':
                    errorMessage = 'Microphone permission denied. Please click the lock icon in the address bar → Site settings → Allow Microphone.';
                    break;
                case 'network':
                    if (isBrave) {
                        errorMessage = '⚠️ Brave browser blocks speech recognition. Please open this page in Google Chrome instead.';
                    } else {
                        errorMessage = 'Network error. Please use Google Chrome browser for voice input.';
                    }
                    break;
                case 'aborted':
                    // User stopped, not really an error
                    shouldShowToast = false;
                    break;
                case 'service-not-allowed':
                    errorMessage = 'Speech service not available. Please try using Chrome browser.';
                    break;
                default:
                    errorMessage = `Error: ${event.error}`;
            }
            
            if (shouldShowToast) {
                toast({
                    variant: 'destructive',
                    title: 'Voice Recognition Error',
                    description: errorMessage,
                });
            }
        };
        
        recognition.onstart = () => {
          console.log('Speech recognition started');
          // Clear the start timeout since recognition started successfully
          if (startTimeoutRef.current) {
            clearTimeout(startTimeoutRef.current);
            startTimeoutRef.current = null;
          }
          // Reset retry count on successful start
          retryCountRef.current = 0;
          isRecognitionActiveRef.current = true;
          setIsListening(true);
          setMicStatus('listening');
          micStatusRef.current = 'listening';
          toast({
            title: '🎤 Listening...',
            description: 'Speak now - your voice is being captured',
          });
        };
        
        recognition.onend = () => {
          console.log('Speech recognition ended');
          isRecognitionActiveRef.current = false;
          setIsListening(false);
          setMicStatus('idle');
          micStatusRef.current = 'idle';
        };
        
        recognitionRef.current = recognition;
    } else {
        console.warn("Speech recognition not supported in this browser.");
    }
    
    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.log('Cleanup: abort error ignored');
        }
        isRecognitionActiveRef.current = false;
        recognitionRef.current = null;
      }
    };
  }, [toast]);

  const handleMicClick = async () => {
    // Debounce - prevent rapid clicking (must wait 1 second between clicks)
    const now = Date.now();
    if (now - lastClickTimeRef.current < 1000) {
        console.log('Click debounced - too soon');
        return;
    }
    lastClickTimeRef.current = now;
    
    if (!recognitionRef.current) {
        toast({
            variant: 'destructive',
            title: 'Not Supported',
            description: 'Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.',
        });
        return;
    }

    if (isListening || isRecognitionActiveRef.current || micStatusRef.current === 'listening') {
        // Stop the recognition
        console.log('Stopping speech recognition');
        setMicStatus('idle');
        micStatusRef.current = 'idle';
        isRecognitionActiveRef.current = false;
        setIsListening(false);
        
        try {
            recognitionRef.current.stop();
        } catch (error) {
            console.error("Failed to stop speech recognition:", error);
        }
        
        // Stop the microphone stream
        try {
            const stream = (window as any).__micStream;
            if (stream) {
                stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
                (window as any).__micStream = null;
            }
        } catch (e) {
            console.log('Error stopping mic stream:', e);
        }
        
        toast({
          title: '🛑 Stopped',
          description: 'Voice recognition stopped',
        });
    } else {
        // Check if already starting or listening
        if (micStatusRef.current !== 'idle') {
            console.log('Recognition not idle, skipping start');
            return;
        }
        
        console.log('Starting speech recognition');
        setMicStatus('starting');
        micStatusRef.current = 'starting';
        
        // First request microphone permission explicitly
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone access granted');
            // Keep the stream active - don't stop it
            // This ensures the mic stays enabled
            
            // Store stream reference to stop later
            (window as any).__micStream = stream;
        } catch (permErr: any) {
            console.error('Mic permission error:', permErr);
            setMicStatus('idle');
            micStatusRef.current = 'idle';
            toast({
                variant: 'destructive',
                title: 'Microphone Access Denied',
                description: 'Please allow microphone access in your browser settings.',
            });
            return;
        }
        
        // Clear any existing timeout
        if (startTimeoutRef.current) {
            clearTimeout(startTimeoutRef.current);
        }
        
        // Set a timeout to reset state if recognition doesn't start within 5 seconds
        startTimeoutRef.current = setTimeout(() => {
            if (micStatusRef.current === 'starting') {
                console.log('Recognition start timed out');
                setMicStatus('idle');
                micStatusRef.current = 'idle';
                isRecognitionActiveRef.current = false;
                setIsListening(false);
                toast({
                    variant: 'destructive',
                    title: 'Mic Timeout',
                    description: 'Speech recognition service unavailable. Try refreshing the page.',
                });
            }
        }, 5000);
        
        // Start recognition
        try {
            recognitionRef.current.start();
            console.log('Speech recognition start() called');
            
            // Manually set listening state after a short delay if onstart hasn't fired
            setTimeout(() => {
                if (micStatusRef.current === 'starting' && recognitionRef.current) {
                    console.log('Manually setting listening state');
                    setMicStatus('listening');
                    micStatusRef.current = 'listening';
                    setIsListening(true);
                    isRecognitionActiveRef.current = true;
                    if (startTimeoutRef.current) {
                        clearTimeout(startTimeoutRef.current);
                        startTimeoutRef.current = null;
                    }
                    toast({
                        title: '🎤 Listening...',
                        description: 'Speak now - your voice is being captured',
                    });
                }
            }, 500);
            
        } catch (startError: any) {
            console.error("Failed to start speech recognition:", startError);
            if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
            
            isRecognitionActiveRef.current = false;
            setIsListening(false);
            setMicStatus('idle');
            micStatusRef.current = 'idle';
            
            let errorMessage = 'Failed to start voice recognition. Please try again.';
            if (startError.message && startError.message.includes('already started')) {
                errorMessage = 'Voice recognition is already active. Please wait a moment and try again.';
            }
            
            toast({
                variant: 'destructive',
                title: 'Error',
                description: errorMessage,
            });
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
                <Label className="text-sm font-semibold text-primary absolute top-2 left-4 bg-background px-1 z-10">{dialects.find(d => d.value === dialect)?.label || 'Translated Dialect'}</Label>
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
                    variant={micStatus === 'listening' ? "destructive" : micStatus === 'starting' ? "secondary" : "outline"} 
                    size="lg" 
                    onClick={handleMicClick}
                    disabled={micStatus === 'starting' || micStatus === 'processing'}
                    className={`w-full md:w-auto h-12 text-lg font-bold border-2 bg-background ${
                      micStatus === 'listening' ? 'animate-pulse ring-2 ring-red-500 ring-offset-2' : ''
                    }`}
                >
                    {micStatus === 'listening' ? (
                      <MicOff className="animate-bounce" />
                    ) : micStatus === 'starting' ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <Mic />
                    )}
                    <span className="ml-2">
                      {micStatus === 'listening' ? '🔴 Stop Listening' : 
                       micStatus === 'starting' ? 'Starting...' : 
                       micStatus === 'processing' ? 'Processing...' : 
                       '🎤 Use Mic'}
                    </span>
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
