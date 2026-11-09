import { useCallback, useEffect, useRef, useState } from 'react'
import { assinar, atualizarPedido, listarPedidos } from '../../lib/db.js'
import { imprimirPedido } from '../../lib/impressao.js'

// Dois toques curtos, sem arquivo de áudio.
function tocarAviso() {
  try {
    const ctx = new AudioContext()
    ;[0, 0.25].forEach((t) => {
      const osc = ctx.createOscillator()
      const vol = ctx.createGain()
      osc.frequency.value = 880
      vol.gain.setValueAtTime(0.25, ctx.currentTime + t)
      vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2)
      osc.connect(vol).connect(ctx.destination)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.2)
    })
  } catch {
    // navegador sem áudio liberado: o contador da aba continua avisando
  }
}

export function usePedidos({ imprimirAoChegar }) {
  const [pedidos, setPedidos] = useState(null)
  const [erro, setErro] = useState('')
  const vistos = useRef(null)
  const autoImpressao = useRef(imprimirAoChegar)
  autoImpressao.current = imprimirAoChegar

  const carregar = useCallback(async () => {
    try {
      const lista = await listarPedidos()
      const novos = vistos.current ? lista.filter((p) => !vistos.current.has(p.id)) : []
      vistos.current = new Set(lista.map((p) => p.id))
      if (novos.length) {
        tocarAviso()
        if (autoImpressao.current) novos.forEach((p) => imprimirPedido(p.codigo))
      }
      setPedidos(lista)
      setErro('')
    } catch (e) {
      setErro(e.message)
    }
  }, [])

  useEffect(() => {
    carregar()
    const parar = assinar(['pedidos'], carregar)
    const reserva = setInterval(carregar, 30000)
    return () => {
      parar()
      clearInterval(reserva)
    }
  }, [carregar])

  const aoAtualizar = async (id, campos) => {
    await atualizarPedido(id, campos)
    setPedidos((lista) => lista.map((p) => (p.id === id ? { ...p, ...campos } : p)))
  }

  return { pedidos, erro, recarregar: carregar, aoAtualizar }
}
