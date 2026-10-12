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
  const [deskOpen, setDeskOpen] = useState(false); // full-screen document on phones and tablets
  const [docId, setDocId] = useState<string | null>(null);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [dragging, setDragging] = useState(false);
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
    setDeskOpen(false);
  }, [active.id]);

  const openDoc = (id: string) => {
    setDocId(id);
    setSeenDocId(id);
    setDeskOpen(true);
  };

  // Phones and tablets: the Document button turns lime until the new document is opened.
  const unseenDoc = latestDoc && latestDoc.id !== seenDocId && !chat.busy ? latestDoc : undefined;
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
      {railOpen && <div className="scrim" onClick={() => setRailOpen(false)} aria-hidden />}

      <main
        className="main"
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
          <button className="topbar__btn topbar__menu" onClick={() => setRailOpen(true)}>
            <Icon name="menu" size={22} /> <span className="topbar__btn-label">Menu</span>
          </button>
          <h1 className="topbar__title">{isEmpty ? 'iTOP Assistant' : active.title}</h1>
          {!agent.live && <span className="demo-badge">Demo</span>}
          {!isEmpty && (
            <button className="topbar__btn topbar__new" onClick={chat.newConversation} disabled={chat.busy}>
              <Icon name="plus" size={20} /> <span className="topbar__btn-label">New</span>
            </button>
          )}
          {active.documents.length > 0 && (
            <button className={`topbar__btn topbar__docs ${unseenDoc ? 'has-new' : ''}`} onClick={() => openDoc(docId ?? latestDoc!.id)}>
              <Icon name="doc" size={20} /> <span className="topbar__btn-label">Document</span>
            </button>
          )}
        </header>

        <div className="scroll">
          {isEmpty ? (
            <EmptyState
              disabled={chat.busy}
              onPick={chat.runProcedure}
              onTypeOwn={() => setPrefill({ text: '', nonce: Date.now() })}
            />
          ) : (
            <MessageList messages={active.messages} documents={active.documents} onOpenDocument={openDoc} />
          )}
        </div>

        <Composer
          prefill={prefill}
          busy={chat.busy}
          showCreate={!isEmpty}
          pendingFiles={files}
          onFilesChange={setFiles}
          onSend={(text, attachments) => chat.send(text, { attachments })}
          onProcedure={chat.runProcedure}
          onStop={chat.stop}
        />

        {dragging && (
          <div className="dropzone" aria-hidden>
            <Icon name="clip" size={30} />
            Drop the file here to attach it
          </div>
        )}
      </main>

      <DocPanel
        documents={active.documents}
        selectedId={docId}
        open={deskOpen}
        busy={chat.busy}
        onSelect={setDocId}
        onClose={() => setDeskOpen(false)}
        onReformat={(doc, style) => {
          setDeskOpen(false); // show the reply being written; the new version opens from the card
          chat.reformat(doc, style);
        }}
        onAskChange={(doc) => {
          setDeskOpen(false);
          setPrefill({ text: `Please change “${doc.title}”: `, nonce: Date.now() });
        }}
        onSaved={chat.markSaved}
      />
    </div>
  );
}
