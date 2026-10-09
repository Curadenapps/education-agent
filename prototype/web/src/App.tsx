import { useEffect, useState } from 'react';
import { agent, DOC_TYPE_LABEL, type Attachment } from './agent';
import { Composer, toAttachments } from './components/Composer';
import { DocPanel } from './components/DocPanel';
import { EmptyState } from './components/EmptyState';
import { Icon } from './components/Icon';
import { MessageList } from './components/MessageList';
import { Sidebar } from './components/Sidebar';
import { useChat } from './hooks/useChat';

export default function App() {
  const chat = useChat();
  const { active } = chat;
  const [railOpen, setRailOpen] = useState(false);
  const [deskOpen, setDeskOpen] = useState(false); // drawer state on narrow screens
  const [docId, setDocId] = useState<string | null>(null);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const [wide, setWide] = useState(false);
  const [seenDocId, setSeenDocId] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<{ text: string; nonce: number }>();

  // Show each new document as it arrives.
  const latestDoc = active.documents[active.documents.length - 1];
  useEffect(() => {
    if (latestDoc) setDocId(latestDoc.id);
  }, [latestDoc?.id]);

  // Switching conversation resets per-conversation UI.
  useEffect(() => {
    setDocId(null);
    setFiles([]);
    setRailOpen(false);
  }, [active.id]);

  const openDoc = (id: string) => {
    setDocId(id);
    setSeenDocId(id);
    setDeskOpen(true);
  };

  // On phones and tablets the panel is hidden, so a new document gets a pill above the message box.
  const unseenDoc = latestDoc && latestDoc.id !== seenDocId && !chat.busy ? latestDoc : undefined;

  const isEmpty = active.messages.length === 0;

  return (
    <div className={`app ${wide ? 'is-wide' : ''}`}>
      <Sidebar
        conversations={chat.conversations}
        activeId={active.id}
        busy={chat.busy}
        open={railOpen}
        onNew={chat.newConversation}
        onSelect={chat.select}
        onRemove={chat.remove}
        onClose={() => setRailOpen(false)}
      />
      {(railOpen || deskOpen) && (
        <div className="scrim" onClick={() => (setRailOpen(false), setDeskOpen(false))} aria-hidden />
      )}

      <main
        className={`main ${dragging ? 'is-dragging' : ''}`}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
            setDragging(true);
          }
        }}
        onDragLeave={(e) => e.currentTarget === e.target && setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) setFiles((f) => [...f, ...toAttachments(e.dataTransfer.files)]);
        }}
      >
        <header className="topbar">
          <button className="icon-btn topbar__menu" onClick={() => setRailOpen(true)} aria-label="Open menu">
            <Icon name="menu" />
          </button>
          <div className="topbar__title">
            <h2>{isEmpty ? 'iTOP Agent' : active.title}</h2>
            <span className="eyebrow">Education Hub knowledge · Notion + Google Drive</span>
          </div>
          <span className={`mode ${agent.live ? 'mode--live' : ''}`} title={agent.live ? 'Connected to the live agent' : 'Sample answers, no live agent'}>
            <span className="mode__dot" />
            {agent.label}
          </span>
          <button className="icon-btn topbar__new" onClick={chat.newConversation} disabled={chat.busy || isEmpty} aria-label="New conversation" title="New conversation">
            <Icon name="plus" />
          </button>
          <button
            className={`docs-btn ${unseenDoc ? 'has-new' : ''}`}
            onClick={() => (latestDoc ? openDoc(docId ?? latestDoc.id) : setDeskOpen(true))}
            aria-label={`Documents (${active.documents.length})`}
          >
            <Icon name="doc" size={16} />
            <span className="docs-btn__label">Documents</span>
            <span className="docs-btn__count">{active.documents.length}</span>
          </button>
        </header>

        <div className="scroll">
          {isEmpty ? (
            <EmptyState onPick={chat.runProcedure} disabled={chat.busy} />
          ) : (
            <MessageList messages={active.messages} documents={active.documents} onOpenDocument={openDoc} />
          )}
        </div>

        {unseenDoc && (
          <div className="ready-pill-wrap">
            <button className="ready-pill" onClick={() => openDoc(unseenDoc.id)}>
              <span className="ready-pill__dot" />
              {DOC_TYPE_LABEL[unseenDoc.procedure]} ready
              <span className="ready-pill__open">
                Open <Icon name="arrow" size={14} />
              </span>
            </button>
          </div>
        )}

        <Composer
          prefill={prefill}
          busy={chat.busy}
          showChips={!isEmpty}
          pendingFiles={files}
          onFilesChange={setFiles}
          onSend={(text, attachments) => chat.send(text, { attachments })}
          onProcedure={chat.runProcedure}
          onStop={chat.stop}
        />

        {dragging && (
          <div className="dropzone" aria-hidden>
            <Icon name="clip" size={28} />
            Drop files to attach them
          </div>
        )}
      </main>

      <DocPanel
        documents={active.documents}
        selectedId={docId}
        open={deskOpen}
        wide={wide}
        busy={chat.busy}
        onSelect={setDocId}
        onClose={() => setDeskOpen(false)}
        onToggleWide={() => setWide((w) => !w)}
        onReformat={(doc, style) => {
          setDeskOpen(false); // show the reply streaming; the new version opens from the pill or card
          chat.reformat(doc, style);
        }}
        onAskChange={(doc) => {
          setDeskOpen(false);
          setPrefill({ text: `Change “${doc.title}”: `, nonce: Date.now() });
        }}
        onSaved={chat.markSaved}
      />
    </div>
  );
}
