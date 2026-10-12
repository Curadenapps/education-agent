import type { Conversation } from '../hooks/useChat';
import { LogoOnDark } from './Brand';
import { Icon } from './Icon';

interface Props {
  conversations: Conversation[];
  activeId: string;
  busy: boolean;
  open: boolean;
  onNew: () => void;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
};

export function Sidebar({ conversations, activeId, busy, open, onNew, onSelect, onRemove, onClose }: Props) {
  const past = conversations.filter((c) => c.messages.length > 0);

  return (
    <aside className={`rail ${open ? 'is-open' : ''}`} aria-label="Conversations">
      <div className="rail__brand">
        <LogoOnDark size={44} />
        <span className="rail__name">iTOP Assistant</span>
        <button className="rail__close" onClick={onClose} aria-label="Close menu">
          <Icon name="close" size={22} />
        </button>
      </div>

      <button className="btn btn--lime btn--block" onClick={onNew} disabled={busy}>
        <Icon name="plus" /> New conversation
      </button>

      <h2 className="rail__label">Past conversations</h2>
      <nav className="rail__list">
        {past.length === 0 && <p className="rail__empty">Your conversations will be listed here.</p>}
        {past.map((c) => (
          <div key={c.id} className={`rail__item ${c.id === activeId ? 'is-active' : ''}`}>
            <button className="rail__item-main" onClick={() => onSelect(c.id)} disabled={busy && c.id !== activeId}>
              <span className="rail__item-title">{c.title}</span>
              <span className="rail__item-meta">
                {dayLabel(c.updatedAt)}
                {c.documents.length > 0 && ` · ${c.documents.length} document${c.documents.length > 1 ? 's' : ''}`}
              </span>
            </button>
            <button className="rail__item-del" onClick={() => onRemove(c.id)} disabled={busy} aria-label={`Delete ${c.title}`} title="Delete">
              <Icon name="trash" />
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
}
