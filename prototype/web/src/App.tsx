import { useEffect, useState } from 'react';
import { agent, type Attachment } from './agent';
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
    setDeskOpen(true);
  };

  const isEmpty = active.messages.length === 0;

  return (
    <div className="app">
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
          <button className="icon-btn topbar__docs" onClick={() => setDeskOpen(true)} aria-label="Open documents">
            <Icon name="panel" />
            {active.documents.length > 0 && <span className="badge-count">{active.documents.length}</span>}
          </button>
        </header>

        <div className="scroll">
          {isEmpty ? (
            <EmptyState onPick={chat.runProcedure} disabled={chat.busy} />
          ) : (
            <MessageList messages={active.messages} documents={active.documents} onOpenDocument={openDoc} />
          )}
        </div>

        <Composer
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
        onSelect={setDocId}
        onClose={() => setDeskOpen(false)}
      />
    </div>
  );
}
