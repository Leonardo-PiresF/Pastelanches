import { useEffect, useState } from 'react'
import { buscarFeriados } from '../lib/feriados.js'

export function useFeriados() {
  const [feriados, setFeriados] = useState({})
  useEffect(() => {
    const ano = new Date().getFullYear()
    let vivo = true
    buscarFeriados([ano, ano + 1]).then((f) => vivo && setFeriados(f))
    return () => { vivo = false }
  }, [])
  return feriados
}
