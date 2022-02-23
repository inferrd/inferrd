import { useState } from "react"

const useLocalStorage = (key: string): [
  string,
  (val: string) => void 
] => {
  const [value, setValue] = useState<string>(window.localStorage.getItem(key))

  const updateValue = (v: string) => {
    window.localStorage.setItem(key, v)

    setValue(v)
  }

  return [
    value,
    updateValue
  ]
}

export default useLocalStorage