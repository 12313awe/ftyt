'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import 'katex/dist/katex.min.css';
import Image from 'next/image';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
        components={{
        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 border-b pb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-5 first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-medium mb-2 mt-4 first:mt-0">{children}</h3>,
        p: ({ children }) => <p className="leading-relaxed mb-4 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-4 ml-4">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-4 ml-4">{children}</ol>,
          a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
              {children}
            </a>
          ),
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (match) {
              return (
              <div className="relative group my-4 rounded-lg border">
                <div className="flex items-center justify-between bg-muted px-4 py-2 rounded-t-md border-b">
                  <span className="text-sm font-medium text-muted-foreground capitalize">
                      {match[1]}
                    </span>
                  <button
                      onClick={() => copyToClipboard(codeString)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs bg-background hover:bg-accent border rounded-md transition-colors"
                    >
                      {copiedCode === codeString ? (
                        <>
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">Kopyalandı!</span>
                        </>
                      ) : (
                        <>
                        <Copy className="h-3 w-3" />
                        <span>Kopyala</span>
                        </>
                      )}
                  </button>
                  </div>
                  <SyntaxHighlighter
                  style={oneDark}
                    language={match[1]}
                    PreTag="div"
                  className="!p-4 !m-0 !rounded-b-md"
                  customStyle={{ background: 'hsl(var(--muted))' }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
            <code className="bg-muted text-foreground px-1.5 py-1 rounded-md text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-muted">{children}</blockquote>
          ),
          table: ({ children }) => (
          <div className="overflow-x-auto my-4 border rounded-md">
            <table className="min-w-full divide-y">{children}</table>
            </div>
          ),
        thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
        tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
        tr: ({ children }) => <tr className="hover:bg-muted/50 transition-colors">{children}</tr>,
        th: ({ children }) => <th className="px-4 py-3 text-left text-sm font-semibold border-b">{children}</th>,
        td: ({ children }) => <td className="px-4 py-3 text-sm">{children}</td>,
        hr: () => <hr className="border-t my-6" />,
          img: ({ src, alt }) => (
          <div className="my-4">
              <Image
                src={src || ''}
                alt={alt || ''}
                width={700}
                height={400}
              className="max-w-full h-auto rounded-lg shadow-sm border"
              />
            {alt && <p className="text-sm text-muted-foreground text-center mt-2 italic">{alt}</p>}
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
  );
}