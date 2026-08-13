import React from 'react';

const renderInline = (line: string, key: number) => {
  const parts = line.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, j) =>
    j % 2 === 1 ? (
      <strong key={`${key}-${j}`} className="text-foreground font-semibold">
        {part}
      </strong>
    ) : (
      <React.Fragment key={`${key}-${j}`}>{part}</React.Fragment>
    )
  );
};

export const MarkdownLite: React.FC<{ content: string }> = ({ content }) => (
  <div className="space-y-1 text-sm leading-relaxed">
    {content.split('\n').map((line, i) => {
      if (line.startsWith('### '))
        return <h4 key={i} className="font-display font-bold text-foreground mt-3">{line.slice(4)}</h4>;
      if (line.startsWith('## '))
        return <h3 key={i} className="font-display font-bold text-base text-foreground mt-3">{line.slice(3)}</h3>;
      if (line.startsWith('# '))
        return <h2 key={i} className="font-display font-bold text-lg text-foreground mt-3">{line.slice(2)}</h2>;
      if (line.startsWith('- ') || line.startsWith('• '))
        return <li key={i} className="ml-4 list-disc text-muted-foreground">{renderInline(line.slice(2), i)}</li>;
      if (line.match(/^\d+\. /))
        return <li key={i} className="ml-4 list-decimal text-muted-foreground">{renderInline(line.replace(/^\d+\.\s/, ''), i)}</li>;
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-muted-foreground">{renderInline(line, i)}</p>;
    })}
  </div>
);
