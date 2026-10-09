import { DOC_TYPE_LABEL, type AgentDocument } from '../agent';
import { Icon } from './Icon';

interface Props {
  documents: AgentDocument[];
  selectedId: string | null;
  open: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
}

/**
 * Document desk. Phase B shows the generated text, its guardrail and its sources.
 * Phase C adds the formatted preview, downloads and Save to Drive.
 */
export function DocPanel({ documents, selectedId, open, onSelect, onClose }: Props) {
  const doc = documents.find((d) => d.id === selectedId) ?? documents[documents.length - 1];

  return (
    <aside className={`desk ${open ? 'is-open' : ''}`} aria-label="Documents">
      <header className="desk__head">
        <div>
          <div className="eyebrow">Documents</div>
          <div className="desk__count">
            {documents.length ? `${documents.length} in this conversation` : 'Nothing generated yet'}
          </div>
        </div>
        <button className="icon-btn desk__close" onClick={onClose} aria-label="Close documents">
          <Icon name="close" />
        </button>
      </header>

      {documents.length > 1 && (
        <div className="desk__tabs" role="tablist">
          {documents.map((d) => (
            <button
              key={d.id}
              role="tab"
              aria-selected={d.id === doc?.id}
              className={`desk__tab ${d.id === doc?.id ? 'is-active' : ''}`}
              onClick={() => onSelect(d.id)}
            >
              {DOC_TYPE_LABEL[d.procedure]}
            </button>
          ))}
        </div>
      )}

      {doc ? (
        <div className="desk__doc">
          <div className="sheet">
            <div className="sheet__meta">
              <span className="eyebrow">{DOC_TYPE_LABEL[doc.procedure]}</span>
              <span className={`guard guard--${doc.guardrail.status.toLowerCase()}`}>Guardrail {doc.guardrail.status}</span>
            </div>
            <h2 className="sheet__title">{doc.title}</h2>
            {doc.guardrail.flags.length > 0 && (
              <ul className="sheet__flags">
                {doc.guardrail.flags.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            )}
            <pre className="sheet__raw">{doc.body}</pre>
            <div className="sheet__sources">
              <span className="eyebrow">Sources</span>
              {doc.sources.map((s) => (
                <span key={s.title} className={`source source--${s.kind}`}>
                  <Icon name={s.kind === 'drive' ? 'drive' : 'book'} size={13} />
                  {s.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="desk__empty">
          <div className="desk__empty-mark" aria-hidden>
            <Icon name="doc" size={28} />
          </div>
          <p>SOPs, lesson plans, event packs and feedback reports appear here, with their guardrail check and sources.</p>
        </div>
      )}
    </aside>
  );
}
