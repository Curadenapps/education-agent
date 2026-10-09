import { useEffect, useRef, useState } from 'react';
import { DOC_TYPE_LABEL, type AgentDocument, type ReformatStyle } from '../agent';
import {
  canShare,
  copyText,
  downloadMarkdown,
  downloadWord,
  fileBase,
  isEmbedded,
  printPdf,
  shareDoc,
  toMarkdown,
} from '../lib/export';
import { DocView } from './DocView';
import { Icon } from './Icon';

interface Props {
  documents: AgentDocument[];
  selectedId: string | null;
  open: boolean;
  wide: boolean;
  busy: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
  onToggleWide: () => void;
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
const drivePath = (d: AgentDocument) => `iTOP Agent Outputs/${DRIVE_FOLDER[d.procedure] ?? 'Other'}/${fileBase(d)}.md`;

const REFORMATS: { style: ReformatStyle; label: string }[] = [
  { style: 'shorter', label: 'Shorter' },
  { style: 'checklist', label: 'Checklist' },
  { style: 'patient', label: 'Patient handout' },
];

const versionLabel = (d: AgentDocument) => {
  const v = d.version ?? 1;
  const kind = d.title.match(/^(Checklist|Short version|Patient handout) — /)?.[1];
  return v === 1 ? 'Original' : `v${v}${kind ? ` · ${kind}` : ''}`;
};

export function DocPanel(props: Props) {
  const { documents, selectedId, open, wide, busy, onSelect, onClose, onToggleWide, onReformat, onAskChange, onSaved } = props;
  const doc = documents.find((d) => d.id === selectedId) ?? documents[documents.length - 1];
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menu]);

  useEffect(() => scrollRef.current?.scrollTo({ top: 0 }), [doc?.id]);

  // Group versions of the same document family under one row of tabs.
  const rootOf = (d: AgentDocument): string => {
    const parent = d.parentId && documents.find((x) => x.id === d.parentId);
    return parent ? rootOf(parent) : d.id;
  };
  const family = doc ? documents.filter((d) => rootOf(d) === rootOf(doc)) : [];
  const roots = documents.filter((d) => !d.parentId || !documents.some((x) => x.id === d.parentId));

  const blockedNote = 'Downloads are blocked in this preview link. Use Copy, or open the app file on a computer.';
  const runExport = (fn: () => void, done: string) => {
    setMenu(false);
    fn();
    setToast(isEmbedded ? blockedNote : done);
  };

  const onCopy = async () => setToast((await copyText(toMarkdown(doc!))) ? 'Copied as text. Paste it into an email or chat.' : 'Copy failed. Select the text instead.');
  const onShare = async () => {
    try {
      await shareDoc(doc!);
    } catch {
      setToast('Sharing was cancelled.');
    }
  };
  const onSave = () => {
    const path = drivePath(doc!);
    onSaved(doc!.id, path);
    setToast('Saved to Google Drive (demo: nothing was written).');
  };

  return (
    <aside className={`desk ${open ? 'is-open' : ''} ${wide ? 'is-wide' : ''}`} aria-label="Documents">
      <header className="desk__head">
        <button className="back-btn" onClick={onClose}>
          <Icon name="back" /> Back to chat
        </button>
        <div className="desk__heading">
          <div className="eyebrow">Documents</div>
          <div className="desk__count">
            {documents.length ? `${roots.length} in this conversation` : 'Nothing generated yet'}
          </div>
        </div>
        <button className="icon-btn desk__wide" onClick={onToggleWide} aria-label={wide ? 'Narrow panel' : 'Widen panel'} title={wide ? 'Narrow panel' : 'Widen panel'}>
          <Icon name={wide ? 'collapse' : 'expand'} />
        </button>
      </header>

      {roots.length > 1 && (
        <div className="desk__tabs" role="tablist" aria-label="Documents">
          {roots.map((d) => (
            <button
              key={d.id}
              role="tab"
              aria-selected={rootOf(doc!) === d.id}
              className={`desk__tab ${rootOf(doc!) === d.id ? 'is-active' : ''}`}
              onClick={() => onSelect(documents.filter((x) => rootOf(x) === d.id).pop()!.id)}
            >
              {DOC_TYPE_LABEL[d.procedure]}
            </button>
          ))}
        </div>
      )}

      {doc ? (
        <>
          <div className="actions">
            <div className="actions__main">
              <div className="menu-wrap" ref={menuRef}>
                <button className="btn btn--navy" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-haspopup="menu">
                  <Icon name="download" /> Download <Icon name="chevron" size={14} />
                </button>
                {menu && (
                  <div className="menu" role="menu">
                    <button role="menuitem" onClick={() => runExport(() => downloadWord(doc), 'Word file downloaded.')}>
                      <span>Word</span>
                      <span className="menu__ext">.doc</span>
                    </button>
                    <button role="menuitem" onClick={() => runExport(() => printPdf(doc), 'Choose “Save as PDF” in the print dialog.')}>
                      <span>PDF</span>
                      <span className="menu__ext">print → save</span>
                    </button>
                    <button role="menuitem" onClick={() => runExport(() => downloadMarkdown(doc), 'Markdown file downloaded.')}>
                      <span>Markdown</span>
                      <span className="menu__ext">.md</span>
                    </button>
                    {isEmbedded && <p className="menu__note">{blockedNote}</p>}
                  </div>
                )}
              </div>
              {canShare && (
                <button className="btn btn--line" onClick={onShare}>
                  <Icon name="share" /> Send
                </button>
              )}
              <button className="btn btn--line" onClick={onCopy}>
                <Icon name="copy" /> Copy
              </button>
              <button className={`btn btn--line ${doc.savedPath ? 'is-done' : ''}`} onClick={onSave} disabled={!!doc.savedPath}>
                <Icon name={doc.savedPath ? 'check' : 'drive'} /> {doc.savedPath ? 'Saved' : 'Save to Drive'}
              </button>
            </div>
            <div className="actions__reformat">
              <span className="eyebrow">Reformat</span>
              {REFORMATS.map((r) => (
                <button key={r.style} className="chip chip--small" onClick={() => onReformat(doc, r.style)} disabled={busy}>
                  {r.label}
                </button>
              ))}
              <button className="chip chip--small" onClick={() => onAskChange(doc)} disabled={busy}>
                Other change…
              </button>
            </div>
          </div>

          {family.length > 1 && (
            <div className="versions" role="tablist" aria-label="Versions">
              {family.map((d) => (
                <button
                  key={d.id}
                  role="tab"
                  aria-selected={d.id === doc.id}
                  className={`version ${d.id === doc.id ? 'is-active' : ''}`}
                  onClick={() => onSelect(d.id)}
                >
                  {versionLabel(d)}
                </button>
              ))}
            </div>
          )}

          <div className="desk__doc" ref={scrollRef}>
            <article className="sheet">
              <div className="sheet__brand">
                <span className="sheet__mark">
                  iTOP<span>.</span>
                </span>
                <span className={`guard guard--${doc.guardrail.status.toLowerCase()}`}>Guardrail {doc.guardrail.status}</span>
              </div>
              <div className="eyebrow">
                {DOC_TYPE_LABEL[doc.procedure]} · Version {doc.version ?? 1} ·{' '}
                {new Date(doc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <h2 className="sheet__title">{doc.title}</h2>
              {doc.guardrail.flags.length > 0 && (
                <div className="sheet__flags">
                  <strong>Needs review:</strong> {doc.guardrail.flags.join('; ')}
                </div>
              )}
              <DocView markdown={doc.body} />
              <footer className="sheet__foot">
                <div className="eyebrow">Sources</div>
                <div className="sheet__sources">
                  {doc.sources.map((s) => (
                    <span key={s.title} className={`source source--${s.kind}`}>
                      <Icon name={s.kind === 'drive' ? 'drive' : 'book'} size={13} />
                      {s.title}
                    </span>
                  ))}
                </div>
                {doc.savedPath && (
                  <p className="sheet__saved">
                    <Icon name="drive" size={14} /> {doc.savedPath}
                  </p>
                )}
              </footer>
            </article>
          </div>
        </>
      ) : (
        <div className="desk__empty">
          <div className="desk__empty-mark" aria-hidden>
            <Icon name="doc" size={28} />
          </div>
          <p>SOPs, lesson plans, event packs and feedback reports appear here, ready to download, send or save to Drive.</p>
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
