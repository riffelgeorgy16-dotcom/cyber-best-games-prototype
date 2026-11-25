import { Fragment } from 'react';

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={index}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (link) return <a key={index} href={link[2]}>{link[1]}</a>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function formatted(text: string) {
  const lines = text.split('\n');
  if (lines.every(line => /^[-*] /.test(line))) return <ul>{lines.map((line, i) => <li key={i}>{inline(line.slice(2))}</li>)}</ul>;
  if (lines.every(line => /^\d+\. /.test(line))) return <ol>{lines.map((line, i) => <li key={i}>{inline(line.replace(/^\d+\. /, ''))}</li>)}</ol>;
  if (/^#{1,6} /.test(lines[0])) return <><h3>{inline(lines[0].replace(/^#{1,6} /, ''))}</h3>{lines.length > 1 && <p>{inline(lines.slice(1).join(' '))}</p>}</>;
  return <p>{inline(lines.join(' '))}</p>;
}

export function CatalogEditorial({ heading, paragraphs, markdown, columns = 3, limit = 30 }: {
  heading: string; paragraphs: readonly string[]; markdown?: string; columns?: number; limit?: number;
}) {
  return <section className="catalog-editorial" aria-labelledby="catalog-editorial-title">
    <h2 className="h2" id="catalog-editorial-title">{heading}</h2>
    {markdown ? <div className={'editorial-rich columns-' + columns}>
      {markdown.split(/\n\s*\n/).filter(section => section.trim()).slice(0, limit).map((section, i) =>
        <div className="editorial-rich-item" key={i}>{formatted(section.trim())}</div>)}
    </div> : <div className={'editorial-columns columns-' + columns}>
      {paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
    </div>}
  </section>;
}
