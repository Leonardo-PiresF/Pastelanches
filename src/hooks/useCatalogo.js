import { useCallback, useEffect, useState } from 'react'
import { assinar, carregarCatalogo } from '../lib/db.js'

const TABELAS = ['produtos', 'promocoes', 'bairros', 'loja', 'datas_especiais']

export function useCatalogo() {
  const [estado, setEstado] = useState({ dados: null, erro: null })

  const carregar = useCallback(async () => {
    try {
      const dados = await carregarCatalogo()
      setEstado({ dados, erro: null })
    } catch (e) {
      setEstado((atual) => ({ dados: atual.dados, erro: e.message }))
    }
  }, [])

  useEffect(() => {
    carregar()
    return assinar(TABELAS, carregar)
  }, [carregar])

  return { ...estado, carregando: !estado.dados && !estado.erro, recarregar: carregar }
}
