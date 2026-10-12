import { useCallback, useEffect, useRef, useState } from 'react';
import { DOCUMENT_TYPES, type Attachment, type ProcedureId } from '../agent';
import { useSpeech } from '../hooks/useSpeech';
import { Icon } from './Icon';

interface Props {
  busy: boolean;
  live: boolean;
  /** Hidden on the start screen, which already offers the document choices. */
  showCreate: boolean;
  pendingFiles: Attachment[];
  onFilesChange: (files: Attachment[]) => void;
  onSend: (text: string, attachments: Attachment[]) => void;
  onProcedure: (id: ProcedureId) => void;
  onStop: () => void;
  /** Puts text in the box and focuses it. */
  prefill?: { text: string; nonce: number };
}

const ACCEPT = '.pdf,.docx,.doc,.txt,.md,.pptx,.xlsx,.csv,.png,.jpg,.jpeg';

export const toAttachments = (files: FileList | File[]): Attachment[] =>
  Array.from(files).map((f) => ({ name: f.name, size: f.size, type: f.type }));

const SPEECH_HINT: Record<string, string> = {
  listening: 'Listening… speak now. Tap Stop when you are done.',
  blocked: 'The microphone is turned off in this preview. Please type instead.',
  unsupported: 'Speaking works in Chrome or Edge. Please type instead.',
};

export function Composer({ busy, live, showCreate, pendingFiles, onFilesChange, onSend, onProcedure, onStop, prefill }: Props) {
  const [text, setText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const createRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef(''); // text typed before dictation started

  const onSpeech = useCallback((spoken: string) => {
    setText((baseRef.current ? baseRef.current + ' ' : '') + spoken);
  }, []);
  const speech = useSpeech(onSpeech);
  const listening = speech.state === 'listening';

  useEffect(() => {
    if (!prefill) return;
    setText(prefill.text);
    const el = inputRef.current;
    el?.focus();
    requestAnimationFrame(() => el?.setSelectionRange(prefill.text.length, prefill.text.length));
  }, [prefill]);

  // Grow the box with its content, up to the CSS max-height.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  useEffect(() => {
    if (!createOpen) return;
    const close = (e: MouseEvent) => !createRef.current?.contains(e.target as Node) && setCreateOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [createOpen]);

  const hasContent = !!text.trim() || pendingFiles.length > 0;

  const submit = () => {
    if (busy || !hasContent) return;
    speech.stop();
    onSend(text, pendingFiles);
    setText('');
    onFilesChange([]);
    setShowHint(false);
  };

  const toggleMic = () => {
    if (!listening) baseRef.current = text.trim();
    setShowHint(true);
    speech.toggle();
  };

  const hint = showHint ? SPEECH_HINT[speech.state] : undefined;

  return (
    <div className="composer-wrap">
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
                <Icon name="file" size={18} />
                <span className="file-chip__name">{f.name}</span>
                <button
                  type="button"
                  className="file-chip__x"
                  onClick={() => onFilesChange(pendingFiles.filter((p) => p.name !== f.name))}
                  aria-label={`Remove ${f.name}`}
                >
                  <Icon name="close" size={16} />
                </button>
              </span>
            ))}
          </div>
        )}

        <label htmlFor="composer-input" className="sr-only">
          Your question
        </label>
        <textarea
          id="composer-input"
          ref={inputRef}
          className="composer__input"
          rows={1}
          value={text}
          placeholder="Type your question here…"
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
            <button type="button" className="tool" onClick={() => fileRef.current?.click()}>
              <Icon name="clip" /> <span className="tool__label">Attach file</span>
            </button>

            {showCreate && (
              <div className="pop-wrap" ref={createRef}>
                <button type="button" className="tool" onClick={() => setCreateOpen((o) => !o)} aria-expanded={createOpen} disabled={busy}>
                  <Icon name="doc" /> <span className="tool__label">Create a document</span>
                </button>
                {createOpen && (
                  <div className="pop" role="menu">
                    <p className="pop__title">Which document?</p>
                    {DOCUMENT_TYPES.map((p) => (
                      <button
                        key={p.id}
                        role="menuitem"
                        className="pop__item"
                        onClick={() => {
                          setCreateOpen(false);
                          onProcedure(p.id);
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {busy ? (
            <button type="button" className="btn btn--quiet" onClick={onStop}>
              <Icon name="stop" /> Stop
            </button>
          ) : hasContent && !listening ? (
            <button type="submit" className="btn btn--primary">
              Send <Icon name="send" />
            </button>
          ) : (
            <button type="button" className={`btn ${listening ? 'btn--listening' : 'btn--quiet'}`} onClick={toggleMic} aria-pressed={listening}>
              <Icon name={listening ? 'stop' : 'mic'} /> {listening ? 'Stop' : 'Speak'}
            </button>
          )}
        </div>
      </form>
      {hint ? (
        <p className={`composer__note ${speech.state === 'blocked' || speech.state === 'unsupported' ? 'is-warn' : ''}`}>{hint}</p>
      ) : (
        <p className="composer__note">
          {live ? 'Answers come from the iTOP knowledge base.' : 'Demo with sample answers.'} A clinician must check clinical content.
        </p>
      )}
    </div>
  );
}
