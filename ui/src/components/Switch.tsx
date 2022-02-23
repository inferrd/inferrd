import React, { useEffect, useState } from 'react'

type Props = {
  disabled?: boolean;
  on: boolean;
  onChange: (value: boolean) => void;
}

const Switch: React.FC<Props> = ({ on, onChange, disabled }) => {
  const [isOn, setIsOn] = useState<boolean>(on)

  useEffect(() => {
    setIsOn(on)
  }, [on])

  const onUpdate = () => {
    if(disabled) return

    onChange(!isOn)
  }

  return (
    <div className={`${disabled && 'pointer-none opacity-50'} h-6 w-12 bg-${isOn ? 'green' : 'gray'}-100 border-2 border-gray-200 rounded-full relative cursor-pointer`} onClick={() => onUpdate()}>
      <div className={`h-4 w-4 bg-${isOn ? 'green' : 'gray'}-500 rounded-full absolute`} style={{ top: 2, left: isOn ? 26 : 3, transition: 'left 140ms ease-in' }}></div>
    </div>
  )
}

export default Switch