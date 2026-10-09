import { PROCEDURES, type ProcedureId } from '../agent';
import { Bubbles, LogoAdaptive } from './Brand';
import { Icon } from './Icon';

export function EmptyState({ onPick, disabled }: { onPick: (id: ProcedureId) => void; disabled: boolean }) {
  return (
    <div className="empty">
      <Bubbles />
      <div className="empty__inner">
        <LogoAdaptive size={72} />
        <p className="eyebrow">Touch to Teach · learn by doing</p>
        <h1 className="empty__title">What are you preparing today?</h1>
        <p className="empty__lede">
          Ask about protocols, ratios and seminar rules, or generate an SOP, a lesson plan or an event pack. Every answer
          names its sources.
        </p>

        <div className="starts">
          {PROCEDURES.map((p) => (
            <button key={p.id} className="start" onClick={() => onPick(p.id)} disabled={disabled}>
              <span className="start__top">
                <span className="start__label">{p.label}</span>
                {p.makesDocument && (
                  <span className="start__doc" title="Produces a document">
                    <Icon name="doc" size={14} />
                  </span>
                )}
              </span>
              <span className="start__blurb">{p.blurb}</span>
              <span className="start__example">“{p.prompt}”</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
