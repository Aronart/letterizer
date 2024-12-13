import React from 'react';
import ReactMarkdown from 'react-markdown';

interface FormattedMessageProps {
  content: string;
  role: 'user' | 'assistant';
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, role }) => {
  return (
    <div className={`mb-4 ${role === 'user' ? 'text-right' : 'text-left'}`}>
      <div
        className={`inline-block p-4 rounded-lg ${
          role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
        }`}
      >
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            a: ({ href, children }) => (
              <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

