import { useCallback, useRef, useState } from 'react';

/* Minimal typings: the Web Speech API isn't in TypeScript's DOM lib. */
interface SpeechResultEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

const Recognition: (new () => SpeechRecognitionLike) | undefined =
  (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

export type SpeechState = 'idle' | 'listening' | 'blocked' | 'unsupported';

/**
 * Browser voice input. Works in Chrome and Edge when the page is opened directly.
 * Embedded viewers (such as the published link) block the microphone; we say so instead of failing silently.
 */
export function useSpeech(onText: (text: string, final: boolean) => void) {
  const [state, setState] = useState<SpeechState>(Recognition ? 'idle' : 'unsupported');
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  const stop = useCallback(() => recRef.current?.stop(), []);

  const start = useCallback(() => {
    if (!Recognition) return setState('unsupported');
    const rec = new Recognition();
    rec.lang = navigator.language || 'en-GB';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let text = '';
      let final = false;
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
        final = e.results[i].isFinal;
      }
      onText(text, final);
    };
    rec.onerror = (e) => setState(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'blocked' : 'idle');
    rec.onend = () => setState((s) => (s === 'listening' ? 'idle' : s));
    recRef.current = rec;
    try {
      rec.start();
      setState('listening');
    } catch {
      setState('blocked');
    }
  }, [onText]);

  const toggle = useCallback(() => (state === 'listening' ? stop() : start()), [state, start, stop]);

  return { state, toggle, stop };
}
