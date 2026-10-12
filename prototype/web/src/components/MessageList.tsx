import { useEffect, useRef } from 'react';
import { docNoun, type AgentDocument, type ChatMessage, type Source } from '../agent';
import { Icon } from './Icon';
import { RichText } from './RichText';

interface Props {
  messages: ChatMessage[];
  documents: AgentDocument[];
  onOpenDocument: (id: string) => void;
}

export const basedOn = (sources: Source[]) =>
  sources.map((s) => (s.kind === 'drive' ? `${s.title} (Google Drive)` : s.title)).join(', ');

export function MessageList({ messages, documents, onOpenDocument }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];

  // Follow the reply as it is written.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages.length, last?.text, last?.documentId]);

  return (
    <div className="messages" role="log" aria-live="polite">
      {messages.map((m) =>
        m.role === 'user' ? (
          <div key={m.id} className="msg msg--user">
            {m.attachments?.map((a) => (
              <div key={a.name} className="file-chip">
                <Icon name="file" size={18} />
                <span className="file-chip__name">{a.name}</span>
              </div>
            ))}
            {m.text && <div className="msg__bubble">{m.text}</div>}
          </div>
        ) : (
          <AgentMessage
            key={m.id}
            message={m}
            document={documents.find((d) => d.id === m.documentId)}
            onOpenDocument={onOpenDocument}
          />
        ),
      )}
      <div ref={endRef} />
    </div>
  );
}

function AgentMessage({
  message: m,
  document: doc,
  onOpenDocument,
}: {
  message: ChatMessage;
  document?: AgentDocument;
  onOpenDocument: (id: string) => void;
}) {
  const thinking = m.status === 'streaming' && !m.text;

  return (
    <div className="msg msg--agent">
      <div className="msg__who">iTOP Assistant</div>

      {thinking ? (
        <div className="typing">
          <span className="typing__dots" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          {m.progress ?? 'Writing…'}
        </div>
      ) : (
        <div className={`msg__text ${m.status === 'streaming' ? 'is-streaming' : ''}`}>
          <RichText text={m.text} />
        </div>
      )}
      {m.status === 'streaming' && m.text && m.progress === 'Writing the document…' && (
        <div className="typing">
          <span className="typing__dots" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          Writing the document…
        </div>
      )}
      {m.status === 'stopped' && <p className="msg__note">You stopped this answer.</p>}
      {m.status === 'error' && <p className="msg__note msg__note--error">Something went wrong. Please try again.</p>}

      {doc && (
        <div className="doc-card">
          <div className="doc-card__head">
            <span className="doc-card__icon">
              <Icon name="doc" size={22} />
            </span>
            <span className="doc-card__text">
              <span className="doc-card__kind">Your {docNoun(doc.procedure)} is ready</span>
              <span className="doc-card__title">{doc.title}</span>
            </span>
          </div>
          {doc.guardrail.status === 'FLAG' && <p className="doc-card__check">Needs checking before use</p>}
          <button className="btn btn--primary btn--block" onClick={() => onOpenDocument(doc.id)}>
            Open document <Icon name="arrow" />
          </button>
        </div>
      )}

      {m.sources && m.sources.length > 0 && m.status === 'done' && (
        <p className="based-on">
          <Icon name="book" size={15} /> Based on: {basedOn(m.sources)}
        </p>
      )}
    </div>
  );
}
