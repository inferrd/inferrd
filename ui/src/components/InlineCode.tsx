import React from 'react'

type Props = {
  className?: string;
}

const InlineCode: React.FC<Props> = ({ children, className }) => {
  return (
    <pre className={`${className} inline bg-gray-100 px-1 rounded`} style={{ fontFamily: 'Inconsolata' }}>{ children }</pre>
  )
}

export default InlineCode