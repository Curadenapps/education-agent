import { useEffect, useRef } from 'react';
import { DOC_TYPE_LABEL, type AgentDocument, type ChatMessage } from '../agent';
import { Icon } from './Icon';
import { RichText } from './RichText';

interface Props {
  messages: ChatMessage[];
  documents: AgentDocument[];
  onOpenDocument: (id: string) => void;
}

const fileSize = (bytes: number) =>
  bytes > 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;

export function MessageList({ messages, documents, onOpenDocument }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];

  // Follow the stream as it grows.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages.length, last?.text, last?.documentId]);

  return (
    <div className="messages" role="log" aria-live="polite">
      {messages.map((m) =>
        m.role === 'user' ? (
          <div key={m.id} className="msg msg--user">
            {m.attachments?.map((a) => (
              <div key={a.name} className="file-chip file-chip--sent">
                <Icon name="file" size={16} />
                <span className="file-chip__name">{a.name}</span>
                <span className="file-chip__size">{fileSize(a.size)}</span>
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
      <div className="msg__avatar" aria-hidden>
        <span className="msg__avatar-dot" />i
      </div>
      <div className="msg__body">
        <div className="msg__who">
          iTOP Agent
          {m.status === 'stopped' && <span className="msg__state">Stopped</span>}
          {m.status === 'error' && <span className="msg__state msg__state--error">Error</span>}
        </div>

        {thinking ? (
          <div className="typing" aria-label="Agent is writing">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <div className={`msg__text ${m.status === 'streaming' ? 'is-streaming' : ''}`}>
            <RichText text={m.text} />
          </div>
        )}

        {doc && (
          <button className="doc-card" onClick={() => onOpenDocument(doc.id)}>
            <span className="doc-card__icon">
              <Icon name="doc" />
            </span>
            <span className="doc-card__text">
              <span className="eyebrow">{DOC_TYPE_LABEL[doc.procedure]} · ready</span>
              <span className="doc-card__title">{doc.title}</span>
            </span>
            <span className={`guard guard--${doc.guardrail.status.toLowerCase()}`}>{doc.guardrail.status}</span>
            <Icon name="arrow" />
          </button>
        )}

        {m.sources && m.sources.length > 0 && (
          <div className="sources">
            <span className="eyebrow">Sources</span>
            {m.sources.map((s) => (
              <span key={s.title} className={`source source--${s.kind}`} title={s.kind === 'drive' ? 'Google Drive document' : 'Notion knowledge page'}>
                <Icon name={s.kind === 'drive' ? 'drive' : 'book'} size={13} />
                {s.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
