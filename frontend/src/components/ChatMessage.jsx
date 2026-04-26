import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-4 px-4 py-6 ${isUser ? '' : 'bg-gray-900/30'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold ${
        isUser
          ? 'bg-indigo-600 text-white'
          : 'bg-emerald-600 text-white'
      }`}>
        {isUser ? 'U' : 'AI'}
      </div>
      <div className="flex-1 min-w-0 prose prose-invert prose-sm max-w-none">
        <ReactMarkdown
          components={{
            code({ inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-lg !mt-2 !mb-2"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm text-indigo-300" {...props}>
                  {children}
                </code>
              )
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
