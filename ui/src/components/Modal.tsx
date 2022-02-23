import React from 'react'

type Props = {
  onClickCurtain: () => void;
}

const Modal: React.FC<Props> = ({ children, onClickCurtain }) => {
  return (
    <>
      <div  className='absolute h-full w-full inset-0 bg-black opacity-20' onClick={onClickCurtain}></div>
      <div style={{ zIndex: 999999 }} className='absolute h-full w-full flex inset-0'>
        <div className='flex-1' onClick={onClickCurtain}></div>
        <div className='flex-col flex'>
          <div className='flex-1' onClick={onClickCurtain}></div>

          <div className='rounded shadow bg-white'>
            {children}
          </div>

          <div className='flex-1' onClick={onClickCurtain}></div>
        </div>
        <div className='flex-1' onClick={onClickCurtain}></div>
      </div>
    </>
  )
}

export default Modal