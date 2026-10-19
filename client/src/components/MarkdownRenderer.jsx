import { useState, useCallback } from 'react';

/**
 * MarkdownRenderer
 *
 * A zero-dependency, lightweight Markdown renderer.
 * Supports: headings, bold, italic, inline code, fenced code blocks,
 * unordered/ordered lists, blockquotes, horizontal rules, and paragraphs.
 *
 * Code blocks include a language label and a copy-to-clipboard button.
 */

/* ── Copy button ─────────────────────────────────────────────────── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [text]);

  return (
    <button
      className={`md-copy-btn${copied ? ' copied' : ''}`}
      onClick={handleCopy}
      title="Copy code"
      type="button"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

/* ── Inline markdown parser ──────────────────────────────────────── */
/**
 * Parse inline markdown tokens: **bold**, *italic*, `code`.
 * Returns an array of React nodes.
 */
function parseInline(text, keyPrefix = '') {
  // Regex: **bold**, *italic*, `code`
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2] !== undefined) {
      // **bold**
      nodes.push(<strong key={`${keyPrefix}-b-${i}`}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      // *italic*
      nodes.push(<em key={`${keyPrefix}-i-${i}`}>{match[3]}</em>);
    } else if (match[4] !== undefined) {
      // `code`
      nodes.push(<code key={`${keyPrefix}-c-${i}`}>{match[4]}</code>);
    }

    lastIndex = pattern.lastIndex;
    i++;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

/* ── Block-level parser ──────────────────────────────────────────── */
/**
 * Split raw markdown into an array of typed block descriptors,
 * then render them as React elements.
 */
function parseBlocks(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', lang, content: codeLines.join('\n') });
      i++; // skip closing ```
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      blocks.push({ type: 'heading', level: headingMatch[1].length, content: headingMatch[2] });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: 'blockquote', content: quoteLines.join('\n') });
      continue;
    }

    // Unordered list
    if (/^(\s*[-*+]\s)/.test(line)) {
      const items = [];
      while (i < lines.length && /^(\s*[-*+]\s)/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Empty line — skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph — collect consecutive non-special lines
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('> ') &&
      !/^(\s*[-*+]\s)/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', content: paraLines.join(' ') });
    }
  }

  return blocks;
}

/* ── Main component ──────────────────────────────────────────────── */
export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  const blocks = parseBlocks(content);

  return (
    <div className="md-root">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'heading': {
            const Tag = `h${block.level}`;
            return <Tag key={idx}>{parseInline(block.content, `h${idx}`)}</Tag>;
          }

          case 'code':
            return (
              <div key={idx} className="md-code-block">
                <div className="md-code-header">
                  <span className="md-code-lang">{block.lang || 'plaintext'}</span>
                  <CopyButton text={block.content} />
                </div>
                <pre>
                  <code>{block.content}</code>
                </pre>
              </div>
            );

          case 'blockquote':
            return (
              <blockquote key={idx}>
                <p>{parseInline(block.content, `bq${idx}`)}</p>
              </blockquote>
            );

          case 'hr':
            return <hr key={idx} />;

          case 'ul':
            return (
              <ul key={idx}>
                {block.items.map((item, j) => (
                  <li key={j}>{parseInline(item, `ul${idx}-${j}`)}</li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol key={idx}>
                {block.items.map((item, j) => (
                  <li key={j}>{parseInline(item, `ol${idx}-${j}`)}</li>
                ))}
              </ol>
            );

          case 'paragraph':
          default:
            return <p key={idx}>{parseInline(block.content, `p${idx}`)}</p>;
        }
      })}
    </div>
  );
}
