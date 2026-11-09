import { lazy, Suspense } from 'react'
import { useRota } from './hooks/useRota.js'
import { Carregando } from './components/Estado.jsx'
import Vitrine from './features/vitrine/Vitrine.jsx'

const Encomenda = lazy(() => import('./features/vitrine/Encomenda.jsx'))
const Senha = lazy(() => import('./features/vitrine/Senha.jsx'))
const Painel = lazy(() => import('./features/painel/Painel.jsx'))
const Cupom = lazy(() => import('./features/cupom/Cupom.jsx'))

export default function App() {
  const [rota, parametro] = useRota()

  let tela = <Vitrine />
  if (rota === 'encomenda') tela = <Encomenda />
  if (rota === 'pedido' && parametro) tela = <Senha codigo={parametro} />
  if (rota === 'painel') tela = <Painel aba={parametro} />
  if (rota === 'imprimir' && parametro) tela = <Cupom codigo={parametro} />

  return <Suspense fallback={<Carregando />}>{tela}</Suspense>
}
