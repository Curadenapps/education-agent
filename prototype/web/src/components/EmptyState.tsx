import { useState } from 'react';
import { DOCUMENT_TYPES, EXAMPLE_QUESTIONS, type ProcedureId } from '../agent';
import { Bubbles, LogoAdaptive } from './Brand';
import { Icon } from './Icon';

interface Props {
  disabled: boolean;
  onPick: (id: ProcedureId) => void;
  /** Puts the cursor in the message box so the person can type their own question. */
  onTypeOwn: () => void;
}

/** Start screen: one choice at a time. Ask a question, or create a document. */
export function EmptyState({ disabled, onPick, onTypeOwn }: Props) {
  const [mode, setMode] = useState<'choose' | 'ask' | 'create'>('choose');

  return (
    <div className="start">
      <Bubbles />
      <div className="start__inner">
        {mode === 'choose' && (
          <>
            <LogoAdaptive size={64} />
            <h1 className="start__title">What would you like to do?</h1>

            <div className="choices">
              <button
                className="choice"
                onClick={() => {
                  setMode('ask');
                  onTypeOwn();
                }}
              >
                <span className="choice__icon">
                  <Icon name="chat" size={26} />
                </span>
                <span className="choice__text">
                  <span className="choice__title">Ask a question</span>
                  <span className="choice__desc">About protocols, seminars, staff ratios or courses.</span>
                </span>
                <Icon name="arrow" size={22} />
              </button>
              <button className="choice" onClick={() => setMode('create')}>
                <span className="choice__icon choice__icon--lime">
                  <Icon name="doc" size={26} />
                </span>
                <span className="choice__text">
                  <span className="choice__title">Create a document</span>
                  <span className="choice__desc">An SOP, lesson plan or seminar plan, ready to print or send.</span>
                </span>
                <Icon name="arrow" size={22} />
              </button>
            </div>

            <ol className="how">
              <li>
                <span className="how__n">1</span> Ask, or pick a document
              </li>
              <li>
                <span className="how__n">2</span> Read the answer or open the document
              </li>
              <li>
                <span className="how__n">3</span> Save, print or send it
              </li>
            </ol>
          </>
        )}

        {mode === 'ask' && (
          <>
            <button className="back-link" onClick={() => setMode('choose')}>
              <Icon name="back" /> Back
            </button>
            <h1 className="start__title">Type your question below</h1>
            <p className="start__lede">Or tap one of these examples:</p>
            <div className="list">
              {EXAMPLE_QUESTIONS.map((p) => (
                <button key={p.id} className="row" onClick={() => onPick(p.id)} disabled={disabled}>
                  <span className="row__title">{p.prompt}</span>
                  <Icon name="arrow" size={20} />
                </button>
              ))}
            </div>
          </>
        )}

        {mode === 'create' && (
          <>
            <button className="back-link" onClick={() => setMode('choose')}>
              <Icon name="back" /> Back
            </button>
            <h1 className="start__title">Which document do you need?</h1>
            <div className="list">
              {DOCUMENT_TYPES.map((p) => (
                <button key={p.id} className="row" onClick={() => onPick(p.id)} disabled={disabled}>
                  <span className="row__text">
                    <span className="row__title">{p.label}</span>
                    <span className="row__desc">{p.blurb}</span>
                  </span>
                  <Icon name="arrow" size={20} />
                </button>
              ))}
            </div>
            <p className="start__lede start__lede--small">In this demo, each choice makes a sample document.</p>
          </>
        )}
      </div>
    </div>
  );
}
