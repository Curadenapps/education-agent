import { useCallback, useEffect, useRef, useState } from 'react';
import { PROCEDURES, type Attachment, type ProcedureId } from '../agent';
import { useSpeech } from '../hooks/useSpeech';
import { Icon } from './Icon';

interface Props {
  busy: boolean;
  showChips: boolean;
  pendingFiles: Attachment[];
  onFilesChange: (files: Attachment[]) => void;
  onSend: (text: string, attachments: Attachment[]) => void;
  onProcedure: (id: ProcedureId) => void;
  onStop: () => void;
  /** Puts text in the box (e.g. "Other change…" in the document panel). */
  prefill?: { text: string; nonce: number };
}

const ACCEPT = '.pdf,.docx,.doc,.txt,.md,.pptx,.xlsx,.csv,.png,.jpg,.jpeg';

export const toAttachments = (files: FileList | File[]): Attachment[] =>
  Array.from(files).map((f) => ({ name: f.name, size: f.size, type: f.type }));

const SPEECH_HINT: Record<string, string> = {
  listening: 'Listening… speak now, then pause to finish.',
  blocked: 'Voice input is blocked here. Open the downloaded file in Chrome or Edge to use the microphone.',
  unsupported: 'Voice input needs Chrome or Edge.',
};

export function Composer({ busy, showChips, pendingFiles, onFilesChange, onSend, onProcedure, onStop, prefill }: Props) {
  const [text, setText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const baseRef = useRef(''); // text typed before dictation started

  const onSpeech = useCallback((spoken: string) => {
    setText((baseRef.current ? baseRef.current + ' ' : '') + spoken);
  }, []);
  const speech = useSpeech(onSpeech);

  useEffect(() => {
    if (!prefill) return;
    setText(prefill.text);
    const el = inputRef.current;
    el?.focus();
    requestAnimationFrame(() => el?.setSelectionRange(prefill.text.length, prefill.text.length));
  }, [prefill]);

  // Grow the textarea with its content, up to the CSS max-height.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const submit = () => {
    if (busy || (!text.trim() && !pendingFiles.length)) return;
    speech.stop();
    onSend(text, pendingFiles);
    setText('');
    onFilesChange([]);
  };

  const toggleMic = () => {
    if (speech.state !== 'listening') baseRef.current = text.trim();
    setShowHint(true);
    speech.toggle();
  };

  const hint = showHint ? SPEECH_HINT[speech.state] : undefined;

  return (
    <div className="composer-wrap">
      {showChips && (
        <div className="chips" role="toolbar" aria-label="Quick actions">
          {PROCEDURES.map((p) => (
            <button key={p.id} className="chip" onClick={() => onProcedure(p.id)} disabled={busy}>
              {p.label}
            </button>
          ))}
        </div>
      )}

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {pendingFiles.length > 0 && (
          <div className="composer__files">
            {pendingFiles.map((f) => (
              <span key={f.name} className="file-chip">
                <Icon name="file" size={15} />
                <span className="file-chip__name">{f.name}</span>
                <button
                  type="button"
                  className="file-chip__x"
                  onClick={() => onFilesChange(pendingFiles.filter((p) => p.name !== f.name))}
                  aria-label={`Remove ${f.name}`}
                >
                  <Icon name="close" size={13} />
                </button>
              </span>
            ))}
          </div>
        )}

        <label htmlFor="composer-input" className="sr-only">
          Message the iTOP Agent
        </label>
        <textarea
          id="composer-input"
          ref={inputRef}
          className="composer__input"
          rows={1}
          value={text}
          placeholder="Type, or tap the mic to speak…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
        />

        <div className="composer__bar">
          <div className="composer__tools">
            <input
              id="composer-file"
              ref={fileRef}
              type="file"
              multiple
              accept={ACCEPT}
              hidden
              onChange={(e) => {
                if (e.target.files?.length) onFilesChange([...pendingFiles, ...toAttachments(e.target.files)]);
                e.target.value = '';
              }}
            />
            <button type="button" className="icon-btn" onClick={() => fileRef.current?.click()} title="Attach files" aria-label="Attach files">
              <Icon name="clip" />
            </button>
            {hint && <span className={`composer__hint ${speech.state === 'blocked' ? 'is-warn' : ''}`}>{hint}</span>}
          </div>

          {busy ? (
            <button type="button" className="send send--stop" onClick={onStop} aria-label="Stop">
              <Icon name="stop" />
            </button>
          ) : (text.trim() || pendingFiles.length) && speech.state !== 'listening' ? (
            <button type="submit" className="send" aria-label="Send">
              <Icon name="send" />
            </button>
          ) : (
            // Empty box: the main button is the microphone, so voice input is easy to find.
            <button
              type="button"
              className={`send send--mic ${speech.state === 'listening' ? 'is-listening' : ''}`}
              onClick={toggleMic}
              aria-label={speech.state === 'listening' ? 'Stop voice input' : 'Speak your message'}
              aria-pressed={speech.state === 'listening'}
              title="Speak your message"
            >
              <Icon name="mic" />
            </button>
          )}
        </div>
      </form>
      <p className="composer__note">
        Demo answers are samples. Clinical content always needs clinician review.
      </p>
    </div>
  );
}
