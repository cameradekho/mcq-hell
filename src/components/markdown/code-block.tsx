'use client'

import { Check, Copy, Download } from 'lucide-react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { darcula } from 'react-syntax-highlighter/dist/cjs/styles/prism'

import { cn } from '@/lib/utils'
import { useCopyToClipboard } from '@/hooks/custom/use-copy-to-clipboard'

type Props = {
  language: string
  value: string
  showHeader?: boolean
  className?: string
}

type languageMap = {
  [key: string]: string | undefined
}

export const programmingLanguages: languageMap = {
  javascript: '.js',
  typescript: '.ts',
  javascriptreact: '.jsx',
  typescriptreact: '.tsx',
  python: '.py',
  java: '.java',
  c: '.c',
  cpp: '.cpp',
  'c++': '.cpp',
  'c#': '.cs',
  ruby: '.rb',
  php: '.php',
  swift: '.swift',
  'objective-c': '.m',
  kotlin: '.kt',
  go: '.go',
  perl: '.pl',
  rust: '.rs',
  scala: '.scala',
  haskell: '.hs',
  lua: '.lua',
  shell: '.sh',
  sql: '.sql',
  html: '.html',
  css: '.css',
  bash: '.sh'
}

export const generateRandomString = (length: number, lowercase = false) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXY3456789' // excluding similar looking characters like Z, 2, I, 1, O, 0
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return lowercase ? result.toLowerCase() : result
}

const CodeBlock = ({
  language,
  value,
  showHeader = true,
  className = ''
}: Props) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    timeout: 2000
  })

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(value)
  }

  const downloadAsFile = () => {
    const fileExtension = programmingLanguages[language] || '.file'
    const suggestedFileName = `file-${generateRandomString(
      3,
      true
    )}${fileExtension}`
    const fileName = window.prompt('Enter file name', suggestedFileName)

    if (!fileName) {
      // user pressed cancel on prompt
      return
    }

    const blob = new Blob([value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = fileName
    link.href = url
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={cn('codeblock relative w-full font-sans', className)}>
      {showHeader && (
        <div className="flex items-center justify-between rounded-t-lg bg-zinc-700 px-4 py-1">
          <span className="text-xs lowercase text-white">{language}</span>
          <div className="flex items-center gap-2">
            <button
              aria-label="Copy code"
              className="flex items-center gap-1.5 rounded bg-none p-1 text-xs text-white"
              onClick={onCopy}
            >
              {isCopied ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                <Copy aria-hidden="true" className="size-4" />
              )}
              {isCopied ? 'Copied!' : 'Copy code'}
            </button>
            <button
              aria-label="Download code"
              className="flex items-center rounded bg-none p-1 text-xs text-white"
              onClick={downloadAsFile}
            >
              <Download aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      )}

      <SyntaxHighlighter
        showLineNumbers
        codeTagProps={{
          style: {
            fontSize: '0.9rem',
            fontFamily: 'var(--font-inter)'
          }
        }}
        customStyle={{
          margin: 0,
          width: '100%',
          padding: '1.5rem 1rem',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px'
        }}
        language={language}
        PreTag="div"
        style={darcula}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

CodeBlock.displayName = 'CodeBlock'

export { CodeBlock }
