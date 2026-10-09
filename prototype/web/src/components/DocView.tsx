import { Fragment } from 'react';
import { inline, parse, type Block } from '../lib/markdown';

function Inline({ text }: { text: string }) {
  return (
    <>
      {inline(text).map((n, i) => {
        if (n.type === 'strong') return <strong key={i}>{n.text}</strong>;
        if (n.type === 'em') return <em key={i}>{n.text}</em>;
        if (n.type === 'review') return <span key={i} className="review-tag">{n.text}</span>;
        return (
          <Fragment key={i}>
            {n.text.split('\n').map((t, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {t}
              </Fragment>
            ))}
          </Fragment>
        );
      })}
    </>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case 'heading': {
      const H = `h${b.level + 1}` as 'h2' | 'h3' | 'h4'; // the sheet title is the page's h2
      return (
        <H>
          <Inline text={b.text} />
        </H>
      );
    }
    case 'paragraph':
      return (
        <p>
          <Inline text={b.text} />
        </p>
      );
    case 'quote':
      return (
        <blockquote>
          <Inline text={b.text} />
        </blockquote>
      );
    case 'rule':
      return <hr />;
    case 'table':
      return (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {b.header.map((c, i) => (
                  <th key={i}>
                    <Inline text={c} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>
                      <Inline text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'list': {
      const isCheck = b.items.some((it) => it.checked !== null);
      const L = b.ordered ? 'ol' : 'ul';
      return (
        <L className={isCheck ? 'checklist' : undefined}>
          {b.items.map((it, i) => (
            <li key={i}>
              {it.checked !== null && <span className={`box ${it.checked ? 'is-on' : ''}`} aria-hidden />}
              <span>
                <Inline text={it.text} />
              </span>
            </li>
          ))}
        </L>
      );
    }
  }
}

/** Formatted document body. Drops a leading H1 because the sheet header shows the title. */
export function DocView({ markdown }: { markdown: string }) {
  const blocks = parse(markdown);
  const body = blocks[0]?.type === 'heading' && blocks[0].level === 1 ? blocks.slice(1) : blocks;
  return (
    <div className="doc-view">
      {body.map((b, i) => (
        <BlockView key={i} b={b} />
      ))}
    </div>
  );
}
