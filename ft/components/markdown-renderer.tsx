'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
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
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6 first:mt-0 border-b border-gray-200 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-medium text-gray-900 mb-2 mt-3 first:mt-0">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-medium text-gray-900 mb-2 mt-3 first:mt-0">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-medium text-gray-700 mb-2 mt-3 first:mt-0">
              {children}
            </h6>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="text-gray-700 leading-relaxed mb-4 last:mb-0">
              {children}
            </p>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-4 text-gray-700 ml-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-4 text-gray-700 ml-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors"
            >
              {children}
            </a>
          ),

          // Emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800">{children}</em>
          ),

          // Code
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (!inline && match) {
              return (
                <div className="relative group mb-4">
                  <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-t-lg border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {language}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(codeString)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-white hover:bg-gray-50 border border-gray-200 rounded transition-colors"
                    >
                      {copiedCode === codeString ? (
                        <>
                          <Check className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-gray-500" />
                          <span className="text-gray-600">Copy</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                  <SyntaxHighlighter
                    style={oneLight}
                    language={language}
                    PreTag="div"
                    className="!mt-0 !rounded-t-none !border-t-0"
                    customStyle={{
                      margin: 0,
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                    }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code
                className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-200 bg-blue-50/50 pl-4 py-2 mb-4 italic text-gray-700">
              {children}
            </blockquote>
          ),

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50/50 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-gray-700">{children}</td>
          ),

          // Horizontal rule
          hr: () => (
            <hr className="border-0 border-t border-gray-200 my-6" />
          ),

          // Images
          img: ({ src, alt }) => (
            <div className="mb-4">
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                loading="lazy"
              />
              {alt && (
                <p className="text-sm text-gray-500 text-center mt-2 italic">
                  {alt}
                </p>
              )}
            </div>
          ),

          // Task lists
          input: ({ type, checked, disabled }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  readOnly
                />
              );
            }
            return <input type={type} checked={checked} disabled={disabled} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}