import React, { useState } from 'react'
import { tomorrowNight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import SyntaxHighlighter from 'react-syntax-highlighter'
import styled from 'styled-components'
import { Copy } from 'react-feather'
import { copyTextToClipboard } from '../utils'

type Props = {
  code?: string;
  language?: string;
  className?: string;
}

const CodeBlock: React.FC<Props> = ({
  code,
  language = 'python',
  className = '',
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false)

  const onCopy = () => {
    copyTextToClipboard(code)
    setIsCopied(true)

    setTimeout(() => setIsCopied(false), 5000)
  }

  return (
    <div className={`relative ${className}`} style={{
      maxWidth: '100%'
    }}>
      <div onClick={onCopy} className='bg-white rounded px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 transition-all flex items-center gap-2' style={{
        position: 'absolute',
        top: 10,
        right: 10
      }}>
        { !isCopied && <Copy style={{
          height: 15,
          width: 15
        }}/> } { isCopied ? 'Copied!' : 'Copy' }
      </div>

      <ConsolataWrapper>
        <SyntaxHighlighter customStyle={{ padding: 20, borderRadius: 3, fontSize: 15, fontFamily: 'Inconsolata' }} language={language} style={tomorrowNight}>
          {code}
        </SyntaxHighlighter>
      </ConsolataWrapper>
    </div>
  )
}

const ConsolataWrapper = styled.div`
  * { 
    font-family: Inconsolata;
  }
`

export default CodeBlock