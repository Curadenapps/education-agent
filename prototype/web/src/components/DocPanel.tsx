import { useEffect, useRef, useState, type ReactNode } from 'react';
import { DOC_TYPE_LABEL, type AgentDocument, type ReformatStyle } from '../agent';
import { canShare, copyText, downloadWord, fileBase, isEmbedded, printPdf, shareDoc, toMarkdown } from '../lib/export';
import { DocView } from './DocView';
import { Icon } from './Icon';
import { basedOn } from './MessageList';

interface Props {
  documents: AgentDocument[];
  selectedId: string | null;
  open: boolean;
  busy: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
  onReformat: (doc: AgentDocument, style: ReformatStyle) => void;
  onAskChange: (doc: AgentDocument) => void;
  onSaved: (docId: string, path: string) => void;
}

/** Output Drive folder layout from agents/education-agent-procedures.md. */
const DRIVE_FOLDER: Record<string, string> = {
  sop: 'SOPs',
  lesson: 'Lesson-Plans',
  event: 'Events',
  feedback: 'Feedback',
  session: 'Session-Templates',
};
const drivePath = (d: AgentDocument) => `iTOP Agent Outputs/${DRIVE_FOLDER[d.procedure] ?? 'Other'}/${fileBase(d)}`;

const versionName = (d: AgentDocument) =>
  ({ 'Short version': 'Shorter', Checklist: 'Checklist', 'Patient handout': 'For patients' })[
    d.title.match(/^(Checklist|Short version|Patient handout) — /)?.[1] ?? ''
  ] ?? 'Original';

type Sheet = 'none' | 'save' | 'change';

export function DocPanel(props: Props) {
  const { documents, selectedId, open, busy, onSelect, onClose, onReformat, onAskChange, onSaved } = props;
  const doc = documents.find((d) => d.id === selectedId) ?? documents[documents.length - 1];
  const [sheet, setSheet] = useState<Sheet>('none');
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (sheet !== 'none') setToast(null);
  }, [sheet]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    setSheet('none');
  }, [doc?.id]);

  // Versions of one document share a root; different documents get their own tab.
  const rootOf = (d: AgentDocument): string => {
    const parent = d.parentId && documents.find((x) => x.id === d.parentId);
    return parent ? rootOf(parent) : d.id;
  };
  const family = doc ? documents.filter((d) => rootOf(d) === rootOf(doc)) : [];
  const roots = documents.filter((d) => !d.parentId || !documents.some((x) => x.id === d.parentId));

  const done = (msg: string) => {
    setSheet('none');
    setToast(msg);
  };
  const blocked = 'Downloads are turned off in this preview. Use “Copy the text” instead.';

  const actions = doc && {
    word: () => (downloadWord(doc), done(isEmbedded ? blocked : 'Word file saved to your device.')),
    pdf: () => (printPdf(doc), done(isEmbedded ? blocked : 'Choose “Save as PDF” or a printer.')),
    copy: async () => done((await copyText(toMarkdown(doc))) ? 'Copied. Paste it into an email or document.' : 'Could not copy. Please try again.'),
    send: async () => {
      setSheet('none');
      try {
        await shareDoc(doc);
      } catch {
        /* cancelled */
      }
    },
    drive: () => (onSaved(doc.id, drivePath(doc)), done('Saved to Google Drive. (Demo: nothing was written.)')),
  };

  return (
    <aside className={`desk ${open ? 'is-open' : ''}`} aria-label="Document">
      <header className="desk__head">
        <button className="btn btn--primary desk__back" onClick={onClose}>
          <Icon name="back" /> Back to chat
        </button>
        <h2 className="desk__title">Your document</h2>
      </header>

      {roots.length > 1 && (
        <div className="tabs" role="tablist" aria-label="Documents in this conversation">
          {roots.map((d) => {
            const on = doc && rootOf(doc) === d.id;
            return (
              <button
                key={d.id}
                role="tab"
                aria-selected={!!on}
                className={`tab ${on ? 'is-active' : ''}`}
                onClick={() => onSelect(documents.filter((x) => rootOf(x) === d.id).pop()!.id)}
              >
                {DOC_TYPE_LABEL[d.procedure]}
              </button>
            );
          })}
        </div>
      )}

      {doc ? (
        <>
          <div className="desk__doc" ref={scrollRef}>
            {family.length > 1 && (
              <div className="versions">
                <span className="versions__label">Versions:</span>
                {family.map((d) => (
                  <button key={d.id} className={`version ${d.id === doc.id ? 'is-active' : ''}`} onClick={() => onSelect(d.id)} aria-pressed={d.id === doc.id}>
                    {versionName(d)}
                  </button>
                ))}
              </div>
            )}

            <article className="sheet">
              <div className="sheet__brand">
                <span className="sheet__mark">
                  iTOP<span>.</span>
                </span>
                <span className="sheet__kind">{DOC_TYPE_LABEL[doc.procedure]}</span>
              </div>
              <h2 className="sheet__title">{doc.title}</h2>
              {doc.guardrail.status === 'FLAG' && (
                <div className="sheet__check">
                  <strong>Needs checking before use.</strong> {doc.guardrail.flags.join(' ')}
                </div>
              )}
              <DocView markdown={doc.body} />
              <footer className="sheet__foot">
                <p>
                  <strong>Based on:</strong> {basedOn(doc.sources)}
                </p>
                {doc.savedPath && (
                  <p className="sheet__saved">
                    <Icon name="check" size={16} /> Saved to Google Drive: {doc.savedPath}
                  </p>
                )}
              </footer>
            </article>
          </div>

          <div className="desk__actions">
            <button className="btn btn--primary btn--big" onClick={() => setSheet('save')}>
              <Icon name="download" /> Save or send
            </button>
            <button className="btn btn--outline btn--big" onClick={() => setSheet('change')} disabled={busy}>
              <Icon name="edit" /> Change it
            </button>
          </div>

          {sheet !== 'none' && (
            <div className="sheet-modal" role="dialog" aria-modal="true" aria-label={sheet === 'save' ? 'Save or send' : 'Change it'}>
              <div className="sheet-modal__scrim" onClick={() => setSheet('none')} />
              <div className="sheet-modal__card">
                {sheet === 'save' && actions && (
                  <>
                    <h3 className="sheet-modal__title">Save or send this document</h3>
                    {isEmbedded && <p className="sheet-modal__note">{blocked}</p>}
                    <Option icon="file" title="Download for Word" desc="Open and edit it in Microsoft Word." onClick={actions.word} />
                    <Option icon="print" title="Print or save as PDF" desc="For printing, or to email as a PDF." onClick={actions.pdf} />
                    {canShare && <Option icon="share" title="Send" desc="Email or message it from this device." onClick={actions.send} />}
                    <Option icon="copy" title="Copy the text" desc="Paste it into an email or another document." onClick={actions.copy} />
                    <Option
                      icon={doc.savedPath ? 'check' : 'drive'}
                      title={doc.savedPath ? 'Saved to Google Drive' : 'Save to Google Drive'}
                      desc="Keeps a copy in the iTOP outputs folder."
                      onClick={actions.drive}
                      disabled={!!doc.savedPath}
                    />
                  </>
                )}
                {sheet === 'change' && (
                  <>
                    <h3 className="sheet-modal__title">How should it change?</h3>
                    <p className="sheet-modal__hint">You keep the original. The new version appears next to it.</p>
                    <Option icon="arrow" title="Make it shorter" desc="Only the essentials." onClick={() => onReformat(doc, 'shorter')} />
                    <Option icon="check" title="Turn it into a checklist" desc="Tick-boxes for the day." onClick={() => onReformat(doc, 'checklist')} />
                    <Option icon="chat" title="Rewrite for patients" desc="Plain words, for handing out." onClick={() => onReformat(doc, 'patient')} />
                    <Option icon="edit" title="Something else" desc="Type what you would like changed." onClick={() => onAskChange(doc)} />
                  </>
                )}
                <button className="btn btn--quiet btn--block" onClick={() => setSheet('none')}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="desk__empty">
          <div className="desk__empty-mark" aria-hidden>
            <Icon name="doc" size={30} />
          </div>
          <p>When you create a document, it appears here. You can then save, print or send it.</p>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </aside>
  );
}

function Option({ icon, title, desc, onClick, disabled }: { icon: string; title: string; desc: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button className="option" onClick={onClick} disabled={disabled}>
      <span className="option__icon">
        <Icon name={icon} size={22} />
      </span>
      <span className="option__text">
        <span className="option__title">{title}</span>
        <span className="option__desc">{desc}</span>
      </span>
    </button>
  );
}
