import React from 'react';

// Parse inline styles like **bold**, *italic*, and [link](url)
const parseInlineStyles = (inputText) => {
  if (!inputText) return '';

  let parts = [{ type: 'text', text: inputText }];

  // 1. Parse Links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  parts = parts.flatMap((part) => {
    if (part.type !== 'text') return part;
    const segments = [];
    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(part.text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', text: part.text.substring(lastIndex, match.index) });
      }
      segments.push({
        type: 'link',
        text: match[1],
        url: match[2],
      });
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < part.text.length) {
      segments.push({ type: 'text', text: part.text.substring(lastIndex) });
    }
    return segments;
  });

  // 2. Parse Bold: **text**
  const boldRegex = /\*\*([^*]+)\*\*/g;
  parts = parts.flatMap((part) => {
    if (part.type !== 'text') return part;
    const segments = [];
    let lastIndex = 0;
    let match;
    while ((match = boldRegex.exec(part.text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', text: part.text.substring(lastIndex, match.index) });
      }
      segments.push({
        type: 'bold',
        text: match[1],
      });
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < part.text.length) {
      segments.push({ type: 'text', text: part.text.substring(lastIndex) });
    }
    return segments;
  });

  // 3. Parse Italic: *text*
  const italicRegex = /\*([^*]+)\*/g;
  parts = parts.flatMap((part) => {
    if (part.type !== 'text') return part;
    const segments = [];
    let lastIndex = 0;
    let match;
    while ((match = italicRegex.exec(part.text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', text: part.text.substring(lastIndex, match.index) });
      }
      segments.push({
        type: 'italic',
        text: match[1],
      });
      lastIndex = italicRegex.lastIndex;
    }
    if (lastIndex < part.text.length) {
      segments.push({ type: 'text', text: part.text.substring(lastIndex) });
    }
    return segments;
  });

  // Map parts array to React nodes
  return parts.map((part, idx) => {
    if (part.type === 'link') {
      return (
        <a
          key={idx}
          href={part.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand hover:underline font-semibold transition-colors"
        >
          {part.text}
        </a>
      );
    }
    if (part.type === 'bold') {
      return (
        <strong key={idx} className="font-bold text-text-1">
          {part.text}
        </strong>
      );
    }
    if (part.type === 'italic') {
      return (
        <em key={idx} className="italic text-text-1">
          {part.text}
        </em>
      );
    }
    return part.text;
  });
};

export default function FormattedMarkdown({ text }) {
  if (!text) return null;

  // Split text into blocks by double newlines or block-level breaks
  const rawBlocks = text.split(/\n\s*\n/);

  return (
    <div className="space-y-3.5 leading-relaxed text-sm text-text-2">
      {rawBlocks.map((block, blockIdx) => {
        let trimmed = block.trim();
        if (!trimmed) return null;

        // A. Horizontal Rule
        if (trimmed === '***' || trimmed === '---' || trimmed === '___') {
          return <hr key={blockIdx} className="border-border my-6" />;
        }

        // B. Heading Matches
        const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const contentText = headingMatch[2];
          const parsedContent = parseInlineStyles(contentText);

          if (level === 1) {
            return (
              <h1 key={blockIdx} className="text-xl font-bold text-text-1 mt-6 mb-3 font-display">
                {parsedContent}
              </h1>
            );
          }
          if (level === 2) {
            return (
              <h2 key={blockIdx} className="text-lg font-bold text-text-1 mt-5 mb-2.5 font-display">
                {parsedContent}
              </h2>
            );
          }
          return (
            <h3 key={blockIdx} className="text-sm font-bold text-text-1 mt-4 mb-2 uppercase tracking-wide">
              {parsedContent}
            </h3>
          );
        }

        // C. Unordered Bullet Lists
        // Matches lists starting with '*' or '-' or '+'
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('+ ')) {
          // Split list items, preserving list identifiers
          const items = trimmed.split(/\n(?=[*\-+]\s+)/);
          return (
            <ul key={blockIdx} className="list-disc pl-5 space-y-1.5 my-3 text-text-2">
              {items.map((item, itemIdx) => {
                const itemText = item.replace(/^[*\-+]\s+/, '');
                return <li key={itemIdx}>{parseInlineStyles(itemText)}</li>;
              })}
            </ul>
          );
        }

        // D. Standard Paragraph with single line-break parsing
        const lines = trimmed.split('\n');
        return (
          <p key={blockIdx} className="text-text-2">
            {lines.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {lineIdx > 0 && <br />}
                {parseInlineStyles(line)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
