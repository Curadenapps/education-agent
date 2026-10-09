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
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

export function Sidebar({ conversations, activeId, busy, open, onNew, onSelect, onRemove, onClose }: Props) {
  const used = conversations.filter((c) => c.messages.length || c.id === activeId);

  return (
    <aside className={`rail ${open ? 'is-open' : ''}`} aria-label="Conversations">
      <div className="rail__brand">
        <LogoOnDark size={44} />
        <div>
          <div className="rail__name">iTOP Agent</div>
          <div className="eyebrow eyebrow--rail">You · Your Team · Your Patient</div>
        </div>
        <button className="icon-btn icon-btn--rail rail__close" onClick={onClose} aria-label="Close menu">
          <Icon name="close" />
        </button>
      </div>

      <button className="btn btn--lime rail__new" onClick={onNew} disabled={busy}>
        <Icon name="plus" /> New conversation
      </button>

      <div className="eyebrow eyebrow--rail rail__label">History</div>
      <nav className="rail__list">
        {used.map((c) => (
          <div key={c.id} className={`rail__item ${c.id === activeId ? 'is-active' : ''}`}>
            <button className="rail__item-main" onClick={() => onSelect(c.id)} disabled={busy && c.id !== activeId}>
              <span className="rail__item-title">{c.title}</span>
              <span className="rail__item-meta">
                {dayLabel(c.updatedAt)}
                {c.documents.length > 0 && ` · ${c.documents.length} doc${c.documents.length > 1 ? 's' : ''}`}
              </span>
            </button>
            {c.messages.length > 0 && (
              <button
                className="rail__item-del"
                onClick={() => onRemove(c.id)}
                disabled={busy}
                aria-label={`Delete ${c.title}`}
                title="Delete"
              >
                <Icon name="trash" />
              </button>
            )}
          </div>
        ))}
      </nav>

      <div className="rail__foot">
        <div className="rail__quote">“Prevention isn’t a theory. It’s a practice.”</div>
        <div className="rail__user">
          <span className="avatar">CE</span>
          <span>
            <span className="rail__user-name">Curaden Education</span>
            <span className="rail__user-role">iTOP Lecturer workspace</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
